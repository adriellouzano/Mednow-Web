"use client";

import Image from "next/image";
import Prescricoes from "@/imagens/prescricoes.svg";
import Check from "@/imagens/check-box.svg";
import Alarme from "@/imagens/alarme.svg";
import Botao from "./botao";

interface Props {
  medicamento: string;
  data: string;
  frequencia: string;
  onVer: () => void;
  onConfigurarAlarme?: () => void;
  onMarcarEntregue?: () => void;
  entregue?: boolean;
  alarme?: boolean;
}

export default function CardPrescricao({
  medicamento,
  data,
  frequencia,
  onVer,
  onConfigurarAlarme,
  onMarcarEntregue,
  entregue = false,
  alarme = false,
}: Props) {
  return (
    <div
      className={`w-full border border-[#99a1af] rounded p-4 space-y-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
        entregue
          ? "border-green-500"
          : alarme
          ? "bg-blue-50 border-blue-300"
          : "bg-white"
      }`}
    >
      {/* Informações principais */}
      <div className="flex-1 flex flex-col justify-between">
        <h2 className="text-lg font-semibold text-[#000000]">{medicamento}</h2>
        <p className="text-sm text-[#444444]">Data: {data}</p>
        <p className="text-sm text-[#444444]">Frequência: {frequencia}</p>

        <div className="mt-2">
          {entregue && (
            <p className="text-sm text-green-600 font-medium">
              📦 Prescrição Entregue
            </p>
          )}

          {alarme && (
            <p className="text-sm text-red-600 font-medium">
              ⏰ Notificação Configurada
            </p>
          )}
        </div>
      </div>

      {/* Botões */}
      <div className="flex flex-wrap justify-center sm:justify-end gap-2">
        <Botao variante="prescricaoPaciente" onClick={onVer}>
          <Image className="w-[28px] h-[28px]" src={Prescricoes} alt="ver" />
          Ver Prescrição
        </Botao>

        {onMarcarEntregue && !entregue && (
          <Botao variante="entregueFarm" onClick={onMarcarEntregue}>
            <Image className="w-[27px] h-[27px]" src={Check} alt="entregue" />
            Marcar como Entregue
          </Botao>
        )}

        {onConfigurarAlarme && (
          <Botao variante="configAlarme" onClick={onConfigurarAlarme}>
            <Image className="w-[27px] h-[27px]" src={Alarme} alt="alarme" />
            Configurar Notificação
          </Botao>
        )}
      </div>
    </div>
  );
}
