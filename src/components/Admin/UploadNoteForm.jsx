import React, { useState } from "react";
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Lock, Loader2 } from "lucide-react";
import { DEFAULT_SUBJECTS } from "../../config/constants";
import { db, storage, isDemoConfig, collection, addDoc, serverTimestamp, ref, uploadBytes } from "../../config/firebase";
import { useToast } from "../Toast";

export const UploadNoteForm = ({ onNoteAdded }) => {
  const { addToast } = useToast();

  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("BDA");
  const [customSubject, setCustomSubject] = useState("");
  const [chapter, setChapter] = useState("");
  const [pageCount, setPageCount] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const ext = file.name.split(".").pop().toLowerCase();
      if (!["pdf", "png", "jpg", "jpeg"].includes(ext)) {
        setErrorMsg("Please upload a PDF or Image (JPG, PNG) note file.");
        return;
      }
      setSelectedFile(file);
      setErrorMsg("");

      // Auto prefill title if empty
      if (!title) {
        const cleanBase = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
        setTitle(cleanBase);
      }
    }
  };

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
    if (!selectedFile) {
      setErrorMsg("Please select a note file (PDF or Image) to upload.");
      return;
    }

    setIsUploading(true);
    setErrorMsg("");

    try {
      const ext = selectedFile.name.split(".").pop().toLowerCase();
      const isPdf = ext === "pdf";
      const fileType = isPdf ? "pdf" : "image";
      const noteId = `note_${Date.now()}`;
      const storageFileName = `${noteId}.${ext}`;
      const storagePath = `originals/${storageFileName}`;

      // In production Firebase, upload file to private Storage path /originals/
      if (!isDemoConfig && storage) {
        const storageRef = ref(storage, storagePath);
        await uploadBytes(storageRef, selectedFile);
      }

      const newNote = {
        id: noteId,
        title: title.trim(),
        subject: finalSubject,
        chapter: chapter.trim() || "Unit Notes",
        description: description.trim() || `Comprehensive ${finalSubject} notes prepared for exams.`,
        pageCount: parseInt(pageCount, 10) || 12,
        fileType,
        fileSize: `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`,
        uploadDate: new Date().toISOString().split("T")[0],
        downloadCount: 0,
        storagePath,
        storageFileName,
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
      addToast(`"${newNote.title}" uploaded to /originals/ and published!`, "success");

      // Reset form
      setTitle("");
      setChapter("");
      setPageCount("");
      setDescription("");
      setSelectedFile(null);
    } catch (err) {
      setErrorMsg(err.message || "Failed to upload note. Check storage permissions.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="upload-note-card glass-panel">
      <div className="upload-card-header">
        <div className="upload-badge">
          <Lock size={14} className="text-emerald-500" />
          <span>Private Storage Destination: /originals/</span>
        </div>
        <h3 className="upload-title">Upload New Protected Note</h3>
        <p className="upload-sub">
          Files are stored strictly in private Firebase storage. No public URLs are ever exposed.
        </p>
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
              Note Title
            </label>
            <input
              id="note-title-input"
              type="text"
              className="input-field"
              placeholder="e.g. BDA Notes – Chapter 3: MapReduce"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Subject Dropdown */}
          <div className="form-group">
            <label className="input-label" htmlFor="note-subject-select">
              Subject
            </label>
            <select
              id="note-subject-select"
              className="input-field select-field"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            >
              {DEFAULT_SUBJECTS.filter((s) => s !== "All").map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
              <option value="Custom">+ Enter Custom Subject</option>
            </select>
          </div>
        </div>

        {subject === "Custom" && (
          <div className="form-group animate-fade-in">
            <label className="input-label" htmlFor="custom-subject-input">
              Custom Subject Name
            </label>
            <input
              id="custom-subject-input"
              type="text"
              className="input-field"
              placeholder="e.g. Distributed Systems"
              value={customSubject}
              onChange={(e) => setCustomSubject(e.target.value)}
              required
            />
          </div>
        )}

        <div className="form-grid-2">
          {/* Chapter */}
          <div className="form-group">
            <label className="input-label" htmlFor="note-chapter-input">
              Chapter / Unit
            </label>
            <input
              id="note-chapter-input"
              type="text"
              className="input-field"
              placeholder="e.g. Chapter 3"
              value={chapter}
              onChange={(e) => setChapter(e.target.value)}
            />
          </div>

          {/* Page Count */}
          <div className="form-group">
            <label className="input-label" htmlFor="note-pages-input">
              Page Count
            </label>
            <input
              id="note-pages-input"
              type="number"
              min="1"
              max="999"
              className="input-field"
              placeholder="e.g. 24"
              value={pageCount}
              onChange={(e) => setPageCount(e.target.value)}
            />
          </div>
        </div>

        {/* Description */}
        <div className="form-group">
          <label className="input-label" htmlFor="note-desc-input">
            Summary / Syllabus Topics Covered
          </label>
          <textarea
            id="note-desc-input"
            rows="3"
            className="input-field textarea-field"
            placeholder="Important formulas, solved university questions, and diagrams..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* File Dropzone */}
        <div className="file-dropzone-box">
          <input
            id="note-file-picker"
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            className="file-hidden-input"
            onChange={handleFileChange}
          />
          <label htmlFor="note-file-picker" className="dropzone-label">
            <div className="dropzone-icon">
              <UploadCloud size={32} />
            </div>
            {selectedFile ? (
              <div className="dropzone-selected">
                <CheckCircle2 size={18} className="text-emerald-500" />
                <span className="selected-filename">{selectedFile.name}</span>
                <span className="selected-size">
                  ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                </span>
              </div>
            ) : (
              <div className="dropzone-text">
                <span className="dropzone-prompt">Click to browse or drag and drop note file</span>
                <span className="dropzone-formats">PDF Document or JPG / PNG Note Images (Max 50MB)</span>
              </div>
            )}
          </label>
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-lg w-full"
          disabled={isUploading || !selectedFile || !title.trim()}
        >
          {isUploading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>Uploading to /originals/ & Indexing...</span>
            </>
          ) : (
            <>
              <UploadCloud size={18} />
              <span>Publish Note to Vault</span>
            </>
          )}
        </button>
      </form>

      <style>{`
        .upload-note-card {
          padding: 2rem;
          margin-bottom: 2rem;
        }
        .upload-card-header {
          margin-bottom: 1.5rem;
        }
        .upload-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(16, 185, 129, 0.12);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: #10b981;
          padding: 0.25rem 0.75rem;
          border-radius: var(--radius-full);
          font-size: 0.78rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }
        .upload-title {
          font-size: 1.45rem;
          font-weight: 800;
          color: var(--text-primary);
        }
        .upload-sub {
          font-size: 0.88rem;
          color: var(--text-muted);
          margin-top: 0.2rem;
        }
        .upload-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .form-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
        }
        .textarea-field {
          resize: vertical;
        }
        .select-field {
          cursor: pointer;
        }
        .file-dropzone-box {
          border: 2px dashed var(--border-hover);
          border-radius: var(--radius-lg);
          padding: 2rem 1.5rem;
          text-align: center;
          background: var(--bg-surface-elevated);
          transition: all var(--transition-fast);
        }
        .file-dropzone-box:hover {
          border-color: var(--primary-500);
          background: rgba(99, 102, 241, 0.04);
        }
        .file-hidden-input {
          display: none;
        }
        .dropzone-label {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
        }
        .dropzone-icon {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: rgba(99, 102, 241, 0.12);
          color: var(--primary-500);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .dropzone-prompt {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-primary);
          display: block;
        }
        .dropzone-formats {
          font-size: 0.8rem;
          color: var(--text-muted);
        }
        .dropzone-selected {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--bg-surface);
          padding: 0.5rem 1rem;
          border-radius: var(--radius-full);
          border: 1px solid var(--border-subtle);
        }
        .selected-filename {
          font-weight: 700;
          color: var(--text-primary);
          font-size: 0.9rem;
        }
        .selected-size {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        @media (max-width: 640px) {
          .form-grid-2 { grid-template-columns: 1fr; }
          .upload-note-card { padding: 1.25rem; }
        }
      `}</style>
    </div>
  );
};
