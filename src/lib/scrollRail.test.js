import test from 'node:test'
import assert from 'node:assert/strict'
import { getActiveSectionIndex, getProgressPercentage } from './scrollRail.js'

test('滚动轨道在阅读线进入下一章节时切换当前章节', () => {
  assert.equal(getActiveSectionIndex(0, [0, 1000, 2000], 1000), 0)
  assert.equal(getActiveSectionIndex(600, [0, 1000, 2000], 1000), 1)
  assert.equal(getActiveSectionIndex(1700, [0, 1000, 2000], 1000), 2)
})

test('滚动轨道进度限制在首尾章节之间', () => {
  assert.equal(getProgressPercentage(-1, 4), 0)
  assert.equal(getProgressPercentage(1, 4), 33.33333333333333)
  assert.equal(getProgressPercentage(99, 4), 100)
  assert.equal(getProgressPercentage(0, 1), 0)
})
