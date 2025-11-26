/**
 * Valida se um CPF é estruturalmente válido.
 * Por que existe: evitar cadastro com CPF inválido (ex: dígito verificador errado).
 */
export function validarCPF(cpf: string): boolean {
  // Remove pontos e traços
  cpf = cpf.replace(/[^\d]+/g, "")

  // CPF tem que ter 11 dígitos
  if (cpf.length !== 11) return false

  // Rejeita CPFs com todos dígitos iguais
  if (/^(\d)\1+$/.test(cpf)) return false

  // Valida o primeiro dígito verificador
  let soma = 0
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf.charAt(i)) * (10 - i)
  }
  let resto = (soma * 10) % 11
  if (resto === 10 || resto === 11) resto = 0
  if (resto !== parseInt(cpf.charAt(9))) return false

  // Valida o segundo dígito verificador
  soma = 0
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf.charAt(i)) * (11 - i)
  }
  resto = (soma * 10) % 11
  if (resto === 10 || resto === 11) resto = 0
  if (resto !== parseInt(cpf.charAt(10))) return false

  return true
}
