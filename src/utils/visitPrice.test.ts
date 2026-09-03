/**
 * Quién da presupuestos, y por cuánto.
 *
 * Es un espejo de `visit-price.ts` del servidor, y por eso se prueba aquí
 * también con los mismos casos: si las dos cuentas discrepan, el cliente ve un
 * importe en el aviso y se le retiene otro.
 */

import { quotableTradeOf, visitPriceOf } from './visitPrice'

describe('visitPriceOf', () => {
  it('quien tiene tarifa de visita da presupuestos, y cuesta eso', () => {
    expect(visitPriceOf({ visitFee: 30, hourlyRate: null })).toEqual({
      kind: 'fee',
      amount: 30,
    })
  })

  /**
   * La corrección del 3 de septiembre de 2026. Se intentó calcularle una
   * visita —`hourlyRate × minHours`— para que el camino cobrara; cobraba, pero
   * vendía algo que en ese oficio nadie ofrece. Quien cobra por horas no da
   * presupuestos: se le reservan las horas que hagan falta.
   */
  it('quien cobra por horas no da presupuestos', () => {
    expect(visitPriceOf({ visitFee: null, hourlyRate: 14 })).toEqual({ kind: 'hourly' })
  })

  /**
   * `hourly` y `none` acaban los dos en «no se puede pedir presupuesto», y aun
   * así son dos: al primero se le puede contratar por horas y al segundo no se
   * le puede contratar de ninguna forma. La ficha manda a cada uno a un sitio.
   */
  it('sin ninguna tarifa, no se le puede contratar por ese oficio', () => {
    expect(visitPriceOf({ visitFee: null, hourlyRate: null })).toEqual({ kind: 'none' })
    expect(visitPriceOf(undefined)).toEqual({ kind: 'none' })
    expect(visitPriceOf(null)).toEqual({ kind: 'none' })
  })
})

describe('quotableTradeOf', () => {
  const carta = { slug: 'cerrajeria', visitFee: 55 }
  const horas = { slug: 'limpieza', hourlyRate: 14 }

  it('prefiere el oficio que venía mirando, si presupuesta', () => {
    expect(quotableTradeOf([horas, carta], carta)).toBe(carta)
  })

  /**
   * Y si el que venía mirando cobra por horas, busca otro suyo que sí
   * presupueste: el botón tiene que aparecer siempre que se le pueda pedir algo
   * a esa persona, aunque no sea por el oficio que estaba abierto.
   */
  it('si el que venía mirando cobra por horas, busca otro que presupueste', () => {
    expect(quotableTradeOf([horas, carta], horas)).toBe(carta)
  })

  it('sin ninguno que presupueste, no hay oficio', () => {
    expect(quotableTradeOf([horas], horas)).toBeNull()
  })

  it('sin preferencia, el primero que presupueste', () => {
    expect(quotableTradeOf([horas, carta])).toBe(carta)
  })
})
