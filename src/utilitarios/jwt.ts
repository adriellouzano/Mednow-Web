import jwt, { JwtPayload } from "jsonwebtoken"

/**
 * 🔐 Chave secreta para assinatura JWT.
 * (Em produção, definida no arquivo .env)
 */
const JWT_SECRET = process.env.JWT_SECRET || "segredo-super-seguro"

/**
 * 🧩 Função para gerar token JWT autenticado.
 * Tecnologias: jsonwebtoken, variável de ambiente segura.
 * Por que existe: autenticar usuários e permitir acesso protegido
 * a rotas do backend.
 */
export function gerarToken(payload: object): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "12h", // ⏱️ Expiração real do token
  })
}

/**
 * 🧩 Função para verificar e decodificar o token JWT.
 * Retorna os dados válidos do usuário ou null se inválido.
 */
export function verificarToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload
  } catch (err) {
    console.error("❌ Token inválido ou expirado:", err)
    return null
  }
}
