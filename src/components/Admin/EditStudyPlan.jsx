import React, { useState } from "react";
import { BookOpen, Calendar as CalendarIcon, Save, RotateCcw, Plus, Trash2, CheckCircle2, Clock, CircleDot, Trophy } from "lucide-react";
import { db, isDemoConfig, doc, setDoc, serverTimestamp } from "../../config/firebase";
import { useToast } from "../Toast";
import { SUBJECT_DETAILS, INITIAL_CALENDAR_SCHEDULE } from "../../config/constants";

export const EditStudyPlan = ({ todayPlan, setTodayPlan, calendarSchedule, setCalendarSchedule }) => {
  const { addToast } = useToast();

  // Local state for Today's Plan
  const [todayForm, setTodayForm] = useState({
    title: todayPlan?.title || "Amit is preparing today: BDA – Chapter 1",
    subject: todayPlan?.subject || "BDA",
    chapter: todayPlan?.chapter || "Chapter 1: HDFS Architecture & MapReduce lifecycle",
    notes: todayPlan?.notes || "Focusing on distributed storage architecture, block replication, and MapReduce execution pipeline.",
    status: todayPlan?.status || "In progress",
  });

  // Local state for 22 Oct - 17 Nov Calendar Schedule
  const [scheduleRows, setScheduleRows] = useState(() => {
    return calendarSchedule ? JSON.parse(JSON.stringify(calendarSchedule)) : INITIAL_CALENDAR_SCHEDULE;
  });

  const [activeMonthFilter, setActiveMonthFilter] = useState("all");
  const [savingToday, setSavingToday] = useState(false);
  const [savingCalendar, setSavingCalendar] = useState(false);

  // Filtered rows for editor
  const filteredRows = scheduleRows.filter((r) => {
    if (activeMonthFilter === "oct") return r.date.startsWith("2026-10");
    if (activeMonthFilter === "nov") return r.date.startsWith("2026-11");
    return true;
  });

  // Save Today's Plan
  const handleSaveToday = async (e) => {
    e.preventDefault();
    setSavingToday(true);
    try {
      const fullSubj = SUBJECT_DETAILS[todayForm.subject]?.name || todayForm.subject;
      const updated = {
        ...todayForm,
        subjectFull: fullSubj,
        updatedAt: new Date().toISOString(),
      };

      if (!isDemoConfig && db) {
        await setDoc(doc(db, "studyPlan", "today"), {
          ...updated,
          serverTimestamp: serverTimestamp(),
        });
      }

      setTodayPlan(updated);
      localStorage.setItem("vault_today_plan", JSON.stringify(updated));
      addToast("Today's preparation target updated successfully!", "success");
    } catch (err) {
      addToast(err.message || "Failed to update today's plan.", "error");
    } finally {
      setSavingToday(false);
    }
  };

  // Update a calendar day
  const updateDayField = (date, field, value) => {
    const updated = scheduleRows.map((item) => {
      if (item.date === date) {
        return { ...item, [field]: value };
      }
      return item;
    });
    setScheduleRows(updated);
  };

  // Save Calendar Schedule
  const handleSaveCalendar = async () => {
    setSavingCalendar(true);
    try {
      if (!isDemoConfig && db) {
        await setDoc(doc(db, "studyPlan", "calendar"), {
          schedule: scheduleRows,
          updatedAt: serverTimestamp(),
        });
      }

      setCalendarSchedule(scheduleRows);
      localStorage.setItem("vault_calendar_schedule", JSON.stringify(scheduleRows));
      addToast("22 Oct – 17 Nov Exam Calendar successfully saved!", "success");
    } catch (err) {
      addToast(err.message || "Failed to save calendar roadmap.", "error");
    } finally {
      setSavingCalendar(false);
    }
  };

  // Reset to default
  const handleResetDefault = () => {
    if (window.confirm("Reset calendar to default schedule (22 Oct to 17 Nov Exam)?")) {
      setScheduleRows(INITIAL_CALENDAR_SCHEDULE);
      addToast("Restored default 22 Oct – 17 Nov schedule.", "info");
    }
  };

  return (
    <div className="study-plan-editor">
      {/* SECTION 1: TODAY'S STUDY PLAN */}
      <div className="editor-card glass-panel">
        <div className="editor-header">
          <div className="editor-badge">
            <BookOpen size={14} />
            <span>Today's Target (Homepage Banner)</span>
          </div>
          <h3 className="editor-title">Edit Today's Study Focus</h3>
          <p className="editor-sub">
            Shown prominently at the top of the homepage for all friends and classmates.
          </p>
        </div>

        <form onSubmit={handleSaveToday} className="today-edit-form">
          <div className="form-group">
            <label className="input-label" htmlFor="today-headline">
              Headline Title
            </label>
            <input
              id="today-headline"
              type="text"
              className="input-field"
              value={todayForm.title}
              onChange={(e) => setTodayForm({ ...todayForm, title: e.target.value })}
              required
            />
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label className="input-label" htmlFor="today-subject-select">
                Subject
              </label>
              <select
                id="today-subject-select"
                className="input-field select-field"
                value={todayForm.subject}
                onChange={(e) => setTodayForm({ ...todayForm, subject: e.target.value })}
              >
                {Object.entries(SUBJECT_DETAILS).map(([code, s]) => (
                  <option key={code} value={code}>
                    {code} — {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="input-label" htmlFor="today-chapter-input">
                Chapter / Focus Topic
              </label>
              <input
                id="today-chapter-input"
                type="text"
                className="input-field"
                value={todayForm.chapter}
                onChange={(e) => setTodayForm({ ...todayForm, chapter: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="input-label" htmlFor="today-status-select">
                Status
              </label>
              <select
                id="today-status-select"
                className="input-field select-field"
                value={todayForm.status}
                onChange={(e) => setTodayForm({ ...todayForm, status: e.target.value })}
              >
                <option value="In progress">In progress</option>
                <option value="Done">Done</option>
                <option value="Planned">Planned</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="input-label" htmlFor="today-notes-input">
              Focus Summary / Syllabus Details
            </label>
            <textarea
              id="today-notes-input"
              rows="2"
              className="input-field textarea-field"
              value={todayForm.notes}
              onChange={(e) => setTodayForm({ ...todayForm, notes: e.target.value })}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={savingToday}>
            <Save size={16} />
            <span>{savingToday ? "Saving..." : "Save Today's Focus"}</span>
          </button>
        </form>
      </div>

      {/* SECTION 2: 22 OCT - 17 NOV CALENDAR ROADMAP EDITOR */}
      <div className="editor-card glass-panel">
        <div className="editor-header-row">
          <div>
            <div className="editor-badge">
              <CalendarIcon size={14} />
              <span>Exam Roadmap • 22 Oct to 17 Nov</span>
            </div>
            <h3 className="editor-title">Exam Calendar Roadmap Editor</h3>
            <p className="editor-sub">
              Manage day-by-day subject targets leading to the <strong>17 Nov Exam Deadline</strong>.
            </p>
          </div>

          <div className="table-actions">
            <button className="btn btn-secondary btn-sm" onClick={handleResetDefault}>
              <RotateCcw size={14} />
              <span>Reset Schedule</span>
            </button>
            <button className="btn btn-primary btn-sm" onClick={handleSaveCalendar} disabled={savingCalendar}>
              <Save size={14} />
              <span>{savingCalendar ? "Saving..." : "Save Calendar Roadmap"}</span>
            </button>
          </div>
        </div>

        {/* Month Filter Bar */}
        <div className="calendar-editor-filters">
          <div className="filter-pill-group">
            <button
              className={`filter-pill ${activeMonthFilter === "all" ? "active" : ""}`}
              onClick={() => setActiveMonthFilter("all")}
            >
              All Days ({scheduleRows.length})
            </button>
            <button
              className={`filter-pill ${activeMonthFilter === "oct" ? "active" : ""}`}
              onClick={() => setActiveMonthFilter("oct")}
            >
              October 2026 (22 - 31 Oct)
            </button>
            <button
              className={`filter-pill ${activeMonthFilter === "nov" ? "active" : ""}`}
              onClick={() => setActiveMonthFilter("nov")}
            >
              November 2026 (1 - 17 Nov Exam)
            </button>
          </div>
        </div>

        {/* Calendar Day Rows Table */}
        <div className="schedule-table-wrap">
          <table className="schedule-edit-table">
            <thead>
              <tr>
                <th style={{ width: "130px" }}>Date & Day</th>
                <th style={{ width: "180px" }}>Subject</th>
                <th>Syllabus Topic / Target Chapters</th>
                <th style={{ width: "140px" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => {
                const isExam = row.subject === "EXAM";
                const isToday = row.date === "2026-10-22";

                return (
                  <tr
                    key={row.date}
                    className={`${isExam ? "exam-row-highlight" : ""} ${isToday ? "today-row-highlight" : ""}`}
                  >
                    <td>
                      <div className="date-cell">
                        <strong className="date-str">{row.date.slice(5)}</strong>
                        <span className="day-str">{row.day.slice(0, 3)}</span>
                        {isToday && <span className="today-badge">TODAY</span>}
                        {isExam && <span className="exam-badge">EXAM</span>}
                      </div>
                    </td>

                    <td>
                      <select
                        className="input-field table-select"
                        value={row.subject}
                        onChange={(e) => updateDayField(row.date, "subject", e.target.value)}
                      >
                        {Object.entries(SUBJECT_DETAILS).map(([code, s]) => (
                          <option key={code} value={code}>
                            {code} ({s.name.split(" ")[0]})
                          </option>
                        ))}
                      </select>
                    </td>

                    <td>
                      <input
                        type="text"
                        className="input-field table-input"
                        value={row.topic}
                        onChange={(e) => updateDayField(row.date, "topic", e.target.value)}
                        placeholder="Enter chapters / revision topic..."
                      />
                    </td>

                    <td>
                      <select
                        className="input-field table-select"
                        value={row.status}
                        onChange={(e) => updateDayField(row.date, "status", e.target.value)}
                      >
                        <option value="Planned">Planned</option>
                        <option value="In progress">In progress</option>
                        <option value="Done">Done</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .study-plan-editor {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          margin-bottom: 2rem;
        }
        .editor-card {
          padding: 1.75rem 2rem;
        }
        .editor-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.78rem;
          font-weight: 700;
          color: var(--primary-500);
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin-bottom: 0.4rem;
        }
        .editor-title {
          font-size: 1.35rem;
          font-weight: 800;
          color: var(--text-primary);
        }
        .editor-sub {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-top: 0.2rem;
        }
        .today-edit-form {
          display: flex;
          flex-direction: column;
          gap: 1.15rem;
          margin-top: 1.25rem;
        }
        .form-grid-3 {
          display: grid;
          grid-template-columns: 1fr 1.5fr 1fr;
          gap: 1rem;
        }
        .editor-header-row {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 1.25rem;
          flex-wrap: wrap;
        }
        .table-actions {
          display: flex;
          align-items: center;
          gap: 0.65rem;
        }
        .calendar-editor-filters {
          margin-bottom: 1rem;
        }
        .schedule-table-wrap {
          overflow-x: auto;
          border-radius: var(--radius-md);
        }
        .schedule-edit-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }
        .schedule-edit-table th {
          background: var(--bg-surface-elevated);
          padding: 0.8rem 0.9rem;
          font-size: 0.8rem;
          color: var(--text-muted);
          text-transform: uppercase;
          border-bottom: 1px solid var(--border-subtle);
        }
        .schedule-edit-table td {
          padding: 0.6rem 0.65rem;
          border-bottom: 1px solid var(--border-card);
        }
        .exam-row-highlight {
          background: rgba(239, 68, 68, 0.08);
        }
        .today-row-highlight {
          background: rgba(99, 102, 241, 0.06);
        }
        .date-cell {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
        .date-str {
          font-size: 0.95rem;
          font-weight: 800;
          color: var(--text-primary);
        }
        .day-str {
          font-size: 0.75rem;
          color: var(--text-muted);
          text-transform: uppercase;
        }
        .today-badge {
          background: var(--primary-500);
          color: #fff;
          font-size: 0.65rem;
          font-weight: 800;
          padding: 1px 4px;
          border-radius: 4px;
        }
        .exam-badge {
          background: #ef4444;
          color: #fff;
          font-size: 0.65rem;
          font-weight: 800;
          padding: 1px 4px;
          border-radius: 4px;
        }
        .table-input {
          padding: 0.45rem 0.75rem;
          font-size: 0.88rem;
        }
        .table-select {
          padding: 0.45rem 0.75rem;
          font-size: 0.88rem;
          cursor: pointer;
        }

        @media (max-width: 768px) {
          .editor-card { padding: 1.25rem; }
          .form-grid-3 { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};
