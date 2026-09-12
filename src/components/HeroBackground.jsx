import { useEffect, useRef, useState } from 'react'
import { observeVisibility } from '../lib/visibility'
import { THEME_CHANGE_EVENT } from '../lib/theme'

/**
 * Hero 背景：优先播放 /media/hero-bg.mp4（把任意视频丢进 public/media 即可启用），
 * 没有视频文件时自动降级为代码生成的粒子 / 光带动态背景。
 */
export default function HeroBackground() {
  const rootRef = useRef(null)
  const canvasRef = useRef(null)
  const [hasVideo, setHasVideo] = useState(true)
  const [videoReady, setVideoReady] = useState(false)
  const [theme, setTheme] = useState(() => (
    typeof document !== 'undefined' ? document.documentElement.dataset.theme : 'dark'
  ))

  useEffect(() => {
    const onThemeChange = (event) => {
      setTheme(event.detail?.theme || document.documentElement.dataset.theme || 'dark')
    }

    window.addEventListener(THEME_CHANGE_EVENT, onThemeChange)
    return () => window.removeEventListener(THEME_CHANGE_EVENT, onThemeChange)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const root = rootRef.current
    if (!canvas || !root) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const rootStyles = getComputedStyle(document.documentElement)
    const gridRgb = rootStyles.getPropertyValue('--hero-grid-rgb').trim() || '255, 255, 255'
    const dustRgb = rootStyles.getPropertyValue('--hero-dust-rgb').trim() || '255, 255, 255'
    const accentRgb = rootStyles.getPropertyValue('--accent-rgb').trim() || '226, 73, 47'
    let raf = 0
    let visible = true
    let w = 0
    let h = 0
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const dust = Array.from({ length: 72 }, () => ({
      x: Math.random(), y: Math.random(),
      r: Math.random() * 1.5 + 0.35,
      vy: (Math.random() * 0.00022 + 0.00006),
      vx: (Math.random() - 0.5) * 0.00016,
      a: Math.random() * 0.38 + 0.1,
    }))
    const streaks = Array.from({ length: 4 }, (_, i) => ({
      y: 0.28 + i * 0.16, x: Math.random(), speed: 0.00016 + Math.random() * 0.00012,
    }))

    const resize = () => {
      w = canvas.clientWidth; h = canvas.clientHeight
      canvas.width = w * dpr; canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    let t = 0
    const drawFrame = () => {
      t += 1
      ctx.clearRect(0, 0, w, h)

      // 底部渐隐网格（透视感）
      ctx.lineWidth = 0.6
      for (let i = 0; i < 16; i++) {
        const p = i / 15
        const y = h * 0.55 + Math.pow(p, 1.7) * h * 0.5
        ctx.strokeStyle = `rgba(${gridRgb},${0.026 * (1 - p * 0.72)})`
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke()
      }
      for (let i = -14; i <= 14; i++) {
        ctx.strokeStyle = `rgba(${gridRgb},0.018)`
        ctx.beginPath()
        ctx.moveTo(w / 2 + i * w * 0.028, h * 0.55)
        ctx.lineTo(w / 2 + i * w * 0.16, h)
        ctx.stroke()
      }

      // 缓慢横扫的红色光带
      streaks.forEach((s) => {
        if (!reduce) s.x = s.x > 1.25 ? -0.25 : s.x + s.speed
        const g = ctx.createLinearGradient((s.x - 0.22) * w, 0, (s.x + 0.06) * w, 0)
        g.addColorStop(0, `rgba(${accentRgb},0)`)
        g.addColorStop(0.65, `rgba(${accentRgb},0.055)`)
        g.addColorStop(1, `rgba(${accentRgb},0)`)
        ctx.fillStyle = g
        ctx.fillRect(0, s.y * h - 1.2, w, 2.4)
      })

      // 悬浮尘粒
      dust.forEach((d) => {
        if (!reduce) {
          d.y -= d.vy; d.x += d.vx
          if (d.y < -0.02) d.y = 1.02
          if (d.x < -0.02) d.x = 1.02
          if (d.x > 1.02) d.x = -0.02
        }
        const tw = 0.75 + Math.sin((t + d.x * 400) * 0.02) * 0.25
        ctx.beginPath()
        ctx.fillStyle = `rgba(${dustRgb},${d.a * tw * 0.34})`
        ctx.arc(d.x * w, d.y * h, d.r, 0, Math.PI * 2)
        ctx.fill()
      })
    }
    const draw = () => {
      raf = 0
      if (!visible || videoReady) return
      drawFrame()
      raf = requestAnimationFrame(draw)
    }
    const start = () => {
      if (reduce || !visible || videoReady || raf) return
      raf = requestAnimationFrame(draw)
    }
    const stop = () => {
      if (!raf) return
      cancelAnimationFrame(raf)
      raf = 0
    }
    const stopObserving = observeVisibility(root, (nextVisible) => {
      visible = nextVisible
      if (visible) {
        if (reduce) drawFrame()
        else start()
      } else {
        stop()
      }
    })
    if (reduce) drawFrame()
    else start()

    return () => {
      stop()
      stopObserving()
      window.removeEventListener('resize', resize)
    }
  }, [videoReady, theme])

  return (
    <div className="hero-bg" ref={rootRef}>
      <canvas ref={canvasRef} aria-hidden="true" />
      {hasVideo && (
        <video
          src={`${import.meta.env.BASE_URL}media/hero-bg.mp4`}
          autoPlay muted loop playsInline
          onCanPlay={() => setVideoReady(true)}
          onError={() => { setHasVideo(false); setVideoReady(false) }}
          style={{ position: 'absolute', inset: 0 }}
          aria-hidden="true"
        />
      )}
    </div>
  )
}
