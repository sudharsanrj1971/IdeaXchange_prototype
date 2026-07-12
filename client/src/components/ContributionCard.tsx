// src/components/ContributionCard.tsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

interface Contribution {
  _id: string;
  projectId: string;
  userId: string;
  deltaData: {
    content: string;
    size: number;
    type: 'code' | 'markdown' | 'image';
  };
  peerUpvotes: number;
  expertRating: number | null;
  totalScore: number;
  timestamp: string;
}

interface Props {
  contribution: Contribution;
  /** Whether the current user is an expert (can submit expert rating slider) */
  isExpert?: boolean;
  /** Cohort weight badge – null if same-cohort (0.5×) */
  cohortWeight?: number;
  onVoted?: () => void;
}

export default function ContributionCard({
  contribution,
  isExpert = false,
  cohortWeight,
  onVoted,
}: Props) {
  const { jwt } = useAuth();
  const [expertSlider, setExpertSlider] = useState(contribution.expertRating ?? 5);
  const [voting, setVoting] = useState(false);

  const handleUpvote = async () => {
    if (!jwt || voting) return;
    setVoting(true);
    try {
      await fetch(`${BASE_URL}/api/contributions/${contribution._id}/vote`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${jwt}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: 'upvote' }),
      });
      onVoted?.();
    } finally {
      setVoting(false);
    }
  };

  const handleExpertRate = async () => {
    if (!jwt || voting) return;
    setVoting(true);
    try {
      await fetch(`${BASE_URL}/api/contributions/${contribution._id}/expert-rate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${jwt}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rating: expertSlider }),
      });
      onVoted?.();
    } finally {
      setVoting(false);
    }
  };

  return (
    <div className="bg-gray-800/60 border border-purple-900/50 rounded-lg p-4 space-y-3 hover:border-purple-600 transition-colors">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <span className="text-xs font-mono text-purple-400">{contribution.deltaData.type}</span>
          <span className="text-xs text-gray-500 ml-2">{contribution.deltaData.size} bytes</span>
        </div>
        <span className="text-xs text-gray-500">
          {new Date(contribution.timestamp).toLocaleDateString()}
        </span>
      </div>

      {/* Content preview */}
      {contribution.deltaData.type === 'image' ? (
        <p className="text-sm text-blue-400 italic truncate">{contribution.deltaData.content}</p>
      ) : (
        <pre className="text-xs text-gray-300 bg-black/40 rounded p-2 max-h-28 overflow-auto whitespace-pre-wrap">
          {contribution.deltaData.content.slice(0, 500)}
          {contribution.deltaData.content.length > 500 && '…'}
        </pre>
      )}

      {/* Score row */}
      <div className="flex items-center gap-4 text-sm">
        <button
          onClick={handleUpvote}
          disabled={voting}
          className="flex items-center gap-1 px-3 py-1 rounded-md bg-purple-900/50 hover:bg-purple-800 text-purple-300 transition-colors disabled:opacity-50"
        >
          👍 {contribution.peerUpvotes}
        </button>

        {/* Cohort weight badge */}
        {cohortWeight !== undefined && (
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              cohortWeight < 1 ? 'bg-yellow-900/50 text-yellow-300' : 'bg-green-900/50 text-green-300'
            }`}
            title={cohortWeight < 1 ? 'Same-cohort vote (0.5× weight)' : 'Cross-cohort vote (1× weight)'}
          >
            {cohortWeight < 1 ? '0.5×' : '1×'} weight
          </span>
        )}

        {/* Total score */}
        <span className="ml-auto text-xs text-gray-400">
          Score: <span className="text-pink-400 font-bold">{contribution.totalScore?.toFixed(1) ?? '—'}</span>
        </span>
      </div>

      {/* Expert slider — only visible to experts */}
      {isExpert && (
        <div className="flex items-center gap-3 pt-2 border-t border-gray-700/50">
          <label className="text-xs text-gray-400">Expert Rating:</label>
          <input
            type="range"
            min={1}
            max={10}
            value={expertSlider}
            onChange={e => setExpertSlider(Number(e.target.value))}
            className="flex-1 accent-pink-500"
          />
          <span className="text-sm font-bold text-pink-400 w-6 text-center">{expertSlider}</span>
          <button
            onClick={handleExpertRate}
            disabled={voting}
            className="px-3 py-1 rounded-md bg-pink-600 hover:bg-pink-500 text-white text-xs transition-colors disabled:opacity-50"
          >
            Rate
          </button>
        </div>
      )}
    </div>
  );
}
