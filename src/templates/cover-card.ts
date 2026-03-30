import type { CardSchema, GradientStop } from '../types.js'

export type CoverCardOptions = {
  /** Path / URL of the background image */
  imageSrc: string
  title: string
  subtitle?: string
  badge?: string           // small label e.g. '旅行日记' '好物推荐'
  fontFamily?: string
  size?: { width: number; height: number }
  /** Overlay gradient darkness. 0 = none, 1 = full black. Default 0.65 */
  overlayStrength?: number
  /** Overlay gradient color. Default black. */
  overlayColor?: string
  titleColor?: string
  badgeColor?: string
  badgeBg?: string
}

export function coverCard(opts: CoverCardOptions): CardSchema {
  const font = opts.fontFamily ?? 'sans-serif'
  const w = opts.size?.width ?? 1080
  const h = opts.size?.height ?? 1440
  const pad = 72
  const cw = w - pad * 2
  const strength = opts.overlayStrength ?? 0.65
  const overlayColor = opts.overlayColor ?? '#000000'
  const titleColor = opts.titleColor ?? '#ffffff'
  const badgeBg = opts.badgeBg ?? 'rgba(255,255,255,0.2)'
  const badgeColor = opts.badgeColor ?? '#ffffff'

  // Build overlay gradient: transparent at top, dark at bottom
  const hex = overlayColor.replace('#', '')
  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)
  const overlayStops: GradientStop[] = [
    { offset: 0,   color: `rgba(${r},${g},${b},0)` },
    { offset: 0.4, color: `rgba(${r},${g},${b},0)` },
    { offset: 1,   color: `rgba(${r},${g},${b},${strength})` },
  ]

  const titleFontSize = Math.round(w * 0.058)
  const subtitleFontSize = Math.round(w * 0.034)
  const badgeFontSize = Math.round(w * 0.028)
  const badgeH = Math.round(badgeFontSize * 2.4)
  const badgeW = Math.round(badgeFontSize * 5.5)

  const textBlockH =
    Math.round(titleFontSize * 1.5) * Math.ceil(opts.title.length / 14)
    + (opts.subtitle ? Math.round(subtitleFontSize * 1.6) + 16 : 0)
  const textStartY = h - pad - textBlockH

  return {
    width: w,
    height: h,
    background: { type: 'image', src: opts.imageSrc, fit: 'cover' },
    elements: [
      // gradient overlay
      {
        type: 'rect',
        x: 0, y: 0,
        width: w, height: h,
        fill: {
          type: 'linear-gradient',
          angle: 180,
          stops: overlayStops,
        },
      },
      // badge
      ...(opts.badge ? [
        {
          type: 'rect' as const,
          x: pad, y: pad,
          width: badgeW, height: badgeH,
          borderRadius: badgeH / 2,
          fill: { type: 'color' as const, value: badgeBg },
          stroke: { paint: { type: 'color' as const, value: 'rgba(255,255,255,0.3)' }, width: 1.5 },
        },
        {
          type: 'text' as const,
          x: pad, y: pad + Math.round((badgeH - badgeFontSize) / 2),
          width: badgeW,
          lineHeight: Math.round(badgeFontSize * 1.3),
          align: 'center' as const,
          spans: [{
            content: opts.badge,
            font: `${badgeFontSize}px ${font}`,
            fill: { type: 'color' as const, value: badgeColor },
          }],
        },
      ] : []),
      // title
      {
        type: 'text',
        x: pad, y: textStartY,
        width: cw,
        lineHeight: Math.round(titleFontSize * 1.5),
        maxLines: 3,
        spans: [{
          content: opts.title,
          font: `bold ${titleFontSize}px ${font}`,
          fill: { type: 'color', value: titleColor },
          stroke: { paint: { type: 'color', value: 'rgba(0,0,0,0.3)' }, width: 1 },
        }],
        shadow: { dx: 0, dy: 2, blur: 12, color: 'rgba(0,0,0,0.4)' },
      },
      // subtitle
      ...(opts.subtitle ? [{
        type: 'text' as const,
        x: pad,
        y: textStartY + Math.round(titleFontSize * 1.6) + 8,
        width: cw,
        lineHeight: Math.round(subtitleFontSize * 1.6),
        maxLines: 2,
        spans: [{
          content: opts.subtitle,
          font: `${subtitleFontSize}px ${font}`,
          fill: { type: 'color' as const, value: 'rgba(255,255,255,0.85)' },
        }],
        shadow: { dx: 0, dy: 1, blur: 8, color: 'rgba(0,0,0,0.3)' },
      }] : []),
    ],
  }
}
