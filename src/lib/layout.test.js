import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

test('个人项目以连续项目行呈现，而不是等高卡片网格', () => {
  const component = readFileSync(new URL('../components/Projects.jsx', import.meta.url), 'utf8')
  const css = readFileSync(new URL('../index.css', import.meta.url), 'utf8')

  assert.match(component, /className="proj-list"/)
  assert.match(component, /className="proj-row"/)
  assert.match(css, /\.proj-list\s*{[^}]*flex-direction:\s*column/s)
  assert.match(css, /\.proj-row\s*{[^}]*grid-template-columns:/s)
  assert.doesNotMatch(component, /className="proj-card"/)
})

test('导航使用可见性观察器标记当前章节', () => {
  const nav = readFileSync(new URL('../components/Nav.jsx', import.meta.url), 'utf8')
  const css = readFileSync(new URL('../index.css', import.meta.url), 'utf8')

  assert.match(nav, /IntersectionObserver/)
  assert.match(nav, /aria-current/)
  assert.match(css, /\.nav-link\.is-active/)
})

test('导航回到 Hero 顶部时清除内容章节高亮', () => {
  const nav = readFileSync(new URL('../components/Nav.jsx', import.meta.url), 'utf8')

  assert.match(nav, /\['top', \.\.\.NAV_ITEMS\.map/)
  assert.match(nav, /next === 'top' \? '' : next \|\| ''/)
})

test('顶部导航点击以章节标题为目标并避开固定导航', () => {
  const nav = readFileSync(new URL('../components/Nav.jsx', import.meta.url), 'utf8')

  assert.match(nav, /import \{ navigateToSection \} from '\.\.\/lib\/sectionNavigation'/)
  assert.doesNotMatch(nav, /const jumpToSection = \(event, id\) => \{/)
  assert.match(nav, /onClick=\{\(event\) => navigateToSection\(event, id\)\}/)
})

test('顶部品牌显示 Kiwi 与吴奇伟，并通过 top 锚点回到页面顶部', () => {
  const nav = readFileSync(new URL('../components/Nav.jsx', import.meta.url), 'utf8')

  assert.match(nav, /<a className="brand" href="#top"/)
  assert.match(nav, /<span className="brand-name">Kiwi<\/span>/)
  assert.match(nav, /<span className="brand-role">\s*｜ 吴奇伟<\/span>/)
  assert.doesNotMatch(nav, /profile\.latin\.toUpperCase\(\)|profile\.role/)
})

test('下载简历按钮使用清晰的下载图标并保留原文件下载属性', () => {
  const nav = readFileSync(new URL('../components/Nav.jsx', import.meta.url), 'utf8')
  const css = readFileSync(new URL('../index.css', import.meta.url), 'utf8')

  assert.match(nav, /import \{[^}]*DownloadSimple[^}]*\} from '@phosphor-icons\/react'/)
  assert.match(nav, /下载简历\s*<DownloadSimple className="nav-resume-icon" weight="regular" aria-hidden="true" focusable="false" \/>/)
  assert.match(nav, /download="Kiwi-Wu-Resume\.pdf"/)
  assert.doesNotMatch(nav, /下载简历 ↓/)
  assert.match(css, /\.nav-resume-icon\s*{[\s\S]*?width:\s*1rem[\s\S]*?height:\s*1rem[\s\S]*?flex:\s*0 0 auto;/)
})

test('页面不渲染右侧滚动轨道', () => {
  const app = readFileSync(new URL('../App.jsx', import.meta.url), 'utf8')
  const css = readFileSync(new URL('../index.css', import.meta.url), 'utf8')

  assert.doesNotMatch(app, /ScrollRail/)
  assert.doesNotMatch(app, /SHOW_SCROLL_RAIL/)
  assert.doesNotMatch(css, /\.scroll-rail/)
})

test('保留页面滚动但隐藏浏览器原生滚动条', () => {
  const css = readFileSync(new URL('../index.css', import.meta.url), 'utf8')

  assert.match(css, /html\s*{[^}]*scrollbar-width:\s*none/s)
  assert.match(css, /html::-webkit-scrollbar\s*{[^}]*display:\s*none/s)
})

test('章节标题不显示编号英文眉标签', () => {
  const componentFiles = [
    '../components/Experience.jsx',
    '../components/Projects.jsx',
    '../components/About.jsx',
    '../components/Contact.jsx',
  ]

  componentFiles.forEach((file) => {
    const source = readFileSync(new URL(file, import.meta.url), 'utf8')
    assert.doesNotMatch(source, /<p className="sec-label"[^>]*>\s*\d{2}\s*\//)
  })
})

test('页面不渲染个人优势章节或对应章节导航', () => {
  const app = readFileSync(new URL('../App.jsx', import.meta.url), 'utf8')
  const css = readFileSync(new URL('../index.css', import.meta.url), 'utf8')

  assert.doesNotMatch(app, /Strengths/)
  assert.doesNotMatch(app, /<Strengths\s*\/>/)
  assert.doesNotMatch(css, /\.str-grid|\.str-card|\.str-title|\.str-list/)
})

test('关于我不显示额外的自我介绍文案', () => {
  const source = readFileSync(new URL('../components/About.jsx', import.meta.url), 'utf8')

  assert.doesNotMatch(source, /我是 Kiwi，一名 AI Agent 工程师/)
  assert.doesNotMatch(source, /喜欢把复杂问题拆成/)
})

test('主导航按中文章节标签排列并连接到对应章节', () => {
  const nav = readFileSync(new URL('../components/Nav.jsx', import.meta.url), 'utf8')
  const items = [...nav.matchAll(/\{ id: '([^']+)', label: '([^']+)' \}/g)]
    .map(([, id, label]) => ({ id, label }))

  assert.deepEqual(items, [
    { id: 'education', label: '教育经历' },
    { id: 'experience', label: '实习经历' },
    { id: 'work', label: '项目经历' },
    { id: 'contact', label: '与我联系' },
  ])
})

test('主导航使用指定的章节图标并保持统一规格', () => {
  const nav = readFileSync(new URL('../components/Nav.jsx', import.meta.url), 'utf8')
  const css = readFileSync(new URL('../index.css', import.meta.url), 'utf8')

  assert.match(nav, /import \{[^}]*GraduationCap[^}]*Briefcase\s+as\s+BriefcaseSimple[^}]*GitBranch[^}]*At[^}]*\} from '@phosphor-icons\/react'/s)
  assert.match(nav, /const NAV_ICONS = \{[\s\S]*education: GraduationCap,[\s\S]*experience: BriefcaseSimple,[\s\S]*work: GitBranch,[\s\S]*contact: At,[\s\S]*\}/)
  assert.match(nav, /const Icon = NAV_ICONS\[id\]/)
  assert.match(nav, /<Icon className="nav-link-icon" size=\{16\} weight="regular" aria-hidden="true" focusable="false" \/>/)
  assert.match(css, /\.nav-link-icon\s*\{[^}]*width:\s*0\.95rem[^}]*height:\s*0\.95rem[^}]*flex:\s*0 0 auto;/)
})

test('教育经历紧跟 Hero 并使用 education 锚点', () => {
  const app = readFileSync(new URL('../App.jsx', import.meta.url), 'utf8')
  const about = readFileSync(new URL('../components/About.jsx', import.meta.url), 'utf8')
  const sectionOrder = ['<Hero />', '<About />', '<Experience />', '<Projects />']
    .map((component) => app.indexOf(component))

  assert.ok(sectionOrder.every((position) => position >= 0))
  assert.deepEqual([...sectionOrder].sort((a, b) => a - b), sectionOrder)
  assert.match(about, /<section[^>]*id="education"[^>]*data-snap-page="education"/)
  assert.match(about, /<h2 className="sec-title">[\s\S]*教育经历[\s\S]*<\/h2>/)
  assert.doesNotMatch(about, /id="about"|data-snap-page="about"/)
})
