"use client"

import { useState, useEffect } from "react" // Adicionado useEffect
import { useRouter, useSearchParams } from "next/navigation" // Adicionado useSearchParams
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { LogIn } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

export default function Login() {
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [erro, setErro] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams() // <--- Adicionado

  // Novos estados para recuperação de senha
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = useState(false)
  const [recoveryEmail, setRecoveryEmail] = useState("")
  const [isSendingRecoveryEmail, setIsSendingRecoveryEmail] = useState(false)
  const [recoveryEmailError, setRecoveryEmailError] = useState<string | null>(null)
  const [recoveryEmailSuccess, setRecoveryEmailSuccess] = useState<string | null>(null)

  useEffect(() => {
    // <--- Adicionado
    const emailFromUrl = searchParams.get("email")
    if (emailFromUrl) {
      setEmail(emailFromUrl)
      // Opcional: Limpar o parâmetro da URL para evitar que o email seja preenchido em recarregamentos futuros
      // router.replace('/login', undefined, { shallow: true });
    }
  }, [searchParams]) // <--- Adicionado

  const handleLogin = async () => {
    setErro("")
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"
      const response = await fetch(`${backendUrl}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, senha }),
        credentials: "include",
      })

      if (response.ok) {
        router.push("/classificacao") // redireciona para classificação
      } else {
        const data = await response.json()
        setErro(data.message || "E-mail ou senha incorretos.")
      }
    } catch (error: any) {
      console.error("Erro ao conectar ao servidor:", error)
      setErro("Erro ao conectar ao servidor. Verifique sua conexão ou o status do backend.")
    }
  }

  const handleForgotPassword = async () => {
    setRecoveryEmailError(null)
    setRecoveryEmailSuccess(null)
    if (!recoveryEmail) {
      setRecoveryEmailError("Por favor, insira seu e-mail.")
      return
    }

    setIsSendingRecoveryEmail(true)
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"
      const response = await fetch(`${backendUrl}/api/recuperar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: recoveryEmail }),
      })

      const data = await response.json()

      if (response.ok) {
        setRecoveryEmailSuccess("Link de recuperação enviado para o seu e-mail!")
        setTimeout(() => {
          setIsForgotPasswordModalOpen(false)
          setRecoveryEmail("")
        }, 2000)
      } else {
        setRecoveryEmailError(data.error || "Erro ao enviar e-mail de recuperação.")
      }
    } catch (e) {
      console.error("Erro de conexão ao recuperar senha:", e)
      setRecoveryEmailError("Erro de conexão com o servidor. Tente novamente.")
    } finally {
      setIsSendingRecoveryEmail(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-orange-50 px-4 py-8">
      <Card className="w-full max-w-md shadow-xl rounded-lg border border-gray-200 bg-white">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center">
            <LogIn className="h-10 w-10 text-orange-600" />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900">Login</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {erro && (
            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">{erro}</AlertDescription>
            </Alert>
          )}
          <Input
            type="email"
            placeholder="Seu e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 px-4 text-lg border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
          <Input
            type="password"
            placeholder="Sua senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="h-12 px-4 text-lg border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
          {/* Novo link "Esqueci minha senha" */}
          <div className="text-right">
            <Button
              variant="link"
              onClick={() => setIsForgotPasswordModalOpen(true)}
              className="text-sm text-orange-600 hover:text-orange-700 p-0 h-auto"
            >
              Esqueci minha senha
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button
            onClick={handleLogin}
            className="w-full h-12 text-lg bg-orange-600 hover:bg-orange-700 text-white transition-colors"
          >
            Entrar
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/registrar")}
            className="w-full h-12 text-lg border-orange-600 text-orange-600 hover:bg-orange-100 transition-colors"
          >
            Criar Conta
          </Button>
        </CardFooter>
      </Card>

      {/* Modal de Recuperação de Senha */}
      <Dialog open={isForgotPasswordModalOpen} onOpenChange={setIsForgotPasswordModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white p-6 rounded-lg shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">Recuperar Senha</DialogTitle>
            <DialogDescription className="text-gray-600">
              Insira seu e-mail para receber um link de recuperação de senha.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {recoveryEmailError && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">{recoveryEmailError}</AlertDescription>
              </Alert>
            )}
            {recoveryEmailSuccess && (
              <Alert className="border-green-200 bg-green-50">
                <AlertDescription className="text-green-800">{recoveryEmailSuccess}</AlertDescription>
              </Alert>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="recovery-email" className="text-right text-gray-800">
                E-mail:
              </Label>
              <Input
                id="recovery-email"
                type="email"
                value={recoveryEmail}
                onChange={(e) => setRecoveryEmail(e.target.value)}
                className="col-span-3 border-gray-300 focus:ring-orange-500 focus:border-orange-500"
                placeholder="seu.email@exemplo.com"
              />
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row sm:justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsForgotPasswordModalOpen(false)}
              className="border-gray-300 text-gray-700 hover:bg-gray-100"
              disabled={isSendingRecoveryEmail}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleForgotPassword}
              className="bg-orange-600 hover:bg-orange-700 text-white"
              disabled={isSendingRecoveryEmail}
            >
              {isSendingRecoveryEmail ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar Link"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
