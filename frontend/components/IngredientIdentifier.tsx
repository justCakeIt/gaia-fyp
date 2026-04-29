"use client";

import { useEffect, useRef, useState } from "react";
import { identifyIngredient, type IdentifyResultData } from "@/lib/api";

type Phase =
  | { name: "idle" }
  | { name: "selected"; file: File; previewUrl: string }
  | { name: "analyzing" }
  | { name: "result"; data: IdentifyResultData }
  | { name: "error"; message: string };

type WebcamState =
  | { status: "off" }
  | { status: "requesting" }
  | { status: "live"; stream: MediaStream }
  | { status: "denied" };

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_BYTES = 5 * 1024 * 1024;

function readFileAsBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const comma = dataUrl.indexOf(",");
      resolve({ base64: dataUrl.slice(comma + 1), mimeType: file.type });
    };
    reader.onerror = () => reject(new Error("Could not read file."));
    reader.readAsDataURL(file);
  });
}

function isTouchDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return navigator.maxTouchPoints > 0 || "ontouchstart" in window;
}

function ConfidenceBadge({ confidence }: { confidence?: string }) {
  if (!confidence) return null;
  const label =
    confidence === "high" ? "High confidence" :
    confidence === "medium" ? "Possible match" :
    "Low confidence — visual estimate only";
  return (
    <span className="gaia-section-kicker" style={{ fontSize: "0.65rem" }}>
      {label}
    </span>
  );
}

export default function IngredientIdentifier() {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>({ name: "idle" });
  const [webcam, setWebcam] = useState<WebcamState>({ status: "off" });

  const cameraRef = useRef<HTMLInputElement>(null);
  const uploadRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (webcam.status === "live" && videoRef.current) {
      videoRef.current.srcObject = webcam.stream;
      videoRef.current.play().catch(() => {});
    }
  }, [webcam]);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  function stopWebcam() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setWebcam({ status: "off" });
  }

  function resetInputs() {
    if (cameraRef.current) cameraRef.current.value = "";
    if (uploadRef.current) uploadRef.current.value = "";
  }

  function handleOpen() {
    setOpen(true);
    setPhase({ name: "idle" });
  }

  function handleClose() {
    stopWebcam();
    if (phase.name === "selected") URL.revokeObjectURL(phase.previewUrl);
    resetInputs();
    setOpen(false);
    setPhase({ name: "idle" });
  }

  function handleGoToIdle() {
    stopWebcam();
    if (phase.name === "selected") URL.revokeObjectURL(phase.previewUrl);
    resetInputs();
    setPhase({ name: "idle" });
  }

  function acceptFile(file: File) {
    if (!ALLOWED_TYPES.includes(file.type)) {
      setPhase({ name: "error", message: "Please select a JPEG, PNG, WebP, or GIF image." });
      return;
    }
    if (file.size > MAX_BYTES) {
      setPhase({ name: "error", message: "Image must be smaller than 5 MB." });
      return;
    }
    if (phase.name === "selected") URL.revokeObjectURL(phase.previewUrl);
    const previewUrl = URL.createObjectURL(file);
    setPhase({ name: "selected", file, previewUrl });
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    acceptFile(file);
  }

  async function handleTakePhoto() {
    if (isTouchDevice()) {
      cameraRef.current?.click();
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      uploadRef.current?.click();
      return;
    }

    setWebcam({ status: "requesting" });

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      setWebcam({ status: "live", stream });
    } catch {
      setWebcam({ status: "denied" });
    }
  }

  function handleCapture() {
    if (webcam.status !== "live") return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    canvas.getContext("2d")?.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      if (!blob) return;
      stopWebcam();
      acceptFile(new File([blob], "capture.jpg", { type: "image/jpeg" }));
    }, "image/jpeg", 0.92);
  }

  async function handleAnalyse() {
    if (phase.name !== "selected") return;

    const { file } = phase;
    URL.revokeObjectURL(phase.previewUrl);
    setPhase({ name: "analyzing" });

    try {
      const { base64, mimeType } = await readFileAsBase64(file);
      const result = await identifyIngredient(base64, mimeType);

      if (!result.ok) {
        setPhase({ name: "error", message: result.error });
        return;
      }

      setPhase({ name: "result", data: result.data });
    } catch {
      setPhase({ name: "error", message: "Failed to analyse image." });
    }
  }

  if (!open) {
    return (
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button className="gaia-btn gaia-btn-ghost" onClick={handleOpen}>
          Identify an ingredient
        </button>
      </div>
    );
  }

  return (
    <article className="gaia-card gaia-surface-muted">
      <h2>Identify an Ingredient</h2>

      <input ref={cameraRef} type="file" accept="image/*" capture="environment" onChange={handleFileChange} hidden />
      <input ref={uploadRef} type="file" accept="image/*" onChange={handleFileChange} hidden />
      <canvas ref={canvasRef} hidden />

      {phase.name === "idle" && (
        <div className="gaia-actions">
          <button className="gaia-btn gaia-btn-primary" onClick={handleTakePhoto}>
            Take a photo
          </button>
          <button className="gaia-btn gaia-btn-secondary" onClick={() => uploadRef.current?.click()}>
            Upload from device
          </button>
          <button className="gaia-btn gaia-btn-ghost" onClick={handleClose}>
            Cancel
          </button>
        </div>
      )}

      {webcam.status === "live" && (
        <>
          <video ref={videoRef} autoPlay muted />
          <button onClick={handleCapture}>Capture</button>
        </>
      )}

      {phase.name === "selected" && (
        <>
          <img src={phase.previewUrl} alt="preview" />
          <button onClick={handleAnalyse}>Analyse</button>
        </>
      )}

      {phase.name === "result" && (
        <div>
          <strong>{phase.data.name}</strong>
          <ConfidenceBadge confidence={phase.data.confidence} />
        </div>
      )}

      {phase.name === "error" && <p>{phase.message}</p>}
    </article>
  );
}