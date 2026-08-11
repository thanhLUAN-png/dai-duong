import { useEffect, useRef, useState } from 'react'
import { useApp } from '../context/AppContext'
import { fishTemplates } from '../data/fishTemplates'
import FishSvg from '../components/FishSvg'

interface SwimmingFish {
  id: string
  artworkId: string
  templateId: string
  colors: Record<string, string>
  fishName: string
  x: number
  y: number
  speed: number
  direction: 1 | -1
  yDrift: number
  yOffset: number
  scale: number
  yPhase: number
}

function useFishAnimation(fishes: SwimmingFish[], containerWidth: number) {
  const [positions, setPositions] = useState<Record<string, { x: number; y: number; dir: 1 | -1 }>>(() =>
    Object.fromEntries(fishes.map((f) => [f.id, { x: f.x, y: f.y, dir: f.direction }])),
  )
  const rafRef = useRef<number>(0)
  const lastTimeRef = useRef<number>(0)

  useEffect(() => {
    const animate = (time: number) => {
      const dt = Math.min((time - lastTimeRef.current) / 1000, 0.05)
      lastTimeRef.current = time

      setPositions((prev) => {
        const next = { ...prev }
        fishes.forEach((fish) => {
          const cur = prev[fish.id] ?? { x: fish.x, y: fish.y, dir: fish.direction }
          let { x, dir } = cur
          x += fish.speed * dir * dt * 60
          const maxX = containerWidth - 80
          if (x > maxX) { x = maxX; dir = -1 }
          if (x < 0) { x = 0; dir = 1 }
          const y = fish.y + Math.sin((time / 1000) * fish.yDrift + fish.yPhase) * fish.yOffset
          next[fish.id] = { x, y, dir }
        })
        return next
      })

      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [fishes, containerWidth])

  return positions
}

export default function Ocean() {
  const { artworks } = useApp()
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(800)
  const [containerHeight, setContainerHeight] = useState(500)

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth)
        setContainerHeight(containerRef.current.clientHeight)
      }
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const approvedArtworks = artworks.filter((a) => a.status === 'approved')

  const fishes: SwimmingFish[] = approvedArtworks.map((artwork, i) => ({
    id: artwork.id,
    artworkId: artwork.id,
    templateId: artwork.templateId,
    colors: artwork.colors,
    fishName: artwork.fishName ?? artwork.templateName,
    x: (i * 180) % Math.max(containerWidth - 100, 400),
    y: 80 + (i * 97) % Math.max(containerHeight - 160, 200),
    speed: 0.6 + (i % 5) * 0.2,
    direction: i % 2 === 0 ? 1 : -1,
    yDrift: 0.4 + (i % 3) * 0.2,
    yOffset: 8 + (i % 4) * 5,
    scale: 0.75 + (i % 3) * 0.15,
    yPhase: i * 1.1,
  }))

  const positions = useFishAnimation(fishes, containerWidth)
  const [hoveredFish, setHoveredFish] = useState<string | null>(null)

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-black mb-3" style={{ color: '#0b2545' }}>
          🌊 Đại Dương
        </h1>
        <p className="font-semibold" style={{ color: '#4a7fa5' }}>
          {approvedArtworks.length} con cá đang bơi vui vẻ trong đại dương của chúng ta
        </p>
      </div>

      {/* Ocean tank */}
      <div
        ref={containerRef}
        className="relative w-full rounded-3xl overflow-hidden"
        style={{
          height: 520,
          background: 'linear-gradient(180deg, #0077b6 0%, #023e8a 40%, #03045e 100%)',
          boxShadow: '0 20px 60px rgba(2,62,138,0.4)',
          border: '3px solid rgba(144,224,239,0.3)',
        }}
      >
        {/* Light rays */}
        <div className="absolute inset-0 pointer-events-none">
          {[15, 35, 55, 75].map((x) => (
            <div
              key={x}
              className="absolute top-0 opacity-5"
              style={{
                left: `${x}%`,
                width: 60,
                height: '100%',
                background: 'linear-gradient(180deg, #90e0ef, transparent)',
                transform: `skewX(${x > 50 ? 15 : -15}deg)`,
              }}
            />
          ))}
        </div>

        {/* Seabed */}
        <div
          className="absolute bottom-0 left-0 right-0 h-16"
          style={{
            background: 'linear-gradient(180deg, transparent, rgba(255,215,100,0.2))',
            borderTop: '2px solid rgba(255,215,100,0.15)',
          }}
        />

        {/* Seaweed */}
        {[5, 20, 40, 60, 80, 95].map((x, i) => (
          <div
            key={x}
            className="absolute bottom-8 sway-anim"
            style={{
              left: `${x}%`,
              animationDelay: `${i * 0.4}s`,
              animationDuration: `${2 + (i % 3) * 0.5}s`,
            }}
          >
            <svg width="16" height={40 + (i % 3) * 20} viewBox="0 0 16 60">
              <path
                d="M8,60 Q12,45 8,30 Q4,15 8,0"
                fill="none"
                stroke={i % 2 === 0 ? '#06d6a0' : '#2dc653'}
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
          </div>
        ))}

        {/* Bubbles */}
        {[10, 30, 50, 70, 90].map((x, i) => (
          <div
            key={x}
            className="bubble absolute"
            style={{
              left: `${x}%`,
              bottom: 0,
              width: 6 + (i % 3) * 4,
              height: 6 + (i % 3) * 4,
              animationDuration: `${6 + i * 2}s`,
              animationDelay: `${i * 1.5}s`,
            }}
          />
        ))}

        {/* Fish */}
        {fishes.map((fish) => {
          const template = fishTemplates.find((t) => t.id === fish.templateId)
          if (!template) return null
          const pos = positions[fish.id] ?? { x: fish.x, y: fish.y, dir: fish.direction }
          const isHovered = hoveredFish === fish.id

          return (
            <div
              key={fish.id}
              className="absolute cursor-pointer transition-transform"
              style={{
                left: pos.x,
                top: pos.y,
                transform: `scaleX(${pos.dir === -1 ? -1 : 1}) scale(${fish.scale * (isHovered ? 1.15 : 1)})`,
                transformOrigin: 'center center',
                width: 80,
                zIndex: isHovered ? 10 : 1,
              }}
              onMouseEnter={() => setHoveredFish(fish.id)}
              onMouseLeave={() => setHoveredFish(null)}
            >
              <FishSvg
                template={template}
                colors={fish.colors}
                className="w-full"
                style={{
                  filter: `drop-shadow(0 4px 12px rgba(0,0,0,0.3)) ${isHovered ? 'drop-shadow(0 0 12px rgba(144,224,239,0.8))' : ''}`,
                }}
              />

              {/* Tooltip */}
              {isHovered && (
                <div
                  className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-black pointer-events-none"
                  style={{
                    background: 'rgba(255,255,255,0.95)',
                    color: '#0b2545',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                    transform: `translateX(-50%) scaleX(${pos.dir === -1 ? -1 : 1})`,
                  }}
                >
                  🐠 {fish.fishName}
                </div>
              )}
            </div>
          )
        })}

        {/* Empty state */}
        {approvedArtworks.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
            <div className="text-5xl mb-4 opacity-60">🌊</div>
            <p className="text-white/60 font-bold text-lg">Đại dương đang trống...</p>
            <p className="text-white/40 text-sm font-semibold mt-2">
              Hãy vẽ và gửi tác phẩm để thả cá vào đây!
            </p>
          </div>
        )}
      </div>

      {/* Fish list below */}
      {approvedArtworks.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-black mb-4" style={{ color: '#0b2545' }}>
            🐟 Những cư dân của đại dương
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {approvedArtworks.map((artwork) => {
              const template = fishTemplates.find((t) => t.id === artwork.templateId)
              if (!template) return null
              return (
                <div
                  key={artwork.id}
                  className="rounded-2xl p-3 text-center"
                  style={{
                    background: 'rgba(255,255,255,0.7)',
                    border: '1.5px solid rgba(20,136,198,0.12)',
                  }}
                >
                  <FishSvg
                    template={template}
                    colors={artwork.colors}
                    className="w-full"
                    style={{ height: 60 }}
                  />
                  <p className="text-xs font-black mt-2" style={{ color: '#0b2545' }}>
                    {artwork.fishName ?? artwork.templateName}
                  </p>
                  <p className="text-xs font-semibold" style={{ color: '#4a7fa5' }}>
                    {artwork.username}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
