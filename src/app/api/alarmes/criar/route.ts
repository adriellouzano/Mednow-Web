import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { autenticarRequisicao } from "../../../../utilitarios/auth"
import { emitirEventoGlobal } from "@/utilitarios/emissores"

/**
 * =============================================
 * ⏰ Rota POST – Criação de novo alarme (atualizada)
 * =============================================
 * Tecnologias: Next.js API Route, Prisma, JWT, SSE.
 * 🎯 Objetivo:
 *  - Permitir ao farmacêutico configurar alarmes reais.
 *  - Aceita: horárioInicial (HH:mm), frequenciaDiaria (vezes/dia) e duracaoDias.
 *  - Emite evento SSE ao paciente vinculado à prescrição.
 * =============================================
 */
export async function POST(req: Request) {
  try {
    // 🔐 Autenticação obrigatória
    const usuario = await autenticarRequisicao(req)
    if (!usuario) {
      return NextResponse.json(
        { error: "Não autorizado. Token inválido ou ausente." },
        { status: 401 }
      )
    }

    // 🧾 Extrai dados do corpo
    const body = await req.json()
    const {
      prescricaoId,
      criadoPorId,
      horarioInicial,
      frequenciaDiaria,
      duracaoDias,
    } = body

    // ✅ Validação básica
    if (
      !prescricaoId ||
      !horarioInicial ||
      !frequenciaDiaria ||
      !duracaoDias ||
      !criadoPorId
    ) {
      return NextResponse.json(
        { error: "Campos obrigatórios ausentes." },
        { status: 400 }
      )
    }

    // ⏱ Validação do formato de horário 24h
    const regexHora = /^([01]\d|2[0-3]):[0-5]\d$/
    if (!regexHora.test(horarioInicial)) {
      return NextResponse.json(
        { error: "Horário inválido. Use o formato 24h (ex: 08:00)." },
        { status: 400 }
      )
    }

    // 💾 Criação do registro no banco
    const alarme = await prisma.alarme.create({
      data: {
        prescricaoId,
        criadoPorId,
        horarioInicial,
        frequenciaDiaria: Number(frequenciaDiaria),
        duracaoDias: Number(duracaoDias),
      },
      include: {
        prescricao: {
          select: {
            id: true,
            pacienteId: true,
            medicamento: true,
          },
        },
      },
    })

    // 📡 Emissão SSE global (painel do paciente recebe automaticamente)
    try {
      emitirEventoGlobal("novo_alarme", { alarme })
    } catch (err) {
      console.warn("Aviso: falha ao emitir evento SSE:", err)
    }

    // ✅ Retorno de sucesso
    return NextResponse.json({
      message: "Alarme criado com sucesso.",
      alarme,
    })
  } catch (error) {
    console.error("Erro em /api/alarmes/criar:", error)
    return NextResponse.json(
      { error: "Erro interno ao criar alarme." },
      { status: 500 }
    )
  }
}
