/**
 * AssignmentConfirm Organism
 * Lo que ve un trabajador cuando su empresa le asigna un trabajo.
 *
 * Dos pasos en el mismo diálogo:
 *
 * 1. **¿Puedes?** — en el azul de la barra. Aceptar lo deja adjudicado y avisa
 *    al cliente.
 * 2. **¿Por qué no?** — en rojo, si dice que no. El motivo es obligatorio
 *    porque su empresa tiene que mandar a otro y no puede decidir a quién sin
 *    saber si es una baja o un solape.
 *
 * **El motivo no le llega al cliente.** Es el mismo criterio que el motivo de
 * una ausencia —una baja médica es asunto de quien la tiene—. La pantalla lo
 * dice, para que nadie se lo calle por miedo a que lo lea el cliente.
 *
 * Sirve para las dos formas de decir que no, porque la pregunta es la misma y
 * el motivo se pide igual:
 *
 * - Lo que **te han asignado** (`PENDING_WORKER`): empieza preguntando si
 *   puedes, y solo pide el motivo si dices que no.
 * - Lo que **te han encargado** (`PENDING_PRO`): el "sí" de ahí es decir quién
 *   va, y eso se hace en la lista de encargos. Aquí solo se entra a rechazar,
 *   así que va directo al motivo.
 */

import { useState } from 'react'
import { View, Text } from 'react-native'
import { Input } from '@/components/atoms/Input'
import { Dialog } from '@/components/organisms/Dialog'
import {
  useConfirmAssignment,
  useDeclineRequest,
} from '@/hooks/domain/useInbox'
import type { ApiInboxItem } from '@/api/assignments.api'
import { formatJobWhen } from '@/utils/dates'
import { styles } from './AssignmentConfirm.styles'

export interface AssignmentConfirmProps {
  /** El trabajo pendiente de confirmar. Sin él no se enseña nada */
  job: ApiInboxItem | null
  /** Cerrar sin responder: sigue estando en sus encargos */
  onDismiss: () => void
  testID?: string
}

export function AssignmentConfirm({
  job,
  onDismiss,
  testID,
}: AssignmentConfirmProps) {
  const { confirm, isConfirming } = useConfirmAssignment()
  const { decline, isDeclining } = useDeclineRequest()

  const [asked, setAsked] = useState(false)
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)

  if (!job) return null

  /** Lo que ya le han asignado y solo falta que confirme */
  const isAssigned = job.status === 'PENDING_WORKER'

  /**
   * Un encargo sin asignar entra ya explicando: su "sí" es elegir quién va, y
   * eso se decide en la lista, no aquí.
   */
  const explaining = !isAssigned || asked
  const isWorking = isConfirming || isDeclining

  const close = () => {
    setAsked(false)
    setReason('')
    setError(null)
    onDismiss()
  }

  const answer = async (accept: boolean) => {
    /*
      Dos caminos porque son dos preguntas distintas al servidor: confirmar lo
      asignado, o rechazar lo encargado. Lo que se escribe es lo mismo.
    */
    const { ok, error: failed } = isAssigned
      ? await confirm(job.id, accept, accept ? undefined : reason.trim())
      : await decline(job.id, reason.trim())

    if (!ok) {
      setError(failed ?? 'No hemos podido enviar tu respuesta.')
      return
    }

    close()
  }

  const when = job.preferredDate ? formatJobWhen(job.preferredDate) : null

  if (explaining) {
    return (
      <Dialog
        visible
        tone="danger"
        title="¿Por qué no puedes?"
        message={
          isAssigned
            ? 'Se lo decimos a tu empresa para que mande a otro. Al cliente no se le enseña lo que escribas aquí.'
            : 'Al cliente le diremos que no puedes y quedará libre para buscar a otro, pero no verá lo que escribas aquí.'
        }
        onDismiss={close}
        testID={testID}
        actions={[
          {
            label: isWorking ? 'Enviando…' : 'Enviar',
            onPress: () => void answer(false),
            disabled: reason.trim().length === 0 || isWorking,
            testID: 'assignment-decline-send',
          },
          {
            /* Solo hay a dónde volver si antes hubo una pregunta */
            label: isAssigned ? 'Volver' : 'Cancelar',
            variant: 'secondary',
            onPress: isAssigned ? () => setAsked(false) : close,
            testID: 'assignment-decline-back',
          },
        ]}
      >
        <View style={styles.field}>
          <Input
            value={reason}
            onChangeText={setReason}
            placeholder="Estoy de baja, ya tengo otro trabajo ese día…"
            multiline
            numberOfLines={3}
            maxLength={300}
            testID="assignment-decline-reason"
          />
          {error && <Text style={styles.error}>{error}</Text>}
        </View>
      </Dialog>
    )
  }

  return (
    <Dialog
      visible
      title="Te han asignado un trabajo"
      message={`${job.title} · ${job.tradeLabel} en ${job.city}${
        when ? `, ${when}` : ''
      }. Dinos si puedes hacerlo.`}
      onDismiss={close}
      testID={testID}
      actions={[
        {
          label: isWorking ? 'Un momento…' : 'Puedo hacerlo',
          onPress: () => void answer(true),
          disabled: isWorking,
          testID: 'assignment-accept',
        },
        {
          label: 'No puedo',
          variant: 'secondary',
          onPress: () => setAsked(true),
          testID: 'assignment-decline',
        },
      ]}
    >
      {error && <Text style={styles.error}>{error}</Text>}
    </Dialog>
  )
}
