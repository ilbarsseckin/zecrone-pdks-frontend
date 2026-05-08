import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { getPlanFeatures } from '../api/index'

type ReportTab = 'attendance' | 'monthly' | 'late' | 'leaves'

export default function Reports() {
  const [tab, setTab]             = useState<ReportTab>('attendance')
  const [branches, setBranches]   = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading]     = useState(true)

  const now = new Date()
  const [branchId, setBranchId]     = useState('')
  const [employeeId, setEmployeeId] = useState('')
  const [from, setFrom] = useState(() => new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0])
  const [to, setTo]     = useState(() => now.toISOString().split('T')[0])
  const [year, setYear]   = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)

  const [preview, setPreview]     = useState<any[]>([])
  const [lateStats, setLateStats] = useState<any[]>([])
  const [previewLoading, setPreviewLoading] = useState(false)

  const features = getPlanFeatures()
  const token   = () => localStorage.getItem('pdks_token') || ''
  const headers = () => ({ Authorization: `Bearer ${token()}` })

  useEffect(() => {
    if (!localStorage.getItem('pdks_token')) { window.location.href = '/'; return }
    Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/branches',  { headers: headers() }).then(r => r.json()),
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/employees', { headers: headers() }).then(r => r.json()),
    ]).then(([brs, emps]) => {
      setBranches(Array.isArray(brs) ? brs : [])
      setEmployees(Array.isArray(emps) ? emps : [])
      if (Array.isArray(brs) && brs.length > 0) setBranchId(brs[0].id)
      setLoading(false)
    })
  }, [])

  const downloadBlob = (url: string, filename: string) => {
    if (!features.canExportExcel) {
      alert('Excel export özelliği Professional veya Enterprise planlarda kullanılabilir. Planınızı yükseltin.')
      return
    }
    fetch(url, { headers: headers() })
      .then(r => r.blob())
      .then(blob => {
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = filename
        a.click()
      })
  }

  const downloadAttendanceExcel = () => {
    if (!branchId) { alert('Şube seçin'); return }
    downloadBlob(
      `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}'}/api/reports/attendance/excel?branchId=${branchId}&from=${from}&to=${to}`,
      `yoklama_${from}_${to}.xlsx`
    )
  }

  const downloadMonthlySummary = () => {
    if (!branchId) { alert('Şube seçin'); return }
    downloadBlob(
      `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}'}/api/reports/monthly-summary/excel?branchId=${branchId}&year=${year}&month=${month}`,
      `ozet_${year}_${String(month).padStart(2, '0')}.xlsx`
    )
  }

  const downloadLeavesExcel = () => {
    downloadBlob(
      `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}'}/api/reports/leaves/excel?from=${from}&to=${to}`,
      `izinler_${from}_${to}.xlsx`
    )
  }

  const loadPreview = () => {
    if (!branchId) return
    setPreviewLoading(true)
    fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}'}/api/attendance/daily?branchId=${branchId}&date=${to}`, { headers: headers() })
      .then(r => r.json())
      .then(data => { setPreview(Array.isArray(data) ? data : []); setPreviewLoading(false) })
  }

  const loadLateStats = () => {
    if (!branchId) return
    setPreviewLoading(true)
    fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}'}/api/reports/late-stats?branchId=${branchId}&from=${from}&to=${to}`, { headers: headers() })
      .then(r => r.json())
      .then(data => { setLateStats(Array.isArray(data) ? data : []); setPreviewLoading(false) })
  }

  const formatTime = (dt: string) =>
    dt ? new Date(dt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : '-'

  const TABS: { key: ReportTab; label: string; icon: string }[] = [
    { key: 'attendance', label: 'Yoklama Raporu', icon: '📊' },
    { key: 'monthly',   label: 'Aylık Özet',     icon: '📅' },
    { key: 'late',      label: 'Geç Kalma',      icon: '⏰' },
    { key: 'leaves',    label: 'İzin Raporu',    icon: '🏖' },
  ]

  const ExcelBtn = ({ onClick, label }: { onClick: () => void; label: string }) => (
    <button onClick={onClick}
      className={`px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 ${
        features.canExportExcel
          ? 'bg-green-600 text-white hover:bg-green-700'
          : 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800'
      }`}>
      {features.canExportExcel ? '📥' : '🔒'} {label}
      {!features.canExportExcel && (
        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full ml-1">Pro</span>
      )}
    </button>
  )

  return (
    <Layout>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Raporlar</h2>
        <p className="text-sm text-gray-500">Excel formatında rapor indir</p>
      </div>

      {!features.canExportExcel && (
        <div className="mb-5 flex items-center justify-between bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl px-5 py-3">
          <div className="flex items-center gap-3">
            <span className="text-xl">🔒</span>
            <div>
              <div className="text-sm font-semibold text-amber-800 dark:text-amber-400">
                Excel export Professional ve Enterprise planlarda kullanılabilir
              </div>
              <div className="text-xs text-amber-600 dark:text-amber-500">
                Şu anki planınız: <strong>{features.plan || 'STARTER'}</strong>
              </div>
            </div>
          </div>
          <a href="/hr/register"
            className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 whitespace-nowrap">
            Planı Yükselt →
          </a>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64 text-gray-400">Yükleniyor...</div>
      ) : (
        <div className="flex gap-6">
          <aside className="w-48 shrink-0">
            <nav className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              {TABS.map(t => (
                <button key={t.key} onClick={() => setTab(t.key)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all border-l-2 text-left ${
                    tab === t.key
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}>
                  <span>{t.icon}</span>
                  <span>{t.label}</span>
                </button>
              ))}
            </nav>
          </aside>

          <div className="flex-1 space-y-5">

            {tab === 'attendance' && (
              <>
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Yoklama Raporu</h3>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Şube</label>
                      <select value={branchId} onChange={e => setBranchId(e.target.value)}
                        className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm">
                        {branches.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Başlangıç</label>
                      <input type="date" value={from} onChange={e => setFrom(e.target.value)}
                        className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Bitiş</label>
                      <input type="date" value={to} onChange={e => setTo(e.target.value)}
                        className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm" />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={loadPreview}
                      className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800">
                      Önizle
                    </button>
                    <ExcelBtn onClick={downloadAttendanceExcel} label="Excel İndir" />
                  </div>
                </div>

                {previewLoading && <div className="text-center text-gray-400 py-8">Yükleniyor...</div>}
                {!previewLoading && preview.length > 0 && (
                  <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 text-sm font-semibold">
                      Önizleme — {preview.length} kayıt
                    </div>
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 uppercase">
                          <th className="px-6 py-3 text-left">Tarih</th>
                          <th className="px-6 py-3 text-left">Giriş</th>
                          <th className="px-6 py-3 text-left">Çıkış</th>
                          <th className="px-6 py-3 text-left">Süre</th>
                          <th className="px-6 py-3 text-left">Durum</th>
                        </tr>
                      </thead>
                      <tbody>
                        {preview.map((r: any) => (
                          <tr key={r.id} className="border-t border-gray-100 dark:border-gray-800">
                            <td className="px-6 py-3 text-sm">{r.workDate}</td>
                            <td className="px-6 py-3 text-sm">{formatTime(r.checkIn)}</td>
                            <td className="px-6 py-3 text-sm">{formatTime(r.checkOut)}</td>
                            <td className="px-6 py-3 text-sm">
                              {r.workMinutes ? `${Math.floor(r.workMinutes / 60)}s ${r.workMinutes % 60}dk` : '-'}
                            </td>
                            <td className="px-6 py-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                r.status === 'PRESENT' ? 'bg-green-100 text-green-700' :
                                r.status === 'LATE'    ? 'bg-amber-100 text-amber-700' :
                                                          'bg-red-100 text-red-700'
                              }`}>
                                {r.status === 'PRESENT' ? 'Geldi' : r.status === 'LATE' ? 'Geç' : 'Gelmedi'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}

            {tab === 'monthly' && (
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-1">Aylık Devam Özeti</h3>
                <p className="text-sm text-gray-500 mb-5">
                  Her personel için aylık geldi/geç/gelmedi sayıları ve toplam çalışma saati.
                </p>
                <div className="grid grid-cols-3 gap-4 mb-5">
                  <div>
                    <label className="block text-sm font-medium mb-1">Şube</label>
                    <select value={branchId} onChange={e => setBranchId(e.target.value)}
                      className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm">
                      {branches.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Yıl</label>
                    <input type="number" value={year} onChange={e => setYear(parseInt(e.target.value))}
                      className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm"
                      min={2020} max={2030} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Ay</label>
                    <select value={month} onChange={e => setMonth(parseInt(e.target.value))}
                      className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm">
                      {['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran',
                        'Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'].map((m, i) => (
                        <option key={i + 1} value={i + 1}>{m}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <ExcelBtn onClick={downloadMonthlySummary} label="Excel İndir" />
              </div>
            )}

            {tab === 'late' && (
              <>
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-1">Geç Kalma İstatistikleri</h3>
                  <p className="text-sm text-gray-500 mb-5">En çok geç kalan personelden sıralı.</p>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Şube</label>
                      <select value={branchId} onChange={e => setBranchId(e.target.value)}
                        className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm">
                        {branches.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Başlangıç</label>
                      <input type="date" value={from} onChange={e => setFrom(e.target.value)}
                        className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Bitiş</label>
                      <input type="date" value={to} onChange={e => setTo(e.target.value)}
                        className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm" />
                    </div>
                  </div>
                  <button onClick={loadLateStats}
                    className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm hover:bg-amber-700 font-medium">
                    Hesapla
                  </button>
                </div>

                {previewLoading && <div className="text-center text-gray-400 py-8">Hesaplanıyor...</div>}
                {!previewLoading && lateStats.length > 0 && (
                  <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 text-sm font-semibold">
                      {lateStats.length} personel listeleniyor
                    </div>
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 uppercase">
                          <th className="px-6 py-3 text-left">#</th>
                          <th className="px-6 py-3 text-left">Ad Soyad</th>
                          <th className="px-6 py-3 text-left">Departman</th>
                          <th className="px-6 py-3 text-center">Geç Kalma</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lateStats.map((s: any, i: number) => (
                          <tr key={s.employeeId} className="border-t border-gray-100 dark:border-gray-800">
                            <td className="px-6 py-3 text-sm text-gray-500">{i + 1}</td>
                            <td className="px-6 py-3 font-medium">{s.fullName}</td>
                            <td className="px-6 py-3 text-sm text-gray-500">{s.department || '-'}</td>
                            <td className="px-6 py-3 text-center">
                              <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-semibold">
                                {s.lateCount} kez
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}

            {tab === 'leaves' && (
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-1">İzin Raporu</h3>
                <p className="text-sm text-gray-500 mb-5">
                  Tüm izin taleplerini Excel olarak indir.
                </p>
                <div className="grid grid-cols-2 gap-4 mb-5">
                  <div>
                    <label className="block text-sm font-medium mb-1">Başlangıç</label>
                    <input type="date" value={from} onChange={e => setFrom(e.target.value)}
                      className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Bitiş</label>
                    <input type="date" value={to} onChange={e => setTo(e.target.value)}
                      className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm" />
                  </div>
                </div>
                <ExcelBtn onClick={downloadLeavesExcel} label="Excel İndir" />
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  )
}
