import React, { useState } from "react";
import { FileText, Image as ImageIcon, Trash2, Download, Layers, Calendar, ExternalLink, Search } from "lucide-react";
import { db, isDemoConfig, doc, deleteDoc } from "../../config/firebase";
import { useToast } from "../Toast";

export const ManageNotes = ({ notes, setNotes }) => {
  const { addToast } = useToast();
  const [search, setSearch] = useState("");

  const filteredNotes = notes.filter((n) => {
    const q = search.trim().toLowerCase();
    return !q || n.title?.toLowerCase().includes(q) || n.subject?.toLowerCase().includes(q);
  });

  const handleDelete = async (noteId, noteTitle) => {
    if (!window.confirm(`Are you sure you want to remove "${noteTitle}" from the vault?`)) {
      return;
    }

    try {
      // Delete from Firestore if connected
      if (!isDemoConfig && db) {
        await deleteDoc(doc(db, "notes", noteId));
      }

      // Update state & local storage
      const updated = notes.filter((n) => n.id !== noteId);
      setNotes(updated);
      localStorage.setItem("vault_notes_list", JSON.stringify(updated));
      addToast(`"${noteTitle}" removed from vault.`, "info");
    } catch (err) {
      addToast(err.message || "Failed to delete note.", "error");
    }
  };

  return (
    <div className="manage-notes-section glass-panel">
      <div className="manage-header">
        <div>
          <h3 className="manage-title">Manage Published Notes ({notes.length})</h3>
          <p className="manage-sub">
            All notes and images listed here are immediately visible to all students on the website.
          </p>
        </div>

        <div className="manage-search">
          <Search size={16} className="text-muted" />
          <input
            type="text"
            className="input-field manage-input"
            placeholder="Search notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="notes-list-table-wrap">
        <table className="manage-table">
          <thead>
            <tr>
              <th>Format</th>
              <th>Title</th>
              <th>Subject & Chapter</th>
              <th>Pages</th>
              <th>Downloads</th>
              <th>Upload Date</th>
              <th style={{ width: "80px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredNotes.length > 0 ? (
              filteredNotes.map((note) => (
                <tr key={note.id}>
                  <td>
                    <span className="format-badge">
                      {note.fileType === "image" ? (
                        <>
                          <ImageIcon size={14} className="text-amber-500" />
                          <span>IMAGE</span>
                        </>
                      ) : (
                        <>
                          <FileText size={14} className="text-indigo-500" />
                          <span>PDF</span>
                        </>
                      )}
                    </span>
                  </td>
                  <td className="note-title-cell">
                    <strong>{note.title}</strong>
                  </td>
                  <td>
                    <span className="badge badge-subject">{note.subject}</span>
                    <span className="chapter-label"> • {note.chapter}</span>
                  </td>
                  <td>{note.pageCount} Pages</td>
                  <td>
                    <span className="download-chip">
                      <Download size={13} />
                      <span>{note.downloadCount || 0}</span>
                    </span>
                  </td>
                  <td>{note.uploadDate}</td>
                  <td>
                    <button
                      className="btn btn-ghost btn-sm text-danger"
                      onClick={() => handleDelete(note.id, note.title)}
                      title="Delete Note"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="empty-text">
                  No notes match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Stacked Cards (< 600px) */}
      <div className="mobile-notes-cards">
        {filteredNotes.length > 0 ? (
          filteredNotes.map((note) => (
            <div key={note.id} className="mobile-note-card glass-panel">
              <div className="mobile-note-top">
                <span className="badge badge-subject">{note.subject}</span>
                <span className="format-badge">
                  {note.fileType === "image" ? (
                    <>
                      <ImageIcon size={13} className="text-amber-500" />
                      <span>IMAGE</span>
                    </>
                  ) : (
                    <>
                      <FileText size={13} className="text-indigo-500" />
                      <span>PDF</span>
                    </>
                  )}
                </span>
              </div>
              <h4 className="mobile-note-title">{note.title}</h4>
              <p className="mobile-note-chapter">{note.chapter}</p>
              <div className="mobile-note-footer">
                <div className="mobile-note-meta">
                  <span>{note.pageCount} Pgs</span>
                  <span>•</span>
                  <span>{note.downloadCount || 0} DLs</span>
                  <span>•</span>
                  <span>{note.uploadDate}</span>
                </div>
                <button
                  className="btn btn-danger btn-sm mobile-delete-btn"
                  onClick={() => handleDelete(note.id, note.title)}
                >
                  <Trash2 size={15} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-text">No notes found.</div>
        )}
      </div>

      <style>{`
        .mobile-notes-cards {
          display: none;
          flex-direction: column;
          gap: 0.85rem;
        }
        .manage-notes-section {
          padding: 1.75rem 2rem;
          margin-bottom: 2rem;
        }
        .manage-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        }
        .manage-title {
          font-size: 1.45rem;
          font-weight: 800;
          color: var(--text-primary);
        }
        .manage-sub {
          font-size: 0.88rem;
          color: var(--text-muted);
          margin-top: 0.2rem;
        }
        .manage-search {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--bg-surface-elevated);
          padding: 0.35rem 0.85rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-subtle);
        }
        .manage-input {
          border: none;
          background: transparent;
          padding: 0.25rem 0;
          font-size: 0.88rem;
          width: 180px;
        }
        .notes-list-table-wrap {
          overflow-x: auto;
        }
        .manage-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }
        .manage-table th {
          background: var(--bg-surface-elevated);
          padding: 0.85rem 1rem;
          font-size: 0.8rem;
          color: var(--text-muted);
          text-transform: uppercase;
          border-bottom: 1px solid var(--border-subtle);
        }
        .manage-table td {
          padding: 0.95rem 1rem;
          border-bottom: 1px solid var(--border-card);
          font-size: 0.88rem;
        }
        .format-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.75rem;
          font-weight: 700;
          background: var(--bg-surface-elevated);
          padding: 0.2rem 0.5rem;
          border-radius: var(--radius-sm);
        }
        .chapter-label {
          color: var(--text-muted);
          font-size: 0.82rem;
        }
        .download-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          font-weight: 600;
          color: var(--text-secondary);
        }
        .empty-text {
          text-align: center;
          padding: 2.5rem !important;
          color: var(--text-muted);
        }
        .text-danger {
          color: #ef4444 !important;
        }

        @media (max-width: 600px) {
          .manage-notes-section { padding: 1rem; }
          .notes-list-table-wrap { display: none; }
          .mobile-notes-cards { display: flex; }
          .mobile-note-card {
            padding: 1.15rem;
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            border-radius: var(--radius-md);
          }
          .mobile-note-top {
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          .mobile-note-title {
            font-size: 0.95rem;
            font-weight: 700;
            color: var(--text-primary);
          }
          .mobile-note-chapter {
            font-size: 0.8rem;
            color: var(--text-muted);
          }
          .mobile-note-footer {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-top: 0.5rem;
            padding-top: 0.5rem;
            border-top: 1px solid var(--border-subtle);
          }
          .mobile-note-meta {
            display: flex;
            align-items: center;
            gap: 0.4rem;
            font-size: 0.78rem;
            color: var(--text-muted);
          }
          .mobile-delete-btn {
            min-height: 36px;
            padding: 0.35rem 0.75rem;
          }
        }
      `}</style>
    </div>
  );
};
