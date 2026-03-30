import { test, expect, describe } from 'bun:test'
import { paginateContent } from '../../src/template/paginator'
import type { ContentBlock } from '../../src/types'
import { articleTemplate } from '../../src/templates/content/article'

const makeBlocks = (n: number): ContentBlock[] =>
  Array.from({ length: n }, (_, i) => ({
    type: 'paragraph' as const,
    spans: [{ text: `段落 ${i + 1}：这是一段足够长的文字，用于测试分页是否正确触发。每行文字都会占用一定高度。` }],
  }))

describe('paginateContent', () => {
  test('small content → single page', () => {
    const pages = paginateContent(makeBlocks(2), articleTemplate)
    expect(pages).toHaveLength(1)
  })

  test('large content → multiple pages', () => {
    const pages = paginateContent(makeBlocks(30), articleTemplate)
    expect(pages.length).toBeGreaterThan(1)
  })

  test('all blocks are preserved across pages', () => {
    const blocks = makeBlocks(20)
    const pages = paginateContent(blocks, articleTemplate)
    const allBlocks = pages.flat()
    expect(allBlocks).toHaveLength(blocks.length)
  })

  test('empty input → one empty page', () => {
    const pages = paginateContent([], articleTemplate)
    expect(pages).toHaveLength(1)
    expect(pages[0]).toEqual([])
  })
})
