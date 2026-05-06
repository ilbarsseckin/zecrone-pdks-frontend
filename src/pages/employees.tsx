import { useEffect, useState } from 'react'
import Layout from '../components/Layout'

interface Employee {
  id: string
  fullName: string
  email: string
  department: string
  position: string
  status: string
}

interface Branch {
  id: string
  name: string
}

export default function Employees() {
  const [employees, setEmployees]       = useState<Employee[]>([])
  const [branches, setBranches]         = useState<Branch[]>([])
  const [loading, setLoading]           = useState(true)
  const [showModal, setShowModal]       = useState(false)
  const [mobilePassModal, setMobilePassModal] = useState<Employee | null>(null)
  const [mobilePassword, setMobilePassword]   = useState('')
  const [form, setForm] = useState({
    branchId: '', firstName: '', lastName: '',
    email: '', phone: '', department: '', position: '', startDate: ''
  })

  const getToken = () => localStorage.getItem('pdks_token') || ''

  const load = () => {
    const h = { Authorization: `Bearer ${getToken()}` }
    Promise.all([
      fetch('http://localhost:8080/api/employees', { headers: h }).then(r => r.json()),
      fetch('http://localhost:8080/api/branches',  { headers: h }).then(r => r.json()),
    ]).then(([emps, brs]) => {
      setEmployees(emps)
      setBranches(brs)
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
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify(form)
    })
    if (res.ok) { setShowModal(false); load() }
    else { const d = await res.json(); alert(d.error) }
  }

  const setPassive = async (id: string) => {
    if (!confirm('Pasife almak istediğinize emin misiniz?')) return
    await fetch(`http://localhost:8080/api/employees/${id}/status?status=PASSIVE`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${getToken()}` }
    })
    load()
  }

  const setMobilePass = async () => {
    if (!mobilePassModal) return
    if (mobilePassword.length < 6) { alert('Şifre en az 6 karakter olmalı'); return }
    const res = await fetch(
      `http://localhost:8080/api/employees/${mobilePassModal.id}/set-mobile-password?password=${encodeURIComponent(mobilePassword)}`,
      { method: 'POST', headers: { Authorization: `Bearer ${getToken()}` } }
    )
    if (res.ok) {
      alert(`${mobilePassModal.fullName} için mobil şifre belirlendi.`)
      setMobilePassModal(null)
      setMobilePassword('')
    } else {
      const d = await res.json()
      alert(d.error)
    }
  }

  return (
    <Layout>
      {loading ? (
        <div className="flex items-center justify-center h-64 text-gray-400">Yükleniyor...</div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Personel Yönetimi</h2>
              <p className="text-sm text-gray-500 mt-0.5">{employees.length} personel kayıtlı</p>
            </div>
            <button onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
              + Yeni Personel
            </button>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 uppercase">
                  <th className="px-6 py-3 text-left">Ad Soyad</th>
                  <th className="px-6 py-3 text-left">Email</th>
                  <th className="px-6 py-3 text-left">Departman</th>
                  <th className="px-6 py-3 text-left">Pozisyon</th>
                  <th className="px-6 py-3 text-left">Durum</th>
                  <th className="px-6 py-3 text-left">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {employees.map(emp => (
                  <tr key={emp.id} className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-6 py-4 font-medium">{emp.fullName}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{emp.email || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{emp.department || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{emp.position || '-'}</td>
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
                        <button
                          onClick={() => { setMobilePassModal(emp); setMobilePassword('') }}
                          className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                          title="Mobil uygulama şifresi belirle">
                          📱 Mobil Şifre
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
                  <span className="font-medium text-gray-700 dark:text-gray-300">{mobilePassModal.fullName}</span> için
                  mobil uygulama giriş şifresi belirleyin.
                </p>
                <input type="password" value={mobilePassword}
                  onChange={e => setMobilePassword(e.target.value)}
                  placeholder="En az 6 karakter"
                  className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm mb-4" />
                <div className="flex gap-3">
                  <button onClick={() => setMobilePassModal(null)}
                    className="flex-1 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800">
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
                      <label className="block text-sm font-medium mb-1">Ad</label>
                      <input required value={form.firstName}
                        onChange={e => setForm({...form, firstName: e.target.value})}
                        className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm"
                        placeholder="Ali" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Soyad</label>
                      <input required value={form.lastName}
                        onChange={e => setForm({...form, lastName: e.target.value})}
                        className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm"
                        placeholder="Yılmaz" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Şube</label>
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
