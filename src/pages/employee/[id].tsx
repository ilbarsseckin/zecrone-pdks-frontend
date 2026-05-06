import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import { useRouter } from 'next/router'

const LEAVE_TYPES: Record<string, string> = {
  ANNUAL: 'Yıllık', SICK: 'Hastalık', MATERNITY: 'Doğum',
  PATERNITY: 'Babalık', MARRIAGE: 'Evlilik', BEREAVEMENT: 'Vefat',
  UNPAID: 'Ücretsiz', OTHER: 'Diğer',
}

export default function EmployeeProfile() {
  const router   = useRouter()
  const { id }   = router.query
  const [emp, setEmp]           = useState<any>(null)
  const [branch, setBranch]     = useState<any>(null)
  const [balance, setBalance]   = useState<any>(null)
  const [leaves, setLeaves]     = useState<any[]>([])
  const [attendance, setAttendance] = useState<any[]>([])
  const [loading, setLoading]   = useState(true)
  const [editing, setEditing]   = useState(false)
  const [form, setForm]         = useState<any>({})
  const [saving, setSaving]     = useState(false)

  const getToken = () => localStorage.getItem('pdks_token') || ''
  const h = () => ({ Authorization: `Bearer ${getToken()}` })
  const year  = new Date().getFullYear()
  const month = new Date().getMonth() + 1

  useEffect(() => {
    if (!id) return
    const token = localStorage.getItem('pdks_token')
    if (!token) { window.location.href = '/'; return }

    Promise.all([
      fetch(`http://localhost:8080/api/employees/${id}`, { headers: h() }).then(r => r.json()),
      fetch(`http://localhost:8080/api/leaves/employee/${id}`, { headers: h() }).then(r => r.json()),
      fetch(`http://localhost:8080/api/attendance/monthly?employeeId=${id}&year=${year}&month=${month}`, { headers: h() }).then(r => r.json()),
      fetch(`http://localhost:8080/api/leaves/balance/${id}?year=${year}`, { headers: h() }).then(r => r.json()),
    ]).then(([empData, leavesData, attData, balData]) => {
      setEmp(empData)
      setForm({
        firstName:  empData.firstName,
        lastName:   empData.lastName,
        email:      empData.email || '',
        phone:      empData.phone || '',
        department: empData.department || '',
        position:   empData.position || '',
      })
      setLeaves(Array.isArray(leavesData) ? leavesData : [])
      setAttendance(Array.isArray(attData) ? attData : [])
      setBalance(balData)

      if (empData.branchId) {
        fetch(`http://localhost:8080/api/branches/${empData.branchId}`, { headers: h() })
          .then(r => r.json()).then(setBranch)
      }
      setLoading(false)
    })
  }, [id])

  const save = async () => {
    setSaving(true)
    const res = await fetch(`http://localhost:8080/api/employees/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...h() },
      body: JSON.stringify({ ...form, branchId: emp.branchId })
    })
    if (res.ok) {
      const updated = await res.json()
      setEmp(updated)
      setEditing(false)
    } else {
      alert('Güncelleme başarısız')
    }
    setSaving(false)
  }

  const attStats = {
    present: attendance.filter(a => a.status === 'PRESENT').length,
    late:    attendance.filter(a => a.status === 'LATE').length,
    absent:  attendance.filter(a => a.status === 'ABSENT').length,
    totalMin: attendance.reduce((s, a) => s + (a.workMinutes || 0), 0),
  }

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center h-64 text-gray-400">Yükleniyor...</div>
    </Layout>
  )

  if (!emp) return (
    <Layout>
      <div className="text-center py-20 text-gray-400">Personel bulunamadı</div>
    </Layout>
  )

  return (
    <Layout>
      {/* Geri butonu */}
      <button onClick={() => router.push('/employees')}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
        ← Personel Listesi
      </button>

      <div className="grid grid-cols-3 gap-6">

        {/* Sol: Kişisel bilgiler */}
        <div className="col-span-1 space-y-4">

          {/* Avatar ve isim */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 text-center">
            <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 text-3xl font-bold mx-auto mb-4">
              {emp.firstName?.charAt(0)}{emp.lastName?.charAt(0)}
            </div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">{emp.fullName}</h2>
            <p className="text-sm text-gray-500">{emp.position || '-'}</p>
            <p className="text-xs text-gray-400 mt-1">{branch?.name || '-'}</p>
            <span className={`mt-3 inline-block px-3 py-1 rounded-full text-xs font-medium ${
              emp.status === 'ACTIVE'   ? 'bg-green-100 text-green-700' :
              emp.status === 'ON_LEAVE' ? 'bg-amber-100 text-amber-700' :
                                          'bg-gray-100 text-gray-500'
            }`}>
              {emp.status === 'ACTIVE' ? 'Aktif' : emp.status === 'ON_LEAVE' ? 'İzinli' : 'Pasif'}
            </span>
          </div>

          {/* Bilgiler */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300">Kişisel Bilgiler</h3>
              <button onClick={() => setEditing(!editing)}
                className="text-xs text-blue-600 hover:text-blue-700">
                {editing ? 'İptal' : 'Düzenle'}
              </button>
            </div>

            {editing ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium mb-1">Ad</label>
                    <input value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})}
                      className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-2 py-1.5 text-xs" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Soyad</label>
                    <input value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})}
                      className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-2 py-1.5 text-xs" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Email</label>
                  <input value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                    className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-2 py-1.5 text-xs" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Telefon</label>
                  <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                    className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-2 py-1.5 text-xs" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Departman</label>
                  <input value={form.department} onChange={e => setForm({...form, department: e.target.value})}
                    className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-2 py-1.5 text-xs" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Pozisyon</label>
                  <input value={form.position} onChange={e => setForm({...form, position: e.target.value})}
                    className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-2 py-1.5 text-xs" />
                </div>
                <button onClick={save} disabled={saving}
                  className="w-full py-2 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 disabled:opacity-60">
                  {saving ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {[
                  { label: 'Email',      value: emp.email },
                  { label: 'Telefon',    value: emp.phone },
                  { label: 'Departman',  value: emp.department },
                  { label: 'Şube',       value: branch?.name },
                  { label: 'İşe Başlama', value: emp.startDate },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <div className="text-xs text-gray-400 mb-0.5">{label}</div>
                    <div className="text-sm text-gray-700 dark:text-gray-300 font-medium">{value || '-'}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* İzin bakiyesi */}
          {balance && (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
              <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-4">
                {year} Yıllık İzin Bakiyesi
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Hak Edilen</span>
                  <span className="font-semibold">{balance.entitledDays} gün</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Kullanılan</span>
                  <span className="font-semibold text-amber-600">{balance.usedDays} gün</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Bekleyen</span>
                  <span className="font-semibold text-blue-600">{balance.pendingDays} gün</span>
                </div>
                <div className="border-t border-gray-100 dark:border-gray-800 pt-3 flex justify-between items-center">
                  <span className="text-sm font-medium">Kalan</span>
                  <span className={`text-lg font-bold ${balance.remainingDays <= 3 ? 'text-red-600' : 'text-green-600'}`}>
                    {balance.remainingDays} gün
                  </span>
                </div>
                {/* İlerleme çubuğu */}
                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(100, (balance.usedDays / balance.entitledDays) * 100)}%` }} />
                </div>
                <div className="text-xs text-gray-400 text-right">
                  {Math.round((balance.usedDays / balance.entitledDays) * 100)}% kullanıldı
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sağ: İstatistikler ve geçmiş */}
        <div className="col-span-2 space-y-5">

          {/* Bu ay özet */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
            <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-4">
              Bu Ay Devam Özeti
            </h3>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{attStats.present}</div>
                <div className="text-xs text-gray-400 mt-1">Geldi</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-500">{attStats.late}</div>
                <div className="text-xs text-gray-400 mt-1">Geç Kaldı</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-500">{attStats.absent}</div>
                <div className="text-xs text-gray-400 mt-1">Gelmedi</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.floor(attStats.totalMin / 60)}s
                </div>
                <div className="text-xs text-gray-400 mt-1">Toplam Çalışma</div>
              </div>
            </div>
          </div>

          {/* Son yoklama kayıtları */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 font-semibold text-sm">
              Bu Ayki Yoklama Kayıtları
            </div>
            <div className="max-h-64 overflow-y-auto">
              <table className="w-full">
                <thead className="sticky top-0">
                  <tr className="bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 uppercase">
                    <th className="px-5 py-2 text-left">Tarih</th>
                    <th className="px-5 py-2 text-left">Giriş</th>
                    <th className="px-5 py-2 text-left">Çıkış</th>
                    <th className="px-5 py-2 text-left">Süre</th>
                    <th className="px-5 py-2 text-left">Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.length === 0 ? (
                    <tr><td colSpan={5} className="px-5 py-6 text-center text-gray-400 text-sm">Bu ay kayıt yok</td></tr>
                  ) : attendance.slice().reverse().map((a: any) => (
                    <tr key={a.id} className="border-t border-gray-100 dark:border-gray-800">
                      <td className="px-5 py-2.5 text-sm">{a.workDate}</td>
                      <td className="px-5 py-2.5 text-sm">
                        {a.checkIn ? new Date(a.checkIn).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : '-'}
                      </td>
                      <td className="px-5 py-2.5 text-sm">
                        {a.checkOut ? new Date(a.checkOut).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : '-'}
                      </td>
                      <td className="px-5 py-2.5 text-sm">
                        {a.workMinutes ? `${Math.floor(a.workMinutes/60)}s ${a.workMinutes%60}dk` : '-'}
                      </td>
                      <td className="px-5 py-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          a.status === 'PRESENT' ? 'bg-green-100 text-green-700' :
                          a.status === 'LATE'    ? 'bg-amber-100 text-amber-700' :
                                                   'bg-red-100 text-red-700'
                        }`}>
                          {a.status === 'PRESENT' ? 'Geldi' : a.status === 'LATE' ? 'Geç' : 'Gelmedi'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* İzin geçmişi */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 font-semibold text-sm">
              İzin Geçmişi
            </div>
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 uppercase">
                  <th className="px-5 py-2 text-left">Tür</th>
                  <th className="px-5 py-2 text-left">Başlangıç</th>
                  <th className="px-5 py-2 text-left">Bitiş</th>
                  <th className="px-5 py-2 text-left">Gün</th>
                  <th className="px-5 py-2 text-left">Durum</th>
                </tr>
              </thead>
              <tbody>
                {leaves.length === 0 ? (
                  <tr><td colSpan={5} className="px-5 py-6 text-center text-gray-400 text-sm">İzin kaydı yok</td></tr>
                ) : leaves.map((l: any) => (
                  <tr key={l.id} className="border-t border-gray-100 dark:border-gray-800">
                    <td className="px-5 py-2.5 text-sm">{LEAVE_TYPES[l.type] || l.type}</td>
                    <td className="px-5 py-2.5 text-sm text-gray-500">{l.startDate}</td>
                    <td className="px-5 py-2.5 text-sm text-gray-500">{l.endDate}</td>
                    <td className="px-5 py-2.5 text-sm font-medium">{l.totalDays} gün</td>
                    <td className="px-5 py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        l.status === 'PENDING'  ? 'bg-amber-100 text-amber-700' :
                        l.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                                  'bg-red-100 text-red-700'
                      }`}>
                        {l.status === 'PENDING' ? 'Bekliyor' : l.status === 'APPROVED' ? 'Onaylandı' : 'Reddedildi'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  )
}