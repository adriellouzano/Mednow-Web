import { NextResponse } from "next/server"
import {prisma} from "@/lib/prisma"
import { enviarNotificacaoFCM } from "@/utilitarios/fcm"

/**
 * 🚀 CRON EXECUTADO A CADA 1 MINUTO
 * Verifica os alarmes configurados pelo farmacêutico e envia notificações
 * somente nos horários exatos e dentro do período de duração.
 */
export async function GET() {
  try {
    const agora = new Date()
    const horaAtual = agora.getHours()
    const minutoAtual = agora.getMinutes()

    // 1) Buscar alarmes com prescrição e paciente
    const alarmes = await prisma.alarme.findMany({
      include: {
        prescricao: {
          include: { paciente: true }
        }
      }
    })

    for (const alarme of alarmes) {
      const paciente = alarme.prescricao?.paciente

      // Sem paciente ou sem token → ignora
      if (!paciente?.tokenFCM) continue

      // 2) Calcular duração em dias
      const criado = new Date(alarme.criadoEm)
      const diffMs = agora.getTime() - criado.getTime()
      const diasPassados = Math.floor(diffMs / (1000 * 60 * 60 * 24))

      if (diasPassados >= alarme.duracaoDias) continue // prazo expirado

      // 3) Gerar horários do dia
      const [hInicial, mInicial] = alarme.horarioInicial.split(":").map(Number)
      const intervalo = 24 / alarme.frequenciaDiaria

      const horariosDoDia = []

      for (let i = 0; i < alarme.frequenciaDiaria; i++) {
        const h = (hInicial + i * intervalo) % 24
        horariosDoDia.push({
          h: Math.floor(h),
          m: mInicial
        })
      }

      // 4) Verificar se a hora atual bate com algum horário
      const deveEnviar = horariosDoDia.some(
        ({ h, m }) => h === horaAtual && m === minutoAtual
      )

      if (!deveEnviar) continue

      // 5) Enviar notificação simples
      await enviarNotificacaoFCM(
        paciente.tokenFCM,
        "Lembrete de Medicação",
        `Hora de tomar ${alarme.prescricao.medicamento}.`
      )

      console.log(`📨 Notificação enviada para ${paciente.nome}`)
    }

    return NextResponse.json({ ok: true })
  } catch (erro) {
    console.error("Erro no scheduler:", erro)
    return NextResponse.json({ erro: "Falha no scheduler" }, { status: 500 })
  }
}
