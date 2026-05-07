import { useEffect, useState } from 'react'
import Layout from '../components/Layout'

const LEAVE_TYPES: Record<string, string> = {
  ANNUAL: 'Yıllık', SICK: 'Hastalık', MATERNITY: 'Doğum',
  PATERNITY: 'Babalık', MARRIAGE: 'Evlilik', BEREAVEMENT: 'Vefat',
  UNPAID: 'Ücretsiz', OTHER: 'Diğer',
}

interface LeaveBalance {
  entitledDays: number
  usedDays: number
  pendingDays: number
  remainingDays: number
}

export default function Leaves() {
  const [leaves, setLeaves]       = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading]     = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [filter, setFilter]       = useState('ALL')
  const [selectedEmpBalance, setSelectedEmpBalance] = useState<LeaveBalance | null>(null)
  const [rejectModal, setRejectModal] = useState<{ id: string } | null>(null)
  const [rejectNote, setRejectNote]   = useState('')
  const [submitError, setSubmitError] = useState('')
  const [form, setForm] = useState({
    employeeId: '', type: 'ANNUAL', startDate: '', endDate: '', description: '',
  })

  const token   = () => localStorage.getItem('pdks_token') || ''
  const headers = () => ({ Authorization: `Bearer ${token()}` })

  const load = () => {
    Promise.all([
      fetch('http://localhost:8080/api/leaves',    { headers: headers() }).then(r => r.json()),
      fetch('http://localhost:8080/api/employees', { headers: headers() }).then(r => r.json()),
    ]).then(([lv, emps]) => {
      setLeaves(Array.isArray(lv) ? lv : [])
      setEmployees(Array.isArray(emps) ? emps : [])
      setLoading(false)
    })
  }

  useEffect(() => {
    if (!localStorage.getItem('pdks_token')) { window.location.href = '/'; return }
    load()
  }, [])

  const onEmployeeChange = async (employeeId: string) => {
    setForm(f => ({ ...f, employeeId }))
    if (!employeeId) { setSelectedEmpBalance(null); return }
    const year = new Date().getFullYear()
    const res  = await fetch(`http://localhost:8080/api/leaves/balance/${employeeId}?year=${year}`, { headers: headers() })
    if (res.ok) setSelectedEmpBalance(await res.json())
    else setSelectedEmpBalance(null)
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError('')
    const res = await fetch('http://localhost:8080/api/leaves', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers() },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      setShowModal(false); setSelectedEmpBalance(null)
      setForm({ employeeId: '', type: 'ANNUAL', startDate: '', endDate: '', description: '' })
      load()
    } else {
      const d = await res.json(); setSubmitError(d.error || 'Bir hata oluştu')
    }
  }

  const approve = async (id: string) => {
    await fetch(`http://localhost:8080/api/leaves/${id}/approve`, { method: 'PATCH', headers: headers() })
    load()
  }

  const reject = async () => {
    if (!rejectModal) return
    await fetch(`http://localhost:8080/api/leaves/${rejectModal.id}/reject?note=${encodeURIComponent(rejectNote)}`, {
      method: 'PATCH', headers: headers(),
    })
    setRejectModal(null); setRejectNote(''); load()
  }

  const empName  = (id: string) => employees.find(e => e.id === id)?.fullName || '-'
  const filtered = filter === 'ALL' ? leaves : leaves.filter(l => l.status === filter)

  const StatusBadge = ({ status }: { status: string }) => {
    const map = { PENDING: 'bg-amber-100 text-amber-700', APPROVED: 'bg-green-100 text-green-700', REJECTED: 'bg-red-100 text-red-700' } as Record<string, string>
    const labels = { PENDING: 'Bekliyor', APPROVED: 'Onaylandı', REJECTED: 'Reddedildi' } as Record<string, string>
    return <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${map[status] || 'bg-gray-100 text-gray-500'}`}>{labels[status] || status}</span>
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg md:text-xl font-bold text-gray-800 dark:text-gray-100">İzin Takibi</h2>
          <p className="text-xs md:text-sm text-gray-500">{leaves.length} talep</p>
        </div>
        <button onClick={() => { setShowModal(true); setSubmitError('') }}
          className="px-3 py-2 md:px-4 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
          + Yeni İzin
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64 text-gray-400">Yükleniyor...</div>
      ) : (
        <>
          {/* Özet kartlar */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: 'Bekleyen',   status: 'PENDING',  color: 'text-amber-500' },
              { label: 'Onaylanan',  status: 'APPROVED', color: 'text-green-600' },
              { label: 'Reddedilen', status: 'REJECTED', color: 'text-red-500' },
            ].map(({ label, status, color }) => (
              <div key={status} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-3 md:p-5">
                <div className="text-xs text-gray-500 mb-1">{label}</div>
                <div className={`text-2xl md:text-3xl font-bold ${color}`}>
                  {leaves.filter(l => l.status === status).length}
                </div>
              </div>
            ))}
          </div>

          {/* Filtre */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
            {[
              { key: 'ALL', label: 'Tümü' },
              { key: 'PENDING', label: 'Bekleyen' },
              { key: 'APPROVED', label: 'Onaylanan' },
              { key: 'REJECTED', label: 'Reddedilen' },
            ].map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className={`px-4 py-1.5 rounded-lg text-xs md:text-sm font-medium whitespace-nowrap ${
                  filter === f.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600'
                }`}>
                {f.label}
              </button>
            ))}
          </div>

          {/* Masaüstü tablo */}
          <div className="hidden md:block bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 uppercase">
                  <th className="px-6 py-3 text-left">Personel</th>
                  <th className="px-6 py-3 text-left">Tür</th>
                  <th className="px-6 py-3 text-left">Başlangıç</th>
                  <th className="px-6 py-3 text-left">Bitiş</th>
                  <th className="px-6 py-3 text-left">Gün</th>
                  <th className="px-6 py-3 text-left">Kaynak</th>
                  <th className="px-6 py-3 text-left">Durum</th>
                  <th className="px-6 py-3 text-left">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} className="px-6 py-10 text-center text-gray-400">Talep bulunamadı</td></tr>
                ) : filtered.map((leave: any) => (
                  <tr key={leave.id} className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-6 py-4 font-medium">{empName(leave.employeeId)}</td>
                    <td className="px-6 py-4 text-sm">{LEAVE_TYPES[leave.type] || leave.type}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{leave.startDate}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{leave.endDate}</td>
                    <td className="px-6 py-4 text-sm font-medium">{leave.totalDays} gün</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${leave.requestedBy === 'MOBILE' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'}`}>
                        {leave.requestedBy === 'MOBILE' ? '📱' : '🖥'} {leave.requestedBy === 'MOBILE' ? 'Mobil' : 'Web'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={leave.status} />
                      {leave.reviewNote && <p className="text-xs text-gray-400 mt-1 truncate max-w-xs">{leave.reviewNote}</p>}
                    </td>
                    <td className="px-6 py-4">
                      {leave.status === 'PENDING' && (
                        <div className="flex gap-2">
                          <button onClick={() => approve(leave.id)} className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg">Onayla</button>
                          <button onClick={() => setRejectModal({ id: leave.id })} className="px-3 py-1 bg-red-500 text-white text-xs rounded-lg">Reddet</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobil kart listesi */}
          <div className="md:hidden space-y-3">
            {filtered.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-sm">Talep bulunamadı</div>
            ) : filtered.map((leave: any) => (
              <div key={leave.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="font-semibold text-sm">{empName(leave.employeeId)}</div>
                    <div className="text-xs text-gray-400">{LEAVE_TYPES[leave.type] || leave.type}</div>
                  </div>
                  <StatusBadge status={leave.status} />
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                  <span>📅 {leave.startDate} – {leave.endDate}</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">{leave.totalDays} gün</span>
                  <span className={`px-1.5 py-0.5 rounded text-xs ${leave.requestedBy === 'MOBILE' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'}`}>
                    {leave.requestedBy === 'MOBILE' ? '📱' : '🖥'}
                  </span>
                </div>
                {leave.reviewNote && (
                  <div className="text-xs text-gray-400 mb-3 italic">{leave.reviewNote}</div>
                )}
                {leave.status === 'PENDING' && (
                  <div className="flex gap-2">
                    <button onClick={() => approve(leave.id)}
                      className="flex-1 py-2 bg-green-600 text-white text-xs font-medium rounded-lg">Onayla</button>
                    <button onClick={() => setRejectModal({ id: leave.id })}
                      className="flex-1 py-2 bg-red-500 text-white text-xs font-medium rounded-lg">Reddet</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Reddet modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="font-bold text-lg mb-3">İzin Reddet</h3>
            <textarea value={rejectNote} onChange={e => setRejectNote(e.target.value)}
              className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm mb-4"
              rows={3} placeholder="Red nedeni (opsiyonel)..." />
            <div className="flex gap-3">
              <button onClick={() => { setRejectModal(null); setRejectNote('') }}
                className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm">İptal</button>
              <button onClick={reject}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-lg text-sm font-medium">Reddet</button>
            </div>
          </div>
        </div>
      )}

      {/* Yeni izin modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-lg">Yeni İzin Talebi</h3>
              <button onClick={() => { setShowModal(false); setSelectedEmpBalance(null); setSubmitError('') }} className="text-gray-400 text-xl">✕</button>
            </div>
            {submitError && (
              <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                ⚠️ {submitError}
              </div>
            )}
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Personel *</label>
                <select required value={form.employeeId}
                  onChange={e => onEmployeeChange(e.target.value)}
                  className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2.5 text-sm">
                  <option value="">Personel seçin</option>
                  {employees.map((e: any) => <option key={e.id} value={e.id}>{e.fullName}</option>)}
                </select>
              </div>
              {selectedEmpBalance && form.type === 'ANNUAL' && (
                <div className="grid grid-cols-3 gap-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 border border-blue-100 dark:border-blue-800">
                  {[
                    { l: 'Hak Edilen', v: selectedEmpBalance.entitledDays },
                    { l: 'Kullanılan', v: selectedEmpBalance.usedDays },
                    { l: 'Kalan',      v: selectedEmpBalance.remainingDays },
                  ].map(({ l, v }) => (
                    <div key={l} className="text-center">
                      <div className="text-xs text-blue-600 dark:text-blue-400 mb-0.5">{l}</div>
                      <div className={`text-lg font-bold ${l === 'Kalan' && v <= 3 ? 'text-red-600' : 'text-blue-700 dark:text-blue-300'}`}>{v}</div>
                    </div>
                  ))}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">Tür</label>
                <select value={form.type}
                  onChange={e => setForm({ ...form, type: e.target.value })}
                  className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2.5 text-sm">
                  {Object.entries(LEAVE_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Başlangıç *</label>
                  <input type="date" required value={form.startDate}
                    onChange={e => setForm({ ...form, startDate: e.target.value })}
                    className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Bitiş *</label>
                  <input type="date" required value={form.endDate}
                    onChange={e => setForm({ ...form, endDate: e.target.value })}
                    className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2.5 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Açıklama</label>
                <textarea value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm"
                  rows={2} placeholder="İzin sebebi..." />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => { setShowModal(false); setSelectedEmpBalance(null); setSubmitError('') }}
                  className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm">İptal</button>
                <button type="submit"
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium">Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}
