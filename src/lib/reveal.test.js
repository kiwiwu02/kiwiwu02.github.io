import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

test('滚动显露会在每次重新进入视口时重播', () => {
  const reveal = readFileSync(new URL('../components/Reveal.jsx', import.meta.url), 'utf8')

  assert.match(reveal, /e\.target\.classList\.toggle\('in', e\.isIntersecting\)/)
  assert.doesNotMatch(reveal, /io\.unobserve\(e\.target\)/)
})
