import { marked } from 'marked'
import type { ContentBlock, Span } from '../types'

type InlineToken = {
  type: string
  text?: string
  href?: string
  tokens?: InlineToken[]
}

type BlockToken = {
  type: string
  text?: string
  depth?: number
  lang?: string
  ordered?: boolean
  items?: Array<{ text?: string }>
  tokens?: InlineToken[]
}

function pushText(spanList: Span[], text?: string, style?: Omit<Span, 'text'>) {
  if (!text) return
  spanList.push({ text, ...style })
}

function inlineTokensToSpans(tokens: InlineToken[] | undefined): Span[] {
  if (!tokens || tokens.length === 0) return []

  const spans: Span[] = []

  for (const token of tokens) {
    switch (token.type) {
      case 'text':
        pushText(spans, token.text)
        break
      case 'strong':
        for (const inner of inlineTokensToSpans(token.tokens)) {
          spans.push({ ...inner, bold: true })
        }
        break
      case 'em':
        for (const inner of inlineTokensToSpans(token.tokens)) {
          spans.push({ ...inner, italic: true })
        }
        break
      case 'codespan':
        pushText(spans, token.text, { code: true })
        break
      case 'image':
        pushText(spans, token.text)
        break
      default:
        if (token.tokens) {
          spans.push(...inlineTokensToSpans(token.tokens))
        } else {
          pushText(spans, token.text)
        }
    }
  }

  return spans.filter(span => span.text.length > 0)
}

function extractListItemText(item: { text?: string; tokens?: InlineToken[] }) {
  const spans = inlineTokensToSpans(item.tokens)
  if (spans.length > 0) {
    return spans.map(span => span.text).join('').trim()
  }
  return (item.text ?? '').trim()
}

export function parseMarkdown(markdown: string): ContentBlock[] {
  const tokens = marked.lexer(markdown) as BlockToken[]
  const blocks: ContentBlock[] = []

  for (const token of tokens) {
    switch (token.type) {
      case 'space':
        break
      case 'heading': {
        const text = (token.text ?? '').trim()
        if (token.depth === 1) {
          blocks.push({ type: 'heroTitle', title: text })
        } else {
          blocks.push({
            type: 'heading',
            level: Math.min(Math.max(token.depth ?? 2, 2), 3) as 2 | 3,
            text,
          })
        }
        break
      }
      case 'paragraph': {
        if (token.tokens?.length === 1 && token.tokens[0].type === 'image') {
          const image = token.tokens[0]
          blocks.push({
            type: 'image',
            src: image.href ?? '',
            alt: image.text || undefined,
          })
          break
        }

        const spans = inlineTokensToSpans(token.tokens)
        const fallbackText = (token.text ?? '').trim()
        blocks.push({
          type: 'paragraph',
          spans: spans.length > 0 ? spans : [{ text: fallbackText }],
        })
        break
      }
      case 'list': {
        const items = (token.items ?? []).map(item => extractListItemText(item)).filter(Boolean)
        blocks.push(
          token.ordered
            ? { type: 'orderedList', items }
            : { type: 'bulletList', items },
        )
        break
      }
      case 'blockquote': {
        blocks.push({ type: 'quoteCard', text: (token.text ?? '').trim() })
        break
      }
      case 'code': {
        blocks.push({
          type: 'codeBlock',
          code: token.text ?? '',
          language: token.lang || undefined,
        })
        break
      }
      case 'hr':
        blocks.push({ type: 'divider' })
        break
      default:
        break
    }
  }

  return blocks
}
