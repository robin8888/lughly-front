/**
 * La casilla del pago a cuenta del material (`CICLOS` §C6).
 *
 * Estuvo aquí unas horas el 7 de septiembre y se retiró el mismo día: se
 * guardaba `materialsUpfront`, pero no había nada capaz de liberar esa
 * retención, así que le prometía al cliente algo que nadie podía cumplir.
 *
 * Lo que se ata aquí, ahora que existe su otra mitad, es **cuándo se ofrece**:
 * solo si hay líneas de material —adelantar cero euros no es una opción— y que
 * lo que se manda al servidor sea lo que el profesional ve marcado, no lo que
 * marcó antes de borrar las piezas.
 */

import { fireEvent, render } from '@testing-library/react-native'
import { QuotePage } from './QuotePage'

jest.mock('@/hooks/domain/useJob', () => {
  const soporte = {
    /** Los presupuestos mandados, con su carga entera */
    enviados: [] as { jobId: string; payload: Record<string, unknown> }[],
  }

  return {
    soporte,
    useJob: () => ({
      data: {
        id: 'job-1',
        title: 'Ruido al frenar',
        type: 'QUOTE',
        /* Lo que el cliente pagó por la visita, que se descuenta */
        amount: 30,
      },
      isPending: false,
      isError: false,
      refetch: () => {},
    }),
    useCreateQuote: () => ({
      createQuote: (jobId: string, payload: Record<string, unknown>) => {
        soporte.enviados.push({ jobId, payload })

        return Promise.resolve({ ok: true, error: null, result: null })
      },
      isQuoting: false,
    }),
  }
})

jest.mock('@/hooks/ui/useCompactNav', () => ({ useNavScrollHandler: () => undefined }))
jest.mock('@/hooks/ui/useTabBarClearance', () => ({ useTabBarClearance: () => 0 }))

const { soporte } = jest.requireMock('@/hooks/domain/useJob')

beforeEach(() => {
  soporte.enviados.length = 0
})

/** Una línea rellena, del tipo que se le diga */
function escribirLinea(
  screen: ReturnType<typeof render>,
  kind: 'LABOUR' | 'MATERIALS',
  precio: string,
) {
  fireEvent.changeText(screen.getByTestId('quote-line-concept-0'), 'Juego de pastillas')
  fireEvent.changeText(screen.getByTestId('quote-line-price-0'), precio)

  if (kind === 'MATERIALS') {
    fireEvent.press(screen.getByTestId('quote-line-kind-0'))
    fireEvent.press(screen.getByTestId('quote-line-kind-0-option-MATERIALS'))
  }
}

describe('QuotePage: el material por adelantado', () => {
  it('sin líneas de material no se ofrece: no habría nada que adelantar', () => {
    const screen = render(
      <QuotePage jobId="job-1" onBack={() => {}} onDone={() => {}} />,
    )

    escribirLinea(screen, 'LABOUR', '90')

    expect(screen.queryByTestId('quote-materials-upfront')).toBeNull()
  })

  it('con material, la casilla dice cuánto se adelanta', () => {
    const screen = render(
      <QuotePage jobId="job-1" onBack={() => {}} onDone={() => {}} />,
    )

    escribirLinea(screen, 'MATERIALS', '138')

    expect(screen.getByTestId('quote-materials-upfront')).toBeTruthy()
    /* 138 de piezas, y el cliente paga 108: la visita ya pagada se descuenta */
    expect(screen.getByText(/Cóbrame el material por adelantado \(108,00 €\)/)).toBeTruthy()
  })

  it('marcada, el presupuesto sale con el pago a cuenta puesto', async () => {
    const screen = render(
      <QuotePage jobId="job-1" onBack={() => {}} onDone={() => {}} />,
    )

    escribirLinea(screen, 'MATERIALS', '138')
    fireEvent.press(screen.getByTestId('quote-materials-upfront'))
    fireEvent.press(screen.getByTestId('quote-send'))

    await screen.findByTestId('quote-send')

    expect(soporte.enviados).toHaveLength(1)
    expect(soporte.enviados[0]?.payload).toMatchObject({ materialsUpfront: true })
  })

  it('sin marcar, se manda como hasta ahora', async () => {
    const screen = render(
      <QuotePage jobId="job-1" onBack={() => {}} onDone={() => {}} />,
    )

    escribirLinea(screen, 'MATERIALS', '138')
    fireEvent.press(screen.getByTestId('quote-send'))

    await screen.findByTestId('quote-send')

    expect(soporte.enviados[0]?.payload).toMatchObject({ materialsUpfront: false })
  })
})
