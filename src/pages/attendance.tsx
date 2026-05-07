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
  manuallyEdited: boolean
  editedBy: string
  editedAt: string
  editNote: string
}

export default function Attendance() {
  const [employees, setEmployees]   = useState<Employee[]>([])
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [loading, setLoading]       = useState(true)
  const [date, setDate]             = useState(new Date().toISOString().split('T')[0])
  const [branchId, setBranchId]     = useState('')
  const [editModal, setEditModal]   = useState<AttendanceRecord | null>(null)
  const [editForm, setEditForm]     = useState({ checkIn: '', checkOut: '', status: '', editNote: '' })
  const [editSaving, setEditSaving] = useState(false)

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

  const openEdit = (record: AttendanceRecord) => {
    setEditModal(record)
    setEditForm({
      checkIn:  record.checkIn  ? new Date(record.checkIn).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : '',
      checkOut: record.checkOut ? new Date(record.checkOut).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : '',
      status:   record.status,
      editNote: ''
    })
  }

  const saveEdit = async () => {
    if (!editModal) return
    setEditSaving(true)
    const res = await fetch(`http://localhost:8080/api/attendance/${editModal.id}/edit`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...h() },
      body: JSON.stringify(editForm)
    })
    if (res.ok) {
      setEditModal(null)
      loadAttendance(branchId, date)
    } else {
      const d = await res.json()
      alert(d.error || 'Düzenleme başarısız')
    }
    setEditSaving(false)
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

            {/* Manuel düzenleme açıklaması */}
            <div className="flex items-center gap-2 mb-3 text-xs text-gray-500">
              <span className="w-3 h-3 rounded-full bg-orange-400 inline-block"></span>
              <span>Turuncu satırlar manuel düzenlenmiş kayıtları gösterir</span>
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
                    const isEdited = record?.manuallyEdited
                    return (
                      <tr key={emp.id} className={`border-t border-gray-100 dark:border-gray-800 ${
                        isEdited
                          ? 'bg-orange-50 dark:bg-orange-900/10 border-l-4 border-l-orange-400'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                      }`}>
                        <td className="px-6 py-4 font-medium">
                          <div>{emp.fullName}</div>
                          {isEdited && (
                            <div className="text-xs text-orange-500 mt-0.5 flex items-center gap-1">
                              ✏️ Manuel düzenlendi
                              {record?.editNote && (
                                <span className="text-orange-400">— {record.editNote}</span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{emp.department || '-'}</td>
                        <td className={`px-6 py-4 text-sm ${isEdited ? 'text-orange-600 font-medium' : ''}`}>
                          {record ? formatTime(record.checkIn) : '-'}
                        </td>
                        <td className={`px-6 py-4 text-sm ${isEdited ? 'text-orange-600 font-medium' : ''}`}>
                          {record ? formatTime(record.checkOut) : '-'}
                        </td>
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
                              <>
                                <button onClick={() => handleCheckOut(emp.id)}
                                  className="px-3 py-1 bg-gray-600 text-white text-xs rounded-lg hover:bg-gray-700">
                                  Çıkış
                                </button>
                                <button onClick={() => openEdit(record)}
                                  className="px-3 py-1 border border-orange-300 text-orange-600 text-xs rounded-lg hover:bg-orange-50">
                                  Düzenle
                                </button>
                              </>
                            ) : (
                              <>
                                <span className="text-xs text-gray-400">Tamamlandı</span>
                                <button onClick={() => openEdit(record)}
                                  className="px-3 py-1 border border-orange-300 text-orange-600 text-xs rounded-lg hover:bg-orange-50">
                                  Düzenle
                                </button>
                              </>
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

      {/* Düzenleme Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-lg">✏️ Yoklama Düzenle</h3>
              <button onClick={() => setEditModal(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <p className="text-sm text-gray-500 mb-1">
              {employees.find(e => e.id === editModal.employeeId)?.fullName}
            </p>
            <div className="mb-4 px-3 py-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 rounded-lg text-xs text-orange-700 dark:text-orange-400">
              ⚠️ Bu işlem kimin tarafından yapıldığı kayıt altına alınacak.
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Giriş Saati</label>
                  <input type="time" value={editForm.checkIn}
                    onChange={e => setEditForm({...editForm, checkIn: e.target.value})}
                    className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Çıkış Saati</label>
                  <input type="time" value={editForm.checkOut}
                    onChange={e => setEditForm({...editForm, checkOut: e.target.value})}
                    className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Durum</label>
                <select value={editForm.status}
                  onChange={e => setEditForm({...editForm, status: e.target.value})}
                  className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm">
                  <option value="PRESENT">Geldi</option>
                  <option value="LATE">Geç Kaldı</option>
                  <option value="ABSENT">Gelmedi</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Düzenleme Notu</label>
                <input value={editForm.editNote}
                  onChange={e => setEditForm({...editForm, editNote: e.target.value})}
                  placeholder="Düzenleme sebebi..."
                  className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm" />
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setEditModal(null)}
                  className="flex-1 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800">
                  İptal
                </button>
                <button onClick={saveEdit} disabled={editSaving}
                  className="flex-1 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-60">
                  {editSaving ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}