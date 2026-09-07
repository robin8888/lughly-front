/**
 * LocationAsk Organism
 * Lo que se pregunta **antes** de que salga el diálogo del sistema.
 *
 * El del sistema es una frase seca con dos botones, sale una sola vez en la
 * vida de la instalación y no se puede volver a sacar: quien lo deniega por
 * reflejo se queda sin ubicación para siempre y sin haber leído nunca qué
 * ganaba con ella. Así que primero se dice para qué, en nuestras palabras, y
 * solo si dice que sí se llama al sistema.
 *
 * **No se enseña si el permiso ya está concedido** (`useUserLocation.check`).
 * Explicar lo que ya se aceptó es un estorbo, no una cortesía.
 *
 * Los dos motivos son de verdad distintos, y por eso son dos textos y no uno
 * con el nombre cambiado:
 *
 * - Al **cliente** se le usa para ordenar la lista, y no se guarda en ningún
 *   sitio: sale de la búsqueda y ahí muere.
 * - Al **profesional** se le usa para ponerle en el mapa, y sí se guarda —es
 *   su punto base—. Decirle que no se guarda sería mentirle.
 */

import { Dialog } from '@/components/organisms/Dialog'

/** Para qué se pide. Decide el texto entero, que es lo único que hay aquí. */
export type LocationReason = 'find-pros' | 'be-found'

const TEXTS: Record<LocationReason, { title: string; message: string; accept: string }> =
  {
    'find-pros': {
      title: '¿Buscamos por donde estás?',
      message:
        'Con tu ubicación te ponemos primero a los profesionales que tienes cerca, y te decimos cuántos hay. Sin ella la lista sale sin ordenar, y el primero puede estar a doscientos kilómetros.\n\nSolo mientras usas la app, y no la guardamos: sale de la búsqueda y ahí se queda.',
      accept: 'Usar mi ubicación',
    },
    'be-found': {
      title: '¿Te ponemos en el mapa?',
      message:
        'Los clientes buscan por cercanía, y quien no tiene un punto en el mapa no sale en esas búsquedas —ni aunque esté en la calle de al lado—.\n\nCon tu ubicación fijamos desde dónde sales a trabajar. Se guarda como tu zona, y la puedes cambiar cuando quieras en Mi zona de trabajo.',
      accept: 'Ponerme en el mapa',
    },
  }

export interface LocationAskProps {
  visible: boolean
  reason: LocationReason
  /** Mientras el sistema pregunta y el móvil se sitúa */
  busy?: boolean
  onAccept: () => void
  /** "Ahora no", el botón de atrás y el toque fuera: los tres son lo mismo */
  onDismiss: () => void
  testID?: string
}

export function LocationAsk({
  visible,
  reason,
  busy = false,
  onAccept,
  onDismiss,
  testID = 'location-ask',
}: LocationAskProps) {
  const text = TEXTS[reason]

  return (
    <Dialog
      visible={visible}
      title={text.title}
      message={text.message}
      actions={[
        {
          label: busy ? 'Buscándote…' : text.accept,
          onPress: onAccept,
          variant: 'primary',
          disabled: busy,
          testID: `${testID}-accept`,
        },
        {
          /*
            Se puede decir que no y seguir usando la app. Un "ahora no" que
            deja la pantalla igual de utilizable es lo que hace que el "sí"
            del que lo da valga algo.
          */
          label: 'Ahora no',
          onPress: onDismiss,
          variant: 'secondary',
          disabled: busy,
          testID: `${testID}-dismiss`,
        },
      ]}
      onDismiss={onDismiss}
      testID={testID}
    />
  )
}
