import Nav from './components/Nav'
import Hero from './components/Hero'
import MobileHero from './components/MobileHero'
import About from './components/About'
import Experience from './components/Experience'
import Projects from './components/Projects'
import Contact from './components/Contact'
import PageSnap from './components/PageSnap'
import { useMobileLayout } from './lib/useMobileLayout'

export default function App() {
  const isMobile = useMobileLayout()

  return (
    <PageSnap>
      <>
        <Nav key={isMobile ? 'mobile' : 'desktop'} />
        <main>
          {isMobile ? <MobileHero /> : <Hero />}
          <About />
          <Experience />
          <Projects />
        </main>
        <Contact />
      </>
    </PageSnap>
  )
}
