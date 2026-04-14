import { useEffect, useRef } from 'react'
import './KanbanCard.css'
import {
  buildPetalSlots,
  formatTaskDueDate,
  getTaskMaxPetals,
  getTaskPetals,
  isDueSoon,
} from '../../utils/petalUtils'

function animatePetalCelebration(petalRow) {
  const filledPetals = [...petalRow.querySelectorAll('.card-petal.filled')]
  if (filledPetals.length === 0) return () => {}

  const timers = []
  const avatar = document.querySelector('.profile-icon-btn')
  const avatarRect = avatar?.getBoundingClientRect()
  const cx = window.innerWidth / 2
  const cy = window.innerHeight / 2
  const ax = avatarRect ? avatarRect.left + avatarRect.width / 2 : cx
  const ay = avatarRect ? avatarRect.top + avatarRect.height / 2 : cy + 100
  const total = filledPetals.length
  const formationR = 22 + total * 7

  // Create clones, hide originals, calculate formation positions
  const petals = filledPetals.map((el, i) => {
    const rect = el.getBoundingClientRect()
    const startX = rect.left + rect.width / 2
    const startY = rect.top + rect.height / 2
    const angle = (i / total) * Math.PI * 2 - Math.PI / 2
    const formX = cx + Math.cos(angle) * formationR
    const formY = cy + Math.sin(angle) * formationR

    const clone = document.createElement('span')
    clone.textContent = '🌸'
    clone.style.cssText = `
            position: fixed;
            left: 0;
            top: 0;
            font-size: 0.75rem;
            z-index: 9999;
            pointer-events: none;
        `
    document.body.appendChild(clone)
    el.style.visibility = 'hidden'

    return { clone, el, startX, startY, formX, formY }
  })

  // easeInOutQuart from easings.net
  const EASE_IN_OUT_QUART = 'cubic-bezier(0.76, 0, 0.24, 1)'

  // Gentle random offset for bezier control points (not extreme)
  const nudge = () => (Math.random() - 0.5) * 60

  // Wobble rotation layer, stacked via composite: 'add'
  function addWobble(clone) {
    clone.animate([{ transform: 'rotate(-10deg)' }, { transform: 'rotate(10deg)' }], {
      duration: 200 + Math.random() * 100,
      iterations: Infinity,
      direction: 'alternate',
      composite: 'add',
      easing: 'ease-in-out',
    })
  }

  // Fly to center formation via SVG cubic bezier curves
  const phase1Done = petals.map(({ clone, startX, startY, formX, formY }, i) => {
    const c1x = startX + nudge()
    const c1y = startY - 50 + nudge()
    const c2x = formX + nudge()
    const c2y = formY - 40 + nudge()

    const path = `M ${startX},${startY} C ${c1x},${c1y} ${c2x},${c2y} ${formX},${formY}`

    clone.style.left = '0'
    clone.style.top = '0'
    clone.style.offsetPath = `path('${path}')`
    clone.style.offsetRotate = '0deg'

    clone.animate(
      [
        { offsetDistance: '0%', transform: 'scale(1)' },
        { offsetDistance: '100%', transform: 'scale(2.5)' },
      ],
      {
        duration: 800,
        delay: i * 100,
        easing: EASE_IN_OUT_QUART,
        fill: 'forwards',
      }
    )

    addWobble(clone)

    return new Promise((resolve) => {
      timers.push(setTimeout(resolve, 800 + i * 100))
    })
  })

  // Sequential curved flight to avatar
  // Petals fly behind the avatar (lower z-index) instead of fading out.
  Promise.all(phase1Done).then(() => {
    timers.push(
      setTimeout(() => {
        // Elevate avatar above the petals
        if (avatar) {
          avatar.style.position = 'relative'
          avatar.style.zIndex = '10000'
        }

        petals.forEach(({ clone, formX, formY }, i) => {
          clone.getAnimations().forEach((a) => a.cancel())
          // Lock the grown size into font-size so cancelling scale doesn't shrink
          clone.style.fontSize = '1.875rem'
          // Pin at start of new path so there's no flash to old position
          clone.style.offsetDistance = '0%'

          const side = i % 2 === 0 ? 1 : -1
          const c1x = formX + side * (30 + Math.random() * 30)
          const c1y = formY - 30 + nudge()
          const c2x = ax + side * (20 + Math.random() * 20)
          const c2y = ay - 50 + nudge()

          const path = `M ${formX},${formY} C ${c1x},${c1y} ${c2x},${c2y} ${ax},${ay}`
          clone.style.offsetPath = `path('${path}')`

          addWobble(clone)

          const flight = clone.animate([{ offsetDistance: '0%' }, { offsetDistance: '100%' }], {
            duration: 700,
            delay: i * 120,
            easing: 'cubic-bezier(0.5, 0, 0.75, 0)',
            fill: 'forwards',
          })

          flight.onfinish = () => {
            clone.getAnimations().forEach((a) => a.cancel())
            clone.remove()

            if (i === total - 1 && avatar && !avatar.dataset.bouncing) {
              avatar.dataset.bouncing = '1'
              avatar.classList.add('petal-received')
              timers.push(
                setTimeout(() => {
                  avatar.classList.remove('petal-received')
                  avatar.style.position = ''
                  avatar.style.zIndex = ''
                  delete avatar.dataset.bouncing
                }, 1200)
              )
            }
          }
        })
      }, 600)
    )
  })

  // Return cleanup function: remove all clones, cancel timers, restore petals
  return () => {
    timers.forEach(clearTimeout)
    petals.forEach(({ clone, el }) => {
      clone.getAnimations().forEach((a) => a.cancel())
      if (clone.parentNode) clone.remove()
      el.style.visibility = ''
    })
  }
}

export default function KanbanCard({
  task,
  onDragStart,
  isDragging,
  isVictory,
  onClick,
  currentTime,
}) {
  const petalRowRef = useRef(null)
  const hasAnimatedRef = useRef(false)
  const cleanupRef = useRef(null)

  const formattedDueDate = formatTaskDueDate(task.dueDate)
  const dueSoon = isDueSoon(task, currentTime)
  const petals = getTaskPetals(task, currentTime)
  const maxPetals = getTaskMaxPetals(task)
  const petalSlots = buildPetalSlots(task, currentTime)

  useEffect(() => {
    if (!isVictory || hasAnimatedRef.current || !petalRowRef.current) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    hasAnimatedRef.current = true
    cleanupRef.current = animatePetalCelebration(petalRowRef.current)
  }, [isVictory])

  // Clean up only on unmount (not on isVictory toggle, which would kill the animation)
  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current()
        cleanupRef.current = null
      }
      hasAnimatedRef.current = false
    }
  }, [])

  // Reset animation guard and restore petal visibility when victory ends
  useEffect(() => {
    if (!isVictory) {
      hasAnimatedRef.current = false
      if (petalRowRef.current) {
        petalRowRef.current.querySelectorAll('.card-petal.filled').forEach((el) => {
          el.style.visibility = ''
        })
      }
    }
  }, [isVictory])

  return (
    <div
      className={`kanban-card ${isDragging ? 'dragging' : ''} ${isVictory ? 'victory' : ''}`}
      draggable
      onDragStart={(event) => onDragStart(event, task.id)}
      onClick={() => onClick(task)}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onClick(task)
        }
      }}
    >
      <div className="card-top-row">
        <span className={`card-priority priority-${task.priority}`}>{task.priority}</span>

        <span className="card-petal-count">
          {petals}/{maxPetals}
        </span>
      </div>

      <h3 className="card-title">{task.title}</h3>

      <p className="card-desc">{task.description}</p>

      <div
        ref={petalRowRef}
        className="card-petal-row"
        aria-label={`${petals} of ${maxPetals} petals remaining`}
      >
        {petalSlots.map((slot) => (
          <span key={slot.key} className={`card-petal ${slot.filled ? 'filled' : 'empty'}`}>
            {slot.label}
          </span>
        ))}
      </div>

      <div className="card-footer">
        <span className="card-assignee">{task.assignee}</span>

        {formattedDueDate && (
          <span className={`card-due-date ${dueSoon ? 'due-soon' : ''}`}>{formattedDueDate}</span>
        )}
      </div>
    </div>
  )
}
