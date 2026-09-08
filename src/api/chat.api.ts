/**
 * Chat: una conversación por persona —el cliente y quien hace el trabajo—, más
 * una bandeja de soporte con administración. Sin WebSocket — la app sondea
 * mientras la pantalla está abierta y recibe un push si no (decidido con
 * Robin, 22 Ago 2026).
 *
 * **Una por persona, no una por encargo** (Robin, 8 Sep 2026): todo lo que se
 * escriban dos se suma al mismo hilo, se contraten una vez o veinte. Y se
 * puede escribir solo mientras compartan un trabajo vivo: acabado el último,
 * la conversación se lee pero se calla, hasta que esa persona vuelva a
 * contratar.
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

/** Una fila de "Mi bandeja" (GET /v1/threads): una por persona */
export interface ApiThreadSummary {
  id: string
  kind: 'DIRECT' | 'SUPPORT'
  /** Con quién se habla. `null` en el hilo de soporte, que no es de nadie. */
  otherUserId: string | null
  /** Su nombre, o "Administración" */
  otherName: string
  otherAvatarUrl: string | null
  lastMessage: string | null
  lastMessageAt: string | null
  /** Cuántos mensajes de ese hilo no he visto todavía. Cero es "al día". */
  unreadCount: number
}

/** La conversación con una persona (GET /v1/chat/with/:userId) */
export interface ApiConversation {
  otherUserId: string
  otherName: string
  otherAvatarUrl: string | null
  /**
   * Si ahora mismo se le puede escribir: hace falta compartir un trabajo vivo.
   * A falso la pantalla enseña por qué en vez de un campo de texto que iba a
   * fallar al pulsar enviar.
   */
  canWrite: boolean
  messages: ApiMessage[]
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
  markConversationRead: (userId: string) =>
    apiRequest<{ ok: true }>(`/v1/chat/with/${userId}/read`, {
      method: 'POST',
      auth: true,
    }),

  markSupportRead: () =>
    apiRequest<{ ok: true }>('/v1/support/messages/read', {
      method: 'POST',
      auth: true,
    }),

  /** Todo lo escrito con esa persona, del primer encargo al último */
  conversation: (userId: string) =>
    apiRequest<ApiConversation>(`/v1/chat/with/${userId}`, { auth: true }),

  sendMessage: (userId: string, payload: SendMessagePayload) =>
    apiRequest<ApiMessage>(`/v1/chat/with/${userId}/messages`, {
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
