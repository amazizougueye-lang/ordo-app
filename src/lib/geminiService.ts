/**
 * Helper frontend pour appeler l'API Gemini via la fonction serverless Vercel.
 * La clé API ne passe jamais dans le navigateur.
 */

export async function summarizeDocument(signedUrl: string, fileName: string): Promise<string> {
  const response = await fetch('/api/gemini-summary', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ signedUrl, fileName }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Erreur réseau' }))
    throw new Error(err.error || 'Erreur lors de la génération du résumé')
  }

  const data = await response.json()
  if (!data.summary) throw new Error('Résumé vide reçu du serveur')
  return data.summary as string
}
