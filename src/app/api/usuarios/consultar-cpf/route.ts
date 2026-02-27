import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const cpf = searchParams.get("cpf");

    if (!cpf) {
      return NextResponse.json(
        { error: "CPF é obrigatório." },
        { status: 400 },
      );
    }

    const usuario = await prisma.usuario.findUnique({
      where: { cpf },
      include: {
        perfis: true,
      },
    });

    if (!usuario) {
      return NextResponse.json({ existe: false });
    }

    return NextResponse.json({
      existe: true,
      usuario: {
        nome: usuario.nome,
        email: usuario.email,
        cpf: usuario.cpf,
        perfis: usuario.perfis.map((p) => ({
          tipo: p.tipo,
          crm: p.crm,
          crf: p.crf,
          aprovado: p.aprovado,
          pendenteAprovacao: p.pendenteAprovacao,
        })),
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Erro interno ao consultar CPF." },
      { status: 500 },
    );
  }
}
