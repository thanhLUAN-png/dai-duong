import type { FishTemplate } from '../data/fishTemplates'

interface FishSvgProps {
  template: FishTemplate
  colors: Record<string, string>
  onRegionClick?: (regionId: string) => void
  className?: string
  style?: React.CSSProperties
}

export default function FishSvg({ template, colors, onRegionClick, className, style }: FishSvgProps) {
  return (
    <svg
      viewBox={template.viewBox}
      className={className}
      style={style}
      xmlns="http://www.w3.org/2000/svg"
    >
      {template.regions.map((region) => {
        const fill = colors[region.id] ?? region.defaultColor
        const commonProps = {
          key: region.id,
          fill: region.noFill ? 'none' : fill,
          stroke: region.strokeColor ? (colors[region.id] ?? region.strokeColor) : '#00000033',
          strokeWidth: region.strokeWidth ?? 1.5,
          strokeLinejoin: 'round' as const,
          strokeLinecap: 'round' as const,
          style: onRegionClick ? { cursor: 'pointer' } : undefined,
          onClick: onRegionClick ? () => onRegionClick(region.id) : undefined,
        }

        if (region.type === 'ellipse') {
          const { cx, cy, rx, ry } = region.attrs as { cx: number; cy: number; rx: number; ry: number }
          return <ellipse {...commonProps} cx={cx} cy={cy} rx={rx} ry={ry} />
        }
        if (region.type === 'circle') {
          const { cx, cy, r } = region.attrs as { cx: number; cy: number; r: number }
          return <circle {...commonProps} cx={cx} cy={cy} r={r} />
        }
        if (region.type === 'polygon') {
          return <polygon {...commonProps} points={region.attrs.points as string} />
        }
        if (region.type === 'path') {
          return <path {...commonProps} d={region.attrs.d as string} />
        }
        return null
      })}
    </svg>
  )
}
