/**
 * 宠物气泡的说话通道：TTL 自动隐藏、池内去重、按事件冷却、会话级 once。
 * 与状态机彻底分离——动作状态（setAnim）不再触发说话，只有事件显式调 speak。
 * 计时统一用 Date.now()（墙钟），后台 tab 也正常推进。
 */

const pick = (arr, avoid) => {
  const pool = arr.length > 1 && avoid ? arr.filter((t) => t !== avoid) : arr
  return pool[Math.floor(Math.random() * pool.length)]
}

/** 被点烦的跨实例屏蔽：任意宠物触发后，所有宠物一起冷静 30s。 */
let sharedAnnoyedUntil = 0
export const isAnnoyed = () => Date.now() < sharedAnnoyedUntil

export function createSpeech({ setLine, pools, onExpire }) {
  const state = { once: new Set(), lastText: {}, lastAt: {}, timers: {} }

  const hush = () => {
    Object.values(state.timers).forEach(clearTimeout)
    state.timers = {}
    setLine('')
  }

  const speak = (poolName, opts = {}) => {
    const { ttl = 3000, cooldownMs = 0, once = false } = opts
    const pool = pools?.[poolName]
    if (!pool || !pool.length) return
    if (once) {
      if (state.once.has(poolName)) return
      state.once.add(poolName)
    }
    if (cooldownMs && (state.lastAt[poolName] || 0) + cooldownMs > Date.now()) return

    const text = pick(pool, state.lastText[poolName])
    state.lastText[poolName] = text
    state.lastAt[poolName] = Date.now()

    // 新 speak 打断旧气泡：清掉所有池的 TTL 定时器，避免旧池到期清掉新文案
    Object.values(state.timers).forEach(clearTimeout)
    state.timers = {}
    setLine(text)
    state.timers[poolName] = setTimeout(() => (onExpire ? onExpire() : setLine('')), ttl)
  }

  const markAnnoyed = (ms = 30000) => {
    sharedAnnoyedUntil = Date.now() + ms
  }

  return { speak, hush, markAnnoyed }
}
