import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../store/AppContext'
import { CATEGORY_CONFIG } from '../store/mockData'
import { CategoryBadge, StatusBadge } from '../components/common/Badge'
import { PatientIdentity } from '../components/common/PatientIdentity'
import Header from '../components/layout/Header'
import AlertBanner from '../features/alerts/AlertBanner'
import ZoomableFloorMap from '../features/floormap/ZoomableFloorMap'
import FloorMapModal from '../features/floormap/FloorMapModal'

export default function MapOverviewPage() {
  const { user, patients, triggerCall, cancelCall, getElapsedMinutes } = useApp()
  const navigate = useNavigate()
  const [filterCategory, setFilterCategory] = useState('all')
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [showMapModal, setShowMapModal] = useState(false)

  // 依角色過濾
  let viewPatients = patients
  if (user?.role === 'doctor')   viewPatients = patients.filter(p => p.assignedDoctor === user.id)
  if (user?.role === 'nurse')    viewPatients = patients.filter(p => p.assignedNurse  === user.id)

  // 分類過濾
  let displayPatients = viewPatients
  if (filterCategory !== 'all') {
    if (filterCategory === 'special') {
      displayPatients = viewPatients.filter(p => ['dementia','pediatric','psychiatric'].includes(p.category))
    } else if (filterCategory === 'left') {
      displayPatients = viewPatients.filter(p => p.status === 'left_hospital')
    } else {
      displayPatients = viewPatients.filter(p => p.category === filterCategory)
    }
  }

  const leftCount    = viewPatients.filter(p => p.status === 'left_hospital').length
  const specialCount = viewPatients.filter(p => ['dementia','pediatric','psychiatric'].includes(p.category)).length

  return (
    <div className="min-h-screen bg-slate-50">
      <Header/>
      <main className="max-w-7xl mx-auto px-4 py-6">
        <AlertBanner/>

        {/* 頁面標題 */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold text-slate-800">平面圖總覽</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              中山醫學大學附設醫院・核醫大樓一樓
              {user?.role !== 'security' && ` · 顯示 ${displayPatients.length} 位病人`}
            </p>
          </div>

          {/* 過濾標籤 */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg p-1">
            {[
              { key: 'all',      label: '全部',   count: viewPatients.length },
              { key: 'special',  label: '特殊',   count: specialCount },
              { key: 'left',     label: '離院中', count: leftCount },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilterCategory(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${filterCategory === tab.key ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full min-w-[1.2rem] text-center ${filterCategory === tab.key ? 'bg-white/30 text-white' : tab.key === 'left' && leftCount > 0 ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600'}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
          {/* 左側：病人列表縮覽 */}
          <div className="xl:col-span-1 space-y-2 max-h-[calc(100vh-220px)] overflow-y-auto scrollbar-hide">
            {displayPatients.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-6 text-center text-slate-400 text-sm">
                目前無病人
              </div>
            ) : (
              displayPatients.map(patient => {
                const cfg = CATEGORY_CONFIG[patient.category]
                const elapsed = getElapsedMinutes(patient)
                const isLeft = patient.status === 'left_hospital'
                const isSelected = selectedPatient?.id === patient.id

                return (
                  <div
                    key={patient.id}
                    onClick={() => setSelectedPatient(isSelected ? null : patient)}
                    className={`bg-white rounded-xl border cursor-pointer transition-all hover:shadow-sm ${isSelected ? 'border-blue-400 shadow-sm ring-2 ring-blue-100' : isLeft && elapsed >= 30 ? 'border-red-300' : isLeft ? 'border-orange-300' : 'border-slate-200'}`}
                  >
                    <div className="p-3.5">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-blue-700">{patient.id}</span>
                          <CategoryBadge category={patient.category}/>
                        </div>
                        <StatusBadge status={patient.status} elapsedMinutes={elapsed}/>
                      </div>
                      <PatientIdentity patient={patient}/>
                      <div className="text-xs text-slate-500 mt-0.5">{patient.areaName} · {patient.bedNumber}</div>

                      {/* 快速操作 */}
                      <div className="flex items-center gap-1.5 mt-2.5">
                        {!patient.callActive ? (
                          <button
                            onClick={e => { e.stopPropagation(); triggerCall(patient.id) }}
                            className="flex-1 text-xs py-1.5 rounded-lg font-medium transition-all border bg-slate-50 text-slate-600 border-slate-200 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700"
                          >
                            叫號
                          </button>
                        ) : (
                          <button
                            onClick={e => { e.stopPropagation(); cancelCall(patient.id) }}
                            className="flex-1 text-xs py-1.5 rounded-lg font-medium transition-all border bg-amber-100 text-amber-800 border-amber-300 hover:bg-red-50 hover:border-red-300 hover:text-red-700"
                          >
                            取消叫號
                          </button>
                        )}
                        <button
                          onClick={e => { e.stopPropagation(); navigate(`/patients/${patient.id}`) }}
                          className="flex-1 text-xs py-1.5 rounded-lg font-medium border border-slate-200 bg-slate-50 text-slate-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all"
                        >
                          詳情
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* 右側：平面圖 */}
          <div className="xl:col-span-3">
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"/>
                  <span className="text-sm font-medium text-slate-700">即時位置追蹤</span>
                </div>
                <div className="flex items-center gap-3">
                  {selectedPatient && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-slate-500">已選取：</span>
                      <span className="font-semibold text-slate-800">{selectedPatient.name}</span>
                      <span className="text-blue-600 font-mono">{selectedPatient.id}</span>
                      <button
                        onClick={() => setSelectedPatient(null)}
                        className="text-slate-400 hover:text-slate-600 ml-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                      </button>
                    </div>
                  )}
                  <button
                    onClick={() => setShowMapModal(true)}
                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors font-medium flex-shrink-0"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/>
                    </svg>
                    放大檢視
                  </button>
                </div>
              </div>
              <div className="p-3" style={{ height: '520px' }}>
                <ZoomableFloorMap
                  patients={displayPatients}
                  highlightId={selectedPatient?.id}
                  onPatientClick={p => {
                    setSelectedPatient(prev => prev?.id === p.id ? null : p)
                  }}
                  height="100%"
                />
              </div>
            </div>

            {/* 選取病人的詳細資訊浮現 */}
            {selectedPatient && (() => {
              const elapsed = getElapsedMinutes(selectedPatient)
              return (
                <div className="mt-3 bg-white rounded-xl border border-blue-200 p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <PatientIdentity patient={selectedPatient}/>
                          <span className="font-mono text-sm text-blue-700">{selectedPatient.id}</span>
                          <CategoryBadge category={selectedPatient.category}/>
                          <StatusBadge status={selectedPatient.status} elapsedMinutes={elapsed}/>
                        </div>
                        <p className="text-sm text-slate-500 mt-0.5">
                          {selectedPatient.gender} / {selectedPatient.age}歲 ·
                          {selectedPatient.areaName} · {selectedPatient.bedNumber} ·
                          {selectedPatient.condition}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/patients/${selectedPatient.id}`)}
                      className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      查看詳情
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                      </svg>
                    </button>
                  </div>
                </div>
              )
            })()}
          </div>
        </div>
      </main>

      <FloorMapModal
        open={showMapModal}
        onClose={() => setShowMapModal(false)}
        patients={displayPatients}
        highlightId={selectedPatient?.id}
        onPatientClick={p => setSelectedPatient(prev => prev?.id === p.id ? null : p)}
        title="平面圖總覽"
      />
    </div>
  )
}
