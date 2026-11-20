import React from 'react'
import { useTheme } from '../context/ThemeContext'

export const OfficeRoomBackgroundScene: React.FC = () => {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none transition-colors duration-500">
      <svg
        viewBox="0 0 1440 760"
        preserveAspectRatio="xMidYMid slice"
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Main Wall Gradients */}
          <linearGradient id="wallGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={isDark ? '#141416' : '#F6F3EC'} />
            <stop offset="70%" stopColor={isDark ? '#1A1B1E' : '#ECE6DA'} />
            <stop offset="100%" stopColor={isDark ? '#16171A' : '#E2DACE'} />
          </linearGradient>

          {/* Hardwood Flooring */}
          <linearGradient id="floorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isDark ? '#18191C' : '#E4DCCF'} />
            <stop offset="50%" stopColor={isDark ? '#1D1E22' : '#ECE4D8'} />
            <stop offset="100%" stopColor={isDark ? '#151619' : '#DFD6C8'} />
          </linearGradient>

          {/* Daylight Window Sky */}
          <linearGradient id="windowSky" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={isDark ? '#1A2332' : '#CBE2F4'} />
            <stop offset="50%" stopColor={isDark ? '#222E42' : '#E2EFF9'} />
            <stop offset="100%" stopColor={isDark ? '#2C3A50' : '#F4F9FD'} />
          </linearGradient>

          {/* Warm Sunbeam Gradient */}
          <linearGradient id="sunbeam" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF7D6" stopOpacity={isDark ? '0.04' : '0.45'} />
            <stop offset="60%" stopColor="#FFF9E6" stopOpacity={isDark ? '0.01' : '0.12'} />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>

          {/* Rich Oak Desk Surfaces */}
          <linearGradient id="oakDeskTop" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={isDark ? '#423325' : '#D8C3A5'} />
            <stop offset="50%" stopColor={isDark ? '#4E3D2E' : '#E4D3BC'} />
            <stop offset="100%" stopColor={isDark ? '#3A2C1F' : '#CFBA9B'} />
          </linearGradient>

          <linearGradient id="oakDeskSide" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={isDark ? '#2C2117' : '#B8A183'} />
            <stop offset="100%" stopColor={isDark ? '#1F1710' : '#A0896C'} />
          </linearGradient>

          {/* Modern Rug Texture Gradient */}
          <linearGradient id="rugGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isDark ? '#23252A' : '#DDD2C3'} />
            <stop offset="50%" stopColor={isDark ? '#2A2C33' : '#E8DDD0'} />
            <stop offset="100%" stopColor={isDark ? '#1F2025' : '#D6C9B9'} />
          </linearGradient>

          {/* Laptop & Monitor Metallic Chassis */}
          <linearGradient id="chassisSilver" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isDark ? '#64748B' : '#E2E8F0'} />
            <stop offset="100%" stopColor={isDark ? '#334155' : '#94A3B8'} />
          </linearGradient>

          {/* Glowing Display Screens */}
          <linearGradient id="monitorScreenGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#0284C7" stopOpacity="0.8" />
          </linearGradient>

          <linearGradient id="laptopScreenGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34D399" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#059669" stopOpacity="0.8" />
          </linearGradient>

          {/* Desk Lamp Light Beam */}
          <linearGradient id="deskLampBeam" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FEF08A" stopOpacity={isDark ? '0.35' : '0.25'} />
            <stop offset="100%" stopColor="#FEF08A" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* 1. ROOM BACKGROUND: WALL & FLOOR */}
        <rect width="1440" height="760" fill="url(#wallGradient)" />

        {/* Floor Horizon (y: 530 to 760) */}
        <path d="M 0 530 L 1440 530 L 1440 760 L 0 760 Z" fill="url(#floorGradient)" />
        <line x1="0" y1="530" x2="1440" y2="530" stroke={isDark ? '#26282E' : '#D0C6B8'} strokeWidth="2.5" />

        {/* Floor Perspective Planks */}
        <g stroke={isDark ? '#23242A' : '#DACEC0'} strokeWidth="1" opacity="0.65">
          <line x1="80" y1="530" x2="0" y2="760" />
          <line x1="250" y1="530" x2="180" y2="760" />
          <line x1="440" y1="530" x2="410" y2="760" />
          <line x1="640" y1="530" x2="660" y2="760" />
          <line x1="840" y1="530" x2="920" y2="760" />
          <line x1="1040" y1="530" x2="1180" y2="760" />

          <line x1="0" y1="585" x2="1440" y2="585" />
          <line x1="0" y1="655" x2="1440" y2="655" />
          <line x1="0" y1="720" x2="1440" y2="720" />
        </g>

        {/* Baseboard along the wall */}
        <rect x="0" y="518" width="1440" height="12" fill={isDark ? '#1F2024' : '#DCD2C3'} />
        <line x1="0" y1="518" x2="1440" y2="518" stroke={isDark ? '#2C2D33' : '#C7BCAD'} strokeWidth="1.5" />

        {/* Warm Diagonal Sunlight Beam */}
        <polygon points="540,0 840,0 620,530 200,530" fill="url(#sunbeam)" />

        {/* ============================================================== */}
        {/* SCALED & SHIFTED MAIN OFFICE SCENE (scale: 0.88, y-offset: +38) */}
        {/* Leaves generous clear space in top-left for Wipro logo          */}
        {/* ============================================================== */}
        <g id="scaledOfficeScene" transform="translate(30, 42) scale(0.88)">
          {/* 2. ARCHITECTURAL PANORAMIC ARCHED WINDOW */}
          <g id="archedWindow">
            <path
              d="M 478 190 A 152 152 0 0 1 782 190 L 782 452 L 478 452 Z"
              fill={isDark ? '#0D0E10' : '#D8CFBF'}
              opacity="0.3"
            />
            <path
              d="M 480 190 A 150 150 0 0 1 780 190 L 780 450 L 480 450 Z"
              fill="url(#windowSky)"
            />

            {/* Distant City Skyline & Trees */}
            <g opacity={isDark ? '0.35' : '0.32'} fill={isDark ? '#334155' : '#B2C4D6'}>
              <rect x="495" y="320" width="40" height="130" />
              <rect x="540" y="275" width="48" height="175" />
              <polygon points="540,275 564,245 588,275" />
              <rect x="595" y="300" width="38" height="150" />
              <rect x="640" y="260" width="55" height="190" />
              <line x1="667" y1="230" x2="667" y2="260" stroke={isDark ? '#475569' : '#8FA4B8'} strokeWidth="2" />
              <rect x="702" y="315" width="45" height="135" />
              <rect x="752" y="285" width="25" height="165" />

              <circle cx="515" cy="415" r="28" fill={isDark ? '#14532D' : '#86EFAC'} opacity="0.6" />
              <circle cx="550" cy="425" r="32" fill={isDark ? '#15803D' : '#4ADE80'} opacity="0.7" />
              <circle cx="740" cy="420" r="30" fill={isDark ? '#166534' : '#86EFAC'} opacity="0.6" />
            </g>

            {/* Fluffy Clouds */}
            <g fill="#FFFFFF" opacity={isDark ? '0.15' : '0.65'}>
              <ellipse cx="550" cy="165" rx="32" ry="14" />
              <circle cx="568" cy="155" r="16" />
              <circle cx="538" cy="160" r="13" />

              <ellipse cx="690" cy="185" rx="28" ry="12" />
              <circle cx="704" cy="178" r="14" />
            </g>

            {/* Window Frame */}
            <path
              d="M 480 190 A 150 150 0 0 1 780 190 L 780 450 L 480 450 Z"
              fill="none"
              stroke={isDark ? '#2D3036' : '#C4B7A5'}
              strokeWidth="10"
            />
            <line x1="630" y1="40" x2="630" y2="450" stroke={isDark ? '#2D3036' : '#C4B7A5'} strokeWidth="6" />
            <line x1="480" y1="260" x2="780" y2="260" stroke={isDark ? '#2D3036' : '#C4B7A5'} strokeWidth="6" />
            <line x1="480" y1="365" x2="780" y2="365" stroke={isDark ? '#2D3036' : '#C4B7A5'} strokeWidth="4" />

            <rect x="466" y="446" width="328" height="12" rx="3" fill={isDark ? '#3E342B' : '#B8A48F'} />
            <rect x="468" y="446" width="324" height="4" fill={isDark ? '#4F4337' : '#D1C0AD'} />
          </g>

          {/* 3. WALL DECORATIONS */}
          {/* Wall Clock (x: 405, y: 95) */}
          <g id="wallClock" transform="translate(405, 95)">
            <circle cx="28" cy="28" r="28" fill={isDark ? '#24262C' : '#FFFFFF'} stroke={isDark ? '#3A3D46' : '#D4C9BA'} strokeWidth="3" />
            <circle cx="28" cy="28" r="25" fill={isDark ? '#1C1D22' : '#FAFAF8'} />
            <line x1="28" y1="6" x2="28" y2="10" stroke={isDark ? '#64748B' : '#8A7F70'} strokeWidth="2" strokeLinecap="round" />
            <line x1="28" y1="46" x2="28" y2="50" stroke={isDark ? '#64748B' : '#8A7F70'} strokeWidth="2" strokeLinecap="round" />
            <line x1="6" y1="28" x2="10" y2="28" stroke={isDark ? '#64748B' : '#8A7F70'} strokeWidth="2" strokeLinecap="round" />
            <line x1="46" y1="28" x2="50" y2="28" stroke={isDark ? '#64748B' : '#8A7F70'} strokeWidth="2" strokeLinecap="round" />
            <line x1="28" y1="28" x2="17" y2="17" stroke={isDark ? '#EDEDED' : '#1E293B'} strokeWidth="2.5" strokeLinecap="round" />
            <line x1="28" y1="28" x2="38" y2="16" stroke={isDark ? '#EDEDED' : '#1E293B'} strokeWidth="2" strokeLinecap="round" />
            <circle cx="28" cy="28" r="3" fill="#DC2626" />
          </g>

          {/* FLOATING BOOKSHELVES ON WALL (x: 185 to 375) */}
          {/* Upper Shelf (y: 130) with Colorful Books & Cascading Plant */}
          <g id="shelfUpper" transform="translate(185, 130)">
            <rect x="0" y="16" width="190" height="6" rx="2" fill={isDark ? '#0F1012' : '#C8BFB2'} opacity="0.35" />
            <rect x="0" y="8" width="190" height="9" rx="2" fill={isDark ? '#423325' : '#CBB499'} stroke={isDark ? '#554231' : '#B89F82'} strokeWidth="1" />
            <path d="M 22 17 L 22 28 L 30 17 Z" fill={isDark ? '#6B5842' : '#9E8262'} />
            <path d="M 168 17 L 168 28 L 160 17 Z" fill={isDark ? '#6B5842' : '#9E8262'} />

            {/* Books */}
            <rect x="15" y="-36" width="12" height="44" rx="1.5" fill="#1E3A8A" />
            <line x1="15" y1="-26" x2="27" y2="-26" stroke="#93C5FD" strokeWidth="1.5" />
            <rect x="29" y="-42" width="14" height="50" rx="1.5" fill="#047857" />
            <line x1="29" y1="-22" x2="43" y2="-22" stroke="#6EE7B7" strokeWidth="1.5" />
            <rect x="45" y="-38" width="11" height="46" rx="1.5" fill="#DC2626" />
            <rect x="58" y="-34" width="13" height="42" rx="1.5" fill="#D97706" />
            <line x1="58" y1="-18" x2="71" y2="-18" stroke="#FDE68A" strokeWidth="1" />
            <g transform="translate(73, 8) rotate(16) translate(-73, -8)">
              <rect x="73" y="-38" width="11" height="44" rx="1.5" fill="#7C3AED" />
            </g>

            {/* Hourglass */}
            <g transform="translate(108, -25)">
              <line x1="0" y1="0" x2="16" y2="0" stroke="#B45309" strokeWidth="2" />
              <line x1="0" y1="32" x2="16" y2="32" stroke="#B45309" strokeWidth="2" />
              <path d="M 2 2 Q 8 16 2 30 L 14 30 Q 8 16 14 2 Z" fill={isDark ? '#334155' : '#E2E8F0'} opacity="0.75" stroke="#94A3B8" strokeWidth="1" />
              <polygon points="4,28 12,28 8,20" fill="#F59E0B" />
            </g>

            {/* Trailing Vine Plant */}
            <g transform="translate(142, -18)">
              <polygon points="3,8 25,8 22,26 6,26" fill={isDark ? '#3E342B' : '#E0D5C3'} stroke={isDark ? '#4F4238' : '#C2B4A0'} strokeWidth="1" />
              <ellipse cx="14" cy="8" rx="11" ry="3" fill="#57534E" />
              <path d="M 14 8 Q 8 24 6 36 Q 4 48 8 58" stroke="#15803D" strokeWidth="2" fill="none" strokeLinecap="round" />
              <ellipse cx="6" cy="28" rx="4" ry="6" fill="#22C55E" transform="rotate(-25 6 28)" />
              <ellipse cx="10" cy="40" rx="4" ry="5.5" fill="#16A34A" transform="rotate(30 10 40)" />
              <ellipse cx="6" cy="50" rx="3.5" ry="5" fill="#4ADE80" transform="rotate(-15 6 50)" />
              <ellipse cx="9" cy="58" rx="3" ry="4" fill="#15803D" />

              <path d="M 18 8 Q 24 22 26 34" stroke="#15803D" strokeWidth="1.8" fill="none" strokeLinecap="round" />
              <ellipse cx="23" cy="20" rx="3.5" ry="5" fill="#22C55E" transform="rotate(35 23 20)" />
              <ellipse cx="27" cy="32" rx="3.5" ry="5" fill="#16A34A" transform="rotate(-20 27 32)" />
            </g>
          </g>

          {/* Lower Shelf (y: 230) */}
          <g id="shelfLower" transform="translate(185, 230)">
            <rect x="0" y="16" width="165" height="6" rx="2" fill={isDark ? '#0F1012' : '#C8BFB2'} opacity="0.35" />
            <rect x="0" y="8" width="165" height="9" rx="2" fill={isDark ? '#423325' : '#CBB499'} stroke={isDark ? '#554231' : '#B89F82'} strokeWidth="1" />
            <path d="M 22 17 L 22 28 L 30 17 Z" fill={isDark ? '#6B5842' : '#9E8262'} />
            <path d="M 145 17 L 145 28 L 137 17 Z" fill={isDark ? '#6B5842' : '#9E8262'} />

            {/* Stacked Books */}
            <rect x="20" y="-1" width="55" height="9" rx="1.5" fill="#0284C7" />
            <rect x="22" y="-10" width="50" height="9" rx="1.5" fill="#EA580C" />
            <rect x="25" y="-19" width="45" height="9" rx="1.5" fill="#10B981" />
            <path d="M 52 -10 L 52 2" stroke="#FEF08A" strokeWidth="1.5" strokeLinecap="round" />

            {/* Photo Frame */}
            <rect x="90" y="-28" width="30" height="36" rx="2" fill={isDark ? '#282A30' : '#FFFFFF'} stroke={isDark ? '#3F434D' : '#8A7D6C'} strokeWidth="2" />
            <rect x="94" y="-24" width="22" height="28" fill="#38BDF8" opacity="0.4" />
            <circle cx="105" cy="-14" r="5" fill="#F59E0B" />
            <polygon points="94,-2 102,-12 110,-4 116,-9 116,-2" fill="#10B981" />

            {/* Mini Cactus */}
            <g transform="translate(132, -18)">
              <polygon points="2,8 18,8 15,26 5,26" fill="#F43F5E" />
              <ellipse cx="10" cy="5" rx="5" ry="9" fill="#15803D" />
              <ellipse cx="6" cy="6" rx="3" ry="4" fill="#22C55E" />
              <ellipse cx="14" cy="4" rx="3" ry="5" fill="#16A34A" />
            </g>
          </g>

          {/* Corkboard (x: 80, y: 220) - shifted down comfortably away from Wipro logo */}
          <g id="corkboard" transform="translate(80, 225)">
            <rect x="0" y="0" width="85" height="110" rx="4" fill={isDark ? '#382D22' : '#D4A373'} stroke={isDark ? '#4D3E2F' : '#B88252'} strokeWidth="3" />
            <rect x="8" y="10" width="28" height="28" rx="1" fill="#FEF08A" transform="rotate(-6 8 10)" />
            <circle cx="20" cy="12" r="2" fill="#DC2626" />
            <line x1="12" y1="20" x2="30" y2="20" stroke="#713F12" strokeWidth="1" />
            <line x1="12" y1="26" x2="26" y2="26" stroke="#713F12" strokeWidth="1" />

            <rect x="46" y="14" width="28" height="28" rx="1" fill="#BAE6FD" transform="rotate(5 46 14)" />
            <circle cx="60" cy="16" r="2" fill="#2563EB" />
            <line x1="50" y1="24" x2="68" y2="24" stroke="#0369A1" strokeWidth="1" />

            <rect x="14" y="52" width="34" height="24" rx="1" fill="#BBF7D0" transform="rotate(3 14 52)" />
            <circle cx="30" cy="53" r="2" fill="#15803D" />

            <rect x="48" y="56" width="28" height="34" rx="1" fill="#FED7AA" transform="rotate(-4 48 56)" />
            <circle cx="62" cy="58" r="2" fill="#C2410C" />
            <rect x="52" y="76" width="3" height="8" fill="#EA580C" />
            <rect x="57" y="72" width="3" height="12" fill="#EA580C" />
            <rect x="62" y="68" width="3" height="16" fill="#EA580C" />
            <rect x="67" y="74" width="3" height="10" fill="#EA580C" />
          </g>

          {/* 4. DESIGNER AREA RUG */}
          <g id="designerRug">
            <ellipse cx="490" cy="625" rx="350" ry="95" fill={isDark ? '#0D0E10' : '#CEC3B3'} opacity="0.4" />
            <ellipse cx="490" cy="620" rx="345" ry="90" fill="url(#rugGradient)" />
            <ellipse
              cx="490"
              cy="620"
              rx="325"
              ry="82"
              fill="none"
              stroke={isDark ? '#3A3D46' : '#C2B5A2'}
              strokeWidth="2.5"
              strokeDasharray="8 6"
            />
            <ellipse
              cx="490"
              cy="620"
              rx="295"
              ry="72"
              fill="none"
              stroke={isDark ? '#33363F' : '#B8AA97'}
              strokeWidth="1.5"
            />
          </g>

          {/* 5. INDOOR MONSTERA PLANT (Cleanly above footer) */}
          <g id="largeMonsteraPlant" transform="translate(60, 395)">
            <ellipse cx="38" cy="245" rx="35" ry="12" fill={isDark ? '#0D0E10' : '#B8AC9C'} opacity="0.4" />
            <g stroke={isDark ? '#3E342B' : '#8A7356'} strokeWidth="5" strokeLinecap="round">
              <line x1="20" y1="180" x2="8" y2="245" />
              <line x1="56" y1="180" x2="68" y2="245" />
              <line x1="38" y1="180" x2="38" y2="240" />
            </g>

            <polygon points="12,120 64,120 58,195 18,195" fill={isDark ? '#2D3036' : '#FAF8F5'} stroke={isDark ? '#3E434C' : '#D1C7B8'} strokeWidth="2.5" />
            <ellipse cx="38" cy="120" rx="26" ry="7" fill={isDark ? '#1C1D21' : '#6B5842'} />
            <line x1="16" y1="140" x2="60" y2="140" stroke="#F59E0B" strokeWidth="2" />

            <path d="M 38 120 Q 20 60 -10 40" stroke="#15803D" strokeWidth="4.5" fill="none" strokeLinecap="round" />
            <g transform="translate(-10, 40) rotate(-35)">
              <path
                d="M 0 0 C -25 -20, -35 -60, 0 -85 C 35 -60, 25 -20, 0 0 Z"
                fill={isDark ? '#166534' : '#22C55E'}
              />
              <path d="M -8 -30 Q -18 -42 -26 -40" stroke={isDark ? '#141416' : '#F6F3EC'} strokeWidth="3" strokeLinecap="round" />
              <path d="M -6 -50 Q -14 -60 -20 -58" stroke={isDark ? '#141416' : '#F6F3EC'} strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 8 -30 Q 18 -42 26 -40" stroke={isDark ? '#141416' : '#F6F3EC'} strokeWidth="3" strokeLinecap="round" />
              <path d="M 6 -50 Q 14 -60 20 -58" stroke={isDark ? '#141416' : '#F6F3EC'} strokeWidth="2.5" strokeLinecap="round" />
              <line x1="0" y1="0" x2="0" y2="-75" stroke="#15803D" strokeWidth="2" />
            </g>

            <path d="M 38 120 Q 38 40 35 -5" stroke="#15803D" strokeWidth="5" fill="none" strokeLinecap="round" />
            <g transform="translate(35, -5) rotate(5)">
              <path
                d="M 0 0 C -28 -25, -38 -70, 0 -95 C 38 -70, 28 -25, 0 0 Z"
                fill={isDark ? '#15803D' : '#16A34A'}
              />
              <path d="M -10 -35 Q -22 -48 -30 -45" stroke={isDark ? '#141416' : '#F6F3EC'} strokeWidth="3.5" strokeLinecap="round" />
              <path d="M -8 -60 Q -16 -70 -24 -68" stroke={isDark ? '#141416' : '#F6F3EC'} strokeWidth="3" strokeLinecap="round" />
              <path d="M 10 -35 Q 22 -48 30 -45" stroke={isDark ? '#141416' : '#F6F3EC'} strokeWidth="3.5" strokeLinecap="round" />
              <path d="M 8 -60 Q 16 -70 24 -68" stroke={isDark ? '#141416' : '#F6F3EC'} strokeWidth="3" strokeLinecap="round" />
              <line x1="0" y1="0" x2="0" y2="-85" stroke="#14532D" strokeWidth="2" />
            </g>

            <path d="M 38 120 Q 60 65 85 45" stroke="#15803D" strokeWidth="4" fill="none" strokeLinecap="round" />
            <g transform="translate(85, 45) rotate(40)">
              <path
                d="M 0 0 C -22 -18, -32 -55, 0 -78 C 32 -55, 22 -18, 0 0 Z"
                fill={isDark ? '#166534' : '#4ADE80'}
              />
              <path d="M -8 -28 Q -16 -38 -24 -36" stroke={isDark ? '#141416' : '#F6F3EC'} strokeWidth="3" strokeLinecap="round" />
              <path d="M 8 -28 Q 16 -38 24 -36" stroke={isDark ? '#141416' : '#F6F3EC'} strokeWidth="3" strokeLinecap="round" />
              <line x1="0" y1="0" x2="0" y2="-70" stroke="#15803D" strokeWidth="1.8" />
            </g>

            <ellipse cx="14" cy="95" rx="18" ry="12" fill={isDark ? '#14532D' : '#15803D'} transform="rotate(-30 14 95)" />
            <ellipse cx="62" cy="100" rx="19" ry="13" fill={isDark ? '#15803D' : '#22C55E'} transform="rotate(30 62 100)" />
          </g>

          {/* 6. COLLABORATING COLLEAGUE ON LAPTOP (x: 170 to 270) */}
          <g id="colleagueCollaborating" transform="translate(170, 380)">
            <g id="loungeChair">
              <line x1="20" y1="180" x2="10" y2="235" stroke={isDark ? '#3E342B' : '#786551'} strokeWidth="4" strokeLinecap="round" />
              <line x1="80" y1="180" x2="90" y2="235" stroke={isDark ? '#3E342B' : '#786551'} strokeWidth="4" strokeLinecap="round" />
              <line x1="30" y1="180" x2="25" y2="235" stroke={isDark ? '#2D251D' : '#5C4D3D'} strokeWidth="3.5" strokeLinecap="round" />
              <line x1="70" y1="180" x2="75" y2="235" stroke={isDark ? '#2D251D' : '#5C4D3D'} strokeWidth="3.5" strokeLinecap="round" />

              <rect x="15" y="145" width="70" height="25" rx="8" fill={isDark ? '#883A20' : '#EA580C'} />
              <path d="M 80 90 Q 88 140 85 165 L 75 165 Q 78 140 70 90 Z" fill={isDark ? '#9A3412' : '#C2410C'} />
              <path d="M 20 85 Q 12 135 15 165 L 25 165 Q 22 135 30 85 Z" fill={isDark ? '#7C2D12' : '#9A3412'} />
            </g>

            <path d="M 32 150 L 58 150 L 64 210 L 48 210 Z" fill={isDark ? '#1E293B' : '#334155'} />
            <rect x="46" y="208" width="22" height="7" rx="3" fill="#0F172A" />

            <path d="M 32 80 Q 50 72 66 80 L 62 152 L 35 152 Z" fill={isDark ? '#064E3B' : '#047857'} />
            <polygon points="46,76 54,76 50,105" fill="#FEF3C7" />

            <rect x="46" y="55" width="9" height="12" rx="2" fill="#E2B18A" />
            <ellipse cx="50" cy="45" rx="12" ry="14" fill="#E2B18A" />
            <path d="M 38 43 Q 37 30 50 30 Q 63 30 62 43 Q 56 36 50 36 Q 44 36 38 43 Z" fill="#3B2314" />
            <path d="M 62 38 Q 72 45 74 60 Q 66 58 60 48 Z" fill="#3B2314" />
            <rect x="44" y="42" width="7" height="5" rx="1.5" fill="none" stroke="#1E293B" strokeWidth="1.2" />

            <path d="M 34 85 Q 38 115 50 120" stroke={isDark ? '#064E3B' : '#047857'} strokeWidth="9" strokeLinecap="round" fill="none" />
            <ellipse cx="50" cy="122" rx="4" ry="3" fill="#E2B18A" />

            {/* Colleague Laptop (Pure and clean, no tags) */}
            <g transform="translate(36, 105)">
              <polygon points="4,24 46,24 50,28 0,28" fill="url(#chassisSilver)" />
              <polygon points="6,6 44,6 46,24 4,24" fill={isDark ? '#0F172A' : '#1E293B'} />
              <polygon points="8,8 42,8 44,22 6,22" fill="url(#laptopScreenGlow)" opacity="0.9" />
              <line x1="10" y1="12" x2="26" y2="12" stroke="#FFFFFF" strokeWidth="1" />
              <line x1="10" y1="16" x2="34" y2="16" stroke="#FFFFFF" strokeWidth="0.8" opacity="0.8" />
            </g>

            {/* Side Table with Coffee */}
            <rect x="96" y="165" width="4" height="60" rx="1" fill={isDark ? '#3E342B' : '#8A7356'} />
            <ellipse cx="98" cy="165" rx="20" ry="6" fill={isDark ? '#4F4238' : '#D4C3AC'} />
            <ellipse cx="98" cy="225" rx="15" ry="4" fill={isDark ? '#2D251D' : '#6B5842'} />
            <rect x="93" y="152" width="10" height="12" rx="2" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
            <path d="M 103 155 C 107 155, 107 160, 103 160" fill="none" stroke="#CBD5E1" strokeWidth="1" />
            <path d="M 97 148 Q 99 144 97 140" stroke="#94A3B8" strokeWidth="0.8" fill="none" opacity="0.6" />
          </g>

          {/* 7. MAIN EXECUTIVE WOODEN DESK & ACCESSORIES */}
          <g id="mainExecutiveDesk">
            <polygon points="300,560 760,560 720,580 320,580" fill={isDark ? '#0B0C0E' : '#B8AC9C'} opacity="0.45" />

            {/* Desk Drawers Unit */}
            <g id="deskDrawers">
              <rect x="640" y="450" width="100" height="110" rx="3" fill="url(#oakDeskSide)" stroke={isDark ? '#3D2F22' : '#9E8569'} strokeWidth="1.5" />
              <rect x="646" y="456" width="88" height="30" rx="2" fill={isDark ? '#3A2C1F' : '#CFBA9B'} />
              <rect x="678" y="469" width="24" height="4" rx="2" fill="#D97706" />
              <rect x="646" y="490" width="88" height="30" rx="2" fill={isDark ? '#3A2C1F' : '#CFBA9B'} />
              <rect x="678" y="503" width="24" height="4" rx="2" fill="#D97706" />
              <rect x="646" y="524" width="88" height="30" rx="2" fill={isDark ? '#3A2C1F' : '#CFBA9B'} />
              <rect x="678" y="537" width="24" height="4" rx="2" fill="#D97706" />
            </g>

            {/* Left Legs */}
            <g stroke={isDark ? '#23252A' : '#334155'} strokeWidth="7" strokeLinecap="round">
              <line x1="315" y1="450" x2="305" y2="560" />
              <line x1="355" y1="450" x2="365" y2="560" />
            </g>
            <rect x="295" y="556" width="78" height="6" rx="2" fill={isDark ? '#1C1D21' : '#1E293B'} />
            <rect x="360" y="450" width="280" height="70" fill={isDark ? '#261C14' : '#B8A48A'} opacity="0.75" />

            {/* Oak Desktop Surface */}
            <polygon points="290,436 760,436 745,456 275,456" fill="url(#oakDeskTop)" />
            <rect x="275" y="456" width="470" height="14" rx="2" fill="url(#oakDeskSide)" />

            {/* Leather Blotter */}
            <polygon points="380,440 620,440 615,454 375,454" fill={isDark ? '#1E222A' : '#334155'} stroke={isDark ? '#2B303B' : '#475569'} strokeWidth="1" />

            {/* Reference Books on Desk */}
            <g id="deskBooks">
              <rect x="295" y="432" width="56" height="8" rx="1.5" fill="#1E3A8A" />
              <line x1="295" y1="436" x2="351" y2="436" stroke="#93C5FD" strokeWidth="1" />
              <rect x="298" y="424" width="50" height="8" rx="1.5" fill="#DC2626" />
              <rect x="302" y="416" width="44" height="8" rx="1.5" fill="#D97706" />
              <line x1="302" y1="420" x2="346" y2="420" stroke="#FDE68A" strokeWidth="0.8" />
              <path d="M 340 424 Q 346 435 342 445" stroke="#FBBF24" strokeWidth="2" fill="none" strokeLinecap="round" />
            </g>

            {/* Pen Holder */}
            <g id="penHolder" transform="translate(358, 412)">
              <rect x="2" y="14" width="16" height="24" rx="2" fill={isDark ? '#334155' : '#FFFFFF'} stroke={isDark ? '#475569' : '#CBD5E1'} strokeWidth="1.5" />
              <line x1="6" y1="2" x2="6" y2="16" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="10" y1="-2" x2="10" y2="16" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" />
              <line x1="14" y1="4" x2="14" y2="16" stroke="#F59E0B" strokeWidth="3.5" strokeLinecap="square" />
              <line x1="16" y1="1" x2="16" y2="16" stroke="#059669" strokeWidth="2" strokeLinecap="round" />
            </g>

            {/* Anglepoise Lamp */}
            <g id="deskLamp" transform="translate(305, 315)">
              <ellipse cx="20" cy="128" rx="14" ry="4" fill="#D97706" stroke="#B45309" strokeWidth="1" />
              <line x1="20" y1="128" x2="35" y2="65" stroke="#F59E0B" strokeWidth="3.5" strokeLinecap="round" />
              <circle cx="35" cy="65" r="4" fill="#78350F" />
              <line x1="35" y1="65" x2="68" y2="52" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
              <circle cx="68" cy="52" r="3.5" fill="#78350F" />
              <g transform="translate(68, 52) rotate(32)">
                <path d="M -8 0 L 16 0 L 22 18 L -14 18 Z" fill="#F59E0B" stroke="#B45309" strokeWidth="1" />
                <ellipse cx="4" cy="18" rx="18" ry="4" fill="#FEF08A" />
                <polygon points="-6,18 35,130 -40,130" fill="url(#deskLampBeam)" />
              </g>
            </g>

            {/* Coffee Mug */}
            <g id="deskCoffee" transform="translate(630, 432)">
              <rect x="0" y="4" width="14" height="16" rx="2" fill="#FFFFFF" stroke={isDark ? '#475569' : '#CBD5E1'} strokeWidth="1" />
              <path d="M 14 8 C 19 8, 19 14, 14 14" fill="none" stroke={isDark ? '#475569' : '#CBD5E1'} strokeWidth="2" />
              <circle cx="7" cy="12" r="2" fill="#1D63ED" />
              <path d="M 5 0 Q 3 -6 5 -12" stroke="#94A3B8" strokeWidth="1" fill="none" opacity="0.6" strokeLinecap="round" />
              <path d="M 9 -2 Q 11 -8 9 -14" stroke="#94A3B8" strokeWidth="1" fill="none" opacity="0.5" strokeLinecap="round" />
            </g>

            {/* Desktop Monitor (Pure and clean, no tags) */}
            <g id="desktopMonitor" transform="translate(520, 310)">
              <rect x="42" y="105" width="8" height="30" rx="1" fill="url(#chassisSilver)" />
              <ellipse cx="46" cy="135" rx="20" ry="5" fill="url(#chassisSilver)" />

              <rect x="0" y="0" width="92" height="106" rx="4" fill={isDark ? '#0F172A' : '#1E293B'} stroke={isDark ? '#334155' : '#64748B'} strokeWidth="2" />
              <rect x="3" y="3" width="86" height="100" rx="2" fill="url(#monitorScreenGlow)" opacity="0.9" />

              <rect x="8" y="12" width="38" height="6" rx="1.5" fill="#FFFFFF" opacity="0.9" />
              <rect x="8" y="24" width="76" height="1" fill="#FFFFFF" opacity="0.3" />

              <polyline
                points="10,55 24,42 38,48 52,34 66,39 80,26"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <rect x="12" y="68" width="8" height="22" rx="1" fill="#34D399" />
              <rect x="26" y="62" width="8" height="28" rx="1" fill="#FBBF24" />
              <rect x="40" y="56" width="8" height="34" rx="1" fill="#38BDF8" />
              <rect x="54" y="64" width="8" height="26" rx="1" fill="#F472B6" />
              <rect x="68" y="52" width="8" height="38" rx="1" fill="#A78BFA" />
            </g>
          </g>

          {/* 8. PRIMARY USER: BUSINESSMAN ON LAPTOP */}
          <g id="businessmanPrimary">
            {/* Chair */}
            <g id="execChair">
              <line x1="470" y1="490" x2="470" y2="550" stroke={isDark ? '#404552' : '#475569'} strokeWidth="9" />
              <line x1="470" y1="550" x2="425" y2="578" stroke={isDark ? '#2D3039' : '#334155'} strokeWidth="5" strokeLinecap="round" />
              <line x1="470" y1="550" x2="515" y2="578" stroke={isDark ? '#2D3039' : '#334155'} strokeWidth="5" strokeLinecap="round" />
              <line x1="470" y1="550" x2="470" y2="585" stroke={isDark ? '#2D3039' : '#334155'} strokeWidth="5" strokeLinecap="round" />
              <circle cx="425" cy="580" r="4" fill="#0F172A" />
              <circle cx="515" cy="580" r="4" fill="#0F172A" />
              <circle cx="470" cy="587" r="4" fill="#0F172A" />

              <ellipse cx="470" cy="485" rx="38" ry="12" fill={isDark ? '#1E293B' : '#334155'} />
              <path
                d="M 440 350 Q 432 410 436 475 L 504 475 Q 508 410 500 350 Z"
                fill={isDark ? '#1E293B' : '#475569'}
                opacity="0.9"
              />
              <rect x="452" y="325" width="36" height="20" rx="9" fill={isDark ? '#0F172A' : '#1E293B'} />
              <path d="M 432 430 L 432 460" stroke={isDark ? '#334155' : '#64748B'} strokeWidth="4" strokeLinecap="round" />
              <rect x="426" y="426" width="12" height="5" rx="2" fill="#0F172A" />
            </g>

            {/* Legs */}
            <path d="M 448 485 L 442 540 L 460 540 L 466 485 Z" fill={isDark ? '#0F172A' : '#1E293B'} />
            <path d="M 474 485 L 478 540 L 496 540 L 492 485 Z" fill={isDark ? '#0F172A' : '#1E293B'} />

            {/* Torso */}
            <path d="M 444 395 Q 470 385 496 395 L 500 482 L 440 482 Z" fill={isDark ? '#1D4ED8' : '#2563EB'} />
            <polygon points="464,390 476,390 470,418" fill="#F8FAFC" />
            <polygon points="468,400 472,400 473,435 470,442 467,435" fill="#DC2626" />

            {/* Head & Features */}
            <rect x="464" y="360" width="12" height="18" rx="2" fill="#D4A373" />
            <ellipse cx="470" cy="345" rx="15" ry="18" fill="#D4A373" />

            <path
              d="M 454 344 Q 452 322 470 322 Q 488 322 486 344 Q 478 332 470 332 Q 462 332 454 344 Z"
              fill="#1E1B18"
            />
            <ellipse cx="454" cy="346" rx="3" ry="5" fill="#D4A373" />
            <path d="M 456 342 L 456 348" stroke="#1E1B18" strokeWidth="2" strokeLinecap="round" />

            <rect x="460" y="340" width="10" height="7" rx="2" fill="none" stroke="#0F172A" strokeWidth="1.5" />
            <rect x="474" y="340" width="10" height="7" rx="2" fill="none" stroke="#0F172A" strokeWidth="1.5" />
            <line x1="470" y1="343" x2="474" y2="343" stroke="#0F172A" strokeWidth="1.5" />
            <path d="M 467 354 Q 472 358 477 354" stroke="#78350F" strokeWidth="1.2" strokeLinecap="round" fill="none" />

            {/* Arms & Hands Typing */}
            <path d="M 446 405 Q 430 435 425 450 L 444 450 Q 448 435 454 405 Z" fill={isDark ? '#1D4ED8' : '#2563EB'} />
            <path d="M 494 405 Q 508 435 510 450 L 492 450 Q 488 435 486 405 Z" fill={isDark ? '#1D4ED8' : '#2563EB'} />
            <ellipse cx="434" cy="450" rx="7" ry="4" fill="#D4A373" />
            <ellipse cx="504" cy="450" rx="7" ry="4" fill="#D4A373" />
            <rect x="432" y="443" width="5" height="4" rx="1" fill="#0F172A" />

            {/* OPEN LAPTOP (Pure and clean, no tags) */}
            <g id="businessmanLaptop" transform="translate(425, 412)">
              <polygon points="12,38 72,38 80,44 4,44" fill="url(#chassisSilver)" />
              <rect x="18" y="39" width="48" height="2" fill={isDark ? '#1E293B' : '#64748B'} />
              <rect x="36" y="42" width="14" height="1.5" rx="0.5" fill={isDark ? '#334155' : '#94A3B8'} />

              <polygon points="16,10 68,10 72,38 12,38" fill={isDark ? '#0F172A' : '#1E293B'} />
              <polygon points="18,12 66,12 70,36 14,36" fill="url(#laptopScreenGlow)" opacity="0.95" />

              <line x1="20" y1="16" x2="42" y2="16" stroke="#FFFFFF" strokeWidth="1.2" />
              <line x1="20" y1="20" x2="52" y2="20" stroke="#FFFFFF" strokeWidth="0.8" opacity="0.85" />
              <line x1="20" y1="24" x2="36" y2="24" stroke="#FFFFFF" strokeWidth="0.8" opacity="0.85" />
              <line x1="20" y1="28" x2="58" y2="28" stroke="#38BDF8" strokeWidth="1.2" />
              <line x1="20" y1="32" x2="48" y2="32" stroke="#FEF08A" strokeWidth="1" />
            </g>

            {/* Mouse */}
            <ellipse cx="516" cy="452" rx="6" ry="9" fill={isDark ? '#334155' : '#FFFFFF'} stroke={isDark ? '#475569' : '#CBD5E1'} strokeWidth="1" />
            <line x1="516" y1="444" x2="516" y2="449" stroke="#94A3B8" strokeWidth="1" />
          </g>
        </g>
      </svg>
    </div>
  )
}

export default OfficeRoomBackgroundScene
