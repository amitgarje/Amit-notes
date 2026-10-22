import React, { useState } from "react";
import { UploadCloud, BookOpen, Layers, FileSpreadsheet, AlertOctagon, ShieldCheck, LogOut } from "lucide-react";
import { UploadNoteForm } from "./UploadNoteForm";
import { ManageNotes } from "./ManageNotes";
import { EditStudyPlan } from "./EditStudyPlan";
import { DownloadLogsTable } from "./DownloadLogsTable";
import { LeakFinder } from "./LeakFinder";
import { useAuth } from "../../context/AuthContext";

export const AdminPanel = ({
  todayPlan,
  setTodayPlan,
  calendarSchedule,
  setCalendarSchedule,
  onNoteAdded,
  notes = [],
  setNotes,
}) => {
  const { logoutAdmin } = useAuth();
  const [activeAdminSubTab, setActiveAdminSubTab] = useState("upload");

  return (
    <div className="admin-panel-container">
      {/* Top Banner */}
      <div className="admin-status-banner glass-panel">
        <div className="banner-left">
          <div className="shield-avatar">
            <ShieldCheck size={24} />
          </div>
          <div>
            <div className="admin-title-row">
              <h2 className="admin-page-title">Amit's Control Center</h2>
              <span className="badge badge-done">Admin Verified</span>
            </div>
            <p className="admin-page-sub">
              Upload notes & images to the vault, edit study roadmaps, monitor downloads, and trace leaks.
            </p>
          </div>
        </div>

        <button className="btn btn-secondary btn-sm" onClick={logoutAdmin}>
          <LogOut size={15} />
          <span>Exit Admin</span>
        </button>
      </div>

      {/* Admin Sub-Tabs Navigation */}
      <div className="admin-tabs-nav">
        <button
          className={`admin-tab-btn ${activeAdminSubTab === "upload" ? "active" : ""}`}
          onClick={() => setActiveAdminSubTab("upload")}
        >
          <UploadCloud size={17} />
          <span>Upload Note / Image</span>
        </button>

        <button
          className={`admin-tab-btn ${activeAdminSubTab === "manage" ? "active" : ""}`}
          onClick={() => setActiveAdminSubTab("manage")}
        >
          <Layers size={17} />
          <span>Manage Notes ({notes.length})</span>
        </button>

        <button
          className={`admin-tab-btn ${activeAdminSubTab === "study-plan" ? "active" : ""}`}
          onClick={() => setActiveAdminSubTab("study-plan")}
        >
          <BookOpen size={17} />
          <span>Study Plan Editor</span>
        </button>

        <button
          className={`admin-tab-btn ${activeAdminSubTab === "logs" ? "active" : ""}`}
          onClick={() => setActiveAdminSubTab("logs")}
        >
          <FileSpreadsheet size={17} />
          <span>Download Logs & CSV</span>
        </button>

        <button
          className={`admin-tab-btn leak-tab ${activeAdminSubTab === "leak-finder" ? "active" : ""}`}
          onClick={() => setActiveAdminSubTab("leak-finder")}
        >
          <AlertOctagon size={17} />
          <span>Leak Finder</span>
        </button>
      </div>

      {/* Tab Content Display */}
      <div className="admin-tab-content">
        {activeAdminSubTab === "upload" && <UploadNoteForm onNoteAdded={onNoteAdded} />}

        {activeAdminSubTab === "manage" && <ManageNotes notes={notes} setNotes={setNotes} />}

        {activeAdminSubTab === "study-plan" && (
          <EditStudyPlan
            todayPlan={todayPlan}
            setTodayPlan={setTodayPlan}
            calendarSchedule={calendarSchedule}
            setCalendarSchedule={setCalendarSchedule}
          />
        )}

        {activeAdminSubTab === "logs" && <DownloadLogsTable />}

        {activeAdminSubTab === "leak-finder" && <LeakFinder />}
      </div>

      <style>{`
        .admin-panel-container {
          margin: 1.5rem 0 3rem 0;
        }
        .admin-status-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem 2rem;
          margin-bottom: 2rem;
          border-left: 5px solid #10b981;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .banner-left {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }
        .shield-avatar {
          width: 50px;
          height: 50px;
          border-radius: var(--radius-lg);
          background: rgba(16, 185, 129, 0.15);
          color: #10b981;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .admin-title-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        .admin-page-title {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--text-primary);
        }
        .admin-page-sub {
          font-size: 0.88rem;
          color: var(--text-muted);
          margin-top: 0.2rem;
        }
        .admin-tabs-nav {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--bg-surface-elevated);
          padding: 0.35rem;
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-subtle);
          margin-bottom: 2rem;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
        .admin-tab-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.65rem 1.15rem;
          border-radius: var(--radius-md);
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--text-secondary);
          transition: all var(--transition-fast);
          white-space: nowrap;
        }
        .admin-tab-btn:hover {
          color: var(--text-primary);
        }
        .admin-tab-btn.active {
          background: var(--bg-surface);
          color: var(--primary-500);
          box-shadow: var(--shadow-sm);
        }
        .leak-tab.active {
          color: #ef4444;
        }

        @media (max-width: 768px) {
          .admin-status-banner { padding: 1.25rem; }
          .admin-tabs-nav { padding: 0.25rem; gap: 0.35rem; }
          .admin-tab-btn { padding: 0.5rem 0.85rem; font-size: 0.82rem; }
        }
      `}</style>
    </div>
  );
};
