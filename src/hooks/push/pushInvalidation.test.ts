/**
 * De un aviso a lo que hay que volver a pedir.
 *
 * Es una tabla de traducción, y por eso se prueba entera: **ninguno de estos
 * fallos se ve al ocurrir**. Un `screen` mal enrutado no da error ni pinta
 * nada raro; simplemente la pantalla se queda enseñando lo de antes, que es
 * exactamente el síntoma que esto viene a arreglar y que nadie sabría
 * distinguir de "todavía no ha llegado el aviso".
 */

import { keysToInvalidate, readPushData, LIVE_QUERY_KEYS } from './pushInvalidation'

/** Si una lista de claves contiene esta, comparando por contenido */
const incluye = (keys: unknown[], key: unknown[]) =>
  keys.some((candidate) => JSON.stringify(candidate) === JSON.stringify(key))

describe('keysToInvalidate', () => {
  it('un cambio en un trabajo recarga los trabajos y la agenda del profesional', () => {
    const keys = keysToInvalidate({ screen: 'jobs', jobId: 'job-1' })

    expect(incluye(keys, ['jobs'])).toBe(true)
    expect(incluye(keys, ['pro', 'agenda'])).toBe(true)
    expect(incluye(keys, ['pro', 'assignments'])).toBe(true)
  })

  /**
   * El backend escribe `screen: 'jobs'` en nueve sitios y `screen: 'job'` en
   * cuatro para decir lo mismo. Se aceptan las dos: un aviso ya encolado en
   * Expo seguirá trayendo la que traía, y perderlo dejaría el trabajo sin
   * refrescar justo al empezar o al terminar.
   */
  it('acepta las dos escrituras del backend, "job" y "jobs"', () => {
    expect(keysToInvalidate({ screen: 'job', jobId: 'job-1' })).toEqual(
      keysToInvalidate({ screen: 'jobs', jobId: 'job-1' }),
    )
  })

  it('un encargo nuevo recarga la bandeja', () => {
    const keys = keysToInvalidate({ screen: 'inbox', jobId: 'job-1' })

    expect(incluye(keys, ['pro', 'inbox'])).toBe(true)
  })

  /**
   * Por la raíz y no por la conversación: el aviso trae `threadId` y las
   * conversaciones se guardan por `jobId`, así que no hay forma de afinar. La
   * raíz cubre los hilos, el contador de no leídos y la conversación abierta.
   */
  it('un mensaje recarga todo el chat, incluido el contador de no leídos', () => {
    expect(keysToInvalidate({ screen: 'chat', threadId: 'hilo-1' })).toEqual([['chat']])
  })

  it('una urgencia recarga las urgencias', () => {
    expect(incluye(keysToInvalidate({ screen: 'urgent', jobId: 'job-1' }), ['urgencies'])).toBe(
      true,
    )
  })

  it('la cuenta de cobro recarga los pagos y lo que le falta al perfil', () => {
    const keys = keysToInvalidate({ screen: 'account' })

    expect(incluye(keys, ['payments'])).toBe(true)
    expect(incluye(keys, ['pro', 'checklist'])).toBe(true)
  })

  describe('lo que esta versión de la app no conoce', () => {
    /**
     * Una app instalada no se actualiza a la vez que el servidor. Si un
     * `screen` nuevo no refrescara nada, el usuario recibiría el aviso y
     * seguiría viendo lo viejo, sin ninguna pista de por qué.
     */
    it('un screen desconocido refresca lo que caduca solo', () => {
      expect(keysToInvalidate({ screen: 'inventado-en-2027' })).toEqual(LIVE_QUERY_KEYS)
    })

    it('y un aviso sin datos, también', () => {
      expect(keysToInvalidate(undefined)).toEqual(LIVE_QUERY_KEYS)
      expect(keysToInvalidate({})).toEqual(LIVE_QUERY_KEYS)
    })
  })
})

describe('readPushData', () => {
  /**
   * Lo que llega es JSON de fuera: puede venir con cualquier forma, y un
   * `screen` que no sea texto no puede tumbar el listener —dejaría de
   * refrescarse todo lo demás—.
   */
  it('se queda solo con lo que es texto', () => {
    expect(readPushData({ screen: 7, jobId: 'job-1', threadId: null })).toEqual({
      screen: undefined,
      jobId: 'job-1',
      threadId: undefined,
    })
  })

  it('aguanta lo que no es un objeto', () => {
    expect(readPushData(null)).toEqual({})
    expect(readPushData('texto suelto')).toEqual({})
  })
})
