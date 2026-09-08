/**
 * Lo que se cuenta en «Cómo funciona», paso a paso.
 *
 * **Dos recorridos, y a cada uno el suyo** (decidido con Robin el 7 de
 * septiembre de 2026): quien entra con cuenta de cliente lee cómo se contrata,
 * y quien entra como profesional lee cómo se trabaja. No es la misma
 * explicación con otras palabras —son dos oficios distintos dentro de la misma
 * app— y mezclarlas dejaba media pantalla hablando de algo que quien la lee no
 * puede hacer.
 *
 * Los textos viven aquí y no dentro de la pantalla por dos motivos: se leen
 * seguidos, que es como se escriben y como se corrigen, y así la pantalla es
 * solo el mecanismo de pasar páginas.
 *
 * ## Qué cara va en cada paso
 *
 * Las tres de Albert se alternan a propósito, y no por turno: la cara
 * acompaña a lo que se cuenta. `piensa` donde hay algo que decidir o repasar,
 * `idea` donde algo se resuelve —el dinero retenido, tu nivel—, y la neutra
 * donde solo se acompaña. Cinco pasos con la misma imagen se leen como una
 * pantalla que no ha cargado.
 *
 * ## Y por qué esto es verdad y no publicidad
 *
 * Cada paso describe algo que la app hace hoy: los tres modos de cobro
 * (`JobMode`), las 24 horas para contestar (`respondByAt`), el dinero retenido
 * hasta que el trabajo se da por bueno (`Charge`), y los cuatro escalones de
 * comisión (`MyLevelPage`). Si algo de eso cambia, esto se cambia con ello:
 * una explicación que promete lo que la app no hace se paga en la primera
 * reclamación.
 */

import { images } from '@/images'

export interface HowItWorksStep {
  /** La cara que acompaña */
  image: keyof typeof images
  title: string
  body: string
}

const CLIENTE: HowItWorksStep[] = [
  {
    image: 'albert',
    title: 'Busca a quien necesitas',
    body: 'En el directorio están los profesionales de cada oficio, con sus valoraciones, su zona y su precio. Puedes filtrar por lo que haga falta y ver quién llega hasta tu casa.',
  },
  {
    image: 'albertPiensa',
    title: 'Elige cómo contratarle',
    body: 'Por horas, a precio cerrado si tiene carta de servicios, o pidiéndole que vaya a verlo y te haga un presupuesto. Cada profesional ofrece lo suyo, y el precio lo ves antes de aceptar.',
  },
  {
    image: 'albertIdea',
    title: 'Paga por la app, y no antes de tiempo',
    body: 'El dinero se retiene al contratar y no llega al profesional hasta que el trabajo está hecho y tú lo das por bueno. Nada de pagar por fuera: si algo va mal, el cobro sigue en Lughly.',
  },
  {
    image: 'albert',
    title: 'Sigue el trabajo desde el móvil',
    body: 'Sabes cuándo va de camino, cuándo empieza y cuándo termina. Y podéis escribiros por el chat mientras el trabajo esté en marcha, con fotos si hacen falta.',
  },
  {
    image: 'albertPiensa',
    title: 'Dalo por bueno y valora',
    body: 'Cuando el profesional dice que ha terminado, lo revisas. Si está bien, lo confirmas y se le paga; si no, lo dices y se queda en espera. Después le pones tu valoración, que es la que ayuda al siguiente cliente.',
  },
]

const PROFESIONAL: HowItWorksStep[] = [
  {
    image: 'albertPiensa',
    title: 'Empieza por tu ficha',
    body: 'Tus oficios y tus tarifas, tu horario, hasta dónde te desplazas y tus fotos de trabajo. Es lo que ve el cliente antes de elegirte, así que es lo primero: una ficha a medias sale de las últimas en el directorio.',
  },
  {
    image: 'albertIdea',
    title: 'Y por tu cuenta de cobro',
    body: 'Sin ella no puedes aceptar trabajos: no habría a quién mandarle el dinero. Se rellena una vez y ya está. Hasta que la tengas sales en el directorio, pero nadie puede contratarte.',
  },
  {
    image: 'albert',
    title: 'Te llegan encargos, y tienes 24 horas',
    body: 'Cuando alguien te elige, te avisamos y tienes un día para decir si puedes. Si dices que no, o si se pasa el plazo, el cliente busca a otro sin quedarse esperando.',
  },
  {
    image: 'albertIdea',
    title: 'El día del trabajo',
    body: 'Al llegar pulsas «He llegado, empiezo» —desde diez minutos antes de la hora, para no arrancar el de otro— y el reloj corre. Al acabar, marcas que has terminado y el cliente lo confirma.',
  },
  {
    image: 'albertPiensa',
    title: 'Cobras, y cuanto más trabajas menos comisión',
    body: 'El dinero sale hacia tu cuenta cuando el trabajo se da por bueno. Y la comisión baja por escalones según lo que factures: de obrera a reina, del 10 % al 4 %.',
  },
]

export function stepsFor(role: 'client' | 'pro'): HowItWorksStep[] {
  return role === 'pro' ? PROFESIONAL : CLIENTE
}
