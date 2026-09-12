import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { observeVisibility } from './visibility.js'

test('可见性变化会通知动画启动或暂停，并能清理观察器', () => {
  let notify
  let disconnected = false
  const target = {}
  class FakeObserver {
    constructor(callback) { notify = callback }
    observe(observed) { assert.equal(observed, target) }
    disconnect() { disconnected = true }
  }

  const states = []
  const cleanup = observeVisibility(target, (visible) => states.push(visible), FakeObserver)
  notify([{ isIntersecting: true }])
  notify([{ isIntersecting: false }])
  cleanup()

  assert.deepEqual(states, [true, false])
  assert.equal(disconnected, true)
})

test('Hero 背景和 Pet 都通过可见性门控动画循环', () => {
  const heroSource = readFileSync(new URL('../components/HeroBackground.jsx', import.meta.url), 'utf8')
  const petSource = readFileSync(new URL('../components/Pet.jsx', import.meta.url), 'utf8')

  assert.match(heroSource, /observeVisibility/)
  assert.match(heroSource, /videoReady/)
  assert.match(petSource, /observeVisibility/)
})
