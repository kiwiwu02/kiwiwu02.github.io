import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { splitIntoHighlightParts } from './experienceDetails.js'

test('实习详情简介按句子拆分，完整句子作为独立高亮单元', () => {
  assert.deepEqual(
    splitIntoHighlightParts('第一句说明。第二句说明！第三句说明？'),
    ['第一句说明。', '第二句说明！', '第三句说明？'],
  )
})

test('没有句末标点的详情内容作为一个完整 part', () => {
  assert.deepEqual(
    splitIntoHighlightParts('FastAPI、LangGraph、LangChain'),
    ['FastAPI、LangGraph、LangChain'],
  )
})

test('详情弹窗为句子、工作内容 part 和技术栈标签提供独立悬浮高亮', () => {
  const source = readFileSync(new URL('../components/Experience.jsx', import.meta.url), 'utf8')
  const css = readFileSync(new URL('../index.css', import.meta.url), 'utf8')

  assert.match(source, /splitIntoHighlightParts/)
  assert.match(source, /experience-highlight-part/)
  assert.match(source, /className="experience-detail-part"/)
  assert.match(css, /\.experience-highlight-part:hover/)
  assert.match(css, /\.experience-detail-part:hover/)
  assert.match(css, /\.experience-detail-chip:hover/)
})
