import React, { useState } from "react";
import { UserCheck, Plus, Trash2, ShieldCheck, Phone, User, Sparkles, HeartHandshake } from "lucide-react";
import { useToast } from "../Toast";

export const WhitelistedFriendsManager = ({ whitelistedFriends = [], onAddFriend, onDeleteFriend }) => {
  const { addToast } = useToast();
  const [friendName, setFriendName] = useState("");
  const [friendPhone, setFriendPhone] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleAdd = (e) => {
    e.preventDefault();
    setErrorMsg("");

    const name = friendName.trim();
    const phone = friendPhone.replace(/\D/g, "");

    if (!name || name.length < 2) {
      setErrorMsg("Please enter your friend's name.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      setErrorMsg("Please enter a valid 10-digit Indian phone number.");
      return;
    }

    // Check duplicate
    if (whitelistedFriends.some((f) => f.phone === phone)) {
      setErrorMsg(`Phone number +91 ${phone} is already whitelisted.`);
      return;
    }

    onAddFriend({
      id: `friend_${Date.now()}`,
      name,
      phone,
      addedAt: new Date().toISOString(),
    });

    addToast(`Added "${name}" (+91 ${phone}) to Auto-Approved Friends!`, "success");
    setFriendName("");
    setFriendPhone("");
  };

  return (
    <div className="whitelist-manager-section glass-panel">
      {/* Banner */}
      <div className="whitelist-banner">
        <div className="whitelist-icon-box">
          <HeartHandshake size={28} />
        </div>
        <div>
          <h3 className="whitelist-title">Auto-Approved Friends Whitelist</h3>
          <p className="whitelist-sub">
            Add trusted friends (like <strong>Vishwadeep</strong>) by phone number. When they log in with
            their phone, <strong>all notes are automatically unlocked for them</strong> without waiting
            for manual admin approval!
          </p>
        </div>
      </div>

      {/* Add Friend Form */}
      <form onSubmit={handleAdd} className="add-friend-form">
        {errorMsg && <div className="form-error-alert">{errorMsg}</div>}

        <div className="form-inputs-row">
          <div className="input-group">
            <label className="input-label">Friend's Name</label>
            <div className="input-icon-wrap">
              <User size={16} className="field-icon" />
              <input
                type="text"
                className="input-field with-icon"
                placeholder="e.g. Vishwadeep Patil"
                value={friendName}
                onChange={(e) => setFriendName(e.target.value)}
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">10-Digit Mobile Number</label>
            <div className="input-icon-wrap">
              <Phone size={16} className="field-icon" />
              <input
                type="tel"
                className="input-field with-icon"
                placeholder="e.g. 9823456789"
                maxLength={10}
                value={friendPhone}
                onChange={(e) => setFriendPhone(e.target.value.replace(/\D/g, ""))}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary add-friend-btn">
            <Plus size={18} />
            <span>Add Whitelisted Friend</span>
          </button>
        </div>
      </form>

      {/* Friends List Table */}
      <div className="friends-list-container">
        <div className="friends-list-header">
          <div className="count-tag">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>{whitelistedFriends.length} Whitelisted Friends with VIP Full Access</span>
          </div>
        </div>

        {whitelistedFriends.length > 0 ? (
          <div className="friends-cards-grid">
            {whitelistedFriends.map((friend) => (
              <div key={friend.id || friend.phone} className="friend-card glass-panel">
                <div className="friend-info">
                  <div className="friend-avatar">
                    <UserCheck size={18} />
                  </div>
                  <div>
                    <h4 className="friend-name">{friend.name}</h4>
                    <p className="friend-phone">+91 {friend.phone}</p>
                    <span className="badge badge-done auto-tag">
                      <Sparkles size={11} />
                      <span>Instant Auto-Unlocked</span>
                    </span>
                  </div>
                </div>

                <button
                  className="btn btn-danger btn-sm delete-friend-btn"
                  onClick={() => {
                    onDeleteFriend(friend.id || friend.phone);
                    addToast(`Removed ${friend.name} from Auto-Approved list.`, "info");
                  }}
                  title="Revoke Auto-Approval"
                >
                  <Trash2 size={14} />
                  <span>Revoke</span>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-friends-state">
            <UserCheck size={40} className="text-muted" />
            <p>No friends added yet. Add a friend's phone number above to grant them instant auto-access!</p>
          </div>
        )}
      </div>

      <style>{`
        .whitelist-manager-section {
          padding: 1.75rem;
          margin-bottom: 2rem;
        }
        .whitelist-banner {
          display: flex;
          align-items: flex-start;
          gap: 1.25rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid var(--border-subtle);
          margin-bottom: 1.5rem;
        }
        .whitelist-icon-box {
          width: 52px;
          height: 52px;
          border-radius: var(--radius-lg);
          background: rgba(16, 185, 129, 0.15);
          color: #10b981;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .whitelist-title {
          font-size: 1.35rem;
          font-weight: 800;
          color: var(--text-primary);
        }
        .whitelist-sub {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin-top: 0.25rem;
          line-height: 1.5;
        }
        .add-friend-form {
          margin-bottom: 2rem;
        }
        .form-inputs-row {
          display: flex;
          align-items: flex-end;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .input-group {
          flex: 1;
          min-width: 220px;
        }
        .input-icon-wrap {
          position: relative;
        }
        .field-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }
        .input-field.with-icon {
          padding-left: 2.35rem;
        }
        .add-friend-btn {
          height: 44px;
          white-space: nowrap;
        }
        .form-error-alert {
          background: rgba(239, 68, 68, 0.12);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #ef4444;
          padding: 0.5rem 0.85rem;
          border-radius: var(--radius-md);
          font-size: 0.85rem;
          margin-bottom: 1rem;
        }
        .friends-list-header {
          margin-bottom: 1rem;
        }
        .count-tag {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-primary);
        }
        .friends-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1rem;
        }
        .friend-card {
          padding: 1rem 1.25rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-radius: var(--radius-md);
        }
        .friend-info {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }
        .friend-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(99, 102, 241, 0.12);
          color: var(--primary-500);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .friend-name {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-primary);
        }
        .friend-phone {
          font-size: 0.82rem;
          color: var(--text-muted);
          font-family: monospace;
          margin-bottom: 0.25rem;
        }
        .auto-tag {
          font-size: 0.68rem;
          padding: 0.15rem 0.5rem;
        }
        .empty-friends-state {
          padding: 2.5rem;
          text-align: center;
          color: var(--text-muted);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
        }

        @media (max-width: 640px) {
          .whitelist-manager-section { padding: 1.15rem; }
          .form-inputs-row { flex-direction: column; align-items: stretch; }
          .add-friend-btn { width: 100%; }
        }
      `}</style>
    </div>
  );
};
