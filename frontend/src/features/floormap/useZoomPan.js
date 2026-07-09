import { useCallback, useRef, useState } from 'react'

const MIN_SCALE = 1
const MAX_SCALE = 5
const STEP = 0.5

const clamp = (s) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, s))

// 提供縮放（滾輪 / 雙指）與拖曳平移能力，供平面圖使用
export function useZoomPan() {
  const [scale, setScale] = useState(1)
  const [translate, setTranslate] = useState({ x: 0, y: 0 })

  const pointers = useRef(new Map())
  const dragState = useRef({ dragging: false, lastX: 0, lastY: 0 })
  const pinchState = useRef({ startDist: 0, startScale: 1 })

  const zoomBy = useCallback((delta) => {
    setScale(prev => {
      const next = clamp(prev + delta)
      if (next === MIN_SCALE) setTranslate({ x: 0, y: 0 })
      return next
    })
  }, [])

  const reset = useCallback(() => {
    setScale(1)
    setTranslate({ x: 0, y: 0 })
  }, [])

  const onWheel = useCallback((e) => {
    e.preventDefault()
    zoomBy(-e.deltaY * 0.0018)
  }, [zoomBy])

  const pointersArray = () => Array.from(pointers.current.values())

  const onPointerDown = useCallback((e) => {
    e.currentTarget.setPointerCapture?.(e.pointerId)
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    const pts = pointersArray()
    if (pts.length === 1) {
      dragState.current = { dragging: true, lastX: e.clientX, lastY: e.clientY }
    } else if (pts.length === 2) {
      const [a, b] = pts
      pinchState.current.startDist = Math.hypot(a.x - b.x, a.y - b.y)
      pinchState.current.startScale = scale
      dragState.current.dragging = false
    }
  }, [scale])

  const onPointerMove = useCallback((e) => {
    if (!pointers.current.has(e.pointerId)) return
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    const pts = pointersArray()

    if (pts.length === 2) {
      const [a, b] = pts
      const dist = Math.hypot(a.x - b.x, a.y - b.y)
      if (pinchState.current.startDist > 0) {
        const ratio = dist / pinchState.current.startDist
        setScale(clamp(pinchState.current.startScale * ratio))
      }
      return
    }

    if (dragState.current.dragging && scale > 1) {
      const dx = e.clientX - dragState.current.lastX
      const dy = e.clientY - dragState.current.lastY
      dragState.current.lastX = e.clientX
      dragState.current.lastY = e.clientY
      setTranslate(t => ({ x: t.x + dx, y: t.y + dy }))
    }
  }, [scale])

  const endPointer = useCallback((e) => {
    pointers.current.delete(e.pointerId)
    if (pointers.current.size < 2) pinchState.current.startDist = 0
    if (pointers.current.size === 0) dragState.current.dragging = false
  }, [])

  return {
    scale,
    translate,
    isZoomed: scale > 1,
    zoomIn: () => zoomBy(STEP),
    zoomOut: () => zoomBy(-STEP),
    reset,
    handlers: {
      onWheel,
      onPointerDown,
      onPointerMove,
      onPointerUp: endPointer,
      onPointerCancel: endPointer,
      onPointerLeave: endPointer,
    },
  }
}
