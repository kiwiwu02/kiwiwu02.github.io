import test from 'node:test'
import assert from 'node:assert/strict'
import { awards } from '../data.js'
import * as awardUtils from './aboutAwards.js'

test('获奖经历按相同奖项聚合年份与备注', () => {
  assert.deepEqual(
    awardUtils.groupAwards(awards).map(({ title, records }) => ({
      title,
      records: records.map(({ date, note }) => ({ date, note })),
    })),
    [
      { title: '校一等奖学金', records: [{ date: '2022-09-01', note: '前2%' }] },
      { title: '校二等奖学金', records: [{ date: '2024-09-01', note: '前5%' }] },
      { title: '升学奖学金', records: [{ date: '2025-06-01', note: '' }] },
      {
        title: '优秀学生',
        records: [
          { date: '2022-10-31', note: '' },
          { date: '2023-10-31', note: '' },
        ],
      },
      {
        title: '优秀团员',
        records: [
          { date: '2022-05-04', note: '' },
          { date: '2023-05-04', note: '' },
        ],
      },
      { title: '优秀实习生', records: [{ date: '2025-05-04', note: '' }] },
      { title: '上海师范大学2023年暑期社会实践', records: [{ date: '2023-03-01', note: '' }] },
      { title: '2023年上海市级“大学生创新创业训练计划”项目', records: [{ date: '2023-11-01', note: '' }] },
    ],
  )
})

test('奖项标签保留重要的名次、级别、备注和重复年份', () => {
  const groups = awardUtils.groupAwards(awards)

  assert.equal(awardUtils.formatAwardTag(groups[0]), '校一等奖学金 · 前2%')
  assert.equal(awardUtils.formatAwardTag(groups[3]), '优秀学生 · 2022/2023')
  assert.equal(awardUtils.formatAwardTag(groups[6]), '上海师范大学2023年暑期社会实践 · 二等奖')
  assert.equal(awardUtils.formatAwardTag(groups[7]), '2023年上海市级“大学生创新创业训练计划”项目 · 省级')
})

test('教育条目将上海师范大学荣誉压缩为两组简短标签', () => {
  assert.equal(typeof awardUtils.groupEducationHonors, 'function')
  assert.deepEqual(
    awardUtils.groupEducationHonors(awards).map(({ title, group }) => ({ title, group })),
    [
      { title: '校一等奖学金', group: 'scholarships' },
      { title: '校二等奖学金', group: 'scholarships' },
      { title: '升学奖学金', group: 'scholarships' },
      { title: '优秀学生', group: 'recognitions' },
      { title: '优秀团员', group: 'recognitions' },
      { title: '优秀实习生', group: 'recognitions' },
    ],
  )
})
