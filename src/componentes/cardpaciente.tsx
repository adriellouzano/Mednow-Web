"use client";

import Image from "next/image";
import Pesprescricoes from "@/imagens/prescricoes.svg";
import Adicionar from "@/imagens/adicionar.svg";

interface CardPacienteProps {
  nome: string;
  cpf: string;
  onVerHistorico: () => void;
  onNovaPrescricao?: () => void;
  perfil?: "medico" | "farmaceutico" | "paciente";
}

export default function CardPaciente({
  nome,
  cpf,
  onVerHistorico,
  onNovaPrescricao,
  perfil = "medico",
}: CardPacienteProps) {
  return (
    <div className="border border-[#99a1af] p-4 rounded bg-white flex flex-col sm:flex-row sm:items-center gap-2">
      
      {/* Informações do paciente */}
      <div>
        <p className="font-medium text-[#000000]">{nome}</p>
        <p className="text-sm text-gray-600">CPF: {cpf}</p>
      </div>

      {/* Botões */}
      <div className="flex flex-col sm:flex-row gap-2 ml-auto">
        {/* Ver Histórico */}
        <button
          onClick={onVerHistorico}
          className="flex items-center justify-center rounded px-3 gap-2 bg-[#C7EAFF] text-[#0060B1] hover:bg-[#AEDDFF] h-[38px]"
        >
          <Image width={30} height={30} src={Pesprescricoes} alt="histórico" />
          <span className="font-medium whitespace-nowrap">Ver Histórico</span>
        </button>

        {/* Nova Prescrição */}
        {perfil === "medico" && onNovaPrescricao && (
          <button
            onClick={onNovaPrescricao}
            className="inline-flex items-center gap-1 px-3 h-[38px] bg-[#0060B1] text-white rounded hover:bg-[#004d8e] whitespace-nowrap"
          >
            <Image
              src={Adicionar}
              alt="nova prescrição"
              width={28}
              height={28}
              className="shrink-0"
            />
            <span className="font-medium">Nova Prescrição</span>
          </button>
        )}
      </div>

    </div>
  );
}
