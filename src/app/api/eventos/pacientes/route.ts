import { NextResponse } from "next/server"
import { emissorGlobal } from "@/utilitarios/emissores"

/**
 * =====================================================
 * ROTA: GET /api/eventos/pacientes
 * -----------------------------------------------------
 * Finalidade:
 *  - Manter canal SSE (Server-Sent Events) aberto com o painel do paciente.
 *  - Enviar em tempo real eventos globais como:
 *    • nova_prescricao
 *    • novo_alarme
 *    • entrega_realizada
 * -----------------------------------------------------
 * Tecnologias: Next.js API Route + EventEmitter (emissorGlobal)
 * =====================================================
 */
export async function GET() {
  const stream = new ReadableStream<string>({
    start(controller) {
      /**
       * 📤 Envia evento SSE com tipo e payload.
       */
      const enviarEvento = (tipo: string, payload: Record<string, unknown>) => {
        controller.enqueue(`data: ${JSON.stringify({ tipo, ...payload })}\n\n`)
      }

      /**
       * 📡 Vincula o emissor global a todos os tipos de eventos
       */
      emissorGlobal.on("nova_prescricao", (prescricao) =>
        enviarEvento("nova_prescricao", { prescricao })
      )

      emissorGlobal.on("novo_alarme", (alarme) =>
        enviarEvento("novo_alarme", { alarme })
      )

      emissorGlobal.on("entrega_realizada", (entrega) =>
        enviarEvento("entrega_realizada", { entrega })
      )

      /**
       * 🟢 Evento inicial de boas-vindas
       */
      controller.enqueue(
        `data: ${JSON.stringify({
          tipo: "conectado",
          mensagem: "Canal SSE do paciente conectado com sucesso.",
        })}\n\n`
      )

      /**
       * ⏱️ Mantém a conexão viva a cada 20 segundos
       */
      const intervalo = setInterval(() => {
        controller.enqueue(`: ping\n\n`)
      }, 20000)

      /**
       * ❌ Fecha conexão de forma limpa ao abortar
       */
      const fecharConexao = () => {
        clearInterval(intervalo)
        controller.close()
        console.log("❌ Conexão SSE com paciente encerrada.")
      }

      /**
       * ✅ Escuta o sinal de fechamento (AbortSignal)
       */
      const ctrl = controller as ReadableStreamDefaultController<string> & {
        signal?: AbortSignal
      }
      if (ctrl.signal) ctrl.signal.addEventListener("abort", fecharConexao)

      console.log("🔗 Conexão SSE com paciente estabelecida.")
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
