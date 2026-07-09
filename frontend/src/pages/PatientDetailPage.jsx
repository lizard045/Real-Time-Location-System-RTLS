import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../store/AppContext'
import { ACCOUNTS, CATEGORY_CONFIG } from '../store/mockData'
import { CategoryBadge, StatusBadge } from '../components/common/Badge'
import { PatientIdentity } from '../components/common/PatientIdentity'
import Header from '../components/layout/Header'
import FloorMap from '../features/floormap/FloorMap'

export default function PatientDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { patients, triggerCall, cancelCall, markPatientLeft, markPatientReturned, getElapsedMinutes } = useApp()

  const patient = patients.find(p => p.id === id)

  if (!patient) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header/>
        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
          <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <p className="text-lg font-medium">找不到病人 {id}</p>
          <button onClick={() => navigate('/patients')} className="mt-4 text-blue-600 text-sm hover:underline">
            返回列表
          </button>
        </div>
      </div>
    )
  }

  const cfg = CATEGORY_CONFIG[patient.category]
  const elapsed = getElapsedMinutes(patient)
  const isLeft = patient.status === 'left_hospital'
  const isCall = patient.callActive

  const nurseName  = ACCOUNTS.find(a => a.id === patient.assignedNurse)?.name || patient.assignedNurse
  const doctorName = ACCOUNTS.find(a => a.id === patient.assignedDoctor)?.name || patient.assignedDoctor

  const otherPatientsInSameArea = patients.filter(p => p.areaId === patient.areaId && p.id !== patient.id)

  return (
    <div className="min-h-screen bg-slate-50">
      <Header/>
      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* 頁首 */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/patients')}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
            </svg>
            病人列表
          </button>
          <span className="text-slate-300">/</span>
          <span className="text-sm font-medium text-slate-700">{patient.name} ({patient.id})</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* 左側：病人資訊 */}
          <div className="lg:col-span-1 space-y-4">
            {/* 基本資料卡 */}
            <div className={`bg-white rounded-xl border overflow-hidden ${isLeft && elapsed >= 30 ? 'border-red-300' : isLeft ? 'border-orange-300' : 'border-slate-200'}`}>
              {/* 顏色條 */}
              <div className={`h-1.5 ${cfg.urgent ? (isLeft ? 'bg-red-500' : 'bg-amber-400') : 'bg-blue-400'}`}/>

              <div className="p-5">
                {/* 病歷號 + 遮罩姓名 + 類別 */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <PatientIdentity patient={patient} size="lg"/>
                      <CategoryBadge category={patient.category}/>
                    </div>
                    <p className="text-sm text-slate-500">{patient.gender} / {patient.age}歲</p>
                  </div>
                  <span className="font-mono text-lg font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-lg">
                    {patient.id}
                  </span>
                </div>

                {/* 狀態 */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">目前狀態</span>
                    <StatusBadge status={patient.status} elapsedMinutes={elapsed}/>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">病況</span>
                    <span className="text-sm font-medium text-slate-700">{patient.condition}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">床號</span>
                    <span className="text-sm font-medium text-slate-700">{patient.bedNumber}</span>
                  </div>
                </div>

                {/* 離院計時 */}
                {isLeft && (
                  <div className={`mt-4 rounded-lg p-3.5 ${elapsed >= 30 ? 'bg-red-50 border border-red-200' : 'bg-orange-50 border border-orange-200'}`}>
                    <div className={`text-xs font-semibold mb-1 ${elapsed >= 30 ? 'text-red-700' : 'text-orange-700'}`}>
                      {elapsed >= 30 ? '已通知保全' : '離院計時中'}
                    </div>
                    <div className={`text-2xl font-bold font-mono ${elapsed >= 30 ? 'text-red-600' : 'text-orange-600'}`}>
                      {String(Math.floor(elapsed / 60)).padStart(2,'0')} : {String(elapsed % 60).padStart(2,'0')}
                    </div>
                    <div className={`text-xs mt-1 ${elapsed >= 30 ? 'text-red-600' : 'text-orange-600'}`}>
                      {elapsed >= 30 ? '超過 30 分鐘，保全人員已被通知' : `還有 ${30 - elapsed} 分鐘通知保全`}
                    </div>
                    {cfg.urgent && (
                      <div className="mt-2 text-xs font-medium text-red-700 bg-red-100 rounded px-2 py-1">
                        特殊高風險病人，已立即發出警示並通知保全
                      </div>
                    )}
                  </div>
                )}

                {/* 叫號動態提示 */}
                {isCall && (
                  <div className="mt-4 rounded-lg p-3.5 bg-amber-50 border border-amber-200 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center flex-shrink-0 animate-bounce-call">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-amber-800">追蹤器震動中</div>
                      <div className="text-xs text-amber-600">病人裝置已收到呼叫指令</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 負責人員 */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">負責人員</h3>
              <div className="space-y-2.5">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-full w-14 text-center">護理師</span>
                  <span className="text-sm text-slate-700">{nurseName}</span>
                  <span className="text-xs text-slate-400 font-mono">{patient.assignedNurse}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full w-14 text-center">醫師</span>
                  <span className="text-sm text-slate-700">{doctorName}</span>
                  <span className="text-xs text-slate-400 font-mono">{patient.assignedDoctor}</span>
                </div>
              </div>
            </div>

            {/* 操作按鈕 */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">操作</h3>
              <div className="space-y-2">
                {!isCall ? (
                  <button
                    onClick={() => triggerCall(patient.id)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all border bg-white hover:bg-amber-50 text-slate-700 border-slate-200 hover:border-amber-300 hover:text-amber-700"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                    </svg>
                    呼叫病人（叫號震動）
                  </button>
                ) : (
                  <button
                    onClick={() => cancelCall(patient.id)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all border bg-amber-100 text-amber-800 border-amber-300 hover:bg-red-50 hover:border-red-300 hover:text-red-700"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                    取消叫號（停止震動）
                  </button>
                )}

                {!isLeft ? (
                  <button
                    onClick={() => markPatientLeft(patient.id)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium bg-white border border-slate-200 text-slate-600 hover:bg-orange-50 hover:border-orange-300 hover:text-orange-700 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                    </svg>
                    標記病人離院
                  </button>
                ) : (
                  <button
                    onClick={() => markPatientReturned(patient.id)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium bg-white border border-slate-200 text-slate-600 hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
                    </svg>
                    病人已返院
                  </button>
                )}
              </div>
            </div>

            {/* 同區其他病人 */}
            {otherPatientsInSameArea.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">同區其他病人</h3>
                <div className="space-y-2">
                  {otherPatientsInSameArea.map(p => (
                    <button
                      key={p.id}
                      onClick={() => navigate(`/patients/${p.id}`)}
                      className="w-full flex items-center justify-between text-left px-3 py-2 rounded-lg hover:bg-slate-50 border border-slate-100 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-blue-600 font-bold">{p.id}</span>
                        <span className="text-sm text-slate-700">{p.name}</span>
                        <CategoryBadge category={p.category}/>
                      </div>
                      <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 右側：平面圖（只顯示該病人，並讓其發光） */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-slate-800">目前位置</h2>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {isLeft
                      ? '病人已離開醫院範圍'
                      : `${patient.areaName} · ${patient.bedNumber}`
                    }
                  </p>
                </div>
                <button
                  onClick={() => navigate('/map')}
                  className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
                >
                  查看全圖
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                  </svg>
                </button>
              </div>
              <div className="p-3" style={{ height: '420px' }}>
                <FloorMap
                  patients={[patient]}
                  highlightId={patient.id}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
