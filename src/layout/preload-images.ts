/**
 * Preloads an image for use in CanvasRenderer.
 * Returns the @napi-rs/canvas Image object, or a base64 data URL for SVG/HTML.
 */
export async function preloadImageForCanvas(src: string): Promise<unknown> {
  const { Image } = await import('@napi-rs/canvas')
  const img = new Image()

  if (src.startsWith('http://') || src.startsWith('https://')) {
    const resp = await fetch(src)
    const buf = Buffer.from(await resp.arrayBuffer())
    img.src = buf
  } else {
    img.src = await Bun.file(src).arrayBuffer().then(b => Buffer.from(b))
  }

  return img
}

export async function preloadImageForSvg(src: string): Promise<string> {
  if (src.startsWith('data:')) return src

  if (src.startsWith('http://') || src.startsWith('https://')) {
    const resp = await fetch(src)
    const buf = Buffer.from(await resp.arrayBuffer())
    const mime = resp.headers.get('content-type') ?? 'image/png'
    return `data:${mime};base64,${buf.toString('base64')}`
  }

  const buf = Buffer.from(await Bun.file(src).arrayBuffer())
  const ext = src.split('.').pop()?.toLowerCase() ?? 'png'
  const mime = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : `image/${ext}`
  return `data:${mime};base64,${buf.toString('base64')}`
}
