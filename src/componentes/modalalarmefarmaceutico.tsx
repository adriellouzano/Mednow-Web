"use client";

import { useState } from "react";

interface ModalAlarmeFarmaceuticoProps {
  aberto: boolean;
  onFechar: () => void;
  onConfirmar: (dados: {
    horarioInicial: string;
    frequenciaDiaria: number;
    duracaoDias: number;
  }) => void;
}

export default function ModalAlarmeFarmaceutico({
  aberto,
  onFechar,
  onConfirmar,
}: ModalAlarmeFarmaceuticoProps) {
  const [horarioInicial, setHorarioInicial] = useState("");
  const [frequenciaDiaria, setFrequenciaDiaria] = useState("");
  const [duracaoDias, setDuracaoDias] = useState("");
  const [erro, setErro] = useState("");

  if (!aberto) return null;

  const handleSalvar = () => {
    setErro("");

    const regexHora = /^([01]\d|2[0-3]):[0-5]\d$/;
    if (!regexHora.test(horarioInicial)) {
      setErro("Informe o horário no formato 24h (ex: 08:00 ou 16:30).");
      return;
    }

    const freq = Number(frequenciaDiaria);
    const dur = Number(duracaoDias);

    if (isNaN(freq) || freq <= 0 || freq > 24) {
      setErro(
        "Frequência inválida. Digite o número de vezes por dia (1 a 24).",
      );
      return;
    }

    if (isNaN(dur) || dur <= 0 || dur > 30) {
      setErro("Duração inválida. Digite a quantidade de dias (1 a 30).");
      return;
    }

    onConfirmar({
      horarioInicial,
      frequenciaDiaria: freq,
      duracaoDias: dur,
    });

    onFechar();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-md space-y-4">
        <h2 className="text-xl font-semibold text-[#000000]">
          Configurar Notificação
        </h2>

        <p className="text-sm text-[#444444]">
          Informe os parâmetros da Notificação (formato 24 horas). <br />
          Exemplo: horário inicial 08:00, frequência 2 vezes ao dia, duração 3
          dias.
        </p>

        {erro && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
            {erro}
          </div>
        )}

        {/* Campo: Horário Inicial */}
        <div>
          <label className="block text-sm font-medium text-[#000000]">
            Horário inicial (24h)
          </label>
          <input
            type="text"
            value={horarioInicial}
            onChange={(e) => setHorarioInicial(e.target.value)}
            placeholder="Ex: 08:00"
            className="w-full border border-[#99a1af] px-3 py-2 rounded mt-1
                       focus:outline-none focus:ring-2 focus:ring-[#75A9FF] focus:border-transparent"
          />
        </div>

        {/* Campo: Frequência Diária */}
        <div>
          <label className="block text-sm font-medium text-[#000000]">
            Frequência (vezes ao dia)
          </label>
          <input
            type="number"
            min={1}
            max={24}
            value={frequenciaDiaria}
            onChange={(e) => setFrequenciaDiaria(e.target.value)}
            placeholder="Ex: 2"
            className="w-full border border-[#99a1af] px-3 py-2 rounded mt-1
                       focus:outline-none focus:ring-2 focus:ring-[#75A9FF] focus:border-transparent"
          />
        </div>

        {/* Campo: Duração em dias */}
        <div>
          <label className="block text-sm font-medium text-[#000000]">
            Duração (em dias)
          </label>
          <input
            type="number"
            min={1}
            max={30}
            value={duracaoDias}
            onChange={(e) => setDuracaoDias(e.target.value)}
            placeholder="Ex: 3"
            className="w-full border border-[#99a1af] px-3 py-2 rounded mt-1
                       focus:outline-none focus:ring-2 focus:ring-[#75A9FF] focus:border-transparent"
          />
        </div>

        {/* Botões */}
        <div className="flex justify-end gap-2 pt-3">
          <button
            onClick={onFechar}
            className="px-4 py-2 rounded bg-gray-200 text-[#000000] hover:bg-gray-300"
          >
            Cancelar
          </button>

          <button
            onClick={handleSalvar}
            className="px-4 py-2 rounded bg-[#0060B1] text-white hover:bg-[#004d8e]"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
