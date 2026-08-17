/**
 * Subida de ficheros (multipart).
 *
 * Usa la subida NATIVA de `expo-file-system` en vez de `fetch` con FormData.
 * Motivo: en iOS, `fetch` con un fichero dentro de un FormData falla con un
 * error de red genérico incluso llegando al servidor —el resto de peticiones
 * JSON a la misma dirección funcionan sin problema—. La vía nativa entrega el
 * fichero desde el propio sistema, sin pasar por el puente de JavaScript, y
 * además da progreso de subida.
 */

import { File, UploadType } from 'expo-file-system'
import { API_BASE_URL } from './config'
import { ApiError, NetworkError, type ApiErrorBody } from './ApiError'
import { refreshSession } from './http'

/** Los mismos valores del enum DocumentType del backend. */
export type DocumentType =
  | 'IDENTITY_FRONT'
  | 'IDENTITY_BACK'
  | 'PASSPORT'
  | 'PROFESSIONAL_LICENSE'

export type IdentityKind = 'DNI' | 'NIE' | 'PASSPORT'

export interface UploadFile {
  uri: string
  name: string
  mimeType: string
}

export interface AvatarResponse {
  avatarUrl: string
}

export interface JobPhotoResponse {
  id: string
  /** Ruta relativa desde la que se sirve; exige sesión para descargarla */
  url: string
  position: number
  sizeBytes: number
}

/** Una foto del trabajo de un profesional, ya guardada. */
export interface ProPhotoResponse {
  id: string
  /** Ruta desde la que se sirve; pública, se ve en el directorio */
  url: string
  /** De qué oficio es: la tarjeta de limpieza no enseña fotos de carpintería */
  tradeSlug: string
  tradeLabel: string
  position: number
}

export interface DocumentResponse {
  id: string
  type: DocumentType
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  sizeBytes: number
  createdAt: string
}

interface RawResponse {
  status: number
  body: string
}

async function send(
  path: string,
  file: UploadFile,
  accessToken: string,
  fields: Record<string, string>,
): Promise<RawResponse> {
  try {
    const result = await new File(file.uri).upload(`${API_BASE_URL}${path}`, {
      httpMethod: 'POST',
      uploadType: UploadType.MULTIPART,
      // El backend lee la parte llamada `file`
      fieldName: 'file',
      mimeType: file.mimeType,
      parameters: fields,
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
        // El Content-Type con su `boundary` lo pone la capa nativa
      },
    })

    return { status: result.status, body: result.body }
  } catch (error) {
    throw new NetworkError(
      `No se pudo subir el fichero. ${error instanceof Error ? error.message : ''}`.trim(),
    )
  }
}

async function uploadMultipart<T>(
  path: string,
  file: UploadFile,
  accessToken: string,
  fields: Record<string, string> = {},
): Promise<T> {
  let response = await send(path, file, accessToken, fields)

  /**
   * Igual que en `apiRequest`: si el access token ha caducado se renueva la
   * sesión y se reintenta UNA vez. Sin esto, subir una foto quince minutos
   * después de entrar fallaba con un 401 que nadie resolvía.
   */
  if (response.status === 401) {
    const renewed = await refreshSession()
    if (renewed) {
      response = await send(path, file, renewed, fields)
    }
  }

  const parsed: unknown = response.body ? JSON.parse(response.body) : null

  if (response.status < 200 || response.status >= 300) {
    throw new ApiError(response.status, (parsed ?? {}) as ApiErrorBody)
  }

  return parsed as T
}

export const uploadApi = {
  avatar: (file: UploadFile, accessToken: string) =>
    uploadMultipart<AvatarResponse>('/v1/me/avatar', file, accessToken),

  /**
   * Una foto de un trabajo. El servidor admite cuatro por trabajo y las
   * numera por orden de llegada, así que se suben de una en una y en orden.
   */
  jobPhoto: (jobId: string, file: UploadFile, accessToken: string) =>
    uploadMultipart<JobPhotoResponse>(`/v1/jobs/${jobId}/photos`, file, accessToken),

  /**
   * Una foto de su trabajo, con el oficio al que pertenece.
   *
   * El servidor admite cinco POR OFICIO y las numera por orden de llegada, así
   * que se suben de una en una y en orden. El oficio no es opcional: sin él la
   * foto no sabría en qué listado enseñarse.
   */
  proPhoto: (file: UploadFile, tradeSlug: string, accessToken: string) =>
    uploadMultipart<ProPhotoResponse>('/v1/pro/photos', file, accessToken, {
      tradeSlug,
    }),

  document: (
    file: UploadFile,
    type: DocumentType,
    accessToken: string,
    identityKind?: IdentityKind,
  ) =>
    uploadMultipart<DocumentResponse>('/v1/me/documents', file, accessToken, {
      type,
      ...(identityKind ? { identityKind } : {}),
    }),
}
