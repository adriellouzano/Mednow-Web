"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";

import Usuario from "@/imagens/Usuario.svg";
import Logo2 from "@/imagens/logo2.svg";
import Home from "@/imagens/home.svg";
import Lupa from "@/imagens/Lupa.svg";
import Prescricoes from "@/imagens/prescricoes.svg";
import Assinador from "@/imagens/assinadorDigital.svg";
import Line from "@/imagens/line-5.svg";
import Historico from "@/imagens/historico.svg";

interface SidebarProps {
  perfil: "medico" | "farmaceutico" | "paciente" | "admin";
  onNavigate?: (secao: string) => void;
}

/**
 * Componente Sidebar.
 * Tecnologias: Next.js (App Router), Tailwind CSS.
 * Por que existe:
 *  Exibir a navegação lateral do painel,
 *  adaptando os itens conforme o perfil ativo.
 */
export default function Sidebar({ perfil, onNavigate }: SidebarProps) {
  const router = useRouter();

  const [nomeUsuario, setNomeUsuario] = useState("");
  const [perfilUsuario, setPerfilUsuario] = useState("");

  // Carrega dados do usuário logado
  useEffect(() => {
    async function carregarDadosUsuario() {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("/api/usuarios/logado", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (response.ok) {
          setNomeUsuario(data.nome);
          setPerfilUsuario(data.perfil);
        }
      } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error);
      }
    }

    carregarDadosUsuario();
  }, []);

  // SPA ou navegação normal
  const navegar = (path: string) => {
    if (onNavigate) onNavigate(path);
    else router.push(path);
  };

  // Itens do menu por perfil
  const itensMenu = () => {
    switch (perfil) {
      case "medico":
        return [
          { label: "Início", path: "inicio", icon: Home },
          { label: "Buscar Paciente", path: "buscar", icon: Lupa },
          { label: "Minhas Prescrições", path: "prescricoes", icon: Prescricoes },
        ];
      case "farmaceutico":
        return [
          { label: "Início", path: "inicio", icon: Home },
          { label: "Buscar Paciente", path: "buscar", icon: Lupa },
        ];
      case "paciente":
        return [
          { label: "Início", path: "inicio", icon: Home },
          { label: "Minhas Prescrições", path: "prescricoes", icon: Prescricoes },
        ];
      case "admin":
        return [
          { label: "Início", path: "inicio", icon: Home },
          { label: "Perfis Pendentes", path: "pendentes", icon: Assinador },
          { label: "Perfis Aprovados", path: "aprovados", icon: Historico },
        ];
      default:
        return [];
    }
  };

  return (
    <aside className="flex flex-col w-full lg:w-[338px] lg:min-h-[calc(100vh-100px)] bg-white shadow lg:flex-shrink-0">

      {/* Área superior com avatar + nome */}
      <div className="flex flex-row items-center py-4 ">
        <div className="flex flex-row ml-4 gap-3">
          <div className="w-13 h-13 bg-blue-100 rounded-full flex items-center justify-center text-[#0060B1] font-semibold mt-3">
            <Image className="w-[30px] h-[35px]" src={Usuario} alt="usuario" />
          </div>

          <div className="flex flex-col justify-center">
            <span className="mt-3 text-xl font-bold text-[#000000]">
              {nomeUsuario || "Usuário"}
            </span>

            <span className="text-xs font-medium text-[#444444] capitalize">
              {perfilUsuario}
            </span>
          </div>
        </div>
      </div>

      <Image className="bg-[#D9D9D9] h-[1px] mt-2" src={Line} alt="line" />

      {/* Menu lateral */}
      <nav className="flex-1 p-4 flex flex-col justify-between">

        <div>
          {itensMenu().map((item) => (
            <button
              key={item.path}
              onClick={() => navegar(item.path)}
              className="w-full h-[55px] rounded-[5px] border border-[#929292] bg-white hover:bg-gray-100/90 mb-[23px] flex items-center"
            >
              <Image
                src={item.icon}
                alt={`${item.label} icon`}
                className="w-[40px] h-[40px] ml-3"
              />

              <span className="ml-4 font-normal">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Logo inferior */}
        <div className="flex justify-center pb-4">
          <Image src={Logo2} alt="Logo2" />
        </div>
      </nav>
    </aside>
  );
}
