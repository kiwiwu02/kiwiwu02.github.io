export function getActiveSectionIndex(scrollY, pageOffsets, viewportHeight, activationRatio = 0.42) {
  if (!pageOffsets.length) return 0

  const readingLine = scrollY + viewportHeight * activationRatio
  let activeIndex = 0

  pageOffsets.forEach((offset, index) => {
    if (offset <= readingLine) activeIndex = index
  })

  return activeIndex
}

export function getProgressPercentage(activeIndex, sectionCount) {
  if (sectionCount <= 1) return 0

  const lastIndex = sectionCount - 1
  const clampedIndex = Math.max(0, Math.min(activeIndex, lastIndex))
  return (clampedIndex / lastIndex) * 100
}
