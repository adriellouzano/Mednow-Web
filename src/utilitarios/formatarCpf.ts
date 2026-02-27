export function formatarCpf(valor: string): string {
  const cpfLimpo = valor.replace(/\D/g, "");

  return cpfLimpo
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}
