"use client";

import Image from "next/image";
import Prescricoes from "@/imagens/prescricoes.svg";

interface CardHistoricoProps {
  medicamento: string;
  data: string;
  feitoPorMim?: boolean;
  onVerPrescricao: () => void;
}

export default function CardHistorico({
  medicamento,
  data,
  feitoPorMim = false,
  onVerPrescricao,
}: CardHistoricoProps) {
  return (
    <div
      className={`border p-4 rounded bg-white shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
        feitoPorMim ? "border-green-500" : "border-gray-300"
      }`}
    >
      {/* Informações */}
      <div className="flex flex-col gap-1">
        <p className="font-medium text-[#000000]">{medicamento}</p>
        <p className="text-sm text-[#444444]">Data: {data}</p>

        {feitoPorMim && (
          <span className="text-green-600 text-xs font-semibold">
            ✔ Prescrição feita por você
          </span>
        )}
      </div>

      {/* Botão */}
      <button
        onClick={onVerPrescricao}
        className="flex flex-row items-center justify-center px-4 py-2 rounded bg-[#C7EAFF] text-[#0060B1] hover:bg-[#AEDDFF] gap-2"
      >
        <Image
          className="w-[26px] h-[26px]"
          src={Prescricoes}
          alt="prescricao"
        />
        Ver Prescrição
      </button>
    </div>
  );
}
