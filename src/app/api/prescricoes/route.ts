import { NextResponse } from "next/server";

/**
 * 🔔 Rota SSE – Eventos de novas prescrições
 * Tecnologias: Server-Sent Events (SSE), Next.js API Route.
 * Por que existe: permite que dashboards recebam notificações em tempo real
 * sempre que uma nova prescrição é criada.
 */

// 🌐 Lista global de conexões SSE ativas
let conexoes: { enviar: (data: Record<string, unknown>) => void }[] = [];

/**
 * 📡 Rota GET – Mantém a conexão aberta para envio de eventos SSE.
 */
export async function GET() {
  const encoder = new TextEncoder();

  // 📤 Cria o stream contínuo de resposta SSE
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      /**
       * 📦 Função auxiliar para enviar mensagens no formato SSE.
       * Inclui proteção contra controlador fechado.
       */
      const enviar = (data: Record<string, unknown>) => {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
          );
        } catch {
          // se o stream já foi fechado, apenas ignora
        }
      };

      /**
       * 🔗 Registra nova conexão
       */
      const novaConexao = { enviar };
      conexoes.push(novaConexao);

      /**
       * 🟢 Mensagem inicial de conexão
       */
      enviar({ tipo: "conexao_estabelecida", hora: new Date().toISOString() });

      /**
       * ⏱️ Ping periódico — protegido por try/catch
       */
      const keepAlive = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": ping\n\n"));
        } catch {
          clearInterval(keepAlive);
        }
      }, 15000);

      /**
       * ❌ Encerramento seguro
       */
      const ctrl = controller as ReadableStreamDefaultController<Uint8Array> & {
        signal?: AbortSignal;
      };

      ctrl.signal?.addEventListener("abort", () => {
        clearInterval(keepAlive);
        conexoes = conexoes.filter((c) => c !== novaConexao);
      });
    },
    cancel() {
      // garante que o stream pare mesmo se o browser cancelar abruptamente
      conexoes = [];
    },
  });

  /**
   * 📤 Retorna a resposta SSE
   */
  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

/**
 * ⚙️ Função auxiliar – Emite evento SSE de nova prescrição
 * Chamado dentro de /api/prescricoes/criar
 */
