import test from 'node:test'
import assert from 'node:assert/strict'
import { getSectionScrollTop, navigateToSection } from './sectionNavigation.js'

test('章节标题定位到固定导航下方的阅读线', () => {
  assert.equal(getSectionScrollTop({
    targetTop: 842,
    scrollY: 420,
    navHeight: 78,
    anchorGap: 16,
  }), 1168)
})

test('章节标题定位不会超出页面滚动边界', () => {
  assert.equal(getSectionScrollTop({
    targetTop: 20,
    scrollY: 0,
    navHeight: 78,
    anchorGap: 16,
  }), 0)

  assert.equal(getSectionScrollTop({
    targetTop: 842,
    scrollY: 420,
    navHeight: 78,
    anchorGap: 16,
    maxScrollTop: 900,
  }), 900)
})

test('共享章节导航将标题定位到固定导航下方并支持平滑滚动', () => {
  const scrollCalls = []
  const historyCalls = []
  const title = { getBoundingClientRect: () => ({ top: 842 }) }
  const section = {
    querySelector: (selector) => selector === '.sec-title, .contact-title' ? title : null,
  }
  const documentRef = {
    documentElement: { scrollHeight: 2000 },
    getElementById: (id) => id === 'experience' ? section : null,
    querySelector: (selector) => selector === '.nav'
      ? { getBoundingClientRect: () => ({ height: 78 }) }
      : null,
  }
  const windowRef = {
    innerHeight: 700,
    scrollY: 420,
    getComputedStyle: () => ({ fontSize: '16px' }),
    history: { pushState: (...args) => historyCalls.push(args) },
    matchMedia: () => ({ matches: false }),
    scrollTo: (options) => scrollCalls.push(options),
  }
  const event = {
    altKey: false,
    ctrlKey: false,
    metaKey: false,
    shiftKey: false,
    preventDefault: () => {},
  }

  navigateToSection(event, 'experience', { documentRef, windowRef })

  assert.deepEqual(historyCalls, [[null, '', '#experience']])
  assert.deepEqual(scrollCalls, [{ top: 1168, behavior: 'smooth' }])
})
