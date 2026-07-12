// src/components/ImpactScoreBadge.tsx
import React from 'react';

interface Props {
  score: number;
}

// Visual badge that shows the Quality×Impact score with a gradient.
export default function ImpactScoreBadge({ score }: Props) {
  const bg = score >= 80 ? 'bg-pink-600' : score >= 50 ? 'bg-purple-600' : 'bg-gray-600';
  return (
    <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${bg} text-white shadow-lg`}>
      Impact Score: {score}
    </div>
  );
}
