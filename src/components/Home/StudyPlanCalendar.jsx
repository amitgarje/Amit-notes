import React, { useState, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  CircleDot,
  Flame,
  Trophy,
  Edit3,
  List,
  Grid3X3,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import { SUBJECT_DETAILS, EXAM_DEADLINE_DATE } from "../../config/constants";

export const StudyPlanCalendar = ({ schedule, onEditClick, isAdmin, onSelectSubject }) => {
  const [selectedMonth, setSelectedMonth] = useState("all"); // 'all' | 'oct' | 'nov'
  const [viewMode, setViewMode] = useState("calendar"); // 'calendar' | 'timeline'
  const [activeDateModal, setActiveDateModal] = useState(null);

  // Calculate days remaining to 17 Nov exam
  const daysUntilExam = useMemo(() => {
    const today = new Date("2026-10-22");
    const examDate = new Date(EXAM_DEADLINE_DATE);
    const diffTime = examDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, []);

  // Filter schedule by selected month
  const filteredSchedule = useMemo(() => {
    return (schedule || []).filter((item) => {
      if (selectedMonth === "oct") return item.date.startsWith("2026-10");
      if (selectedMonth === "nov") return item.date.startsWith("2026-11");
      return true;
    });
  }, [schedule, selectedMonth]);

  // Statistics
  const stats = useMemo(() => {
    const list = schedule || [];
    const done = list.filter((i) => i.status?.toLowerCase() === "done").length;
    const inProgress = list.filter((i) => i.status?.toLowerCase() === "in progress").length;
    const planned = list.filter((i) => i.status?.toLowerCase() === "planned").length;
    return { done, inProgress, planned, total: list.length };
  }, [schedule]);

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "done":
        return <CheckCircle2 size={13} className="text-emerald-500" />;
      case "in progress":
        return <CircleDot size={13} className="text-indigo-400 animate-pulse" />;
      default:
        return <Clock size={13} className="text-amber-500" />;
    }
  };

  return (
    <div className="study-calendar-section">
      {/* EXAM COUNTDOWN HERO BAR */}
      <div className="exam-countdown-card glass-panel">
        <div className="countdown-left">
          <div className="countdown-icon-wrap">
            <Trophy size={28} />
          </div>
          <div>
            <div className="countdown-tag">
              <Flame size={14} className="text-rose-500" />
              <span>Target Milestone • 17 November 2026</span>
            </div>
            <h3 className="countdown-title">Final Semester Exam Roadmap</h3>
            <p className="countdown-sub">
              Targeted preparation from <strong>22 Oct</strong> to <strong>17 Nov</strong> covering BDA,
              ML, BC, NLP, and MIS.
            </p>
          </div>
        </div>

        <div className="countdown-timer-box">
          <div className="timer-number">{daysUntilExam}</div>
          <div className="timer-label">Days to Exam</div>
          <div className="timer-progress-bar">
            <div
              className="timer-progress-fill"
              style={{
                width: `${Math.round(((stats.total - daysUntilExam) / stats.total) * 100)}%`,
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* CONTROLS & SUBJECT LEGEND BAR */}
      <div className="calendar-controls-bar glass-panel">
        {/* Subject Color Legend */}
        <div className="subject-legend">
          <span className="legend-title">Subjects:</span>
          {Object.entries(SUBJECT_DETAILS).map(([key, info]) => (
            <div
              key={key}
              className="legend-pill"
              style={{
                backgroundColor: info.bg,
                borderColor: info.border,
                color: info.color,
              }}
              title={info.name}
              onClick={() => onSelectSubject && onSelectSubject(key)}
            >
              <span className="legend-dot" style={{ backgroundColor: info.color }} />
              <span className="legend-code">{info.code}</span>
              <span className="legend-fullname">({info.name.split(" ")[0]})</span>
            </div>
          ))}
        </div>

        {/* View & Month Toggles */}
        <div className="controls-right">
          {/* Month Filter */}
          <div className="filter-pill-group">
            <button
              className={`filter-pill ${selectedMonth === "all" ? "active" : ""}`}
              onClick={() => setSelectedMonth("all")}
            >
              All Days ({stats.total})
            </button>
            <button
              className={`filter-pill ${selectedMonth === "oct" ? "active" : ""}`}
              onClick={() => setSelectedMonth("oct")}
            >
              Oct (10)
            </button>
            <button
              className={`filter-pill ${selectedMonth === "nov" ? "active" : ""}`}
              onClick={() => setSelectedMonth("nov")}
            >
              Nov (17)
            </button>
          </div>

          {/* Grid vs Timeline Toggle */}
          <div className="view-mode-toggle">
            <button
              className={`view-btn ${viewMode === "calendar" ? "active" : ""}`}
              onClick={() => setViewMode("calendar")}
              title="Calendar Grid View"
            >
              <Grid3X3 size={16} />
            </button>
            <button
              className={`view-btn ${viewMode === "timeline" ? "active" : ""}`}
              onClick={() => setViewMode("timeline")}
              title="Timeline List View"
            >
              <List size={16} />
            </button>
          </div>

          {isAdmin && (
            <button className="btn btn-secondary btn-sm" onClick={onEditClick}>
              <Edit3 size={14} />
              <span>Edit Roadmap</span>
            </button>
          )}
        </div>
      </div>

      {/* VIEW MODE 1: CALENDAR GRID */}
      {viewMode === "calendar" ? (
        <div className="calendar-grid">
          {filteredSchedule.map((item, idx) => {
            const isToday = item.date === "2026-10-22";
            const isExam = item.subject === "EXAM";
            const subj = SUBJECT_DETAILS[item.subject] || SUBJECT_DETAILS.BDA;
            const parsedDate = new Date(item.date);
            const dateNum = parsedDate.getDate();
            const monthStr = parsedDate.toLocaleString("en-US", { month: "short" });

            return (
              <div
                key={idx}
                className={`calendar-day-card glass-panel ${isToday ? "is-today" : ""} ${
                  isExam ? "is-exam-day" : ""
                }`}
                style={{
                  borderTopColor: isExam ? "#ef4444" : subj.color,
                }}
                onClick={() => setActiveDateModal(item)}
              >
                {/* Day Header */}
                <div className="day-card-header">
                  <div className="date-badge">
                    <span className="date-number">{dateNum}</span>
                    <span className="date-month">{monthStr}</span>
                  </div>

                  <div className="day-badges-right">
                    {isToday && <span className="today-chip">TODAY</span>}
                    {isExam ? (
                      <span className="exam-chip">EXAM</span>
                    ) : (
                      <span
                        className="subj-badge"
                        style={{
                          backgroundColor: subj.bg,
                          color: subj.color,
                          borderColor: subj.border,
                        }}
                      >
                        {subj.code}
                      </span>
                    )}
                  </div>
                </div>

                {/* Subject Title */}
                <div className="day-subj-name" style={{ color: isExam ? "#ef4444" : subj.color }}>
                  {subj.name}
                </div>

                {/* Topic snippet */}
                <div className="day-topic-text">{item.topic}</div>

                {/* Status Footer */}
                <div className="day-card-footer">
                  <span className="status-label">
                    {getStatusIcon(item.status)}
                    <span>{item.status || "Planned"}</span>
                  </span>
                  <span className="day-weekday">{item.day?.slice(0, 3)}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* VIEW MODE 2: TIMELINE LIST */
        <div className="timeline-container glass-panel">
          <div className="timeline-list">
            {filteredSchedule.map((item, idx) => {
              const isToday = item.date === "2026-10-22";
              const isExam = item.subject === "EXAM";
              const subj = SUBJECT_DETAILS[item.subject] || SUBJECT_DETAILS.BDA;

              return (
                <div
                  key={idx}
                  className={`timeline-item ${isToday ? "timeline-today" : ""} ${
                    isExam ? "timeline-exam" : ""
                  }`}
                >
                  <div className="timeline-date-col">
                    <div className="timeline-date-box">
                      <span className="tl-date">{item.date.split("-")[2]}</span>
                      <span className="tl-month">
                        {item.date.split("-")[1] === "10" ? "OCT" : "NOV"}
                      </span>
                    </div>
                    <span className="tl-weekday">{item.day}</span>
                  </div>

                  <div className="timeline-dot" style={{ backgroundColor: subj.color }} />

                  <div className="timeline-content-card glass-panel">
                    <div className="tl-card-top">
                      <span
                        className="badge"
                        style={{
                          backgroundColor: subj.bg,
                          color: subj.color,
                          border: `1px solid ${subj.border}`,
                        }}
                      >
                        {subj.code} • {subj.name}
                      </span>
                      <span className="status-label">
                        {getStatusIcon(item.status)}
                        <span>{item.status}</span>
                      </span>
                    </div>
                    <h4 className="tl-topic-title">{item.topic}</h4>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL: DAY DETAIL PREVIEW */}
      {activeDateModal && (
        <div className="day-modal-backdrop" onClick={() => setActiveDateModal(null)}>
          <div className="day-modal-card glass-panel" onClick={(e) => e.stopPropagation()}>
            <div className="day-modal-top">
              <span className="modal-date-tag">
                {new Date(activeDateModal.date).toLocaleDateString("en-IN", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <button className="btn-close" onClick={() => setActiveDateModal(null)}>
                ✕
              </button>
            </div>

            <h3 className="modal-subject-title">
              {SUBJECT_DETAILS[activeDateModal.subject]?.name || activeDateModal.subject}
            </h3>

            <div className="modal-topic-box">
              <span className="modal-topic-label">Focus Syllabus & Chapters:</span>
              <p className="modal-topic-content">{activeDateModal.topic}</p>
            </div>

            <div className="modal-status-row">
              <span>Status:</span>
              <span className="badge badge-done">{activeDateModal.status}</span>
            </div>

            {onSelectSubject && activeDateModal.subject !== "EXAM" && (
              <button
                className="btn btn-primary w-full mt-3"
                onClick={() => {
                  onSelectSubject(activeDateModal.subject);
                  setActiveDateModal(null);
                }}
              >
                <span>Find {activeDateModal.subject} Study Notes</span>
                <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>
      )}

      <style>{`
        .study-calendar-section {
          margin: 1.5rem 0 3.5rem 0;
        }

        /* COUNTDOWN BANNER */
        .exam-countdown-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.75rem 2rem;
          margin-bottom: 1.5rem;
          border-left: 5px solid #ef4444;
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(99, 102, 241, 0.05) 100%);
          gap: 1.5rem;
          flex-wrap: wrap;
        }
        .countdown-left {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }
        .countdown-icon-wrap {
          width: 54px;
          height: 54px;
          border-radius: var(--radius-lg);
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .countdown-tag {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.78rem;
          font-weight: 700;
          color: #ef4444;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin-bottom: 0.3rem;
        }
        .countdown-title {
          font-size: 1.45rem;
          font-weight: 800;
          color: var(--text-primary);
        }
        .countdown-sub {
          font-size: 0.88rem;
          color: var(--text-secondary);
          margin-top: 0.2rem;
          max-width: 580px;
        }
        .countdown-timer-box {
          background: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          padding: 1rem 1.5rem;
          border-radius: var(--radius-lg);
          text-align: center;
          min-width: 150px;
          box-shadow: var(--shadow-sm);
        }
        .timer-number {
          font-size: 2.25rem;
          font-weight: 900;
          color: #ef4444;
          line-height: 1;
        }
        .timer-label {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-top: 0.3rem;
        }
        .timer-progress-bar {
          width: 100%;
          height: 5px;
          background: var(--bg-surface-elevated);
          border-radius: var(--radius-full);
          margin-top: 0.6rem;
          overflow: hidden;
        }
        .timer-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #6366f1, #ef4444);
          border-radius: var(--radius-full);
        }

        /* CONTROLS BAR */
        .calendar-controls-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.85rem 1.25rem;
          margin-bottom: 1.5rem;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .subject-legend {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .legend-title {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
        }
        .legend-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.25rem 0.6rem;
          border-radius: var(--radius-full);
          border: 1px solid;
          font-size: 0.75rem;
          font-weight: 700;
          cursor: pointer;
          transition: transform var(--transition-fast);
        }
        .legend-pill:hover {
          transform: translateY(-1px);
        }
        .legend-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }
        .legend-fullname {
          font-weight: 500;
          opacity: 0.8;
        }
        .controls-right {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        .view-mode-toggle {
          display: flex;
          align-items: center;
          background: var(--bg-surface-elevated);
          padding: 0.2rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-subtle);
        }
        .view-btn {
          padding: 0.35rem 0.5rem;
          border-radius: var(--radius-sm);
          color: var(--text-muted);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .view-btn.active {
          background: var(--bg-surface);
          color: var(--primary-500);
          box-shadow: var(--shadow-sm);
        }

        /* CALENDAR GRID */
        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
          gap: 1.15rem;
        }
        .calendar-day-card {
          padding: 1.15rem;
          border-top: 4px solid var(--primary-500);
          cursor: pointer;
          display: flex;
          flex-direction: column;
          min-height: 155px;
          transition: transform var(--transition-fast), box-shadow var(--transition-fast);
        }
        .calendar-day-card:hover {
          transform: translateY(-3px);
          box-shadow: var(--shadow-lg);
        }
        .calendar-day-card.is-today {
          box-shadow: 0 0 0 2px var(--primary-500), var(--shadow-lg);
          background: rgba(99, 102, 241, 0.05);
        }
        .calendar-day-card.is-exam-day {
          box-shadow: 0 0 0 2px #ef4444, var(--shadow-xl);
          background: rgba(239, 68, 68, 0.08);
        }
        .day-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.6rem;
        }
        .date-badge {
          display: flex;
          align-items: baseline;
          gap: 0.25rem;
        }
        .date-number {
          font-size: 1.35rem;
          font-weight: 800;
          color: var(--text-primary);
          line-height: 1;
        }
        .date-month {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
        }
        .day-badges-right {
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }
        .today-chip {
          background: var(--primary-500);
          color: #ffffff;
          font-size: 0.68rem;
          font-weight: 800;
          padding: 0.15rem 0.45rem;
          border-radius: var(--radius-full);
          animation: pulseGlow 2s infinite ease-in-out;
        }
        .exam-chip {
          background: #ef4444;
          color: #ffffff;
          font-size: 0.68rem;
          font-weight: 800;
          padding: 0.15rem 0.5rem;
          border-radius: var(--radius-full);
        }
        .subj-badge {
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.2rem 0.5rem;
          border-radius: var(--radius-sm);
          border: 1px solid;
        }
        .day-subj-name {
          font-size: 0.82rem;
          font-weight: 700;
          margin-bottom: 0.35rem;
          line-height: 1.25;
        }
        .day-topic-text {
          font-size: 0.8rem;
          color: var(--text-secondary);
          line-height: 1.35;
          margin-bottom: 0.75rem;
          flex: 1;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .day-card-footer {
          margin-top: auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 0.5rem;
          border-top: 1px solid var(--border-subtle);
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        .status-label {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          font-weight: 600;
        }
        .day-weekday {
          font-weight: 600;
          text-transform: uppercase;
          font-size: 0.7rem;
        }

        /* TIMELINE VIEW */
        .timeline-container {
          padding: 1.5rem;
        }
        .timeline-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          position: relative;
        }
        .timeline-item {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }
        .timeline-date-col {
          width: 80px;
          display: flex;
          flex-direction: column;
          align-items: center;
          flex-shrink: 0;
        }
        .timeline-date-box {
          display: flex;
          align-items: baseline;
          gap: 0.2rem;
        }
        .tl-date {
          font-size: 1.4rem;
          font-weight: 800;
          color: var(--text-primary);
        }
        .tl-month {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-muted);
        }
        .tl-weekday {
          font-size: 0.72rem;
          color: var(--text-muted);
        }
        .timeline-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .timeline-content-card {
          flex: 1;
          padding: 0.85rem 1.25rem;
        }
        .tl-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.35rem;
        }
        .tl-topic-title {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        /* MODAL */
        .day-modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(10, 13, 20, 0.7);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }
        .day-modal-card {
          width: 100%;
          max-width: 440px;
          padding: 1.5rem;
          background: var(--bg-surface);
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-subtle);
        }
        .day-modal-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.75rem;
        }
        .modal-date-tag {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-muted);
        }
        .btn-close {
          color: var(--text-muted);
          font-size: 1.1rem;
        }
        .modal-subject-title {
          font-size: 1.35rem;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 1rem;
        }
        .modal-topic-box {
          background: var(--bg-surface-elevated);
          padding: 1rem;
          border-radius: var(--radius-md);
          margin-bottom: 1rem;
        }
        .modal-topic-label {
          display: block;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          margin-bottom: 0.25rem;
        }
        .modal-topic-content {
          font-size: 0.95rem;
          color: var(--text-primary);
          line-height: 1.4;
          font-weight: 500;
        }
        .modal-status-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.88rem;
          color: var(--text-secondary);
        }

        @media (max-width: 768px) {
          .calendar-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.85rem;
          }
          .exam-countdown-card {
            padding: 1.25rem;
          }
          .countdown-timer-box {
            width: 100%;
          }
          .controls-right {
            width: 100%;
            justify-content: space-between;
          }
        }

        @media (max-width: 480px) {
          .calendar-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};
