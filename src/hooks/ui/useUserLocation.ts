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
}

export function useUserLocation(): UseUserLocationResult {
  const [position, setPosition] = useState<LatLng | null>(null)
  const [status, setStatus] = useState<LocationStatus>('idle')

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

  return { position, status, request }
}
