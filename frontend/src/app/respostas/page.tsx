"use client"

import { Mail, CalendarCheck, Trash2, Send } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from 'lucide-react'

interface Resposta {
  id: number
  email_content: string
  suggested_response: string
  category: "Produtivo" | "Improdutivo"
}

export default function RespostasSugeridas() {
  const [respostas, setRespostas] = useState<Resposta[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  // Estados para o modal de encaminhamento
  const [isForwardModalOpen, setIsForwardModalOpen] = useState(false)
  const [selectedResponseForForward, setSelectedResponseForForward] = useState<Resposta | null>(null)
  const [recipientEmail, setRecipientEmail] = useState("")
  const [emailSubject, setEmailSubject] = useState("")
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const [sendEmailError, setSendEmailError] = useState<string | null>(null)
  const [sendEmailSuccess, setSendEmailSuccess] = useState<string | null>(null)

  useEffect(() => {
    const fetchRespostas = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"
        const res = await fetch(`${backendUrl}/api/respostas`)
        if (!res.ok) throw new Error("Erro ao buscar respostas")
        const data = await res.json()
        setRespostas(data)
      } catch (err) {
        setErro("Não foi possível carregar as respostas.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchRespostas()
  }, [])

  const excluirResposta = async (id: number) => {
    const confirmado = confirm("Tem certeza que deseja excluir esta resposta?")
    if (!confirmado) return

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"
      const res = await fetch(`${backendUrl}/api/respostas/${id}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        throw new Error("Erro ao excluir resposta.")
      }

      setRespostas((prev) => prev.filter((r) => r.id !== id))
      alert("Resposta excluída com sucesso!")
    } catch (err) {
      console.error("Erro ao excluir:", err)
      alert("Erro ao excluir resposta.")
    }
  }

  const handleForwardClick = (resposta: Resposta) => {
    setSelectedResponseForForward(resposta)
    setEmailSubject(`Resposta Sugerida para: ${resposta.email_content.substring(0, 50)}...`) // Sugere um título
    setRecipientEmail("") // Limpa o email do destinatário
    setSendEmailError(null)
    setSendEmailSuccess(null)
    setIsForwardModalOpen(true)
  }

  const handleSendEmail = async () => {
    if (!recipientEmail || !emailSubject || !selectedResponseForForward) {
      setSendEmailError("Por favor, preencha todos os campos.")
      return
    }

    setIsSendingEmail(true)
    setSendEmailError(null)
    setSendEmailSuccess(null)

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"
      const res = await fetch(`${backendUrl}/api/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: recipientEmail,
          subject: emailSubject,
          response_id: selectedResponseForForward.id,
        }),
        credentials: "include", // Inclui cookies para autenticação
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Erro ao enviar e-mail.")
      }

      setSendEmailSuccess("E-mail enviado com sucesso!")
      setTimeout(() => {
        setIsForwardModalOpen(false)
        setRecipientEmail("")
        setEmailSubject("")
        setSelectedResponseForForward(null)
      }, 1500)
    } catch (err: any) {
      console.error("Erro ao enviar e-mail:", err)
      setSendEmailError(err.message || "Erro ao enviar e-mail. Tente novamente.")
    } finally {
      setIsSendingEmail(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50 py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-orange-600 p-3 rounded-full">
              <CalendarCheck className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900">Respostas Sugeridas</h1>
          <p className="text-gray-600 mt-2">Veja o histórico de respostas automáticas geradas</p>
        </div>

        {loading ? (
          <p className="text-center text-orange-600">Carregando respostas...</p>
        ) : erro ? (
          <p className="text-center text-red-600">{erro}</p>
        ) : (
          <div className="space-y-6">
            {respostas.length === 0 ? (
              <p className="text-center text-gray-500">Nenhuma resposta encontrada.</p>
            ) : (
              respostas.map((resposta) => (
                <Card key={resposta.id} className="bg-white shadow border border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-lg text-black flex items-center gap-2">
                      <Mail className="h-5 w-5 text-orange-600" />
                      Email Classificado
                      <Badge
                        variant="outline"
                        className={`ml-auto ${
                          resposta.category === "Produtivo"
                            ? "text-green-800 border-green-200"
                            : "text-orange-800 border-orange-300"
                        }`}
                      >
                        {resposta.category}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-800">Conteúdo do Email:</h4>
                      <p className="text-gray-700 whitespace-pre-wrap">{resposta.email_content}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">Resposta Sugerida:</h4>
                      <p className="text-gray-700 whitespace-pre-wrap">{resposta.suggested_response}</p>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1 text-orange-600 border-orange-600 hover:bg-orange-100 bg-transparent"
                        onClick={() => handleForwardClick(resposta)}
                      >
                        <Send className="w-4 h-4" />
                        Encaminhar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1 text-red-600 border-red-600 hover:bg-red-100 bg-transparent"
                        onClick={() => excluirResposta(resposta.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                        Excluir
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>

      {/* Modal de Encaminhamento de Email */}
      <Dialog open={isForwardModalOpen} onOpenChange={setIsForwardModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white p-6 rounded-lg shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">Encaminhar Resposta</DialogTitle>
            <DialogDescription className="text-gray-600">
              Preencha os detalhes para encaminhar a resposta sugerida.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {sendEmailError && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">{sendEmailError}</AlertDescription>
              </Alert>
            )}
            {sendEmailSuccess && (
              <Alert className="border-green-200 bg-green-50">
                <AlertDescription className="text-green-800">{sendEmailSuccess}</AlertDescription>
              </Alert>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="recipient-email" className="text-right text-gray-800">
                Para:
              </Label>
              <Input
                id="recipient-email"
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                className="col-span-3 border-gray-300 focus:ring-orange-500 focus:border-orange-500"
                placeholder="destinatario@exemplo.com"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email-subject" className="text-right text-gray-800">
                Assunto:
              </Label>
              <Input
                id="email-subject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                className="col-span-3 border-gray-300 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Assunto do e-mail"
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="email-body" className="text-right text-gray-800">
                Conteúdo:
              </Label>
              <div className="col-span-3 p-3 border border-gray-200 rounded-md bg-gray-50 text-gray-700 text-sm max-h-[150px] overflow-auto whitespace-pre-wrap">
                {selectedResponseForForward?.suggested_response}
              </div>
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row sm:justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsForwardModalOpen(false)}
              className="border-gray-300 text-gray-700 hover:bg-gray-100"
              disabled={isSendingEmail}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSendEmail}
              className="bg-orange-600 hover:bg-orange-700 text-white"
              disabled={isSendingEmail}
            >
              {isSendingEmail ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Enviar E-mail
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
