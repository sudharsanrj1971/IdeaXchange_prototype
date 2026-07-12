import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useIdeasApi, type Idea } from '../api/ideas';
import { useContributionsApi, type Contribution } from '../api/contributions';
import { useIdeaSocket } from '../hooks/useIdeaSocket';
import './IdeaDetail.css';

const CONTRIBUTION_TYPES = ['code', 'design', 'research', 'feedback', 'other'] as const;

export default function IdeaDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { getIdea, upvoteIdea } = useIdeasApi();
  const { listContributions, createContribution, approveContribution, rejectContribution, upvoteContribution } =
    useContributionsApi();

  const [idea, setIdea] = useState<Idea | null>(null);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // New contribution form
  const [contType, setContType] = useState<Contribution['type']>('feedback');
  const [contContent, setContContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Real-time socket
  const { newContributions, updatedContributions } = useIdeaSocket(id);

  // Merge socket events into state
  const mergedRef = useRef(false);
  useEffect(() => {
    if (newContributions.length > 0) {
      setContributions((prev) => {
        const ids = new Set(prev.map((c) => c._id));
        const fresh = newContributions.filter((c) => !ids.has(c._id));
        return [...fresh, ...prev];
      });
    }
  }, [newContributions]);

  useEffect(() => {
    if (updatedContributions.length > 0) {
      setContributions((prev) =>
        prev.map((c) => {
          const updated = updatedContributions.find((u) => u._id === c._id);
          return updated ?? c;
        }),
      );
    }
  }, [updatedContributions]);

  useEffect(() => {
    mergedRef.current = false;
  }, [id]);

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const [ideaData, contData] = await Promise.all([getIdea(id), listContributions(id)]);
      setIdea(ideaData);
      setContributions(contData);
    } catch (e) {
      setError('Failed to load idea. Is the server running?');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleUpvote = async () => {
    if (!idea) return;
    try {
      const updated = await upvoteIdea(idea._id);
      setIdea(updated);
    } catch (e) { console.error(e); }
  };

  const handleSubmitContribution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSubmitting(true);
    try {
      const cont = await createContribution(id, { type: contType, content: contContent });
      setContributions((prev) => [cont, ...prev]);
      setContContent('');
    } catch (e) { console.error(e); }
    finally { setSubmitting(false); }
  };

  const handleApprove = async (cont: Contribution) => {
    if (!id) return;
    try {
      const updated = await approveContribution(id, cont._id);
      setContributions((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));
    } catch (e) { console.error(e); }
  };

  const handleReject = async (cont: Contribution) => {
    if (!id) return;
    try {
      const updated = await rejectContribution(id, cont._id);
      setContributions((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));
    } catch (e) { console.error(e); }
  };

  const handleUpvoteCont = async (cont: Contribution) => {
    if (!id) return;
    try {
      const updated = await upvoteContribution(id, cont._id);
      setContributions((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));
    } catch (e) { console.error(e); }
  };

  const isOwner = idea && user?.uid === (idea.author as any)?._id;

  if (loading) return (
    <div className="detail-center">
      <div className="spinner" /><p>Loading…</p>
    </div>
  );

  if (error || !idea) return (
    <div className="detail-center">
      <p className="detail-error">{error || 'Idea not found.'}</p>
      <Link to="/" className="detail-back-link">← Back to Dashboard</Link>
    </div>
  );

  return (
    <div className="detail-root">
      {/* Back nav */}
      <nav className="detail-nav">
        <Link to="/" id="link-back" className="detail-back-link">← Back to Ideas</Link>
        <div className="detail-nav-right">
          <Link to="/profile" className="detail-profile-link">My Profile</Link>
        </div>
      </nav>

      <div className="detail-layout">
        {/* Left: Idea info */}
        <main className="detail-main">
          <div className="detail-card">
            <div className="detail-header">
              <div className="detail-author">
                <span className="detail-avatar">
                  {idea.author.avatarUrl
                    ? <img src={idea.author.avatarUrl} alt="" />
                    : idea.author.displayName[0].toUpperCase()
                  }
                </span>
                <div>
                  <p className="detail-author-name">{idea.author.displayName}</p>
                  <p className="detail-date">{new Date(idea.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>
              <span className={`idea-status idea-status-${idea.status}`}>{idea.status}</span>
            </div>

            <h1 className="detail-title">{idea.title}</h1>
            <p className="detail-desc">{idea.description}</p>

            {idea.tags.length > 0 && (
              <div className="idea-tags detail-tags">
                {idea.tags.map((tag) => (
                  <span key={tag} className="idea-tag">{tag}</span>
                ))}
              </div>
            )}

            <div className="detail-actions">
              <button id="btn-upvote-idea" className="idea-upvote-btn" onClick={handleUpvote}>
                ▲ {idea.upvotes} upvotes
              </button>
              <span className="detail-stat">💬 {idea.contributionCount} contributions</span>
            </div>
          </div>

          {/* Contribution form */}
          <div className="detail-card">
            <h2 className="detail-section-title">Add Your Contribution</h2>
            <form id="form-add-contribution" onSubmit={handleSubmitContribution} className="cont-form">
              <div className="cont-type-selector">
                {CONTRIBUTION_TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    id={`cont-type-${t}`}
                    className={`cont-type-btn ${contType === t ? 'active' : ''}`}
                    onClick={() => setContType(t)}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
              <textarea
                id="input-contribution-content"
                value={contContent}
                onChange={(e) => setContContent(e.target.value)}
                placeholder="Share your contribution, feedback, or idea…"
                rows={5}
                required
                className="cont-textarea"
              />
              <button
                id="btn-submit-contribution"
                type="submit"
                className="cont-submit-btn"
                disabled={submitting}
              >
                {submitting ? 'Submitting…' : 'Submit Contribution'}
              </button>
            </form>
          </div>
        </main>

        {/* Right: Contributions */}
        <aside className="detail-aside">
          <h2 className="detail-section-title">
            Contributions <span className="cont-count">{contributions.length}</span>
          </h2>
          {contributions.length === 0 && (
            <p className="detail-empty">No contributions yet. Be the first!</p>
          )}
          <div className="cont-list">
            {contributions.map((cont) => (
              <div key={cont._id} className={`cont-card cont-status-${cont.status}`}>
                <div className="cont-card-header">
                  <div className="detail-author">
                    <span className="detail-avatar detail-avatar-sm">
                      {cont.author.avatarUrl
                        ? <img src={cont.author.avatarUrl} alt="" />
                        : cont.author.displayName[0].toUpperCase()
                      }
                    </span>
                    <div>
                      <p className="detail-author-name">{cont.author.displayName}</p>
                      <p className="detail-date">{new Date(cont.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="cont-badges">
                    <span className={`cont-type-badge cont-type-${cont.type}`}>{cont.type}</span>
                    <span className={`cont-status-badge cont-status-b-${cont.status}`}>{cont.status}</span>
                  </div>
                </div>

                <p className="cont-content">{cont.content}</p>

                <div className="cont-card-footer">
                  <button
                    id={`btn-upvote-cont-${cont._id}`}
                    className="idea-upvote-btn"
                    onClick={() => handleUpvoteCont(cont)}
                  >
                    ▲ {cont.upvotes}
                  </button>
                  {isOwner && cont.status === 'pending' && (
                    <>
                      <button
                        id={`btn-approve-${cont._id}`}
                        className="cont-action-btn cont-approve"
                        onClick={() => handleApprove(cont)}
                      >
                        ✓ Approve
                      </button>
                      <button
                        id={`btn-reject-${cont._id}`}
                        className="cont-action-btn cont-reject"
                        onClick={() => handleReject(cont)}
                      >
                        ✗ Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
