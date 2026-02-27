import { NextResponse } from "next/server";
import { emissorGlobal } from "@/utilitarios/emissores";

export async function GET() {
  const stream = new ReadableStream<string>({
    start(controller) {
      const enviarEvento = (tipo: string, payload: Record<string, unknown>) => {
        controller.enqueue(`data: ${JSON.stringify({ tipo, ...payload })}\n\n`);
      };

      emissorGlobal.on("nova_prescricao", (prescricao) =>
        enviarEvento("nova_prescricao", { prescricao }),
      );

      emissorGlobal.on("novo_alarme", (alarme) =>
        enviarEvento("novo_alarme", { alarme }),
      );

      emissorGlobal.on("entrega_realizada", (entrega) =>
        enviarEvento("entrega_realizada", { entrega }),
      );

      controller.enqueue(
        `data: ${JSON.stringify({
          tipo: "conectado",
          mensagem: "Canal SSE do paciente conectado com sucesso.",
        })}\n\n`,
      );

      const intervalo = setInterval(() => {
        controller.enqueue(`: ping\n\n`);
      }, 20000);

      const fecharConexao = () => {
        clearInterval(intervalo);
        controller.close();
        console.log("❌ Conexão SSE com paciente encerrada.");
      };

      const ctrl = controller as ReadableStreamDefaultController<string> & {
        signal?: AbortSignal;
      };
      if (ctrl.signal) ctrl.signal.addEventListener("abort", fecharConexao);

      console.log("🔗 Conexão SSE com paciente estabelecida.");
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
