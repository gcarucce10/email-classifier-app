"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { LockIcon as LockReset } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [token, setToken] = useState<string | null>(null)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    const tokenFromUrl = searchParams.get("token")
    if (tokenFromUrl) {
      setToken(tokenFromUrl)
    } else {
      setError("Token de recuperação não encontrado na URL.")
    }
  }, [searchParams])

  const handleResetPassword = async () => {
    setError(null)
    setSuccess(null)

    if (!token) {
      setError("Token de recuperação inválido ou ausente.")
      return
    }

    if (!newPassword || !confirmPassword) {
      setError("Por favor, preencha todos os campos.")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem.")
      return
    }

    setIsLoading(true)
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"
      const response = await fetch(`${backendUrl}/api/resetar-senha`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          nova_senha: newPassword,
          confirmar_nova_senha: confirmPassword,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Senha redefinida com sucesso! Redirecionando para o login...")
        // Passa o email como query parameter para a página de login
        router.push(`/login?email=${data.email}`) 
      } else {
        setError(data.error || "Erro ao redefinir a senha. Token inválido ou expirado.")
      }
    } catch (e) {
      console.error("Erro de conexão ao redefinir senha:", e)
      setError("Erro de conexão com o servidor. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-orange-50 px-4 py-8">
      <Card className="w-full max-w-md shadow-xl rounded-lg border border-gray-200 bg-white">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center">
            <LockReset className="h-10 w-10 text-orange-600" />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900">Redefinir Senha</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}
          {!token && !error ? (
            <p className="text-center text-gray-600">Carregando token...</p>
          ) : (
            <>
              <Input
                type="password"
                placeholder="Nova Senha"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="h-12 px-4 text-lg border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
              <Input
                type="password"
                placeholder="Confirmar Nova Senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-12 px-4 text-lg border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button
            onClick={handleResetPassword}
            className="w-full h-12 text-lg bg-orange-600 hover:bg-orange-700 text-white transition-colors"
            disabled={isLoading || !token || !!error}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Redefinindo...
              </>
            ) : (
              "Redefinir Senha"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
