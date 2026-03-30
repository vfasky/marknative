import { renderCard, registerRenderer, templates } from './index.js'
import { writeFileSync } from 'node:fs'

const F = 'Hiragino Sans GB'

// ── 1. basicCard template ─────────────────────────────────────────────────────
const basic = await renderCard(
  templates.basicCard({
    title: '今日份灵感',
    body: '每一个清晨都是一次新的开始，带着昨天的经验，迎接今天的挑战。不管昨天发生了什么，今天都是全新的机会，去做更好的自己。',
    tags: ['每日灵感', '正能量', '生活态度'],
    fontFamily: `"${F}"`,
  }),
)
writeFileSync('out-basic.png', basic)

// ── 2. quoteCard template ─────────────────────────────────────────────────────
const quote = await renderCard(
  templates.quoteCard({
    quote: '不要等待机会，而要创造机会。每一天都是全新的开始，每一刻都是改变的契机。',
    author: '无名氏',
    fontFamily: `"${F}"`,
  }),
)
writeFileSync('out-quote.png', quote)

// ── 3. Manual card — group + blendMode + radial-gradient + inline spans ───────
const manual = await renderCard({
  width: 1080,
  height: 1440,
  background: {
    type: 'radial-gradient',
    cx: 0.5, cy: 0.3, r: 1.1,
    stops: [
      { offset: 0, color: '#ff9a9e' },
      { offset: 0.5, color: '#fad0c4' },
      { offset: 1, color: '#a18cd1' },
    ],
  },
  elements: [
    // frosted glass panel via blendMode
    {
      type: 'rect',
      x: 60, y: 60,
      width: 960, height: 1320,
      borderRadius: 40,
      fill: { type: 'color', value: 'rgba(255,255,255,0.25)' },
      blendMode: 'screen',
    },
    // group: badge + title as a unit
    {
      type: 'group',
      x: 100, y: 160,
      width: 880, height: 200,
      children: [
        {
          type: 'rect',
          x: 0, y: 0,
          width: 120, height: 40,
          borderRadius: 20,
          fill: { type: 'color', value: 'rgba(255,255,255,0.5)' },
        },
        {
          type: 'text',
          x: 0, y: 8,
          width: 120,
          lineHeight: 40,
          align: 'center',
          spans: [{
            content: 'DAILY',
            font: `bold 22px "${F}"`,
            fill: { type: 'color', value: '#8b5cf6' },
          }],
        },
        {
          type: 'text',
          x: 0, y: 50,
          width: 880,
          lineHeight: 78,
          spans: [{
            content: '今日份灵感',
            font: `bold 56px "${F}"`,
            fill: {
              type: 'linear-gradient',
              angle: 90,
              stops: [
                { offset: 0, color: '#7c3aed' },
                { offset: 1, color: '#db2777' },
              ],
            },
          }],
        },
      ],
    },
    // inline spans: mixed styles in one paragraph
    {
      type: 'text',
      x: 100, y: 440,
      width: 880,
      lineHeight: 56,
      display: 'inline',
      spans: [
        {
          content: '重要提示：',
          font: `bold 38px "${F}"`,
          fill: { type: 'color', value: '#dc2626' },
        },
        {
          content: '每天坚持做一件让自己进步的事，哪怕只有五分钟，积累起来也会有巨大的改变。',
          font: `36px "${F}"`,
          fill: { type: 'color', value: '#374151' },
        },
      ],
    },
    // rotated decorative rect
    {
      type: 'rect',
      x: 820, y: 1100,
      width: 120, height: 120,
      borderRadius: 20,
      fill: {
        type: 'linear-gradient',
        angle: 45,
        stops: [
          { offset: 0, color: '#f59e0b' },
          { offset: 1, color: '#ef4444' },
        ],
      },
      opacity: 0.6,
      transform: { rotate: 25, anchor: [0.5, 0.5] },
    },
    // shadow text
    {
      type: 'text',
      x: 100, y: 1260,
      width: 880,
      lineHeight: 48,
      spans: [{
        content: '#每日灵感  #正能量  #生活态度',
        font: `30px "${F}"`,
        fill: { type: 'color', value: 'rgba(100,100,100,0.7)' },
      }],
      shadow: { dx: 1, dy: 1, blur: 4, color: 'rgba(255,255,255,0.8)' },
    },
  ],
}, { format: 'png' })
writeFileSync('out-manual.png', manual)

// ── 4. Plugin renderer ────────────────────────────────────────────────────────
registerRenderer('watermark', (ctx, el) => {
  const e = el as { x: number; y: number; text: string; font: string; color: string }
  ctx.save()
  ctx.font = e.font
  ctx.fillStyle = e.color
  ctx.textBaseline = 'top'
  ctx.fillText(e.text, e.x, e.y)
  ctx.restore()
})

const withPlugin = await renderCard({
  width: 400, height: 200,
  background: { type: 'color', value: '#1e1e2e' },
  elements: [
    {
      type: 'watermark' as 'text',  // cast to satisfy CardElement union
      x: 20, y: 20,
      // @ts-ignore – custom element, plugin handles it
      text: '© NoteCard',
      font: '28px sans-serif',
      color: 'rgba(255,255,255,0.4)',
      spans: [],
      width: 360,
      lineHeight: 40,
    } as never,
  ],
})
writeFileSync('out-plugin.png', withPlugin)

console.log('✓ out-basic.png')
console.log('✓ out-quote.png')
console.log('✓ out-manual.png (group, blendMode, radial-gradient, inline spans, rotate, shadow)')
console.log('✓ out-plugin.png (custom renderer plugin)')
