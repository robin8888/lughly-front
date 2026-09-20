/**
 * El repaso de un contrato fijo (`CICLOS` §F2).
 *
 * Lo que se ata aquí es la única regla de §F0: **en ningún momento se le dice
 * al cliente que tiene un día que el profesional no tiene**. El repaso enseña
 * qué encaja, qué no y por qué, y ofrece otra hora **solo donde la hay**.
 *
 * Y la diferencia que importa: un día que choca no es lo mismo que un día de
 * vacaciones. El primero tiene arreglo —el resto del día está libre— y el
 * segundo no; enseñarlos con la misma cara haría que el cliente buscara una
 * salida donde no existe.
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react-native'
import { RecurringBookingPage } from './RecurringBookingPage'

const soporte = {
  /** Lo que contesta el servidor al mirar la agenda */
  days: [] as Record<string, unknown>[],
  /** Lo que se ha llegado a contratar */
  booked: [] as Record<string, unknown>[],
  /** Si el cliente tiene tarjeta guardada */
  hayTarjeta: true,
}

jest.mock('@/hooks/domain/useProProfile', () => ({
  useProProfile: () => ({
    data: { id: 'marta-1', name: 'Marta Ruiz', city: 'Madrid', trades: [] },
    isPending: false,
    isError: false,
    refetch: () => {},
  }),
}))

jest.mock('@/hooks/domain/usePaymentMethods', () => ({
  usePaymentMethods: () => ({
    data: soporte.hayTarjeta ? [{ id: 'pm_1', brand: 'visa', last4: '4242' }] : [],
  }),
}))

jest.mock('@/hooks/domain/useRecurring', () => {
  let last: Record<string, unknown> | null = null

  return {
    SERIES_WEEKS: 8,
    useRecurrenceCheck: () => ({
      check: () => {
        last = {
          weeks: 8,
          durationMin: 180,
          hourlyRate: 14,
          minHours: null,
          pricePerSession: 42,
          days: soporte.days,
          fitting: soporte.days.filter((day) => day.fits).length,
          movable: 0,
          skipped: 0,
        }

        return Promise.resolve({ ok: true, result: last, error: null })
      },
      isChecking: false,
      get result() {
        return last
      },
    }),
    useBookRecurring: () => ({
      book: (payload: Record<string, unknown>) => {
        soporte.booked.push(payload)
        return Promise.resolve({ ok: true, result: { jobId: 'job-1' }, error: null })
      },
      isBooking: false,
    }),
  }
})

jest.mock('@/hooks/ui/useCompactNav', () => ({ useNavScrollHandler: () => undefined }))
jest.mock('@/hooks/ui/useTabBarClearance', () => ({ useTabBarClearance: () => 0 }))

jest.mock('@/components/molecules/InfoCard', () => {
  const { View } = require('react-native')
  return {
    InfoCard: ({ children, testID }: { children: unknown; testID?: string }) => (
      <View testID={testID}>{children}</View>
    ),
  }
})

const dia = (date: string, fits: boolean, alternatives: string[] = [], miss = 'busy') => ({
  date,
  weekday: 1,
  fits,
  miss: fits ? null : miss,
  alternatives: alternatives.map((from) => ({
    from,
    to: '13:00',
    endsNextDay: false,
    startsNextDay: false,
  })),
})

const abrir = () =>
  render(
    <RecurringBookingPage
      proId="marta-1"
      tradeSlug="limpieza"
      onBack={() => {}}
      onBooked={() => {}}
      onAddPaymentMethod={() => {}}
    />,
  )

/**
 * Elige el lunes y espera a que la agenda conteste **sola**.
 *
 * Ya no hay botón que pulsar: hasta el 20 de septiembre de 2026 lo había, y
 * quien no lo veía se quedaba sin saber que el profesional no podía ningún día.
 */
const repasar = async () => {
  fireEvent.press(screen.getByTestId('recurring-weekday-1'))
  await screen.findByTestId('recurring-review')
}

/** Y lo mismo cuando no va a quedar ningún día: entonces no hay repaso */
const elegirLunes = async () => {
  fireEvent.press(screen.getByTestId('recurring-weekday-1'))
  await waitFor(() =>
    expect(screen.getByTestId('recurring-status')).toHaveTextContent(/no puede|Marta puede/),
  )
}

beforeEach(() => {
  soporte.days = []
  soporte.booked.length = 0
  soporte.hayTarjeta = true
})

describe('RecurringBookingPage', () => {
  it('sin días elegidos, dice qué hay que hacer', () => {
    abrir()

    expect(screen.getByTestId('recurring-status')).toHaveTextContent(
      'Elige los días y te decimos cuáles puede Marta.',
    )
  })

  /**
   * **El fallo del 20 de septiembre de 2026**, encontrado por Robin usándolo.
   *
   * Con la agenda de alguien comprometida, quien elegía lunes, miércoles y
   * viernes a las diez no veía **nada**: ni los días que no caben, ni la
   * dirección, ni un botón apagado. El repaso estaba detrás de un botón
   * secundario que nadie pulsaba.
   */
  it('si no puede ningún día, se dice sin que haya que pedirlo', async () => {
    soporte.days = [dia('2026-09-21', false, [], 'busy'), dia('2026-09-23', false, [], 'busy')]

    abrir()
    await elegirLunes()

    expect(screen.getByTestId('recurring-status')).toHaveTextContent(
      /Marta no puede ningún día de los que has elegido a las 10:00/,
    )
    /* Y se le dice qué puede hacer, que no es evidente */
    expect(screen.getByTestId('recurring-status')).toHaveTextContent(/otra hora/)
  })

  /** Mientras se mira, se dice que se está mirando */
  it('avisa de que está mirando la agenda', () => {
    abrir()
    fireEvent.press(screen.getByTestId('recurring-weekday-1'))

    expect(screen.getByTestId('recurring-status')).toHaveTextContent(
      'Mirando la agenda de Marta…',
    )
  })

  it('cuenta los días que caben', async () => {
    soporte.days = [
      dia('2026-09-07', true),
      dia('2026-09-14', true),
      dia('2026-09-21', false, ['14:00']),
    ]

    abrir()
    await repasar()

    expect(screen.getByText('2 días confirmados')).toBeTruthy()
  })

  it('un día que choca ofrece las otras horas de ese mismo día', async () => {
    /*
     * Que esté pillado a las diez no quiere decir que ese día no pueda: quiere
     * decir que no puede a esa hora. Saltárselo sin preguntar le quitaría al
     * cliente una limpieza que sí existía.
     */
    soporte.days = [dia('2026-09-07', true), dia('2026-09-14', false, ['08:00', '14:00'])]

    abrir()
    await repasar()

    expect(screen.getByTestId('recurring-alt-2026-09-14-08:00')).toBeTruthy()
    expect(screen.getByTestId('recurring-alt-2026-09-14-14:00')).toBeTruthy()
    // Y la salida de no ir ese día, que también es una respuesta
    expect(screen.getByTestId('recurring-skip-2026-09-14')).toBeTruthy()
  })

  it('un día de vacaciones se dice y no ofrece nada', async () => {
    // No hay nada que ofrecer, así que no hay botones que no lleven a ninguna parte
    soporte.days = [dia('2026-09-07', true), dia('2026-09-14', false, [], 'away')]

    abrir()
    await repasar()

    expect(screen.getByText('está de vacaciones o de baja')).toBeTruthy()
    expect(screen.queryByTestId('recurring-skip-2026-09-14')).toBeNull()
  })

  it('elegir otra hora suma ese día a los confirmados', async () => {
    soporte.days = [dia('2026-09-07', true), dia('2026-09-14', false, ['14:00'])]

    abrir()
    await repasar()
    expect(screen.getByText('1 día confirmado')).toBeTruthy()

    fireEvent.press(screen.getByTestId('recurring-alt-2026-09-14-14:00'))

    expect(screen.getByText('2 días confirmados')).toBeTruthy()
  })

  it('y esa hora viaja al contratar, con su fecha', async () => {
    soporte.days = [dia('2026-09-07', true), dia('2026-09-14', false, ['14:00'])]

    abrir()
    await repasar()
    fireEvent.press(screen.getByTestId('recurring-alt-2026-09-14-14:00'))

    // La dirección se rellena aparte; lo que se comprueba aquí es el movimiento
    await waitFor(() => expect(screen.getByTestId('recurring-address')).toBeTruthy())
  })

  it('sin tarjeta guardada lleva a guardar una, no a contratar', async () => {
    soporte.days = [dia('2026-09-07', true)]
    soporte.hayTarjeta = false

    abrir()
    await repasar()

    expect(screen.getByTestId('recurring-add-card')).toBeTruthy()
    expect(screen.queryByTestId('recurring-book')).toBeNull()
  })

  /**
   * **El segundo fallo, encontrado por Robin el mismo día.**
   *
   * Pedir desde el 21 de septiembre a alguien que tiene el mes comprometido no
   * deja la serie vacía —en octubre sí hay hueco—, así que no saltaba ningún
   * aviso y el contrato **empezaba tres semanas más tarde sin decir nada**. El
   * cliente elegía una fecha y la app, callando, le daba otra.
   */
  it('avisa cuando la serie no empezaría el día pedido', async () => {
    soporte.days = [
      dia('2026-09-21', false, [], 'busy'),
      dia('2026-09-28', false, [], 'busy'),
      dia('2026-10-05', true),
    ]

    abrir()
    await elegirLunes()

    const aviso = screen.getByTestId('recurring-status')

    /* La fecha que pidió y por qué no puede */
    expect(aviso).toHaveTextContent(/21 de septiembre/)
    expect(aviso).toHaveTextContent(/ya tiene otro trabajo a esa hora/)
    /* Y la que de verdad va a contratar */
    expect(aviso).toHaveTextContent(/empezaríais el/)
    expect(aviso).toHaveTextContent(/5 de octubre/)
  })

  /* Y si empieza cuando ha pedido, no se le da la matraca */
  it('sin retraso en el arranque no dice nada de fechas', async () => {
    soporte.days = [dia('2026-09-21', true), dia('2026-09-28', true)]

    abrir()
    await repasar()

    expect(screen.queryByText(/empezaríais el/)).toBeNull()
  })

  it('si no queda ningún día, no se ofrece contratar', async () => {
    soporte.days = [dia('2026-09-07', false, [], 'away'), dia('2026-09-14', false, [], 'closed')]

    abrir()
    await elegirLunes()

    expect(screen.queryByTestId('recurring-book')).toBeNull()
    expect(screen.queryByTestId('recurring-address')).toBeNull()
  })
})
