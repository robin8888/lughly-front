/**
 * Catálogo de imágenes de Lughly
 *
 * Regla del proyecto: TODAS las imágenes viven en `src/images` y se consumen
 * desde aquí (`import { images } from '@/images'`), nunca con rutas relativas
 * sueltas dentro de los componentes.
 *
 * Los require() son estáticos a propósito: Metro necesita literales para
 * incluir el asset en el bundle.
 */

/**
 * Imágenes de producto (mascota Uhiro y estados de la app).
 *
 * Ya no hay `splash`: la pantalla de entrada pasó al vídeo (`videos.splash` en
 * `@/videos`). El PNG que había, `splash-uhiro.png`, se borró junto con un mp4
 * suelto que tampoco usaba nadie — el historial de git los guarda si algún día
 * hacen falta, y ahí no ocupan sitio a nadie.
 */
export const images = {
  /**
   * Logotipo de Lughly, para encabezar pantallas donde antes iba el nombre
   * escrito. 900x308 (ratio 2,921), con alfa.
   *
   * **Las letras son blancas**: solo se ve sobre fondo oscuro. Donde encabece
   * una pantalla clara hará falta otra versión, no vale reescalarla.
   *
   * Al dibujarla hay que fijar solo una dimensión y dejar la otra en `aspectRatio`,
   * porque a este ancho las letras ya son finas y deformarlas se nota.
   */
  wordmark: require('./lughly-wordmark.png'),
  /**
   * Fondo del carrusel de oficios. 1219x1290, JPG.
   *
   * **El desenfoque va horneado en el fichero**, no se calcula en el móvil.
   * Es profundidad de campo: el fondo fuera de foco y las tarjetas de oficio
   * nítidas encima, que al ser una capa aparte no hay que hacer nada para que
   * lo estén. Desenfocarlo en tiempo real costaría GPU y batería en cada
   * fotograma para un efecto que nunca cambia.
   *
   * De paso sale gratis: al perder el detalle fino, el JPEG comprime mucho
   * mejor. La foto original son 2,5 MB en PNG; nítida en JPG, 430 KB;
   * desenfocada, 87 KB — y con más calidad de compresión que antes, para que
   * los degradados del cielo no bandeen.
   *
   * Se dibuja con `cover`, así que en pantallas estrechas recorta por los
   * lados: la casa va centrada y en los bordes solo hay cielo y césped, que se
   * pueden perder sin que se note.
   */
  carruselFondo: require('./carrusel-fondo.jpg'),
  /**
   * Uhiro en el mostrador de Lughly, con el cartel que señala el buscador.
   * 1024x1024, JPG.
   *
   * Ocupa el hueco grande de la home del cliente mientras no se ha buscado
   * nada; en cuanto una búsqueda encuentra a alguien, ese hueco pasa a la
   * ilustración del oficio buscado (`tradeImages`).
   *
   * 1024 y no 640 como las de oficio: esta se dibuja a todo el ancho —hasta
   * 430 puntos— y lleva texto dentro del propio dibujo, que es lo primero que
   * se deshace al ampliar.
   *
   * Cuadrada porque el hueco lo es, y el original no: viene apaisado y vive en
   * `_fuentes/recepcion`. El recorte va **pegado al borde izquierdo**, y no
   * centrado como las de oficio: en ese borde están el rótulo de la marca y el
   * cartel que dice qué hacer —"arriba en el buscador puedes encontrar a los
   * profesionales que buscas"—, que es lo único que la escena tiene que
   * comunicar.
   *
   * Escena del 26 Agosto 2026, la segunda de ese día. **El original es 16:9
   * (1672x941), así que el recorte se lleva el 44 % del ancho**: la oficina
   * con las hormigas trabajando, el hombre señalando y el cuadro de
   * "conectamos talento, creamos oportunidades" quedan fuera enteros. Es
   * mucho, y es lo que cuesta meter una panorámica en un cuadrado; si esa
   * mitad tiene que verse, lo que hay que cambiar es la proporción del hueco
   * (`ReceptionStage.styles`, `stage`) y no el recorte —pero entonces las
   * dieciocho ilustraciones de oficio, que sí son cuadradas, se recortarían
   * por arriba y por abajo—.
   */
  recepcion: require('./recepcion.jpg'),
  asistente: require('./asistente-icono.png'),
  loader: require('./robot-hormiga-loader.png'),
  /**
   * Uhiro con el pulgar arriba y la marca debajo. 512x512 con alfa.
   *
   * Es la que sale en **todos los avisos** de la app —los `EmptyState` con
   * `illustration="greeting"`, que son casi treinta pantallas—: cuando falta
   * algo, cuando no hay nada que enseñar todavía o cuando algo no ha cargado.
   *
   * Cuadrada a propósito. El hueco donde se dibuja es de 160x160 y con
   * `contain`, así que la que había antes —vertical, 1024x1536— se quedaba en
   * 107 puntos de ancho y con aire a los lados; esta lo llena.
   */
  pulgar: require('./robot-hormiga-pulgar.png'),
  senalando: require('./robot-hormiga-senalando.png'),
  trofeo: require('./robot-hormiga-trofeo.png'),
  salud: require('./robot-hormiga-salud.png'),
} as const

export type ImageKey = keyof typeof images

/**
 * Ilustración por oficio. Las claves son los slugs de `@/utils/trades`.
 *
 * Aquí vivía un aviso sobre `pintura` e `informatica`, cuyos ficheros
 * antiguos estaban cruzados —el llamado "pintura" tenía el portátil— y el
 * mapa los recolocaba. Con las ilustraciones nuevas cada fichero se llama
 * como su oficio y el cruce desaparece.
 */
export const tradeImages = {
  /**
   * Ilustraciones de oficio, tanda del 25 Agosto 2026: medio cuerpo, cuadradas
   * y con el fondo dentro del propio fichero, para pintarlas a sangre en la
   * cuadrícula de la home. Sustituyen a los `robot-hormiga-*`, que eran cuerpo
   * entero recortado y de proporciones dispares —de 0.42 a 1.66—, así que en
   * una misma caja unas salían anchas y otras como una raja de 23 px.
   *
   * JPEG y no PNG porque llevan fondo opaco y no necesitan alfa: las
   * dieciocho ocupan 1,8 MB en vez de los 42 MB que pesan los originales.
   * Esos originales viven en `_fuentes/oficios-2026-08`, fuera del
   * repositorio, con el comando exacto para rehacerlas en su `LEEME.md`.
   *
   * Once se rehicieron esa misma tarde con otra ilustración —carpintería,
   * cerrajería, climatización, electricidad, fontanería, informática,
   * jardinería, limpieza, mecánica, pintura y transporte—, mismo formato y
   * mismo recorte. Las de antes quedaron en
   * `_fuentes/oficios-2026-08/anteriores`.
   * No queda ninguna del lote `robot-hormiga-*`.
   */
  carpinteria: require('./oficio-carpinteria.jpg'),
  electricidad: require('./oficio-electricidad.jpg'),
  fontaneria: require('./oficio-fontaneria.jpg'),
  pintura: require('./oficio-pintura.jpg'),
  jardineria: require('./oficio-jardineria.jpg'),
  informatica: require('./oficio-informatica.jpg'),
  limpieza: require('./oficio-limpieza.jpg'),
  transporte: require('./oficio-transporte.jpg'),
  cuidados: require('./oficio-cuidados.jpg'),
  dependiente: require('./oficio-dependiente.jpg'),
  domiciliario: require('./oficio-domiciliario.jpg'),
  cerrajeria: require('./oficio-cerrajeria.jpg'),
  climatizacion: require('./oficio-climatizacion.jpg'),
  mecanica: require('./oficio-mecanica.jpg'),
  belleza: require('./oficio-belleza.jpg'),
  clases: require('./oficio-clases.jpg'),
  mascotas: require('./oficio-mascotas.jpg'),
  otros: require('./oficio-otros.jpg'),
} as const

export type TradeImageKey = keyof typeof tradeImages
