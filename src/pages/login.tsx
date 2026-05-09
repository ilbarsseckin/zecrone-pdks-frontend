import { useState } from 'react'

export default function Login() {
  const [form, setForm] = useState({
    tenantEmail: '',
    userEmail: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error)

      localStorage.setItem('pdks_token', data.token)
      localStorage.setItem('pdks_role', data.role)

      window.location.href = '/dashboard'
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f5f5f5',
      fontFamily: 'sans-serif'
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ marginBottom: '8px', fontSize: '24px' }}>Zecrone</h1>
        <p style={{ color: '#666', marginBottom: '32px' }}>
          Personel Devam Kontrol Sistemi
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px' }}>
              Firma Email
            </label>
            <input
              type="email"
              value={form.tenantEmail}
              onChange={e => setForm({...form, tenantEmail: e.target.value})}
              placeholder="admin@demo.com"
              required
              style={{
                width: '100%', padding: '10px 12px',
                border: '1px solid #ddd', borderRadius: '8px',
                fontSize: '14px', boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px' }}>
              Kullanıcı Email
            </label>
            <input
              type="email"
              value={form.userEmail}
              onChange={e => setForm({...form, userEmail: e.target.value})}
              placeholder="admin@demo.com"
              required
              style={{
                width: '100%', padding: '10px 12px',
                border: '1px solid #ddd', borderRadius: '8px',
                fontSize: '14px', boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px' }}>
              Şifre
            </label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm({...form, password: e.target.value})}
              placeholder="admin123"
              required
              style={{
                width: '100%', padding: '10px 12px',
                border: '1px solid #ddd', borderRadius: '8px',
                fontSize: '14px', boxSizing: 'border-box'
              }}
            />
          </div>

          {error && (
            <div style={{
              background: '#fff0f0', color: '#c00',
              padding: '10px 12px', borderRadius: '8px',
              marginBottom: '16px', fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '12px',
              background: '#2563eb', color: 'white',
              border: 'none', borderRadius: '8px',
              fontSize: '16px', cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>
      </div>
    </div>
  )
}