import test from 'node:test'
import assert from 'node:assert/strict'
import { createSpeech, isAnnoyed } from './petSpeech.js'

test('speak 显示文案，TTL 到期调用 onExpire', async () => {
  let line = ''
  let expired = false
  const s = createSpeech({
    setLine: (t) => { line = t },
    pools: { click: ['a', 'b'] },
    onExpire: () => { expired = true },
  })
  s.speak('click', { ttl: 30 })
  assert.ok(line === 'a' || line === 'b')
  await new Promise((r) => setTimeout(r, 60))
  assert.ok(expired)
})

test('冷却期内不重复触发', () => {
  let count = 0
  const s = createSpeech({ setLine: () => { count++ }, pools: { click: ['x'] } })
  s.speak('click', { cooldownMs: 100 })
  s.speak('click', { cooldownMs: 100 })
  assert.equal(count, 1)
})

test('去重：同一池不连续重复同一句', () => {
  const results = []
  const s = createSpeech({ setLine: (t) => results.push(t), pools: { click: ['a', 'b'] } })
  s.speak('click')
  s.speak('click')
  s.speak('click')
  assert.equal(results.length, 3)
  for (let i = 1; i < results.length; i++) assert.notEqual(results[i], results[i - 1])
})

test('once 事件只触发一次', () => {
  let count = 0
  const s = createSpeech({ setLine: () => { count++ }, pools: { enter: ['hi'] } })
  s.speak('enter', { once: true })
  s.speak('enter', { once: true })
  assert.equal(count, 1)
})

test('无文案池时不说话', () => {
  let count = 0
  const s = createSpeech({ setLine: () => { count++ }, pools: {} })
  s.speak('nope')
  assert.equal(count, 0)
})

test('新 speak 打断旧气泡的 TTL（旧池到期不清掉新文案）', async () => {
  let line = ''
  const s = createSpeech({ setLine: (t) => { line = t }, pools: { idle: ['a'], click: ['b'] } })
  s.speak('idle', { ttl: 1000 })
  s.speak('click', { ttl: 30 })
  await new Promise((r) => setTimeout(r, 60))
  assert.equal(line, '')
})

test('markAnnoyed 设置跨实例屏蔽，30 秒内 isAnnoyed 为真', () => {
  const s = createSpeech({ setLine: () => {}, pools: {} })
  assert.equal(isAnnoyed(), false)
  s.markAnnoyed(30000)
  assert.equal(isAnnoyed(), true)
})
