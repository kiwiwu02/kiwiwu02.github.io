import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { profile } from '../data.js'

test('Hero 使用指定的自我介绍文案', () => {
  const hero = readFileSync(new URL('../components/Hero.jsx', import.meta.url), 'utf8')

  assert.equal(profile.heroHeadline, 'Hi，我是 Kiwi，一名 AI Agent 工程师')
  assert.equal(profile.heroIntro, '喜欢把复杂问题拆成可运行、可观察、可评估的工程系统')
  assert.equal(profile.heroFocus, '专注 LLM、Agent、RAG 与 Evaluation 的工程产品落地')
  assert.match(hero, /profile\.heroHeadline/)
  assert.match(hero, /profile\.heroIntro/)
  assert.match(hero, /profile\.heroFocus/)
  assert.match(hero, /<br\s*\/>/)
})

test('Hero 顶部技术标签包含 Python', () => {
  const hero = readFileSync(new URL('../components/Hero.jsx', import.meta.url), 'utf8')

  assert.equal(profile.stack.at(-1), 'Python')
  assert.match(hero, /profile\.stack\.map/)
})

test('Hero 主标题保持单行显示', () => {
  const css = readFileSync(new URL('../index.css', import.meta.url), 'utf8')
  const headlineRule = css.match(/\.hero-sub strong\s*\{([^}]*)\}/)?.[1] ?? ''

  assert.match(headlineRule, /white-space:\s*nowrap/)
})

test('Hero 介绍正文可以延伸到右侧间隔', () => {
  const css = readFileSync(new URL('../index.css', import.meta.url), 'utf8')
  const heroRule = css.match(/\.hero-sub\s*\{([^}]*)\}/)?.[1] ?? ''

  assert.match(heroRule, /width:\s*calc\(100%\s*\+\s*clamp\(3rem,\s*8vw,\s*9rem\)\)/)
  assert.doesNotMatch(heroRule, /max-width:\s*56ch/)
})

test('顶部宠物在现有 Hero 列中向左留出轻微偏移', () => {
  const css = readFileSync(new URL('../index.css', import.meta.url), 'utf8')
  const visualRule = css.match(/\.hero-visual\s*{([^}]*)}/)?.[1] ?? ''

  assert.match(visualRule, /transform:\s*translateX\(-8rem\)/)
})

test('Hero 宠物不再使用背后的圆圈容器', () => {
  const hero = readFileSync(new URL('../components/Hero.jsx', import.meta.url), 'utf8')
  const css = readFileSync(new URL('../index.css', import.meta.url), 'utf8')

  assert.doesNotMatch(hero, /hero-pet-ring/)
  assert.doesNotMatch(css, /\.hero-pet-ring\b/)
})

test('Hero 主标题与正文之间保留轻微呼吸感', () => {
  const css = readFileSync(new URL('../index.css', import.meta.url), 'utf8')
  const headlineRule = css.match(/\.hero-sub strong\s*\{([^}]*)\}/)?.[1] ?? ''

  assert.match(headlineRule, /margin-bottom:\s*0\.85rem/)
})

test('Hero 主标题从两侧向中心碰撞后再向外扩散', () => {
  const hero = readFileSync(new URL('../components/Hero.jsx', import.meta.url), 'utf8')
  const css = readFileSync(new URL('../index.css', import.meta.url), 'utf8')
  const waveRule = css.match(/\.hero-headline-wave\s*\{([^}]*)\}/)?.[1] ?? ''
  const inwardRule = css.match(/\.hero-headline-letter::before\s*\{([^}]*)\}/)?.[1] ?? ''
  const outwardRules = [...css.matchAll(/\.hero-headline-letter::after\s*\{([^}]*)\}/g)]
  const outwardRule = outwardRules.map((match) => match[1]).find((rule) => rule.includes('hero-headline-outward')) ?? ''

  assert.match(hero, /const heroHeadlineText = profile\.heroHeadline/)
  assert.match(hero, /const heroHeadlineLetters = Array\.from\(heroHeadlineText\)/)
  assert.match(hero, /className="hero-headline-wave"/)
  assert.match(hero, /heroHeadlineLetters\.map/)
  assert.match(hero, /className="hero-headline-letter"/)
  assert.match(hero, /'--letter-edge-distance': edgeDistance/)
  assert.match(hero, /'--letter-center-distance': centerDistance/)
  assert.match(waveRule, /transition:\s*transform\s+0\.25s\s+var\(--ease\)/)
  assert.match(inwardRule, /animation:\s*hero-headline-inward\s+5\.8s\s+var\(--ease\)\s+infinite/)
  assert.match(inwardRule, /animation-delay:\s*calc\(var\(--letter-edge-distance\)\s*\*\s*0\.2s\)/)
  assert.match(outwardRule, /animation:\s*hero-headline-outward\s+5\.8s\s+var\(--ease\)\s+infinite/)
  assert.match(outwardRule, /animation-delay:\s*calc\(2\.65s\s*\+\s*var\(--letter-center-distance\)\s*\*\s*0\.2s\)/)
  assert.match(css, /@keyframes hero-headline-inward\s*\{[\s\S]*?opacity:\s*0\.78/)
  assert.match(css, /@keyframes hero-headline-outward\s*\{[\s\S]*?opacity:\s*0\.78/)
  assert.match(css, /\.hero-headline-wave:hover,\s*\.hero-headline-wave:focus-visible\s*\{[^}]*transform:\s*translateY\(-2px\)\s*scale\(1\.025\)/)
  assert.doesNotMatch(css, /\.hero-headline-wave:hover[\s\S]{0,500}animation-play-state:\s*paused/)
  assert.match(css, /@media \(prefers-reduced-motion: reduce\) \{[\s\S]*?\.hero-headline-letter::before,\s*\.hero-headline-letter::after\s*\{[^}]*animation:\s*none/)
})

test('Hero 逐字视觉层不会让辅助技术重复读出标题', () => {
  const hero = readFileSync(new URL('../components/Hero.jsx', import.meta.url), 'utf8')
  const css = readFileSync(new URL('../index.css', import.meta.url), 'utf8')

  assert.match(hero, /className="hero-headline-accessible">\{heroHeadlineText\}<\/span>/)
  assert.match(hero, /className="hero-headline-letter"\s+aria-hidden="true"/)
  assert.match(css, /\.hero-headline-accessible\s*\{[\s\S]*?position:\s*absolute[\s\S]*?width:\s*1px[\s\S]*?height:\s*1px/)
})

test('Hero 三个 CTA 复用顶部导航的章节定位，并配有对应图标', () => {
  const hero = readFileSync(new URL('../components/Hero.jsx', import.meta.url), 'utf8')
  const css = readFileSync(new URL('../index.css', import.meta.url), 'utf8')

  assert.match(hero, /import \{ Briefcase, FolderSimple, GraduationCap \} from '@phosphor-icons\/react'/)
  assert.match(hero, /import \{ navigateToSection \} from '\.\.\/lib\/sectionNavigation'/)
  assert.ok(hero.includes('href="#education"'))
  assert.ok(hero.includes('href="#experience"'))
  assert.ok(hero.includes('href="#work"'))
  assert.ok(hero.includes('Education'))
  assert.ok(hero.includes('Experience'))
  assert.ok(hero.includes('Project'))
  assert.doesNotMatch(hero, /href="#contact"/)
  assert.doesNotMatch(hero, />Contact<\/a>/)
  assert.match(hero, /<a className="btn btn-ghost" href="#education"[^>]*>/)
  assert.doesNotMatch(hero, /<a className="btn btn-primary" href="#education">/)
  assert.match(hero, /onClick=\{\(event\) => navigateToSection\(event, 'education'\)\}/)
  assert.match(hero, /onClick=\{\(event\) => navigateToSection\(event, 'experience'\)\}/)
  assert.match(hero, /onClick=\{\(event\) => navigateToSection\(event, 'work'\)\}/)
  assert.match(hero, /<GraduationCap className="hero-section-icon" weight="regular" aria-hidden="true" focusable="false" \/>/)
  assert.match(hero, /<Briefcase className="hero-section-icon" weight="regular" aria-hidden="true" focusable="false" \/>/)
  assert.match(hero, /<FolderSimple className="hero-section-icon" weight="regular" aria-hidden="true" focusable="false" \/>/)
  assert.match(css, /\.hero-section-icon\s*\{[^}]*width:\s*1\.05rem[^}]*height:\s*1\.05rem/)
})

test('窄屏 Hero 保持单屏边界，并让导航和文案在容器内收缩', () => {
  const css = readFileSync(new URL('../index.css', import.meta.url), 'utf8')
  const mobile = css.match(/@media \(max-width: 900px\) \{([\s\S]*?)\n\}/)?.[1] ?? ''

  assert.match(mobile, /\.hero\s*\{[^}]*min-height:\s*100svh/)
  assert.match(mobile, /\.hero-sub\s*\{[^}]*width:\s*100%[^}]*max-width:\s*100%/)
  assert.match(mobile, /\.hero-sub strong\s*\{[^}]*white-space:\s*normal/)
  assert.match(mobile, /\.hero-headline-wave\s*\{[^}]*display:\s*inline/)
  assert.match(mobile, /\.nav-inner\s*\{[^}]*width:\s*calc\(100%\s*-\s*2rem\)/)
  assert.match(mobile, /\.nav-links \.btn-sm\s*\{[^}]*padding[^}]*0\.8rem/)
})
