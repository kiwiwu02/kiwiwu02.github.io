import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createPageSnapController } from './pageSnap.js'

test('滚轮交给浏览器原生滚动，不注册硬切页监听器', () => {
  const listeners = new Map()
  const win = {
    addEventListener(type, handler) {
      listeners.set(type, handler)
    },
    removeEventListener(type) {
      listeners.delete(type)
    },
  }

  const cleanup = createPageSnapController({ win, doc: { querySelectorAll: () => [] } })

  assert.equal(listeners.has('wheel'), false)
  cleanup()
})

test('内容章节不启用 CSS 吸附，避免滚动跳过章节内部内容', () => {
  const css = readFileSync(new URL('../index.css', import.meta.url), 'utf8')
  const experienceBlock = css.match(/\.experience-section\s*{([^}]*)}/)?.[1] ?? ''

  assert.doesNotMatch(css, /scroll-snap-(?:type|align|stop)\s*:/)
  assert.doesNotMatch(experienceBlock, /min-height\s*:/)
})

test('页面底色统一，背景装饰保持在辅助层级', () => {
  const css = readFileSync(new URL('../index.css', import.meta.url), 'utf8')
  const heroVeil = css.match(/\.hero-veil\s*{([\s\S]*?)\n}/)?.[1] ?? ''
  const heroGrid = css.match(/\.hero-grid-lines\s*{([\s\S]*?)\n}/)?.[1] ?? ''
  const contactGlow = css.match(/\.contact-glow\s*{([\s\S]*?)\n}/)?.[1] ?? ''

  assert.match(css, /section\s*{\s*position:\s*relative;\s*background:\s*var\(--bg\);\s*}/)
  assert.doesNotMatch(heroVeil, /radial-gradient/)
  assert.match(heroVeil, /var\(--bg\)\s+100%/)
  assert.match(heroGrid, /rgba\(255,255,255,0\.022\)/)
  assert.match(contactGlow, /rgba\(226,73,47,0\.08\)/)
})

test('Hero 独占首屏，下一章节不会同时露出', () => {
  const css = readFileSync(new URL('../index.css', import.meta.url), 'utf8')
  const hero = css.match(/\.hero\s*{([\s\S]*?)\n}/)?.[1] ?? ''

  assert.match(css, /scroll-padding-top:\s*calc\(var\(--nav-h\)\s*\+\s*1rem\)/)
  assert.match(css, /section\[id\]\s*{[^}]*scroll-margin-top:\s*calc\(var\(--nav-h\)\s*\+\s*1rem\)/s)
  assert.match(hero, /min-height:\s*100svh/)
  assert.doesNotMatch(hero, /min-height:\s*clamp\(/)
})

test('章节进入动效保持轻量，不制造滚动停顿感', () => {
  const css = readFileSync(new URL('../index.css', import.meta.url), 'utf8')
  const reveal = css.match(/\.reveal\s*{([\s\S]*?)\n}/)?.[1] ?? ''

  assert.match(reveal, /translateY\(14px\)/)
  assert.match(reveal, /0\.45s/)
  assert.doesNotMatch(reveal, /0\.85s/)
})
