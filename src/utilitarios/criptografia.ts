// Importa a biblioteca bcrypt para criptografia e comparação de senha
import bcrypt from "bcrypt"

/**
 * Gera o hash criptografado de uma senha em texto puro.
 * Tecnologia: bcrypt.js
 * Por que existe: garantir que senhas nunca fiquem salvas em texto puro no banco.
 */
export async function hashSenha(senha: string): Promise<string> {
  const saltRounds = 10
  return await bcrypt.hash(senha, saltRounds)
}

/**
 * Compara uma senha em texto puro com um hash salvo no banco.
 * Tecnologia: bcrypt.js
 * Por que existe: validar login conferindo se a senha informada corresponde ao hash.
 */
export async function compararSenha(senha: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(senha, hash)
}
