import type { Background, CardElement, CardSchema } from '../types.js'

export type Step = {
  title: string
  desc?: string
}

export type StepCardOptions = {
  title: string
  subtitle?: string
  steps: Step[]
  fontFamily?: string
  size?: { width: number; height: number }
  background?: Background
  accentColor?: string
  padding?: number
}

export function stepCard(opts: StepCardOptions): CardSchema {
  const font = opts.fontFamily ?? 'sans-serif'
  const w = opts.size?.width ?? 1080
  const h = opts.size?.height ?? 1440
  const pad = opts.padding ?? 60
  const accent = opts.accentColor ?? '#6366f1'

  const bg: Background = opts.background ?? {
    type: 'linear-gradient',
    angle: 150,
    stops: [
      { offset: 0, color: '#e0e7ff' },
      { offset: 1, color: '#c7d2fe' },
    ],
  }

  // ── sizes ────────────────────────────────────────────────────────────────
  const titleFs   = Math.round(w * 0.050)
  const subFs     = Math.round(w * 0.028)
  const numFs     = Math.round(w * 0.080)
  const stepTitleFs = Math.round(w * 0.036)
  const stepDescFs  = Math.round(w * 0.028)
  const stepInnerPad = Math.round(w * 0.040)
  const accentBarW = 8

  // Header height
  const headerPad  = Math.round(w * 0.075)
  const titleLineH = Math.round(titleFs * 1.5)
  const subLineH   = Math.round(subFs * 1.5)
  const headerH    = headerPad + titleLineH + (opts.subtitle ? subLineH + 10 : 0) + headerPad

  // Step card height
  const numLineH     = Math.round(numFs * 1.15)
  const titleLineH2  = Math.round(stepTitleFs * 1.5)
  const descLineH    = Math.round(stepDescFs * 1.5)
  const stepInnerH   = numLineH + titleLineH2 + (opts.steps.some(s => s.desc) ? descLineH + 8 : 0) + 8
  const stepCardH    = stepInnerH + stepInnerPad * 2
  const connectorH   = Math.round(w * 0.025)
  const stepCardW    = w - pad * 2

  const totalH = headerH + opts.steps.length * stepCardH + (opts.steps.length - 1) * connectorH + pad
  const cardH  = Math.max(h, totalH)

  const elements: CardElement[] = [
    // header background panel
    {
      type: 'rect',
      x: 0, y: 0,
      width: w, height: headerH + Math.round(w * 0.04),
      fill: { type: 'color', value: accent },
    },
    // title
    {
      type: 'text',
      x: pad, y: headerPad,
      width: w - pad * 2,
      lineHeight: titleLineH,
      spans: [{
        content: opts.title,
        font: `bold ${titleFs}px ${font}`,
        fill: { type: 'color', value: '#ffffff' },
      }],
    },
    ...(opts.subtitle ? [{
      type: 'text' as const,
      x: pad, y: headerPad + titleLineH + 10,
      width: w - pad * 2,
      lineHeight: subLineH,
      spans: [{
        content: opts.subtitle,
        font: `${subFs}px ${font}`,
        fill: { type: 'color' as const, value: 'rgba(255,255,255,0.75)' },
      }],
    }] : []),
    // step cards
    ...opts.steps.flatMap((step, i): CardElement[] => {
      const cardY = headerH + i * (stepCardH + connectorH)
      const hasDesc = !!step.desc

      return [
        // white step card
        {
          type: 'rect',
          x: pad, y: cardY,
          width: stepCardW, height: stepCardH,
          borderRadius: 24,
          fill: { type: 'color', value: '#ffffff' },
          shadow: { dx: 0, dy: 6, blur: 24, color: 'rgba(99,102,241,0.12)' },
        },
        // accent left bar
        {
          type: 'rect',
          x: pad, y: cardY,
          width: accentBarW, height: stepCardH,
          borderRadius: 24,
          fill: { type: 'color', value: accent },
        },
        // step number (large, faint)
        {
          type: 'text',
          x: pad + accentBarW + stepInnerPad,
          y: cardY + stepInnerPad - Math.round(numFs * 0.15),
          width: Math.round(numFs * 2.2),
          lineHeight: numLineH,
          spans: [{
            content: String(i + 1).padStart(2, '0'),
            font: `bold ${numFs}px ${font}`,
            fill: { type: 'color', value: `${accent}30` },
          }],
        },
        // step title
        {
          type: 'text',
          x: pad + accentBarW + stepInnerPad,
          y: cardY + stepInnerPad + numLineH,
          width: stepCardW - accentBarW - stepInnerPad * 2,
          lineHeight: titleLineH2,
          maxLines: 2,
          spans: [{
            content: step.title,
            font: `bold ${stepTitleFs}px ${font}`,
            fill: { type: 'color', value: '#1e1b4b' },
          }],
        },
        // step desc
        ...(hasDesc ? [{
          type: 'text' as const,
          x: pad + accentBarW + stepInnerPad,
          y: cardY + stepInnerPad + numLineH + titleLineH2 + 8,
          width: stepCardW - accentBarW - stepInnerPad * 2,
          lineHeight: descLineH,
          maxLines: 2,
          spans: [{
            content: step.desc!,
            font: `${stepDescFs}px ${font}`,
            fill: { type: 'color' as const, value: '#6b7280' },
          }],
        }] : []),
        // connector dot
        ...(i < opts.steps.length - 1 ? [{
          type: 'rect' as const,
          x: Math.round(w / 2) - 3,
          y: cardY + stepCardH + Math.round(connectorH * 0.2),
          width: 6, height: Math.round(connectorH * 0.6),
          borderRadius: 3,
          fill: { type: 'color' as const, value: `${accent}50` },
        }] : []),
      ]
    }),
  ]

  return { width: w, height: cardH, background: bg, elements }
}
