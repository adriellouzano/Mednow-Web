import { verificarToken } from "./jwt";

export async function autenticarRequisicao(req: Request) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.replace("Bearer ", "").trim();
  const payload = verificarToken(token);

  if (!payload || (payload.exp && Date.now() >= payload.exp * 1000)) {
    console.warn("⚠️ Token expirado ou inválido.");
    return null;
  }

  return payload;
}
