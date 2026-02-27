import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { enviarNotificacaoFCM } from "@/utilitarios/fcm";

export async function GET() {
  try {
    const agoraUTC = new Date();
    const horaAtual = Number(
      agoraUTC.toLocaleString("pt-BR", {
        hour: "2-digit",
        timeZone: "America/Cuiaba",
      }),
    );

    const minutoAtual = Number(
      agoraUTC.toLocaleString("pt-BR", {
        minute: "2-digit",
        timeZone: "America/Cuiaba",
      }),
    );

    console.log("🕒 Hora local (Cuiabá):", horaAtual, ":", minutoAtual);

    const alarmes = await prisma.alarme.findMany({
      include: {
        prescricao: {
          include: { paciente: true },
        },
      },
    });

    for (const alarme of alarmes) {
      const paciente = alarme.prescricao?.paciente;

      if (!paciente?.tokenFCM) continue;

      const criado = new Date(alarme.criadoEm);
      const diffMs = agoraUTC.getTime() - criado.getTime();
      const diasPassados = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diasPassados >= alarme.duracaoDias) continue;

      const [hInicial, mInicial] = alarme.horarioInicial.split(":").map(Number);
      const intervalo = 24 / alarme.frequenciaDiaria;

      const horariosDoDia = [];

      for (let i = 0; i < alarme.frequenciaDiaria; i++) {
        const h = (hInicial + i * intervalo) % 24;
        horariosDoDia.push({
          h: Math.floor(h),
          m: mInicial,
        });
      }

      const deveEnviar = horariosDoDia.some(
        ({ h, m }) => h === horaAtual && m === minutoAtual,
      );

      if (!deveEnviar) continue;

      await enviarNotificacaoFCM(
        paciente.tokenFCM,
        "Lembrete de Medicação",
        `Hora de tomar ${alarme.prescricao.medicamento}.`,
      );

      console.log(`📨 Notificação enviada para ${paciente.nome}`);
    }

    return NextResponse.json({ ok: true });
  } catch (erro) {
    console.error("Erro no scheduler:", erro);
    return NextResponse.json({ erro: "Falha no scheduler" }, { status: 500 });
  }
}
