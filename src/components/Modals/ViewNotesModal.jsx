import React, { useEffect, useState, useMemo } from "react";
import { Shield, ShieldAlert, Eye, X, Maximize2, Minimize2, FileText, Lock, Sparkles, AlertCircle } from "lucide-react";
import { parseGoogleDriveFileId } from "../../utils/watermarkClient";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../Toast";

export const ViewNotesModal = ({ isOpen, onClose, note }) => {
  const { userProfile } = useAuth();
  const { addToast } = useToast();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasBlockedCapture, setHasBlockedCapture] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsFullscreen(false);
      setHasBlockedCapture(false);
      return;
    }

    // Intercept keyboard shortcuts for Print, Save, Developer Tools inside the modal
    const handleKeyDown = (e) => {
      // PrintScreen key
      if (e.key === "PrintScreen") {
        e.preventDefault();
        setHasBlockedCapture(true);
        if (navigator.clipboard?.writeText) {
          navigator.clipboard.writeText("Screenshots of Amit's Notes are prohibited.");
        }
        addToast("⚠️ Screenshots are strictly disabled to protect Amit's notes.", "warning", 3000);
      }

      // Ctrl+P / Cmd+P (Print)
      if ((e.ctrlKey || e.metaKey) && (e.key === "p" || e.key === "P")) {
        e.preventDefault();
        addToast("Printing is disabled.", "warning", 2500);
      }

      // Ctrl+S / Cmd+S (Save)
      if ((e.ctrlKey || e.metaKey) && (e.key === "s" || e.key === "S")) {
        e.preventDefault();
        addToast("Direct downloads are disabled for this note.", "warning", 2500);
      }
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
      addToast("Right-click is disabled to protect note materials.", "warning", 2000);
      return false;
    };

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("contextmenu", handleContextMenu);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [isOpen, addToast]);

  if (!isOpen || !note) return null;

  const driveFileId = note.driveUrl ? parseGoogleDriveFileId(note.driveUrl) : null;
  const isImage = note.fileType === "image";

  // Google Drive embedded preview URL
  const driveEmbedUrl = driveFileId
    ? `https://drive.google.com/file/d/${driveFileId}/preview`
    : null;

  // Stamped watermark text
  const watermarkText = userProfile?.name
    ? `${userProfile.name} • +91 ${userProfile.phone || ""}`
    : "Verified Student • Amit's Vault";

  return (
    <div className={`view-notes-overlay ${isFullscreen ? "fullscreen-mode" : ""}`}>
      <div className="view-notes-container glass-panel animate-scale-up">
        {/* Header Bar */}
        <div className="view-notes-header">
          <div className="header-left">
            <span className="badge badge-subject">{note.subject}</span>
            <div className="title-block">
              <h3 className="view-notes-title">{note.title}</h3>
              <p className="view-notes-sub">
                {note.chapter || "Unit Notes"} • {note.pageCount || 1} Pages • Secure Read-Only Viewer
              </p>
            </div>
          </div>

          <div className="header-right">
            {/* Live Watermark Identity Indicator */}
            <div className="identity-pill" title="Your identity is dynamically stamped to prevent leaks">
              <ShieldAlert size={14} className="text-emerald-400" />
              <span>Stamped: <strong>{userProfile?.name || "Student"}</strong></span>
            </div>

            {/* Fullscreen Toggle */}
            <button
              className="btn-icon"
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen View"}
            >
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>

            {/* Close Button */}
            <button className="btn-icon close-btn" onClick={onClose} title="Close Viewer">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Note Content Viewer with Watermark Protection */}
        <div className="view-notes-body" onContextMenu={(e) => e.preventDefault()}>
          {/* Dynamic On-Screen Watermark Grid (Prevents screen & camera recording) */}
          <div className="watermark-overlay-grid" aria-hidden="true">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="watermark-item">
                <span className="watermark-title">{userProfile?.name || "Verified Student"}</span>
                <span className="watermark-contact">+91 {userProfile?.phone || "XXXXXXXXXX"} • Amit's Vault</span>
              </div>
            ))}
          </div>

          {/* Actual Note Material */}
          <div className="note-display-wrapper">
            {/* Case 1: Google Drive Hosted File (PDF / Images) */}
            {driveEmbedUrl ? (
              <iframe
                src={driveEmbedUrl}
                title={note.title}
                className="note-embed-frame"
                allow="autoplay"
                sandbox="allow-scripts allow-same-origin allow-forms"
              />
            ) : note.pdfData ? (
              /* Case 2: Device-Uploaded PDF or Image */
              isImage ? (
                <div className="image-viewer-wrap">
                  <img
                    src={note.pdfData}
                    alt={note.title}
                    className="protected-note-image"
                    draggable="false"
                    onContextMenu={(e) => e.preventDefault()}
                  />
                </div>
              ) : (
                <iframe
                  src={`${note.pdfData}#toolbar=0&navpanes=0&scrollbar=1`}
                  title={note.title}
                  className="note-embed-frame"
                />
              )
            ) : (
              /* Case 3: Study Notes Reader Preview */
              <div className="synthesized-notes-view">
                <div className="note-preview-header">
                  <span className="preview-subject-badge">{note.subject} Vault</span>
                  <h2>{note.title}</h2>
                  <p className="preview-meta">{note.description}</p>
                </div>

                <div className="note-sample-pages">
                  {Array.from({ length: Math.min(3, note.pageCount || 2) }).map((_, pageIdx) => (
                    <div key={pageIdx} className="note-page-card">
                      <div className="page-header-row">
                        <span className="page-chap">{note.chapter || "Lecture Notes"}</span>
                        <span className="page-num">Page {pageIdx + 1} of {note.pageCount || 2}</span>
                      </div>
                      <div className="page-content-mock">
                        <div className="skeleton-line full"></div>
                        <div className="skeleton-line medium"></div>
                        <div className="skeleton-line short"></div>
                        <div className="skeleton-card">
                          <strong>Key Exam Concepts & Summary:</strong>
                          <p>{note.description}</p>
                        </div>
                        <div className="skeleton-line full"></div>
                        <div className="skeleton-line medium"></div>
                      </div>
                      <div className="page-footer-row">
                        <span>Prepared by Amit Garje</span>
                        <span>Trace #{note.id}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Security Notification Footer Bar */}
        <div className="view-notes-footer">
          <div className="security-notice">
            <Lock size={15} className="text-primary-400" />
            <span>
              <strong>Secure View Mode:</strong> Screenshots and direct file downloads are disabled to protect study content. Your verified name and phone are dynamically tracked.
            </span>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            Close Notes
          </button>
        </div>
      </div>

      <style>{`
        .view-notes-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(10, 15, 30, 0.85);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          z-index: 99999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.25rem;
          user-select: none;
          -webkit-user-select: none;
        }
        .view-notes-container {
          width: 100%;
          max-width: 1080px;
          height: 90vh;
          max-height: 900px;
          background: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-lg);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
          transition: all 0.3s ease;
        }
        .fullscreen-mode .view-notes-container {
          max-width: 100vw;
          height: 100vh;
          max-height: 100vh;
          border-radius: 0;
          border: none;
        }
        .view-notes-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid var(--border-subtle);
          background: var(--bg-surface-elevated);
          gap: 1rem;
          flex-wrap: wrap;
        }
        .header-left {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }
        .title-block {
          display: flex;
          flex-direction: column;
        }
        .view-notes-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--text-main);
          margin: 0;
          line-height: 1.3;
        }
        .view-notes-sub {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin: 0;
        }
        .header-right {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .identity-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          background: rgba(16, 185, 129, 0.12);
          border: 1px solid rgba(16, 185, 129, 0.25);
          color: #10b981;
          font-size: 0.78rem;
          padding: 0.35rem 0.75rem;
          border-radius: var(--radius-full);
        }
        .btn-icon {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-icon:hover {
          color: var(--text-main);
          border-color: var(--border-strong);
        }
        .close-btn:hover {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
          border-color: rgba(239, 68, 68, 0.3);
        }
        .view-notes-body {
          flex: 1;
          position: relative;
          overflow: hidden;
          background: #080c16;
          display: flex;
        }
        .note-display-wrapper {
          width: 100%;
          height: 100%;
          position: relative;
          z-index: 1;
        }
        .note-embed-frame {
          width: 100%;
          height: 100%;
          border: none;
          background: #111827;
        }
        .image-viewer-wrap {
          width: 100%;
          height: 100%;
          overflow: auto;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }
        .protected-note-image {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          border-radius: var(--radius-md);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
          pointer-events: none;
        }
        /* Dynamic On-Screen Watermark Overlay */
        .watermark-overlay-grid {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 10;
          pointer-events: none;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          grid-template-rows: repeat(4, 1fr);
          padding: 2rem;
          gap: 1.5rem;
          overflow: hidden;
        }
        .watermark-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          transform: rotate(-24deg);
          opacity: 0.14;
          text-align: center;
          color: #ffffff;
        }
        [data-theme='light'] .watermark-item {
          color: #000000;
          opacity: 0.12;
        }
        .watermark-title {
          font-size: 1.15rem;
          font-weight: 800;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .watermark-contact {
          font-size: 0.8rem;
          font-weight: 600;
          letter-spacing: 0.02em;
        }
        .synthesized-notes-view {
          height: 100%;
          overflow-y: auto;
          padding: 2rem;
          max-width: 800px;
          margin: 0 auto;
        }
        .note-preview-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        .preview-subject-badge {
          display: inline-block;
          background: rgba(99, 102, 241, 0.2);
          color: var(--primary-400);
          padding: 0.3rem 0.8rem;
          border-radius: var(--radius-full);
          font-size: 0.85rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }
        .note-page-card {
          background: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 2rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }
        .page-header-row, .page-footer-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          color: var(--text-muted);
          border-bottom: 1px solid var(--border-subtle);
          padding-bottom: 0.75rem;
          margin-bottom: 1.5rem;
        }
        .page-footer-row {
          border-bottom: none;
          border-top: 1px solid var(--border-subtle);
          padding-bottom: 0;
          padding-top: 0.75rem;
          margin-bottom: 0;
          margin-top: 1.5rem;
        }
        .skeleton-line {
          height: 12px;
          background: rgba(255, 255, 255, 0.06);
          border-radius: 4px;
          margin-bottom: 0.85rem;
        }
        .skeleton-line.full { width: 100%; }
        .skeleton-line.medium { width: 75%; }
        .skeleton-line.short { width: 50%; }
        .skeleton-card {
          background: rgba(99, 102, 241, 0.08);
          border-left: 3px solid var(--primary-500);
          padding: 1rem;
          border-radius: 4px;
          margin: 1.25rem 0;
          font-size: 0.95rem;
        }
        .view-notes-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.85rem 1.5rem;
          border-top: 1px solid var(--border-subtle);
          background: var(--bg-surface-elevated);
          gap: 1rem;
          flex-wrap: wrap;
        }
        .security-notice {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-size: 0.82rem;
          color: var(--text-muted);
        }
        @media (max-width: 640px) {
          .view-notes-overlay {
            padding: 0;
          }
          .view-notes-container {
            height: 100vh;
            max-height: 100vh;
            border-radius: 0;
          }
          .identity-pill {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};
