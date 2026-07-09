import { CATEGORY_CONFIG } from '../../store/mockData'

export function CategoryBadge({ category }) {
  const cfg = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.normal
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${cfg.color}`}>
      {cfg.urgent && (
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
        </svg>
      )}
      {cfg.label}
    </span>
  )
}

export function StatusBadge({ status, elapsedMinutes = 0 }) {
  if (status === 'in_hospital') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span>
        院內
      </span>
    )
  }
  const isOver30 = elapsedMinutes >= 30
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full border ${isOver30 ? 'text-red-700 bg-red-50 border-red-200' : 'text-orange-700 bg-orange-50 border-orange-200'}`}>
      <span className={`w-1.5 h-1.5 rounded-full inline-block ${isOver30 ? 'bg-red-500 animate-pulse' : 'bg-orange-400'}`}></span>
      離院 {elapsedMinutes} 分鐘
    </span>
  )
}
