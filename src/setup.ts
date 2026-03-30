import { GlobalFonts } from '@napi-rs/canvas'

export function registerFont(path: string, family: string): void {
  GlobalFonts.registerFromPath(path, family)
}
