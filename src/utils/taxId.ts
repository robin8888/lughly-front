/**
 * Qué vale como identificación fiscal.
 *
 * Espejo de `lughly-backend/src/common/spanish-tax-id.ts`. La verdad está allí
 * —el servidor rechaza igual lo que no cuadre—, y esto existe para no dejar
 * pulsar un botón que va a fallar.
 *
 * Estaba copiado a mano en dos pantallas con la misma expresión regular, y las
 * dos se quedaron cortas a la vez cuando hubo que admitir el pasaporte.
 *
 * ## La clase se pregunta, no se adivina
 *
 * Un pasaporte **no se puede comprobar**: no lleva dígito de control y cada
 * país numera a su manera. Deducir la clase de la forma del número obligaba a
 * aceptar como pasaporte todo lo que no encajara en las formas españolas —un
 * NIF con una cifra de menos, por ejemplo—, así que se pregunta y cada uno se
 * valida con su regla. El pasaporte es el único que se acepta a ciegas.
 */

/** Las letras del DNI, en el orden en que las reparte el resto de dividir */
const DNI_LETTERS = 'TRWAGMYFPDXBNJZSQVHLCKE'

/** Un pasaporte: lo único que se puede mirar es que tenga forma razonable */
const PASSPORT = /^[A-Z0-9]{5,20}$/

function isValidDni(value: string): boolean {
  if (!/^[0-9]{8}[A-Z]$/.test(value)) return false

  return DNI_LETTERS[Number(value.slice(0, 8)) % 23] === value[8]
}

function isValidNie(value: string): boolean {
  if (!/^[XYZ][0-9]{7}[A-Z]$/.test(value)) return false

  /* La inicial se sustituye por su cifra y el resto es un DNI normal */
  const numero = `${'XYZ'.indexOf(value[0]!)}${value.slice(1, 8)}`

  return DNI_LETTERS[Number(numero) % 23] === value[8]
}

function isValidCif(value: string): boolean {
  if (!/^[A-HJ-NP-SUVW][0-9]{7}[0-9A-J]$/.test(value)) return false

  const digitos = value.slice(1, 8)
  let pares = 0
  let impares = 0

  for (let i = 0; i < 7; i += 1) {
    const cifra = Number(digitos[i])

    if (i % 2 === 1) {
      pares += cifra
    } else {
      const doble = cifra * 2
      impares += Math.floor(doble / 10) + (doble % 10)
    }
  }

  const control = (10 - ((pares + impares) % 10)) % 10
  const ultimo = value[8]!

  return ultimo === String(control) || ultimo === 'JABCDEFGHI'[control]
}

/**
 * Con qué documento dice identificarse quien lo escribe.
 *
 * `DNI` y `NIF` son **el mismo número** —el NIF de una persona física es su
 * DNI con la letra— y se validan igual. Están los dos porque es como los llama
 * la gente, y obligar a elegir el nombre "correcto" es hacer dudar sobre un
 * dato que ya se tiene delante.
 */
export type TaxIdKind = 'DNI' | 'NIF' | 'NIE' | 'PASSPORT' | 'CIF'

/** Cómo se llama cada uno, para rótulos y mensajes */
export const TAX_ID_LABELS: Record<TaxIdKind, string> = {
  DNI: 'DNI',
  NIF: 'NIF',
  NIE: 'NIE',
  PASSPORT: 'Pasaporte',
  CIF: 'CIF',
}

/** Lo que se pone de ejemplo en cada caso */
export const TAX_ID_PLACEHOLDERS: Record<TaxIdKind, string> = {
  DNI: '12345678Z',
  NIF: '12345678Z',
  NIE: 'X1234567L',
  PASSPORT: 'ABC123456',
  CIF: 'B12345678',
}

/** Valida el identificador con la regla de **su** clase, no adivinando cuál es */
export function isValidTaxIdOfKind(kind: TaxIdKind, value: string): boolean {
  const clean = value.trim().toUpperCase()

  switch (kind) {
    case 'DNI':
    case 'NIF':
      return isValidDni(clean)
    case 'NIE':
      return isValidNie(clean)
    case 'CIF':
      return isValidCif(clean)
    case 'PASSPORT':
      return PASSPORT.test(clean)
  }
}
