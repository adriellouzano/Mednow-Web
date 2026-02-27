import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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
    const prescricaoId = searchParams.get("prescricaoId") || undefined;
    const farmaceuticoId = searchParams.get("farmaceuticoId") || undefined;
    const pacienteId = searchParams.get("pacienteId") || undefined;

    const filtros: Record<string, unknown> = {};

    if (prescricaoId) filtros.prescricaoId = prescricaoId;
    if (farmaceuticoId) filtros.farmaceuticoId = farmaceuticoId;
    if (pacienteId) filtros.prescricao = { pacienteId };

    const perfilEhPaciente = usuario.perfis.includes("paciente");
    if (perfilEhPaciente) {
      filtros.prescricao = { pacienteId: usuario.id };
    }

    const perfilEhFarmaceutico = usuario.perfis.includes("farmaceutico");
    if (perfilEhFarmaceutico && !farmaceuticoId) {
      filtros.farmaceuticoId = usuario.id;
    }

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
            medico: { select: { id: true, nome: true } },
          },
        },
        farmaceutico: {
          select: {
            id: true,
            nome: true,
            perfis: {
              where: { tipo: "farmaceutico" },
              select: { crf: true },
            },
          },
        },
      },
    });

    return NextResponse.json({ entregas });
  } catch (error) {
    console.error("Erro em /api/entregas/listar:", error);
    return NextResponse.json(
      { error: "Erro interno ao listar entregas." },
      { status: 500 },
    );
  }
}
