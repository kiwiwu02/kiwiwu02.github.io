const SENTENCE_BOUNDARY = /(?<=[。！？!?])(?=[^。！？!?])|(?<=\.)\s+(?=\S)/u

export function splitIntoHighlightParts(text) {
  if (typeof text !== 'string' || text.length === 0) return []

  return text.split(SENTENCE_BOUNDARY).filter(Boolean)
}
