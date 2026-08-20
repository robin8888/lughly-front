/**
 * useShareLocation
 * "Usar mi ubicación actual" en la pantalla de urgencias.
 *
 * Quien se ha quedado fuera de casa o está en la calle rara vez sabe el
 * número del portal, y menos aún con prisa. Compartir la posición evita
 * escribir una dirección que quizá no se sepa.
 *
 * **El GPS acierta la calle, no el piso.** Por eso esto rellena el campo de
 * dirección pero no lo bloquea: el cliente añade el piso y la puerta, que es
 * lo que el profesional necesita para llamar al timbre.
 *
 * Las coordenadas que se usan luego son las del GPS, no las de la dirección
 * traducida: son más exactas, y la dirección solo sirve para que una persona
 * sepa a dónde va.
 */

import { useCallback, useState } from 'react'
import { geocodeApi } from '@/api/geocode.api'
import { useUserLocation } from '@/hooks/ui/useUserLocation'

export type ShareLocationStatus =
  | 'idle'
  | 'locating'
  | 'denied'
  | 'unavailable'
  | 'done'

export interface SharedLocation {
  lat: number
  lng: number
  /** Dirección legible; vacía si el punto no tiene nada reconocible */
  label: string
  city: string | null
  /** De aquí sale la comunidad, y de la comunidad su calendario de festivos */
  postcode: string | null
}

export interface UseShareLocationResult {
  status: ShareLocationStatus
  share: () => Promise<SharedLocation | null>
}

export function useShareLocation(): UseShareLocationResult {
  const { request } = useUserLocation()
  const [status, setStatus] = useState<ShareLocationStatus>('idle')

  const share = useCallback(async (): Promise<SharedLocation | null> => {
    setStatus('locating')

    const position = await request()

    if (!position) {
      // `useUserLocation` ya distingue si fue una negativa o un fallo, pero
      // aquí solo importa que no hay posición y hay que decirlo.
      setStatus('denied')
      return null
    }

    try {
      const { match } = await geocodeApi.reverse(position.lat, position.lng)

      setStatus('done')

      return {
        lat: position.lat,
        lng: position.lng,
        // Sin dirección reconocible se sigue adelante: las coordenadas son
        // válidas y el profesional puede navegar hasta el punto.
        label: match?.label ?? '',
        city: match?.city ?? null,
        postcode: match?.postcode ?? null,
      }
    } catch {
      /**
       * Falló traducir las coordenadas, pero la posición es buena. Se
       * devuelve igualmente: perder una urgencia porque un servicio de mapas
       * no responde sería absurdo.
       */
      setStatus('done')
      return {
        lat: position.lat,
        lng: position.lng,
        label: '',
        city: null,
        postcode: null,
      }
    }
  }, [request])

  return { status, share }
}
