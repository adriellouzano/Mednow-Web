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

    if (!usuario.perfis.includes("farmaceutico")) {
      return NextResponse.json(
        { error: "Ação restrita a farmacêuticos." },
        { status: 403 },
      );
    }

    const body = await req.json();
    const { prescricaoId, dataEntrega } = body;

    if (!prescricaoId) {
      return NextResponse.json(
        { error: "Campo obrigatório: prescricaoId." },
        { status: 400 },
      );
    }

    const prescricao = await prisma.prescricao.findUnique({
      where: { id: prescricaoId },
      select: { id: true, pacienteId: true, medicamento: true },
    });

    if (!prescricao) {
      return NextResponse.json(
        { error: "Prescrição não encontrada." },
        { status: 404 },
      );
    }

    const entrega = await prisma.entrega.create({
      data: {
        prescricaoId,
        farmaceuticoId: usuario.id,
        dataEntrega: dataEntrega ? new Date(dataEntrega) : new Date(),
      },
      include: {
        prescricao: {
          select: {
            id: true,
            pacienteId: true,
            medicamento: true,
          },
        },
        farmaceutico: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
    });

    try {
      emitirEventoGlobal("entrega_realizada", { entrega });
    } catch (err) {
      console.warn("⚠️ Falha ao emitir evento SSE:", err);
    }

    return NextResponse.json({
      message: "Entrega registrada com sucesso.",
      entrega,
    });
  } catch (error) {
    console.error("Erro em /api/entregas/registrar:", error);
    return NextResponse.json(
      { error: "Erro interno ao registrar entrega." },
      { status: 500 },
    );
  }
}
