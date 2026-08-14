/**
 * Secure Storage Adapter
 *
 * OWASP M9: Insecure Data Storage
 * Los tokens y datos sensibles DEBEN ir en expo-secure-store (Keychain/Keystore),
 * NUNCA en AsyncStorage que no está cifrado.
 *
 * Este adapter implementa la interfaz de StateStorage de Zustand
 * para que los stores puedan persistir de forma segura.
 */

import * as SecureStore from 'expo-secure-store'

export interface SecureStorageAdapter {
  getItem: (key: string) => Promise<string | null>
  setItem: (key: string, value: string) => Promise<void>
  removeItem: (key: string) => Promise<void>
}

/**
 * Adapter seguro para tokens y datos sensibles
 * Compatible con la interfaz StateStorage de zustand/middleware
 */
export const secureStorage: SecureStorageAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(key)
    } catch (error) {
      console.error(`[SecureStorage] Error al leer ${key}:`, error)
      return null
    }
  },

  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(key, value)
    } catch (error) {
      console.error(`[SecureStorage] Error al guardar ${key}:`, error)
      throw error
    }
  },

  removeItem: async (key: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(key)
    } catch (error) {
      console.error(`[SecureStorage] Error al borrar ${key}:`, error)
      throw error
    }
  },
}

/**
 * Claves permitidas para almacenamiento seguro.
 * IMPORTANTE: Solo datos que DEBEN estar cifrados:
 * - Tokens de autenticación
 * - Refresh tokens
 * - Datos biométricos
 *
 * PROHIBIDO almacenar:
 * - Datos de tarjetas (siempre tokenizados por Stripe)
 * - Documentos de identidad (se suben y borran)
 * - Contraseñas en claro
 */
export const SECURE_KEYS = {
  ACCESS_TOKEN: 'lughly.auth.access',
  REFRESH_TOKEN: 'lughly.auth.refresh',
  USER_ID: 'lughly.auth.userId',
  ROLE: 'lughly.auth.role',
} as const

export type SecureKey = (typeof SECURE_KEYS)[keyof typeof SECURE_KEYS]
