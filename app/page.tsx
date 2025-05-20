'use client'

import { Button } from '@/components/ui/button'

export default function Home() {
  const txidteste = 'SILAS000000000000000000000000000001'

  const updateAccessToken = async () => {
    try {
      const res = await fetch('/api/santander-auth', {
        method: 'POST',
      })

      const data = await res.json()
      const access_token = data.access_token
      console.log(access_token)
      getPixQrCode(access_token)
    } catch (err) {
      console.error('Erro ao consultar token:', err)
    }
  }

  const getPixQrCode = async (token: string) => {
    try {
      const res = await fetch(`/api/pix?txid=${txidteste}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await res.json()
      console.log(data)
    } catch (err) {
      console.error('Erro ao consultar PIX:', err)
    }
  }

  return (
    <div className="size-full flex flex-col items-center justify-center gap-4">
      <h1 className="text-4xl">Qr Code PIX Santander Sandbox</h1>

      <Button
        onClick={updateAccessToken}
        className="cursor-pointer text-3xl"
        variant="destructive"
      >
        Consultar
      </Button>
    </div>
  )
}
