import { useEffect } from 'react'

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Traps keyboard focus inside a container while `active` is true.
 * Also focuses the first focusable element on activation, and restores
 * focus to the previously-focused element on deactivation.
 */
export default function useFocusTrap(active, containerRef) {
  useEffect(() => {
    if (!active) return undefined
    const container = containerRef.current
    if (!container) return undefined

    const previouslyFocused = document.activeElement
    const focusables = Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR))
    focusables[0]?.focus()

    function handleKey(event) {
      if (event.key !== 'Tab') return
      const nodes = Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR))
      if (nodes.length === 0) return
      const first = nodes[0]
      const last = nodes[nodes.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    container.addEventListener('keydown', handleKey)
    return () => {
      container.removeEventListener('keydown', handleKey)
      if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
        previouslyFocused.focus()
      }
    }
  }, [active, containerRef])
}
