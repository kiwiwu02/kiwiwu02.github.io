import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

test('About 主体在桌面端也采用上下堆叠结构', () => {
  const css = readFileSync(new URL('../index.css', import.meta.url), 'utf8')
  const layout = css.match(/\.about-main-grid\s*{([\s\S]*?)\n}/)?.[1] ?? ''

  assert.match(layout, /grid-template-columns:\s*1fr/)
  assert.match(layout, /gap:/)
  assert.match(layout, /margin-top:\s*var\(--section-record-gap\)/)
  assert.doesNotMatch(layout, /1\.15fr|\.85fr/)
})

test('About 页面不再渲染额外分隔线节点', () => {
  const css = readFileSync(new URL('../index.css', import.meta.url), 'utf8')
  const component = readFileSync(new URL('../components/About.jsx', import.meta.url), 'utf8')

  assert.doesNotMatch(component, /about-divider/)
  assert.doesNotMatch(css, /\.about-divider\s*\{/)
})

test('教育经历按记录行展开，并支持学校学院信息', () => {
  const css = readFileSync(new URL('../index.css', import.meta.url), 'utf8')
  const component = readFileSync(new URL('../components/About.jsx', import.meta.url), 'utf8')
  const entry = css.match(/\.education-entry\s*{([\s\S]*?)\n}/)?.[1] ?? ''

  assert.match(entry, /padding:/)
  assert.match(entry, /grid-template-columns:/)
  assert.match(component, /className="education-details"/)
  assert.match(component, /item\.faculty/)
  assert.ok(
    component.indexOf('education-period') < component.indexOf('education-school') &&
      component.indexOf('education-school') < component.indexOf('education-degree') &&
      component.indexOf('education-degree') < component.indexOf('education-level') &&
      component.indexOf('education-level') < component.indexOf('education-gpa'),
  )
})

test('教育记录将学校学院置左并将专业学位置右，同时移除橙色标记', () => {
  const css = readFileSync(new URL('../index.css', import.meta.url), 'utf8')
  const component = readFileSync(new URL('../components/About.jsx', import.meta.url), 'utf8')
  const primaryLine = css.match(/\.education-primary-line\s*{([\s\S]*?)\n}/)?.[1] ?? ''
  const program = css.match(/\.education-program\s*{([\s\S]*?)\n}/)?.[1] ?? ''

  assert.match(
    component,
    /<div className="education-primary-line">[\s\S]*className="education-school"[\s\S]*className="education-faculty"[\s\S]*<\/div>\s*\{honorTags\.length > 0 && \(/,
  )
  assert.match(
    component,
    /<div className="education-meta">[\s\S]*className="education-program"[\s\S]*className="education-degree"[\s\S]*className="education-level"/,
  )
  assert.doesNotMatch(component, /education-marker/)
  assert.doesNotMatch(component, /· \{item\.faculty\}/)
  assert.match(primaryLine, /display:\s*flex/)
  assert.match(primaryLine, /align-items:\s*baseline/)
  assert.match(program, /display:\s*flex/)
  assert.match(program, /white-space:\s*nowrap/)
})

test('学校、学院与专业复用同一套标题字体', () => {
  const css = readFileSync(new URL('../index.css', import.meta.url), 'utf8')
  const faculty = css.match(/\.education-faculty\s*{([\s\S]*?)}/)?.[1] ?? ''

  assert.match(faculty, /font-family:\s*inherit/)
  assert.match(faculty, /font-size:\s*inherit/)
  assert.match(faculty, /font-weight:\s*inherit/)
  assert.match(faculty, /line-height:\s*inherit/)
  assert.match(faculty, /color:\s*inherit/)
})

test('上海师范大学荣誉位于第二行并与 GPA 对齐', () => {
  const css = readFileSync(new URL('../index.css', import.meta.url), 'utf8')
  const component = readFileSync(new URL('../components/About.jsx', import.meta.url), 'utf8')
  const details = css.match(/\.education-details\s*{([\s\S]*?)\n}/)?.[1] ?? ''
  const meta = css.match(/\.education-meta\s*{([\s\S]*?)\n}/)?.[1] ?? ''

  assert.ok(component.indexOf('education-honors') < component.indexOf('education-meta'))
  assert.ok(component.indexOf('education-meta') < component.indexOf('education-degree'))
  assert.match(details, /display:\s*flex/)
  assert.match(details, /flex-direction:\s*column/)
  assert.match(details, /row-gap:\s*0\.45rem/)
  assert.match(meta, /display:\s*flex/)
  assert.match(meta, /flex-direction:\s*column/)
  assert.match(meta, /row-gap:\s*0\.45rem/)
  assert.match(css, /\.education-gpa\s*{[\s\S]*margin-top:\s*0;/)

  const mobileCss = css.slice(css.indexOf('@media (max-width: 900px)'))
  assert.match(mobileCss, /\.education-meta\s*{[^}]*flex-direction:\s*row/)
})

test('教育经历统一为时间、主体、关系信息三栏记录行', () => {
  const css = readFileSync(new URL('../index.css', import.meta.url), 'utf8')
  const component = readFileSync(new URL('../components/About.jsx', import.meta.url), 'utf8')
  const entryLayout = css.match(/\.education-entry\s*{([\s\S]*?)\n}/)?.[1] ?? ''

  assert.match(entryLayout, /grid-template-columns:/)
  assert.match(component, /className="education-meta"/)
  assert.match(component, /className="education-honors"/)
  assert.match(component, /className="education-honor-tag"/)
  assert.doesNotMatch(component, /about-awards|award-list|award-entry/)
  assert.doesNotMatch(css, /\.about-records-grid\s*{[^}]*repeat\(2/s)
})

test('荣誉标签嵌套在对应学校的教育条目中', () => {
  const component = readFileSync(new URL('../components/About.jsx', import.meta.url), 'utf8')

  assert.match(component, /awardGroupsByInstitution/)
  assert.match(component, /item\.institution/)
  assert.ok(
    component.indexOf('education-institution') < component.indexOf('education-honors') &&
      component.indexOf('education-honors') < component.indexOf('education-meta'),
  )
})

test('上海师范大学荣誉按奖学金在前并在同一标签流中自然换行', () => {
  const css = readFileSync(new URL('../index.css', import.meta.url), 'utf8')
  const component = readFileSync(new URL('../components/About.jsx', import.meta.url), 'utf8')
  const honors = css.match(/\.education-honors\s*{([\s\S]*?)\n}/)?.[1] ?? ''

  assert.match(component, /education-primary-line/)
  assert.ok(component.indexOf('honors.scholarships') < component.indexOf('honors.recognitions'))
  assert.match(component, /\.\.\.honors\.scholarships,\s*\.\.\.honors\.recognitions/)
  assert.doesNotMatch(component, /education-honors-label/)
  assert.match(honors, /display:\s*flex/)
  assert.match(honors, /flex-wrap:\s*wrap/)
  assert.match(honors, /column-gap:\s*0\.45rem/)
  assert.match(honors, /row-gap:\s*0\.55rem/)
  assert.doesNotMatch(css, /\.education-honor-row--recognitions\s*\{/)
})
