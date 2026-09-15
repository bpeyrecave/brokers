import { useState, type ReactNode } from "react";

export function InfoTooltip({ text }: { text: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      <button
        type="button"
        className="info-dot"
        aria-label="More information"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        onBlur={() => setOpen(false)}
      >
        i
      </button>
      {open && (
        <span
          role="tooltip"
          style={{
            position: "absolute",
            zIndex: 20,
            top: "calc(100% + 6px)",
            left: "50%",
            transform: "translateX(-50%)",
            width: "min(280px, 70vw)",
            background: "var(--brand-navy)",
            color: "#f5f4f0",
            padding: "0.65rem 0.8rem",
            borderRadius: 10,
            fontSize: "0.78rem",
            lineHeight: 1.5,
            fontWeight: 400,
            boxShadow: "var(--shadow-md)",
            textAlign: "left",
          }}
        >
          {text}
        </span>
      )}
    </span>
  );
}
