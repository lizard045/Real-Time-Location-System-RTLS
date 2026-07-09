import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../store/AppContext'
import { ACCOUNTS } from '../store/mockData'

const ROLE_LABELS = {
  nurse:    { label: '護理師', color: 'text-sky-700',    bg: 'bg-sky-50 border-sky-200'    },
  doctor:   { label: '醫師',   color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-200' },
  security: { label: '保全',   color: 'text-amber-700',  bg: 'bg-amber-50 border-amber-200'  },
}

export default function LoginPage() {
  const { login } = useApp()
  const navigate = useNavigate()
  const [id, setId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    setTimeout(() => {
      const ok = login(id.trim(), password)
      if (ok) {
        navigate('/patients')
      } else {
        setError('帳號或密碼錯誤，請再試一次')
        setLoading(false)
      }
    }, 400)
  }

  const quickLogin = (account) => {
    setId(account.id)
    setPassword(account.password)
    setError('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#0f4c81] rounded-2xl mb-4 shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v4m0 0V4m0 4h4m-4 0H8m4 4v4m0-4v4m0 0h4m-4 0H8" />
              <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth={2} fill="none"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">急診病人位置追蹤系統</h1>
          <p className="text-sm text-slate-500 mt-1">中山醫學大學附設醫院・核醫大樓一樓</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-700">員工登入</h2>
          </div>
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">員工編號</label>
              <input
                type="text"
                value={id}
                onChange={e => setId(e.target.value)}
                placeholder="請輸入員工編號"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">密碼</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="請輸入密碼"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                required
              />
            </div>
            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                </svg>
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0f4c81] hover:bg-[#1d5c9a] disabled:opacity-60 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
            >
              {loading ? '登入中...' : '登入'}
            </button>
          </form>

          {/* Quick login accounts */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
            <p className="text-xs font-medium text-slate-500 mb-3">Demo 快速選擇帳號</p>
            <div className="space-y-2">
              {ACCOUNTS.map(account => {
                const cfg = ROLE_LABELS[account.role]
                return (
                  <button
                    key={account.id}
                    onClick={() => quickLogin(account)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg border text-sm transition-all hover:shadow-sm ${cfg.bg} ${id === account.id ? 'ring-2 ring-blue-400' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-slate-400 w-12">{account.id}</span>
                      <span className="font-medium text-slate-700">{account.name}</span>
                    </div>
                    <span className={`text-xs font-semibold ${cfg.color}`}>{cfg.label}</span>
                  </button>
                )
              })}
            </div>
            <p className="text-xs text-slate-400 mt-3 text-center">所有帳號密碼皆為 <span className="font-mono font-bold">1234</span></p>
          </div>
        </div>
      </div>
    </div>
  )
}
