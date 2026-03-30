import { test, expect, describe, beforeAll } from 'bun:test'
import { computeLayoutBoxes, initLayoutEngine } from '../../src/layout/engine'
import type { LayoutSpec, LayoutBox } from '../../src/types'

beforeAll(async () => {
  await initLayoutEngine()
})

describe('computeLayoutBoxes', () => {
  test('rect node gets correct absolute position', async () => {
    const spec: LayoutSpec = {
      type: 'container',
      direction: 'column',
      width: 400,
      height: 600,
      children: [
        { type: 'rect', width: 400, height: 100, fill: { type: 'color', value: '#ff0000' } },
      ],
    }
    const boxes = await computeLayoutBoxes(spec, { width: 400, height: 600 })
    const rectBox = boxes.find(b => b.kind === 'rect' && b.fill?.type === 'color')
    expect(rectBox).toBeDefined()
    expect(rectBox!.width).toBe(400)
    expect(rectBox!.height).toBe(100)
    expect(rectBox!.x).toBe(0)
    expect(rectBox!.y).toBe(0)
  })

  test('two rects in column are stacked vertically', async () => {
    const spec: LayoutSpec = {
      type: 'container',
      direction: 'column',
      width: 400,
      height: 600,
      children: [
        { type: 'rect', width: 400, height: 100, fill: { type: 'color', value: '#ff0000' } },
        { type: 'rect', width: 400, height: 200, fill: { type: 'color', value: '#00ff00' } },
      ],
    }
    const boxes = await computeLayoutBoxes(spec, { width: 400, height: 600 })
    const rects = boxes.filter(b => b.kind === 'rect')
    expect(rects).toHaveLength(2)
    expect(rects[0]!.y).toBe(0)
    expect(rects[1]!.y).toBe(100)
  })

  test('text node produces LayoutBox with lines', async () => {
    const spec: LayoutSpec = {
      type: 'container',
      direction: 'column',
      width: 500,
      height: 800,
      children: [
        {
          type: 'text',
          spans: [{ text: 'Hello world' }],
          font: 'bold 40px sans-serif',
          lineHeight: 56,
          color: '#000000',
        },
      ],
    }
    const boxes = await computeLayoutBoxes(spec, { width: 500, height: 800 })
    const textBox = boxes.find(b => b.kind === 'text')
    expect(textBox).toBeDefined()
    expect(textBox!.lines).toBeDefined()
    expect(textBox!.lines!.length).toBeGreaterThan(0)
  })

  test('padding on container offsets children', async () => {
    const spec: LayoutSpec = {
      type: 'container',
      direction: 'column',
      width: 400,
      height: 600,
      padding: 40,
      children: [
        { type: 'rect', width: 'fill', height: 100, fill: { type: 'color', value: '#red' } },
      ],
    }
    const boxes = await computeLayoutBoxes(spec, { width: 400, height: 600 })
    const rectBox = boxes.find(b => b.kind === 'rect')
    expect(rectBox).toBeDefined()
    expect(rectBox!.x).toBe(40)
    expect(rectBox!.y).toBe(40)
    expect(rectBox!.width).toBe(320)
  })
})
