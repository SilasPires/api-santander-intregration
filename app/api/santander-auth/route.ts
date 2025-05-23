/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios'
import { readFileSync } from 'fs'
import https from 'https'
import { NextResponse } from 'next/server'
import path from 'path'

const API_BASE_URL = process.env.NEXT_PUBLIC_URL_ACESS_TOKEN!

export async function POST() {
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
      rejectUnauthorized: true, // Deixar true em produção
    })

    const params = new URLSearchParams()
    params.append('client_id', process.env.NEXT_PUBLIC_CLIENT_ID!)
    params.append('client_secret', process.env.NEXT_PUBLIC_CLIENT_SECRET!)
    params.append('grant_type', 'client_credentials')

    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Application-Key': process.env.NEXT_PUBLIC_CLIENT_ID!,
    }

    const { data } = await axios.post(API_BASE_URL, params.toString(), {
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
