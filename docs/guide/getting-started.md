# Getting Started

## Overview

`marknative` takes Markdown text and renders it into paginated PNG or SVG images — without a browser, Chromium, or DOM.

The rendering pipeline:

```
Markdown source
  → parse (CommonMark + GFM)
  → typed document model
  → block & inline layout engine
  → pagination
  → native 2D canvas painting
  → PNG / SVG
```

## Installation

::: code-group

```bash [npm]
npm install marknative
```

```bash [bun]
bun add marknative
```

```bash [pnpm]
pnpm add marknative
```

:::

> **Native dependency**: marknative uses [`skia-canvas`](https://github.com/samizdatco/skia-canvas) as its paint backend. Prebuilt native binaries are bundled for macOS, Linux, and Windows — no additional setup is needed.

## Basic Usage

```ts
import { renderMarkdown } from 'marknative'
import { writeFileSync } from 'node:fs'

const markdown = `
# Hello, marknative

A native Markdown rendering engine that produces **paginated PNG pages**
without a browser.

- CommonMark + GFM support
- Deterministic layout and pagination
- PNG and SVG output
`

const pages = await renderMarkdown(markdown)

console.log(`Rendered ${pages.length} page(s)`)

for (const [i, page] of pages.entries()) {
  writeFileSync(`page-${i + 1}.png`, page.data)
}
```

Each element of `pages` is a [`RenderPage`](/api/reference#renderpage) object with a `format` field and a `data` field.

## SVG Output

Pass `format: 'svg'` to get SVG strings instead of PNG buffers:

```ts
const pages = await renderMarkdown(markdown, { format: 'svg' })

for (const [i, page] of pages.entries()) {
  writeFileSync(`page-${i + 1}.svg`, page.data)
}
```

## Single-Image Output

Use `singlePage: true` to render the entire document into one image instead of paginating:

```ts
const [page] = await renderMarkdown(markdown, { singlePage: true })
writeFileSync('output.png', page.data)
```

See [Single-Page Mode](/guide/single-page) for details.

## Requirements

- Node.js ≥ 18 (or Bun)
- Prebuilt `skia-canvas` binary for your platform (bundled automatically)
