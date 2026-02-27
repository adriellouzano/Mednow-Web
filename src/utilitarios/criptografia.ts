import bcrypt from "bcrypt";

export async function hashSenha(senha: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(senha, saltRounds);
}

export async function compararSenha(
  senha: string,
  hash: string,
): Promise<boolean> {
  return await bcrypt.compare(senha, hash);
}
