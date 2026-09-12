import HeroBackground from './HeroBackground'
import Pet from './Pet'
import { Briefcase, FolderSimple, GraduationCap } from '@phosphor-icons/react'
import { profile } from '../data'
import { navigateToSection } from '../lib/sectionNavigation'

const heroHeadlineText = profile.heroHeadline
const heroHeadlineLetters = Array.from(heroHeadlineText)
const heroHeadlineLastIndex = heroHeadlineLetters.length - 1
const heroHeadlineCenter = heroHeadlineLastIndex / 2

export default function Hero() {
  return (
    <section className="hero" id="top" data-snap-page="hero">
      <HeroBackground />
      <div className="hero-veil" />
      <div className="hero-grid-lines" />

      <div className="shell hero-inner">
        <div className="hero-copy">
          <p className="hero-sub">
            <strong className="hero-headline">
              <span className="hero-headline-wave">
                <span className="hero-headline-accessible">{heroHeadlineText}</span>
                {heroHeadlineLetters.map((letter, index) => {
                  const visibleLetter = letter === ' ' ? '\u00a0' : letter
                  const edgeDistance = Math.min(index, heroHeadlineLastIndex - index)
                  const centerDistance = Math.abs(index - heroHeadlineCenter)

                  return (
                    <span
                      className="hero-headline-letter"
                      aria-hidden="true"
                      data-letter={visibleLetter}
                      key={`${visibleLetter}-${index}`}
                      style={{
                        '--letter-edge-distance': edgeDistance,
                        '--letter-center-distance': centerDistance,
                      }}
                    >
                      {visibleLetter}
                    </span>
                  )
                })}
              </span>
            </strong>
            <span className="hero-intro-copy">
              <span className="hover-accent hero-copy-line">{profile.heroIntro}</span>
              <br />
              <span className="hover-accent hero-copy-line">{profile.heroFocus}</span>
            </span>
          </p>

          <div className="hero-tags">
            {profile.stack.map((s) => (
              <span className="tag" key={s}>{s}</span>
            ))}
          </div>

          <div className="hero-cta">
            <a className="btn btn-ghost" href="#education" onClick={(event) => navigateToSection(event, 'education')}>
              <GraduationCap className="hero-section-icon" weight="regular" aria-hidden="true" focusable="false" />
              Education
            </a>
            <a className="btn btn-ghost" href="#experience" onClick={(event) => navigateToSection(event, 'experience')}>
              <Briefcase className="hero-section-icon" weight="regular" aria-hidden="true" focusable="false" />
              Experience
            </a>
            <a className="btn btn-ghost" href="#work" onClick={(event) => navigateToSection(event, 'work')}>
              <FolderSimple className="hero-section-icon" weight="regular" aria-hidden="true" focusable="false" />
              Project
            </a>
          </div>
        </div>

        <div className="hero-visual">
          <Pet mode="embed" profile="hero" height="clamp(198px, 21.6vw, 291px)" autoWave />
        </div>
      </div>

    </section>
  )
}
