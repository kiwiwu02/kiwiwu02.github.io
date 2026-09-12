import test from 'node:test'
import assert from 'node:assert/strict'
import { advanceFreeFall, advanceFreePosition, advanceFreeWalk, clampFreePosition, freeBounds, randomFreeTarget } from './petFreeMotion.js'

test('自由运动边界为视口保留安全边距', () => {
  const bounds = freeBounds({ width: 1200, height: 800 }, { width: 160, height: 220 })

  assert.deepEqual(bounds, { minX: 24, maxX: 1016, minY: 92, maxY: 556 })
  assert.deepEqual(clampFreePosition({ x: -40, y: 900 }, bounds), { x: 24, y: 556 })
})

test('自由运动每帧朝目标前进且不会越过目标', () => {
  const next = advanceFreePosition({ x: 100, y: 200, targetX: 130, targetY: 240, speed: 100 }, 0.5)

  assert.equal(next.arrived, true)
  assert.equal(next.x, 130)
  assert.equal(next.y, 240)
})

test('自由运动目标由边界内的随机位置生成', () => {
  const bounds = { minX: 24, maxX: 1016, minY: 92, maxY: 556 }
  const target = randomFreeTarget(bounds, () => 0.5)

  assert.deepEqual(target, { x: 520, y: 324 })
})

test('释放后的宠物受重力下落，并在视口底部落地', () => {
  const falling = advanceFreeFall({ x: 100, y: 200, vy: 0, groundY: 300, landed: false }, 0.2, 1000)
  assert.deepEqual(falling, { x: 100, y: 220, vy: 200, groundY: 300, landed: false })

  const landing = advanceFreeFall({ x: 100, y: 290, vy: 100, groundY: 300, landed: false }, 0.2, 1000)
  assert.deepEqual(landing, { x: 100, y: 300, vy: 0, groundY: 300, landed: true })
})

test('落地后沿底部行走，并在水平边界反向', () => {
  const next = advanceFreeWalk({ x: 100, y: 300, direction: 1, speed: 100, bounds: { minX: 24, maxX: 180 } }, 1)

  assert.deepEqual(next, { x: 180, y: 300, direction: -1, speed: 100, bounds: { minX: 24, maxX: 180 } })
})
