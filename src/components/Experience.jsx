import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Briefcase as BriefcaseSimple, X } from '@phosphor-icons/react'
import Reveal from './Reveal'
import { experience } from '../data'
import { navigateToSection } from '../lib/sectionNavigation'
import { splitIntoHighlightParts } from '../lib/experienceDetails'

const FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  'a[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

function HighlightedText({ text }) {
  return splitIntoHighlightParts(text).map((part, index) => (
    <span className="experience-highlight-part" key={`${part}-${index}`}>{part}</span>
  ))
}

function ExperienceDetailModal({ item, onClose, triggerRef }) {
  const dialogRef = useRef(null)
  const closeButtonRef = useRef(null)

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow
    const previousHtmlOverflow = document.documentElement.style.overflow
    const previousActiveElement = document.activeElement

    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== 'Tab') return

      const focusable = [...(dialogRef.current?.querySelectorAll(FOCUSABLE_SELECTOR) ?? [])]
        .filter((element) => element.getAttribute('aria-hidden') !== 'true')
      if (!focusable.length) {
        event.preventDefault()
        dialogRef.current?.focus()
        return
      }

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (!dialogRef.current?.contains(document.activeElement)) {
        event.preventDefault()
        first.focus()
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousBodyOverflow
      document.documentElement.style.overflow = previousHtmlOverflow
      if (triggerRef.current?.isConnected) triggerRef.current.focus()
      else if (previousActiveElement?.focus) previousActiveElement.focus()
    }
  }, [onClose, triggerRef])

  const modal = (
    <div
      className="experience-modal"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        className="experience-modal-card"
        id="experience-detail-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="experience-detail-title"
        aria-describedby="experience-detail-summary"
        tabIndex={-1}
        ref={dialogRef}
      >
        <header className="experience-modal-header">
          <div>
            <p className="experience-modal-kicker">{item.when} / {item.company}</p>
            <h3 id="experience-detail-title">{item.role}</h3>
          </div>
          <button
            className="experience-modal-close"
            type="button"
            onClick={onClose}
            aria-label="关闭实习详情"
            ref={closeButtonRef}
          >
            <X weight="regular" aria-hidden="true" focusable="false" />
          </button>
        </header>

        <div className="experience-modal-content">
          <section className="experience-detail-section">
            <h4>项目简介</h4>
            <p id="experience-detail-summary"><HighlightedText text={item.details.summary} /></p>
          </section>

          <section className="experience-detail-section">
            <h4>技术栈</h4>
            <div className="experience-detail-stack">
              {item.details.stack.map((technology) => (
                <span className="experience-detail-chip" key={technology}>{technology}</span>
              ))}
            </div>
          </section>

          <section className="experience-detail-section">
            <h4>工作内容</h4>
            <ol className="experience-detail-points">
              {item.details.points.map((point) => <li className="experience-detail-part" key={point}>{point}</li>)}
            </ol>
          </section>
        </div>
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}

export default function Experience() {
  const [selectedItem, setSelectedItem] = useState(null)
  const triggerRef = useRef(null)

  const openDetails = (item, event) => {
    triggerRef.current = event.currentTarget
    setSelectedItem(item)
  }

  const closeDetails = () => setSelectedItem(null)

  return (
    <section className="sec-pad experience-section" id="experience" data-snap-page="experience">
      <div className="shell">
        <Reveal onDoubleClick={(event) => navigateToSection(event, 'experience')}>
          <h2 className="sec-title">
            <BriefcaseSimple className="sec-title-icon" size="1em" weight="regular" aria-hidden="true" focusable="false" />
            实习经历
          </h2>
        </Reveal>

        <div className="timeline experience-timeline">
          {experience.map((item, index) => (
            <Reveal as="article" className="tl-item" key={item.company} delay={index ? `d${Math.min(index, 3)}` : ''}>
              <div
                className="tl-detail-trigger"
                role="button"
                tabIndex={0}
                aria-haspopup="dialog"
                aria-controls="experience-detail-dialog"
                aria-label={`查看${item.role}详情`}
                onClick={(event) => openDetails(item, event)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    openDetails(item, event)
                  }
                }}
              >
                <div className="tl-when time-label">{item.when}</div>
                <div className="tl-body">
                  <div className="tl-heading">
                    <h4>
                      <span className="tl-role">{item.role}</span>
                    </h4>
                    <span className="tl-detail-hint" aria-hidden="true">↗</span>
                  </div>
                  <p>{item.desc}</p>
                  {item.extra && <p className="tl-extra">{item.extra}</p>}
                </div>
              </div>
              <div className="tl-company">
                {item.companyHref ? (
                  <a className="record-link" href={item.companyHref} target="_blank" rel="noopener noreferrer">
                    {item.company}
                  </a>
                ) : item.company}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
      {selectedItem && (
        <ExperienceDetailModal item={selectedItem} onClose={closeDetails} triggerRef={triggerRef} />
      )}
    </section>
  )
}
