import React, { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { HeroBanner } from "./components/Home/HeroBanner";
import { TodayStudyPlan } from "./components/Home/TodayStudyPlan";
import { StudyPlanCalendar } from "./components/Home/StudyPlanCalendar";
import { NotesLibrary } from "./components/Notes/NotesLibrary";
import { AdminPanel } from "./components/Admin/AdminPanel";
import { RegistrationModal } from "./components/Modals/RegistrationModal";
import { DownloadModal } from "./components/Modals/DownloadModal";
import { ViewNotesModal } from "./components/Modals/ViewNotesModal";
import { AdminLoginModal } from "./components/Admin/AdminLoginModal";
import { ScreenShield } from "./components/Security/ScreenShield";
import { BottomNav } from "./components/Navigation/BottomNav";
import { useAuth } from "./context/AuthContext";
import { useToast } from "./components/Toast";
import {
  db,
  isDemoConfig,
  collection,
  doc,
  setDoc,
  deleteDoc,
  addDoc,
  onSnapshot,
} from "./config/firebase";
import {
  INITIAL_TODAY_PLAN,
  INITIAL_CALENDAR_SCHEDULE,
  INITIAL_MOCK_NOTES,
} from "./config/constants";
import { Shield, BookOpen } from "lucide-react";

export function App() {
  const { isRegistered, isAdmin, userProfile } = useAuth();
  const { addToast } = useToast();

  // Active navigation tab: 'home' | 'notes' | 'admin'
  const [activeTab, setActiveTab] = useState("home");

  // Filter subject when jumping from calendar to notes library
  const [initialLibrarySubject, setInitialLibrarySubject] = useState("All");

  // Notes state
  const [notes, setNotes] = useState(() => {
    try {
      const saved = localStorage.getItem("vault_notes_list");
      return saved ? JSON.parse(saved) : INITIAL_MOCK_NOTES;
    } catch {
      return INITIAL_MOCK_NOTES;
    }
  });

  // Today study plan state
  const [todayPlan, setTodayPlan] = useState(() => {
    try {
      const saved = localStorage.getItem("vault_today_plan");
      return saved ? JSON.parse(saved) : INITIAL_TODAY_PLAN;
    } catch {
      return INITIAL_TODAY_PLAN;
    }
  });

  // 22 Oct to 17 Nov Calendar Schedule state
  const [calendarSchedule, setCalendarSchedule] = useState(() => {
    try {
      const saved = localStorage.getItem("vault_calendar_schedule");
      return saved ? JSON.parse(saved) : INITIAL_CALENDAR_SCHEDULE;
    } catch {
      return INITIAL_CALENDAR_SCHEDULE;
    }
  });

  // Whitelisted Friends state (Auto-approved without manual requests, e.g. Vishwadeep)
  const [whitelistedFriends, setWhitelistedFriends] = useState(() => {
    try {
      const saved = localStorage.getItem("vault_whitelisted_friends");
      return saved
        ? JSON.parse(saved)
        : [
            {
              id: "wl_1",
              name: "Vishwadeep",
              phone: "9823456789",
              addedAt: new Date().toISOString(),
            },
          ];
    } catch {
      return [
        {
          id: "wl_1",
          name: "Vishwadeep",
          phone: "9823456789",
          addedAt: new Date().toISOString(),
        },
      ];
    }
  });

  // Student Unlock & Access Requests state
  const [unlockRequests, setUnlockRequests] = useState(() => {
    try {
      const saved = localStorage.getItem("vault_unlock_requests");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modal states
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [adminLoginModalOpen, setAdminLoginModalOpen] = useState(false);
  const [viewingNoteTarget, setViewingNoteTarget] = useState(null);
  const [pendingViewNote, setPendingViewNote] = useState(null);
  const [downloadNoteTarget, setDownloadNoteTarget] = useState(null);
  const [pendingDownloadNote, setPendingDownloadNote] = useState(null);
  const [pendingUnlockNote, setPendingUnlockNote] = useState(null);

  // Sync with Firestore in real-time if live DB configured
  useEffect(() => {
    if (isDemoConfig || !db) return;

    // Listen to studyPlan/today
    const unsubToday = onSnapshot(
      doc(db, "studyPlan", "today"),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setTodayPlan({
            title: data.title || INITIAL_TODAY_PLAN.title,
            subject: data.subject || INITIAL_TODAY_PLAN.subject,
            subjectFull: data.subjectFull || INITIAL_TODAY_PLAN.subjectFull,
            chapter: data.chapter || INITIAL_TODAY_PLAN.chapter,
            notes: data.notes || INITIAL_TODAY_PLAN.notes,
            status: data.status || "In progress",
            updatedAt: data.updatedAt?.toDate
              ? data.updatedAt.toDate().toISOString()
              : new Date().toISOString(),
          });
        }
      },
      (err) => console.warn("Firestore todayPlan snapshot error:", err.message)
    );

    // Listen to studyPlan/calendar
    const unsubCalendar = onSnapshot(
      doc(db, "studyPlan", "calendar"),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (Array.isArray(data.schedule)) {
            setCalendarSchedule(data.schedule);
            localStorage.setItem("vault_calendar_schedule", JSON.stringify(data.schedule));
          }
        }
      },
      (err) => console.warn("Firestore calendar snapshot error:", err.message)
    );

    // Listen to notes collection
    const unsubNotes = onSnapshot(
      collection(db, "notes"),
      (querySnap) => {
        if (!querySnap.empty) {
          const remoteNotes = [];
          querySnap.forEach((docSnap) => {
            remoteNotes.push({ id: docSnap.id, ...docSnap.data() });
          });
          setNotes((prevNotes) => {
            const remoteIds = new Set(remoteNotes.map((n) => n.id || n.driveUrl));
            const merged = [...remoteNotes];
            (prevNotes || []).forEach((localNote) => {
              const id = localNote.id || localNote.driveUrl;
              if (id && !remoteIds.has(id)) {
                merged.push(localNote);
              }
            });
            localStorage.setItem("vault_notes_list", JSON.stringify(merged));
            return merged;
          });
        }
      },
      (err) => console.warn("Firestore notes snapshot error:", err.message)
    );

    // Listen to whitelist collection
    const unsubWhitelist = onSnapshot(
      collection(db, "whitelist"),
      (snap) => {
        if (!snap.empty) {
          const list = [];
          snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
          setWhitelistedFriends(list);
          localStorage.setItem("vault_whitelisted_friends", JSON.stringify(list));
        }
      },
      (err) => console.warn("Whitelist snapshot error:", err.message)
    );

    // Listen to unlockRequests collection
    const unsubRequests = onSnapshot(
      collection(db, "unlockRequests"),
      (snap) => {
        if (!snap.empty) {
          const list = [];
          snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
          setUnlockRequests(list);
          localStorage.setItem("vault_unlock_requests", JSON.stringify(list));
        }
      },
      (err) => console.warn("UnlockRequests snapshot error:", err.message)
    );

    return () => {
      unsubToday();
      unsubCalendar();
      unsubNotes();
      unsubWhitelist();
      unsubRequests();
    };
  }, []);

  // Save notes locally when updated
  const handleNoteAdded = (newNote) => {
    const updated = [newNote, ...notes];
    setNotes(updated);
    localStorage.setItem("vault_notes_list", JSON.stringify(updated));
  };

  // Trigger secure in-app note viewer
  const handleViewNoteClick = (note) => {
    if (!isRegistered) {
      setPendingViewNote(note);
      setRegisterModalOpen(true);
      addToast("Please register your identity first. It will be dynamically stamped on your note viewer.", "info");
    } else {
      setViewingNoteTarget(note);
    }
  };

  // Trigger download flow (direct watermarking after registration check)
  const handleDownloadClick = (note) => {
    if (!isRegistered) {
      setPendingDownloadNote(note);
      setRegisterModalOpen(true);
      addToast("Please register your identity first. It will be stamped on your note.", "info");
    } else {
      setDownloadNoteTarget(note);
    }
  };

  // Handle student request to unlock a note
  const handleRequestUnlock = async (note) => {
    if (!isRegistered || !userProfile?.phone) {
      setPendingUnlockNote(note);
      setRegisterModalOpen(true);
      addToast("Please register your Name and Mobile Number first to request access.", "info");
      return;
    }

    const cleanPhone = userProfile.phone.replace(/\D/g, "");

    // Check if friend is already whitelisted (VIP auto-approval)
    const isWhitelisted = whitelistedFriends.some(
      (f) => f.phone?.replace(/\D/g, "") === cleanPhone
    );
    if (isWhitelisted) {
      addToast("You are on Amit's Friends Whitelist! Note is already unlocked for you.", "success");
      return;
    }

    // Check if already requested
    const existing = unlockRequests.find(
      (r) => r.noteId === note.id && (r.phone === cleanPhone || r.phone === userProfile.phone)
    );
    if (existing) {
      if (existing.status === "approved") {
        addToast(`Access for "${note.title}" is already approved!`, "success");
      } else {
        addToast(`Access request already submitted. Waiting for Amit to approve.`, "warning");
      }
      return;
    }

    const newRequest = {
      id: `req_${Date.now()}`,
      uid: userProfile.uid || cleanPhone,
      name: userProfile.name,
      phone: cleanPhone,
      noteId: note.id,
      noteTitle: note.title,
      subject: note.subject || "General",
      status: "pending",
      requestedAt: new Date().toISOString(),
    };

    const updated = [newRequest, ...unlockRequests];
    setUnlockRequests(updated);
    localStorage.setItem("vault_unlock_requests", JSON.stringify(updated));

    if (!isDemoConfig && db) {
      try {
        await addDoc(collection(db, "unlockRequests"), newRequest);
      } catch (err) {
        console.warn("Could not save unlock request to remote Firestore:", err.message);
      }
    }

    addToast(`Access request sent to Amit for "${note.title}". You will be able to view and download once approved!`, "success", 5000);
  };

  // Admin approves request
  const handleApproveRequest = async (id, req) => {
    const updated = unlockRequests.map((r) =>
      r.id === id || (r.noteId === req.noteId && r.phone === req.phone)
        ? { ...r, status: "approved" }
        : r
    );
    setUnlockRequests(updated);
    localStorage.setItem("vault_unlock_requests", JSON.stringify(updated));

    if (!isDemoConfig && db && id) {
      try {
        await setDoc(doc(db, "unlockRequests", id), { status: "approved" }, { merge: true });
      } catch (err) {
        console.warn("Could not approve request in Firestore:", err.message);
      }
    }
  };

  // Admin rejects request
  const handleRejectRequest = async (id, req) => {
    const updated = unlockRequests.map((r) =>
      r.id === id ? { ...r, status: "rejected" } : r
    );
    setUnlockRequests(updated);
    localStorage.setItem("vault_unlock_requests", JSON.stringify(updated));

    if (!isDemoConfig && db && id) {
      try {
        await setDoc(doc(db, "unlockRequests", id), { status: "rejected" }, { merge: true });
      } catch (err) {
        console.warn("Could not reject request in Firestore:", err.message);
      }
    }
  };

  // Admin approves all pending requests at once
  const handleApproveAll = async () => {
    const updated = unlockRequests.map((r) => ({ ...r, status: "approved" }));
    setUnlockRequests(updated);
    localStorage.setItem("vault_unlock_requests", JSON.stringify(updated));
  };

  // Whitelisted Friends Management
  const handleAddFriend = async (friend) => {
    const updated = [friend, ...whitelistedFriends];
    setWhitelistedFriends(updated);
    localStorage.setItem("vault_whitelisted_friends", JSON.stringify(updated));

    if (!isDemoConfig && db) {
      try {
        await setDoc(doc(db, "whitelist", friend.id || `friend_${Date.now()}`), friend);
      } catch (err) {
        console.warn("Could not add friend to Firestore:", err.message);
      }
    }
  };

  const handleDeleteFriend = async (id) => {
    const updated = whitelistedFriends.filter((f) => f.id !== id && f.phone !== id);
    setWhitelistedFriends(updated);
    localStorage.setItem("vault_whitelisted_friends", JSON.stringify(updated));

    if (!isDemoConfig && db) {
      try {
        await deleteDoc(doc(db, "whitelist", id));
      } catch (err) {
        console.warn("Could not remove friend from Firestore:", err.message);
      }
    }
  };

  // Called after successful user registration
  const handleRegistrationSuccess = () => {
    if (pendingViewNote) {
      setViewingNoteTarget(pendingViewNote);
      setPendingViewNote(null);
    }
    if (pendingDownloadNote) {
      setDownloadNoteTarget(pendingDownloadNote);
      setPendingDownloadNote(null);
    }
    if (pendingUnlockNote) {
      handleRequestUnlock(pendingUnlockNote);
      setPendingUnlockNote(null);
    }
  };

  // Jump from calendar to notes library with subject filter pre-selected
  const handleSelectSubjectFromCalendar = (subj) => {
    setInitialLibrarySubject(subj);
    setActiveTab("notes");
  };

  return (
    <div className="app-shell">
      {/* Anti-Screenshot, Anti-Copy & Dynamic Watermark Screen Shield */}
      <ScreenShield />

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenRegister={() => setRegisterModalOpen(true)}
        onOpenAdminLogin={() => {
          if (isAdmin) {
            setActiveTab("admin");
          } else {
            setAdminLoginModalOpen(true);
          }
        }}
      />

      <main className="app-container">
        {/* TAB 1: HOME PAGE */}
        {activeTab === "home" && (
          <div className="animate-fade-in">
            <HeroBanner
              onExploreNotes={() => setActiveTab("notes")}
              totalNotes={notes.length}
              onRegisterClick={() => setRegisterModalOpen(true)}
              isRegistered={isRegistered}
            />

            {/* "Today's Study Plan" card */}
            <TodayStudyPlan
              todayPlan={todayPlan}
              onEditClick={() => setActiveTab("admin")}
              isAdmin={isAdmin}
              onBrowseNotes={() => setActiveTab("notes")}
            />

            {/* Interactive Exam Calendar (22 Oct to 17 Nov) */}
            <StudyPlanCalendar
              schedule={calendarSchedule}
              onEditClick={() => setActiveTab("admin")}
              isAdmin={isAdmin}
              onSelectSubject={handleSelectSubjectFromCalendar}
            />
          </div>
        )}

        {/* TAB 2: NOTES LIBRARY */}
        {activeTab === "notes" && (
          <div className="animate-fade-in">
            <NotesLibrary
              notes={notes}
              onViewNoteClick={handleViewNoteClick}
              onDownloadClick={handleDownloadClick}
              onRequestUnlock={handleRequestUnlock}
              whitelistedFriends={whitelistedFriends}
              unlockRequests={unlockRequests}
              userProfile={userProfile}
              isAdmin={isAdmin}
              initialSubject={initialLibrarySubject}
            />
          </div>
        )}

        {/* TAB 3: ADMIN PANEL (Protected) */}
        {activeTab === "admin" && (
          <div className="animate-fade-in">
            {isAdmin ? (
              <AdminPanel
                todayPlan={todayPlan}
                setTodayPlan={setTodayPlan}
                calendarSchedule={calendarSchedule}
                setCalendarSchedule={setCalendarSchedule}
                onNoteAdded={handleNoteAdded}
                notes={notes}
                setNotes={setNotes}
                unlockRequests={unlockRequests}
                onApproveRequest={handleApproveRequest}
                onRejectRequest={handleRejectRequest}
                onApproveAll={handleApproveAll}
                whitelistedFriends={whitelistedFriends}
                onAddFriend={handleAddFriend}
                onDeleteFriend={handleDeleteFriend}
              />
            ) : (
              <div className="admin-locked-screen glass-panel">
                <Shield size={48} className="text-primary-500 mb-3" />
                <h3 className="text-xl font-bold mb-2">Admin Authentication Required</h3>
                <p className="text-muted mb-4 max-w-md">
                  This section is strictly restricted to Amit Garje. Enter your passcode to unlock.
                </p>
                <button
                  className="btn btn-primary"
                  onClick={() => setAdminLoginModalOpen(true)}
                >
                  Unlock Admin Dashboard
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="vault-footer">
        <div className="footer-content">
          <div className="footer-left">
            <div className="footer-brand">
              <Shield size={18} className="text-primary-500" />
              <span className="font-bold">Amit's Notes Vault</span>
            </div>
            <p className="footer-copy">
              Anti-leak watermarked distribution system for college engineering study notes.
            </p>
          </div>

          <div className="footer-center">
            <span className="maker-badge">
              Made by <strong>Amit Garje</strong> • Target Exam: <strong>17 Nov 2026</strong>
            </span>
          </div>

          <div className="footer-right">
            <button className="footer-link" onClick={() => setActiveTab("home")}>
              Exam Calendar
            </button>
            <button className="footer-link" onClick={() => setActiveTab("notes")}>
              Notes Library
            </button>
            <button
              className="footer-link"
              onClick={() => {
                if (isAdmin) setActiveTab("admin");
                else setAdminLoginModalOpen(true);
              }}
            >
              Admin {isAdmin ? "(Active)" : "Login"}
            </button>
          </div>
        </div>
      </footer>

      {/* MOBILE BOTTOM NAVIGATION BAR (< 600px) */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenRegister={() => setRegisterModalOpen(true)}
        onOpenAdminLogin={() => {
          if (isAdmin) setActiveTab("admin");
          else setAdminLoginModalOpen(true);
        }}
      />

      {/* MODALS */}
      <RegistrationModal
        isOpen={registerModalOpen}
        onClose={() => {
          setRegisterModalOpen(false);
          setPendingViewNote(null);
          setPendingDownloadNote(null);
        }}
        onSuccess={handleRegistrationSuccess}
      />

      <ViewNotesModal
        isOpen={Boolean(viewingNoteTarget)}
        onClose={() => setViewingNoteTarget(null)}
        note={viewingNoteTarget}
      />

      <DownloadModal
        isOpen={Boolean(downloadNoteTarget)}
        onClose={() => setDownloadNoteTarget(null)}
        note={downloadNoteTarget}
      />

      <AdminLoginModal
        isOpen={adminLoginModalOpen}
        onClose={() => setAdminLoginModalOpen(false)}
        onSuccess={() => setActiveTab("admin")}
      />

      <style>{`
        .app-shell {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        main {
          flex: 1;
        }
        .admin-locked-screen {
          padding: 4rem 2rem;
          margin: 3rem 0;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .vault-footer {
          background: var(--bg-surface);
          border-top: 1px solid var(--border-subtle);
          padding: 2rem 1.25rem;
          margin-top: auto;
        }
        .footer-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.5rem;
          flex-wrap: wrap;
        }
        .footer-brand {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1rem;
        }
        .footer-copy {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-top: 0.2rem;
        }
        .maker-badge {
          background: var(--bg-surface-elevated);
          padding: 0.4rem 0.85rem;
          border-radius: var(--radius-full);
          border: 1px solid var(--border-subtle);
          font-size: 0.85rem;
          color: var(--text-secondary);
        }
        .maker-badge strong {
          color: var(--text-primary);
        }
        .footer-right {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }
        .footer-link {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-secondary);
          transition: color var(--transition-fast);
        }
        .footer-link:hover {
          color: var(--primary-500);
        }

        @media (max-width: 640px) {
          .footer-content {
            flex-direction: column;
            text-align: center;
            gap: 1rem;
          }
          .footer-right {
            flex-wrap: wrap;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}

export default App;
