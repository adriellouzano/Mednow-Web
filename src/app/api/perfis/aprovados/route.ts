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

    if (!usuario.perfis.includes("admin")) {
      return NextResponse.json(
        {
          error:
            "Acesso negado. Apenas administradores podem visualizar esta lista.",
        },
        { status: 403 },
      );
    }

    const perfis = await prisma.perfilUsuario.findMany({
      where: { aprovado: true },
      orderBy: { atualizadoEm: "desc" },
      select: {
        id: true,
        tipo: true,
        crm: true,
        crf: true,
        usuario: {
          select: {
            id: true,
            nome: true,
            cpf: true,
            email: true,
          },
        },
        atualizadoEm: true,
      },
    });

    return NextResponse.json({ perfis });
  } catch (error) {
    console.error("Erro em /api/perfis/aprovados:", error);
    return NextResponse.json(
      { error: "Erro interno ao listar perfis aprovados." },
      { status: 500 },
    );
  }
}
