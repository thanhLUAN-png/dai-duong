import { useState, useCallback } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router'
import { useApp } from '../context/AppContext'
import { fishTemplates } from '../data/fishTemplates'
import FishSvg from '../components/FishSvg'

const PALETTE = [
  '#FF6B6B', '#FF8E53', '#FFD166', '#06D6A0', '#118AB2',
  '#073B4C', '#9B5DE5', '#F15BB5', '#00BBF9', '#00F5D4',
  '#FFFFFF', '#F8F9FA', '#ADB5BD', '#495057', '#212529',
  '#FF9A5C', '#FFE66D', '#A8F0E8', '#7EC8E3', '#1488C6',
  '#FF4757', '#2ED573', '#1E90FF', '#FF6348', '#ECCC68',
  '#8B4513', '#D2691E', '#DEB887', '#F4A460', '#BC8A5F',
]

type HistoryEntry = Record<string, string>

export default function StudioColor() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user, submitArtwork } = useApp()
  const templateId = searchParams.get('id') ?? 'clownfish'
  const template = fishTemplates.find((t) => t.id === templateId) ?? fishTemplates[0]

  const buildDefaults = () => {
    const c: Record<string, string> = {}
    template.regions.forEach((r) => { c[r.id] = r.defaultColor })
    return c
  }

  const [colors, setColors] = useState<Record<string, string>>(buildDefaults)
  const [selectedColor, setSelectedColor] = useState('#FF8C42')
  const [history, setHistory] = useState<HistoryEntry[]>([buildDefaults()])
  const [histIndex, setHistIndex] = useState(0)
  const [activeRegion, setActiveRegion] = useState<string | null>(null)
  const [fishName, setFishName] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [showSubmit, setShowSubmit] = useState(false)

  const handleRegionClick = useCallback(
    (regionId: string) => {
      const newColors = { ...colors, [regionId]: selectedColor }
      setColors(newColors)
      setActiveRegion(regionId)
      const trimmed = history.slice(0, histIndex + 1)
      setHistory([...trimmed, newColors])
      setHistIndex(trimmed.length)
    },
    [colors, selectedColor, history, histIndex],
  )

  const undo = () => {
    if (histIndex === 0) return
    const prev = history[histIndex - 1]
    setColors(prev)
    setHistIndex(histIndex - 1)
  }

  const redo = () => {
    if (histIndex >= history.length - 1) return
    const next = history[histIndex + 1]
    setColors(next)
    setHistIndex(histIndex + 1)
  }

  const resetColors = () => {
    const def = buildDefaults()
    setColors(def)
    setHistory([def])
    setHistIndex(0)
    setActiveRegion(null)
  }

  const handleSubmit = () => {
    if (!user) {
      navigate('/Account/Login')
      return
    }
    submitArtwork({
      templateId: template.id,
      templateName: template.name,
      colors,
      fishName: fishName || `${template.name} của ${user.displayName}`,
    })
    setSubmitted(true)
    setShowSubmit(false)
  }

  if (submitted) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center gap-6 px-4 text-center">
        <div className="text-7xl float-anim">🎉</div>
        <h2 className="text-4xl font-black" style={{ color: '#0b2545' }}>
          Tuyệt vời!
        </h2>
        <p className="text-lg font-semibold max-w-sm" style={{ color: '#4a7fa5' }}>
          Tác phẩm của bạn đã được gửi đi. Admin sẽ duyệt và thả cá vào đại dương sớm thôi! 🐠
        </p>
        <div className="flex gap-4">
          <Link
            to="/Studio/MyArt"
            className="px-6 py-3 rounded-2xl font-black text-white"
            style={{ background: 'linear-gradient(135deg, #1488c6, #0b2545)', textDecoration: 'none' }}
          >
            Xem tác phẩm của tôi
          </Link>
          <Link
            to="/Studio"
            className="px-6 py-3 rounded-2xl font-black"
            style={{ background: 'rgba(255,255,255,0.8)', color: '#0b2545', textDecoration: 'none' }}
          >
            Vẽ thêm cá
          </Link>
        </div>
      </div>
    )
  }

  const activeRegionData = template.regions.find((r) => r.id === activeRegion)

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          to="/Studio"
          className="px-4 py-2 rounded-xl font-bold text-sm"
          style={{ background: 'rgba(255,255,255,0.7)', color: '#0b2545', textDecoration: 'none' }}
        >
          ← Xưởng vẽ
        </Link>
        <div>
          <h1 className="text-2xl font-black" style={{ color: '#0b2545' }}>
            Tô màu {template.emoji} {template.name}
          </h1>
          <p className="text-sm font-semibold" style={{ color: '#4a7fa5' }}>
            Nhấn vào từng phần của sinh vật để tô màu
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-[280px,1fr] gap-6 items-start">
        {/* Left panel - tools */}
        <div className="flex flex-col gap-4">
          {/* Selected color */}
          <div
            className="p-4 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.85)', border: '1.5px solid rgba(20,136,198,0.15)' }}
          >
            <div className="text-xs font-black mb-3" style={{ color: '#0b2545' }}>
              MÀU ĐANG CHỌN
            </div>
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-xl shadow-md border-4 border-white"
                style={{ background: selectedColor }}
              />
              <div>
                <div className="font-black text-sm" style={{ color: '#0b2545' }}>
                  {selectedColor.toUpperCase()}
                </div>
                {activeRegionData && (
                  <div className="text-xs font-semibold" style={{ color: '#4a7fa5' }}>
                    → {activeRegionData.label}
                  </div>
                )}
              </div>
            </div>
            {/* Custom color picker */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="color"
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="w-8 h-8 rounded cursor-pointer border-0"
              />
              <span className="text-xs font-bold" style={{ color: '#4a7fa5' }}>
                Màu tùy chỉnh
              </span>
            </label>
          </div>

          {/* Palette */}
          <div
            className="p-4 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.85)', border: '1.5px solid rgba(20,136,198,0.15)' }}
          >
            <div className="text-xs font-black mb-3" style={{ color: '#0b2545' }}>
              BỘ MÀU
            </div>
            <div className="grid grid-cols-6 gap-1.5">
              {PALETTE.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className="w-full aspect-square rounded-lg transition-transform hover:scale-110"
                  style={{
                    background: color,
                    border: selectedColor === color ? '3px solid #0b2545' : '2px solid rgba(0,0,0,0.1)',
                    boxShadow: selectedColor === color ? '0 0 0 2px white inset' : undefined,
                  }}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Region list */}
          <div
            className="p-4 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.85)', border: '1.5px solid rgba(20,136,198,0.15)' }}
          >
            <div className="text-xs font-black mb-3" style={{ color: '#0b2545' }}>
              CÁC VÙNG TÔ MÀU
            </div>
            <div className="flex flex-col gap-1.5 max-h-52 overflow-y-auto pr-1">
              {template.regions.map((region) => (
                <button
                  key={region.id}
                  onClick={() => {
                    setActiveRegion(region.id)
                    handleRegionClick(region.id)
                  }}
                  className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg transition-all hover:bg-blue-50"
                  style={{
                    background: activeRegion === region.id ? '#e0f7ff' : 'transparent',
                    border: activeRegion === region.id ? '1.5px solid #1488c6' : '1.5px solid transparent',
                  }}
                >
                  <div
                    className="w-5 h-5 rounded-md flex-shrink-0 border border-black/10"
                    style={{ background: colors[region.id] ?? region.defaultColor }}
                  />
                  <span className="text-xs font-bold truncate" style={{ color: '#0b2545' }}>
                    {region.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={undo}
              disabled={histIndex === 0}
              className="py-2 rounded-xl text-xs font-black transition-all hover:scale-105 disabled:opacity-40"
              style={{ background: 'rgba(255,255,255,0.8)', color: '#0b2545' }}
            >
              ↩ Hoàn tác
            </button>
            <button
              onClick={redo}
              disabled={histIndex >= history.length - 1}
              className="py-2 rounded-xl text-xs font-black transition-all hover:scale-105 disabled:opacity-40"
              style={{ background: 'rgba(255,255,255,0.8)', color: '#0b2545' }}
            >
              ↪ Làm lại
            </button>
            <button
              onClick={resetColors}
              className="py-2 rounded-xl text-xs font-black transition-all hover:scale-105"
              style={{ background: 'rgba(255,107,107,0.15)', color: '#cc3333' }}
            >
              🗑 Reset
            </button>
          </div>

          {/* Submit */}
          {user ? (
            <button
              onClick={() => setShowSubmit(true)}
              className="w-full py-3.5 rounded-2xl font-black text-white text-sm transition-all hover:scale-[1.02]"
              style={{
                background: 'linear-gradient(135deg, #1488c6, #0b2545)',
                boxShadow: '0 6px 20px rgba(20,136,198,0.35)',
              }}
            >
              🐠 Gửi tác phẩm
            </button>
          ) : (
            <Link
              to="/Account/Login"
              className="block text-center py-3.5 rounded-2xl font-black text-white text-sm"
              style={{ background: '#ff6b6b', textDecoration: 'none' }}
            >
              Đăng nhập để gửi tác phẩm
            </Link>
          )}
        </div>

        {/* Right - Canvas */}
        <div
          className="rounded-3xl flex items-center justify-center p-8 relative"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(168,240,232,0.3) 0%, rgba(126,200,227,0.15) 100%)',
            border: '2px solid rgba(20,136,198,0.15)',
            minHeight: 420,
          }}
        >
          {/* Grid dots background */}
          <div
            className="absolute inset-0 rounded-3xl"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(20,136,198,0.12) 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          />
          <div className="relative z-10 flex flex-col items-center gap-4 w-full">
            <FishSvg
              template={template}
              colors={colors}
              onRegionClick={handleRegionClick}
              className="w-full max-w-sm md:max-w-md"
              style={{ filter: 'drop-shadow(0 8px 24px rgba(11,37,69,0.15))' }}
            />
            <p className="text-xs font-bold opacity-60" style={{ color: '#0b2545' }}>
              Nhấn vào từng phần để tô màu • Màu đang chọn:{' '}
              <span
                className="inline-block w-3 h-3 rounded-sm align-middle"
                style={{ background: selectedColor }}
              />
            </p>
          </div>
        </div>
      </div>

      {/* Submit modal */}
      {showSubmit && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(11,37,69,0.5)', backdropFilter: 'blur(8px)' }}
          onClick={(e) => e.target === e.currentTarget && setShowSubmit(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl p-8"
            style={{ background: 'white', boxShadow: '0 40px 80px rgba(11,37,69,0.25)' }}
          >
            <div className="text-center mb-6">
              <div className="text-5xl mb-3">🐠</div>
              <h2 className="text-2xl font-black" style={{ color: '#0b2545' }}>
                Đặt tên cho con cá
              </h2>
              <p className="text-sm font-semibold mt-1" style={{ color: '#4a7fa5' }}>
                Con cá của bạn sẽ được biết đến với cái tên này trong đại dương
              </p>
            </div>

            {/* Fish preview */}
            <div
              className="rounded-2xl p-4 mb-6 flex justify-center"
              style={{ background: '#f0f9ff' }}
            >
              <FishSvg template={template} colors={colors} className="h-32 w-auto" />
            </div>

            <input
              type="text"
              value={fishName}
              onChange={(e) => setFishName(e.target.value)}
              placeholder={`vd: ${template.name} Bé Nemo`}
              maxLength={40}
              className="w-full px-4 py-3 rounded-xl text-sm font-semibold outline-none mb-4"
              style={{
                background: '#f0f9ff',
                border: '2px solid #b8e4f9',
                color: '#0b2545',
              }}
            />

            <div className="flex gap-3">
              <button
                onClick={() => setShowSubmit(false)}
                className="flex-1 py-3 rounded-xl font-bold text-sm"
                style={{ background: '#f0f9ff', color: '#4a7fa5' }}
              >
                Hủy
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 py-3 rounded-xl font-black text-white text-sm"
                style={{ background: 'linear-gradient(135deg, #1488c6, #0b2545)' }}
              >
                🌊 Thả cá vào biển!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
