// src/pages/AdminAudit.tsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

interface Transition {
  _id: string;
  projectId: string;
  projectTitle?: string;
  from: string;
  to: string;
  triggeredBy: string;
  timestamp: string;
}

interface TamperLog {
  _id: string;
  projectId: string;
  blockId: string;
  expectedHash: string;
  actualHash: string;
  detectedAt: string;
}

interface IntegrityResult {
  projectId: string;
  valid: boolean;
  brokenAt?: number;
  message: string;
}

export default function AdminAudit() {
  const { jwt } = useAuth();
  const [tab, setTab] = useState<'transitions' | 'tampering' | 'verify'>('transitions');
  const [transitions, setTransitions] = useState<Transition[]>([]);
  const [tamperLogs, setTamperLogs] = useState<TamperLog[]>([]);
  const [verifyId, setVerifyId] = useState('');
  const [verifyResult, setVerifyResult] = useState<IntegrityResult | null>(null);
  const [loading, setLoading] = useState(false);

  const headers = { Authorization: `Bearer ${jwt}` };

  // Fetch state transitions
  useEffect(() => {
    if (tab !== 'transitions' || !jwt) return;
    setLoading(true);
    fetch(`${BASE_URL}/api/admin/transitions`, { headers })
      .then(r => r.json())
      .then(setTransitions)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [tab, jwt]);

  // Fetch tampering logs
  useEffect(() => {
    if (tab !== 'tampering' || !jwt) return;
    setLoading(true);
    fetch(`${BASE_URL}/api/admin/tampering-logs`, { headers })
      .then(r => r.json())
      .then(setTamperLogs)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [tab, jwt]);

  const handleVerify = async () => {
    if (!verifyId.trim() || !jwt) return;
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/admin/verify/${verifyId}`, { headers });
      const data = await res.json();
      setVerifyResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const tabClass = (t: string) =>
    `px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
      tab === t
        ? 'bg-purple-900 text-pink-300 border-b-2 border-pink-500'
        : 'bg-gray-800/50 text-gray-400 hover:text-gray-200'
    }`;

  return (
    <div className="min-h-screen bg-[#0f0f1a]">
      <Navbar />
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold text-pink-400">🔒 Admin Audit Dashboard</h1>

        {/* Tabs */}
        <div className="flex space-x-2 border-b border-gray-700">
          <button className={tabClass('transitions')} onClick={() => setTab('transitions')}>
            State Transitions
          </button>
          <button className={tabClass('tampering')} onClick={() => setTab('tampering')}>
            Tampering Logs
          </button>
          <button className={tabClass('verify')} onClick={() => setTab('verify')}>
            Verify Chain
          </button>
        </div>

        {loading && <p className="text-purple-300 animate-pulse">Loading…</p>}

        {/* Transitions table */}
        {tab === 'transitions' && !loading && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-300">
              <thead className="text-xs uppercase text-purple-400 bg-gray-800/50">
                <tr>
                  <th className="px-4 py-3">Project</th>
                  <th className="px-4 py-3">From</th>
                  <th className="px-4 py-3">To</th>
                  <th className="px-4 py-3">By</th>
                  <th className="px-4 py-3">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {transitions.map(t => (
                  <tr key={t._id} className="hover:bg-gray-800/30">
                    <td className="px-4 py-3 font-mono text-xs">{t.projectTitle ?? t.projectId}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded bg-gray-700 text-gray-300 text-xs">{t.from}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded bg-pink-900/50 text-pink-300 text-xs">{t.to}</span>
                    </td>
                    <td className="px-4 py-3 text-xs">{t.triggeredBy}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{new Date(t.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {transitions.length === 0 && (
              <p className="text-center text-gray-500 py-8">No transitions recorded yet.</p>
            )}
          </div>
        )}

        {/* Tampering logs */}
        {tab === 'tampering' && !loading && (
          <div className="space-y-3">
            {tamperLogs.length === 0 ? (
              <div className="text-center py-8">
                <span className="text-4xl">✅</span>
                <p className="text-green-400 mt-2">No tampering events detected.</p>
              </div>
            ) : (
              tamperLogs.map(log => (
                <div key={log._id} className="bg-red-900/30 border border-red-700 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-red-300 font-semibold">🚨 Integrity Violation</span>
                    <span className="text-xs text-gray-500">{new Date(log.detectedAt).toLocaleString()}</span>
                  </div>
                  <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs font-mono">
                    <span className="text-gray-500">Project:</span>
                    <span className="text-gray-300">{log.projectId}</span>
                    <span className="text-gray-500">Block:</span>
                    <span className="text-gray-300">{log.blockId}</span>
                    <span className="text-gray-500">Expected:</span>
                    <span className="text-green-400 break-all">{log.expectedHash}</span>
                    <span className="text-gray-500">Actual:</span>
                    <span className="text-red-400 break-all">{log.actualHash}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Verify chain */}
        {tab === 'verify' && !loading && (
          <div className="space-y-4">
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Enter project ID…"
                value={verifyId}
                onChange={e => setVerifyId(e.target.value)}
                className="flex-1 bg-gray-800 border border-gray-600 text-gray-200 rounded-lg px-4 py-2 text-sm focus:border-pink-500 focus:outline-none"
              />
              <button
                onClick={handleVerify}
                className="px-6 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Verify
              </button>
            </div>
            {verifyResult && (
              <div className={`rounded-lg p-4 border ${
                verifyResult.valid
                  ? 'bg-green-900/30 border-green-700'
                  : 'bg-red-900/30 border-red-700'
              }`}>
                <div className="flex items-center gap-2 text-lg">
                  {verifyResult.valid ? '✅' : '🚨'}
                  <span className={verifyResult.valid ? 'text-green-400' : 'text-red-400'}>
                    {verifyResult.message}
                  </span>
                </div>
                {!verifyResult.valid && verifyResult.brokenAt !== undefined && (
                  <p className="text-xs text-gray-400 mt-2">
                    Chain broken at block index: {verifyResult.brokenAt}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
