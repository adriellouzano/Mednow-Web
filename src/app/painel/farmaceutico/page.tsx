"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/componentes/sidebar";
import Topbar from "@/componentes/topbar";
import CardPrescricao from "@/componentes/cardprescricao";
import CardPaciente from "@/componentes/cardpaciente";
import InputBusca from "@/componentes/inputbusca";
import ModalAlarmeFarmaceutico from "@/componentes/modalalarmefarmaceutico";
import NenhumAdicionado from "@/componentes/nenhumadicionado";
import DetalhePrescricao from "@/componentes/detalheprescricao";

import Image from "next/image";
import PrescricoesCinza from "@/imagens/prescricoesCinza.svg";
import Voltar from "@/imagens/voltar.svg";

/**
 * =============================================
 * Painel do Farmacêutico — Sistema MedNow (A + design B)
 * =============================================
 * ✔ Usa o design, layout e UX
 * =============================================
 */

type Prescricao = {
  id: string;
  medicamento: string;
  dosagem?: string;
  criadoEm: string;
  frequencia: string;
  tipoMedicamento?: string;
  duracao?: string;
  observacoes?: string;
  medico?: {
    nome?: string;
    crm?: string;
  };
  alarmes?: { id: string; horarioInicial?: string; frequencia?: number }[];
  entregas?: { id: string; dataEntrega?: string }[];
};

type Paciente = {
  id: string;
  nome: string;
  cpf: string;
  email?: string;
};

export default function PainelFarmaceutico() {
  // ====== ESTADOS GLOBAIS ======
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [prescricoes, setPrescricoes] = useState<Prescricao[]>([]);
  const [pacienteSelecionado, setPacienteSelecionado] =
    useState<Paciente | null>(null);
  const [secaoAtiva, setSecaoAtiva] = useState("inicio");

  const [termoBusca, setTermoBusca] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const [entregandoId, setEntregandoId] = useState<string | null>(null);

  // 🔔 Estados do Modal
  const [modalAberto, setModalAberto] = useState(false);
  const [prescricaoSelecionada, setPrescricaoSelecionada] = useState<
    string | null
  >(null);

  const [prescricaoVisualizada, setPrescricaoVisualizada] =
    useState<Prescricao | null>(null);

  // ================================
  // 🔎 Buscar pacientes automaticamente (MESMA LÓGICA DO A)
  useEffect(() => {
    async function carregarPacientes() {
      if (secaoAtiva !== "buscar") return;
      setErro("");
      setLoading(true);

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
        if (!response.ok)
          throw new Error(data.error || "Erro ao buscar pacientes.");

        setPacientes(data.pacientes || []);
      } catch (err) {
        console.error("Erro ao buscar pacientes:", err);
        setErro("Erro ao carregar pacientes.");
      } finally {
        setLoading(false);
      }
    }

    carregarPacientes();
  }, [secaoAtiva]);

  // ================================
  // 📋 Carregar prescrições por paciente (MESMA LÓGICA DO A)
  const carregarPrescricoesPaciente = async (paciente: Paciente) => {
    setPacienteSelecionado(paciente);
    setSecaoAtiva("prescricoes");
    setLoading(true);
    setErro("");

    try {
      const token = localStorage.getItem("token");
      const url = `/api/prescricoes/listar?pacienteId=${paciente.id}`;

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Erro ao buscar prescrições.");

      const ordenadas = (data.prescricoes || []).sort(
        (a: Prescricao, b: Prescricao) =>
          new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime()
      );

      setPrescricoes(ordenadas);
    } catch (err) {
      console.error("Erro ao carregar prescrições:", err);
      setErro("Erro ao carregar prescrições.");
    } finally {
      setLoading(false);
    }
  };

  // ================================
  // 📦 Marcar prescrição como entregue (MESMA LÓGICA DO A)
  const marcarComoEntregue = async (prescricaoId: string) => {
    setEntregandoId(prescricaoId);
    setErro("");

    try {
      const token = localStorage.getItem("token");

      const response = await fetch("/api/entregas/registrar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ prescricaoId }),
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Erro ao registrar entrega.");

      if (pacienteSelecionado) carregarPrescricoesPaciente(pacienteSelecionado);
    } catch (err) {
      console.error("Erro entrega:", err);
      setErro("Erro ao registrar entrega.");
    } finally {
      setEntregandoId(null);
    }
  };

  // ================================
  // ⏰ Abrir modal de alarme (MESMA LÓGICA DO A)
  const configurarAlarme = (prescricaoId: string) => {
    setPrescricaoSelecionada(prescricaoId);
    setModalAberto(true);
  };

  // ================================
  // 🔁 SSE — Novas prescrições (MESMA LÓGICA DO A)
  useEffect(() => {
    const eventSource = new EventSource("/api/prescricoes");

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.tipo === "nova_prescricao" && data.prescricao) {
          if (secaoAtiva === "prescricoes" && pacienteSelecionado) {
            if (data.prescricao.pacienteId === pacienteSelecionado.id) {
              setPrescricoes((prev) => [data.prescricao, ...prev]);
            }
          }
        }
      } catch (err) {
        console.error("Erro SSE:", err);
      }
    };

    eventSource.onerror = () => eventSource.close();
    return () => eventSource.close();
  }, [secaoAtiva, pacienteSelecionado]);

  // ================================
  // 🔍 Filtro local
  const pacientesFiltrados = pacientes.filter(
    (p) =>
      p?.nome?.toLowerCase().includes(termoBusca.toLowerCase()) ||
      p?.cpf?.replace(/\D/g, "").includes(termoBusca.replace(/\D/g, ""))
  );

  // =====================================================
  // RENDERIZAÇÃO COM O DESIGN DO B
  // =====================================================
  return (
    <div className="bg-[#F0F0F5] flex flex-col min-h-screen w-full">
      <Topbar />

      <div className="flex flex-row flex-1 bg-[#F0F0F5]">
        <Sidebar
          perfil="farmaceutico"
          onNavigate={(secao) => {
            setSecaoAtiva(secao);
            setErro("");
          }}
        />

        <main className="p-6 space-y-4 w-full">
          {/* ====== INÍCIO ====== */}
          {secaoAtiva === "inicio" && (
            <div className="bg-white p-6 rounded shadow w-full">
              <h1 className="text-xl font-semibold text-black">
                Bem-vindo ao MedNow!
              </h1>
              <p className="text-[#444444]">
                Acesse pacientes, visualize prescrições, registre entregas e
                configure alarmes.
              </p>
            </div>
          )}

          {/* ====== BUSCAR PACIENTE ====== */}
          {secaoAtiva === "buscar" && (
            <div className="bg-white p-6 rounded shadow h-full w-full">
              <h2 className="text-xl font-semibold text-black mb-5">
                Buscar Paciente
              </h2>

              <InputBusca
                valor={termoBusca}
                aoAlterar={setTermoBusca}
                placeholder="Digite o nome ou CPF"
              />

              {loading && <p>Carregando pacientes...</p>}
              {erro && <p className="text-red-500">{erro}</p>}

              <div className="grid gap-3 mt-4">
                {pacientesFiltrados.map((p) => (
                  <CardPaciente
                    key={p.id}
                    nome={p.nome}
                    cpf={p.cpf}
                    onVerHistorico={() => carregarPrescricoesPaciente(p)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ====== LISTAGEM DE PRESCRIÇÕES ====== */}
          {secaoAtiva === "prescricoes" && pacienteSelecionado && (
            <div className="bg-white p-6 rounded shadow w-full h-full flex flex-col">
              <h1 className="text-xl font-semibold text-black mb-2">
                Prescrições
              </h1>

              <p className="text-[#444444]">
                <strong className="text-black">Paciente:</strong>{" "}
                {pacienteSelecionado.nome}
              </p>
              <p className="text-[#444444]">
                <strong className="text-black">CPF:</strong>{" "}
                {pacienteSelecionado.cpf}
              </p>

              {/* LISTA */}
              <div className="flex-1 overflow-y-auto mt-4">
                {loading && <p>Carregando prescrições...</p>}
                {erro && <p className="text-red-500">{erro}</p>}
                {!loading && !erro && prescricoes.length === 0 && (
                  <NenhumAdicionado
                    icon={PrescricoesCinza}
                    message="Nenhuma prescrição encontrada"
                    message2=""
                  />
                )}

                {!loading && !erro && prescricoes.length > 0 && (
                  <div className="grid gap-3">
                    {prescricoes.map((p) => {
                      const temAlarme = p.alarmes && p.alarmes.length > 0;
                      const foiEntregue = p.entregas && p.entregas.length > 0;

                      return (
                        <CardPrescricao
                          key={p.id}
                          medicamento={p.medicamento}
                          data={new Date(p.criadoEm).toLocaleDateString()}
                          frequencia={p.frequencia}
                          entregue={!!foiEntregue}
                          alarme={!!temAlarme}
                          onVer={() => {
                            setPrescricaoVisualizada(p);
                            setSecaoAtiva("ver");
                          }}
                          onMarcarEntregue={
                            foiEntregue || entregandoId === p.id
                              ? undefined
                              : () => marcarComoEntregue(p.id)
                          }
                          onConfigurarAlarme={() => configurarAlarme(p.id)}
                        />
                      );
                    })}
                  </div>
                )}
              </div>

              {/* BOTÃO VOLTAR */}
              <div className="mt-3">
                <button
                  onClick={() => {
                    setPacienteSelecionado(null);
                    setSecaoAtiva("buscar");
                  }}
                  className="flex flex-row items-center gap-2 bg-gray-200 text-black rounded hover:bg-gray-300 px-5 py-1"
                >
                  <Image
                    src={Voltar}
                    alt="voltar"
                    className="w-[23px] h-[23px]"
                  />
                  <span className="text-[17px] font-medium">Voltar</span>
                </button>
              </div>
            </div>
          )}

          {/* ====== TELA DE DETALHES ====== */}
          {secaoAtiva === "ver" && prescricaoVisualizada && (
            <DetalhePrescricao
              pacienteNome={pacienteSelecionado?.nome || "Paciente"}
              medicoNome={prescricaoVisualizada.medico?.nome || ""}
              crmMedico={prescricaoVisualizada.medico?.crm || ""}
              medicamento={prescricaoVisualizada.medicamento}
              dosagem={prescricaoVisualizada.dosagem || "N/A"}
              frequencia={prescricaoVisualizada.frequencia}
              duracao={prescricaoVisualizada.duracao || "N/A"}
              observacoes={prescricaoVisualizada.observacoes || ""}
              tipoMedicamento={prescricaoVisualizada.tipoMedicamento || "comum"}
              criadoEm={new Date(
                prescricaoVisualizada.criadoEm
              ).toLocaleDateString()}
              perfilUsuario="farmaceutico"
              onVoltar={() => setSecaoAtiva("prescricoes")}
            />
          )}
        </main>
      </div>

      {/* ====== MODAL DE ALARME ====== */}
      <ModalAlarmeFarmaceutico
        aberto={modalAberto}
        onFechar={() => {
          setModalAberto(false);
          setPrescricaoSelecionada(null);
        }}
        onConfirmar={async ({
          horarioInicial,
          frequenciaDiaria,
          duracaoDias,
        }) => {
          if (!prescricaoSelecionada) return;

          try {
            const token = localStorage.getItem("token");
            const criadoPorId = localStorage.getItem("usuarioId");

            const response = await fetch("/api/alarmes/criar", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                prescricaoId: prescricaoSelecionada,
                criadoPorId,
                horarioInicial,
                frequenciaDiaria,
                duracaoDias,
              }),
            });

            const data = await response.json();
            if (!response.ok)
              throw new Error(data.error || "Erro ao criar alarme.");

            if (pacienteSelecionado)
              carregarPrescricoesPaciente(pacienteSelecionado);
          } catch (err) {
            console.error("Erro ao criar alarme:", err);
            setErro("Erro ao criar alarme.");
          } finally {
            setModalAberto(false);
            setPrescricaoSelecionada(null);
          }
        }}
      />
    </div>
  );
}
