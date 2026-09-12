import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

const projectRoot = new URL('../../', import.meta.url)
const readProjectFile = (relativePath) => readFileSync(new URL(relativePath, projectRoot), 'utf8')
const projectFileExists = (relativePath) => existsSync(new URL(relativePath, projectRoot))

test('GitHub Pages 工作流使用 npm ci 构建并发布 dist', () => {
  assert.equal(projectFileExists('.github/workflows/deploy-pages.yml'), true)

  const workflow = readProjectFile('.github/workflows/deploy-pages.yml')
  assert.match(workflow, /npm ci/)
  assert.match(workflow, /run: npm test/)
  assert.match(workflow, /npm run build:static/)
  assert.match(workflow, /actions\/upload-pages-artifact/)
  assert.match(workflow, /actions\/deploy-pages/)
})

test('宠物切帧脚本使用可移植的输入参数', () => {
  const script = readProjectFile('tools/slice_pet_frames.py')

  assert.match(script, /import argparse/)
  assert.match(script, /add_argument\(['"]sheet['"],/)
  assert.match(script, /--output-dir/)
  assert.match(script, /--look-sheet/)
  assert.doesNotMatch(script, /\/Users\/kiwimacbook\/\.codex/)
})

test('公开 README 不包含本机资源路径和已移除章节', () => {
  const readme = readProjectFile('README.md')

  assert.doesNotMatch(readme, /\/Users\//)
  assert.doesNotMatch(readme, /\.codex\/pets/)
  assert.doesNotMatch(readme, /Strengths/)
  assert.match(readme, /GitHub Pages/)
})

test('宠物调试 API 只在开发环境注册', () => {
  const pet = readProjectFile('src/components/Pet.jsx')

  assert.match(pet, /if \(import\.meta\.env\.DEV\)\s*{\s*window\.__kiwiPet/)
})

test('公开构建不保留已确认未引用的旧项目资源和废弃章节组件', () => {
  [
    'public/media/project-industry.jpg',
    'public/media/project-omni.jpg',
    'public/media/project-research.jpg',
    'public/media/project-robot.jpg',
    'src/components/Strengths.jsx',
  ].forEach((relativePath) => {
    assert.equal(projectFileExists(relativePath), false, `${relativePath} should be removed`)
  })
})
