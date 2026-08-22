/**
 * JobAnswer Organism
 * Lo que ve el cliente cuando el profesional le ha contestado.
 *
 * El aviso al móvil sale en el momento, pero sale una vez: si el teléfono
 * estaba silenciado o boca abajo, nadie se entera de que alguien ha aceptado
 * su urgencia y va de camino. Al abrir la app se lo decimos otra vez, que es
 * lo mismo que se hace con el profesional y sus encargos sin responder.
 *
 * Tres respuestas, y las tres importan por lo mismo —que el cliente sepa si
 * alguien va a ir—, aunque dos sean malas noticias:
 *
 * - **Aceptado**: en el azul de la barra. Si es una urgencia se dice que va de
 *   camino, que es la diferencia que importa: no es un encargo para la semana
 *   que viene, es alguien saliendo ya.
 * - **No puede**: en rojo, y sin el motivo. Lo que escribió es para nosotros;
 *   al cliente le llega lo que le afecta, que es que ya puede buscar a otro.
 * - **Nadie contestó a tiempo**: también en rojo. Para el cliente es lo mismo
 *   que un rechazo —nadie va a ir— y se resuelve igual.
 *
 * Sale **uno cada vez**, el primero de la lista. Tres ventanas encadenadas al
 * abrir la app se cierran de un manotazo sin leer ninguna; el resto sigue en
 * Mis trabajos, que es donde también se resuelven.
 */

import { Dialog } from '@/components/organisms/Dialog'
import type { ApiJob } from '@/api/jobs.api'

/** Las respuestas que merecen un aviso, y en qué tono */
export function isAnswer(job: ApiJob): boolean {
  return (
    job.status === 'CONTRACTED' ||
    job.status === 'DECLINED' ||
    job.status === 'EXPIRED'
  )
}

export interface JobAnswerProps {
  /** El trabajo del que hay que dar noticia. Sin él no se enseña nada */
  job: ApiJob | null
  /** A su ficha: quién lo hace, su teléfono y qué queda por hacer */
  onSee: (jobId: string) => void
  /** Se ha leído: no vuelve a salir mientras siga en este estado */
  onDismiss: () => void
  testID?: string
}

export function JobAnswer({ job, onSee, onDismiss, testID }: JobAnswerProps) {
  if (!job) return null

  const quien = job.proName ?? 'El profesional'
  const isUrgency = job.type === 'URGENT'
  const accepted = job.status === 'CONTRACTED'

  const title = accepted
    ? isUrgency
      ? `${quien} va de camino`
      : `${quien} ha aceptado tu encargo`
    : job.status === 'DECLINED'
      ? `${quien} no puede`
      : 'Nadie ha respondido a tiempo'

  /*
    Sin prometer el teléfono: no todo el mundo lo tiene en la app, y el modal
    no sabe si este lo tiene. Lo que hay es en la ficha, y allí se dice tenga
    número o no.
  */
  const message = accepted
    ? isUrgency
      ? `Ha aceptado tu urgencia "${job.title}" y va para allá. En el trabajo tienes sus datos.`
      : `Queda cerrado. En el trabajo tienes sus datos por si necesitas hablar con él.`
    : job.status === 'DECLINED'
      ? `No puede hacer "${job.title}". Puedes elegir a otro sin esperar nada.`
      : `Se cumplió el plazo de "${job.title}" sin respuesta. Puedes elegir a otro.`

  return (
    <Dialog
      visible
      tone={accepted ? 'accent' : 'danger'}
      title={title}
      message={message}
      onDismiss={onDismiss}
      testID={testID}
      actions={[
        {
          label: accepted ? 'Ver el trabajo' : 'Buscar a otro',
          onPress: () => onSee(job.id),
          testID: 'job-answer-see',
        },
        {
          label: 'Ahora no',
          variant: 'secondary',
          onPress: onDismiss,
          testID: 'job-answer-later',
        },
      ]}
    />
  )
}
