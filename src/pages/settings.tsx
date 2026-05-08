import { useEffect, useState } from 'react'
import Layout from '../components/Layout'

export default function Settings() {
  const [saved, setSaved]   = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState('')
  const [profile, setProfile] = useState({
    companyName: '',
    contactEmail: '',
    contactPhone: '',
  })
  const [password, setPassword] = useState({
    current: '', newPass: '', confirm: ''
  })
  const [pwError, setPwError]   = useState('')
  const [pwSaved, setPwSaved]   = useState(false)

  const token   = () => localStorage.getItem('pdks_token') || ''
  const headers = () => ({ Authorization: `Bearer ${token()}` })

  useEffect(() => {
    if (!localStorage.getItem('pdks_token')) { window.location.href = '/'; return }
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/tenants/me`, { headers: headers() })
      .then(r => r.json())
      .then(data => {
        setProfile({
          companyName:  data.companyName  || '',
          contactEmail: data.contactEmail || '',
          contactPhone: data.contactPhone || '',
        })
        setLoading(false)
      })
  }, [])

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/tenants/me`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...headers() },
      body: JSON.stringify({
        companyName:  profile.companyName,
        contactPhone: profile.contactPhone,
      })
    })
    if (res.ok) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } else {
      const d = await res.json()
      setError(d.error || 'Kayıt başarısız')
    }
  }

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwError('')
    if (password.newPass !== password.confirm) { setPwError('Yeni şifreler eşleşmiyor'); return }
    if (password.newPass.length < 8) { setPwError('Şifre en az 8 karakter olmalı'); return }

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/auth/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers() },
      body: JSON.stringify({
        currentPassword: password.current,
        newPassword:     password.newPass,
      })
    })
    if (res.ok) {
      setPassword({ current: '', newPass: '', confirm: '' })
      setPwSaved(true)
      setTimeout(() => setPwSaved(false), 2000)
    } else {
      const d = await res.json()
      setPwError(d.error || 'Şifre değiştirilemedi')
    }
  }

  return (
    <Layout>
      <div className="max-w-2xl">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Ayarlar</h2>
          <p className="text-sm text-gray-500">Firma ve hesap ayarları</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40 text-gray-400">Yükleniyor...</div>
        ) : (
          <>
            {saved && (
              <div className="mb-4 px-4 py-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg text-sm border border-green-200 dark:border-green-800">
                ✓ Firma bilgileri güncellendi
              </div>
            )}
            {error && (
              <div className="mb-4 px-4 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg text-sm border border-red-200">
                ⚠️ {error}
              </div>
            )}

            {/* Firma Bilgileri */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 mb-6">
              <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Firma Bilgileri</h3>
              <form onSubmit={saveProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Firma Adı</label>
                  <input value={profile.companyName}
                    onChange={e => setProfile({ ...profile, companyName: e.target.value })}
                    className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">İletişim Email</label>
                  <input type="email" value={profile.contactEmail} disabled
                    className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm opacity-60 cursor-not-allowed" />
                  <p className="text-xs text-gray-400 mt-1">Email değiştirilemez</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Telefon</label>
                  <input value={profile.contactPhone}
                    onChange={e => setProfile({ ...profile, contactPhone: e.target.value })}
                    className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm"
                    placeholder="0212 000 00 00" />
                </div>
                <button type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                  Kaydet
                </button>
              </form>
            </div>

            {/* Şifre Değiştir */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 mb-6">
              <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Şifre Değiştir</h3>
              {pwSaved && (
                <div className="mb-4 px-4 py-3 bg-green-50 dark:bg-green-900/20 text-green-700 rounded-lg text-sm border border-green-200">
                  ✓ Şifre güncellendi
                </div>
              )}
              <form onSubmit={savePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Mevcut Şifre</label>
                  <input type="password" value={password.current}
                    onChange={e => setPassword({ ...password, current: e.target.value })}
                    className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Yeni Şifre</label>
                  <input type="password" value={password.newPass}
                    onChange={e => setPassword({ ...password, newPass: e.target.value })}
                    className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Yeni Şifre (Tekrar)</label>
                  <input type="password" value={password.confirm}
                    onChange={e => setPassword({ ...password, confirm: e.target.value })}
                    className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm" />
                </div>
                {pwError && <div className="text-red-500 text-sm">⚠️ {pwError}</div>}
                <button type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                  Şifreyi Güncelle
                </button>
              </form>
            </div>

            {/* Tema */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 mb-6">
              <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Görünüm</h3>
              <div className="flex gap-3">
                <button onClick={() => { document.documentElement.classList.remove('dark'); localStorage.setItem('pdks_theme', 'light') }}
                  className="flex-1 py-3 border border-gray-200 dark:border-gray-700 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-center gap-2">
                  ☀️ Açık Tema
                </button>
                <button onClick={() => { document.documentElement.classList.add('dark'); localStorage.setItem('pdks_theme', 'dark') }}
                  className="flex-1 py-3 border border-gray-200 dark:border-gray-700 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-center gap-2">
                  🌙 Koyu Tema
                </button>
              </div>
            </div>

            {/* Sistem Bilgisi */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
              <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Sistem Bilgisi</h3>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                {[
                  { label: 'Versiyon',   value: '1.0.0' },
                  { label: 'Backend',    value: 'Spring Boot 3.2' },
                  { label: 'Frontend',   value: 'Next.js 14' },
                  { label: 'Veritabanı', value: 'PostgreSQL 16' },
                ].map(item => (
                  <div key={item.label} className="flex justify-between">
                    <span>{item.label}</span>
                    <span className="font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  )
}
