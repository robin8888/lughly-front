/**
 * La pantalla de revisión.
 *
 * Lo que se fija aquí es la regla que protege al usuario del otro lado: no se
 * puede rechazar sin motivo. Es lo único que esa persona va a leer, y sin él se
 * queda subiendo la misma foto sin saber qué corregir.
 */

import { render, fireEvent, waitFor } from '@testing-library/react-native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Alert } from 'react-native'
import type { ReactNode } from 'react'
import { AdminDocumentsPage } from './AdminDocumentsPage'

/**
 * Las revisiones que llegarían al servidor. El doble las guarda aquí para poder
 * comprobar que lo que sale es lo que se espera —y, en el caso del rechazo sin
 * motivo, que NO sale nada—.
 */
const revisiones: unknown[] = []

/*
 * El dato va dentro de la factoría a propósito: `jest.mock` se eleva al
 * principio del fichero, así que una constante declarada aquí abajo todavía no
 * existe cuando la factoría se ejecuta.
 */
jest.mock('@/api/admin.api', () => ({
  adminApi: {
    pendingDocuments: () =>
      Promise.resolve({
        items: [
          {
            id: 'doc-1',
            type: 'IDENTITY_FRONT',
            createdAt: '2026-08-18T10:30:00.000Z',
            owner: {
              id: 'u1',
              name: 'Robin',
              email: 'robin@ejemplo.test',
              identityDocumentKind: 'DNI',
              verified: false,
            },
          },
        ],
      }),
    review: (documentId: string, approve: boolean, rejectionReason?: string) => {
      revisiones.push({ documentId, approve, rejectionReason })
      return Promise.resolve({
        id: documentId,
        status: approve ? 'APPROVED' : 'REJECTED',
        identityVerified: approve,
      })
    },
  },
}))

function envoltorio({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

const noop = () => {}

describe('AdminDocumentsPage', () => {
  beforeEach(() => {
    revisiones.length = 0
    jest.spyOn(Alert, 'alert').mockImplementation(() => {})
  })

  it('enseña de quién es el documento, para poder cotejarlo', async () => {
    const { getByText } = render(<AdminDocumentsPage onBack={noop} />, {
      wrapper: envoltorio,
    })

    await waitFor(() => expect(getByText('Robin')).toBeTruthy())
    expect(getByText(/robin@ejemplo.test/)).toBeTruthy()
  })

  it('no deja rechazar sin motivo', async () => {
    const { getByTestId } = render(<AdminDocumentsPage onBack={noop} />, {
      wrapper: envoltorio,
    })

    await waitFor(() => getByTestId('admin-document-reject-doc-1'))
    fireEvent.press(getByTestId('admin-document-reject-doc-1'))

    await waitFor(() => expect(Alert.alert).toHaveBeenCalled())
    // Lo importante: no ha salido ninguna llamada al servidor
    expect(revisiones).toHaveLength(0)
  })

  it('rechaza cuando hay motivo, y lo manda', async () => {
    const { getByTestId } = render(<AdminDocumentsPage onBack={noop} />, {
      wrapper: envoltorio,
    })

    await waitFor(() => getByTestId('admin-document-reason-doc-1'))
    fireEvent.changeText(
      getByTestId('admin-document-reason-doc-1'),
      'La foto está movida y no se lee el número',
    )
    fireEvent.press(getByTestId('admin-document-reject-doc-1'))

    await waitFor(() => expect(revisiones).toHaveLength(1))
    expect(revisiones[0]).toEqual({
      documentId: 'doc-1',
      approve: false,
      rejectionReason: 'La foto está movida y no se lee el número',
    })
  })

  it('aprobar no necesita motivo', async () => {
    const { getByTestId } = render(<AdminDocumentsPage onBack={noop} />, {
      wrapper: envoltorio,
    })

    await waitFor(() => getByTestId('admin-document-approve-doc-1'))
    fireEvent.press(getByTestId('admin-document-approve-doc-1'))

    await waitFor(() => expect(revisiones).toHaveLength(1))
    expect(revisiones[0]).toEqual({
      documentId: 'doc-1',
      approve: true,
      rejectionReason: undefined,
    })
  })
})
