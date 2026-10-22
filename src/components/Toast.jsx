import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info", duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast-card toast-${toast.type} animate-fade-in`}>
            <div className="toast-icon">
              {toast.type === "success" && <CheckCircle2 size={18} className="text-emerald-500" />}
              {toast.type === "error" && <XCircle size={18} className="text-rose-500" />}
              {toast.type === "warning" && <AlertTriangle size={18} className="text-amber-500" />}
              {toast.type === "info" && <Info size={18} className="text-indigo-500" />}
            </div>
            <div className="toast-message">{toast.message}</div>
            <button className="toast-close" onClick={() => removeToast(toast.id)}>
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
      <style>{`
        .toast-container {
          position: fixed;
          bottom: 1.5rem;
          right: 1.5rem;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          max-width: 380px;
          width: calc(100% - 3rem);
          pointer-events: none;
        }
        .toast-card {
          pointer-events: auto;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.85rem 1rem;
          border-radius: var(--radius-md);
          background: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          box-shadow: var(--shadow-xl);
          color: var(--text-primary);
          font-size: 0.9rem;
          backdrop-filter: var(--glass-blur);
        }
        .toast-success { border-left: 4px solid #10b981; }
        .toast-error { border-left: 4px solid #ef4444; }
        .toast-warning { border-left: 4px solid #f59e0b; }
        .toast-info { border-left: 4px solid #6366f1; }
        .toast-icon { display: flex; align-items: center; flex-shrink: 0; }
        .toast-message { flex: 1; line-height: 1.35; font-weight: 500; }
        .toast-close {
          color: var(--text-muted);
          padding: 2px;
          border-radius: 4px;
          transition: color 0.15s;
        }
        .toast-close:hover { color: var(--text-primary); }
      `}</style>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      addToast: (msg) => console.log("Toast:", msg),
    };
  }
  return context;
};
