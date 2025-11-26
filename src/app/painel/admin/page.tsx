"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/componentes/sidebar";
import Topbar from "@/componentes/topbar";

import Image from "next/image";
import Check from "@/imagens/check-box.svg";
import Close from "@/imagens/close.svg";
import UserCinza from "@/imagens/user-cinza.svg";
import NenhumAdicionado from "@/componentes/nenhumadicionado";

/**
 * Painel do Administrador.
 * Responsável por aprovar/rejeitar perfis sensíveis (médicos e farmacêuticos)
 * e visualizar perfis aprovados e pendentes.
 */
type Perfil = {
  id: string;
  tipo: "medico" | "farmaceutico";
  usuario?: {
    nome: string;
    cpf: string;
  };
  crm?: string | null;
  crf?: string | null;
};

export default function PainelAdmin() {
  const router = useRouter();

  // ====== Estados globais ======
  const [perfisPendentes, setPerfisPendentes] = useState<Perfil[]>([]);
  const [perfisAprovados, setPerfisAprovados] = useState<Perfil[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [secaoAtiva, setSecaoAtiva] = useState("inicio");

  /**
   * Verifica perfil ativo + carrega perfis do backend.
   */
  useEffect(() => {
    const perfilAtivo = localStorage.getItem("perfilAtivo");
    const token = localStorage.getItem("token");

    if (!perfilAtivo || perfilAtivo !== "admin") {
      router.push("/selecionar-perfil");
      return;
    }

    async function carregarPerfis() {
      setErro("");
      setLoading(true);

      try {
        const rota =
          secaoAtiva === "aprovados"
            ? "/api/perfis/aprovados"
            : "/api/perfis/pendentes";

        const response = await fetch(rota, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();

        if (!response.ok) {
          setErro(data.error || "Erro ao carregar perfis.");
          return;
        }

        if (secaoAtiva === "aprovados") setPerfisAprovados(data.perfis || []);
        else setPerfisPendentes(data.perfis || []);
      } catch (err) {
        console.error("Erro ao carregar perfis:", err);
        setErro("Erro inesperado.");
      } finally {
        setLoading(false);
      }
    }

    if (secaoAtiva === "pendentes" || secaoAtiva === "aprovados") {
      carregarPerfis();
    }
  }, [router, secaoAtiva]);

  /**
   * Aprovar ou rejeitar perfil.
   */
  const atualizarStatus = async (id: string, aprovar: boolean) => {
    setErro("");
    setSucesso("");

    const token = localStorage.getItem("token");

    try {
      const response = await fetch("/api/perfis/aprovar", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, aprovar }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErro(data.error || "Erro ao atualizar perfil.");
        return;
      }

      setSucesso(`Perfil ${aprovar ? "aprovado" : "rejeitado"} com sucesso.`);
      setPerfisPendentes((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Erro inesperado ao atualizar perfil:", err);
      setErro("Erro inesperado.");
    }
  };

  return (
    <div className="bg-[#F0F0F5] flex flex-col min-h-screen w-full">
      <Topbar />

      <div className="flex flex-row flex-1 bg-[#F0F0F5]">
        <Sidebar
          perfil="admin"
          onNavigate={(secao) => {
            setSecaoAtiva(secao);
            setErro("");
            setSucesso("");
          }}
        />

        {/* ====== Conteúdo principal ====== */}
        <main className="p-6 space-y-4 w-full">
          {/* ======================
              Seção: INÍCIO
          ====================== */}
          {secaoAtiva === "inicio" && (
            <div className="bg-white p-6 rounded shadow w-full">
              <h1 className="text-xl text-[#000000] font-semibold mb-2">
                Bem-vindo ao MedNow
              </h1>
              <p className="text-gray-700">
                Use o menu lateral para gerenciar e validar perfis
                profissionais.
              </p>
            </div>
          )}

          {/* ======================
              Seção: PENDENTES
          ====================== */}
          {secaoAtiva === "pendentes" && (
            <div className="bg-white p-6 rounded shadow h-full w-full">
              <h1 className="text-2xl font-semibold text-black mb-5">
                Perfis Pendentes
              </h1>

              {erro && <p className="text-red-500">{erro}</p>}
              {sucesso && <p className="text-green-600">{sucesso}</p>}

              {loading ? (
                <p>Carregando perfis pendentes...</p>
              ) : perfisPendentes.length === 0 ? (
                <NenhumAdicionado
                  icon={UserCinza}
                  message="Nenhum Perfil para Validação"
                  message2=""
                />
              ) : (
                <ul className="grid gap-3 lg:grid-row">
                  {perfisPendentes.map((perfil) => (
                    <li
                      key={perfil.id}
                      className="border border-[#D9D9D9] p-4 rounded bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div>
                        <p>
                          <strong className="text-[#000000]">Usuário:</strong>{" "}
                          {perfil.usuario?.nome || "N/A"}
                        </p>
                        <p>
                          <strong className="text-[#000000]">CPF:</strong>{" "}
                          {perfil.usuario?.cpf}
                        </p>
                        <p>
                          <strong className="text-[#000000]">Perfil:</strong>{" "}
                          {perfil.tipo}
                        </p>

                        {perfil.tipo === "medico" && (
                          <p className="flex items-center gap-2">
                            <span>
                              <strong className="text-[#000000]">CRM:</strong>{" "}
                              {perfil.crm}
                            </span>
                            <a
                              href="https://portal.cfm.org.br/index.php?option=com_medicos"
                              target="_blank"
                              className="text-blue-600 underline"
                            >
                              Verificar CRM
                            </a>
                          </p>
                        )}

                        {perfil.tipo === "farmaceutico" && (
                          <p className="flex items-center gap-2">
                            <span>
                              <strong className="text-[#000000]">CRF:</strong>{" "}
                              {perfil.crf}
                            </span>
                            <a
                              href="https://www.cff.org.br/pagina.php?id=77"
                              target="_blank"
                              className="text-blue-600 underline"
                            >
                              Verificar CRF
                            </a>
                          </p>
                        )}
                      </div>

                      {/* Botões modernos */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => atualizarStatus(perfil.id, true)}
                          className="flex items-center gap-2 bg-[rgba(0,128,0,0.1)] text-[#008000] px-3 py-2 rounded hover:bg-green-600/20 text-sm font-medium"
                        >
                          <Image src={Check} alt="check" />
                          Aprovar
                        </button>

                        <button
                          onClick={() => atualizarStatus(perfil.id, false)}
                          className="flex items-center gap-2 bg-[#FF2C2C] text-white px-3 py-2 rounded hover:bg-red-400 text-sm font-medium"
                        >
                          <Image
                            src={Close}
                            className="h-[25px] w-[25px]"
                            alt="close"
                          />
                          Rejeitar
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* ======================
              Seção: APROVADOS
          ====================== */}
          {secaoAtiva === "aprovados" && (
            <div className="bg-white p-6 rounded shadow h-full w-full">
              <h1 className="text-2xl font-semibold text-black mb-5">
                Perfis Aprovados
              </h1>

              {erro && <p className="text-red-500">{erro}</p>}

              {loading ? (
                <p>Carregando perfis aprovados...</p>
              ) : perfisAprovados.length === 0 ? (
                <p>Nenhum perfil aprovado registrado.</p>
              ) : (
                <ul className="grid gap-3">
                  {perfisAprovados.map((perfil) => (
                    <li
                      key={perfil.id}
                      className="border border-[#D9D9D9] p-4 rounded bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div>
                        <p>
                          <strong className="text-[#000000]">Usuário:</strong>{" "}
                          {perfil.usuario?.nome || "N/A"}
                        </p>
                        <p>
                          <strong className="text-[#000000]">CPF:</strong>{" "}
                          {perfil.usuario?.cpf}
                        </p>
                        <p>
                          <strong className="text-[#000000]">Perfil:</strong>{" "}
                          {perfil.tipo}
                        </p>

                        {perfil.tipo === "medico" && (
                          <p>
                            <strong className="text-[#000000]">CRM:</strong>{" "}
                            {perfil.crm}
                          </p>
                        )}

                        {perfil.tipo === "farmaceutico" && (
                          <p>
                            <strong className="text-[#000000]">CRF:</strong>{" "}
                            {perfil.crf}
                          </p>
                        )}
                      </div>

                      <p className="text-green-600 font-semibold">
                        ✅ Aprovado
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
