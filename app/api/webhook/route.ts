import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const body = await request.json()
  console.log('🔎 Validação GET recebida do Santander')
  console.log('Webhook:', body)
  return NextResponse.json({ message: '✅ Webhook ativo e validado com GET' })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    console.log('📥 Webhook recebido:')
    console.log(JSON.stringify(body, null, 2))

    return NextResponse.json({ status: 'Recebido com sucesso' })
  } catch (error) {
    console.error('❌ Erro ao processar webhook:', error)
    return NextResponse.json({ error: 'Erro ao processar' }, { status: 400 })
  }
}
