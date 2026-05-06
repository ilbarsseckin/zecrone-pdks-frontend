import { useState } from 'react'
import Layout from '../components/Layout'

export default function Settings() {
  const [saved, setSaved] = useState(false)
  const [profile, setProfile] = useState({
    companyName: 'Demo Firma A.Ş.',
    contactEmail: 'admin@demo.com',
    contactPhone: '',
  })
  const [password, setPassword] = useState({
    current: '', newPass: '', confirm: ''
  })
  const [pwError, setPwError] = useState('')

  const saveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const savePassword = (e: React.FormEvent) => {
    e.preventDefault()
    if (password.newPass !== password.confirm) {
      setPwError('Yeni şifreler eşleşmiyor')
      return
    }
    if (password.newPass.length < 8) {
      setPwError('Şifre en az 8 karakter olmalı')
      return
    }
    setPwError('')
    setPassword({ current: '', newPass: '', confirm: '' })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <Layout>
      <div className="max-w-2xl">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Ayarlar</h2>
          <p className="text-sm text-gray-500">Firma ve hesap ayarları</p>
        </div>

        {saved && (
          <div className="mb-4 px-4 py-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg text-sm border border-green-200 dark:border-green-800">
            ✓ Değişiklikler kaydedildi
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
              <input type="email" value={profile.contactEmail}
                onChange={e => setProfile({ ...profile, contactEmail: e.target.value })}
                className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm" />
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
            {pwError && (
              <div className="text-red-500 text-sm">{pwError}</div>
            )}
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
            <button
              onClick={() => {
                document.documentElement.classList.remove('dark')
                localStorage.setItem('pdks_theme', 'light')
              }}
              className="flex-1 py-3 border border-gray-200 dark:border-gray-700 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-center gap-2">
              ☀️ Açık Tema
            </button>
            <button
              onClick={() => {
                document.documentElement.classList.add('dark')
                localStorage.setItem('pdks_theme', 'dark')
              }}
              className="flex-1 py-3 border border-gray-200 dark:border-gray-700 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-center gap-2">
              🌙 Koyu Tema
            </button>
          </div>
        </div>

        {/* Sistem Bilgisi */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Sistem Bilgisi</h3>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex justify-between">
              <span>Versiyon</span>
              <span className="font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span>Backend</span>
              <span className="font-medium">Spring Boot 3.2</span>
            </div>
            <div className="flex justify-between">
              <span>Frontend</span>
              <span className="font-medium">Next.js 14</span>
            </div>
            <div className="flex justify-between">
              <span>Veritabanı</span>
              <span className="font-medium">PostgreSQL 16</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
