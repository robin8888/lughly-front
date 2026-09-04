/**
 * Los dos órdenes de los oficios, que no son el mismo.
 *
 * El del carrusel de la home es una fila de dibujos que se mira, y manda lo
 * que más se busca (`HOME_MOBILE.md`, y el `sortOrder` del seed del backend).
 * El de los desplegables es una lista de diecinueve nombres que se lee, y ahí
 * el único orden en el que se encuentra algo es el del abecedario.
 *
 * Se atan los dos porque es fácil arreglar uno rompiendo el otro: son el mismo
 * array a dos pasos de distancia.
 */

import { TRADES, TRADE_OPTIONS } from './trades'

describe('Los oficios', () => {
  it('el carrusel conserva su orden, que está fijado fuera de aquí', () => {
    expect(TRADES.map((trade) => trade.slug).slice(0, 4)).toEqual([
      'reformas',
      'carpinteria',
      'electricidad',
      'fontaneria',
    ])
  })

  it('los desplegables van por orden alfabético', () => {
    const labels = TRADE_OPTIONS.map((option) => option.label)

    /* Sin "Otros oficios", que va aparte por lo que dice el apunte */
    const oficios = labels.filter((label) => label !== 'Otros oficios')

    expect(oficios).toEqual([...oficios].sort((a, b) => a.localeCompare(b, 'es')))
  })

  /** No es un oficio: es la salida de quien no encuentra el suyo */
  it('«Otros oficios» va el último, aunque le tocara por la O', () => {
    expect(TRADE_OPTIONS[TRADE_OPTIONS.length - 1]?.value).toBe('otros')
  })

  /**
   * Y están todos. Ordenar es reordenar, no filtrar: perder uno por el camino
   * lo deja fuera de los tres sitios donde se elige oficio —el directorio, la
   * urgencia y el alta de un trabajador— sin ningún aviso.
   */
  it('no se pierde ninguno al ordenar', () => {
    expect(TRADE_OPTIONS).toHaveLength(TRADES.length)

    expect(new Set(TRADE_OPTIONS.map((option) => option.value))).toEqual(
      new Set(TRADES.map((trade) => trade.slug)),
    )
  })
})
