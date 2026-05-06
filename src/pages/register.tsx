import { useState } from 'react'

export default function Register() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [form, setForm] = useState({
    companyName: '',
    contactEmail: '',
    contactPhone: '',
    plan: 'STARTER',
    adminPassword: '',
  })

  const plans = [
    {
      key: 'STARTER',
      label: 'Starter',
      price: '₺499/ay',
      features: ['3 şube', '50 personel', 'Temel raporlar', 'Email destek'],
      border: 'border-gray-200 dark:border-gray-700',
      badge: '',
    },
    {
      key: 'PROFESSIONAL',
      label: 'Professional',
      price: '₺1.499/ay',
      features: ['20 şube', '500 personel', 'Excel export', 'QR kod', 'Öncelikli destek'],
      border: 'border-blue-500',
      badge: 'Popüler',
    },
    {
      key: 'ENTERPRISE',
      label: 'Enterprise',
      price: 'Özel fiyat',
      features: ['Sınırsız şube', 'Sınırsız personel', 'API erişimi', 'Özel entegrasyon', '7/24 destek'],
      border: 'border-purple-500',
      badge: '',
    },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (form.adminPassword.length < 8) {
      setError('Şifre en az 8 karakter olmalı')
      return
    }
    if (form.adminPassword !== passwordConfirm) {
      setError('Şifreler eşleşmiyor')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('http://localhost:8080/api/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Kayıt başarısız')
      setResult(data)
      setStep(3)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa', fontFamily: 'sans-serif' }}>

      {/* Header */}
      <div style={{
        background: 'white', borderBottom: '1px solid #e5e7eb',
        padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <span style={{ fontWeight: 700, fontSize: 20, color: '#2563eb' }}>PDKS</span>
        <a href="/" style={{ fontSize: 14, color: '#6b7280', textDecoration: 'none' }}>
          Zaten hesabınız var mı? Giriş Yap →
        </a>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 16px' }}>

        {/* Adım göstergesi */}
        {step < 3 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 40 }}>
            {['Plan Seç', 'Firma Bilgileri', 'Tamamlandı'].map((label, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700,
                  background: step > i + 1 ? '#16a34a' : step === i + 1 ? '#2563eb' : '#e5e7eb',
                  color: step >= i + 1 ? 'white' : '#9ca3af',
                }}>
                  {step > i + 1 ? '✓' : i + 1}
                </div>
                <span style={{
                  fontSize: 14, fontWeight: 500,
                  color: step === i + 1 ? '#1f2937' : '#9ca3af'
                }}>
                  {label}
                </span>
                {i < 2 && <div style={{ width: 40, height: 1, background: '#e5e7eb' }} />}
              </div>
            ))}
          </div>
        )}

        {/* Adım 1: Plan seç */}
        {step === 1 && (
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, textAlign: 'center', marginBottom: 8 }}>Plan Seçin</h1>
            <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: 32 }}>İhtiyacınıza uygun planı seçin</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 32 }}>
              {plans.map(plan => (
                <div key={plan.key}
                  onClick={() => setForm({ ...form, plan: plan.key })}
                  style={{
                    background: 'white', borderRadius: 12, padding: 20, cursor: 'pointer',
                    border: form.plan === plan.key ? '2px solid #2563eb' : '2px solid #e5e7eb',
                    boxShadow: form.plan === plan.key ? '0 4px 12px rgba(37,99,235,0.15)' : 'none',
                    position: 'relative', transition: 'all .15s',
                  }}>
                  {plan.badge && (
                    <div style={{
                      position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                      background: '#2563eb', color: 'white', fontSize: 11,
                      padding: '3px 12px', borderRadius: 20, fontWeight: 600,
                    }}>
                      {plan.badge}
                    </div>
                  )}
                  <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{plan.label}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#2563eb', marginBottom: 16 }}>{plan.price}</div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {plan.features.map(f => (
                      <li key={f} style={{ fontSize: 13, color: '#4b5563', marginBottom: 6, display: 'flex', gap: 6 }}>
                        <span style={{ color: '#16a34a' }}>✓</span> {f}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button onClick={() => setStep(2)} style={{
                padding: '12px 40px', background: '#2563eb', color: 'white',
                border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: 'pointer',
              }}>
                Devam Et →
              </button>
            </div>
          </div>
        )}

        {/* Adım 2: Firma bilgileri */}
        {step === 2 && (
          <div style={{
            background: 'white', borderRadius: 16, border: '1px solid #e5e7eb', padding: 40,
          }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Firma Bilgileri</h1>
            <p style={{ color: '#6b7280', marginBottom: 24, fontSize: 14 }}>
              Seçilen plan:{' '}
              <span style={{ fontWeight: 600, color: '#2563eb' }}>
                {plans.find(p => p.key === form.plan)?.label}
              </span>
            </p>

            {error && (
              <div style={{
                background: '#fef2f2', border: '1px solid #fecaca',
                color: '#dc2626', padding: '10px 14px', borderRadius: 8,
                fontSize: 13, marginBottom: 16,
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                  Firma Adı *
                </label>
                <input required value={form.companyName}
                  onChange={e => setForm({ ...form, companyName: e.target.value })}
                  style={{
                    width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb',
                    borderRadius: 8, fontSize: 14, boxSizing: 'border-box',
                  }}
                  placeholder="Şirket A.Ş." />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                  Email *
                </label>
                <input type="email" required value={form.contactEmail}
                  onChange={e => setForm({ ...form, contactEmail: e.target.value })}
                  style={{
                    width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb',
                    borderRadius: 8, fontSize: 14, boxSizing: 'border-box',
                  }}
                  placeholder="info@sirket.com" />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                  Telefon
                </label>
                <input value={form.contactPhone}
                  onChange={e => setForm({ ...form, contactPhone: e.target.value })}
                  style={{
                    width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb',
                    borderRadius: 8, fontSize: 14, boxSizing: 'border-box',
                  }}
                  placeholder="0212 000 00 00" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                    Şifre *
                  </label>
                  <input type="password" required value={form.adminPassword}
                    onChange={e => setForm({ ...form, adminPassword: e.target.value })}
                    style={{
                      width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb',
                      borderRadius: 8, fontSize: 14, boxSizing: 'border-box',
                    }}
                    placeholder="En az 8 karakter" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                    Şifre Tekrar *
                  </label>
                  <input type="password" required value={passwordConfirm}
                    onChange={e => setPasswordConfirm(e.target.value)}
                    style={{
                      width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb',
                      borderRadius: 8, fontSize: 14, boxSizing: 'border-box',
                    }}
                    placeholder="Şifreyi tekrar girin" />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <button type="button" onClick={() => { setStep(1); setError('') }}
                  style={{
                    flex: 1, padding: '12px', border: '1px solid #e5e7eb',
                    borderRadius: 8, fontSize: 14, cursor: 'pointer', background: 'white',
                  }}>
                  ← Geri
                </button>
                <button type="submit" disabled={loading}
                  style={{
                    flex: 1, padding: '12px', background: loading ? '#93c5fd' : '#2563eb',
                    color: 'white', border: 'none', borderRadius: 8,
                    fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
                  }}>
                  {loading ? 'Kaydediliyor...' : 'Kaydı Tamamla →'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Adım 3: Tamamlandı */}
        {step === 3 && result && (
          <div style={{
            background: 'white', borderRadius: 16, border: '1px solid #e5e7eb',
            padding: 40, textAlign: 'center',
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: '#dcfce7', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 28, margin: '0 auto 16px',
            }}>
              ✓
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Kayıt Tamamlandı!</h1>
            <p style={{ color: '#6b7280', marginBottom: 24 }}>Firmanız başarıyla oluşturuldu.</p>

            <div style={{
              background: '#f9fafb', borderRadius: 12, padding: 20,
              textAlign: 'left', marginBottom: 20,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 14 }}>
                <span style={{ color: '#6b7280' }}>Firma</span>
                <span style={{ fontWeight: 600 }}>{result.tenant?.companyName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 14 }}>
                <span style={{ color: '#6b7280' }}>Admin Email</span>
                <span style={{ fontWeight: 600 }}>{result.adminEmail}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span style={{ color: '#6b7280' }}>Plan</span>
                <span style={{ fontWeight: 600 }}>{result.tenant?.plan}</span>
              </div>
            </div>

            <div style={{
              background: '#fffbeb', border: '1px solid #fde68a',
              borderRadius: 8, padding: 12, fontSize: 13,
              color: '#92400e', marginBottom: 24, textAlign: 'left',
            }}>
              ⚠️ Belirlediğiniz şifre ile giriş yapabilirsiniz. Şifrenizi güvenli bir yerde saklayın.
            </div>

            <a href="/" style={{
              display: 'inline-block', padding: '12px 40px',
              background: '#2563eb', color: 'white', borderRadius: 10,
              textDecoration: 'none', fontWeight: 600, fontSize: 15,
            }}>
              Giriş Yap →
            </a>
          </div>
        )}
      </div>
    </div>
  )
}