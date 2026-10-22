import React, { useState } from "react";
import {
  FileText,
  Shield,
  Sun,
  Moon,
  UserCheck,
  UserPlus,
  Lock,
  Unlock,
  Menu,
  X,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

export const Navbar = ({ activeTab, setActiveTab, onOpenRegister, onOpenAdminLogin }) => {
  const { isDark, toggleTheme } = useTheme();
  const { userProfile, isRegistered, isAdmin, logoutAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (tab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="navbar-wrapper">
      <div className="navbar-content">
        {/* Brand / Logo */}
        <div className="navbar-brand" onClick={() => handleNav("home")}>
          <div className="brand-logo-icon">
            <Shield size={22} className="shield-icon" />
            <Sparkles size={11} className="sparkle-accent" />
          </div>
          <div className="brand-text">
            <span className="brand-title">Amit's Notes <span className="gradient-text">Vault</span></span>
            <span className="brand-tagline">Traceable Study Hub</span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="desktop-nav">
          <button
            className={`nav-item ${activeTab === "home" ? "active" : ""}`}
            onClick={() => handleNav("home")}
          >
            <BookOpen size={17} />
            <span>Study Plan</span>
          </button>

          <button
            className={`nav-item ${activeTab === "notes" ? "active" : ""}`}
            onClick={() => handleNav("notes")}
          >
            <FileText size={17} />
            <span>Notes Library</span>
          </button>

          <button
            className={`nav-item admin-nav-item ${activeTab === "admin" ? "active" : ""}`}
            onClick={() => {
              if (isAdmin) {
                handleNav("admin");
              } else {
                onOpenAdminLogin();
              }
            }}
          >
            {isAdmin ? <Unlock size={16} className="text-emerald-500" /> : <Lock size={16} />}
            <span>Admin {isAdmin && "✓"}</span>
          </button>
        </nav>

        {/* Right Actions */}
        <div className="navbar-actions">
          {/* Theme Toggle */}
          <button
            className="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? <Sun size={19} /> : <Moon size={19} />}
          </button>

          {/* User Profile Pill or Register CTA */}
          {isRegistered ? (
            <div
              className="user-profile-badge"
              onClick={onOpenRegister}
              title="Click to view/edit identity printed on your downloads"
            >
              <UserCheck size={16} className="badge-icon-verified" />
              <div className="user-profile-details">
                <span className="user-profile-name">{userProfile.name}</span>
                <span className="user-profile-phone">+91 {userProfile.phone}</span>
              </div>
            </div>
          ) : (
            <button className="btn btn-primary btn-sm register-cta-btn" onClick={onOpenRegister}>
              <UserPlus size={16} />
              <span>Register Identity</span>
            </button>
          )}

          {/* Admin Logged In Pill */}
          {isAdmin && (
            <button
              className="admin-badge-pill"
              onClick={logoutAdmin}
              title="Click to exit Admin Mode"
            >
              <span className="admin-status-dot"></span>
              <span>Admin Mode</span>
            </button>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            className="mobile-hamburger-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu glass-panel animate-fade-in">
          <button
            className={`mobile-nav-item ${activeTab === "home" ? "active" : ""}`}
            onClick={() => handleNav("home")}
          >
            <BookOpen size={18} />
            <span>Today's & Weekly Study Plan</span>
          </button>

          <button
            className={`mobile-nav-item ${activeTab === "notes" ? "active" : ""}`}
            onClick={() => handleNav("notes")}
          >
            <FileText size={18} />
            <span>Notes Library (PDFs & Images)</span>
          </button>

          <button
            className={`mobile-nav-item ${activeTab === "admin" ? "active" : ""}`}
            onClick={() => {
              setMobileMenuOpen(false);
              if (isAdmin) {
                setActiveTab("admin");
              } else {
                onOpenAdminLogin();
              }
            }}
          >
            {isAdmin ? <Unlock size={18} /> : <Lock size={18} />}
            <span>Admin Panel {isAdmin ? "(Logged in)" : ""}</span>
          </button>

          <div className="mobile-menu-divider" />

          {isRegistered ? (
            <div className="mobile-user-row" onClick={() => { setMobileMenuOpen(false); onOpenRegister(); }}>
              <UserCheck size={18} className="text-emerald-500" />
              <div>
                <p className="font-bold">{userProfile.name}</p>
                <p className="text-xs text-muted">+91 {userProfile.phone} (Watermark Profile)</p>
              </div>
            </div>
          ) : (
            <button
              className="btn btn-primary w-full"
              onClick={() => { setMobileMenuOpen(false); onOpenRegister(); }}
            >
              <UserPlus size={16} />
              <span>Register Identity to Download</span>
            </button>
          )}
        </div>
      )}

      <style>{`
        .navbar-wrapper {
          position: sticky;
          top: 0;
          z-index: 100;
          background: var(--bg-surface-glass);
          backdrop-filter: var(--glass-blur);
          -webkit-backdrop-filter: var(--glass-blur);
          border-bottom: 1px solid var(--border-card);
          transition: background-color var(--transition-normal);
        }
        .navbar-content {
          max-width: 1200px;
          margin: 0 auto;
          height: 72px;
          padding: 0 1.25rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.5rem;
        }
        .navbar-brand {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          cursor: pointer;
          user-select: none;
        }
        .brand-logo-icon {
          position: relative;
          width: 42px;
          height: 42px;
          border-radius: var(--radius-md);
          background: var(--primary-gradient);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          box-shadow: var(--primary-glow);
          transition: transform var(--transition-normal);
        }
        .navbar-brand:hover .brand-logo-icon {
          transform: rotate(-6deg) scale(1.05);
        }
        .sparkle-accent {
          position: absolute;
          top: 4px;
          right: 4px;
          color: #fef08a;
        }
        .brand-title {
          font-family: var(--font-display);
          font-size: 1.2rem;
          font-weight: 800;
          letter-spacing: -0.01em;
          display: block;
          line-height: 1.15;
        }
        .brand-tagline {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 500;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .desktop-nav {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--bg-surface-elevated);
          padding: 0.3rem 0.4rem;
          border-radius: var(--radius-full);
          border: 1px solid var(--border-subtle);
        }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: var(--radius-full);
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--text-secondary);
          transition: all var(--transition-fast);
        }
        .nav-item:hover {
          color: var(--text-primary);
        }
        .nav-item.active {
          background: var(--bg-surface);
          color: var(--primary-500);
          box-shadow: var(--shadow-sm);
        }
        .navbar-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .theme-toggle-btn {
          width: 38px;
          height: 38px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border-subtle);
          color: var(--text-secondary);
          transition: all var(--transition-fast);
        }
        .theme-toggle-btn:hover {
          color: var(--text-primary);
          border-color: var(--primary-500);
          transform: rotate(15deg);
        }
        .user-profile-badge {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.4rem 0.85rem;
          border-radius: var(--radius-full);
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border-subtle);
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .user-profile-badge:hover {
          border-color: var(--primary-400);
          background: var(--bg-surface);
        }
        .badge-icon-verified {
          color: #10b981;
        }
        .user-profile-details {
          display: flex;
          flex-direction: column;
          line-height: 1.15;
          text-align: left;
        }
        .user-profile-name {
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--text-primary);
        }
        .user-profile-phone {
          font-size: 0.7rem;
          color: var(--text-muted);
        }
        .admin-badge-pill {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          background: rgba(16, 185, 129, 0.12);
          border: 1px solid rgba(16, 185, 129, 0.35);
          color: #10b981;
          font-size: 0.78rem;
          font-weight: 700;
          padding: 0.35rem 0.75rem;
          border-radius: var(--radius-full);
        }
        .admin-status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #10b981;
          animation: pulseGlow 2s infinite ease-in-out;
        }
        .mobile-hamburger-btn {
          display: none;
          width: 38px;
          height: 38px;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-md);
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border-subtle);
          color: var(--text-primary);
        }
        .mobile-menu {
          margin: 0.5rem 1rem 1rem 1rem;
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .mobile-nav-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border-radius: var(--radius-md);
          font-weight: 600;
          color: var(--text-secondary);
        }
        .mobile-nav-item.active {
          background: var(--primary-50);
          color: var(--primary-600);
        }
        .mobile-menu-divider {
          height: 1px;
          background: var(--border-subtle);
          margin: 0.5rem 0;
        }
        .mobile-user-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem;
          cursor: pointer;
        }

        @media (max-width: 860px) {
          .desktop-nav { display: none; }
          .mobile-hamburger-btn { display: flex; }
          .user-profile-details { display: none; }
        }
      `}</style>
    </header>
  );
};
