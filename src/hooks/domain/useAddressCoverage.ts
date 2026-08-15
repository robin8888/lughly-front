/**
 * useAddressCoverage
 * Dirección escrita → coordenadas → a cuántos profesionales llegaría.
 *
 * Es el indicador en vivo de la pantalla de urgencias. Encadena dos
 * llamadas: geocodificar la dirección y contar la cobertura en ese punto.
 *
 * **No se consulta en cada tecla.** Se espera a que el usuario deje de
 * escribir: geocodificar "C", "Ca", "Cal", "Call"… son cinco peticiones
 * inútiles al proveedor por cada palabra, y ninguna de ellas iba a acertar.
 */

import { useEffect, useState } from 'react'
import { geocodeApi, type ApiGeocodeMatch } from '@/api/geocode.api'
import { prosApi, type ApiCoverage } from '@/api/pros.api'

/** Lo que se espera desde la última tecla antes de preguntar. */
const DEBOUNCE_MS = 700

/** Por debajo de esto no merece la pena ni intentarlo. */
const MIN_QUERY = 6

export type CoverageState =
  | { status: 'idle' }
  | { status: 'searching' }
  | { status: 'not-found' }
  | { status: 'failed' }
  | { status: 'ready'; match: ApiGeocodeMatch; coverage: ApiCoverage }

export function useAddressCoverage(
  address: string,
  trade: string,
): CoverageState {
  const [state, setState] = useState<CoverageState>({ status: 'idle' })

  useEffect(() => {
    const query = address.trim()

    if (query.length < MIN_QUERY || trade === '') {
      setState({ status: 'idle' })
      return
    }

    /**
     * `cancelled` evita que una respuesta lenta de una dirección anterior
     * pise el resultado de la que el usuario está escribiendo ahora.
     */
    let cancelled = false

    const timer = setTimeout(() => {
      setState({ status: 'searching' })

      void (async () => {
        try {
          const { matches } = await geocodeApi.search(query)
          if (cancelled) return

          const match = matches[0]
          if (!match) {
            setState({ status: 'not-found' })
            return
          }

          const coverage = await prosApi.coverage(trade, match.lat, match.lng)
          if (cancelled) return

          setState({ status: 'ready', match, coverage })
        } catch {
          if (!cancelled) setState({ status: 'failed' })
        }
      })()
    }, DEBOUNCE_MS)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [address, trade])

  return state
}
