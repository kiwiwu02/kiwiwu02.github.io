import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import * as data from '../data.js'

test('宠物文案按事件分组，不再按状态分组', () => {
  const hero = data.petProfiles?.hero
  const contact = data.petProfiles?.contact

  assert.ok(hero?.pools?.click?.length)
  assert.ok(hero?.pools?.annoyed?.length)
  assert.ok(contact?.pools?.enter?.length)
  assert.ok(contact?.pools?.click?.length)
  assert.ok(contact?.pools?.annoyed?.length)

  // 旧的状态分组结构应已移除
  assert.equal(hero.lines, undefined)
  assert.equal(hero.primaryStates, undefined)
  assert.equal(hero.focus, undefined)
  assert.equal(contact.lines, undefined)
})

test('所有气泡文案符合语气规范（无标点/语气词/泛化欢迎语/emoji）', () => {
  const banned = ['。', '！', '？', '哦', '呢', '啦', '欢迎', '正在', '加载']

  for (const profile of [data.petProfiles?.hero, data.petProfiles?.contact]) {
    for (const [poolName, lines] of Object.entries(profile.pools)) {
      for (const line of lines) {
        for (const b of banned) {
          assert.ok(!line.includes(b), `"${line}"（${poolName}）含禁用词/标点 "${b}"`)
        }
        const emojis = [...line].filter((c) => c.codePointAt(0) > 0x1f000).length
        assert.equal(emojis, 0, `"${line}"（${poolName}）不应含 emoji`)
      }
    }
  }
})

test('被点烦用省略号，且仅此一处', () => {
  assert.deepEqual(data.petProfiles.hero.pools.annoyed, ['……'])
  assert.deepEqual(data.petProfiles.contact.pools.annoyed, ['……'])
})

test('Hero 和 Contact 组件绑定不同的宠物语境', () => {
  const hero = readFileSync(new URL('../components/Hero.jsx', import.meta.url), 'utf8')
  const contact = readFileSync(new URL('../components/Contact.jsx', import.meta.url), 'utf8')

  assert.match(hero, /<Pet[^>]*profile="hero"/)
  assert.match(contact, /<Pet[^>]*profile="contact"/)
})

test('宠物资源未加载时只显示 Kiwi 宠物', () => {
  const pet = readFileSync(new URL('../components/Pet.jsx', import.meta.url), 'utf8')

  assert.match(pet, /<img[^>]*alt="Kiwi 宠物"/)
  assert.doesNotMatch(pet, /alt="[^"]*(?:替身|Codex 宠物)/)
})
