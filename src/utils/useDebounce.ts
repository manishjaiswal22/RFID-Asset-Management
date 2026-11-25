import { useState, useEffect } from 'react'

/**
 * useDebounce hook
 * Delays updating the debounced value until the specified delay (in ms) has elapsed
 * without any new changes. If the value changes before the delay expires, the timer resets.
 *
 * For search fields, an immediate reset on empty string is supported to provide
 * instant UI clearing when the user deletes the query or clicks the clear "X" button.
 *
 * @param value The raw input value (e.g. search query)
 * @param delay Milliseconds to wait after last change (default: 250ms)
 * @param immediateEmpty When true, instantly emits empty string without waiting (default: true)
 * @returns The debounced value
 */
export function useDebounce<T>(
  value: T,
  delay: number = 250,
  immediateEmpty: boolean = true
): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    // If the value was cleared to an empty string, reset immediately for snappy UI
    if (immediateEmpty && typeof value === 'string' && value.trim() === '') {
      setDebouncedValue(value)
      return
    }

    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay, immediateEmpty])

  return debouncedValue
}

/**
 * General-purpose debounce function for event handlers or callbacks.
 * Delays invoking fn until after wait milliseconds have elapsed since the last time it was invoked.
 *
 * @param fn The function to debounce
 * @param wait Milliseconds to delay
 * @returns Debounced function with .cancel() method
 */
export function debounce<Args extends unknown[]>(
  fn: (...args: Args) => void,
  wait: number = 250
): ((...args: Args) => void) & { cancel: () => void } {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  const debounced = (...args: Args) => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
    }
    timeoutId = setTimeout(() => {
      fn(...args)
      timeoutId = null
    }, wait)
  }

  debounced.cancel = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }

  return debounced
}
