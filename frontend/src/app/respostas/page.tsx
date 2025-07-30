"use client"

import { Mail, CalendarCheck, Trash2, Send, Edit3, Save, X, Loader2 } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"

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

  // Novos estados para o modal de edição
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [currentEditingResponse, setCurrentEditingResponse] = useState<Resposta | null>(null)
  const [editedResponseText, setEditedResponseText] = useState("")
  const [isSavingEdit, setIsSavingEdit] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)
  const [editSuccess, setEditSuccess] = useState<string | null>(null)

  // Novos estados para exclusão de todas as respostas
  const [isDeletingAll, setIsDeletingAll] = useState(false)
  const [deleteAllError, setDeleteAllError] = useState<string | null>(null)
  const [deleteAllSuccess, setDeleteAllSuccess] = useState<string | null>(null)

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

  // Funções para edição
  const handleEditClick = (resposta: Resposta) => {
    setCurrentEditingResponse(resposta)
    setEditedResponseText(resposta.suggested_response)
    setEditError(null)
    setEditSuccess(null)
    setIsEditModalOpen(true)
  }

  const handleSaveEditedResponse = async () => {
    if (!currentEditingResponse || !editedResponseText.trim()) {
      setEditError("A resposta não pode estar vazia.")
      return
    }

    setIsSavingEdit(true)
    setEditError(null)
    setEditSuccess(null)

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"
      const res = await fetch(`${backendUrl}/api/respostas/${currentEditingResponse.id}/editar`, {
        // Note the /editar in the URL
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nova_resposta: editedResponseText }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Erro ao salvar a resposta editada.")
      }

      // Atualiza a lista de respostas no estado local
      setRespostas((prev) =>
        prev.map((r) => (r.id === currentEditingResponse.id ? { ...r, suggested_response: editedResponseText } : r)),
      )
      setEditSuccess("Resposta salva com sucesso!")
      setTimeout(() => {
        setIsEditModalOpen(false)
        setCurrentEditingResponse(null)
        setEditedResponseText("")
      }, 1500)
    } catch (err: any) {
      console.error("Erro ao salvar edição:", err)
      setEditError(err.message || "Erro ao salvar a resposta. Tente novamente.")
    } finally {
      setIsSavingEdit(false)
    }
  }

  const handleCancelEdit = () => {
    setIsEditModalOpen(false)
    setCurrentEditingResponse(null)
    setEditedResponseText("")
  }

  const handleDeleteAllResponses = async () => {
    const confirmado = confirm("Tem certeza que deseja EXCLUIR TODAS as respostas sugeridas? Esta ação é irreversível.")
    if (!confirmado) return

    setIsDeletingAll(true)
    setDeleteAllError(null)
    setDeleteAllSuccess(null)

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"
      const res = await fetch(`${backendUrl}/api/respostas`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Erro ao excluir todas as respostas.")
      }

      setRespostas([]) // Limpa todas as respostas no frontend
      setDeleteAllSuccess("Todas as respostas foram excluídas com sucesso!")
      setTimeout(() => {
        setDeleteAllSuccess(null)
      }, 2000)
    } catch (err: any) {
      console.error("Erro ao excluir todas as respostas:", err)
      setDeleteAllError(err.message || "Erro ao excluir todas as respostas. Tente novamente.")
    } finally {
      setIsDeletingAll(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-500 p-3 rounded-full">
              <CalendarCheck className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900">Respostas Sugeridas</h1>
          <p className="text-gray-600 mt-2">Veja o histórico de respostas automáticas geradas</p>
        </div>

        {/* Botão Excluir Todas as Respostas */}
        <div className="flex justify-end max-w-5xl mx-auto mb-6">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1 text-red-600 border-red-600 hover:bg-red-100 bg-transparent"
            onClick={handleDeleteAllResponses}
            disabled={loading || isDeletingAll || respostas.length === 0} // Desabilita se estiver carregando, excluindo ou não houver respostas
          >
            {isDeletingAll ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Excluindo...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Excluir Todas
              </>
            )}
          </Button>
        </div>

        {deleteAllError && (
          <Alert variant="destructive" className="mt-4 border-red-200 bg-red-50 max-w-5xl mx-auto mb-6">
            <AlertDescription className="text-red-800">{deleteAllError}</AlertDescription>
          </Alert>
        )}
        {deleteAllSuccess && (
          <Alert className="mt-4 border-green-200 bg-green-50 max-w-5xl mx-auto mb-6">
            <AlertDescription className="text-green-800">{deleteAllSuccess}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <p className="text-center text-blue-500">Carregando respostas...</p>
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
                      <Mail className="h-5 w-5 text-blue-500" />
                      Email Classificado
                      <Badge
                        variant="outline"
                        className={`ml-auto ${
                          resposta.category === "Produtivo"
                            ? "text-green-800 border-green-200"
                            : "text-red-800 border-red-200"
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
                        className="flex items-center gap-1 text-blue-500 border-blue-500 hover:bg-blue-100 bg-transparent"
                        onClick={() => handleForwardClick(resposta)}
                      >
                        <Send className="w-4 h-4" />
                        Encaminhar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1 text-blue-500 border-blue-500 hover:bg-blue-100 bg-transparent"
                        onClick={() => handleEditClick(resposta)}
                      >
                        <Edit3 className="w-4 h-4" />
                        Editar
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

      {/* Modal de Encaminhamento de Email (existente) */}
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
                className="col-span-3 border-gray-300 focus:ring-blue-400 focus:border-blue-400"
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
                className="col-span-3 border-gray-300 focus:ring-blue-400 focus:border-blue-400"
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
              className="bg-blue-500 hover:bg-blue-600 text-white"
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

      {/* Novo Modal de Edição de Resposta */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white p-6 rounded-lg shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">Editar Resposta Sugerida</DialogTitle>
            <DialogDescription className="text-gray-600">
              Edite o conteúdo da resposta sugerida e salve as alterações.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {editError && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">{editError}</AlertDescription>
              </Alert>
            )}
            {editSuccess && (
              <Alert className="border-green-200 bg-green-50">
                <AlertDescription className="text-green-800">{editSuccess}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="edit-response-textarea" className="text-sm font-medium text-gray-800">
                Conteúdo da Resposta:
              </Label>
              <Textarea
                id="edit-response-textarea"
                value={editedResponseText}
                onChange={(e) => setEditedResponseText(e.target.value)}
                className="min-h-[200px] border-gray-300 focus:ring-blue-400 focus:border-blue-400 text-gray-900"
                placeholder="Edite a resposta aqui..."
              />
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row sm:justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={handleCancelEdit}
              className="border-gray-300 text-gray-700 hover:bg-gray-100 bg-transparent"
              disabled={isSavingEdit}
            >
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
            <Button
              onClick={handleSaveEditedResponse}
              className="bg-blue-500 hover:bg-blue-600 text-white"
              disabled={isSavingEdit}
            >
              {isSavingEdit ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
