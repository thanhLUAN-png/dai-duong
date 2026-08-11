import { Link, useLocation, useNavigate } from 'react-router'
import { useApp } from '../context/AppContext'

const NAV_LINKS = [
  { to: '/', label: 'Trang Chủ' },
  { to: '/Studio', label: 'Xưởng Vẽ' },
  { to: '/Ocean', label: 'Đại Dương' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useApp()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav
        style={{
          background: 'linear-gradient(90deg, #0b2545 0%, #1488c6 100%)',
          boxShadow: '0 2px 20px rgba(11,37,69,0.3)',
        }}
        className="sticky top-0 z-50"
      >
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 text-white font-black text-xl tracking-tight"
            style={{ textDecoration: 'none' }}
          >
            <span className="text-2xl">🐟</span>
            <span>Biển Của Chúng Mình</span>
          </Link>

          {/* Center links */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="px-4 py-2 rounded-full text-sm font-bold transition-all duration-200"
                style={{
                  color: location.pathname === to ? '#0b2545' : 'rgba(255,255,255,0.85)',
                  background: location.pathname === to ? '#90e0ef' : 'transparent',
                  textDecoration: 'none',
                }}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link
                  to="/Studio/MyArt"
                  className="hidden md:block text-sm font-bold px-4 py-2 rounded-full"
                  style={{
                    background: 'rgba(255,255,255,0.15)',
                    color: 'white',
                    textDecoration: 'none',
                  }}
                >
                  🎨 Tác phẩm của tôi
                </Link>
                {user.role === 'admin' && (
                  <Link
                    to="/Admin"
                    className="hidden md:block text-sm font-bold px-4 py-2 rounded-full"
                    style={{
                      background: 'rgba(255,107,107,0.3)',
                      color: '#ffd6d6',
                      textDecoration: 'none',
                    }}
                  >
                    ⚙️ Admin
                  </Link>
                )}
                <div className="flex items-center gap-2">
                  <span
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black"
                    style={{ background: '#a8f0e8', color: '#0b2545' }}
                  >
                    {user.displayName[0]}
                  </span>
                  <span className="text-white text-sm font-bold hidden md:block">{user.displayName}</span>
                  <button
                    onClick={handleLogout}
                    className="text-xs text-white/70 hover:text-white font-semibold transition-colors px-2"
                  >
                    Đăng xuất
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/Account/Login"
                  className="text-sm font-bold px-4 py-2 rounded-full"
                  style={{
                    background: 'rgba(255,255,255,0.15)',
                    color: 'white',
                    textDecoration: 'none',
                  }}
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/Account/Register"
                  className="text-sm font-bold px-4 py-2 rounded-full"
                  style={{
                    background: '#ff6b6b',
                    color: 'white',
                    textDecoration: 'none',
                  }}
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile nav */}
        <div className="md:hidden flex gap-1 px-4 pb-3">
          {NAV_LINKS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="flex-1 text-center py-1.5 rounded-full text-xs font-bold"
              style={{
                color: location.pathname === to ? '#0b2545' : 'rgba(255,255,255,0.8)',
                background: location.pathname === to ? '#90e0ef' : 'rgba(255,255,255,0.1)',
                textDecoration: 'none',
              }}
            >
              {label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Main */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer
        className="text-center py-6 text-sm"
        style={{ color: '#1488c6', fontWeight: 700, opacity: 0.7 }}
      >
        🐠 Biển Của Chúng Mình — Nơi mỗi con cá mang một câu chuyện 🌊
      </footer>
    </div>
  )
}
