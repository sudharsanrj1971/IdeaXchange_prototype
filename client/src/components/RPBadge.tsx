// src/components/RPBadge.tsx
import React from 'react';

interface Props {
  points: number;
}

function getTier(points: number): { label: string; color: string; glow: string } {
  if (points >= 500) return { label: '🏆 Legend', color: 'from-yellow-400 to-amber-600', glow: 'shadow-amber-500/40' };
  if (points >= 200) return { label: '💎 Diamond', color: 'from-cyan-400 to-blue-500', glow: 'shadow-cyan-500/40' };
  if (points >= 100) return { label: '🥇 Gold', color: 'from-yellow-300 to-yellow-500', glow: 'shadow-yellow-400/40' };
  if (points >= 50) return { label: '🥈 Silver', color: 'from-gray-300 to-gray-400', glow: 'shadow-gray-400/30' };
  return { label: '🥉 Bronze', color: 'from-orange-400 to-orange-600', glow: 'shadow-orange-400/30' };
}

export default function RPBadge({ points }: Props) {
  const tier = getTier(points);
  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${tier.color} text-white font-semibold text-sm shadow-lg ${tier.glow}`}>
      <span>{tier.label}</span>
      <span className="bg-black/30 px-2 py-0.5 rounded-full text-xs font-mono">{points} RP</span>
    </div>
  );
}
