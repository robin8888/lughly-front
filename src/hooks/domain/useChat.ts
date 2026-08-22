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
  type SendMessagePayload,
} from '@/api/chat.api'
import { useAuthStore } from '@/stores/useAuthStore'

const THREADS_POLL_MS = 20_000
const MESSAGES_POLL_MS = 5_000

export function myThreadsQueryKey() {
  return ['chat', 'threads'] as const
}

export function jobMessagesQueryKey(jobId: string) {
  return ['chat', 'job', jobId] as const
}

export function supportMessagesQueryKey() {
  return ['chat', 'support'] as const
}

export function useMyThreads(enabled = true) {
  return useQuery<ApiThreadSummary[]>({
    queryKey: myThreadsQueryKey(),
    queryFn: () => chatApi.myThreads(),
    enabled,
    staleTime: 10_000,
    refetchInterval: THREADS_POLL_MS,
  })
}

export function useJobMessages(jobId: string | undefined, enabled = true) {
  return useQuery<ApiMessage[]>({
    queryKey: jobMessagesQueryKey(jobId ?? ''),
    queryFn: () => chatApi.jobMessages(jobId as string),
    enabled: enabled && Boolean(jobId),
    staleTime: 2_000,
    refetchInterval: MESSAGES_POLL_MS,
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
  return useQuery<ApiMessage[]>({
    queryKey: supportMessagesQueryKey(),
    queryFn: () => chatApi.supportMessages(),
    enabled,
    staleTime: 2_000,
    refetchInterval: MESSAGES_POLL_MS,
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
