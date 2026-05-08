import { useEffect, useState } from 'react'
import Layout from '../components/Layout'

const OT_TYPES: Record<string, { label: string; color: string; bg: string }> = {
  WEEKDAY: { label: 'Hafta İçi',   color: 'text-blue-700',   bg: 'bg-blue-100' },
  WEEKEND: { label: 'Hafta Sonu',  color: 'text-purple-700', bg: 'bg-purple-100' },
  HOLIDAY: { label: 'Resmi Tatil', color: 'text-red-700',    bg: 'bg-red-100' },
  NIGHT:   { label: 'Gece',        color: 'text-gray-700',   bg: 'bg-gray-100' },
}

export default function Overtime() {
  const [overtimes, setOvertimes]   = useState<any[]>([])
  const [employees, setEmployees]   = useState<any[]>([])
  const [branches, setBranches]     = useState<any[]>([])
  const [loading, setLoading]       = useState(true)
  const [showModal, setShowModal]   = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [filter, setFilter]         = useState('ALL')
  const [branchId, setBranchId]     = useState('')
  const [from, setFrom] = useState(() => {
    const d = new Date()
    d.setDate(1)
    return d.toISOString().split('T')[0]
  })
  const [to, setTo] = useState(() => new Date().toISOString().split('T')[0])
  const [form, setForm] = useState({
    employeeId: '', branchId: '',
    workDate: '', startTime: '', endTime: '',
    type: 'WEEKDAY', description: ''
  })

  const token   = () => localStorage.getItem('pdks_token') || ''
  const headers = () => ({ Authorization: `Bearer ${token()}` })

  const load = () => {
    const h = { Authorization: `Bearer ${token()}` }
    Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/employees', { headers: h }).then(r => r.json()),
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/branches',  { headers: h }).then(r => r.json()),
    ]).then(([emps, brs]) => {
      setEmployees(Array.isArray(emps) ? emps : [])
      setBranches(Array.isArray(brs)  ? brs  : [])
      if (brs.length > 0) {
        setBranchId(brs[0].id)
        loadOvertimes(brs[0].id, from, to)
      } else {
        setLoading(false)
      }
    })
  }

  const loadOvertimes = (bid: string, f: string, t: string) => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}'}/api/overtime?branchId=${bid}&from=${f}&to=${t}`, {
      headers: headers()
    }).then(r => r.json()).then(data => {
      setOvertimes(Array.isArray(data) ? data : [])
      setLoading(false)
    })
  }

  useEffect(() => {
    if (!localStorage.getItem('pdks_token')) { window.location.href = '/'; return }
    load()
  }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError('')
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/overtime', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers() },
      body: JSON.stringify(form)
    })
    if (res.ok) {
      setShowModal(false)
      setForm({ employeeId: '', branchId: '', workDate: '', startTime: '', endTime: '', type: 'WEEKDAY', description: '' })
      loadOvertimes(branchId, from, to)
    } else {
      const d = await res.json()
      setSubmitError(d.error || 'Bir hata oluştu')
    }
  }

  const approve = async (id: string) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}'}/api/overtime/${id}/approve`, {
      method: 'PATCH', headers: headers()
    })
    loadOvertimes(branchId, from, to)
  }

  const reject = async (id: string) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}'}/api/overtime/${id}/reject`, {
      method: 'PATCH', headers: headers()
    })
    loadOvertimes(branchId, from, to)
  }

  const empName = (id: string) => employees.find(e => e.id === id)?.fullName || '-'

  const filtered = filter === 'ALL' ? overtimes : overtimes.filter(o => o.status === filter)

  const stats = {
    total:    overtimes.length,
    pending:  overtimes.filter(o => o.status === 'PENDING').length,
    approved: overtimes.filter(o => o.status === 'APPROVED').length,
    totalMin: overtimes.filter(o => o.status === 'APPROVED')
                       .reduce((s, o) => s + (o.overtimeMinutes || 0), 0),
  }

  return (
    <Layout>
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Fazla Mesai</h2>
            <p className="text-sm text-gray-500">Mesai kayıtları ve onay yönetimi</p>
          </div>
          <button onClick={() => { setShowModal(true); setSubmitError('') }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
            + Mesai Ekle
          </button>
        </div>

        {/* İstatistik kartları */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
            <div className="text-sm text-gray-500 mb-1">Toplam Kayıt</div>
            <div className="text-3xl font-bold text-gray-800 dark:text-gray-100">{stats.total}</div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
            <div className="text-sm text-gray-500 mb-1">Bekleyen</div>
            <div className="text-3xl font-bold text-amber-500">{stats.pending}</div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
            <div className="text-sm text-gray-500 mb-1">Onaylanan</div>
            <div className="text-3xl font-bold text-green-600">{stats.approved}</div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
            <div className="text-sm text-gray-500 mb-1">Toplam Mesai</div>
            <div className="text-3xl font-bold text-blue-600">
              {Math.floor(stats.totalMin / 60)}s {stats.totalMin % 60}dk
            </div>
          </div>
        </div>

        {/* Filtreler */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <select value={branchId}
            onChange={e => { setBranchId(e.target.value); loadOvertimes(e.target.value, from, to) }}
            className="border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm">
            {branches.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <input type="date" value={from} onChange={e => { setFrom(e.target.value); loadOvertimes(branchId, e.target.value, to) }}
            className="border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm" />
          <input type="date" value={to} onChange={e => { setTo(e.target.value); loadOvertimes(branchId, from, e.target.value) }}
            className="border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm" />
          <div className="flex gap-2 ml-auto">
            {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                  filter === f
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 hover:bg-gray-50'
                }`}>
                {f === 'ALL' ? 'Tümü' : f === 'PENDING' ? 'Bekleyen' : f === 'APPROVED' ? 'Onaylanan' : 'Reddedilen'}
              </button>
            ))}
          </div>
        </div>

        {/* Tablo */}
        {loading ? (
          <div className="flex items-center justify-center h-40 text-gray-400">Yükleniyor...</div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 uppercase">
                  <th className="px-6 py-3 text-left">Personel</th>
                  <th className="px-6 py-3 text-left">Tarih</th>
                  <th className="px-6 py-3 text-left">Saat</th>
                  <th className="px-6 py-3 text-left">Süre</th>
                  <th className="px-6 py-3 text-left">Tür</th>
                  <th className="px-6 py-3 text-left">Açıklama</th>
                  <th className="px-6 py-3 text-left">Durum</th>
                  <th className="px-6 py-3 text-left">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-10 text-center text-gray-400">
                      Mesai kaydı bulunamadı
                    </td>
                  </tr>
                ) : filtered.map((ot: any) => (
                  <tr key={ot.id} className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-6 py-4 font-medium text-sm">{empName(ot.employeeId)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{ot.workDate}</td>
                    <td className="px-6 py-4 text-sm">
                      {ot.startTime?.slice(0,5)} - {ot.endTime?.slice(0,5)}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      {Math.floor(ot.overtimeMinutes / 60)}s {ot.overtimeMinutes % 60}dk
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${OT_TYPES[ot.type]?.bg} ${OT_TYPES[ot.type]?.color}`}>
                        {OT_TYPES[ot.type]?.label || ot.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {ot.description || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        ot.status === 'PENDING'  ? 'bg-amber-100 text-amber-700' :
                        ot.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                                   'bg-red-100 text-red-700'
                      }`}>
                        {ot.status === 'PENDING' ? 'Bekliyor' : ot.status === 'APPROVED' ? 'Onaylandı' : 'Reddedildi'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {ot.status === 'PENDING' && (
                        <div className="flex gap-2">
                          <button onClick={() => approve(ot.id)}
                            className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700">
                            Onayla
                          </button>
                          <button onClick={() => reject(ot.id)}
                            className="px-3 py-1 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600">
                            Reddet
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-lg shadow-xl">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-lg">Fazla Mesai Ekle</h3>
                <button onClick={() => { setShowModal(false); setSubmitError('') }}
                  className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
              </div>

              {submitError && (
                <div className="mb-4 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 flex items-center gap-2">
                  <span>⚠️</span><span>{submitError}</span>
                </div>
              )}

              <form onSubmit={submit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Personel *</label>
                  <select required value={form.employeeId}
                    onChange={e => setForm({ ...form, employeeId: e.target.value })}
                    className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm">
                    <option value="">Personel seçin</option>
                    {employees.map((e: any) => <option key={e.id} value={e.id}>{e.fullName}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Şube *</label>
                  <select required value={form.branchId}
                    onChange={e => setForm({ ...form, branchId: e.target.value })}
                    className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm">
                    <option value="">Şube seçin</option>
                    {branches.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Tarih *</label>
                    <input type="date" required value={form.workDate}
                      onChange={e => setForm({ ...form, workDate: e.target.value })}
                      className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Mesai Türü</label>
                    <select value={form.type}
                      onChange={e => setForm({ ...form, type: e.target.value })}
                      className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm">
                      {Object.entries(OT_TYPES).map(([k, v]) => (
                        <option key={k} value={k}>{v.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Başlangıç *</label>
                    <input type="time" required value={form.startTime}
                      onChange={e => setForm({ ...form, startTime: e.target.value })}
                      className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Bitiş *</label>
                    <input type="time" required value={form.endTime}
                      onChange={e => setForm({ ...form, endTime: e.target.value })}
                      className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Açıklama</label>
                  <textarea value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm"
                    rows={2} placeholder="Mesai nedeni..." />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => { setShowModal(false); setSubmitError('') }}
                    className="flex-1 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800">
                    İptal
                  </button>
                  <button type="submit"
                    className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 font-medium">
                    Kaydet
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
