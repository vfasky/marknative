# API Reference

## `renderMarkdown`

```ts
function renderMarkdown(
  markdown: string,
  options?: RenderMarkdownOptions
): Promise<RenderPage[]>
```

Parses `markdown` and renders it into one or more pages.

### Parameters

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `markdown` | `string` | The Markdown source text to render |
| `options` | `RenderMarkdownOptions` | Optional render configuration |

### Returns

`Promise<RenderPage[]>` — an array of rendered pages, one entry per page.

### Example

```ts
import { renderMarkdown } from 'marknative'

const pages = await renderMarkdown('# Hello\n\nWorld.')

for (const page of pages) {
  if (page.format === 'png') {
    // page.data is a Buffer
  }
}
```

**Rendered output:**

![API overview rendered output](/examples/api-overview.png)

---

## `RenderMarkdownOptions`

```ts
type RenderMarkdownOptions = {
  format?: 'png' | 'svg'
  singlePage?: boolean
  painter?: Painter
}
```

### Properties

#### `format`

**Type:** `'png' | 'svg'`  
**Default:** `'png'`

Output format for each rendered page.

- `'png'` — raster PNG image; `page.data` is a `Buffer`
- `'svg'` — vector SVG; `page.data` is a `string`

#### `singlePage`

**Type:** `boolean`  
**Default:** `false`

When `true`, renders all content into a single image instead of paginating across multiple fixed-height pages. The image height adapts to the content and is capped at [`MAX_SINGLE_PAGE_HEIGHT`](#max_single_page_height).

#### `painter`

**Type:** `Painter`  
**Default:** internal skia-canvas painter

Advanced: supply a custom paint backend. Intended for library integrators and testing.

---

## `RenderPage`

```ts
type RenderPage =
  | { format: 'png'; data: Buffer; page: PaintPage }
  | { format: 'svg'; data: string; page: PaintPage }
```

A discriminated union based on `format`.

### Properties

| Property | Type | Description |
| :--- | :--- | :--- |
| `format` | `'png' \| 'svg'` | The output format of this page |
| `data` | `Buffer \| string` | The rendered image data |
| `page` | `PaintPage` | Internal paint-layer page descriptor |

### Example

```ts
const pages = await renderMarkdown(markdown, { format: 'png' })

for (const [i, page] of pages.entries()) {
  if (page.format === 'png') {
    writeFileSync(`page-${i + 1}.png`, page.data)
  }
}
```

---

## `MAX_SINGLE_PAGE_HEIGHT`

```ts
const MAX_SINGLE_PAGE_HEIGHT: number // 16384
```

The maximum height (in CSS pixels) of a single-page render. Content beyond this height is clipped. Exported for consumers that need to check or display the limit.

```ts
import { MAX_SINGLE_PAGE_HEIGHT } from 'marknative'

console.log(MAX_SINGLE_PAGE_HEIGHT) // 16384
```

---

## `parseMarkdown`

```ts
function parseMarkdown(markdown: string): MarkdownDocument
```

Low-level: parse Markdown source text into the internal `MarkdownDocument` AST. Useful for inspection or custom processing pipelines.

---

## `defaultTheme`

```ts
const defaultTheme: Theme
```

The default theme object used for layout and painting. Exported for inspection. Theme customization is not yet a public API.
