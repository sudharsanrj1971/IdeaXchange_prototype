// src/components/ExpertBadge.tsx
import React from 'react';

interface Props {
  isExpert: boolean;
}

export default function ExpertBadge({ isExpert }: Props) {
  if (!isExpert) return null;
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold shadow-md shadow-purple-500/30">
      🎓 Expert Reviewer
    </span>
  );
}
