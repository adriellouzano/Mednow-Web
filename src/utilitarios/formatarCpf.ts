/**
 * Formata o CPF automaticamente com pontos e traço.
 * Ex.: 12345678909 -> 123.456.789-09
 */
export function formatarCpf(valor: string): string {
  // Remove tudo que não for dígito
  const cpfLimpo = valor.replace(/\D/g, "")
  // Aplica a máscara conforme digita
  return cpfLimpo
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
}
