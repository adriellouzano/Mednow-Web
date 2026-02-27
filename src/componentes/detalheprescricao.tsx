"use client";

import Image from "next/image";
import Voltar from "@/imagens/voltar.svg";

interface DetalhePrescricaoProps {
  pacienteNome: string;
  medicamento: string;
  dosagem: string;
  frequencia: string;
  duracao: string;
  observacoes?: string;
  tipoMedicamento: string;
  criadoEm: string;
  medicoNome?: string;
  crmMedico?: string;
  perfilUsuario?: "medico" | "paciente" | "farmaceutico";
  onVoltar: () => void;
}

export default function DetalhePrescricao({
  pacienteNome,
  medicamento,
  dosagem,
  frequencia,
  duracao,
  observacoes,
  tipoMedicamento,
  criadoEm,
  medicoNome,
  crmMedico,
  perfilUsuario,
  onVoltar,
}: DetalhePrescricaoProps) {
  return (
    <div className="bg-white p-6 rounded shadow space-y-3 w-full">
      <h2 className="text-xl font-semibold text-[#000000] mb-4">
        Detalhes da Prescrição
      </h2>

      <div className="flex flex-col gap-10">
        {/* Bloco do paciente e médico */}
        <div className="flex flex-col gap-1">
          <p>
            <strong className="text-[#000000]">Paciente:</strong> {pacienteNome}
          </p>

          {(perfilUsuario === "medico" ||
            perfilUsuario === "paciente" ||
            perfilUsuario === "farmaceutico") && (
            <>
              {medicoNome && (
                <p>
                  <strong className="text-[#000000]">Nome do Médico:</strong>{" "}
                  {medicoNome}
                </p>
              )}

              {crmMedico && (
                <p>
                  <strong className="text-[#000000]">CRM do Médico:</strong>{" "}
                  {crmMedico}
                </p>
              )}
            </>
          )}
        </div>

        {/* Bloco das informações da prescrição */}
        <div className="flex flex-col gap-2 border border-[#99a1af] rounded p-4">
          <p>
            <strong>Medicamento:</strong> {medicamento}
          </p>
          <p>
            <strong>Dosagem:</strong> {dosagem}
          </p>
          <p>
            <strong>Frequência:</strong> {frequencia}
          </p>
          <p>
            <strong>Duração:</strong> {duracao}
          </p>
          <p>
            <strong>Tipo de Medicamento:</strong> {tipoMedicamento}
          </p>
          <p>
            <strong>Data da Prescrição:</strong> {criadoEm}
          </p>

          {observacoes && (
            <p>
              <strong>Observações:</strong> {observacoes}
            </p>
          )}
        </div>
      </div>

      {/* Botão voltar */}
      <div className="flex w-full sm:w-auto justify-start mt-4">
        <button
          onClick={onVoltar}
          className="flex flex-row items-center gap-2 bg-gray-200 text-[#000000] py-1 px-4 rounded hover:bg-gray-300"
        >
          <Image src={Voltar} className="h-[23px] w-[23px]" alt="voltar" />
          <span className="text-[17px] font-medium">Voltar</span>
        </button>
      </div>
    </div>
  );
}
