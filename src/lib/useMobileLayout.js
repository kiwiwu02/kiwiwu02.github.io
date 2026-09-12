import { useSyncExternalStore } from 'react'

const MOBILE_QUERY = '(max-width: 767px)'

function subscribe(onChange) {
  const query = window.matchMedia(MOBILE_QUERY)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

function getSnapshot() {
  return window.matchMedia(MOBILE_QUERY).matches
}

export function useMobileLayout() {
  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}
