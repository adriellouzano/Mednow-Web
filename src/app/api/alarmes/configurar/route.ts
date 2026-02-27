import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { autenticarRequisicao } from "../../../../utilitarios/auth";
import { emitirEventoGlobal } from "@/utilitarios/emissores";

export async function POST(req: Request) {
  try {
    const usuario = await autenticarRequisicao(req);

    if (!usuario) {
      return NextResponse.json(
        { error: "Não autorizado. Token inválido ou ausente." },
        { status: 401 },
      );
    }

    if (
      !usuario.perfis.includes("paciente") &&
      !usuario.perfis.includes("farmaceutico")
    ) {
      return NextResponse.json(
        { error: "Ação restrita a pacientes ou farmacêuticos." },
        { status: 403 },
      );
    }

    const body = await req.json();
    const {
      prescricaoId,
      horarioInicial,
      frequencia,
      duracaoDias,
      criadoPorId,
    } = body;

    if (
      !prescricaoId ||
      !horarioInicial ||
      !frequencia ||
      !duracaoDias ||
      !criadoPorId
    ) {
      return NextResponse.json(
        { error: "Todos os campos são obrigatórios." },
        { status: 400 },
      );
    }

    const prescricaoExiste = await prisma.prescricao.findUnique({
      where: { id: prescricaoId },
    });

    if (!prescricaoExiste) {
      return NextResponse.json(
        { error: "Prescrição não encontrada." },
        { status: 404 },
      );
    }

    const alarme = await prisma.alarme.create({
      data: {
        prescricaoId,
        horarioInicial,
        frequenciaDiaria: frequencia,
        duracaoDias,
        criadoPorId,
      },
    });

    try {
      emitirEventoGlobal("novo_alarme", { alarme });
    } catch (err) {
      console.warn("Aviso: falha ao emitir evento SSE.", err);
    }

    return NextResponse.json({
      message: "Alarme criado com sucesso.",
      alarme,
    });
  } catch (error) {
    console.error("Erro em /api/alarmes/configurar:", error);
    return NextResponse.json(
      { error: "Erro interno ao criar alarme." },
      { status: 500 },
    );
  }
}
