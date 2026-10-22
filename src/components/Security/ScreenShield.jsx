import React, { useEffect, useState } from "react";
import { ShieldAlert, EyeOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../Toast";

/**
 * ScreenShield: Comprehensive anti-screenshot & content privacy protection.
 * - Disables right-click context menu & text copying on protected content.
 * - Blocks Print (Ctrl+P, window.print) with a blackout print stylesheet.
 * - Detects PrintScreen key & blurs window when screen-capture / snipping tool is opened.
 * - Dynamic translucent on-screen watermark showing user's name & phone to prevent phone-camera leaks.
 */
export const ScreenShield = () => {
  const { userProfile, isRegistered } = useAuth();
  const { addToast } = useToast();
  const [isWindowBlurred, setIsWindowBlurred] = useState(false);

  useEffect(() => {
    // 1. Disable Right-Click Context Menu
    const handleContextMenu = (e) => {
      e.preventDefault();
      addToast("Right-click is disabled to protect study note content.", "warning", 2500);
      return false;
    };

    // 2. Intercept PrintScreen, Ctrl+P, Ctrl+S, Ctrl+U, F12
    const handleKeyDown = (e) => {
      // PrintScreen key
      if (e.key === "PrintScreen") {
        e.preventDefault();
        // Clear clipboard
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText("Screenshots of Amit's Notes are prohibited.");
        }
        addToast("⚠️ Screenshots are prohibited to protect note vault content.", "warning", 3000);
      }

      // Ctrl+P / Cmd+P (Print)
      if ((e.ctrlKey || e.metaKey) && (e.key === "p" || e.key === "P")) {
        e.preventDefault();
        addToast("Printing is disabled for secure notes.", "warning", 2500);
      }

      // Ctrl+S / Cmd+S (Save webpage)
      if ((e.ctrlKey || e.metaKey) && (e.key === "s" || e.key === "S")) {
        e.preventDefault();
        addToast("Saving source files is disabled.", "warning", 2500);
      }

      // Ctrl+U (View Source)
      if ((e.ctrlKey || e.metaKey) && (e.key === "u" || e.key === "U")) {
        e.preventDefault();
      }
    };

    // 3. Screen capture tool detection via window blur
    const handleWindowBlur = () => {
      setIsWindowBlurred(true);
    };

    const handleWindowFocus = () => {
      setIsWindowBlurred(false);
    };

    document.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("focus", handleWindowFocus);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, [addToast]);

  return (
    <>
      {/* Privacy Shield Overlay when screen capture/snipping tool is active */}
      {isWindowBlurred && (
        <div className="privacy-blur-overlay">
          <div className="privacy-blur-badge">
            <EyeOff size={22} className="text-amber-400" />
            <div>
              <div className="font-bold">Content Shield Active</div>
              <div className="text-xs opacity-80">Window unfocused • Note protection enabled</div>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Screen Watermark (Prevents phone-camera photo leaks) */}
      {isRegistered && userProfile && (
        <div className="screen-watermark-grid" aria-hidden="true">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="screen-watermark-item">
              <span className="watermark-bold">{userProfile.name}</span>
              <span className="watermark-sub">+91 {userProfile.phone} • Amit's Vault</span>
            </div>
          ))}
        </div>
      )}

      <style>{`
        /* Global CSS Content Selection Protection */
        body {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }

        /* Anti-Print Media Query */
        @media print {
          html, body {
            display: none !important;
            visibility: hidden !important;
          }
        }

        /* Privacy Shield when Snipping Tool is triggered */
        .privacy-blur-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          backdrop-filter: blur(28px);
          -webkit-backdrop-filter: blur(28px);
          background: rgba(10, 13, 20, 0.4);
          z-index: 99999;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
          animation: fadeIn 0.15s ease-out;
        }
        .privacy-blur-badge {
          background: rgba(17, 22, 36, 0.95);
          border: 1px solid rgba(245, 158, 11, 0.4);
          color: #f8fafc;
          padding: 0.85rem 1.5rem;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          gap: 0.85rem;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
        }

        /* Ambient Dynamic On-Screen Watermark */
        .screen-watermark-grid {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          pointer-events: none;
          z-index: 900;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          grid-template-rows: repeat(3, 1fr);
          padding: 2rem;
          overflow: hidden;
        }
        .screen-watermark-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          transform: rotate(-24deg);
          color: rgba(99, 102, 241, 0.055);
          font-family: var(--font-display);
          line-height: 1.15;
          text-align: center;
        }
        [data-theme='dark'] .screen-watermark-item {
          color: rgba(255, 255, 255, 0.038);
        }
        .watermark-bold {
          font-size: 1.15rem;
          font-weight: 800;
          letter-spacing: 0.04em;
        }
        .watermark-sub {
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.02em;
        }
      `}</style>
    </>
  );
};
