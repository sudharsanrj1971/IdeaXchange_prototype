// src/components/LedgerTimeline.tsx
import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import LedgerBlockDetail from './LedgerBlockDetail';
import { useAuth } from '../context/AuthContext';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

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
}

interface Props {
  projectId: string;
  socket?: Socket | null;
}

export default function LedgerTimeline({ projectId, socket }: Props) {
  const { jwt } = useAuth();
  const [blocks, setBlocks] = useState<LedgerBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [tamperAlert, setTamperAlert] = useState<string | null>(null);

  // Fetch ledger blocks
  useEffect(() => {
    if (!projectId || !jwt) return;
    fetch(`${BASE_URL}/api/contributions/chain/${projectId}`, {
      headers: { Authorization: `Bearer ${jwt}` },
    })
      .then(r => r.json())
      .then(data => {
        setBlocks(Array.isArray(data) ? data : data.blocks ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [projectId, jwt]);

  // Socket.io — listen for tampering alerts and score updates
  useEffect(() => {
    if (!socket) return;

    const handleTamper = (payload: { projectId: string; blockId: string; message: string }) => {
      if (payload.projectId === projectId) {
        setTamperAlert(payload.message);
        setBlocks(prev =>
          prev.map(b => (b._id === payload.blockId ? { ...b, tampered: true } : b))
        );
      }
    };

    const handleScoreUpdate = (payload: any) => {
      const updatedBlock = payload.block || payload;
      if (updatedBlock.projectId === projectId || updatedBlock.project === projectId) {
        setBlocks(prev =>
          prev.map(b => (b._id === updatedBlock._id ? { ...b, ...updatedBlock } : b))
        );
      }
    };

    socket.on('tamper-alert', handleTamper);
    socket.on('scoreUpdate', handleScoreUpdate);

    return () => { 
      socket.off('tamper-alert', handleTamper);
      socket.off('scoreUpdate', handleScoreUpdate);
    };
  }, [socket, projectId]);

  if (loading) {
    return <div className="text-purple-300 text-center py-8">Loading ledger…</div>;
  }

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold text-pink-400">📜 Contribution Ledger</h2>

      {/* Tampering overlay */}
      {tamperAlert && (
        <div className="bg-red-900/80 border border-red-500 rounded-lg px-4 py-3 text-red-200 flex items-center space-x-2 animate-pulse">
          <span className="text-xl">⚠️</span>
          <span className="font-medium">{tamperAlert}</span>
        </div>
      )}

      {blocks.length === 0 ? (
        <p className="text-gray-500">No contributions recorded yet.</p>
      ) : (
        <ol className="relative border-l-2 border-purple-700 ml-4 space-y-6">
          {blocks.map((block, i) => (
            <li key={block._id} className="ml-6">
              {/* Connector dot */}
              <span
                className={`absolute -left-[9px] w-4 h-4 rounded-full border-2 ${
                  block.tampered
                    ? 'bg-red-500 border-red-400 animate-pulse'
                    : 'bg-pink-500 border-pink-400'
                }`}
                style={{ top: `${i * 6.5}rem` }}
              />

              {/* Summary row */}
              <button
                className="w-full text-left bg-gray-800/60 hover:bg-gray-800 rounded-lg px-4 py-3 transition-colors"
                onClick={() => setExpandedId(expandedId === block._id ? null : block._id)}
              >
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <span className="text-sm font-mono text-purple-300">
                      Block #{i + 1} &middot; {block.deltaData.type}
                    </span>
                    <p className="text-xs text-gray-400">
                      {new Date(block.timestamp).toLocaleString()} &middot; {block.deltaData.size} bytes
                    </p>
                  </div>
                  <span className="text-xs font-mono text-gray-500 truncate max-w-[120px]">
                    {block.hash.slice(0, 12)}…
                  </span>
                </div>
                {block.tampered && (
                  <span className="mt-1 inline-block text-xs bg-red-800 text-red-200 px-2 py-0.5 rounded">
                    INTEGRITY VIOLATION
                  </span>
                )}
              </button>

              {/* Expanded detail */}
              {expandedId === block._id && (
                <LedgerBlockDetail block={block} index={i} />
              )}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
