// src/components/pipeline/RobotHead.jsx
// Auto-generates a unique robot logo based on description text

import React from 'react';

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function seededRandom(seed) {
  let s = seed;
  return function () {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const COLORS = [
  "#4F46E5", "#0EA5E9", "#10B981", "#F59E0B", "#EF4444",
  "#8B5CF6", "#EC4899", "#14B8A6", "#F97316", "#6366F1",
  "#06B6D4", "#84CC16", "#E11D48", "#7C3AED", "#0891B2",
  "#D946EF", "#059669", "#DC2626", "#2563EB", "#CA8A04"
];

export function RobotHead({ description, size = 64 }) {
  const s = size;
  const seed = (description || "").trim() || "default";
  const hash = hashString(seed);
  const rand = seededRandom(hash);
  const color = COLORS[hash % COLORS.length];

  const headType = Math.floor(rand() * 4);
  const eyeType = Math.floor(rand() * 5);
  const mouthType = Math.floor(rand() * 5);
  const antennaType = Math.floor(rand() * 5);
  const earType = Math.floor(rand() * 4);

  const ey = headType === 1 ? 48 : 50;
  const my = headType === 1 ? 64 : 66;
  const earMid = headType === 1 ? 51 : 52;

  let headEl = null;
  if (headType === 0) headEl = <rect x="22" y="28" width="56" height="52" rx="12" fill={color} />;
  if (headType === 1) headEl = <circle cx="50" cy="57" r="28" fill={color} />;
  if (headType === 2) headEl = <rect x="22" y="28" width="56" height="52" rx="4" fill={color} />;
  if (headType === 3) headEl = <rect x="18" y="32" width="64" height="46" rx="10" fill={color} />;

  let eyesEl = null;
  if (eyeType === 0) {
    eyesEl = (
      <g>
        <circle cx="38" cy={ey} r="6" fill="white" />
        <circle cx="62" cy={ey} r="6" fill="white" />
        <circle cx="38" cy={ey} r="3" fill={color} opacity="0.6" />
        <circle cx="62" cy={ey} r="3" fill={color} opacity="0.6" />
      </g>
    );
  }
  if (eyeType === 1) {
    eyesEl = (
      <g>
        <rect x="32" y={ey - 5} width="11" height="10" rx="2" fill="white" />
        <rect x="57" y={ey - 5} width="11" height="10" rx="2" fill="white" />
        <rect x="35" y={ey - 2} width="5" height="5" rx="1" fill={color} opacity="0.6" />
        <rect x="60" y={ey - 2} width="5" height="5" rx="1" fill={color} opacity="0.6" />
      </g>
    );
  }
  if (eyeType === 2) {
    eyesEl = (
      <g>
        <circle cx="38" cy={ey} r="4" fill="white" />
        <circle cx="62" cy={ey} r="4" fill="white" />
      </g>
    );
  }
  if (eyeType === 3) {
    eyesEl = (
      <g>
        <rect x="30" y={ey - 1} width="14" height="3" rx="1" fill="white" />
        <rect x="56" y={ey - 1} width="14" height="3" rx="1" fill="white" />
      </g>
    );
  }
  if (eyeType === 4) {
    eyesEl = (
      <g>
        <circle cx="38" cy={ey} r="8" fill="white" />
        <circle cx="62" cy={ey} r="8" fill="white" />
        <circle cx="38" cy={ey} r="4" fill={color} opacity="0.5" />
        <circle cx="62" cy={ey} r="4" fill={color} opacity="0.5" />
      </g>
    );
  }

  let mouthEl = null;
  if (mouthType === 0) mouthEl = <rect x="38" y={my} width="24" height="3" rx="1.5" fill="white" />;
  if (mouthType === 1) mouthEl = <path d={`M36 ${my} Q50 ${my + 10} 64 ${my}`} stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" />;
  if (mouthType === 2) {
    mouthEl = (
      <g>
        <rect x="37" y={my - 1} width="26" height="8" rx="2" fill="white" />
        <line x1="45" y1={my - 1} x2="45" y2={my + 7} stroke={color} strokeWidth="1.5" />
        <line x1="50" y1={my - 1} x2="50" y2={my + 7} stroke={color} strokeWidth="1.5" />
        <line x1="55" y1={my - 1} x2="55" y2={my + 7} stroke={color} strokeWidth="1.5" />
      </g>
    );
  }
  if (mouthType === 3) {
    mouthEl = <polyline points={`36,${my + 2} 42,${my - 2} 48,${my + 2} 54,${my - 2} 60,${my + 2} 66,${my - 2}`} stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />;
  }
  if (mouthType === 4) mouthEl = <rect x="40" y={my} width="20" height="6" rx="2" fill="white" />;

  let antennaEl = null;
  if (antennaType === 0) {
    antennaEl = (
      <g>
        <line x1="50" y1="28" x2="50" y2="14" stroke={color} strokeWidth="3" strokeLinecap="round" />
        <circle cx="50" cy="12" r="5" fill={color} />
      </g>
    );
  }
  if (antennaType === 1) {
    antennaEl = (
      <g>
        <line x1="40" y1="28" x2="36" y2="14" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="36" cy="12" r="4" fill={color} />
        <line x1="60" y1="28" x2="64" y2="14" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="64" cy="12" r="4" fill={color} />
      </g>
    );
  }
  if (antennaType === 2) {
    antennaEl = <polyline points="50,28 46,20 54,14 50,6" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />;
  }
  if (antennaType === 4) {
    antennaEl = (
      <g>
        <line x1="50" y1="28" x2="50" y2="12" stroke={color} strokeWidth="3" strokeLinecap="round" />
        <rect x="40" y="8" width="20" height="5" rx="2.5" fill={color} />
      </g>
    );
  }

  let earsEl = null;
  if (earType === 0) {
    earsEl = (
      <g>
        <rect x="12" y={earMid - 8} width="10" height="16" rx="3" fill={color} />
        <rect x="78" y={earMid - 8} width="10" height="16" rx="3" fill={color} />
      </g>
    );
  }
  if (earType === 1) {
    earsEl = (
      <g>
        <circle cx="18" cy={earMid} r="6" fill={color} />
        <circle cx="82" cy={earMid} r="6" fill={color} />
      </g>
    );
  }
  if (earType === 3) {
    earsEl = (
      <g>
        <polygon points={`16,${earMid - 8} 16,${earMid + 8} 8,${earMid}`} fill={color} />
        <polygon points={`84,${earMid - 8} 84,${earMid + 8} 92,${earMid}`} fill={color} />
      </g>
    );
  }

  return (
    <svg width={s} height={s} viewBox="0 0 100 100">
      {antennaEl}
      {earsEl}
      {headEl}
      {eyesEl}
      {mouthEl}
    </svg>
  );
}

export default RobotHead;
