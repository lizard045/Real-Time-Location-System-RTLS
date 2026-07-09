import FloorMap from './FloorMap'
import { useZoomPan } from './useZoomPan'

// 縮放控制按鈕圖示
function IconButton({ onClick, title, children, disabled = false }) {
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      className="w-8 h-8 flex items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
    >
      {children}
    </button>
  )
}

// 平面圖 + 縮放/拖曳能力的包裝元件
export default function ZoomableFloorMap({ patients, onPatientClick, highlightId, height = '480px', hint = true }) {
  const { scale, translate, isZoomed, zoomIn, zoomOut, reset, handlers } = useZoomPan()

  return (
    <div className="relative w-full" style={{ height }}>
      <div
        className="w-full h-full overflow-hidden bg-slate-50 rounded-lg"
        style={{ touchAction: 'none', cursor: isZoomed ? 'grab' : 'default' }}
        {...handlers}
      >
        <div
          className="w-full h-full"
          style={{
            transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
            transformOrigin: 'center center',
            willChange: 'transform',
          }}
        >
          <FloorMap patients={patients} onPatientClick={onPatientClick} highlightId={highlightId} />
        </div>
      </div>

      {/* 縮放控制列 */}
      <div className="absolute bottom-3 right-3 flex flex-col bg-white/95 backdrop-blur rounded-lg shadow-md border border-slate-200 p-1 gap-0.5">
        <IconButton onClick={zoomIn} title="放大">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
        </IconButton>
        <IconButton onClick={zoomOut} title="縮小" disabled={scale <= 1}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12h16"/></svg>
        </IconButton>
        <IconButton onClick={reset} title="還原" disabled={scale === 1 && translate.x === 0 && translate.y === 0}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
        </IconButton>
      </div>

      {/* 縮放比例顯示 */}
      {isZoomed && (
        <div className="absolute bottom-3 left-3 text-xs font-mono font-medium text-slate-500 bg-white/90 px-2 py-1 rounded-md border border-slate-200">
          {Math.round(scale * 100)}%
        </div>
      )}

      {hint && !isZoomed && (
        <div className="absolute top-3 left-3 text-xs text-slate-400 bg-white/90 px-2 py-1 rounded-md border border-slate-200 pointer-events-none">
          滾輪縮放・拖曳移動
        </div>
      )}
    </div>
  )
}
