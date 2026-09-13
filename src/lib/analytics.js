export const DEFAULT_UMAMI_SCRIPT_URL = 'https://cloud.umami.is/script.js'

const EVENT_NAMES = new Set([
  'section_view',
  'resume_download',
  'project_click',
  'contact_click',
])

const SECTION_NAMES = new Set([
  'hero',
  'education',
  'experience',
  'work',
  'contact',
])

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

  if (name === 'resume_download') {
    return { name, properties: {} }
  }

  if (name === 'section_view' && SECTION_NAMES.has(properties.section)) {
    return { name, properties: { section: properties.section } }
  }

  if (
    name === 'project_click'
    && LINK_TYPES.has(properties.linkType)
    && typeof properties.project === 'string'
    && properties.project.length <= 80
  ) {
    return {
      name,
      properties: {
        project: properties.project,
        linkType: properties.linkType,
      },
    }
  }

  if (name === 'contact_click' && CONTACT_CHANNELS.has(properties.channel)) {
    return { name, properties: { channel: properties.channel } }
  }

  return null
}

export function createAnalytics({
  env = {},
  documentRef = globalThis.document,
  windowRef = globalThis.window,
  Observer = globalThis.IntersectionObserver,
} = {}) {
  const config = resolveAnalyticsConfig(env)
  let initialized = false
  let ready = typeof windowRef?.umami?.track === 'function'
  let queue = []

  const flushQueue = () => {
    if (typeof windowRef?.umami?.track !== 'function') return false

    ready = true
    const pending = queue
    queue = []

    for (const event of pending) {
      try {
        windowRef.umami.track(event.name, event.properties)
      } catch {
        // Analytics failures must never interrupt page interactions.
      }
    }

    return true
  }

  const init = () => {
    if (!config || !documentRef?.head || typeof documentRef.createElement !== 'function') {
      return false
    }
    if (initialized) return true

    const existingScript = typeof documentRef.querySelector === 'function'
      ? documentRef.querySelector('script[data-kiwi-umami]')
      : null
    const script = existingScript ?? documentRef.createElement('script')

    script.dataset ??= {}
    script.dataset.kiwiUmami = 'true'
    script.dataset.websiteId = config.websiteId

    if (!existingScript) {
      script.src = config.scriptUrl
      script.defer = true
    }

    if (typeof script.addEventListener === 'function') {
      script.addEventListener('load', flushQueue)
      script.addEventListener('error', () => {
        queue = []
        ready = false
      })
    }

    initialized = true

    if (!existingScript) {
      try {
        documentRef.head.appendChild(script)
      } catch {
        queue = []
        ready = false
        return false
      }
    }

    flushQueue()
    return true
  }

  const track = (name, properties = {}) => {
    const event = sanitizeAnalyticsEvent(name, properties)
    if (!config || !event) return false

    if (ready && typeof windowRef?.umami?.track === 'function') {
      try {
        windowRef.umami.track(event.name, event.properties)
        return true
      } catch {
        return false
      }
    }

    queue.push(event)
    return true
  }

  const observeSections = () => {
    if (!config || !documentRef || typeof documentRef.querySelectorAll !== 'function' || !Observer) {
      return () => {}
    }

    const sections = Array.from(documentRef.querySelectorAll('[data-analytics-section]'))
    if (!sections.length) return () => {}

    const seen = new Set()
    let observer

    try {
      observer = new Observer((entries) => {
        for (const entry of entries) {
          if (!entry?.isIntersecting) continue

          const section = entry.target?.dataset?.analyticsSection
          if (!SECTION_NAMES.has(section) || seen.has(section)) continue

          seen.add(section)
          api.track('section_view', { section })
        }
      }, { threshold: 0.45 })

      sections.forEach((section) => observer.observe(section))
    } catch {
      return () => {}
    }

    return () => observer.disconnect()
  }

  const api = { init, track, observeSections }
  return api
}

const defaultAnalytics = createAnalytics({
  env: import.meta.env ?? {},
  documentRef: globalThis.document,
  windowRef: globalThis.window,
  Observer: globalThis.IntersectionObserver,
})

export const initAnalytics = () => defaultAnalytics.init()
export const trackAnalyticsEvent = (name, properties) => defaultAnalytics.track(name, properties)
export const observeAnalyticsSections = () => defaultAnalytics.observeSections()
