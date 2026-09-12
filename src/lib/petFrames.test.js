import test from 'node:test'
import assert from 'node:assert/strict'
import * as petFrames from './petFrames.js'

test('宠物动画组与 Codex v2 的九个标准状态保持一致', () => {
  const standardStates = [
    'idle',
    'running-right',
    'running-left',
    'waving',
    'jumping',
    'failed',
    'waiting',
    'running',
    'review',
  ]

  assert.deepEqual(Object.keys(petFrames.ANIMS).filter((name) => name !== 'look'), standardStates)
  assert.deepEqual(petFrames.ANIMS.idle.durations, [280, 110, 110, 140, 140, 320])
  assert.deepEqual(petFrames.ANIMS['running-right'].durations, [120, 120, 120, 120, 120, 120, 120, 220])
  assert.deepEqual(petFrames.ANIMS.waving.durations, [140, 140, 140, 280])
  assert.deepEqual(petFrames.ANIMS.jumping.durations, [140, 140, 140, 140, 280])
  assert.deepEqual(petFrames.ANIMS.failed.durations, [140, 140, 140, 140, 140, 140, 140, 240])
  assert.deepEqual(petFrames.ANIMS.waiting.durations, [150, 150, 150, 150, 150, 260])
  assert.deepEqual(petFrames.ANIMS.running.durations, [120, 120, 120, 120, 120, 220])
  assert.deepEqual(petFrames.ANIMS.review.durations, [150, 150, 150, 150, 150, 280])
})

test('注视方向按 Codex v2 的 16 个顺时针方向取帧，死区回到待机', () => {
  assert.equal(typeof petFrames.gazeIndexFor, 'function')
  assert.equal(typeof petFrames.frameIndexFor, 'function')
  if (typeof petFrames.frameIndexFor !== 'function') return

  assert.equal(petFrames.ANIMS.look.frames, 16)
  assert.equal(petFrames.gazeIndexFor(0, -100, 70), 0)
  assert.equal(petFrames.gazeIndexFor(100, 0, 70), 4)
  assert.equal(petFrames.gazeIndexFor(0, 100, 70), 8)
  assert.equal(petFrames.gazeIndexFor(-100, 0, 70), 12)
  assert.equal(petFrames.gazeIndexFor(0, 0, 70), null)

  assert.equal(petFrames.frameIndexFor('idle', 0), 0)
  assert.equal(petFrames.frameIndexFor('idle', 279), 0)
  assert.equal(petFrames.frameIndexFor('idle', 280), 1)
  assert.equal(petFrames.frameIndexFor('idle', 390), 2)
  assert.equal(petFrames.frameIndexFor('idle', 1100), 0)
})
