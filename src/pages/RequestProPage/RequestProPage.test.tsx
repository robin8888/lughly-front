/**
 * Que el formulario diga qué le falta.
 *
 * El botón exige cinco cosas y no decía ninguna: se rellenaba, se veía
 * completo, y no pasaba nada al pulsarlo. Un callejón sin salida, porque desde
 * fuera no hay forma de saber cuál de las cinco falla —y dos de ellas no se
 * ven: que la descripción pide veinte caracteres y que la dirección hay que
 * **elegirla de las sugerencias**, no escribirla—.
 *
 * Es el mismo fallo que ya se arregló una vez en el alta ("Formularios que
 * dicen qué les falta", 26 Agosto 2026), y vuelve por el mismo sitio: la regla
 * vive solo en la condición del botón.
 */

import { fireEvent, render, screen } from '@testing-library/react-native'
import { RequestProPage } from './RequestProPage'

const PRO = {
  id: 'pro-1',
  name: 'Robinson Rodriguez',
  trades: [{ slug: 'electricidad', label: 'Electricidad', hourlyRate: 75, visitFee: null }],
  employerName: null,
}

jest.mock('@/hooks/domain/useProProfile', () => ({
  useProProfile: () => ({ data: PRO, isPending: false, isError: false }),
}))

jest.mock('@/hooks/domain/useRequestPro', () => ({
  useRequestPro: () => ({
    request: jest.fn(),
    isRequesting: false,
    fieldErrors: {},
    formError: null,
    reset: jest.fn(),
  }),
}))

function abrir() {
  return render(
    <RequestProPage proId="pro-1" type="INSTANT" onBack={() => {}} onSent={() => {}} />,
  )
}

describe('RequestProPage: qué falta para poder enviar', () => {
  it('recién abierto, el botón está apagado y dice qué falta', () => {
    abrir()

    expect(screen.getByTestId('request-send')).toBeDisabled()
    expect(screen.getByTestId('request-missing')).toHaveTextContent(/la descripción/)
  })

  /**
   * Un formulario recién abierto no puede salir en rojo: todavía no ha hecho
   * nada mal nadie. Lo vacío se dice debajo del botón, no en el campo.
   */
  it('lo que está vacío no se marca en rojo', () => {
    abrir()

    expect(screen.queryByText(/Te falta/)).toBeNull()
  })

  /**
   * Y en cuanto se escribe algo corto, el campo lo dice **contando lo que
   * falta**. «Mínimo 20» obliga a contar a mano; «te faltan 4» no.
   */
  it('con una descripción corta, el campo dice cuántos caracteres faltan', () => {
    abrir()

    fireEvent.changeText(screen.getByTestId('request-description'), 'Cambiar bombilla')

    expect(screen.getByText('Te faltan 4 caracteres.')).toBeTruthy()
  })

  it('y al llegar a los veinte, el error desaparece', () => {
    abrir()

    fireEvent.changeText(
      screen.getByTestId('request-description'),
      'Cambiar la bombilla del pasillo',
    )

    expect(screen.queryByText(/Te falta/)).toBeNull()
  })

  it('el título corto también se cuenta', () => {
    abrir()

    fireEvent.changeText(screen.getByTestId('request-title'), 'Grifo')

    expect(screen.getByText('Te faltan 3 caracteres.')).toBeTruthy()
  })

  /**
   * La que más despista: el campo se ve lleno y por dentro está a nulo, porque
   * `address` solo se rellena al elegir una sugerencia —de ahí salen las
   * coordenadas—. Decir "la dirección" a secas no bastaría: quien la tiene
   * escrita delante no entendería qué falta.
   */
  it('la dirección se dice con la instrucción, no a secas', () => {
    abrir()

    expect(screen.getByTestId('request-missing')).toHaveTextContent(
      /elígela de las sugerencias/,
    )
  })

  it('con todo relleno menos la dirección, solo queda ella', () => {
    abrir()

    fireEvent.changeText(screen.getByTestId('request-title'), 'Cambiar el grifo')
    fireEvent.changeText(
      screen.getByTestId('request-description'),
      'Gotea desde hace una semana y no para.',
    )
    fireEvent.changeText(screen.getByTestId('request-city'), 'Madrid')

    const falta = screen.getByTestId('request-missing')

    expect(falta).toHaveTextContent(/^Falta la dirección/)
    expect(falta).not.toHaveTextContent(/la descripción/)
    expect(screen.getByTestId('request-send')).toBeDisabled()
  })
})
