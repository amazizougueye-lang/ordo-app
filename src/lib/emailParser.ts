export interface ParsedEmail {
  subject: string
  from: string
  body: string
  clientName: string
}

export async function parseEmlFile(file: File): Promise<ParsedEmail> {
  const text = await file.text()

  // Extract subject
  const subjectMatch = text.match(/^Subject:\s*(.+?)$/m)
  const subject = subjectMatch ? subjectMatch[1].trim() : 'Sans titre'

  // Extract from
  const fromMatch = text.match(/^From:\s*(.+?)$/m)
  const from = fromMatch ? fromMatch[1].trim() : 'Unknown'

  // Extract name from email (first part before @)
  const clientName = from.includes('<')
    ? from.split('<')[0].trim()
    : from.split('@')[0].trim()

  // Extract body (everything after headers)
  const headerEndIndex = text.indexOf('\n\n')
  const body = headerEndIndex !== -1
    ? text.substring(headerEndIndex + 2).trim()
    : text

  // Clean body - remove quoted parts and signatures
  const cleanBody = body
    .split('\n')
    .filter(line => {
      const trimmed = line.trim()
      return trimmed &&
             !trimmed.startsWith('>') &&
             !trimmed.startsWith('--') &&
             trimmed.length < 500 // Avoid very long lines (likely formatted content)
    })
    .slice(0, 10) // Take first 10 meaningful lines
    .join('\n')
    .trim()

  return {
    subject,
    from,
    body: cleanBody || body.substring(0, 500),
    clientName,
  }
}
