/**
 * SplashPage
 * Pantalla de entrada (solo app móvil)
 *
 * Según MobileApp.dc.html (SPLASH / ENTRADA): pieza a pantalla completa
 * (object-fit: cover, anclada arriba) y dos botones: Registrarse / Iniciar
 * sesión.
 *
 * La pieza ya no es la ilustración fija sino un vídeo: la marca sobre el
 * césped de una casa. Es opaco y a sangre, igual que era la ilustración, así
 * que ocupa el mismo sitio y de la misma forma.
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

import { View } from 'react-native'
import { BlurView } from 'expo-blur'
import { StatusBar } from 'expo-status-bar'
import { VideoView, useVideoPlayer } from 'expo-video'
import { Button } from '@/components/atoms/Button'
import { videos } from '@/videos'
import { BLUR_INTENSITY, styles } from './SplashPage.styles'

export interface SplashPageProps {
  onRegister: () => void
  onLogin: () => void
}

export function SplashPage({ onRegister, onLogin }: SplashPageProps) {
  /*
   * Suena una vez y se queda en el fotograma final, con el logo ya montado:
   * es una entrada de marca, no un adorno en bucle. Nadie pasa trece segundos
   * aquí, así que el bucle apenas se vería, pero a quien se quede parado no le
   * repite la animación en la cara.
   *
   * Sin audio (el fichero no lo lleva) y `muted` de todas formas, para que no
   * toque el volumen del móvil ni corte la música que el usuario tenga puesta.
   */
  const player = useVideoPlayer(videos.splash, (instance) => {
    instance.muted = true
    instance.loop = false
    instance.play()
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
        `cover` y no `contain`: el vídeo es 9:16 y la pantalla es más alargada,
        así que `contain` dejaría franjas arriba y abajo, como una foto
        enmarcada. Con `cover` la llena y recorta un poco por los lados, donde
        solo hay cielo y césped.
      */}
      <VideoView
        player={player}
        style={styles.video}
        contentFit="cover"
        nativeControls={false}
        accessibilityLabel="Lughly — un experto para cada trabajo"
        testID="splash-video"
      />

      <View style={styles.actions}>
        {/*
          El fondo de los botones es el propio vídeo desenfocado, no un color.
          Va dentro del bloque y en absoluto, así que lo cubre entero y queda
          por debajo de los botones, que se dibujan después.

          `systemUltraThinMaterialLight` es el material menos teñido que hay:
          casi todo desenfoque y apenas velo. Se fija a la variante clara en
          vez de dejar `systemUltraThinMaterial`, que sigue al tema del móvil:
          en modo oscuro teñiría de negro una pantalla que es clara.

          `blurMethod` no es opcional en Android. Sin él `BlurView` no
          desenfoca: dibuja una vista semitransparente, que es justo el velo de
          color plano que aquí no se quiere. `...Sdk31Plus` usa el desenfoque
          real en Android 12 o superior, y en versiones anteriores no dibuja
          nada, que es mejor que un velo mal puesto.
        */}
        <BlurView
          intensity={BLUR_INTENSITY}
          tint="systemUltraThinMaterialLight"
          blurMethod="dimezisBlurViewSdk31Plus"
          style={styles.actionsBlur}
          pointerEvents="none"
          testID="splash-actions-blur"
        />

        <Button
          variant="primary"
          fullWidth
          onPress={onRegister}
          style={[styles.buttonBase, styles.actionButton]}
          pressedStyle={styles.actionButtonPressed}
          testID="register-button"
        >
          Registrarse
        </Button>
        <Button
          variant="secondary"
          fullWidth
          onPress={onLogin}
          style={[styles.buttonBase, styles.loginButton]}
          pressedStyle={styles.loginButtonPressed}
          textStyle={styles.loginButtonText}
          testID="login-button"
        >
          Iniciar sesión
        </Button>
      </View>
    </View>
  )
}
