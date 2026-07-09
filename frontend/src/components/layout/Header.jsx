import { useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../../store/AppContext'

const ROLE_LABELS = {
  nurse:    { label: '護理師', color: 'bg-sky-100 text-sky-800'       },
  doctor:   { label: '醫師',   color: 'bg-indigo-100 text-indigo-800' },
  security: { label: '保全',   color: 'bg-amber-100 text-amber-800'   },
}

export default function Header() {
  const { user, logout, alerts } = useApp()
  const navigate = useNavigate()
  const location = useLocation()

  const navItems = [
    { path: '/patients', label: '病人列表', icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
    )},
    { path: '/map', label: '平面圖總覽', icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>
    )},
  ]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const roleCfg = ROLE_LABELS[user?.role] || ROLE_LABELS.nurse
  const urgentAlerts = alerts.filter(a => a.type === 'urgent').length
  const totalAlerts = alerts.length

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Left: Logo + Nav */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-[#0f4c81] rounded-lg flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
            </div>
            <span className="text-sm font-bold text-slate-800 hidden sm:block">急診追蹤系統</span>
          </div>

          <nav className="flex items-center gap-1">
            {navItems.map(item => {
              const isActive = location.pathname === item.path
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                  }`}
                >
                  {item.icon}
                  {item.label}
                  {item.label === '病人列表' && totalAlerts > 0 && (
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center ${urgentAlerts > 0 ? 'bg-red-500 text-white' : 'bg-orange-400 text-white'}`}>
                      {totalAlerts}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Right: User info + Logout */}
        <div className="flex items-center gap-3">
          {totalAlerts > 0 && (
            <div className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${urgentAlerts > 0 ? 'bg-red-50 text-red-700 border border-red-200 alert-pulse' : 'bg-orange-50 text-orange-700 border border-orange-200'}`}>
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
              </svg>
              {totalAlerts} 則警示
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${roleCfg.color}`}>
              {roleCfg.label}
            </span>
            <span className="text-sm font-medium text-slate-700">{user?.name}</span>
            <span className="text-xs text-slate-400 font-mono">{user?.id}</span>
          </div>
          <button
            onClick={handleLogout}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-lg hover:bg-slate-100"
            title="登出"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}
