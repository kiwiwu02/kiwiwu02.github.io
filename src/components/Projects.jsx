import Reveal from './Reveal'
import { allProjects } from '../data'
import { navigateToSection } from '../lib/sectionNavigation'
import { GitBranch, Globe } from '@phosphor-icons/react'
import { GitHubIcon } from './icons'
import { trackAnalyticsEvent } from '../lib/analytics'

function getProjectLinks(project) {
  if (Array.isArray(project.links)) return project.links
  if (!project.href) return []

  return [{
    type: project.href.includes('github.com') ? 'github' : 'web',
    href: project.href,
  }]
}

function orderProjectLinks(links) {
  return [...links].sort((a, b) => Number(a.type === 'github') - Number(b.type === 'github'))
}

function handleProjectHeadingClick(event) {
  if (event.target.closest?.('a, button, [role="button"]')) return
  navigateToSection(event, 'work')
}

function ProjectLinkIcon({ link, interactive, project }) {
  const isGithub = link.type === 'github'
  const actionLabel = link.type === 'github' ? '查看项目' : '体验项目'
  const label = `${actionLabel}：${isGithub ? 'GitHub' : '网页'}`
  const icon = isGithub
    ? <GitHubIcon className="project-link-icon-svg" />
    : <Globe className="project-link-icon-svg" weight="regular" aria-hidden="true" focusable="false" />

  if (interactive) {
    return (
      <a
        className="project-link-icon"
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        title={actionLabel}
        data-tooltip={actionLabel}
        onClick={() => trackAnalyticsEvent('project_click', { project, linkType: link.type })}
      >
        {icon}
      </a>
    )
  }

  return (
    <span className="project-link-icon" aria-hidden="true" title={actionLabel} data-tooltip={actionLabel}>
      {icon}
    </span>
  )
}

function ProjectItem({ project, index, featured = false }) {
  const metadataClassName = 'github-item-index time-label'
  const projectDate = project.githubCreated ?? '—'
  const projectLinks = orderProjectLinks(getProjectLinks(project))
  const hasIndependentLinks = projectLinks.length > 1
  const rowContent = (
    <>
      <span className={metadataClassName}>{projectDate}</span>
      <div className="github-item-main">
        <h3 className="github-item-title">{project.title}</h3>
        <p className="github-item-description">{featured ? project.desc : project.description}</p>
      </div>
      <div className="github-item-tags">
        {featured && project.badge && <span className="tag" style={{ borderColor: 'rgba(226,73,47,.5)', color: 'var(--accent)' }}>{project.badge}</span>}
        {project.tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}
      </div>
      <div className="project-link-icons" aria-label={projectLinks.length ? '项目链接' : undefined}>
        {projectLinks.length ? projectLinks.map((link) => (
          <ProjectLinkIcon key={`${link.type}-${link.href}`} link={link} project={project.title} interactive={hasIndependentLinks} />
        )) : <span className="project-link-empty">暂无展示</span>}
      </div>
    </>
  )

  return (
    <Reveal delay={index % 2 ? 'd1' : ''}>
      {projectLinks.length === 1 ? (
        <a
          className="proj-row"
          href={projectLinks[0].href}
          target="_blank"
          rel="noopener noreferrer"
          data-featured={featured ? 'true' : undefined}
          onClick={() => trackAnalyticsEvent('project_click', { project: project.title, linkType: projectLinks[0].type })}
        >
          {rowContent}
        </a>
      ) : (
        <article className="proj-row" data-featured={featured ? 'true' : undefined}>
          {rowContent}
        </article>
      )}
    </Reveal>
  )
}

export default function Projects() {
  return (
    <section className="sec-pad work-section" id="work" data-snap-page="work" data-analytics-section="work">
      <div className="shell">
        <div className="proj-head" onClick={handleProjectHeadingClick}>
          <Reveal>
            <h2 className="sec-title">
              <GitBranch className="sec-title-icon" size="1em" weight="regular" aria-hidden="true" focusable="false" />
              项目经历
            </h2>
          </Reveal>
          <Reveal delay="d2">
            <a className="btn btn-ghost btn-sm" href="https://github.com/kiwiwu02?tab=repositories" target="_blank" rel="noopener noreferrer" onClick={() => trackAnalyticsEvent('project_click', { project: 'all-projects', linkType: 'github' })}>
              <GitHubIcon className="projects-all-link-icon" />
              <span>查看全部</span>
            </a>
          </Reveal>
        </div>

        <div className="proj-list">
          {allProjects.map((project, index) => (
            <ProjectItem project={project} index={index} featured={Boolean(project.cn)} key={project.title} />
          ))}
        </div>
      </div>
    </section>
  )
}
