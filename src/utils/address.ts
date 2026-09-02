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
 * Un número de portal: dígitos con una letra pegada como mucho («14», «14B»).
 */
const HOUSE_NUMBER = /^\d+[A-Za-z]?$/

/**
 * Las piezas de la dirección elegida, separadas.
 *
 * El geocodificador —Photon, vía `/v1/geocode`— arma la etiqueta uniendo con
 * comas **nombre, calle, número y ciudad**, así que «Calle Mayor 14, Madrid»
 * llega en realidad como `"Calle Mayor, 14, Madrid"`: el número es una pieza
 * suelta, no va pegado a la calle. Leerlo como texto corrido —buscando el
 * número antes de la primera coma— no encontraba nada y dejaba el campo del
 * número vacío después de haber elegido una sugerencia que lo traía.
 *
 * Se admiten las dos formas porque la inversa —la del GPS de una urgencia— y
 * otros proveedores sí lo pegan.
 */
function splitLabel(
  label: string,
  city: string | null,
): { street: string; number: string } {
  const parts = label
    .split(',')
    .map((part) => part.trim())
    .filter((part) => part !== '')

  /*
    La ciudad, fuera: se vuelve a escribir al final de la línea junto al código
    postal, y repetida en medio se lee como un error.
  */
  const withoutCity = parts.filter(
    (part) => city === null || part.toLowerCase() !== city.trim().toLowerCase(),
  )

  const number = withoutCity.find((part) => HOUSE_NUMBER.test(part))
  const street = withoutCity.filter((part) => !HOUSE_NUMBER.test(part)).join(', ')

  if (number !== undefined) return { street, number }

  // Y la otra forma: el número pegado al final de la calle, «Calle Mayor 14»
  const inline = street.match(/^(.*?)[\s,]+(\d+[A-Za-z]?)$/)

  return inline
    ? { street: inline[1]!.trim(), number: inline[2]! }
    : { street, number: '' }
}

/**
 * El número que ya venga dentro de la dirección elegida.
 *
 * Quien escribe «Calle Mayor 14» y elige la sugerencia ya ha dicho el número:
 * volvérselo a preguntar con el campo vacío al lado de una línea que lo lleva
 * dentro parece que la app no ha leído lo que acaba de elegir.
 */
export function numberFromLabel(label: string, city: string | null = null): string {
  return splitLabel(label, city).number
}

/**
 * La dirección entera en una línea, como se escribe en España.
 *
 * «Calle Mayor 14, esc. B, 3º izq., 28013 Madrid». Es lo que lee la persona
 * que va a presentarse allí, así que va seguido y se puede copiar al navegador
 * del coche.
 *
 * El número sale del campo, no de la etiqueta: si el cliente lo corrige —el
 * geocodificador acierta la calle y a veces no el portal— manda el suyo, y no
 * se escribe dos veces.
 */
export function composeAddressLine(
  match: Pick<ApiGeocodeMatch, 'label' | 'city'>,
  detail: AddressDetail,
): string {
  const { street, number: fromLabel } = splitLabel(match.label, match.city)
  const number = detail.number.trim() === '' ? fromLabel : detail.number.trim()

  const parts = [
    number === '' ? street : `${street} ${number}`,
    detail.stair.trim() === '' ? null : `esc. ${detail.stair.trim()}`,
    floorAndDoor(detail),
  ].filter((part): part is string => part !== null && part !== '')

  /*
    El código postal y la ciudad al final, juntos y en ese orden, como en un
    sobre.
  */
  const tail = [detail.postcode.trim(), match.city?.trim() ?? '']
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
