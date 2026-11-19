import React, { useEffect, useState, useRef } from 'react'

interface NumberTickerProps {
  value: number
  duration?: number
  className?: string
  prefix?: string
  suffix?: string
}

export const NumberTicker: React.FC<NumberTickerProps> = ({
  value,
  duration = 1200,
  className = '',
  prefix = '',
  suffix = ''
}) => {
  const [displayValue, setDisplayValue] = useState(0)
  const previousValueRef = useRef(0)

  useEffect(() => {
    let startTimestamp: number | null = null
    const startValue = previousValueRef.current
    const delta = value - startValue

    let animationFrameId: number

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp
      const elapsed = timestamp - startTimestamp
      const progress = Math.min(elapsed / duration, 1)

      const easeProgress = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(startValue + delta * easeProgress)

      setDisplayValue(current)

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step)
      } else {
        previousValueRef.current = value
      }
    }

    animationFrameId = requestAnimationFrame(step)

    return () => cancelAnimationFrame(animationFrameId)
  }, [value, duration])

  return (
    <span className={`tabular-nums ${className}`}>
      {prefix}
      {displayValue.toLocaleString()}
      {suffix}
    </span>
  )
}
