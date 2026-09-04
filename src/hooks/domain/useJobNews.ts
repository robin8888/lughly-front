/**
 * useJobNews
 * Qué trabajos se han movido desde la última vez que el cliente los miró.
 *
 * El punto rojo que sale de aquí responde a una pregunta que la lista no
 * respondía: **cuál**. Los avisos al móvil llegan una vez, las pestañas
 * separan por forma de contratar, y para saber si hay algo nuevo había que
 * entrar en las dos y leerlas enteras.
 *
 * Lo que se compara es la firma del estado (`jobStateSignature`) contra la que
 * se guardó al abrir la ficha. Un trabajo que nunca se ha visto **no es
 * novedad**: se apunta en silencio y se avisa de lo que cambie a partir de
 * ahí. Ver `useSeenJobStatesStore`.
 */

import { useEffect } from 'react'
import { useUser } from '@/stores/useAuthStore'
import {
  useSeenJobStates,
  useLearnJobStates,
} from '@/stores/useSeenJobStatesStore'
import { jobStateSignature } from '@/utils/jobStatus'
import type { ApiJob } from '@/api/jobs.api'

export function useJobNews(jobs: ApiJob[]): (job: ApiJob) => boolean {
  const user = useUser()
  const seen = useSeenJobStates(user?.id)
  const learn = useLearnJobStates()

  /*
    Lo que entra por primera vez se apunta tal como está. `learn` no toca el
    saco si no falta nadie, así que esto no repinta la pantalla en cada
    pasada aunque la lista llegue en un array nuevo cada vez.
  */
  useEffect(() => {
    if (!user) return

    const nuevos: Record<string, string> = {}
    for (const job of jobs) {
      if (seen[job.id] === undefined) nuevos[job.id] = jobStateSignature(job)
    }

    if (Object.keys(nuevos).length > 0) learn(user.id, nuevos)
  }, [jobs, seen, user, learn])

  return (job) => {
    const antes = seen[job.id]
    return antes !== undefined && antes !== jobStateSignature(job)
  }
}
