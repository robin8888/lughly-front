/**
 * Push Store
 * Si este móvil está recibiendo avisos de verdad.
 *
 * No es un detalle informativo: **decide cada cuánto sondea el chat**. Con los
 * avisos funcionando, un mensaje nuevo se ve en el momento porque el aviso
 * invalida la conversación, y preguntar cada cinco segundos solo gasta
 * batería. Sin ellos —permiso denegado, un emulador, un móvil sin servicios de
 * notificación— el sondeo es lo único que hay, y ahí cinco segundos es lo que
 * hace que una conversación se sienta viva.
 *
 * Se guarda en memoria y no en disco a propósito: el permiso puede cambiarse
 * desde los ajustes del sistema entre dos aperturas de la app, así que lo que
 * valía ayer no dice nada. `usePushRegistration` lo escribe en cada arranque,
 * que es cuando se comprueba de verdad.
 *
 * Empieza en `false`: hasta que se sepa, se sondea rápido. Al revés —dar por
 * hecho que los avisos llegan— el chat se quedaría lento durante el primer
 * segundo de cada arranque, y en un móvil que niegue el permiso, para siempre.
 */

import { create } from 'zustand'

interface PushState {
  /** Si hay token registrado y permiso concedido */
  active: boolean
  setActive: (active: boolean) => void
}

export const usePushStore = create<PushState>((set) => ({
  active: false,
  setActive: (active) => set({ active }),
}))

export const useIsPushActive = () => usePushStore((state) => state.active)
