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

    const body = await req.json();
    const {
      prescricaoId,
      criadoPorId,
      horarioInicial,
      frequenciaDiaria,
      duracaoDias,
    } = body;

    if (
      !prescricaoId ||
      !horarioInicial ||
      !frequenciaDiaria ||
      !duracaoDias ||
      !criadoPorId
    ) {
      return NextResponse.json(
        { error: "Campos obrigatórios ausentes." },
        { status: 400 },
      );
    }

    const regexHora = /^([01]\d|2[0-3]):[0-5]\d$/;
    if (!regexHora.test(horarioInicial)) {
      return NextResponse.json(
        { error: "Horário inválido. Use o formato 24h (ex: 08:00)." },
        { status: 400 },
      );
    }

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
    });

    try {
      emitirEventoGlobal("novo_alarme", { alarme });
    } catch (err) {
      console.warn("Aviso: falha ao emitir evento SSE:", err);
    }

    return NextResponse.json({
      message: "Alarme criado com sucesso.",
      alarme,
    });
  } catch (error) {
    console.error("Erro em /api/alarmes/criar:", error);
    return NextResponse.json(
      { error: "Erro interno ao criar alarme." },
      { status: 500 },
    );
  }
}
