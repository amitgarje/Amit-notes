import React, { useState } from "react";
import { Calendar, CheckCircle2, Clock, CircleDot, Edit3, Filter } from "lucide-react";

export const WeeklyPlanTable = ({ weeklyPlan, onEditClick, isAdmin }) => {
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredPlan = (weeklyPlan || []).filter((item) => {
    if (statusFilter === "All") return true;
    return item.status.toLowerCase() === statusFilter.toLowerCase();
  });

  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case "done":
        return (
          <span className="badge badge-done">
            <CheckCircle2 size={12} />
            <span>Done</span>
          </span>
        );
      case "in progress":
        return (
          <span className="badge badge-in-progress">
            <CircleDot size={12} className="animate-pulse" />
            <span>In progress</span>
          </span>
        );
      default:
        return (
          <span className="badge badge-planned">
            <Clock size={12} />
            <span>Planned</span>
          </span>
        );
    }
  };

  return (
    <div className="weekly-plan-section">
      <div className="section-header">
        <div>
          <div className="section-badge">
            <Calendar size={14} />
            <span>Weekly Roadmap</span>
          </div>
          <h3 className="section-title">Preparation Schedule</h3>
        </div>

        <div className="header-actions">
          {/* Status Filters */}
          <div className="filter-pill-group">
            {["All", "In progress", "Planned", "Done"].map((s) => (
              <button
                key={s}
                className={`filter-pill ${statusFilter === s ? "active" : ""}`}
                onClick={() => setStatusFilter(s)}
              >
                {s}
              </button>
            ))}
          </div>

          {isAdmin && (
            <button className="btn btn-secondary btn-sm" onClick={onEditClick}>
              <Edit3 size={14} />
              <span>Edit Weekly Schedule</span>
            </button>
          )}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="table-container glass-panel">
        <table className="plan-table">
          <thead>
            <tr>
              <th>Day</th>
              <th>Subject</th>
              <th>Chapter / Focus Topic</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredPlan.length > 0 ? (
              filteredPlan.map((item, idx) => (
                <tr key={idx} className={`status-row-${item.status.toLowerCase().replace(/\s+/g, "-")}`}>
                  <td className="day-cell">
                    <span className="day-name">{item.day}</span>
                  </td>
                  <td>
                    <span className="badge badge-subject">{item.subject}</span>
                  </td>
                  <td className="chapter-cell">
                    <span className="chapter-text">{item.chapter}</span>
                  </td>
                  <td>{getStatusBadge(item.status)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="empty-cell">
                  No topics found for the selected status filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="mobile-plan-cards">
        {filteredPlan.map((item, idx) => (
          <div key={idx} className="mobile-plan-card glass-panel">
            <div className="mobile-card-top">
              <span className="mobile-day">{item.day}</span>
              {getStatusBadge(item.status)}
            </div>
            <div className="mobile-card-subject">
              <span className="badge badge-subject">{item.subject}</span>
            </div>
            <div className="mobile-card-chapter">{item.chapter}</div>
          </div>
        ))}
      </div>

      <style>{`
        .weekly-plan-section {
          margin-bottom: 3rem;
        }
        .section-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 1.25rem;
          flex-wrap: wrap;
        }
        .section-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.25rem;
        }
        .section-title {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--text-primary);
        }
        .header-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        .filter-pill-group {
          display: flex;
          align-items: center;
          background: var(--bg-surface-elevated);
          padding: 0.25rem;
          border-radius: var(--radius-full);
          border: 1px solid var(--border-subtle);
        }
        .filter-pill {
          padding: 0.35rem 0.75rem;
          border-radius: var(--radius-full);
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-secondary);
          transition: all var(--transition-fast);
        }
        .filter-pill.active {
          background: var(--bg-surface);
          color: var(--primary-500);
          box-shadow: var(--shadow-sm);
        }
        .table-container {
          overflow-x: auto;
          border-radius: var(--radius-lg);
        }
        .plan-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }
        .plan-table th {
          background: var(--bg-surface-elevated);
          padding: 1rem 1.25rem;
          font-size: 0.825rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.04em;
          border-bottom: 1px solid var(--border-subtle);
        }
        .plan-table td {
          padding: 1.1rem 1.25rem;
          border-bottom: 1px solid var(--border-card);
          font-size: 0.925rem;
          transition: background-color var(--transition-fast);
        }
        .plan-table tr:hover td {
          background: rgba(99, 102, 241, 0.03);
        }
        .plan-table tr:last-child td {
          border-bottom: none;
        }
        .day-cell {
          font-weight: 700;
          color: var(--text-primary);
        }
        .chapter-cell {
          color: var(--text-secondary);
          font-weight: 500;
        }
        .empty-cell {
          text-align: center;
          padding: 2.5rem !important;
          color: var(--text-muted);
        }
        .mobile-plan-cards {
          display: none;
          flex-direction: column;
          gap: 0.85rem;
        }

        @media (max-width: 600px) {
          .table-container { display: none; }
          .mobile-plan-cards { display: flex; }
          .mobile-plan-card {
            padding: 1.25rem;
          }
          .mobile-card-top {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 0.6rem;
          }
          .mobile-day {
            font-weight: 800;
            font-size: 1.05rem;
            color: var(--text-primary);
          }
          .mobile-card-subject {
            margin-bottom: 0.5rem;
          }
          .mobile-card-chapter {
            font-size: 0.95rem;
            color: var(--text-secondary);
            font-weight: 500;
          }
        }
      `}</style>
    </div>
  );
};
