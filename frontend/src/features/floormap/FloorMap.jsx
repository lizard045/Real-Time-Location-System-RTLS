import { useState } from 'react'
import PatientMarker from './PatientMarker'
import { CATEGORY_CONFIG } from '../../store/mockData'

// ============================================================
// 平面圖區域定義 (SVG viewBox="0 0 900 580")
// 依據中山醫學大學附設醫院核醫大樓一樓平面圖繪製
// ============================================================
const ROOMS = [
  // ── 主建築上層 ──────────────────────────────────────────
  {
    id: 'pediatric',
    name: '小兒科急診看診區',
    x: 8, y: 38, w: 192, h: 260,
    fillLight: '#eff6ff', stroke: '#93c5fd',
  },
  {
    id: 'emergency_icu',
    name: '急診-重症區',
    x: 202, y: 18, w: 360, h: 138,
    fillLight: '#fef2f2', stroke: '#fca5a5',
  },
  {
    id: 'treatment',
    name: '診療區',
    x: 202, y: 158, w: 168, h: 128,
    fillLight: '#f0fdf4', stroke: '#86efac',
  },
  {
    id: 'observation',
    name: '留觀區',
    x: 372, y: 158, w: 190, h: 128,
    fillLight: '#f0fdf4', stroke: '#86efac',
  },
  // ── 主建築下層 ──────────────────────────────────────────
  {
    id: 'clinical',
    name: '臨床處置區',
    x: 8, y: 300, w: 192, h: 198,
    fillLight: '#fafaf9', stroke: '#d6d3d1',
  },
  {
    id: 'ct_room',
    name: '電腦斷層室',
    x: 202, y: 300, w: 168, h: 118,
    fillLight: '#fdf4ff', stroke: '#d8b4fe',
  },
  {
    id: 'fluoroscopy',
    name: '透視攝影室',
    x: 372, y: 300, w: 190, h: 118,
    fillLight: '#fdf4ff', stroke: '#d8b4fe',
  },
  {
    id: 'xray',
    name: 'X 光室',
    x: 202, y: 420, w: 168, h: 108,
    fillLight: '#f8fafc', stroke: '#cbd5e1',
  },
  {
    id: 'angiography',
    name: '血管攝影室',
    x: 372, y: 420, w: 190, h: 108,
    fillLight: '#f8fafc', stroke: '#cbd5e1',
  },
  // ── 右側附屬區 ──────────────────────────────────────────
  {
    id: 'mri',
    name: '核磁共振室',
    x: 565, y: 348, w: 220, h: 180,
    fillLight: '#f0f9ff', stroke: '#7dd3fc',
  },
]

// 走廊區域（視覺裝飾用）
const CORRIDORS = [
  { x: 565, y: 18, w: 220, h: 328, label: '行政大樓連廊', fill: '#f8fafc', stroke: '#e2e8f0' },
]

// 出入口標示
const EXITS = [
  { x: 360, y: 528, w: 180, h: 32, label: '醫院出口', color: '#0f4c81' },
]

export default function FloorMap({ patients = [], onPatientClick, highlightId = null, compact = false }) {
  const [hoveredId, setHoveredId] = useState(null)

  const viewBox = compact ? '0 0 900 580' : '0 0 900 580'
  const height = compact ? '320px' : '100%'

  return (
    <div className="w-full" style={{ height }}>
      <svg
        viewBox={viewBox}
        className="w-full h-full"
        style={{ fontFamily: 'system-ui, sans-serif' }}
      >
        {/* 背景 */}
        <rect x="0" y="0" width="900" height="580" fill="#f8fafc"/>

        {/* 走廊/附屬區 */}
        {CORRIDORS.map(c => (
          <g key={c.label}>
            <rect x={c.x} y={c.y} width={c.w} height={c.h} fill={c.fill} stroke={c.stroke} strokeWidth="1.5" rx="4"/>
            <text x={c.x + c.w / 2} y={c.y + c.h / 2 + 5} textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="500">
              {c.label}
            </text>
          </g>
        ))}

        {/* 房間繪製 */}
        {ROOMS.map(room => {
          const hasHighlightPatient = highlightId && patients.find(p => p.id === highlightId && p.areaId === room.id)
          return (
            <g key={room.id}>
              <rect
                x={room.x} y={room.y}
                width={room.w} height={room.h}
                fill={hasHighlightPatient ? '#fef9c3' : room.fillLight}
                stroke={hasHighlightPatient ? '#ca8a04' : room.stroke}
                strokeWidth={hasHighlightPatient ? 2.5 : 1.5}
                rx="6"
              />
              {/* 房間名稱 */}
              <text
                x={room.x + room.w / 2}
                y={room.y + 18}
                textAnchor="middle"
                fill="#475569"
                fontSize="10.5"
                fontWeight="600"
              >
                {room.name}
              </text>
              {/* 英文副標 */}
              <text
                x={room.x + room.w / 2}
                y={room.y + 32}
                textAnchor="middle"
                fill="#94a3b8"
                fontSize="8.5"
              >
                {room.id.replace('_', ' ').toUpperCase()}
              </text>
            </g>
          )
        })}

        {/* 出口標示 */}
        {EXITS.map(e => (
          <g key={e.label}>
            <rect x={e.x} y={e.y} width={e.w} height={e.h} fill={e.color} rx="4"/>
            <text x={e.x + e.w / 2} y={e.y + 20} textAnchor="middle" fill="white" fontSize="12" fontWeight="700">
              {e.label}
            </text>
          </g>
        ))}

        {/* 出口箭頭指示 */}
        <path d="M 450 528 L 450 498" stroke="#0f4c81" strokeWidth="2" strokeDasharray="4,3"/>
        <polygon points="446,498 454,498 450,490" fill="#0f4c81"/>

        {/* 牆壁輪廓 */}
        <rect x="5" y="5" width="780" height="525" fill="none" stroke="#cbd5e1" strokeWidth="2.5" rx="8"/>

        {/* 病人標記 */}
        {patients.map(patient => {
          const isHighlighted = patient.id === highlightId
          return (
            <g key={patient.id}
              onMouseEnter={() => setHoveredId(patient.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{ filter: isHighlighted ? 'drop-shadow(0 0 6px rgba(251,191,36,0.8))' : hoveredId === patient.id ? 'drop-shadow(0 0 4px rgba(100,100,200,0.5))' : 'none' }}
            >
              <PatientMarker
                patient={patient}
                onClick={onPatientClick}
                showLabel={true}
              />
            </g>
          )
        })}

        {/* Hover tooltip */}
        {hoveredId && (() => {
          const p = patients.find(pt => pt.id === hoveredId)
          if (!p) return null
          const cfg = CATEGORY_CONFIG[p.category] || CATEGORY_CONFIG.normal
          const tx = Math.min(p.markerX + 16, 720)
          const ty = Math.max(p.markerY - 30, 20)
          return (
            <g>
              <rect x={tx} y={ty} width="130" height="42" rx="6" fill="white" stroke="#e2e8f0" strokeWidth="1" filter="url(#shadow)"/>
              <text x={tx + 8} y={ty + 16} fill="#1e293b" fontSize="11" fontWeight="700">{p.name} ({p.id})</text>
              <text x={tx + 8} y={ty + 30} fill="#64748b" fontSize="9.5">{p.areaName} · {p.bedNumber}</text>
            </g>
          )
        })()}

        {/* Drop shadow filter */}
        <defs>
          <filter id="shadow">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.12"/>
          </filter>
        </defs>

        {/* 圖例 */}
        <g transform="translate(10, 540)">
          <text x="0" y="12" fill="#64748b" fontSize="9" fontWeight="600">圖例：</text>
          {[
            { color: '#7c3aed', label: '失智' },
            { color: '#0284c7', label: '小兒' },
            { color: '#d97706', label: '身心科' },
            { color: '#475569', label: '一般' },
            { color: '#ef4444', label: '離院' },
          ].map((item, i) => (
            <g key={item.label} transform={`translate(${45 + i * 72}, 0)`}>
              <circle cx="6" cy="7" r="6" fill={item.color}/>
              <text x="16" y="12" fill="#64748b" fontSize="9">{item.label}</text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  )
}
