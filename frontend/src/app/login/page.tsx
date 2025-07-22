"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { LogIn } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function Login() {
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [erro, setErro] = useState("")
  const router = useRouter()

  const handleLogin = async () => {
    setErro("")
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"
      const response = await fetch(`${backendUrl}/api/login`, {
        // Alterado de "/api/login" para `${backendUrl}/api/login`
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
    </div>
  )
}
