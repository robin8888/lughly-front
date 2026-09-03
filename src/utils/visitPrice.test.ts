/**
 * La cuenta de lo que cuesta una visita.
 *
 * Es un espejo de `visit-price.ts` del servidor, y por eso se prueba aquí
 * también con los mismos casos: si las dos cuentas discrepan, el cliente ve un
 * importe en el aviso y se le retiene otro. Los números de estos casos son los
 * mismos que los del test de allí, a propósito.
 */

import { visitPriceOf, visitPriceReason } from './visitPrice'

describe('visitPriceOf', () => {
  it('quien cobra por visita cobra su visita', () => {
    expect(visitPriceOf({ visitFee: 30, hourlyRate: null })).toBe(30)
  })

  /**
   * La mitad del directorio no tiene `visitFee`: es excluyente con
   * `hourlyRate`. Sin esta rama, pedirles presupuesto sería gratis.
   */
  it('quien cobra por horas cobra su suelo: la tarifa por el mínimo', () => {
    expect(visitPriceOf({ hourlyRate: 14, minHours: 2 })).toBe(28)
  })

  it('sin mínimo declarado, una hora', () => {
    expect(visitPriceOf({ hourlyRate: 14, minHours: null })).toBe(14)
  })

  /** Un cero significa lo mismo que el nulo, y multiplicar por él sería gratis */
  it('un mínimo a cero no deja la visita gratis', () => {
    expect(visitPriceOf({ hourlyRate: 14, minHours: 0 })).toBe(14)
  })

  it('redondea al céntimo, que es dinero', () => {
    expect(visitPriceOf({ hourlyRate: 13.33, minHours: 1.5 })).toBe(20)
  })

  it('sin ninguna tarifa no hay visita que vender', () => {
    expect(visitPriceOf({ hourlyRate: null, visitFee: null })).toBeNull()
    expect(visitPriceOf(undefined)).toBeNull()
    expect(visitPriceOf(null)).toBeNull()
  })
})

/**
 * El porqué es lo que evita que la cifra parezca inventada: quien cobra 14 € la
 * hora con mínimo de dos no entiende «visita 28 €» hasta que se le dice que son
 * sus dos horas mínimas.
 */
describe('visitPriceReason', () => {
  it('en quien cobra por visita, es su tarifa de desplazarse', () => {
    expect(visitPriceReason({ visitFee: 30 })).toMatch(/desplazarse/)
  })

  it('en quien cobra por horas, dice el mínimo con el que sale la cuenta', () => {
    expect(visitPriceReason({ hourlyRate: 14, minHours: 2 })).toContain('2 horas')
  })

  it('el mínimo de una hora se dice en singular', () => {
    expect(visitPriceReason({ hourlyRate: 14, minHours: 1 })).toContain('1 hora')
  })

  it('sin mínimo, es una hora suya', () => {
    expect(visitPriceReason({ hourlyRate: 14 })).toMatch(/una hora/)
  })

  it('sin precios no hay nada que explicar', () => {
    expect(visitPriceReason({ hourlyRate: null, visitFee: null })).toBeNull()
  })
})
