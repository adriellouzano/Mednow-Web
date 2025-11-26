import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/**
 * =====================================================
 * ROTA: POST /api/usuarios/token
 * -----------------------------------------------------
 * Finalidade:
 *  - Registrar ou atualizar o token FCM (Firebase Cloud Messaging)
 *    de um usuário (normalmente o paciente, no app mobile).
 *
 * Corpo esperado (JSON):
 * {
 *   "usuarioId": "cuid",
 *   "tokenFCM": "TOKEN_GERADO_PELO_APP"
 * }
 * =====================================================
 */

export async function POST(req: Request) {
  try {
    const { usuarioId, tokenFCM } = await req.json()

    // 🔍 Validação básica
    if (!usuarioId || !tokenFCM) {
      return NextResponse.json(
        { erro: "Campos obrigatórios ausentes: usuarioId e tokenFCM." },
        { status: 400 }
      )
    }

    // 🔄 Atualiza o token do usuário
    const usuarioAtualizado = await prisma.usuario.update({
      where: { id: usuarioId },
      data: { tokenFCM },
      select: { id: true, nome: true, tokenFCM: true },
    })

    console.log(`🔗 Token FCM atualizado para o usuário ${usuarioAtualizado.id}`)

    return NextResponse.json({
      sucesso: true,
      usuario: usuarioAtualizado,
    })
  } catch (erro: unknown) {
    console.error("❌ Erro ao registrar token FCM:", erro)

    // Tipagem segura: verifica se erro tem a propriedade "code"
    if (
      typeof erro === "object" &&
      erro !== null &&
      "code" in erro &&
      (erro as { code: string }).code === "P2025"
    ) {
      return NextResponse.json(
        { erro: "Usuário não encontrado." },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { erro: "Falha ao registrar token FCM." },
      { status: 500 }
    )
  }
}
