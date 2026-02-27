import { EventEmitter } from "events";

declare global {
  var emissorGlobal: EventEmitter | undefined;
}

export const emissorGlobal: EventEmitter =
  globalThis.emissorGlobal ?? new EventEmitter();

if (!globalThis.emissorGlobal) globalThis.emissorGlobal = emissorGlobal;

export function emitirEventoGlobal(
  tipo: string,
  payload: Record<string, unknown>,
) {
  emissorGlobal.emit(tipo, payload);
  console.log(`📢 Evento emitido: ${tipo}`, payload);
}
