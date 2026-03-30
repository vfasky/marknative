import type { Background, CardElement, CardSchema } from '../types.js'

export type DiaryCardOptions = {
  date: string        // e.g. '2024.03.30'
  weekday?: string    // e.g. '周六'
  weather?: string    // plain text only, e.g. '晴天' (no emoji)
  mood?: string       // plain text only, e.g. '开心'
  content: string
  dayCount?: number   // e.g. 30
  totalDays?: number  // e.g. 100
  tags?: string[]
  fontFamily?: string
  size?: { width: number; height: number }
  background?: Background
  accentColor?: string
}

export function diaryCard(opts: DiaryCardOptions): CardSchema {
  const font = opts.fontFamily ?? 'sans-serif'
  const w = opts.size?.width ?? 1080
  const h = opts.size?.height ?? 1440
  const pad = 80
  const cw = w - pad * 2
  const accent = opts.accentColor ?? '#f59e0b'

  const bg: Background = opts.background ?? {
    type: 'linear-gradient',
    angle: 160,
    stops: [
      { offset: 0, color: '#fffbeb' },
      { offset: 1, color: '#fef3c7' },
    ],
  }

  // ── sizes ─────────────────────────────────────────────────────────────────
  const dateFs     = Math.round(w * 0.044)
  const weekdayFs  = Math.round(w * 0.028)
  const tagFs      = Math.round(w * 0.026)
  const contentFs  = Math.round(w * 0.034)
  const countFs    = Math.round(w * 0.050)
  const smallFs    = Math.round(w * 0.024)

  const cardX = 48
  const cardW = w - 96
  const cardY = 48
  const cardH = h - 96

  // Header area
  const headerTopPad = Math.round(w * 0.065)
  const dateLineH    = Math.round(dateFs * 1.5)
  const weekdayLineH = Math.round(weekdayFs * 1.5)

  // Day counter pill (top-right)
  const pillW  = Math.round(w * 0.22)
  const pillH  = Math.round(w * 0.10)
  const pillX  = cardX + cardW - pad * 0.6 - pillW
  const pillY  = cardY + headerTopPad - Math.round(pillH * 0.2)

  // Meta tags row (weather + mood)
  const metaTagH  = Math.round(tagFs * 2.2)
  const metaTagPadH = Math.round(tagFs * 0.6)
  const metaY =
    cardY + headerTopPad
    + dateLineH
    + (opts.weekday ? weekdayLineH + 6 : 0)
    + 20

  // Divider
  const dividerY = metaY + metaTagH + 28

  // Content
  const contentY      = dividerY + 24
  const contentLineH  = Math.round(contentFs * 1.85)

  // Tags footer
  const tagsY = cardY + cardH - pad - Math.round(tagFs * 1.5)

  // ── build meta tags ────────────────────────────────────────────────────────
  const metaItems = [
    opts.weather ? `${opts.weather}` : null,
    opts.mood    ? `${opts.mood}`    : null,
  ].filter(Boolean) as string[]

  const metaTags: CardElement[] = metaItems.flatMap((label, i): CardElement[] => {
    const tagW = Math.round(tagFs * label.length * 1.15 + tagFs * 1.2)
    const offsetX = i === 0 ? 0 : Math.round(tagFs * metaItems[0]!.length * 1.15 + tagFs * 1.2 + 16)
    return [
      {
        type: 'rect',
        x: pad + offsetX, y: metaY,
        width: tagW, height: metaTagH,
        borderRadius: Math.round(metaTagH / 2),
        fill: { type: 'color', value: `${accent}20` },
      },
      {
        type: 'text',
        x: pad + offsetX + metaTagPadH,
        y: metaY + Math.round((metaTagH - tagFs) / 2) - 2,
        width: tagW - metaTagPadH * 2,
        lineHeight: Math.round(tagFs * 1.4),
        spans: [{
          content: label,
          font: `${tagFs}px ${font}`,
          fill: { type: 'color', value: '#92400e' },
        }],
      },
    ]
  })

  const elements: CardElement[] = [
    // card surface
    {
      type: 'rect',
      x: cardX, y: cardY,
      width: cardW, height: cardH,
      borderRadius: 40,
      fill: { type: 'color', value: 'rgba(255,255,255,0.75)' },
      shadow: { dx: 0, dy: 8, blur: 40, color: 'rgba(245,158,11,0.15)' },
    },
    // day counter pill (top right)
    ...(opts.dayCount != null ? [
      {
        type: 'rect' as const,
        x: pillX, y: pillY,
        width: pillW, height: pillH,
        borderRadius: Math.round(pillH / 2),
        fill: { type: 'color' as const, value: accent },
      },
      {
        type: 'text' as const,
        x: pillX, y: pillY + Math.round((pillH - countFs) / 2) - 2,
        width: pillW,
        lineHeight: Math.round(countFs * 1.1),
        align: 'center' as const,
        spans: [{
          content: `DAY ${opts.dayCount}`,
          font: `bold ${countFs}px ${font}`,
          fill: { type: 'color' as const, value: '#ffffff' },
        }],
      },
      ...(opts.totalDays != null ? [{
        type: 'text' as const,
        x: pillX,
        y: pillY + pillH + 8,
        width: pillW,
        lineHeight: Math.round(smallFs * 1.4),
        align: 'center' as const,
        spans: [{
          content: `/ ${opts.totalDays} 天`,
          font: `${smallFs}px ${font}`,
          fill: { type: 'color' as const, value: '#b45309' },
        }],
      }] : []),
    ] : []),
    // date
    {
      type: 'text',
      x: pad, y: cardY + headerTopPad,
      width: opts.dayCount != null ? cw - pillW - 20 : cw,
      lineHeight: dateLineH,
      spans: [{
        content: opts.date,
        font: `bold ${dateFs}px ${font}`,
        fill: { type: 'color', value: '#92400e' },
      }],
    },
    // weekday
    ...(opts.weekday ? [{
      type: 'text' as const,
      x: pad, y: cardY + headerTopPad + dateLineH + 6,
      width: cw,
      lineHeight: weekdayLineH,
      spans: [{
        content: opts.weekday,
        font: `${weekdayFs}px ${font}`,
        fill: { type: 'color' as const, value: '#b45309' },
      }],
    }] : []),
    // meta tags (weather / mood)
    ...metaTags,
    // divider
    {
      type: 'rect',
      x: pad, y: dividerY,
      width: cw, height: 1,
      fill: { type: 'color', value: `${accent}35` },
    },
    // content
    {
      type: 'text',
      x: pad, y: contentY,
      width: cw,
      lineHeight: contentLineH,
      maxLines: 12,
      spans: [{
        content: opts.content,
        font: `${contentFs}px ${font}`,
        fill: { type: 'color', value: '#374151' },
      }],
    },
    // tags
    ...(opts.tags && opts.tags.length > 0 ? [{
      type: 'text' as const,
      x: pad, y: tagsY,
      width: cw,
      lineHeight: Math.round(tagFs * 1.5),
      spans: [{
        content: opts.tags.map(t => `#${t}`).join('  '),
        font: `${tagFs}px ${font}`,
        fill: { type: 'color' as const, value: '#b45309' },
      }],
    }] : []),
  ]

  return { width: w, height: h, background: bg, elements }
}
