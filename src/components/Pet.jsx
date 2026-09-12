import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ANIMS, frameIndexFor, frameSrc, gazeIndexFor, preloadPetFrames, preloadAnim } from '../lib/petFrames'
import { advanceFreeFall, advanceFreeWalk, clampFreePosition, freeBounds } from '../lib/petFreeMotion'
import { observeVisibility } from '../lib/visibility'
import { createSpeech, isAnnoyed } from '../lib/petSpeech'
import { petProfiles } from '../data'

/** 物理常量 */
const GRAVITY = 2600      // px/s²
const LIFT_PER_SCROLL = 0.32
const MAX_LIFT = 132
const BOUNCE = 0.26
const FREE_SCALE = 0.7        // free 落到底部后的目标尺寸
const FREE_SCALE_MS = 520     // 落地缩小的渐变时长
const FREE_TURNS = 2          // 底部跑约两圈（折返次数）后自动收回

/**
 * Codex 风格宠物：状态机 + 注视跟随 + 漫游 + 重力降落 + 指针阻尼倾斜。
 * 说话与动作彻底分离：setAnim 只切动画帧，气泡仅由事件显式调 speech.speak() 触发。
 * mode="roam"  —— 休眠中（当前 App 未挂载）；保留代码为可选能力，启用条件见 docs/pet-design-system.md §13。
 * mode="embed" —— 当前启用：嵌在卡片里，做 idle / 注视 / 倾斜 / 点击回应；双击可释放（free）并落到底部行走。
 */
const Pet = forwardRef(function Pet({ mode = 'embed', height = 240, autoWave = false, className = '', profile: profileName = 'hero' }, ref) {
  const petProfile = petProfiles[profileName] ?? petProfiles.hero
  const pools = petProfile.pools
  const wrapRef = useRef(null)
  const innerRef = useRef(null)
  const stageRef = useRef(null)
  const imgRef = useRef(null)
  const dustRef = useRef(null)
  const [line, setLine] = useState('')
  const [leaving, setLeaving] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [isFree, setIsFree] = useState(false)

  const expireTimer = useRef(0)
  const onExpire = () => {
    setLeaving(true)
    clearTimeout(expireTimer.current)
    expireTimer.current = setTimeout(() => { setLine(''); setLeaving(false) }, 150)
  }

  const st = useRef({ anim: 'idle', since: 0, gazeIdx: 0, dragging: false })
  const pos = useRef({ x: 0, target: 0, dir: 1, speed: 0 })
  const freeStart = useRef({ x: 0, y: 0 })
  const freePos = useRef({ x: 0, y: 0, vy: 0, groundY: 0, landed: false, walking: false, direction: 1, speed: 120, walkAt: 0, scale: 1, scaleAt: 0, turns: 0 })
  const air = useRef({ h: 0, vy: 0 })                       // 离地高度 / 竖直速度（向上为正）
  const lean = useRef({ x: 0, y: 0, tx: 0, ty: 0 })          // 指针倾斜（阻尼）
  const gaze = useRef({ x: 0, y: 0, tx: 0, ty: 0 })          // 注视向量（阻尼）
  const land = useRef(0)                                     // 落地时刻，用于压缩回弹

  const speechRef = useRef(null)
  if (!speechRef.current) speechRef.current = createSpeech({ setLine, pools, onExpire })
  const speech = speechRef.current

  const apiRef = useRef({})

  useImperativeHandle(ref, () => ({
    enter: () => {
      apiRef.current.wave?.()
      speech.speak('enter', { ttl: 3000, once: true })
    },
  }), [speech])

  useEffect(() => {
    preloadPetFrames()
    const wrap = wrapRef.current
    const inner = innerRef.current
    const img = imgRef.current
    const stage = stageRef.current
    if (!wrap || !inner || !img) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const free = isFree
    const petW = () => (stageRef.current?.offsetWidth || 155)
    const petH = () => (stageRef.current?.offsetHeight || 204)
    const freeScale = 1
    const freeWidth = () => (wrap.offsetWidth || petW()) * freeScale
    const freeHeight = () => (wrap.offsetHeight || petH()) * freeScale
    const getFreeBounds = () => freeBounds(
      { width: window.innerWidth, height: window.innerHeight },
      { width: freeWidth(), height: freeHeight() },
    )
    const setFreePosition = (x, y, scale = freePos.current.scale || 1) => {
      wrap.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) scale(${scale})`
    }
    const maxX = () => free ? getFreeBounds().maxX : Math.max(24, window.innerWidth - petW() - 24)

    let settleTimer = 0

    const setAnim = (name, opts = {}) => {
      if (st.current.anim === name && !opts.force) return
      st.current.anim = name
      st.current.since = performance.now()
      preloadAnim(name)          // 进入新状态时按需取帧（三级加载策略）
      if (mode === 'roam' && name === 'idle') scheduleSettle()
      else clearTimeout(settleTimer)
    }
    apiRef.current.wave = () => setAnim('waving', { force: true })

    /** 注视是「同名状态内的帧切换」，不能走 setAnim 的同状态提前返回 */
    const setGaze = (idx) => {
      if (idx == null) {
        if (st.current.anim === 'look') setAnim('idle')
        return
      }
      st.current.gazeIdx = idx
      if (st.current.anim !== 'look' && st.current.anim !== 'running-left' && st.current.anim !== 'running-right') {
        const wasIdle = st.current.anim === 'idle'
        st.current.anim = 'look'
        st.current.since = performance.now()
        preloadAnim('look')
        if (wasIdle) speech.hush()   // 看鼠标时不出气泡
      }
    }

    /** 在屏幕中间发呆超过 6~10 秒，就自己走回最近的边缘待着（仅 roam） */
    const scheduleSettle = () => {
      clearTimeout(settleTimer)
      settleTimer = setTimeout(() => {
        if (st.current.anim !== 'idle' || st.current.dragging || air.current.h > 2) return
        const target = pos.current.x < window.innerWidth / 2 ? 24 : maxX()
        if (Math.abs(target - pos.current.x) < 10) return
        pos.current.target = target
        pos.current.dir = target > pos.current.x ? 1 : -1
        pos.current.speed = 120
        setAnim(pos.current.dir > 0 ? 'running-right' : 'running-left')
      }, 6000 + Math.random() * 4000)
    }

    /** 落地：压一下 + 扬尘 + 短暂起跳帧 */
    const onLand = () => {
      land.current = performance.now()
      if (dustRef.current) {
        const d = dustRef.current
        d.classList.remove('burst')
        void d.offsetWidth
        d.classList.add('burst')
      }
      setAnim('jumping', { force: true })
      setTimeout(() => {
        if (st.current.anim === 'jumping' && !st.current.dragging) setAnim('idle')
      }, 340)
    }

    // ---------- 初始位置（漫游模式：停在右下角）----------
    if (mode === 'roam') {
      pos.current.x = maxX() - 32
      pos.current.target = pos.current.x
      wrap.style.transform = `translate3d(${pos.current.x}px,0,0)`
    }
    if (free) {
      const bounds = getFreeBounds()
      const start = clampFreePosition(freeStart.current, bounds)
      // 走回最近边缘（设计系统 §8"回角落"），而不是朝中心穿过整屏
      const startDirection = start.x < (bounds.minX + bounds.maxX) / 2 ? -1 : 1
      const startsOnGround = start.y >= bounds.maxY - 0.5
      freePos.current = {
        x: start.x,
        y: start.y,
        vy: 0,
        groundY: bounds.maxY,
        landed: startsOnGround,
        walking: false,
        direction: startDirection,
        speed: 120,
        walkAt: startsOnGround ? performance.now() + 420 : 0,
        scale: 1,
        scaleAt: performance.now(),
        turns: 0,
      }
      setFreePosition(start.x, start.y)
    } else if (mode === 'embed') {
      // 从 portal 回到原始位置时清掉自由移动留下的内联位移，恢复卡片布局。
      wrap.style.transform = ''
      wrap.classList.remove('pet--flip-bubble')
    }

    // ---------- 主循环 ----------
    let raf = 0
    let visible = true
    let last = performance.now()
    const tick = (now) => {
      raf = 0
      if (!visible) return
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now

      // Codex v2 的 000 是正上方；指针回到死区时回到 idle，而不是误取 look/00。
      if (st.current.anim === 'look' && !st.current.dragging) {
        const nextGaze = gazeIndexFor(gaze.current.x, gaze.current.y, 60)
        if (nextGaze == null) setAnim('idle')
        else st.current.gazeIdx = nextGaze
      }

      const cfg = ANIMS[st.current.anim]

      // 帧推进
      let idx
      if (cfg.manual) idx = st.current.gazeIdx
      else idx = frameIndexFor(st.current.anim, now - st.current.since)
      const src = frameSrc(st.current.anim, idx)
      if (img.getAttribute('src') !== src) img.setAttribute('src', src)

      // 一次性状态自动回落（free 落体期间保持跳跃姿态，直到落地，避免站立平移下落）
      const freeFalling = free && !freePos.current.landed
      if (cfg.hold && now - st.current.since > cfg.hold && !st.current.dragging && air.current.h <= 0 && !freeFalling) setAnim('idle')

      // ---- 重力：离地后下落、落地弹一下（拖拽中由指针接管高度，只更新尘影） ----
      if (!reduced && mode === 'roam') {
        if (!st.current.dragging && (air.current.h > 0 || air.current.vy !== 0)) {
          air.current.vy -= GRAVITY * dt
          air.current.h += air.current.vy * dt
          if (air.current.h <= 0) {
            air.current.h = 0
            if (Math.abs(air.current.vy) > 120) air.current.vy = -air.current.vy * BOUNCE
            else { air.current.vy = 0; onLand() }
          }
        }
        // 尘影随高度收缩
        const n = Math.min(air.current.h / MAX_LIFT, 1)
        stage.style.setProperty('--air-n', n.toFixed(3))
      }

      // ---- 走动 ----
      if (mode === 'roam' && !st.current.dragging && air.current.h <= 2) {
        if (st.current.anim === 'running-right' || st.current.anim === 'running-left') {
          pos.current.x += pos.current.speed * dt * pos.current.dir
          const done = pos.current.dir > 0
            ? pos.current.x >= pos.current.target
            : pos.current.x <= pos.current.target
          if (done) {
            pos.current.x = pos.current.target
            setAnim(Math.random() < 0.25 ? 'jumping' : 'idle')
          }
        }
        wrap.classList.toggle('pet--flip-bubble', pos.current.x < 300)
      }

      // ---- 释放后的重力与底部行走：位置独立于文档流，动作仍复用原始状态机 ----
      if (free && !st.current.dragging) {
        const bounds = getFreeBounds()
        const wasLanded = freePos.current.landed
        let next = { ...freePos.current, groundY: bounds.maxY }

        if (!wasLanded) {
          next = advanceFreeFall(next, dt, GRAVITY)
          if (next.landed) {
            next.walkAt = now + 420
            // 落地后走回最近边缘，与初始方向一致
            next.direction = next.x < (bounds.minX + bounds.maxX) / 2 ? -1 : 1
            next.speed = 120
            onLand()
          }
        }

        // 一次性动作（挥手 / 被点烦）期间停下不做位移，动作结束自动恢复行走
        const isAction = st.current.anim === 'waving' || st.current.anim === 'failed'
        if (next.landed && now >= next.walkAt && !isAction) {
          next.walking = true
          const walked = advanceFreeWalk({
            x: next.x,
            y: next.groundY,
            direction: next.direction,
            speed: next.speed,
            bounds,
          }, dt)
          const turned = walked.direction !== next.direction
          next = { ...next, ...walked, y: bounds.maxY }
          if (turned) next.turns = (next.turns || 0) + 1
          // 底部跑约两圈后自动收回 embed 原位
          if (next.turns >= FREE_TURNS) setIsFree(false)

          // 每帧确保动画与移动方向一致：不依赖上一帧状态，方向脱节能自愈
          const wantAnim = next.direction > 0 ? 'running-right' : 'running-left'
          if (st.current.anim !== wantAnim) setAnim(wantAnim)
        }

        // 落体期间渐进缩小，落到底部后保持小尺寸（底部跑步更协调）
        const shrinkT = Math.min(1, (now - next.scaleAt) / FREE_SCALE_MS)
        next.scale = 1 + (FREE_SCALE - 1) * shrinkT

        freePos.current = next
        setFreePosition(freePos.current.x, freePos.current.y, freePos.current.scale)
        wrap.classList.toggle('pet--flip-bubble', freePos.current.x < 300)
      }

      // ---- 指针动效：注视向量 + 倾斜量都做阻尼过渡 ----
      const k = 1 - Math.pow(0.0016, dt)      // 与帧率无关的阻尼系数
      gaze.current.x += (gaze.current.tx - gaze.current.x) * k
      gaze.current.y += (gaze.current.ty - gaze.current.y) * k
      lean.current.x += (lean.current.tx - lean.current.x) * k
      lean.current.y += (lean.current.ty - lean.current.y) * k

      // 倾斜 + 悬浮微动 + 落地压缩
      const squash = Math.max(0, 1 - (now - land.current) / 280)
      const breathe = Math.sin(now / 900) * 0.006
      inner.style.transform =
        `translate3d(${(lean.current.x * 10).toFixed(2)}px, ${(lean.current.y * 5).toFixed(2)}px, 0) ` +
        `rotate(${(lean.current.x * 3.8).toFixed(2)}deg) ` +
        `scale(${(1 + breathe + squash * 0.05).toFixed(4)}, ${(1 + breathe - squash * 0.09).toFixed(4)})`

      // ---- 漫游位置 ----
      if (mode === 'roam') {
        wrap.style.transform = `translate3d(${pos.current.x.toFixed(1)}px, ${(-air.current.h).toFixed(1)}px, 0)`
      }

      raf = requestAnimationFrame(tick)
    }

    const stopLoop = () => {
      if (!raf) return
      cancelAnimationFrame(raf)
      raf = 0
    }
    const startLoop = () => {
      if (reduced || !visible || raf) return
      raf = requestAnimationFrame(tick)
    }

    st.current.since = performance.now()
    if (free) setAnim('jumping', { force: true })
    if (!reduced) startLoop()
    else img.setAttribute('src', frameSrc('idle', 0))

    const stopObserving = observeVisibility(wrap, (nextVisible) => {
      visible = nextVisible
      if (visible) startLoop()
      else { stopLoop(); speech.hush() }
    })

    // ---------- 指针：注视 + 倾斜目标 ----------
    let lastMove = performance.now()
    let gazeIdleTimer = 0
    const onMove = (e) => {
      if (st.current.dragging || e.pointerType === 'touch') return
      lastMove = performance.now()
      const box = stage.getBoundingClientRect()
      const cx = box.left + box.width / 2
      const cy = box.top + box.height * 0.32
      const dx = e.clientX - cx
      const dy = e.clientY - cy
      // 注视：直接给目标向量，由主循环做阻尼
      gaze.current.tx = dx
      gaze.current.ty = dy
      // 倾斜：按视口尺度归一化，越靠边倾得越多
      lean.current.tx = Math.max(-1, Math.min(1, dx / (window.innerWidth * 0.3)))
      lean.current.ty = Math.max(-1, Math.min(1, dy / (window.innerHeight * 0.42)))

      // 无节流：鼠标一动眼睛立即跟随；deadzone 30px 比默认更敏感
      const cur = st.current.anim
      if (cur === 'idle' || cur === 'look') {
        setGaze(gazeIndexFor(dx, dy, 30))
      }

      // 指针静止 2.6s 后回到 idle，倾斜也慢慢回正
      clearTimeout(gazeIdleTimer)
      gazeIdleTimer = setTimeout(() => {
        if (st.current.anim === 'look' && !st.current.dragging) setAnim('idle')
        lean.current.tx = 0
        lean.current.ty = 0
      }, 2600)
    }
    window.addEventListener('pointermove', onMove, { passive: true })

    // ---------- 滚动：下滑被甩起来再落下（仅 roam） ----------
    let lastScrollY = window.scrollY
    let liftCooldown = 0
    const onScroll = () => {
      const y = window.scrollY
      const delta = y - lastScrollY
      lastScrollY = y
      if (reduced || mode !== 'roam' || st.current.dragging) return
      const now = performance.now()
      if (delta > 4 && now > liftCooldown) {
        air.current.h = Math.min(air.current.h + Math.min(delta * LIFT_PER_SCROLL, 74), MAX_LIFT)
        air.current.vy = Math.max(air.current.vy, 30 + Math.min(delta * 1.2, 90))
        if (st.current.anim === 'idle' || st.current.anim === 'look' || st.current.anim === 'waiting') {
          setAnim('jumping', { force: true })
        }
        liftCooldown = now + 260
      } else if (delta < -4 && air.current.h <= 0) {
        air.current.vy = 130
        if (st.current.anim === 'idle' || st.current.anim === 'look') setAnim('jumping', { force: true })
        liftCooldown = now + 260
      }
    }
    if (mode === 'roam') {
      window.addEventListener('scroll', onScroll, { passive: true })
    }

    // ---------- 漫游调度（仅 roam） ----------
    let wanderTimer = 0
    const scheduleWander = () => {
      wanderTimer = setTimeout(() => {
        if (!st.current.dragging && air.current.h <= 2 && (st.current.anim === 'idle' || st.current.anim === 'waiting')) {
          const target = 24 + Math.random() * (maxX() - 24)
          pos.current.target = target
          pos.current.dir = target > pos.current.x ? 1 : -1
          pos.current.speed = 90 + Math.random() * 70
          setAnim(pos.current.dir > 0 ? 'running-right' : 'running-left')
        }
        scheduleWander()
      }, 9000 + Math.random() * 12000)
    }
    if (mode === 'roam' && !reduced) scheduleWander()

    // ---------- 闲置：等待 → 打盹（沉默的陪伴姿态，不假装工作） ----------
    let idleTimer = 0
    let napTimer = 0
    const armIdle = () => {
      clearTimeout(idleTimer); clearTimeout(napTimer)
      idleTimer = setTimeout(() => {
        if (!st.current.dragging && air.current.h <= 2 && (st.current.anim === 'idle' || st.current.anim === 'look')) setAnim('waiting')
        napTimer = setTimeout(() => {
          if (!st.current.dragging && st.current.anim === 'waiting') setAnim('review')
        }, 45000)
      }, 45000)
    }
    const onActivity = () => {
      const cur = st.current.anim
      if (cur === 'waiting' || cur === 'review') setAnim('jumping')
      armIdle()
    }
    window.addEventListener('pointermove', onActivity, { passive: true })
    window.addEventListener('keydown', onActivity)
    window.addEventListener('scroll', onActivity, { passive: true })
    armIdle()

    // ---------- 点击互动：单击回应，连击三次被点烦 ----------
    let clicks = []
    let justDragged = 0
    const onClick = () => {
      if (st.current.dragging || performance.now() - justDragged < 320) return
      if (isAnnoyed()) return
      const now = performance.now()
      clicks = clicks.filter((t) => now - t < 1200)
      clicks.push(now)
      if (clicks.length >= 3) {
        clicks = []
        setAnim('failed')
        speech.markAnnoyed(30000)
        speech.speak('annoyed', { ttl: 1800 })
        return
      }
      setAnim('waving', { force: true })
      speech.speak('click', { ttl: 2600, cooldownMs: 8000 })
    }
    const onKeyDown = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onClick()
      }
    }
    const onDbl = () => {
      if (st.current.dragging) return
      clicks = []
      speech.hush()          // 双击直接掉落，清掉单击误触发的说话
      if (free) {
        setIsFree(false)
        return
      }
      if (mode === 'embed') {
        const box = wrap.getBoundingClientRect()
        freeStart.current = { x: box.left, y: box.top }
        setIsFree(true)
        return
      }
      if (mode === 'roam') { air.current.vy = 210; setAnim('jumping', { force: true }) }
    }
    wrap.addEventListener('click', onClick)
    wrap.addEventListener('dblclick', onDbl)
    wrap.addEventListener('keydown', onKeyDown)

    // ---------- 拖拽（漫游/free 模式）：全屏自由拖动，松手从当前位置自由落体 ----------
    let dragState = { active: false, moved: false, x: 0, y: 0, grabOffX: 0, grabOffY: 0, baseY: 0 }
    const onDown = (e) => {
      if (!free && mode !== 'roam') return
      const wbox = wrap.getBoundingClientRect()
      const sbox = stageRef.current?.getBoundingClientRect()
      dragState = {
        active: true, moved: false, x: e.clientX, y: e.clientY,
        grabOffX: e.clientX - wbox.left,
        grabOffY: free ? e.clientY - wbox.top : (sbox ? sbox.bottom - e.clientY : 0),
        baseY: free ? 0 : (sbox ? sbox.bottom : 0) + air.current.h,
      }
    }
    const onDrag = (e) => {
      if (!dragState.active) return
      if (!dragState.moved) {
        if (Math.hypot(e.clientX - dragState.x, e.clientY - dragState.y) < 6) return
        dragState.moved = true
        st.current.dragging = true
        air.current.vy = 0
        try { wrap.setPointerCapture?.(e.pointerId) } catch { /* 指针已失效也不影响拖拽逻辑 */ }
        setAnim('jumping', { force: true })   // 拎起来保持跳跃姿态，而不是低头
      }
      if (free) {
        const bounds = getFreeBounds()
        const x = Math.min(bounds.maxX, Math.max(bounds.minX, e.clientX - dragState.grabOffX))
        const y = Math.min(bounds.maxY, Math.max(bounds.minY, e.clientY - dragState.grabOffY))
        freePos.current = { ...freePos.current, x, y, vy: 0, groundY: bounds.maxY, landed: false, walking: false, walkAt: 0 }
        setFreePosition(x, y)
        lean.current.tx = Math.max(-1, Math.min(1, (e.clientX - dragState.x) / 260))
        wrap.classList.toggle('pet--flip-bubble', x < 300)
        return
      }
      const x = Math.min(maxX(), Math.max(24, e.clientX - dragState.grabOffX))
      pos.current.x = x
      pos.current.target = x
      if (!reduced) {
        const maxLift = Math.max(60, dragState.baseY - 24 - (stageRef.current?.offsetHeight || 155))
        air.current.h = Math.min(Math.max(dragState.baseY - e.clientY - dragState.grabOffY, 0), maxLift)
        air.current.vy = 0
      }
      wrap.style.transform = `translate3d(${x}px, ${(-air.current.h).toFixed(1)}px, 0)`
      lean.current.tx = Math.max(-1, Math.min(1, (e.clientX - dragState.x) / 260))
      wrap.classList.toggle('pet--flip-bubble', x < 300)
    }
    const onUp = () => {
      if (!dragState.active) return
      const wasDrag = dragState.moved
      dragState.active = false
      dragState.moved = false
      if (!wasDrag) return
      st.current.dragging = false
      justDragged = performance.now()
      lean.current.tx = 0
      lean.current.ty = 0
      if (free) {
        freePos.current.vy = 0
        freePos.current.landed = false
        freePos.current.walking = false
        freePos.current.walkAt = 0
        setAnim('jumping', { force: true })
        return
      }
      air.current.vy = 0
      air.current.h = Math.max(air.current.h, 40)
      setAnim('jumping', { force: true })
    }
    if (mode === 'roam' || free) {
      wrap.addEventListener('pointerdown', onDown)
      window.addEventListener('pointermove', onDrag)
      window.addEventListener('pointerup', onUp)
    }

    // ---------- 进入收尾联系页时暂时退场（roam）；free 走进 Contact 自动收回（避免同屏两只） ----------
    let io
    if (mode === 'roam') {
      const target = document.querySelector('#contact')
      if (target) {
        io = new IntersectionObserver(([entry]) => setHidden(entry.isIntersecting), { threshold: 0.35 })
        io.observe(target)
      }
    } else if (free && profileName !== 'contact') {
      // 仅从 Hero 释放的 free 宠物，走进 Contact 区域时收回（避免同屏两只）。
      // 从 Contact 释放的 free 不启用收回，否则释放瞬间就被自己的区域 IO 收回，无法掉落。
      const target = document.querySelector('#contact')
      if (target) {
        io = new IntersectionObserver(([entry]) => {
          if (entry.isIntersecting) setIsFree(false)
        }, { threshold: 0.35 })
        io.observe(target)
      }
    }

    let autoWaveTimer = 0
    if (autoWave && !free && !reduced) autoWaveTimer = setTimeout(() => setAnim('waving', { force: true }), 700)

    // ---------- embed 默认轮播提示语（hero / contact，非 reduced 非 free） ----------
    let idleCarousel = 0
    const showIdleTip = () => {
      // 只在真正待机时轮播提示；看着鼠标（look）时保持沉默
      if (visible && !st.current.dragging && st.current.anim === 'idle') {
        speech.speak('idle', { ttl: 3200 })
      }
      idleCarousel = setTimeout(showIdleTip, 8000)
    }
    if ((profileName === 'hero' || profileName === 'contact') && mode === 'embed' && !reduced && !free) {
      idleCarousel = setTimeout(showIdleTip, profileName === 'hero' ? 4000 : 2500)
    }

    // 调试 / 联调用入口（仅开发环境）
    if (import.meta.env.DEV) {
      window.__kiwiPet = {
        wave: () => setAnim('waving', { force: true }),
        jump: () => { if (mode === 'roam') air.current.vy = 200; setAnim('jumping', { force: true }) },
        drop: () => { air.current.h = MAX_LIFT; air.current.vy = 40; setAnim('jumping', { force: true }) },
        fail: () => setAnim('failed', { force: true }),
        wander: () => {
          const target = 24 + Math.random() * (maxX() - 24)
          pos.current.target = target
          pos.current.dir = target > pos.current.x ? 1 : -1
          pos.current.speed = 140
          setAnim(pos.current.dir > 0 ? 'running-right' : 'running-left')
        },
        state: () => ({
          anim: st.current.anim, gazeIdx: st.current.gazeIdx,
          x: Math.round(pos.current.x), air: Math.round(air.current.h),
          leanX: +lean.current.x.toFixed(3), mode, free,
        }),
      }
    }

    return () => {
      stopLoop()
      stopObserving()
      clearTimeout(wanderTimer); clearTimeout(gazeIdleTimer); clearTimeout(settleTimer); clearTimeout(autoWaveTimer)
      clearTimeout(idleTimer); clearTimeout(napTimer); clearTimeout(idleCarousel)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointermove', onActivity)
      window.removeEventListener('pointermove', onDrag)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('keydown', onActivity)
      window.removeEventListener('scroll', onActivity)
      window.removeEventListener('scroll', onScroll)
      wrap.removeEventListener('click', onClick)
      wrap.removeEventListener('dblclick', onDbl)
      wrap.removeEventListener('keydown', onKeyDown)
      if (mode === 'roam' || free) wrap.removeEventListener('pointerdown', onDown)
      io?.disconnect()
    }
  }, [mode, autoWave, profileName, pools, petProfile, isFree])

  const roam = mode === 'roam'
  const free = isFree
  const stage = (
    <div
      className={`pet ${free ? 'pet--free' : roam ? 'pet--roam' : 'pet--embed'} ${hidden ? 'is-hidden' : ''} ${className}`}
      ref={wrapRef}
      data-pet-profile={profileName}
      data-pet-free={free ? 'true' : undefined}
      tabIndex={0}
    >
      {!hidden && line && <span className={`pet-bubble ${leaving ? 'pet-bubble--out' : ''}`} aria-hidden="true">{line}</span>}
      <div className="pet-inner" ref={innerRef}>
        <div className="pet-stage" ref={stageRef}>
          <span className="pet-dust" ref={dustRef} aria-hidden="true" />
          <img className="pet-sprite" ref={imgRef} src={frameSrc('idle', 0)} alt="Kiwi 宠物" width={155} height={204} decoding="async" style={{ height }} draggable="false" />
        </div>
      </div>
    </div>
  )

  if (free && typeof document !== 'undefined') return createPortal(stage, document.body)
  return roam ? <div className="pet-roam-layer">{stage}</div> : stage
})

export default Pet
