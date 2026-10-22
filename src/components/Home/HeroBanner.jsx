import React from "react";
import { ShieldCheck, Search, DownloadCloud, FileCheck, ArrowRight, UserCheck } from "lucide-react";

export const HeroBanner = ({ onExploreNotes, totalNotes = 5, onRegisterClick, isRegistered }) => {
  return (
    <div className="hero-banner">
      <div className="hero-badge-pill">
        <ShieldCheck size={15} className="text-indigo-400" />
        <span>Protected Academic Resource Vault</span>
      </div>

      <h1 className="hero-title">
        High-Yield Engineering Notes <br />
        <span className="gradient-text">Protected with Anti-Leak Watermarks</span>
      </h1>

      <p className="hero-description">
        Study smarter with organized BDA, CNS, AI, and Cloud notes. Every single download is
        dynamically stamped with your verified name, phone number, and timestamp to ensure notes
        stay among trusted classmates.
      </p>

      <div className="hero-cta-group">
        <button className="btn btn-primary btn-lg" onClick={onExploreNotes}>
          <Search size={18} />
          <span>Browse Notes Library</span>
          <ArrowRight size={17} />
        </button>

        {!isRegistered && (
          <button className="btn btn-secondary btn-lg" onClick={onRegisterClick}>
            <UserCheck size={18} />
            <span>Register to Unlock Downloads</span>
          </button>
        )}
      </div>

      {/* Feature Highlights Grid */}
      <div className="hero-features-grid">
        <div className="feature-item glass-panel">
          <div className="feature-icon">
            <DownloadCloud size={20} />
          </div>
          <div className="feature-content">
            <h4 className="feature-title">Dynamic Watermarking</h4>
            <p className="feature-text">Your name & phone diagonally repeated across all pages.</p>
          </div>
        </div>

        <div className="feature-item glass-panel">
          <div className="feature-icon">
            <FileCheck size={20} />
          </div>
          <div className="feature-content">
            <h4 className="feature-title">Access Code Protected</h4>
            <p className="feature-text">Backend cryptographic verification with rate-limiting.</p>
          </div>
        </div>

        <div className="feature-item glass-panel">
          <div className="feature-icon">
            <ShieldCheck size={20} />
          </div>
          <div className="feature-content">
            <h4 className="feature-title">Leak Finder Enabled</h4>
            <p className="feature-text">Unauthorized re-shares can be traced back in seconds.</p>
          </div>
        </div>
      </div>

      <style>{`
        .hero-banner {
          padding: 2.5rem 0 1.5rem 0;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .hero-badge-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(99, 102, 241, 0.1);
          color: var(--primary-500);
          border: 1px solid rgba(99, 102, 241, 0.25);
          padding: 0.4rem 1rem;
          border-radius: var(--radius-full);
          font-size: 0.85rem;
          font-weight: 700;
          margin-bottom: 1.25rem;
        }
        .hero-title {
          font-size: clamp(2rem, 5vw, 3.25rem);
          font-weight: 800;
          letter-spacing: -0.025em;
          line-height: 1.15;
          margin-bottom: 1.25rem;
          max-width: 850px;
        }
        .hero-description {
          font-size: 1.1rem;
          color: var(--text-secondary);
          max-width: 720px;
          margin-bottom: 2rem;
          line-height: 1.6;
        }
        .hero-cta-group {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 3rem;
          flex-wrap: wrap;
          justify-content: center;
        }
        .hero-features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.25rem;
          width: 100%;
          text-align: left;
        }
        .feature-item {
          padding: 1.25rem 1.4rem;
          display: flex;
          align-items: flex-start;
          gap: 1rem;
        }
        .feature-icon {
          width: 42px;
          height: 42px;
          border-radius: var(--radius-md);
          background: rgba(99, 102, 241, 0.12);
          color: var(--primary-500);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .feature-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.2rem;
        }
        .feature-text {
          font-size: 0.825rem;
          color: var(--text-muted);
          line-height: 1.4;
        }

        @media (max-width: 860px) {
          .hero-features-grid {
            grid-template-columns: 1fr;
          }
          .hero-banner {
            padding: 1.75rem 0 1rem 0;
          }
        }

        @media (max-width: 640px) {
          .hero-title {
            font-size: 1.65rem;
            margin-bottom: 0.85rem;
          }
          .hero-description {
            font-size: 0.9rem;
            margin-bottom: 1.5rem;
          }
          .hero-cta-group {
            flex-direction: column;
            width: 100%;
            gap: 0.75rem;
            margin-bottom: 2rem;
          }
          .hero-cta-group .btn {
            width: 100%;
          }
          .hero-badge-pill {
            font-size: 0.75rem;
            padding: 0.3rem 0.75rem;
          }
          .feature-item {
            padding: 0.9rem 1rem;
          }
        }
      `}</style>
    </div>
  );
};
