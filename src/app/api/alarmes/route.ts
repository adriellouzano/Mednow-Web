import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { enviarNotificacaoFCM } from "@/utilitarios/fcm"
import { emitirEventoGlobal } from "@/utilitarios/emissores"

/**
 * =====================================================
 * ROTA: POST /api/alarmes
 * -----------------------------------------------------
 * Finalidade:
 *  - Criar um novo alarme de medicação no banco de dados.
 *  - Enviar notificação push via FCM ao paciente.
 *  - Emitir evento SSE global ("novo_alarme") para dashboards conectados.
 * =====================================================
 */
export async function POST(req: Request) {
  try {
    const { prescricaoId, pacienteId, horario, frequencia, duracao } = await req.json()

    if (!prescricaoId || !pacienteId) {
      return NextResponse.json(
        { erro: "Campos obrigatórios ausentes: prescricaoId e pacienteId." },
        { status: 400 }
      )
    }

    // 🧩 Cria o novo alarme
    const novoAlarme = await prisma.alarme.create({
      data: {
        prescricaoId,
        criadoPorId: pacienteId,
        horarioInicial: horario ?? "08:00",
        frequenciaDiaria: frequencia ?? 2,
        duracaoDias: duracao ?? 3,
      },
      include: {
        prescricao: {
          select: { medicamento: true, medico: { select: { nome: true } } },
        },
      },
    })

    // 🔍 Busca o token FCM do paciente
    const usuario = await prisma.usuario.findUnique({
      where: { id: pacienteId },
      select: { nome: true, tokenFCM: true },
    })

    // 🔔 Envia notificação push se o token existir
    if (usuario?.tokenFCM) {
      await enviarNotificacaoFCM(
        usuario.tokenFCM,
        "⏰ Novo alarme configurado",
        `Um novo alarme para ${novoAlarme.prescricao.medicamento} foi definido.`,
        { tipo: "novo_alarme", alarme: novoAlarme }
      )
    }

    // 🔊 Emite evento SSE para dashboards conectados (paciente web)
    emitirEventoGlobal("novo_alarme", novoAlarme)

    return NextResponse.json({
      sucesso: true,
      alarme: novoAlarme,
    })
  } catch (erro: unknown) {
    console.error("❌ Erro ao criar alarme:", erro)
    return NextResponse.json(
      { erro: "Falha ao criar alarme." },
      { status: 500 }
    )
  }
}

/**
 * =====================================================
 * ROTA: GET /api/alarmes
 * -----------------------------------------------------
 * Finalidade:
 *  - Fornecer endpoint SSE para que o painel web (paciente)
 *    escute novos alarmes configurados em tempo real.
 * =====================================================
 */
export async function GET() {
  const stream = new ReadableStream<string>({
    start(controller) {
      const enviar = (tipo: string, payload: Record<string, unknown>) => {
        controller.enqueue(`data: ${JSON.stringify({ tipo, ...payload })}\n\n`)
      }

      // 🔄 Escuta o emissor global
      const onNovoAlarme = (alarme: unknown) =>
        enviar("novo_alarme", { alarme })

      emitirEventoGlobal("stream_iniciada", { origem: "alarmes" })
      console.log("🔗 Conexão SSE estabelecida (alarme).")

      // 🧩 Vincula listener
      import("@/utilitarios/emissores").then(({ emissorGlobal }) => {
        emissorGlobal.on("novo_alarme", onNovoAlarme)
      })

      // 🔁 Mantém a conexão viva
      const ping = setInterval(() => {
        controller.enqueue(`: ping\n\n`)
      }, 15000)

      const fechar = () => {
        clearInterval(ping)
        controller.close()
        console.log("❌ Conexão SSE encerrada (alarme).")
      }

      const ctrl = controller as ReadableStreamDefaultController<string> & {
        signal?: AbortSignal
      }
      if (ctrl.signal) ctrl.signal.addEventListener("abort", fechar)
    },
  })

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}
