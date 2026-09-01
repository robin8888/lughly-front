/**
 * Cada cuánto sondea el chat, según lleguen o no los avisos.
 *
 * Es una decisión de producto escrita en código, y las dos mitades importan:
 *
 * - **Con avisos**, sondear cada cinco segundos es gastar batería para nada:
 *   el aviso ya invalida la conversación (`usePushInvalidation`) y el mensaje
 *   aparece en el momento.
 * - **Sin avisos** —permiso denegado, un emulador, un móvil sin servicios de
 *   notificación— el sondeo es lo único que hay, y ahí cinco segundos es lo
 *   que hace que una conversación se sienta viva.
 *
 * Lo que se ata es que no se confundan los dos casos. Un fallo aquí no rompe
 * nada visible: el chat va lento y nadie sabe por qué, o el móvil se calienta
 * y tampoco.
 */

import { act, renderHook } from '@testing-library/react-native'
import { usePushStore } from '@/stores/usePushStore'
import { usePollInterval } from './useChat'

const intervalo = (which: 'threads' | 'messages' | 'unread', pushActive: boolean) => {
  /* Dentro de `act`: cambiar el store repinta a quien lo esté leyendo */
  act(() => usePushStore.setState({ active: pushActive }))
  return renderHook(() => usePollInterval(which)).result.current
}

describe('el sondeo del chat', () => {
  afterEach(() => act(() => usePushStore.setState({ active: false })))

  describe('sin avisos, que entonces es lo único que hay', () => {
    it('los mensajes van cada cinco segundos', () => {
      expect(intervalo('messages', false)).toBe(5_000)
    })

    it('los hilos, cada veinte', () => {
      expect(intervalo('threads', false)).toBe(20_000)
    })

    it('y el no leído, cada treinta: es un número en un icono, no una pantalla', () => {
      expect(intervalo('unread', false)).toBe(30_000)
    })
  })

  describe('con avisos, el sondeo pasa a ser solo una red', () => {
    it('los mensajes bajan a veinte segundos', () => {
      expect(intervalo('messages', true)).toBe(20_000)
    })

    it('los hilos, a un minuto', () => {
      expect(intervalo('threads', true)).toBe(60_000)
    })

    it('y el no leído, a dos', () => {
      expect(intervalo('unread', true)).toBe(120_000)
    })
  })

  /**
   * Nunca se apaga del todo. Un aviso se pierde por motivos que la app no
   * puede ver —Expo con un mal minuto, el móvil sin datos justo entonces— y
   * sin ninguna red una conversación se quedaría congelada sin que nadie
   * pudiera saber por qué.
   */
  it('con avisos sigue habiendo sondeo: más lento, pero lo hay', () => {
    expect(intervalo('messages', true)).toBeGreaterThan(0)
    expect(intervalo('threads', true)).toBeGreaterThan(0)
    expect(intervalo('unread', true)).toBeGreaterThan(0)
  })

  /**
   * Y con avisos siempre se sondea menos, nunca más. Es la regla entera en una
   * línea: si algún día se toca la tabla de números, esto es lo que impide
   * dejarla al revés sin enterarse.
   */
  it('con avisos siempre se sondea menos que sin ellos', () => {
    for (const which of ['messages', 'threads', 'unread'] as const) {
      expect(intervalo(which, true)).toBeGreaterThan(intervalo(which, false))
    }
  })
})
