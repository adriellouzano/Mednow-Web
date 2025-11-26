import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { autenticarRequisicao } from "../../../../utilitarios/auth"

/**
 * Rota GET para listar alarmes.
 * Tecnologias: Next.js API Route, Prisma, JWT.
 * Por que existe: permitir que farmacêuticos e pacientes consultem alarmes configurados.
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
    const pacienteId = searchParams.get("pacienteId") || undefined
    const prescricaoId = searchParams.get("prescricaoId") || undefined
    const criadoPorId = searchParams.get("criadoPorId") || undefined

    // Filtros dinâmicos
    const where: Record<string, unknown> = {}
    if (pacienteId) {
      where.prescricao = { pacienteId }
    }
    if (prescricaoId) {
      where.prescricaoId = prescricaoId
    }
    if (criadoPorId) {
      where.criadoPorId = criadoPorId
    }

    // Se o usuário for paciente, limita a seus próprios alarmes
    const perfilEhPaciente = usuario.perfis.includes("paciente")
    if (perfilEhPaciente && !pacienteId) {
      where.prescricao = { pacienteId: usuario.id }
    }

    // Consulta alarmes com informações da prescrição e do criador
    const alarmes = await prisma.alarme.findMany({
      where,
      orderBy: { criadoEm: "desc" },
      select: {
        id: true,
        horarioInicial: true,
        frequenciaDiaria: true,      // ✅ CORRIGIDO
        duracaoDias: true,           // ⭐ IMPORTANTE (modelo exige)
        criadoEm: true,
        prescricaoId: true,
        criadoPor: {
          select: {
            id: true,
            nome: true,
            perfis: {
              select: {
                tipo: true           // ⭐ Corrigido para acessar tipo do perfil
              }
            }
          }
        },
        prescricao: {
          select: {
            id: true,
            medicamento: true,
            paciente: {
              select: { id: true, nome: true }
            },
            medico: {
              select: { id: true, nome: true }
            }
          }
        }
      }
    })

    return NextResponse.json({ alarmes })
  } catch (error) {
    console.error("Erro em /api/alarmes/listar:", error)
    return NextResponse.json(
      { error: "Erro interno ao listar alarmes." },
      { status: 500 }
    )
  }
}
