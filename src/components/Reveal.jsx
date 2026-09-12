import { useEffect, useRef } from 'react'

/** 滚动进入视口渐显容器 */
export default function Reveal({ children, delay = '', as: Tag = 'div', className = '', ...rest }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          e.target.classList.toggle('in', e.isIntersecting)
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <Tag ref={ref} className={`reveal ${delay} ${className}`} {...rest}>
      {children}
    </Tag>
  )
}
