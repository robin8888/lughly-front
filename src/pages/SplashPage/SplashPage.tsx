/**
 * SplashPage
 * Pantalla de entrada (solo app móvil)
 *
 * Según MobileApp.dc.html (SPLASH / ENTRADA): pieza a pantalla completa
 * (object-fit: cover, anclada arriba) y dos botones: Registrarse / Iniciar
 * sesión.
 *
 * La pieza ya no es la ilustración fija sino un vídeo: las hormigas robot
 * montando el logotipo (25 Agosto 2026; antes, la marca sobre el césped de
 * una casa). Es opaco y a sangre, igual que era la ilustración, así que ocupa
 * el mismo sitio y de la misma forma.
 *
 * **El degradado inferior del diseño se cambió por un cristal esmerilado bajo
 * los botones.** Aquel desvanecía el vídeo hacia el color de la pantalla, o
 * sea que lo aclaraba hasta el blanco. Ahora el vídeo sigue corriendo por
 * debajo de los botones y lo que lo tapa es un desenfoque, así que conserva su
 * color y su movimiento.
 *
 * El fondo pasó de `darkBg` al claro de las tarjetas (`bg`) para igualarlo al
 * de Login y Registro.
 */

import { View, useWindowDimensions } from 'react-native'
import { BlurView } from 'expo-blur'
import { StatusBar } from 'expo-status-bar'
import { VideoView, useVideoPlayer } from 'expo-video'
import { Button } from '@/components/atoms/Button'
import { videos } from '@/videos'
import { BACKDROP_BLUR, BLUR_INTENSITY, styles } from './SplashPage.styles'

export interface SplashPageProps {
  onRegister: () => void
  onLogin: () => void
}

export function SplashPage({ onRegister, onLogin }: SplashPageProps) {
  /*
   * El alto del vídeo sale del ancho de la pantalla y de su proporción, para
   * que la caja mida exactamente lo que mide la pieza y no se recorte nada.
   * Va aquí y no en la hoja de estilos porque depende del móvil.
   */
  const { width, height } = useWindowDimensions()
  const videoHeight = width * (16 / 9)

  /*
   * Y lo que sobra por debajo. Un móvil de 19,5:9 deja unos 150 puntos; uno
   * de 16:9 no deja nada, y entonces el vídeo llega hasta abajo él solo y no
   * hace falta rellenar nada.
   */
  const banda = Math.max(0, height - videoHeight)
  const hayBanda = banda > 24

  /*
   * Corre una vez y se queda en el fotograma final, con el logo ya montado:
   * es una entrada de marca, no un adorno en bucle. Nadie pasa diez segundos
   * aquí, así que el bucle apenas se vería, pero a quien se quede parado no le
   * repite la animación en la cara.
   *
   * `muted` **no es decorativo**: este vídeo sí trae pista de audio, al
   * contrario que el anterior. Sin esto, abrir la app sonaría, y le cortaría
   * la música a quien la tuviera puesta.
   */
  const player = useVideoPlayer(videos.splash, (instance) => {
    instance.muted = true
    instance.loop = false
    instance.play()
  })

  /*
   * El relleno de esa banda: el mismo vídeo, desenfocado a fondo, para que
   * detrás de los botones haya algo que el cristal pueda esmerilar.
   *
   * Segundo reproductor y no el mismo en dos vistas: `expo-video` avisa de
   * que en Android montar dos `VideoView` con el mismo `VideoPlayer` no
   * funciona, por una limitación de la plataforma. Solo se pone en marcha si
   * de verdad hay banda que rellenar, así que en un móvil 16:9 no se
   * descodifica nada dos veces.
   *
   * Las dos vistas **no se solapan** —esta ocupa justo lo que la otra no—,
   * que además esquiva el otro aviso de la documentación: dos `VideoView`
   * superpuestas con `contentFit: 'cover'` se pintan mal si no se les cambia
   * el `surfaceType`.
   *
   * `loop` a falso igual que la principal: las dos se quedan quietas en el
   * fotograma final. Con el fondo en bucle, la pantalla seguiría moviéndose
   * por debajo de una escena ya congelada.
   */
  const backdrop = useVideoPlayer(videos.splash, (instance) => {
    instance.muted = true
    instance.loop = false
    if (hayBanda) instance.play()
  })

  return (
    <View style={styles.container} testID="splash-page">
      {/*
        Con `userInterfaceStyle: automatic` en app.json, un móvil en modo
        oscuro pinta la hora y la batería en blanco, y sobre este fondo claro
        desaparecerían. `AuthShell` declara el contrario, porque el estilo se
        queda puesto al salir de aquí y las pantallas de formulario siguen
        siendo oscuras por fuera.
      */}
      <StatusBar style="dark" />

      {/*
        `cover` sobre una caja que ya tiene la proporción del vídeo: no recorta
        nada, porque no le sobra por ningún lado. Se queda `cover` y no
        `contain` para que una pieza futura de proporción algo distinta llene
        el hueco en vez de dejar franjas.
      */}
      <VideoView
        player={player}
        style={[styles.video, { height: videoHeight }]}
        contentFit="cover"
        nativeControls={false}
        accessibilityLabel="Lughly — un experto para cada trabajo"
        testID="splash-video"
      />

      {hayBanda && (
        <View style={[styles.backdrop, { height: banda }]} testID="splash-backdrop">
          {/*
            El margen negativo sube la vista para que de todo el fotograma se
            vea la parte de abajo, que es la que continúa el color del vídeo
            de arriba.
          */}
          <VideoView
            player={backdrop}
            style={[
              styles.backdropVideo,
              { height: videoHeight, marginTop: banda - videoHeight },
            ]}
            contentFit="cover"
            nativeControls={false}
            accessible={false}
          />

          <BlurView
            intensity={BACKDROP_BLUR}
            tint="systemUltraThinMaterialLight"
            blurMethod="dimezisBlurViewSdk31Plus"
            style={styles.glassFill}
            pointerEvents="none"
          />
        </View>
      )}

      <View style={styles.actions}>
        {/*
          Cada botón es un cristal esmerilado, la misma pieza que la barra de
          iconos de abajo: el relleno es el vídeo desenfocado y lo único
          sólido es el contorno y la letra. Antes eran dos rectángulos opacos
          —uno azul y otro blanco— sobre una franja de cristal común.

          `blurMethod` no es opcional en Android. Sin él `BlurView` no
          desenfoca: dibuja una vista semitransparente, que es justo el velo
          de color plano que aquí no se quiere. `...Sdk31Plus` usa el
          desenfoque real en Android 12 o superior, y en versiones anteriores
          no dibuja nada, que es mejor que un velo mal puesto.

          `systemUltraThinMaterialLight` es el material menos teñido que hay:
          casi todo desenfoque y apenas velo. Se fija a la variante clara en
          vez de dejar `systemUltraThinMaterial`, que sigue al tema del móvil:
          en modo oscuro teñiría de negro los botones de una pantalla clara y
          la letra azul dejaría de leerse.
        */}
        <View style={styles.glass}>
          <BlurView
            intensity={BLUR_INTENSITY}
            tint="systemUltraThinMaterialLight"
            blurMethod="dimezisBlurViewSdk31Plus"
            style={styles.glassFill}
            pointerEvents="none"
            testID="splash-register-glass"
          />

          <Button
            variant="secondary"
            fullWidth
            onPress={onRegister}
            style={[styles.buttonBase, styles.registerButton]}
            pressedStyle={styles.buttonPressed}
            textStyle={styles.registerText}
            testID="register-button"
          >
            Registrarse
          </Button>
        </View>

        <View style={styles.glass}>
          <BlurView
            intensity={BLUR_INTENSITY}
            tint="systemUltraThinMaterialLight"
            blurMethod="dimezisBlurViewSdk31Plus"
            style={styles.glassFill}
            pointerEvents="none"
            testID="splash-login-glass"
          />

          <Button
            variant="secondary"
            fullWidth
            onPress={onLogin}
            style={[styles.buttonBase, styles.loginButton]}
            pressedStyle={styles.buttonPressed}
            textStyle={styles.loginButtonText}
            testID="login-button"
          >
            Iniciar sesión
          </Button>
        </View>
      </View>
    </View>
  )
}
