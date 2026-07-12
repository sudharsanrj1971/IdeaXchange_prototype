import React, { useState } from "react";

const tokens = {
  bg: "#0A0E12",
  bgRaised: "#10151C",
  bgCard: "#141B23",
  line: "#1F2A33",
  lineBright: "#2C3B47",
  cyan: "#4DF0E0",
  cyanDim: "#1E4A47",
  amber: "#F0B84D",
  amberDim: "#4A3A1E",
  magenta: "#E04DF0",
  magentaDim: "#4A1E4A",
  textPrimary: "#E8EEF2",
  textSecondary: "#7A8994",
  textFaint: "#4A5560",
};

const displayFont = "'Rajdhani', 'Inter', sans-serif";
const monoFont = "'JetBrains Mono', 'Space Mono', monospace";
const bodyFont = "'Inter', sans-serif";

function Chip({ children, tone = "cyan" }) {
  const map = {
    cyan: { c: tokens.cyan, bg: tokens.cyanDim },
    amber: { c: tokens.amber, bg: tokens.amberDim },
    magenta: { c: tokens.magenta, bg: tokens.magentaDim },
  };
  const t = map[tone];
  return (
    <span
      style={{
        fontFamily: monoFont,
        fontSize: 11,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        color: t.c,
        background: t.bg,
        border: `1px solid ${t.c}55`,
        borderRadius: 3,
        padding: "3px 8px",
      }}
    >
      {children}
    </span>
  );
}

function StatCard({ label, value, sub, tone = "cyan" }) {
  const c = tokens[tone];
  return (
    <div
      style={{
        background: tokens.bgCard,
        border: `1px solid ${tokens.line}`,
        borderLeft: `2px solid ${c}`,
        padding: "14px 16px",
        flex: 1,
        minWidth: 140,
      }}
    >
      <div style={{ fontFamily: monoFont, fontSize: 10, letterSpacing: "0.08em", color: tokens.textFaint, textTransform: "uppercase" }}>
        {label}
      </div>
      <div style={{ fontFamily: displayFont, fontSize: 28, fontWeight: 600, color: tokens.textPrimary, marginTop: 4 }}>
        {value}
      </div>
      {sub && <div style={{ fontFamily: monoFont, fontSize: 11, color: tokens.textSecondary, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function ChainBlock({ index, hash, author, active }) {
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <div
        style={{
          background: active ? tokens.cyanDim : tokens.bgCard,
          border: `1px solid ${active ? tokens.cyan : tokens.line}`,
          padding: "10px 14px",
          minWidth: 150,
          position: "relative",
        }}
      >
        <div style={{ fontFamily: monoFont, fontSize: 10, color: active ? tokens.cyan : tokens.textFaint }}>
          #{String(index).padStart(4, "0")}
        </div>
        <div style={{ fontFamily: monoFont, fontSize: 12, color: tokens.textPrimary, marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {hash}
        </div>
        <div style={{ fontFamily: bodyFont, fontSize: 11, color: tokens.textSecondary, marginTop: 4 }}>{author}</div>
      </div>
      <div style={{ width: 20, height: 1, background: active ? tokens.cyan : tokens.lineBright }} />
    </div>
  );
}

export default function IdeaXchangeMockup() {
  const [tab, setTab] = useState("chain");

  return (
    <div
      style={{
        background: tokens.bg,
        color: tokens.textPrimary,
        fontFamily: bodyFont,
        minHeight: 640,
        padding: 24,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Inter:wght@400;500&family=JetBrains+Mono:wght@400;500&display=swap');
      `}</style>

      {/* Top bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${tokens.line}`, paddingBottom: 16, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 8, height: 8, background: tokens.cyan, boxShadow: `0 0 8px ${tokens.cyan}` }} />
          <span style={{ fontFamily: displayFont, fontWeight: 700, fontSize: 20, letterSpacing: "0.02em" }}>
            IDEA<span style={{ color: tokens.cyan }}>XCHANGE</span>
          </span>
          <span style={{ fontFamily: monoFont, fontSize: 10, color: tokens.textFaint, marginLeft: 8 }}>
            v0.1 — trust ledger
          </span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {["chain", "approvals", "reputation"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                fontFamily: monoFont,
                fontSize: 11,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                background: tab === t ? tokens.cyanDim : "transparent",
                color: tab === t ? tokens.cyan : tokens.textSecondary,
                border: `1px solid ${tab === t ? tokens.cyan : tokens.line}`,
                padding: "8px 14px",
                cursor: "pointer",
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        <StatCard label="Active projects" value="14" sub="3 in review" tone="cyan" />
        <StatCard label="Contribution blocks" value="382" sub="chain verified" tone="cyan" />
        <StatCard label="Pending approvals" value="6" sub="avg 4.2h resolve" tone="amber" />
        <StatCard label="Your reputation" value="847" sub="+32 this week" tone="magenta" />
      </div>

      {tab === "chain" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
            <span style={{ fontFamily: displayFont, fontSize: 15, fontWeight: 600 }}>Contribution chain — Project Aeris</span>
            <Chip tone="cyan">chain intact</Chip>
          </div>
          <div style={{ display: "flex", overflowX: "auto", paddingBottom: 8 }}>
            <ChainBlock index={0} hash="7f3a9c...e21b" author="genesis" />
            <ChainBlock index={1} hash="c88e14...4f0a" author="sudharsan.j" />
            <ChainBlock index={2} hash="a1d9f2...77bc" author="s.mamtha" />
            <ChainBlock index={3} hash="0e42b8...919d" author="v.janakiraman" active />
          </div>
          <div style={{ fontFamily: monoFont, fontSize: 11, color: tokens.textFaint, marginTop: 10 }}>
            latest block hash matches prevBlockHash reference — no tampering detected
          </div>
        </div>
      )}

      {tab === "approvals" && (
        <div>
          <span style={{ fontFamily: displayFont, fontSize: 15, fontWeight: 600, display: "block", marginBottom: 12 }}>
            Pending approvals
          </span>
          {[
            { proj: "Project Aeris", block: "#0384", by: "r.kanagaraj" },
            { proj: "CRDF Sim", block: "#0129", by: "s.mamtha" },
            { proj: "HobbySync", block: "#0057", by: "g.s" },
          ].map((r, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: tokens.bgCard,
                border: `1px solid ${tokens.line}`,
                padding: "12px 16px",
                marginBottom: 8,
              }}
            >
              <div>
                <div style={{ fontFamily: bodyFont, fontSize: 13, color: tokens.textPrimary }}>{r.proj}</div>
                <div style={{ fontFamily: monoFont, fontSize: 11, color: tokens.textFaint }}>
                  block {r.block} — submitted by {r.by}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button style={{ fontFamily: monoFont, fontSize: 11, background: "transparent", color: tokens.cyan, border: `1px solid ${tokens.cyan}`, padding: "6px 12px", cursor: "pointer" }}>
                  approve
                </button>
                <button style={{ fontFamily: monoFont, fontSize: 11, background: "transparent", color: tokens.textFaint, border: `1px solid ${tokens.line}`, padding: "6px 12px", cursor: "pointer" }}>
                  reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "reputation" && (
        <div>
          <span style={{ fontFamily: displayFont, fontSize: 15, fontWeight: 600, display: "block", marginBottom: 12 }}>
            Reputation log
          </span>
          {[
            { d: "+10", reason: "contribution_approved", proj: "Project Aeris", t: "2h ago" },
            { d: "+10", reason: "contribution_approved", proj: "HobbySync", t: "1d ago" },
            { d: "-5", reason: "contribution_rejected", proj: "CRDF Sim", t: "3d ago" },
          ].map((r, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                borderBottom: `1px solid ${tokens.line}`,
                padding: "10px 4px",
              }}
            >
              <span
                style={{
                  fontFamily: monoFont,
                  fontSize: 13,
                  fontWeight: 500,
                  color: r.d.startsWith("+") ? tokens.cyan : tokens.magenta,
                  minWidth: 36,
                }}
              >
                {r.d}
              </span>
              <span style={{ fontFamily: bodyFont, fontSize: 12, color: tokens.textPrimary, flex: 1 }}>
                {r.reason} — {r.proj}
              </span>
              <span style={{ fontFamily: monoFont, fontSize: 11, color: tokens.textFaint }}>{r.t}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
