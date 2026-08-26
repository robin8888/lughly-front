/**
 * Lo que el cliente ya ha visto.
 *
 * Lo que se ata es el fallo del 26 de agosto de 2026: al cliente le volvía a
 * salir el modal de "te han aceptado el trabajo" por uno que ya había visto,
 * en cuanto cerraba sesión y volvía a entrar. Todo el saco era uno solo y
 * había que vaciarlo al cambiar de cuenta, y esa ida y vuelta pasa por "sin
 * sesión", que contaba como cambio.
 */

import { useSeenAnswersStore } from './useSeenAnswersStore'

const LETI = 'user-leti'
const OTRO = 'user-admin'

describe('useSeenAnswersStore', () => {
  beforeEach(() => {
    useSeenAnswersStore.setState({ seen: {} })
  })

  it('guarda el estado con el que se vio, no un simple "visto"', async () => {
    await useSeenAnswersStore.getState().markSeen(LETI, 'job-1', 'CONTRACTED')

    expect(useSeenAnswersStore.getState().seen[LETI]).toEqual({
      'job-1': 'CONTRACTED',
    })
  })

  /**
   * El mismo trabajo puede ser rechazado, reasignado y aceptado, y cada
   * respuesta es una noticia distinta: se pisa el estado, no se añade.
   */
  it('el mismo trabajo con otro estado vuelve a ser noticia', async () => {
    const { markSeen } = useSeenAnswersStore.getState()

    await markSeen(LETI, 'job-1', 'PENDING_PRO')
    await markSeen(LETI, 'job-1', 'CONTRACTED')

    expect(useSeenAnswersStore.getState().seen[LETI]!['job-1']).toBe('CONTRACTED')
  })

  /**
   * El fallo, atado: la vuelta de Leti no la borra nadie, ni siquiera pasando
   * por otra cuenta en medio.
   */
  it('lo que vio una cuenta sigue ahí cuando vuelve a entrar', async () => {
    const { markSeen } = useSeenAnswersStore.getState()

    await markSeen(LETI, 'job-1', 'CONTRACTED')
    // Entra otra persona y ve lo suyo
    await markSeen(OTRO, 'job-9', 'CONTRACTED')

    // Y lo de Leti sigue intacto
    expect(useSeenAnswersStore.getState().seen[LETI]).toEqual({
      'job-1': 'CONTRACTED',
    })
  })

  /** Y ninguna de las dos ve lo de la otra */
  it('cada cuenta lee solo su saco', async () => {
    const { markSeen } = useSeenAnswersStore.getState()

    await markSeen(LETI, 'job-1', 'CONTRACTED')

    expect(useSeenAnswersStore.getState().seen[OTRO]).toBeUndefined()
  })
})
