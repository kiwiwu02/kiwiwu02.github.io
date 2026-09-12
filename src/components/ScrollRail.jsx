import { useEffect, useState } from 'react'
import { getActiveSectionIndex, getProgressPercentage } from '../lib/scrollRail'

const sections = [
  { id: 'top', label: 'HERO' },
  { id: 'education', label: 'EDUCATION' },
  { id: 'experience', label: 'EXPERIENCE' },
  { id: 'work', label: 'WORK' },
  { id: 'contact', label: 'CONTACT' },
]

export default function ScrollRail() {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const pages = [...document.querySelectorAll('[data-snap-page]')]
    if (!pages.length) return undefined

    const updateActiveSection = () => {
      const pageOffsets = pages.map((page) => page.getBoundingClientRect().top + window.scrollY)
      const nextIndex = getActiveSectionIndex(window.scrollY, pageOffsets, window.innerHeight)
      setActiveIndex((currentIndex) => currentIndex === nextIndex ? currentIndex : nextIndex)
    }

    updateActiveSection()

    const observer = typeof IntersectionObserver === 'function'
      ? new IntersectionObserver(updateActiveSection, {
          rootMargin: '-42% 0px -42% 0px',
          threshold: 0,
        })
      : null

    observer?.observe(pages[0])
    pages.slice(1).forEach((page) => observer?.observe(page))
    window.addEventListener('resize', updateActiveSection)

    return () => {
      observer?.disconnect()
      window.removeEventListener('resize', updateActiveSection)
    }
  }, [])

  const progress = getProgressPercentage(activeIndex, sections.length)

  const jumpToSection = (id) => {
    const section = document.getElementById(id)
    if (!section) return

    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    section.scrollIntoView({ block: 'start', behavior: prefersReducedMotion ? 'auto' : 'smooth' })
  }

  return (
    <nav className="scroll-rail" aria-label="页面章节导航">
      <span className="scroll-rail-kicker" aria-hidden="true">SCROLL</span>

      <div className="scroll-rail-track">
        <span className="scroll-rail-progress" style={{ height: `${progress}%` }} aria-hidden="true" />
        <div className="scroll-rail-items">
          {sections.map((section, index) => (
            <button
              className={`scroll-rail-item${activeIndex === index ? ' is-active' : ''}`}
              type="button"
              key={section.id}
              onClick={() => jumpToSection(section.id)}
              aria-label={`跳转到${section.label}`}
              aria-current={activeIndex === index ? 'step' : undefined}
            >
              <span className="scroll-rail-label" aria-hidden="true">{section.label}</span>
              <span className="scroll-rail-dot" aria-hidden="true" />
            </button>
          ))}
        </div>
      </div>

      <span className="scroll-rail-arrow" aria-hidden="true">↓</span>
    </nav>
  )
}
