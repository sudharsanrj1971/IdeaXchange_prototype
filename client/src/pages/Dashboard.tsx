import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProjectsApi, type Project } from '../api/projects';
import './Dashboard.css';

type SortMode = 'newest' | 'impact';

const TAG_OPTIONS = ['AI', 'Web', 'Mobile', 'Design', 'Data', 'Blockchain', 'Education', 'Health'];

export default function Dashboard() {
  const { user, profile, logout } = useAuth();
  const { listProjects, createProject } = useProjectsApi();
  const navigate = useNavigate();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sort, setSort] = useState<SortMode>('newest');
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('');

  // Create project modal
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newTags, setNewTags] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);

  const loadProjects = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listProjects();
      setProjects(data);
    } catch (e) {
      setError('Failed to load projects. Is the server running?');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  // The backend has no search/sort/tag query params (see api/projects.ts),
  // so filtering and sorting happen here against the full list.
  const visibleProjects = useMemo(() => {
    let result = projects;
    if (selectedTag) {
      result = result.filter((p) => p.tags.includes(selectedTag));
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (p) => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q),
      );
    }
    return [...result].sort((a, b) =>
      sort === 'impact'
        ? b.impactScore - a.impactScore
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [projects, selectedTag, search, sort]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const project = await createProject({ title: newTitle, description: newDesc, tags: newTags });
      setProjects((prev) => [project, ...prev]);
      setShowCreate(false);
      setNewTitle('');
      setNewDesc('');
      setNewTags([]);
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

  const toggleNewTag = (tag: string) => {
    setNewTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  };

  return (
    <div className="dash-root">
      {/* Navbar */}
      <nav className="dash-nav">
        <div className="dash-nav-brand">
          <span className="dash-nav-icon">💡</span>
          <span className="dash-nav-title">IdeaXchange</span>
        </div>
        <div className="dash-nav-actions">
          <button id="btn-create-idea" className="dash-create-btn" onClick={() => setShowCreate(true)}>
            + New Project
          </button>
          <Link to="/profile" className="dash-avatar" title={profile?.name ?? user?.email ?? ''}>
            {user?.photoURL
              ? <img src={user.photoURL} alt="avatar" className="dash-avatar-img" />
              : <span className="dash-avatar-initial">
                  {(profile?.name ?? user?.email ?? 'U')[0].toUpperCase()}
                </span>
            }
          </Link>
          <button id="btn-logout" className="dash-logout-btn" onClick={() => { logout(); navigate('/login'); }} title="Logout">
            ↩
          </button>
        </div>
      </nav>

      {/* Hero */}
      <header className="dash-hero">
        <h1>Discover & Build Together</h1>
        <p>Share your ideas, find collaborators, build something amazing</p>

        <form id="form-search" className="dash-search" onSubmit={handleSearch}>
          <input
            id="input-search"
            type="text"
            placeholder="Search projects…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button id="btn-search" type="submit">Search</button>
        </form>
      </header>

      {/* Controls */}
      <div className="dash-controls">
        <div className="dash-tags">
          {TAG_OPTIONS.map((tag) => (
            <button
              key={tag}
              id={`tag-${tag.toLowerCase()}`}
              className={`dash-tag ${selectedTag === tag ? 'active' : ''}`}
              onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
            >
              {tag}
            </button>
          ))}
        </div>
        <div className="dash-sort">
          {(['newest', 'impact'] as SortMode[]).map((s) => (
            <button
              key={s}
              id={`sort-${s}`}
              className={`dash-sort-btn ${sort === s ? 'active' : ''}`}
              onClick={() => setSort(s)}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="dash-main">
        {loading && (
          <div className="dash-loading">
            <div className="spinner" />
            <p>Loading projects…</p>
          </div>
        )}
        {error && (
          <div className="dash-error">
            <p>{error}</p>
            <button onClick={loadProjects}>Retry</button>
          </div>
        )}
        {!loading && !error && visibleProjects.length === 0 && (
          <div className="dash-empty">
            <span className="dash-empty-icon">🌱</span>
            <p>No projects yet. Be the first to share one!</p>
            <button onClick={() => setShowCreate(true)}>Share a Project</button>
          </div>
        )}
        {!loading && !error && visibleProjects.length > 0 && (
          <div className="dash-grid">
            {visibleProjects.map((project) => (
              <article key={project._id} className="idea-card">
                <div className="idea-card-header">
                  <div className="idea-card-author">
                    <span className="idea-author-avatar">
                      {project.owner.name[0].toUpperCase()}
                    </span>
                    <span className="idea-author-name">{project.owner.name}</span>
                  </div>
                  <span className={`idea-status idea-status-${project.status}`}>{project.status}</span>
                </div>

                <Link to={`/projects/${project._id}`} className="idea-card-title">
                  {project.title}
                </Link>

                <p className="idea-card-desc">{project.description}</p>

                {project.tags.length > 0 && (
                  <div className="idea-tags">
                    {project.tags.map((tag) => (
                      <span key={tag} className="idea-tag">{tag}</span>
                    ))}
                  </div>
                )}

                <div className="idea-card-footer">
                  <span className="idea-contributions">
                    ⚡ {project.impactScore} impact
                  </span>
                  <span className="idea-date">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* Create Project Modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Share a New Project</h2>
              <button id="btn-close-modal" className="modal-close" onClick={() => setShowCreate(false)}>✕</button>
            </div>
            <form id="form-create-idea" onSubmit={handleCreate}>
              <div className="modal-field">
                <label htmlFor="input-idea-title">Title</label>
                <input
                  id="input-idea-title"
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="A concise, compelling title"
                  required
                  maxLength={120}
                />
              </div>
              <div className="modal-field">
                <label htmlFor="input-idea-desc">Description</label>
                <textarea
                  id="input-idea-desc"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="What's the problem? What's your solution?"
                  required
                  rows={5}
                />
              </div>
              <div className="modal-field">
                <label>Tags</label>
                <div className="modal-tags">
                  {TAG_OPTIONS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      id={`modal-tag-${tag.toLowerCase()}`}
                      className={`dash-tag ${newTags.includes(tag) ? 'active' : ''}`}
                      onClick={() => toggleNewTag(tag)}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              <button
                id="btn-submit-idea"
                type="submit"
                className="modal-submit-btn"
                disabled={creating}
              >
                {creating ? 'Posting…' : 'Post Project'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
