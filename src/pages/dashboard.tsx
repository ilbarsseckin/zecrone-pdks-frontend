import { useEffect, useState } from 'react'
import Layout from '../components/Layout'

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    lateToday: 0,
    absentToday: 0,
  })
  const [recentAttendance, setRecentAttendance] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('pdks_token')
    if (!token) { window.location.href = '/'; return }

    const today = new Date().toISOString().split('T')[0]

    Promise.all([
      fetch('http://localhost:8080/api/employees', {
        headers: { Authorization: `Bearer ${token}` }
      }).then(r => r.json()),
      fetch(`http://localhost:8080/api/attendance/daily?branchId=2596ea1a-442e-4b45-a9a2-13e0e44fb976&date=${today}`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(r => r.json()),
    ]).then(([employees, attendance]) => {
      setStats({
        totalEmployees: employees.length,
        presentToday:   attendance.filter((a: any) => a.status === 'PRESENT').length,
        lateToday:      attendance.filter((a: any) => a.status === 'LATE').length,
        absentToday:    employees.length - attendance.length,
      })
      setRecentAttendance(attendance)
      setLoading(false)
    })
  }, [])

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center h-64 text-gray-400">
        Yükleniyor...
      </div>
    </Layout>
  )

  const statCards = [
    { label: 'Toplam Personel', value: stats.totalEmployees, color: 'bg-blue-500',   icon: '👥' },
    { label: 'Bugün Gelen',     value: stats.presentToday,   color: 'bg-green-500',  icon: '✅' },
    { label: 'Geç Kalan',       value: stats.lateToday,      color: 'bg-amber-500',  icon: '⏰' },
    { label: 'Gelmeyen',        value: stats.absentToday,    color: 'bg-red-500',    icon: '❌' },
  ]

  return (
    <Layout>
      {/* Stat kartları */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {statCards.map(card => (
          <div key={card.label}
            className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500 dark:text-gray-400">{card.label}</span>
              <span className="text-xl">{card.icon}</span>
            </div>
            <div className="text-3xl font-bold text-gray-800 dark:text-gray-100">
              {card.value}
            </div>
          </div>
        ))}
      </div>

      {/* Bugünkü yoklama */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 font-semibold">
          Bugünkü Yoklama
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 dark:text-gray-400 uppercase">
              <th className="px-6 py-3 text-left">Personel ID</th>
              <th className="px-6 py-3 text-left">Giriş</th>
              <th className="px-6 py-3 text-left">Çıkış</th>
              <th className="px-6 py-3 text-left">Süre</th>
              <th className="px-6 py-3 text-left">Durum</th>
            </tr>
          </thead>
          <tbody>
            {recentAttendance.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                  Bugün henüz yoklama kaydı yok
                </td>
              </tr>
            ) : recentAttendance.map((a: any) => (
              <tr key={a.id} className="border-t border-gray-100 dark:border-gray-800">
                <td className="px-6 py-4 text-sm font-mono text-gray-500">
                  {a.employeeId.slice(0, 8)}...
                </td>
                <td className="px-6 py-4 text-sm">
                  {a.checkIn ? new Date(a.checkIn).toLocaleTimeString('tr-TR') : '-'}
                </td>
                <td className="px-6 py-4 text-sm">
                  {a.checkOut ? new Date(a.checkOut).toLocaleTimeString('tr-TR') : '-'}
                </td>
                <td className="px-6 py-4 text-sm">
                  {a.workMinutes > 0 ? `${Math.floor(a.workMinutes / 60)}s ${a.workMinutes % 60}dk` : '-'}
                </td>
                <td className="px-6 py-4">
                  <span className={`
                    px-2.5 py-1 rounded-full text-xs font-medium
                    ${a.status === 'PRESENT' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : ''}
                    ${a.status === 'LATE'    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : ''}
                    ${a.status === 'ABSENT'  ? 'bg-red-100   text-red-700   dark:bg-red-900/30   dark:text-red-400'   : ''}
                  `}>
                    {a.status === 'PRESENT' ? 'Geldi' : a.status === 'LATE' ? 'Geç Kaldı' : 'Gelmedi'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  )
}