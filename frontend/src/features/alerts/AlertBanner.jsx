import { useApp } from '../../store/AppContext'

export default function AlertBanner() {
  const { alerts, dismissAlert } = useApp()

  if (alerts.length === 0) return null

  return (
    <div className="space-y-2 mb-4">
      {alerts.map(alert => (
        <div
          key={alert.id}
          className={`flex items-start gap-3 px-4 py-3 rounded-xl border text-sm ${
            alert.type === 'urgent'
              ? 'bg-red-50 border-red-300 text-red-800 alert-pulse'
              : 'bg-orange-50 border-orange-300 text-orange-800'
          }`}
        >
          <div className="flex-shrink-0 mt-0.5">
            {alert.type === 'urgent' ? (
              <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
              </svg>
            ) : (
              <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
              </svg>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold">
              {alert.type === 'urgent' ? '緊急警示' : '保全通知'}
            </p>
            <p className="mt-0.5">{alert.message}</p>
            <p className="text-xs mt-1 opacity-70">
              {new Date(alert.createdAt).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
          </div>
          <button
            onClick={() => dismissAlert(alert.id)}
            className="flex-shrink-0 p-1 rounded-lg hover:bg-black/10 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      ))}
    </div>
  )
}
