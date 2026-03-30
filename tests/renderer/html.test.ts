import { describe, expect, test } from 'bun:test'
import { renderPageHtml } from '../../src/renderer/html'
import type { LayoutBox } from '../../src/types'

describe('renderPageHtml', () => {
  test('outputs div with correct dimensions', async () => {
    const result = await renderPageHtml([], { width: 400, height: 600 })

    expect(result.format).toBe('html')
    expect(result.data).toContain('width:400px')
    expect(result.data).toContain('height:600px')
  })

  test('rect box -> div with background-color', async () => {
    const boxes: LayoutBox[] = [
      {
        id: '1',
        kind: 'rect',
        x: 10,
        y: 20,
        width: 100,
        height: 50,
        fill: { type: 'color', value: '#ff0000' },
      },
    ]

    const result = await renderPageHtml(boxes, { width: 400, height: 600 })

    expect(result.data).toContain('background-color:#ff0000')
    expect(result.data).toContain('left:10px')
    expect(result.data).toContain('top:20px')
  })

  test('text box -> div with span elements', async () => {
    const boxes: LayoutBox[] = [
      {
        id: '2',
        kind: 'text',
        x: 0,
        y: 0,
        width: 300,
        height: 60,
        lines: [
          {
            y: 0,
            height: 56,
            spans: [{ text: 'Hello', font: 'bold 40px sans-serif', color: '#000', x: 0 }],
          },
        ],
      },
    ]

    const result = await renderPageHtml(boxes, { width: 400, height: 600 })

    expect(result.data).toContain('Hello')
    expect(result.data).toContain('<span')
  })
})
