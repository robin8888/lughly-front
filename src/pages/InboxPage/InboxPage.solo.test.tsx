/**
 * La bandeja de quien trabaja solo.
 *
 * A un autónomo sin gente a cargo la pregunta "¿quién va?" no le dice nada: el
 * encargo es suyo y no hay a quién mandar. Le salía igualmente, con una lista
 * de una sola opción —él— y un "No podemos" en plural. Aquí se ata que ve dos
 * botones y ninguna lista.
 *
 * Y que las fotos del cliente se ven **antes** de responder, que es lo que
 * separa decidir de adivinar.
 */

import { render, screen } from '@testing-library/react-native'
import type { ReactNode } from 'react'
import { InboxPage } from './InboxPage'

jest.mock('@/hooks/domain/useInbox', () => ({
  useInbox: () => ({
    data: {
      items: [
        {
          id: 'job-1',
          type: 'QUOTE',
          status: 'PENDING_PRO',
          appointmentStatus: null,
          title: 'Fuga en la cocina',
          description: 'Gotea por debajo del fregadero',
          trade: 'fontaneria',
          tradeLabel: 'Fontanería',
          city: 'Madrid',
          maxBudget: null,
          preferredDate: null,
          respondByAt: null,
          requestedProId: 'u1',
          requestedProName: 'Marta',
          substituteProName: null,
          photoCount: 2,
          photos: [
            { url: '/v1/media/job-photos/a_thumb.jpg', fullUrl: '/v1/media/job-photos/a.jpg' },
            { url: '/v1/media/job-photos/b_thumb.jpg', fullUrl: '/v1/media/job-photos/b.jpg' },
          ],
          createdAt: '2026-08-19T10:00:00.000Z',
          canAssignToSelf: true,
        },
      ],
    },
    isPending: false,
    isError: false,
    refetch: () => {},
  }),
  useAssignJob: () => ({ assign: () => Promise.resolve({ ok: true }), isAssigning: false }),
  useConfirmAssignment: () => ({
    confirm: () => Promise.resolve({ ok: true, error: null }),
    isConfirming: false,
  }),
  useDeclineRequest: () => ({
    decline: () => Promise.resolve({ ok: true, error: null }),
    isDeclining: false,
  }),
}))

/** Autónoma sin empresa y sin nadie a cargo */
jest.mock('@/hooks/domain/useEmployees', () => ({
  useEmployer: () => ({ data: { employer: null } }),
  useEmployees: () => ({ data: { items: [] } }),
}))

jest.mock('@/hooks/domain/useIsEmployee', () => ({ useIsEmployee: () => false }))

jest.mock('@/stores/useAuthStore', () => ({
  useUser: () => ({ id: 'u1' }),
  useAccessToken: () => 'token-de-prueba',
}))

jest.mock('@/components/molecules/InfoCard', () => {
  const { View } = require('react-native')
  return { InfoCard: ({ children }: { children: ReactNode }) => <View>{children}</View> }
})

describe('InboxPage: quien trabaja solo', () => {
  it('le da aceptar y rechazar, sin preguntarle quién va', () => {
    render(<InboxPage onBack={() => {}} />)

    expect(screen.getByTestId('inbox-job-1-accept')).toBeTruthy()
    expect(screen.getByTestId('inbox-job-1-decline')).toBeTruthy()

    // Ni la pregunta ni la lista de a quién mandar
    expect(screen.queryByText('¿Quién va?')).toBeNull()
    expect(screen.queryByTestId('inbox-job-1-assign-requested')).toBeNull()
    expect(screen.queryByTestId('inbox-job-1-assign-self')).toBeNull()
  })

  /**
   * Lo que hace falta para decidir: una fuga se valora mirándola. Antes solo
   * viajaba el recuento y la tira no existía en esta pantalla.
   */
  it('enseña las fotos del cliente antes de responder', () => {
    render(<InboxPage onBack={() => {}} />)

    expect(screen.getByText('2 fotos del cliente')).toBeTruthy()
    expect(screen.getByTestId('inbox-job-1-photo-0')).toBeTruthy()
    expect(screen.getByTestId('inbox-job-1-photo-1')).toBeTruthy()
  })
})
