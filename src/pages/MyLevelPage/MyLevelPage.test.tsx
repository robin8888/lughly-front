/**
 * Mi nivel.
 *
 * La pantalla existe por una sola cifra —cuánto falta para el siguiente
 * escalón—, así que eso es lo que se ata, junto con los dos casos en que esa
 * cifra no vale: cuando ya está arriba del todo, y cuando el volumen ya da pero
 * la revisión mensual todavía no ha pasado. Ese segundo es el que enseñaría
 * "te faltan 0,00 €" y parecería un error.
 *
 * Y que **ningún porcentaje esté escrito aquí**: llegan del servidor, que es
 * quien los cobra.
 */

import { render, fireEvent } from '@testing-library/react-native'
import type { ApiCommissionLevelState } from '@/api/payments.api'
import { MyLevelPage } from './MyLevelPage'

/*
 * Los dobles van dentro de las factorías: `jest.mock` se eleva al principio del
 * fichero y una constante de aquí abajo aún no existiría. El prefijo `mock` es
 * lo único que jest deja leer de fuera, por lo mismo.
 */
let mockEstado: Partial<ApiCommissionLevelState> = {}
let mockSinCuenta = false
let mockCargando = false
let mockError = false

const mockLadder: ApiCommissionLevelState['ladder'] = [
  { level: 'WORKER', name: 'Obrera', from: 0, rate: 10, fixedFee: 0.4, current: true },
  { level: 'FORAGER', name: 'Forrajera', from: 1000, rate: 8, fixedFee: 0.4, current: false },
  { level: 'SOLDIER', name: 'Soldado', from: 3000, rate: 6, fixedFee: 0.4, current: false },
  { level: 'QUEEN', name: 'Reina', from: 6000, rate: 4, fixedFee: 0.4, current: false },
]

const mockBase: ApiCommissionLevelState = {
  level: 'WORKER',
  name: 'Obrera',
  volume: 640,
  windowDays: 90,
  nextLevel: 'FORAGER',
  nextName: 'Forrajera',
  missingToNext: 360,
  earnedLevel: null,
  earnedName: null,
  reviewedAt: null,
  ladder: mockLadder,
}

jest.mock('@/hooks/domain/useCommissionLevel', () => ({
  useCommissionLevel: () => ({
    data: mockCargando || mockError ? undefined : { ...mockBase, ...mockEstado },
    isPending: mockCargando,
    isError: mockError,
    refetch: () => {},
    withoutAccount: mockSinCuenta,
  }),
}))

jest.mock('@/hooks/ui/useCompactNav', () => ({ useNavScrollHandler: () => undefined }))

describe('MyLevelPage', () => {
  beforeEach(() => {
    mockEstado = {}
    mockSinCuenta = false
    mockCargando = false
    mockError = false
  })

  it('dice en qué nivel está y qué paga por estarlo', () => {
    const { getByTestId } = render(
      <MyLevelPage onBack={() => {}} onOpenWallet={() => {}} />,
    )

    expect(getByTestId('level-name')).toHaveTextContent(/Obrera/)
    expect(getByTestId('level-rate')).toHaveTextContent(/10 % \+ 0,40 €/)
  })

  /** La cifra por la que existe la pantalla */
  it('dice cuánto falta para el siguiente', () => {
    const { getByTestId, getByText } = render(
      <MyLevelPage onBack={() => {}} onOpenWallet={() => {}} />,
    )

    expect(getByText('Para llegar a Forrajera')).toBeTruthy()
    expect(getByTestId('level-missing')).toHaveTextContent(/te faltan 360,00 €/)
  })

  /**
   * El nivel se revisa una vez al mes y el volumen cambia cada día. En ese rato
   * la cifra que falta es cero, y decirlo así parecería un error.
   */
  it('cuando ya se lo ha ganado pero no se ha aplicado, lo dice en vez de enseñar un cero', () => {
    mockEstado = {
      volume: 1_200,
      missingToNext: 0,
      earnedLevel: 'FORAGER',
      earnedName: 'Forrajera',
    }

    const { getByTestId, queryByTestId } = render(
      <MyLevelPage onBack={() => {}} onOpenWallet={() => {}} />,
    )

    expect(getByTestId('level-earned')).toHaveTextContent(/Ya te da para Forrajera/)
    /* En el bloque de arriba, no en la explicación del final, que también lo dice */
    expect(getByTestId('level-next')).toHaveTextContent(/el día 1/)
    expect(queryByTestId('level-missing')).toBeNull()
  })

  it('en el nivel más alto no promete un siguiente que no existe', () => {
    mockEstado = {
      level: 'QUEEN',
      name: 'Reina',
      volume: 9_000,
      nextLevel: null,
      nextName: null,
      missingToNext: null,
      ladder: mockLadder.map((step) => ({ ...step, current: step.level === 'QUEEN' })),
    }

    const { getByText, queryByTestId } = render(
      <MyLevelPage onBack={() => {}} onOpenWallet={() => {}} />,
    )

    expect(getByText(/nivel más alto/)).toBeTruthy()
    expect(queryByTestId('level-missing')).toBeNull()
    expect(queryByTestId('level-earned')).toBeNull()
  })

  /**
   * Los porcentajes vienen del servidor y no escritos aquí: uno pintado a mano
   * que no coincida con el que se cobra no lo mira nadie hasta que alguien
   * reclama por su transferencia.
   */
  it('pinta la escalera entera con las tasas que llegan', () => {
    const { getByTestId } = render(
      <MyLevelPage onBack={() => {}} onOpenWallet={() => {}} />,
    )

    expect(getByTestId('level-step-WORKER')).toHaveTextContent(/10 % \+ 0,40 €/)
    expect(getByTestId('level-step-QUEEN')).toHaveTextContent(/4 % \+ 0,40 €/)
    expect(getByTestId('level-step-SOLDIER')).toHaveTextContent(/Desde 3000,00 €/)
    expect(getByTestId('level-step-WORKER')).toHaveTextContent(/Al empezar/)
  })

  it('si el servidor cambiara las tasas, la pantalla las enseñaría sin tocarla', () => {
    mockEstado = {
      ladder: mockLadder.map((step) =>
        step.level === 'QUEEN' ? { ...step, rate: 3.5, fixedFee: 0.5 } : step,
      ),
    }

    const { getByTestId } = render(
      <MyLevelPage onBack={() => {}} onOpenWallet={() => {}} />,
    )

    expect(getByTestId('level-step-QUEEN')).toHaveTextContent(/3,50 % \+ 0,50 €/)
  })

  /**
   * Sin cuenta de cobro no hay nivel, y son dos situaciones distintas: o la
   * comisión la paga su empresa, o todavía no ha activado el cobro.
   */
  it('a quien no tiene cuenta de cobro se lo explica y le da la salida', () => {
    mockSinCuenta = true
    const cartera = jest.fn()

    const { getByTestId, queryByTestId } = render(
      <MyLevelPage onBack={() => {}} onOpenWallet={cartera} />,
    )

    expect(getByTestId('level-no-account')).toBeTruthy()
    expect(queryByTestId('level-ladder')).toBeNull()

    fireEvent.press(getByTestId('level-wallet'))
    expect(cartera).toHaveBeenCalled()
  })

  it('mientras carga no enseña un nivel a medias', () => {
    mockCargando = true

    const { getByTestId, queryByTestId } = render(
      <MyLevelPage onBack={() => {}} onOpenWallet={() => {}} />,
    )

    expect(getByTestId('level-loading')).toBeTruthy()
    expect(queryByTestId('level-name')).toBeNull()
  })

  it('un fallo de red se puede reintentar', () => {
    mockError = true

    const { getByTestId } = render(
      <MyLevelPage onBack={() => {}} onOpenWallet={() => {}} />,
    )

    expect(getByTestId('level-retry')).toBeTruthy()
  })
})
