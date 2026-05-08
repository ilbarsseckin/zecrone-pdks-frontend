import { useState } from 'react'

export default function Login() {
  const [form, setForm] = useState({ tenantEmail: '', userEmail: '', password: '' })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res  = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      localStorage.setItem('pdks_token', data.token)
      localStorage.setItem('pdks_role',  data.role)
      window.location.href = '/dashboard'
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/30 mb-4">
            <span className="text-white font-black text-2xl">Z</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Zecrone</h1>
          <p className="text-slate-400 text-sm mt-1">Personel Devam Kontrol Sistemi</p>
        </div>

        {/* Kart */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl p-6 md:p-8">
          <h2 className="text-lg font-semibold text-white mb-6">Giriş Yap</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Firma E-posta</label>
              <input type="email" required
                value={form.tenantEmail}
                onChange={e => setForm({...form, tenantEmail: e.target.value})}
                placeholder="info@firmaniz.com"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 focus:bg-white/15 transition text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Kullanıcı E-posta</label>
              <input type="email" required
                value={form.userEmail}
                onChange={e => setForm({...form, userEmail: e.target.value})}
                placeholder="admin@firmaniz.com"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 focus:bg-white/15 transition text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Şifre</label>
              <input type="password" required
                value={form.password}
                onChange={e => setForm({...form, password: e.target.value})}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 focus:bg-white/15 transition text-sm" />
            </div>

            {error && (
              <div className="px-4 py-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-sm">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/25 disabled:opacity-60 disabled:cursor-not-allowed text-sm">
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a href="/hr/register" className="text-sm text-blue-400 hover:text-blue-300 transition">
              Hesabınız yok mu? Ücretsiz deneyin →
            </a>
          </div>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          © 2025 Zecrone · KVKK Uyumlu · SSL Korumalı
        </p>
      </div>
    </div>
  )
}
