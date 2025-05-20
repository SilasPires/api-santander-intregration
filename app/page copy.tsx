'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState } from 'react'

export default function Home() {
  const [txid, setTxid] = useState('')
  const [expiracao, setExpiracao] = useState('3600')
  const [nome, setNome] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [valor, setValor] = useState('')

  const consultaPix = async () => {
    try {
      const res = await fetch('/api/pix', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          calendario: {
            expiracao: parseInt(expiracao),
          },
          devedor: {
            cnpj,
            nome,
          },
          valor: {
            original: valor,
          },
          chave: '58571081000160',
          solicitacaoPagador: 'Serviço realizado.',
          infoAdicionais: [
            {
              nome: 'Campo 1',
              valor: 'Informação Adicional1 do PSP-Recebedor',
            },
            {
              nome: 'Campo 2',
              valor: 'Informação Adicional2 do PSP-Recebedor',
            },
          ],
        }),
      })

      const data = await res.json()
      console.log('Resposta do PIX:', data)
    } catch (err) {
      console.error('Erro ao consultar PIX:', err)
      alert('Erro ao consultar PIX')
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 flex flex-col gap-4 p-4">
      <h1 className="text-2xl font-bold text-center">
        Qr Code PIX Santander Sandbox
      </h1>
      <Label>TxID</Label>
      <Input
        value={txid}
        onChange={(e) => setTxid(e.target.value)}
        placeholder="SILAS000000000000000000000000000001"
      />

      <Label>Expiração (segundos)</Label>
      <Input value={expiracao} onChange={(e) => setExpiracao(e.target.value)} />

      <Label>Nome do Devedor</Label>
      <Input value={nome} onChange={(e) => setNome(e.target.value)} />

      <Label>CNPJ do Devedor</Label>
      <Input value={cnpj} onChange={(e) => setCnpj(e.target.value)} />

      <Label>Valor (R$)</Label>
      <Input value={valor} onChange={(e) => setValor(e.target.value)} />

      <Button onClick={consultaPix} variant="destructive">
        Gerar QrCode
      </Button>
    </div>
  )
}
