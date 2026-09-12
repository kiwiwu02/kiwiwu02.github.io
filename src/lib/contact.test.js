import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

test('联系模块将寻找与秋招届次作为同一强调单元', () => {
  const source = readFileSync(new URL('../components/Contact.jsx', import.meta.url), 'utf8')

  assert.match(source, /正在<em>寻找 2027 届秋招<\/em>机会/)
  assert.match(source, /聚焦 <em>AI Agent \/ 大模型应用<\/em>方向/)
  assert.doesNotMatch(source, /正在寻找\s*<em>2027 届秋招<\/em>机会/)
  assert.doesNotMatch(source, /聚焦 AI Agent \/ 大模型应用方向\s*<\//)
})

test('联系标题 hover 时交换外部文字和内部强调色', () => {
  const styles = readFileSync(new URL('../index.css', import.meta.url), 'utf8')

  assert.match(styles, /\.contact-title-line:hover\s*\{[^}]*color:\s*var\(--accent\)/)
  assert.match(styles, /\.contact-title-line:hover\s+em\s*\{[^}]*color:\s*var\(--text\)/)
  assert.doesNotMatch(styles, /\.contact-title\s+em:hover\s*\{[^}]*color:\s*var\(--accent-2\)/)
})

test('联系页底部社交入口提供明确的悬浮提示', () => {
  const source = readFileSync(new URL('../components/Contact.jsx', import.meta.url), 'utf8')

  assert.match(source, /data-copy-hint=\{copied === 'wechat' \? '✓ 已复制' : '复制微信号'\}/)
  assert.match(source, /className="contact-social contact-social-tooltip"[\s\S]*data-hover-hint="打开哔哩哔哩主页"/)
  assert.match(source, /className="contact-social contact-social-tooltip"[\s\S]*data-hover-hint="打开 GitHub 主页"/)
})

test('联系页 footer 横线贯穿版心，内容按鼠标向下意图展开', () => {
  const source = readFileSync(new URL('../components/Contact.jsx', import.meta.url), 'utf8')
  const styles = readFileSync(new URL('../index.css', import.meta.url), 'utf8')

  assert.match(source, /const \[footerIntent, setFooterIntent\] = useState\(false\)/)
  assert.match(source, /onPointerMove=\{handleFooterPointerMove\}/)
  assert.match(source, /onPointerLeave=\{handleFooterPointerLeave\}/)
  assert.match(source, /onFocusCapture=\{\(\) => setFooterIntent\(true\)\}/)
  assert.match(styles, /\.contact-foot\s*\{[\s\S]*?width:\s*100%/)
  assert.match(styles, /\.contact-foot\s*\{[\s\S]*?padding-inline:\s*max\(1rem,\s*calc\(\(100%\s*-\s*var\(--shell\)\)\s*\/\s*2\)\)/)
  assert.match(styles, /\.contact-foot\s*\{[\s\S]*?border-top:\s*1px\s+solid\s+transparent/)
  assert.match(styles, /\.contact-foot\s*\{[\s\S]*?transition:\s*border-top-color\s+0\.35s/)
  assert.match(styles, /\.contact-foot\s*>\s*\*\s*\{[\s\S]*?opacity:\s*0/)
  assert.match(styles, /\.contact-foot\s*>\s*\*\s*\{[\s\S]*?transition:\s*opacity\s+0\.35s[^;]*,\s*transform\s+0\.35s/)
  assert.match(styles, /\.contact\.has-footer-intent\s+\.contact-foot,\s*\.contact-foot:focus-within\s*\{[\s\S]*?border-top-color:\s*var\(--line\)/)
  assert.match(styles, /\.contact\.has-footer-intent\s+\.contact-foot\s*>\s*\*,\s*\.contact-foot:focus-within\s*>\s*\*\s*\{[\s\S]*?opacity:\s*1/)
  assert.match(styles, /@media\s*\(hover:\s*none\),\s*\(pointer:\s*coarse\)[\s\S]*?\.contact-foot\s*\{[\s\S]*?border-top-color:\s*var\(--line\)/)
})

test('联系模块顶部不显示分隔线', () => {
  const styles = readFileSync(new URL('../index.css', import.meta.url), 'utf8')

  assert.doesNotMatch(styles, /\.contact\s*\{[^}]*border-top:/)
})

test('联系页底部 pet 与 Footer 在同一底部流中对齐', () => {
  const styles = readFileSync(new URL('../index.css', import.meta.url), 'utf8')

  assert.match(styles, /\.contact\s*\{[^}]*justify-content:\s*flex-start/s)
  assert.match(styles, /\.contact-inner\s*\{[^}]*flex:\s*1\s+0\s+auto[^}]*justify-content:\s*center/s)
  assert.match(styles, /\.contact-pet\s*{[^}]*margin-top:\s*clamp\(0\.75rem,\s*1\.5vh,\s*1\.5rem\)/s)
  assert.doesNotMatch(styles, /\.contact-pet\s*{[^}]*margin-top:\s*auto/s)
  assert.match(styles, /\.contact-foot\s*\{[^}]*margin-top:\s*0/s)
})

test('联系页与 Hero 在桌面端独占稳定视口，窄屏保留自然增长安全性', () => {
  const styles = readFileSync(new URL('../index.css', import.meta.url), 'utf8')
  const contact = styles.match(/\.contact\s*{([\s\S]*?)\n}/)?.[1] ?? ''

  assert.match(contact, /display:\s*flex/)
  assert.match(contact, /justify-content:\s*flex-start/)
  assert.match(contact, /min-height:\s*100svh/)
  assert.doesNotMatch(contact, /min-height:\s*100vh/)
  assert.doesNotMatch(contact, /min-height:\s*clamp\(/)
  assert.match(styles, /@media\s*\(min-width:\s*901px\)\s*and\s*\(min-height:\s*768px\)[\s\S]*?\.hero,\s*\.contact\s*\{[\s\S]*?height:\s*100svh/s)
})

test('联系页桌面端使用分层宽度并拉开纵向节奏', () => {
  const styles = readFileSync(new URL('../index.css', import.meta.url), 'utf8')

  assert.match(styles, /\.contact\s*{[^}]*--contact-shell:\s*min\(1280px,\s*calc\(100%\s*-\s*96px\)\)/s)
  assert.match(styles, /\.contact-inner\s*{[^}]*width:\s*var\(--contact-shell\)/s)
  assert.match(styles, /\.contact-inner > \.reveal:first-child\s*{[^}]*width:\s*min\(100%,\s*1140px\)/s)
  assert.match(styles, /\.contact-inner > \.reveal:nth-child\(2\)\s*{[^}]*width:\s*min\(100%,\s*950px\)/s)
  assert.match(styles, /\.contact-actions\s*{[^}]*gap:\s*clamp\(/s)
  assert.match(styles, /\.contact-pet\s*{[^}]*padding-top:\s*clamp\(0\.5rem,\s*1vh,\s*0\.75rem\)[^}]*margin-bottom:\s*clamp\(1\.5rem,\s*3vh,\s*2rem\)/s)
  assert.match(styles, /\.contact-foot\s*{[^}]*width:\s*100%/s)
  assert.match(styles, /\.contact-foot\s*{[^}]*padding-inline:\s*max\(1rem,\s*calc\(\(100%\s*-\s*var\(--shell\)\)\s*\/\s*2\)\)/s)
})

test('联系页移动端释放桌面换行并纵向排列联系方式', () => {
  const styles = readFileSync(new URL('../index.css', import.meta.url), 'utf8')

  assert.match(styles, /@media\s*\(max-width:\s*767px\)[\s\S]*?\.contact-title br\s*{[^}]*display:\s*none/s)
  assert.match(styles, /@media\s*\(max-width:\s*767px\)[\s\S]*?\.contact-actions\s*{[^}]*flex-direction:\s*column/s)
  assert.match(styles, /@media\s*\(max-width:\s*767px\)[\s\S]*?\.contact-actions \.btn\s*{[^}]*min-height:\s*44px/s)
  assert.match(styles, /@media\s*\(max-width:\s*767px\)[\s\S]*?\.contact-foot\s*{[^}]*display:\s*grid[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/s)
})

test('联系页为平板和矮屏保留单独的收紧规则', () => {
  const styles = readFileSync(new URL('../index.css', import.meta.url), 'utf8')

  assert.match(styles, /@media\s*\(max-width:\s*1023px\)\s*and\s*\(min-width:\s*768px\)/)
  assert.match(styles, /@media\s*\(max-height:\s*800px\)\s*and\s*\(min-width:\s*1024px\)/)
})

test('联系页说明文字桌面端优先单行，窄屏允许换行', () => {
  const styles = readFileSync(new URL('../index.css', import.meta.url), 'utf8')

  assert.match(styles, /\.contact-sub\s*\{[^}]*font-size:\s*1\.2rem/s)
  assert.match(styles, /\.contact-sub\s*\{[^}]*max-width:\s*min\(100%,\s*1080px\)[^}]*white-space:\s*nowrap/s)
  assert.match(styles, /\.contact-sub\s*\{[^}]*text-wrap:\s*nowrap/s)
  assert.match(styles, /@media\s*\(max-width:\s*1100px\)[\s\S]*?\.contact-sub\s*\{[^}]*white-space:\s*normal/s)
})

test('联系页底部 pet 与 Hero 复用同一默认尺寸', () => {
  const hero = readFileSync(new URL('../components/Hero.jsx', import.meta.url), 'utf8')
  const contact = readFileSync(new URL('../components/Contact.jsx', import.meta.url), 'utf8')
  const styles = readFileSync(new URL('../index.css', import.meta.url), 'utf8')

  assert.match(hero, /<Pet[^>]*height="clamp\(198px, 21\.6vw, 291px\)"/)
  assert.match(contact, /<Pet[^>]*height="clamp\(198px, 21\.6vw, 291px\)"/)
  assert.doesNotMatch(styles, /\.contact-pet \.pet\s*\{[^}]*transform:\s*scale\(1\.2\)/s)
  assert.doesNotMatch(styles, /\.contact-pet \.pet-sprite\s*\{[^}]*max-height:/s)
})

test('联系页底部间距使用受限的视口高度比例', () => {
  const styles = readFileSync(new URL('../index.css', import.meta.url), 'utf8')

  assert.match(styles, /\.contact\s*\{[^}]*padding:\s*calc\(var\(--nav-h\)\s*\+\s*clamp\(2rem,\s*4vh,\s*2\.75rem\)\)\s+0\s+clamp\(1\.5rem,\s*3vh,\s*2rem\)/s)
  assert.match(styles, /\.contact-sub\s*\{[^}]*margin-top:\s*clamp\(1\.5rem,\s*3vh,\s*2rem\)/s)
  assert.match(styles, /\.contact-actions\s*\{[^}]*margin-top:\s*clamp\(2rem,\s*4vh,\s*2\.75rem\)/s)
  assert.match(styles, /\.contact-foot\s*\{[^}]*padding-top:\s*clamp\(1rem,\s*2vh,\s*1\.5rem\)/s)
})
