import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { autenticarRequisicao } from "../../../../utilitarios/auth";

export async function PATCH(req: Request) {
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

    const body = await req.json();
    const { id, aprovar } = body;

    if (!id || aprovar === undefined) {
      return NextResponse.json(
        { error: "ID e flag 'aprovar' são obrigatórios." },
        { status: 400 },
      );
    }

    const perfil = await prisma.perfilUsuario.findUnique({
      where: { id },
    });

    if (!perfil) {
      return NextResponse.json(
        { error: "Perfil não encontrado." },
        { status: 404 },
      );
    }

    const perfilAtualizado = await prisma.perfilUsuario.update({
      where: { id },
      data: {
        aprovado: aprovar,
        pendenteAprovacao: false,
      },
    });

    return NextResponse.json({
      message: `Perfil ${aprovar ? "aprovado" : "rejeitado"} com sucesso.`,
      perfil: {
        id: perfilAtualizado.id,
        tipo: perfilAtualizado.tipo,
        aprovado: perfilAtualizado.aprovado,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro interno ao aprovar perfil." },
      { status: 500 },
    );
  }
}
