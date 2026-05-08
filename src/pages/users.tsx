import { useEffect, useState } from 'react'
import Layout from '../components/Layout'

const ROLES: Record<string, { label: string; color: string }> = {
  ADMIN:   { label: 'Admin',   color: 'bg-purple-100 text-purple-700' },
  MANAGER: { label: 'Müdür',   color: 'bg-blue-100 text-blue-700' },
  STAFF:   { label: 'Personel', color: 'bg-gray-100 text-gray-700' },
}

export default function Users() {
  const [users, setUsers] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [branches, setBranches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    email: '', password: '', role: 'STAFF',
    branchId: '', employeeId: ''
  })

  const token = () => localStorage.getItem('pdks_token') || ''
  const headers = () => ({ Authorization: `Bearer ${token()}` })

  const load = () => {
    Promise.all([
      fetch('h${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/users', { headers: headers() }).then(r => r.json()),
      fetch('h${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/employees', { headers: headers() }).then(r => r.json()),
      fetch('h${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/branches', { headers: headers() }).then(r => r.json()),
    ]).then(([u, e, b]) => {
      setUsers(Array.isArray(u) ? u : [])
      setEmployees(Array.isArray(e) ? e : [])
      setBranches(Array.isArray(b) ? b : [])
      setLoading(false)
    })
  }

  useEffect(() => {
    if (!localStorage.getItem('pdks_token')) { window.location.href = '/'; return }
    load()
  }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const body: any = {
      email: form.email,
      password: form.password,
      role: form.role,
    }
    if (form.branchId) body.branchId = form.branchId
    if (form.employeeId) body.employeeId = form.employeeId

    const res = await fetch('h${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers() },
      body: JSON.stringify(body)
    })
    if (res.ok) {
      setShowModal(false)
      setForm({ email: '', password: '', role: 'STAFF', branchId: '', employeeId: '' })
      load()
    } else {
      const d = await res.json()
      alert(d.error)
    }
  }

  const toggleActive = async (id: string, current: boolean) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'h${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}'}/api/users/${id}/status?active=${!current}`, {
      method: 'PATCH', headers: headers()
    })
    load()
  }

  const empName = (id: string) => employees.find(e => e.id === id)?.fullName || '-'
  const branchName = (id: string) => branches.find(b => b.id === id)?.name || 'Tüm Şubeler'

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
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Kullanıcı Yönetimi</h2>
            <p className="text-sm text-gray-500">{users.length} kullanıcı kayıtlı</p>
          </div>
          <button onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
            + Yeni Kullanıcı
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {Object.entries(ROLES).map(([key, val]) => (
            <div key={key} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
              <div className="text-sm text-gray-500 mb-1">{val.label}</div>
              <div className="text-3xl font-bold">{users.filter(u => u.role === key).length}</div>
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 uppercase">
                <th className="px-6 py-3 text-left">Email</th>
                <th className="px-6 py-3 text-left">Rol</th>
                <th className="px-6 py-3 text-left">Şube</th>
                <th className="px-6 py-3 text-left">Bağlı Personel</th>
                <th className="px-6 py-3 text-left">Son Giriş</th>
                <th className="px-6 py-3 text-left">Durum</th>
                <th className="px-6 py-3 text-left">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-400">Kullanıcı bulunamadı</td>
                </tr>
              ) : users.map((u: any) => (
                <tr key={u.id} className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-6 py-4 font-medium text-sm">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${ROLES[u.role]?.color}`}>
                      {ROLES[u.role]?.label || u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{u.branchId ? branchName(u.branchId) : 'Tüm Şubeler'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{u.employeeId ? empName(u.employeeId) : '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {u.lastLogin ? new Date(u.lastLogin).toLocaleString('tr-TR') : 'Hiç girmedi'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {u.isActive ? 'Aktif' : 'Pasif'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => toggleActive(u.id, u.isActive)}
                      className={`text-xs px-3 py-1 rounded-lg ${
                        u.isActive
                          ? 'text-red-500 border border-red-100 hover:bg-red-50'
                          : 'text-green-600 border border-green-100 hover:bg-green-50'
                      }`}>
                      {u.isActive ? 'Pasife Al' : 'Aktive Et'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-lg shadow-xl">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-lg">Yeni Kullanıcı Ekle</h3>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
              </div>
              <form onSubmit={submit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input type="email" required value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm"
                    placeholder="ali@firma.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Şifre</label>
                  <input type="password" required value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm"
                    placeholder="En az 8 karakter" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Rol</label>
                  <select value={form.role}
                    onChange={e => setForm({ ...form, role: e.target.value })}
                    className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm">
                    <option value="ADMIN">Admin</option>
                    <option value="MANAGER">Müdür</option>
                    <option value="STAFF">Personel</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Şube (opsiyonel)</label>
                  <select value={form.branchId}
                    onChange={e => setForm({ ...form, branchId: e.target.value })}
                    className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm">
                    <option value="">Tüm şubeler</option>
                    {branches.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Bağlı Personel (opsiyonel)</label>
                  <select value={form.employeeId}
                    onChange={e => setForm({ ...form, employeeId: e.target.value })}
                    className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm">
                    <option value="">Seçin</option>
                    {employees.map((e: any) => <option key={e.id} value={e.id}>{e.fullName}</option>)}
                  </select>
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
