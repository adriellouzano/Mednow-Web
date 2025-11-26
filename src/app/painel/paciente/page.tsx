"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/componentes/sidebar";
import Topbar from "@/componentes/topbar";
import ModalVerPrescricao from "@/componentes/ModalVerPrescricao";

/**
 * Painel do Paciente — MedNow
 * Finalidade:
 *  • Exibe prescrições, alarmes ⏰ e entregas 📦
 *  • Recebe SSE em tempo real
 *  • Mantém a navegação SPA
 */

export default function PainelPaciente() {
  const router = useRouter();

  // Tipagem local
  type PrescricaoPaciente = {
    id: string;
    medicamento: string;
    criadoEm: string;
    frequencia: string;
    tipoMedicamento?: string;
    duracao?: string;
    observacoes?: string;
    entrega?: { id: string; dataEntrega?: string } | null;
    alarmes?: {
      id: string;
      horarioInicial?: string;
      frequenciaDiaria?: string;
      duracao?: string;
    }[];
  };

  // Estados globais
  const [prescricoes, setPrescricoes] = useState<PrescricaoPaciente[]>([]);
  const [prescricaoSelecionada, setPrescricaoSelecionada] =
    useState<PrescricaoPaciente | null>(null);

  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [secaoAtiva, setSecaoAtiva] = useState("inicio");

  // Relógio em tempo real
  const [horaAtual, setHoraAtual] = useState<string>("");

  useEffect(() => {
    const atualizarHora = () => {
      const agora = new Date();
      setHoraAtual(agora.toLocaleTimeString("pt-BR", { hour12: false }));
    };
    atualizarHora();
    const i = setInterval(atualizarHora, 1000);
    return () => clearInterval(i);
  }, []);

  // Carregar prescrições do paciente autenticado
  useEffect(() => {
    async function carregarPrescricoes() {
      const perfilAtivo = localStorage.getItem("perfilAtivo");
      const token = localStorage.getItem("token");
      const usuarioId = localStorage.getItem("usuarioId");

      if (!perfilAtivo || perfilAtivo !== "paciente") {
        router.push("/selecionar-perfil");
        return;
      }

      if (secaoAtiva !== "prescricoes") return;

      setLoading(true);
      setErro("");

      try {
        const url = `/api/prescricoes/listar?pacienteId=${usuarioId}`;
        const resp = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await resp.json();

        if (!resp.ok) {
          setErro(data.error || "Erro ao carregar prescrições.");
          setPrescricoes([]);
          return;
        }

        setPrescricoes(data.prescricoes || []);
      } catch (err) {
        console.error("Erro ao carregar prescrições:", err);
        setErro("Erro inesperado.");
      } finally {
        setLoading(false);
      }
    }

    carregarPrescricoes();
  }, [router, secaoAtiva]);

  // SSE — atualizações em tempo real
  useEffect(() => {
    let eventSource: EventSource | null = null;
    const usuarioId = localStorage.getItem("usuarioId");

    const conectar = () => {
      eventSource = new EventSource("/api/eventos/pacientes");

      eventSource.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);

          // Nova prescrição
          if (
            data.tipo === "nova_prescricao" &&
            data.prescricao?.pacienteId === usuarioId
          ) {
            if (secaoAtiva === "prescricoes") {
              setPrescricoes((prev) => [data.prescricao, ...prev]);
            }
          }

          // Novo alarme
          if (
            data.tipo === "novo_alarme" &&
            data.alarme?.prescricao?.pacienteId === usuarioId
          ) {
            if (secaoAtiva === "prescricoes") {
              setPrescricoes((prev) =>
                prev.map((p) =>
                  p.id === data.alarme.prescricaoId
                    ? { ...p, alarmes: [...(p.alarmes || []), data.alarme] }
                    : p
                )
              );
            }
          }

          // Entrega registrada
          if (
            data.tipo === "entrega_realizada" &&
            data.entrega?.prescricao?.pacienteId === usuarioId
          ) {
            if (secaoAtiva === "prescricoes") {
              setPrescricoes((prev) =>
                prev.map((p) =>
                  p.id === data.entrega.prescricaoId
                    ? { ...p, entrega: data.entrega }
                    : p
                )
              );
            }
          }
        } catch (err) {
          console.error("Erro SSE:", err);
        }
      };

      eventSource.onerror = (err) => {
        console.warn("SSE desconectado — tentando reconectar...", err);
        eventSource?.close();
        setTimeout(conectar, 5000);
      };
    };

    conectar();
    return () => eventSource?.close();
  }, [secaoAtiva]);

  // Render principal
  return (
    <div className="bg-[#F0F0F5] flex flex-col min-h-screen w-full">
      <Topbar />

      <div className="flex flex-row flex-1 bg-[#F0F0F5]">
        <Sidebar
          perfil="paciente"
          onNavigate={(secao) => {
            setSecaoAtiva(secao);
            setPrescricaoSelecionada(null);
            setErro("");
          }}
        />

        {/* Conteúdo */}
        <main className="p-6 space-y-4 w-full">
          {/* INÍCIO */}
          {secaoAtiva === "inicio" && (
            <div className="bg-white p-6 rounded shadow">
              <h1 className="text-xl text-[#000000] font-semibold mb-2">
                Bem-vindo ao MedNow!
              </h1>
              <p className="text-gray-700">
                Veja suas prescrições, alarmes configurados e entregas.
              </p>
            </div>
          )}

          {/* PRESCRIÇÕES */}
          {secaoAtiva === "prescricoes" && !prescricaoSelecionada && (
            <div className="bg-white p-6 rounded shadow h-full w-full">
              <h1 className="text-[#000000] text-xl mb-4 font-semibold">
                Suas Prescrições
              </h1>

              {loading && <p>Carregando...</p>}
              {erro && <p className="text-red-500">{erro}</p>}

              {!loading && !erro && (
                <>
                  {prescricoes.length === 0 ? (
                    <p>Nenhuma prescrição encontrada.</p>
                  ) : (
                    <div className="grid gap-4">
                      {prescricoes.map((presc) => (
                        <div
                          key={presc.id}
                          className={`p-4 rounded-lg shadow border transition ${
                            presc.entrega
                              ? "bg-green-50 border-green-500 ring-2 ring-green-300"
                              : "bg-white border-gray-200"
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <h2
                              className={`text-lg font-semibold ${
                                presc.entrega
                                  ? "text-green-700"
                                  : "text-gray-800"
                              }`}
                            >
                              {presc.medicamento}
                              {presc.entrega && " 📦"}
                              {presc.alarmes?.length ? " ⏰" : ""}
                            </h2>
                            <span className="text-sm text-gray-600">
                              {new Date(presc.criadoEm).toLocaleDateString(
                                "pt-BR"
                              )}
                            </span>
                          </div>

                          <p className="text-sm text-gray-700">
                            Frequência: {presc.frequencia}
                          </p>

                          {/* Relógio */}
                          <div className="text-sm text-gray-500 font-mono mt-2">
                            ⏱ Hora atual: {horaAtual}
                          </div>

                          {/* Alarmes */}
                          {(presc.alarmes?.length ?? 0) > 0 && (
                            <>
                              {presc.alarmes?.map((a, i) => {
                                const horarios: string[] = [];

                                if (a.horarioInicial && a.frequenciaDiaria) {
                                  const [hora, minuto] = a.horarioInicial
                                    .split(":")
                                    .map(Number);
                                  const vezesDia = parseInt(a.frequenciaDiaria);
                                  const intervalo = 24 / vezesDia;

                                  for (let i = 0; i < vezesDia; i++) {
                                    const novaHora =
                                      (hora + i * intervalo) % 24;
                                    horarios.push(
                                      `${String(
                                        Math.floor(novaHora)
                                      ).padStart(2, "0")}:${String(
                                        minuto
                                      ).padStart(2, "0")}`
                                    );
                                  }
                                }

                                return (
                                  <div
                                    key={i}
                                    className="text-sm text-blue-600 mt-1"
                                  >
                                    <p>
                                      Notificação configurada para:{" "}
                                      <b>{a.horarioInicial}</b>
                                    </p>

                                    {horarios.length > 0 && (
                                      <p>
                                        Horários diários:{" "}
                                        <b>{horarios.join(", ")}</b>
                                      </p>
                                    )}

                                    {a.frequenciaDiaria && (
                                      <p className="text-gray-600">
                                        Frequência: {a.frequenciaDiaria}x ao dia
                                      </p>
                                    )}
                                  </div>
                                );
                              })}
                            </>
                          )}

                          {/* Entrega */}
                          {presc.entrega && (
                            <p className="text-sm text-green-700 font-semibold mt-2">
                              ✅ Entregue em:{" "}
                              {new Date(
                                presc.entrega.dataEntrega || presc.criadoEm
                              ).toLocaleDateString("pt-BR")}
                            </p>
                          )}

                          <button
                            onClick={() => setPrescricaoSelecionada(presc)}
                            className="mt-3 bg-[#0060B1] hover:bg-[#004d8e] text-white px-4 py-1 rounded"
                          >
                            Ver Prescrição
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* MODAL DE VISUALIZAÇÃO */}
          <ModalVerPrescricao
            aberto={!!prescricaoSelecionada}
            prescricao={prescricaoSelecionada}
            pacienteNome="Você"
            onFechar={() => setPrescricaoSelecionada(null)}
          />
        </main>
      </div>
    </div>
  );
}
