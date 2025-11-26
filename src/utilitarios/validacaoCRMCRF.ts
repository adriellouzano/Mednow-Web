/**
 * Valida se o CRM segue o formato 123456-SP.
 * Exemplo válido: 123456-SP
 * - Entre 4 e 6 dígitos
 * - Hífen
 * - Sigla do estado em letras maiúsculas
 */
export function validarCRM(crm: string): boolean {
  return /^\d{4,6}-[A-Z]{2}$/.test(crm)
}

/**
 * Valida se o CRF segue o formato 123456-SP.
 * Exemplo válido: 123456-SP
 * - Entre 4 e 6 dígitos
 * - Hífen
 * - Sigla do estado em letras maiúsculas
 */
export function validarCRF(crf: string): boolean {
  return /^\d{4,6}-[A-Z]{2}$/.test(crf)
}
