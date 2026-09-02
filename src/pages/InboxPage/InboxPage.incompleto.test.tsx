/**
 * Lo que le falta para poder aceptar, dicho donde se acepta.
 *
 * Aceptar es comprometerse a presentarse en casa de alguien y cobrar por ello:
 * sin horario puesto —lo que vio el cliente era una suposición nuestra— y sin
 * documento de identidad, el servidor lo rechaza. Enterarse **al pulsar**, con
 * el reloj de 24 horas corriendo, es la peor forma de saberlo.
 */


import { fireEvent, render, screen } from '@testing-library/react-native'
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

/** La ficha a medias: ni horario ni documento */
jest.mock('@/hooks/domain/useProfileChecklist', () => ({
  useProfileChecklist: () => ({
    data: { schedule: 'MISSING', identityDocuments: 'MISSING' },
  }),
}))

jest.mock('@/hooks/domain/useIsEmployee', () => ({ useIsEmployee: () => false }))

jest.mock('@/stores/useAuthStore', () => ({
  useUser: () => ({ id: 'u1' }),
  useAccessToken: () => 'token-de-prueba',
}))

/* Con el testID, que aquí es justo lo que se busca */
jest.mock('@/components/molecules/InfoCard', () => {
  const { View } = require('react-native')
  return {
    InfoCard: ({ children, testID }: { children: ReactNode; testID?: string }) => (
      <View testID={testID}>{children}</View>
    ),
  }
})

describe('InboxPage: la ficha a medias', () => {
  const abrir = (
    onGoToSchedule = () => {},
    onGoToDocuments = () => {},
  ) =>
    render(
      <InboxPage
        onBack={() => {}}
        onGoToSchedule={onGoToSchedule}
        onGoToDocuments={onGoToDocuments}
      />,
    )

  it('avisa de lo que falta, encima de los encargos', () => {
    abrir()

    const aviso = screen.getByTestId('inbox-missing')
    expect(aviso).toHaveTextContent(/tu horario de trabajo y tu documento de identidad/)
  })

  /** Con un camino a cada cosa: decir qué falta sin llevar allí es la mitad */
  it('lleva a ponerlo, cada cosa a su sitio', () => {
    const alHorario = jest.fn()
    const alDocumento = jest.fn()

    abrir(alHorario, alDocumento)

    fireEvent.press(screen.getByTestId('inbox-missing-schedule'))
    expect(alHorario).toHaveBeenCalled()

    fireEvent.press(screen.getByTestId('inbox-missing-documents'))
    expect(alDocumento).toHaveBeenCalled()
  })

  /**
   * Y los encargos siguen ahí. Esconderlos sería peor: el reloj de 24 horas
   * corre igual, y hay que poder verlos —y rechazarlos— aunque falte la ficha.
   */
  it('no esconde los encargos ni el rechazar', () => {
    abrir()

    expect(screen.getByTestId('inbox-job-1-accept')).toBeTruthy()
    expect(screen.getByTestId('inbox-job-1-decline')).toBeTruthy()
  })
})
