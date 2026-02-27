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
        { error: "Ação restrita a administradores." },
        { status: 403 },
      );
    }

    const perfisPendentes = await prisma.perfilUsuario.findMany({
      where: {
        pendenteAprovacao: true,
      },
      include: {
        usuario: true,
      },
    });

    return NextResponse.json({ perfis: perfisPendentes });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro interno ao buscar perfis pendentes." },
      { status: 500 },
    );
  }
}
