import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { autenticarRequisicao } from "@/utilitarios/auth";

export async function POST(req: Request) {
  try {
    const usuario = await autenticarRequisicao(req);
    const { tokenFCM } = await req.json();

    if (!usuario) {
      return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
    }
    if (!usuario || !tokenFCM) {
      return NextResponse.json(
        { erro: "Campos obrigatórios ausentes: usuarioId e tokenFCM." },
        { status: 400 },
      );
    }

    const usuarioAtualizado = await prisma.usuario.update({
      where: { id: usuario.id },
      data: { tokenFCM },
      select: { id: true, nome: true, tokenFCM: true },
    });

    console.log(
      `🔗 Token FCM atualizado para o usuário ${usuarioAtualizado.id}`,
    );

    return NextResponse.json({
      sucesso: true,
      usuario: usuarioAtualizado,
    });
  } catch (erro: unknown) {
    console.error("❌ Erro ao registrar token FCM:", erro);

    if (
      typeof erro === "object" &&
      erro !== null &&
      "code" in erro &&
      (erro as { code: string }).code === "P2025"
    ) {
      return NextResponse.json(
        { erro: "Usuário não encontrado." },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { erro: "Falha ao registrar token FCM." },
      { status: 500 },
    );
  }
}
