import { useEffect, useState } from 'react'
import Layout from '../components/Layout'

interface Employee {
  id: string
  fullName: string
  department: string
  position: string
}

interface AttendanceRecord {
  id: string
  employeeId: string
  workDate: string
  checkIn: string
  checkOut: string
  workMinutes: number
  status: string
}

export default function Attendance() {
  const [employees, setEmployees]   = useState<Employee[]>([])
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [loading, setLoading]       = useState(true)
  const [date, setDate]             = useState(new Date().toISOString().split('T')[0])
  const [branchId, setBranchId]     = useState('')

  const getToken = () => localStorage.getItem('pdks_token') || ''
  const h        = () => ({ Authorization: `Bearer ${getToken()}` })

  const loadAttendance = (bid: string, selectedDate: string) => {
    if (!bid) return
    Promise.all([
      fetch('http://localhost:8080/api/employees', { headers: h() }).then(r => r.json()),
      fetch(`http://localhost:8080/api/attendance/daily?branchId=${bid}&date=${selectedDate}`, { headers: h() }).then(r => r.json()),
    ]).then(([emps, att]) => {
      setEmployees(Array.isArray(emps) ? emps : [])
      setAttendance(Array.isArray(att)  ? att  : [])
      setLoading(false)
    })
  }

  useEffect(() => {
    if (!localStorage.getItem('pdks_token')) { window.location.href = '/'; return }
    // Önce şubeleri çek, ilk şubeyi al
    fetch('http://localhost:8080/api/branches', { headers: h() })
      .then(r => r.json())
      .then(brs => {
        if (!Array.isArray(brs) || brs.length === 0) { setLoading(false); return }
        const bid = brs[0].id
        setBranchId(bid)
        loadAttendance(bid, date)
      })
  }, [])

  const handleCheckIn = async (employeeId: string) => {
    const res = await fetch(`http://localhost:8080/api/attendance/check-in?employeeId=${employeeId}`, {
      method: 'POST', headers: h()
    })
    const d = await res.json()
    if (res.ok) loadAttendance(branchId, date)
    else alert(d.error)
  }

  const handleCheckOut = async (employeeId: string) => {
    const res = await fetch(`http://localhost:8080/api/attendance/check-out?employeeId=${employeeId}`, {
      method: 'POST', headers: h()
    })
    const d = await res.json()
    if (res.ok) loadAttendance(branchId, date)
    else alert(d.error)
  }

  const getRecord = (employeeId: string) =>
    attendance.find(a => a.employeeId === employeeId)

  const formatTime = (dt: string) =>
    dt ? new Date(dt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : '-'

  const formatDuration = (minutes: number) => {
    if (!minutes) return '-'
    return `${Math.floor(minutes / 60)}s ${minutes % 60}dk`
  }

  const stats = {
    present: attendance.filter(a => a.status === 'PRESENT').length,
    late:    attendance.filter(a => a.status === 'LATE').length,
    absent:  employees.length - attendance.length,
  }

  return (
    <Layout>
      <div>
        {loading ? (
          <div className="flex items-center justify-center h-64 text-gray-400">Yükleniyor...</div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Yoklama</h2>
                <p className="text-sm text-gray-500 mt-0.5">Günlük giriş/çıkış takibi</p>
              </div>
              <input type="date" value={date}
                onChange={e => { setDate(e.target.value); loadAttendance(branchId, e.target.value) }}
                className="border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
                <div className="text-sm text-gray-500 mb-1">Gelen</div>
                <div className="text-3xl font-bold text-green-600">{stats.present}</div>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
                <div className="text-sm text-gray-500 mb-1">Geç Kalan</div>
                <div className="text-3xl font-bold text-amber-500">{stats.late}</div>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
                <div className="text-sm text-gray-500 mb-1">Gelmeyen</div>
                <div className="text-3xl font-bold text-red-500">{stats.absent}</div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 uppercase">
                    <th className="px-6 py-3 text-left">Personel</th>
                    <th className="px-6 py-3 text-left">Departman</th>
                    <th className="px-6 py-3 text-left">Giriş</th>
                    <th className="px-6 py-3 text-left">Çıkış</th>
                    <th className="px-6 py-3 text-left">Süre</th>
                    <th className="px-6 py-3 text-left">Durum</th>
                    <th className="px-6 py-3 text-left">İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                        Personel bulunamadı
                      </td>
                    </tr>
                  ) : employees.map(emp => {
                    const record = getRecord(emp.id)
                    return (
                      <tr key={emp.id} className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="px-6 py-4 font-medium">{emp.fullName}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{emp.department || '-'}</td>
                        <td className="px-6 py-4 text-sm">{record ? formatTime(record.checkIn) : '-'}</td>
                        <td className="px-6 py-4 text-sm">{record ? formatTime(record.checkOut) : '-'}</td>
                        <td className="px-6 py-4 text-sm">{record ? formatDuration(record.workMinutes) : '-'}</td>
                        <td className="px-6 py-4">
                          {record ? (
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                              record.status === 'PRESENT' ? 'bg-green-100 text-green-700' :
                              record.status === 'LATE'    ? 'bg-amber-100 text-amber-700' :
                                                            'bg-red-100 text-red-700'
                            }`}>
                              {record.status === 'PRESENT' ? 'Geldi' : record.status === 'LATE' ? 'Geç Kaldı' : 'Gelmedi'}
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                              Bekleniyor
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            {!record ? (
                              <button onClick={() => handleCheckIn(emp.id)}
                                className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700">
                                Giriş
                              </button>
                            ) : !record.checkOut ? (
                              <button onClick={() => handleCheckOut(emp.id)}
                                className="px-3 py-1 bg-gray-600 text-white text-xs rounded-lg hover:bg-gray-700">
                                Çıkış
                              </button>
                            ) : (
                              <span className="text-xs text-gray-400">Tamamlandı</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}