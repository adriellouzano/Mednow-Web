// ===========================================
// Utilitário: Envio de Notificações via Firebase Cloud Messaging (FCM Real)
// Tecnologia: firebase-admin
// ===========================================

import admin from "firebase-admin"

/**
 * 🔥 Inicialização do Firebase Admin
 * Evita inicialização duplicada em ambiente Next.js (dev/hot reload)
 */
if (!admin.apps.length) {
  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n")

  if (!projectId || !clientEmail || !privateKey) {
    console.error("⚠️ Variáveis de ambiente do Firebase ausentes!")
  } else {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    })
    console.log("🔥 Firebase Admin inicializado com sucesso")
  }
}

/**
 * 📡 Envia uma notificação via Firebase Cloud Messaging
 * @param tokenFCM Token do dispositivo (gerado pelo app mobile)
 * @param titulo   Título da notificação
 * @param corpo    Corpo/mensagem exibida no push
 * @param dados    Dados extras opcionais
 */
export async function enviarNotificacaoFCM(
  tokenFCM: string,
  titulo: string,
  corpo: string,
  dados?: Record<string, unknown>
): Promise<boolean> {
  try {
    if (!tokenFCM) {
      console.error("🚨 Token FCM não informado!")
      return false
    }

    const message: admin.messaging.Message = {
      token: tokenFCM,
      notification: {
        title: titulo,
        body: corpo,
      },
      data: dados
        ? Object.fromEntries(
            Object.entries(dados).map(([key, value]) => [key, String(value)])
          )
        : {},
    }

    const response = await admin.messaging().send(message)
    console.log("✅ Notificação FCM enviada:", response)
    return true
  } catch (erro) {
    console.error("❌ Erro ao enviar notificação via FCM:", erro)
    return false
  }
}
