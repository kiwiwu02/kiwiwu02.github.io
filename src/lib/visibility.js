export function observeVisibility(target, onChange, Observer = globalThis.IntersectionObserver) {
  if (!target || typeof Observer !== 'function') {
    onChange(true)
    return () => {}
  }

  const observer = new Observer(([entry]) => {
    onChange(Boolean(entry?.isIntersecting))
  })
  observer.observe(target)
  return () => observer.disconnect()
}
