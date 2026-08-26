/**
 * useAddressSuggestions
 * Lo que se escribe → las direcciones que el geocodificador propone.
 *
 * Es la mitad de lógica de `AddressInput`, sacada aparte para poder probarla
 * sin montar la pantalla: el rebote, la cancelación de respuestas viejas y el
 * mínimo de letras se prueban con un reloj falso y ninguna vista.
 *
 * **No se pregunta en cada tecla.** El proveedor es Photon, gratuito, y una
 * dirección de treinta caracteres serían treinta peticiones de las cuales
 * veintinueve se tiran. El rebote es más corto que el de `useAddressCoverage`
 * —400 ms contra 700— y a propósito: allí cada respuesta encadena una segunda
 * llamada y pinta un indicador; aquí solo rellena una lista, y esperar setecientos
 * milisegundos entre que paras de escribir y ves las sugerencias se nota como
 * lentitud de la app.
 */

import { useEffect, useState } from 'react'
import { geocodeApi, type ApiGeocodeMatch } from '@/api/geocode.api'

/** Lo que se espera desde la última tecla antes de preguntar */
export const SUGGEST_DEBOUNCE_MS = 400

/**
 * Por debajo de esto no se pregunta.
 *
 * Tres letras devuelven media España y ninguna sirve. Cinco es donde empieza
 * a haber calle: "Virge" ya acota, "Vir" no.
 */
export const MIN_SUGGEST_QUERY = 5

export type SuggestionsState =
  | { status: 'idle' }
  | { status: 'searching' }
  | { status: 'ready'; matches: ApiGeocodeMatch[] }
  | { status: 'failed' }

/**
 * @param query Lo que hay escrito en el campo
 * @param enabled A falso no pregunta nada. Lo usan los campos que ya tienen
 *   una dirección elegida: mientras no se vuelva a escribir, no hay nada que
 *   sugerir y preguntarlo sería gastar cuota para repetir lo que ya se ve.
 */
export function useAddressSuggestions(query: string, enabled = true): SuggestionsState {
  const [state, setState] = useState<SuggestionsState>({ status: 'idle' })

  useEffect(() => {
    const term = query.trim()

    if (!enabled || term.length < MIN_SUGGEST_QUERY) {
      setState({ status: 'idle' })
      return
    }

    /**
     * Evita que la respuesta de "Virgen del" pise a la de "Virgen del Puig":
     * las peticiones no vuelven necesariamente en el orden en que salieron, y
     * sin esto la lista parpadea hacia atrás mientras alguien escribe.
     */
    let cancelled = false

    const timer = setTimeout(() => {
      setState({ status: 'searching' })

      void (async () => {
        try {
          const { matches } = await geocodeApi.search(term)
          if (!cancelled) setState({ status: 'ready', matches })
        } catch {
          /*
            Sin distinguir el motivo. Al que escribe una dirección le da igual
            si fue la red, un 429 o que Photon está caído: lo que necesita
            saber es que ahora mismo no hay sugerencias, y eso lo dice el
            propio campo ofreciéndole reintentar.
          */
          if (!cancelled) setState({ status: 'failed' })
        }
      })()
    }, SUGGEST_DEBOUNCE_MS)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [query, enabled])

  return state
}
