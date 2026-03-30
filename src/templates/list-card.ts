import type { Background, CardElement, CardSchema } from '../types.js'

export type ListItem = {
  title: string
  desc?: string
}

export type ListCardOptions = {
  title: string
  subtitle?: string
  items: ListItem[]
  fontFamily?: string
  size?: { width: number; height: number }
  background?: Background
  accentColor?: string
  padding?: number
}

export function listCard(opts: ListCardOptions): CardSchema {
  const font = opts.fontFamily ?? 'sans-serif'
  const w = opts.size?.width ?? 1080
  const h = opts.size?.height ?? 1440
  const pad = opts.padding ?? 72
  const cw = w - pad * 2
  const accent = opts.accentColor ?? '#FF6B9D'

  const bg: Background = opts.background ?? {
    type: 'linear-gradient',
    angle: 150,
    stops: [
      { offset: 0, color: '#ffecd2' },
      { offset: 1, color: '#fcb69f' },
    ],
  }

  // ── sizes (all proportional to card width) ──────────────────────────────
  const titleFs   = Math.round(w * 0.052)
  const subFs     = Math.round(w * 0.030)
  const itemTitleFs = Math.round(w * 0.036)
  const itemDescFs  = Math.round(w * 0.028)
  const badgeR    = Math.round(w * 0.038)   // radius of number circle
  const badgeDia  = badgeR * 2
  const itemGap   = Math.round(w * 0.028)   // vertical gap between items

  // item height: circle diameter OR title+desc, whichever is taller
  const itemH = Math.max(
    badgeDia,
    Math.round(itemTitleFs * 1.45) + (opts.items.some(i => i.desc) ? Math.round(itemDescFs * 1.5) + 6 : 0),
  )

  const headerY    = pad + Math.round(w * 0.04)
  const titleLineH = Math.round(titleFs * 1.45)
  const subLineH   = Math.round(subFs * 1.5)
  const afterHeader = headerY + titleLineH + (opts.subtitle ? subLineH + 8 : 0) + Math.round(w * 0.03)

  // accent underline below title
  const underlineY = headerY + titleLineH - 4
  const underlineW = Math.round(cw * 0.1)

  const listH = opts.items.length * itemH + (opts.items.length - 1) * itemGap

  // Auto-expand height to fit content with padding
  const neededH = afterHeader + listH + pad * 2
  const cardH = Math.max(h, neededH)

  // ── elements ─────────────────────────────────────────────────────────────
  const elements: CardElement[] = [
    // white card panel
    {
      type: 'rect',
      x: 40, y: 40,
      width: w - 80, height: cardH - 80,
      borderRadius: 40,
      fill: { type: 'color', value: 'rgba(255,255,255,0.88)' },
      shadow: { dx: 0, dy: 12, blur: 48, color: 'rgba(252,182,159,0.35)' },
    },
    // title
    {
      type: 'text',
      x: pad, y: headerY,
      width: cw,
      lineHeight: titleLineH,
      spans: [{
        content: opts.title,
        font: `bold ${titleFs}px ${font}`,
        fill: { type: 'color', value: '#1a1a2e' },
      }],
    },
    // accent underline
    {
      type: 'rect',
      x: pad, y: underlineY,
      width: underlineW, height: 5,
      borderRadius: 3,
      fill: { type: 'color', value: accent },
    },
    // subtitle
    ...(opts.subtitle ? [{
      type: 'text' as const,
      x: pad, y: headerY + titleLineH + 8,
      width: cw,
      lineHeight: subLineH,
      spans: [{
        content: opts.subtitle,
        font: `${subFs}px ${font}`,
        fill: { type: 'color' as const, value: '#6b7280' },
      }],
    }] : []),
    // list items
    ...opts.items.flatMap((item, i): CardElement[] => {
      const iy = afterHeader + i * (itemH + itemGap)
      const isFirst = i === 0
      const badgeColor = isFirst ? accent : `${accent}28`
      const numColor   = isFirst ? '#ffffff' : accent
      const descY = iy + Math.round(itemTitleFs * 1.5) + 4

      return [
        // circle badge
        {
          type: 'rect',
          x: pad, y: iy + Math.round((itemH - badgeDia) / 2),
          width: badgeDia, height: badgeDia,
          borderRadius: badgeR,
          fill: { type: 'color', value: badgeColor },
        },
        // number inside circle
        {
          type: 'text',
          x: pad, y: iy + Math.round((itemH - itemTitleFs) / 2) - 2,
          width: badgeDia,
          lineHeight: Math.round(itemTitleFs * 1.1),
          align: 'center',
          spans: [{
            content: String(i + 1),
            font: `bold ${Math.round(itemTitleFs * 0.8)}px ${font}`,
            fill: { type: 'color', value: numColor },
          }],
        },
        // item title
        {
          type: 'text',
          x: pad + badgeDia + 20, y: iy + Math.round((itemH - (item.desc ? itemTitleFs * 1.45 + itemDescFs * 1.5 + 6 : itemTitleFs)) / 2),
          width: cw - badgeDia - 20,
          lineHeight: Math.round(itemTitleFs * 1.45),
          maxLines: 2,
          spans: [{
            content: item.title,
            font: `bold ${itemTitleFs}px ${font}`,
            fill: { type: 'color', value: '#1a1a2e' },
          }],
        },
        // item desc
        ...(item.desc ? [{
          type: 'text' as const,
          x: pad + badgeDia + 20,
          y: iy + Math.round((itemH - (itemTitleFs * 1.45 + itemDescFs * 1.5 + 6)) / 2) + Math.round(itemTitleFs * 1.5) + 4,
          width: cw - badgeDia - 20,
          lineHeight: Math.round(itemDescFs * 1.5),
          maxLines: 1,
          spans: [{
            content: item.desc,
            font: `${itemDescFs}px ${font}`,
            fill: { type: 'color' as const, value: '#9ca3af' },
          }],
        }] : []),
        // separator (not after last item)
        ...(i < opts.items.length - 1 ? [{
          type: 'rect' as const,
          x: pad + badgeDia + 20,
          y: iy + itemH + Math.round(itemGap / 2) - 1,
          width: cw - badgeDia - 20,
          height: 1,
          fill: { type: 'color' as const, value: '#f3f4f6' },
        }] : []),
      ]
    }),
    // footer count
    {
      type: 'text',
      x: pad, y: cardH - pad - Math.round(subFs * 1.4),
      width: cw,
      lineHeight: Math.round(subFs * 1.4),
      align: 'right',
      spans: [{
        content: `共 ${opts.items.length} 条`,
        font: `${subFs}px ${font}`,
        fill: { type: 'color', value: '#d1d5db' },
      }],
    },
  ]

  return { width: w, height: cardH, background: bg, elements }
}
