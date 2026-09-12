/**
 * 宠物帧资源与注视方向表。
 * 帧来源：canonical spritesheet（8 列 × 11 行，按网格元数据切分）
 * 所有帧共用同一裁切框（155×204），因此状态切换时角色脚底完全对齐。
 */

export const ANIMS = {
  idle: { frames: 6, durations: [280, 110, 110, 140, 140, 320], loop: true },
  'running-right': { frames: 8, durations: [120, 120, 120, 120, 120, 120, 120, 220], loop: true },
  'running-left': { frames: 8, durations: [120, 120, 120, 120, 120, 120, 120, 220], loop: true },
  waving: { frames: 4, durations: [140, 140, 140, 280], loop: true, hold: 2400 },
  jumping: { frames: 5, durations: [140, 140, 140, 140, 280], loop: true, hold: 1100 },
  failed: { frames: 8, durations: [140, 140, 140, 140, 140, 140, 140, 240], loop: true, hold: 2000 },
  waiting: { frames: 6, durations: [150, 150, 150, 150, 150, 260], loop: true },
  running: { frames: 6, durations: [120, 120, 120, 120, 120, 220], loop: true },
  review: { frames: 6, durations: [150, 150, 150, 150, 150, 280], loop: true },
  look: { frames: 16, loop: true, manual: true },
}

export const frameSrc = (anim, i) =>
  `${import.meta.env.BASE_URL}pet/${anim}/${String(i).padStart(2, '0')}.png`

/**
 * Codex v2 的注视方向表：从正上方开始，按屏幕坐标顺时针每 22.5° 一帧。
 * 中间没有向量时不进入 look，而是回到 idle；这样不会把 000 误当成正视前方。
 */
export const GAZE_VECTORS = Array.from({ length: 16 }, (_, i) => {
  const radians = i * Math.PI / 8
  return { i, degrees: i * 22.5, x: Math.sin(radians), y: -Math.cos(radians) }
})

export function gazeIndexFor(dx, dy, deadzone = 70) {
  const dist = Math.hypot(dx, dy)
  if (dist < deadzone) return null
  const ux = dx / dist
  const uy = dy / dist
  let best = GAZE_VECTORS[0]
  let bestDot = -Infinity
  for (const v of GAZE_VECTORS) {
    const len = Math.hypot(v.x, v.y) || 1
    const dot = (ux * v.x + uy * v.y) / len
    if (dot > bestDot) { bestDot = dot; best = v }
  }
  return best.i
}

/** 按 Codex v2 的逐帧时长播放一个非手动动画。 */
export function frameIndexFor(anim, elapsed) {
  const cfg = ANIMS[anim]
  if (!cfg || cfg.manual || !cfg.durations?.length) return 0
  const total = cfg.durations.reduce((sum, duration) => sum + duration, 0)
  let offset = ((elapsed % total) + total) % total
  for (let i = 0; i < cfg.durations.length; i++) {
    if (offset < cfg.durations[i]) return i
    offset -= cfg.durations[i]
  }
  return cfg.durations.length - 1
}

/** 已预加载的动画（每个动画只预加载一次） */
const preloadedAnims = new Set()

/** 按需预加载某一组动画的帧；重复调用安全 */
export function preloadAnim(name) {
  const cfg = ANIMS[name]
  if (!cfg || preloadedAnims.has(name) || typeof window === 'undefined') return
  preloadedAnims.add(name)
  for (let i = 0; i < cfg.frames; i++) {
    const img = new Image()
    img.src = frameSrc(name, i)
  }
}

/**
 * 三级加载策略
 *   一级 idle（236 KB）—— 首屏关键路径，立即加载
 *   二级 waving / jumping / waiting / review（约 800 KB）—— 浏览器空闲时加载
 *   三级 look / running-* / failed / running —— 不预加载，进入该状态时随用随取
 * （对照：原先 74 帧一次性预加载 2.7 MB，全部压在首屏关键路径上）
 */
const IDLE_TIME_ANIMS = ['waving', 'jumping']

let booted = false
export function preloadPetFrames() {
  if (booted || typeof window === 'undefined') return
  booted = true
  preloadAnim('idle')
  const schedule = window.requestIdleCallback
    ? (cb) => window.requestIdleCallback(cb, { timeout: 2500 })
    : (cb) => setTimeout(cb, 800)
  schedule(() => IDLE_TIME_ANIMS.forEach(preloadAnim))
}
