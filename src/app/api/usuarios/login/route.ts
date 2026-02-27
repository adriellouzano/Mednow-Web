import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { compararSenha } from "../../../../utilitarios/criptografia";
import { gerarToken } from "../../../../utilitarios/jwt";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { cpf, senha } = body;

    if (!cpf || !senha) {
      return NextResponse.json(
        { error: "CPF e senha são obrigatórios." },
        { status: 400 },
      );
    }

    const usuario = await prisma.usuario.findUnique({
      where: { cpf },
      include: { perfis: true },
    });

    if (!usuario) {
      return NextResponse.json(
        { error: "CPF não encontrado." },
        { status: 404 },
      );
    }

    const senhaCorreta = await compararSenha(senha, usuario.senhaHash);

    if (!senhaCorreta) {
      return NextResponse.json({ error: "Senha incorreta." }, { status: 401 });
    }

    const perfisAprovados = usuario.perfis.filter((p) => p.aprovado === true);

    const token = gerarToken({
      id: usuario.id,
      cpf: usuario.cpf,
      nome: usuario.nome,
      perfis: perfisAprovados.map((p) => p.tipo),
    });

    return NextResponse.json({
      message: "Login realizado com sucesso.",
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        cpf: usuario.cpf,
        email: usuario.email,
        perfis: perfisAprovados.map((p) => ({
          id: p.id,
          tipo: p.tipo,
        })),
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro interno ao realizar login." },
      { status: 500 },
    );
  }
}
