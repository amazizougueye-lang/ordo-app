import type { Case, CaseDeadline } from '../types'

interface CalendarEvent {
  caseName: string
  clientName: string
  deadlineName: string
  deadline: string
  status: string
}

const formatIcsDate = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`
}

const generateEventUid = (caseId: string, deadline: string, deadlineName: string): string => {
  return `${caseId}-${deadline}-${deadlineName.replace(/\s+/g, '-')}@ordo.local`
}

export function generateIcsContent(cases: Case[], caseDeadlines: CaseDeadline[]): string {
  const events: CalendarEvent[] = []
  const caseMap = new Map(cases.map(c => [c.id, c]))

  // Add principal deadlines
  cases.forEach(c => {
    if (c.deadline && !c.archived) {
      events.push({
        caseName: c.name,
        clientName: c.client_name,
        deadlineName: c.deadline_name || 'Principal',
        deadline: c.deadline,
        status: c.status,
      })
    }
  })

  // Add secondary deadlines
  caseDeadlines.forEach(d => {
    const caseData = caseMap.get(d.case_id)
    if (caseData && !caseData.archived) {
      events.push({
        caseName: caseData.name,
        clientName: caseData.client_name,
        deadlineName: d.name,
        deadline: d.deadline,
        status: caseData.status,
      })
    }
  })

  const now = new Date()
  const dtstamp = formatIcsDate(now)

  let icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Ordo//Ordo Legal Calendar//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Ordo - Dossiers
X-WR-TIMEZONE:UTC
BEGIN:VTIMEZONE
TZID:UTC
BEGIN:STANDARD
TZOFFSETFROM:+0000
TZOFFSETTO:+0000
TZNAME:UTC
DTSTART:19700101T000000
END:STANDARD
END:VTIMEZONE
`

  events.forEach(event => {
    const deadlineDate = new Date(event.deadline)
    const dtstart = formatIcsDate(deadlineDate)
    const dtend = formatIcsDate(new Date(deadlineDate.getTime() + 24 * 60 * 60 * 1000))
    const uid = generateEventUid(caseMap.get([...caseMap.keys()].find(id => caseMap.get(id)!.name === event.caseName)!)!.id, event.deadline, event.deadlineName)
    const summary = `${event.caseName} - ${event.deadlineName}`
    const description = `Client: ${event.clientName}\\nStatus: ${event.status}`

    icsContent += `BEGIN:VEVENT
UID:${uid}
DTSTAMP:${dtstamp}
DTSTART:${dtstart}
DTEND:${dtend}
SUMMARY:${summary}
DESCRIPTION:${description}
LOCATION:
STATUS:CONFIRMED
END:VEVENT
`
  })

  icsContent += `END:VCALENDAR`

  return icsContent
}

export function downloadIcs(content: string, filename: string = 'ordo-dossiers.ics'): void {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
