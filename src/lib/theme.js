export const THEMES = Object.freeze({
  DARK: 'dark',
  LIGHT: 'light',
})

export const THEME_STORAGE_KEY = 'kiwi-theme'
export const THEME_CHANGE_EVENT = 'kiwi-theme-change'

export function isTheme(value) {
  return value === THEMES.DARK || value === THEMES.LIGHT
}

function getStorage() {
  try {
    return globalThis.localStorage
  } catch {
    return undefined
  }
}

export function getStoredTheme(storage = getStorage()) {
  try {
    const value = storage?.getItem(THEME_STORAGE_KEY)
    return isTheme(value) ? value : null
  } catch {
    return null
  }
}

export function getInitialTheme(storage = getStorage()) {
  return getStoredTheme(storage) ?? THEMES.DARK
}

export function persistTheme(theme, storage = getStorage()) {
  if (!isTheme(theme)) return

  try {
    storage?.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // 隐私模式或禁用存储时，主题仍可在当前页面正常使用。
  }
}

export function applyTheme(theme, root = typeof document !== 'undefined' ? document.documentElement : undefined) {
  if (!isTheme(theme) || !root) return

  root.dataset.theme = theme
  root.style.colorScheme = theme

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(THEME_CHANGE_EVENT, { detail: { theme } }))
  }
}

export function getNextTheme(theme) {
  return theme === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT
}
