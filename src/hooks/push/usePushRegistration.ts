/**
 * usePushRegistration
 * Registra este móvil para recibir avisos, y lo suelta al cerrar sesión.
 *
 * El identificador lo da Expo y es **del aparato, no de la persona**: un
 * teléfono se vende o se hereda. El backend lo reasigna al entrar otra
 * cuenta, y aquí se suelta al salir; entre las dos cosas, nadie recibe los
 * avisos del dueño anterior.
 *
 * Nada de esto puede romper la sesión. Si el usuario niega el permiso, si el
 * móvil no tiene servicios de notificación o si la llamada falla, la app
 * funciona igual: los avisos son un extra sobre las listas, que siguen siendo
 * la verdad. Por eso todo va envuelto y no se enseña ningún error.
 */

import { useEffect } from 'react'
import { Platform } from 'react-native'
import * as Device from 'expo-device'
import * as Notifications from 'expo-notifications'
import Constants from 'expo-constants'
import { meApi } from '@/api/me.api'
import { useIsAuthenticated } from '@/stores/useAuthStore'
import { usePushStore } from '@/stores/usePushStore'

/**
 * El canal de Android por el que salen los avisos.
 *
 * Tiene que llamarse igual que el `channelId` que manda el servidor
 * (`ExpoPushSender`). Si dejan de coincidir no hay error: los avisos caen en
 * el canal por defecto y se pierden el sonido y la prioridad, en silencio.
 */
const ANDROID_CHANNEL_ID = 'avisos'

/**
 * En Android 8 y posteriores **el canal decide** si un aviso suena y si se
 * asoma por encima de lo que estés mirando, y el mensaje no puede cambiarlo.
 * Sin crear ninguno, todo cae en el que Expo hace solo, que no tiene prioridad
 * alta: el aviso llega, pero callado y sin asomarse.
 *
 * Y hay una trampa que conviene saber: **de un canal ya creado solo se pueden
 * cambiar el nombre y la descripción**. El sonido y la prioridad se quedan
 * como se pusieron la primera vez, para siempre, en cada móvil que ya lo
 * tenga. Cambiarlos de verdad obliga a borrar el canal y volver a crearlo —o a
 * estrenar un identificador nuevo—.
 *
 * En iOS no existen los canales y esto no hace nada.
 */
async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return

  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
    name: 'Avisos de Lughly',
    description: 'Encargos, mensajes y cambios en tus trabajos.',
    /*
      Alta y no la máxima: MAX es para lo que interrumpe de verdad —una
      llamada—. HIGH ya suena y se asoma, que es lo que hace falta para "han
      aceptado tu trabajo".
    */
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'default',
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#04070f',
  })
}

/**
 * Qué hacer con un aviso que llega **con la app abierta**.
 *
 * Sin esto, iOS no enseña nada: la notificación llega, el sistema decide que
 * ya estás dentro de la app y se la calla. Es lo que hacía que un aviso
 * pareciera perdido cuando en realidad había llegado —los oyentes de
 * `usePushInvalidation` sí se disparaban y la pantalla se refrescaba, pero sin
 * que nadie viera por qué—.
 *
 * Se enseña igual que si la app estuviera cerrada, y a propósito: los avisos
 * de Lughly no son ruido de fondo, son "han aceptado tu trabajo" y "te han
 * escrito". Quien está mirando la home tiene el mismo derecho a enterarse que
 * quien tiene el móvil en el bolsillo.
 *
 * Va fuera del componente porque es una configuración del módulo, no un
 * efecto: tiene que estar puesta antes de que llegue el primer aviso, y
 * ponerla dos veces no significa nada.
 */
Notifications.setNotificationHandler({
  handleNotification: () =>
    Promise.resolve({
      shouldShowBanner: true,
      /* Y que se quede en el centro de notificaciones, no solo de paso */
      shouldShowList: true,
      shouldPlaySound: true,
      /*
        El globo del icono no: lo que hay pendiente se cuenta en la app —el
        punto rojo del botón de mensajes, la bandeja de encargos— y un número
        en el icono que nadie borra al leer acaba diciendo otra cosa.
      */
      shouldSetBadge: false,
    }),
})

/**
 * En un emulador no hay servicios de notificación, así que Expo no puede dar
 * un identificador. Se comprueba antes para no llenar la consola de errores
 * en desarrollo.
 */
/**
 * Por qué este móvil se ha quedado sin avisos, dicho en voz alta.
 *
 * Solo en desarrollo, y por un motivo concreto: quedarse sin token **no da
 * ningún error visible**. La app funciona, las listas siguen siendo la verdad,
 * y desde fuera es idéntico a que el servidor no esté mandando nada. Costó una
 * tarde averiguar que en Android faltaba la configuración de Firebase, cuando
 * la propia excepción lo decía.
 *
 * En producción sigue callado: al usuario no se le cuenta esto, y un móvil sin
 * permiso concedido es una decisión suya, no un fallo.
 */
function explicar(motivo: string, error?: unknown): null {
  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.warn(
      `[push] Este móvil no va a recibir avisos (${Platform.OS}): ${motivo}`,
      error ?? '',
    )
  }

  return null
}

async function obtainToken(): Promise<string | null> {
  if (!Device.isDevice) {
    return explicar('es un emulador, y ahí no hay servicios de notificación')
  }

  /*
    Antes de pedir el token: el canal tiene que existir cuando llegue el primer
    aviso, y crearlo es idempotente.
  */
  await ensureAndroidChannel()

  const { status: existing } = await Notifications.getPermissionsAsync()
  let status = existing

  /**
   * El permiso solo se pide si aún no ha contestado. Volver a preguntar a
   * quien ya dijo que no es inútil —el sistema no lo muestra dos veces— y
   * molesto.
   */
  if (status !== 'granted') {
    const asked = await Notifications.requestPermissionsAsync()
    status = asked.status
  }

  if (status !== 'granted') return explicar('el permiso no está concedido')

  /**
   * El identificador del proyecto hace falta sí o sí en una compilación
   * propia: sin él, Expo no sabe a qué app pertenece el token.
   */
  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId

  if (!projectId) return explicar('falta el projectId de EAS en la configuración')

  try {
    const token = await Notifications.getExpoPushTokenAsync({ projectId })
    return token.data
  } catch (error) {
    /**
     * Aquí es donde se cae Android sin Firebase: sin `google-services.json` en
     * la compilación, el móvil no puede registrarse en FCM y no hay token que
     * pedir. iOS no pasa por eso, así que funciona uno y el otro no —y sin
     * este aviso, los dos se ven igual desde fuera—.
     */
    return explicar(
      Platform.OS === 'android'
        ? 'no se ha podido registrar en FCM. ¿Está `google-services.json` en la compilación (android.googleServicesFile)?'
        : 'no se ha podido obtener el token',
      error,
    )
  }
}

export function usePushRegistration(): void {
  const isAuthenticated = useIsAuthenticated()

  useEffect(() => {
    /**
     * Al salir no se hace nada aquí: soltar el dispositivo necesita la
     * sesión, y para cuando esto se entera ya se ha ido. Lo hace `useLogout`
     * llamando a `releaseDevice` antes de limpiarla.
     */
    if (!isAuthenticated) return

    let cancelled = false

    void (async () => {
      try {
        const token = await obtainToken()

        /*
          Que haya token o no lo apunta el store, y no es solo informativo: el
          chat sondea rápido cuando no hay avisos y despacio cuando los hay.
          Sin esto habría que elegir uno de los dos para todo el mundo.
        */
        if (!token || cancelled) {
          if (!cancelled) usePushStore.getState().setActive(false)
          return
        }

        await meApi.registerDevice(token, Platform.OS === 'ios' ? 'IOS' : 'ANDROID')

        if (!cancelled) usePushStore.getState().setActive(true)
      } catch {
        usePushStore.getState().setActive(false)
        // Sin avisos se sigue pudiendo trabajar; no se molesta al usuario
      }
    })()

    return () => {
      cancelled = true
    }
  }, [isAuthenticated])
}

/**
 * Suelta este móvil antes de cerrar la sesión.
 *
 * Va aparte del hook y lo llama `useLogout`, porque tiene que ocurrir
 * mientras la sesión sigue viva: después ya no hay con qué autenticarse.
 */
export async function releaseDevice(): Promise<void> {
  try {
    if (!Device.isDevice) return

    const { status } = await Notifications.getPermissionsAsync()
    if (status !== 'granted') return

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId

    if (!projectId) return

    const token = await Notifications.getExpoPushTokenAsync({ projectId })

    await meApi.releaseDevice(
      token.data,
      Platform.OS === 'ios' ? 'IOS' : 'ANDROID',
    )
  } catch {
    /**
     * Si falla, el usuario sale igual. El aviso perdido es un mal menor
     * frente a impedirle cerrar sesión, y el backend retira el dispositivo
     * solo en cuanto Expo lo dé por desaparecido.
     */
  }
}
