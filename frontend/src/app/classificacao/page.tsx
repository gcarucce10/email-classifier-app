"use client"

import type React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Upload, Mail, FileText, Loader2, CheckCircle, XCircle, Edit3, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50">
      {/* Container para os botões de Sair e Respostas Sugeridas */}
      <div className="absolute top-4 left-4 right-4 flex justify-between z-10">
        <Button
          onClick={handleLogout}
          variant="outline"
          className="bg-red-500 hover:bg-red-600 text-white border-red-500 px-4 py-2 rounded-md"
        >
          Sair
        </Button>
        <Link href="/respostas" passHref>
          <Button
            variant="outline"
            className="bg-orange-600 hover:bg-orange-700 text-white border-orange-600 px-4 py-2 rounded-md"
          >
            Ir para Respostas Sugeridas
          </Button>
        </Link>
      </div>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-orange-600 p-3 rounded-full">
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
                  <FileText className="h-5 w-5 text-orange-600" />
                  Processar Email
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Escolha como deseja enviar o email para classificação
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 bg-white">
                <Tabs defaultValue="text" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6 bg-orange-100 border border-orange-200">
                    <TabsTrigger
                      value="text"
                      className="flex items-center gap-2 text-gray-700 data-[state=active]:bg-orange-600 data-[state=active]:text-white data-[state=active]:shadow-sm hover:bg-orange-200 transition-colors"
                    >
                      <FileText className="h-4 w-4" />
                      Inserir Texto
                    </TabsTrigger>
                    <TabsTrigger
                      value="file"
                      className="flex items-center gap-2 text-gray-700 data-[state=active]:bg-orange-600 data-[state=active]:text-white data-[state=active]:shadow-sm hover:bg-orange-200 transition-colors"
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
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white"
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
                        <div className="mt-2 p-3 bg-orange-50 rounded-lg border border-orange-200">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-orange-600" />
                            <span className="text-sm font-medium text-orange-800">{selectedFile.name}</span>
                            <span className="text-xs text-orange-600">
                              ({(selectedFile.size / 1024).toFixed(1)} KB)
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    <Button
                      onClick={() => handleSubmit("file")}
                      disabled={isLoading || !selectedFile}
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white"
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
                              : "bg-orange-100 text-orange-800 border-orange-200"
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
                              className="bg-orange-600 h-2 rounded-full transition-all duration-500"
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
                    <Mail className="h-5 w-5 text-orange-600" />
                    Resposta Automática Sugerida
                    {isEditingResponse && (
                      <Badge variant="outline" className="ml-2 text-orange-600 border-orange-200">
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
                        className="min-h-[150px] bg-white border-orange-200 focus:border-orange-400 focus:ring-orange-400 text-gray-900 placeholder:text-gray-500"
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
                          className="bg-orange-600 border-orange-600 text-white hover:bg-orange-700 hover:text-white"
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
                          className="bg-orange-600 hover:bg-orange-700 text-white"
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
                          className="bg-orange-600 border-orange-600 text-white hover:bg-orange-700 hover:text-white"
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
                  className="min-w-[150px] bg-orange-600 hover:bg-orange-700 text-white"
                >
                  Novo Email
                </Button>
                <Link href="/respostas">
                  <Button
                    variant="outline"
                    size="lg"
                    className="min-w-[150px] border-orange-600 text-orange-600 hover:bg-orange-100 bg-transparent"
                  >
                    Ver Respostas
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500 text-sm">
          <p>Classificador de Emails - Automatizando a gestão de comunicações</p>
        </div>
      </div>
    </div>
  )
}
