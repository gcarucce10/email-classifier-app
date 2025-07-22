"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { UserPlus } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function Registrar() {
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [erro, setErro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState<string | null>(null)
  const [smtpPassword, setSmtpPassword] = useState("")
  const router = useRouter()

  const handleRegistrar = async () => {
    setErro(null)
    setSucesso(null)

    if (!email || !senha) {
      setErro("Por favor, preencha todos os campos.")
      return
    }

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"
      const response = await fetch(`${backendUrl}/api/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, senha, smtp_password: smtpPassword }),
      })

      const data = await response.json()

      if (response.ok) {
        setSucesso("Conta criada com sucesso! Redirecionando...")
        setTimeout(() => {
          router.push("/login")
        }, 2000)
      } else {
        setErro(data.message || "Erro ao criar conta.")
      }
    } catch (error: any) {
      setErro(error.message || "Erro inesperado.")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-orange-50 px-4 py-8">
      <Card className="w-full max-w-md shadow-xl rounded-lg border border-gray-200 bg-white">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center">
            <UserPlus className="h-10 w-10 text-orange-600" />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900">Criar Conta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {erro && (
            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">{erro}</AlertDescription>
            </Alert>
          )}
          {sucesso && (
            <Alert className="border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">{sucesso}</AlertDescription>
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
          <p className="text-xs text-gray-600 mt-1">
            Gere sua senha de aplicativo do Gmail em{" "}
            <a
            href="https://myaccount.google.com/apppasswords"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            myaccount.google.com/apppasswords
          </a>
        </p>
        <Input
            type="password"
            placeholder="Sua senha de aplicativo Gmail"
            value={smtpPassword}
            onChange={(e) => setSmtpPassword(e.target.value)}
            className="h-12 px-4 text-lg border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
          <Button
            className="w-full h-12 text-lg bg-orange-600 text-white hover:bg-orange-700 transition-colors"
            onClick={handleRegistrar}
          >
            Criar
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/login")}
            className="w-full h-12 text-lg border-orange-600 text-orange-600 hover:bg-orange-100 transition-colors"
          >
            Já tem uma conta? Entrar
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
