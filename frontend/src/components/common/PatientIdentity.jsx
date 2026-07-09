import { useState } from 'react'

// 病人身分顯示：*******(病歷號，可點擊切換顯示) + 全名
export function PatientIdentity({ patient, size = 'sm' }) {
  const [show, setShow] = useState(false)

  const textSize = size === 'lg' ? 'text-base' : 'text-sm'

  return (
    <span className="inline-flex items-center gap-1.5">
      <button
        onClick={e => { e.stopPropagation(); setShow(s => !s) }}
        title={show ? '點擊隱藏病歷號' : '點擊顯示病歷號'}
        className={`font-mono font-bold text-blue-700 hover:text-blue-900 hover:bg-blue-50 px-1 rounded transition-colors ${textSize}`}
      >
        {show ? patient.recordNo : '*******'}
      </button>
      <span className={`font-semibold text-slate-800 ${textSize}`}>{patient.name}</span>
    </span>
  )
}
