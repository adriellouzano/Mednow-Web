import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { autenticarRequisicao } from "../../../../utilitarios/auth";

export async function GET(req: Request) {
  try {
    const usuario = await autenticarRequisicao(req);
    if (!usuario) {
      return NextResponse.json(
        { error: "Não autorizado. Token inválido ou ausente." },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(req.url);
    const pacienteId = searchParams.get("pacienteId") || undefined;

    const limit = Number(searchParams.get("limit")) || 50;
    const offset = Number(searchParams.get("offset")) || 0;

    const perfilEhMedico = usuario.perfis.includes("medico");
    const perfilEhPaciente = usuario.perfis.includes("paciente");
    const perfilEhFarmaceutico = usuario.perfis.includes("farmaceutico");

    const filtros: Prisma.PrescricaoWhereInput = {};
    if (pacienteId) filtros.pacienteId = pacienteId;
    if (perfilEhMedico) {
      if (!pacienteId) {
        filtros.medicoId = usuario.id;
      }
    }

    if (perfilEhPaciente && !pacienteId) {
      filtros.pacienteId = usuario.id;
    }

    if (perfilEhFarmaceutico && pacienteId) {
      filtros.pacienteId = pacienteId;
    }

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
            frequenciaDiaria: true,
            duracaoDias: true,
            criadoPorId: true,
            criadoEm: true,
            atualizadoEm: true,
          },
        },
      },
    });

    let resultado = prescricoes.map((p) => ({
      ...p,
      entrega: p.entregas?.[0] || null,
    }));
    if (perfilEhFarmaceutico) {
      resultado = resultado.map((p) => ({
        ...p,
        entregas: p.entregas?.filter((e) => e.farmaceuticoId === usuario.id),
      }));
    }

    return NextResponse.json({ prescricoes: resultado });
  } catch (error) {
    console.error("Erro em /api/prescricoes/listar:", error);
    return NextResponse.json(
      { error: "Erro interno ao listar prescrições." },
      { status: 500 },
    );
  }
}
