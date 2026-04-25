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
  // Ref tracks the active stream so cleanup always has the current value
  const streamRef = useRef<MediaStream | null>(null);

  // Attach stream to video element when webcam goes live
  useEffect(() => {
    if (webcam.status === "live" && videoRef.current) {
      videoRef.current.srcObject = webcam.stream;
      videoRef.current.play().catch(() => {});
    }
  }, [webcam]);

  // Stop stream on unmount regardless of state closure
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
    // Mobile / touch devices: use the native camera capture input
    if (isTouchDevice()) {
      cameraRef.current?.click();
      return;
    }
    // Desktop: attempt webcam via browser API
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
      acceptFile(new File([blob], "webcam-capture.jpg", { type: "image/jpeg" }));
    }, "image/jpeg", 0.92);
  }

  async function handleAnalyse() {
    if (phase.name !== "selected") return;
    const { file } = phase;
    URL.revokeObjectURL(phase.previewUrl);
    setPhase({ name: "analyzing" });

    let base64: string;
    let mimeType: string;
    try {
      ({ base64, mimeType } = await readFileAsBase64(file));
    } catch {
      setPhase({ name: "error", message: "Could not read the image file. Please try again." });
      return;
    }

    const result = await identifyIngredient(base64, mimeType);
    if (!result.ok) {
      setPhase({ name: "error", message: result.error });
      return;
    }
    setPhase({ name: "result", data: result.data });
  }

  if (!open) {
    return (
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          type="button"
          className="gaia-btn gaia-btn-ghost"
          onClick={handleOpen}
          style={{ fontSize: "0.85rem" }}
        >
          Identify an ingredient
        </button>
      </div>
    );
  }

  return (
    <article className="gaia-card gaia-surface-muted">
      <div className="gaia-section-title">
        <h2>Identify an Ingredient</h2>
        <span className="gaia-section-kicker">Visual check</span>
      </div>
      <p className="gaia-note">
        Take or upload a photo of an herb, vegetable, fruit, or plant-based
        ingredient to get a botanical identification.
      </p>

      {/* Camera input — capture="environment" opens native camera on mobile */}
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
      {/* Upload input — opens gallery / file picker */}
      <input
        ref={uploadRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
      {/* Off-screen canvas used to capture webcam frames */}
      <canvas ref={canvasRef} style={{ display: "none" }} />

      {/* ── idle: two distinct actions ── */}
      {phase.name === "idle" && webcam.status === "off" && (
        <div className="gaia-actions">
          <button
            type="button"
            className="gaia-btn gaia-btn-primary"
            onClick={handleTakePhoto}
          >
            Take a photo
          </button>
          <button
            type="button"
            className="gaia-btn gaia-btn-secondary"
            onClick={() => uploadRef.current?.click()}
          >
            Upload image
          </button>
          <button type="button" className="gaia-btn gaia-btn-ghost" onClick={handleClose}>
            Cancel
          </button>
        </div>
      )}

      {/* ── webcam: requesting permission ── */}
      {phase.name === "idle" && webcam.status === "requesting" && (
        <p className="gaia-note" style={{ fontStyle: "italic" }}>
          Requesting camera access…
        </p>
      )}

      {/* ── webcam: permission denied ── */}
      {phase.name === "idle" && webcam.status === "denied" && (
        <>
          <p className="gaia-note">
            Camera access was denied or unavailable. You can upload a photo instead.
          </p>
          <div className="gaia-actions">
            <button
              type="button"
              className="gaia-btn gaia-btn-secondary"
              onClick={() => {
                setWebcam({ status: "off" });
                uploadRef.current?.click();
              }}
            >
              Upload image
            </button>
            <button type="button" className="gaia-btn gaia-btn-ghost" onClick={handleClose}>
              Cancel
            </button>
          </div>
        </>
      )}

      {/* ── webcam: live preview ── */}
      {phase.name === "idle" && webcam.status === "live" && (
        <>
          <div style={{ textAlign: "center" }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                maxWidth: "100%",
                maxHeight: "260px",
                borderRadius: "12px",
                border: "1px solid var(--gaia-border)",
                background: "#000",
              }}
            />
          </div>
          <div className="gaia-actions">
            <button
              type="button"
              className="gaia-btn gaia-btn-primary"
              onClick={handleCapture}
            >
              Capture
            </button>
            <button
              type="button"
              className="gaia-btn gaia-btn-ghost"
              onClick={stopWebcam}
            >
              Cancel camera
            </button>
          </div>
        </>
      )}

      {/* ── selected: preview + confirm ── */}
      {phase.name === "selected" && (
        <>
          <div style={{ textAlign: "center" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={phase.previewUrl}
              alt="Selected ingredient preview"
              style={{
                maxWidth: "100%",
                maxHeight: "260px",
                objectFit: "contain",
                borderRadius: "12px",
                border: "1px solid var(--gaia-border)",
              }}
            />
          </div>
          <div className="gaia-actions">
            <button
              type="button"
              className="gaia-btn gaia-btn-primary"
              onClick={handleAnalyse}
            >
              Analyse
            </button>
            <button
              type="button"
              className="gaia-btn gaia-btn-secondary"
              onClick={handleGoToIdle}
            >
              Choose different photo
            </button>
            <button type="button" className="gaia-btn gaia-btn-ghost" onClick={handleClose}>
              Cancel
            </button>
          </div>
        </>
      )}

      {/* ── analyzing ── */}
      {phase.name === "analyzing" && (
        <p className="gaia-note" style={{ fontStyle: "italic" }}>
          Analysing your photo…
        </p>
      )}

      {/* ── result ── */}
      {phase.name === "result" && (
        <>
          <div className="gaia-list-card">
            {phase.data.name ? (
              <>
                <div className="gaia-section-title" style={{ marginBottom: "0.35rem" }}>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: "1.05rem", color: "var(--gaia-ink-800)" }}>
                    {phase.data.confidence === "high" ? "Likely match: " : "Possible match: "}
                    <strong>{phase.data.name}</strong>
                  </p>
                  <ConfidenceBadge confidence={phase.data.confidence} />
                </div>
                {phase.data.latinName && (
                  <p className="gaia-note" style={{ fontStyle: "italic" }}>
                    {phase.data.latinName}
                  </p>
                )}
                {phase.data.description && (
                  <p style={{ marginTop: "0.35rem" }}>{phase.data.description}</p>
                )}
                {phase.data.caution && (
                  <p
                    className="gaia-note"
                    style={{ marginTop: "0.35rem", color: "var(--gaia-earth-600)", fontStyle: "normal" }}
                  >
                    {phase.data.caution}
                  </p>
                )}
              </>
            ) : (
              <p className="gaia-note">
                No plant-based ingredient was clearly identifiable. Try a closer
                or better-lit photo.
              </p>
            )}
          </div>
          <div className="gaia-actions">
            <button
              type="button"
              className="gaia-btn gaia-btn-secondary"
              onClick={handleGoToIdle}
            >
              Identify another
            </button>
            <button type="button" className="gaia-btn gaia-btn-ghost" onClick={handleClose}>
              Close
            </button>
          </div>
        </>
      )}

      {/* ── error ── */}
      {phase.name === "error" && (
        <>
          <p className="gaia-error">{phase.message}</p>
          <div className="gaia-actions">
            <button
              type="button"
              className="gaia-btn gaia-btn-secondary"
              onClick={handleGoToIdle}
            >
              Try again
            </button>
            <button type="button" className="gaia-btn gaia-btn-ghost" onClick={handleClose}>
              Cancel
            </button>
          </div>
        </>
      )}
    </article>
  );
}
