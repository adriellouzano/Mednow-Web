"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

/**
 * Página de Seleção de Perfil.
 * Tecnologias: Next.js (App Router), JWT, Tailwind CSS.
 * Por que existe: permitir que o usuário escolha o perfil ativo
 * após o login real autenticado.
 */
export default function SelecionarPerfil() {
  const router = useRouter()

  // ====== INÍCIO: Estados globais ======
  const [perfis, setPerfis] = useState<string[]>([])
  const [usuarioNome, setUsuarioNome] = useState("")
  const [erro, setErro] = useState("")
  // ====== FIM: Estados globais ======

  /**
   * Ao carregar:
   * - Lê perfis e nome do usuário do localStorage.
   * - Volta ao login se os dados não existirem.
   */
  useEffect(() => {
    try {
      const perfisSalvos = localStorage.getItem("perfis")
      const nomeSalvo = localStorage.getItem("usuarioNome")

      if (!perfisSalvos) {
        router.push("/login")
        return
      }

      const parsed = JSON.parse(perfisSalvos)
      setPerfis(parsed.map((p: { tipo: string }) => p.tipo))
      setUsuarioNome(nomeSalvo || "")
    } catch (error) {
      console.error("Erro ao carregar perfis:", error)
      setErro("Falha ao carregar perfis.")
    }
  }, [router])

  /**
   * Define o perfil ativo e redireciona para o painel.
   */
  const selecionarPerfil = (perfil: string) => {
    localStorage.setItem("perfilAtivo", perfil)
    router.push(`/painel/${perfil}`)
  }

  /**
   * Logout completo — limpa sessão e volta ao login.
   */
  const sair = () => {
    localStorage.clear()
    router.push("/login")
  }

  return (
    // ====== INÍCIO: Estrutura principal ======
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      {/* ====== Container central ====== */}
      <div className="w-full max-w-md bg-white p-8 rounded shadow text-center space-y-5">
        <h1 className="text-2xl font-bold text-blue-600">Selecione seu perfil</h1>

        {usuarioNome && (
          <p className="text-gray-700">
            Bem-vindo, <strong>{usuarioNome}</strong> 👋
          </p>
        )}

        {erro && <p className="text-red-500">{erro}</p>}

        {perfis.length === 0 ? (
          <p>Nenhum perfil disponível.</p>
        ) : (
          <ul className="flex flex-col gap-3 mt-4">
            {perfis.map((perfil) => (
              <li key={perfil}>
                <button
                  onClick={() => selecionarPerfil(perfil)}
                  className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  {perfil.charAt(0).toUpperCase() + perfil.slice(1)}
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* ====== Botões inferiores ====== */}
        <div className="mt-6 flex flex-col gap-2">
          <button
            onClick={() => router.push("/")}
            className="w-full border border-gray-400 text-gray-700 py-2 rounded hover:bg-gray-100"
          >
            Voltar
          </button>
          <button
            onClick={sair}
            className="w-full border border-red-500 text-red-600 py-2 rounded hover:bg-red-50"
          >
            Sair
          </button>
        </div>
      </div>
    </main>
    // ====== FIM: Estrutura principal ======
  )
}
