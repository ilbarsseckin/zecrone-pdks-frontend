import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

export default function SuperAdminDashboard() {
  const router = useRouter()
  const [stats, setStats]     = useState<any>(null)
  const [tenants, setTenants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [planModal, setPlanModal] = useState<any>(null)
  const [selectedPlan, setSelectedPlan] = useState('')

  const token   = () => localStorage.getItem('sa_token') || ''
  const headers = () => ({ Authorization: `Bearer ${token()}` })

  useEffect(() => {
    const t = localStorage.getItem('sa_token')
    if (!t) { router.push('/superadmin/login'); return }
    load()
  }, [])

  const load = () => {
    Promise.all([
      fetch('http://localhost:8080/api/superadmin/stats',   { headers: headers() }).then(r => r.json()),
      fetch('http://localhost:8080/api/superadmin/tenants', { headers: headers() }).then(r => r.json()),
    ]).then(([s, t]) => {
      setStats(s)
      setTenants(Array.isArray(t) ? t : [])
      setLoading(false)
    })
  }

  const toggleActive = async (id: string, isActive: boolean) => {
    const endpoint = isActive ? 'deactivate' : 'activate'
    await fetch(`http://localhost:8080/api/superadmin/tenants/${id}/${endpoint}`, {
      method: 'PATCH', headers: headers()
    })
    load()
  }

  const changePlan = async () => {
    if (!planModal || !selectedPlan) return
    await fetch(`http://localhost:8080/api/superadmin/tenants/${planModal.id}/plan?plan=${selectedPlan}`, {
      method: 'PATCH', headers: headers()
    })
    setPlanModal(null)
    load()
  }

  const logout = () => {
    localStorage.removeItem('sa_token')
    router.push('/superadmin/login')
  }

  const PLAN_COLORS: Record<string, string> = {
    STARTER: '#6b7280',
    PROFESSIONAL: '#2563eb',
    ENTERPRISE: '#7c3aed',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', fontFamily: 'sans-serif', color: 'white' }}>

      {/* Navbar */}
      <nav style={{
        background: '#1e293b', borderBottom: '1px solid #334155',
        padding: '0 32px', height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>⚡</span>
          <span style={{ fontWeight: 800, fontSize: 18 }}>Zecrone</span>
          <span style={{
            background: '#312e81', color: '#a5b4fc',
            fontSize: 10, fontWeight: 700, padding: '2px 8px',
            borderRadius: 20, letterSpacing: '0.05em'
          }}>SUPER ADMIN</span>
        </div>
        <button onClick={logout}
          style={{
            background: 'transparent', border: '1px solid #334155',
            color: '#94a3b8', padding: '6px 16px', borderRadius: 8,
            fontSize: 13, cursor: 'pointer'
          }}>
          Çıkış
        </button>
      </nav>

      <div style={{ padding: '32px' }}>

        {loading ? (
          <div style={{ textAlign: 'center', color: '#64748b', paddingTop: 80 }}>Yükleniyor...</div>
        ) : (
          <>
            {/* İstatistik kartları */}
            {stats && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 32 }}>
                {[
                  { label: 'Toplam Firma',    value: stats.totalTenants,      color: '#60a5fa' },
                  { label: 'Aktif Firma',     value: stats.activeTenants,     color: '#34d399' },
                  { label: 'Starter',         value: stats.starterCount,      color: '#9ca3af' },
                  { label: 'Professional',    value: stats.professionalCount, color: '#60a5fa' },
                  { label: 'Enterprise',      value: stats.enterpriseCount,   color: '#a78bfa' },
                ].map(card => (
                  <div key={card.label} style={{
                    background: '#1e293b', border: '1px solid #334155',
                    borderRadius: 12, padding: '20px 24px'
                  }}>
                    <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>{card.label}</div>
                    <div style={{ fontSize: 32, fontWeight: 800, color: card.color }}>{card.value}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Firma listesi */}
            <div style={{
              background: '#1e293b', border: '1px solid #334155', borderRadius: 16, overflow: 'hidden'
            }}>
              <div style={{
                padding: '16px 24px', borderBottom: '1px solid #334155',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
              }}>
                <span style={{ fontWeight: 700, fontSize: 16 }}>Tüm Firmalar</span>
                <span style={{ fontSize: 13, color: '#64748b' }}>{tenants.length} firma</span>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#0f172a' }}>
                    {['Firma Adı', 'Email', 'Plan', 'Schema', 'Durum', 'Kayıt Tarihi', 'İşlemler'].map(h => (
                      <th key={h} style={{
                        padding: '12px 16px', textAlign: 'left',
                        fontSize: 11, color: '#64748b', fontWeight: 600,
                        textTransform: 'uppercase', letterSpacing: '0.05em'
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tenants.map((t: any) => (
                    <tr key={t.id} style={{ borderTop: '1px solid #1e293b' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 600, fontSize: 14 }}>{t.companyName}</td>
                      <td style={{ padding: '14px 16px', fontSize: 13, color: '#94a3b8' }}>{t.contactEmail}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          background: `${PLAN_COLORS[t.plan]}20`,
                          color: PLAN_COLORS[t.plan],
                          padding: '3px 10px', borderRadius: 20,
                          fontSize: 11, fontWeight: 700
                        }}>
                          {t.plan}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: 11, color: '#475569', fontFamily: 'monospace' }}>
                        {t.schemaName}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          background: t.isActive ? '#052e16' : '#450a0a',
                          color: t.isActive ? '#86efac' : '#fca5a5',
                          padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700
                        }}>
                          {t.isActive ? 'Aktif' : 'Pasif'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: 12, color: '#64748b' }}>
                        {t.createdAt ? new Date(t.createdAt).toLocaleDateString('tr-TR') : '-'}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            onClick={() => toggleActive(t.id, t.isActive)}
                            style={{
                              padding: '4px 12px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                              cursor: 'pointer', border: 'none',
                              background: t.isActive ? '#450a0a' : '#052e16',
                              color: t.isActive ? '#fca5a5' : '#86efac'
                            }}>
                            {t.isActive ? 'Askıya Al' : 'Aktifleştir'}
                          </button>
                          <button
                            onClick={() => { setPlanModal(t); setSelectedPlan(t.plan) }}
                            style={{
                              padding: '4px 12px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                              cursor: 'pointer', border: '1px solid #334155',
                              background: 'transparent', color: '#94a3b8'
                            }}>
                            Plan Değiştir
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Plan değiştir modal */}
      {planModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50
        }}>
          <div style={{
            background: '#1e293b', border: '1px solid #334155',
            borderRadius: 16, padding: 28, width: 360
          }}>
            <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700 }}>Plan Değiştir</h3>
            <p style={{ margin: '0 0 20px', fontSize: 13, color: '#64748b' }}>
              {planModal.companyName}
            </p>
            <select value={selectedPlan}
              onChange={e => setSelectedPlan(e.target.value)}
              style={{
                width: '100%', padding: '10px 14px',
                background: '#0f172a', border: '1px solid #334155',
                borderRadius: 8, color: 'white', fontSize: 14,
                marginBottom: 20, boxSizing: 'border-box' as const
              }}>
              <option value="STARTER">Starter</option>
              <option value="PROFESSIONAL">Professional</option>
              <option value="ENTERPRISE">Enterprise</option>
            </select>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setPlanModal(null)}
                style={{
                  flex: 1, padding: '10px', background: 'transparent',
                  border: '1px solid #334155', borderRadius: 8,
                  color: '#94a3b8', fontSize: 13, cursor: 'pointer'
                }}>
                İptal
              </button>
              <button onClick={changePlan}
                style={{
                  flex: 1, padding: '10px',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  border: 'none', borderRadius: 8,
                  color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer'
                }}>
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}