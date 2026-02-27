import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashSenha } from "../../../../utilitarios/criptografia";
import { validarCPF } from "../../../../utilitarios/validacaoCPF";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nome, cpf, email, senha, perfil, crm, crf } = body;

    if (!validarCPF(cpf)) {
      return NextResponse.json({ error: "CPF inválido." }, { status: 400 });
    }

    if (!perfil) {
      return NextResponse.json(
        { error: "Perfil é obrigatório." },
        { status: 400 },
      );
    }

    if (perfil === "medico" && !crm) {
      return NextResponse.json(
        { error: "CRM é obrigatório para médicos." },
        { status: 400 },
      );
    }

    if (perfil === "farmaceutico" && !crf) {
      return NextResponse.json(
        { error: "CRF é obrigatório para farmacêuticos." },
        { status: 400 },
      );
    }

    const usuarioExistente = await prisma.usuario.findUnique({
      where: { cpf },
      include: { perfis: true },
    });

    if (!usuarioExistente) {
      if (!senha) {
        return NextResponse.json(
          { error: "Senha é obrigatória para novo usuário." },
          { status: 400 },
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

    const perfilExistente = usuarioExistente.perfis.find(
      (p) => p.tipo === perfil,
    );

    if (perfilExistente) {
      if (perfilExistente.aprovado) {
        return NextResponse.json(
          { error: `Este CPF já possui o perfil ${perfil}.` },
          { status: 400 },
        );
      }

      return NextResponse.json(
        {
          error: `Este CPF já possui o perfil ${perfil} pendente de aprovação.`,
        },
        { status: 400 },
      );
    }
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
      { status: 500 },
    );
  }
}
