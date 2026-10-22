import React, { useState } from "react";
import { Lock, KeyRound, AlertCircle, ShieldCheck } from "lucide-react";
import { Modal } from "../Modal";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../Toast";

export const AdminLoginModal = ({ isOpen, onClose, onSuccess }) => {
  const { loginAdmin } = useAuth();
  const { addToast } = useToast();

  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim()) {
      setErrorMsg("Please enter the admin password.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      await loginAdmin(password);
      addToast("Welcome back, Amit! Admin access granted.", "success");
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setErrorMsg(err.message || "Invalid admin password. Default is 'amit123'.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Admin Authentication"
      subtitle="Restricted to vault owner (Amit Garje)"
      maxWidth="420px"
    >
      <form onSubmit={handleSubmit} className="admin-login-form">
        <div className="admin-lock-banner">
          <ShieldCheck size={28} className="text-primary-500" />
          <div>
            <h4 className="banner-title">Authorized Personnel Only</h4>
            <p className="banner-text">Manage notes, study plans, access codes, and view leak trace logs.</p>
          </div>
        </div>

        {errorMsg && (
          <div className="error-alert animate-fade-in">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="form-group">
          <label className="input-label" htmlFor="admin-pass-input">
            Admin Passcode / Password
          </label>
          <div className="input-with-icon">
            <KeyRound size={17} className="field-icon" />
            <input
              id="admin-pass-input"
              type="password"
              className="input-field with-icon"
              placeholder="Enter passcode (e.g. amit123)..."
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errorMsg) setErrorMsg("");
              }}
              autoFocus
              required
            />
          </div>
          <span className="field-help">Default passcode is <code>amit123</code> (or your Firebase Admin UID).</span>
        </div>

        <button type="submit" className="btn btn-primary w-full" disabled={loading || !password.trim()}>
          {loading ? "Verifying Credentials..." : "Unlock Admin Dashboard"}
        </button>
      </form>

      <style>{`
        .admin-login-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .admin-lock-banner {
          display: flex;
          align-items: flex-start;
          gap: 0.85rem;
          background: rgba(99, 102, 241, 0.08);
          border: 1px solid rgba(99, 102, 241, 0.25);
          border-radius: var(--radius-md);
          padding: 0.85rem 1rem;
        }
        .banner-title {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--text-primary);
        }
        .banner-text {
          font-size: 0.775rem;
          color: var(--text-muted);
          line-height: 1.35;
        }
        .input-with-icon {
          position: relative;
          display: flex;
          align-items: center;
        }
        .field-icon {
          position: absolute;
          left: 0.9rem;
          color: var(--text-muted);
        }
        .input-field.with-icon {
          padding-left: 2.5rem;
        }
        .field-help {
          display: block;
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 0.35rem;
        }
        .field-help code {
          background: var(--bg-surface-elevated);
          padding: 1px 5px;
          border-radius: 4px;
          color: var(--primary-500);
          font-weight: 700;
        }
        .error-alert {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(239, 68, 68, 0.12);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #ef4444;
          padding: 0.65rem 0.85rem;
          border-radius: var(--radius-md);
          font-size: 0.85rem;
          font-weight: 500;
        }
      `}</style>
    </Modal>
  );
};
