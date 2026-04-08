export interface ParsedEvent {
  summary: string
  description: string
  dtstart: string
}

export async function parseIcsFile(file: File): Promise<ParsedEvent> {
  const text = await file.text()

  // Extract SUMMARY
  const summaryMatch = text.match(/SUMMARY:(.+?)(?:\r\n|\n)/i)
  const summary = summaryMatch ? summaryMatch[1].trim() : 'Sans titre'

  // Extract DESCRIPTION
  const descMatch = text.match(/DESCRIPTION:(.+?)(?:\r\n|\n)/i)
  const description = descMatch ? descMatch[1].trim() : ''

  // Extract DTSTART
  const dtstartMatch = text.match(/DTSTART[^:]*:(.+?)(?:\r\n|\n)/i)
  const dtstart = dtstartMatch ? dtstartMatch[1].trim() : ''

  return {
    summary,
    description,
    dtstart,
  }
}
