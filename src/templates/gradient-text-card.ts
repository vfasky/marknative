import type { Background, CardSchema, GradientStop } from '../types.js'

export const GRADIENT_PRESETS = {
  sakura:   [{ offset: 0, color: '#f9a8d4' }, { offset: 1, color: '#fbcfe8' }],
  sunset:   [{ offset: 0, color: '#fd7f6f' }, { offset: 0.5, color: '#feb2a8' }, { offset: 1, color: '#fcd5ce' }],
  ocean:    [{ offset: 0, color: '#4facfe' }, { offset: 1, color: '#00f2fe' }],
  aurora:   [{ offset: 0, color: '#a78bfa' }, { offset: 0.5, color: '#ec4899' }, { offset: 1, color: '#f97316' }],
  mint:     [{ offset: 0, color: '#34d399' }, { offset: 1, color: '#6ee7b7' }],
  night:    [{ offset: 0, color: '#1e1b4b' }, { offset: 1, color: '#312e81' }],
  rose:     [{ offset: 0, color: '#fda4af' }, { offset: 1, color: '#fecdd3' }],
  lemon:    [{ offset: 0, color: '#fde047' }, { offset: 1, color: '#fef08a' }],
  matcha:   [{ offset: 0, color: '#86efac' }, { offset: 1, color: '#d9f99d' }],
  lavender: [{ offset: 0, color: '#c4b5fd' }, { offset: 1, color: '#e9d5ff' }],
} satisfies Record<string, GradientStop[]>

export type GradientTextCardOptions = {
  mainText: string
  subText?: string
  caption?: string  // plain text only, no emoji
  fontFamily?: string
  size?: { width: number; height: number }
  bgGradient?: GradientStop[] | keyof typeof GRADIENT_PRESETS
  bgAngle?: number
  textColor?: string  // explicit override; auto-detected if omitted
}

export function gradientTextCard(opts: GradientTextCardOptions): CardSchema {
  const font = opts.fontFamily ?? 'sans-serif'
  const w = opts.size?.width ?? 1080
  const h = opts.size?.height ?? 1080
  const pad = Math.round(w * 0.1)
  const cw = w - pad * 2

  const bgStops: GradientStop[] =
    typeof opts.bgGradient === 'string'
      ? GRADIENT_PRESETS[opts.bgGradient]
      : (opts.bgGradient ?? GRADIENT_PRESETS.aurora)

  const bg: Background = {
    type: 'linear-gradient',
    angle: opts.bgAngle ?? 135,
    stops: bgStops,
  }

  const dark = isLightBg(bgStops[0]?.color ?? '#fff')
  const mainColor   = opts.textColor ?? (dark ? '#1f2937'              : '#ffffff')
  const subColor    = opts.textColor ?? (dark ? 'rgba(31,41,55,0.7)'   : 'rgba(255,255,255,0.8)')
  const captionColor = dark ? 'rgba(31,41,55,0.45)' : 'rgba(255,255,255,0.5)'

  // font sizes based on character count
  const mainFs = Math.round(w * 0.070)
  const subFs  = Math.round(w * 0.030)
  const captionFs = Math.round(w * 0.022)
  const mainLineH = Math.round(mainFs * 1.35)
  const subLineH  = Math.round(subFs * 1.6)
  const captionLineH = Math.round(captionFs * 1.6)

  // estimate lines for vertical centering (pre-wrap: \n is a hard break, each segment wraps independently)
  const charsPerLine = Math.max(1, Math.floor(cw / (mainFs * 0.9)))
  const mainLines = opts.mainText.split('\n').reduce(
    (sum, seg) => sum + Math.max(1, Math.ceil((seg.replace(/\s/g, '').length || 1) / charsPerLine)),
    0,
  )
  const mainBlockH = Math.min(mainLines, 6) * mainLineH
  const subBlockH  = opts.subText  ? subLineH + 24 : 0
  const capBlockH  = opts.caption ? captionLineH + 16 : 0
  const totalTextH = mainBlockH + subBlockH + capBlockH
  const startY = Math.round((h - totalTextH) / 2)

  return {
    width: w, height: h,
    background: bg,
    elements: [
      // decorative circle top-left
      {
        type: 'rect',
        x: -Math.round(w * 0.08), y: -Math.round(w * 0.08),
        width: Math.round(w * 0.35), height: Math.round(w * 0.35),
        borderRadius: Math.round(w * 0.18),
        fill: { type: 'color', value: 'rgba(255,255,255,0.25)' },
      },
      // decorative circle bottom-right
      {
        type: 'rect',
        x: w - Math.round(w * 0.28), y: h - Math.round(w * 0.28),
        width: Math.round(w * 0.32), height: Math.round(w * 0.32),
        borderRadius: Math.round(w * 0.16),
        fill: { type: 'color', value: 'rgba(255,255,255,0.18)' },
      },
      // main text
      {
        type: 'text',
        x: pad, y: startY,
        width: cw,
        lineHeight: mainLineH,
        align: 'center',
        spans: opts.mainText.split('\n').map(seg => ({
          content: seg,
          font: `bold ${mainFs}px ${font}`,
          fill: { type: 'color', value: mainColor } as const,
        })),
      },
      // sub text
      ...(opts.subText ? [{
        type: 'text' as const,
        x: pad, y: startY + mainBlockH + 24,
        width: cw,
        lineHeight: subLineH,
        align: 'center',
        spans: [{
          content: opts.subText,
          font: `${subFs}px ${font}`,
          fill: { type: 'color' as const, value: subColor },
        }],
      }] : []),
      // caption
      ...(opts.caption ? [{
        type: 'text' as const,
        x: pad, y: startY + mainBlockH + subBlockH + 16,
        width: cw,
        lineHeight: captionLineH,
        align: 'center',
        spans: [{
          content: opts.caption,
          font: `${captionFs}px ${font}`,
          fill: { type: 'color' as const, value: captionColor },
        }],
      }] : []),
    ],
  }
}

function isLightBg(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 > 128
}
