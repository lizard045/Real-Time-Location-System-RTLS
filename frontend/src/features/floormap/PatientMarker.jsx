import { useNavigate } from 'react-router-dom'
import { CATEGORY_CONFIG } from '../../store/mockData'

// PatientMarker: 在平面圖上的病人點位圖示
export default function PatientMarker({ patient, onClick, showLabel = true }) {
  const cfg = CATEGORY_CONFIG[patient.category] || CATEGORY_CONFIG.normal
  const isLeft = patient.status === 'left_hospital'
  const isCall = patient.callActive

  const dotColor = isLeft ? '#ef4444' : cfg.dot

  return (
    <g
      transform={`translate(${patient.markerX}, ${patient.markerY})`}
      onClick={() => onClick && onClick(patient)}
      style={{ cursor: 'pointer' }}
    >
      {/* 叫號 ripple 動畫 */}
      {isCall && (
        <>
          <circle r="18" fill="none" stroke="#f59e0b" strokeWidth="2" opacity="0.8">
            <animate attributeName="r" from="12" to="28" dur="0.8s" repeatCount="indefinite"/>
            <animate attributeName="opacity" from="0.8" to="0" dur="0.8s" repeatCount="indefinite"/>
          </circle>
          <circle r="14" fill="none" stroke="#f59e0b" strokeWidth="1.5" opacity="0.5">
            <animate attributeName="r" from="8" to="22" dur="0.8s" begin="0.3s" repeatCount="indefinite"/>
            <animate attributeName="opacity" from="0.5" to="0" dur="0.8s" begin="0.3s" repeatCount="indefinite"/>
          </circle>
        </>
      )}

      {/* 離院警示 ripple */}
      {isLeft && (
        <circle r="16" fill="none" stroke="#ef4444" strokeWidth="2">
          <animate attributeName="r" from="10" to="24" dur="1.2s" repeatCount="indefinite"/>
          <animate attributeName="opacity" from="0.8" to="0" dur="1.2s" repeatCount="indefinite"/>
        </circle>
      )}

      {/* 人物圖示背景圓 */}
      <circle r="11" fill={dotColor} opacity={isLeft ? 0.9 : 1}>
        {isCall && (
          <animate attributeName="r" values="11;13;11" dur="0.5s" repeatCount="indefinite"/>
        )}
      </circle>

      {/* 人物圖示 (SVG path) */}
      <g fill="white" transform="translate(-6,-6) scale(0.5)">
        {/* 頭 */}
        <circle cx="12" cy="7" r="4"/>
        {/* 身體 */}
        <path d="M12 14c-5 0-8 2.5-8 5v1h16v-1c0-2.5-3-5-8-5z"/>
      </g>

      {/* 緊急標記 */}
      {(cfg.urgent || isLeft) && (
        <g transform="translate(6, -9)">
          <circle r="5" fill={isLeft ? '#ef4444' : '#f59e0b'}/>
          <text x="0" y="3.5" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold">
            {isLeft ? '!' : '!'}
          </text>
        </g>
      )}

      {/* 病人 ID 標籤 */}
      {showLabel && (
        <g transform="translate(0, 18)">
          <rect
            x={-(patient.id.length * 3 + 4)}
            y="-7"
            width={patient.id.length * 6 + 8}
            height="13"
            rx="3"
            fill="white"
            stroke="#e2e8f0"
            strokeWidth="1"
          />
          <text
            textAnchor="middle"
            fill="#1e293b"
            fontSize="8"
            fontWeight="600"
            y="3"
          >
            {patient.id}
          </text>
        </g>
      )}
    </g>
  )
}
