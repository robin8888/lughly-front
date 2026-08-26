/**
 * Mis datos.
 *
 * Lo que se ata es lo que distingue esta pantalla de un formulario cualquiera:
 * que solo se manda lo que ha cambiado, que el correo no se edita, y que la
 * descripción es cosa del profesional. Los tres fallan en silencio: mandar de
 * más reescribe datos sin motivo, un correo editable puede dejar a alguien
 * fuera de su cuenta, y una descripción en la pantalla de un cliente pediría
 * algo que no se enseña en ningún sitio.
 */

import { render, fireEvent, waitFor } from '@testing-library/react-native'
import { MyProfilePage } from './MyProfilePage'

/*
 * El prefijo `mock` no es adorno: es lo único que jest deja que una factoría
 * lea de fuera, porque `jest.mock` se eleva al principio del fichero.
 */
let mockEsPro = true
const mockGuardado: unknown[] = []

/** La que tiene guardada la cuenta de prueba */
const mockDireccion = {
  label: 'Calle Virgen del Puig 4, Valencia',
  lat: 39.4699,
  lng: -0.3763,
  city: 'Valencia',
  postcode: '46013',
}

/** Y la que devuelve el geocodificador cuando se busca otra */
const mockMudanza = {
  label: 'Calle Colón 20, Valencia',
  lat: 39.4699,
  lng: -0.3701,
  city: 'Valencia',
  postcode: '46004',
}

jest.mock('@/api/geocode.api', () => ({
  geocodeApi: {
    search: () => Promise.resolve({ matches: [mockMudanza] }),
    reverse: () => Promise.resolve({ match: null }),
  },
}))

jest.mock('@/hooks/auth/useEffectiveRole', () => ({
  useEffectiveRole: () => (mockEsPro ? 'pro' : 'client'),
}))

jest.mock('@/stores/useAuthStore', () => ({
  useUser: () => ({
    id: 'u1',
    name: 'Robin',
    email: 'robin@ejemplo.test',
    phone: '600123456',
    address: mockDireccion,
  }),
}))

jest.mock('@/hooks/domain/useMyProfile', () => ({
  useMyBio: () => ({ data: { bio: 'Reformas de baño.' }, isPending: false }),
  useSaveMyProfile: () => ({
    save: (payload: unknown) => {
      mockGuardado.push(payload)
      return Promise.resolve({ ok: true, error: null })
    },
    isSaving: false,
  }),
}))

jest.mock('@/hooks/ui/useCompactNav', () => ({ useNavScrollHandler: () => undefined }))

describe('MyProfilePage', () => {
  beforeEach(() => {
    mockEsPro = true
    mockGuardado.length = 0
  })

  it('manda solo lo que ha cambiado', async () => {
    const { getByTestId } = render(<MyProfilePage onBack={() => {}} />)

    fireEvent.changeText(getByTestId('profile-name'), 'Robin Rodríguez')
    fireEvent.press(getByTestId('profile-save'))

    // Ni el teléfono ni la descripción, que no se han tocado
    await waitFor(() => expect(mockGuardado).toEqual([{ name: 'Robin Rodríguez' }]))
  })

  it('sin cambios no manda nada y lo dice', async () => {
    const { getByTestId, findByText } = render(<MyProfilePage onBack={() => {}} />)

    fireEvent.press(getByTestId('profile-save'))

    expect(await findByText('No has cambiado nada.')).toBeTruthy()
    expect(mockGuardado).toEqual([])
  })

  it('el correo se ve pero no se edita', () => {
    const { getByTestId } = render(<MyProfilePage onBack={() => {}} />)

    expect(getByTestId('profile-email').props.value).toBe('robin@ejemplo.test')
    expect(getByTestId('profile-email').props.editable).toBe(false)
  })

  it('vaciar la descripción es como se quita', async () => {
    const { getByTestId } = render(<MyProfilePage onBack={() => {}} />)

    fireEvent.changeText(getByTestId('profile-bio'), '')
    fireEvent.press(getByTestId('profile-save'))

    await waitFor(() => expect(mockGuardado).toEqual([{ bio: '' }]))
  })

  it('al cliente no se le pide descripción: no tiene ficha donde se lea', () => {
    mockEsPro = false

    const { queryByTestId } = render(<MyProfilePage onBack={() => {}} />)

    expect(queryByTestId('profile-bio')).toBeNull()
    expect(queryByTestId('profile-name')).toBeTruthy()
  })

  /**
   * La dirección se edita **aquí**, donde se editan los demás datos de la
   * persona. Se hizo obligatoria en el alta, así que sin esto era el único
   * campo exigido que nadie podía cambiar después: una trampa para cualquiera
   * que se mude.
   */
  it('trae la dirección guardada y deja cambiarla por otra', async () => {
    const screen = render(<MyProfilePage onBack={() => {}} />)

    expect(screen.getByTestId('profile-address').props.value).toBe(
      mockDireccion.label,
    )

    fireEvent.changeText(screen.getByTestId('profile-address'), 'Calle Colón')
    fireEvent.press(
      await screen.findByTestId(
        `profile-address-match-${mockMudanza.lat},${mockMudanza.lng}`,
      ),
    )
    fireEvent.press(screen.getByTestId('profile-save'))

    await waitFor(() =>
      expect(mockGuardado).toEqual([{ address: mockMudanza }]),
    )
  })

  /**
   * Escribir sin elegir deja el campo sin coordenadas, y `changes()` lo
   * descarta. Sin este aviso, guardar respondería "no has cambiado nada" justo
   * después de haber escrito la calle nueva.
   */
  it('avisa si se escribió una dirección sin elegirla de la lista', async () => {
    const screen = render(<MyProfilePage onBack={() => {}} />)

    fireEvent.changeText(screen.getByTestId('profile-address'), 'Calle Colón 20')
    fireEvent.press(screen.getByTestId('profile-save'))

    expect(
      await screen.findByText('Elige tu dirección de la lista de sugerencias.'),
    ).toBeTruthy()
    expect(mockGuardado).toEqual([])
  })

  it('no deja guardar un nombre de una letra', () => {
    const { getByTestId } = render(<MyProfilePage onBack={() => {}} />)

    fireEvent.changeText(getByTestId('profile-name'), 'R')

    expect(getByTestId('profile-save')).toBeDisabled()
  })
})
