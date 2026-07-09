import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../store/AppContext'
import { ACCOUNTS, CATEGORY_CONFIG } from '../store/mockData'
import { CategoryBadge, StatusBadge } from '../components/common/Badge'
import AlertBanner from '../features/alerts/AlertBanner'
import Header from '../components/layout/Header'

const ROLE_LABELS = {
  nurse:    '護理師',
  doctor:   '醫師',
  security: '保全',
}

function PatientRow({ patient, onNavigate, onCall, onMarkLeft, onMarkReturned, userRole, userId, onAssign }) {
  const { getElapsedMinutes } = useApp()
  const elapsed = getElapsedMinutes(patient)
  const cfg = CATEGORY_CONFIG[patient.category]
  const isLeft = patient.status === 'left_hospital'
  const isCall = patient.callActive
  const assignedNurseName = ACCOUNTS.find(a => a.id === patient.assignedNurse)?.name || patient.assignedNurse
  const assignedDoctorName = ACCOUNTS.find(a => a.id === patient.assignedDoctor)?.name || patient.assignedDoctor

  return (
    <tr
      className={`border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer ${isLeft && elapsed >= 30 ? 'bg-red-50' : isLeft ? 'bg-orange-50' : ''}`}
    >
      {/* 編號 */}
      <td className="px-4 py-3" onClick={() => onNavigate(patient.id)}>
        <span className="font-mono text-sm font-bold text-blue-700">{patient.id}</span>
      </td>

      {/* 病人資訊 */}
      <td className="px-4 py-3" onClick={() => onNavigate(patient.id)}>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-800 text-sm">{patient.name}</span>
          <span className="text-xs text-slate-400">{patient.gender} / {patient.age}歲</span>
          <CategoryBadge category={patient.category}/>
          {isCall && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full animate-pulse">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/></svg>
              呼叫中
            </span>
          )}
        </div>
        <div className="text-xs text-slate-500 mt-0.5">{patient.bedNumber} · {patient.condition}</div>
      </td>

      {/* 所在位置 */}
      <td className="px-4 py-3" onClick={() => onNavigate(patient.id)}>
        <div className="text-sm text-slate-700">{patient.areaName}</div>
        <div className="text-xs text-slate-400">{patient.bedNumber}</div>
      </td>

      {/* 狀態 */}
      <td className="px-4 py-3" onClick={() => onNavigate(patient.id)}>
        <StatusBadge status={patient.status} elapsedMinutes={elapsed}/>
      </td>

      {/* 負責人 */}
      <td className="px-4 py-3 text-xs text-slate-600" onClick={() => onNavigate(patient.id)}>
        <div>護：{assignedNurseName}</div>
        <div>醫：{assignedDoctorName}</div>
      </td>

      {/* 操作 */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* 叫號按鈕 (所有角色皆可) */}
          <button
            onClick={e => { e.stopPropagation(); onCall(patient.id) }}
            disabled={isCall}
            title="呼叫病人"
            className={`inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg font-medium transition-all border ${isCall ? 'bg-amber-100 text-amber-600 border-amber-200 cursor-not-allowed' : 'bg-white hover:bg-amber-50 text-slate-700 border-slate-200 hover:border-amber-300 hover:text-amber-700'}`}
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
            </svg>
            {isCall ? '呼叫中' : '叫號'}
          </button>

          {/* 護理師：接手病人 */}
          {userRole === 'nurse' && patient.assignedNurse !== userId && (
            <button
              onClick={e => { e.stopPropagation(); onAssign(patient.id) }}
              className="text-xs px-2.5 py-1.5 rounded-lg font-medium bg-white border border-slate-200 text-slate-600 hover:bg-sky-50 hover:border-sky-300 hover:text-sky-700 transition-all"
            >
              接手
            </button>
          )}

          {/* 離院 / 返院 按鈕 */}
          {!isLeft ? (
            <button
              onClick={e => { e.stopPropagation(); onMarkLeft(patient.id) }}
              className="text-xs px-2.5 py-1.5 rounded-lg font-medium bg-white border border-slate-200 text-slate-600 hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-all"
            >
              標記離院
            </button>
          ) : (
            <button
              onClick={e => { e.stopPropagation(); onMarkReturned(patient.id) }}
              className="text-xs px-2.5 py-1.5 rounded-lg font-medium bg-white border border-slate-200 text-slate-600 hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-all"
            >
              返院
            </button>
          )}
        </div>
      </td>
    </tr>
  )
}

export default function PatientListPage() {
  const { user, patients, triggerCall, markPatientLeft, markPatientReturned, assignPatientToNurse } = useApp()
  const navigate = useNavigate()
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  const isNurse    = user?.role === 'nurse'
  const isDoctor   = user?.role === 'doctor'
  const isSecurity = user?.role === 'security'

  // 過濾病人清單（依角色）
  let visiblePatients = patients
  if (isDoctor)   visiblePatients = patients.filter(p => p.assignedDoctor === user.id)
  if (isNurse)    visiblePatients = patients  // 護理師看全部，但可以接手

  // 額外過濾
  if (filter === 'mine' && isNurse) {
    visiblePatients = visiblePatients.filter(p => p.assignedNurse === user.id)
  }
  if (filter === 'special') {
    visiblePatients = visiblePatients.filter(p => ['dementia','pediatric','psychiatric'].includes(p.category))
  }
  if (filter === 'left') {
    visiblePatients = visiblePatients.filter(p => p.status === 'left_hospital')
  }
  if (search.trim()) {
    const q = search.trim().toLowerCase()
    visiblePatients = visiblePatients.filter(p =>
      p.id.toLowerCase().includes(q) || p.name.toLowerCase().includes(q)
    )
  }

  const myPatients   = patients.filter(p => p.assignedNurse === user?.id || p.assignedDoctor === user?.id)
  const leftPatients = patients.filter(p => p.status === 'left_hospital')
  const specialLeft  = patients.filter(p => p.status === 'left_hospital' && ['dementia','pediatric','psychiatric'].includes(p.category))

  return (
    <div className="min-h-screen bg-slate-50">
      <Header/>
      <main className="max-w-7xl mx-auto px-4 py-6">
        <AlertBanner/>

        {/* 統計卡片 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: '在院病人', value: patients.filter(p => p.status === 'in_hospital').length, color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
            { label: '離院中', value: leftPatients.length, color: 'text-orange-700', bg: leftPatients.length > 0 ? 'bg-orange-50 border-orange-300' : 'bg-slate-50 border-slate-200' },
            { label: '特殊病人離院', value: specialLeft.length, color: 'text-red-700', bg: specialLeft.length > 0 ? 'bg-red-50 border-red-300' : 'bg-slate-50 border-slate-200' },
            {
              label: isNurse ? '我負責的病人' : isDoctor ? '我的病人' : '需追蹤病人',
              value: myPatients.length,
              color: 'text-blue-700',
              bg: 'bg-blue-50 border-blue-200'
            },
          ].map(card => (
            <div key={card.label} className={`rounded-xl border p-4 ${card.bg}`}>
              <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{card.label}</div>
            </div>
          ))}
        </div>

        {/* 工具列 */}
        <div className="bg-white rounded-xl border border-slate-200 mb-4 px-4 py-3 flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <svg className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"/>
              </svg>
              <input
                type="text"
                placeholder="搜尋病人姓名或編號..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
            {[
              { key: 'all', label: '全部' },
              ...(isNurse ? [{ key: 'mine', label: '我負責' }] : []),
              { key: 'special', label: '特殊' },
              { key: 'left', label: '離院中' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-3 py-1.5 text-sm rounded-md font-medium transition-all ${filter === tab.key ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="text-sm text-slate-500">
            共 <span className="font-semibold text-slate-700">{visiblePatients.length}</span> 位
          </div>
        </div>

        {/* 病人列表 */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide w-20">編號</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">病人資訊</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide w-32">位置</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide w-28">狀態</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide w-28">負責人員</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide w-48">操作</th>
                </tr>
              </thead>
              <tbody>
                {visiblePatients.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-slate-400 text-sm">
                      目前沒有符合條件的病人
                    </td>
                  </tr>
                ) : (
                  visiblePatients.map(patient => (
                    <PatientRow
                      key={patient.id}
                      patient={patient}
                      onNavigate={id => navigate(`/patients/${id}`)}
                      onCall={triggerCall}
                      onMarkLeft={markPatientLeft}
                      onMarkReturned={markPatientReturned}
                      onAssign={id => assignPatientToNurse(id, user.id)}
                      userRole={user?.role}
                      userId={user?.id}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
