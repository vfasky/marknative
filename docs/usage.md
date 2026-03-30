# 详细使用文档

## 目录

- [开箱即用](#开箱即用)
- [模板定制](#模板定制)
- [精确控制](#精确控制)
- [完整 Schema](#完整-schema)
- [背景完全指南](#背景完全指南)
- [文字渲染](#文字渲染)
- [图片处理](#图片处理)
- [编组与相对坐标](#编组与相对坐标)
- [变换与效果](#变换与效果)
- [导出选项](#导出选项)
- [字体配置](#字体配置)
- [插件系统](#插件系统)

---

## 开箱即用

直接使用内置模板，最少代码：

```ts
import { renderCard, registerFont, templates } from 'notecard'
import { writeFileSync } from 'node:fs'

registerFont('/System/Library/Fonts/Hiragino Sans GB.ttc', 'Hiragino Sans GB')

const card = await renderCard(
  templates.basicCard({
    title: '今日份灵感',
    body: '每一个清晨都是一次新的开始，带着昨天的经验，迎接今天的挑战。',
    tags: ['每日灵感', '正能量', '生活态度'],
    fontFamily: 'Hiragino Sans GB',
  }),
)

writeFileSync('out.png', card)
```

每个模板都有必需参数和可选参数。可选参数不传则使用默认值。

---

## 模板定制

### 基础定制：覆盖参数

所有模板都暴露 `options` 对象，可覆盖任意字段：

```ts
// 换颜色
templates.basicCard({
  title: '...',
  body: '...',
  tags: ['...'],
  fontFamily: 'Hiragino Sans GB',
  accentColor: '#0ea5e9',     // 覆盖强调色
  background: {               // 覆盖背景
    type: 'color',
    value: '#f0f9ff',
  },
})

// 换尺寸
templates.basicCard({
  title: '...',
  body: '...',
  tags: ['...'],
  fontFamily: 'Hiragino Sans GB',
  size: { width: 720, height: 960 },  // 小一号
})
```

### gradientTextCard 渐变预设

```ts
templates.gradientTextCard({
  mainText: '好事\n即将\n发生',
  subText: '相信自己',
  caption: '每日鼓励',
  bgGradient: 'sunset',   // 'sakura'|'sunset'|'ocean'|'mint'|'rose'
                            // 'lemon'|'matcha'|'sky'|'coral'|'peach'
  fontFamily: 'Hiragino Sans GB',
})
```

### stepCard 自定义步骤

```ts
templates.stepCard({
  title: '三步学会早起',
  subtitle: '21天习惯养成',
  steps: [
    { title: '设定固定闹钟', desc: '每天同一时间响' },
    { title: '闹钟响后立刻起床', desc: '不要躺回笼觉' },
    { title: '喝一杯温水', desc: '激活身体' },
  ],
  fontFamily: 'Hiragino Sans GB',
  accentColor: '#0ea5e9',  // 天蓝主题
})
```

### diaryCard 内容控制

```ts
templates.diaryCard({
  date: '2024.03.30',
  weekday: '周六',
  weather: '晴天',
  mood: '开心',
  content: '今天完成了年度计划，效率很高。',
  tags: ['自我提升', '今日成就'],
  dayCount: 30,
  totalDays: 100,
  fontFamily: 'Hiragino Sans GB',
})
```

---

## 精确控制

### 精确控制文字位置

文字元素的 `x` `y` `width` `lineHeight` 决定文字的精确布局：

```ts
{
  type: 'text',
  x: 60,           // 文字区域左边界（相对于父容器）
  y: 200,          // 文字区域上边界
  width: 960,      // 文字区域宽度（pretext 据此计算换行）
  lineHeight: 56,  // 行高（两行文字之间的距离）
  align: 'center', // 'left' | 'center' | 'right'
  maxLines: 3,     // 最多显示行数，超出截断
  spans: [
    {
      content: '第一段文字',
      font: 'bold 40px Hiragino Sans GB',
      fill: { type: 'color', value: '#1a1a2e' },
    },
    {
      content: '第二段文字，独立段落',
      font: '32px Hiragino Sans GB',
      fill: { type: 'color', value: '#6b7280' },
    },
  ],
}
```

### 精确控制元素堆叠

每个元素按 `elements` 数组顺序叠放（后面的在上层）：

```ts
elements: [
  { type: 'rect', x: 0, y: 0, width: 1080, height: 300, fill: {...} },  // 最底层背景
  { type: 'rect', x: 40, y: 40, ... },                                      // 白卡
  { type: 'text', x: 80, y: 80, ... },                                       // 标题
  { type: 'text', x: 80, y: 160, ... },                                      // 正文
],
```

### 精确控制尺寸（响应式）

模板的 `size` 参数让卡片适配不同用途：

```ts
// 分享图（1:1）
size: { width: 1080, height: 1080 }

// 故事图（9:16）
size: { width: 1080, height: 1920 }

// 封面图（16:9）
size: { width: 1920, height: 1080 }
```

---

## 完整 Schema

不通过模板，直接构建完整的 `CardSchema`：

```ts
const schema = {
  width: 1080,
  height: 1440,

  // 背景
  background: {
    type: 'radial-gradient',
    cx: 0.5, cy: 0.3, r: 1.1,   // 圆心和半径（归一化 0–1）
    stops: [
      { offset: 0,   color: '#ff9a9e' },
      { offset: 0.5, color: '#fad0c4' },
      { offset: 1,   color: '#a18cd1' },
    ],
  },

  elements: [
    // 矩形白卡
    {
      type: 'rect',
      x: 60, y: 60,
      width: 960, height: 1320,
      borderRadius: 40,
      fill: { type: 'color', value: 'rgba(255,255,255,0.25)' },
      blendMode: 'screen',   // 混合模式实现毛玻璃效果
    },

    // 编组（badge + 标题作为一个整体）
    {
      type: 'group',
      x: 100, y: 160,
      width: 880, height: 100,
      children: [
        { type: 'rect', x: 0, y: 0, width: 120, height: 40, borderRadius: 20, fill: {...} },
        { type: 'text', x: 0, y: 8, width: 120, lineHeight: 40, align: 'center', spans: [...] },
        { type: 'text', x: 0, y: 60, width: 880, lineHeight: 78, spans: [...] },
      ],
    },

    // 多 span 混排文字
    {
      type: 'text',
      x: 100, y: 440,
      width: 880,
      lineHeight: 56,
      display: 'inline',   // 多个 span 混合排版到同一行
      spans: [
        { content: '重要提示：', font: 'bold 38px Hiragino Sans GB', fill: { type: 'color', value: '#dc2626' } },
        { content: '每天坚持做一件让自己进步的事...', font: '36px Hiragino Sans GB', fill: { type: 'color', value: '#374151' } },
      ],
    },

    // 带旋转的装饰矩形
    {
      type: 'rect',
      x: 820, y: 1100,
      width: 120, height: 120,
      borderRadius: 20,
      fill: { type: 'linear-gradient', angle: 45, stops: [...] },
      opacity: 0.6,
      transform: { rotate: 25, anchor: [0.5, 0.5] },  // 绕中心旋转 25°
    },

    // 带阴影的文字
    {
      type: 'text',
      x: 100, y: 1260,
      width: 880,
      lineHeight: 48,
      spans: [{ content: '#每日灵感  #正能量', font: '30px Hiragino Sans GB', fill: {...} }],
      shadow: { dx: 1, dy: 1, blur: 4, color: 'rgba(255,255,255,0.8)' },
    },
  ],
}
```

---

## 背景完全指南

### 纯色

```ts
background: { type: 'color', value: '#f0f9ff' }
```

### 线性渐变

```ts
background: {
  type: 'linear-gradient',
  angle: 135,    // 渐变方向（度数，0=从左到右，90=从下到上）
  stops: [
    { offset: 0,   color: '#4facfe' },
    { offset: 0.5, color: '#00f2fe' },
    { offset: 1,   color: '#8ec5fc' },
  ],
}
```

### 径向渐变

```ts
background: {
  type: 'radial-gradient',
  cx: 0.5, cy: 0.3,   // 圆心（归一化 0–1）
  r: 1.0,              // 半径（归一化）
  stops: [
    { offset: 0, color: '#ff9a9e' },
    { offset: 1, color: '#a18cd1' },
  ],
}
```

### 图片背景

```ts
background: {
  type: 'image',
  src: 'https://example.com/bg.jpg',
  fit: 'cover',   // 'cover'=填满裁剪 | 'contain'=完整容纳 | 'fill'=拉伸
}
```

---

## 文字渲染

### 单段落文字

`display: 'block'`（默认）— 每个 span 独立成段：

```ts
{
  type: 'text',
  x: 60, y: 200,
  width: 960,
  lineHeight: 56,
  spans: [
    { content: '第一段，独立的段落', font: 'bold 40px Hiragino Sans GB', fill: {...} },
    { content: '第二段，在第一段下方', font: '36px Hiragino Sans GB', fill: {...} },
  ],
}
```

### 多样式混排（inline）

`display: 'inline'` — 多个 span 混合排版到同一行：

```ts
{
  type: 'text',
  x: 60, y: 200,
  width: 960,
  lineHeight: 56,
  display: 'inline',  // 关键：启用 inline 模式
  spans: [
    { content: '重要：', font: 'bold 36px Hiragino Sans GB', fill: { type: 'color', value: '#dc2626' } },
    { content: '每天坚持五分钟，积累起来会有巨大改变。', font: '36px Hiragino Sans GB', fill: { type: 'color', value: '#374151' } },
  ],
}
```

### 文字描边

```ts
spans: [{
  content: '描边文字',
  font: 'bold 40px Hiragino Sans GB',
  fill: { type: 'color', value: '#ffffff' },
  stroke: {                    // 描边
    paint: { type: 'color', value: '#1a1a2e' },
    width: 3,
  },
}]
```

### 渐变填充文字

```ts
spans: [{
  content: '渐变文字',
  font: 'bold 56px Hiragino Sans GB',
  fill: {
    type: 'linear-gradient',
    angle: 90,
    stops: [
      { offset: 0, color: '#7c3aed' },
      { offset: 1, color: '#db2777' },
    ],
  },
}]
```

### 显式换行

在 `content` 中使用 `\n`（需配合 `white-space: pre-wrap`，已默认启用）：

```ts
{
  type: 'text',
  x: pad, y: startY,
  width: cw,
  lineHeight: 60,
  spans: [
    // 每个 \n 分割的段落在 pretext 中被识别为独立行
    { content: '好事', font: 'bold 72px Hiragino Sans GB', fill: {...} },
    { content: '即将', font: 'bold 72px Hiragino Sans GB', fill: {...} },
    { content: '发生', font: 'bold 72px Hiragino Sans GB', fill: {...} },
  ],
}
```

> **注意**：不要用多个 span 各自写一行文字然后手动计算 y 坐标 — 应该用 `split('\n')` 让 pretext 自动处理换行，模板会自动居中垂直位置。

---

## 图片处理

### 元素图片填充

```ts
{
  type: 'rect',
  x: 0, y: 0,
  width: 1080, height: 400,
  fill: {
    type: 'image',
    src: 'https://example.com/image.jpg',
    repeat: 'no-repeat',  // 'repeat'|'repeat-x'|'repeat-y'|'no-repeat'
  },
}
```

### 图片元素（带圆角）

```ts
{
  type: 'image',
  x: 60, y: 200,
  width: 960, height: 540,
  src: 'https://example.com/photo.jpg',
  borderRadius: 24,
  // 可选：滤镜
  filter: {
    brightness: 1.1,
    contrast: 1.05,
  },
}
```

### 圆形裁剪

```ts
{
  type: 'image',
  x: 400, y: 200,
  width: 280, height: 280,
  src: 'avatar.jpg',
  borderRadius: 140,  // = width/2，呈现正圆
  clip: { type: 'circle', cx: 140, cy: 140, r: 140 },
}
```

---

## 编组与相对坐标

`group` 将多个子元素打包为一个整体，子元素使用**相对于 group 左上角的坐标**：

```ts
{
  type: 'group',
  x: 100, y: 160,   // group 本身的绝对位置
  width: 880,
  height: 200,
  children: [
    // 这些 x/y 都是相对于 group 左上角 (0,0)
    { type: 'rect',   x: 0,   y: 0,   width: 120, height: 40, ... },  // 在 group 内 (100, 160) 实际位置
    { type: 'text',   x: 0,   y: 8,   width: 120, ... },              // 实际位置 (100, 168)
    { type: 'text',   x: 0,   y: 60,  width: 880, ... },             // 实际位置 (100, 220)
  ],
}
```

### 编组 + 裁剪

裁剪只在 group 自身范围内显示子元素：

```ts
{
  type: 'group',
  x: 100, y: 160,
  width: 880, height: 200,
  clip: { type: 'rect' },   // 裁剪掉超出这个区域的内容
  children: [...],
}
```

---

## 变换与效果

### 旋转

```ts
{
  type: 'rect',
  x: 820, y: 1100,
  width: 120, height: 120,
  borderRadius: 20,
  fill: { type: 'color', value: '#f59e0b' },
  transform: {
    rotate: 25,           // 旋转角度（正数=顺时针）
    anchor: [0.5, 0.5],  // 旋转中心（[0,0]=左上角，[0.5,0.5]=中心）
  },
}
```

### 阴影

```ts
{
  type: 'rect',
  x: 60, y: 60,
  width: 960, height: 1320,
  borderRadius: 40,
  fill: { type: 'color', value: '#ffffff' },
  shadow: {
    dx: 0,              // x 偏移
    dy: 12,             // y 偏移
    blur: 48,           // 模糊半径
    color: 'rgba(0,0,0,0.15)',  // 阴影颜色
  },
}
```

### 透明度

```ts
{
  type: 'rect',
  x: 0, y: 0,
  width: 1080, height: 400,
  fill: { type: 'color', value: 'rgba(255,255,255,0.6)' },
  opacity: 0.6,   // 整体透明度（0–1）
}
```

### 混合模式

```ts
{
  type: 'rect',
  x: 60, y: 60,
  width: 960, height: 1320,
  borderRadius: 40,
  fill: { type: 'color', value: 'rgba(255,255,255,0.25)' },
  blendMode: 'screen',  // 'normal'|'multiply'|'screen'|'overlay'|'darken'|'lighten'
}
```

### 裁剪

```ts
// 圆形裁剪
{
  type: 'rect',
  x: 400, y: 200,
  width: 280, height: 280,
  clip: {
    type: 'circle',
    cx: 140, cy: 140, r: 140,
  },
  fill: { type: 'color', value: '#ffffff' },
}

// 矩形裁剪
{
  type: 'rect',
  x: 0, y: 0,
  width: 880, height: 200,
  clip: { type: 'rect' },
  children: [...],
}
```

---

## 导出选项

```ts
// PNG（默认）
const png = await renderCard(schema)

// JPEG（体积更小）
const jpeg = await renderCard(schema, { format: 'jpeg' })

// JPEG + 质量
const jpegQ = await renderCard(schema, { format: 'jpeg', quality: 0.85 })
```

---

## 字体配置

### 必须注册 CJK 字体

服务端无法访问系统字体，必须手动注册：

```ts
import { registerFont } from 'notecard'

// macOS
registerFont('/System/Library/Fonts/STHeiti Light.ttc', 'Heiti SC')
registerFont('/System/Library/Fonts/Hiragino Sans GB.ttc', 'Hiragino Sans GB')

// Windows
registerFont('C:/Windows/Fonts/msyh.ttc', 'Microsoft YaHei')
registerFont('C:/Windows/Fonts/simhei.ttf', 'SimHei')

// Linux
registerFont('/usr/share/fonts/truetype/wqy/wqy-microhei.ttc', 'WenQuanYi Micro Hei')
```

### 注册后使用

```ts
registerFont('/System/Library/Fonts/Hiragino Sans GB.ttc', 'Hiragino Sans GB')

templates.basicCard({
  fontFamily: 'Hiragino Sans GB',  // 与注册时的 family 一致
  ...
})
```

### 字体串

格式：`[bold|italic]* <size>px "<family>"`

```ts
// 普通
font: '32px Hiragino Sans GB'

// 粗体
font: 'bold 32px Hiragino Sans GB'

// 斜体
font: 'italic 32px Hiragino Sans GB'

// 粗斜体
font: 'bold italic 32px Hiragino Sans GB'
```

### Emoji 支持

CJK 字体通常不含 emoji glyph，需要额外注册 emoji 字体：

```ts
// macOS
registerFont('/System/Library/Fonts/Apple Color Emoji.ttc', 'Apple Color Emoji')
```

### 自动字体查找（macOS）

```ts
import { registerFont } from 'notecard'
import { readdirSync } from 'node:fs'

// 查找系统中文字体
const fontDir = '/System/Library/Fonts'
const fonts = readdirSync(fontDir).filter(f => f.includes('Heiti') || f.includes('Hiragino'))
// fonts[0] => 'STHeiti Light.ttc'
registerFont(`${fontDir}/${fonts[0]}`, 'Heiti SC')
```

---

## 插件系统

注册自定义元素类型和渲染器：

### 注册

```ts
import { registerRenderer } from 'notecard'

registerRenderer('watermark', (ctx, el, rc) => {
  // ctx: SKRSContext2D（@napi-rs/canvas 画布上下文）
  // el: 元素对象（类型为 Record<string, unknown>，按需断言）
  // rc: RenderContext（包含 imageCache 和 drawElement）
  const { x, y, text, font, color } = el as {
    x: number; y: number; text: string; font: string; color: string
  }
  ctx.save()
  ctx.font = font
  ctx.fillStyle = color
  ctx.textBaseline = 'top'
  ctx.fillText(text, x, y)
  ctx.restore()
})
```

### 使用

```ts
const card = await renderCard({
  width: 1080,
  height: 1440,
  background: { type: 'color', value: '#1e1e2e' },
  elements: [
    // type 为注册时的字符串，字段随意自定义
    {
      type: 'watermark',   // ← 触发自定义渲染器
      x: 20, y: 20,
      text: '© NoteCard',
      font: '28px sans-serif',
      color: 'rgba(255,255,255,0.4)',
      spans: [],           // schema 校验需留空
      width: 360,
      lineHeight: 40,
    } as never,            // 类型断言绕过严格检查
  ],
})
```

### 插件中使用 imageCache

```ts
registerRenderer('avatar', async (ctx, el, rc) => {
  const { x, y, size, src } = el as { x: number; y: number; size: number; src: string }
  const img = rc.imageCache.get(src)
  if (!img) return
  ctx.save()
  ctx.beginPath()
  ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2)
  ctx.clip()
  ctx.drawImage(img, x, y, size, size)
  ctx.restore()
})
```

---

## 常见模式

### 圆形头像

```ts
elements: [
  {
    type: 'image',
    x: centerX - size / 2, y: centerY - size / 2,
    width: size, height: size,
    src: 'avatar.jpg',
    borderRadius: size / 2,   // 正圆
    clip: { type: 'circle', cx: size / 2, cy: size / 2, r: size / 2 },
  },
]
```

### 毛玻璃效果

```ts
// 白色半透明矩形 + screen 混合模式 ≈ 毛玻璃
{
  type: 'rect',
  x: 40, y: 40,
  width: 1000, height: 1360,
  borderRadius: 40,
  fill: { type: 'color', value: 'rgba(255,255,255,0.2)' },
  blendMode: 'screen',
},
```

### 文字描边 + 阴影

```ts
spans: [{
  content: '标题文字',
  font: 'bold 56px Hiragino Sans GB',
  fill: { type: 'color', value: '#ffffff' },
  stroke: { paint: { type: 'color', value: '#1a1a2e' }, width: 4 },
}],
// 同时配合 rect 的 shadow 属性产生立体感
```

### 渐变叠加层（文字可读性）

```ts
background: { type: 'image', src: 'bg.jpg', fit: 'cover' },
elements: [
  // 深色渐变叠加层，确保白色文字清晰可读
  {
    type: 'rect',
    x: 0, y: h - 400,
    width: w, height: 400,
    fill: {
      type: 'linear-gradient',
      angle: 90,
      stops: [
        { offset: 0, color: 'rgba(0,0,0,0)' },
        { offset: 1, color: 'rgba(0,0,0,0.7)' },
      ],
    },
  },
  // 白色文字在叠加层上方
  {
    type: 'text',
    x: pad, y: h - 300,
    spans: [{ content: '覆盖层下方的文字', font: 'bold 40px Hiragino Sans GB', fill: { type: 'color', value: '#ffffff' } }],
  },
]
```

### 多层装饰

```ts
elements: [
  // 大号模糊装饰（最底层）
  { type: 'rect', x: -50, y: -50, width: 400, height: 400, borderRadius: 200, fill: { type: 'color', value: 'rgba(255,255,255,0.15)' }, transform: { rotate: 15, anchor: [0.5, 0.5] } },
  // 小号清晰装饰（中层）
  { type: 'rect', x: w - 200, y: h - 200, width: 150, height: 150, borderRadius: 75, fill: { type: 'color', value: 'rgba(255,255,255,0.1)' } },
  // 内容（最上层）
  ...contentElements,
]
```

### 自动垂直居中（模板扩展）

如需在模板外自定义垂直居中内容：

```ts
// 先用 pretext 测量实际文字高度
import { prepareWithSegments, layoutWithLines } from '@chenglou/pretext'

const prepared = prepareWithSegments(text, font, { whiteSpace: 'pre-wrap' })
const { lineCount } = layoutWithLines(prepared, width, lineHeight)
const textBlockH = lineCount * lineHeight

const startY = Math.round((containerH - textBlockH) / 2)

// 然后创建 text 元素，y = startY
```
