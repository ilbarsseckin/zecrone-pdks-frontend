import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'

const menuItems = [
  { href: '/dashboard',  label: 'Dashboard',  icon: '📊' },
  { href: '/employees',  label: 'Personel',   icon: '👥' },
  { href: '/branches',   label: 'Şubeler',    icon: '🏢' },
  { href: '/attendance', label: 'Yoklama',    icon: '✅' },
  { href: '/shifts',     label: 'Vardiyalar', icon: '🔄' },
  { href: '/leaves',     label: 'İzin Takibi',icon: '📅' },
  { href: '/reports',    label: 'Raporlar',   icon: '📈' },
  { href: '/settings',   label: 'Ayarlar',    icon: '⚙️' },
]

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter()
  const [dark, setDark] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('pdks_theme')
    if (saved === 'dark') {
      setDark(true)
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggleTheme = () => {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('pdks_theme', next ? 'dark' : 'light')
  }

  const logout = () => {
    localStorage.clear()
    router.push('/')
  }

  const currentPage = menuItems.find(m => m.href === router.pathname)

  return (
    <div className={dark ? 'dark' : ''}>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
        <aside className={`flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ${collapsed ? 'w-16' : 'w-56'}`}>
          <div className="flex items-center justify-between px-4 h-16 border-b border-gray-200 dark:border-gray-800">
            {!collapsed && (
              <span className="font-bold text-lg text-blue-600 dark:text-blue-400">PDKS</span>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
            >
              {collapsed ? '→' : '←'}
            </button>
          </div>

          <nav className="flex-1 py-4 overflow-y-auto">
            {menuItems.map(item => {
              const active = router.pathname === item.href
              return (
                <Link key={item.href} href={item.href}>
                  <div className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg cursor-pointer transition-all text-sm font-medium ${
                    active
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}>
                    <span className="text-base">{item.icon}</span>
                    {!collapsed && <span>{item.label}</span>}
                  </div>
                </Link>
              )
            })}
          </nav>

          <div className="border-t border-gray-200 dark:border-gray-800 p-3 space-y-1">
            <button
              onClick={toggleTheme}
              className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <span>{dark ? '☀️' : '🌙'}</span>
              {!collapsed && <span>{dark ? 'Açık Tema' : 'Koyu Tema'}</span>}
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <span>🚪</span>
              {!collapsed && <span>Çıkış Yap</span>}
            </button>
          </div>
        </aside>

        <main className="flex-1 flex flex-col overflow-hidden">
          <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6">
            <h1 className="font-semibold text-gray-800 dark:text-gray-200">
              {currentPage?.label || 'PDKS Sistemi'}
            </h1>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {new Date().toLocaleDateString('tr-TR', {
                  weekday: 'long', day: 'numeric', month: 'long'
                })}
              </span>
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
                A
              </div>
            </div>
          </header>
          <div className="flex-1 overflow-y-auto p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}