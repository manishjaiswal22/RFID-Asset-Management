import React from 'react'

export const WarehouseFullBackgroundScene: React.FC = () => {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none">
      <svg
        viewBox="0 0 1440 760"
        preserveAspectRatio="xMidYMid slice"
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="wfSkyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F6F5F1" />
            <stop offset="60%" stopColor="#EFECE4" />
            <stop offset="100%" stopColor="#E6E1D7" />
          </linearGradient>

          <linearGradient id="wfFloorGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#E4DFD4" />
            <stop offset="50%" stopColor="#ECE7DC" />
            <stop offset="100%" stopColor="#E0DAD0" />
          </linearGradient>

          <linearGradient id="wfRackSteel" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#BCB6AA" />
            <stop offset="100%" stopColor="#9C9588" />
          </linearGradient>

          <linearGradient id="wfRackBeam" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#C9C3B6" />
            <stop offset="100%" stopColor="#ABA497" />
          </linearGradient>

          <linearGradient id="wfBox1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#DFD2BF" />
            <stop offset="100%" stopColor="#C8BAA5" />
          </linearGradient>

          <linearGradient id="wfBox2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EADECB" />
            <stop offset="100%" stopColor="#D5C5B0" />
          </linearGradient>

          <linearGradient id="wfPallet" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#C4B8A6" />
            <stop offset="100%" stopColor="#A89B88" />
          </linearGradient>

          <radialGradient id="wfTagGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#5D9273" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#5D9273" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#5D9273" stopOpacity="0" />
          </radialGradient>

          <filter id="wfSoftGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <rect width="1440" height="760" fill="url(#wfSkyGrad)" />

        <g opacity="0.35" stroke="#D3CDC0" strokeWidth="1.5">
          <line x1="0" y1="90" x2="1440" y2="90" />
          <line x1="0" y1="170" x2="1440" y2="170" />
          <line x1="160" y1="0" x2="160" y2="580" />
          <line x1="360" y1="0" x2="360" y2="580" />
          <line x1="620" y1="0" x2="620" y2="580" />
          <line x1="880" y1="0" x2="880" y2="580" />
          <line x1="1140" y1="0" x2="1140" y2="580" />
          <line x1="1380" y1="0" x2="1380" y2="580" />

          <line x1="160" y1="0" x2="360" y2="90" />
          <line x1="360" y1="0" x2="160" y2="90" />
          <line x1="360" y1="0" x2="620" y2="90" />
          <line x1="620" y1="0" x2="360" y2="90" />
          <line x1="620" y1="0" x2="880" y2="90" />
          <line x1="880" y1="0" x2="620" y2="90" />
          <line x1="880" y1="0" x2="1140" y2="90" />
          <line x1="1140" y1="0" x2="880" y2="90" />
          <line x1="1140" y1="0" x2="1380" y2="90" />
          <line x1="1380" y1="0" x2="1140" y2="90" />
        </g>

        <path
          d="M 0 540 Q 240 525, 520 540 T 1000 535 T 1440 545 L 1440 760 L 0 760 Z"
          fill="url(#wfFloorGrad)"
        />
        <path
          d="M 0 580 Q 380 565, 780 580 T 1440 575 L 1440 760 L 0 760 Z"
          fill="#DDD7CC"
          opacity="0.6"
        />

        <g opacity="0.3">
          <rect x="740" y="160" width="12" height="380" fill="#ABA395" />
          <rect x="920" y="160" width="12" height="380" fill="#ABA395" />
          <rect x="1100" y="140" width="12" height="400" fill="#ABA395" />
          <rect x="1280" y="140" width="12" height="400" fill="#ABA395" />
          <rect x="1400" y="140" width="12" height="400" fill="#ABA395" />

          <rect x="740" y="240" width="670" height="8" fill="#C2BBB0" />
          <rect x="740" y="340" width="670" height="8" fill="#C2BBB0" />
          <rect x="740" y="440" width="670" height="8" fill="#C2BBB0" />

          <rect x="760" y="260" width="60" height="45" rx="3" fill="#D3C9B8" />
          <rect x="830" y="260" width="70" height="45" rx="3" fill="#C8BEAC" />
          <rect x="940" y="260" width="80" height="45" rx="3" fill="#C8BEAC" />
          <rect x="1130" y="250" width="75" height="55" rx="3" fill="#D3C9B8" />
          <rect x="1215" y="250" width="55" height="55" rx="3" fill="#C8BEAC" />
          <rect x="1300" y="250" width="80" height="55" rx="3" fill="#D3C9B8" />

          <rect x="760" y="360" width="130" height="50" rx="3" fill="#C8BEAC" />
          <rect x="940" y="360" width="65" height="50" rx="3" fill="#D3C9B8" />
          <rect x="1015" y="360" width="75" height="50" rx="3" fill="#C8BEAC" />
          <rect x="1130" y="350" width="130" height="60" rx="3" fill="#C8BEAC" />
          <rect x="1300" y="350" width="90" height="60" rx="3" fill="#D3C9B8" />
        </g>

        <g>
          <rect x="40" y="160" width="14" height="440" fill="url(#wfRackSteel)" />
          <rect x="220" y="160" width="14" height="440" fill="url(#wfRackSteel)" />
          <rect x="400" y="160" width="14" height="440" fill="url(#wfRackSteel)" />

          <g stroke="#ABA497" strokeWidth="2">
            <line x1="40" y1="180" x2="220" y2="280" />
            <line x1="220" y1="180" x2="40" y2="280" />
            <line x1="40" y1="290" x2="220" y2="390" />
            <line x1="220" y1="290" x2="40" y2="390" />
            <line x1="40" y1="400" x2="220" y2="500" />
            <line x1="220" y1="400" x2="40" y2="500" />

            <line x1="220" y1="180" x2="400" y2="280" />
            <line x1="400" y1="180" x2="220" y2="280" />
            <line x1="220" y1="290" x2="400" y2="390" />
            <line x1="400" y1="290" x2="220" y2="390" />
            <line x1="220" y1="400" x2="400" y2="500" />
            <line x1="400" y1="400" x2="220" y2="500" />
          </g>

          <rect x="35" y="270" width="380" height="12" rx="2" fill="url(#wfRackBeam)" />
          <rect x="35" y="380" width="380" height="12" rx="2" fill="url(#wfRackBeam)" />
          <rect x="35" y="490" width="380" height="12" rx="2" fill="url(#wfRackBeam)" />

          <rect x="60" y="260" width="150" height="10" fill="url(#wfPallet)" />
          <rect x="65" y="195" width="70" height="65" rx="3" fill="url(#wfBox1)" />
          <rect x="140" y="195" width="65" height="65" rx="3" fill="url(#wfBox2)" />
          <rect x="75" y="215" width="22" height="15" rx="1.5" fill="#ffffff" />
          <rect x="150" y="215" width="22" height="15" rx="1.5" fill="#ffffff" />
          <line x1="78" y1="220" x2="94" y2="220" stroke="#736B5E" strokeWidth="1" strokeDasharray="1 1" />
          <line x1="153" y1="220" x2="169" y2="220" stroke="#736B5E" strokeWidth="1" strokeDasharray="1 1" />

          <rect x="240" y="260" width="150" height="10" fill="url(#wfPallet)" />
          <rect x="245" y="185" width="65" height="75" rx="3" fill="url(#wfBox2)" />
          <rect x="315" y="185" width="70" height="75" rx="3" fill="url(#wfBox1)" />
          <rect x="255" y="205" width="22" height="15" rx="1.5" fill="#ffffff" />
          <rect x="325" y="205" width="22" height="15" rx="1.5" fill="#ffffff" />

          <rect x="60" y="370" width="150" height="10" fill="url(#wfPallet)" />
          <rect x="65" y="300" width="140" height="70" rx="3" fill="url(#wfBox2)" />
          <rect x="75" y="325" width="28" height="18" rx="2" fill="#ffffff" stroke="#5D9273" strokeWidth="1" />
          <rect x="80" y="329" width="8" height="8" rx="1" fill="#171717" />
          <line x1="91" y1="332" x2="100" y2="332" stroke="#4A453E" strokeWidth="1" />

          <rect x="240" y="370" width="150" height="10" fill="url(#wfPallet)" />
          <rect x="245" y="305" width="70" height="65" rx="3" fill="url(#wfBox1)" />
          <rect x="320" y="305" width="65" height="65" rx="3" fill="url(#wfBox2)" />
          <rect x="255" y="330" width="24" height="16" rx="2" fill="#ffffff" />

          <rect x="60" y="480" width="150" height="10" fill="url(#wfPallet)" />
          <rect x="65" y="415" width="65" height="65" rx="3" fill="url(#wfBox1)" />
          <rect x="135" y="415" width="70" height="65" rx="3" fill="url(#wfBox2)" />

          <rect x="240" y="480" width="150" height="10" fill="url(#wfPallet)" />
          <rect x="245" y="410" width="140" height="70" rx="3" fill="url(#wfBox1)" />
          <circle cx="275" cy="445" r="24" fill="url(#wfTagGlow)" />
          <rect x="260" y="435" width="30" height="20" rx="2" fill="#ffffff" stroke="#5D9273" strokeWidth="1.5" filter="url(#wfSoftGlow)" />
          <rect x="265" y="440" width="10" height="10" rx="1" fill="#171717" />
          <circle cx="270" cy="445" r="2" fill="#F5A23A" />
          <line x1="278" y1="443" x2="287" y2="443" stroke="#4A453E" strokeWidth="1" strokeDasharray="1 1" />
          <line x1="262" y1="452" x2="288" y2="452" stroke="#5D9273" strokeWidth="1.5" />
        </g>

        <g>
          <line x1="285" y1="210" x2="265" y2="560" stroke="#ABA497" strokeWidth="4" />
          <line x1="315" y1="210" x2="295" y2="560" stroke="#ABA497" strokeWidth="4" />
          <g stroke="#C2BBB0" strokeWidth="3">
            <line x1="283" y1="240" x2="313" y2="240" />
            <line x1="281" y1="280" x2="311" y2="280" />
            <line x1="279" y1="320" x2="309" y2="320" />
            <line x1="277" y1="360" x2="307" y2="360" />
            <line x1="275" y1="400" x2="305" y2="400" />
            <line x1="273" y1="440" x2="303" y2="440" />
            <line x1="271" y1="480" x2="301" y2="480" />
            <line x1="269" y1="520" x2="299" y2="520" />
          </g>

          <g transform="translate(260, 245)">
            <ellipse cx="25" cy="18" rx="8" ry="10" fill="#D4AF8B" />
            <path d="M 18 16 Q 25 8 32 16 L 31 10 Q 25 6 19 10 Z" fill="#2E2C28" />

            <path d="M 17 28 Q 25 24 33 28 L 35 70 L 15 70 Z" fill="#3D3B36" />
            <path d="M 17 34 L 33 34 L 34 54 L 16 54 Z" fill="#F5A23A" />
            <line x1="17" y1="44" x2="33" y2="44" stroke="#ffffff" strokeWidth="1.5" />

            <path d="M 16 70 L 14 110 L 22 110 L 25 75 L 28 110 L 36 110 L 34 70 Z" fill="#2B2925" />

            <path d="M 33 34 L 48 42 L 52 40" stroke="#3D3B36" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <rect x="49" y="34" width="8" height="14" rx="2" fill="#171717" transform="rotate(-15 49 34)" />
            <line x1="56" y1="40" x2="95" y2="46" stroke="#5D9273" strokeWidth="2" filter="url(#wfSoftGlow)" strokeDasharray="2 1.5" />
          </g>
        </g>

        <g transform="translate(420, 390)">
          <ellipse cx="30" cy="15" rx="10" ry="12" fill="#C9A27F" />
          <path d="M 22 13 Q 30 5 38 13 L 37 7 Q 30 3 23 7 Z" fill="#262420" />

          <path d="M 20 27 Q 30 22 40 27 L 43 85 L 17 85 Z" fill="#383631" />
          <path d="M 20 35 L 40 35 L 42 62 L 18 62 Z" fill="#F5A23A" />
          <line x1="20" y1="48" x2="40" y2="48" stroke="#ffffff" strokeWidth="2" />

          <path d="M 17 85 L 14 150 L 23 150 L 28 92 L 34 150 L 43 150 L 40 85 Z" fill="#262420" />

          <path d="M 20 35 L 5 48 L -115 50" stroke="#5D9273" strokeWidth="2.5" filter="url(#wfSoftGlow)" strokeDasharray="3 2" opacity="0.9" />
          <path d="M 20 35 L 6 48 L -15 53" stroke="#383631" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <rect x="-24" y="44" width="12" height="18" rx="2" fill="#171717" transform="rotate(15 -24 44)" />

          <g stroke="#5D9273" strokeWidth="1.5" fill="none" opacity="0.85">
            <path d="M -115 40 A 15 15 0 0 1 -115 60" />
            <path d="M -105 35 A 25 25 0 0 1 -105 65" />
            <path d="M -95 30 A 35 35 0 0 1 -95 70" />
          </g>
        </g>

        <g transform="translate(560, 430)">
          <rect x="0" y="30" width="80" height="50" rx="6" fill="#C5BEB1" stroke="#ABA497" strokeWidth="2" />
          <rect x="15" y="15" width="50" height="15" rx="3" fill="#ABA497" />
          <circle cx="20" cy="80" r="14" fill="#3D3B36" stroke="#ABA497" strokeWidth="3" />
          <circle cx="60" cy="80" r="14" fill="#3D3B36" stroke="#ABA497" strokeWidth="3" />
          <rect x="10" y="-30" width="60" height="45" rx="3" fill="url(#wfBox1)" />
          <rect x="22" y="-18" width="18" height="12" rx="1.5" fill="#ffffff" />
          <line x1="25" y1="-14" x2="36" y2="-14" stroke="#736B5E" strokeWidth="1" strokeDasharray="1 1" />
          <line x1="75" y1="40" x2="110" y2="70" stroke="#8F887C" strokeWidth="4" strokeLinecap="round" />
        </g>

        <g transform="translate(710, 360)">
          <path d="M 0 170 Q 60 140, 140 165 L 140 200 L 0 200 Z" fill="#CDC7BB" />

          <rect x="40" y="100" width="8" height="65" fill="#ABA497" />
          <polygon points="10,65 75,65 65,100 20,100" fill="#E6E0D5" stroke="#5D9273" strokeWidth="1.5" />
          <circle cx="43" cy="80" r="28" fill="url(#wfTagGlow)" />

          <g transform="translate(68, 30)">
            <ellipse cx="25" cy="18" rx="8" ry="10" fill="#D4AF8B" />
            <path d="M 18 16 Q 25 8 32 16 L 31 10 Q 25 6 19 10 Z" fill="#2E2C28" />

            <path d="M 17 28 Q 25 24 33 28 L 35 85 L 15 85 Z" fill="#3D3B36" />
            <path d="M 17 34 L 33 34 L 34 54 L 16 54 Z" fill="#F5A23A" />
            <path d="M 15 85 L 12 145 L 22 145 L 25 90 L 28 145 L 38 145 L 35 85 Z" fill="#262420" />

            <path d="M 17 38 L 5 52 L -12 55" stroke="#3D3B36" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <circle cx="-14" cy="55" r="3" fill="#D4AF8B" />
          </g>

          <g stroke="#5D9273" strokeWidth="1.5" fill="none" opacity="0.8">
            <path d="M 43 55 A 15 15 0 0 1 43 75" />
            <path d="M 43 45 A 25 25 0 0 1 43 85" strokeDasharray="3 2" />
          </g>
        </g>
      </svg>
    </div>
  )
}
