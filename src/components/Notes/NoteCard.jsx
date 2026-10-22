import React from "react";
import { FileText, Image as ImageIcon, Calendar, Layers, Download, ShieldAlert, Check } from "lucide-react";

export const NoteCard = ({ note, onDownloadClick }) => {
  const isImage = note.fileType === "image";

  return (
    <div className="note-card glass-panel">
      {/* Top Bar: Subject Badge + File Type Icon */}
      <div className="note-card-top">
        <span className="badge badge-subject">{note.subject}</span>
        <div className="file-type-pill" title={isImage ? "Image Note (JPG/PNG)" : "PDF Document"}>
          {isImage ? <ImageIcon size={14} /> : <FileText size={14} />}
          <span>{isImage ? "IMAGE" : "PDF"}</span>
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

        <div className="meta-item" title="Total downloads">
          <Download size={14} />
          <span>{note.downloadCount || 0}</span>
        </div>
      </div>

      {/* Watermark Security Notice */}
      <div className="card-security-banner">
        <ShieldAlert size={12} className="text-indigo-400" />
        <span>Stamps your identity on download</span>
      </div>

      {/* Download Action */}
      <div className="note-card-footer">
        <button
          className="btn btn-primary w-full download-btn"
          onClick={() => onDownloadClick(note)}
        >
          <Download size={16} />
          <span>Download Watermarked Note</span>
        </button>
      </div>

      <style>{`
        .note-card {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          height: 100%;
          border-radius: var(--radius-lg);
          transition: transform var(--transition-fast), box-shadow var(--transition-fast), border-color var(--transition-fast);
        }
        .note-card:hover {
          transform: translateY(-3px);
          box-shadow: var(--shadow-xl);
          border-color: var(--primary-400);
        }
        .note-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.85rem;
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
        .note-card-footer {
          margin-top: auto;
        }
        .download-btn {
          width: 100%;
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
          .download-btn {
            font-size: 0.88rem;
            padding: 0.65rem 0.85rem;
          }
        }
      `}</style>
    </div>
  );
};
