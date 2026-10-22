import React from "react";
import { Sparkles, BookOpen, Clock, Edit3, ArrowRight } from "lucide-react";

export const TodayStudyPlan = ({ todayPlan, onEditClick, isAdmin, onBrowseNotes }) => {
  return (
    <div className="today-plan-card glass-panel">
      <div className="card-top-bar">
        <div className="card-badge">
          <span className="pulse-dot"></span>
          <span>Today's Study Plan</span>
        </div>
        {isAdmin && (
          <button className="btn btn-secondary btn-sm" onClick={onEditClick}>
            <Edit3 size={14} />
            <span>Edit Plan</span>
          </button>
        )}
      </div>

      <div className="today-plan-body">
        <div className="subject-icon-box">
          <BookOpen size={28} />
        </div>

        <div className="today-plan-info">
          <h2 className="today-headline">
            {todayPlan?.title || "Amit is preparing today: BDA – Chapter 1"}
          </h2>

          <p className="today-subtext">
            {todayPlan?.notes || "Focusing on distributed storage architecture, block replication, and MapReduce optimization."}
          </p>

          <div className="today-meta-row">
            <span className="badge badge-subject">
              {todayPlan?.subject || "BDA"} • {todayPlan?.subjectFull || "Big Data Analytics"}
            </span>
            <span className="badge badge-in-progress">In Progress (Today • 22 Oct)</span>
            <span className="meta-timestamp">
              <Clock size={13} />
              <span>Target Exam: 17 Nov 2026</span>
            </span>
          </div>
        </div>

        <div className="today-action">
          <button className="btn btn-primary btn-sm" onClick={onBrowseNotes}>
            <span>View Notes</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>

      <style>{`
        .today-plan-card {
          margin: 1.5rem 0 2rem 0;
          padding: 1.75rem 2rem;
          border-left: 5px solid var(--primary-500);
          position: relative;
          overflow: hidden;
        }
        .today-plan-card::after {
          content: '';
          position: absolute;
          top: -30%;
          right: -10%;
          width: 250px;
          height: 250px;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%);
          pointer-events: none;
        }
        .card-top-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.25rem;
        }
        .card-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(99, 102, 241, 0.12);
          color: var(--primary-500);
          padding: 0.35rem 0.85rem;
          border-radius: var(--radius-full);
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.03em;
          text-transform: uppercase;
        }
        .pulse-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--primary-500);
          box-shadow: 0 0 10px var(--primary-500);
          animation: pulseGlow 1.8s infinite ease-in-out;
        }
        .today-plan-body {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }
        .subject-icon-box {
          width: 60px;
          height: 60px;
          border-radius: var(--radius-lg);
          background: var(--primary-gradient);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: var(--primary-glow);
        }
        .today-plan-info {
          flex: 1;
        }
        .today-headline {
          font-size: 1.45rem;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 0.4rem;
          letter-spacing: -0.01em;
        }
        .today-subtext {
          font-size: 0.95rem;
          color: var(--text-secondary);
          margin-bottom: 0.85rem;
          max-width: 650px;
        }
        .today-meta-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        .meta-timestamp {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.8rem;
          color: var(--text-muted);
        }
        .today-action {
          flex-shrink: 0;
        }

        @media (max-width: 768px) {
          .today-plan-card {
            padding: 1.25rem 1.25rem;
          }
          .today-plan-body {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
          .subject-icon-box {
            display: none;
          }
          .today-action {
            width: 100%;
          }
          .today-action .btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};
