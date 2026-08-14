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

/** Imágenes de producto (mascota Uhiro y estados de la app). */
export const images = {
  splash: require('./splash-uhiro.png'),
  asistente: require('./asistente-icono.png'),
  loader: require('./robot-hormiga-loader.png'),
  saludando: require('./robot-hormiga-saludando.png'),
  senalando: require('./robot-hormiga-senalando.png'),
  subastador: require('./robot-hormiga-subastador.png'),
  trofeo: require('./robot-hormiga-trofeo.png'),
  salud: require('./robot-hormiga-salud.png'),
} as const

export type ImageKey = keyof typeof images

/**
 * Ilustración por oficio. Las claves son los slugs de `@/utils/trades`.
 *
 * Nota: en MobileApp.dc.html los mapas de `informatica` y `pintura` están
 * intercambiados por error; aquí cada oficio usa su propia ilustración.
 */
export const tradeImages = {
  carpinteria: require('./robot-hormiga-carpinteria.png'),
  electricidad: require('./robot-hormiga-electricidad.png'),
  fontaneria: require('./robot-hormiga-fontaneria.png'),
  pintura: require('./robot-hormiga-pintura.png'),
  jardineria: require('./robot-hormiga-jardineria.png'),
  informatica: require('./robot-hormiga-informatica.png'),
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
