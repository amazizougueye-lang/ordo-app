import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { signedUrl, fileName } = req.body as { signedUrl: string; fileName: string }

  if (!signedUrl) {
    return res.status(400).json({ error: 'signedUrl requis' })
  }

  const geminiKey = process.env.GEMINI_API_KEY
  if (!geminiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY non configurée sur le serveur' })
  }

  try {
    // 1. Télécharger le PDF depuis le signed URL Supabase
    const pdfResponse = await fetch(signedUrl)
    if (!pdfResponse.ok) {
      throw new Error(`Impossible de télécharger le document (${pdfResponse.status})`)
    }
    const arrayBuffer = await pdfResponse.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')

    // 2. Appeler Gemini Flash avec le PDF en inline_data
    const prompt = `Tu es un assistant juridique expert. Résume ce document juridique en français en 1 page maximum.

Structure ta réponse ainsi :
**Contexte** : type de document, date, juridiction si applicable
**Parties** : noms des parties impliquées
**Points clés** : 3 à 5 points essentiels du document
**Dates importantes** : toutes les dates et délais mentionnés
**Obligations** : ce que chaque partie doit faire

Sois concis et factuel. N'invente rien qui ne soit pas dans le document.`

    const geminiRes = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': geminiKey,
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              { inline_data: { mime_type: 'application/pdf', data: base64 } },
              { text: prompt },
            ],
          }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 1024,
          },
        }),
      }
    )

    if (!geminiRes.ok) {
      const errText = await geminiRes.text()
      throw new Error(`Erreur Gemini (${geminiRes.status}): ${errText.slice(0, 300)}`)
    }

    const data = await geminiRes.json()
    const summary: string | undefined = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!summary) throw new Error('Résumé vide reçu de Gemini')

    return res.status(200).json({ summary })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue'
    console.error('[gemini-summary]', message)
    return res.status(500).json({ error: message })
  }
}
