/**
 * La dirección escrita a la española.
 *
 * Lo que se prueba aquí es sobre todo que **el número no se repita** y que las
 * piezas que no se rellenan no dejen comas sueltas: una dirección con «, ,» en
 * medio es la clase de detalle que hace dudar de si la app ha guardado bien lo
 * que se escribió.
 */

import {
  EMPTY_ADDRESS_DETAIL,
  composeAddressLine,
  isPostcode,
  numberFromLabel,
} from './address'

const MADRID = { label: 'Calle Mayor, Madrid', city: 'Madrid' }
const CON_NUMERO = { label: 'Calle Mayor 14, Madrid', city: 'Madrid' }

describe('numberFromLabel', () => {
  it('saca el número que ya venía en la dirección elegida', () => {
    expect(numberFromLabel('Calle Mayor 14, Madrid')).toBe('14')
  })

  it('y admite el bis a la española', () => {
    expect(numberFromLabel('Calle Mayor 14B, Madrid')).toBe('14B')
  })

  it('sin número, nada', () => {
    expect(numberFromLabel('Calle Mayor, Madrid')).toBe('')
  })

  /*
    Detrás de la coma vienen la ciudad y el código postal, que también son
    números: cogerlos daría un portal que no existe.
  */
  it('no confunde el código postal con el número', () => {
    expect(numberFromLabel('Calle Mayor, 28013 Madrid')).toBe('')
  })
})

describe('composeAddressLine', () => {
  it('junta la calle, el número y el código postal', () => {
    expect(
      composeAddressLine(MADRID, {
        ...EMPTY_ADDRESS_DETAIL,
        number: '14',
        postcode: '28013',
      }),
    ).toBe('Calle Mayor 14, 28013 Madrid')
  })

  /** Lo que evita el «Calle Mayor 14, 14» */
  it('no repite el número si la dirección elegida ya lo traía', () => {
    expect(
      composeAddressLine(CON_NUMERO, {
        ...EMPTY_ADDRESS_DETAIL,
        number: '14',
        postcode: '28013',
      }),
    ).toBe('Calle Mayor 14, 28013 Madrid')
  })

  it('escribe la escalera, el piso y la puerta como se leen', () => {
    expect(
      composeAddressLine(MADRID, {
        number: '14',
        stair: 'B',
        floor: '3',
        door: 'izq.',
        postcode: '28013',
      }),
    ).toBe('Calle Mayor 14, esc. B, 3º izq., 28013 Madrid')
  })

  /** «bajo º» no lo escribe nadie */
  it('no le pone la bolita a una planta que no es un número', () => {
    expect(
      composeAddressLine(MADRID, {
        ...EMPTY_ADDRESS_DETAIL,
        number: '14',
        floor: 'bajo',
        door: 'C',
      }),
    ).toBe('Calle Mayor 14, bajo C, Madrid')
  })

  it('lo que no se rellena no deja comas sueltas', () => {
    expect(
      composeAddressLine(MADRID, { ...EMPTY_ADDRESS_DETAIL, number: '14' }),
    ).toBe('Calle Mayor 14, Madrid')
  })
})

describe('isPostcode', () => {
  it('cinco dígitos y ni uno más', () => {
    expect(isPostcode('28013')).toBe(true)
    expect(isPostcode('2801')).toBe(false)
    expect(isPostcode('280133')).toBe(false)
    expect(isPostcode('28O13')).toBe(false)
  })
})
