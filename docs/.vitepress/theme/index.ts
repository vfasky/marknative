import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import RenderGallery from '../components/RenderGallery.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('RenderGallery', RenderGallery)
  },
} satisfies Theme
