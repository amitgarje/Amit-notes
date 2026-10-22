import React from "react";
import { FileText, Image as ImageIcon, Calendar, Layers, Download, Eye, ShieldAlert, Check, Lock, Unlock, Sparkles, Clock, CheckCircle2, HardDrive, ExternalLink } from "lucide-react";

export const NoteCard = ({
  note,
  onViewNoteClick,
  onDownloadClick,
  onRequestUnlock,
  isWhitelisted = false,
  isApproved = false,
  hasRequestedUnlock = false,
  isAdmin = false,
}) => {
  const isImage = note.fileType === "image";
  const isUnlocked = isAdmin || isWhitelisted || isApproved;
  const handleView = () => {
    if (onViewNoteClick) onViewNoteClick(note);
    else if (onDownloadClick) onDownloadClick(note);
  };

  return (
    <div className={`note-card glass-panel ${!isUnlocked ? "card-locked" : ""}`}>
      {/* Top Bar: Subject Badge + File Type Icon + Lock Status */}
      <div className="note-card-top">
        <div className="top-left-badges">
          <span className="badge badge-subject">{note.subject}</span>
          {isWhitelisted && (
            <span className="badge badge-done vip-badge" title="Auto-unlocked because your phone is in Amit's friends whitelist!">
              <Sparkles size={11} />
              <span>VIP Friend</span>
            </span>
          )}
          {isApproved && !isWhitelisted && (
            <span className="badge badge-done approved-badge">
              <CheckCircle2 size={11} />
              <span>Approved</span>
            </span>
          )}
          {!isUnlocked && (
            <span className="badge badge-planned locked-badge">
              <Lock size={11} />
              <span>Locked</span>
            </span>
          )}
        </div>

        <div className="top-right-badges">
          <div className="file-type-pill" title={isImage ? "Image Note (JPG/PNG)" : "PDF Document"}>
            {isImage ? <ImageIcon size={14} /> : <FileText size={14} />}
            <span>{isImage ? "IMAGE" : "PDF"}</span>
          </div>
        </div>
      </div>

      {/* Title & Chapter */}
      <h3 className="note-card-title">{note.title}</h3>
      <p className="note-card-desc">{note.description}</p>

      {/* Metadata Badges (Pages, Date, Downloads) */}
      <div className="note-card-meta">
        <div className="meta-item" title="Page count">
          <Layers size={14} />
          <span>{note.pageCount} Pages</span>
        </div>

        <div className="meta-item" title="Date uploaded">
          <Calendar size={14} />
          <span>{note.uploadDate}</span>
        </div>

        <div className="meta-item" title="Total reads">
          <Eye size={14} />
          <span>{note.downloadCount || 0}</span>
        </div>
      </div>

      {/* Security Banner / Locked Notice */}
      {isUnlocked ? (
        <div className="card-security-banner">
          <ShieldAlert size={12} className="text-indigo-400" />
          <span>Protected in-app viewing • Screenshots & downloads disabled</span>
        </div>
      ) : (
        <div className="card-locked-banner">
          <Lock size={13} className="text-amber-500" />
          <span>
            {hasRequestedUnlock
              ? "Access request sent. Amit will approve shortly."
              : "Locked note. Request access from Amit to unlock."}
          </span>
        </div>
      )}

      {/* Action Button: View Notes if unlocked, or Request Unlock if locked */}
      <div className="note-card-footer">
        {isUnlocked ? (
          <button
            className="btn btn-primary w-full view-notes-btn"
            onClick={handleView}
          >
            <Eye size={16} />
            <span>View Notes</span>
          </button>
        ) : hasRequestedUnlock ? (
          <button className="btn btn-secondary w-full pending-btn" disabled>
            <Clock size={16} className="animate-spin text-amber-500" />
            <span>Approval Pending...</span>
          </button>
        ) : (
          <button
            className="btn btn-primary w-full unlock-request-btn"
            onClick={() => onRequestUnlock(note)}
          >
            <Unlock size={16} />
            <span>Request Unlock Access</span>
          </button>
        )}
      </div>

      <style>{`
        .note-card {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          height: 100%;
          border-radius: var(--radius-lg);
          transition: transform var(--transition-fast), box-shadow var(--transition-fast), border-color var(--transition-fast);
          position: relative;
        }
        .note-card:hover {
          transform: translateY(-3px);
          box-shadow: var(--shadow-xl);
          border-color: var(--primary-400);
        }
        .note-card.card-locked {
          border-top: 3px solid rgba(245, 158, 11, 0.6);
        }
        .note-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.85rem;
          gap: 0.5rem;
        }
        .top-left-badges {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          flex-wrap: wrap;
        }
        .vip-badge {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.18), rgba(99, 102, 241, 0.18));
          color: #10b981;
          border-color: rgba(16, 185, 129, 0.4);
          font-weight: 800;
        }
        .approved-badge {
          font-weight: 700;
        }
        .locked-badge {
          font-weight: 700;
        }
        .file-type-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.725rem;
          font-weight: 700;
          color: var(--text-muted);
          background: var(--bg-surface-elevated);
          padding: 0.2rem 0.55rem;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-subtle);
          flex-shrink: 0;
        }
        .note-card-title {
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.4rem;
          line-height: 1.35;
        }
        .note-card-desc {
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.45;
          margin-bottom: 1.25rem;
          flex: 1;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .note-card-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 0;
          border-top: 1px solid var(--border-subtle);
          border-bottom: 1px solid var(--border-subtle);
          margin-bottom: 0.85rem;
        }
        .meta-item {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.78rem;
          color: var(--text-muted);
          font-weight: 600;
        }
        .card-security-banner {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.74rem;
          color: var(--text-muted);
          background: rgba(99, 102, 241, 0.06);
          padding: 0.35rem 0.65rem;
          border-radius: var(--radius-sm);
          margin-bottom: 1rem;
        }
        .card-locked-banner {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          font-size: 0.74rem;
          color: #d97706;
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.25);
          padding: 0.4rem 0.65rem;
          border-radius: var(--radius-sm);
          margin-bottom: 1rem;
        }
        [data-theme='dark'] .card-locked-banner {
          color: #fbbf24;
        }
        .top-right-badges {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          flex-shrink: 0;
        }
        .drive-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.7rem;
          font-weight: 700;
          color: #10b981;
          background: rgba(16, 185, 129, 0.12);
          border: 1px solid rgba(16, 185, 129, 0.3);
          padding: 0.2rem 0.45rem;
          border-radius: var(--radius-sm);
        }
        .unlocked-actions-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          width: 100%;
        }
        .view-notes-btn {
          font-weight: 600;
          letter-spacing: 0.02em;
          box-shadow: 0 4px 14px rgba(99, 102, 241, 0.25);
          transition: all 0.2s ease;
        }
        .view-notes-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(99, 102, 241, 0.35);
        }
        .unlock-request-btn:hover {
          filter: brightness(1.1);
        }
        .pending-btn {
          background: var(--bg-surface-elevated);
          color: var(--text-muted);
          border: 1px dashed var(--border-subtle);
          cursor: not-allowed;
        }

        @media (max-width: 640px) {
          .note-card {
            padding: 1.15rem;
          }
          .note-card-title {
            font-size: 1.05rem;
          }
          .note-card-desc {
            font-size: 0.825rem;
            margin-bottom: 0.85rem;
          }
          .download-btn, .unlock-request-btn, .pending-btn {
            font-size: 0.88rem;
            padding: 0.65rem 0.85rem;
          }
        }
      `}</style>
    </div>
  );
};
