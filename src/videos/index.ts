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
 * Animación de entrada: la marca sobre el césped de una casa. 1080x1920,
 * 13 s, 30 fps, H.264 sin audio, 2,1 MB.
 *
 * **Es una escena opaca a sangre**, no un logotipo recortado. Trae su propio
 * cielo y su propio suelo, así que llena el hueco entero y el fondo de
 * `SplashPage` solo asoma detrás de los botones y en el degradado inferior.
 *
 * Eso deja el color de la pantalla libre: **se puede cambiar sin recodificar
 * nada**. No siempre fue así — la primera versión venía con alfa, y como H.264
 * no la admite había que componerla sobre el fondo exacto de la pantalla y
 * rehacer el vídeo cada vez que ese color cambiara.
 *
 * Para regenerarlo desde la secuencia de PNG (en `_fuentes`, fuera del repo):
 *
 *     ffmpeg -framerate 30 -i frame_%04d.png -vf "format=yuv420p" \
 *       -c:v libx264 -profile:v main -level:v 4.0 -crf 21 -preset slow \
 *       -movflags +faststart -an splash-lughly.mp4
 *
 * El `crf 21` está elegido mirando el resultado: el cielo y el césped son
 * degradados amplios y planos, que es justo donde el H.264 bandea. A 21 no se
 * ve y pesa 1,2 MB; subiéndolo empieza a notarse en el cielo.
 *
 * Si algún día vuelve una pieza con alfa, hay que componerla sobre el fondo de
 * la pantalla antes de codificar, y compensar a mano: el paso por yuv420p
 * desplaza el color un punto en tonos claros y dos o tres en oscuros.
 */
export const videos = {
  splash: require('./splash-lughly.mp4'),
} as const

export type VideoKey = keyof typeof videos
