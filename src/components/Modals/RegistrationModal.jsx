import React, { useState, useEffect } from "react";
import { ShieldAlert, User, Phone, CheckSquare, Square, AlertCircle, CheckCircle2 } from "lucide-react";
import { Modal } from "../Modal";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../Toast";

export const RegistrationModal = ({ isOpen, onClose, onSuccess }) => {
  const { userProfile, registerUser, clearUserProfile, isRegistered } = useAuth();
  const { addToast } = useToast();

  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [consentChecked, setConsentChecked] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill existing data if modifying
  useEffect(() => {
    if (userProfile) {
      setFullName(userProfile.name || "");
      setPhoneNumber(userProfile.phone || "");
      setConsentChecked(true);
    } else {
      setFullName("");
      setPhoneNumber("");
      setConsentChecked(false);
    }
    setErrorMsg("");
  }, [userProfile, isOpen]);

  const handlePhoneChange = (e) => {
    // Only allow numbers, max 10 digits
    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
    setPhoneNumber(val);
    if (errorMsg) setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    const cleanName = fullName.trim();
    if (!cleanName || cleanName.length < 2) {
      setErrorMsg("Please enter your full name.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(phoneNumber)) {
      setErrorMsg("Please enter a valid 10-digit Indian mobile number (starts with 6, 7, 8, or 9).");
      return;
    }

    if (!consentChecked) {
      setErrorMsg("You must accept the watermark & anti-leak consent policy to proceed.");
      return;
    }

    setIsSubmitting(true);
    try {
      await registerUser(cleanName, phoneNumber);
      addToast("Identity registered successfully! Watermark enabled.", "success");
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setErrorMsg(err.message || "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isRegistered ? "Watermark Profile" : "User Registration Required"}
      subtitle="Required once to authenticate and stamp notes with your traceable identity."
      maxWidth="480px"
    >
      <form onSubmit={handleSubmit} className="reg-form">
        {/* Anti-Leak Consent Notice Box */}
        <div className="consent-box">
          <div className="consent-header">
            <ShieldAlert size={18} className="consent-icon" />
            <span className="consent-title">Anti-Leak Security Notice</span>
          </div>
          <p className="consent-body">
            "Your name and phone number will be printed diagonally on all downloaded notes to prevent
            unauthorized sharing and protect intellectual work."
          </p>
        </div>

        {errorMsg && (
          <div className="error-alert animate-fade-in">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Full Name Field */}
        <div className="form-group">
          <label className="input-label" htmlFor="reg-fullname">
            Full Name (as printed on your college ID)
          </label>
          <div className="input-with-icon">
            <User size={17} className="field-icon" />
            <input
              id="reg-fullname"
              type="text"
              className="input-field with-icon"
              placeholder="e.g. Rahul Sharma"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (errorMsg) setErrorMsg("");
              }}
              required
            />
          </div>
        </div>

        {/* 10-Digit Phone Number Field */}
        <div className="form-group">
          <label className="input-label" htmlFor="reg-phone">
            Mobile Number (10-digit Indian number)
          </label>
          <div className="phone-input-wrap">
            <span className="country-code">+91</span>
            <input
              id="reg-phone"
              type="tel"
              className="input-field phone-field"
              placeholder="9876543210"
              value={phoneNumber}
              onChange={handlePhoneChange}
              required
            />
            {phoneNumber.length === 10 && /^[6-9]\d{9}$/.test(phoneNumber) && (
              <CheckCircle2 size={18} className="phone-valid-icon" />
            )}
          </div>
          <span className="field-help">Validation: 10 digits, starts with 6, 7, 8, or 9.</span>
        </div>

        {/* Consent Checkbox */}
        <label className="checkbox-label" onClick={() => setConsentChecked(!consentChecked)}>
          <div className="checkbox-icon">
            {consentChecked ? (
              <CheckSquare size={19} className="text-primary-500" />
            ) : (
              <Square size={19} className="text-muted" />
            )}
          </div>
          <span className="checkbox-text">
            I understand and agree that my name and mobile number will be embedded as a diagonal
            watermark on all downloaded study materials.
          </span>
        </label>

        {/* Action Buttons */}
        <div className="form-actions">
          {isRegistered && (
            <button
              type="button"
              className="btn btn-ghost btn-sm text-danger"
              onClick={() => {
                clearUserProfile();
                addToast("Identity cleared.", "info");
                onClose();
              }}
            >
              Reset Identity
            </button>
          )}

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={isSubmitting || !consentChecked || !fullName.trim() || phoneNumber.length !== 10}
          >
            {isSubmitting ? "Saving Identity..." : isRegistered ? "Update Watermark Profile" : "Continue to Vault"}
          </button>
        </div>
      </form>

      <style>{`
        .reg-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .consent-box {
          background: rgba(99, 102, 241, 0.08);
          border: 1px solid rgba(99, 102, 241, 0.25);
          border-radius: var(--radius-md);
          padding: 1rem 1.15rem;
        }
        .consent-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.35rem;
        }
        .consent-icon {
          color: var(--primary-500);
        }
        .consent-title {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--primary-500);
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }
        .consent-body {
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.45;
          font-style: italic;
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
        .input-with-icon {
          position: relative;
          display: flex;
          align-items: center;
        }
        .field-icon {
          position: absolute;
          left: 0.9rem;
          color: var(--text-muted);
          pointer-events: none;
        }
        .input-field.with-icon {
          padding-left: 2.5rem;
        }
        .phone-input-wrap {
          display: flex;
          align-items: center;
          position: relative;
        }
        .country-code {
          position: absolute;
          left: 0.85rem;
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-secondary);
          pointer-events: none;
        }
        .phone-field {
          padding-left: 3.25rem;
          padding-right: 2.5rem;
          font-weight: 600;
          letter-spacing: 0.05em;
        }
        .phone-valid-icon {
          position: absolute;
          right: 0.85rem;
          color: #10b981;
        }
        .field-help {
          display: block;
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 0.35rem;
        }
        .checkbox-label {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          cursor: pointer;
          user-select: none;
        }
        .checkbox-icon {
          margin-top: 2px;
          flex-shrink: 0;
        }
        .checkbox-text {
          font-size: 0.825rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }
        .form-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-top: 0.5rem;
        }
      `}</style>
    </Modal>
  );
};
