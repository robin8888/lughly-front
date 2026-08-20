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
  subastador: require('./robot-hormiga-subastador.png'),
  trofeo: require('./robot-hormiga-trofeo.png'),
  salud: require('./robot-hormiga-salud.png'),
} as const

export type ImageKey = keyof typeof images

/**
 * Ilustración por oficio. Las claves son los slugs de `@/utils/trades`.
 *
 * **Ojo con `pintura` e `informatica`**: los dos ficheros están mal
 * nombrados. `robot-hormiga-pintura.png` es la hormiga con el portátil y
 * `robot-hormiga-informatica.png` la del bote y la brocha. Viene del diseño,
 * que ya los tenía cruzados, y por eso el mapa los cambia aquí en vez de
 * seguir el nombre del fichero.
 *
 * No se renombran los ficheros porque `Home.dc.html` y `MobileApp.dc.html`
 * los referencian con estos nombres y dejarían de verse. Se arregla el día
 * que los diseños dejen de hacer falta.
 */
export const tradeImages = {
  carpinteria: require('./robot-hormiga-carpinteria.png'),
  electricidad: require('./robot-hormiga-electricidad.png'),
  fontaneria: require('./robot-hormiga-fontaneria.png'),
  // El fichero se llama informatica, pero dentro está la brocha
  pintura: require('./robot-hormiga-informatica.png'),
  jardineria: require('./robot-hormiga-jardineria.png'),
  // Y este se llama pintura, pero dentro está el portátil
  informatica: require('./robot-hormiga-pintura.png'),
  limpieza: require('./robot-hormiga-limpieza.png'),
  transporte: require('./robot-hormiga-transporte.png'),
  cuidados: require('./robot-hormiga-cuidado-ninos.png'),
  dependiente: require('./robot-hormiga-dependiente.png'),
  domiciliario: require('./robot-hormiga-domiciliario.png'),
  cerrajeria: require('./robot-hormiga-cerrajeria.png'),
  climatizacion: require('./robot-hormiga-climatizacion.png'),
  mecanica: require('./robot-hormiga-mecanica.png'),
  belleza: require('./robot-hormiga-belleza.png'),
  clases: require('./robot-hormiga-clases.png'),
  mascotas: require('./robot-hormiga-mascotas.png'),
  otros: require('./robot-hormiga-otros.png'),
} as const

export type TradeImageKey = keyof typeof tradeImages
