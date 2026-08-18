/**
 * La regla de qué cuenta como documento de identidad.
 *
 * Está escrita dos veces a propósito: aquí y en el servidor
 * (`common/identity-documents.ts`). Repetirla permite avisar ANTES de que el
 * usuario pulse, en vez de dejarle descubrir la puerta al chocar con ella.
 *
 * El precio de repetirla es que pueden separarse, y entonces la app diría una
 * cosa y el servidor otra. Estos casos son los mismos que los del backend: si
 * alguien cambia allí la regla y no aquí, el fallo salta en los dos sitios.
 */

import { hasIdentityDocuments } from './useMyDocuments'
import type { ApiDocument } from '@/api/me.api'

const doc = (type: ApiDocument['type']): ApiDocument => ({
  id: `id-${type}`,
  type,
  status: 'PENDING',
  rejectionReason: null,
  createdAt: '2026-08-18T10:00:00.000Z',
})

describe('hasIdentityDocuments', () => {
  it('el pasaporte basta por sí solo', () => {
    expect(hasIdentityDocuments([doc('PASSPORT')])).toBe(true)
  })

  it('el DNI necesita las dos caras', () => {
    expect(
      hasIdentityDocuments([doc('IDENTITY_FRONT'), doc('IDENTITY_BACK')]),
    ).toBe(true)
  })

  it('una sola cara no identifica a nadie', () => {
    expect(hasIdentityDocuments([doc('IDENTITY_FRONT')])).toBe(false)
    expect(hasIdentityDocuments([doc('IDENTITY_BACK')])).toBe(false)
  })

  it('sin nada, no', () => {
    expect(hasIdentityDocuments([])).toBe(false)
  })

  it('la habilitación profesional no acredita identidad', () => {
    // Acredita que puede ejercer un oficio, no quién es
    expect(hasIdentityDocuments([doc('PROFESSIONAL_LICENSE')])).toBe(false)
  })

  it('cuenta aunque esté sin revisar, que hoy es siempre', () => {
    /*
     * Nada aprueba documentos todavía: no hay panel de backoffice. Si esto
     * exigiera `APPROVED`, la puerta no la pasaría nadie nunca.
     */
    const pendiente = { ...doc('PASSPORT'), status: 'PENDING' as const }

    expect(hasIdentityDocuments([pendiente])).toBe(true)
  })
})
