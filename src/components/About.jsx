import Reveal from './Reveal'
import { GraduationCap } from '@phosphor-icons/react'
import { awards, education } from '../data'
import { groupEducationHonors } from '../lib/aboutAwards'
import { navigateToSection } from '../lib/sectionNavigation'

const awardGroupsByInstitution = groupEducationHonors(awards).reduce((groups, award) => {
  const institution = award.institution || ''
  groups[institution] ??= { scholarships: [], recognitions: [] }
  groups[institution][award.group].push(award)
  return groups
}, {})

export default function About() {
  return (
    <section className="sec-pad about-section" id="education" data-snap-page="education">
      <div className="shell">
        <div className="about-heading" onDoubleClick={(event) => navigateToSection(event, 'education')}>
          <h2 className="sec-title">
            <GraduationCap className="sec-title-icon" size="1em" weight="regular" aria-hidden="true" focusable="false" />
            教育经历
          </h2>
        </div>

        <div className="about-main-grid">
          <div className="education-list">
            {education.map((item, index) => {
              const honors = awardGroupsByInstitution[item.institution] ?? { scholarships: [], recognitions: [] }
              const honorTags = [...honors.scholarships, ...honors.recognitions]

              return (
                <Reveal className="education-entry" key={item.period} delay={index ? 'd2' : 'd1'}>
                  <p className="education-period time-label">{item.period}</p>

                  <div className="education-details">
                    <div className="education-primary-line">
                      <div className="education-school">
                        <p className="education-institution">
                          {item.institutionHref ? (
                            <a className="record-link" href={item.institutionHref} target="_blank" rel="noopener noreferrer">
                              {item.institution}
                            </a>
                          ) : item.institution}
                          {item.faculty && (item.facultyHref ? (
                            <a className="education-faculty record-link" href={item.facultyHref} target="_blank" rel="noopener noreferrer">
                              {item.faculty}
                            </a>
                          ) : (
                            <span className="education-faculty">{item.faculty}</span>
                          ))}
                        </p>
                      </div>
                    </div>

                    {honorTags.length > 0 && (
                      <div className="education-honors" aria-label={`${item.institution}相关荣誉`}>
                        {honorTags.map((honor) => (
                          <span className="education-honor-tag" key={honor.key}>
                            {honor.title}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="education-meta">
                    <div className="education-program">
                      <p className="education-degree">
                        {item.degreeHref ? (
                          <a className="record-link" href={item.degreeHref} target="_blank" rel="noopener noreferrer">
                            {item.degree}
                          </a>
                        ) : item.degree}
                      </p>
                      <p className="education-level">{item.level}</p>
                    </div>
                    {item.gpa && <p className="education-gpa"><span>GPA</span> {item.gpa}</p>}
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
