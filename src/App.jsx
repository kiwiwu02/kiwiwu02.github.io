import Nav from './components/Nav'
import Hero from './components/Hero'
import About from './components/About'
import Experience from './components/Experience'
import Projects from './components/Projects'
import Contact from './components/Contact'
import PageSnap from './components/PageSnap'

export default function App() {
  return (
    <PageSnap>
      <>
        <Nav />
        <main>
          <Hero />
          <About />
          <Experience />
          <Projects />
        </main>
        <Contact />
      </>
    </PageSnap>
  )
}
