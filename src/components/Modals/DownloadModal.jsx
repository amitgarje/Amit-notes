import React, { useState, useEffect } from "react";
import { ShieldCheck, ShieldAlert, Loader2, Download, AlertCircle, CheckCircle2, FileText, UserCheck, Phone } from "lucide-react";
import { Modal } from "../Modal";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../Toast";
import { executeNoteDownload } from "../../utils/watermarkClient";

export const DownloadModal = ({ isOpen, onClose, note }) => {
  const { userProfile, currentUser } = useAuth();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setErrorMsg("");
      setSuccess(false);
      setLoading(false);
    }
  }, [isOpen, note]);

  if (!note) return null;

  const [progressText, setProgressText] = useState("Applying Watermark & Generating PDF...");

  const handleDownload = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setProgressText("Preparing watermarked PDF...");

    // Micro-delay to let React render the spinner cleanly
    await new Promise((r) => setTimeout(r, 30));

    try {
      await executeNoteDownload({
        note,
        userProfile,
        currentUser,
        onProgress: (status) => setProgressText(status),
      });

      setSuccess(true);
      addToast(`Downloaded "${note.title}" stamped with your identity!`, "success", 4000);

      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      setErrorMsg(err.message || "Failed to download note. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Download Watermarked Note"
      subtitle="Your verified name and phone will be stamped on every page."
      maxWidth="490px"
    >
      <form onSubmit={handleDownload} className="download-form">
        {/* Note Summary Card */}
        <div className="note-summary-card">
          <div className="note-summary-icon">
            <FileText size={24} />
          </div>
          <div className="note-summary-details">
            <span className="badge badge-subject">{note.subject}</span>
            <h4 className="note-summary-title">{note.title}</h4>
            <span className="note-summary-meta">
              {note.pageCount} Pages • {note.fileType?.toUpperCase() || "PDF"} • {note.fileSize || "Study Material"}
            </span>
          </div>
        </div>

        {/* Live Watermark Stamp Preview Box */}
        <div className="watermark-preview-box">
          <div className="preview-label">
            <ShieldAlert size={15} className="text-primary-500" />
            <span>Traceable Watermark Preview</span>
          </div>

          <div className="watermark-stamp-visual">
            <div className="diagonal-stamp-text">
              {userProfile?.name || "Student Name"} &nbsp;|&nbsp; +91 {userProfile?.phone || "98XXXXXXXX"}
            </div>
            <div className="maker-stamp-text">Made by Amit Garje</div>
          </div>

          <div className="user-stamped-info">
            <div className="stamp-info-item">
              <UserCheck size={14} className="text-emerald-500" />
              <span>Stamped Name: <strong>{userProfile?.name}</strong></span>
            </div>
            <div className="stamp-info-item">
              <Phone size={14} className="text-primary-500" />
              <span>Contact: <strong>+91 {userProfile?.phone}</strong></span>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="error-alert animate-fade-in">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Direct Action Button */}
        <div className="download-modal-actions">
          <button
            type="submit"
            className="btn btn-primary w-full download-submit-btn"
            disabled={loading || success}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>{progressText}</span>
              </>
            ) : success ? (
              <>
                <CheckCircle2 size={18} className="text-emerald-300" />
                <span>Downloaded Successfully!</span>
              </>
            ) : (
              <>
                <Download size={18} />
                <span>Generate & Download Watermarked Note</span>
              </>
            )}
          </button>
        </div>
      </form>

      <style>{`
        .download-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .note-summary-card {
          display: flex;
          align-items: flex-start;
          gap: 0.85rem;
          background: var(--bg-surface-elevated);
          padding: 1rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-subtle);
        }
        .note-summary-icon {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-md);
          background: var(--primary-gradient);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .note-summary-details {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .note-summary-title {
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.35;
        }
        .note-summary-meta {
          font-size: 0.775rem;
          color: var(--text-muted);
          font-weight: 500;
        }
        .watermark-preview-box {
          background: rgba(99, 102, 241, 0.05);
          border: 1px dashed rgba(99, 102, 241, 0.3);
          border-radius: var(--radius-md);
          padding: 1rem;
        }
        .preview-label {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          font-size: 0.78rem;
          font-weight: 700;
          color: var(--primary-500);
          text-transform: uppercase;
          letter-spacing: 0.03em;
          margin-bottom: 0.65rem;
        }
        .watermark-stamp-visual {
          background: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          padding: 0.85rem 1rem;
          position: relative;
          overflow: hidden;
          min-height: 75px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .diagonal-stamp-text {
          font-size: 0.88rem;
          font-weight: 800;
          color: var(--text-muted);
          opacity: 0.4;
          transform: rotate(-6deg);
          letter-spacing: 0.04em;
          text-align: center;
          padding: 0.35rem 0;
        }
        .maker-stamp-text {
          font-size: 0.75rem;
          color: var(--text-muted);
          text-align: center;
          font-weight: 600;
          border-top: 1px solid var(--border-subtle);
          padding-top: 0.35rem;
        }
        .user-stamped-info {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          margin-top: 0.75rem;
          padding-top: 0.65rem;
          border-top: 1px solid rgba(99, 102, 241, 0.15);
          flex-wrap: wrap;
        }
        .stamp-info-item {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.82rem;
          color: var(--text-secondary);
        }
        .stamp-info-item strong {
          color: var(--text-primary);
        }
        .error-alert {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(239, 68, 68, 0.12);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #ef4444;
          padding: 0.65rem 0.85rem;
          border-radius: var(--radius-md);
          font-size: 0.85rem;
          font-weight: 500;
        }
        .download-submit-btn {
          padding: 0.9rem;
          font-size: 1rem;
        }
      `}</style>
    </Modal>
  );
};
