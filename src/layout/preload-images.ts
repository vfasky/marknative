function decodeDataUrl(src: string): Buffer {
  const match = src.match(/^data:([^;,]+)?(?:;charset=[^;,]+)?(;base64)?,(.*)$/s)
  if (!match) {
    throw new Error(`Invalid data URL: ${src.slice(0, 32)}...`)
  }

  const [, , isBase64, data] = match
  if (data == null) {
    throw new Error(`Invalid data URL: ${src.slice(0, 32)}...`)
  }

  return isBase64 ? Buffer.from(data, 'base64') : Buffer.from(decodeURIComponent(data))
}

async function fetchImageBuffer(src: string): Promise<Buffer> {
  const resp = await fetch(src)
  if (!resp.ok) {
    throw new Error(`Failed to fetch image: ${src} (${resp.status} ${resp.statusText})`)
  }

  return Buffer.from(await resp.arrayBuffer())
}

/**
 * Preloads an image for use in CanvasRenderer.
 * Returns the @napi-rs/canvas Image object, or a base64 data URL for SVG/HTML.
 */
export async function preloadImageForCanvas(src: string): Promise<unknown> {
  const { Image } = await import('@napi-rs/canvas')
  const img = new Image()

  if (src.startsWith('data:')) {
    img.src = decodeDataUrl(src)
  } else if (src.startsWith('http://') || src.startsWith('https://')) {
    img.src = await fetchImageBuffer(src)
  } else {
    img.src = await Bun.file(src).arrayBuffer().then(b => Buffer.from(b))
  }

  return img
}

export async function preloadImageForSvg(src: string): Promise<string> {
  if (src.startsWith('data:')) return src

  if (src.startsWith('http://') || src.startsWith('https://')) {
    const resp = await fetch(src)
    if (!resp.ok) {
      throw new Error(`Failed to fetch image: ${src} (${resp.status} ${resp.statusText})`)
    }

    const buf = Buffer.from(await resp.arrayBuffer())
    const mime = resp.headers.get('content-type') ?? 'image/png'
    return `data:${mime};base64,${buf.toString('base64')}`
  }

  const buf = Buffer.from(await Bun.file(src).arrayBuffer())
  const ext = src.split('.').pop()?.toLowerCase() ?? 'png'
  const mime =
    ext === 'svg'
      ? 'image/svg+xml'
      : ext === 'jpg' || ext === 'jpeg'
        ? 'image/jpeg'
        : `image/${ext}`
  return `data:${mime};base64,${buf.toString('base64')}`
}
