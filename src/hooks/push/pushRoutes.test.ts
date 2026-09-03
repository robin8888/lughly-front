/**
 * A dónde lleva cada aviso.
 *
 * Se prueba con tabla porque equivocarse aquí **no se ve**: la app abre en otro
 * sitio y desde fuera parece que el aviso «no hizo nada». Los valores de
 * `screen` son los que manda el servidor hoy —comprobados con un `grep` sobre
 * `lughly-backend`— y si aparece uno nuevo, lo que tiene que pasar es que no
 * mueva a nadie, no que abra cualquier cosa.
 */

import { routeFor } from './pushRoutes'

describe('routeFor', () => {
  /**
   * El caso de la mayoría de los avisos: han empezado, han terminado, te lo
   * han aceptado, el cliente pide una corrección. Todos acaban en la ficha,
   * que es donde están los botones para contestar.
   */
  it('un trabajo lleva a su ficha', () => {
    expect(routeFor({ screen: 'job', jobId: 'job-1' })).toEqual({
      pathname: '/trabajo/[id]',
      params: { id: 'job-1' },
    })
  })

  /** El servidor manda las dos escrituras y significan lo mismo */
  it('«jobs» y «job» llevan al mismo sitio', () => {
    expect(routeFor({ screen: 'jobs', jobId: 'job-1' })).toEqual(
      routeFor({ screen: 'job', jobId: 'job-1' }),
    )
  })

  /** Sin ficha que abrir, la lista: ahí lo que ha cambiado sale arriba */
  it('un trabajo sin id lleva a la lista', () => {
    expect(routeFor({ screen: 'jobs' })).toEqual({ pathname: '/jobs' })
  })

  /**
   * Quien recibe esto está esperando con una avería delante: lo que necesita
   * es la lista de quién puede ir, no un resumen del trabajo.
   */
  it('una urgencia lleva a elegir a quién llamar', () => {
    expect(routeFor({ screen: 'urgent', jobId: 'job-9' })).toEqual({
      pathname: '/urgencia/[id]',
      params: { id: 'job-9' },
    })
  })

  it('un mensaje lleva a su conversación', () => {
    expect(routeFor({ screen: 'chat', jobId: 'job-1' })).toEqual({
      pathname: '/mensajes/trabajo/[id]',
      params: { id: 'job-1' },
    })
  })

  /**
   * A la bandeja y no al trabajo suelto, aunque venga el id: aquí lo que hay
   * que hacer es responder, y responder se hace con el resto de lo pendiente
   * a la vista.
   */
  it('un encargo por responder lleva a la bandeja', () => {
    expect(routeFor({ screen: 'inbox', jobId: 'job-1' })).toEqual({
      pathname: '/encargos',
    })
  })

  it('lo de la cuenta lleva a la cuenta', () => {
    expect(routeFor({ screen: 'account' })).toEqual({ pathname: '/account' })
  })

  /**
   * Y lo que no se reconoce **no mueve a nadie**. Abrir una pantalla al azar es
   * peor que abrir por donde estaba: pasa con un aviso de una versión más nueva
   * del servidor, y el usuario no tiene por qué pagarlo con un salto.
   */
  it('un aviso que no dice a dónde no lleva a ninguna parte', () => {
    expect(routeFor({})).toBeNull()
    expect(routeFor({ screen: 'algo-que-no-existe', jobId: 'job-1' })).toBeNull()
  })

  it('una urgencia o un chat sin id tampoco', () => {
    expect(routeFor({ screen: 'urgent' })).toBeNull()
    expect(routeFor({ screen: 'chat' })).toBeNull()
  })
})
