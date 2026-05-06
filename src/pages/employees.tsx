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
  const [importing, setImporting]             = useState(false)
  const [form, setForm] = useState({
    branchId: '', firstName: '', lastName: '',
    email: '', phone: '', department: '', position: '', startDate: ''
  })

  const features = getPlanFeatures()
  const getToken = () => localStorage.getItem('pdks_token') || ''
  const authHdr  = () => ({ Authorization: `Bearer ${getToken()}` })

  const getTenantId = () => {
    try {
      return JSON.parse(atob(getToken().split('.')[1])).tenantId
    } catch { return '' }
  }

  const load = () => {
    Promise.all([
      fetch('http://localhost:8080/api/employees', { headers: authHdr() }).then(r => r.json()),
      fetch('http://localhost:8080/api/branches',  { headers: authHdr() }).then(r => r.json()),
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
    const res = await fetch('http://localhost:8080/api/employees', {
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
      alert(`Planınız en fazla ${features.maxEmployees} personele izin veriyor. Planınızı yükseltin.`)
      return
    }
    setShowModal(true)
  }

  const exportExcel = () => {
    if (!features.canExportExcel) {
      alert('Excel export Professional veya Enterprise planlarda kullanılabilir')
      return
    }
    fetch('http://localhost:8080/api/reports/employees/excel', {
      headers: { ...authHdr(), 'X-Tenant-Id': getTenantId() }
    }).then(r => r.blob()).then(blob => {
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = 'personel.xlsx'
      a.click()
    })
  }

  const downloadTemplate = () => {
    fetch('http://localhost:8080/api/reports/employees/template', {
      headers: authHdr()
    }).then(r => r.blob()).then(blob => {
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = 'personel_sablonu.xlsx'
      a.click()
    })
  }

  const importExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!features.canExportExcel) return
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch('http://localhost:8080/api/reports/employees/import', {
      method: 'POST',
      headers: { ...authHdr(), 'X-Tenant-Id': getTenantId() },
      body: formData
    })
    const data = await res.json()
    if (res.ok) { alert(data.message); load() }
    else alert(data.error)
    e.target.value = ''
    setImporting(false)
  }

  const setPassive = async (id: string) => {
    if (!confirm('Pasife almak istediğinize emin misiniz?')) return
    await fetch(`http://localhost:8080/api/employees/${id}/status?status=PASSIVE`, {
      method: 'PATCH', headers: authHdr()
    })
    load()
  }

  const setMobilePass = async () => {
    if (!mobilePassModal) return
    if (mobilePassword.length < 6) { alert('Şifre en az 6 karakter olmalı'); return }
    const res = await fetch(
      `http://localhost:8080/api/employees/${mobilePassModal.id}/set-mobile-password?password=${encodeURIComponent(mobilePassword)}`,
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

  const stats = {
    active:  employees.filter(e => e.status === 'ACTIVE').length,
    passive: employees.filter(e => e.status === 'PASSIVE').length,
    onLeave: employees.filter(e => e.status === 'ON_LEAVE').length,
  }

  return (
    <Layout>
      {loading ? (
        <div className="flex items-center justify-center h-64 text-gray-400">Yükleniyor...</div>
      ) : (
        <>
          {/* Başlık */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Personel Yönetimi</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {employees.length} / {features.maxEmployees === Infinity ? '∞' : features.maxEmployees} personel
              </p>
            </div>
            <div className="flex items-center gap-2">

              {/* Şablon İndir */}
              <button onClick={downloadTemplate}
                className="px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700">
                📋 Şablon İndir
              </button>

              {/* Excel Export */}
              <button onClick={exportExcel}
                className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 ${
                  features.canExportExcel
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800'
                }`}>
                {features.canExportExcel ? '📥' : '🔒'} Excel İndir
                {!features.canExportExcel && (
                  <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">Pro</span>
                )}
              </button>

              {/* Excel Import */}
              <label className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 ${
                features.canExportExcel
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800'
              }`}>
                {importing ? '⏳' : features.canExportExcel ? '📤' : '🔒'}
                {importing ? 'Yükleniyor...' : 'Excel Yükle'}
                {!features.canExportExcel && (
                  <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">Pro</span>
                )}
                {features.canExportExcel && (
                  <input type="file" accept=".xlsx" className="hidden" onChange={importExcel} disabled={importing} />
                )}
              </label>

              <button onClick={handleNewEmployee}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                + Yeni Personel
              </button>
            </div>
          </div>

          {/* Plan uyarısı */}
          {!features.canExportExcel && (
            <div className="mb-5 flex items-center justify-between bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl px-5 py-3">
              <div className="flex items-center gap-3">
                <span>🔒</span>
                <span className="text-sm text-amber-800 dark:text-amber-400">
                  Toplu personel import/export Professional ve Enterprise planlarda kullanılabilir
                </span>
              </div>
              <a href="/register" className="text-xs font-semibold text-blue-600 hover:text-blue-700 whitespace-nowrap">
                Planı Yükselt →
              </a>
            </div>
          )}

          {/* İstatistik kartları */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
              <div className="text-sm text-gray-500 mb-1">Aktif</div>
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
              <div className="text-sm text-gray-500 mb-1">İzinli</div>
              <div className="text-2xl font-bold text-amber-500">{stats.onLeave}</div>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
              <div className="text-sm text-gray-500 mb-1">Pasif</div>
              <div className="text-2xl font-bold text-gray-400">{stats.passive}</div>
            </div>
          </div>

          {/* Filtre ve arama */}
          <div className="flex items-center gap-3 mb-4">
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="İsim, sicil no, email veya departman ara..."
              className="flex-1 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm" />
            {['ALL', 'ACTIVE', 'ON_LEAVE', 'PASSIVE'].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                  filterStatus === s
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 hover:bg-gray-50'
                }`}>
                {s === 'ALL' ? 'Tümü' : s === 'ACTIVE' ? 'Aktif' : s === 'ON_LEAVE' ? 'İzinli' : 'Pasif'}
              </button>
            ))}
          </div>

          {/* Tablo */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
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
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold text-sm flex-shrink-0">
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
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        emp.status === 'ACTIVE'   ? 'bg-green-100 text-green-700' :
                        emp.status === 'ON_LEAVE' ? 'bg-amber-100 text-amber-700' :
                                                    'bg-gray-100 text-gray-500'
                      }`}>
                        {emp.status === 'ACTIVE' ? 'Aktif' : emp.status === 'ON_LEAVE' ? 'İzinli' : 'Pasif'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button onClick={() => router.push(`/employee/${emp.id}`)}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                          Profil
                        </button>
                        <button onClick={() => { setMobilePassModal(emp); setMobilePassword('') }}
                          className="text-xs text-indigo-600 hover:text-indigo-800">
                          📱 Mobil
                        </button>
                        <button onClick={() => setPassive(emp.id)}
                          className="text-xs text-red-500 hover:text-red-700">
                          Pasife Al
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobil şifre modal */}
          {mobilePassModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-sm shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg">📱 Mobil Şifre Belirle</h3>
                  <button onClick={() => setMobilePassModal(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  <strong className="text-gray-700 dark:text-gray-300">{mobilePassModal.fullName}</strong> için mobil uygulama şifresi belirleyin.
                </p>
                <input type="password" value={mobilePassword}
                  onChange={e => setMobilePassword(e.target.value)}
                  placeholder="En az 6 karakter"
                  className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm mb-4" />
                <div className="flex gap-3">
                  <button onClick={() => setMobilePassModal(null)}
                    className="flex-1 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm hover:bg-gray-50">
                    İptal
                  </button>
                  <button onClick={setMobilePass}
                    className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 font-medium">
                    Kaydet
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Yeni personel modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-lg shadow-xl">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-bold text-lg">Yeni Personel Ekle</h3>
                  <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Ad *</label>
                      <input required value={form.firstName}
                        onChange={e => setForm({...form, firstName: e.target.value})}
                        className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm"
                        placeholder="Ali" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Soyad *</label>
                      <input required value={form.lastName}
                        onChange={e => setForm({...form, lastName: e.target.value})}
                        className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm"
                        placeholder="Yılmaz" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Şube *</label>
                    <select required value={form.branchId}
                      onChange={e => setForm({...form, branchId: e.target.value})}
                      className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm">
                      <option value="">Şube seçin</option>
                      {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Email</label>
                      <input type="email" value={form.email}
                        onChange={e => setForm({...form, email: e.target.value})}
                        className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm"
                        placeholder="ali@firma.com" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Telefon</label>
                      <input value={form.phone}
                        onChange={e => setForm({...form, phone: e.target.value})}
                        className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm"
                        placeholder="0555 000 00 00" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Departman</label>
                      <input value={form.department}
                        onChange={e => setForm({...form, department: e.target.value})}
                        className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm"
                        placeholder="Yazılım" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Pozisyon</label>
                      <input value={form.position}
                        onChange={e => setForm({...form, position: e.target.value})}
                        className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm"
                        placeholder="Developer" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">İşe Başlama Tarihi</label>
                    <input type="date" value={form.startDate}
                      onChange={e => setForm({...form, startDate: e.target.value})}
                      className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm" />
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
        </>
      )}
    </Layout>
  )
}
