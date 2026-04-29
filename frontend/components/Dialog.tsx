"use client";

type Props = {
  open: boolean;
  title: string;
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
};

export default function Dialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "OK",
  cancelText = "Cancel",
}: Props) {
  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.78)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <article
        className="gaia-card"
        style={{
          maxWidth: 420,
          width: "90%",
          background: "rgba(13, 18, 28, 0.92)",
          border: "1px solid rgba(255, 255, 255, 0.14)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          boxShadow:
            "0 1px 0 rgba(255,255,255,0.07) inset, 0 24px 72px rgba(0,0,0,0.72), 0 0 0 1px rgba(124,156,255,0.08)",
        }}
      >
        <div className="gaia-section-title">
          <h2>{title}</h2>
        </div>
        <p>{message}</p>
        <div className="gaia-actions">
          {onConfirm && (
            <button className="gaia-btn gaia-btn-primary" onClick={onConfirm}>
              {confirmText}
            </button>
          )}
          {onCancel && (
            <button className="gaia-btn gaia-btn-ghost" onClick={onCancel}>
              {cancelText}
            </button>
          )}
        </div>
      </article>
    </div>
  );
}
