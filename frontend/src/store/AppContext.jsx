import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'
import { ACCOUNTS, PATIENTS_INITIAL } from './mockData'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem('medical_user')
    return saved ? JSON.parse(saved) : null
  })
  const [patients, setPatients] = useState(PATIENTS_INITIAL)
  const [alerts, setAlerts] = useState([])
  const callTimers = useRef({})
  const tickRef = useRef(null)

  // 每秒更新一次，用於計時器顯示
  const [tick, setTick] = useState(0)
  useEffect(() => {
    tickRef.current = setInterval(() => setTick(t => t + 1), 1000)
    return () => clearInterval(tickRef.current)
  }, [])

  // 偵測離開醫院病人是否到達 30 分鐘
  useEffect(() => {
    patients.forEach(p => {
      if (p.status === 'left_hospital' && p.leftHospitalTime) {
        const elapsed = (Date.now() - new Date(p.leftHospitalTime).getTime()) / 1000 / 60
        const alertId = `security_${p.id}`
        const already = alerts.find(a => a.id === alertId)

        if (elapsed >= 30 && !already) {
          addAlert({
            id: alertId,
            type: 'security',
            patientId: p.id,
            patientName: p.name,
            message: `${p.name}（${p.id}）已離開醫院超過 30 分鐘，請安排人員確認。`,
            createdAt: new Date(),
          })
        }
      }
    })
  }, [tick, patients])

  const addAlert = useCallback((alert) => {
    setAlerts(prev => {
      if (prev.find(a => a.id === alert.id)) return prev
      return [alert, ...prev]
    })
  }, [])

  // ── 登入 ─────────────────────────────────────────────────
  const login = (id, password) => {
    const account = ACCOUNTS.find(a => a.id === id && a.password === password)
    if (!account) return false
    const u = { id: account.id, name: account.name, role: account.role }
    setUser(u)
    sessionStorage.setItem('medical_user', JSON.stringify(u))
    return true
  }

  const logout = () => {
    setUser(null)
    sessionStorage.removeItem('medical_user')
  }

  // ── 叫號 (讓病人追蹤器震動) ───────────────────────────────
  const triggerCall = (patientId) => {
    setPatients(prev =>
      prev.map(p => p.id === patientId ? { ...p, callActive: true } : p)
    )
    if (callTimers.current[patientId]) clearTimeout(callTimers.current[patientId])
    callTimers.current[patientId] = setTimeout(() => {
      setPatients(prev =>
        prev.map(p => p.id === patientId ? { ...p, callActive: false } : p)
      )
    }, 12000)
  }

  // ── 標記病人已離開醫院 ────────────────────────────────────
  const markPatientLeft = (patientId) => {
    const patient = patients.find(p => p.id === patientId)
    if (!patient) return

    const isUrgent = ['dementia', 'pediatric', 'psychiatric'].includes(patient.category)
    const now = new Date()

    setPatients(prev =>
      prev.map(p =>
        p.id === patientId
          ? { ...p, status: 'left_hospital', leftHospitalTime: now, areaName: '醫院外部', areaId: 'exit', markerX: 450, markerY: 550 }
          : p
      )
    )

    if (isUrgent) {
      const alertId = `urgent_${patientId}_${now.getTime()}`
      addAlert({
        id: alertId,
        type: 'urgent',
        patientId,
        patientName: patient.name,
        message: `緊急！${patient.name}（${patientId}）為特殊高風險病人，已離開醫院，請立即處置！`,
        createdAt: now,
      })
    }
  }

  // ── 病人回到院內 ──────────────────────────────────────────
  const markPatientReturned = (patientId) => {
    setPatients(prev =>
      prev.map(p =>
        p.id === patientId
          ? { ...p, status: 'in_hospital', leftHospitalTime: null }
          : p
      )
    )
    setAlerts(prev => prev.filter(a => a.patientId !== patientId))
  }

  // ── 護理師分配/接手病人 ───────────────────────────────────
  const assignPatientToNurse = (patientId, nurseId) => {
    setPatients(prev =>
      prev.map(p => p.id === patientId ? { ...p, assignedNurse: nurseId } : p)
    )
  }

  // ── 移除警示 ──────────────────────────────────────────────
  const dismissAlert = (alertId) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId))
  }

  // ── 計算離院時間（分鐘）──────────────────────────────────
  const getElapsedMinutes = (patient) => {
    if (!patient.leftHospitalTime) return 0
    return Math.floor((Date.now() - new Date(patient.leftHospitalTime).getTime()) / 1000 / 60)
  }

  return (
    <AppContext.Provider value={{
      user, login, logout,
      patients, alerts,
      triggerCall, markPatientLeft, markPatientReturned,
      assignPatientToNurse, dismissAlert,
      getElapsedMinutes,
      tick,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
