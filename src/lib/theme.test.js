import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  applyTheme,
  getInitialTheme,
  getNextTheme,
  getStoredTheme,
  persistTheme,
  THEMES,
  THEME_STORAGE_KEY,
} from './theme.js'

test('导航提供可访问的主题切换入口并持久化用户选择', () => {
  const navSource = readFileSync(new URL('../components/Nav.jsx', import.meta.url), 'utf8')

  assert.match(navSource, /className="theme-toggle"/)
  assert.match(navSource, /aria-label=/)
  assert.match(navSource, /persistTheme/)
})

test('浅色主题使用暖米白、珊瑚橙和暖黑语义变量', () => {
  const cssSource = readFileSync(new URL('../index.css', import.meta.url), 'utf8')

  assert.match(cssSource, /:root\[data-theme=['"]light['"]\]/)
  assert.match(cssSource, /--bg:\s*#faf9f5/i)
  assert.match(cssSource, /--surface-2:\s*#efe9de/i)
  assert.match(cssSource, /--text:\s*#141413/i)
  assert.match(cssSource, /--accent:\s*#cc785c/i)
})

test('浅色模式为 Hero 主标题动画提供更明亮的强调色', () => {
  const cssSource = readFileSync(new URL('../index.css', import.meta.url), 'utf8')

  assert.match(cssSource, /:root\[data-theme=['"]light['"]\][\s\S]*--hero-headline-accent:\s*#e89272/i)
  assert.match(cssSource, /\.hero-headline-letter::before,\s*\.hero-headline-letter::after[\s\S]*color:\s*var\(--hero-headline-accent\)/)
})

test('主题只接受有效的持久化值，且默认保持深色', () => {
  const values = new Map([[THEME_STORAGE_KEY, 'sepia']])
  const storage = {
    getItem(key) { return values.get(key) ?? null },
    setItem(key, value) { values.set(key, value) },
  }

  assert.equal(getStoredTheme(storage), null)
  assert.equal(getInitialTheme(storage), THEMES.DARK)
  assert.equal(getNextTheme(THEMES.DARK), THEMES.LIGHT)
  assert.equal(getNextTheme(THEMES.LIGHT), THEMES.DARK)

  persistTheme(THEMES.LIGHT, storage)
  assert.equal(getStoredTheme(storage), THEMES.LIGHT)
})

test('应用主题会更新根节点属性和浏览器配色方案', () => {
  const root = { dataset: {}, style: {} }

  applyTheme(THEMES.LIGHT, root)

  assert.equal(root.dataset.theme, THEMES.LIGHT)
  assert.equal(root.style.colorScheme, THEMES.LIGHT)
})
