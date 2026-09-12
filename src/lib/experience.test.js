import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { experience } from '../data.js'

test('实习经历只保留章节标题和时间线内容', () => {
  const source = readFileSync(new URL('../components/Experience.jsx', import.meta.url), 'utf8')
  const css = readFileSync(new URL('../index.css', import.meta.url), 'utf8')

  assert.match(source, /<h2 className="sec-title">[\s\S]*实习经历[\s\S]*<\/h2>/)
  assert.doesNotMatch(source, /Where I built real-world AI systems\./)
  assert.doesNotMatch(source, /从智能问数到多智能体研究，再到工业 Agent 平台，在真实业务场景中持续探索 AI 系统的工程化落地。/)
  assert.doesNotMatch(source, /experience-intro/)
  assert.doesNotMatch(source, /experience-period/)
  assert.doesNotMatch(source, /experience-rule/)
  assert.doesNotMatch(source, /2025 — 2026/)
  assert.doesNotMatch(css, /\.experience-(english|intro|period|rule)/)
})

test('实习经历不再展示深圳机器人谷展厅官网的附加描述', () => {
  assert.equal(experience[1].extra, undefined)
})

test('实习经历标题下方保留低对比度时间线顶部横线', () => {
  const css = readFileSync(new URL('../index.css', import.meta.url), 'utf8')
  const timeline = css.match(/\.timeline\.experience-timeline\s*\{([^}]*)\}/)?.[1] ?? ''

  assert.match(timeline, /border-top:\s*1px solid var\(--line-strong\)/)
  assert.match(css, /\.experience-timeline\s*\{[^}]*border-top-color:\s*color-mix\(in srgb, var\(--line-strong\) 55%, transparent\)/)
})

test('实习岗位是第一信息层，公司名称是次一级信息', () => {
  const css = readFileSync(new URL('../index.css', import.meta.url), 'utf8')

  assert.match(css, /\.tl-role\s*{[^}]*font-weight:\s*600;/)
  assert.match(css, /\.tl-role\s*{[^}]*color:\s*var\(--text\);/)
  assert.match(css, /\.tl-company\s*{[^}]*font-weight:\s*500;/)
  assert.match(css, /\.tl-company\s*{[^}]*color:\s*var\(--text-2\);/)
})

test('实习经历采用时间、主体内容与公司三栏记录行', () => {
  const source = readFileSync(new URL('../components/Experience.jsx', import.meta.url), 'utf8')
  const css = readFileSync(new URL('../index.css', import.meta.url), 'utf8')
  const itemLayout = css.match(/(?:^|\n)\.tl-item\s*{([\s\S]*?)\n}/)?.[1] ?? ''

  assert.match(itemLayout, /grid-template-columns:\s*var\(--record-first-col\)\s+minmax\(0, 1\.65fr\)\s+minmax\(10rem, 0\.5fr\)/)
  assert.match(source, /className="tl-body"/)
  assert.match(source, /<div className="tl-company">/)
  assert.ok(source.indexOf('className="tl-body"') < source.indexOf('className="tl-company"'))
  assert.doesNotMatch(source, /<h4>[\s\S]*tl-company[\s\S]*<\/h4>/)
  assert.doesNotMatch(source, /tl-meta|tl-tags|item\.tags|item\.badge/)
})

test('实习经历不展示项目外链按钮', () => {
  const source = readFileSync(new URL('../components/Experience.jsx', import.meta.url), 'utf8')

  assert.doesNotMatch(source, /tl-work-link/)
  assert.doesNotMatch(source, /VIEW WORK/)
  assert.doesNotMatch(source, /item\.workHref/)
})

test('实习经历的公司名称右对齐并复用统一标题字重', () => {
  const source = readFileSync(new URL('../components/Experience.jsx', import.meta.url), 'utf8')
  const css = readFileSync(new URL('../index.css', import.meta.url), 'utf8')
  const titleRule = css.match(/\.education-institution,\s*\.education-degree,\s*\.education-level,\s*\.tl-role,\s*\.tl-company,\s*\.github-item-title\s*{([\s\S]*?)\n}/)?.[1] ?? ''

  assert.match(source, /className="tl-company"/)
  assert.match(css, /\.tl-company\s*{[\s\S]*?color:\s*var\(--text\);/)
  assert.match(titleRule, /font-weight:\s*500;/)
  assert.match(css, /\.tl-company\s*{[\s\S]*?text-align:\s*right;/)
  assert.match(css, /\.tl-company\s*{[\s\S]*?white-space:\s*nowrap;/)
})

test('实习经历时间轴行按顺序渐进出现', () => {
  const css = readFileSync(new URL('../index.css', import.meta.url), 'utf8')

  assert.match(css, /\.experience-timeline \.tl-item:nth-child\(1\)\s*{[^}]*transition-delay:\s*0s/s)
  assert.match(css, /\.experience-timeline \.tl-item:nth-child\(2\)\s*{[^}]*transition-delay:\s*0\.1s/s)
  assert.match(css, /\.experience-timeline \.tl-item:nth-child\(3\)\s*{[^}]*transition-delay:\s*0\.2s/s)
})

test('实习经历的文字颜色变化保留平滑过渡', () => {
  const css = readFileSync(new URL('../index.css', import.meta.url), 'utf8')

  assert.match(css, /\.tl-when\s*{[\s\S]*?transition:\s*color/)
  assert.match(css, /\.tl-role\s*{[\s\S]*?transition:\s*color/)
  assert.match(css, /\.tl-company\s*{[\s\S]*?transition:\s*color/)
  assert.match(css, /\.tl-body p\s*{[\s\S]*?transition:\s*color/)
})

test('实习经历时间字体保持 monospace 并降低视觉权重', () => {
  const css = readFileSync(new URL('../index.css', import.meta.url), 'utf8')

  assert.match(css, /\.time-label\s*{[\s\S]*?font-size:\s*clamp\(0\.82rem,\s*0\.85vw,\s*0\.92rem\)/)
  assert.match(css, /\.time-label\s*{[\s\S]*?font-weight:\s*400;/)
  assert.match(css, /\.time-label\s*{[\s\S]*?color:\s*var\(--text-3\);/)
  assert.match(css, /\.time-label\s*{[\s\S]*?letter-spacing:\s*0\.08em;/)
})

test('三段实习经历都提供项目简介、技术栈和详细工作内容', () => {
  assert.equal(experience.length, 3)
  experience.forEach((item) => {
    assert.ok(item.details)
    assert.ok(item.details.summary)
    assert.ok(item.details.stack.length > 0)
    assert.ok(item.details.points.length > 0)
  })

  assert.ok(experience[0].details.stack.includes('Ant Design X'))
  assert.ok(experience[0].details.points.some((point) => point.includes('41 个原子化工具')))
  assert.ok(experience[1].details.points.some((point) => point.includes('CrossValidationAgent')))
  assert.ok(experience[2].details.stack.includes('Milvus'))
})

test('实习记录主内容可键盘操作并打开可访问详情弹窗', () => {
  const source = readFileSync(new URL('../components/Experience.jsx', import.meta.url), 'utf8')
  const css = readFileSync(new URL('../index.css', import.meta.url), 'utf8')

  assert.match(source, /role="button"/)
  assert.match(source, /aria-haspopup="dialog"/)
  assert.match(source, /onKeyDown=/)
  assert.match(source, /aria-modal="true"/)
  assert.match(source, /onClose/)
  assert.match(source, /createPortal/)
  assert.match(css, /\.tl-detail-trigger\s*{[\s\S]*?cursor:\s*pointer;/)
  assert.match(css, /\.experience-modal\s*{[\s\S]*?position:\s*fixed;/)
  assert.match(css, /\.experience-modal-card\s*{[\s\S]*?max-height:/)
  assert.match(css, /\.experience-modal-card\s*{[\s\S]*?width:\s*min\(980px,\s*100%\)/)
  assert.match(css, /\.experience-detail-section\s*{[^}]*background:\s*transparent;/)
  assert.match(css, /\.experience-modal-card::-webkit-scrollbar\s*{/)
})

test('实习记录默认隐藏文字操作提示，仅在 hover 或 focus 时显示轻量箭头', () => {
  const source = readFileSync(new URL('../components/Experience.jsx', import.meta.url), 'utf8')
  const css = readFileSync(new URL('../index.css', import.meta.url), 'utf8')

  assert.match(source, /className="tl-detail-hint" aria-hidden="true">\s*↗\s*<\/span>/)
  assert.doesNotMatch(source, />\s*查看详情\s*<ArrowUpRight/)
  assert.match(css, /\.tl-detail-hint\s*{[\s\S]*?position:\s*absolute;/)
  assert.match(css, /\.tl-detail-hint\s*{[\s\S]*?opacity:\s*0;/)
  assert.match(css, /\.tl-item:hover \.tl-detail-hint,\s*\.tl-detail-trigger:focus-visible \.tl-detail-hint/)
})
