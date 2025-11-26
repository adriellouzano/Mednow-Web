"use client";

import { ChangeEvent } from "react";

/**
 * Componente InputBusca.
 * Tecnologias: Next.js (App Router), Tailwind CSS.
 * Por que existe:
 * Padronizar o campo de busca com estilo uniforme e feedback visual.
 */
export default function InputBusca({
  valor,
  aoAlterar,
  placeholder = "Buscar...",
}: {
  valor: string;
  aoAlterar: (novo: string) => void;
  placeholder?: string;
}) {
  /**
   * Atualiza o valor ao digitar.
   */
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    aoAlterar(e.target.value);
  };

  return (
    // 🔧 Aqui começa o container do input
    <input
      type="text"
      value={valor}
      onChange={handleChange}
      placeholder={placeholder}
      className="w-full px-3 py-2 border border-[#99a1af] rounded 
                 focus:outline-none focus:ring-2 focus:ring-[#75A9FF] 
                 focus:border-transparent transition-colors"
    />
    // 🔧 Aqui termina o container do input
  );
}
