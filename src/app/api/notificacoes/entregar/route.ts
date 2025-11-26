import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/**
 * POST /api/notificacoes/registrar
 * Corpo esperado:
 * {
 *   "usuarioId": "id-do-usuario",
 *   "tokenFCM": "token-do-dispositivo"
 * }
 */
export async function POST(req: Request) {
  try {
    const { usuarioId, tokenFCM } = await req.json()

    if (!usuarioId || !tokenFCM) {
      return NextResponse.json(
        { erro: "usuarioId e tokenFCM são obrigatórios." },
        { status: 400 }
      )
    }

    await prisma.usuario.update({
      where: { id: usuarioId },
      data: { tokenFCM }
    })

    return NextResponse.json({ sucesso: true })
  } catch (erro) {
    console.error("Erro ao registrar token FCM:", erro)
    return NextResponse.json(
      { erro: "Falha ao registrar token FCM." },
      { status: 500 }
    )
  }
}
