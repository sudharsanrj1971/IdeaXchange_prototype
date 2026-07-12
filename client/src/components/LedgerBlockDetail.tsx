import React from 'react';
import ContributionCard from './ContributionCard';

interface LedgerBlock {
  _id: string;
  userId: string;
  projectId: string;
  deltaData: {
    content: string;
    size: number;
    type: 'code' | 'markdown' | 'image';
  };
  hash: string;
  previousHash: string;
  timestamp: string;
  tampered?: boolean;
  peerUpvotes?: number;
  expertRating?: number | null;
  totalScore?: number;
}

interface Props {
  block: LedgerBlock;
  index: number;
}

export default function LedgerBlockDetail({ block, index }: Props) {
  return (
    <div className="mt-2 bg-gray-900/80 border border-purple-800 rounded-lg p-4 space-y-3 text-sm">
      {/* Hash chain */}
      <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 font-mono text-xs">
        <span className="text-gray-500">Hash:</span>
        <span className="text-green-400 break-all">{block.hash}</span>
        <span className="text-gray-500">Prev:</span>
        <span className="text-purple-400 break-all">{block.previousHash || '(genesis)'}</span>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-3 text-xs text-gray-400">
        <span>👤 {block.userId}</span>
        <span>🕓 {new Date(block.timestamp).toISOString()}</span>
      </div>

      {/* Contribution Details & Voting */}
      <div className="mt-4">
        <ContributionCard contribution={block as any} />
      </div>

      {/* Integrity badge */}
      {block.tampered ? (
        <div className="flex items-center space-x-2 text-red-400">
          <span className="text-lg">🚨</span>
          <span className="font-semibold text-xs">
            Hash mismatch — this block has been tampered with
          </span>
        </div>
      ) : (
        <div className="flex items-center space-x-2 text-green-400">
          <span className="text-lg">✅</span>
          <span className="text-xs">Integrity verified</span>
        </div>
      )}
    </div>
  );
}
