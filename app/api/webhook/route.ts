import { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    console.log('🔎 Validação GET recebida do Santander')
    return res
      .status(200)
      .json({ message: '✅ Webhook ativo e validado com GET' })
  }

  if (req.method === 'POST') {
    console.log('📥 Webhook recebido:')
    console.log(JSON.stringify(req.body, null, 2))
    return res.status(200).json({ message: '✅ Webhook recebido com sucesso' })
  }

  res.setHeader('Allow', ['GET', 'POST'])
  return res.status(405).end(`❌ Method ${req.method} Not Allowed`)
}
