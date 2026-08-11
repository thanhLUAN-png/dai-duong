import { Link, useNavigate } from 'react-router'
import { useApp } from '../context/AppContext'
import { fishTemplates } from '../data/fishTemplates'
import FishSvg from '../components/FishSvg'

export default function Studio() {
  const { user } = useApp()
  const navigate = useNavigate()

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center gap-6 px-4 text-center">
        <div className="text-6xl float-anim">🎨</div>
        <h2 className="text-3xl font-black" style={{ color: '#0b2545' }}>
          Bạn cần đăng nhập để vào Xưởng Vẽ
        </h2>
        <p className="font-semibold" style={{ color: '#4a7fa5' }}>
          Tham gia cùng chúng mình để tô màu và thả cá vào đại dương!
        </p>
        <div className="flex gap-4">
          <Link
            to="/Account/Login"
            className="px-6 py-3 rounded-2xl font-black text-white"
            style={{ background: 'linear-gradient(135deg, #1488c6, #0b2545)', textDecoration: 'none' }}
          >
            Đăng nhập
          </Link>
          <Link
            to="/Account/Register"
            className="px-6 py-3 rounded-2xl font-black text-white"
            style={{ background: '#ff6b6b', textDecoration: 'none' }}
          >
            Đăng ký
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="text-5xl mb-4 float-anim inline-block">🎨</div>
        <h1 className="text-4xl md:text-5xl font-black mb-4" style={{ color: '#0b2545' }}>
          Xưởng Vẽ
        </h1>
        <p className="text-lg font-semibold max-w-lg mx-auto" style={{ color: '#4a7fa5' }}>
          Chọn một loài sinh vật biển để bắt đầu tô màu. Hãy thỏa sức sáng tạo! 🌈
        </p>
      </div>

      {/* Template grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {fishTemplates.map((template) => {
          const defaultColors: Record<string, string> = {}
          template.regions.forEach((r) => {
            defaultColors[r.id] = r.defaultColor
          })

          return (
            <button
              key={template.id}
              onClick={() => navigate(`/Studio/Color?id=${template.id}`)}
              className="group text-left rounded-3xl overflow-hidden transition-all hover:scale-[1.03] hover:shadow-xl"
              style={{
                background: 'rgba(255,255,255,0.85)',
                backdropFilter: 'blur(16px)',
                border: '2px solid rgba(20,136,198,0.15)',
                boxShadow: '0 8px 32px rgba(11,37,69,0.08)',
              }}
            >
              {/* Fish preview */}
              <div
                className="flex items-center justify-center py-8 px-6 transition-colors"
                style={{ background: 'rgba(168,240,232,0.2)' }}
              >
                <FishSvg
                  template={template}
                  colors={defaultColors}
                  className="w-full max-w-[200px] group-hover:scale-110 transition-transform duration-300"
                  style={{ height: 120 }}
                />
              </div>

              {/* Info */}
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{template.emoji}</span>
                  <h3 className="font-black text-xl" style={{ color: '#0b2545' }}>
                    {template.name}
                  </h3>
                </div>
                <p className="text-sm font-semibold mb-4" style={{ color: '#4a7fa5' }}>
                  {template.description}
                </p>
                <div className="flex items-center justify-between">
                  <span
                    className="text-xs font-bold px-3 py-1 rounded-full"
                    style={{ background: '#e0f7ff', color: '#1488c6' }}
                  >
                    {template.regions.length} vùng tô màu
                  </span>
                  <span
                    className="text-sm font-black flex items-center gap-1"
                    style={{ color: '#ff6b6b' }}
                  >
                    Bắt đầu vẽ →
                  </span>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* My art shortcut */}
      <div className="text-center mt-12">
        <Link
          to="/Studio/MyArt"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm"
          style={{
            background: 'rgba(255,255,255,0.7)',
            color: '#0b2545',
            border: '2px solid rgba(20,136,198,0.2)',
            textDecoration: 'none',
          }}
        >
          🖼️ Xem tác phẩm của tôi
        </Link>
      </div>
    </div>
  )
}
