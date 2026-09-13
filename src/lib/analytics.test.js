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
