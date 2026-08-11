import { Link, useNavigate } from 'react-router'
import { useApp } from '../context/AppContext'
import { fishTemplates } from '../data/fishTemplates'
import FishSvg from '../components/FishSvg'

const STATUS_INFO = {
  pending: { label: 'Chờ duyệt', color: '#f59e0b', bg: '#fffbeb', icon: '⏳' },
  approved: { label: 'Đã duyệt', color: '#10b981', bg: '#f0fdf4', icon: '✅' },
  rejected: { label: 'Bị từ chối', color: '#ef4444', bg: '#fef2f2', icon: '❌' },
}

export default function MyArt() {
  const { user, artworks } = useApp()
  const navigate = useNavigate()

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center gap-6 px-4 text-center">
        <div className="text-6xl float-anim">🖼️</div>
        <h2 className="text-3xl font-black" style={{ color: '#0b2545' }}>
          Đăng nhập để xem tác phẩm
        </h2>
        <Link
          to="/Account/Login"
          className="px-6 py-3 rounded-2xl font-black text-white"
          style={{ background: 'linear-gradient(135deg, #1488c6, #0b2545)', textDecoration: 'none' }}
        >
          Đăng nhập
        </Link>
      </div>
    )
  }

  const myArtworks = artworks.filter((a) => a.userId === user.id)

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl font-black" style={{ color: '#0b2545' }}>
            🖼️ Tác phẩm của tôi
          </h1>
          <p className="font-semibold mt-1" style={{ color: '#4a7fa5' }}>
            Xin chào, <span className="text-ocean-blue font-black">{user.displayName}</span>! Bạn có{' '}
            {myArtworks.length} tác phẩm.
          </p>
        </div>
        <Link
          to="/Studio"
          className="px-5 py-3 rounded-2xl font-black text-white text-sm"
          style={{ background: 'linear-gradient(135deg, #1488c6, #0b2545)', textDecoration: 'none' }}
        >
          + Vẽ thêm cá
        </Link>
      </div>

      {myArtworks.length === 0 ? (
        <div
          className="text-center py-20 rounded-3xl"
          style={{
            background: 'rgba(255,255,255,0.7)',
            border: '2px dashed rgba(20,136,198,0.25)',
          }}
        >
          <div className="text-6xl mb-4 float-anim">🎨</div>
          <h3 className="text-xl font-black mb-3" style={{ color: '#0b2545' }}>
            Bạn chưa có tác phẩm nào
          </h3>
          <p className="font-semibold mb-6" style={{ color: '#4a7fa5' }}>
            Hãy vào Xưởng Vẽ để tô màu con cá đầu tiên!
          </p>
          <button
            onClick={() => navigate('/Studio')}
            className="px-8 py-3 rounded-2xl font-black text-white"
            style={{ background: 'linear-gradient(135deg, #1488c6, #0b2545)' }}
          >
            🐠 Bắt đầu vẽ
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {myArtworks.map((artwork) => {
            const template = fishTemplates.find((t) => t.id === artwork.templateId)
            const status = STATUS_INFO[artwork.status]
            if (!template) return null

            return (
              <div
                key={artwork.id}
                className="rounded-3xl overflow-hidden"
                style={{
                  background: 'rgba(255,255,255,0.85)',
                  backdropFilter: 'blur(16px)',
                  boxShadow: '0 8px 32px rgba(11,37,69,0.08)',
                  border: '2px solid rgba(20,136,198,0.12)',
                }}
              >
                {/* Fish preview */}
                <div
                  className="flex items-center justify-center py-8 px-6"
                  style={{ background: 'rgba(168,240,232,0.15)' }}
                >
                  <FishSvg
                    template={template}
                    colors={artwork.colors}
                    className="w-full max-w-[180px]"
                    style={{ height: 110 }}
                  />
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <h3 className="font-black text-base" style={{ color: '#0b2545' }}>
                        {artwork.fishName ?? `${template.name} của tôi`}
                      </h3>
                      <p className="text-xs font-semibold" style={{ color: '#4a7fa5' }}>
                        {template.emoji} {template.name} •{' '}
                        {new Date(artwork.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <span
                      className="flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-black"
                      style={{ background: status.bg, color: status.color }}
                    >
                      {status.icon} {status.label}
                    </span>
                  </div>

                  {artwork.status === 'pending' && (
                    <p className="text-xs font-semibold p-3 rounded-xl" style={{ background: '#fffbeb', color: '#92400e' }}>
                      Tác phẩm đang chờ Admin duyệt. Hãy kiên nhẫn chút nhé! 🌊
                    </p>
                  )}
                  {artwork.status === 'approved' && (
                    <Link
                      to="/Ocean"
                      className="block text-center text-xs font-black py-2.5 rounded-xl"
                      style={{ background: '#f0fdf4', color: '#10b981', textDecoration: 'none' }}
                    >
                      🌊 Xem cá bơi trong Đại Dương
                    </Link>
                  )}
                  {artwork.status === 'rejected' && (
                    <Link
                      to={`/Studio/Color?id=${artwork.templateId}`}
                      className="block text-center text-xs font-black py-2.5 rounded-xl"
                      style={{ background: '#fef2f2', color: '#ef4444', textDecoration: 'none' }}
                    >
                      🎨 Vẽ lại tác phẩm này
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
