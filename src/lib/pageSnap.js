export const SNAP_PAGE_SELECTOR = '[data-snap-page]'

/**
 * 保留原有组件接口，但把滚动交给浏览器原生处理。
 * 章节的定位感由导航锚点和区块视觉边界提供，不再拦截桌面端滚轮或启用 CSS 吸附。
 */
export function createPageSnapController() {
  return () => {}
}
