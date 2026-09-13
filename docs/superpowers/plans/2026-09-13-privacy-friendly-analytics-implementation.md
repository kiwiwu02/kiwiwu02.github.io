# 个人主页访问统计接入 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为现有 React + Vite + GitHub Pages 个人主页接入 Umami Cloud，记录匿名访客的访问时间、城市级位置、设备环境、访问内容和来源，并记录关键页面行为。

**Architecture:** 在前端新增一个可禁用、可测试的 analytics 模块，动态加载 Umami tracker；Umami Cloud 负责会话、地理位置和报表，网站只发送公开 Website ID，不暴露管理 API key。单页各区块通过 `IntersectionObserver` 发送一次 `section_view`，简历、项目和联系方式通过固定白名单事件记录；统计服务不可用时页面完全降级为当前行为。

**Tech Stack:** React 18、Vite 5、原生 JavaScript、Node `node:test`、GitHub Actions、Umami Cloud。

**Spec:** `docs/superpowers/specs/2026-09-13-privacy-friendly-analytics-design.md`

## Global Constraints

- 只记录匿名访客会话，不保存原始 IP、姓名、邮箱、手机号、留言或其他直接身份信息。
- 位置只使用 Umami 提供的国家、地区和城市级粗略推断，不采集 GPS、精确坐标、街道或门牌。
- 事件参数只能来自固定白名单，不能把邮箱地址、电话号码、链接中的查询值或用户输入传给 Umami。
- 未配置 Umami、脚本加载失败、被拦截或 `IntersectionObserver` 不可用时，页面必须继续正常渲染和交互。
- Website ID 和 tracker URL 是公开前端配置；Umami API key、管理员凭据和导出凭据不得进入源码、构建产物或前端环境变量。
- 每个新增生产函数必须先有一个会失败的行为测试，再写最小实现；每个任务完成后运行该任务的测试和必要构建。
- 保持当前 GitHub Pages 发布路径，不新增公开访客列表、后台 API 或管理路由。

## 文件结构与职责

- Create: `src/lib/analytics.js` — 环境配置、事件白名单、Umami script 生命周期、事件队列和区块观察。
- Create: `src/lib/analytics.test.js` — analytics 纯函数、脚本去重、事件队列、区块观察和接线契约测试。
- Modify: `src/main.jsx` — 在 React 根节点创建前初始化 Umami tracker。
- Modify: `src/App.jsx` — 在页面 DOM 挂载后启动区块浏览观察。
- Modify: `src/components/Hero.jsx`、`src/components/MobileHero.jsx`、`src/components/About.jsx`、`src/components/Experience.jsx`、`src/components/Projects.jsx`、`src/components/Contact.jsx` — 标记页面区块。
- Modify: `src/components/Nav.jsx`、`src/components/Projects.jsx`、`src/components/Contact.jsx` — 接入简历、项目和联系方式事件。
- Create: `.env.example` — 本地配置模板，不包含真实 Website ID。
- Modify: `.github/workflows/deploy-pages.yml` — 将 GitHub Repository Variables 注入 Vite 生产构建。
- Modify: `README.md` — 记录 Umami 创建、变量配置、事件范围和验证方法。

## Task 1: 建立统计配置与安全事件契约

**Files:**
- Create: `src/lib/analytics.test.js`
- Create: `src/lib/analytics.js`

**Interfaces:**
- Produces `resolveAnalyticsConfig(env = {})`: 返回 `{ websiteId, scriptUrl }` 或 `null`；`websiteId` 必须为非空字符串，`scriptUrl` 必须是 `https:` URL，空 tracker URL 使用默认值 `https://cloud.umami.is/script.js`。
- Produces `sanitizeAnalyticsEvent(name, properties = {})`: 返回 `{ name, properties }` 或 `null`；只接受 `section_view`、`resume_download`、`project_click`、`contact_click` 四个事件，并只保留固定参数。
- 事件白名单为：`section_view.section` 只能是 `hero`、`education`、`experience`、`work`、`contact`；`project_click.project` 为固定项目标题或 `all-projects`，`project_click.linkType` 只能是 `github` 或 `web`；`contact_click.channel` 只能是 `email`、`phone` 或 `github`；`resume_download` 不带参数。

- [ ] **Step 1: Write the failing tests**

在 `src/lib/analytics.test.js` 中先写下面的契约测试。测试直接导入尚不存在的模块接口，失败原因应是 analytics 功能尚未实现；修正任何路径或语法问题后再进入实现。

```js
import test from 'node:test'
import assert from 'node:assert/strict'
import { resolveAnalyticsConfig, sanitizeAnalyticsEvent } from './analytics.js'

test('缺少 Website ID 时禁用统计', () => {
  assert.equal(resolveAnalyticsConfig({}), null)
  assert.equal(resolveAnalyticsConfig({ VITE_UMAMI_WEBSITE_ID: '   ' }), null)
})

test('解析并清理 Umami 配置', () => {
  assert.deepEqual(resolveAnalyticsConfig({
    VITE_UMAMI_WEBSITE_ID: '  website-123  ',
    VITE_UMAMI_SCRIPT_URL: 'https://analytics.example/script.js',
  }), {
    websiteId: 'website-123',
    scriptUrl: 'https://analytics.example/script.js',
  })
})

test('拒绝非 HTTPS tracker 地址', () => {
  assert.equal(resolveAnalyticsConfig({
    VITE_UMAMI_WEBSITE_ID: 'website-123',
    VITE_UMAMI_SCRIPT_URL: 'javascript:alert(1)',
  }), null)
})

test('只保留 section_view 的固定区块参数', () => {
  assert.deepEqual(sanitizeAnalyticsEvent('section_view', {
    section: 'work',
    email: 'visitor@example.com',
    arbitrary: 'free text',
  }), {
    name: 'section_view',
    properties: { section: 'work' },
  })
})

test('拒绝未知事件和未知项目链接类型', () => {
  assert.equal(sanitizeAnalyticsEvent('visitor_identity', { email: 'visitor@example.com' }), null)
  assert.equal(sanitizeAnalyticsEvent('project_click', { project: 'Cairn', linkType: 'email' }), null)
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test src/lib/analytics.test.js`

Expected: FAIL because `src/lib/analytics.js` and its exported behavior do not exist yet. If the test fails due to a typo rather than the missing feature, fix the test before writing production code.

- [ ] **Step 3: Write the minimal implementation**

在 `src/lib/analytics.js` 中实现配置与事件契约，不加载脚本，不访问 DOM：

```js
export const DEFAULT_UMAMI_SCRIPT_URL = 'https://cloud.umami.is/script.js'

const EVENT_NAMES = new Set(['section_view', 'resume_download', 'project_click', 'contact_click'])
const SECTION_NAMES = new Set(['hero', 'education', 'experience', 'work', 'contact'])
const LINK_TYPES = new Set(['github', 'web'])
const CONTACT_CHANNELS = new Set(['email', 'phone', 'github'])

export function resolveAnalyticsConfig(env = {}) {
  const websiteId = String(env.VITE_UMAMI_WEBSITE_ID ?? '').trim()
  const scriptUrl = String(env.VITE_UMAMI_SCRIPT_URL ?? '').trim() || DEFAULT_UMAMI_SCRIPT_URL
  if (!websiteId) return null

  try {
    if (new URL(scriptUrl).protocol !== 'https:') return null
  } catch {
    return null
  }

  return { websiteId, scriptUrl }
}

export function sanitizeAnalyticsEvent(name, properties = {}) {
  if (!EVENT_NAMES.has(name)) return null
  if (name === 'resume_download') return { name, properties: {} }
  if (name === 'section_view' && SECTION_NAMES.has(properties.section)) {
    return { name, properties: { section: properties.section } }
  }
  if (name === 'project_click' && LINK_TYPES.has(properties.linkType)
      && typeof properties.project === 'string' && properties.project.length <= 80) {
    return {
      name,
      properties: { project: properties.project, linkType: properties.linkType },
    }
  }
  if (name === 'contact_click' && CONTACT_CHANNELS.has(properties.channel)) {
    return { name, properties: { channel: properties.channel } }
  }
  return null
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node --test src/lib/analytics.test.js`

Expected: PASS for all configuration and event-contract tests.

- [ ] **Step 5: Commit the isolated deliverable**

```bash
git add src/lib/analytics.js src/lib/analytics.test.js
git commit -m "feat: add privacy-safe analytics contract"
```

## Task 2: 实现 tracker 初始化、事件队列与区块观察

**Files:**
- Modify: `src/lib/analytics.js`
- Modify: `src/lib/analytics.test.js`

**Interfaces consumed:** `resolveAnalyticsConfig`、`sanitizeAnalyticsEvent` from Task 1。

**Interfaces produced:**
- `createAnalytics({ env = {}, documentRef, windowRef, Observer })`: 返回 `{ init, track, observeSections }`。
- `init()`: 配置有效时最多向 `documentRef.head` 插入一个 `script[data-kiwi-umami]`，无配置时返回 `false` 且不触碰 DOM。
- `track(name, properties)`: 通过 `windowRef.umami.track(name, properties)` 发送已清理事件；tracker 尚未加载时只在内存队列中等待，失败时不写入 localStorage、不重试。
- `observeSections()`: 观察 `[data-analytics-section]`，每个固定区块首次进入视口时发送一次 `section_view`，返回清理函数。
- Default singleton wrappers `initAnalytics`、`trackAnalyticsEvent`、`observeAnalyticsSections`：供 React 入口和组件调用。

- [ ] **Step 1: Write the failing tests**

在现有 `src/lib/analytics.test.js` 追加 fake DOM、fake observer 和行为测试：

```js
import { createAnalytics } from './analytics.js'

test('配置有效时只插入一次 Umami script，并在加载后发送队列事件', () => {
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

test('统计未配置时是无副作用 no-op', () => {
  const analytics = createAnalytics({ env: {}, documentRef: undefined, windowRef: undefined })
  assert.equal(analytics.init(), false)
  assert.equal(analytics.track('resume_download'), false)
  assert.equal(typeof analytics.observeSections(), 'function')
})

test('每个区块只记录一次 section_view，并能清理 observer', () => {
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
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test src/lib/analytics.test.js`

Expected: FAIL because `createAnalytics` and the singleton wrappers do not exist yet.

- [ ] **Step 3: Write the minimal implementation**

在 `src/lib/analytics.js` 追加 `createAnalytics`。实现要点：

- `init` 使用 `script.dataset.kiwiUmami = 'true'`、`script.src = config.scriptUrl`、`script.defer = true` 和 `script.dataset.websiteId = config.websiteId`。
- 插入前先用 `querySelector('script[data-kiwi-umami]')` 去重；已有脚本视作已初始化。
- 监听 `load` 后 flush 队列；监听 `error` 后清空队列且不抛出页面错误。
- `track` 先调用 `sanitizeAnalyticsEvent`；tracker 可用时立即发送，否则加入内存队列，无效事件返回 `false`。
- `observeSections` 没有 `Observer` 或没有区块时返回空清理函数；通过 `Set` 保证每个 `dataset.analyticsSection` 只发送一次，阈值使用 `0.45`，回调通过同一实例的 `track` 方法发送事件以便统一降级和测试。
- 模块底部创建一次 default singleton，并导出三个 wrapper；所有默认引用都通过 `globalThis.document`、`globalThis.window` 和 `globalThis.IntersectionObserver` 延迟读取，Node 测试环境不能报错。

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node --test src/lib/analytics.test.js`

Expected: PASS for configuration, sanitization, script deduplication, event queue, no-op fallback, and section observation.

- [ ] **Step 5: Commit the isolated deliverable**

```bash
git add src/lib/analytics.js src/lib/analytics.test.js
git commit -m "feat: load Umami safely and track sections"
```

## Task 3: 接入页面区块浏览统计

**Files:**
- Modify: `src/main.jsx`
- Modify: `src/App.jsx`
- Modify: `src/components/Hero.jsx`
- Modify: `src/components/MobileHero.jsx`
- Modify: `src/components/About.jsx`
- Modify: `src/components/Experience.jsx`
- Modify: `src/components/Projects.jsx`
- Modify: `src/components/Contact.jsx`
- Modify: `src/lib/analytics.test.js`

**Interfaces consumed:** `initAnalytics`、`observeAnalyticsSections` from Task 2。

- [ ] **Step 1: Write the failing wiring test**

在 `src/lib/analytics.test.js` 追加源码契约测试，确保六个渲染入口都标记了 analytics 区块，并确保入口调用初始化和观察函数：

```js
import { readFileSync } from 'node:fs'

const read = (path) => readFileSync(new URL('../../' + path, import.meta.url), 'utf8')

test('所有公开页面区块和 React 入口都接入 analytics', () => {
  for (const path of [
    'src/components/Hero.jsx',
    'src/components/MobileHero.jsx',
    'src/components/About.jsx',
    'src/components/Experience.jsx',
    'src/components/Projects.jsx',
    'src/components/Contact.jsx',
  ]) {
    assert.match(read(path), /data-analytics-section=/)
  }
  assert.match(read('src/main.jsx'), /initAnalytics\(\)/)
  assert.match(read('src/App.jsx'), /observeAnalyticsSections/)
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test src/lib/analytics.test.js`

Expected: FAIL because the existing components and entry files have no analytics markers or calls.

- [ ] **Step 3: Write the minimal wiring**

- In `src/main.jsx`, import `initAnalytics` and call it once immediately before `ReactDOM.createRoot(...)`。
- In `src/App.jsx`, import `useEffect` and `observeAnalyticsSections`; add a mount-only effect returning `observeAnalyticsSections()` cleanup。
- Add fixed `data-analytics-section` values to the existing `<section>` elements: `hero` in both Hero variants, `education` in About, `experience` in Experience, `work` in Projects, and `contact` in Contact。
- Do not derive analytics names from visible text, route query strings, or user input.

- [ ] **Step 4: Run the test to verify it passes**

Run: `node --test src/lib/analytics.test.js`

Expected: PASS, including the new source contract test.

- [ ] **Step 5: Run the static build**

Run: `npm run build:static`

Expected: Vite exits with code 0 and produces `dist/` without requiring Umami variables.

- [ ] **Step 6: Commit the isolated deliverable**

```bash
git add src/main.jsx src/App.jsx src/components/Hero.jsx src/components/MobileHero.jsx src/components/About.jsx src/components/Experience.jsx src/components/Projects.jsx src/components/Contact.jsx src/lib/analytics.test.js
git commit -m "feat: track portfolio section views"
```

## Task 4: 接入简历、项目和联系方式事件

**Files:**
- Modify: `src/components/Nav.jsx`
- Modify: `src/components/Projects.jsx`
- Modify: `src/components/Contact.jsx`
- Modify: `src/lib/analytics.test.js`

**Interfaces consumed:** `trackAnalyticsEvent` 和 `sanitizeAnalyticsEvent` from Task 2。

- [ ] **Step 1: Write the failing wiring tests**

追加下面的静态接线测试，防止事件漏接或误把联系方式值传入参数：

```js
test('关键交互使用固定 analytics 事件名', () => {
  const nav = read('src/components/Nav.jsx')
  const projects = read('src/components/Projects.jsx')
  const contact = read('src/components/Contact.jsx')

  assert.match(nav, /trackAnalyticsEvent\('resume_download'/)
  assert.match(projects, /trackAnalyticsEvent\('project_click'/)
  assert.match(contact, /trackAnalyticsEvent\('contact_click'/)
  assert.doesNotMatch(contact, /trackAnalyticsEvent\([^\n]*(email\.v|phone\.v|value)/)
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test src/lib/analytics.test.js`

Expected: FAIL because the three components currently没有调用 analytics 事件函数。

- [ ] **Step 3: Write the minimal wiring**

- `Nav.jsx`: import `trackAnalyticsEvent`; on the existing resume download anchor call `trackAnalyticsEvent('resume_download')` without传入 `resumeHref`。
- `Projects.jsx`: import `trackAnalyticsEvent`; pass the fixed project title and link type into `ProjectLinkIcon`; on each single-link project row and each independent link icon call `trackAnalyticsEvent('project_click', { project: project.title, linkType: link.type })`; on “查看全部” use `{ project: 'all-projects', linkType: 'github' }`。
- `Contact.jsx`: import `trackAnalyticsEvent`; on email/phone copy actions and the phone link call `contact_click` with only `{ channel: 'email' }` or `{ channel: 'phone' }`; on the GitHub contact link and footer GitHub link use `{ channel: 'github' }`。微信复制和哔哩哔哩链接不发送事件，因为本次已批准的参数白名单不包含它们。
- Trigger contact events on user action, but never include `profile.contacts` values, `aria-label` strings, URL query strings, or copied text in event data.

- [ ] **Step 4: Run the test to verify it passes**

Run: `node --test src/lib/analytics.test.js`

Expected: PASS, with event names and no-PII wiring covered.

- [ ] **Step 5: Run the complete existing test suite**

Run: `npm test`

Expected: all existing tests and analytics tests pass with zero failures.

- [ ] **Step 6: Commit the isolated deliverable**

```bash
git add src/components/Nav.jsx src/components/Projects.jsx src/components/Contact.jsx src/lib/analytics.test.js
git commit -m "feat: track portfolio actions"
```

## Task 5: 配置 GitHub Pages 生产构建与使用说明

**Files:**
- Create: `.env.example`
- Modify: `.github/workflows/deploy-pages.yml`
- Modify: `README.md`
- Modify: `src/lib/analytics.test.js`

**Interfaces consumed:** `resolveAnalyticsConfig` 的 `VITE_UMAMI_WEBSITE_ID` 与可选 `VITE_UMAMI_SCRIPT_URL`。

- [ ] **Step 1: Write the failing configuration tests**

追加配置契约测试：

```js
test('仓库提供 Umami 配置模板、工作流注入变量且 README 有配置说明', () => {
  const envExample = read('.env.example')
  const workflow = read('.github/workflows/deploy-pages.yml')
  const readme = read('README.md')

  assert.match(envExample, /VITE_UMAMI_WEBSITE_ID=/)
  assert.match(envExample, /VITE_UMAMI_SCRIPT_URL=https:\/\/cloud\.umami\.is\/script\.js/)
  assert.match(workflow, /VITE_UMAMI_WEBSITE_ID:/)
  assert.match(workflow, /vars\.UMAMI_WEBSITE_ID/)
  assert.match(workflow, /VITE_UMAMI_SCRIPT_URL:/)
  assert.match(workflow, /vars\.UMAMI_SCRIPT_URL/)
  assert.match(readme, /Umami/)
  assert.match(readme, /UMAMI_WEBSITE_ID/)
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test src/lib/analytics.test.js`

Expected: FAIL because the environment template, workflow variables and README instructions do not exist yet。

- [ ] **Step 3: Write the minimal configuration and documentation**

Create `.env.example`:

```dotenv
VITE_UMAMI_WEBSITE_ID=
VITE_UMAMI_SCRIPT_URL=https://cloud.umami.is/script.js
```

In the `Build static site` step of `.github/workflows/deploy-pages.yml`, add:

```yaml
        env:
          VITE_UMAMI_WEBSITE_ID: ${{ vars.UMAMI_WEBSITE_ID }}
          VITE_UMAMI_SCRIPT_URL: ${{ vars.UMAMI_SCRIPT_URL }}
        run: npm run build:static
```

Keep the existing `npm test` step before build. Do not use `secrets` for the public Website ID, and do not add any Umami API key. If `UMAMI_SCRIPT_URL` is unset, the code uses the official default URL.

Add a `### Umami 访问统计` section to `README.md` that explains:

1. 在 Umami Cloud 创建 Website，复制 Website ID；
2. 在 GitHub repository `Settings → Secrets and variables → Actions → Variables` 创建 `UMAMI_WEBSITE_ID`，可选创建 `UMAMI_SCRIPT_URL`；
3. 推送到 `main` 后等待 Pages workflow，登录 Umami Dashboard 查看 Sessions、位置、设备、来源和 Events；
4. Umami 看到的是匿名访客会话和城市级粗略位置，不是姓名、精确地址或原始 IP；
5. 本地没有配置时页面照常运行，只是不发送统计。

- [ ] **Step 4: Run the test to verify it passes**

Run: `node --test src/lib/analytics.test.js`

Expected: PASS for environment template, workflow injection, and documentation checks.

- [ ] **Step 5: Run both build modes**

Run: `npm run build`

Run: `npm run build:static`

Expected: both commands exit 0 with no Umami configuration required.

- [ ] **Step 6: Commit the isolated deliverable**

```bash
git add .env.example .github/workflows/deploy-pages.yml README.md src/lib/analytics.test.js
git commit -m "docs: configure Umami for Pages deployment"
```

## Task 6: 最终验证与交付检查

**Files:**
- Review only: `src/lib/analytics.js`、`src/lib/analytics.test.js`、`.github/workflows/deploy-pages.yml`、`.env.example`、`README.md`、`dist/`。

- [ ] **Step 1: Run the complete test suite**

Run: `npm test`

Expected: exit code 0, all tests pass, no unhandled errors or warnings。

- [ ] **Step 2: Run the production static build**

Run: `npm run build:static`

Expected: exit code 0 and `dist/` is generated for GitHub Pages。

- [ ] **Step 3: Verify disabled mode and public-config boundary**

Run:

```bash
rg -n "UMAMI|api[_-]?key|password|profile\.contacts|email\.v|phone\.v" src .github .env.example README.md
```

Expected: only public Website ID/script configuration names, README setup text, and local contact UI values appear; no API key, password, raw-IP storage code, or personal contact value inside analytics event payloads.

Run:

```bash
rg -n "data-kiwi-umami|data-website-id|cloud\.umami\.is/script\.js" dist
```

Expected: the no-variable build contains no configured Website ID or `data-website-id` value; the default tracker URL may appear in bundled no-op code. A variable-enabled build may contain only the public Website ID and tracker URL.

- [ ] **Step 4: Run a local smoke check**

Run: `npm run dev`

Open the local URL once with no `.env` values and verify the page loads, theme toggle works, section navigation works, project links work, and the contact actions work. Do not use a real Umami account in local smoke testing; use the no-op path or a disposable fake script URL only.

- [ ] **Step 5: Review acceptance criteria**

Confirm each item from the spec:

1. No Umami configuration or failed tracker never blocks the page.
2. Configured Umami receives time, anonymous session, country/region/city, device, browser, OS, screen, and referrer/UTM data.
3. The dashboard receives the five section views and the approved resume/project/contact events.
4. No API key, admin credential, raw IP persistence, or direct identity data is in the frontend.
5. `npm test`、`npm run build`、`npm run build:static` pass.

- [ ] **Step 6: Commit only if final verification changed tracked files**

```bash
git status --short
git diff --check
```

Do not stage unrelated existing `output/` or `.playwright-cli/` files. If verification made no tracked changes, leave the working tree otherwise untouched and report the exact test/build results.
