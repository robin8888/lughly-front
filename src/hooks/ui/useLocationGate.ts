/**
 * useLocationGate
 * Explicar para qué, y solo entonces pedir el permiso.
 *
 * Es el compañero de `LocationAsk`: el diálogo pone las palabras y esto pone
 * cuándo sale. La regla, en una línea: **se explica solo si de verdad se va a
 * preguntar**. Si el permiso ya está concedido no hay diálogo, se hace lo que
 * se iba a hacer y ya está; volver a explicar lo aceptado es un estorbo.
 *
 * Lo usan los tres sitios donde la ubicación sirve para algo que se ve —la
 * búsqueda de la home, el directorio y el profesional que se pone en el
 * mapa—, y por eso vive aquí y no en ninguno de ellos: la parte delicada es
 * la misma en los tres, y el diálogo del sistema sale **una vez en la vida de
 * la instalación**. Un "no" por reflejo no se recupera.
 */

import { useCallback, useState } from 'react'
import { useUserLocation } from './useUserLocation'

export interface UseLocationGateResult {
  /** Si el diálogo que explica está en pantalla */
  visible: boolean
  /** Mientras el sistema pregunta y el móvil se sitúa */
  busy: boolean
  /** El toque que lo arranca: explica, o va directo si ya había permiso */
  start: () => Promise<void>
  accept: () => Promise<void>
  dismiss: () => void
}

export function useLocationGate(
  /**
   * Lo que se hace con el permiso: es quien pide la posición. Se ignora lo
   * que devuelva —quien llama ya lo sabe por su propio estado—; aquí solo
   * importa cuándo termina, para apagar el "buscándote".
   */
  proceed: () => unknown,
  /** Que ha dicho que ahora no. Para seguir adelante sin ubicación */
  decline?: () => void,
): UseLocationGateResult {
  const { check } = useUserLocation()
  const [visible, setVisible] = useState(false)
  const [busy, setBusy] = useState(false)

  const run = useCallback(async () => {
    setBusy(true)
    try {
      await proceed()
    } finally {
      setBusy(false)
      setVisible(false)
    }
  }, [proceed])

  const start = useCallback(async () => {
    if (await check()) {
      await run()
      return
    }

    setVisible(true)
  }, [check, run])

  const dismiss = useCallback(() => {
    setVisible(false)
    decline?.()
  }, [decline])

  return { visible, busy, start, accept: run, dismiss }
}
