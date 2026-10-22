import React, { useState, useEffect, useMemo } from "react";
import { Download, FileSpreadsheet, Search, RefreshCw, Filter, User, Calendar, ShieldAlert } from "lucide-react";
import { db, isDemoConfig, collection, getDocs, query, orderBy, limit } from "../../config/firebase";
import { useToast } from "../Toast";

export const DownloadLogsTable = () => {
  const { addToast } = useToast();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userQuery, setUserQuery] = useState("");
  const [noteFilter, setNoteFilter] = useState("All");

  // Fetch download logs from Firestore or LocalStorage
  const fetchLogs = async () => {
    setLoading(true);
    let fetched = [];

    // 1. Try fetching from Firestore
    if (!isDemoConfig && db) {
      try {
        const q = query(collection(db, "downloads"), orderBy("timestamp", "desc"), limit(200));
        const snap = await getDocs(q);
        snap.forEach((doc) => {
          const d = doc.data();
          fetched.push({
            id: doc.id,
            name: d.name || "Anonymous",
            phone: d.phone || "—",
            noteTitle: d.noteTitle || "Untitled Note",
            subject: d.subject || "General",
            timestamp: d.timestamp?.toDate
              ? d.timestamp.toDate().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
              : d.formattedTimestamp || new Date().toLocaleString(),
            ip: d.ip || "—",
          });
        });
      } catch (err) {
        console.warn("Could not query Firestore downloads directly, checking local logs:", err);
      }
    }

    // 2. Supplement with local logs if empty or demo
    if (fetched.length === 0) {
      try {
        const local = localStorage.getItem("vault_download_logs");
        if (local) {
          fetched = JSON.parse(local).map((l, i) => ({
            id: `local_${i}`,
            name: l.name,
            phone: l.phone,
            noteTitle: l.noteTitle,
            subject: l.subject,
            timestamp: new Date(l.timestamp).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
            ip: l.ip || "127.0.0.1",
          }));
        }
      } catch {
        fetched = [];
      }
    }

    // Default sample records if still empty
    if (fetched.length === 0) {
      fetched = [
        {
          id: "log_1",
          name: "Siddharth Patil",
          phone: "9823412345",
          noteTitle: "BDA Notes – Chapter 1: Big Data Fundamentals",
          subject: "BDA",
          timestamp: new Date(Date.now() - 3600000).toLocaleString("en-IN"),
          ip: "103.21.244.18",
        },
        {
          id: "log_2",
          name: "Sneha Kulkarni",
          phone: "9988776655",
          noteTitle: "CNS – Chapter 1: Classical Ciphers & DES",
          subject: "CNS",
          timestamp: new Date(Date.now() - 7200000).toLocaleString("en-IN"),
          ip: "157.34.120.9",
        },
        {
          id: "log_3",
          name: "Rohan Deshmukh",
          phone: "9422019876",
          noteTitle: "BDA Notes – Chapter 2: Hadoop Architecture & HDFS",
          subject: "BDA",
          timestamp: new Date(Date.now() - 14400000).toLocaleString("en-IN"),
          ip: "49.36.172.54",
        },
      ];
    }

    setLogs(fetched);
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const q = userQuery.trim().toLowerCase();
      const matchesUser =
        !q ||
        log.name?.toLowerCase().includes(q) ||
        log.phone?.toLowerCase().includes(q) ||
        log.ip?.toLowerCase().includes(q);

      const matchesNote =
        noteFilter === "All" ||
        log.noteTitle?.toLowerCase().includes(noteFilter.toLowerCase()) ||
        log.subject?.toLowerCase() === noteFilter.toLowerCase();

      return matchesUser && matchesNote;
    });
  }, [logs, userQuery, noteFilter]);

  // Export CSV Handler
  const exportToCSV = () => {
    if (filteredLogs.length === 0) {
      addToast("No logs to export.", "warning");
      return;
    }

    const headers = ["Downloader Name", "Phone Number", "Note Title", "Subject", "Timestamp", "IP Address"];
    const rows = filteredLogs.map((l) => [
      `"${(l.name || "").replace(/"/g, '""')}"`,
      `"${l.phone || ""}"`,
      `"${(l.noteTitle || "").replace(/"/g, '""')}"`,
      `"${(l.subject || "").replace(/"/g, '""')}"`,
      `"${l.timestamp || ""}"`,
      `"${l.ip || ""}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `AmitNotes_Vault_Download_Audit_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast(`Exported ${filteredLogs.length} download records to CSV!`, "success");
  };

  return (
    <div className="logs-table-section">
      <div className="logs-header">
        <div>
          <div className="logs-badge">
            <ShieldAlert size={14} />
            <span>Traceability Audit Log</span>
          </div>
          <h3 className="logs-title">Download Activity Records</h3>
          <p className="logs-sub">
            Real-time server log of every student who unlocked and downloaded watermarked notes.
          </p>
        </div>

        <div className="logs-actions">
          <button className="btn btn-secondary btn-sm" onClick={fetchLogs} title="Refresh Logs">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>
          <button className="btn btn-primary btn-sm" onClick={exportToCSV}>
            <FileSpreadsheet size={15} />
            <span>Export to CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="logs-filter-bar glass-panel">
        <div className="filter-input-wrap">
          <Search size={16} className="text-muted" />
          <input
            type="text"
            className="filter-input"
            placeholder="Search by student name, phone number, or IP..."
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
          />
        </div>

        <div className="filter-count">
          Showing <strong>{filteredLogs.length}</strong> of {logs.length} downloads
        </div>
      </div>

      {/* Table */}
      <div className="table-responsive glass-panel">
        <table className="audit-table">
          <thead>
            <tr>
              <th>Downloader</th>
              <th>Mobile Number</th>
              <th>Note Downloaded</th>
              <th>Subject</th>
              <th>Timestamp</th>
              <th>Client IP</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log) => (
                <tr key={log.id}>
                  <td className="user-name-cell">
                    <span className="user-name">{log.name}</span>
                  </td>
                  <td className="phone-cell">
                    <code>+91 {log.phone}</code>
                  </td>
                  <td className="note-title-cell">{log.noteTitle}</td>
                  <td>
                    <span className="badge badge-subject">{log.subject}</span>
                  </td>
                  <td className="timestamp-cell">{log.timestamp}</td>
                  <td className="ip-cell">{log.ip}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="empty-logs">
                  {loading ? "Loading audit logs..." : "No matching download records found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Stacked Card View (< 600px) */}
      <div className="mobile-logs-cards">
        {filteredLogs.length > 0 ? (
          filteredLogs.map((log) => (
            <div key={log.id} className="mobile-log-card glass-panel">
              <div className="mobile-log-top">
                <span className="user-name">{log.name}</span>
                <span className="badge badge-subject">{log.subject}</span>
              </div>
              <div className="mobile-log-title">{log.noteTitle}</div>
              <div className="mobile-log-meta">
                <span className="phone-tag"><code>+91 {log.phone}</code></span>
                <span className="time-tag">{log.timestamp}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-logs">No records found.</div>
        )}
      </div>

      <style>{`
        .mobile-logs-cards {
          display: none;
          flex-direction: column;
          gap: 0.85rem;
        }
        .logs-table-section {
          margin-bottom: 2rem;
        }
        .logs-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 1.25rem;
          flex-wrap: wrap;
        }
        .logs-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.78rem;
          font-weight: 700;
          color: var(--primary-500);
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin-bottom: 0.35rem;
        }
        .logs-title {
          font-size: 1.45rem;
          font-weight: 800;
          color: var(--text-primary);
        }
        .logs-sub {
          font-size: 0.88rem;
          color: var(--text-muted);
          margin-top: 0.2rem;
        }
        .logs-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .logs-filter-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 1.25rem;
          border-radius: var(--radius-md);
          margin-bottom: 1rem;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .filter-input-wrap {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          flex: 1;
          min-width: 250px;
        }
        .filter-input {
          border: none;
          background: transparent;
          color: var(--text-primary);
          font-size: 0.9rem;
          width: 100%;
        }
        .filter-count {
          font-size: 0.825rem;
          color: var(--text-muted);
        }
        .table-responsive {
          overflow-x: auto;
          border-radius: var(--radius-lg);
        }
        .audit-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }
        .audit-table th {
          background: var(--bg-surface-elevated);
          padding: 0.85rem 1rem;
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.04em;
          border-bottom: 1px solid var(--border-subtle);
        }
        .audit-table td {
          padding: 0.95rem 1rem;
          border-bottom: 1px solid var(--border-card);
          font-size: 0.88rem;
        }
        .audit-table tr:hover td {
          background: rgba(99, 102, 241, 0.03);
        }
        .audit-table tr:last-child td {
          border-bottom: none;
        }
        .user-name-cell {
          font-weight: 700;
          color: var(--text-primary);
        }
        .phone-cell code {
          background: var(--bg-surface-elevated);
          padding: 2px 6px;
          border-radius: 4px;
          color: var(--primary-500);
          font-weight: 600;
        }
        .note-title-cell {
          color: var(--text-secondary);
          font-weight: 500;
          max-width: 280px;
        }
        .timestamp-cell {
          color: var(--text-muted);
          font-size: 0.82rem;
          white-space: nowrap;
        }
        .ip-cell {
          color: var(--text-muted);
          font-family: monospace;
          font-size: 0.8rem;
        }
        .empty-logs {
          text-align: center;
          padding: 3rem !important;
          color: var(--text-muted);
        }

        @media (max-width: 600px) {
          .table-responsive { display: none; }
          .mobile-logs-cards { display: flex; }
          .mobile-log-card {
            padding: 1rem 1.15rem;
            display: flex;
            flex-direction: column;
            gap: 0.4rem;
          }
          .mobile-log-top {
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          .mobile-log-title {
            font-size: 0.9rem;
            font-weight: 600;
            color: var(--text-primary);
          }
          .mobile-log-meta {
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 0.78rem;
            color: var(--text-muted);
            margin-top: 0.35rem;
            padding-top: 0.35rem;
            border-top: 1px solid var(--border-subtle);
          }
        }
      `}</style>
    </div>
  );
};
