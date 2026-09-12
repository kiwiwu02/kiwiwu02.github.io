import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

test('正文各模块使用收紧后的统一留白节奏', () => {
  const css = readFileSync(new URL('../index.css', import.meta.url), 'utf8')

  assert.match(css, /--section-bridge:\s*clamp\(1\.25rem,\s*2vw,\s*2rem\)/)
  assert.match(css, /--section-record-gap:\s*clamp\(1\.25rem,\s*2vw,\s*2rem\)/)
  assert.match(css, /\.sec-pad\s*\{[^}]*padding:\s*clamp\(4\.5rem,\s*7vw,\s*7rem\)\s+0/)
  assert.match(css, /\.experience-section\s*\{[^}]*padding:\s*var\(--section-bridge\)\s+0/)
  assert.match(css, /\.timeline\.experience-timeline\s*\{[^}]*margin-top:\s*var\(--section-record-gap\)/)
  assert.match(css, /\.about-section\s*\{[^}]*padding-top:\s*clamp\(4\.5rem,\s*7vw,\s*7rem\)/)
  assert.match(css, /\.about-section\s*\{[^}]*padding-bottom:\s*var\(--section-bridge\)/)
  assert.doesNotMatch(css, /\.about-divider\s*\{/)
  assert.match(css, /\.about-main-grid\s*\{[^}]*margin-top:\s*var\(--section-record-gap\)/)
  assert.match(css, /\.work-section\s*\{[^}]*padding-top:\s*var\(--section-bridge\)/)
  assert.match(css, /\.proj-list\s*\{[^}]*margin-top:\s*var\(--section-record-gap\)/)
})

test('项目区与联系区之间使用适度收紧的底部留白', () => {
  const css = readFileSync(new URL('../index.css', import.meta.url), 'utf8')

  assert.match(css, /\.work-section\s*\{[^}]*padding-bottom:\s*clamp\(3rem,\s*4\.5vw,\s*4\.5rem\)/s)
})

test('教育、实习与 GitHub 更新时间统一使用实习时间字体', () => {
  const css = readFileSync(new URL('../index.css', import.meta.url), 'utf8')
  const about = readFileSync(new URL('../components/About.jsx', import.meta.url), 'utf8')
  const experience = readFileSync(new URL('../components/Experience.jsx', import.meta.url), 'utf8')
  const projects = readFileSync(new URL('../components/Projects.jsx', import.meta.url), 'utf8')
  const timeLabel = css.match(/\.time-label\s*{([\s\S]*?)\n}/)?.[1] ?? ''

  assert.match(timeLabel, /font-family:\s*var\(--font-mono\)/)
  assert.match(timeLabel, /font-size:\s*clamp\(0\.82rem,\s*0\.85vw,\s*0\.92rem\)/)
  assert.match(timeLabel, /font-weight:\s*400;/)
  assert.match(timeLabel, /color:\s*var\(--text-3\);/)
  assert.match(timeLabel, /letter-spacing:\s*0\.08em;/)
  assert.match(about, /className="education-period time-label"/)
  assert.match(experience, /className="tl-when time-label"/)
  assert.match(projects, /github-item-index time-label/)
})

test('教育与实习记录共享基础列间距，项目行可独立优化列间距', () => {
  const css = readFileSync(new URL('../index.css', import.meta.url), 'utf8')

  assert.match(css, /--record-first-col:\s*clamp\(9rem,\s*12vw,\s*12rem\)/)
  assert.match(css, /--record-gap:\s*clamp\(1\.5rem,\s*3vw,\s*3\.5rem\)/)

  for (const selector of ['.education-entry', '.tl-item']) {
    const rule = css.match(new RegExp(`(?:^|\\n)${selector.replace('.', '\\.')}\\s*{([\\s\\S]*?)\\n}`))?.[1] ?? ''
    assert.match(rule, /grid-template-columns:\s*var\(--record-first-col\)/)
    assert.match(rule, /gap:\s*var\(--record-gap\)/)
  }

  const projectRule = css.match(/(?:^|\n)\.proj-row\s*{([\s\S]*?)\n}/)?.[1] ?? ''
  assert.match(projectRule, /grid-template-columns:\s*var\(--record-first-col\)/)
  assert.match(projectRule, /gap:\s*clamp\(1\.25rem,\s*2vw,\s*2\.5rem\)/)
})

test('三组记录行悬停时只在自身范围内显示低存在感高亮', () => {
  const css = readFileSync(new URL('../index.css', import.meta.url), 'utf8')
  const highlightRule = css.match(/:is\(\.education-entry, \.tl-item, \.proj-row\)::before\s*\{([\s\S]*?)\n\}/)?.[1] ?? ''
  const contentRule = css.match(/:is\(\.education-entry, \.tl-item, \.proj-row\)\s*>\s*\*\s*\{([\s\S]*?)\n\}/)?.[1] ?? ''

  assert.match(highlightRule, /inset:\s*0;/)
  assert.match(highlightRule, /width:\s*auto;/)
  assert.match(highlightRule, /transform:\s*none;/)
  assert.doesNotMatch(highlightRule, /100vw/)
  assert.match(highlightRule, /pointer-events:\s*none/)
  assert.match(highlightRule, /background-color:\s*var\(--record-hover-bg, transparent\)/)
  assert.match(contentRule, /position:\s*relative/)
  assert.match(contentRule, /z-index:\s*1/)
})

test('三组记录表高亮只使用一层背景，避免边界饱和度不一致', () => {
  const css = readFileSync(new URL('../index.css', import.meta.url), 'utf8')
  const rowRule = css.match(/:is\(\.education-entry, \.tl-item, \.proj-row\)\s*\{([\s\S]*?)\n\}/)?.[1] ?? ''
  const highlightRule = css.match(/:is\(\.education-entry, \.tl-item, \.proj-row\)::before\s*\{([\s\S]*?)\n\}/)?.[1] ?? ''

  assert.match(rowRule, /background-color:\s*transparent/)
  assert.match(highlightRule, /background-color:\s*var\(--record-hover-bg, transparent\)/)
})

test('三组记录表的模块标题使用统一字体和字号', () => {
  const css = readFileSync(new URL('../index.css', import.meta.url), 'utf8')
  const titleRule = css.match(/\.education-institution,\s*\.education-degree,\s*\.education-level,\s*\.tl-role,\s*\.tl-company,\s*\.github-item-title\s*{([\s\S]*?)\n}/)?.[1] ?? ''

  assert.match(titleRule, /font-family:\s*var\(--font-sans\)/)
  assert.match(titleRule, /font-size:\s*1\.06rem/)
  assert.match(titleRule, /font-weight:\s*500/)
  assert.match(titleRule, /letter-spacing:\s*-0\.01em/)
})

test('实习和项目描述、教育和项目标签统一文字尺度', () => {
  const css = readFileSync(new URL('../index.css', import.meta.url), 'utf8')
  const descriptionRule = css.match(/\.tl-body p,\s*\.github-item-description\s*{([\s\S]*?)\n}/)?.[1] ?? ''
  const tagRule = css.match(/\.tag,\s*\.education-honor-tag\s*{([\s\S]*?)\n}/)?.[1] ?? ''

  assert.match(descriptionRule, /font-family:\s*var\(--font-sans\)/)
  assert.match(descriptionRule, /font-size:\s*0\.92rem/)
  assert.match(descriptionRule, /line-height:\s*1\.6/)
  assert.match(tagRule, /font-family:\s*var\(--font-mono\)/)
  assert.match(tagRule, /font-size:\s*0\.7rem/)
  assert.match(tagRule, /line-height:\s*1\.45/)
  assert.match(tagRule, /letter-spacing:\s*0\.04em/)
})

test('教育、实习与项目标题使用导航栏对应图标并与标题字号同步', () => {
  const about = readFileSync(new URL('../components/About.jsx', import.meta.url), 'utf8')
  const experience = readFileSync(new URL('../components/Experience.jsx', import.meta.url), 'utf8')
  const projects = readFileSync(new URL('../components/Projects.jsx', import.meta.url), 'utf8')
  const css = readFileSync(new URL('../index.css', import.meta.url), 'utf8')

  assert.match(about, /import \{ GraduationCap \} from '@phosphor-icons\/react'/)
  assert.match(about, /<GraduationCap className="sec-title-icon" size="1em" weight="regular" aria-hidden="true" focusable="false" \/>/)
  assert.match(experience, /import \{ Briefcase as BriefcaseSimple, X \} from '@phosphor-icons\/react'/)
  assert.match(experience, /<BriefcaseSimple className="sec-title-icon" size="1em" weight="regular" aria-hidden="true" focusable="false" \/>/)
  assert.match(projects, /import \{ GitBranch, Globe \} from '@phosphor-icons\/react'/)
  assert.match(projects, /<GitBranch className="sec-title-icon" size="1em" weight="regular" aria-hidden="true" focusable="false" \/>/)
  assert.match(css, /\.sec-title\s*\{[\s\S]*?font-size:\s*clamp\(1\.33rem,\s*2\.24vw,\s*2\.03rem\)/)
  assert.match(css, /\.sec-title-icon\s*\{[\s\S]*?width:\s*1em;[\s\S]*?height:\s*1em;/)
  assert.match(css, /\.sec-title-icon\s*\{[\s\S]*?color:\s*var\(--accent\);/)
  assert.doesNotMatch(css, /\.about-section \.sec-title::before\s*\{/)
})

test('section 标题图标与标题字面底部对齐', () => {
  const css = readFileSync(new URL('../index.css', import.meta.url), 'utf8')
  const iconRule = css.match(/\.sec-title-icon\s*{([\s\S]*?)\n}/)?.[1] ?? ''

  assert.match(iconRule, /align-self:\s*baseline;/)
  assert.match(iconRule, /transform:\s*translateY\(0\.08em\);/)
})

test('教育、实习与项目标题到记录表使用统一间距', () => {
  const css = readFileSync(new URL('../index.css', import.meta.url), 'utf8')
  const aboutLayout = css.match(/\.about-main-grid\s*{([\s\S]*?)\n}/)?.[1] ?? ''
  const experienceLayout = css.match(/\.timeline\.experience-timeline\s*{([\s\S]*?)\n}/)?.[1] ?? ''
  const projectLayout = css.match(/\.proj-list\s*{([\s\S]*?)\n}/)?.[1] ?? ''

  assert.match(css, /--section-record-gap:\s*clamp\(1\.25rem,\s*2vw,\s*2rem\)/)
  for (const rule of [aboutLayout, experienceLayout, projectLayout]) {
    assert.match(rule, /margin-top:\s*var\(--section-record-gap\)/)
  }
})

test('三组记录行悬停时将主要信息强调为品牌色', () => {
  const css = readFileSync(new URL('../index.css', import.meta.url), 'utf8')

  assert.match(css, /:is\(\.education-entry, \.tl-item, \.proj-row\):focus-within\s*\{[\s\S]*?--record-hover-accent:\s*var\(--accent\);/)
  assert.match(css, /:is\(\.education-entry, \.tl-item, \.proj-row\):hover\s*\{[\s\S]*?--record-hover-accent:\s*var\(--accent\);/)
  assert.match(css, /:is\(\.education-entry, \.tl-item, \.proj-row\)\s*:is\([\s\S]*?\.education-institution, \.tl-role, \.github-item-title[\s\S]*?color:\s*var\(--record-hover-accent, var\(--text\)\)/)
})

test('三组记录行使用低对比度 divider，教育和实习略增呼吸空间', () => {
  const css = readFileSync(new URL('../index.css', import.meta.url), 'utf8')

  assert.match(css, /:is\(\.education-entry, \.tl-item, \.proj-row\)\s*{[\s\S]*?border-bottom-color:\s*color-mix\(in srgb, var\(--record-hover-line, var\(--line\)\) 72%, transparent\)/)
  assert.match(css, /\.education-entry\s*{[\s\S]*?padding:\s*clamp\(1\.3rem,\s*1\.9vw,\s*1\.8rem\)/)
  assert.match(css, /\.experience-timeline \.tl-item\s*{[\s\S]*?padding:\s*clamp\(1\.1rem,\s*1\.5vw,\s*1\.5rem\)/)
  assert.match(css, /\.proj-row\s*{[\s\S]*?padding:\s*1\.35rem\s+0/)
})
