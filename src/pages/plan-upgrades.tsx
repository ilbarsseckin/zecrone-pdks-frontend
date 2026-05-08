import { useEffect, useState } from 'react'
import Layout from '../components/Layout'

interface PlanUpgradeRequest {
  id: string
  tenantId: string
  currentPlan: string
  requestedPlan: string
  note: string | null
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  reviewNote: string | null
  createdAt: string
  updatedAt: string
}

const PLAN_LABELS: Record<string, string> = {
  STARTER:      'Başlangıç',
  PROFESSIONAL: 'Profesyonel',
  ENTERPRISE:   'Kurumsal',
}

const PLAN_COLORS: Record<string, string> = {
  STARTER:      'bg-gray-100 text-gray-600',
  PROFESSIONAL: 'bg-blue-100 text-blue-700',
  ENTERPRISE:   'bg-purple-100 text-purple-700',
}

const STATUS_COLORS: Record<string, string> = {
  PENDING:  'bg-amber-100 text-amber-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-600',
}

const STATUS_LABELS: Record<string, string> = {
  PENDING:  'Bekliyor',
  APPROVED: 'Onaylandı',
  REJECTED: 'Reddedildi',
}

const PLANS = ['STARTER', 'PROFESSIONAL', 'ENTERPRISE'] as const

export default function PlanUpgrades() {
  const [myRequests, setMyRequests] = useState<PlanUpgradeRequest[]>([])
  const [myTenant, setMyTenant]     = useState<any>(null)
  const [loading, setLoading]       = useState(true)
  const [showModal, setShowModal]   = useState(false)
  const [form, setForm]             = useState({ requestedPlan: 'PROFESSIONAL', note: '' })
  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const token   = () => localStorage.getItem('pdks_token') || ''
  const headers = () => ({ Authorization: `Bearer ${token()}` })

  const load = () => {
    Promise.all([
      fetch('${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/tenants/me',           { headers: headers() }).then(r => r.json()),
      fetch('${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/plan-upgrades/my',     { headers: headers() }).then(r => r.json()),
    ]).then(([tenant, reqs]) => {
      setMyTenant(tenant)
      setMyRequests(reqs)
      setLoading(false)
    })
  }

  useEffect(() => {
    if (!localStorage.getItem('pdks_token')) { window.location.href = '/'; return }
    load()
  }, [])

  const hasPending = myRequests.some(r => r.status === 'PENDING')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    const res = await fetch('${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/plan-upgrades', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers() },
      body: JSON.stringify(form),
    })
    setSubmitting(false)
    if (res.ok) {
      setShowModal(false)
      setSuccessMsg('Plan yükseltme talebiniz alındı. Yöneticiniz onayladığında planınız güncellenecek.')
      load()
    } else {
      const d = await res.json()
      alert(d.error)
    }
  }

  const formatDate = (s: string) =>
    new Date(s).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })

  const planIndex = (p: string) => PLANS.indexOf(p as any)

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Plan & Yükseltme</h2>
          <p className="text-sm text-gray-500 mt-0.5">Abonelik planınızı yönetin</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64 text-gray-400">Yükleniyor...</div>
      ) : (
        <div className="space-y-6">

          {successMsg && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl px-5 py-4 text-sm text-green-700 dark:text-green-400 flex items-start gap-3">
              <span className="text-lg">✅</span>
              <div>
                <p className="font-medium">Talep Alındı</p>
                <p className="mt-0.5 text-green-600 dark:text-green-500">{successMsg}</p>
              </div>
              <button onClick={() => setSuccessMsg(null)} className="ml-auto text-green-400 hover:text-green-600">✕</button>
            </div>
          )}

          {/* Mevcut Plan */}
          {myTenant && (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
              <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Mevcut Plan</h3>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-2xl">
                    {myTenant.plan === 'ENTERPRISE' ? '🏆' : myTenant.plan === 'PROFESSIONAL' ? '⭐' : '🚀'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-lg">{PLAN_LABELS[myTenant.plan]}</h4>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${PLAN_COLORS[myTenant.plan]}`}>
                        {myTenant.plan}
                      </span>
                    </div>
                    <div className="flex gap-4 mt-1 text-sm text-gray-500">
                      <span>Max {myTenant.maxBranches === 2147483647 ? '∞' : myTenant.maxBranches} şube</span>
                      <span>·</span>
                      <span>Max {myTenant.maxEmployees === 2147483647 ? '∞' : myTenant.maxEmployees} personel</span>
                    </div>
                  </div>
                </div>
                {myTenant.plan !== 'ENTERPRISE' && (
                  <button
                    onClick={() => setShowModal(true)}
                    disabled={hasPending}
                    className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      hasPending
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {hasPending ? '⏳ Talep Bekliyor' : '↑ Planı Yükselt'}
                  </button>
                )}
              </div>

              {/* Plan karşılaştırma */}
              <div className="mt-6 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 uppercase">
                      <th className="px-4 py-3 text-left">Plan</th>
                      <th className="px-4 py-3 text-center">Şube</th>
                      <th className="px-4 py-3 text-center">Personel</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { key: 'STARTER',      branches: '3',   employees: '50' },
                      { key: 'PROFESSIONAL', branches: '20',  employees: '500' },
                      { key: 'ENTERPRISE',   branches: '∞',   employees: '∞' },
                    ].map(row => (
                      <tr key={row.key}
                        className={`border-t border-gray-100 dark:border-gray-800 ${
                          myTenant.plan === row.key ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                        }`}>
                        <td className="px-4 py-3 font-medium flex items-center gap-2">
                          {PLAN_LABELS[row.key]}
                          {myTenant.plan === row.key && (
                            <span className="text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded-full">Aktif</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center text-gray-500">{row.branches}</td>
                        <td className="px-4 py-3 text-center text-gray-500">{row.employees}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Talep Geçmişi */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
              <h3 className="font-semibold text-gray-800 dark:text-gray-100">Talep Geçmişi</h3>
            </div>
            {myRequests.length === 0 ? (
              <div className="px-6 py-10 text-center text-gray-400 text-sm">
                Henüz plan yükseltme talebi yok.
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 uppercase">
                    <th className="px-6 py-3 text-left">Talep Tarihi</th>
                    <th className="px-6 py-3 text-left">Mevcut Plan</th>
                    <th className="px-6 py-3 text-left">Talep Edilen</th>
                    <th className="px-6 py-3 text-left">Durum</th>
                    <th className="px-6 py-3 text-left">Not</th>
                  </tr>
                </thead>
                <tbody>
                  {myRequests.map(req => (
                    <tr key={req.id} className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-6 py-4 text-sm text-gray-500">{formatDate(req.createdAt)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${PLAN_COLORS[req.currentPlan]}`}>
                          {PLAN_LABELS[req.currentPlan]}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${PLAN_COLORS[req.requestedPlan]}`}>
                          {PLAN_LABELS[req.requestedPlan]}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[req.status]}`}>
                          {STATUS_LABELS[req.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {req.reviewNote || req.note || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Plan Yükseltme Modal */}
      {showModal && myTenant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-lg">Plan Yükseltme Talebi</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Yeni Plan</label>
                <div className="space-y-2">
                  {PLANS.filter(p => planIndex(p) > planIndex(myTenant.plan)).map(plan => (
                    <label key={plan}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        form.requestedPlan === plan
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}>
                      <input type="radio" name="plan" value={plan}
                        checked={form.requestedPlan === plan}
                        onChange={() => setForm({ ...form, requestedPlan: plan })}
                        className="accent-blue-600" />
                      <div>
                        <div className="font-medium text-sm">{PLAN_LABELS[plan]}</div>
                        <div className="text-xs text-gray-500">
                          {plan === 'PROFESSIONAL' ? 'Max 20 şube, 500 personel' : 'Sınırsız şube ve personel'}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Not (opsiyonel)</label>
                <textarea value={form.note}
                  onChange={e => setForm({ ...form, note: e.target.value })}
                  className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm"
                  rows={2} placeholder="Yükseltme nedeninizi belirtin..." />
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-3 text-xs text-amber-700 dark:text-amber-400">
                ℹ️ Talebiniz yönetici onayına gönderilecek. Onaylandığında planınız otomatik güncellenecektir.
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800">
                  İptal
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 font-medium disabled:opacity-60">
                  {submitting ? 'Gönderiliyor...' : 'Talep Gönder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}
