/**
 * La dirección, con las piezas que se piden en España.
 *
 * El buscador de direcciones devuelve una línea normalizada y unas
 * coordenadas —«Calle Mayor, Madrid»— y con eso se llega al portal. Lo que no
 * trae, y es justo lo que hace falta para llamar al timbre, son **el número,
 * la escalera, el piso y la puerta**. Antes se pedían en un solo campo de
 * texto libre, «Piso, puerta, escalera… (opcional)», y eso tiene dos
 * problemas: se rellena como cada uno quiere —«3B», «3º B», «tercero
 * derecha»— y el número, que **no** es opcional, se colaba dentro o no se
 * ponía.
 *
 * Los campos son los de cualquier formulario español —vía, número, bloque o
 * escalera, piso, puerta y código postal— sin la provincia, que aquí no hace
 * falta: quien va ya tiene el punto en el mapa.
 */

import type { ApiGeocodeMatch } from '@/api/geocode.api'

export interface AddressDetail {
  /** El número de la calle. **No es opcional**: sin él no hay portal. */
  number: string
  /** Escalera o bloque, en los edificios que los tienen */
  stair: string
  /** La planta: "3", "bajo", "entresuelo" */
  floor: string
  /** La puerta: "B", "izq.", "2" */
  door: string
  /** Cinco dígitos. Lo rellena la sugerencia elegida casi siempre. */
  postcode: string
}

export const EMPTY_ADDRESS_DETAIL: AddressDetail = {
  number: '',
  stair: '',
  floor: '',
  door: '',
  postcode: '',
}

/** Un código postal español: cinco dígitos, y los dos primeros son provincia */
export function isPostcode(value: string): boolean {
  return /^\d{5}$/.test(value.trim())
}

/**
 * El número que ya venga dentro de la dirección elegida.
 *
 * Quien escribe «Calle Mayor 14» y elige la sugerencia ya ha dicho el número:
 * volvérselo a preguntar con el campo vacío al lado de una línea que lo lleva
 * dentro parece que la app no ha leído lo que acaba de elegir.
 *
 * Se busca un número suelto **antes de la primera coma**, que es donde va en
 * las direcciones que devuelve el geocodificador. Después de la coma vienen la
 * ciudad y el código postal, y esos también son números.
 */
export function numberFromLabel(label: string): string {
  const street = label.split(',')[0] ?? ''
  const found = street.match(/\b(\d+[A-Za-z]?)\b/)

  return found?.[1] ?? ''
}

/**
 * La dirección entera en una línea, como se escribe en España.
 *
 * «Calle Mayor 14, esc. B, 3º izq., 28013 Madrid». Es lo que lee la persona
 * que va a presentarse allí, así que va seguido y se puede copiar al navegador
 * del coche.
 *
 * El número no se repite si la dirección elegida ya lo trae: el
 * geocodificador devuelve unas veces «Calle Mayor 14» y otras «Calle Mayor», y
 * escribir «Calle Mayor 14, 14» por si acaso es peor que las dos.
 */
export function composeAddressLine(
  match: Pick<ApiGeocodeMatch, 'label' | 'city'>,
  detail: AddressDetail,
): string {
  const number = detail.number.trim()
  const street = match.label.split(',')[0]?.trim() ?? match.label.trim()
  const rest = match.label.slice(street.length).replace(/^,\s*/, '').trim()

  const head =
    number === '' || numberFromLabel(match.label) === number
      ? street
      : `${street} ${number}`

  const parts = [
    head,
    detail.stair.trim() === '' ? null : `esc. ${detail.stair.trim()}`,
    floorAndDoor(detail),
  ].filter((part): part is string => part !== null && part !== '')

  /*
    El código postal y la ciudad al final, juntos y en ese orden, como en un
    sobre. La ciudad sale de la dirección elegida cuando la trae; si no, de lo
    que quede de la línea después de la calle.
  */
  const tail = [detail.postcode.trim(), match.city?.trim() ?? rest]
    .filter((part) => part !== '')
    .join(' ')

  return [parts.join(', '), tail].filter((part) => part !== '').join(', ')
}

/** «3º izq.», «3º», «izq.» o nada: las dos piezas van juntas o no van */
function floorAndDoor(detail: AddressDetail): string {
  const floor = detail.floor.trim()
  const door = detail.door.trim()

  /*
    El «º» solo si la planta es un número: «bajo º» no lo escribe nadie, y
    entresuelo y ático tampoco lo llevan.
  */
  const planta = floor === '' ? '' : /^\d+$/.test(floor) ? `${floor}º` : floor

  return [planta, door].filter((part) => part !== '').join(' ')
}
