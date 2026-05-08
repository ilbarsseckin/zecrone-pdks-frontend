import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { useRouter } from 'next/router'
import { getPlanFeatures } from '../api/index'

interface Employee {
  id: string
  employeeNumber: string
  fullName: string
  email: string
  department: string
  position: string
  status: string
  phone: string
  startDate: string
  branchId: string
}

interface Branch {
  id: string
  name: string
}

export default function Employees() {
  const router = useRouter()
  const [employees, setEmployees]             = useState<Employee[]>([])
  const [branches, setBranches]               = useState<Branch[]>([])
  const [loading, setLoading]                 = useState(true)
  const [showModal, setShowModal]             = useState(false)
  const [search, setSearch]                   = useState('')
  const [filterStatus, setFilterStatus]       = useState('ALL')
  const [mobilePassModal, setMobilePassModal] = useState<Employee | null>(null)
  const [mobilePassword, setMobilePassword]   = useState('')
  const [form, setForm] = useState({
    branchId: '', firstName: '', lastName: '',
    email: '', phone: '', department: '', position: '', startDate: ''
  })

  const features = getPlanFeatures()
  const getToken = () => localStorage.getItem('pdks_token') || ''
  const authHdr  = () => ({ Authorization: `Bearer ${getToken()}` })

  const load = () => {
    Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/employees', { headers: authHdr() }).then(r => r.json()),
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/branches',  { headers: authHdr() }).then(r => r.json()),
    ]).then(([emps, brs]) => {
      setEmployees(Array.isArray(emps) ? emps : [])
      setBranches(Array.isArray(brs)  ? brs  : [])
      setLoading(false)
    })
  }

  useEffect(() => {
    if (!localStorage.getItem('pdks_token')) { window.location.href = '/'; return }
    load()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/employees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHdr() },
      body: JSON.stringify(form)
    })
    if (res.ok) {
      setShowModal(false)
      setForm({ branchId: '', firstName: '', lastName: '', email: '', phone: '', department: '', position: '', startDate: '' })
      load()
    } else {
      const d = await res.json(); alert(d.error)
    }
  }

  const handleNewEmployee = () => {
    if (features.maxEmployees !== Infinity && employees.length >= features.maxEmployees) {
      alert(`Planınız en fazla ${features.maxEmployees} personele izin veriyor.`)
      return
    }
    setShowModal(true)
  }

  const setPassive = async (id: string) => {
    if (!confirm('Pasife almak istediğinize emin misiniz?')) return
    await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/employees/${id}/status?status=PASSIVE`, {
      method: 'PATCH', headers: authHdr()
    })
    load()
  }

  const setMobilePass = async () => {
    if (!mobilePassModal) return
    if (mobilePassword.length < 6) { alert('Şifre en az 6 karakter olmalı'); return }
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/employees/${mobilePassModal.id}/set-mobile-password?password=${encodeURIComponent(mobilePassword)}`,
      { method: 'POST', headers: authHdr() }
    )
    if (res.ok) {
      alert(`${mobilePassModal.fullName} için mobil şifre belirlendi.`)
      setMobilePassModal(null); setMobilePassword('')
    } else {
      const d = await res.json(); alert(d.error)
    }
  }

  const branchName = (id: string) => branches.find(b => b.id === id)?.name || '-'

  const filtered = employees.filter(emp => {
    const matchSearch =
      emp.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      emp.email?.toLowerCase().includes(search.toLowerCase()) ||
      emp.department?.toLowerCase().includes(search.toLowerCase()) ||
      emp.employeeNumber?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'ALL' || emp.status === filterStatus
    return matchSearch && matchStatus
  })

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      ACTIVE: 'bg-green-100 text-green-700',
      ON_LEAVE: 'bg-amber-100 text-amber-700',
      PASSIVE: 'bg-gray-100 text-gray-500',
    }
    const labels: Record<string, string> = { ACTIVE: 'Aktif', ON_LEAVE: 'İzinli', PASSIVE: 'Pasif' }
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${map[status] || 'bg-gray-100 text-gray-500'}`}>
        {labels[status] || status}
      </span>
    )
  }

  return (
    <Layout>
      {loading ? (
        <div className="flex items-center justify-center h-64 text-gray-400">Yükleniyor...</div>
      ) : (
        <>
          {/* Başlık */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg md:text-xl font-bold text-gray-800 dark:text-gray-100">Personel</h2>
              <p className="text-xs md:text-sm text-gray-500">
                {employees.length} / {features.maxEmployees === Infinity ? '∞' : features.maxEmployees}
              </p>
            </div>
            <button onClick={handleNewEmployee}
              className="px-3 py-2 md:px-4 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
              + Ekle
            </button>
          </div>

          {/* Arama + filtre */}
          <div className="space-y-2 mb-4">
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="İsim, sicil, email veya departman ara..."
              className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm" />
            <div className="flex gap-2 overflow-x-auto pb-1">
              {[
                { k: 'ALL', l: 'Tümü' },
                { k: 'ACTIVE', l: 'Aktif' },
                { k: 'ON_LEAVE', l: 'İzinli' },
                { k: 'PASSIVE', l: 'Pasif' },
              ].map(({ k, l }) => (
                <button key={k} onClick={() => setFilterStatus(k)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
                    filterStatus === k
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600'
                  }`}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Masaüstü tablo */}
          <div className="hidden md:block bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 uppercase">
                  <th className="px-6 py-3 text-left">Sicil No</th>
                  <th className="px-6 py-3 text-left">Ad Soyad</th>
                  <th className="px-6 py-3 text-left">Email</th>
                  <th className="px-6 py-3 text-left">Departman</th>
                  <th className="px-6 py-3 text-left">Şube</th>
                  <th className="px-6 py-3 text-left">Durum</th>
                  <th className="px-6 py-3 text-left">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-400">Personel bulunamadı</td></tr>
                ) : filtered.map(emp => (
                  <tr key={emp.id} className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">
                        {emp.employeeNumber || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-semibold text-sm flex-shrink-0">
                          {emp.fullName?.charAt(0) || '?'}
                        </div>
                        <div>
                          <div className="font-medium text-sm">{emp.fullName}</div>
                          <div className="text-xs text-gray-400">{emp.position || '-'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{emp.email || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{emp.department || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{branchName(emp.branchId)}</td>
                    <td className="px-6 py-4">{statusBadge(emp.status)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button onClick={() => router.push(`/employee/${emp.id}`)}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium">Profil</button>
                        <button onClick={() => { setMobilePassModal(emp); setMobilePassword('') }}
                          className="text-xs text-indigo-600 hover:text-indigo-800">📱 Mobil</button>
                        <button onClick={() => setPassive(emp.id)}
                          className="text-xs text-red-500 hover:text-red-700">Pasife Al</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobil kart listesi */}
          <div className="md:hidden space-y-2">
            {filtered.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-sm">Personel bulunamadı</div>
            ) : filtered.map(emp => (
              <div key={emp.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">
                      {emp.fullName?.charAt(0) || '?'}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-sm truncate">{emp.fullName}</div>
                      <div className="text-xs text-gray-400 truncate">{emp.position || '-'} · {emp.department || '-'}</div>
                      <div className="text-xs text-gray-400">{branchName(emp.branchId)}</div>
                    </div>
                  </div>
                  {statusBadge(emp.status)}
                </div>
                {emp.email && (
                  <div className="mt-2 text-xs text-gray-400 truncate">{emp.email}</div>
                )}
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex gap-3">
                  <button onClick={() => router.push(`/employee/${emp.id}`)}
                    className="flex-1 py-1.5 text-xs font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50">
                    Profil
                  </button>
                  <button onClick={() => { setMobilePassModal(emp); setMobilePassword('') }}
                    className="flex-1 py-1.5 text-xs font-medium text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50">
                    📱 Mobil Şifre
                  </button>
                  <button onClick={() => setPassive(emp.id)}
                    className="py-1.5 px-3 text-xs font-medium text-red-500 border border-red-100 rounded-lg hover:bg-red-50">
                    Pasife Al
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Mobil şifre modal */}
          {mobilePassModal && (
            <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-sm shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg">📱 Mobil Şifre</h3>
                  <button onClick={() => setMobilePassModal(null)} className="text-gray-400 text-xl">✕</button>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  <strong className="text-gray-700 dark:text-gray-300">{mobilePassModal.fullName}</strong> için mobil şifre belirleyin.
                </p>
                <input type="password" value={mobilePassword}
                  onChange={e => setMobilePassword(e.target.value)}
                  placeholder="En az 6 karakter"
                  className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2.5 text-sm mb-4" />
                <div className="flex gap-3">
                  <button onClick={() => setMobilePassModal(null)}
                    className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm">İptal</button>
                  <button onClick={setMobilePass}
                    className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium">Kaydet</button>
                </div>
              </div>
            </div>
          )}

          {/* Yeni personel modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-bold text-lg">Yeni Personel</h3>
                  <button onClick={() => setShowModal(false)} className="text-gray-400 text-xl">✕</button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Ad *</label>
                      <input required value={form.firstName}
                        onChange={e => setForm({...form, firstName: e.target.value})}
                        className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2.5 text-sm"
                        placeholder="Ali" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Soyad *</label>
                      <input required value={form.lastName}
                        onChange={e => setForm({...form, lastName: e.target.value})}
                        className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2.5 text-sm"
                        placeholder="Yılmaz" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Şube *</label>
                    <select required value={form.branchId}
                      onChange={e => setForm({...form, branchId: e.target.value})}
                      className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2.5 text-sm">
                      <option value="">Şube seçin</option>
                      {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Email</label>
                      <input type="email" value={form.email}
                        onChange={e => setForm({...form, email: e.target.value})}
                        className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2.5 text-sm"
                        placeholder="ali@firma.com" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Telefon</label>
                      <input value={form.phone}
                        onChange={e => setForm({...form, phone: e.target.value})}
                        className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2.5 text-sm"
                        placeholder="0555 000 00 00" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Departman</label>
                      <input value={form.department}
                        onChange={e => setForm({...form, department: e.target.value})}
                        className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2.5 text-sm"
                        placeholder="Yazılım" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Pozisyon</label>
                      <input value={form.position}
                        onChange={e => setForm({...form, position: e.target.value})}
                        className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2.5 text-sm"
                        placeholder="Developer" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">İşe Başlama Tarihi</label>
                    <input type="date" value={form.startDate}
                      onChange={e => setForm({...form, startDate: e.target.value})}
                      className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2.5 text-sm" />
                  </div>
                  <div className="flex gap-3 pt-1">
                    <button type="button" onClick={() => setShowModal(false)}
                      className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm">İptal</button>
                    <button type="submit"
                      className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium">Kaydet</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </Layout>
  )
}
