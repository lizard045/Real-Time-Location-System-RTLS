import { useState } from 'react'
import PatientMarker from './PatientMarker'

// ============================================================
// 平面圖 (SVG viewBox="0 0 900 700")
// 依中山醫學大學附設醫院核醫大樓一樓逃生平面圖細節化繪製
// 配色：淺綠背景、深綠牆面、黃色通道、白色房間
// 主入口位於上方（小兒科急診區與急診重症區之間）
// ============================================================

const COLORS = {
  background: '#dbe3a4',   // 外部淺綠背景
  wall:       '#1a5c38',   // 深綠牆面
  floor:      '#ffffff',   // 室內地板
  corridor:   '#f7f0bd',   // 黃色通道
  facility:   '#eef1e6',   // 設備/電梯等次要空間
  roomStroke: '#d9ddd2',
  roomName:   '#374151',
  roomEn:     '#9ca3af',
  highlightFill:   '#fdecec',
  highlightStroke: '#e88b8b',
}

// ── 主要區域（病人可能所在，含英文副標）─────────────────────
const MAIN_ROOMS = [
  { id: 'pediatric',     name: '小兒科急診看診區', en: 'Pediatric Emergency', x:  30, y: 110, w: 150, h: 110 },
  { id: 'emergency_icu', name: '急診-重症區',       en: 'Emergency / ICU',     x: 250, y:  55, w: 300, h: 100 },
  { id: 'treatment',     name: '診療區',             en: 'Treatment Area',      x: 250, y: 160, w: 148, h:  70 },
  { id: 'observation',   name: '留觀區',             en: 'Observation',         x: 403, y: 160, w: 152, h:  70 },
  { id: 'clinical',      name: '臨床處置區',         en: 'Clinical Treatment',  x:  30, y: 315, w: 150, h: 150 },
  { id: 'ct_room',       name: '電腦斷層室',         en: 'CT Rm.',              x: 250, y: 315, w: 148, h:  60 },
  { id: 'fluoroscopy',   name: '透視攝影室',         en: 'Fluoroscopy Rm.',     x: 403, y: 315, w: 152, h:  60 },
  { id: 'xray',          name: 'X 光室',             en: 'X-Ray Rm.',           x: 250, y: 415, w: 148, h:  50 },
  { id: 'angiography',   name: '血管攝影室',         en: 'Angiography Rm.',     x: 403, y: 415, w: 152, h:  50 },
  { id: 'mri',           name: '核磁共振室',         en: 'Nuclear MRI',         x: 765, y: 570, w: 100, h:  90 },
]

// ── 次要房間（純標示，小字置中）────────────────────────────
const SMALL_ROOMS = [
  // 主建築左上
  { name: '負壓隔離病房', x:  30, y:  55, w:  90, h: 50 },
  { name: '更衣室',       x: 125, y:  55, w:  55, h: 50 },
  { name: '機房',         x:  30, y: 225, w: 150, h: 40 },
  // 診療區下方櫃檯區
  { name: '批價/掛號櫃檯', x: 250, y: 235, w: 148, h: 30 },
  { name: '縫合室',       x: 403, y: 235, w:  70, h: 30 },
  { name: '機房',         x: 478, y: 235, w:  77, h: 30 },
  // 影像區中間小房間
  { name: '更衣室',       x: 250, y: 380, w:  70, h: 30 },
  { name: '片閱覽室',     x: 325, y: 380, w:  73, h: 30 },
  { name: '明室洗片室',   x: 403, y: 380, w:  75, h: 30 },
  { name: '登記室',       x: 483, y: 380, w:  72, h: 30 },
  // 右側列（上）
  { name: '討論室',       x: 605, y:  55, w:  70, h: 45 },
  { name: '辦公室',       x: 680, y:  55, w:  75, h: 45 },
  { name: '會談室',       x: 605, y: 105, w:  70, h: 50 },
  { name: '廁所',         x: 680, y: 105, w:  75, h: 50 },
  { name: '超音波室',     x: 605, y: 160, w:  73, h: 50 },
  { name: '乳房攝影室',   x: 683, y: 160, w:  72, h: 50 },
  { name: '等候室',       x: 605, y: 215, w:  73, h: 50 },
  { name: '機房',         x: 683, y: 215, w:  72, h: 50 },
  // 右側列（下）
  { name: '太平間',       x: 605, y: 315, w: 150, h: 45 },
  { name: '靈堂(一)',     x: 605, y: 365, w:  73, h: 55 },
  { name: '靈堂(二)',     x: 683, y: 365, w:  72, h: 55 },
  { name: '等候室',       x: 605, y: 425, w: 150, h: 40 },
  // 下方側翼（往內科大樓）
  { name: '磁振造影室 MRI', x: 260, y: 520, w: 130, h: 135 },
  { name: '會議室',           x: 455, y: 520, w:  85, h: 65 },
  { name: '電腦斷層掃描室(二)', x: 545, y: 520, w:  90, h: 65 },
  { name: '攝影室(一)',       x: 455, y: 590, w:  85, h: 65 },
  { name: '攝影室(二)',       x: 545, y: 590, w:  90, h: 65 },
  // 右下側翼（核磁共振）
  { name: '電腦室',   x: 670, y: 520, w: 60, h: 45 },
  { name: '控制室',   x: 735, y: 520, w: 60, h: 45 },
  { name: '等候室',   x: 800, y: 520, w: 65, h: 45 },
  { name: '治療室',   x: 670, y: 570, w: 90, h: 90 },
]

// ── 設備空間（電梯 / 手扶梯，灰綠底）────────────────────────
const FACILITIES = [
  { name: '電梯',   x:  60, y: 272, w: 60, h: 36 },
  { name: '手扶梯', x: 315, y: 272, w: 50, h: 36 },
  { name: '樓梯(A)', x: 470, y: 272, w: 55, h: 36 },
]

// ── 黃色通道 ─────────────────────────────────────────────────
const CORRIDORS = [
  { x: 195, y:  50, w:  50, h: 415 },   // 主入口垂直通道
  { x:  25, y: 270, w: 730, h:  40 },   // 水平主通道
  { x: 560, y:  50, w:  40, h: 415 },   // 右側垂直通道
  { x: 400, y: 470, w:  45, h: 195 },   // 往內科大樓通道（穿過下方側翼）
  { x: 700, y: 470, w:  45, h:  40 },   // 往核磁共振側翼通道
  { x: 760, y: 275, w:  55, h:  30 },   // 往行政大樓通道（右側出口）
]

export default function FloorMap({ patients = [], onPatientClick, highlightId = null }) {
  const [hoveredId, setHoveredId] = useState(null)

  return (
    <div className="w-full h-full">
      <svg
        viewBox="0 0 900 700"
        className="w-full h-full"
        style={{ fontFamily: 'system-ui, sans-serif' }}
      >
        {/* 外部背景（淺綠） */}
        <rect x="0" y="0" width="900" height="700" fill={COLORS.background}/>

        {/* 室內地板（白）：主建築 + 兩側翼 */}
        <rect x="20"  y="45"  width="740" height="425" fill={COLORS.floor}/>
        <rect x="250" y="510" width="395" height="155" fill={COLORS.floor}/>
        <rect x="660" y="510" width="210" height="155" fill={COLORS.floor}/>

        {/* 黃色通道 */}
        {CORRIDORS.map((c, i) => (
          <rect key={i} x={c.x} y={c.y} width={c.w} height={c.h} fill={COLORS.corridor}/>
        ))}

        {/* 次要房間（小字） */}
        {SMALL_ROOMS.map((room, i) => (
          <g key={`s${i}`}>
            <rect
              x={room.x} y={room.y} width={room.w} height={room.h}
              fill={COLORS.floor} stroke={COLORS.roomStroke} strokeWidth="1.2" rx="5"
            />
            <text
              x={room.x + room.w / 2}
              y={room.y + room.h / 2 + 3}
              textAnchor="middle"
              fill="#6b7280"
              fontSize="8.5"
              fontWeight="600"
            >
              {room.name}
            </text>
          </g>
        ))}

        {/* 設備空間（電梯/手扶梯/樓梯） */}
        {FACILITIES.map((f, i) => (
          <g key={`f${i}`}>
            <rect x={f.x} y={f.y} width={f.w} height={f.h} fill={COLORS.facility} stroke={COLORS.roomStroke} strokeWidth="1" rx="4"/>
            <text x={f.x + f.w / 2} y={f.y + f.h / 2 + 3} textAnchor="middle" fill="#9ca3af" fontSize="8" fontWeight="600">
              {f.name}
            </text>
          </g>
        ))}

        {/* 主要區域 */}
        {MAIN_ROOMS.map(room => {
          const hasHighlightPatient = highlightId && patients.find(p => p.id === highlightId && p.areaId === room.id)
          return (
            <g key={room.id}>
              <rect
                x={room.x} y={room.y}
                width={room.w} height={room.h}
                fill={hasHighlightPatient ? COLORS.highlightFill : COLORS.floor}
                stroke={hasHighlightPatient ? COLORS.highlightStroke : COLORS.roomStroke}
                strokeWidth={hasHighlightPatient ? 2.5 : 1.5}
                rx="8"
              />
              <text x={room.x + 10} y={room.y + 18} fill={COLORS.roomName} fontSize="11.5" fontWeight="700">
                {room.name}
              </text>
              <text x={room.x + 10} y={room.y + 32} fill={COLORS.roomEn} fontSize="9">
                {room.en}
              </text>
            </g>
          )
        })}

        {/* ── 深綠牆面 ──────────────────────────────────── */}
        <g stroke={COLORS.wall} strokeWidth="10" strokeLinecap="square" fill="none">
          {/* 主建築（上方主入口缺口 x190~250；右側行政大樓缺口 y275~305；下方兩側翼缺口） */}
          <path d="M 20 45 L 190 45"/>
          <path d="M 250 45 L 760 45"/>
          <path d="M 20 45 L 20 470"/>
          <path d="M 760 45 L 760 275"/>
          <path d="M 760 305 L 760 470"/>
          <path d="M 20 470 L 400 470"/>
          <path d="M 445 470 L 700 470"/>
          <path d="M 745 470 L 760 470"/>
          {/* 下方側翼（往內科大樓，通道缺口 x400~445） */}
          <path d="M 250 510 L 400 510"/>
          <path d="M 445 510 L 645 510"/>
          <path d="M 250 510 L 250 665"/>
          <path d="M 645 510 L 645 665"/>
          <path d="M 250 665 L 400 665"/>
          <path d="M 445 665 L 645 665"/>
          {/* 右下側翼（核磁共振，通道缺口 x700~745） */}
          <path d="M 660 510 L 700 510"/>
          <path d="M 745 510 L 870 510"/>
          <path d="M 660 510 L 660 665"/>
          <path d="M 870 510 L 870 665"/>
          <path d="M 660 665 L 870 665"/>
        </g>

        {/* 主入口（上方） */}
        <g>
          <text x="220" y="14" textAnchor="middle" fill={COLORS.wall} fontSize="12" fontWeight="700">上方主要出入口</text>
          <rect x="190" y="26" width="60" height="34" fill="#ffffff" stroke={COLORS.roomStroke} strokeWidth="1" rx="4"/>
          <rect x="192" y="32" width="56" height="22" rx="11" fill={COLORS.wall}/>
          <text x="220" y="47" textAnchor="middle" fill="white" fontSize="11" fontWeight="700">主入口</text>
          <path d="M 220 60 L 220 82" stroke={COLORS.wall} strokeWidth="2" strokeDasharray="4,3"/>
          <polygon points="216,82 224,82 220,90" fill={COLORS.wall}/>
        </g>

        {/* 往行政大樓（右側出口） */}
        <g>
          <path d="M 770 290 L 805 290" stroke={COLORS.wall} strokeWidth="2" strokeDasharray="4,3"/>
          <polygon points="805,286 805,294 814,290" fill={COLORS.wall}/>
          <text x="820" y="286" fill={COLORS.wall} fontSize="10" fontWeight="700">往行政大樓</text>
          <text x="820" y="298" fill="#8a9a6d" fontSize="7.5">To Admin Building</text>
        </g>

        {/* 往內科大樓（下方出口） */}
        <g>
          <path d="M 422 668 L 422 682" stroke={COLORS.wall} strokeWidth="2" strokeDasharray="4,3"/>
          <polygon points="418,682 426,682 422,690" fill={COLORS.wall}/>
          <text x="435" y="684" fill={COLORS.wall} fontSize="10" fontWeight="700">往內科大樓</text>
        </g>

        {/* 病人標記 */}
        {patients.map(patient => {
          const isHighlighted = patient.id === highlightId
          return (
            <g key={patient.id}
              onMouseEnter={() => setHoveredId(patient.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{ filter: isHighlighted ? 'drop-shadow(0 0 8px rgba(251,191,36,0.9))' : hoveredId === patient.id ? 'drop-shadow(0 0 4px rgba(100,100,200,0.5))' : 'none' }}
            >
              <PatientMarker
                patient={patient}
                onClick={onPatientClick}
                showLabel={true}
                glow={isHighlighted}
              />
            </g>
          )
        })}

        {/* Hover tooltip */}
        {hoveredId && (() => {
          const p = patients.find(pt => pt.id === hoveredId)
          if (!p) return null
          const tx = Math.min(p.markerX + 16, 750)
          const ty = Math.max(p.markerY - 30, 18)
          return (
            <g>
              <rect x={tx} y={ty} width="140" height="42" rx="6" fill="white" stroke="#e2e8f0" strokeWidth="1" filter="url(#shadow)"/>
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
        <g transform="translate(28, 678)">
          <text x="0" y="12" fill="#4b5563" fontSize="9" fontWeight="600">圖例：</text>
          {[
            { color: '#7c3aed', label: '失智' },
            { color: '#0284c7', label: '小兒' },
            { color: '#d97706', label: '身心科' },
            { color: '#475569', label: '一般' },
            { color: '#ef4444', label: '離院' },
          ].map((item, i) => (
            <g key={item.label} transform={`translate(${45 + i * 72}, 0)`}>
              <circle cx="6" cy="7" r="6" fill={item.color}/>
              <text x="16" y="12" fill="#4b5563" fontSize="9">{item.label}</text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  )
}
