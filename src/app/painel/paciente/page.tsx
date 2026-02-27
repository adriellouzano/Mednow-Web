"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Topbar from "@/componentes/topbar";

export default function PainelPaciente() {
  const router = useRouter();
  const [nomePaciente, setNomePaciente] = useState("Paciente");

  useEffect(() => {
    const tipo = sessionStorage.getItem("perfilAtivo");
    const nome = sessionStorage.getItem("usuarioNome");

    if (tipo !== "paciente") {
      router.push("/selecionar-perfil");
      return;
    }

    if (nome) setNomePaciente(nome);
  }, [router]);

  return (
    <div className="bg-[#F0F0F5] flex flex-col min-h-screen w-full">
      <Topbar />

      <div className="flex flex-1 bg-[#F0F0F5] items-center justify-center p-6">
        <main className="max-w-md w-full">
          <div className="bg-white p-8 rounded-2xl shadow-sm text-center border border-gray-100">
            <h1 className="text-2xl text-[#000000] font-semibold mb-2">
              Bem-vindo, <span className="text-[#0060B1]">{nomePaciente}</span>!
            </h1>
            <p className="mt-4 text-gray-600 ">
              Veja suas prescrições, alarmes configurados e entregas a partir do
              nosso Aplicativo android.
            </p>
            <div className="my-6 border-t border-gray-100" />
            <a
              href="/mednow.apk"
              download
              className="flex items-center justify-center gap-3 w-full bg-[#0060B1] hover:bg-[#004e92] text-white font-semibold py-4 rounded-xl transition-all shadow-md active:scale-95"
            >
              Baixar Aplicativo (APK)
            </a>

            <p className="mt-4 text-xs text-gray-400">
              Versão atualizada: 1.0.0
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
