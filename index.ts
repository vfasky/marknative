export { renderCard } from './src/renderer.js'
export { registerFont } from './src/setup.js'
export { registerRenderer, type PluginRenderer } from './src/plugins.js'

export * as templates from './src/templates/index.js'

export type {
  CardSchema,
  CardElement,
  TextElement,
  ImageElement,
  RectElement,
  GroupElement,
  TextSpan,
  Paint,
  Background,
  Shadow,
  Transform,
  ClipConfig,
  BlendMode,
  ImageFilter,
  GradientStop,
  ExportOptions,
} from './src/types.js'
