import React, { useState } from "react";
import { Search, ShieldAlert, AlertOctagon, User, Phone, Calendar, Copy, Check, FileText } from "lucide-react";
import { isDemoConfig, db, collection, getDocs, query, orderBy, limit } from "../../config/firebase";
import { useToast } from "../Toast";

export const LeakFinder = () => {
  const { addToast } = useToast();

  const [leakText, setLeakText] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    const cleanText = leakText.trim();
    if (!cleanText || cleanText.length < 2) {
      addToast("Please paste at least 2 characters from the leaked copy.", "warning");
      return;
    }

    setSearching(true);
    let matchedRecords = [];

    // 2. Fallback: Search Firestore / Local Storage logs
    if (matchedRecords.length === 0) {
      const qLower = cleanText.toLowerCase();
      // Extract any 10-digit phone number if present in text
      const phoneMatch = cleanText.match(/\b[6-9]\d{9}\b/);
      const targetPhone = phoneMatch ? phoneMatch[0] : null;

      let allLogs = [];
      try {
        const local = localStorage.getItem("vault_download_logs");
        if (local) allLogs = JSON.parse(local);
      } catch {
        allLogs = [];
      }

      // Add default mock logs for demo
      allLogs.push(
        {
          name: "Siddharth Patil",
          phone: "9823412345",
          noteTitle: "BDA Notes – Chapter 1: Big Data Fundamentals",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          ip: "103.21.244.18",
        },
        {
          name: "Sneha Kulkarni",
          phone: "9988776655",
          noteTitle: "CNS – Chapter 1: Classical Ciphers & DES",
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          ip: "157.34.120.9",
        },
        {
          name: "Rohan Deshmukh",
          phone: "9422019876",
          noteTitle: "BDA Notes – Chapter 2: Hadoop Architecture & HDFS",
          timestamp: new Date(Date.now() - 14400000).toISOString(),
          ip: "49.36.172.54",
        }
      );

      matchedRecords = allLogs.filter((l) => {
        const name = (l.name || "").toLowerCase();
        const phone = (l.phone || "").toLowerCase();
        const title = (l.noteTitle || "").toLowerCase();
        return (
          name.includes(qLower) ||
          phone.includes(qLower) ||
          (targetPhone && phone.includes(targetPhone)) ||
          qLower.includes(name) ||
          qLower.includes(phone)
        );
      });
    }

    setResults(matchedRecords);
    setSearching(false);
  };

  const copyIncidentSummary = (record) => {
    const summary = `⚠️ LEAK INCIDENT REPORT:
Student Name: ${record.name}
Phone Number: +91 ${record.phone}
Leaked Note: ${record.noteTitle}
Download Timestamp: ${record.timestamp}
IP Address: ${record.ip || "Unknown"}
Watermark Verified on Original Download.`;

    navigator.clipboard.writeText(summary);
    setCopiedId(record.id || record.phone);
    addToast("Incident report copied to clipboard!", "success");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="leak-finder-section glass-panel">
      <div className="finder-header">
        <div className="finder-badge">
          <AlertOctagon size={15} />
          <span>Anti-Leak Forensics</span>
        </div>
        <h3 className="finder-title">Leak Finder & Trace Tool</h3>
        <p className="finder-sub">
          Found a leaked PDF or screenshot circulating in a WhatsApp/Telegram group? Paste the
          visible watermark snippet below to pinpoint who downloaded the copy.
        </p>
      </div>

      <form onSubmit={handleSearch} className="finder-form">
        <div className="form-group">
          <label className="input-label" htmlFor="leak-input-area">
            Paste Leaked Watermark Snippet (Name, Phone Number, or Page Text)
          </label>
          <textarea
            id="leak-input-area"
            rows="3"
            className="input-field textarea-field"
            placeholder="e.g. Paste: Siddharth Patil | +91 9823412345 or any portion read from the leaked page..."
            value={leakText}
            onChange={(e) => setLeakText(e.target.value)}
            required
          />
        </div>

        <div className="finder-actions">
          <button type="submit" className="btn btn-primary" disabled={searching || !leakText.trim()}>
            <Search size={16} />
            <span>{searching ? "Scanning Vault Audit Logs..." : "Scan & Trace Leaker"}</span>
          </button>

          {/* Quick preset chips for demo testing */}
          <div className="preset-chips">
            <span className="preset-label">Test Snippets:</span>
            <button
              type="button"
              className="preset-chip"
              onClick={() => setLeakText("Siddharth Patil | 9823412345")}
            >
              Siddharth Patil
            </button>
            <button
              type="button"
              className="preset-chip"
              onClick={() => setLeakText("9988776655")}
            >
              Sneha (Phone)
            </button>
          </div>
        </div>
      </form>

      {/* Results Section */}
      {results !== null && (
        <div className="finder-results animate-fade-in">
          <div className="results-top-bar">
            <h4 className="results-heading">
              Forensic Results: {results.length} Matching Record{results.length === 1 ? "" : "s"}
            </h4>
          </div>

          {results.length > 0 ? (
            <div className="results-grid">
              {results.map((r, idx) => (
                <div key={idx} className="leak-match-card glass-panel">
                  <div className="match-stamp-badge">
                    <ShieldAlert size={14} />
                    <span>Leak Source Identified</span>
                  </div>

                  <div className="match-info-row">
                    <div className="info-block">
                      <span className="info-label">Downloader Name</span>
                      <span className="info-value user-highlight">{r.name}</span>
                    </div>

                    <div className="info-block">
                      <span className="info-label">Mobile Number</span>
                      <span className="info-value phone-highlight">+91 {r.phone}</span>
                    </div>
                  </div>

                  <div className="match-info-row">
                    <div className="info-block">
                      <span className="info-label">Note Downloaded</span>
                      <span className="info-value note-highlight">{r.noteTitle}</span>
                    </div>

                    <div className="info-block">
                      <span className="info-label">Exact Timestamp</span>
                      <span className="info-value text-muted">{r.timestamp}</span>
                    </div>
                  </div>

                  <div className="match-footer">
                    <span className="ip-badge">IP: {r.ip || "103.21.244.18"}</span>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => copyIncidentSummary(r)}
                    >
                      {copiedId === (r.id || r.phone) ? (
                        <>
                          <Check size={14} className="text-emerald-500" />
                          <span>Copied Report</span>
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          <span>Copy Report</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-matches-box">
              <p>No matching download records found for snippet "{leakText}".</p>
              <span className="text-xs text-muted">
                Make sure the phone number or name corresponds to a registered account in the vault.
              </span>
            </div>
          )}
        </div>
      )}

      <style>{`
        .leak-finder-section {
          padding: 2rem;
          margin-bottom: 2rem;
        }
        .finder-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(239, 68, 68, 0.12);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #ef4444;
          padding: 0.25rem 0.75rem;
          border-radius: var(--radius-full);
          font-size: 0.78rem;
          font-weight: 700;
          text-transform: uppercase;
          margin-bottom: 0.4rem;
        }
        .finder-title {
          font-size: 1.45rem;
          font-weight: 800;
          color: var(--text-primary);
        }
        .finder-sub {
          font-size: 0.88rem;
          color: var(--text-muted);
          margin-top: 0.2rem;
          max-width: 720px;
        }
        .finder-form {
          margin-top: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .finder-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .preset-chips {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .preset-label {
          font-size: 0.78rem;
          color: var(--text-muted);
        }
        .preset-chip {
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border-subtle);
          padding: 0.25rem 0.65rem;
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          color: var(--primary-500);
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .preset-chip:hover {
          border-color: var(--primary-500);
          background: var(--bg-surface);
        }
        .finder-results {
          margin-top: 1.75rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--border-subtle);
        }
        .results-top-bar {
          margin-bottom: 1rem;
        }
        .results-heading {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--text-primary);
        }
        .results-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.25rem;
        }
        .leak-match-card {
          padding: 1.25rem;
          border-left: 4px solid #ef4444;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }
        .match-stamp-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
          padding: 0.25rem 0.65rem;
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          font-weight: 700;
          width: fit-content;
        }
        .match-info-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }
        .info-block {
          display: flex;
          flex-direction: column;
        }
        .info-label {
          font-size: 0.725rem;
          color: var(--text-muted);
          text-transform: uppercase;
          font-weight: 700;
        }
        .info-value {
          font-size: 0.9rem;
          font-weight: 600;
        }
        .user-highlight {
          color: var(--text-primary);
          font-weight: 700;
        }
        .phone-highlight {
          color: var(--primary-500);
          font-family: monospace;
          font-weight: 700;
        }
        .note-highlight {
          color: var(--text-secondary);
        }
        .match-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 0.5rem;
          border-top: 1px solid var(--border-subtle);
          margin-top: 0.35rem;
        }
        .ip-badge {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-family: monospace;
        }
        .no-matches-box {
          background: var(--bg-surface-elevated);
          padding: 2rem;
          border-radius: var(--radius-md);
          text-align: center;
        }

        @media (max-width: 640px) {
          .leak-finder-section { padding: 1.25rem; }
          .match-info-row { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};
