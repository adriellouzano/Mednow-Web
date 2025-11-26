import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { autenticarRequisicao } from "../../../../utilitarios/auth"
import { emitirEventoGlobal } from "@/utilitarios/emissores"

/**
 * 💊 Rota POST – Criação de nova prescrição médica
 * Tecnologias: Next.js API Route, Prisma, JWT, SSE.
 * Finalidade:
 * - Permitir que o médico crie prescrições autenticadas;
 * - Emitir eventos em tempo real para dashboards conectados (médico, paciente, farmacêutico).
 */

// 🧾 Tipagem explícita do corpo da requisição
type NovaPrescricaoInput = {
  pacienteId: string
  medicoId: string
  medicamento: string
  dosagem: string
  frequenciaDiaria: number | string
  duracao: string
  observacoes?: string
  tipoMedicamento: "comum" | "antibiotico" | "controlado"
  tipoReceituario?: string
  numeroNotificacao?: string
  validadeReceita?: string
  quantidadeVias?: number
  assinaturaDigital?: boolean
}

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

    // 📦 Lê corpo da requisição com tipagem
    const body: NovaPrescricaoInput = await req.json()
    const {
      pacienteId,
      medicoId,
      medicamento,
      dosagem,
      frequenciaDiaria,
      duracao,
      observacoes,
      tipoMedicamento,
      tipoReceituario,
      numeroNotificacao,
      validadeReceita,
      quantidadeVias,
      assinaturaDigital,
    } = body

    // 🧾 Validação de campos obrigatórios
    if (
      !pacienteId ||
      !medicoId ||
      !medicamento ||
      !dosagem ||
      !frequenciaDiaria ||
      !duracao ||
      !tipoMedicamento
    ) {
      return NextResponse.json(
        { error: "Campos obrigatórios não informados." },
        { status: 400 }
      )
    }

    // 💾 Criação da prescrição no banco
    const prescricao = await prisma.prescricao.create({
      data: {
        pacienteId,
        medicoId,
        medicamento,
        dosagem,
        frequencia: String(frequenciaDiaria), // conforme seu schema
        duracao,
        observacoes,
        tipoMedicamento,
        tipoReceituario:
          tipoMedicamento === "controlado" ? tipoReceituario : null,
        numeroNotificacao:
          tipoMedicamento === "controlado" ? numeroNotificacao : null,
        validadeReceita:
          tipoMedicamento === "controlado" && validadeReceita
            ? new Date(validadeReceita)
            : null,
        quantidadeVias:
          tipoMedicamento === "controlado" ? quantidadeVias : null,
        assinaturaDigital:
          tipoMedicamento === "controlado" ? assinaturaDigital : null,
      },
      include: {
        paciente: { select: { id: true, nome: true } },
        medico: { select: { id: true, nome: true } },
      },
    })

    // 📡 Emite evento SSE global para médicos, farmacêuticos e pacientes
    try {
      emitirEventoGlobal("nova_prescricao", { prescricao })
    } catch {
      console.warn("⚠️ Aviso: falha ao emitir evento SSE (cliente desconectado).")
    }

    // ✅ Retorno de sucesso
    return NextResponse.json({
      message: "Prescrição criada com sucesso.",
      prescricao,
    })
  } catch (error) {
    console.error("❌ Erro em /api/prescricoes/criar:", error)
    return NextResponse.json(
      { error: "Erro interno ao criar prescrição." },
      { status: 500 }
    )
  }
}
