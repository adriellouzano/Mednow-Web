"use client";

import { ReactNode } from "react";
import clsx from "clsx";

export default function Botao({
  children,
  onClick,
  variante = "primario",
}: {
  children: ReactNode;
  onClick: () => void;
  variante?:
    | "prescricaoPaciente"
    | "entregueFarm"
    | "configAlarme"
    | "voltar"
    | "voltarPrescricao"
    | "primario"
    | "secundario"
    | "perigo";
}) {
  const classes = clsx(
    "px-5 py-1 rounded transition-colors font-medium whitespace-nowrap",
    {
      // ===== VARIANTES  =====

      "flex flex-row items-center justify-center gap-2 bg-[#C7EAFF] text-[#0060B1] hover:bg-[#AEDDFF]":
        variante === "prescricaoPaciente",

      "flex flex-row items-center justify-center gap-2 bg-[rgba(0,128,0,0.1)] text-[#008000] hover:bg-green-600/20":
        variante === "entregueFarm",

      "flex flex-row items-center justify-center gap-2 bg-[#FFC3C3] text-black/80 hover:bg-red-300":
        variante === "configAlarme",

      "flex flex-row items-center justify-center gap-2 bg-gray-200 text-black hover:bg-gray-300":
        variante === "voltar" || variante === "voltarPrescricao",

      // ===== VARIANTES =====

      "bg-[#0060B1] text-white hover:bg-[#004d8e]": variante === "primario",

      "bg-gray-200 text-gray-800 hover:bg-gray-300": variante === "secundario",

      "bg-red-100 text-red-600 hover:bg-red-200": variante === "perigo",
    },
  );

  return (
    <button onClick={onClick} className={classes}>
      {children}
    </button>
  );
}
