import { useEffect } from 'react'
import ZoomableFloorMap from './ZoomableFloorMap'

export default function FloorMapModal({ open, onClose, patients, highlightId, onPatientClick, title = '平面圖' }) {
  useEffect(() => {
    if (!open) return
    const onKeyDown = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKeyDown)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/70 flex flex-col" onClick={onClose}>
      <div
        className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3 bg-white border-b border-slate-200 flex-shrink-0"
        onClick={e => e.stopPropagation()}
      >
        <div>
          <h2 className="font-semibold text-slate-800">{title}</h2>
          <p className="text-xs text-slate-500 mt-0.5">滑鼠滾輪 / 雙指縮放，拖曳可移動視角</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors flex-shrink-0"
          title="關閉"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <div className="flex-1 bg-slate-100 p-2 sm:p-6 overflow-hidden" onClick={e => e.stopPropagation()}>
        <ZoomableFloorMap
          patients={patients}
          highlightId={highlightId}
          onPatientClick={onPatientClick}
          height="100%"
          hint={false}
        />
      </div>
    </div>
  )
}
