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

