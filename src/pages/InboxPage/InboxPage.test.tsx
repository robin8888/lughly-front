/**
 * Que no se ofrezca lo que el servidor va a rechazar.
 *
 * Al asignar, el servidor exige que el elegido tenga ese oficio dado de alta, y
 * da igual que el elegido sea uno mismo. La pantalla ofrecía "Yo mismo" siempre
 * y la plantilla entera: se pulsaba y llegaba el error. Un botón que falla
 * siempre es peor que un botón apagado que dice por qué.
 */

import { render } from '@testing-library/react-native'
import type { ReactNode } from 'react'
import { InboxPage } from './InboxPage'

/*
 * Los datos van dentro de las factorías a propósito: `jest.mock` se eleva al
 * principio del fichero y una constante de aquí abajo aún no existe cuando se
 * ejecutan.
 */
jest.mock('@/hooks/domain/useInbox', () => ({
  useInbox: () => ({
    data: {
      items: [
        {
          id: 'job-1',
          type: 'QUOTE',
          status: 'PENDING_PRO',
          appointmentStatus: null,
          title: 'Cambiar un grifo',
          description: '',
          trade: 'fontaneria',
          tradeLabel: 'Fontanería',
          city: 'Madrid',
          maxBudget: null,
          preferredDate: null,
          respondByAt: null,
          requestedProId: 'u1',
          requestedProName: 'Mi empresa',
          substituteProName: null,
          photoCount: 0,
          createdAt: '2026-08-19T10:00:00.000Z',
          // A la empresa le piden fontanería pero no la ejerce
          canAssignToSelf: false,
        },
      ],
    },
    isPending: false,
    isError: false,
    refetch: () => {},
  }),
  useAssignJob: () => ({ assign: () => Promise.resolve({ ok: true }), isAssigning: false }),
  /* El diálogo de confirmar cuelga de la pantalla aunque no haya nada que confirmar */
  useConfirmAssignment: () => ({
    confirm: () => Promise.resolve({ ok: true, error: null }),
    isConfirming: false,
  }),
  useDeclineRequest: () => ({
    decline: () => Promise.resolve({ ok: true, error: null }),
    isDeclining: false,
  }),
}))

jest.mock('@/hooks/domain/useEmployees', () => ({
  useEmployer: () => ({ data: { employer: { id: 'e1' } } }),
  useEmployees: () => ({
    data: {
      items: [
        { id: 'u2', name: 'Ana', trades: [{ slug: 'fontaneria', label: 'Fontanería' }] },
        { id: 'u3', name: 'Luis', trades: [{ slug: 'electricidad', label: 'Electricidad' }] },
      ],
    },
  }),
}))

jest.mock('@/hooks/domain/useIsEmployee', () => ({ useIsEmployee: () => false }))
jest.mock('@/hooks/ui/useCompactNav', () => ({ useNavScrollHandler: () => undefined }))
jest.mock('@/stores/useAuthStore', () => ({ useUser: () => ({ id: 'jefe' }) }))

jest.mock('@/components/molecules/InfoCard', () => {
  const { View } = require('react-native')
  return { InfoCard: ({ children }: { children: ReactNode }) => <View>{children}</View> }
})

describe('InboxPage: a quién se puede mandar', () => {
  it('apaga "Yo mismo" cuando el servidor lo rechazaría', () => {
    const { getByTestId, getByText } = render(<InboxPage onBack={() => {}} />)

    expect(getByTestId('inbox-job-1-assign-self')).toBeDisabled()
    // Y dice por qué, que es lo que permite arreglarlo
    expect(getByText('No tienes este oficio dado de alta')).toBeTruthy()
  })

  it('deja al empleado que tiene el oficio', () => {
    const { getByTestId } = render(<InboxPage onBack={() => {}} />)

    expect(getByTestId('inbox-job-1-assign-u2')).not.toBeDisabled()
  })

  it('apaga al que no lo tiene, en vez de esconderlo', () => {
    /*
     * Esconderlo sería peor: quien busca a Luis en la lista y no lo ve piensa
     * que la app ha perdido a su empleado.
     */
    const { getByTestId, getByText } = render(<InboxPage onBack={() => {}} />)

    expect(getByTestId('inbox-job-1-assign-u3')).toBeDisabled()
    expect(getByText('No tiene fontanería dado de alta')).toBeTruthy()
  })
})
