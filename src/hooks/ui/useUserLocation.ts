/**
 * useUserLocation
 * Permiso de ubicación y posición actual (MAPS_MOBILE.md §5).
 *
 * Solo **"mientras se usa la app"**. Nunca en segundo plano: no hace falta y
 * complica la revisión de Apple y Google.
 *
 * No pide el permiso al montar. Se pide cuando el usuario hace algo que lo
 * justifica —tocar "cerca de mí"—, porque un diálogo de sistema nada más
 * abrir una pantalla se deniega por reflejo y luego ya no se puede volver a
 * preguntar.
 *
 * Y **antes del diálogo del sistema va uno nuestro que dice para qué**
 * (`LocationAsk`). El del sistema es una frase seca de la que no se puede
 * quitar el "Denegar", y sale una vez en la vida de la instalación; quien no
 * sabe qué gana, la deniega. Por eso existe `check`: si el permiso ya estaba
 * concedido no hay nada que explicar, y explicarlo otra vez sería un estorbo.
 *
 * Si no hay permiso, quien lo use debe centrar el mapa en la ciudad del
 * perfil y seguir adelante sin pedir nada.
 *
 * **Las coordenadas no se registran en logs ni en analítica** (MAPS_MOBILE.md
 * §7): son datos personales.
 */

import { useCallback, useState } from 'react'
import * as Location from 'expo-location'
import type { LatLng } from '@/utils/geo'

export type LocationStatus =
  | 'idle'
  | 'requesting'
  | 'granted'
  | 'denied'
  | 'unavailable'

export interface UseUserLocationResult {
  position: LatLng | null
  status: LocationStatus
  /** Pide el permiso si hace falta y devuelve la posición, o null */
  request: () => Promise<LatLng | null>
  /**
   * Si el permiso ya está concedido, **sin pedir nada**.
   *
   * Sirve para no explicar lo que no hace falta: quien ya lo dio en su día no
   * tiene que volver a leer para qué lo usamos cada vez que abre la app.
   */
  check: () => Promise<boolean>
}

export function useUserLocation(): UseUserLocationResult {
  const [position, setPosition] = useState<LatLng | null>(null)
  const [status, setStatus] = useState<LocationStatus>('idle')

  const check = useCallback(async (): Promise<boolean> => {
    try {
      const { granted } = await Location.getForegroundPermissionsAsync()
      return granted
    } catch {
      // Sin poder mirarlo, se da por no concedido: así se explica de más y
      // no de menos, que es el error barato de los dos.
      return false
    }
  }, [])

  const request = useCallback(async (): Promise<LatLng | null> => {
    setStatus('requesting')

    try {
      const { status: permission } =
        await Location.requestForegroundPermissionsAsync()

      if (permission !== Location.PermissionStatus.GRANTED) {
        setStatus('denied')
        return null
      }

      /**
       * Precisión equilibrada y no la máxima: para ordenar profesionales por
       * cercanía sobran los metros, y la máxima enciende el GPS y tarda.
       */
      const reading = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      })

      const next: LatLng = {
        lat: reading.coords.latitude,
        lng: reading.coords.longitude,
      }

      setPosition(next)
      setStatus('granted')
      return next
    } catch {
      // Ubicación apagada, sin señal o el usuario canceló. No es un error que
      // haya que enseñar: quien llame decide qué hacer sin posición.
      setStatus('unavailable')
      return null
    }
  }, [])

  return { position, status, request, check }
}
