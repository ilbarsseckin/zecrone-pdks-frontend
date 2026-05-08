import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { getPlanFeatures } from '../api/index'

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    lateToday: 0,
    absentToday: 0,
  })
  const [recentAttendance, setRecentAttendance] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const features = getPlanFeatures()

  useEffect(() => {
    const token = localStorage.getItem('pdks_token')
    if (!token) { window.location.href = '/'; return }
    const today = new Date().toISOString().split('T')[0]
    const h = { Authorization: `Bearer ${token}` }

    fetch('h${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/branches', { headers: h })
      .then(r => r.json())
      .then(branches => {
        if (!branches || !Array.isArray(branches) || branches.length === 0) { setLoading(false); return }
        const branchId = branches[0].id
        Promise.all([
          fetch('h${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/employees', { headers: h }).then(r => r.json()),
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'h${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}'}/api/attendance/daily?branchId=${branchId}&date=${today}`, { headers: h }).then(r => r.json()),
        ]).then(([employees, attendance]) => {
          const att  = Array.isArray(attendance) ? attendance : []
          const emps = Array.isArray(employees)  ? employees  : []
          setStats({
            totalEmployees: emps.length,
            presentToday:   att.filter((a: any) => a.status === 'PRESENT').length,
            lateToday:      att.filter((a: any) => a.status === 'LATE').length,
            absentToday:    emps.length - att.length,
          })
          setRecentAttendance(att)
          setLoading(false)
        })
      })
  }, [])

  const statCards = [
    { label: 'Toplam Personel', value: stats.totalEmployees, icon: '👥', color: 'text-blue-600',  bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Bugün Gelen',     value: stats.presentToday,   icon: '✅', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
    { label: 'Geç Kalan',       value: stats.lateToday,      icon: '⏰', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { label: 'Gelmeyen',        value: stats.absentToday,    icon: '❌', color: 'text-red-500',   bg: 'bg-red-50 dark:bg-red-900/20' },
  ]

  const formatTime = (dt: string) =>
    dt ? new Date(dt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : '-'

  return (
    <Layout>
      {loading ? (
        <div className="flex items-center justify-center h-64 text-gray-400">Yükleniyor...</div>
      ) : (
        <div>
          {/* Plan banner */}
          <div className={`flex items-center justify-between rounded-xl px-4 py-3 mb-5 border gap-3 ${
            features.plan === 'ENTERPRISE'   ? 'bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800' :
            features.plan === 'PROFESSIONAL' ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' :
                                               'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800'
          }`}>
            <div className="flex items-center gap-2 min-w-0">
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                features.plan === 'ENTERPRISE'   ? 'bg-purple-100 text-purple-700' :
                features.plan === 'PROFESSIONAL' ? 'bg-blue-100 text-blue-700' :
                                                   'bg-amber-100 text-amber-700'
              }`}>
                {features.plan || 'STARTER'}
              </span>
              <span className="text-xs text-gray-600 dark:text-gray-400 truncate">
                {features.plan === 'STARTER'      ? 'Excel export için planı yükselt' :
                 features.plan === 'PROFESSIONAL' ? 'API erişimi için Enterprise\'a geç' :
                                                    'Tüm özellikler aktif ✓'}
              </span>
            </div>
            {features.plan !== 'ENTERPRISE' && (
              <a href="/plan-upgrades" className="text-xs font-semibold text-blue-600 hover:text-blue-700 whitespace-nowrap">
                Yükselt →
              </a>
            )}
          </div>

          {/* Stat kartları — mobilde 2x2, masaüstünde 4x1 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
            {statCards.map(card => (
              <div key={card.label} className={`rounded-xl p-4 border border-gray-200 dark:border-gray-800 ${card.bg}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400 leading-tight">{card.label}</span>
                  <span className="text-lg">{card.icon}</span>
                </div>
                <div className={`text-2xl md:text-3xl font-bold ${card.color}`}>{card.value}</div>
              </div>
            ))}
          </div>

          {/* Yoklama tablosu — masaüstünde tablo, mobilde kart */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
            <div className="px-4 md:px-6 py-4 border-b border-gray-200 dark:border-gray-800 font-semibold text-sm md:text-base">
              Bugünkü Yoklama
              <span className="ml-2 text-xs font-normal text-gray-400">({recentAttendance.length} kayıt)</span>
            </div>

            {recentAttendance.length === 0 ? (
              <div className="px-6 py-10 text-center text-gray-400 text-sm">
                Bugün henüz yoklama kaydı yok
              </div>
            ) : (
              <>
                {/* Masaüstü tablo */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 uppercase">
                        <th className="px-6 py-3 text-left">Personel ID</th>
                        <th className="px-6 py-3 text-left">Giriş</th>
                        <th className="px-6 py-3 text-left">Çıkış</th>
                        <th className="px-6 py-3 text-left">Süre</th>
                        <th className="px-6 py-3 text-left">Durum</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentAttendance.map((a: any) => (
                        <tr key={a.id} className="border-t border-gray-100 dark:border-gray-800">
                          <td className="px-6 py-4 text-sm font-mono text-gray-500">{a.employeeId?.slice(0, 8)}...</td>
                          <td className="px-6 py-4 text-sm">{formatTime(a.checkIn)}</td>
                          <td className="px-6 py-4 text-sm">{formatTime(a.checkOut)}</td>
                          <td className="px-6 py-4 text-sm">{a.workMinutes > 0 ? `${Math.floor(a.workMinutes / 60)}s ${a.workMinutes % 60}dk` : '-'}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                              a.status === 'PRESENT' ? 'bg-green-100 text-green-700' :
                              a.status === 'LATE'    ? 'bg-amber-100 text-amber-700' :
                                                       'bg-red-100 text-red-700'
                            }`}>
                              {a.status === 'PRESENT' ? 'Geldi' : a.status === 'LATE' ? 'Geç Kaldı' : 'Gelmedi'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobil kart listesi */}
                <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-800">
                  {recentAttendance.map((a: any) => (
                    <div key={a.id} className="px-4 py-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-xs font-mono text-gray-400 truncate">{a.employeeId?.slice(0, 12)}...</div>
                        <div className="flex gap-3 mt-1 text-xs text-gray-500">
                          <span>🕐 {formatTime(a.checkIn)}</span>
                          {a.checkOut && <span>🕓 {formatTime(a.checkOut)}</span>}
                          {a.workMinutes > 0 && <span>⏱ {Math.floor(a.workMinutes / 60)}s {a.workMinutes % 60}dk</span>}
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                        a.status === 'PRESENT' ? 'bg-green-100 text-green-700' :
                        a.status === 'LATE'    ? 'bg-amber-100 text-amber-700' :
                                                 'bg-red-100 text-red-700'
                      }`}>
                        {a.status === 'PRESENT' ? 'Geldi' : a.status === 'LATE' ? 'Geç' : 'Gelmedi'}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </Layout>
  )
}
