import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { autenticarRequisicao } from "../../../../../utilitarios/auth";

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
      !usuario.perfis.includes("medico") &&
      !usuario.perfis.includes("farmaceutico")
    ) {
      return NextResponse.json(
        { error: "Ação restrita a médicos e farmacêuticos." },
        { status: 403 },
      );
    }

    const body = await req.json();
    const { termo, pagina } = body;

    const termoBusca = termo?.trim() || "";

    const paginaAtual =
      pagina && !isNaN(parseInt(pagina)) ? Math.max(parseInt(pagina), 1) : 1;

    const registrosPorPagina = 10;
    const skip = (paginaAtual - 1) * registrosPorPagina;

    const whereFiltro: Prisma.UsuarioWhereInput = {
      perfis: {
        some: { tipo: "paciente" },
      },
      ...(termoBusca.length > 0 && {
        OR: [
          { nome: { contains: termoBusca, mode: "insensitive" } },
          { cpf: { contains: termoBusca } },
        ],
      }),
    };

    const pacientes = await prisma.usuario.findMany({
      where: whereFiltro,
      select: {
        id: true,
        nome: true,
        cpf: true,
        email: true,
      },
      orderBy: { nome: "asc" },
      skip,
      take: registrosPorPagina,
    });

    const total = await prisma.usuario.count({ where: whereFiltro });

    return NextResponse.json({
      pacientes,
      paginaAtual,
      totalPaginas: Math.ceil(total / registrosPorPagina),
      totalRegistros: total,
    });
  } catch (error) {
    console.error("Erro em /api/eventos/pacientes/buscar:", error);
    return NextResponse.json(
      { error: "Erro interno ao buscar pacientes." },
      { status: 500 },
    );
  }
}
