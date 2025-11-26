import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client" // ✅ Import necessário para usar Prisma.UsuarioWhereInput
import { autenticarRequisicao } from "../../../../../utilitarios/auth"

/**
 * 🔍 Rota POST – Buscar pacientes por nome ou CPF com paginação.
 * Tecnologias: Next.js API Route, Prisma, JWT.
 * Por que existe: permite que o médico localize pacientes registrados na plataforma.
 */
export async function POST(req: Request) {
  try {
    // 🔐 Valida token JWT
    const usuario = await autenticarRequisicao(req)
    if (!usuario) {
      return NextResponse.json(
        { error: "Não autorizado. Token inválido ou ausente." },
        { status: 401 }
      )
    }

    // 🩺 Apenas médicos e farmacêuticos podem acessar esta rota
    if (!usuario.perfis.includes("medico") && !usuario.perfis.includes("farmaceutico")) {
      return NextResponse.json(
        { error: "Ação restrita a médicos e farmacêuticos." },
        { status: 403 }
      )
    }


    // 📦 Lê o corpo da requisição
    const body = await req.json()
    const { termo, pagina } = body

    // 🔠 Normaliza termo de busca (permite vazio)
    const termoBusca = termo?.trim() || ""

    // 🔢 Calcula paginação
    const paginaAtual =
      pagina && !isNaN(parseInt(pagina))
        ? Math.max(parseInt(pagina), 1)
        : 1

    const registrosPorPagina = 10
    const skip = (paginaAtual - 1) * registrosPorPagina

    // 🧩 Monta filtro de busca combinando perfil + termo
    const whereFiltro: Prisma.UsuarioWhereInput = {
      perfis: {
        some: { tipo: "paciente" }
      },
      ...(termoBusca.length > 0 && {
        OR: [
          { nome: { contains: termoBusca, mode: "insensitive" } },
          { cpf: { contains: termoBusca } }
        ]
      })
    }

    // 📋 Busca pacientes no banco
    const pacientes = await prisma.usuario.findMany({
      where: whereFiltro,
      select: {
        id: true,
        nome: true,
        cpf: true,
        email: true
      },
      orderBy: { nome: "asc" },
      skip,
      take: registrosPorPagina
    })

    // 🔢 Conta total de registros
    const total = await prisma.usuario.count({ where: whereFiltro })

    // 📤 Retorna resultados e informações de paginação
    return NextResponse.json({
      pacientes,
      paginaAtual,
      totalPaginas: Math.ceil(total / registrosPorPagina),
      totalRegistros: total
    })
  } catch (error) {
    console.error("Erro em /api/eventos/pacientes/buscar:", error)
    return NextResponse.json(
      { error: "Erro interno ao buscar pacientes." },
      { status: 500 }
    )
  }
}
