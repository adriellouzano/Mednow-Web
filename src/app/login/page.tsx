"use client";

import Image from "next/image";
import Line from "@/imagens/line-5.svg";
import Logo2 from "@/imagens/logo2.svg";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatarCpf } from "../../utilitarios/formatarCpf";

/**
 * Página de Login.
 * Responsável por autenticação real do usuário,
 * integração com o backend e carregamento da sessão.
 */
export default function LoginPage() {
  const router = useRouter();

  // ====== INÍCIO: Estados globais ======
  const [cpf, setCpf] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  // ====== FIM: Estados globais ======

  /**
   * Função principal: autentica usuário e redireciona
   * para o painel correto conforme o perfil.
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    setLoading(true);

    try {
      const cpfLimpo = cpf.replace(/[^\d]/g, "");

      const response = await fetch("/api/usuarios/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cpf: cpfLimpo, senha }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErro(data.error || "Erro ao fazer login.");
        setLoading(false);
        return;
      }

      // ====== Salvando informações da sessão ======
      localStorage.setItem("token", data.token);
      localStorage.setItem("usuarioId", data.usuario.id);
      localStorage.setItem("usuarioNome", data.usuario.nome);
      localStorage.setItem("perfis", JSON.stringify(data.usuario.perfis));

      // ====== Redirecionamento dinâmico ======
      const perfis = data.usuario.perfis;

      if (perfis.length === 1) {
        const unico = perfis[0].tipo;
        localStorage.setItem("perfilAtivo", unico);
        router.push(`/painel/${unico}`);
      } else {
        router.push("/selecionar-perfil");
      }

    } catch (error) {
      console.error("Erro inesperado:", error);
      setErro(
        "Erro inesperado. Verifique sua conexão e tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    // ====== Estrutura visual com layout completo ======
    <main className="min-h-[calc(100vh-100px)] w-full bg-[#F0F0F5] flex items-center justify-center p-4">
      <form onSubmit={handleLogin} className="w-full">
        <div className="flex flex-col lg:flex-row justify-center items-center lg:items-start w-full gap-5">

          {/* ====== CARD PRINCIPAL DE LOGIN ====== */}
          <div className="h-auto bg-[#FFFFFF] rounded shadow w-full max-w-lg overflow-hidden">
            <div className="flex h-[121px] justify-center items-center">
              <h1 className="text-[32px] text-[#000000]">
                Faça seu <span className="text-[#0060B1]">Login</span>
              </h1>
            </div>

            <div className="flex justify-center">
              <Image src={Line} alt="linha login" />
            </div>

            <div className="w-full h-auto p-11 flex flex-col gap-5">
              <div>
                <p className="text-[20px]">Insira os detalhes abaixo</p>
              </div>

              {/* Campos de CPF e Senha */}
              <div className="flex flex-col gap-5">
                <input
                  type="text"
                  value={cpf}
                  placeholder="Insira seu CPF"
                  onChange={(e) => setCpf(formatarCpf(e.target.value))}
                  className="w-full h-[65px] border border-[#99a1af] font-light text-xl px-4 
                             focus:outline-none focus:ring-2 focus:ring-[#75A9FF] transition-colors"
                  required
                />

                <input
                  type="password"
                  value={senha}
                  placeholder="Insira sua Senha"
                  onChange={(e) => setSenha(e.target.value)}
                  className="w-full h-[65px] border border-[#99a1af] font-light text-xl px-4 
                             focus:outline-none focus:ring-2 focus:ring-[#75A9FF] transition-colors"
                  required
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-[65px] bg-[#0060B1] hover:bg-[#0060b1]/90 text-[24px] text-white"
                >
                  {loading ? "Entrando..." : "Entrar"}
                </button>

                {/* Exibição de erro */}
                {erro && (
                  <p className="text-red-500 flex justify-center mt-5">
                    {erro}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ====== CARD DE REGISTRO ====== */}
          <div className="flex flex-col h-auto w-full max-w-md rounded shadow bg-[#ffffff] p-6 py-10">
            <div className="flex flex-col gap-5">
              <h1 className="text-[32px] text-[#000000] font-normal">
                Registrar
              </h1>

              <Link href="/cadastrar">
                <button className="w-full h-[59px] bg-[#0060B1] hover:bg-[#0060b1]/90 text-[20px] text-white">
                  CADASTRE-SE CONOSCO
                </button>
              </Link>

              <p className="text-[20px]">
                Após se cadastrar, você terá acesso total à plataforma e poderá
                usar sua conta para criar tickets de suporte.
              </p>
            </div>
          </div>

        </div>

        {/* Ícone decorativo inferior */}
        <Image
          className="hidden lg:block absolute w-[114px] h-[135px] bottom-20 right-20"
          alt="MedNow Logo"
          src={Logo2}
        />
      </form>
    </main>
  );
}
