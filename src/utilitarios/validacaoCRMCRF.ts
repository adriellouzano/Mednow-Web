export function validarCRM(crm: string): boolean {
  return /^\d{4,6}-[A-Z]{2}$/.test(crm);
}

export function validarCRF(crf: string): boolean {
  return /^\d{4,6}-[A-Z]{2}$/.test(crf);
}
