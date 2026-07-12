// src/components/CertifiedRibbon.tsx
import React from 'react';

interface Props {
  isCertified: boolean;
}

export default function CertifiedRibbon({ isCertified }: Props) {
  if (!isCertified) return null;

  return (
    <div className="absolute top-0 right-0 overflow-hidden w-24 h-24 pointer-events-none z-10">
      <div className="absolute top-4 -right-8 w-32 transform rotate-45 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-bold py-1 text-center shadow-lg uppercase tracking-wider">
        Certified
      </div>
    </div>
  );
}
