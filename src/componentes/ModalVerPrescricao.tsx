"use client";

import DetalhePrescricao from "@/componentes/detalheprescricao";

type Prescricao = {
  id: string;
  medicamento: string;
  dosagem?: string;
  frequencia: string;
  duracao?: string;
  tipoMedicamento?: string;
  criadoEm: string;
  observacoes?: string;
  medico?: { nome?: string; crm?: string };
};

interface ModalVerPrescricaoProps {
  aberto: boolean;
  prescricao: Prescricao | null;
  pacienteNome: string;
  onFechar: () => void;
}

export default function ModalVerPrescricao({
  aberto,
  prescricao,
  pacienteNome,
  onFechar,
}: ModalVerPrescricaoProps) {
  if (!aberto || !prescricao) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
        {/* Botão Fechar */}
        <button
          onClick={onFechar}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl"
        >
          ✖
        </button>

        {/* Corpo do Modal */}
        <DetalhePrescricao
          pacienteNome={pacienteNome}
          medicamento={prescricao.medicamento}
          dosagem={prescricao.dosagem || "-"}
          frequencia={prescricao.frequencia}
          duracao={prescricao.duracao || "-"}
          tipoMedicamento={prescricao.tipoMedicamento || "-"}
          criadoEm={new Date(prescricao.criadoEm).toLocaleDateString()}
          medicoNome={prescricao.medico?.nome || ""}
          crmMedico={prescricao.medico?.crm || ""}
          observacoes={prescricao.observacoes || ""}
          perfilUsuario="farmaceutico"
          onVoltar={onFechar}
        />
      </div>
    </div>
  );
}
