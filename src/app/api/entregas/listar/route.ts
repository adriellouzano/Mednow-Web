import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { autenticarRequisicao } from "../../../../utilitarios/auth"

/**
 * Rota GET para listar entregas de prescrições.
 * Tecnologias: Next.js API Route, Prisma, JWT.
 * Por que existe: permitir que farmacêuticos, pacientes e administradores consultem entregas registradas.
 */
export async function GET(req: Request) {
  try {
    // Autentica o usuário
    const usuario = await autenticarRequisicao(req)
    if (!usuario) {
      return NextResponse.json(
        { error: "Não autorizado. Token inválido ou ausente." },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const prescricaoId = searchParams.get("prescricaoId") || undefined
    const farmaceuticoId = searchParams.get("farmaceuticoId") || undefined
    const pacienteId = searchParams.get("pacienteId") || undefined

    const filtros: Record<string, unknown> = {}

    // Filtros dinâmicos
    if (prescricaoId) filtros.prescricaoId = prescricaoId
    if (farmaceuticoId) filtros.farmaceuticoId = farmaceuticoId
    if (pacienteId) filtros.prescricao = { pacienteId }

    // Se for paciente, só vê entregas de suas prescrições
    const perfilEhPaciente = usuario.perfis.includes("paciente")
    if (perfilEhPaciente) {
      filtros.prescricao = { pacienteId: usuario.id }
    }

    // Se for farmacêutico, e não passou o ID, mostra as dele
    const perfilEhFarmaceutico = usuario.perfis.includes("farmaceutico")
    if (perfilEhFarmaceutico && !farmaceuticoId) {
      filtros.farmaceuticoId = usuario.id
    }

    // Consulta as entregas com vínculos
    const entregas = await prisma.entrega.findMany({
      where: filtros,
      orderBy: { criadoEm: "desc" },
      select: {
        id: true,
        dataEntrega: true,
        criadoEm: true,
        prescricao: {
          select: {
            id: true,
            medicamento: true,
            paciente: { select: { id: true, nome: true } },
            medico: { select: { id: true, nome: true } }
          }
        },
        farmaceutico: {
          select: {
            id: true,
            nome: true,
            perfis: {
              where: { tipo: "farmaceutico" },
              select: { crf: true }
            }
          }
        }
      }
    })

    return NextResponse.json({ entregas })
  } catch (error) {
    console.error("Erro em /api/entregas/listar:", error)
    return NextResponse.json(
      { error: "Erro interno ao listar entregas." },
      { status: 500 }
    )
  }
}
