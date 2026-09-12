/**
 * Lo que el profesional escribe, y quién lo cobra.
 *
 * **Desde el 12 de septiembre de 2026 el arreglo no pasa por la app** (§C6):
 * por aquí van la visita, las horas, la carta y las urgencias, y este importe
 * se lo cobra él al cliente. La casilla del pago a cuenta del material se fue
 * con el cobro — sin retención no hay adelanto que ofrecer.
 *
 * Lo que se ata aquí es que **eso se diga en la pantalla donde se escribe el
 * precio**: un profesional que termine el trabajo esperando una transferencia
 * nuestra es un problema que no se arregla con una pantalla de ayuda.
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

describe('QuotePage: quién cobra el presupuesto', () => {
  it('dice que ese importe lo cobra él, junto a la cifra', () => {
    const screen = render(
      <QuotePage jobId="job-1" onBack={() => {}} onDone={() => {}} />,
    )

    escribirLinea(screen, 'LABOUR', '90')

    expect(screen.getByTestId('quote-payment-note')).toBeTruthy()
    expect(screen.getByText(/Por la app va la visita, no el arreglo/)).toBeTruthy()
  })

  /**
   * La casilla del pago a cuenta se retiró con el cobro. Si algún día vuelve a
   * aparecer sin que vuelva la retención, esta prueba es la que tiene que
   * pararlo: prometería un adelanto que nadie puede pagar.
   */
  it('no se ofrece cobrar el material por adelantado', () => {
    const screen = render(
      <QuotePage jobId="job-1" onBack={() => {}} onDone={() => {}} />,
    )

    escribirLinea(screen, 'MATERIALS', '138')

    expect(screen.queryByTestId('quote-materials-upfront')).toBeNull()
  })

  it('el presupuesto se manda con sus líneas y su validez, y nada más de dinero', async () => {
    const screen = render(
      <QuotePage jobId="job-1" onBack={() => {}} onDone={() => {}} />,
    )

    escribirLinea(screen, 'MATERIALS', '138')
    fireEvent.press(screen.getByTestId('quote-send'))

    await screen.findByTestId('quote-send')

    expect(soporte.enviados).toHaveLength(1)
    expect(Object.keys(soporte.enviados[0]?.payload ?? {})).toEqual(['lines', 'validDays'])
  })

  it('y la visita ya pagada se descuenta del total', () => {
    const screen = render(
      <QuotePage jobId="job-1" onBack={() => {}} onDone={() => {}} />,
    )

    escribirLinea(screen, 'LABOUR', '138')

    /* 138 menos los 30 de la visita que el cliente ya pagó */
    expect(screen.getByText('108,00 €')).toBeTruthy()
  })
})
