import { useEffect, useRef } from 'react'
import { Link } from 'react-router'
import { useApp } from '../context/AppContext'
import { fishTemplates } from '../data/fishTemplates'
import FishSvg from '../components/FishSvg'

interface Bubble {
  id: number
  x: number
  size: number
  duration: number
  delay: number
}

function OceanBackground() {
  const bubbles: Bubble[] = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    size: 8 + Math.random() * 22,
    duration: 8 + Math.random() * 14,
    delay: Math.random() * 10,
  }))

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" style={{ zIndex: 0 }}>
      {/* Animated wave at bottom */}
      <div
        className="absolute bottom-0 left-0 w-[200%] h-32 opacity-30"
        style={{
          background: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 1200 80\'%3E%3Cpath d=\'M0,40 C150,10 350,70 600,40 C850,10 1050,70 1200,40 L1200,80 L0,80 Z\' fill=\'%231488c6\'/%3E%3C/svg%3E") repeat-x bottom',
          backgroundSize: '600px 80px',
          animation: 'wave 8s linear infinite',
        }}
      />
      {/* Bubbles */}
      {bubbles.map((b) => (
        <div
          key={b.id}
          className="bubble"
          style={{
            left: `${b.x}%`,
            bottom: '-50px',
            width: b.size,
            height: b.size,
            animationDuration: `${b.duration}s`,
            animationDelay: `${b.delay}s`,
          }}
        />
      ))}
    </div>
  )
}

export default function Home() {
  const { artworks, user } = useApp()
  const approvedArtworks = artworks.filter((a) => a.status === 'approved')

  const demoFish = fishTemplates[0]
  const demoColors: Record<string, string> = {}
  demoFish.regions.forEach((r) => {
    demoColors[r.id] = r.defaultColor
  })

  return (
    <div className="relative min-h-screen">
      <OceanBackground />

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center px-4 pt-20 pb-16">
        <div
          className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full text-sm font-bold"
          style={{ background: 'rgba(20,136,198,0.12)', color: '#0b2545' }}
        >
          🌊 Dự án nghệ thuật cộng đồng
        </div>

        <h1
          className="font-black text-5xl md:text-7xl leading-tight mb-6"
          style={{ color: '#0b2545' }}
        >
          Biển Của
          <br />
          <span
            style={{
              background: 'linear-gradient(135deg, #1488c6, #7ec8e3, #a8f0e8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Chúng Mình
          </span>
        </h1>

        <p
          className="text-lg md:text-xl max-w-lg mb-10 leading-relaxed font-semibold"
          style={{ color: '#1a3a5c' }}
        >
          Vẽ con cá của riêng bạn, thả nó vào đại dương chung, và cùng nhau tạo nên một bể cá
          sống động nhất thế giới 🐠
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/Studio"
            className="px-8 py-4 rounded-2xl text-lg font-black shadow-lg transition-transform hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #1488c6, #0b2545)',
              color: 'white',
              textDecoration: 'none',
            }}
          >
            🎨 Bắt đầu vẽ ngay
          </Link>
          <Link
            to="/Ocean"
            className="px-8 py-4 rounded-2xl text-lg font-black shadow-lg transition-transform hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #a8f0e8, #7ec8e3)',
              color: '#0b2545',
              textDecoration: 'none',
            }}
          >
            🌊 Xem Đại Dương
          </Link>
        </div>

        {/* Stats */}
        <div className="flex gap-8 mt-12">
          {[
            { value: approvedArtworks.length + 1, label: 'Cá đang bơi' },
            { value: fishTemplates.length, label: 'Mẫu sinh vật' },
            { value: artworks.length + 5, label: 'Nghệ sĩ tham gia' },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="text-3xl font-black" style={{ color: '#1488c6' }}>
                {value}
              </div>
              <div className="text-sm font-bold" style={{ color: '#4a7fa5' }}>
                {label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Fish preview strip */}
      <section className="relative z-10 py-12 overflow-hidden">
        <div
          className="max-w-5xl mx-auto px-4"
        >
          <h2
            className="text-center text-2xl font-black mb-8"
            style={{ color: '#0b2545' }}
          >
            🎨 Chọn sinh vật yêu thích để bắt đầu
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {fishTemplates.map((template) => {
              const cols: Record<string, string> = {}
              template.regions.forEach((r) => { cols[r.id] = r.defaultColor })
              return (
                <Link
                  key={template.id}
                  to={`/Studio/Color?id=${template.id}`}
                  className="group flex flex-col items-center gap-3 p-4 rounded-2xl transition-all hover:scale-105"
                  style={{
                    background: 'rgba(255,255,255,0.7)',
                    backdropFilter: 'blur(12px)',
                    border: '2px solid rgba(20,136,198,0.15)',
                    textDecoration: 'none',
                  }}
                >
                  <FishSvg
                    template={template}
                    colors={cols}
                    className="w-full"
                    style={{ height: 100 }}
                  />
                  <span className="text-sm font-black" style={{ color: '#0b2545' }}>
                    {template.emoji} {template.name}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-center text-3xl font-black mb-12" style={{ color: '#0b2545' }}>
            Cách chơi đơn giản lắm! 🐟
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                icon: '🎨',
                title: 'Chọn mẫu & Tô màu',
                desc: 'Chọn loài sinh vật biển yêu thích. Chọn màu sắc và tô từng bộ phận theo ý thích.',
              },
              {
                step: '02',
                icon: '📬',
                title: 'Gửi tác phẩm',
                desc: 'Đặt tên cho con cá và gửi tác phẩm. Chờ Admin duyệt rồi cá sẽ được thả vào biển.',
              },
              {
                step: '03',
                icon: '🌊',
                title: 'Thả vào Đại Dương',
                desc: 'Con cá của bạn sẽ bơi trong đại dương cùng tất cả mọi người. Mọi người đều có thể ngắm!',
              },
            ].map(({ step, icon, title, desc }) => (
              <div
                key={step}
                className="p-6 rounded-3xl relative"
                style={{
                  background: 'rgba(255,255,255,0.7)',
                  backdropFilter: 'blur(12px)',
                  border: '2px solid rgba(20,136,198,0.12)',
                }}
              >
                <div
                  className="absolute -top-4 -left-2 text-6xl font-black opacity-10"
                  style={{ color: '#1488c6', lineHeight: 1 }}
                >
                  {step}
                </div>
                <div className="text-4xl mb-3">{icon}</div>
                <h3 className="font-black text-lg mb-2" style={{ color: '#0b2545' }}>
                  {title}
                </h3>
                <p className="text-sm leading-relaxed font-semibold" style={{ color: '#4a7fa5' }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      {!user && (
        <section className="relative z-10 py-16 px-4 text-center">
          <div
            className="max-w-2xl mx-auto p-10 rounded-3xl"
            style={{
              background: 'linear-gradient(135deg, #0b2545, #1488c6)',
            }}
          >
            <div className="text-5xl mb-4">🐠</div>
            <h2 className="text-3xl font-black text-white mb-4">
              Sẵn sàng thả cá vào biển?
            </h2>
            <p className="text-white/80 font-semibold mb-8">
              Đăng ký miễn phí, vẽ ngay, thả cá của bạn cùng cộng đồng.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                to="/Account/Register"
                className="px-8 py-3 rounded-2xl font-black text-lg"
                style={{ background: '#ff6b6b', color: 'white', textDecoration: 'none' }}
              >
                Tạo tài khoản miễn phí
              </Link>
              <Link
                to="/Account/Login"
                className="px-8 py-3 rounded-2xl font-black text-lg"
                style={{ background: 'rgba(255,255,255,0.15)', color: 'white', textDecoration: 'none' }}
              >
                Đăng nhập
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
