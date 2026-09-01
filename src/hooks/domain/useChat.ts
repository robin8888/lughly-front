/**
 * useChat
 * Hilos de encargo y de soporte.
 * Contrato: lughly-backend/src/modules/chat/chat.controller.ts
 *
 * Sin WebSocket (decidido con Robin, 22 Ago 2026): se sondea mientras la
 * pantalla está abierta. La lista de hilos sondea más despacio porque es una
 * bandeja de fondo; la conversación abierta sondea rápido porque es donde se
 * espera respuesta de verdad.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ApiError, NetworkError, uploadApi, type UploadFile } from '@/api'
import {
  chatApi,
  type ApiMessage,
  type ApiThreadSummary,
  type ApiUnreadCount,
  type SendMessagePayload,
} from '@/api/chat.api'
import { useAuthStore } from '@/stores/useAuthStore'
import { useIsPushActive } from '@/stores/usePushStore'

/**
 * Cada cuánto se sondea, **según lleguen o no los avisos**.
 *
 * Con los avisos funcionando, un mensaje nuevo se ve en el momento: el aviso
 * invalida la conversación (`usePushInvalidation`) y React Query la vuelve a
 * pedir. El sondeo se queda solo como red —un aviso se puede perder— y a ese
 * ritmo no hace falta que sea rápido.
 *
 * Sin avisos —permiso denegado, un emulador, un móvil sin servicios de
 * notificación— el sondeo es lo único que hay, y ahí cinco segundos es lo que
 * hace que una conversación se sienta viva.
 *
 * Elegir un solo número obligaba a decidir entre gastar batería a todo el
 * mundo o dejar el chat muerto a quien no da el permiso. Son dos situaciones
 * distintas y se tratan distinto.
 */
const POLL_MS = {
  threads: { withPush: 60_000, withoutPush: 20_000 },
  messages: { withPush: 20_000, withoutPush: 5_000 },
  unread: { withPush: 120_000, withoutPush: 30_000 },
} as const

/**
 * El ritmo que toca ahora mismo.
 *
 * Exportado para poder probarlo: es una decisión de producto —cuánta batería
 * a cambio de cuánta frescura— y comprobarla a través de las consultas
 * obligaría a levantar React Query con sus temporizadores vivos.
 */
export function usePollInterval(which: keyof typeof POLL_MS): number {
  const active = useIsPushActive()

  return active ? POLL_MS[which].withPush : POLL_MS[which].withoutPush
}

/*
  El no leído va siempre más lento que la bandeja: no es una pantalla que se
  está mirando, es un número encima de un icono que vive en la home. Que tarde
  diez segundos de más en pasar de 2 a 3 no se lo pierde nadie.
*/

export function myThreadsQueryKey() {
  return ['chat', 'threads'] as const
}

export function jobMessagesQueryKey(jobId: string) {
  return ['chat', 'job', jobId] as const
}

export function supportMessagesQueryKey() {
  return ['chat', 'support'] as const
}

export function unreadCountQueryKey() {
  return ['chat', 'unread'] as const
}

/**
 * Cuántos mensajes hay esperando, para el aviso del botón de mensajes.
 *
 * Se pide **al abrir la app**, que es lo que se pidió: quien entra tiene que
 * ver ahí mismo que le han escrito, sin abrir la bandeja para descubrirlo.
 *
 * `refetchOnMount` y `refetchOnWindowFocus` en su valor por defecto a
 * propósito: volver del segundo plano vuelve a preguntar, y ahí es justo
 * cuando puede haber llegado algo nuevo.
 *
 * @param enabled A falso no pregunta. Sin sesión no hay a quién contar
 *   mensajes, y preguntarlo devolvería un 401 en cada arranque.
 */
export function useUnreadCount(enabled = true) {
  const refetchInterval = usePollInterval('unread')

  return useQuery<ApiUnreadCount>({
    queryKey: unreadCountQueryKey(),
    queryFn: () => chatApi.unreadCount(),
    enabled,
    staleTime: 10_000,
    refetchInterval,
  })
}

/**
 * "Ya lo he visto": mueve la marca de lectura del hilo abierto.
 *
 * La llama la pantalla de conversación al abrirla **y cada vez que le entran
 * mensajes nuevos**. Sin lo segundo, leer una conversación en directo dejaría
 * el contador subiendo delante de quien la está leyendo.
 *
 * Al terminar refresca el contador y la bandeja, que son los dos sitios donde
 * se ve lo que acaba de dejar de estar pendiente.
 */
export function useMarkThreadRead() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (target: { jobId: string } | { support: true }) =>
      'support' in target
        ? chatApi.markSupportRead()
        : chatApi.markJobRead(target.jobId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: unreadCountQueryKey() })
      void queryClient.invalidateQueries({ queryKey: myThreadsQueryKey() })
    },
  })

  return {
    /*
      Se traga el fallo. Marcar como leído es un efecto de fondo: si no llega,
      lo peor que pasa es que el número tarde en bajar, y no hay nada que
      pedirle al usuario que haga al respecto.
    */
    markRead: (target: { jobId: string } | { support: true }) =>
      mutation.mutate(target),
  }
}

export function useMyThreads(enabled = true) {
  const refetchInterval = usePollInterval('threads')

  return useQuery<ApiThreadSummary[]>({
    queryKey: myThreadsQueryKey(),
    queryFn: () => chatApi.myThreads(),
    enabled,
    staleTime: 10_000,
    refetchInterval,
  })
}

export function useJobMessages(jobId: string | undefined, enabled = true) {
  const refetchInterval = usePollInterval('messages')

  return useQuery<ApiMessage[]>({
    queryKey: jobMessagesQueryKey(jobId ?? ''),
    queryFn: () => chatApi.jobMessages(jobId as string),
    enabled: enabled && Boolean(jobId),
    staleTime: 2_000,
    refetchInterval,
  })
}

export function useSendJobMessage(jobId: string | undefined) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (payload: SendMessagePayload) =>
      chatApi.sendJobMessage(jobId as string, payload),
    onSuccess: () => {
      if (jobId) {
        void queryClient.invalidateQueries({ queryKey: jobMessagesQueryKey(jobId) })
      }
      void queryClient.invalidateQueries({ queryKey: myThreadsQueryKey() })
    },
  })

  return {
    send: async (payload: SendMessagePayload) => {
      try {
        await mutation.mutateAsync(payload)
        return { ok: true as const, error: null }
      } catch (error) {
        return {
          ok: false as const,
          error:
            error instanceof NetworkError || error instanceof ApiError
              ? error.message
              : 'No se ha podido enviar el mensaje.',
        }
      }
    },
    isSending: mutation.isPending,
  }
}

export function useSupportMessages(enabled = true) {
  /* La conversación con administración es una conversación: mismo ritmo */
  const refetchInterval = usePollInterval('messages')

  return useQuery<ApiMessage[]>({
    queryKey: supportMessagesQueryKey(),
    queryFn: () => chatApi.supportMessages(),
    enabled,
    staleTime: 2_000,
    refetchInterval,
  })
}

export function useSendSupportMessage() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (payload: SendMessagePayload) => chatApi.sendSupportMessage(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: supportMessagesQueryKey() })
      void queryClient.invalidateQueries({ queryKey: myThreadsQueryKey() })
    },
  })

  return {
    send: async (payload: SendMessagePayload) => {
      try {
        await mutation.mutateAsync(payload)
        return { ok: true as const, error: null }
      } catch (error) {
        return {
          ok: false as const,
          error:
            error instanceof NetworkError || error instanceof ApiError
              ? error.message
              : 'No se ha podido enviar el mensaje.',
        }
      }
    },
    isSending: mutation.isPending,
  }
}

/** Sube el adjunto antes de mandar el mensaje; su clave se referencia luego al enviar. */
export function useUploadChatAttachment() {
  const mutation = useMutation({
    mutationFn: (file: UploadFile) => {
      const accessToken = useAuthStore.getState().accessToken
      if (!accessToken) throw new Error('Sin sesión')
      return uploadApi.chatAttachment(file, accessToken)
    },
  })

  return {
    upload: async (file: UploadFile) => {
      try {
        return { ok: true as const, result: await mutation.mutateAsync(file), error: null }
      } catch (error) {
        return {
          ok: false as const,
          result: null,
          error:
            error instanceof NetworkError || error instanceof ApiError
              ? error.message
              : 'No se ha podido subir el adjunto.',
        }
      }
    },
    isUploading: mutation.isPending,
  }
}
