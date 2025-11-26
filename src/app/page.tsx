"use client";

import { redirect } from "next/navigation";

/**
 * Página inicial da aplicação.
 * Esta página apenas redireciona o usuário
 * diretamente para a tela de login.
 */
export default function HomePage() {
  redirect("/login");
}
