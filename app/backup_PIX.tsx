'use client'

import { Button } from '@/components/ui/button'
import { CRC } from 'crc-full'

export default function Home() {
  const txidteste = 'SILAS000000000000000000000000000022'
  const amount = '0.10'
  const tamanhoDoCampoAmount = '04'

  const updateAccessToken = async () => {
    try {
      const res = await fetch('/api/santander-auth', {
        method: 'POST',
      })

      const data = await res.json()
      const access_token = data.access_token
      console.log(access_token)
      geraCobranca(access_token)
    } catch (err) {
      console.error('Erro ao consultar token:', err)
    }
  }

  // const getPixQrCode = async (token: string) => {
  //   try {
  //     const res = await fetch(`/api/pix?txid=${txidteste}`, {
  //       method: 'GET',
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     })

  //     const data = await res.json()
  //     console.log(data)
  //   } catch (err) {
  //     console.error('Erro ao consultar PIX:', err)
  //   }
  // }

  const geraCobranca = async (token: string) => {
    try {
      const res = await fetch(`/api/pix?txid=${txidteste}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          calendario: {
            expiracao: 30,
          },
          devedor: {
            cpf: '06963397570',
            nome: 'Silas Pires Feitosa',
          },
          valor: {
            original: '0.10',
          },
          chave: '58571081000160',
          solicitacaoPagador: 'Sinal 01',
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
      console.log(data)
      geraEmv(data.location)
    } catch (err) {
      console.error('Erro ao consultar PIX:', err)
    }
  }

  const geraEmv = (codePayload: string) => {
    const defaultPixFields = {
      indicator: '000201',
      initiation: '010212',
      merchantAccountInformation: '26850014',
      merchantAccountInformationSub1: 'br.gov.bcb.pix',
      merchantAccountInformationSub2: '2563',
      payload: codePayload,
      merchantCategoryCode: '52040000',
      transactionCurrency: '5303986',
      transactionAmount: '54' + tamanhoDoCampoAmount + amount,
      countryCode: '5802BR',
      merchantName: '59' + '19' + 'SILAS PIRES FEITOSA', // MAX 25 CHAR
      merchantCity: '60' + '11' + 'VIT DA CONQ', // MAX 15 CHAR
      txid: '6213' + '0509' + 'casa04q06', // MAX 25 CHAR
      crc16: '6304',
    }
    const codePix =
      defaultPixFields.indicator +
      defaultPixFields.initiation +
      defaultPixFields.merchantAccountInformation +
      defaultPixFields.merchantAccountInformationSub1 +
      defaultPixFields.merchantAccountInformationSub2 +
      defaultPixFields.payload +
      defaultPixFields.merchantCategoryCode +
      defaultPixFields.transactionCurrency +
      defaultPixFields.transactionAmount +
      defaultPixFields.countryCode +
      defaultPixFields.merchantName +
      defaultPixFields.merchantCity +
      defaultPixFields.txid +
      defaultPixFields.crc16

    const crc16ccittFalse = CRC.default('CRC16_CCITT_FALSE')
    let crc = ''
    if (crc16ccittFalse) {
      crc = crc16ccittFalse
        .compute(Buffer.from(codePix, 'utf8'))
        .toString(16)
        .toUpperCase()
        .padStart(4, '0')
    } else {
      console.error('CRC16_CCITT_FALSE is undefined')
    }
    console.log('PAYLOAD PIX SEM CRC:', codePix)
    console.log('CRC RESULT:', crc)
    console.log('PAYLOAD FULL:', codePix + crc)
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
