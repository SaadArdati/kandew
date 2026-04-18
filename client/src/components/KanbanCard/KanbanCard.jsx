import { useEffect, useRef } from 'react'
import './KanbanCard.css'
import {
  buildPetalSlots,
  formatTaskDueDate,
  getTaskMaxPetals,
  getTaskPetals,
  isDueSoon,
} from '../../utils/petalUtils'

const PHASE_1_DURATION = 350
const PHASE_1_STAGGER = 100
const BASE_HOLD = 600
const PHASE_2_STAGGER = 120
const PHASE_2_DURATION = 350
const EASE_OUT_QUART = 'cubic-bezier(0.25, 1, 0.5, 1)'

function findTargetBubble(assigneeUserId) {
  if (assigneeUserId) {
    const assigneeBubble = document.querySelector(`[data-user-id="${assigneeUserId}"]`)
    if (assigneeBubble) return assigneeBubble
  }
  return document.querySelector('.profile-icon-btn')
}

function animatePetalCelebration(petalRow, assigneeUserId) {
  const filledPetals = [...petalRow.querySelectorAll('.card-petal.filled')]
  if (filledPetals.length === 0) return () => {}

  const timers = []
  const target = findTargetBubble(assigneeUserId)
  const targetRect = target?.getBoundingClientRect()
  const cx = window.innerWidth / 2
  const cy = window.innerHeight / 2
  const ax = targetRect ? targetRect.left + targetRect.width / 2 : cx
  const ay = targetRect ? targetRect.top + targetRect.height / 2 : cy + 100
  const total = filledPetals.length
  const formationR = 22 + total * 7

  const nudge = () => (Math.random() - 0.5) * 60

  // Temporary off-screen SVG used to measure subpath lengths so the formation
  // hold keyframes land exactly on (formX, formY) regardless of the relative
  // lengths of the fly-in vs. fly-out curves.
  const measureSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  measureSvg.style.cssText =
    'position: fixed; visibility: hidden; pointer-events: none; left: 0; top: 0;'
  document.body.appendChild(measureSvg)

  function measurePath(d) {
    const pathElem = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    pathElem.setAttribute('d', d)
    measureSvg.appendChild(pathElem)
    const len = pathElem.getTotalLength()
    pathElem.remove()
    return len
  }

  const clones = filledPetals.map((el, i) => {
    const rect = el.getBoundingClientRect()
    const startX = rect.left + rect.width / 2
    const startY = rect.top + rect.height / 2
    const angle = (i / total) * Math.PI * 2 - Math.PI / 2
    const formX = cx + Math.cos(angle) * formationR
    const formY = cy + Math.sin(angle) * formationR

    const p1c1x = startX + nudge()
    const p1c1y = startY - 50 + nudge()
    const p1c2x = formX + nudge()
    const p1c2y = formY - 40 + nudge()
    const phase1Path = `M ${startX},${startY} C ${p1c1x},${p1c1y} ${p1c2x},${p1c2y} ${formX},${formY}`

    const side = i % 2 === 0 ? 1 : -1
    const p2c1x = formX + side * (30 + Math.random() * 30)
    const p2c1y = formY - 30 + nudge()
    const p2c2x = ax + side * (20 + Math.random() * 20)
    const p2c2y = ay - 50 + nudge()
    const phase2Tail = `C ${p2c1x},${p2c1y} ${p2c2x},${p2c2y} ${ax},${ay}`

    // Continuous compound path — one subpath, no "M" in the middle. This lets
    // offset-distance 0→100% sweep through formation without a seam.
    const combinedPath = `${phase1Path} ${phase2Tail}`
    const len1 = measurePath(phase1Path)
    const len2 = measurePath(`M ${formX},${formY} ${phase2Tail}`)
    const formationPct = (len1 / (len1 + len2)) * 100

    const clone = document.createElement('span')
    clone.textContent = '🌸'
    clone.style.cssText = `
      position: fixed;
      left: 0;
      top: 0;
      font-size: 0.75rem;
      z-index: 9999;
      pointer-events: none;
      offset-path: path('${combinedPath}');
      offset-rotate: 0deg;
    `
    document.body.appendChild(clone)
    el.style.visibility = 'hidden'

    return { clone, el, formationPct, isLast: i === total - 1 }
  })

  measureSvg.remove()

  // Elevate target bubble just before the fly-out begins so petals land behind
  // it. Fires once, aligned to when the earliest petal's phase 2 starts.
  const allPhase1End = (total - 1) * PHASE_1_STAGGER + PHASE_1_DURATION
  timers.push(
    setTimeout(() => {
      if (target) {
        target.style.position = 'relative'
        target.style.zIndex = '10000'
      }
    }, allPhase1End + BASE_HOLD - 50)
  )

  clones.forEach(({ clone, formationPct, isLast }, i) => {
    // Per-petal timing restores the original two-phase staggers: phase 1 uses
    // PHASE_1_STAGGER (100ms), phase 2 uses PHASE_2_STAGGER (120ms). The hold
    // therefore varies slightly per petal (last petal's gets 20ms·(total-1)
    // more than the first) so all phase 2 starts land on their original grid.
    const delay = i * PHASE_1_STAGGER
    const extraPhase2Stagger = i * (PHASE_2_STAGGER - PHASE_1_STAGGER)
    const holdDuration = (total - 1) * PHASE_1_STAGGER + BASE_HOLD + extraPhase2Stagger
    const totalDuration = PHASE_1_DURATION + holdDuration + PHASE_2_DURATION
    const phase1EndOffset = PHASE_1_DURATION / totalDuration
    const holdEndOffset = (PHASE_1_DURATION + holdDuration) / totalDuration

    const flight = clone.animate(
      [
        { offsetDistance: '0%', transform: 'scale(1)', offset: 0 },
        {
          offsetDistance: `${formationPct}%`,
          transform: 'scale(2.5)',
          offset: phase1EndOffset,
          easing: EASE_OUT_QUART,
        },
        {
          offsetDistance: `${formationPct}%`,
          transform: 'scale(2.5)',
          offset: holdEndOffset,
        },
        {
          offsetDistance: '100%',
          transform: 'scale(2.5)',
          offset: 1,
          easing: EASE_OUT_QUART,
        },
      ],
      { duration: totalDuration, delay, fill: 'forwards' }
    )

    // Subtle rotation layered on top via composite:'add' so it doesn't clobber
    // the scale transform from the flight animation.
    const wobble = clone.animate(
      [{ transform: 'rotate(-10deg)' }, { transform: 'rotate(10deg)' }],
      {
        duration: 200 + Math.random() * 100,
        iterations: Infinity,
        direction: 'alternate',
        composite: 'add',
        easing: 'ease-in-out',
      }
    )

    flight.onfinish = () => {
      clone.remove()
      wobble.cancel()

      if (isLast && target && !target.dataset.bouncing) {
        target.dataset.bouncing = '1'
        target.classList.add('petal-received')
        timers.push(
          setTimeout(() => {
            target.classList.remove('petal-received')
            target.style.position = ''
            target.style.zIndex = ''
            delete target.dataset.bouncing
          }, 1200)
        )
      }
    }
  })

  return () => {
    timers.forEach(clearTimeout)
    clones.forEach(({ clone, el }) => {
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
    cleanupRef.current = animatePetalCelebration(petalRowRef.current, task.assigneeUserId)
  }, [isVictory, task.assigneeUserId])

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
