import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUsersApi, type UserProfile } from '../api/users';
import { useIdeasApi, type Idea } from '../api/ideas';
import RPBadge from '../components/RPBadge';
import ExpertBadge from '../components/ExpertBadge';
import './Profile.css';

export default function Profile() {
  const { user, logout } = useAuth();
  const { getMe, updateMe } = useUsersApi();
  const { getMyIdeas } = useIdeasApi();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [myIdeas, setMyIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [prof, ideas] = await Promise.all([getMe(), getMyIdeas()]);
        setProfile(prof);
        setMyIdeas(ideas);
        setDisplayName(prof.displayName);
        setBio(prof.bio ?? '');
      } catch (e) {
        setError('Failed to load profile. Is the server running?');
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updateMe({ displayName, bio });
      setProfile(updated);
      setEditing(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="profile-center">
      <div className="spinner" /><p>Loading profile…</p>
    </div>
  );

  if (error) return (
    <div className="profile-center">
      <p className="profile-error">{error}</p>
      <Link to="/" className="profile-link">← Dashboard</Link>
    </div>
  );

  return (
    <div className="profile-root">
      {/* Nav */}
      <nav className="profile-nav">
        <Link to="/" id="link-dashboard" className="profile-link">← Dashboard</Link>
        <button id="btn-logout" className="profile-logout" onClick={() => { logout(); navigate('/login'); }}>
          Logout
        </button>
      </nav>

      <div className="profile-layout">
        {/* Profile card */}
        <aside className="profile-sidebar">
          <div className="profile-card">
            <div className="profile-avatar">
              {user?.photoURL
                ? <img src={user.photoURL} alt="avatar" />
                : <span>{(profile?.displayName ?? user?.email ?? 'U')[0].toUpperCase()}</span>
              }
            </div>

            {editing ? (
              <form id="form-edit-profile" onSubmit={handleSave} className="profile-edit-form">
                <div className="profile-field">
                  <label htmlFor="input-display-name">Display Name</label>
                  <input
                    id="input-display-name"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                  />
                </div>
                <div className="profile-field">
                  <label htmlFor="input-bio">Bio</label>
                  <textarea
                    id="input-bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell the community about yourself…"
                    rows={4}
                  />
                </div>
                <div className="profile-edit-actions">
                  <button id="btn-save-profile" type="submit" className="profile-save-btn" disabled={saving}>
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                  <button type="button" className="profile-cancel-btn" onClick={() => setEditing(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <h1 className="profile-name">{profile?.displayName}</h1>
                <p className="profile-email">{user?.email}</p>
                {profile?.bio && <p className="profile-bio">{profile.bio}</p>}
                <div className="flex flex-wrap gap-2 mt-2">
                  <RPBadge points={profile?.reputation ?? 0} />
                  <ExpertBadge isExpert={profile?.role === 'expert'} />
                </div>
                <button id="btn-edit-profile" className="profile-edit-btn" onClick={() => setEditing(true)}>
                  Edit Profile
                </button>
              </>
            )}

            {/* Stats */}
            <div className="profile-stats">
              <div className="profile-stat">
                <span className="profile-stat-value">⭐ {profile?.reputation ?? 0}</span>
                <span className="profile-stat-label">Reputation</span>
              </div>
              <div className="profile-stat">
                <span className="profile-stat-value">💡 {profile?.ideasCount ?? myIdeas.length}</span>
                <span className="profile-stat-label">Ideas</span>
              </div>
              <div className="profile-stat">
                <span className="profile-stat-value">🤝 {profile?.contributionsCount ?? 0}</span>
                <span className="profile-stat-label">Contributions</span>
              </div>
            </div>

            <p className="profile-joined">
              Joined {profile?.joinedAt
                ? new Date(profile.joinedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
                : '—'
              }
            </p>
          </div>
        </aside>

        {/* My ideas */}
        <main className="profile-main">
          <h2 className="profile-section-title">My Ideas</h2>
          {myIdeas.length === 0 ? (
            <div className="profile-empty">
              <span>🌱</span>
              <p>You haven't shared any ideas yet.</p>
              <Link to="/" className="profile-cta-link">Share your first idea →</Link>
            </div>
          ) : (
            <div className="profile-ideas-list">
              {myIdeas.map((idea) => (
                <Link key={idea._id} to={`/ideas/${idea._id}`} className="profile-idea-card">
                  <div className="profile-idea-header">
                    <h3 className="profile-idea-title">{idea.title}</h3>
                    <span className={`idea-status idea-status-${idea.status}`}>{idea.status}</span>
                  </div>
                  <p className="profile-idea-desc">{idea.description}</p>
                  <div className="profile-idea-meta">
                    <span>▲ {idea.upvotes}</span>
                    <span>💬 {idea.contributionCount}</span>
                    <span>{new Date(idea.createdAt).toLocaleDateString()}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
