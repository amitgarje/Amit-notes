import React, { useState, useMemo } from "react";
import { Search, SlidersHorizontal, FileText, Layers, X, Sparkles, Filter, HardDrive, ExternalLink, CloudCheck } from "lucide-react";
import { NoteCard } from "./NoteCard";
import { DEFAULT_SUBJECTS } from "../../config/constants";

export const NotesLibrary = ({
  notes,
  onDownloadClick,
  onRequestUnlock,
  whitelistedFriends = [],
  unlockRequests = [],
  userProfile = null,
  isAdmin = false,
  initialSubject = "All",
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState(initialSubject || "All");
  const [selectedType, setSelectedType] = useState("all"); // 'all' | 'pdf' | 'image'
  const [sortBy, setSortBy] = useState("latest"); // 'latest' | 'downloads' | 'pages' | 'az'
  const [showDriveDetails, setShowDriveDetails] = useState(false);

  // Check if current logged in user is in the VIP Friends Whitelist (e.g. Vishwadeep)
  const isWhitelisted = useMemo(() => {
    if (!userProfile?.phone) return false;
    const cleanUserPhone = userProfile.phone.replace(/\D/g, "");
    return (whitelistedFriends || []).some(
      (f) => f.phone?.replace(/\D/g, "") === cleanUserPhone
    );
  }, [userProfile, whitelistedFriends]);

  React.useEffect(() => {
    if (initialSubject) {
      setSelectedSubject(initialSubject);
    }
  }, [initialSubject]);

  // Extract available subjects from notes or defaults
  const availableSubjects = useMemo(() => {
    const set = new Set(DEFAULT_SUBJECTS);
    notes.forEach((n) => {
      if (n.subject) set.add(n.subject);
    });
    return Array.from(set);
  }, [notes]);

  // Filtered & Sorted Notes
  const filteredNotes = useMemo(() => {
    return notes
      .filter((note) => {
        // Search query filter
        const query = searchQuery.trim().toLowerCase();
        const matchesQuery =
          !query ||
          note.title?.toLowerCase().includes(query) ||
          note.subject?.toLowerCase().includes(query) ||
          note.chapter?.toLowerCase().includes(query) ||
          note.description?.toLowerCase().includes(query);

        // Subject filter
        const matchesSubject =
          selectedSubject === "All" ||
          note.subject?.toLowerCase() === selectedSubject.toLowerCase();

        // Type filter
        const matchesType =
          selectedType === "all" ||
          note.fileType?.toLowerCase() === selectedType.toLowerCase();

        return matchesQuery && matchesSubject && matchesType;
      })
      .sort((a, b) => {
        if (sortBy === "latest") {
          return new Date(b.uploadDate || 0) - new Date(a.uploadDate || 0);
        }
        if (sortBy === "downloads") {
          return (b.downloadCount || 0) - (a.downloadCount || 0);
        }
        if (sortBy === "pages") {
          return (b.pageCount || 0) - (a.pageCount || 0);
        }
        if (sortBy === "az") {
          return (a.title || "").localeCompare(b.title || "");
        }
        return 0;
      });
  }, [notes, searchQuery, selectedSubject, selectedType, sortBy]);

  return (
    <div className="notes-library-section">
      {/* Title & Stats */}
      <div className="library-header">
        <div>
          <div className="library-badge">
            <Layers size={14} />
            <span>Anti-Leak Protected Vault</span>
          </div>
          <h2 className="library-title">Notes Library</h2>
          <p className="library-sub">
            Download verified handwritten lecture notes, formula sheets, and solved question sets.
          </p>
        </div>

        <div className="library-stats-pill">
          <span className="stats-number">{filteredNotes.length}</span>
          <span className="stats-label">
            {filteredNotes.length === 1 ? "Note Available" : "Notes Available"}
          </span>
        </div>
      </div>

      {/* Google Drive Study Section */}
      <div className="google-drive-banner glass-panel">
        <div className="drive-banner-left">
          <div className="drive-banner-icon">
            <HardDrive size={22} className="text-emerald-500" />
          </div>
          <div>
            <div className="drive-banner-title-row">
              <h3 className="drive-banner-heading">Google Drive Study Cloud</h3>
              <span className="drive-badge-tag">100% Free Forever</span>
            </div>
            <p className="drive-banner-sub">
              All PDF study materials are directly hosted on Google Drive (15 GB free cloud, zero storage costs).
              Watermarked downloads stamp your identity in-browser.
            </p>
          </div>
        </div>

        <div className="drive-banner-actions">
          <a
            href="https://drive.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary btn-sm drive-vault-link"
          >
            <HardDrive size={15} />
            <span>Open Google Drive</span>
            <ExternalLink size={13} />
          </a>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="controls-bar glass-panel">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search notes by subject (e.g. BDA, CNS), chapter, title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="search-clear-btn" onClick={() => setSearchQuery("")}>
              <X size={15} />
            </button>
          )}
        </div>

        <div className="sort-box">
          <SlidersHorizontal size={15} className="sort-icon" />
          <select
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="latest">Sort: Newest First</option>
            <option value="downloads">Sort: Most Downloaded</option>
            <option value="pages">Sort: Page Count</option>
            <option value="az">Sort: Title (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Subject Filter Pills */}
      <div className="filter-scroll-container">
        <div className="subject-pills">
          {availableSubjects.map((subj) => (
            <button
              key={subj}
              className={`subject-pill ${selectedSubject === subj ? "active" : ""}`}
              onClick={() => setSelectedSubject(subj)}
            >
              {subj}
            </button>
          ))}
        </div>

        {/* File Type Filter */}
        <div className="file-type-toggle">
          <button
            className={`type-btn ${selectedType === "all" ? "active" : ""}`}
            onClick={() => setSelectedType("all")}
          >
            All Types
          </button>
          <button
            className={`type-btn ${selectedType === "pdf" ? "active" : ""}`}
            onClick={() => setSelectedType("pdf")}
          >
            PDF Only
          </button>
          <button
            className={`type-btn ${selectedType === "image" ? "active" : ""}`}
            onClick={() => setSelectedType("image")}
          >
            Images
          </button>
        </div>
      </div>

      {/* Notes Grid */}
      {filteredNotes.length > 0 ? (
        <div className="notes-grid">
          {filteredNotes.map((note) => {
            const cleanPhone = userProfile?.phone?.replace(/\D/g, "");
            const hasRequestedUnlock = (unlockRequests || []).some(
              (r) => r.noteId === note.id && (r.phone === cleanPhone || r.phone === userProfile?.phone)
            );
            const isApproved = (unlockRequests || []).some(
              (r) =>
                r.noteId === note.id &&
                (r.phone === cleanPhone || r.phone === userProfile?.phone) &&
                r.status === "approved"
            );

            return (
              <NoteCard
                key={note.id}
                note={note}
                onDownloadClick={onDownloadClick}
                onRequestUnlock={onRequestUnlock}
                isWhitelisted={isWhitelisted}
                isApproved={isApproved}
                hasRequestedUnlock={hasRequestedUnlock}
                isAdmin={isAdmin}
              />
            );
          })}
        </div>
      ) : (
        <div className="empty-state glass-panel">
          <div className="empty-icon-wrap">
            <FileText size={36} />
          </div>
          <h3 className="empty-title">No notes match your filters</h3>
          <p className="empty-desc">
            Try searching for a different keyword or resetting your subject filter.
          </p>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setSearchQuery("");
              setSelectedSubject("All");
              setSelectedType("all");
            }}
          >
            Reset Filters
          </button>
        </div>
      )}

      <style>{`
        .notes-library-section {
          margin: 1.5rem 0 3rem 0;
        }
        .library-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        }
        .library-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--primary-500);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.25rem;
        }
        .library-title {
          font-size: 2rem;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -0.02em;
        }
        .library-sub {
          font-size: 0.95rem;
          color: var(--text-secondary);
          margin-top: 0.25rem;
        }
        .library-stats-pill {
          display: flex;
          align-items: baseline;
          gap: 0.4rem;
          background: var(--bg-surface-elevated);
          padding: 0.5rem 1rem;
          border-radius: var(--radius-full);
          border: 1px solid var(--border-subtle);
        }
        .stats-number {
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--primary-500);
        }
        .stats-label {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-muted);
        }
        .google-drive-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.15rem 1.4rem;
          margin-bottom: 1.25rem;
          border-radius: var(--radius-lg);
          border-left: 4px solid #10b981;
          gap: 1rem;
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.06), rgba(99, 102, 241, 0.04));
        }
        .drive-banner-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .drive-banner-icon {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-md);
          background: rgba(16, 185, 129, 0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .drive-banner-title-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .drive-banner-heading {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--text-primary);
        }
        .drive-badge-tag {
          font-size: 0.725rem;
          font-weight: 700;
          color: #10b981;
          background: rgba(16, 185, 129, 0.12);
          border: 1px solid rgba(16, 185, 129, 0.3);
          padding: 2px 7px;
          border-radius: var(--radius-full);
        }
        .drive-banner-sub {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-top: 0.2rem;
          max-width: 650px;
        }
        .drive-vault-link {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          white-space: nowrap;
          text-decoration: none;
        }
        .controls-bar {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem 1.25rem;
          margin-bottom: 1.25rem;
          border-radius: var(--radius-lg);
        }
        .search-box {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          flex: 1;
        }
        .search-icon {
          color: var(--text-muted);
          flex-shrink: 0;
        }
        .search-input {
          width: 100%;
          border: none;
          background: transparent;
          color: var(--text-primary);
          font-size: 0.95rem;
        }
        .search-input::placeholder {
          color: var(--text-muted);
        }
        .search-clear-btn {
          color: var(--text-muted);
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-sm);
        }
        .search-clear-btn:hover {
          color: var(--text-primary);
        }
        .sort-box {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          border-left: 1px solid var(--border-subtle);
          padding-left: 1rem;
          flex-shrink: 0;
        }
        .sort-icon {
          color: var(--text-muted);
        }
        .sort-select {
          border: none;
          background: transparent;
          color: var(--text-primary);
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
        }
        .filter-scroll-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 1.75rem;
          overflow-x: auto;
          padding-bottom: 0.5rem;
        }
        .subject-pills {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-shrink: 0;
        }
        .subject-pill {
          padding: 0.45rem 1rem;
          border-radius: var(--radius-full);
          font-size: 0.85rem;
          font-weight: 600;
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border-subtle);
          color: var(--text-secondary);
          transition: all var(--transition-fast);
          white-space: nowrap;
        }
        .subject-pill:hover {
          color: var(--text-primary);
          border-color: var(--primary-400);
        }
        .subject-pill.active {
          background: var(--primary-gradient);
          color: #ffffff;
          border-color: transparent;
          box-shadow: var(--primary-glow);
        }
        .file-type-toggle {
          display: flex;
          align-items: center;
          background: var(--bg-surface-elevated);
          padding: 0.25rem;
          border-radius: var(--radius-full);
          border: 1px solid var(--border-subtle);
          flex-shrink: 0;
        }
        .type-btn {
          padding: 0.35rem 0.75rem;
          border-radius: var(--radius-full);
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-secondary);
          transition: all var(--transition-fast);
          white-space: nowrap;
        }
        .type-btn.active {
          background: var(--bg-surface);
          color: var(--primary-500);
          box-shadow: var(--shadow-sm);
        }
        .notes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
        }
        .empty-state {
          padding: 4rem 2rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .empty-icon-wrap {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          background: var(--bg-surface-elevated);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          margin-bottom: 1.25rem;
        }
        .empty-title {
          font-size: 1.35rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }
        .empty-desc {
          font-size: 0.95rem;
          color: var(--text-secondary);
          max-width: 420px;
          margin-bottom: 1.5rem;
        }

        @media (max-width: 600px) {
          .notes-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
          .library-title {
            font-size: clamp(1.3rem, 4vw, 1.6rem);
          }
          .library-sub {
            font-size: 0.85rem;
          }
          .library-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.75rem;
          }
          .google-drive-banner {
            flex-direction: column;
            align-items: stretch;
            padding: 1rem;
            gap: 0.85rem;
          }
          .drive-banner-left {
            align-items: flex-start;
          }
          .drive-vault-link {
            width: 100%;
            justify-content: center;
            min-height: 44px;
          }
          .controls-bar {
            flex-direction: column;
            align-items: stretch;
            padding: 0.75rem;
          }
          .sort-box {
            border-left: none;
            padding-left: 0;
            border-top: 1px solid var(--border-subtle);
            padding-top: 0.75rem;
          }
          .filter-scroll-container {
            flex-direction: column;
            align-items: stretch;
            gap: 0.75rem;
          }
          .subject-pills {
            width: 100%;
            overflow-x: auto;
            flex-wrap: nowrap;
            padding-bottom: 0.35rem;
            -webkit-overflow-scrolling: touch;
          }
          .file-type-toggle {
            width: 100%;
            justify-content: center;
          }
          .type-btn {
            flex: 1;
            text-align: center;
            min-height: 40px;
          }
        }
      `}</style>
    </div>
  );
};
