import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashSenha } from "../../../../utilitarios/criptografia";
import { validarCPF } from "../../../../utilitarios/validacaoCPF";

/**
 * Rota POST para cadastrar usuário e perfil.
 * Regras:
 * - O CPF é único para todo usuário.
 * - 1 CPF → 1 senha.
 * - Usuário existente só pode ganhar novos perfis.
 * - Nome/email/senha NÃO podem ser alterados por aqui.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nome, cpf, email, senha, perfil, crm, crf } = body;

    // ====== Validação de CPF ======
    if (!validarCPF(cpf)) {
      return NextResponse.json({ error: "CPF inválido." }, { status: 400 });
    }

    // ====== Validações específicas por perfil ======
    if (!perfil) {
      return NextResponse.json(
        { error: "Perfil é obrigatório." },
        { status: 400 }
      );
    }

    if (perfil === "medico" && !crm) {
      return NextResponse.json(
        { error: "CRM é obrigatório para médicos." },
        { status: 400 }
      );
    }

    if (perfil === "farmaceutico" && !crf) {
      return NextResponse.json(
        { error: "CRF é obrigatório para farmacêuticos." },
        { status: 400 }
      );
    }

    // ====== Verifica se já existe usuário com esse CPF ======
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { cpf },
      include: { perfis: true },
    });

    // ============================================================
    // 1) SE O USUÁRIO NÃO EXISTE → cria o usuário e o primeiro perfil
    // ============================================================
    if (!usuarioExistente) {
      // senha é obrigatória apenas aqui
      if (!senha) {
        return NextResponse.json(
          { error: "Senha é obrigatória para novo usuário." },
          { status: 400 }
        );
      }

      const senhaCriptografada = await hashSenha(senha);

      const usuarioCriado = await prisma.usuario.create({
        data: {
          nome,
          cpf,
          email,
          senhaHash: senhaCriptografada,
          perfis: {
            create: {
              tipo: perfil,
              crm: perfil === "medico" ? crm : null,
              crf: perfil === "farmaceutico" ? crf : null,
              aprovado: perfil === "paciente" ? true : false,
              pendenteAprovacao: perfil === "paciente" ? false : true,
            },
          },
        },
      });

      return NextResponse.json({
        message: "Usuário cadastrado com sucesso.",
        usuario: {
          id: usuarioCriado.id,
          nome: usuarioCriado.nome,
          cpf: usuarioCriado.cpf,
        },
      });
    }

    // ============================================================
    // 2) SE O USUÁRIO JÁ EXISTE → NÃO alterar nome, email ou senha
    // ============================================================

    // verifica duplicidade de perfil
    const perfilExistente = usuarioExistente.perfis.find(
      (p) => p.tipo === perfil
    );

    if (perfilExistente) {
      if (perfilExistente.aprovado) {
        return NextResponse.json(
          { error: `Este CPF já possui o perfil ${perfil}.` },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          error: `Este CPF já possui o perfil ${perfil} pendente de aprovação.`,
        },
        { status: 400 }
      );
    }

    // ============================================================
    // 3) Criar novo perfil para o usuário já existente
    // ============================================================
    const novoPerfil = await prisma.perfilUsuario.create({
      data: {
        usuarioId: usuarioExistente.id,
        tipo: perfil,
        crm: perfil === "medico" ? crm : null,
        crf: perfil === "farmaceutico" ? crf : null,
        aprovado: perfil === "paciente" ? true : false,
        pendenteAprovacao: perfil === "paciente" ? false : true,
      },
    });

    return NextResponse.json({
      message: `Perfil ${perfil} cadastrado com sucesso.`,
      perfil: {
        id: novoPerfil.id,
        tipo: novoPerfil.tipo,
        aprovado: novoPerfil.aprovado,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro interno ao cadastrar usuário." },
      { status: 500 }
    );
  }
}
