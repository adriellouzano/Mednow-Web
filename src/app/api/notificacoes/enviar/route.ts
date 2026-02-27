import { NextResponse } from "next/server";
import { enviarNotificacaoFCM } from "@/utilitarios/fcm";

export async function POST(req: Request) {
  try {
    const { token, titulo, corpo, dados } = await req.json();
    if (!token || !titulo || !corpo)
      return NextResponse.json(
        { erro: "Campos obrigatórios ausentes." },
        { status: 400 },
      );

    await enviarNotificacaoFCM(token, titulo, corpo, dados);
    return NextResponse.json({ sucesso: true });
  } catch (erro) {
    console.error("Erro ao enviar FCM:", erro);
    return NextResponse.json(
      { erro: "Falha ao enviar notificação FCM." },
      { status: 500 },
    );
  }
}
