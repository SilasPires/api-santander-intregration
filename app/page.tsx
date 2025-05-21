'use client'
// pages/index.tsx
import { CRC } from 'crc-full'
import { QRCodeSVG } from 'qrcode.react' // Importação correta para TypeScript
import { useState } from 'react'

export default function App() {
  const [payload, setPayload] = useState('')
  const [identificador, setIdentificador] = useState(
    'SILAS000000000000000000000000000024'
  )
  const [transactionAmount, setTransactionAmount] = useState('1000.00')
  const [txid, setTxid] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const validateInputs = () => {
    if (!identificador || identificador.length > 35) {
      setError('Identificador deve ter 35 caracteres')
      return
    }

    if (transactionAmount && !/^\d+(\.\d{1,2})?$/.test(transactionAmount)) {
      setError('Valor inválido (use formato 123.45)')
      return
    }

    if (!txid) {
      setError('Informe um TXID')
      return
    }

    if (txid.length > 25) {
      setError('TXID deve ter até 25 caracteres')
      return
    }

    setIsLoading(true)
    updateAccessToken()
  }

  const updateAccessToken = async () => {
    try {
      const res = await fetch('/api/santander-auth', {
        method: 'POST',
      })

      const data = await res.json()
      const access_token = data.access_token
      geraCobranca(access_token)
    } catch (err) {
      console.error('Erro ao consultar token:', err)
    }
  }

  const geraCobranca = async (token: string) => {
    try {
      const res = await fetch(`/api/pix?txid=${identificador}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          calendario: {
            expiracao: 600,
          },
          devedor: {
            cpf: '06963397570',
            nome: 'Silas Pires Feitosa',
          },
          valor: {
            original: '0.10',
          },
          chave: '58571081000160',
          solicitacaoPagador: 'SINAL 01 - RESERVA DE IMÓVEL',
          infoAdicionais: [
            {
              nome: 'Identificador Da Transação',
              valor: txid,
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
      transactionAmount:
        '54' + '0' + transactionAmount.length.toString() + transactionAmount,
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
    // console.log('PAYLOAD PIX SEM CRC:', codePix)
    // console.log('CRC RESULT:', crc)
    // console.log('PAYLOAD FULL:', codePix + crc)
    const fullPayload = codePix + crc
    setPayload(fullPayload)
    setIsLoading(false)
  }

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Gerador de Payload Pix</h1>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="space-y-4">
          {/* Campo: Identificador (35 caracteres) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Identificador do PIX (Obrigatório 35 caracteres)
            </label>
            <input
              type="text"
              value={identificador}
              onChange={(e) => setIdentificador(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md"
              placeholder="Identificador da transação"
              maxLength={35}
            />
          </div>

          {/* Campo: Valor da Transação*/}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valor da Transação (opcional - formato: 123.45)
            </label>
            <input
              type="text"
              value={transactionAmount}
              onChange={(e) => setTransactionAmount(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md"
              placeholder="Ex: 100.50"
            />
          </div>

          {/* Campo: TXID (opcional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              TXID (opcional - max. 25 caracteres)
            </label>
            <input
              type="text"
              value={txid}
              onChange={(e) => setTxid(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md"
              placeholder="Identificador da transação"
              maxLength={25}
            />
          </div>
        </div>

        <button
          onClick={validateInputs}
          disabled={isLoading}
          className={`cursor-pointer mt-6 w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors ${
            isLoading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? 'Gerando...' : 'Gerar Payload Pix'}
        </button>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {payload && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Resultado</h2>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="font-medium mb-2">Payload Pix:</h3>
            <div className="p-3 bg-white rounded border border-gray-300 overflow-x-auto">
              <code className="text-sm break-all">{payload}</code>
            </div>

            <button
              onClick={() => navigator.clipboard.writeText(payload)}
              className="mt-3 px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm rounded"
            >
              Copiar Payload
            </button>
          </div>

          {/* QR Code - usando QRCodeSVG */}
          <div className="mt-6 p-4 bg-white rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-3">QR Code Gerado</h3>
            <div className="flex justify-center">
              <QRCodeSVG
                value={payload}
                size={200}
                level="H"
                includeMargin={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
