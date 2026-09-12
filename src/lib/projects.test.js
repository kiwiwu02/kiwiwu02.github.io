import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import * as data from '../data.js'

test('个人项目按指定顺序暴露四个带封面的主项目', () => {
  assert.deepEqual(
    data.projects?.map(({ title, cover }) => ({ title, cover })),
    [
      { title: 'HiAgent', cover: 'media/project-hiagent.png' },
      { title: 'OmniAgent', cover: 'media/project-omni.png' },
      { title: 'Shenzhen Robot Valley', cover: 'media/project-robotuo.png' },
      { title: 'Cairn', cover: 'media/project-cairn.png' },
    ],
  )
})

test('GitHub 项目列表只使用名称、描述和标签，不依赖封面图', () => {
  assert.ok(Array.isArray(data.githubProjects))
  assert.ok(data.githubProjects.length > 0)
  assert.ok(data.githubProjects.every((project) => (
    project.href?.startsWith('https://github.com/kiwiwu02/')
      && project.description
      && project.tags?.length === 1
      && !project.cover
  )))
})

test('每个项目只保留一个最能说明项目定位的标签', () => {
  assert.deepEqual(
    data.projects.map(({ title, tags }) => ({ title, tag: tags?.[0] })),
    [
      { title: 'HiAgent', tag: '工业设备维保 Agent' },
      { title: 'OmniAgent', tag: 'Multi-Agent' },
      { title: 'Shenzhen Robot Valley', tag: '深圳机器人谷官网' },
      { title: 'Cairn', tag: 'AI 学习与工作区' },
    ],
  )

  assert.deepEqual(
    data.githubProjects.map(({ title, tags }) => ({ title, tag: tags?.[0] })),
    [
      { title: 'creating-skills', tag: 'Agent Skill' },
      { title: 'exhibition-agent', tag: '客户背调 Agent' },
      { title: 'Dify_Project', tag: 'Dify Workflow' },
      { title: 'Academic_Question_Answering_Agent', tag: '学术问答 Agent' },
      { title: 'AI_Smart_Naming', tag: 'AI 取名 Agent' },
      { title: 'Qwen-LangChain-Gradio-Chatbot', tag: 'Qwen Chatbot' },
      { title: 'Quickstart-LangChain-V1.1.0', tag: 'LangChain 学习' },
      { title: 'GroupBT_UM_Programming_Project', tag: '新闻数据分析' },
      { title: 'GenLab_GAN-WGAN-WGANGP', tag: 'GAN-WGAN-WGANGP' },
      { title: 'RelationExtraction_Bert_Project', tag: '医疗关系抽取' },
      { title: 'LLM-RAG-Agent-LangChain-learing', tag: 'RAG' },
    ],
  )
})

test('项目经历使用合并后的时间排序列表', () => {
  const component = readFileSync(new URL('../components/Projects.jsx', import.meta.url), 'utf8')

  assert.match(component, /allProjects\.map/)
  assert.match(component, /featured=\{Boolean\(project\.cn\)\}/)
  assert.match(component, /className="proj-list"/)
  assert.match(component, /project\.githubCreated/)
  assert.doesNotMatch(component, /project\.updated/)
  assert.doesNotMatch(component, /className="github-projects"/)
  assert.doesNotMatch(component, /className="github-list"/)
})

test('项目经历标题与项目链接按来源显示对应图标', () => {
  const component = readFileSync(new URL('../components/Projects.jsx', import.meta.url), 'utf8')
  const contact = readFileSync(new URL('../components/Contact.jsx', import.meta.url), 'utf8')
  const cairn = data.projects.find(({ title }) => title === 'Cairn')

  assert.deepEqual(cairn?.links, [
    { type: 'github', href: 'https://github.com/kiwiwu02/Cairn' },
    { type: 'web', href: 'https://kiwiwu02.github.io/Cairn/' },
  ])
  assert.match(component, /<GitHubIcon/)
  assert.match(component, /import \{ GitHubIcon \} from '\.\/icons'/)
  assert.match(contact, /import \{ GitHubIcon \} from '\.\/icons'/)
  assert.doesNotMatch(component, /GithubLogo/)
  assert.match(component, /Globe/)
  assert.match(component, /project-link-icons/)
  assert.match(component, /actionLabel = link\.type === 'github' \? '查看项目' : '体验项目'/)
  assert.match(component, /title=\{actionLabel\}/)
  assert.match(component, /data-tooltip=\{actionLabel\}/)
  assert.match(component, /项目经历/)
  assert.doesNotMatch(component, /github-item-arrow/)
})

test('全部仓库入口使用 GitHub 图标并显示查看全部', () => {
  const component = readFileSync(new URL('../components/Projects.jsx', import.meta.url), 'utf8')
  const css = readFileSync(new URL('../index.css', import.meta.url), 'utf8')

  assert.match(component, /<GitHubIcon className="projects-all-link-icon" \/>/)
  assert.match(component, /<span>查看全部<\/span>/)
  assert.doesNotMatch(component, /全部仓库 ↗/)
  assert.match(css, /\.projects-all-link-icon\s*{[^}]*width:\s*1rem[^}]*height:\s*1rem[^}]*flex:\s*0 0 auto;/)
})

test('个人项目标题与列表采用统一的收紧间距', () => {
  const css = readFileSync(new URL('../index.css', import.meta.url), 'utf8')
  const projectList = css.match(/\.proj-list\s*\{([^}]*)\}/)?.[1] ?? ''

  assert.match(projectList, /margin-top:\s*var\(--section-record-gap\)/)
})

test('主项目改为纯文字项目行，不渲染图片或灯箱', () => {
  const component = readFileSync(new URL('../components/Projects.jsx', import.meta.url), 'utf8')
  const css = readFileSync(new URL('../index.css', import.meta.url), 'utf8')

  assert.match(component, /allProjects\.map/)
  assert.doesNotMatch(component, /className="proj-media"/)
  assert.doesNotMatch(component, /className="project-lightbox"/)
  assert.doesNotMatch(component, /activeProject/)
  assert.match(css, /\.proj-row\s*\{[\s\S]*grid-template-columns:\s*var\(--record-first-col\)\s+minmax\(0, 2\.1fr\)\s+minmax\(14rem, 0\.65fr\)\s+auto/)
  assert.match(css, /\.proj-row\s*\{[\s\S]*gap:\s*clamp\(1\.25rem,\s*2vw,\s*2\.5rem\)/)
  assert.doesNotMatch(css, /\.project-lightbox\s*\{/)
})

test('项目链接图标提供悬浮提示和键盘焦点状态', () => {
  const css = readFileSync(new URL('../index.css', import.meta.url), 'utf8')

  assert.match(css, /\.project-link-icon\s*\{[\s\S]*position:\s*relative/)
  assert.match(css, /\.project-link-icon::after\s*\{[\s\S]*content:\s*attr\(data-tooltip\)/)
  assert.match(css, /\.project-link-icon:hover::after,\s*\.project-link-icon:focus-visible::after/)
})

test('项目链接将网站置左、GitHub 置右，并为无展示链接的项目显示状态', () => {
  const component = readFileSync(new URL('../components/Projects.jsx', import.meta.url), 'utf8')
  const css = readFileSync(new URL('../index.css', import.meta.url), 'utf8')

  assert.match(component, /function orderProjectLinks\(links\)/)
  assert.match(component, /const projectLinks = orderProjectLinks\(getProjectLinks\(project\)\)/)
  assert.match(component, /projectLinks\.length \? projectLinks\.map\([\s\S]*ProjectLinkIcon[\s\S]*: <span className="project-link-empty">暂无展示<\/span>/)
  assert.match(css, /\.project-link-empty\s*{[\s\S]*white-space:\s*nowrap;/)
})

test('GitHub 项目描述保持单行显示', () => {
  const css = readFileSync(new URL('../index.css', import.meta.url), 'utf8')

  assert.match(css, /\.github-item-description\s*{[^}]*white-space:\s*nowrap/)
  assert.match(css, /\.github-item-description\s*{[^}]*text-overflow:\s*ellipsis/)
  assert.doesNotMatch(css, /\.github-item-description\s*{[^}]*-webkit-line-clamp/)
})

test('所有项目使用真实 GitHub 仓库首次创建年月，无法对应公开仓库时留空', () => {
  assert.deepEqual(
    data.projects.map(({ title, githubCreated }) => ({ title, githubCreated })),
    [
      { title: 'HiAgent', githubCreated: '2026.08' },
      { title: 'OmniAgent', githubCreated: '2026.05' },
      { title: 'Shenzhen Robot Valley', githubCreated: '2026.05' },
      { title: 'Cairn', githubCreated: '2026.09' },
    ],
  )

  assert.deepEqual(
    data.githubProjects.map(({ title, githubCreated }) => ({ title, githubCreated })),
    [
      { title: 'creating-skills', githubCreated: '2026.07' },
      { title: 'exhibition-agent', githubCreated: '2026.04' },
      { title: 'Dify_Project', githubCreated: '2026.03' },
      { title: 'Academic_Question_Answering_Agent', githubCreated: '2026.02' },
      { title: 'AI_Smart_Naming', githubCreated: '2026.02' },
      { title: 'Qwen-LangChain-Gradio-Chatbot', githubCreated: '2026.01' },
      { title: 'Quickstart-LangChain-V1.1.0', githubCreated: '2025.12' },
      { title: 'GroupBT_UM_Programming_Project', githubCreated: '2025.12' },
      { title: 'GenLab_GAN-WGAN-WGANGP', githubCreated: '2025.10' },
      { title: 'RelationExtraction_Bert_Project', githubCreated: '2025.11' },
      { title: 'LLM-RAG-Agent-LangChain-learing', githubCreated: '2026.01' },
    ],
  )

  assert.ok(data.projects.every((project) => project.githubCreated === null || /^\d{4}\.\d{2}$/.test(project.githubCreated)))
  assert.ok(data.githubProjects.every((project) => /^\d{4}\.\d{2}$/.test(project.githubCreated)))
})

test('项目经历按首次上传年月从新到旧合并排序', () => {
  assert.deepEqual(
    data.allProjects.map(({ title, githubCreated }) => ({ title, githubCreated })),
    [
      { title: 'Cairn', githubCreated: '2026.09' },
      { title: 'HiAgent', githubCreated: '2026.08' },
      { title: 'creating-skills', githubCreated: '2026.07' },
      { title: 'OmniAgent', githubCreated: '2026.05' },
      { title: 'Shenzhen Robot Valley', githubCreated: '2026.05' },
      { title: 'exhibition-agent', githubCreated: '2026.04' },
      { title: 'Dify_Project', githubCreated: '2026.03' },
      { title: 'Academic_Question_Answering_Agent', githubCreated: '2026.02' },
      { title: 'AI_Smart_Naming', githubCreated: '2026.02' },
      { title: 'Qwen-LangChain-Gradio-Chatbot', githubCreated: '2026.01' },
      { title: 'LLM-RAG-Agent-LangChain-learing', githubCreated: '2026.01' },
      { title: 'Quickstart-LangChain-V1.1.0', githubCreated: '2025.12' },
      { title: 'GroupBT_UM_Programming_Project', githubCreated: '2025.12' },
      { title: 'RelationExtraction_Bert_Project', githubCreated: '2025.11' },
      { title: 'GenLab_GAN-WGAN-WGANGP', githubCreated: '2025.10' },
    ],
  )
})

test('前四个主项目时间使用普通时间色，不使用橙色强调', () => {
  const css = readFileSync(new URL('../index.css', import.meta.url), 'utf8')

  assert.doesNotMatch(css, /\.proj-row\[data-featured="true"\] \.github-item-index\s*\{[^}]*color:\s*var\(--accent\)/)
  assert.match(css, /\.time-label\s*\{[^}]*color:\s*var\(--text-3\)/)
})

test('项目标签使用 muted 边框与文字，不抢项目标题注意力', () => {
  const css = readFileSync(new URL('../index.css', import.meta.url), 'utf8')

  assert.match(css, /\.work-section \.proj-row \.github-item-tags \.tag\s*{[\s\S]*?color:\s*var\(--record-hover-muted, var\(--text-3\)\)\s*!important;/)
  assert.match(css, /\.work-section \.proj-row \.github-item-tags \.tag\s*{[\s\S]*?border-color:\s*color-mix\(in srgb, var\(--record-hover-line, var\(--line\)\) 72%, transparent\)\s*!important;/)
  assert.match(css, /\.work-section \.proj-row \.github-item-tags \.tag\s*{[\s\S]*?background:\s*transparent;/)
})
