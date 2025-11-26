import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { autenticarRequisicao } from "../../../../utilitarios/auth"
import { emitirEventoGlobal } from "@/utilitarios/emissores"

/**
 * Rota POST para configurar um alarme de uso de medicamento.
 * Tecnologias: Next.js API Route, Prisma, JWT.
 * Por que existe: permitir que pacientes e farmacêuticos criem lembretes de medicação.
 */
export async function POST(req: Request) {
  try {
    // Valida token JWT
    const usuario = await autenticarRequisicao(req)

    if (!usuario) {
      return NextResponse.json(
        { error: "Não autorizado. Token inválido ou ausente." },
        { status: 401 }
      )
    }

    // 🚨 Somente PACIENTES e FARMACÊUTICOS podem criar alarmes
    if (
      !usuario.perfis.includes("paciente") &&
      !usuario.perfis.includes("farmaceutico")
    ) {
      return NextResponse.json(
        { error: "Ação restrita a pacientes ou farmacêuticos." },
        { status: 403 }
      )
    }

    const body = await req.json()
    const {
      prescricaoId,
      horarioInicial,
      frequencia,
      duracaoDias,
      criadoPorId
    } = body

    // 🔎 Validação dos campos obrigatórios
    if (
      !prescricaoId ||
      !horarioInicial ||
      !frequencia ||
      !duracaoDias ||
      !criadoPorId
    ) {
      return NextResponse.json(
        { error: "Todos os campos são obrigatórios." },
        { status: 400 }
      )
    }

    // Confere se a prescrição existe
    const prescricaoExiste = await prisma.prescricao.findUnique({
      where: { id: prescricaoId }
    })

    if (!prescricaoExiste) {
      return NextResponse.json(
        { error: "Prescrição não encontrada." },
        { status: 404 }
      )
    }

    // 🟢 Cria o alarme corretamente conforme o schema Prisma
    const alarme = await prisma.alarme.create({
      data: {
        prescricaoId,
        horarioInicial,
        frequenciaDiaria: frequencia,
        duracaoDias,
        criadoPorId
      }
    })

    // 🔔 Envia evento SSE para pacientes conectados
    try {
      emitirEventoGlobal("novo_alarme", { alarme })
    } catch (err) {
      console.warn("Aviso: falha ao emitir evento SSE.", err)
    }

    return NextResponse.json({
      message: "Alarme criado com sucesso.",
      alarme
    })
  } catch (error) {
    console.error("Erro em /api/alarmes/configurar:", error)
    return NextResponse.json(
      { error: "Erro interno ao criar alarme." },
      { status: 500 }
    )
  }
}
