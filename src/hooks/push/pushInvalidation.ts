/**
 * De un aviso recibido a las consultas que hay que volver a pedir.
 *
 * Este es el agujero que hacía que nada fuera reactivo, y era más pequeño de
 * lo que parecía desde fuera: **los avisos ya existen** —dieciocho casos de
 * uso del backend los mandan— y el móvil ya registra el token. Lo que no había
 * era nadie escuchándolos: llegaba la notificación y la pantalla se quedaba
 * exactamente igual, así que había que salir y volver a entrar para ver que te
 * habían aceptado un trabajo.
 *
 * Cada aviso viaja con `data.screen` y, casi siempre, con el `jobId` o el
 * `threadId` al que se refiere. Con eso basta para saber qué recargar.
 *
 * ## Por qué se invalida a lo bruto y no la consulta exacta
 *
 * Porque no cuesta nada. `invalidateQueries` **solo vuelve a pedir lo que está
 * montado**; lo que no se está mirando se marca como caducado y se pedirá
 * cuando alguien lo abra. Así que enumerar de más no hace peticiones de más:
 * hace que la pantalla que sí esté delante se entere seguro.
 *
 * Afinar aquí sería el error contrario: acertar con la clave exacta obliga a
 * saber en qué pantalla está el usuario, y equivocarse **no se ve** —la app
 * simplemente sigue enseñando lo viejo, que es justo el fallo que esto viene a
 * arreglar—.
 *
 * ## Dos escrituras para lo mismo
 *
 * El backend manda `screen: 'jobs'` en nueve sitios y `screen: 'job'` en
 * cuatro, y significan lo mismo: un trabajo concreto ha cambiado. Se aceptan
 * las dos y no se toca el servidor, porque un aviso ya enviado —o encolado en
 * Expo— seguirá trayendo la que traía.
 */

import type { QueryKey } from '@tanstack/react-query'

/**
 * Lo que caduca solo mientras nadie mira: trabajos, bandeja, agenda, chat y
 * urgencias. Es lo que se refresca al volver a primer plano y lo que se pide
 * cuando llega un aviso que no dice de qué es.
 *
 * Se listan por su raíz —`['jobs']` y no `['jobs', 'mine']`— porque React
 * Query invalida por prefijo: con la raíz caen la lista, el detalle y
 * cualquiera que se añada después sin tener que volver aquí.
 */
export const LIVE_QUERY_KEYS: QueryKey[] = [
  ['jobs'],
  ['pro', 'inbox'],
  ['pro', 'agenda'],
  ['pro', 'assignments'],
  ['chat'],
  ['urgencies'],
]

/** Lo que puede traer un aviso dentro. Todo opcional: llega de fuera. */
export interface PushData {
  screen?: string
  jobId?: string
  threadId?: string
}

/** Lo que de verdad llega es JSON sin tipo; esto lo lee sin fiarse. */
export function readPushData(data: unknown): PushData {
  if (typeof data !== 'object' || data === null) return {}

  const raw = data as Record<string, unknown>
  const text = (value: unknown) => (typeof value === 'string' ? value : undefined)

  return {
    screen: text(raw.screen),
    jobId: text(raw.jobId),
    threadId: text(raw.threadId),
  }
}

/**
 * Qué hay que volver a pedir por culpa de este aviso.
 *
 * El `jobId` no se usa para afinar la clave del detalle a propósito: `['jobs']`
 * ya lo cubre, y con la raíz también caen los trabajos de la lista, que es
 * donde el cambio se ve primero.
 */
export function keysToInvalidate(data: unknown): QueryKey[] {
  const { screen } = readPushData(data)

  switch (screen) {
    /*
      Un trabajo ha cambiado de estado: empezado, terminado, cerrado, aceptado,
      cancelado. Lo ven el cliente en su lista y su detalle, y el profesional en
      su agenda y en sus trabajos asignados.
    */
    case 'job':
    case 'jobs':
      return [['jobs'], ['pro', 'agenda'], ['pro', 'assignments']]

    /*
      Un encargo nuevo, o uno que deja de estar pendiente. Toca la bandeja, y
      también los trabajos: quien recibe el encargo lo verá aparecer en los
      suyos en cuanto lo acepte.
    */
    case 'inbox':
      return [['pro', 'inbox'], ['jobs'], ['pro', 'assignments']]

    case 'urgent':
      return [['urgencies'], ['jobs'], ['pro', 'inbox']]

    /*
      Un mensaje. La raíz del chat cubre los hilos, el no leído y la
      conversación abierta —el aviso trae `threadId` y las conversaciones se
      guardan por `jobId`, así que afinar aquí no se puede—.
    */
    case 'chat':
      return [['chat']]

    /*
      La cuenta de cobro ha cambiado de estado. Y con ella la lista de lo que
      le falta al perfil, que la mira.
    */
    case 'account':
      return [['payments'], ['pro', 'checklist']]

    /*
      Un aviso sin `screen`, o con uno que esta versión de la app no conoce:
      se refresca lo que caduca solo. Quedarse quieto sería peor —un aviso
      llega porque algo ha cambiado—, y una app vieja tiene que seguir
      enterándose de lo que le manden las versiones nuevas del servidor.
    */
    default:
      return LIVE_QUERY_KEYS
  }
}
