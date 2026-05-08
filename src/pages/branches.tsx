import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { getPlanFeatures } from '../api/index'

interface Branch {
  id: string
  name: string
  city: string
  workStart: string
  workEnd: string
  lateTolerance: number
  timezone: string
  phone: string
}

export default function Branches() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    name: '', city: '', address: '', phone: '',
    workStart: '08:00', workEnd: '17:00',
    lateTolerance: 5, timezone: 'Europe/Istanbul'
  })

  const features = getPlanFeatures()
  const getToken = () => localStorage.getItem('pdks_token') || ''

  const load = () => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/branches`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    }).then(r => r.json()).then(data => {
      setBranches(Array.isArray(data) ? data : [])
      setLoading(false)
    })
  }

  useEffect(() => {
    if (!localStorage.getItem('pdks_token')) { window.location.href = '/'; return }
    load()
  }, [])

  const handleNewBranch = () => {
    if (features.maxBranches !== Infinity && branches.length >= features.maxBranches) {
      alert(`Planınız en fazla ${features.maxBranches} şubeye izin veriyor. Planınızı yükseltin.`)
      return
    }
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/branches`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify(form)
    })
    if (res.ok) {
      setShowModal(false)
      setForm({ name: '', city: '', address: '', phone: '', workStart: '08:00', workEnd: '17:00', lateTolerance: 5, timezone: 'Europe/Istanbul' })
      load()
    } else {
      const d = await res.json()
      alert(d.error)
    }
  }

  const deleteBranch = async (id: string) => {
    if (!confirm('Şubeyi silmek istediğinize emin misiniz?')) return
    await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/branches/${id}`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${getToken()}` }
    })
    load()
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
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Şube Yönetimi</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {branches.length} / {features.maxBranches === Infinity ? '∞' : features.maxBranches} şube
                </p>
              </div>
              <button onClick={handleNewBranch}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                + Yeni Şube
              </button>
            </div>

            {features.maxBranches !== Infinity && branches.length >= features.maxBranches && (
              <div className="mb-5 flex items-center justify-between bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl px-5 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-xl">⚠️</span>
                  <span className="text-sm text-amber-800 dark:text-amber-400">
                    Şube limitine ulaştınız ({features.maxBranches} şube). Daha fazla şube eklemek için planınızı yükseltin.
                  </span>
                </div>
                <a href="/register" className="text-xs font-semibold text-blue-600 hover:text-blue-700 whitespace-nowrap">
                  Planı Yükselt →
                </a>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4">
              {branches.map(branch => (
                <div key={branch.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-gray-100">{branch.name}</h3>
                      <p className="text-sm text-gray-500 mt-0.5">{branch.city || '-'}</p>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Aktif</span>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex justify-between">
                      <span>Mesai</span>
                      <span className="font-medium">{branch.workStart?.slice(0,5)} - {branch.workEnd?.slice(0,5)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tolerans</span>
                      <span className="font-medium">{branch.lateTolerance} dk</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Saat Dilimi</span>
                      <span className="font-medium">{branch.timezone}</span>
                    </div>
                    {branch.phone && (
                      <div className="flex justify-between">
                        <span>Telefon</span>
                        <span className="font-medium">{branch.phone}</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex gap-2">
                    <button onClick={() => deleteBranch(branch.id)}
                      className="flex-1 py-1.5 text-xs text-red-500 border border-red-100 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                      Sil
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {showModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-lg shadow-xl">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-bold text-lg">Yeni Şube Ekle</h3>
                    <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
                  </div>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Şube Adı *</label>
                        <input required value={form.name}
                          onChange={e => setForm({...form, name: e.target.value})}
                          className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm"
                          placeholder="İstanbul Şubesi" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Şehir</label>
                        <input value={form.city}
                          onChange={e => setForm({...form, city: e.target.value})}
                          className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm"
                          placeholder="İstanbul" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Mesai Başlangıç</label>
                        <input type="time" value={form.workStart}
                          onChange={e => setForm({...form, workStart: e.target.value})}
                          className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Mesai Bitiş</label>
                        <input type="time" value={form.workEnd}
                          onChange={e => setForm({...form, workEnd: e.target.value})}
                          className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Geç Kalma Toleransı (dk)</label>
                        <input type="number" value={form.lateTolerance}
                          onChange={e => setForm({...form, lateTolerance: parseInt(e.target.value)})}
                          className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm"
                          min={0} max={60} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Telefon</label>
                        <input value={form.phone}
                          onChange={e => setForm({...form, phone: e.target.value})}
                          className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm"
                          placeholder="0212 000 00 00" />
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
        )}
      </div>
    </Layout>
  )
}