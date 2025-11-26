import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { autenticarRequisicao } from "../../../../utilitarios/auth"

/**
 * Rota POST para listar histórico de prescrições de um paciente.
 * Tecnologias: Next.js API Route, Prisma, JWT.
 * Por que existe: permitir que médicos visualizem prescrições anteriores do paciente.
 */
export async function POST(req: Request) {
  try {
    // Autenticação
    const usuario = await autenticarRequisicao(req)

    if (!usuario) {
      return NextResponse.json(
        { error: "Não autorizado. Token inválido ou ausente." },
        { status: 401 }
      )
    }

    // Autorização: apenas médicos
    if (!usuario.perfis.includes("medico")) {
      return NextResponse.json(
        { error: "Ação restrita a médicos." },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { pacienteId } = body

    if (!pacienteId) {
      return NextResponse.json(
        { error: "O campo pacienteId é obrigatório." },
        { status: 400 }
      )
    }

    // Consulta prescrições do paciente com dados do médico e CRM
    const prescricoes = await prisma.prescricao.findMany({
      where: { pacienteId },
      orderBy: { criadoEm: "desc" },
      select: {
        id: true,
        medicamento: true,
        dosagem: true,
        frequencia: true,
        duracao: true,
        observacoes: true,
        tipoMedicamento: true,
        tipoReceituario: true,
        numeroNotificacao: true,
        validadeReceita: true,
        quantidadeVias: true,
        assinaturaDigital: true,
        criadoEm: true,
        medico: {
          select: {
            id: true,
            nome: true,
            perfis: {
              where: { tipo: "medico" },
              select: { crm: true }
            }
          }
        },
        paciente: {
          select: {
            nome: true
          }
        }
      }
    })

    return NextResponse.json({ prescricoes })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Erro interno ao buscar histórico." },
      { status: 500 }
    )
  }
}
