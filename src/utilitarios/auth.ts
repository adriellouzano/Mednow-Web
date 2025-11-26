import { verificarToken } from "./jwt"

/**
 * 🔒 Função de autenticação global do sistema.
 * Tecnologias: Next.js API Route + JWT.
 * Por que existe: validar o token recebido e retornar o usuário autenticado.
 */
export async function autenticarRequisicao(req: Request) {
  const authHeader = req.headers.get("authorization")

  // ❌ Falta header Bearer → não autorizado
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null
  }

  // 🔍 Extrai e valida o token JWT
  const token = authHeader.replace("Bearer ", "").trim()
  const payload = verificarToken(token)

  // ❌ Token expirado ou inválido
  if (!payload || (payload.exp && Date.now() >= payload.exp * 1000)) {
    console.warn("⚠️ Token expirado ou inválido.")
    return null
  }

  // ✅ Retorna dados do usuário autenticado
  return payload
}
