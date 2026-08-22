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
}

export const chatApi = {
  /** Mis hilos de encargo con mensajes, más mi hilo de soporte si lo tengo */
  myThreads: () => apiRequest<ApiThreadSummary[]>('/v1/threads', { auth: true }),

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
