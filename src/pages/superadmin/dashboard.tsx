import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'

const PLAN_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  STARTER:      { bg: '#1f2937', text: '#9ca3af', border: '#374151' },
  PROFESSIONAL: { bg: '#1e3a5f', text: '#60a5fa', border: '#1d4ed8' },
  ENTERPRISE:   { bg: '#2e1065', text: '#a78bfa', border: '#7c3aed' },
}

const RISK_COLORS: Record<string, { bg: string; text: string }> = {
  LOW:      { bg: '#052e16', text: '#86efac' },
  MEDIUM:   { bg: '#422006', text: '#fbbf24' },
  HIGH:     { bg: '#450a0a', text: '#fca5a5' },
  CRITICAL: { bg: '#450a0a', text: '#ef4444' },
  EXPIRED:  { bg: '#450a0a', text: '#ef4444' },
  CHURNED:  { bg: '#1f2937', text: '#6b7280' },
}

// Gauge bileşeni
function GaugeChart({ value, max, label, color }: { value: number; max: number; label: string; color: string }) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  const angle = -90 + (pct / 100) * 180
  const r = 70
  const cx = 100, cy = 100
  const startX = cx + r * Math.cos((-90) * Math.PI / 180)
  const startY = cy + r * Math.sin((-90) * Math.PI / 180)
  const endAngle = angle * Math.PI / 180
  const endX = cx + r * Math.cos(endAngle)
  const endY = cy + r * Math.sin(endAngle)
  const largeArc = pct > 50 ? 1 : 0

  return (
    <div style={{ textAlign: 'center' }}>
      <svg width={200} height={120} viewBox="0 0 200 120">
        <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none" stroke="#1e293b" strokeWidth={16} />
        {pct > 0 && (
          <path d={`M ${startX} ${startY} A ${r} ${r} 0 ${largeArc} 1 ${endX} ${endY}`}
            fill="none" stroke={color} strokeWidth={16} strokeLinecap="round" />
        )}
        <text x={cx} y={cy - 8} textAnchor="middle" fill="white" fontSize={28} fontWeight={800}>
          {pct}%
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" fill="#64748b" fontSize={11}>
          {value} / {max}
        </text>
      </svg>
      <div style={{ fontSize: 12, color: '#94a3b8', marginTop: -8 }}>{label}</div>
    </div>
  )
}

export default function SuperAdminDashboard() {
  const router = useRouter()
  const [stats, setStats]         = useState<any>(null)
  const [tenants, setTenants]     = useState<any[]>([])
  const [loading, setLoading]     = useState(true)
  const [darkMode, setDarkMode]   = useState(true)
  const [planModal, setPlanModal] = useState<any>(null)
  const [subModal, setSubModal]   = useState<any>(null)
  const [adminModal, setAdminModal] = useState(false)
  const [admins, setAdmins]       = useState<any[]>([])
  const [selectedPlan, setSelectedPlan] = useState('')
  const [endsAt, setEndsAt]       = useState('')
  const [trialEndsAt, setTrialEndsAt] = useState('')
  const [notes, setNotes]         = useState('')
  const [newAdminEmail, setNewAdminEmail]   = useState('')
  const [newAdminPass, setNewAdminPass]     = useState('')
  const [search, setSearch]       = useState('')
  const [riskFilter, setRiskFilter] = useState('ALL')
  const [planFilter, setPlanFilter] = useState('ALL')
  const [activeTab, setActiveTab] = useState<'overview' | 'tenants' | 'admins'>('overview')

  const token   = () => localStorage.getItem('sa_token') || ''
  const headers = () => ({ Authorization: `Bearer ${token()}` })

  const bg = darkMode ? '#0f172a' : '#f8fafc'
  const card = darkMode ? '#1e293b' : '#ffffff'
  const border = darkMode ? '#334155' : '#e5e7eb'
  const text = darkMode ? 'white' : '#0f172a'
  const muted = darkMode ? '#64748b' : '#6b7280'
  const sub = darkMode ? '#94a3b8' : '#4b5563'

  useEffect(() => {
    if (!localStorage.getItem('sa_token')) { router.push('/superadmin/login'); return }
    load()
  }, [])

  const load = () => {
    Promise.all([
      fetch('${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/superadmin/stats',   { headers: headers() }).then(r => r.json()),
      fetch('${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/superadmin/tenants', { headers: headers() }).then(r => r.json()),
    ]).then(([s, t]) => {
      setStats(s)
      setTenants(Array.isArray(t) ? t : [])
      setLoading(false)
    })
  }

  const loadAdmins = () => {
    fetch('${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/superadmin/admins', { headers: headers() })
      .then(r => r.json()).then(data => setAdmins(Array.isArray(data) ? data : []))
  }

  const toggleActive = async (id: string, isActive: boolean) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL || '${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}'}/api/superadmin/tenants/${id}/${isActive ? 'deactivate' : 'activate'}`, {
      method: 'PATCH', headers: headers()
    })
    load()
  }

  const changePlan = async () => {
    if (!planModal || !selectedPlan) return
    await fetch(`${process.env.NEXT_PUBLIC_API_URL || '${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}'}/api/superadmin/tenants/${planModal.id}/plan?plan=${selectedPlan}`, {
      method: 'PATCH', headers: headers()
    })
    setPlanModal(null); load()
  }

  const saveSubscription = async () => {
    if (!subModal) return
    const params = new URLSearchParams()
    if (endsAt)      params.append('endsAt', endsAt)
    if (trialEndsAt) params.append('trialEndsAt', trialEndsAt)
    if (notes)       params.append('notes', notes)
    await fetch(`${process.env.NEXT_PUBLIC_API_URL || '${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}'}/api/superadmin/tenants/${subModal.id}/subscription?${params}`, {
      method: 'PATCH', headers: headers()
    })
    setSubModal(null); load()
  }

  const createAdmin = async () => {
    if (!newAdminEmail || !newAdminPass) return
    const res = await fetch('${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/superadmin/admins', {
      method: 'POST',
      headers: { ...headers(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: newAdminEmail, password: newAdminPass })
    })
    const data = await res.json()
    if (res.ok) {
      setNewAdminEmail(''); setNewAdminPass('')
      loadAdmins()
      alert('Admin oluşturuldu!')
    } else {
      alert(data.error)
    }
  }

  const deleteAdmin = async (id: string) => {
    if (!confirm('Bu admini silmek istediğinize emin misiniz?')) return
    await fetch(`${process.env.NEXT_PUBLIC_API_URL || '${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}'}/api/superadmin/admins/${id}`, {
      method: 'DELETE', headers: headers()
    })
    loadAdmins()
  }

  const logout = () => { localStorage.removeItem('sa_token'); router.push('/superadmin/login') }

  const exportCSV = () => {
    const rows = [
      ['Firma', 'Email', 'Plan', 'Şube', 'Personel', 'MRR', 'Durum', 'Kayıt'],
      ...tenants.map(t => [
        t.companyName, t.contactEmail, t.plan,
        t.branchCount, t.employeeCount, t.mrr,
        t.isActive ? 'Aktif' : 'Pasif',
        t.createdAt ? new Date(t.createdAt).toLocaleDateString('tr-TR') : '-'
      ])
    ]
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `firmalar_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const filtered = tenants.filter(t => {
    const matchSearch = t.companyName?.toLowerCase().includes(search.toLowerCase()) ||
                        t.contactEmail?.toLowerCase().includes(search.toLowerCase())
    const matchRisk = riskFilter === 'ALL' || t.churnRisk === riskFilter
    const matchPlan = planFilter === 'ALL' || t.plan === planFilter
    return matchSearch && matchRisk && matchPlan
  })

  // Pie chart verisi
  const pieData = stats ? [
    { name: 'Starter',      value: stats.starterCount,      color: '#6b7280' },
    { name: 'Professional', value: stats.professionalCount, color: '#3b82f6' },
    { name: 'Enterprise',   value: stats.enterpriseCount,   color: '#8b5cf6' },
  ].filter(d => d.value > 0) : []

  const inp = {
    width: '100%', padding: '10px 14px',
    background: darkMode ? '#0f172a' : '#f1f5f9',
    border: `1px solid ${border}`,
    borderRadius: 8, color: text, fontSize: 14,
    boxSizing: 'border-box' as const
  }

  return (
    <div style={{ minHeight: '100vh', background: bg, fontFamily: 'sans-serif', color: text, transition: 'all .3s' }}>

      {/* Navbar */}
      <nav style={{
        background: card, borderBottom: `1px solid ${border}`,
        padding: '0 32px', height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 20 }}>⚡</span>
            <span style={{ fontWeight: 800, fontSize: 18 }}>Zecrone</span>
            <span style={{
              background: '#312e81', color: '#a5b4fc',
              fontSize: 10, fontWeight: 700, padding: '2px 8px',
              borderRadius: 20
            }}>SUPER ADMIN</span>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {[
              { key: 'overview', label: '📊 Genel Bakış' },
              { key: 'tenants',  label: '🏢 Firmalar' },
              { key: 'admins',   label: '👤 Adminler' },
            ].map(tab => (
              <button key={tab.key}
                onClick={() => { setActiveTab(tab.key as any); if (tab.key === 'admins') loadAdmins() }}
                style={{
                  padding: '6px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer',
                  border: 'none', fontWeight: activeTab === tab.key ? 700 : 400,
                  background: activeTab === tab.key
                    ? (darkMode ? '#1e3a5f' : '#eff6ff')
                    : 'transparent',
                  color: activeTab === tab.key ? '#60a5fa' : muted
                }}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => setDarkMode(!darkMode)} style={{
            background: darkMode ? '#1e293b' : '#f1f5f9',
            border: `1px solid ${border}`, borderRadius: 8,
            padding: '6px 12px', cursor: 'pointer', fontSize: 16
          }}>
            {darkMode ? '☀️' : '🌙'}
          </button>
          <span style={{ fontSize: 12, color: muted }}>
            {new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
          <button onClick={logout} style={{
            background: 'transparent', border: `1px solid ${border}`,
            color: sub, padding: '6px 16px', borderRadius: 8,
            fontSize: 13, cursor: 'pointer'
          }}>Çıkış</button>
        </div>
      </nav>

      <div style={{ padding: '32px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', color: muted, paddingTop: 80, fontSize: 16 }}>
            Yükleniyor...
          </div>
        ) : (
          <>
            {/* ── GENEL BAKIŞ ── */}
            {activeTab === 'overview' && stats && (
              <>
                {/* Stat kartları */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 16 }}>
                  {[
                    { label: 'Toplam Firma',    value: stats.totalTenants,   color: '#60a5fa', icon: '🏢' },
                    { label: 'Aktif Firma',     value: stats.activeTenants,  color: '#34d399', icon: '✅' },
                    { label: 'Bu Ay Yeni',      value: stats.newThisMonth,   color: '#f59e0b', icon: '🆕' },
                    { label: 'Süresi Yaklaşan', value: stats.expiringSoon,   color: '#f87171', icon: '⚠️' },
                  ].map(c => (
                    <div key={c.label} style={{
                      background: card, border: `1px solid ${border}`,
                      borderRadius: 12, padding: '20px 24px',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                      <div>
                        <div style={{ fontSize: 12, color: muted, marginBottom: 6 }}>{c.label}</div>
                        <div style={{ fontSize: 32, fontWeight: 800, color: c.color }}>{c.value}</div>
                      </div>
                      <div style={{ fontSize: 28, opacity: 0.5 }}>{c.icon}</div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
                  {[
                    { label: 'MRR', value: `₺${stats.monthlyRevenue?.toLocaleString('tr-TR')}`, color: '#34d399', icon: '💰' },
                    { label: 'Starter',      value: stats.starterCount,      color: '#9ca3af', icon: '📦' },
                    { label: 'Professional', value: stats.professionalCount, color: '#60a5fa', icon: '🚀' },
                    { label: 'Enterprise',   value: stats.enterpriseCount,   color: '#a78bfa', icon: '👑' },
                  ].map(c => (
                    <div key={c.label} style={{
                      background: card, border: `1px solid ${border}`,
                      borderRadius: 12, padding: '20px 24px',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                      <div>
                        <div style={{ fontSize: 12, color: muted, marginBottom: 6 }}>{c.label}</div>
                        <div style={{ fontSize: 28, fontWeight: 800, color: c.color }}>{c.value}</div>
                      </div>
                      <div style={{ fontSize: 28, opacity: 0.5 }}>{c.icon}</div>
                    </div>
                  ))}
                </div>

                {/* Grafikler */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 20 }}>

                  {/* Alan grafiği - Aylık büyüme */}
                  <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 16, padding: 24 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 20 }}>📈 Son 6 Ay Büyüme</div>
                    <ResponsiveContainer width="100%" height={220}>
                      <AreaChart data={stats.monthlyGrowth}>
                        <defs>
                          <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#1e293b' : '#f1f5f9'} />
                        <XAxis dataKey="month" tick={{ fill: muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ background: card, border: `1px solid ${border}`, borderRadius: 8, color: text }} />
                        <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2}
                          fill="url(#colorCount)" name="Yeni Firma" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Pie chart - Plan dağılımı */}
                  <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 16, padding: 24 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 20 }}>🥧 Plan Dağılımı</div>
                    {pieData.length > 0 ? (
                      <>
                        <ResponsiveContainer width="100%" height={180}>
                          <PieChart>
                            <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                              dataKey="value" paddingAngle={3}>
                              {pieData.map((entry, i) => (
                                <Cell key={i} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip contentStyle={{ background: card, border: `1px solid ${border}`, borderRadius: 8, color: text }} />
                          </PieChart>
                        </ResponsiveContainer>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                          {pieData.map(d => (
                            <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ width: 10, height: 10, borderRadius: '50%', background: d.color }} />
                              <span style={{ fontSize: 12, color: sub }}>{d.name}</span>
                              <span style={{ fontSize: 12, fontWeight: 700, marginLeft: 'auto', color: text }}>{d.value}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div style={{ textAlign: 'center', color: muted, paddingTop: 60 }}>Veri yok</div>
                    )}
                  </div>
                </div>

                {/* Gauge'lar */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
                  <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 16, padding: 24, textAlign: 'center' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>🎯 Aktiflik Oranı</div>
                    <GaugeChart value={stats.activeTenants} max={stats.totalTenants || 1} label="Aktif Firma" color="#34d399" />
                  </div>
                  <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 16, padding: 24, textAlign: 'center' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>💎 Premium Oran</div>
                    <GaugeChart
                      value={(stats.professionalCount || 0) + (stats.enterpriseCount || 0)}
                      max={stats.totalTenants || 1}
                      label="Pro + Enterprise"
                      color="#a78bfa"
                    />
                  </div>
                  <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 16, padding: 24, textAlign: 'center' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>📅 Aylık Hedef</div>
                    <GaugeChart value={stats.newThisMonth} max={10} label="Hedef: 10 Yeni Firma" color="#f59e0b" />
                  </div>
                </div>
              </>
            )}

            {/* ── FİRMALAR ── */}
            {activeTab === 'tenants' && (
              <>
                {/* Filtreler */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
                  <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Firma adı veya email ara..."
                    style={{ ...inp, width: 280 }} />
                  <select value={planFilter} onChange={e => setPlanFilter(e.target.value)}
                    style={{ ...inp, width: 160 }}>
                    <option value="ALL">Tüm Planlar</option>
                    <option value="STARTER">Starter</option>
                    <option value="PROFESSIONAL">Professional</option>
                    <option value="ENTERPRISE">Enterprise</option>
                  </select>
                  <select value={riskFilter} onChange={e => setRiskFilter(e.target.value)}
                    style={{ ...inp, width: 160 }}>
                    <option value="ALL">Tüm Riskler</option>
                    <option value="LOW">Düşük Risk</option>
                    <option value="MEDIUM">Orta Risk</option>
                    <option value="HIGH">Yüksek Risk</option>
                    <option value="CRITICAL">Kritik</option>
                    <option value="EXPIRED">Süresi Dolmuş</option>
                    <option value="CHURNED">Ayrılmış</option>
                  </select>
                  <button onClick={exportCSV}
                    style={{
                      padding: '10px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                      cursor: 'pointer', border: 'none',
                      background: '#166534', color: '#86efac', marginLeft: 'auto'
                    }}>
                    📥 CSV İndir
                  </button>
                </div>

                <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 16, overflow: 'hidden' }}>
                  <div style={{
                    padding: '14px 24px', borderBottom: `1px solid ${border}`,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}>
                    <span style={{ fontWeight: 700 }}>Firmalar</span>
                    <span style={{ fontSize: 13, color: muted }}>{filtered.length} firma</span>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1100 }}>
                      <thead>
                        <tr style={{ background: darkMode ? '#0f172a' : '#f8fafc' }}>
                          {['Firma', 'Plan', 'Şube', 'Personel', 'MRR', 'Risk', 'Kalan Gün', 'Son Aktivite', 'Durum', 'İşlemler'].map(h => (
                            <th key={h} style={{
                              padding: '10px 14px', textAlign: 'left',
                              fontSize: 10, color: muted, fontWeight: 700,
                              textTransform: 'uppercase', letterSpacing: '0.05em'
                            }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map((t: any) => {
                          const ps = PLAN_COLORS[t.plan] || PLAN_COLORS.STARTER
                          const rs = RISK_COLORS[t.churnRisk] || RISK_COLORS.LOW
                          const dl = t.daysLeft
                          const dlColor = dl === null ? muted : dl < 0 ? '#ef4444' : dl <= 3 ? '#ef4444' : dl <= 7 ? '#f59e0b' : '#34d399'
                          return (
                            <tr key={t.id} style={{ borderTop: `1px solid ${border}` }}>
                              <td style={{ padding: '12px 14px' }}>
                                <div style={{ fontWeight: 600, fontSize: 14 }}>{t.companyName}</div>
                                <div style={{ fontSize: 11, color: muted }}>{t.contactEmail}</div>
                                {t.notes && <div style={{ fontSize: 11, color: '#f59e0b', marginTop: 2 }}>📝 {t.notes}</div>}
                              </td>
                              <td style={{ padding: '12px 14px' }}>
                                <span style={{
                                  background: ps.bg, color: ps.text, border: `1px solid ${ps.border}`,
                                  padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700
                                }}>{t.plan}</span>
                              </td>
                              <td style={{ padding: '12px 14px', fontSize: 18, fontWeight: 800, color: '#60a5fa' }}>{t.branchCount}</td>
                              <td style={{ padding: '12px 14px', fontSize: 18, fontWeight: 800, color: '#34d399' }}>{t.employeeCount}</td>
                              <td style={{ padding: '12px 14px', fontWeight: 700, color: '#34d399', fontSize: 14 }}>
                                ₺{t.mrr?.toLocaleString('tr-TR')}
                              </td>
                              <td style={{ padding: '12px 14px' }}>
                                <span style={{
                                  background: rs.bg, color: rs.text,
                                  padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700
                                }}>{t.churnRisk}</span>
                              </td>
                              <td style={{ padding: '12px 14px', fontWeight: 700, color: dlColor, fontSize: 13 }}>
                                {dl === null ? '—' : dl < 0 ? '⛔ Dolmuş' : t.isTrial ? `🔬 ${dl}g` : `${dl}g`}
                              </td>
                              <td style={{ padding: '12px 14px', fontSize: 11, color: muted }}>
                                {t.lastActivity ? new Date(t.lastActivity).toLocaleDateString('tr-TR') : '—'}
                              </td>
                              <td style={{ padding: '12px 14px' }}>
                                <span style={{
                                  background: t.isActive ? '#052e16' : '#450a0a',
                                  color: t.isActive ? '#86efac' : '#fca5a5',
                                  padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700
                                }}>{t.isActive ? '● Aktif' : '● Pasif'}</span>
                              </td>
                              <td style={{ padding: '12px 14px' }}>
                                <div style={{ display: 'flex', gap: 4 }}>
                                  <button onClick={() => toggleActive(t.id, t.isActive)} style={{
                                    padding: '3px 8px', borderRadius: 5, fontSize: 10, fontWeight: 600,
                                    cursor: 'pointer', border: 'none',
                                    background: t.isActive ? '#450a0a' : '#052e16',
                                    color: t.isActive ? '#fca5a5' : '#86efac'
                                  }}>{t.isActive ? 'Askıya Al' : 'Aktifleştir'}</button>
                                  <button onClick={() => { setPlanModal(t); setSelectedPlan(t.plan) }} style={{
                                    padding: '3px 8px', borderRadius: 5, fontSize: 10,
                                    cursor: 'pointer', border: `1px solid ${border}`,
                                    background: 'transparent', color: sub
                                  }}>Plan</button>
                                  <button onClick={() => {
                                    setSubModal(t)
                                    setEndsAt(t.subscriptionEndsAt?.split('T')[0] || '')
                                    setTrialEndsAt(t.trialEndsAt?.split('T')[0] || '')
                                    setNotes(t.notes || '')
                                  }} style={{
                                    padding: '3px 8px', borderRadius: 5, fontSize: 10,
                                    cursor: 'pointer', border: `1px solid ${border}`,
                                    background: 'transparent', color: sub
                                  }}>Abonelik</button>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* ── ADMİNLER ── */}
            {activeTab === 'admins' && (
              <>
                <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 16, padding: 24, marginBottom: 20 }}>
                  <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 700 }}>➕ Yeni Super Admin Ekle</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 12, alignItems: 'end' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, color: muted, marginBottom: 6, fontWeight: 600 }}>EMAIL</label>
                      <input type="email" value={newAdminEmail} onChange={e => setNewAdminEmail(e.target.value)}
                        placeholder="admin@zecrone.com" style={inp} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, color: muted, marginBottom: 6, fontWeight: 600 }}>ŞİFRE</label>
                      <input type="password" value={newAdminPass} onChange={e => setNewAdminPass(e.target.value)}
                        placeholder="En az 8 karakter" style={inp} />
                    </div>
                    <button onClick={createAdmin} style={{
                      padding: '10px 20px',
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      border: 'none', borderRadius: 8, color: 'white',
                      fontSize: 13, fontWeight: 700, cursor: 'pointer'
                    }}>Oluştur</button>
                  </div>
                </div>

                <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 16, overflow: 'hidden' }}>
                  <div style={{ padding: '14px 24px', borderBottom: `1px solid ${border}`, fontWeight: 700 }}>
                    Super Admin Listesi
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: darkMode ? '#0f172a' : '#f8fafc' }}>
                        {['Email', 'Son Giriş', 'Durum', 'İşlem'].map(h => (
                          <th key={h} style={{
                            padding: '10px 16px', textAlign: 'left',
                            fontSize: 10, color: muted, fontWeight: 700, textTransform: 'uppercase'
                          }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {admins.map((a: any) => (
                        <tr key={a.id} style={{ borderTop: `1px solid ${border}` }}>
                          <td style={{ padding: '12px 16px', fontWeight: 600 }}>{a.email}</td>
                          <td style={{ padding: '12px 16px', fontSize: 12, color: muted }}>
                            {a.lastLogin ? new Date(a.lastLogin).toLocaleString('tr-TR') : '—'}
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{
                              background: a.isActive ? '#052e16' : '#450a0a',
                              color: a.isActive ? '#86efac' : '#fca5a5',
                              padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700
                            }}>{a.isActive ? 'Aktif' : 'Pasif'}</span>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <button onClick={() => deleteAdmin(a.id)} style={{
                              padding: '4px 10px', borderRadius: 6, fontSize: 11,
                              cursor: 'pointer', border: 'none',
                              background: '#450a0a', color: '#fca5a5', fontWeight: 600
                            }}>Sil</button>
                          </td>
                        </tr>
                      ))}
                      {admins.length === 0 && (
                        <tr><td colSpan={4} style={{ padding: '24px', textAlign: 'center', color: muted }}>
                          Admin bulunamadı
                        </td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Plan modal */}
      {planModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 16, padding: 28, width: 360 }}>
            <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700, color: text }}>Plan Değiştir</h3>
            <p style={{ margin: '0 0 20px', fontSize: 13, color: muted }}>{planModal.companyName}</p>
            <select value={selectedPlan} onChange={e => setSelectedPlan(e.target.value)} style={{ ...inp, marginBottom: 20 }}>
              <option value="STARTER">Starter — ₺499/ay</option>
              <option value="PROFESSIONAL">Professional — ₺1.499/ay</option>
              <option value="ENTERPRISE">Enterprise — ₺4.999/ay</option>
            </select>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setPlanModal(null)} style={{ flex: 1, padding: '10px', background: 'transparent', border: `1px solid ${border}`, borderRadius: 8, color: sub, fontSize: 13, cursor: 'pointer' }}>İptal</button>
              <button onClick={changePlan} style={{ flex: 1, padding: '10px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: 8, color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Kaydet</button>
            </div>
          </div>
        </div>
      )}

      {/* Abonelik modal */}
      {subModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 16, padding: 28, width: 420 }}>
            <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700, color: text }}>Abonelik Yönetimi</h3>
            <p style={{ margin: '0 0 20px', fontSize: 13, color: muted }}>{subModal.companyName}</p>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 11, color: muted, marginBottom: 6, fontWeight: 600 }}>ABONELİK BİTİŞ TARİHİ</label>
              <input type="date" value={endsAt} onChange={e => setEndsAt(e.target.value)} style={inp} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 11, color: muted, marginBottom: 6, fontWeight: 600 }}>DENEME SÜRESİ BİTİŞİ</label>
              <input type="date" value={trialEndsAt} onChange={e => setTrialEndsAt(e.target.value)} style={inp} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 11, color: muted, marginBottom: 6, fontWeight: 600 }}>NOT</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
                placeholder="İç not..." style={{ ...inp, resize: 'vertical' as const }} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setSubModal(null)} style={{ flex: 1, padding: '10px', background: 'transparent', border: `1px solid ${border}`, borderRadius: 8, color: sub, fontSize: 13, cursor: 'pointer' }}>İptal</button>
              <button onClick={saveSubscription} style={{ flex: 1, padding: '10px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: 8, color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Kaydet</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
