import { ZodError, z } from "zod";

import {
  BUILT_IN_THEME_NAMES,
  mergeTheme,
  renderMarkdown,
  resolveTheme,
} from "./src/index.js";
import type { BuiltInThemeName, ThemeOverrides } from "./src/index.js";

// 最大单页高度限制（像素）
const MAX_SINGLE_PAGE_HEIGHT = 16000;

const renderRequestSchema = z.object({
  markdown: z.string().min(1, "缺少 markdown 参数"),
  format: z
    .string()
    .optional()
    .default("png")
    .refine((value): value is "png" | "svg" => value === "png" || value === "svg", {
      message: "format 仅支持 png 或 svg",
    })
    .transform((value) => value as "png" | "svg"),
  width: z.preprocess(
    (value) => {
      const parsed = Number(value);
      return Number.isFinite(parsed) && parsed > 0 ? parsed : 1080;
    },
    z.number().transform((value) => Math.max(400, Math.min(2160, value))),
  ),
  theme: z
    .unknown()
    .optional()
    .default("default")
    .refine(
      (value): value is BuiltInThemeName | ThemeOverrides =>
        typeof value === "string"
          ? BUILT_IN_THEME_NAMES.includes(value as BuiltInThemeName)
          : typeof value === "object" && value !== null && !Array.isArray(value),
      {
        message: `theme 必须是以下内置主题之一：${BUILT_IN_THEME_NAMES.join(", ")}，或传入主题对象`,
      },
    )
    .transform((value) => value as BuiltInThemeName | ThemeOverrides),
  scale: z.preprocess(
    (value) => {
      const parsed = Number(value);
      return Number.isFinite(parsed) && parsed > 0 ? parsed : 2;
    },
    z.number().transform((value) => Math.max(1, Math.min(3, value))),
  ),
});

Bun.serve({
  port: Number(process.env.APP_PORT || 3000),
  routes: {
    "/": {
      GET: () => {
        return new Response(
          `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>Marknative API - Markdown 渲染服务</title>
  <style>
    body {
      font-family: "WenQuanYi Micro Hei", "Microsoft YaHei", system-ui, sans-serif;
      max-width: 900px;
      margin: 40px auto;
      padding: 20px;
      line-height: 1.6;
    }
    h1 { color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px; }
    h2 { color: #555; margin-top: 30px; }
    h3 { color: #666; }
    code { background: #f4f4f4; padding: 2px 6px; border-radius: 4px; font-family: monospace; }
    pre { background: #f8f8f8; padding: 16px; border-radius: 8px; overflow-x: auto; border-left: 4px solid #007acc; }
    .endpoint { background: #f0f7ff; padding: 15px; border-radius: 8px; margin: 15px 0; }
    .param { margin: 8px 0; padding-left: 20px; }
    .param-name { font-weight: bold; color: #007acc; }
    .param-type { color: #666; font-size: 0.9em; }
    .param-desc { color: #444; }
    .required { color: #d9534f; font-size: 0.8em; }
    .optional { color: #5cb85c; font-size: 0.8em; }
    textarea { width: 100%; padding: 12px; font-family: monospace; border: 1px solid #ddd; border-radius: 4px; resize: vertical; }
    select, input[type="number"] { padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; margin-right: 10px; }
    button { background: #007acc; color: white; padding: 10px 24px; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; }
    button:hover { background: #005fa3; }
    #result { margin-top: 20px; }
    #result img { max-width: 100%; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .form-row { margin: 15px 0; }
    .form-row label { display: inline-block; min-width: 100px; color: #555; }
    .loading { color: #007acc; padding: 20px; text-align: center; }
    .error { color: #d9534f; background: #fdf2f2; padding: 15px; border-radius: 4px; border-left: 4px solid #d9534f; }
    .info-box { background: #e7f3ff; border-left: 4px solid #007acc; padding: 12px 16px; margin: 15px 0; border-radius: 0 4px 4px 0; }
    .warning-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px 16px; margin: 15px 0; border-radius: 0 4px 4px 0; }
  </style>
</head>
<body>
  <h1>Marknative API 服务</h1>
  <p>原生 Markdown 渲染引擎 —— 无需浏览器，直接生成 PNG/SVG 图片</p>

  <div class="info-box">
    <strong>特性：</strong>支持自定义宽度、自动计算高度、中文渲染、代码高亮、数学公式
  </div>

  <div class="warning-box">
    <strong>注意：</strong>单页最大高度限制为 16384 像素（考虑缩放后）。内容过长时请缩小宽度或降低缩放比例。
  </div>

  <h2>API 接口</h2>

  <div class="endpoint">
    <h3>POST /render</h3>
    <p>将 Markdown 渲染为图片</p>

    <h4>请求参数</h4>
    <div class="param">
      <span class="param-name">markdown</span>
      <span class="param-type">string</span>
      <span class="required">[必填]</span>
      <div class="param-desc">要渲染的 Markdown 内容</div>
    </div>
    <div class="param">
      <span class="param-name">format</span>
      <span class="param-type">'png' | 'svg'</span>
      <span class="optional">[可选]</span>
      <div class="param-desc">输出格式，默认 png</div>
    </div>
    <div class="param">
      <span class="param-name">width</span>
      <span class="param-type">number</span>
      <span class="optional">[可选]</span>
      <div class="param-desc">图片宽度（像素），默认 1080，最大 2160</div>
    </div>
    <div class="param">
      <span class="param-name">theme</span>
      <span class="param-type">string | object</span>
      <span class="optional">[可选]</span>
      <div class="param-desc">主题名称或自定义主题配置，默认 default</div>
    </div>
    <div class="param">
      <span class="param-name">scale</span>
      <span class="param-type">number</span>
      <span class="optional">[可选]</span>
      <div class="param-desc">缩放比例（仅 PNG），默认 2。最终像素高度 = 逻辑高度 × scale，不能超过 16384</div>
    </div>

    <h4>请求示例</h4>
    <pre>POST /render
Content-Type: application/json

{
  "markdown": "# 标题\\n\\n正文内容",
  "format": "png",
  "width": 1080,
  "theme": "nord",
  "scale": 2
}</pre>
  </div>

  <div class="endpoint">
    <h3>GET /health</h3>
    <p>健康检查接口</p>
  </div>

  <h2>在线测试</h2>
  <form id="renderForm">
    <div class="form-row"><label>Markdown 内容：</label></div>
    <textarea id="markdown" rows="12"># Marknative 中文渲染测试

欢迎使用 **Marknative** Markdown 渲染服务！

## 特性

- 无需浏览器，服务端直接渲染
- 支持多种主题（暗色/亮色）
- 自定义宽度，自动计算高度
- 完美支持中文（文泉驿微米黑字体）
- 代码高亮（Shiki）
- 数学公式（MathJax）

## 代码示例

\`\`\`typescript
// 中文注释支持
function greet(name: string): string {
  return \`你好，\${name}！\`;
}

console.log(greet("世界"));
\`\`\`

## 数学公式

行内公式：$E = mc^2$

块级公式：
$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$

> 这是一段中文引用文本
> 支持多行显示

| 功能 | 支持 |
|------|------|
| 中文渲染 | ✅ |
| 代码高亮 | ✅ |
| 数学公式 | ✅ |
</textarea>

    <div class="form-row">
      <label>图片宽度：</label>
      <input type="number" id="width" value="1080" min="400" max="2160" step="10">
      <small>像素（默认 1080）</small>
    </div>

    <div class="form-row">
      <label>输出格式：</label>
      <select id="format">
        <option value="png" selected>PNG 图片</option>
        <option value="svg">SVG 矢量图</option>
      </select>
    </div>

    <div class="form-row">
      <label>主题风格：</label>
      <select id="theme">
        <option value="default" selected>默认 (Default)</option>
        <option value="dark">暗色 (Dark)</option>
        <option value="github">GitHub</option>
        <option value="nord">Nord</option>
        <option value="dracula">Dracula</option>
        <option value="solarized">Solarized</option>
        <option value="sepia">Sepia</option>
        <option value="rose">Rose</option>
        <option value="ocean">Ocean</option>
        <option value="forest">Forest</option>
      </select>
    </div>

    <div class="form-row">
      <label>缩放比例：</label>
      <select id="scale">
        <option value="1">1x (标准)</option>
        <option value="2" selected>2x (推荐)</option>
        <option value="3">3x (高清)</option>
      </select>
      <small>最终高度 = 逻辑高度 × scale，不能超过 16384 像素</small>
    </div>

    <div class="form-row"><button type="submit">渲染图片</button></div>
  </form>

  <div id="result"></div>

  <script>
    document.getElementById('renderForm').onsubmit = async (e) => {
      e.preventDefault();
      const result = document.getElementById('result');
      result.innerHTML = '<div class="loading">正在渲染，请稍候...</div>';

      try {
        const res = await fetch('/render', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            markdown: document.getElementById('markdown').value,
            format: document.getElementById('format').value,
            width: parseInt(document.getElementById('width').value),
            theme: document.getElementById('theme').value,
            scale: parseInt(document.getElementById('scale').value)
          })
        });

        if (res.ok) {
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          const format = document.getElementById('format').value.toUpperCase();
          const width = res.headers.get('X-Page-Width') || '未知';
          const height = res.headers.get('X-Page-Height') || '未知';
          const scaledHeight = res.headers.get('X-Scaled-Height') || '未知';

          result.innerHTML = \`
            <h3>渲染结果 (\${format})</h3>
            <p>逻辑尺寸: \${width} x \${height} 像素 | 实际像素高度: \${scaledHeight}px</p>
            <img src="\${url}" alt="渲染结果" />
          \`;
        } else {
          const errorText = await res.text();
          result.innerHTML = \`<div class="error">渲染失败：\${errorText}</div>\`;
        }
      } catch (err) {
        result.innerHTML = \`<div class="error">请求失败：\${err.message}</div>\`;
      }
    };
  </script>
</body>
</html>
`,
          { headers: { "Content-Type": "text/html; charset=utf-8" } },
        );
      },
    },

    "/health": {
      GET: () => new Response("OK"),
    },

    "/render": {
      POST: async (req) => {
        try {
          const {
            markdown,
            format,
            width: pageWidth,
            theme: themeName,
            scale: scaleFactor,
          } = renderRequestSchema.parse(await req.json());

          // 预估高度检查
          const estimatedLines = markdown.split("\\n").length;
          const estimatedHeight = (estimatedLines * 50 + 200) * scaleFactor;
          if (estimatedHeight > MAX_SINGLE_PAGE_HEIGHT) {
            return new Response(
              `内容过长，预估渲染高度 (${Math.round(estimatedHeight)} 像素) 超出最大限制 (${MAX_SINGLE_PAGE_HEIGHT} 像素)。建议：1) 减小宽度 2) 降低缩放比例 3) 缩短内容`,
              { status: 400 },
            );
          }

          // 获取基础主题
          const baseTheme = resolveTheme(themeName);

          // 创建自定义主题
          const customTheme = mergeTheme(baseTheme, {
            page: { width: pageWidth, height: MAX_SINGLE_PAGE_HEIGHT },
          });

          // 渲染
          const pages = await renderMarkdown(markdown, {
            format,
            theme: customTheme,
            singlePage: true,
            scale: scaleFactor,
          });

          const first = pages[0];
          if (!first) {
            return new Response("渲染失败：未生成输出", { status: 500 });
          }

          // 检查实际高度
          const scaledHeight = first.page.height * scaleFactor;
          if (scaledHeight > MAX_SINGLE_PAGE_HEIGHT) {
            return new Response(
              `渲染后的图片高度 (${Math.round(scaledHeight)} 像素) 超出最大限制 (${MAX_SINGLE_PAGE_HEIGHT} 像素)。建议：1) 减小宽度 2) 降低缩放比例 3) 缩短内容`,
              { status: 400 },
            );
          }

          return new Response(first.data, {
            headers: {
              "Content-Type": format === "png" ? "image/png" : "image/svg+xml",
              "X-Pages-Total": String(pages.length),
              "X-Page-Width": String(first.page.width),
              "X-Page-Height": String(first.page.height),
              "X-Scaled-Height": String(scaledHeight),
            },
          });
        } catch (error) {
          if (error instanceof SyntaxError) {
            return new Response("请求体必须是合法 JSON", { status: 400 });
          }
          if (error instanceof ZodError) {
            return new Response(
              error.issues.map((issue) => issue.message).join("；"),
              { status: 400 },
            );
          }
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          if (
            errorMessage.includes("bitmap") ||
            errorMessage.includes("allocate")
          ) {
            return new Response(
              "渲染失败：图片尺寸过大，超出内存限制。建议：1) 减小宽度 2) 降低缩放比例 3) 缩短内容",
              { status: 400 },
            );
          }
          return new Response("渲染错误: " + errorMessage, { status: 500 });
        }
      },
    },
  },
});

console.log("API 服务已启动：http://localhost:3000");
