export function groupAwards(items = []) {
  return items.reduce((groups, item) => {
    const key = [item.institution, item.title, item.kind, item.level, item.rank].join('|')
    const group = groups.find((candidate) => candidate.key === key)

    if (group) {
      group.records.push({ date: item.date, note: item.note })
      return groups
    }

    groups.push({
      key,
      institution: item.institution,
      title: item.title,
      kind: item.kind,
      level: item.level,
      rank: item.rank,
      records: [{ date: item.date, note: item.note }],
    })
    return groups
  }, [])
}

export function formatAwardTag({ title, level, rank, records = [] }) {
  const years = [...new Set(records.map(({ date }) => date?.slice(0, 4)).filter(Boolean))]
  const notes = [...new Set(records.map(({ note }) => note).filter(Boolean))]
  const extras = []

  if (rank && rank !== '等级' && !title.includes(rank)) extras.push(rank)
  if (level && level !== '校级') extras.push(level)
  if (records.length > 1 && years.length) extras.push(years.join('/'))
  extras.push(...notes)

  return [title, ...extras].join(' · ')
}

export function groupEducationHonors(items = []) {
  const recognitionTitles = new Set(['优秀学生', '优秀团员', '优秀实习生'])

  return groupAwards(items).reduce((rows, award) => {
    if (award.kind === '奖学金') {
      rows.push({ ...award, group: 'scholarships' })
    } else if (recognitionTitles.has(award.title)) {
      rows.push({ ...award, group: 'recognitions' })
    }
    return rows
  }, [])
}
