/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios'
import { readFileSync } from 'fs'
import https from 'https'
import { NextResponse } from 'next/server'
import path from 'path'

let API_BASE_URL = process.env.NEXT_PUBLIC_URL_PIX!

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const txid = searchParams.get('txid')
  const token = req.headers.get('authorization')?.replace('Bearer ', '')

  if (!token) {
    return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 })
  }

  if (txid) {
    API_BASE_URL = `${API_BASE_URL}/${txid}`
  }

  try {
    const certPath = path.resolve(
      process.cwd(),
      'app',
      'project-root',
      'certs',
      'certificado.crt'
    )
    const keyPath = path.resolve(
      process.cwd(),
      'app',
      'project-root',
      'certs',
      'chave.key'
    )

    const cert = readFileSync(certPath)
    const key = readFileSync(keyPath)

    const agent = new https.Agent({
      cert,
      key,
      rejectUnauthorized: false, // DEIXAR true em produção
    })

    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Application-Key': process.env.NEXT_PUBLIC_CLIENT_ID!,
      Authorization: `Bearer ${token}`,
    }

    const { data } = await axios.get(API_BASE_URL, {
      headers,
      httpsAgent: agent,
    })

    return NextResponse.json(data)
  } catch (error: any) {
    console.error(
      'Erro ao obter token:',
      error?.response?.data || error.message
    )

    return NextResponse.json(
      {
        error: 'Falha ao obter token',
        details: error?.response?.data || error.message,
      },
      { status: error?.response?.status || 500 }
    )
  }
}
