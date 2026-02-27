import { NextResponse } from "next/server";

let conexoes: { enviar: (data: Record<string, unknown>) => void }[] = [];

export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const enviar = (data: Record<string, unknown>) => {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(data)}\n\n`),
          );
        } catch {}
      };

      const novaConexao = { enviar };
      conexoes.push(novaConexao);

      enviar({ tipo: "conexao_estabelecida", hora: new Date().toISOString() });

      const keepAlive = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": ping\n\n"));
        } catch {
          clearInterval(keepAlive);
        }
      }, 15000);

      const ctrl = controller as ReadableStreamDefaultController<Uint8Array> & {
        signal?: AbortSignal;
      };

      ctrl.signal?.addEventListener("abort", () => {
        clearInterval(keepAlive);
        conexoes = conexoes.filter((c) => c !== novaConexao);
      });
    },
    cancel() {
      conexoes = [];
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
