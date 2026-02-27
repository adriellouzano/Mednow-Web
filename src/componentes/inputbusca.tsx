"use client";

import { ChangeEvent } from "react";

export default function InputBusca({
  valor,
  aoAlterar,
  placeholder = "Buscar...",
}: {
  valor: string;
  aoAlterar: (novo: string) => void;
  placeholder?: string;
}) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    aoAlterar(e.target.value);
  };

  return (
    <input
      type="text"
      value={valor}
      onChange={handleChange}
      placeholder={placeholder}
      className="w-full px-3 py-2 border border-[#99a1af] rounded 
                 focus:outline-none focus:ring-2 focus:ring-[#75A9FF] 
                 focus:border-transparent transition-colors"
    />
  );
}
