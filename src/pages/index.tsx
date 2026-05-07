import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

export default function Landing() {
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenu, setMobileMenu] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const plans = [
    {
      name: 'Starter',
      price: '499',
      desc: 'Küçük ekipler için ideal başlangıç',
      color: '#6b7280',
      badge: null,
      features: [
        '1 şube',
        '50 personele kadar',
        'Yoklama takibi',
        'İzin yönetimi',
        'Vardiya planlama',
        'Mobil uygulama',
        'Email destek',
      ],
      notIncluded: ['Excel export', 'QR & RF kart', 'API erişimi'],
    },
    {
      name: 'Professional',
      price: '1.499',
      desc: 'Büyüyen şirketler için tam çözüm',
      color: '#2563eb',
      badge: 'En Popüler',
      features: [
        '20 şubeye kadar',
        '500 personele kadar',
        'Yoklama takibi',
        'İzin & fazla mesai',
        'Vardiya planlama',
        'QR & RF kart okutma',
        'Excel & PDF export',
        'Öncelikli destek',
        'Mobil uygulama',
      ],
      notIncluded: ['API erişimi'],
    },
    {
      name: 'Enterprise',
      price: 'Özel',
      desc: 'Kurumsal ihtiyaçlar için sınırsız',
      color: '#7c3aed',
      badge: 'Kurumsal',
      features: [
        'Sınırsız şube',
        'Sınırsız personel',
        'Tüm özellikler',
        'QR & RF kart okutma',
        'API erişimi',
        'ERP entegrasyonu',
        'Özel geliştirme',
        '7/24 destek',
      ],
      notIncluded: [],
    },
  ]

  const features = [
    { icon: '✅', title: 'Yoklama Takibi', desc: 'QR kod, RF kart veya manuel giriş/çıkış. Geç kalma otomatik hesaplanır.' },
    { icon: '📅', title: 'İzin Yönetimi', desc: 'Yıllık, hastalık, evlilik izinleri. Bakiye takibi ve onay akışı.' },
    { icon: '🔄', title: 'Vardiya Planlama', desc: 'Haftalık vardiya takvimi. Çakışma kontrolü otomatik.' },
    { icon: '⏱️', title: 'Fazla Mesai', desc: 'Mesai kayıtları, onay süreci ve raporlama.' },
    { icon: '📊', title: 'Raporlar', desc: 'Excel export, aylık özet, geç kalma istatistikleri.' },
    { icon: '📱', title: 'Mobil Uygulama', desc: 'Personel mobil uygulamasından izin talebi ve QR okutma.' },
  ]

  const stats = [
    { value: '500+', label: 'Aktif Firma' },
    { value: '50.000+', label: 'Personel' },
    { value: '%99.9', label: 'Uptime' },
    { value: '14 Gün', label: 'Ücretsiz Deneme' },
  ]

  return (
    <div style={{ fontFamily: 'sans-serif', color: '#0f172a', overflowX: 'hidden' }}>

      {/* Navbar */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? 'white' : 'transparent',
        boxShadow: scrolled ? '0 1px 20px rgba(0,0,0,0.08)' : 'none',
        transition: 'all 0.3s',
        padding: '0 40px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 36, height: 36,
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ color: 'white', fontWeight: 800, fontSize: 18 }}>Z</span>
          </div>
          <div>
            <span style={{ fontWeight: 800, fontSize: 18, color: scrolled ? '#0f172a' : 'white' }}>Zecrone</span>
            <span style={{ fontSize: 11, color: '#2563eb', fontWeight: 700, marginLeft: 4 }}>HR</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          {['Özellikler', 'Planlar', 'Hakkımızda'].map(item => (
            <a key={item} href={`#${item.toLowerCase()}`} style={{
              fontSize: 14, fontWeight: 500,
              color: scrolled ? '#374151' : 'rgba(255,255,255,0.85)',
              textDecoration: 'none',
            }}>{item}</a>
          ))}
          <a href="/hr/login" style={{
            fontSize: 14, fontWeight: 600,
            color: scrolled ? '#374151' : 'rgba(255,255,255,0.85)',
            textDecoration: 'none',
          }}>Giriş Yap</a>
          <a href="/hr/register" style={{
            fontSize: 14, fontWeight: 700,
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            color: 'white', padding: '8px 20px',
            borderRadius: 8, textDecoration: 'none',
            boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
          }}>Ücretsiz Dene</a>
        </div>
      </nav>

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)',
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '80px 40px 60px', textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
        {/* Dekoratif arka plan */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(37,99,235,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(124,58,237,0.15) 0%, transparent 50%)',
        }} />

        <div style={{ position: 'relative', maxWidth: 800, margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(37,99,235,0.2)', border: '1px solid rgba(37,99,235,0.4)',
            borderRadius: 20, padding: '6px 16px', marginBottom: 24,
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#34d399', display: 'inline-block' }} />
            <span style={{ fontSize: 13, color: '#93c5fd', fontWeight: 500 }}>
              14 gün ücretsiz deneyin — kredi kartı gerekmez
            </span>
          </div>

          <h1 style={{
            fontSize: 56, fontWeight: 800, color: 'white',
            margin: '0 0 20px', lineHeight: 1.1, letterSpacing: '-1.5px',
          }}>
            Personelinizi Akıllıca{' '}
            <span style={{
              background: 'linear-gradient(90deg, #60a5fa, #a78bfa)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              Yönetin
            </span>
          </h1>

          <p style={{
            fontSize: 20, color: '#94a3b8', marginBottom: 40, lineHeight: 1.7, maxWidth: 600, margin: '0 auto 40px',
          }}>
            Yoklama takibi, vardiya yönetimi, izin ve fazla mesai — tüm İK süreçlerinizi
            tek platformda, güvenli ve kolay şekilde yönetin.
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 60 }}>
            <a href="/hr/register" style={{
              padding: '14px 32px',
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              color: 'white', borderRadius: 12, textDecoration: 'none',
              fontWeight: 700, fontSize: 16,
              boxShadow: '0 8px 24px rgba(37,99,235,0.4)',
            }}>
              🚀 Ücretsiz Başlayın
            </a>
            <a href="#özellikler" style={{
              padding: '14px 32px',
              background: 'rgba(255,255,255,0.1)',
              color: 'white', borderRadius: 12, textDecoration: 'none',
              fontWeight: 600, fontSize: 16,
              border: '1px solid rgba(255,255,255,0.2)',
            }}>
              Özellikleri Keşfet →
            </a>
          </div>

          {/* İstatistikler */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 48, flexWrap: 'wrap' }}>
            {stats.map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: 'white' }}>{s.value}</div>
                <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Özellikler */}
      <div id="özellikler" style={{ padding: '100px 40px', background: '#f8fafc' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <span style={{
              fontSize: 13, fontWeight: 700, color: '#2563eb',
              textTransform: 'uppercase', letterSpacing: '0.1em',
            }}>Özellikler</span>
            <h2 style={{ fontSize: 40, fontWeight: 800, margin: '12px 0 16px', letterSpacing: '-1px' }}>
              İK süreçleriniz için her şey
            </h2>
            <p style={{ fontSize: 18, color: '#6b7280', maxWidth: 500, margin: '0 auto' }}>
              Personel yönetiminde ihtiyacınız olan tüm araçlar tek platformda.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {features.map(f => (
              <div key={f.title} style={{
                background: 'white', borderRadius: 16, padding: 28,
                border: '1px solid #e5e7eb',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: 'linear-gradient(135deg, #eff6ff, #f5f3ff)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 24, marginBottom: 16,
                }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 8px' }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Nasıl Çalışır */}
      <div style={{ padding: '100px 40px', background: 'white' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Nasıl Çalışır
          </span>
          <h2 style={{ fontSize: 40, fontWeight: 800, margin: '12px 0 60px', letterSpacing: '-1px' }}>
            3 adımda başlayın
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 40 }}>
            {[
              { step: '01', title: 'Kaydolun', desc: 'Planınızı seçin ve firma bilgilerinizle ücretsiz hesap oluşturun. 2 dakika yeter.' },
              { step: '02', title: 'Personelleri Ekleyin', desc: 'Personellerinizi tek tek veya Excel ile toplu olarak sisteme aktarın.' },
              { step: '03', title: 'Yönetmeye Başlayın', desc: 'Yoklama, izin, vardiya — tüm süreçleri anında yönetmeye başlayın.' },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{
                  width: 64, height: 64, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 20px',
                  boxShadow: '0 8px 24px rgba(37,99,235,0.3)',
                }}>
                  <span style={{ color: 'white', fontWeight: 800, fontSize: 20 }}>{s.step}</span>
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 12px' }}>{s.title}</h3>
                <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Planlar */}
      <div id="planlar" style={{ padding: '100px 40px', background: '#f8fafc' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Fiyatlandırma
            </span>
            <h2 style={{ fontSize: 40, fontWeight: 800, margin: '12px 0 16px', letterSpacing: '-1px' }}>
              İhtiyacınıza uygun plan
            </h2>
            <p style={{ fontSize: 18, color: '#6b7280' }}>
              14 gün ücretsiz deneyin, istediğiniz zaman iptal edin.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {plans.map(plan => (
              <div key={plan.name} style={{
                background: 'white', borderRadius: 20, padding: 32,
                border: plan.name === 'Professional' ? `2px solid ${plan.color}` : '1px solid #e5e7eb',
                position: 'relative',
                boxShadow: plan.name === 'Professional' ? '0 16px 40px rgba(37,99,235,0.15)' : '0 2px 8px rgba(0,0,0,0.04)',
              }}>
                {plan.badge && (
                  <div style={{
                    position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
                    background: plan.color, color: 'white',
                    fontSize: 11, fontWeight: 700, padding: '4px 16px', borderRadius: 20,
                    whiteSpace: 'nowrap',
                  }}>
                    {plan.badge}
                  </div>
                )}

                <div style={{ marginBottom: 8 }}>
                  <span style={{ fontSize: 18, fontWeight: 700 }}>{plan.name}</span>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <span style={{ fontSize: 40, fontWeight: 800, color: plan.color }}>
                    {plan.price === 'Özel' ? '' : '₺'}{plan.price}
                  </span>
                  {plan.price !== 'Özel' && <span style={{ fontSize: 14, color: '#6b7280' }}>/ay</span>}
                </div>
                <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 24, lineHeight: 1.5 }}>{plan.desc}</p>

                <a href="/hr/register" style={{
                  display: 'block', textAlign: 'center',
                  padding: '12px',
                  background: plan.name === 'Professional' ? `linear-gradient(135deg, #2563eb, #7c3aed)` : 'transparent',
                  color: plan.name === 'Professional' ? 'white' : plan.color,
                  border: plan.name === 'Professional' ? 'none' : `2px solid ${plan.color}`,
                  borderRadius: 10, textDecoration: 'none',
                  fontWeight: 700, fontSize: 14, marginBottom: 24,
                }}>
                  {plan.price === 'Özel' ? 'Teklif Al' : 'Ücretsiz Dene'}
                </a>

                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 20 }}>
                  {plan.features.map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <span style={{ color: '#16a34a', fontWeight: 700, fontSize: 14 }}>✓</span>
                      <span style={{ fontSize: 13, color: '#374151' }}>{f}</span>
                    </div>
                  ))}
                  {plan.notIncluded.map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <span style={{ color: '#d1d5db', fontSize: 14 }}>✗</span>
                      <span style={{ fontSize: 13, color: '#9ca3af', textDecoration: 'line-through' }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a, #1e3a5f)',
        padding: '80px 40px', textAlign: 'center',
      }}>
        <h2 style={{ fontSize: 40, fontWeight: 800, color: 'white', margin: '0 0 16px', letterSpacing: '-1px' }}>
          Hemen başlayın
        </h2>
        <p style={{ fontSize: 18, color: '#94a3b8', marginBottom: 32 }}>
          14 gün ücretsiz deneyin. Kredi kartı gerekmez.
        </p>
        <a href="/hr/register" style={{
          display: 'inline-block', padding: '16px 48px',
          background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
          color: 'white', borderRadius: 12, textDecoration: 'none',
          fontWeight: 700, fontSize: 16,
          boxShadow: '0 8px 24px rgba(37,99,235,0.4)',
        }}>
          🚀 Ücretsiz Hesap Oluştur
        </a>
        <p style={{ fontSize: 13, color: '#475569', marginTop: 16 }}>
          🔒 KVKK uyumlu · SSL korumalı · İstediğiniz zaman iptal
        </p>
      </div>

      {/* Footer */}
      <footer style={{
        background: '#0f172a', padding: '60px 40px 40px',
        color: '#64748b',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40, marginBottom: 48 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <div style={{
                  width: 36, height: 36, background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                  borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ color: 'white', fontWeight: 800, fontSize: 18 }}>Z</span>
                </div>
                <span style={{ fontWeight: 800, fontSize: 18, color: 'white' }}>Zecrone <span style={{ color: '#2563eb' }}>HR</span></span>
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.7, maxWidth: 280 }}>
                Türkiye'nin modern İK yönetim platformu. Personel, yoklama, izin ve daha fazlası.
              </p>
            </div>
            {[
              { title: 'Ürün', links: ['Özellikler', 'Planlar', 'Güvenlik', 'Güncellemeler'] },
              { title: 'Şirket', links: ['Hakkımızda', 'Blog', 'Kariyer', 'İletişim'] },
              { title: 'Destek', links: ['Yardım Merkezi', 'Kullanım Kılavuzu', 'API Dokümantasyon', 'Durum'] },
            ].map(col => (
              <div key={col.title}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>
                  {col.title}
                </div>
                {col.links.map(link => (
                  <div key={link} style={{ fontSize: 14, marginBottom: 10 }}>
                    <a href="#" style={{ color: '#64748b', textDecoration: 'none' }}>{link}</a>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid #1e293b', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <span style={{ fontSize: 13 }}>© 2025 Zecrone HR. Tüm hakları saklıdır.</span>
            <div style={{ display: 'flex', gap: 24 }}>
              {['Gizlilik Politikası', 'Kullanım Koşulları', 'KVKK'].map(item => (
                <a key={item} href="#" style={{ fontSize: 13, color: '#64748b', textDecoration: 'none' }}>{item}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
