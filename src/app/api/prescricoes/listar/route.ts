import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import { autenticarRequisicao } from "../../../../utilitarios/auth"

/**
 * 💊 Rota GET – Listagem de prescrições
 * ------------------------------------
 * Tecnologias: Next.js API Route, Prisma ORM, JWT.
 * Finalidade:
 * - Permitir que médicos, pacientes, farmacêuticos e administradores consultem prescrições
 *   com base em filtros dinâmicos e permissões específicas.
 */
export async function GET(req: Request) {
  try {
    // 🔐 Autentica o usuário via token JWT
    const usuario = await autenticarRequisicao(req)
    if (!usuario) {
      return NextResponse.json(
        { error: "Não autorizado. Token inválido ou ausente." },
        { status: 401 }
      )
    }

    // 🔎 Obtém parâmetros da URL
    const { searchParams } = new URL(req.url)
    const pacienteId = searchParams.get("pacienteId") || undefined
    //const farmacId = searchParams.get("farmaceuticoId") || undefined
    const limit = Number(searchParams.get("limit")) || 50
    const offset = Number(searchParams.get("offset")) || 0

    // 👤 Identifica o perfil do usuário autenticado
    const perfilEhMedico = usuario.perfis.includes("medico")
    const perfilEhPaciente = usuario.perfis.includes("paciente")
    const perfilEhFarmaceutico = usuario.perfis.includes("farmaceutico")

    // 🧾 Filtros dinâmicos
    const filtros: Prisma.PrescricaoWhereInput = {}

    // 🔹 Regras de filtro conforme o tipo de usuário
    if (pacienteId) filtros.pacienteId = pacienteId

    if (perfilEhMedico) {
      // 👇 SE o médico NÃO passou pacienteId → listar apenas as dele
      // (usado na seção "Minhas Prescrições")
      if (!pacienteId) {
        filtros.medicoId = usuario.id;
      }
      // 👇 SE passou pacienteId → mostrar TODO o histórico do paciente
      // (usado em "Histórico do Paciente")
    }


    if (perfilEhPaciente && !pacienteId) {
      filtros.pacienteId = usuario.id
    }

    if (perfilEhFarmaceutico && pacienteId) {
      filtros.pacienteId = pacienteId
    }

    // 📋 Consulta prescrições com relacionamentos
    const prescricoes = await prisma.prescricao.findMany({
      where: filtros,
      orderBy: { criadoEm: "desc" },
      take: limit,
      skip: offset,
      include: {
        medico: {
          select: {
            id: true,
            nome: true,
            perfis: {
              where: { tipo: "medico" },
              select: { crm: true },
            },
          },
        },
        paciente: {
          select: { id: true, nome: true },
        },
        entregas: {
          select: {
            id: true,
            dataEntrega: true,
            farmaceuticoId: true,
            farmaceutico: {
              select: { id: true, nome: true },
            },
          },
        },
        alarmes: {
          select: {
            id: true,
            horarioInicial: true,
            frequenciaDiaria: true, // ✅ Campo correto no schema atual
            duracaoDias: true,      // ✅ Campo adicionado
            criadoPorId: true,
            criadoEm: true,
            atualizadoEm: true,
          },
        },
      },
    })

    // 🔹 Farmacêutico: mostra apenas entregas feitas por ele
    let resultado = prescricoes.map(p => ({
      ...p,
      entrega: p.entregas?.[0] || null,   // 👈 AQUI ESTÁ A CORREÇÃO
    }));
    if (perfilEhFarmaceutico) {
      resultado = resultado.map((p) => ({
        ...p,
        entregas: p.entregas?.filter(
          (e) => e.farmaceuticoId === usuario.id
        ),
      }))
    }

    // ✅ Retorno padronizado
    return NextResponse.json({ prescricoes: resultado })
  } catch (error) {
    console.error("Erro em /api/prescricoes/listar:", error)
    return NextResponse.json(
      { error: "Erro interno ao listar prescrições." },
      { status: 500 }
    )
  }
}
