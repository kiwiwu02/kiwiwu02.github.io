import { Briefcase, FolderSimple, GraduationCap } from '@phosphor-icons/react'
import Pet from './Pet'
import { profile } from '../data'
import { navigateToSection } from '../lib/sectionNavigation'
import './MobileHero.css'

const headlineParts = profile.heroHeadline.split('，')
const mobileHeadlineIntro = headlineParts.slice(0, 2).join('，')
const mobileHeadlineRole = headlineParts.slice(2).join('，')
const mobileDescription = `${profile.heroIntro.replace('的工程系统', '的系统')}，${profile.heroFocus.replace('Evaluation 的工程产品落地', 'Eval 工程产品落地')}`
const sectionLinks = [
  { id: 'education', label: 'Education', Icon: GraduationCap },
  { id: 'experience', label: 'Experience', Icon: Briefcase },
  { id: 'work', label: 'Project', Icon: FolderSimple },
]

function AnimatedHeadlineLine({ text, className = '' }) {
  const letters = Array.from(text)
  const lastIndex = letters.length - 1
  const center = lastIndex / 2

  return (
    <span className={`m-hero-title-line hero-headline-wave ${className}`.trim()}>
      {letters.map((letter, index) => {
        const visibleLetter = letter === ' ' ? '\u00a0' : letter
        const edgeDistance = Math.min(index, lastIndex - index)
        const centerDistance = Math.abs(index - center)

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
  )
}

export default function MobileHero() {
  return (
    <section className="m-hero" id="top" data-snap-page="hero">
      <div className="shell m-hero-inner">
        <h1 className="m-hero-title" aria-label={profile.heroHeadline}>
          <AnimatedHeadlineLine text={mobileHeadlineIntro} />
          <AnimatedHeadlineLine text={mobileHeadlineRole} className="m-hero-role" />
        </h1>

        <p className="m-hero-description">{mobileDescription}</p>

        <nav className="m-hero-links" aria-label="章节快捷入口">
          {sectionLinks.map(({ id, label, Icon }) => (
            <a className="btn btn-ghost" href={`#${id}`} onClick={event => navigateToSection(event, id)} key={id}>
              <Icon weight="regular" aria-hidden="true" focusable="false" />
              {label}
            </a>
          ))}
        </nav>

        <div className="m-hero-pet">
          <Pet mode="embed" profile="hero" height="clamp(140px, 38vw, 170px)" autoWave />
        </div>
      </div>
    </section>
  )
}
