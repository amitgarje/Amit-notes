import React, { useState } from "react";
import { KeyRound, Shield, CheckCircle2, AlertCircle, Save, Eye, EyeOff } from "lucide-react";
import { isDemoConfig, db, doc, setDoc, serverTimestamp } from "../../config/firebase";
import { useToast } from "../Toast";

// Browser SHA-256 helper
async function sha256Hex(str) {
  const enc = new TextEncoder().encode(str.trim());
  const hashBuf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(hashBuf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export const ChangeAccessCode = () => {
  const { addToast } = useToast();

  const [newCode, setNewCode] = useState("");
  const [confirmCode, setConfirmCode] = useState("");
  const [showCode, setShowCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const clean = newCode.trim();
    if (clean.length < 3) {
      setErrorMsg("Access code must be at least 3 characters long.");
      return;
    }
    if (clean !== confirmCode.trim()) {
      setErrorMsg("New access codes do not match. Please re-enter.");
      return;
    }

    setLoading(true);
    try {

      // 2. Hash with SHA-256
      const hashed = await sha256Hex(clean);

      // Save to local storage for instant demo testing
      localStorage.setItem("vault_admin_code_hash", hashed);

      // Save to Firestore config/security if db is available
      if (!isDemoConfig && db) {
        await setDoc(
          doc(db, "config", "security"),
          {
            codeHash: hashed,
            updatedAt: serverTimestamp(),
            note: "Updated by admin",
          },
          { merge: true }
        );
      }

      setSuccessMsg(`Access code successfully updated to "${clean}"! (Hashed with SHA-256)`);
      addToast("Vault access code successfully updated!", "success");
      setNewCode("");
      setConfirmCode("");
    } catch (err) {
      setErrorMsg(err.message || "Failed to update access code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="change-code-card glass-panel">
      <div className="card-header">
        <div className="code-badge">
          <Shield size={14} className="text-primary-500" />
          <span>Cryptographic Security: SHA-256</span>
        </div>
        <h3 className="card-title">Change Download Access Code</h3>
        <p className="card-sub">
          The access code is verified strictly on the backend by Cloud Functions. The plaintext code is
          never stored or sent to client users.
        </p>
      </div>

      {successMsg && (
        <div className="success-alert animate-fade-in">
          <CheckCircle2 size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="error-alert animate-fade-in">
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="change-code-form">
        <div className="form-grid-2">
          {/* New Code */}
          <div className="form-group">
            <label className="input-label" htmlFor="new-code-input">
              New Access Code
            </label>
            <div className="input-with-icon">
              <KeyRound size={17} className="field-icon" />
              <input
                id="new-code-input"
                type={showCode ? "text" : "password"}
                className="input-field with-icon"
                placeholder="Enter new code..."
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                required
              />
              <button
                type="button"
                className="field-toggle-btn"
                onClick={() => setShowCode(!showCode)}
                tabIndex={-1}
              >
                {showCode ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm Code */}
          <div className="form-group">
            <label className="input-label" htmlFor="confirm-code-input">
              Confirm New Code
            </label>
            <div className="input-with-icon">
              <KeyRound size={17} className="field-icon" />
              <input
                id="confirm-code-input"
                type={showCode ? "text" : "password"}
                className="input-field with-icon"
                placeholder="Re-enter new code..."
                value={confirmCode}
                onChange={(e) => setConfirmCode(e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        <div className="code-info-box">
          <p className="info-text">
            <strong>Default Code:</strong> <code>amu</code> &bull; All future note download attempts will
            require students to enter this new code.
          </p>
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading || !newCode.trim() || !confirmCode.trim()}>
          <Save size={16} />
          <span>{loading ? "Hashing & Saving..." : "Save New Access Code"}</span>
        </button>
      </form>

      <style>{`
        .change-code-card {
          padding: 2rem;
          margin-bottom: 2rem;
        }
        .code-badge {
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
        .card-title {
          font-size: 1.4rem;
          font-weight: 800;
          color: var(--text-primary);
        }
        .card-sub {
          font-size: 0.88rem;
          color: var(--text-muted);
          margin-top: 0.2rem;
          max-width: 650px;
        }
        .change-code-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          margin-top: 1.25rem;
        }
        .form-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
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
          padding-right: 2.5rem;
        }
        .field-toggle-btn {
          position: absolute;
          right: 0.75rem;
          color: var(--text-muted);
          padding: 4px;
          display: flex;
          align-items: center;
        }
        .field-toggle-btn:hover {
          color: var(--text-primary);
        }
        .code-info-box {
          background: var(--bg-surface-elevated);
          padding: 0.75rem 1rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-subtle);
        }
        .info-text {
          font-size: 0.825rem;
          color: var(--text-secondary);
        }
        .info-text code {
          background: rgba(99, 102, 241, 0.12);
          color: var(--primary-500);
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 700;
        }
        .success-alert {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(16, 185, 129, 0.12);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: #10b981;
          padding: 0.75rem 1rem;
          border-radius: var(--radius-md);
          font-size: 0.88rem;
          font-weight: 600;
        }
        .error-alert {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(239, 68, 68, 0.12);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #ef4444;
          padding: 0.75rem 1rem;
          border-radius: var(--radius-md);
          font-size: 0.88rem;
          font-weight: 500;
        }

        @media (max-width: 640px) {
          .change-code-card { padding: 1.25rem; }
          .form-grid-2 { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};
