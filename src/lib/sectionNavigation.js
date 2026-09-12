export function getSectionScrollTop({
  targetTop,
  scrollY,
  navHeight,
  anchorGap = 16,
  maxScrollTop = Number.POSITIVE_INFINITY,
}) {
  const requestedTop = targetTop + scrollY - navHeight - anchorGap
  return Math.min(Math.max(0, requestedTop), maxScrollTop)
}

export function navigateToSection(event, id, {
  documentRef = typeof document !== 'undefined' ? document : undefined,
  windowRef = typeof window !== 'undefined' ? window : undefined,
} = {}) {
  if (!documentRef || !windowRef) return
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

  event.preventDefault()
  const section = documentRef.getElementById(id)
  if (!section) return

  const target = section.querySelector('.sec-title, .contact-title') || section
  const navHeight = documentRef.querySelector('.nav')?.getBoundingClientRect().height ?? 0
  const anchorGap = parseFloat(windowRef.getComputedStyle(documentRef.documentElement).fontSize) || 16
  const maxScrollTop = Math.max(0, documentRef.documentElement.scrollHeight - windowRef.innerHeight)
  const targetTop = getSectionScrollTop({
    targetTop: target.getBoundingClientRect().top,
    scrollY: windowRef.scrollY,
    navHeight,
    anchorGap,
    maxScrollTop,
  })
  const prefersReducedMotion = windowRef.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  windowRef.history.pushState(null, '', `#${id}`)
  windowRef.scrollTo({ top: targetTop, behavior: prefersReducedMotion ? 'auto' : 'smooth' })
}
