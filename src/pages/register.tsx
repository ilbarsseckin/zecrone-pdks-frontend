import { useState, useEffect } from 'react'

export default function Register() {
  const [isMobile, setIsMobile] = useState(false)
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [form, setForm] = useState({
    companyName: '',
    contactEmail: '',
    contactPhone: '',
    plan: 'PROFESSIONAL',
    adminPassword: '',
  })

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const plans = [
    {
      key: 'STARTER',
      label: 'Starter',
      price: '499',
      period: '/ay',
      desc: 'Küçük ekipler için ideal başlangıç',
      features: ['3 şubeye kadar', '50 personele kadar', 'Temel raporlar', 'Email destek', 'Mobil uygulama'],
      notIncluded: ['Excel export', 'QR kod', 'API erişimi'],
      color: '#6b7280',
      bg: '#f9fafb',
      badge: null,
    },
    {
      key: 'PROFESSIONAL',
      label: 'Professional',
      price: '1.499',
      period: '/ay',
      desc: 'Büyüyen şirketler için tam çözüm',
      features: ['20 şubeye kadar', '500 personele kadar', 'Gelişmiş raporlar', 'Excel & PDF export', 'QR kod okutma', 'Öncelikli destek', 'Mobil uygulama'],
      notIncluded: ['API erişimi'],
      color: '#2563eb',
      bg: '#eff6ff',
      badge: 'En Popüler',
    },
    {
      key: 'ENTERPRISE',
      label: 'Enterprise',
      price: 'Özel',
      period: ' fiyat',
      desc: 'Kurumsal ihtiyaçlar için sınırsız',
      features: ['Sınırsız şube', 'Sınırsız personel', 'Tüm raporlar', 'Excel & PDF export', 'QR kod okutma', 'API erişimi', 'ERP entegrasyonu', '7/24 destek', 'Özel geliştirme'],
      notIncluded: [],
      color: '#7c3aed',
      bg: '#faf5ff',
      badge: 'Kurumsal',
    },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (form.adminPassword.length < 8) { setError('Şifre en az 8 karakter olmalı'); return }
    if (form.adminPassword !== passwordConfirm) { setError('Şifreler eşleşmiyor'); return }
    setLoading(true)
    try {
      const res = await fetch('${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/tenants', {
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

  const selectedPlan = plans.find(p => p.key === form.plan)!

  const inputStyle = {
    width: '100%', padding: '11px 14px',
    border: '1.5px solid #e5e7eb', borderRadius: 10,
    fontSize: 14, boxSizing: 'border-box' as const,
    outline: 'none', background: 'white',
  }

  const labelStyle = {
    display: 'block', fontSize: 13,
    fontWeight: 600 as const, color: '#374151', marginBottom: 6,
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'sans-serif' }}>

      {/* Navbar */}
      <nav style={{
        background: 'white', borderBottom: '1px solid #e5e7eb',
        padding: isMobile ? '0 16px' : '0 40px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 32, height: 32, background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ color: 'white', fontWeight: 800, fontSize: 16 }}>Z</span>
          </div>
          <span style={{ fontWeight: 800, fontSize: 20, color: '#0f172a' }}>Zecrone</span>
        </div>
        <a href="/" style={{
          fontSize: 13, fontWeight: 600, color: '#2563eb',
          textDecoration: 'none', padding: '7px 14px',
          border: '1px solid #2563eb', borderRadius: 8,
        }}>
          Giriş Yap
        </a>
      </nav>

      {/* Hero - sadece adım 1 */}
      {step === 1 && (
        <div style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)',
          padding: isMobile ? '40px 16px 60px' : '60px 40px 80px',
          textAlign: 'center',
        }}>
          <div style={{ maxWidth: 700, margin: '0 auto' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(37,99,235,0.2)', border: '1px solid rgba(37,99,235,0.4)',
              borderRadius: 20, padding: '6px 16px', marginBottom: 20,
            }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#34d399', display: 'inline-block' }} />
              <span style={{ fontSize: 12, color: '#93c5fd', fontWeight: 500 }}>
                14 gün ücretsiz · kredi kartı gerekmez
              </span>
            </div>
            <h1 style={{
              fontSize: isMobile ? 28 : 44, fontWeight: 800,
              color: 'white', margin: '0 0 16px', lineHeight: 1.15,
            }}>
              Personelinizi Akıllıca{' '}
              <span style={{ background: 'linear-gradient(90deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Yönetin
              </span>
            </h1>
            <p style={{ fontSize: isMobile ? 15 : 17, color: '#94a3b8', marginBottom: 28, lineHeight: 1.6 }}>
              Giriş-çıkış takibi, vardiya yönetimi, izin takibi ve raporlamayı tek platformda yönetin.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: isMobile ? 20 : 40 }}>
              {['500+ Firma', '50.000+ Personel', '%99.9 Uptime'].map(stat => (
                <div key={stat} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: isMobile ? 16 : 20, fontWeight: 700, color: 'white' }}>{stat.split(' ')[0]}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{stat.split(' ').slice(1).join(' ')}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div style={{
        maxWidth: step === 1 ? 1100 : 640,
        margin: '0 auto',
        padding: isMobile ? '16px' : step === 1 ? '0 24px 60px' : '48px 24px 60px',
        width: '100%', boxSizing: 'border-box',
      }}>

        {/* Adım göstergesi */}
        {step < 3 && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: isMobile ? 4 : 8, padding: '28px 0 20px',
          }}>
            {['Plan Seçin', 'Firma Bilgileri', 'Başlayın'].map((label, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 4 : 8 }}>
                <div style={{
                  width: 26, height: 26, borderRadius: '50%', fontSize: 11, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  background: step > i + 1 ? '#16a34a' : step === i + 1 ? '#2563eb' : '#e5e7eb',
                  color: step >= i + 1 ? 'white' : '#9ca3af',
                }}>
                  {step > i + 1 ? '✓' : i + 1}
                </div>
                {!isMobile && (
                  <span style={{ fontSize: 13, fontWeight: 500, color: step === i + 1 ? '#0f172a' : '#9ca3af' }}>
                    {label}
                  </span>
                )}
                {i < 2 && <div style={{ width: isMobile ? 20 : 40, height: 1, background: '#e5e7eb', margin: '0 4px' }} />}
              </div>
            ))}
          </div>
        )}

        {/* Adım 1: Plan */}
        {step === 1 && (
          <div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr',
              gap: 16, marginBottom: 28,
            }}>
              {plans.map(plan => (
                <div key={plan.key}
                  onClick={() => setForm({ ...form, plan: plan.key })}
                  style={{
                    background: form.plan === plan.key ? plan.bg : 'white',
                    border: form.plan === plan.key ? `2px solid ${plan.color}` : '1px solid #e5e7eb',
                    borderRadius: 16, padding: isMobile ? 20 : 24, cursor: 'pointer',
                    position: 'relative',
                    boxShadow: form.plan === plan.key ? '0 8px 24px rgba(0,0,0,0.08)' : 'none',
                  }}>
                  {plan.badge && (
                    <div style={{
                      position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                      background: plan.color, color: 'white', fontSize: 11,
                      padding: '3px 12px', borderRadius: 20, fontWeight: 700, whiteSpace: 'nowrap',
                    }}>
                      {plan.badge}
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <div style={{
                      width: 10, height: 10, borderRadius: '50%',
                      background: form.plan === plan.key ? plan.color : '#e5e7eb',
                      border: `2px solid ${form.plan === plan.key ? plan.color : '#d1d5db'}`,
                      flexShrink: 0,
                    }} />
                    <span style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>{plan.label}</span>
                  </div>
                  <div style={{ marginBottom: 4 }}>
                    <span style={{ fontSize: 28, fontWeight: 800, color: plan.color }}>
                      {plan.price === 'Özel' ? '' : '₺'}{plan.price}
                    </span>
                    <span style={{ fontSize: 13, color: '#6b7280' }}>{plan.period}</span>
                  </div>
                  <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 16, lineHeight: 1.5 }}>{plan.desc}</p>
                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 14 }}>
                    {plan.features.map(f => (
                      <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                        <span style={{ color: '#16a34a', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>✓</span>
                        <span style={{ fontSize: 13, color: '#374151' }}>{f}</span>
                      </div>
                    ))}
                    {plan.notIncluded.map(f => (
                      <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                        <span style={{ color: '#d1d5db', fontSize: 13, flexShrink: 0 }}>✗</span>
                        <span style={{ fontSize: 13, color: '#9ca3af', textDecoration: 'line-through' }}>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <button onClick={() => setStep(2)} style={{
                padding: '14px 48px',
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                color: 'white', border: 'none', borderRadius: 12,
                fontSize: 15, fontWeight: 700, cursor: 'pointer',
                width: isMobile ? '100%' : 'auto',
                boxShadow: '0 4px 16px rgba(37,99,235,0.3)',
              }}>
                {selectedPlan.label} Planı ile Başla →
              </button>
              <p style={{ fontSize: 12, color: '#9ca3af' }}>
                🔒 Güvenli · İstediğiniz zaman iptal · KVKK uyumlu
              </p>
            </div>

            <div style={{
              marginTop: 40, padding: isMobile ? 16 : 24,
              background: 'white', borderRadius: 14, border: '1px solid #e5e7eb',
            }}>
              <p style={{ textAlign: 'center', fontSize: 13, color: '#6b7280', marginBottom: 16 }}>
                Türkiye'nin önde gelen şirketleri Zecrone'a güveniyor
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10 }}>
                {['Üretim', 'Lojistik', 'Perakende', 'Sağlık', 'İnşaat'].map(sector => (
                  <div key={sector} style={{
                    padding: '6px 14px', background: '#f8fafc',
                    border: '1px solid #e5e7eb', borderRadius: 8,
                    fontSize: 12, color: '#6b7280', fontWeight: 500,
                  }}>
                    {sector}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Adım 2: Firma Bilgileri */}
        {step === 2 && (
          <div style={{
            background: 'white', borderRadius: 20, border: '1px solid #e5e7eb',
            overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
          }}>
            <div style={{
              background: `${selectedPlan.color}12`,
              borderBottom: `1px solid ${selectedPlan.color}30`,
              padding: isMobile ? '14px 16px' : '16px 32px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexWrap: 'wrap', gap: 8,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 9, background: selectedPlan.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <span style={{ color: 'white', fontWeight: 800, fontSize: 15 }}>{selectedPlan.label[0]}</span>
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>{selectedPlan.label} Plan</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>{selectedPlan.desc}</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 800, fontSize: 17, color: selectedPlan.color }}>
                  {selectedPlan.price === 'Özel' ? 'Özel Fiyat' : `₺${selectedPlan.price}/ay`}
                </div>
                <button onClick={() => { setStep(1); setError('') }} style={{
                  fontSize: 11, color: '#6b7280', background: 'none',
                  border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0,
                }}>
                  Değiştir
                </button>
              </div>
            </div>

            <div style={{ padding: isMobile ? 20 : 32 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Firma Bilgileriniz</h2>
              <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 24 }}>
                Bilgileriniz güvende. KVKK kapsamında korunmaktadır.
              </p>

              {error && (
                <div style={{
                  background: '#fef2f2', border: '1px solid #fecaca',
                  borderRadius: 10, padding: '10px 14px',
                  fontSize: 13, color: '#dc2626', marginBottom: 16,
                }}>
                  ⚠️ {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>Firma Adı *</label>
                  <input required value={form.companyName}
                    onChange={e => setForm({ ...form, companyName: e.target.value })}
                    style={inputStyle} placeholder="Zecrone Teknoloji A.Ş." />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>Kurumsal E-posta *</label>
                  <input type="email" required value={form.contactEmail}
                    onChange={e => setForm({ ...form, contactEmail: e.target.value })}
                    style={inputStyle} placeholder="info@firmaniz.com" />
                  <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>
                    Giriş bilgileriniz bu adrese gönderilecek
                  </p>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>Telefon</label>
                  <input value={form.contactPhone}
                    onChange={e => setForm({ ...form, contactPhone: e.target.value })}
                    style={inputStyle} placeholder="+90 212 000 00 00" />
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                  gap: 14, marginBottom: 20,
                }}>
                  <div>
                    <label style={labelStyle}>Şifre *</label>
                    <input type="password" required value={form.adminPassword}
                      onChange={e => setForm({ ...form, adminPassword: e.target.value })}
                      style={inputStyle} placeholder="En az 8 karakter" />
                  </div>
                  <div>
                    <label style={labelStyle}>Şifre Tekrar *</label>
                    <input type="password" required value={passwordConfirm}
                      onChange={e => setPasswordConfirm(e.target.value)}
                      style={inputStyle} placeholder="Şifreyi tekrar girin" />
                  </div>
                </div>

                <div style={{
                  background: '#f8fafc', borderRadius: 10, padding: '10px 14px',
                  fontSize: 12, color: '#6b7280', marginBottom: 20,
                  display: 'flex', alignItems: 'flex-start', gap: 6,
                }}>
                  <span style={{ flexShrink: 0 }}>🔒</span>
                  <span>
                    Kaydolarak{' '}
                    <a href="#" style={{ color: '#2563eb' }}>Kullanım Koşulları</a>'nı ve{' '}
                    <a href="#" style={{ color: '#2563eb' }}>Gizlilik Politikası</a>'nı kabul etmiş olursunuz.
                  </span>
                </div>

                <div style={{ display: 'flex', gap: 10, flexDirection: isMobile ? 'column' : 'row' }}>
                  <button type="button" onClick={() => { setStep(1); setError('') }}
                    style={{
                      padding: '12px 20px', background: 'white',
                      border: '1.5px solid #e5e7eb', borderRadius: 10,
                      fontSize: 14, cursor: 'pointer', color: '#374151', fontWeight: 500,
                      order: isMobile ? 2 : 1,
                    }}>
                    ← Geri
                  </button>
                  <button type="submit" disabled={loading}
                    style={{
                      flex: 1, padding: '12px 20px',
                      background: loading ? '#93c5fd' : 'linear-gradient(135deg, #2563eb, #7c3aed)',
                      color: 'white', border: 'none', borderRadius: 10,
                      fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                      order: isMobile ? 1 : 2,
                    }}>
                    {loading ? '⏳ Hesabınız oluşturuluyor...' : '🚀 Ücretsiz Denemeyi Başlat'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Adım 3: Tamamlandı */}
        {step === 3 && result && (
          <div style={{
            background: 'white', borderRadius: 20, border: '1px solid #e5e7eb',
            padding: isMobile ? 24 : 48, textAlign: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          }}>
            <div style={{
              width: 68, height: 68, borderRadius: '50%',
              background: 'linear-gradient(135deg, #16a34a, #15803d)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, margin: '0 auto 18px',
              boxShadow: '0 8px 24px rgba(22,163,74,0.3)',
            }}>
              ✓
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>
              Hoş Geldiniz! 🎉
            </h1>
            <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 28 }}>
              <strong style={{ color: '#0f172a' }}>{result.tenant?.companyName}</strong> için hesabınız başarıyla oluşturuldu.
            </p>

            <div style={{
              background: '#f8fafc', borderRadius: 12, padding: 20,
              textAlign: 'left', marginBottom: 20, border: '1px solid #e5e7eb',
            }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: 14 }}>
                Hesap Bilgileriniz
              </p>
              {[
                { label: 'E-posta', value: result.adminEmail },
                { label: 'Plan', value: result.tenant?.plan },
                { label: 'Deneme Süresi', value: '14 gün ücretsiz' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 14 }}>
                  <span style={{ color: '#6b7280' }}>{item.label}</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{item.value}</span>
                </div>
              ))}
            </div>

            <div style={{
              background: '#fffbeb', border: '1px solid #fde68a',
              borderRadius: 10, padding: '10px 14px',
              fontSize: 13, color: '#92400e', marginBottom: 24, textAlign: 'left',
            }}>
              📧 Giriş bilgileriniz <strong>{result.adminEmail}</strong> adresine gönderildi.
            </div>

            <a href="/" style={{
              display: 'block', padding: '13px 40px',
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              color: 'white', borderRadius: 12, textDecoration: 'none',
              fontWeight: 700, fontSize: 15,
              boxShadow: '0 4px 16px rgba(37,99,235,0.3)',
            }}>
              Panele Giriş Yap →
            </a>

            <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 16 }}>
              Sorun mu yaşıyorsunuz?{' '}
              <a href="mailto:destek@zecrone.com" style={{ color: '#2563eb' }}>destek@zecrone.com</a>
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid #e5e7eb', background: 'white',
        padding: '20px 24px', textAlign: 'center',
      }}>
        <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>
          © 2025 Zecrone · Tüm hakları saklıdır ·{' '}
          <a href="#" style={{ color: '#6b7280', textDecoration: 'none' }}>Gizlilik</a> ·{' '}
          <a href="#" style={{ color: '#6b7280', textDecoration: 'none' }}>Koşullar</a> ·{' '}
          <a href="#" style={{ color: '#6b7280', textDecoration: 'none' }}>KVKK</a>
        </p>
      </footer>
    </div>
  )
}
