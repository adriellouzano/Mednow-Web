// ===========================================
// Utilitário: Emissor Global de Eventos (SSE + FCM)
// Tecnologia: Node.js EventEmitter + Next.js API Routes
// Finalidade: Centralizar a emissão de eventos em tempo real
// entre rotas de pacientes, entregas, alarmes e prescrições.
// ===========================================

import { EventEmitter } from "events"

/**
 * 🔄 Declaração global — garante persistência entre rotas
 * mesmo durante hot reload no ambiente de desenvolvimento.
 */
declare global {
  var emissorGlobal: EventEmitter | undefined
}

/**
 * 🧩 Criação ou reaproveitamento da instância global
 */
export const emissorGlobal: EventEmitter =
  globalThis.emissorGlobal ?? new EventEmitter()

if (!globalThis.emissorGlobal) globalThis.emissorGlobal = emissorGlobal

/**
 * 📡 Função auxiliar para emitir eventos SSE de forma unificada.
 * Pode ser chamada em qualquer rota API (entregas, alarmes, prescrições).
 * @param tipo - Tipo do evento (ex: "novo_alarme", "entrega_realizada", "nova_prescricao")
 * @param payload - Dados a serem enviados aos clientes conectados
 */
export function emitirEventoGlobal(
  tipo: string,
  payload: Record<string, unknown>
) {
  emissorGlobal.emit(tipo, payload)
  console.log(`📢 Evento emitido: ${tipo}`, payload)
}
