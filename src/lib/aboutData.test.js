import test from 'node:test'
import assert from 'node:assert/strict'
import * as data from '../data.js'

test('教育经历包含学校学院、专业、学位和 GPA 信息', () => {
  assert.deepEqual(
    data.education?.map(({ period, institution, faculty, degree, level, gpa }) => ({
      period,
      institution,
      faculty,
      degree,
      level,
      gpa,
    })),
    [
      {
        period: '2025.08 — 2027.05',
        institution: '澳门大学',
        faculty: '人工智能与脑科学研究院',
        degree: '数据科学（应用人工智能）',
        level: '硕士',
        gpa: '3.83 / 4.0',
      },
      {
        period: '2021.09 — 2025.06',
        institution: '上海师范大学',
        faculty: '商学院',
        degree: '计算机科学与技术',
        level: '本科',
        gpa: '3.22 / 4.0',
      },
    ],
  )
})

test('所有奖项都关联到上海师范大学教育经历', () => {
  assert.ok(data.awards?.length)
  assert.ok(data.awards.every(({ institution }) => institution === '上海师范大学'))
})

test('about page no longer exposes the removed resume-summary highlights', () => {
  assert.equal(data.beyondCode, undefined)
})

test('about page exposes the award history without duplicate screenshot rows', () => {
  assert.deepEqual(
    data.awards?.map(({ title, kind, level, rank, date, note }) => ({ title, kind, level, rank, date, note })),
    [
      { title: '校一等奖学金', kind: '奖学金', level: '校级', rank: '一等奖', date: '2022-09-01', note: '前2%' },
      { title: '校二等奖学金', kind: '奖学金', level: '校级', rank: '二等奖', date: '2024-09-01', note: '前5%' },
      { title: '升学奖学金', kind: '奖学金', level: '校级', rank: '等级', date: '2025-06-01', note: '' },
      { title: '优秀学生', kind: '其他', level: '校级', rank: '等级', date: '2022-10-31', note: '' },
      { title: '优秀学生', kind: '其他', level: '校级', rank: '等级', date: '2023-10-31', note: '' },
      { title: '优秀团员', kind: '其他', level: '校级', rank: '等级', date: '2022-05-04', note: '' },
      { title: '优秀团员', kind: '其他', level: '校级', rank: '等级', date: '2023-05-04', note: '' },
      { title: '优秀实习生', kind: '其他', level: '校级', rank: '等级', date: '2025-05-04', note: '' },
      { title: '上海师范大学2023年暑期社会实践', kind: '竞赛获奖', level: '校级', rank: '二等奖', date: '2023-03-01', note: '' },
      { title: '2023年上海市级“大学生创新创业训练计划”项目', kind: '竞赛获奖', level: '省级', rank: '等级', date: '2023-11-01', note: '' },
    ],
  )
})
