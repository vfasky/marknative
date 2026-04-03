<script setup lang="ts">
import { ref } from 'vue'
import { withBase } from 'vitepress'

type GalleryItem = {
  label: string
  description: string
  markdown: string
  images: string[]
}

const activeTab = ref<'syntax' | 'features'>('syntax')

const syntaxItems: GalleryItem[] = [
  {
    label: 'Headings',
    description: 'All six heading levels — H1 through H6.',
    markdown: `# Heading 1\n## Heading 2\n### Heading 3\n#### Heading 4\n##### Heading 5\n###### Heading 6`,
    images: ['/examples/syntax/headings.png'],
  },
  {
    label: 'Inline Styles',
    description: 'Bold, italic, strikethrough, inline code and links.',
    markdown: `**Bold** *Italic* ***Bold+Italic*** ~~Strike~~ \`code\` [link](https://example.com)`,
    images: ['/examples/syntax/inline.png'],
  },
  {
    label: 'Unordered List',
    description: 'Bullet lists with unlimited nesting depth.',
    markdown: `- Item\n- Item with **bold**\n  - Nested item\n    - Doubly nested\n  - Back to level 2\n- Final item`,
    images: ['/examples/syntax/unordered-list.png'],
  },
  {
    label: 'Ordered List',
    description: 'Numbered lists with nested sub-steps.',
    markdown: `1. Step one\n2. Step two\n   1. Sub-step\n   2. Sub-step\n3. Step three`,
    images: ['/examples/syntax/ordered-list.png'],
  },
  {
    label: 'Task List',
    description: 'GFM task lists with checked and unchecked items.',
    markdown: `- [x] Done\n- [x] Also done\n- [ ] Not yet\n- [ ] Pending`,
    images: ['/examples/syntax/task-list.png'],
  },
  {
    label: 'Blockquote',
    description: 'Single-level and nested blockquotes with inline styles.',
    markdown: `> Simple quote\n\n> **Bold** inside a quote.\n> With *italic* too.\n\n> Outer\n>\n> > Inner nested quote`,
    images: ['/examples/syntax/blockquote.png'],
  },
  {
    label: 'Code Block',
    description: 'Fenced code blocks with language tags.',
    markdown: `\`\`\`typescript\nconst pages = await renderMarkdown(md)\n\`\`\`\n\n\`\`\`bash\nbun add marknative\n\`\`\``,
    images: ['/examples/syntax/code.png'],
  },
  {
    label: 'Table',
    description: 'GFM tables with left, center and right alignment.',
    markdown: `| Name | Type | Default |\n| :--- | :---: | ---: |\n| format | string | 'png' |\n| singlePage | boolean | false |`,
    images: ['/examples/syntax/table.png'],
  },
  {
    label: 'Image',
    description: 'Block-level images fetched from HTTP URLs.',
    markdown: `![Landscape](https://picsum.photos/id/10/560/240 "A scenic landscape")`,
    images: ['/examples/syntax/image.png'],
  },
  {
    label: 'Thematic Break',
    description: 'Horizontal rules using ---, *** or ___.',
    markdown: `Above\n\n---\n\nMiddle\n\n***\n\nBelow`,
    images: ['/examples/syntax/thematic-break.png'],
  },
]

const featureItems: GalleryItem[] = [
  {
    label: 'Paginated Rendering',
    description: 'Long documents are automatically split into multiple fixed-height pages. Each page is a separate PNG image.',
    markdown: `const pages = await renderMarkdown(longDoc)\n// pages.length > 1`,
    images: ['/examples/features/paginated-p1.png', '/examples/features/paginated-p2.png'],
  },
  {
    label: 'Single-Page Mode',
    description: 'Render the entire document into one image whose height adapts to the content. Capped at 16 384 px.',
    markdown: `const [page] = await renderMarkdown(doc, {\n  singlePage: true,\n})`,
    images: ['/examples/features/single-page.png'],
  },
  {
    label: 'Custom Page Width',
    description: 'Override the default 794 px page width. The layout engine recalculates all block widths and line breaks.',
    markdown: `import { createSkiaCanvasPainter } from 'marknative/paint'\n\nconst theme = { ...defaultTheme, page: { ...defaultTheme.page, width: 480 } }\nconst pages = await renderMarkdown(doc, {\n  painter: createSkiaCanvasPainter(theme),\n})`,
    images: ['/examples/features/custom-width.png'],
  },
  {
    label: 'Custom Page Height',
    description: 'Change the page height to fit more content per page — useful for tall card or poster formats.',
    markdown: `const theme = {\n  ...defaultTheme,\n  page: { ...defaultTheme.page, width: 600, height: 1200 },\n}\nconst pages = await renderMarkdown(doc, {\n  painter: createSkiaCanvasPainter(theme),\n})`,
    images: ['/examples/features/custom-height.png'],
  },
]

const activeItem = ref<GalleryItem>(syntaxItems[0]!)

function selectTab(tab: 'syntax' | 'features') {
  activeTab.value = tab
  activeItem.value = tab === 'syntax' ? syntaxItems[0]! : featureItems[0]!
}
</script>

<template>
  <div class="gallery">
    <!-- Tab bar -->
    <div class="tab-bar">
      <button
        :class="['tab-btn', { active: activeTab === 'syntax' }]"
        @click="selectTab('syntax')"
      >
        Markdown Syntax
      </button>
      <button
        :class="['tab-btn', { active: activeTab === 'features' }]"
        @click="selectTab('features')"
      >
        Features
      </button>
    </div>

    <div class="gallery-body">
      <!-- Sidebar -->
      <ul class="sidebar">
        <li
          v-for="item in activeTab === 'syntax' ? syntaxItems : featureItems"
          :key="item.label"
          :class="['sidebar-item', { active: activeItem.label === item.label }]"
          @click="activeItem = item"
        >
          {{ item.label }}
        </li>
      </ul>

      <!-- Detail panel -->
      <div class="detail">
        <p class="detail-desc">{{ activeItem.description }}</p>

        <div class="code-block">
          <pre><code>{{ activeItem.markdown }}</code></pre>
        </div>

        <div class="renders">
          <img
            v-for="(src, i) in activeItem.images"
            :key="i"
            :src="withBase(src)"
            :alt="`${activeItem.label} rendered output${activeItem.images.length > 1 ? ` — page ${i + 1}` : ''}`"
            class="render-img"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.gallery {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
  margin: 24px 0;
}

.tab-bar {
  display: flex;
  border-bottom: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}

.tab-btn {
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--vp-c-text-2);
  transition: color 0.2s, border-color 0.2s;
}

.tab-btn.active {
  color: var(--vp-c-brand-1);
  border-bottom-color: var(--vp-c-brand-1);
}

.gallery-body {
  display: flex;
  min-height: 400px;
}

.sidebar {
  list-style: none;
  margin: 0;
  padding: 8px 0;
  width: 160px;
  flex-shrink: 0;
  border-right: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}

.sidebar-item {
  padding: 7px 16px;
  font-size: 13px;
  cursor: pointer;
  color: var(--vp-c-text-2);
  border-left: 2px solid transparent;
  transition: color 0.15s, background 0.15s;
}

.sidebar-item:hover {
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg-mute);
}

.sidebar-item.active {
  color: var(--vp-c-brand-1);
  border-left-color: var(--vp-c-brand-1);
  background: var(--vp-c-bg-mute);
  font-weight: 500;
}

.detail {
  flex: 1;
  padding: 20px 24px;
  overflow-x: auto;
}

.detail-desc {
  margin: 0 0 12px;
  font-size: 14px;
  color: var(--vp-c-text-2);
}

.code-block {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  padding: 12px 16px;
  margin-bottom: 20px;
}

.code-block pre {
  margin: 0;
  font-size: 12.5px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

.renders {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.render-img {
  max-width: 100%;
  max-height: 480px;
  width: auto;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  object-fit: contain;
}
</style>
