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
/**
 * Como la devuelve de verdad el buscador: el geocodificador une con comas
 * **nombre, calle, número y ciudad**, así que el número llega suelto y no
 * pegado a la calle. Es la forma que hay que leer bien.
 */
const CON_NUMERO = { label: 'Calle Mayor, 14, Madrid', city: 'Madrid' }
/** Y la del GPS de una urgencia, que sí lo pega */
const PEGADO = { label: 'Calle Mayor 14, Madrid', city: 'Madrid' }

describe('numberFromLabel', () => {
  /** La forma real del buscador: el número, como pieza suelta */
  it('saca el número que viene como pieza suelta', () => {
    expect(numberFromLabel('Calle Mayor, 14, Madrid', 'Madrid')).toBe('14')
  })

  it('y también el que viene pegado a la calle', () => {
    expect(numberFromLabel('Calle Mayor 14, Madrid', 'Madrid')).toBe('14')
  })

  it('admite el bis a la española', () => {
    expect(numberFromLabel('Calle Mayor, 14B, Madrid', 'Madrid')).toBe('14B')
  })

  it('sin número, nada', () => {
    expect(numberFromLabel('Calle Mayor, Madrid', 'Madrid')).toBe('')
  })

  /*
    El código postal también son dígitos, y cogerlo daría un portal que no
    existe: «Calle Mayor 28013».
  */
  it('no confunde el código postal con el número', () => {
    expect(numberFromLabel('Calle Mayor, 28013 Madrid', 'Madrid')).toBe('')
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

    expect(
      composeAddressLine(PEGADO, {
        ...EMPTY_ADDRESS_DETAIL,
        number: '14',
        postcode: '28013',
      }),
    ).toBe('Calle Mayor 14, 28013 Madrid')
  })

  /**
   * Y si lo corrige, manda el suyo: el geocodificador acierta la calle y a
   * veces no el portal, y quien vive allí sabe cuál es su número.
   */
  it('el número del campo manda sobre el de la dirección elegida', () => {
    expect(
      composeAddressLine(CON_NUMERO, {
        ...EMPTY_ADDRESS_DETAIL,
        number: '16',
        postcode: '28013',
      }),
    ).toBe('Calle Mayor 16, 28013 Madrid')
  })

  /** La ciudad, una sola vez y al final: en medio se lee como un error */
  it('no repite la ciudad que ya venía en la dirección', () => {
    expect(
      composeAddressLine(CON_NUMERO, { ...EMPTY_ADDRESS_DETAIL, number: '14' }),
    ).toBe('Calle Mayor 14, Madrid')
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
