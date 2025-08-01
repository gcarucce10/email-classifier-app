"use client"

import type React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import {
  Upload,
  Mail,
  FileText,
  Loader2,
  CheckCircle,
  XCircle,
  Edit3,
  Save,
  X,
  Menu,
  LogOut,
  ListChecks,
  Inbox,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface ClassificationResult {
  id: number
  category: "Produtivo" | "Improdutivo"
  confidence: number
  suggested_response: string
  email_content: string
}

export default function EmailClassifier() {
  const [emailText, setEmailText] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<ClassificationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Estados para edição da resposta
  const [isEditingResponse, setIsEditingResponse] = useState(false)
  const [editedResponse, setEditedResponse] = useState("")

  // Novos estados para classificação automática
  const [isAutoClassifyModalOpen, setIsAutoClassifyModalOpen] = useState(false)
  const [numEmailsToClassify, setNumEmailsToClassify] = useState(5) // Padrão para 5 e-mails
  const [isAutoClassifying, setIsAutoClassifying] = useState(false)
  const [autoClassifyError, setAutoClassifyError] = useState<string | null>(null)
  const [autoClassifySuccess, setAutoClassifySuccess] = useState<string | null>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.type === "text/plain" || file.type === "application/pdf") {
        setSelectedFile(file)
        setError(null)
      } else {
        setError("Por favor, selecione apenas arquivos .txt ou .pdf")
        setSelectedFile(null)
      }
    }
  }

  const handleSubmit = async (type: "text" | "file") => {
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const formData = new FormData()

      if (type === "text") {
        if (!emailText.trim()) {
          setError("Por favor, insira o conteúdo do email")
          setIsLoading(false)
          return
        }
        formData.append("email_text", emailText)
      } else {
        if (!selectedFile) {
          setError("Por favor, selecione um arquivo")
          setIsLoading(false)
          return
        }
        formData.append("file", selectedFile)
      }

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"
      const response = await fetch(`${backendUrl}/api/classify`, {
        method: "POST",
        body: formData,
        credentials: "include",
      })

      if (!response.ok) {
        let errorMessage = "Erro ao processar o email"
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch {
          errorMessage = `Erro HTTP ${response.status}: ${response.statusText}`
        }
        throw new Error(errorMessage)
      }

      const result: ClassificationResult = await response.json()
      setResult(result)
      setEditedResponse(result.suggested_response)
      setIsEditingResponse(false)
    } catch (err) {
      console.error("Erro detalhado:", err)
      if (err instanceof TypeError && err.message.includes("fetch")) {
        setError("Erro de conexão: Verifique se o backend está funcionando")
      } else {
        setError(err instanceof Error ? err.message : "Erro ao processar o email. Tente novamente.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setEmailText("")
    setSelectedFile(null)
    setResult(null)
    setError(null)
    setIsEditingResponse(false)
    setEditedResponse("")
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      alert("Resposta copiada para a área de transferência!")
    } catch (err) {
      const textArea = document.createElement("textarea")
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      try {
        document.execCommand("copy")
        alert("Resposta copiada para a área de transferência!")
      } catch (fallbackErr) {
        alert("Erro ao copiar. Tente selecionar e copiar manualmente.")
      }
      document.body.removeChild(textArea)
    }
  }

  const handleEditResponse = () => {
    setIsEditingResponse(true)
    setEditedResponse(result?.suggested_response || "")
  }

  const handleSaveResponse = async () => {
    if (!result) return

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"

      const response = await fetch(`${backendUrl}/api/respostas/${result.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          suggested_response: editedResponse,
        }),
      })

      if (!response.ok) {
        throw new Error("Erro ao salvar a resposta editada no servidor.")
      }

      const updated = await response.json()

      setResult({
        ...result,
        suggested_response: updated.suggested_response,
      })

      setIsEditingResponse(false)
      alert("Resposta editada e salva com sucesso!")
    } catch (err) {
      console.error("Erro ao atualizar a resposta:", err)
      alert("Ocorreu um erro ao salvar a resposta no banco.")
    }
  }

  const handleCancelEdit = () => {
    setIsEditingResponse(false)
    setEditedResponse(result?.suggested_response || "")
  }

  const handleLogout = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"
      const response = await fetch(`${backendUrl}/api/logout`, {
        method: "POST",
        credentials: "include", // Importante para enviar o cookie de sessão
      })

      if (response.ok) {
        console.log("Logout realizado com sucesso no backend.")
        // Redireciona o usuário para a página de login
        router.push("/login") // Redireciona para a sua página de login
      } else {
        const errorData = await response.json()
        console.error("Erro ao fazer logout:", errorData.message || response.statusText)
        alert("Ocorreu um erro ao fazer logout. Tente novamente.")
      }
    } catch (error) {
      console.error("Erro de conexão ao tentar fazer logout:", error)
      alert("Erro de conexão ao tentar fazer logout. Verifique sua rede.")
    }
  }

  const handleAutomaticClassification = async () => {
    setAutoClassifyError(null)
    setAutoClassifySuccess(null)
    if (numEmailsToClassify < 1 || numEmailsToClassify > 50) {
      setAutoClassifyError("Por favor, insira um número entre 1 e 50.")
      return
    }

    setIsAutoClassifying(true)
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"
      const response = await fetch(`${backendUrl}/api/classificar-inbox`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantidade: numEmailsToClassify }),
        credentials: "include", // Importante para enviar o cookie de sessão
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao classificar e-mails automaticamente.")
      }

      setAutoClassifySuccess(data.message || `${data.classificados.length} e-mails classificados com sucesso!`)
      setTimeout(() => {
        setIsAutoClassifyModalOpen(false)
        setNumEmailsToClassify(5) // Reset para o valor padrão
        setAutoClassifySuccess(null)
        // Opcional: redirecionar para a página de respostas ou mostrar um toast
        // router.push("/respostas");
      }, 2000)
    } catch (err: any) {
      console.error("Erro ao classificar e-mails automaticamente:", err)
      setAutoClassifyError(err.message || "Erro de conexão ao classificar e-mails. Tente novamente.")
    } finally {
      setIsAutoClassifying(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Sidebar Menu */}
      <div className="absolute top-4 left-4 z-20">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-full bg-white shadow-md border-gray-200 hover:bg-gray-50"
            >
              <Menu className="h-6 w-6 text-blue-500" />
              <span className="sr-only">Abrir menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[350px] bg-white p-6 flex flex-col">
            <SheetHeader className="mb-8">
              <SheetTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Mail className="h-7 w-7 text-blue-500" />
                Menu
              </SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-4 flex-grow">
              <Link href="/respostas" passHref>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-lg text-gray-700 hover:bg-blue-100 hover:text-blue-600"
                >
                  <ListChecks className="mr-3 h-5 w-5" />
                  Respostas Sugeridas
                </Button>
              </Link>
              <Button
                onClick={() => setIsAutoClassifyModalOpen(true)}
                variant="ghost"
                className="w-full justify-start text-lg text-gray-700 hover:bg-blue-100 hover:text-blue-600"
              >
                <Inbox className="mr-3 h-6 w-6" />
                Classificação Automática
              </Button>
              <Button
                onClick={handleLogout}
                variant="ghost"
                className="w-full justify-start text-lg text-gray-700 hover:bg-red-100 hover:text-red-700"
              >
                <LogOut className="mr-3 h-5 w-5" />
                Sair
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8 pt-12">
          {" "}
          <div className="flex items-center justify-center mb-4">
            <div className="bg-blue-500 p-3 rounded-full">
              <Mail className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Classificador de Emails</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Automatize a classificação de emails e obtenha sugestões de respostas inteligentes para otimizar o fluxo de
            trabalho da sua equipe
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {!result ? (
            <Card className="shadow-lg border-0 bg-white">
              <CardHeader className="bg-white border-b">
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <FileText className="h-5 w-5 text-blue-500" />
                  Processar Email
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Escolha como deseja enviar o email para classificação
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 bg-white">
                <Tabs defaultValue="text" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6 bg-blue-100 border border-blue-100">
                    <TabsTrigger
                      value="text"
                      className="flex items-center gap-2 text-gray-700 data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-sm hover:bg-blue-100 transition-colors"
                    >
                      <FileText className="h-4 w-4" />
                      Inserir Texto
                    </TabsTrigger>
                    <TabsTrigger
                      value="file"
                      className="flex items-center gap-2 text-gray-700 data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-sm hover:bg-blue-100 transition-colors"
                    >
                      <Upload className="h-4 w-4" />
                      Upload de Arquivo
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="text" className="space-y-4">
                    <div>
                      <Label htmlFor="email-text" className="text-sm font-medium text-gray-800">
                        Conteúdo do Email
                      </Label>
                      <Textarea
                        id="email-text"
                        placeholder="Cole aqui o conteúdo do email que deseja classificar..."
                        value={emailText}
                        onChange={(e) => setEmailText(e.target.value)}
                        className="min-h-[200px] mt-2 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
                      />
                    </div>
                    <Button
                      onClick={() => handleSubmit("text")}
                      disabled={isLoading || !emailText.trim()}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                      size="lg"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processando...
                        </>
                      ) : (
                        <>
                          <Mail className="mr-2 h-4 w-4" />
                          Classificar Email
                        </>
                      )}
                    </Button>
                  </TabsContent>

                  <TabsContent value="file" className="space-y-4">
                    <div>
                      <Label htmlFor="file-upload" className="text-sm font-medium text-gray-800">
                        Arquivo do Email (.txt ou .pdf)
                      </Label>
                      <div className="mt-2">
                        <Input
                          id="file-upload"
                          type="file"
                          accept=".txt,.pdf"
                          onChange={handleFileChange}
                          className="cursor-pointer bg-white border-gray-300 text-gray-900"
                        />
                      </div>
                      {selectedFile && (
                        <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-blue-500" />
                            <span className="text-sm font-medium text-blue-700">{selectedFile.name}</span>
                            <span className="text-xs text-blue-600">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <Button
                      onClick={() => handleSubmit("file")}
                      disabled={isLoading || !selectedFile}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                      size="lg"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processando...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Enviar Arquivo
                        </>
                      )}
                    </Button>
                  </TabsContent>
                </Tabs>

                {error && (
                  <Alert className="mt-4 border-red-200 bg-red-50">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">{error}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Resultado da Classificação */}
              <Card className="shadow-lg border-0 bg-white">
                <CardHeader className="bg-white border-b">
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Resultado da Classificação
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 bg-white">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm font-medium text-gray-800">Categoria</Label>
                      <div className="mt-2">
                        <Badge
                          variant={result.category === "Produtivo" ? "default" : "secondary"}
                          className={`text-sm px-3 py-1 ${
                            result.category === "Produtivo"
                              ? "bg-green-100 text-green-800 border-green-200"
                              : "bg-red-100 text-red-800 border-red-200"
                          }`}
                        >
                          {result.category}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-800">Confiança</Label>
                      <div className="mt-2">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${result.confidence * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {(result.confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Resposta Sugerida */}
              <Card className="shadow-lg border-0 bg-white">
                <CardHeader className="bg-white border-b">
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <Mail className="h-5 w-5 text-blue-500" />
                    Resposta Automática Sugerida
                    {isEditingResponse && (
                      <Badge variant="outline" className="ml-2 text-blue-600 border-blue-100">
                        Editando
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 bg-white">
                  {!isEditingResponse ? (
                    <div className="bg-gray-50 p-4 rounded-lg border">
                      <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{result.suggested_response}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Label htmlFor="edit-response" className="text-sm font-medium text-gray-800">
                        Editar Resposta
                      </Label>
                      <Textarea
                        id="edit-response"
                        value={editedResponse}
                        onChange={(e) => setEditedResponse(e.target.value)}
                        className="min-h-[150px] bg-white border-blue-100 focus:border-blue-400 focus:ring-blue-400 text-gray-900 placeholder:text-gray-500"
                        placeholder="Digite sua resposta personalizada..."
                      />
                    </div>
                  )}

                  <div className="flex gap-2 mt-4">
                    {!isEditingResponse ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-blue-500 border-blue-500 text-white hover:bg-blue-600 hover:text-white"
                          onClick={() => copyToClipboard(result.suggested_response)}
                        >
                          Copiar Resposta
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                          onClick={handleEditResponse}
                        >
                          <Edit3 className="h-4 w-4 mr-1" />
                          Editar Resposta
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="default"
                          size="sm"
                          className="bg-blue-500 hover:bg-blue-600 text-white"
                          onClick={handleSaveResponse}
                        >
                          <Save className="h-4 w-4 mr-1" />
                          Salvar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                          onClick={handleCancelEdit}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Cancelar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-blue-500 border-blue-500 text-white hover:bg-blue-600 hover:text-white"
                          onClick={() => copyToClipboard(editedResponse)}
                        >
                          Copiar
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Botões de Ação */}
              <div className="flex justify-center gap-4">
                <Button
                  onClick={resetForm}
                  variant="default"
                  size="lg"
                  className="min-w-[150px] bg-blue-500 hover:bg-blue-600 text-white"
                >
                  Novo Email
                </Button>
                {/* O botão "Ver Respostas" no menu lateral */}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500 text-sm">
          <p>Classificador de Emails - Automatizando a gestão de comunicações</p>
        </div>
      </div>

      {/* Modal de Classificação Automática */}
      <Dialog open={isAutoClassifyModalOpen} onOpenChange={setIsAutoClassifyModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white p-6 rounded-lg shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">Classificação Automática</DialogTitle>
            <DialogDescription className="text-gray-600">
              Quantos dos seus últimos e-mails você gostaria de classificar? (Máx. 10)
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {autoClassifyError && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">{autoClassifyError}</AlertDescription>
              </Alert>
            )}
            {autoClassifySuccess && (
              <Alert className="border-green-200 bg-green-50">
                <AlertDescription className="text-green-800">{autoClassifySuccess}</AlertDescription>
              </Alert>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="num-emails" className="text-right text-gray-800">
                Quantidade:
              </Label>
              <Input
                id="num-emails"
                type="number"
                min="1"
                max="10"
                value={numEmailsToClassify}
                onChange={(e) => setNumEmailsToClassify(Number.parseInt(e.target.value) || 0)}
                className="col-span-3 border-gray-300 focus:ring-blue-400 focus:border-blue-400"
              />
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row sm:justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsAutoClassifyModalOpen(false)}
              className="border-gray-300 text-gray-700 hover:bg-gray-100"
              disabled={isAutoClassifying}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAutomaticClassification}
              className="bg-blue-500 hover:bg-blue-600 text-white"
              disabled={isAutoClassifying}
            >
              {isAutoClassifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Classificando...
                </>
              ) : (
                <>
                  <Inbox className="mr-2 h-4 w-4" />
                  Classificar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
