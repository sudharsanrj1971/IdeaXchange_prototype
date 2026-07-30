import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUsersApi, type UserProfile } from '../api/users';
import { useProjectsApi, type Project } from '../api/projects';
import RPBadge from '../components/RPBadge';
import ExpertBadge from '../components/ExpertBadge';
import './Profile.css';

export default function Profile() {
  const { user, logout } = useAuth();
  const { getMe, updateMe } = useUsersApi();
  const { listProjects } = useProjectsApi();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [myProjects, setMyProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [prof, allProjects] = await Promise.all([getMe(), listProjects()]);
        setProfile(prof);
        // The backend has no "my projects" endpoint, so this filters the
        // full project list client-side by ownership.
        setMyProjects(allProjects.filter((p) => p.owner._id === prof._id));
        setName(prof.name);
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
      const updated = await updateMe({ name });
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
                : <span>{(profile?.name ?? user?.email ?? 'U')[0].toUpperCase()}</span>
              }
            </div>

            {editing ? (
              <form id="form-edit-profile" onSubmit={handleSave} className="profile-edit-form">
                <div className="profile-field">
                  <label htmlFor="input-display-name">Name</label>
                  <input
                    id="input-display-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
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
                <h1 className="profile-name">{profile?.name}</h1>
                <p className="profile-email">{user?.email}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <RPBadge points={profile?.reputationScore ?? 0} />
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
                <span className="profile-stat-value">⭐ {profile?.reputationScore ?? 0}</span>
                <span className="profile-stat-label">Reputation</span>
              </div>
              <div className="profile-stat">
                <span className="profile-stat-value">💡 {myProjects.length}</span>
                <span className="profile-stat-label">Projects</span>
              </div>
            </div>

            <p className="profile-joined">
              Joined {profile?.createdAt
                ? new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
                : '—'
              }
            </p>
          </div>
        </aside>

        {/* My projects */}
        <main className="profile-main">
          <h2 className="profile-section-title">My Projects</h2>
          {myProjects.length === 0 ? (
            <div className="profile-empty">
              <span>🌱</span>
              <p>You haven't shared any projects yet.</p>
              <Link to="/" className="profile-cta-link">Share your first project →</Link>
            </div>
          ) : (
            <div className="profile-ideas-list">
              {myProjects.map((project) => (
                <Link key={project._id} to={`/projects/${project._id}`} className="profile-idea-card">
                  <div className="profile-idea-header">
                    <h3 className="profile-idea-title">{project.title}</h3>
                    <span className={`idea-status idea-status-${project.status}`}>{project.status}</span>
                  </div>
                  <p className="profile-idea-desc">{project.description}</p>
                  <div className="profile-idea-meta">
                    <span>⚡ {project.impactScore}</span>
                    <span>{new Date(project.createdAt).toLocaleDateString()}</span>
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
