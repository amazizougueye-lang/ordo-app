import type { Case, CaseDeadline } from '../types'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export function generatePdfContent(cases: Case[], caseDeadlines: CaseDeadline[]): string {
  const caseMap = new Map(cases.map(c => [c.id, c]))

  // Collect all deadlines
  const deadlines: Array<{
    caseName: string
    clientName: string
    deadlineName: string
    deadline: Date
    status: string
  }> = []

  // Add principal deadlines
  cases.forEach(c => {
    if (c.deadline && !c.archived) {
      deadlines.push({
        caseName: c.name,
        clientName: c.client_name,
        deadlineName: c.deadline_name || 'Principal',
        deadline: new Date(c.deadline),
        status: c.status,
      })
    }
  })

  // Add secondary deadlines
  caseDeadlines.forEach(d => {
    const caseData = caseMap.get(d.case_id)
    if (caseData && !caseData.archived) {
      deadlines.push({
        caseName: caseData.name,
        clientName: caseData.client_name,
        deadlineName: d.name,
        deadline: new Date(d.deadline),
        status: caseData.status,
      })
    }
  })

  // Sort by deadline
  deadlines.sort((a, b) => a.deadline.getTime() - b.deadline.getTime())

  // Generate HTML content
  let html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ordo - Délais</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      margin: 40px;
      color: #0F172A;
      line-height: 1.6;
    }
    h1 {
      color: #1E293B;
      border-bottom: 3px solid #3B82F6;
      padding-bottom: 10px;
      margin-bottom: 30px;
    }
    .header {
      background: #F8FAFC;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 30px;
    }
    .header p {
      margin: 5px 0;
      font-size: 14px;
      color: #475569;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    th {
      background: #1E293B;
      color: white;
      padding: 12px;
      text-align: left;
      font-weight: 600;
    }
    td {
      padding: 12px;
      border-bottom: 1px solid #E2E8F0;
      font-size: 14px;
    }
    tr:nth-child(even) {
      background: #F8FAFC;
    }
    .status-urgent {
      color: #DC2626;
      font-weight: 600;
    }
    .status-monitor {
      color: #D97706;
      font-weight: 600;
    }
    .status-stable {
      color: #16A34A;
      font-weight: 600;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #E2E8F0;
      font-size: 12px;
      color: #94A3B8;
      text-align: center;
    }
  </style>
</head>
<body>
  <h1>📋 Délais - Ordo</h1>

  <div class="header">
    <p><strong>Généré le :</strong> ${format(new Date(), 'd MMMM yyyy à HH:mm', { locale: fr })}</p>
    <p><strong>Total délais :</strong> ${deadlines.length}</p>
  </div>

  <table>
    <thead>
      <tr>
        <th>Dossier</th>
        <th>Client</th>
        <th>Délai</th>
        <th>Date</th>
        <th>Statut</th>
      </tr>
    </thead>
    <tbody>
      ${deadlines.map(d => `
        <tr>
          <td>${d.caseName}</td>
          <td>${d.clientName}</td>
          <td>${d.deadlineName}</td>
          <td>${format(d.deadline, 'd MMM yyyy', { locale: fr })}</td>
          <td class="status-${d.status === 'urgent' ? 'urgent' : d.status === 'monitor' ? 'monitor' : 'stable'}">${d.status}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="footer">
    <p>Ordo - Gestion de délais juridiques</p>
  </div>
</body>
</html>
  `

  return html
}

export function downloadPdf(htmlContent: string): void {
  // Create blob from HTML
  const blob = new Blob([htmlContent], { type: 'text/html' })
  const url = URL.createObjectURL(blob)

  // Create iframe to trigger print dialog
  const iframe = document.createElement('iframe')
  iframe.style.display = 'none'
  iframe.src = url

  document.body.appendChild(iframe)

  iframe.onload = () => {
    iframe.contentWindow?.print()
    setTimeout(() => {
      document.body.removeChild(iframe)
      URL.revokeObjectURL(url)
    }, 100)
  }
}
