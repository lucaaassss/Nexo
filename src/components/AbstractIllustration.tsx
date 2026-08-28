'use client';

import React from 'react';
import { motion } from 'framer-motion';

export const AbstractIllustration: React.FC = () => {
  const nodes = [
    { id: 1, cx: 120, cy: 100, label: 'Ideas', delay: 0 },
    { id: 2, cx: 320, cy: 90, label: 'Proyectos', delay: 0.2 },
    { id: 3, cx: 220, cy: 220, label: 'Nexor-Space Hub', delay: 0.4, isCenter: true },
    { id: 4, cx: 100, cy: 340, label: 'Alumnos', delay: 0.6 },
    { id: 5, cx: 340, cy: 320, label: 'Profesores', delay: 0.8 },
  ];

  const connections = [
    { from: 0, to: 2 },
    { from: 1, to: 2 },
    { from: 3, to: 2 },
    { from: 4, to: 2 },
    { from: 0, to: 1 },
    { from: 3, to: 4 },
  ];

  return (
    <div className="relative w-full max-w-lg aspect-square flex items-center justify-center">
      {/* Background Radial Glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-violet-600/30 via-indigo-600/20 to-purple-600/30 rounded-full blur-3xl opacity-70 animate-pulse pointer-events-none" />

      {/* Decorative Grid SVG */}
      <svg
        className="w-full h-full relative z-10 overflow-visible"
        viewBox="0 0 440 420"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#6366F1" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#A855F7" stopOpacity="0.2" />
          </linearGradient>

          <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#7C3AED" stopOpacity="1" />
            <stop offset="100%" stopColor="#4C1D95" stopOpacity="0.3" />
          </radialGradient>

          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Animated Connecting Lines */}
        {connections.map((conn, i) => {
          const start = nodes[conn.from];
          const end = nodes[conn.to];
          return (
            <g key={`conn-${i}`}>
              <line
                x1={start.cx}
                y1={start.cy}
                x2={end.cx}
                y2={end.cy}
                stroke="url(#lineGrad)"
                strokeWidth="2"
                strokeDasharray="4 4"
                className="opacity-40 dark:opacity-60"
              />
              <motion.circle
                r="3"
                fill="#C4B5FD"
                filter="url(#glow)"
                animate={{
                  cx: [start.cx, end.cx],
                  cy: [start.cy, end.cy],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 3 + i * 0.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.4,
                }}
              />
            </g>
          );
        })}

        {/* Outer Orbit Rings */}
        <motion.circle
          cx="220"
          cy="220"
          r="160"
          stroke="rgba(139, 92, 246, 0.15)"
          strokeWidth="1"
          strokeDasharray="8 8"
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '220px 220px' }}
        />
        <motion.circle
          cx="220"
          cy="220"
          r="100"
          stroke="rgba(99, 102, 241, 0.2)"
          strokeWidth="1"
          animate={{ rotate: -360 }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '220px 220px' }}
        />

        {/* Node Points */}
        {nodes.map((node) => (
          <g key={node.id}>
            {/* Pulsing Aura */}
            <motion.circle
              cx={node.cx}
              cy={node.cy}
              r={node.isCenter ? 32 : 20}
              fill={node.isCenter ? 'url(#centerGlow)' : 'rgba(124, 58, 237, 0.25)'}
              filter="url(#glow)"
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.7, 0.95, 0.7],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                delay: node.delay,
              }}
            />

            {/* Core Circle */}
            <circle
              cx={node.cx}
              cy={node.cy}
              r={node.isCenter ? 18 : 10}
              fill={node.isCenter ? '#8B5CF6' : '#6366F1'}
              stroke="#DDD6FE"
              strokeWidth="2"
            />

            {/* Node Label */}
            <text
              x={node.cx}
              y={node.cy + (node.isCenter ? 34 : 26)}
              textAnchor="middle"
              fill="currentColor"
              className="text-[11px] font-semibold tracking-wide fill-zinc-300 dark:fill-zinc-200 pointer-events-none drop-shadow"
            >
              {node.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};
