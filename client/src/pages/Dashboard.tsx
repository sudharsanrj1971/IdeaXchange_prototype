import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useIdeasApi, type Idea } from '../api/ideas';
import './Dashboard.css';

type SortMode = 'newest' | 'top' | 'trending';

const TAG_OPTIONS = ['AI', 'Web', 'Mobile', 'Design', 'Data', 'Blockchain', 'Education', 'Health'];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { listIdeas, upvoteIdea, createIdea } = useIdeasApi();
  const navigate = useNavigate();

  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sort, setSort] = useState<SortMode>('newest');
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('');

  // Create idea modal
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newTags, setNewTags] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);

  const loadIdeas = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listIdeas({ sort, search, tags: selectedTag });
      setIdeas(data.ideas);
    } catch (e) {
      setError('Failed to load ideas. Is the server running?');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIdeas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort, selectedTag]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadIdeas();
  };

  const handleUpvote = async (idea: Idea) => {
    try {
      const updated = await upvoteIdea(idea._id);
      setIdeas((prev) => prev.map((i) => (i._id === updated._id ? updated : i)));
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const idea = await createIdea({ title: newTitle, description: newDesc, tags: newTags });
      setIdeas((prev) => [idea, ...prev]);
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
            + New Idea
          </button>
          <Link to="/profile" className="dash-avatar" title={user?.displayName ?? user?.email ?? ''}>
            {user?.photoURL
              ? <img src={user.photoURL} alt="avatar" className="dash-avatar-img" />
              : <span className="dash-avatar-initial">
                  {(user?.displayName ?? user?.email ?? 'U')[0].toUpperCase()}
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

        {/* Search */}
        <form id="form-search" className="dash-search" onSubmit={handleSearch}>
          <input
            id="input-search"
            type="text"
            placeholder="Search ideas…"
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
          {(['newest', 'top', 'trending'] as SortMode[]).map((s) => (
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
            <p>Loading ideas…</p>
          </div>
        )}
        {error && (
          <div className="dash-error">
            <p>{error}</p>
            <button onClick={loadIdeas}>Retry</button>
          </div>
        )}
        {!loading && !error && ideas.length === 0 && (
          <div className="dash-empty">
            <span className="dash-empty-icon">🌱</span>
            <p>No ideas yet. Be the first to share one!</p>
            <button onClick={() => setShowCreate(true)}>Share an Idea</button>
          </div>
        )}
        {!loading && !error && ideas.length > 0 && (
          <div className="dash-grid">
            {ideas.map((idea) => (
              <article key={idea._id} className="idea-card">
                <div className="idea-card-header">
                  <div className="idea-card-author">
                    <span className="idea-author-avatar">
                      {idea.author.avatarUrl
                        ? <img src={idea.author.avatarUrl} alt="" />
                        : idea.author.displayName[0].toUpperCase()
                      }
                    </span>
                    <span className="idea-author-name">{idea.author.displayName}</span>
                  </div>
                  <span className={`idea-status idea-status-${idea.status}`}>{idea.status}</span>
                </div>

                <Link to={`/ideas/${idea._id}`} className="idea-card-title">
                  {idea.title}
                </Link>

                <p className="idea-card-desc">{idea.description}</p>

                {idea.tags.length > 0 && (
                  <div className="idea-tags">
                    {idea.tags.map((tag) => (
                      <span key={tag} className="idea-tag">{tag}</span>
                    ))}
                  </div>
                )}

                <div className="idea-card-footer">
                  <button
                    id={`btn-upvote-${idea._id}`}
                    className="idea-upvote-btn"
                    onClick={() => handleUpvote(idea)}
                  >
                    ▲ {idea.upvotes}
                  </button>
                  <span className="idea-contributions">
                    💬 {idea.contributionCount} contributions
                  </span>
                  <span className="idea-date">
                    {new Date(idea.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* Create Idea Modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Share a New Idea</h2>
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
                {creating ? 'Posting…' : 'Post Idea'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
