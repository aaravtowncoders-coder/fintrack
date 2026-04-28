interface AnimatedRobotProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  animate?: boolean;
  className?: string;
}

const sizeMap = {
  xs: 60,
  sm: 100,
  md: 160,
  lg: 220,
  xl: 300,
};

export function AnimatedRobot({ size = "md", animate = true, className = "" }: AnimatedRobotProps) {
  const w = sizeMap[size];
  const h = Math.round(w * 1.4);

  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 120 168"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={animate ? { animation: "robotFloat 3s ease-in-out infinite" } : {}}
    >
      <style>{`
        @keyframes robotFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes eyeBlink {
          0%, 90%, 100% { transform: scaleY(1); }
          95% { transform: scaleY(0.1); }
        }
        @keyframes lightPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes antennaGlow {
          0%, 100% { filter: drop-shadow(0 0 4px #3b82f6); }
          50% { filter: drop-shadow(0 0 8px #a855f7); }
        }
        .robot-eye { animation: eyeBlink 4s ease-in-out infinite; transform-origin: center; }
        .light-1 { animation: lightPulse 1.5s ease-in-out infinite; }
        .light-2 { animation: lightPulse 1.5s ease-in-out infinite 0.5s; }
        .light-3 { animation: lightPulse 1.5s ease-in-out infinite 1s; }
        .antenna-ball { animation: antennaGlow 2s ease-in-out infinite; }
      `}</style>

      <defs>
        <linearGradient id="headGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1e3a5f" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        <linearGradient id="bodyGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#172554" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        <linearGradient id="eyeGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
        <linearGradient id="panelGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1e3a5f" />
          <stop offset="100%" stopColor="#0f2040" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Antenna */}
      <line x1="60" y1="4" x2="60" y2="24" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="60" cy="5" r="6" fill="#3b82f6" className="antenna-ball" filter="url(#glow)" />

      {/* Head */}
      <rect x="18" y="24" width="84" height="68" rx="16" fill="url(#headGrad)" />
      <rect x="19" y="25" width="82" height="66" rx="15" fill="none" stroke="#3b82f6" strokeWidth="0.5" strokeOpacity="0.4" />

      {/* Ear left */}
      <rect x="8" y="40" width="12" height="22" rx="6" fill="url(#headGrad)" />
      <rect x="9" y="44" width="5" height="4" rx="2" fill="#3b82f6" opacity="0.7" />
      {/* Ear right */}
      <rect x="100" y="40" width="12" height="22" rx="6" fill="url(#headGrad)" />
      <rect x="106" y="44" width="5" height="4" rx="2" fill="#3b82f6" opacity="0.7" />

      {/* Eye sockets */}
      <circle cx="42" cy="56" r="14" fill="#0a1628" />
      <circle cx="78" cy="56" r="14" fill="#0a1628" />

      {/* Eyes */}
      <g className="robot-eye">
        <circle cx="42" cy="56" r="10" fill="url(#eyeGrad)" filter="url(#glow)" />
        <circle cx="78" cy="56" r="10" fill="url(#eyeGrad)" filter="url(#glow)" />
      </g>
      {/* Eye shine */}
      <circle cx="38" cy="52" r="3.5" fill="white" opacity="0.9" />
      <circle cx="74" cy="52" r="3.5" fill="white" opacity="0.9" />
      <circle cx="37" cy="51" r="1.5" fill="white" />
      <circle cx="73" cy="51" r="1.5" fill="white" />

      {/* Mouth */}
      <path d="M46 76 Q60 88 74 76" stroke="#3b82f6" strokeWidth="2.5" fill="none" strokeLinecap="round" filter="url(#glow)" />
      {/* Cheek glows */}
      <circle cx="28" cy="68" r="7" fill="#3b82f6" opacity="0.12" />
      <circle cx="92" cy="68" r="7" fill="#3b82f6" opacity="0.12" />

      {/* Neck */}
      <rect x="48" y="92" width="24" height="12" rx="4" fill="url(#headGrad)" />
      <rect x="52" y="94" width="4" height="8" rx="2" fill="#3b82f6" opacity="0.4" />
      <rect x="64" y="94" width="4" height="8" rx="2" fill="#3b82f6" opacity="0.4" />

      {/* Body */}
      <rect x="12" y="104" width="96" height="60" rx="16" fill="url(#bodyGrad)" />
      <rect x="13" y="105" width="94" height="58" rx="15" fill="none" stroke="#3b82f6" strokeWidth="0.5" strokeOpacity="0.3" />

      {/* Chest panel */}
      <rect x="26" y="114" width="68" height="42" rx="10" fill="url(#panelGrad)" />
      <rect x="27" y="115" width="66" height="40" rx="9" fill="none" stroke="#1e40af" strokeWidth="0.5" strokeOpacity="0.6" />

      {/* Status lights */}
      <circle cx="42" cy="128" r="6" fill="#14b8a6" className="light-1" filter="url(#glow)" />
      <circle cx="60" cy="128" r="6" fill="#3b82f6" className="light-2" filter="url(#glow)" />
      <circle cx="78" cy="128" r="6" fill="#a855f7" className="light-3" filter="url(#glow)" />

      {/* Battery bar */}
      <rect x="34" y="142" width="52" height="7" rx="3.5" fill="#1e293b" />
      <rect x="34" y="142" width="36" height="7" rx="3.5" fill="#3b82f6" />
      <text x="60" y="148.5" textAnchor="middle" fill="white" fontSize="4.5" fontFamily="monospace" opacity="0.9">69%</text>

      {/* Arms */}
      <rect x="0" y="108" width="14" height="46" rx="7" fill="url(#bodyGrad)" />
      <rect x="106" y="108" width="14" height="46" rx="7" fill="url(#bodyGrad)" />
      {/* Hands */}
      <circle cx="7" cy="158" r="9" fill="url(#bodyGrad)" />
      <circle cx="113" cy="158" r="9" fill="url(#bodyGrad)" />
      <rect x="1" y="152" width="12" height="5" rx="2.5" fill="#1e3a5f" />
      <rect x="107" y="152" width="12" height="5" rx="2.5" fill="#1e3a5f" />

      {/* Legs */}
      <rect x="35" y="164" width="20" height="4" rx="2" fill="#1e3a5f" />
      <rect x="65" y="164" width="20" height="4" rx="2" fill="#1e3a5f" />
    </svg>
  );
}
