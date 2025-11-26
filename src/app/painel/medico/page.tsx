"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "@/componentes/sidebar";
import Topbar from "@/componentes/topbar";
import CardPrescricao from "@/componentes/cardprescricao";
import CardPaciente from "@/componentes/cardpaciente";
import CardHistorico from "@/componentes/cardhistorico";
import DetalhePrescricao from "@/componentes/detalheprescricao";
import Botao from "@/componentes/botao";
import InputBusca from "@/componentes/inputbusca";
import NenhumAdicionado from "@/componentes/nenhumadicionado";

import Image from "next/image";
import Voltar from "@/imagens/voltar.svg";
import Save from "@/imagens/salvar.svg";
import PrescricoesCinza from "@/imagens/prescricoesCinza.svg";
import HistoricoCinza from "@/imagens/historicoCinza.svg";

/**
 * Página: Painel do Médico
 * Tecnologias: Next.js, Tailwind CSS, fetch API, SSE
 * Finalidade: visualizar e gerenciar prescrições, com busca de pacientes,
 * histórico e criação de novas prescrições.
 */

type Paciente = {
  id: string;
  nome: string;
  cpf: string;
};

type Prescricao = {
  id: string;
  medicamento: string;
  criadoEm: string;
  frequencia: string;
  dosagem?: string;
  duracao?: string;
  observacoes?: string;
  tipoMedicamento?: string;
  medico?: { id: string; nome: string; perfis?: { crm?: string }[] };
  paciente?: { id: string; nome: string };
  entrega?: { id: string } | null;
  alarmes?: { id: string }[];
};

export default function PainelMedico() {
  const router = useRouter();

  // ====== ESTADOS GLOBAIS ======
  const [prescricoes, setPrescricoes] = useState<Prescricao[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [historicoPaciente, setHistoricoPaciente] = useState<Prescricao[]>([]);
  const [secaoAtiva, setSecaoAtiva] = useState("inicio");

  const [pacienteSelecionado, setPacienteSelecionado] =
    useState<Paciente | null>(null);
  const [prescricaoSelecionada, setPrescricaoSelecionada] =
    useState<Prescricao | null>(null);

  const [origemPrescricao, setOrigemPrescricao] = useState<
    "historico" | "prescricoes" | null
  >(null);

  const [termoBusca, setTermoBusca] = useState("");

  const [pacienteId, setPacienteId] = useState("");
  const [medicamento, setMedicamento] = useState("");
  const [dosagem, setDosagem] = useState("");
  const [frequencia, setFrequencia] = useState("");
  const [duracao, setDuracao] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [tipoMedicamento, setTipoMedicamento] = useState("comum");

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [loading, setLoading] = useState(false);
  // ====== FIM ESTADOS ======

  // Carrega prescrições do médico ao abrir a página
  useEffect(() => {
    async function carregarPrescricoes() {
      try {
        const token = localStorage.getItem("token");
        const perfilAtivo = localStorage.getItem("perfilAtivo");
        if (perfilAtivo !== "medico") {
          router.push("/selecionar-perfil");
          return;
        }
        const response = await fetch("/api/prescricoes/listar", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) return;
        const data = await response.json();
        setPrescricoes(data.prescricoes || []);
      } catch (error) {
        console.error(error);
      }
    }
    carregarPrescricoes();
  }, [router]);

  // SSE – novas prescrições em tempo real
  useEffect(() => {
    let eventSource: EventSource | null = null;

    const conectarSSE = () => {
      eventSource = new EventSource("/api/eventos/prescricoes");

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.tipo === "nova_prescricao" && data.prescricao) {
            if (secaoAtiva === "prescricoes") {
              setPrescricoes((prev) => [data.prescricao, ...prev]);
            }
            console.log("🩺 Nova prescrição em tempo real:", data.prescricao);
          }
        } catch (err) {
          console.error("Erro SSE:", err);
        }
      };

      eventSource.onerror = (err) => {
        console.warn("SSE encerrado, tentando reconectar em 5s...", err);
        eventSource?.close();
        setTimeout(conectarSSE, 5000);
      };
    };

    conectarSSE();
    return () => eventSource?.close();
  }, [secaoAtiva]);

  // Busca inicial de pacientes ao entrar em "buscar"
  useEffect(() => {
    async function buscarPacientesIniciais() {
      if (secaoAtiva !== "buscar") return;
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("/api/eventos/pacientes/buscar", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ termo: "", pagina: 1 }),
        });
        const data = await response.json();
        if (response.ok) setPacientes(data.pacientes || []);
      } catch (error) {
        console.error(error);
      }
    }
    buscarPacientesIniciais();
  }, [secaoAtiva]);

  // Carrega histórico do paciente selecionado
  useEffect(() => {
    async function carregarHistorico() {
      if (secaoAtiva !== "historico" || !pacienteSelecionado) return;
      try {
        const token = localStorage.getItem("token");
        const url = `/api/prescricoes/listar?pacienteId=${pacienteSelecionado.id}`;
        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (!response.ok) {
          setErro(data.error || "Erro ao carregar histórico.");
          return;
        }
        setHistoricoPaciente(data.prescricoes || []);
      } catch (err) {
        console.error(err);
        setErro("Erro inesperado ao carregar histórico.");
      }
    }
    carregarHistorico();
  }, [secaoAtiva, pacienteSelecionado]);

  // Sincroniza prescrições ao abrir seção "prescricoes"
  useEffect(() => {
    async function sincronizarPrescricoes() {
      if (secaoAtiva !== "prescricoes") return;
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("/api/prescricoes/listar", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (response.ok) setPrescricoes(data.prescricoes || []);
      } catch (err) {
        console.error("Falha ao sincronizar prescrições:", err);
      }
    }
    sincronizarPrescricoes();
  }, [secaoAtiva]);

  // Mantém pacienteId sincronizado ao escolher paciente
  useEffect(() => {
    if (pacienteSelecionado?.id) {
      setPacienteId(pacienteSelecionado.id);
    }
  }, [pacienteSelecionado]);

  const pacientesFiltrados = pacientes.filter(
    (p) =>
      p?.nome?.toLowerCase().includes(termoBusca.toLowerCase()) ||
      p?.cpf?.includes(termoBusca)
  );

  // Criação de nova prescrição
  const handleCriarPrescricao = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErro("");
    setSucesso("");
    setLoading(true);

    const idPaciente = pacienteSelecionado?.id || pacienteId;

    if (!idPaciente || !medicamento || !dosagem || !frequencia || !duracao) {
      setErro("Campos obrigatórios não informados.");
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token") || "";
      const medicoId = localStorage.getItem("usuarioId") || "";

      const resp = await fetch("/api/prescricoes/criar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          pacienteId: idPaciente,
          medicoId,
          medicamento,
          dosagem,
          frequenciaDiaria: frequencia,
          duracao,
          observacoes,
          tipoMedicamento,
        }),
      });

      const payload = await resp.json();

      if (!resp.ok) {
        setErro(payload?.error ?? "Erro ao criar prescrição.");
        return;
      }

      const nova = payload?.prescricao ?? payload;
      setPrescricoes((prev) => [nova, ...prev]);

      setSucesso("Prescrição criada com sucesso.");
      setSecaoAtiva("prescricoes");

      setPacienteId("");
      setMedicamento("");
      setDosagem("");
      setFrequencia("");
      setDuracao("");
      setObservacoes("");
      setTipoMedicamento("comum");
    } catch (err) {
      console.error("Erro ao criar prescrição:", err);
      setErro("Erro inesperado ao criar prescrição.");
    } finally {
      setLoading(false);
    }
  };

  // ====== RENDER ======
  return (
    <div className="bg-[#F0F0F5] flex flex-col min-h-screen w-full">
      <Topbar />

      <div className="flex flex-row flex-1 bg-[#F0F0F5]">
        <Sidebar
          perfil="medico"
          onNavigate={(secao) => {
            setSecaoAtiva(secao);
            setErro("");
            setSucesso("");
            setPacienteSelecionado(null);
            setPrescricaoSelecionada(null);
            setHistoricoPaciente([]);
            setOrigemPrescricao(null);
          }}
        />

        <main className="p-6 space-y-4 w-full">
          {/* INÍCIO */}
          {secaoAtiva === "inicio" && (
            <div className="bg-white p-6 rounded shadow w-full">
              <h2 className="text-xl text-[#000000] font-semibold mb-2">
                Bem-vindo ao MedNow!
              </h2>
              <p>
                Use o menu lateral para buscar pacientes, ver prescrições ou
                criar novas.
              </p>
            </div>
          )}

          {/* BUSCAR PACIENTE */}
          {secaoAtiva === "buscar" && (
            <div className="bg-white p-6 rounded shadow h-full w-full">
              <h2 className="text-xl font-semibold text-[#000000] mb-4">
                Buscar Paciente
              </h2>
              <InputBusca
                valor={termoBusca}
                aoAlterar={setTermoBusca}
                placeholder="Digite o nome ou CPF"
              />
              <div className="grid gap-3 mt-3">
                {pacientesFiltrados.map((paciente) => (
                  <CardPaciente
                    key={paciente.id}
                    nome={paciente.nome}
                    cpf={paciente.cpf}
                    onVerHistorico={() => {
                      setPacienteSelecionado(paciente);
                      setHistoricoPaciente([]);
                      setSecaoAtiva("historico");
                    }}
                    onNovaPrescricao={() => {
                      setPacienteId(paciente.id);
                      setPacienteSelecionado(paciente);
                      setSecaoAtiva("nova");
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* HISTÓRICO DO PACIENTE */}
          {secaoAtiva === "historico" && pacienteSelecionado && (
            <div className="bg-white p-6 rounded shadow w-full h-full flex flex-col">
              <div className="mb-4">
                <h2 className="text-xl font-semibold mb-2 text-[#000000]">
                  Histórico Pacientes
                </h2>
                <div className="flex flex-col gap-2 mb-4">
                  <span>
                    <span className="font-bold text-[#000000]">Nome:</span>{" "}
                    {pacienteSelecionado.nome}
                  </span>
                  <span>
                    <span className="font-bold text-[#000000]">CPF:</span>{" "}
                    {pacienteSelecionado.cpf}
                  </span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto mt-2">
                {historicoPaciente.length === 0 ? (
                  <NenhumAdicionado
                    icon={HistoricoCinza}
                    message="O Paciente não possui histórico médico"
                    message2=""
                  />
                ) : (
                  <div className="grid gap-3">
                    {historicoPaciente.map((p) => (
                      <CardHistorico
                        key={p.id}
                        medicamento={p.medicamento}
                        data={new Date(p.criadoEm).toLocaleDateString()}
                        feitoPorMim={
                          p.medico?.id === localStorage.getItem("usuarioId")
                        }
                        onVerPrescricao={() => {
                          setOrigemPrescricao("historico");
                          setPrescricaoSelecionada(p);
                          setSecaoAtiva("ver");
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-3">
                <Botao
                  variante="voltar"
                  onClick={() => setSecaoAtiva("buscar")}
                >
                  <Image
                    src={Voltar}
                    className="h-[23px] w-[23px]"
                    alt="voltar"
                  />
                  <span className="text-[17px] font-medium">Voltar</span>
                </Botao>
              </div>
            </div>
          )}

          {/* VER PRESCRIÇÃO (DETALHE) */}
          {secaoAtiva === "ver" && prescricaoSelecionada && (
            <DetalhePrescricao
              pacienteNome={
                prescricaoSelecionada.paciente?.nome ||
                pacienteSelecionado?.nome ||
                "Paciente"
              }
              medicoNome={prescricaoSelecionada.medico?.nome || ""}
              crmMedico={prescricaoSelecionada.medico?.perfis?.[0]?.crm || ""}
              medicamento={prescricaoSelecionada.medicamento}
              dosagem={prescricaoSelecionada.dosagem || "N/A"}
              frequencia={prescricaoSelecionada.frequencia}
              duracao={prescricaoSelecionada.duracao || "N/A"}
              observacoes={prescricaoSelecionada.observacoes || ""}
              tipoMedicamento={prescricaoSelecionada.tipoMedicamento || "comum"}
              criadoEm={new Date(
                prescricaoSelecionada.criadoEm
              ).toLocaleDateString()}
              perfilUsuario="medico"
              onVoltar={() => {
                if (origemPrescricao === "historico") {
                  setSecaoAtiva("historico");
                } else if (origemPrescricao === "prescricoes") {
                  setSecaoAtiva("prescricoes");
                } else {
                  setSecaoAtiva("inicio");
                }
              }}
            />
          )}

          {/* NOVA PRESCRIÇÃO */}
          {secaoAtiva === "nova" && pacienteSelecionado && (
            <div className="bg-white p-6 rounded shadow h-full w-full">
              <h2 className="text-[#000000] mb-3 text-xl font-semibold">
                Nova Prescrição
              </h2>

              <form onSubmit={handleCriarPrescricao} className="space-y-3">
                {/* Paciente (fixo) */}
                <div className="flex flex-col">
                  <label
                    htmlFor="paciente"
                    className="text-[#000000] text-[14px]"
                  >
                    Paciente
                  </label>
                  <input
                    id="paciente"
                    type="text"
                    value={pacienteSelecionado.nome}
                    readOnly
                    className="w-full border px-3 py-2 rounded border-[#99a1af] bg-gray-100 text-[#444444] font-medium"
                  />
                </div>

                <input type="hidden" value={pacienteId} name="pacienteId" />

                {/* Medicamento */}
                <div className="flex flex-col">
                  <label
                    htmlFor="medicamento"
                    className="text-[#000000] text-[14px]"
                  >
                    Medicamento
                  </label>
                  <input
                    id="medicamento"
                    type="text"
                    value={medicamento}
                    onChange={(e) => setMedicamento(e.target.value)}
                    className="w-full border border-[#99a1af] px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#75A9FF] focus:border-transparent transition-colors"
                    required
                  />
                </div>

                {/* Dosagem, Frequência, Duração */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex flex-col">
                    <label
                      htmlFor="dosagem"
                      className="text-[#000000] text-[14px]"
                    >
                      Dosagem
                    </label>
                    <input
                      id="dosagem"
                      type="text"
                      value={dosagem}
                      onChange={(e) => setDosagem(e.target.value)}
                      className="w-full border border-[#99a1af] px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#75A9FF] focus:border-transparent transition-colors"
                      required
                    />
                  </div>
                  <div className="flex flex-col">
                    <label
                      htmlFor="frequencia"
                      className="text-[#000000] text-[14px]"
                    >
                      Frequência
                    </label>
                    <input
                      id="frequencia"
                      type="text"
                      value={frequencia}
                      onChange={(e) => setFrequencia(e.target.value)}
                      className="w-full border border-[#99a1af] px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#75A9FF] focus:border-transparent transition-colors"
                      required
                    />
                  </div>
                  <div className="flex flex-col">
                    <label
                      htmlFor="duracao"
                      className="text-[#000000] text-[14px]"
                    >
                      Duração
                    </label>
                    <input
                      id="duracao"
                      type="text"
                      value={duracao}
                      onChange={(e) => setDuracao(e.target.value)}
                      className="w-full border border-[#99a1af] px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#75A9FF] focus:border-transparent transition-colors"
                      required
                    />
                  </div>
                </div>

                {/* Observações */}
                <div className="flex flex-col">
                  <label
                    htmlFor="observacoes"
                    className="text-[#000000] text-[14px]"
                  >
                    Observações
                  </label>
                  <textarea
                    id="observacoes"
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    className="w-full h-[178px] border border-[#99a1af] px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#75A9FF] focus:border-transparent transition-colors"
                  />
                </div>

                {/* Tipo medicamento */}
                <select
                  value={tipoMedicamento}
                  onChange={(e) => setTipoMedicamento(e.target.value)}
                  className="w-full border border-[#99a1af] px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#75A9FF] focus:border-transparent transition-colors"
                >
                  <option value="comum">Comum</option>
                  <option value="antibiotico">Antibiótico</option>
                  <option value="controlado">Controlado</option>
                </select>

                <div className="flex flex-row mt-5 justify-between">
                  <div className="h-[33px] w-[116px] flex">
                    <button
                      type="button"
                      onClick={() => setSecaoAtiva("buscar")}
                      className="flex flex-row items-center gap-2 bg-gray-200 text-[#000000] rounded hover:bg-gray-300 pl-4 pr-4"
                    >
                      <Image
                        src={Voltar}
                        className="h-[23px] w-[23px]"
                        alt="voltar"
                      />
                      Voltar
                    </button>
                  </div>
                  <div className="h-[42px] w-[230px] flex">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex flex-row justify-center items-center gap-3 w-full h-[42px] bg-[#0060B1] text-white rounded hover:bg-[#004d8e]"
                    >
                      <Image
                        src={Save}
                        alt="save"
                        className="w-[30px] h-[30px]"
                      />
                      {loading ? "Salvando..." : "Salvar Prescrição"}
                    </button>
                  </div>
                </div>

                {erro && <p className="text-red-500 mt-2">❌ {erro}</p>}
                {sucesso && <p className="text-green-600 mt-1">✅ {sucesso}</p>}
              </form>
            </div>
          )}

          {/* MINHAS PRESCRIÇÕES */}
          {secaoAtiva === "prescricoes" && (
            <div className="bg-white p-6 rounded shadow h-full w-full">
              <h1 className="text-[#000000] text-xl mb-4 font-semibold">
                Minhas Prescrições
              </h1>
              {prescricoes.length === 0 ? (
                <NenhumAdicionado
                  icon={PrescricoesCinza}
                  message="Nenhuma prescrição cadastrada"
                  message2=""
                />
              ) : (
                <div className="grid gap-3">
                  {prescricoes.map((p) => (
                    <CardPrescricao
                      key={p.id}
                      medicamento={p.medicamento}
                      data={new Date(p.criadoEm).toLocaleDateString()}
                      frequencia={p.frequencia}
                      onVer={() => {
                        setOrigemPrescricao("prescricoes");
                        setPrescricaoSelecionada(p);
                        setSecaoAtiva("ver");
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
