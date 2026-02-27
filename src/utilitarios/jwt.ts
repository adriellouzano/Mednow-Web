import jwt, { JwtPayload } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export function gerarToken(payload: object): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "12h",
  });
}

export function verificarToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (err) {
    console.error("❌ Token inválido ou expirado:", err);
    return null;
  }
}
