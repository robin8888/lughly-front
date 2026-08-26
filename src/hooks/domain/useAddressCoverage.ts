/**
 * useAddressCoverage
 * Un punto del mapa → a cuántos profesionales llegaría una urgencia ahí.
 *
 * Es el indicador en vivo de la pantalla de urgencias.
 *
 * ## Ya no geocodifica
 *
 * Encadenaba dos llamadas —traducir la dirección escrita y contar la
 * cobertura en ese punto— con un rebote de 700 ms para no preguntar en cada
 * tecla. La primera mitad se ha ido, y con ella el fallo que traía dentro:
 * **se quedaba con `matches[0]` sin decírselo a nadie**. El cliente escribía
 * "Virgen del Puig 4", el geocodificador devolvía cinco calles con ese nombre
 * repartidas por España, esto elegía una y la urgencia salía hacia allí. En
 * la pantalla no había nada que dijera cuál.
 *
 * Ahora la dirección llega ya elegida y con sus coordenadas, porque el campo
 * (`AddressInput`) obliga a escogerla de la lista. Aquí solo queda contar, y
 * lo que entra es un punto, venga de esa lista o del GPS.
 */

import { useEffect, useState } from 'react'
import { prosApi, type ApiCoverage } from '@/api/pros.api'

/** El punto del que se quiere saber la cobertura */
export interface CoveragePoint {
  lat: number
  lng: number
  label: string
  city: string | null
}

export type CoverageState =
  | { status: 'idle' }
  | { status: 'searching' }
  | { status: 'failed' }
  | { status: 'ready'; point: CoveragePoint; coverage: ApiCoverage }

/**
 * @param point La dirección elegida o la posición compartida. `null` mientras
 *   no haya ninguna de las dos.
 * @param trade Sin oficio no hay nada que contar: la cobertura es de un
 *   oficio concreto, no de la plataforma entera.
 */
export function useAddressCoverage(
  point: CoveragePoint | null,
  trade: string,
): CoverageState {
  const [state, setState] = useState<CoverageState>({ status: 'idle' })

  /*
   * Se desmenuza el punto para las dependencias del efecto. Pasar el objeto
   * entero volvería a pedir la cobertura en cada renderizado, porque el padre
   * lo construye nuevo cada vez y para React nunca sería el mismo.
   */
  const lat = point?.lat ?? null
  const lng = point?.lng ?? null
  const label = point?.label ?? ''
  const city = point?.city ?? null

  useEffect(() => {
    if (trade === '' || lat === null || lng === null) {
      setState({ status: 'idle' })
      return
    }

    /**
     * Evita que una respuesta lenta de un punto anterior pise la del que se
     * está mirando ahora: cambiar de oficio o de dirección dispara otra
     * consulta sin esperar a que vuelva la primera.
     */
    let cancelled = false
    setState({ status: 'searching' })

    void (async () => {
      try {
        const coverage = await prosApi.coverage(trade, lat, lng)
        if (cancelled) return

        setState({
          status: 'ready',
          point: { lat, lng, label, city },
          coverage,
        })
      } catch {
        if (!cancelled) setState({ status: 'failed' })
      }
    })()

    return () => {
      cancelled = true
    }
  }, [lat, lng, label, city, trade])

  return state
}
