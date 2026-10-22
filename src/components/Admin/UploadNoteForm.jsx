import React, { useState } from "react";
import { Link2, FileText, CheckCircle2, AlertCircle, Sparkles, HelpCircle, ExternalLink, HardDrive } from "lucide-react";
import { DEFAULT_SUBJECTS } from "../../config/constants";
import { db, isDemoConfig, collection, addDoc, serverTimestamp } from "../../config/firebase";
import { useToast } from "../Toast";

// Helper to extract Google Drive file ID
export function extractGoogleDriveId(url) {
  if (!url) return null;
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

export const UploadNoteForm = ({ onNoteAdded }) => {
  const { addToast } = useToast();

  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("BDA");
  const [customSubject, setCustomSubject] = useState("");
  const [chapter, setChapter] = useState("");
  const [pageCount, setPageCount] = useState("");
  const [driveUrl, setDriveUrl] = useState("");
  const [fileType, setFileType] = useState("pdf"); // 'pdf' | 'image'
  const [fileSize, setFileSize] = useState("3.5 MB");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalSubject = subject === "Custom" ? customSubject.trim() : subject;

    if (!title.trim()) {
      setErrorMsg("Please provide a note title.");
      return;
    }
    if (!finalSubject) {
      setErrorMsg("Please choose or enter a subject.");
      return;
    }
    if (!driveUrl.trim()) {
      setErrorMsg("Please paste the Google Drive link or Cloud URL for the note file.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const cleanUrl = driveUrl.trim();
      const driveFileId = extractGoogleDriveId(cleanUrl);
      const noteId = `note_${Date.now()}`;

      const newNote = {
        id: noteId,
        title: title.trim(),
        subject: finalSubject,
        chapter: chapter.trim() || "Unit Notes",
        description: description.trim() || `Comprehensive ${finalSubject} notes prepared for exams.`,
        pageCount: parseInt(pageCount, 10) || 12,
        fileType,
        fileSize: fileSize.trim() || "3.5 MB",
        driveUrl: cleanUrl,
        driveFileId,
        source: driveFileId ? "google-drive" : "cloud-url",
        uploadDate: new Date().toISOString().split("T")[0],
        downloadCount: 0,
        createdAt: new Date().toISOString(),
      };

      // Save metadata in Firestore
      if (!isDemoConfig && db) {
        await addDoc(collection(db, "notes"), {
          ...newNote,
          serverTimestamp: serverTimestamp(),
        });
      }

      // Also persist to local notes state
      onNoteAdded(newNote);
      addToast(`"${newNote.title}" published with Google Drive storage!`, "success", 4000);

      // Reset form
      setTitle("");
      setChapter("");
      setPageCount("");
      setDriveUrl("");
      setDescription("");
    } catch (err) {
      setErrorMsg(err.message || "Failed to publish note.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="upload-note-card glass-panel">
      {/* Header Banner */}
      <div className="upload-card-header">
        <div className="upload-badge">
          <HardDrive size={15} className="text-emerald-500" />
          <span>100% Free Forever • Google Drive / Cloud Storage</span>
        </div>
        <h3 className="upload-title">Publish New Study Note</h3>
        <p className="upload-sub">
          Host your PDF files on Google Drive (15 GB free, unlimited bandwidth) and paste the link below.
          No paid Firebase Storage needed!
        </p>
      </div>

      {/* Google Drive Guide Box */}
      <div className="drive-guide-card">
        <div className="guide-header">
          <Sparkles size={16} className="text-primary-500" />
          <span className="font-bold">How to get your free Google Drive link:</span>
        </div>
        <ol className="guide-steps">
          <li>Upload your note PDF to your personal <strong>Google Drive</strong> (<a href="https://drive.google.com" target="_blank" rel="noopener noreferrer" className="drive-link">drive.google.com <ExternalLink size={12} /></a>).</li>
          <li>Right-click the file → Click <strong>Share</strong> → Under 'General access', set to <strong>"Anyone with the link can view"</strong>.</li>
          <li>Click <strong>"Copy link"</strong> and paste it in the field below!</li>
        </ol>
      </div>

      {errorMsg && (
        <div className="error-alert animate-fade-in">
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="upload-form">
        <div className="form-grid-2">
          {/* Note Title */}
          <div className="form-group">
            <label className="input-label" htmlFor="note-title-input">
              Note Title *
            </label>
            <input
              id="note-title-input"
              type="text"
              className="input-field"
              placeholder="e.g. BDA Chapter 1: HDFS & MapReduce"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Subject Dropdown */}
          <div className="form-group">
            <label className="input-label" htmlFor="note-subject-select">
              Subject *
            </label>
            <select
              id="note-subject-select"
              className="input-field"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            >
              {DEFAULT_SUBJECTS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
              <option value="Custom">+ Add Custom Subject</option>
            </select>
          </div>
        </div>

        {/* Custom Subject Field */}
        {subject === "Custom" && (
          <div className="form-group animate-fade-in">
            <label className="input-label">Enter Custom Subject Name</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Distributed Systems (DS)"
              value={customSubject}
              onChange={(e) => setCustomSubject(e.target.value)}
              required
            />
          </div>
        )}

        <div className="form-grid-3">
          {/* Chapter / Topic */}
          <div className="form-group">
            <label className="input-label">Chapter / Topic</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Unit 1 / Chapter 3"
              value={chapter}
              onChange={(e) => setChapter(e.target.value)}
            />
          </div>

          {/* Page Count */}
          <div className="form-group">
            <label className="input-label">Page Count</label>
            <input
              type="number"
              min="1"
              max="999"
              className="input-field"
              placeholder="e.g. 14"
              value={pageCount}
              onChange={(e) => setPageCount(e.target.value)}
            />
          </div>

          {/* File Format */}
          <div className="form-group">
            <label className="input-label">Format</label>
            <select
              className="input-field"
              value={fileType}
              onChange={(e) => setFileType(e.target.value)}
            >
              <option value="pdf">PDF Document (.pdf)</option>
              <option value="image">Image Note (.jpg, .png)</option>
            </select>
          </div>
        </div>

        {/* Google Drive / Cloud Link Input */}
        <div className="form-group">
          <label className="input-label" htmlFor="drive-link-input">
            Google Drive Share Link (or Cloud PDF Link) *
          </label>
          <div className="input-icon-wrap">
            <Link2 size={18} className="field-icon text-primary-500" />
            <input
              id="drive-link-input"
              type="url"
              className="input-field with-icon"
              placeholder="https://drive.google.com/file/d/1ABCxyz.../view?usp=sharing"
              value={driveUrl}
              onChange={(e) => {
                setDriveUrl(e.target.value);
                if (errorMsg) setErrorMsg("");
              }}
              required
            />
          </div>
          {driveUrl && extractGoogleDriveId(driveUrl) && (
            <div className="drive-verified-tag">
              <CheckCircle2 size={13} className="text-emerald-500" />
              <span>Valid Google Drive file detected (File ID: {extractGoogleDriveId(driveUrl)})</span>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="form-group">
          <label className="input-label">Brief Description / Exam Tips</label>
          <textarea
            className="input-field"
            rows="3"
            placeholder="e.g. Includes solved university 10-mark questions, architecture diagrams, and algorithm steps."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="btn btn-primary btn-lg submit-note-btn"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span>Publishing Note...</span>
          ) : (
            <>
              <CheckCircle2 size={18} />
              <span>Publish Note to Vault</span>
            </>
          )}
        </button>
      </form>

      <style>{`
        .upload-note-card {
          padding: 1.75rem;
          margin-bottom: 2rem;
        }
        .upload-card-header {
          margin-bottom: 1.5rem;
          padding-bottom: 1.25rem;
          border-bottom: 1px solid var(--border-subtle);
        }
        .upload-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          background: rgba(16, 185, 129, 0.12);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: #10b981;
          padding: 0.35rem 0.85rem;
          border-radius: var(--radius-full);
          font-size: 0.8rem;
          font-weight: 700;
          margin-bottom: 0.75rem;
        }
        .upload-title {
          font-size: clamp(1.2rem, 3vw, 1.5rem);
          font-weight: 800;
          color: var(--text-primary);
        }
        .upload-sub {
          font-size: 0.88rem;
          color: var(--text-muted);
          margin-top: 0.25rem;
        }
        .drive-guide-card {
          background: rgba(99, 102, 241, 0.06);
          border: 1px solid rgba(99, 102, 241, 0.2);
          padding: 1rem 1.25rem;
          border-radius: var(--radius-md);
          margin-bottom: 1.5rem;
        }
        .guide-header {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          font-size: 0.88rem;
          color: var(--primary-500);
          margin-bottom: 0.5rem;
        }
        .guide-steps {
          padding-left: 1.25rem;
          font-size: 0.825rem;
          color: var(--text-secondary);
          line-height: 1.6;
        }
        .drive-link {
          color: var(--primary-500);
          text-decoration: underline;
          display: inline-flex;
          align-items: center;
          gap: 2px;
        }
        .upload-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .form-grid-2 {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }
        .form-grid-3 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }
        .form-group {
          display: flex;
          flex-direction: column;
        }
        .input-icon-wrap {
          position: relative;
        }
        .input-icon-wrap .field-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
        }
        .input-icon-wrap .input-field {
          padding-left: 2.4rem;
        }
        .drive-verified-tag {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.775rem;
          color: #10b981;
          font-weight: 600;
          margin-top: 0.4rem;
        }
        .error-alert {
          background: rgba(239, 68, 68, 0.12);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #ef4444;
          padding: 0.75rem 1rem;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          margin-bottom: 1rem;
        }
        .submit-note-btn {
          min-height: 48px;
          width: 100%;
          margin-top: 0.5rem;
        }

        /* Responsive Rules at 600px and 1024px */
        @media (max-width: 600px) {
          .upload-note-card {
            padding: 1.15rem;
          }
          .form-grid-2, .form-grid-3 {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
          .submit-note-btn {
            width: 100%;
            min-height: 44px;
          }
        }

        @media (min-width: 601px) and (max-width: 1024px) {
          .form-grid-3 {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
};
