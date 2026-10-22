import React, { useEffect } from "react";
import { X } from "lucide-react";

export const Modal = ({ isOpen, onClose, title, subtitle, children, maxWidth = "500px" }) => {
  // ESC key listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop animate-fade-in" onClick={onClose}>
      <div
        className="modal-content glass-panel"
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-header">
          <div>
            <h3 className="modal-title">{title}</h3>
            {subtitle && <p className="modal-subtitle">{subtitle}</p>}
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">{children}</div>
      </div>

      <style>{`
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(10, 13, 20, 0.72);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1.25rem;
        }
        .modal-content {
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          background: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-modal);
          padding: 1.75rem;
          transform: translateY(0);
          animation: modalPop 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes modalPop {
          from {
            opacity: 0;
            transform: scale(0.96) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .modal-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 1.25rem;
          padding-bottom: 0.85rem;
          border-bottom: 1px solid var(--border-subtle);
        }
        .modal-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
        }
        .modal-subtitle {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-top: 0.2rem;
        }
        .modal-close-btn {
          color: var(--text-muted);
          padding: 6px;
          border-radius: var(--radius-sm);
          transition: all 0.15s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .modal-close-btn:hover {
          background: var(--bg-surface-elevated);
          color: var(--text-primary);
        }

        @media (max-width: 600px) {
          .modal-backdrop {
            padding: 0 !important;
            align-items: flex-end !important;
          }
          .modal-content {
            padding: 1.5rem 1.25rem 2rem 1.25rem !important;
            max-height: 88vh !important;
            max-width: 100vw !important;
            width: 100% !important;
            border-radius: 24px 24px 0 0 !important;
            border-bottom: none !important;
            margin: 0 !important;
            animation: sheetSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
          }
          @keyframes sheetSlideUp {
            from {
              transform: translateY(100%);
              opacity: 0.5;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
          .modal-header {
            margin-bottom: 1rem;
            padding-bottom: 0.65rem;
          }
          .modal-title {
            font-size: clamp(1.1rem, 4vw, 1.25rem);
          }
          .modal-subtitle {
            font-size: 0.8rem;
          }
        }
      `}</style>
    </div>
  );
};
