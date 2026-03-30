import type { Background, CardSchema } from '../types.js'

export type BasicCardOptions = {
  title: string
  body: string
  tags?: string[]
  /** CSS font family, e.g. '"MiSans"' or 'sans-serif' */
  fontFamily?: string
  size?: { width: number; height: number }
  background?: Background
  titleColor?: string
  bodyColor?: string
  tagColor?: string
  padding?: number
}

export function basicCard(opts: BasicCardOptions): CardSchema {
  const font = opts.fontFamily ?? 'sans-serif'
  const w = opts.size?.width ?? 1080
  const h = opts.size?.height ?? 1440
  const pad = opts.padding ?? 80
  const contentW = w - pad * 2
  const titleColor = opts.titleColor ?? '#FFFFFF'
  const bodyColor = opts.bodyColor ?? 'rgba(255,255,255,0.9)'
  const tagColor = opts.tagColor ?? 'rgba(255,255,255,0.6)'

  const bg: Background = opts.background ?? {
    type: 'linear-gradient',
    angle: 135,
    stops: [
      { offset: 0, color: '#FF6B9D' },
      { offset: 1, color: '#C44DFF' },
    ],
  }

  return {
    width: w,
    height: h,
    background: bg,
    elements: [
      // card surface
      {
        type: 'rect',
        x: 40, y: 40,
        width: w - 80, height: h - 80,
        borderRadius: 32,
        fill: { type: 'color', value: 'rgba(255,255,255,0.1)' },
      },
      // title
      {
        type: 'text',
        x: pad, y: Math.round(h * 0.14),
        width: contentW,
        lineHeight: Math.round(w * 0.075),
        align: 'center',
        spans: [{
          content: opts.title,
          font: `bold ${Math.round(w * 0.052)}px ${font}`,
          fill: { type: 'color', value: titleColor },
        }],
      },
      // divider
      {
        type: 'rect',
        x: pad + contentW * 0.3,
        y: Math.round(h * 0.14) + Math.round(w * 0.075) + 24,
        width: contentW * 0.4,
        height: 2,
        borderRadius: 1,
        fill: { type: 'color', value: 'rgba(255,255,255,0.4)' },
      },
      // body
      {
        type: 'text',
        x: pad,
        y: Math.round(h * 0.14) + Math.round(w * 0.075) + 52,
        width: contentW,
        lineHeight: Math.round(w * 0.048),
        maxLines: 12,
        spans: [{
          content: opts.body,
          font: `${Math.round(w * 0.034)}px ${font}`,
          fill: { type: 'color', value: bodyColor },
        }],
      },
      // tags
      ...(opts.tags && opts.tags.length > 0
        ? [{
            type: 'text' as const,
            x: pad,
            y: h - pad - Math.round(w * 0.04),
            width: contentW,
            lineHeight: Math.round(w * 0.04),
            spans: [{
              content: opts.tags.map(t => `#${t}`).join('  '),
              font: `${Math.round(w * 0.026)}px ${font}`,
              fill: { type: 'color' as const, value: tagColor },
            }],
          }]
        : []),
    ],
  }
}
