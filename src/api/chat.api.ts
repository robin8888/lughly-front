/**
 * Chat: hilos de encargo entre cliente y quien lo tiene, más una bandeja de
 * soporte con administración. Sin WebSocket — la app sondea mientras la
 * pantalla está abierta y recibe un push si no (decidido con Robin, 22 Ago
 * 2026).
 * Contrato: lughly-backend/src/modules/chat/chat.controller.ts
 *
 * El adjunto no se manda aquí: se sube antes por su cuenta con
 * `uploadApi.chatAttachment` y solo se referencia su clave al enviar el
 * mensaje.
 */

import { apiRequest } from './http'
import type { MessageAttachmentKind } from './upload.api'

export interface ApiMessageAttachment {
  url: string
  kind: MessageAttachmentKind
  sizeBytes: number | null
  /** El nombre con el que se eligió en el aparato. `null` en lo mandado antes de que se guardara. */
  name: string | null
}

/** Un mensaje, tal y como lo devuelven todos los endpoints de chat */
export interface ApiMessage {
  id: string
  senderId: string
  body: string | null
  attachment: ApiMessageAttachment | null
  createdAt: string
}

/** Una fila de "Mi bandeja" (GET /v1/threads) */
export interface ApiThreadSummary {
  id: string
  kind: 'JOB' | 'SUPPORT'
  /** Solo en JOB: el encargo del que habla el hilo */
  jobId: string | null
  /** El título del encargo, o "Soporte" */
  title: string
  otherName: string
  otherAvatarUrl: string | null
  lastMessage: string | null
  lastMessageAt: string | null
  /** Cuántos mensajes de ese hilo no he visto todavía. Cero es "al día". */
  unreadCount: number
}

/** Lo que pinta el aviso del botón de mensajes */
export interface ApiUnreadCount {
  /** Mensajes sin leer, sumando todos los hilos */
  total: number
  /** En cuántas conversaciones distintas están */
  threads: number
}

/** Una fila de la bandeja de soporte, para administración */
export interface ApiAdminThreadSummary {
  id: string
  userId: string
  userName: string
  userAvatarUrl: string | null
  lastMessage: string | null
  lastMessageAt: string | null
}

export interface SendMessagePayload {
  body?: string
  attachmentKey?: string
  attachmentKind?: MessageAttachmentKind
  attachmentSizeBytes?: number
  /** El nombre con el que se eligió en el aparato, solo para enseñarlo */
  attachmentName?: string
}

export const chatApi = {
  /** Mis hilos de encargo con mensajes, más mi hilo de soporte si lo tengo */
  myThreads: () => apiRequest<ApiThreadSummary[]>('/v1/threads', { auth: true }),

  /**
   * Solo la cifra, para el botón flotante.
   *
   * Aparte de `myThreads` a propósito: la bandeja trae título, foto y último
   * mensaje de cada hilo, y pedirla cada medio minuto para pintar un número
   * encima de un icono sería traerse la lista entera por una cifra.
   */
  unreadCount: () =>
    apiRequest<ApiUnreadCount>('/v1/threads/unread-count', { auth: true }),

  /**
   * "Ya lo he visto." Va por POST y no dentro del GET de los mensajes: un GET
   * no debe cambiar nada, y además esos mensajes se sondean —marcar al leerlos
   * daría por vista una pantalla olvidada abierta en un bolsillo—.
   */
  markJobRead: (jobId: string) =>
    apiRequest<{ ok: true }>(`/v1/jobs/${jobId}/messages/read`, {
      method: 'POST',
      auth: true,
    }),

  markSupportRead: () =>
    apiRequest<{ ok: true }>('/v1/support/messages/read', {
      method: 'POST',
      auth: true,
    }),

  jobMessages: (jobId: string) =>
    apiRequest<ApiMessage[]>(`/v1/jobs/${jobId}/messages`, { auth: true }),

  sendJobMessage: (jobId: string, payload: SendMessagePayload) =>
    apiRequest<ApiMessage>(`/v1/jobs/${jobId}/messages`, {
      method: 'POST',
      auth: true,
      body: payload,
    }),

  /** Mi hilo propio con administración. Vacío si nunca he escrito */
  supportMessages: () => apiRequest<ApiMessage[]>('/v1/support/messages', { auth: true }),

  sendSupportMessage: (payload: SendMessagePayload) =>
    apiRequest<ApiMessage>('/v1/support/messages', {
      method: 'POST',
      auth: true,
      body: payload,
    }),

  /** Solo administración: la bandeja de soporte entera */
  adminThreads: () =>
    apiRequest<ApiAdminThreadSummary[]>('/v1/admin/support-threads', { auth: true }),

  adminThreadMessages: (threadId: string) =>
    apiRequest<ApiMessage[]>(`/v1/admin/support-threads/${threadId}/messages`, { auth: true }),

  sendAdminReply: (threadId: string, payload: SendMessagePayload) =>
    apiRequest<ApiMessage>(`/v1/admin/support-threads/${threadId}/messages`, {
      method: 'POST',
      auth: true,
      body: payload,
    }),
}
