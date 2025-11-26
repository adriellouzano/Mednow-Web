import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { autenticarRequisicao } from "../../../../utilitarios/auth"
import { emitirEventoGlobal } from "@/utilitarios/emissores"

/**
 * Rota PATCH para atualizar alarme existente.
 * Tecnologias: Next.js API Route, Prisma, JWT, SSE.
 * Por que existe: permitir que o farmacêutico altere horários ou frequência
 * e notificar o paciente em tempo real.
 */
export async function PATCH(req: Request) {
  try {
    const usuario = await autenticarRequisicao(req)
    if (!usuario) {
      return NextResponse.json(
        { error: "Não autorizado. Token inválido ou ausente." },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { id, horarioInicial, frequencia } = body

    if (!id) {
      return NextResponse.json(
        { error: "ID do alarme não informado." },
        { status: 400 }
      )
    }

    const alarme = await prisma.alarme.update({
      where: { id },
      data: {
        horarioInicial,
        frequenciaDiaria: frequencia, 
        atualizadoEm: new Date()
      },
      include: {
        prescricao: {
          select: { id: true, pacienteId: true, medicamento: true }
        }
      }
    })

    try {
      emitirEventoGlobal("alarme_atualizado", { alarme }) 
    } catch {
      console.warn("Aviso: falha ao emitir evento SSE (cliente desconectado).")
    }

    return NextResponse.json({
      message: "Alarme atualizado com sucesso.",
      alarme
    })
  } catch (error) {
    console.error("Erro em /api/alarmes/atualizar:", error)
    return NextResponse.json(
      { error: "Erro interno ao atualizar alarme." },
      { status: 500 }
    )
  }
}
