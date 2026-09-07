/**
 * Ponerse en el mapa con la ubicación del móvil.
 *
 * Es el atajo del trabajador al que da de alta su empresa: ese formulario no
 * pide dirección, así que entra sin punto en el mapa y no sale en ninguna
 * búsqueda por cercanía —que es de donde vienen los trabajos— sin que nada se
 * lo diga.
 *
 * Lo que se ata aquí son las dos formas de estropearlo:
 *
 * - **Cambiarle el radio sin que lo haya pedido.** Hasta dónde se desplaza uno
 *   depende de si tiene furgoneta; el botón dice "usar mi ubicación", no
 *   "reescribir mi zona".
 * - **Borrarle la ciudad.** Es por donde se le busca en el directorio, y el
 *   geocodificador no siempre la devuelve.
 */

import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react-native'
import { useLocateMyBase } from './useLocateMyBase'

const mockMyCoverage = jest.fn()
const mockSetMyCoverage = jest.fn()
const mockShare = jest.fn()

jest.mock('@/api/pros.api', () => ({
  prosApi: {
    myCoverage: () => mockMyCoverage(),
    setMyCoverage: (payload: unknown) => mockSetMyCoverage(payload),
  },
}))

jest.mock('./useShareLocation', () => ({
  useShareLocation: () => ({ status: 'idle', share: () => mockShare() }),
}))

/** Lo que devuelve el servidor: su zona, con el radio que ya tenía */
const zonaGuardada = (radiusKm: number) => ({
  latitude: null,
  longitude: null,
  radiusKm,
  city: 'Madrid',
  postcode: null,
  region: null,
  regionName: null,
})

function envoltorio() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )
}

beforeEach(() => {
  mockMyCoverage.mockReset()
  mockSetMyCoverage.mockReset()
  mockShare.mockReset()
})

describe('useLocateMyBase', () => {
  it('guarda el punto y deja el radio que ya tenía', async () => {
    mockMyCoverage.mockResolvedValue(zonaGuardada(30))
    mockSetMyCoverage.mockResolvedValue(zonaGuardada(30))
    mockShare.mockResolvedValue({
      lat: 40.3223,
      lng: -3.8649,
      label: 'Plaza de España, Móstoles',
      city: 'Móstoles',
      postcode: '28931',
    })

    const { result } = renderHook(() => useLocateMyBase(), { wrapper: envoltorio() })

    // Sin base todavía: es lo que hace salir el aviso en su home
    await waitFor(() => expect(result.current.hasBase).toBe(false))

    await act(async () => {
      await result.current.locate()
    })

    expect(mockSetMyCoverage).toHaveBeenCalledWith({
      latitude: 40.3223,
      longitude: -3.8649,
      radiusKm: 30,
      city: 'Móstoles',
      postcode: '28931',
    })
    expect(result.current.status).toBe('done')
  })

  it('sin ciudad reconocida, no manda ciudad en vez de mandarla vacía', async () => {
    mockMyCoverage.mockResolvedValue(zonaGuardada(15))
    mockSetMyCoverage.mockResolvedValue(zonaGuardada(15))
    mockShare.mockResolvedValue({
      lat: 41.2,
      lng: -1.5,
      label: '',
      city: null,
      postcode: null,
    })

    const { result } = renderHook(() => useLocateMyBase(), { wrapper: envoltorio() })
    await waitFor(() => expect(result.current.hasBase).toBe(false))

    await act(async () => {
      await result.current.locate()
    })

    expect(mockSetMyCoverage).toHaveBeenCalledWith({
      latitude: 41.2,
      longitude: -1.5,
      radiusKm: 15,
      postcode: null,
    })
  })

  it('si dice que no al permiso, no se guarda nada', async () => {
    mockMyCoverage.mockResolvedValue(zonaGuardada(15))
    mockShare.mockResolvedValue(null)

    const { result } = renderHook(() => useLocateMyBase(), { wrapper: envoltorio() })
    await waitFor(() => expect(result.current.hasBase).toBe(false))

    await act(async () => {
      await result.current.locate()
    })

    expect(mockSetMyCoverage).not.toHaveBeenCalled()
    expect(result.current.status).toBe('denied')
  })

  it('con base puesta no hay nada que avisar', async () => {
    mockMyCoverage.mockResolvedValue({
      ...zonaGuardada(15),
      latitude: 40.4168,
      longitude: -3.7038,
    })

    const { result } = renderHook(() => useLocateMyBase(), { wrapper: envoltorio() })

    await waitFor(() => expect(result.current.hasBase).toBe(true))
  })
})
