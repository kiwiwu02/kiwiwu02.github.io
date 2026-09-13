import test from 'node:test'
import assert from 'node:assert/strict'

async function loadAnalytics() {
  try {
    return await import('./analytics.js')
  } catch {
    return {}
  }
}

test('缺少 Website ID 时禁用统计', async () => {
  const { resolveAnalyticsConfig } = await loadAnalytics()
  assert.equal(typeof resolveAnalyticsConfig, 'function')
  assert.equal(resolveAnalyticsConfig({}), null)
  assert.equal(resolveAnalyticsConfig({ VITE_UMAMI_WEBSITE_ID: '   ' }), null)
})

test('解析并清理 Umami 配置', async () => {
  const { resolveAnalyticsConfig } = await loadAnalytics()
  assert.equal(typeof resolveAnalyticsConfig, 'function')
  assert.deepEqual(resolveAnalyticsConfig({
    VITE_UMAMI_WEBSITE_ID: '  website-123  ',
    VITE_UMAMI_SCRIPT_URL: 'https://analytics.example/script.js',
  }), {
    websiteId: 'website-123',
    scriptUrl: 'https://analytics.example/script.js',
  })
})

test('拒绝非 HTTPS tracker 地址', async () => {
  const { resolveAnalyticsConfig } = await loadAnalytics()
  assert.equal(typeof resolveAnalyticsConfig, 'function')
  assert.equal(resolveAnalyticsConfig({
    VITE_UMAMI_WEBSITE_ID: 'website-123',
    VITE_UMAMI_SCRIPT_URL: 'javascript:alert(1)',
  }), null)
})

test('只保留 section_view 的固定区块参数', async () => {
  const { sanitizeAnalyticsEvent } = await loadAnalytics()
  assert.equal(typeof sanitizeAnalyticsEvent, 'function')
  assert.deepEqual(sanitizeAnalyticsEvent('section_view', {
    section: 'work',
    email: 'visitor@example.com',
    arbitrary: 'free text',
  }), {
    name: 'section_view',
    properties: { section: 'work' },
  })
})

test('拒绝未知事件和未知项目链接类型', async () => {
  const { sanitizeAnalyticsEvent } = await loadAnalytics()
  assert.equal(typeof sanitizeAnalyticsEvent, 'function')
  assert.equal(sanitizeAnalyticsEvent('visitor_identity', { email: 'visitor@example.com' }), null)
  assert.equal(sanitizeAnalyticsEvent('project_click', { project: 'Cairn', linkType: 'email' }), null)
})

test('配置有效时只插入一次 Umami script，并在加载后发送队列事件', async () => {
  const { createAnalytics } = await loadAnalytics()
  assert.equal(typeof createAnalytics, 'function')

  const scripts = []
  const listeners = {}
  const documentRef = {
    head: { appendChild(node) { scripts.push(node) } },
    querySelector(selector) {
      return selector === 'script[data-kiwi-umami]' ? scripts[0] ?? null : null
    },
    createElement() {
      return {
        dataset: {},
        addEventListener(type, callback) { listeners[type] = callback },
      }
    },
    querySelectorAll() { return [] },
  }
  const calls = []
  const windowRef = {}
  const analytics = createAnalytics({
    env: { VITE_UMAMI_WEBSITE_ID: 'website-123' },
    documentRef,
    windowRef,
  })

  analytics.track('resume_download')
  assert.equal(analytics.init(), true)
  assert.equal(analytics.init(), true)
  assert.equal(scripts.length, 1)
  windowRef.umami = { track: (...args) => calls.push(args) }
  listeners.load()
  assert.deepEqual(calls, [['resume_download', {}]])
})

test('统计未配置时是无副作用 no-op', async () => {
  const { createAnalytics } = await loadAnalytics()
  assert.equal(typeof createAnalytics, 'function')

  const analytics = createAnalytics({ env: {}, documentRef: undefined, windowRef: undefined })
  assert.equal(analytics.init(), false)
  assert.equal(analytics.track('resume_download'), false)
  assert.equal(typeof analytics.observeSections(), 'function')
})

test('每个区块只记录一次 section_view，并能清理 observer', async () => {
  const { createAnalytics } = await loadAnalytics()
  assert.equal(typeof createAnalytics, 'function')

  const sections = [{ dataset: { analyticsSection: 'hero' } }]
  let observerCallback
  let disconnected = false
  const observed = []
  class FakeObserver {
    constructor(callback) { observerCallback = callback }
    observe(section) { observed.push(section) }
    disconnect() { disconnected = true }
  }
  const calls = []
  const analytics = createAnalytics({
    env: { VITE_UMAMI_WEBSITE_ID: 'website-123' },
    documentRef: {
      querySelector: () => null,
      querySelectorAll: () => sections,
      head: { appendChild() {} },
    },
    windowRef: { umami: { track: (...args) => calls.push(args) } },
    Observer: FakeObserver,
  })

  analytics.track = (name, properties) => calls.push([name, properties])
  const cleanup = analytics.observeSections()
  observerCallback([{ isIntersecting: true, target: sections[0] }])
  observerCallback([{ isIntersecting: true, target: sections[0] }])
  cleanup()

  assert.deepEqual(observed, sections)
  assert.deepEqual(calls, [['section_view', { section: 'hero' }]])
  assert.equal(disconnected, true)
})
