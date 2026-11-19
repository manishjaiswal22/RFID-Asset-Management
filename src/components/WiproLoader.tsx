import React from 'react'

const WIPRO_DOT_COLORS = [
  '#7ec45f',
  '#355493',
  '#3498b3',
  '#746fa7',
  '#be266a',
  '#f57f2a',
  '#ffcd2e'
]

export const WiproLoader: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#F6F5F1] transition-opacity select-none">
      <div className="relative w-20 h-20 flex items-center justify-center">
        {WIPRO_DOT_COLORS.map((color, index) => {
          const angle = (index / WIPRO_DOT_COLORS.length) * 2 * Math.PI
          const radius = 26
          const x = Math.cos(angle) * radius
          const y = Math.sin(angle) * radius

          return (
            <span
              key={index}
              className="absolute w-3.5 h-3.5 rounded-full animate-pulse"
              style={{
                backgroundColor: color,
                transform: `translate(${x}px, ${y}px)`,
                animationDelay: `${index * 150}ms`,
                animationDuration: '1.2s'
              }}
            />
          )
        })}
      </div>

      <p className="mt-5 text-xs font-semibold tracking-widest text-[#171717] uppercase">
        Loading...
      </p>
    </div>
  )
}
