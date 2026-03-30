import { layoutWithLines, prepareWithSegments } from '@chenglou/pretext'
import type { ContentBlock, DesignTokens, Template } from '../types'

const BUFFER = 0.85

function measureText(
  text: string,
  font: string,
  lineHeight: number,
  maxWidth: number,
): number {
  if (!text.trim()) return 0

  try {
    const prepared = prepareWithSegments(text, font)
    return layoutWithLines(prepared, maxWidth, lineHeight).height
  } catch {
    const avgCharWidth = Math.max(parseInt(font, 10) || 28, 1)
    const charsPerLine = Math.max(Math.floor(maxWidth / avgCharWidth), 1)
    const lines = Math.ceil(text.length / charsPerLine)
    return lines * lineHeight
  }
}

function estimateBlockHeight(
  block: ContentBlock,
  availableWidth: number,
  tokens: DesignTokens,
): number {
  switch (block.type) {
    case 'heroTitle': {
      const titleHeight = measureText(
        block.title,
        tokens.typography.h1.font,
        tokens.typography.h1.lineHeight,
        availableWidth,
      )
      const subtitleHeight = block.subtitle
        ? measureText(
            block.subtitle,
            tokens.typography.h2.font,
            tokens.typography.h2.lineHeight,
            availableWidth,
          )
        : 0
      return titleHeight + subtitleHeight + tokens.spacing.sm
    }
    case 'heading': {
      const style = block.level === 1 ? tokens.typography.h1 : tokens.typography.h2
      return (
        measureText(block.text, style.font, style.lineHeight, availableWidth) +
        tokens.spacing.xs
      )
    }
    case 'paragraph': {
      const text = block.spans.map(span => span.text).join('')
      return (
        measureText(
          text,
          tokens.typography.body.font,
          tokens.typography.body.lineHeight,
          availableWidth,
        ) + tokens.spacing.xs
      )
    }
    case 'bulletList':
    case 'orderedList':
    case 'steps':
      return block.items.length * (tokens.typography.body.lineHeight + tokens.spacing.xs)
    case 'quoteCard':
      return (
        measureText(
          block.text,
          tokens.typography.body.font,
          tokens.typography.body.lineHeight,
          availableWidth,
        ) + tokens.spacing.md * 2
      )
    case 'metric':
      return (
        tokens.typography.h1.lineHeight +
        tokens.typography.caption.lineHeight +
        tokens.spacing.sm
      )
    case 'tags':
      return tokens.typography.caption.lineHeight + tokens.spacing.sm
    case 'image':
      return availableWidth * (9 / 16)
    case 'codeBlock': {
      const lines = block.code.split('\n').length
      return lines * tokens.typography.code.lineHeight + tokens.spacing.md
    }
    case 'divider':
      return tokens.spacing.md
    default:
      return tokens.typography.body.lineHeight
  }
}

export function paginateContent(
  blocks: ContentBlock[],
  contentTemplate: Template,
): ContentBlock[][] {
  if (blocks.length === 0) return [[]]

  const { width, height } = contentTemplate.contentArea
  const threshold = height * BUFFER
  const { tokens } = contentTemplate

  const pages: ContentBlock[][] = []
  let current: ContentBlock[] = []
  let currentHeight = 0

  for (const block of blocks) {
    const blockHeight = estimateBlockHeight(block, width, tokens)

    if (current.length > 0 && currentHeight + blockHeight > threshold) {
      pages.push(current)
      current = [block]
      currentHeight = blockHeight
      continue
    }

    current.push(block)
    currentHeight += blockHeight
  }

  if (current.length > 0 || pages.length === 0) {
    pages.push(current)
  }

  return pages
}
