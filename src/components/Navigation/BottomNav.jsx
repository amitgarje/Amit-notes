import React from "react";
import { Home, BookOpen, Shield, User, UserCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

/**
 * BottomNav: Mobile-first thumb-friendly bottom navigation bar for viewports < 600px.
 * Provides quick 1-tap switching between Home, Notes, Admin, and User Watermark Profile.
 */
export const BottomNav = ({ activeTab, setActiveTab, onOpenRegister, onOpenAdminLogin }) => {
  const { isRegistered, isAdmin, userProfile } = useAuth();

  return (
    <nav className="bottom-nav-bar" aria-label="Mobile Navigation">
      {/* 1. Home / Calendar */}
      <button
        className={`bottom-nav-item ${activeTab === "home" ? "active" : ""}`}
        onClick={() => {
          setActiveTab("home");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        aria-label="Home and Study Plan"
      >
        <div className="bottom-nav-icon">
          <Home size={20} />
        </div>
        <span className="bottom-nav-label">Home</span>
      </button>

      {/* 2. Notes Library */}
      <button
        className={`bottom-nav-item ${activeTab === "notes" ? "active" : ""}`}
        onClick={() => {
          setActiveTab("notes");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        aria-label="Notes Vault"
      >
        <div className="bottom-nav-icon">
          <BookOpen size={20} />
        </div>
        <span className="bottom-nav-label">Notes</span>
      </button>

      {/* 3. Watermark Profile / Register Identity */}
      <button
        className="bottom-nav-item"
        onClick={onOpenRegister}
        aria-label="User Watermark Profile"
      >
        <div className="bottom-nav-icon">
          {isRegistered ? (
            <UserCheck size={20} className="text-emerald-500" />
          ) : (
            <User size={20} />
          )}
        </div>
        <span className="bottom-nav-label">
          {isRegistered ? (userProfile?.name?.split(" ")[0] || "Profile") : "Register"}
        </span>
      </button>

      {/* 4. Admin Control Center */}
      <button
        className={`bottom-nav-item ${activeTab === "admin" ? "active" : ""}`}
        onClick={() => {
          if (isAdmin) {
            setActiveTab("admin");
            window.scrollTo({ top: 0, behavior: "smooth" });
          } else {
            onOpenAdminLogin();
          }
        }}
        aria-label="Admin Control Center"
      >
        <div className="bottom-nav-icon">
          <Shield size={20} />
        </div>
        <span className="bottom-nav-label">
          {isAdmin ? "Admin" : "Admin Login"}
        </span>
      </button>

      <style>{`
        .bottom-nav-bar {
          display: none;
        }

        @media (max-width: 600px) {
          .bottom-nav-bar {
            display: flex;
            align-items: center;
            justify-content: space-around;
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100vw;
            height: 64px;
            background: var(--bg-surface-glass);
            backdrop-filter: var(--glass-blur);
            -webkit-backdrop-filter: var(--glass-blur);
            border-top: 1px solid var(--border-card);
            box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            padding-bottom: env(safe-area-inset-bottom);
          }
          .bottom-nav-item {
            flex: 1;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 3px;
            color: var(--text-muted);
            font-size: 0.725rem;
            font-weight: 600;
            transition: color var(--transition-fast);
            user-select: none;
            -webkit-tap-highlight-color: transparent;
            min-height: 44px;
          }
          .bottom-nav-item.active {
            color: var(--primary-500);
          }
          .bottom-nav-item:active {
            transform: scale(0.95);
          }
          .bottom-nav-icon {
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .bottom-nav-label {
            line-height: 1;
          }
        }
      `}</style>
    </nav>
  );
};
