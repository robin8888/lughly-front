/**
 * De un aviso tocado a la pantalla que resuelve.
 *
 * Hasta hoy, tocar una notificación abría la app **por donde se hubiera
 * quedado**. Refrescaba los datos —eso ya lo hacía `usePushInvalidation`— pero
 * al usuario le tocaba buscar a mano lo que le acababan de contar: «el
 * profesional ha terminado» te dejaba en la pantalla de inicio, con el trabajo
 * en cuestión a tres toques de distancia. Un aviso que no lleva a ninguna parte
 * es medio aviso.
 *
 * ## Por qué el mapa vive aparte y sin React
 *
 * Porque es la única parte comprobable: son seis valores de `screen` contra
 * seis rutas, y equivocarse **no se ve** —la app abre en otro sitio y parece
 * que el aviso "no hizo nada"—. Aquí se prueba con una tabla; el hook solo
 * escucha y empuja.
 *
 * ## Las dos escrituras de lo mismo
 *
 * El backend manda `screen: 'jobs'` en nueve sitios y `screen: 'job'` en trece,
 * y significan lo mismo: un trabajo concreto ha cambiado. Se aceptan las dos y
 * no se toca el servidor, porque un aviso ya enviado —o encolado en Expo—
 * seguirá trayendo la que traía. Es la misma decisión que en
 * `keysToInvalidate`.
 */

import type { PushData } from './pushInvalidation'

/**
 * Una ruta de expo-router, en la forma que entiende `router.navigate`.
 *
 * Se devuelve el objeto y no una cadena montada a mano porque las rutas con
 * parámetro (`/trabajo/[id]`) los quieren aparte: pegarlos en el texto funciona
 * hasta el día que un identificador lleve un carácter que haya que escapar.
 */
export type PushRoute =
  | { pathname: '/trabajo/[id]'; params: { id: string } }
  | { pathname: '/urgencia/[id]'; params: { id: string } }
  | { pathname: '/mensajes/trabajo/[id]'; params: { id: string } }
  | { pathname: '/encargos' }
  | { pathname: '/jobs' }
  | { pathname: '/account' }

/**
 * A dónde lleva este aviso, o `null` si no lleva a ninguna parte.
 *
 * `null` es una respuesta válida y frecuente: un aviso sin `screen` reconocible
 * —uno de una versión más nueva del servidor, o uno mal formado— **no mueve al
 * usuario**. Abrir una pantalla al azar es peor que abrir por donde estaba.
 */
export function routeFor(data: PushData): PushRoute | null {
  const { screen, jobId } = data

  switch (screen) {
    /**
     * Un trabajo concreto: es el caso de la mayoría de los avisos —han
     * empezado, han terminado, te lo han aceptado, el cliente pide una
     * corrección— y todos acaban en la misma ficha, que es donde están los
     * botones para contestar.
     */
    case 'job':
    case 'jobs':
      /*
        Sin `jobId` no hay ficha que abrir, pero sí hay algo mejor que nada:
        la lista de trabajos. Ahí lo que ha cambiado sale arriba.
      */
      return jobId ? { pathname: '/trabajo/[id]', params: { id: jobId } } : { pathname: '/jobs' }

    /**
     * Una urgencia. Va a su pantalla de elegir profesional y no a la ficha
     * general: quien recibe este aviso está esperando con una avería delante y
     * lo que necesita es la lista de quién puede ir, no un resumen.
     */
    case 'urgent':
      return jobId ? { pathname: '/urgencia/[id]', params: { id: jobId } } : null

    /**
     * Un mensaje. La conversación vive dentro de un trabajo
     * (`resolveJobThreadSides` en el servidor), así que sin `jobId` no hay hilo
     * que abrir.
     */
    case 'chat':
      return jobId ? { pathname: '/mensajes/trabajo/[id]', params: { id: jobId } } : null

    /**
     * La bandeja de quien recibe encargos. **No** se abre el trabajo suelto
     * aunque venga el `jobId`: aquí lo que hay que hacer es responder, y
     * responder se hace desde la bandeja, con el resto de lo pendiente a la
     * vista.
     */
    case 'inbox':
      return { pathname: '/encargos' }

    /** Cosas de la cuenta: el documento revisado, la cuenta de cobro */
    case 'account':
      return { pathname: '/account' }

    default:
      return null
  }
}
