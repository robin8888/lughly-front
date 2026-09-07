/**
 * useLocateMyBase
 * Ponerse en el mapa con la ubicación del móvil, de un toque.
 *
 * Es el atajo a lo que ya se podía hacer entrando a Mi zona de trabajo, y
 * existe porque casi nadie entraba. El caso que lo pide es el del trabajador
 * al que da de alta su empresa: ese formulario no pide dirección, así que
 * entra en la app sin punto en el mapa y **no sale en ninguna búsqueda por
 * cercanía** —que es de donde vienen los trabajos— sin que nada se lo diga.
 *
 * Guarda el punto y deja el radio como estaba: el que trae la cuenta son 15 km
 * y cambiarlo es una decisión suya —depende de si tiene furgoneta—, no algo
 * que se decida al vuelo por darle a un botón.
 *
 * La ciudad solo viaja si el geocodificador la da: es por donde se le busca en
 * el directorio, y machacarla con un vacío sería empeorar lo que había.
 */

import { useCallback, useState } from 'react'
import { useShareLocation } from './useShareLocation'
import { useMyCoverage, useSetMyCoverage } from './useMyCoverage'

export type LocateBaseStatus =
  | 'idle'
  /** El sistema pregunta y el móvil se sitúa */
  | 'locating'
  | 'saving'
  | 'done'
  /** Dijo que no al permiso, o el móvil no pudo situarse */
  | 'denied'
  /** Se supo dónde está, pero no se pudo guardar */
  | 'failed'

export interface UseLocateMyBaseResult {
  status: LocateBaseStatus
  /** Dónde tiene la base ahora. `null` mientras no lo sepamos o no la tenga */
  hasBase: boolean | null
  locate: () => Promise<boolean>
}

export function useLocateMyBase(enabled = true): UseLocateMyBaseResult {
  const { data } = useMyCoverage(enabled)
  const { share } = useShareLocation()
  const { save } = useSetMyCoverage()
  const [status, setStatus] = useState<LocateBaseStatus>('idle')

  const locate = useCallback(async (): Promise<boolean> => {
    setStatus('locating')

    const position = await share()

    if (!position) {
      setStatus('denied')
      return false
    }

    setStatus('saving')

    const { ok } = await save({
      latitude: position.lat,
      longitude: position.lng,
      /*
        El que ya tenía. Sin respuesta todavía —se acaba de entrar y la
        consulta va por detrás— vale el mismo que pone la base de datos, que
        es lo que tendría igualmente.
      */
      radiusKm: data?.radiusKm ?? 15,
      ...(position.city && { city: position.city }),
      postcode: position.postcode,
    })

    setStatus(ok ? 'done' : 'failed')
    return ok
  }, [data?.radiusKm, save, share])

  return {
    status,
    hasBase: data ? data.latitude !== null && data.longitude !== null : null,
    locate,
  }
}
