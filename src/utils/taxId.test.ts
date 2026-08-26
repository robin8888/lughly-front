/**
 * Qué vale como identificación, del lado del móvil.
 *
 * Espejo de la regla del servidor. Lo que se ata es que **cada clase se valide
 * con la suya**: el pasaporte se acepta a ciegas —no se puede comprobar— sin
 * que eso abra la puerta a un NIF mal escrito, porque a un NIF se le sigue
 * aplicando su cuenta.
 */

import { isValidTaxIdOfKind } from './taxId'

describe('isValidTaxIdOfKind', () => {
  it('DNI y NIF son el mismo número y se validan igual', () => {
    expect(isValidTaxIdOfKind('DNI', '12345678Z')).toBe(true)
    expect(isValidTaxIdOfKind('NIF', '12345678Z')).toBe(true)

    expect(isValidTaxIdOfKind('DNI', '12345678A')).toBe(false)
    expect(isValidTaxIdOfKind('NIF', '12345678A')).toBe(false)
  })

  it('el NIE lleva su propia cuenta', () => {
    expect(isValidTaxIdOfKind('NIE', 'X1234567L')).toBe(true)
    expect(isValidTaxIdOfKind('NIE', 'X1234567A')).toBe(false)
    // Un DNI no es un NIE, aunque los dos sean de persona
    expect(isValidTaxIdOfKind('NIE', '12345678Z')).toBe(false)
  })

  it('el CIF es de sociedad y no cuela como persona', () => {
    expect(isValidTaxIdOfKind('CIF', 'B23456783')).toBe(true)
    expect(isValidTaxIdOfKind('DNI', 'B23456783')).toBe(false)
  })

  it('el pasaporte se acepta a ciegas, pero no cualquier cosa', () => {
    expect(isValidTaxIdOfKind('PASSPORT', 'ABC123456')).toBe(true)
    expect(isValidTaxIdOfKind('PASSPORT', '12')).toBe(false)
    expect(isValidTaxIdOfKind('PASSPORT', 'AB-12')).toBe(false)
  })

  it('no distingue mayúsculas ni espacios de más', () => {
    expect(isValidTaxIdOfKind('DNI', '  12345678z  ')).toBe(true)
  })

  /**
   * El motivo de preguntar la clase: un NIF roto **declarado como NIF** se
   * rechaza. Antes, al adivinar, dejaba de parecer un NIF y entraba por la
   * puerta del pasaporte sin que nadie mirase nada.
   */
  it('un NIF roto declarado como NIF se rechaza', () => {
    expect(isValidTaxIdOfKind('NIF', '1234567Z')).toBe(false)
  })
})
