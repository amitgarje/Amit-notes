import React, { useState } from "react";
import { Lock, Unlock, CheckCircle2, XCircle, Clock, Search, UserCheck, ShieldAlert, FileText, CheckCheck } from "lucide-react";
import { useToast } from "../Toast";

export const AccessRequestsManager = ({
  unlockRequests = [],
  onApproveRequest,
  onRejectRequest,
  onApproveAll,
}) => {
  const { addToast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("pending"); // 'all' | 'pending' | 'approved' | 'rejected'

  const filtered = unlockRequests.filter((req) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesQ =
      !q ||
      req.name?.toLowerCase().includes(q) ||
      req.phone?.toLowerCase().includes(q) ||
      req.noteTitle?.toLowerCase().includes(q);

    const matchesStatus = filterStatus === "all" || req.status === filterStatus;
    return matchesQ && matchesStatus;
  });

  const pendingCount = unlockRequests.filter((r) => r.status === "pending").length;

  return (
    <div className="access-requests-section glass-panel">
      {/* Top Banner */}
      <div className="requests-banner">
        <div className="banner-icon-wrap">
          <Lock size={26} />
        </div>
        <div>
          <div className="banner-title-row">
            <h3 className="requests-title">Note Unlock & Access Requests</h3>
            {pendingCount > 0 && (
              <span className="badge badge-in-progress">
                {pendingCount} Pending Approval{pendingCount > 1 ? "s" : ""}
              </span>
            )}
          </div>
          <p className="requests-sub">
            Students who are not on the Friends Whitelist must request access to view & download locked
            notes. You can approve or decline their access below.
          </p>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="requests-controls">
        <div className="search-wrap">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="input-field with-icon"
            placeholder="Search by student name, phone number, or note title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-status-group">
          {["pending", "approved", "rejected", "all"].map((st) => (
            <button
              key={st}
              className={`filter-btn ${filterStatus === st ? "active" : ""}`}
              onClick={() => setFilterStatus(st)}
            >
              {st.charAt(0).toUpperCase() + st.slice(1)}
              {st === "pending" && pendingCount > 0 && ` (${pendingCount})`}
            </button>
          ))}
        </div>

        {pendingCount > 0 && onApproveAll && (
          <button
            className="btn btn-primary btn-sm approve-all-btn"
            onClick={() => {
              onApproveAll();
              addToast(`Approved all ${pendingCount} pending requests!`, "success");
            }}
          >
            <CheckCheck size={16} />
            <span>Approve All Pending ({pendingCount})</span>
          </button>
        )}
      </div>

      {/* Requests Table / Cards */}
      <div className="requests-list">
        {filtered.length > 0 ? (
          filtered.map((req) => (
            <div key={req.id} className={`request-card glass-panel status-${req.status}`}>
              <div className="req-card-left">
                <div className="req-avatar">
                  <UserCheck size={20} />
                </div>
                <div className="req-details">
                  <div className="req-name-row">
                    <h4 className="req-name">{req.name}</h4>
                    <span className="req-phone">+91 {req.phone}</span>
                    <span className={`badge badge-${req.status === "approved" ? "done" : req.status === "pending" ? "in-progress" : "planned"}`}>
                      {req.status}
                    </span>
                  </div>

                  <div className="req-note-info">
                    <FileText size={14} className="text-primary-500" />
                    <span className="req-note-title">Requested Note: <strong>{req.noteTitle}</strong></span>
                    {req.subject && <span className="badge badge-subject">{req.subject}</span>}
                  </div>

                  <div className="req-timestamp">
                    <Clock size={12} />
                    <span>Requested: {new Date(req.requestedAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="req-actions">
                {req.status === "pending" ? (
                  <>
                    <button
                      className="btn btn-primary btn-sm approve-btn"
                      onClick={() => {
                        onApproveRequest(req.id, req);
                        addToast(`Approved access for ${req.name}!`, "success");
                      }}
                    >
                      <CheckCircle2 size={16} />
                      <span>Approve</span>
                    </button>

                    <button
                      className="btn btn-secondary btn-sm decline-btn"
                      onClick={() => {
                        onRejectRequest(req.id, req);
                        addToast(`Declined request from ${req.name}.`, "info");
                      }}
                    >
                      <XCircle size={16} />
                      <span>Decline</span>
                    </button>
                  </>
                ) : req.status === "approved" ? (
                  <div className="approved-badge-box">
                    <CheckCircle2 size={16} className="text-emerald-500" />
                    <span>Access Granted</span>
                  </div>
                ) : (
                  <div className="declined-badge-box">
                    <XCircle size={16} className="text-rose-500" />
                    <span>Declined</span>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="empty-requests-state">
            <Lock size={44} className="text-muted" />
            <h4 className="font-bold">No {filterStatus !== "all" ? filterStatus : ""} requests found</h4>
            <p className="text-sm text-muted">
              {filterStatus === "pending"
                ? "All clear! There are currently no pending student unlock requests."
                : "No matching access requests match the filter criteria."}
            </p>
          </div>
        )}
      </div>

      <style>{`
        .access-requests-section {
          padding: 1.75rem;
          margin-bottom: 2rem;
        }
        .requests-banner {
          display: flex;
          align-items: flex-start;
          gap: 1.25rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid var(--border-subtle);
          margin-bottom: 1.5rem;
        }
        .banner-icon-wrap {
          width: 52px;
          height: 52px;
          border-radius: var(--radius-lg);
          background: rgba(99, 102, 241, 0.15);
          color: var(--primary-500);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .banner-title-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        .requests-title {
          font-size: 1.35rem;
          font-weight: 800;
          color: var(--text-primary);
        }
        .requests-sub {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin-top: 0.25rem;
          line-height: 1.5;
        }
        .requests-controls {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        }
        .search-wrap {
          flex: 1;
          min-width: 260px;
          position: relative;
        }
        .search-wrap .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }
        .search-wrap .input-field {
          padding-left: 2.35rem;
        }
        .filter-status-group {
          display: flex;
          align-items: center;
          background: var(--bg-surface-elevated);
          padding: 0.25rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-subtle);
        }
        .filter-btn {
          padding: 0.35rem 0.85rem;
          border-radius: var(--radius-sm);
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-secondary);
          transition: all var(--transition-fast);
        }
        .filter-btn.active {
          background: var(--bg-surface);
          color: var(--primary-500);
          box-shadow: var(--shadow-sm);
        }
        .requests-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .request-card {
          padding: 1.25rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-radius: var(--radius-lg);
          gap: 1rem;
          transition: transform var(--transition-fast);
        }
        .request-card.status-pending {
          border-left: 4px solid var(--primary-500);
        }
        .request-card.status-approved {
          border-left: 4px solid #10b981;
        }
        .request-card.status-rejected {
          border-left: 4px solid #ef4444;
          opacity: 0.7;
        }
        .req-card-left {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          flex: 1;
        }
        .req-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: var(--bg-surface-elevated);
          color: var(--text-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .req-details {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .req-name-row {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          flex-wrap: wrap;
        }
        .req-name {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--text-primary);
        }
        .req-phone {
          font-size: 0.85rem;
          font-family: monospace;
          color: var(--text-muted);
        }
        .req-note-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          color: var(--text-secondary);
        }
        .req-timestamp {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.775rem;
          color: var(--text-muted);
        }
        .req-actions {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          flex-shrink: 0;
        }
        .approve-btn {
          background: #10b981 !important;
          color: #ffffff !important;
        }
        .approve-btn:hover {
          filter: brightness(1.1);
        }
        .approved-badge-box, .declined-badge-box {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.85rem;
          font-weight: 700;
        }
        .approved-badge-box {
          color: #10b981;
        }
        .declined-badge-box {
          color: #ef4444;
        }
        .empty-requests-state {
          padding: 3rem 1.5rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.65rem;
        }

        @media (max-width: 768px) {
          .access-requests-section { padding: 1.15rem; }
          .request-card { flex-direction: column; align-items: stretch; }
          .req-actions { width: 100%; justify-content: flex-end; }
          .approve-btn, .decline-btn { flex: 1; }
        }
      `}</style>
    </div>
  );
};
