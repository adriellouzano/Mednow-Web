import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { autenticarRequisicao } from "@/utilitarios/auth";

export async function GET(req: Request) {
  try {
    const usuario = await autenticarRequisicao(req);

    if (!usuario) {
      return NextResponse.json(
        { error: "Não autorizado. Token inválido ou ausente." },
        { status: 401 },
      );
    }

    const usuarioCompleto = await prisma.usuario.findUnique({
      where: { id: usuario.id },
      select: {
        id: true,
        nome: true,
        cpf: true,
        perfis: {
          select: {
            tipo: true,
          },
        },
      },
    });

    if (!usuarioCompleto) {
      return NextResponse.json(
        { error: "Usuário não encontrado." },
        { status: 404 },
      );
    }

    const perfilAtivo = usuario.perfis.includes("medico")
      ? "medico"
      : usuario.perfis[0] || "desconhecido";

    return NextResponse.json({
      id: usuarioCompleto.id,
      nome: usuarioCompleto.nome,
      cpf: usuarioCompleto.cpf,
      perfil: perfilAtivo,
    });
  } catch (error) {
    console.error("Erro ao obter usuário logado:", error);
    return NextResponse.json(
      { error: "Erro interno ao obter usuário." },
      { status: 500 },
    );
  }
}
