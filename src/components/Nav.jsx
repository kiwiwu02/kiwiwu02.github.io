import { useEffect, useState } from 'react'
import { GraduationCap, Briefcase as BriefcaseSimple, GitBranch, At, DownloadSimple, Moon, Sun } from '@phosphor-icons/react'
import { applyTheme, getInitialTheme, getNextTheme, persistTheme, THEMES } from '../lib/theme'
import { navigateToSection } from '../lib/sectionNavigation'

const NAV_ITEMS = [
  { id: 'education', label: '教育经历' },
  { id: 'experience', label: '实习经历' },
  { id: 'work', label: '项目经历' },
  { id: 'contact', label: '与我联系' },
]

const NAV_ICONS = {
  education: GraduationCap,
  experience: BriefcaseSimple,
  work: GitBranch,
  contact: At,
}

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [activeId, setActiveId] = useState('')
  const [theme, setTheme] = useState(() => {
    const appliedTheme = typeof document !== 'undefined' ? document.documentElement.dataset.theme : undefined
    return appliedTheme || getInitialTheme()
  })
  const resumeHref = `${import.meta.env.BASE_URL}resume.pdf`

  const toggleTheme = () => {
    const nextTheme = getNextTheme(theme)
    setTheme(nextTheme)
    persistTheme(nextTheme)
    applyTheme(nextTheme)
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const sections = ['top', ...NAV_ITEMS.map(({ id }) => id)]
      .map((id) => document.getElementById(id))
      .filter(Boolean)
    if (!sections.length || typeof IntersectionObserver !== 'function') return undefined

    const visible = new Map()
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) visible.set(entry.target.id, entry.boundingClientRect.top)
        else visible.delete(entry.target.id)
      })

      const next = [...visible.entries()].sort((a, b) => a[1] - b[1])[0]?.[0]
      setActiveId(next === 'top' ? '' : next || '')
    }, { rootMargin: '-28% 0px -62% 0px', threshold: 0 })

    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  return (
    <header className={`nav ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-inner">
        <a className="brand" href="#top" aria-label="Kiwi ｜ 吴奇伟">
          <span className="brand-dot" />
          <span className="brand-name">Kiwi</span>
          <span className="brand-role"> ｜ 吴奇伟</span>
        </a>
        <nav className="nav-links" aria-label="主导航">
          {NAV_ITEMS.map(({ id, label }) => {
            const Icon = NAV_ICONS[id]
            return (
              <a
                className={`nav-link ${activeId === id ? 'is-active' : ''}`}
                href={`#${id}`}
                aria-current={activeId === id ? 'page' : undefined}
                onClick={(event) => navigateToSection(event, id)}
                key={id}
              >
                <Icon className="nav-link-icon" size={16} weight="regular" aria-hidden="true" focusable="false" />
                {label}
              </a>
            )
          })}
          <button
            className="theme-toggle"
            type="button"
            onClick={toggleTheme}
            aria-label={theme === THEMES.DARK ? '切换到浅色模式' : '切换到深色模式'}
            aria-pressed={theme === THEMES.LIGHT}
            title={theme === THEMES.DARK ? '切换到浅色模式' : '切换到深色模式'}
          >
            {theme === THEMES.DARK
              ? <Sun className="theme-toggle-icon" weight="regular" aria-hidden="true" focusable="false" />
              : <Moon className="theme-toggle-icon" weight="regular" aria-hidden="true" focusable="false" />}
          </button>
          <a className="btn btn-primary btn-sm" href={resumeHref} download="Kiwi-Wu-Resume.pdf">
            下载简历
            <DownloadSimple className="nav-resume-icon" weight="regular" aria-hidden="true" focusable="false" />
          </a>
        </nav>
      </div>
    </header>
  )
}
