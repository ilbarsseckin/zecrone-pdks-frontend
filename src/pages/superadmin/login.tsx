import { useState } from 'react'
import { useRouter } from 'next/router'

export default function SuperAdminLogin() {
  const router = useRouter()
  const [email, setEmail]       = useState('superadmin@zecrone.com')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`,{
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantEmail: email,
          userEmail: email,
          password
        })
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Giriş başarısız')
      if (data.role !== 'SUPER_ADMIN') throw new Error('Yetkisiz erişim')

      localStorage.setItem('sa_token', data.token)
      router.push('/superadmin/dashboard')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#0f172a',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'sans-serif'
    }}>
      <div style={{
        background: '#1e293b', border: '1px solid #334155',
        borderRadius: 16, padding: 40, width: '100%', maxWidth: 400,
        boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 48, height: 48, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', fontSize: 24
          }}>⚡</div>
          <h1 style={{ color: 'white', fontSize: 22, fontWeight: 700, margin: 0 }}>
            Zecrone Admin
          </h1>
          <p style={{ color: '#64748b', fontSize: 13, marginTop: 6 }}>
            Super Admin Paneli
          </p>
        </div>

        {error && (
          <div style={{
            background: '#450a0a', border: '1px solid #7f1d1d',
            borderRadius: 8, padding: '10px 14px',
            fontSize: 13, color: '#fca5a5', marginBottom: 20
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 6, fontWeight: 600 }}>
              EMAIL
            </label>
            <input type="email" value={email}
              onChange={e => setEmail(e.target.value)}
              style={{
                width: '100%', padding: '10px 14px',
                background: '#0f172a', border: '1px solid #334155',
                borderRadius: 8, color: 'white', fontSize: 14,
                boxSizing: 'border-box' as const
              }} />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 6, fontWeight: 600 }}>
              ŞİFRE
            </label>
            <input type="password" value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{
                width: '100%', padding: '10px 14px',
                background: '#0f172a', border: '1px solid #334155',
                borderRadius: 8, color: 'white', fontSize: 14,
                boxSizing: 'border-box' as const
              }} />
          </div>

          <button type="submit" disabled={loading}
            style={{
              width: '100%', padding: '12px',
              background: loading ? '#4338ca' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: 'white', border: 'none', borderRadius: 8,
              fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer'
            }}>
            {loading ? '⏳ Giriş yapılıyor...' : '⚡ Giriş Yap'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <a href="/" style={{ fontSize: 12, color: '#475569', textDecoration: 'none' }}>
            ← Kullanıcı girişine dön
          </a>
        </div>
      </div>
    </div>
  )
}
