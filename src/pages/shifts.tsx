import { useEffect, useState } from 'react'
import Layout from '../components/Layout'

const SHIFT_TYPES: Record<string, { label: string; color: string }> = {
  MORNING:   { label: 'Sabah',   color: 'bg-amber-100 text-amber-700' },
  AFTERNOON: { label: 'Öğleden Sonra', color: 'bg-blue-100 text-blue-700' },
  NIGHT:     { label: 'Gece',    color: 'bg-purple-100 text-purple-700' },
  CUSTOM:    { label: 'Özel',    color: 'bg-gray-100 text-gray-700' },
}

export default function Shifts() {
  const [shifts, setShifts] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [branches, setBranches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [branchId, setBranchId] = useState('')
  const [weekStart, setWeekStart] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - d.getDay() + 1)
    return d.toISOString().split('T')[0]
  })
  const [form, setForm] = useState({
    branchId: '', employeeId: '', name: '',
    shiftDate: '', startTime: '08:00', endTime: '17:00',
    type: 'MORNING'
  })

  const token = () => localStorage.getItem('pdks_token') || ''
  const headers = () => ({ Authorization: `Bearer ${token()}` })

  const getWeekEnd = (start: string) => {
    const d = new Date(start)
    d.setDate(d.getDate() + 6)
    return d.toISOString().split('T')[0]
  }

  const load = (bid: string, ws: string) => {
    if (!bid) return
    const we = getWeekEnd(ws)
    fetch(`http://localhost:8080/api/shifts?branchId=${bid}&from=${ws}&to=${we}`, {
      headers: headers()
    }).then(r => r.json()).then(data => {
      setShifts(Array.isArray(data) ? data : [])
      setLoading(false)
    })
  }

  useEffect(() => {
    if (!localStorage.getItem('pdks_token')) { window.location.href = '/'; return }
    Promise.all([
      fetch('http://localhost:8080/api/branches', { headers: headers() }).then(r => r.json()),
      fetch('http://localhost:8080/api/employees', { headers: headers() }).then(r => r.json()),
    ]).then(([brs, emps]) => {
      setBranches(brs)
      setEmployees(emps)
      if (brs.length > 0) {
        setBranchId(brs[0].id)
        setForm(f => ({ ...f, branchId: brs[0].id }))
        load(brs[0].id, weekStart)
      } else {
        setLoading(false)
      }
    })
  }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('http://localhost:8080/api/shifts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers() },
      body: JSON.stringify(form)
    })
    if (res.ok) { setShowModal(false); load(branchId, weekStart) }
    else { const d = await res.json(); alert(d.error) }
  }

  const deleteShift = async (id: string) => {
    if (!confirm('Vardiyayı silmek istediğinize emin misiniz?')) return
    await fetch(`http://localhost:8080/api/shifts/${id}`, { method: 'DELETE', headers: headers() })
    load(branchId, weekStart)
  }

  const empName = (id: string) => employees.find(e => e.id === id)?.fullName || '-'

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + i)
    return d.toISOString().split('T')[0]
  })

  const prevWeek = () => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() - 7)
    const ws = d.toISOString().split('T')[0]
    setWeekStart(ws)
    load(branchId, ws)
  }

  const nextWeek = () => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + 7)
    const ws = d.toISOString().split('T')[0]
    setWeekStart(ws)
    load(branchId, ws)
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64 text-gray-400">Yükleniyor...</div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Vardiya Yönetimi</h2>
            <p className="text-sm text-gray-500">Haftalık vardiya planlaması</p>
          </div>
          <div className="flex items-center gap-3">
            <select value={branchId}
              onChange={e => { setBranchId(e.target.value); load(e.target.value, weekStart) }}
              className="border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm">
              {branches.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
            <button onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
              + Vardiya Ekle
            </button>
          </div>
        </div>

        {/* Hafta navigasyonu */}
        <div className="flex items-center gap-4 mb-4">
          <button onClick={prevWeek}
            className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800">
            ← Önceki Hafta
          </button>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {new Date(weekStart).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })} —{' '}
            {new Date(getWeekEnd(weekStart)).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
          <button onClick={nextWeek}
            className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800">
            Sonraki Hafta →
          </button>
        </div>

        {/* Haftalık tablo */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800">
                {weekDays.map(day => (
                  <th key={day} className="px-4 py-3 text-xs text-gray-500 font-medium text-center border-b border-gray-200 dark:border-gray-700">
                    <div>{new Date(day).toLocaleDateString('tr-TR', { weekday: 'short' })}</div>
                    <div className="text-base font-bold text-gray-700 dark:text-gray-300">
                      {new Date(day).getDate()}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {weekDays.map(day => {
                  const dayShifts = shifts.filter(s => s.shiftDate === day)
                  return (
                    <td key={day} className="px-2 py-3 align-top border-r border-gray-100 dark:border-gray-800 min-w-32">
                      <div className="space-y-2">
                        {dayShifts.map((shift: any) => (
                          <div key={shift.id}
                            className={`p-2 rounded-lg text-xs ${SHIFT_TYPES[shift.type]?.color || 'bg-gray-100 text-gray-700'}`}>
                            <div className="font-medium">{empName(shift.employeeId)}</div>
                            <div className="opacity-75">{shift.startTime?.slice(0,5)} - {shift.endTime?.slice(0,5)}</div>
                            <div className="flex items-center justify-between mt-1">
                              <span>{SHIFT_TYPES[shift.type]?.label}</span>
                              <button onClick={() => deleteShift(shift.id)}
                                className="text-red-400 hover:text-red-600 ml-1">✕</button>
                            </div>
                          </div>
                        ))}
                        {dayShifts.length === 0 && (
                          <div className="text-xs text-gray-300 dark:text-gray-600 text-center py-2">—</div>
                        )}
                      </div>
                    </td>
                  )
                })}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Özet */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          {Object.entries(SHIFT_TYPES).map(([key, val]) => (
            <div key={key} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
              <div className="text-sm text-gray-500 mb-1">{val.label}</div>
              <div className="text-2xl font-bold">{shifts.filter(s => s.type === key).length}</div>
            </div>
          ))}
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-lg shadow-xl">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-lg">Vardiya Ekle</h3>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
              </div>
              <form onSubmit={submit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Personel</label>
                  <select required value={form.employeeId}
                    onChange={e => setForm({ ...form, employeeId: e.target.value })}
                    className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm">
                    <option value="">Personel seçin</option>
                    {employees.map((e: any) => <option key={e.id} value={e.id}>{e.fullName}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Vardiya Adı</label>
                    <input value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm"
                      placeholder="Sabah vardiyası" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Vardiya Türü</label>
                    <select value={form.type}
                      onChange={e => setForm({ ...form, type: e.target.value })}
                      className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm">
                      {Object.entries(SHIFT_TYPES).map(([k, v]) => (
                        <option key={k} value={k}>{v.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tarih</label>
                  <input type="date" required value={form.shiftDate}
                    onChange={e => setForm({ ...form, shiftDate: e.target.value })}
                    className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Başlangıç</label>
                    <input type="time" value={form.startTime}
                      onChange={e => setForm({ ...form, startTime: e.target.value })}
                      className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Bitiş</label>
                    <input type="time" value={form.endTime}
                      onChange={e => setForm({ ...form, endTime: e.target.value })}
                      className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm" />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)}
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
