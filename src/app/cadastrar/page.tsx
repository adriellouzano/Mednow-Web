"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { validarCRM, validarCRF } from "../../utilitarios/validacaoCRMCRF";
import { formatarCpf } from "../../utilitarios/formatarCpf";
import Logo2 from "@/imagens/logo2.svg";

type PerfilResponse = {
  tipo: string;
  crm?: string | null;
  crf?: string | null;
  aprovado?: boolean | null;
  pendenteAprovacao?: boolean | null;
};

export default function CadastroPage() {
  const router = useRouter();

  // ========= Estados =========
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const [crm, setCrm] = useState("");
  const [crf, setCrf] = useState("");

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [loading, setLoading] = useState(false);
  const [tentouEnviar, setTentouEnviar] = useState(false);

  const [perfilSelecionado, setPerfilSelecionado] =
    useState<string>("paciente");

  const [cpfExiste, setCpfExiste] = useState(false);
  const [perfisExistentes, setPerfisExistentes] = useState<string[]>([]);
  const [perfisDisponiveis, setPerfisDisponiveis] = useState<string[]>([
    "paciente",
    "medico",
    "farmaceutico",
  ]);

  const [cpfInvalido, setCpfInvalido] = useState(false);
  const [crmInvalido, setCrmInvalido] = useState(false);
  const [crfInvalido, setCrfInvalido] = useState(false);

  // ============================================
  // CONSULTA AUTOMÁTICA DO CPF
  // ============================================
  useEffect(() => {
    const cpfLimpo = cpf.replace(/[^\d]/g, "");

    if (cpfLimpo.length !== 11) {
      // RESET TOTAL AO APAGAR/MUDAR CPF
      setCpfExiste(false);
      setNome("");
      setEmail("");
      setSenha("");
      setCrm("");
      setCrf("");
      setPerfisExistentes([]);
      setPerfisDisponiveis(["paciente", "medico", "farmaceutico"]);
      return;
    }

    async function buscarCPF() {
      try {
        const resp = await fetch(`/api/usuarios/consultar-cpf?cpf=${cpfLimpo}`);

        const data = await resp.json();

        if (!data.existe) {
          // CPF novo → liberar tudo
          setCpfExiste(false);
          setNome("");
          setEmail("");
          setSenha("");
          setCrm("");
          setCrf("");
          setPerfisExistentes([]);
          setPerfisDisponiveis(["paciente", "medico", "farmaceutico"]);
          return;
        }

        // CPF EXISTE → preencher infos e travar
        setCpfExiste(true);
        setNome(data.usuario.nome);
        setEmail(data.usuario.email);

        const perfis = data.usuario.perfis.map((p: PerfilResponse) => p.tipo);
        setPerfisExistentes(perfis);

        // perfis que ainda podem ser criados
        const disponiveis = ["paciente", "medico", "farmaceutico"].filter(
          (p) => !perfis.includes(p),
        );

        setPerfisDisponiveis(disponiveis);

        // se perfil atual não está disponível, troca para o primeiro disponível
        if (!disponiveis.includes(perfilSelecionado)) {
          setPerfilSelecionado(disponiveis[0] || "");
        }
      } catch (err) {
        console.error(err);
      }
    }

    buscarCPF();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cpf]);

  // ============================================
  // SUBMISSÃO DO CADASTRO
  // ============================================
  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    setSucesso("");
    setTentouEnviar(true);
    setLoading(true);

    // Impede perfil duplicado
    if (perfisExistentes.includes(perfilSelecionado)) {
      setErro("Este CPF já possui esse perfil.");
      setLoading(false);
      return;
    }

    // validações
    if (perfilSelecionado === "medico") {
      if (!crm.trim()) {
        setErro("Informe o CRM.");
        setLoading(false);
        return;
      }
      if (!validarCRM(crm.trim())) {
        setErro("O CRM deve seguir o formato 123456-SP.");
        setLoading(false);
        return;
      }
    }

    if (perfilSelecionado === "farmaceutico") {
      if (!crf.trim()) {
        setErro("Informe o CRF.");
        setLoading(false);
        return;
      }
      if (!validarCRF(crf.trim())) {
        setErro("O CRF deve seguir o formato 123456-SP.");
        setLoading(false);
        return;
      }
    }

    try {
      const cpfLimpo = cpf.replace(/[^\d]/g, "");

      const response = await fetch("/api/usuarios/cadastrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome,
          cpf: cpfLimpo,
          email,
          senha: cpfExiste ? null : senha, // senha só se novo
          perfil: perfilSelecionado,
          crm: perfilSelecionado === "medico" ? crm : null,
          crf: perfilSelecionado === "farmaceutico" ? crf : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErro(data.error || "Erro ao cadastrar.");
        setLoading(false);
        return;
      }

      setSucesso("Cadastro realizado com sucesso!");
      setTimeout(() => router.push("/login"), 2000);
    } catch (error) {
      console.error(error);
      setErro("Erro inesperado.");
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // HELPERS DE ERRO VISUAL
  // ============================================
  const nomeComErro = tentouEnviar && !nome.trim();
  const emailComErro = tentouEnviar && !email.trim();
  const senhaComErro = tentouEnviar && !cpfExiste && !senha.trim();
  const cpfLimpoLen = cpf.replace(/[^\d]/g, "").length;
  const cpfComErro =
    cpfInvalido || (tentouEnviar && cpfLimpoLen !== 11 && cpfLimpoLen !== 0);

  const crmComErro =
    perfilSelecionado === "medico" &&
    (crmInvalido || (tentouEnviar && !crm.trim()));

  const crfComErro =
    perfilSelecionado === "farmaceutico" &&
    (crfInvalido || (tentouEnviar && !crf.trim()));

  return (
    <main className="min-h-[calc(100vh-100px)] w-full bg-[#F0F0F5] p-4 flex items-center justify-center">
      <div className="h-auto w-full max-w-xl bg-[#FFF] rounded shadow relative">
        <h2 className="text-2xl text-center font-medium p-6">
          <span className="text-[#000000]">Faça seu</span>{" "}
          <span className="text-[#0060B1]">Cadastro</span>
        </h2>

        {/* Banner verde quando CPF já existe */}
        {cpfExiste && (
          <div className="mx-6 md:mx-10 mb-4 rounded border border-[#1A7F37] bg-[#D4F3D4] px-4 py-3 text-sm text-[#1A7F37]">
            <p className="font-semibold flex items-center gap-2">
              <span className="text-lg">✓</span>
              CPF encontrado!
            </p>
            <p className="mt-1">
              Os dados foram preenchidos automaticamente. Se não for você,
              altere o CPF.
            </p>
          </div>
        )}

        {/* Mensagem de erro geral (banner simples) */}
        {erro && (
          <div className="mx-6 md:mx-10 mb-2 rounded border border-red-500 bg-red-50 px-4 py-2 text-sm text-red-700">
            {erro}
          </div>
        )}

        {/* Mensagem de sucesso geral */}
        {sucesso && (
          <div className="mx-6 md:mx-10 mb-2 rounded border border-green-600 bg-green-50 px-4 py-2 text-sm text-green-700">
            {sucesso}
          </div>
        )}

        <form
          onSubmit={handleCadastro}
          className="flex flex-col gap-6 px-6 md:px-10 pb-8"
        >
          {/* DADOS PESSOAIS */}
          <div className="flex flex-col gap-3">
            {/* Nome */}
            <div className="flex flex-col">
              <label className="text-[#444444] text-[14px]">
                Nome Completo
              </label>
              <input
                type="text"
                value={nome}
                disabled={cpfExiste}
                onChange={(e) => setNome(e.target.value)}
                className={`w-full h-[49px] border px-4 text-xl rounded-[5px]
                           font-light disabled:bg-gray-200 focus:outline-none focus:ring-2 ${
                             nomeComErro
                               ? "border-red-500 focus:ring-red-400"
                               : "border-[#99a1af] focus:ring-[#75A9FF]"
                           }`}
                required
              />
            </div>

            {/* CPF */}
            <div className="flex flex-col">
              <label className="text-[#444444] text-[14px]">CPF</label>
              <input
                type="text"
                value={cpf}
                onChange={(e) => {
                  const novoCpf = formatarCpf(e.target.value);
                  setCpf(novoCpf);
                  const limpo = novoCpf.replace(/[^\d]/g, "");
                  setCpfInvalido(limpo.length > 0 && limpo.length !== 11);
                }}
                className={`w-full h-[49px] border px-4 text-xl rounded-[5px]
                           font-light focus:outline-none focus:ring-2 ${
                             cpfComErro
                               ? "border-red-500 focus:ring-red-400"
                               : "border-[#99a1af] focus:ring-[#75A9FF]"
                           }`}
                required
              />
              {cpfComErro && (
                <span className="text-xs text-red-500 mt-1">
                  Informe um CPF válido com 11 dígitos.
                </span>
              )}
            </div>

            {/* Email */}
            <div className="flex flex-col">
              <label className="text-[#444444] text-[14px]">Email</label>
              <input
                type="email"
                value={email}
                disabled={cpfExiste}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full h-[49px] border px-4 text-xl rounded-[5px]
                           font-light disabled:bg-gray-200 focus:outline-none focus:ring-2 ${
                             emailComErro
                               ? "border-red-500 focus:ring-red-400"
                               : "border-[#99a1af] focus:ring-[#75A9FF]"
                           }`}
                required
              />
            </div>

            {/* SENHA — só aparece se CPF for novo */}
            {!cpfExiste && (
              <div className="flex flex-col">
                <label className="text-[#444444] text-[14px]">Senha</label>
                <input
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className={`w-full h-[49px] border px-4 text-xl rounded-[5px]
                             font-light focus:outline-none focus:ring-2 ${
                               senhaComErro
                                 ? "border-red-500 focus:ring-red-400"
                                 : "border-[#99a1af] focus:ring-[#75A9FF]"
                             }`}
                  required
                />
              </div>
            )}
          </div>

          {/* SELEÇÃO DE PERFIL */}
          <div className="flex flex-col items-center">
            <label className="block mb-3 text-2xl text-[#000000] font-medium">
              Selecione um <span className="text-[#0060B1]">Perfil</span>
            </label>

            <div className="flex flex-wrap justify-center gap-2">
              {perfisDisponiveis.length === 0 && (
                <p className="text-red-600 text-lg">
                  Este CPF já possui todos os perfis.
                </p>
              )}

              {perfisDisponiveis.map((perfil) => (
                <button
                  key={perfil}
                  type="button"
                  onClick={() => setPerfilSelecionado(perfil)}
                  className={`px-9 py-2 rounded-[5px] text-lg font-medium border transition
                  ${
                    perfilSelecionado === perfil
                      ? "bg-[#0060B1] text-white border-blue-700 shadow-sm"
                      : "bg-white text-[#444444] border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  {perfil.charAt(0).toUpperCase() + perfil.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* CRM ou CRF */}
          <div className="h-[70px] flex items-center justify-center">
            {perfilSelecionado === "medico" && (
              <div className="w-full flex flex-col items-center">
                <input
                  type="text"
                  placeholder="CRM (Ex.: 123456-SP)"
                  value={crm}
                  onChange={(e) => {
                    const valor = e.target.value.toUpperCase();
                    setCrm(valor);
                    setCrmInvalido(valor.length > 0 && !validarCRM(valor));
                  }}
                  className={`w-full max-w-xs h-[49px] border px-4 text-xl rounded-[5px]
                           font-light focus:outline-none focus:ring-2 ${
                             crmComErro
                               ? "border-red-500 focus:ring-red-400"
                               : "border-[#99a1af] focus:ring-[#75A9FF]"
                           }`}
                  required
                />
                {crmComErro && (
                  <span className="text-xs text-red-500 mt-1">
                    O CRM deve seguir o formato 123456-SP.
                  </span>
                )}
              </div>
            )}

            {perfilSelecionado === "farmaceutico" && (
              <div className="w-full flex flex-col items-center">
                <input
                  type="text"
                  placeholder="CRF (Ex.: 123456-SP)"
                  value={crf}
                  onChange={(e) => {
                    const valor = e.target.value.toUpperCase();
                    setCrf(valor);
                    setCrfInvalido(valor.length > 0 && !validarCRF(valor));
                  }}
                  className={`w-full max-w-xs h-[49px] border px-4 text-xl rounded-[5px]
                           font-light focus:outline-none focus:ring-2 ${
                             crfComErro
                               ? "border-red-500 focus:ring-red-400"
                               : "border-[#99a1af] focus:ring-[#75A9FF]"
                           }`}
                  required
                />
                {crfComErro && (
                  <span className="text-xs text-red-500 mt-1">
                    O CRF deve seguir o formato 123456-SP.
                  </span>
                )}
              </div>
            )}
          </div>

          {/* BOTÃO */}
          <div className="flex flex-col items-center">
            <button
              type="submit"
              disabled={loading || perfisDisponiveis.length === 0}
              className={`w-[200px] h-[51px] flex items-center justify-center rounded-[5px] text-xl font-light ${
                loading || perfisDisponiveis.length === 0
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-[#0060B1] text-white hover:bg-[#004d8e]"
              }`}
            >
              {loading ? (
                <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Cadastrar"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Ícone decorativo */}
      <Image
        className="hidden lg:block absolute w-[114px] h-[135px] bottom-20 right-20"
        alt="MedNow Logo"
        src={Logo2}
      />
    </main>
  );
}
