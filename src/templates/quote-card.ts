import type { Background, CardSchema } from '../types.js'

export type QuoteCardOptions = {
  quote: string
  author?: string
  /** CSS font family */
  fontFamily?: string
  size?: { width: number; height: number }
  background?: Background
  quoteColor?: string
  authorColor?: string
  accentColor?: string
}

export function quoteCard(opts: QuoteCardOptions): CardSchema {
  const font = opts.fontFamily ?? 'sans-serif'
  const w = opts.size?.width ?? 1080
  const h = opts.size?.height ?? 1080  // square default for quotes
  const pad = Math.round(w * 0.1)
  const contentW = w - pad * 2
  const quoteColor = opts.quoteColor ?? '#FFFFFF'
  const authorColor = opts.authorColor ?? 'rgba(255,255,255,0.65)'
  const accentColor = opts.accentColor ?? 'rgba(255,255,255,0.25)'

  const bg: Background = opts.background ?? {
    type: 'linear-gradient',
    angle: 160,
    stops: [
      { offset: 0, color: '#1a1a2e' },
      { offset: 1, color: '#16213e' },
    ],
  }

  const quoteFontSize = Math.round(w * 0.045)
  const markFontSize = Math.round(w * 0.22)

  return {
    width: w,
    height: h,
    background: bg,
    elements: [
      // decorative left-border accent
      {
        type: 'rect',
        x: pad - 20, y: Math.round(h * 0.28),
        width: 5, height: Math.round(h * 0.44),
        borderRadius: 3,
        fill: { type: 'color', value: accentColor },
      },
      // opening quote mark (decorative, large)
      {
        type: 'text',
        x: pad,
        y: Math.round(h * 0.12),
        width: contentW,
        lineHeight: markFontSize,
        spans: [{
          content: '\u201C',  // "
          font: `${markFontSize}px ${font}`,
          fill: { type: 'color', value: accentColor },
        }],
      },
      // quote body
      {
        type: 'text',
        x: pad,
        y: Math.round(h * 0.3),
        width: contentW,
        lineHeight: Math.round(quoteFontSize * 1.75),
        maxLines: 8,
        spans: [{
          content: opts.quote,
          font: `${quoteFontSize}px ${font}`,
          fill: { type: 'color', value: quoteColor },
        }],
      },
      // author
      ...(opts.author
        ? [{
            type: 'text' as const,
            x: pad,
            y: Math.round(h * 0.78),
            width: contentW,
            lineHeight: Math.round(w * 0.04),
            align: 'right' as const,
            spans: [{
              content: `— ${opts.author}`,
              font: `italic ${Math.round(w * 0.032)}px ${font}`,
              fill: { type: 'color' as const, value: authorColor },
            }],
          }]
        : []),
    ],
  }
}
