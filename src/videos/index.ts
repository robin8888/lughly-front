/**
 * Catálogo de vídeos de Lughly
 *
 * Mismo trato que `@/images`: los vídeos viven aquí y se consumen desde este
 * barril (`import { videos } from '@/videos'`), nunca con rutas relativas
 * sueltas. Los require() son estáticos porque Metro necesita literales para
 * meter el asset en el bundle.
 *
 * Van en carpeta aparte y no en `src/images` porque no son imágenes: no se
 * pueden pasar a un `<Image>` y necesitan `expo-video`, que es dependencia
 * nativa. Mezclarlos invitaría a intentarlo.
 */

/**
 * Animación de entrada: las hormigas robot montando el logotipo (25 Agosto
 * 2026). 720x1280, 10 s, H.264, 2,5 MB.
 *
 * Sustituye a `splash-lughly.mp4`, que era la marca sobre el césped de una
 * casa —1080x1920, 13 s— y que salía de una secuencia de 392 PNG. Aquel se
 * cocinaba aquí con ffmpeg; este llega ya codificado y entra **tal cual, sin
 * recodificar**: pasarlo otra vez por H.264 solo restaría calidad. Su
 * original, que es este mismo fichero, está en `_fuentes`.
 *
 * **Es una escena opaca a sangre**, no un logotipo recortado, igual que el
 * anterior: llena el hueco entero y el fondo de `SplashPage` solo asoma
 * detrás de los botones. Eso deja el color de la pantalla libre, y se puede
 * cambiar sin tocar el vídeo.
 *
 * Dos cosas cambian respecto al anterior y las dos están contempladas en
 * `SplashPage`:
 *
 * - **Trae pista de audio** (AAC). La pantalla pone `muted` de todas formas,
 *   así que no suena ni le baja la música a nadie. No se le quita la pista
 *   porque quitarla obliga a reescribir el contenedor y este equipo no tiene
 *   ffmpeg; pesa poco y no se reproduce.
 * - **720 y no 1080 de ancho.** En un móvil de 390 puntos a 3x se amplía 1,6
 *   veces. Es lo que mide el original; si hiciera falta más nitidez, hay que
 *   pedir la pieza en 1080, no reescalar esta.
 *
 * Sigue siendo 9:16, así que el `contentFit="cover"` de la pantalla recorta
 * por los lados exactamente igual que antes.
 */
export const videos = {
  splash: require('./splash-hormigas.mp4'),
} as const

export type VideoKey = keyof typeof videos
