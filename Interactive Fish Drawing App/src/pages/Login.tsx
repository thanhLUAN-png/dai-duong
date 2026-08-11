import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useApp } from '../context/AppContext'

export default function Login() {
  const { login } = useApp()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      const result = login(form.username, form.password)
      if (result.ok) {
        navigate('/')
      } else {
        setError(result.error ?? 'Đăng nhập thất bại')
      }
      setLoading(false)
    }, 500)
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        {/* Card */}
        <div
          className="rounded-3xl p-8 md:p-10"
          style={{
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 20px 60px rgba(11,37,69,0.12)',
            border: '1.5px solid rgba(20,136,198,0.15)',
          }}
        >
          <div className="text-center mb-8">
            <div className="text-5xl mb-3 float-anim inline-block">🐟</div>
            <h1 className="text-3xl font-black" style={{ color: '#0b2545' }}>
              Chào mừng trở lại!
            </h1>
            <p className="text-sm font-semibold mt-2" style={{ color: '#4a7fa5' }}>
              Đăng nhập để tiếp tục hành trình khám phá đại dương
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-black mb-1.5" style={{ color: '#0b2545' }}>
                Tên tài khoản
              </label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder="username"
                required
                className="w-full px-4 py-3 rounded-xl text-sm font-semibold outline-none transition-all"
                style={{
                  background: '#f0f9ff',
                  border: '2px solid #b8e4f9',
                  color: '#0b2545',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#1488c6')}
                onBlur={(e) => (e.target.style.borderColor = '#b8e4f9')}
              />
            </div>

            <div>
              <label className="block text-sm font-black mb-1.5" style={{ color: '#0b2545' }}>
                Mật khẩu
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 rounded-xl text-sm font-semibold outline-none transition-all"
                style={{
                  background: '#f0f9ff',
                  border: '2px solid #b8e4f9',
                  color: '#0b2545',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#1488c6')}
                onBlur={(e) => (e.target.style.borderColor = '#b8e4f9')}
              />
            </div>

            {error && (
              <div
                className="px-4 py-3 rounded-xl text-sm font-bold"
                style={{ background: '#fff0f0', color: '#cc3333', border: '1.5px solid #ffcccc' }}
              >
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-black text-white text-base transition-all hover:scale-[1.02]"
              style={{
                background: loading
                  ? '#90c0dc'
                  : 'linear-gradient(135deg, #1488c6, #0b2545)',
                boxShadow: '0 6px 20px rgba(20,136,198,0.35)',
              }}
            >
              {loading ? '🌊 Đang đăng nhập...' : '🐠 Đăng nhập'}
            </button>
          </form>

          {/* Demo hint */}
          <div
            className="mt-5 p-4 rounded-xl text-xs font-semibold"
            style={{ background: '#f0faff', color: '#4a7fa5', border: '1px dashed #b8e4f9' }}
          >
            <div className="font-black mb-1 text-sm">🔑 Tài khoản demo:</div>
            <div>
              Người dùng: <span className="font-black">bao</span> / <span className="font-black">123456</span>
            </div>
            <div>
              Admin: <span className="font-black">admin</span> / <span className="font-black">admin123</span>
            </div>
          </div>

          <p className="text-center text-sm font-semibold mt-6" style={{ color: '#4a7fa5' }}>
            Chưa có tài khoản?{' '}
            <Link
              to="/Account/Register"
              className="font-black"
              style={{ color: '#1488c6', textDecoration: 'none' }}
            >
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
