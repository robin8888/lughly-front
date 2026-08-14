/**
 * SplashPage
 * Pantalla de entrada (solo app móvil)
 *
 * Según MobileApp.dc.html (SPLASH / ENTRADA):
 * imagen a pantalla completa (object-fit: cover, anclada arriba),
 * degradado hacia #04070f en la parte baja y dos botones: Registrarse / Iniciar sesión.
 */

import { View, Image } from 'react-native'
import { Button } from '@/components/atoms/Button'
import { images } from '@/images'
import { styles, gradientSlices } from './SplashPage.styles'

export interface SplashPageProps {
  onRegister: () => void
  onLogin: () => void
}

export function SplashPage({ onRegister, onLogin }: SplashPageProps) {
  return (
    <View style={styles.container} testID="splash-page">
      <View style={styles.imageArea}>
        <Image
          source={images.splash}
          style={styles.image}
          resizeMode="cover"
          accessibilityLabel="Lughly — un experto para cada trabajo"
          testID="splash-image"
        />
        {/*
          El diseño usa linear-gradient(180deg, transparent 72%, #04070f 96%).
          React Native no soporta gradientes nativos sin librería, así que lo
          aproximamos apilando franjas con opacidad creciente.
        */}
        <View style={styles.gradient} pointerEvents="none">
          {gradientSlices.map((slice, index) => (
            <View key={index} style={slice} />
          ))}
        </View>
      </View>

      <View style={styles.actions}>
        <Button
          variant="primary"
          fullWidth
          onPress={onRegister}
          style={styles.actionButton}
          testID="register-button"
        >
          Registrarse
        </Button>
        <Button
          variant="secondary"
          fullWidth
          onPress={onLogin}
          style={styles.loginButton}
          textStyle={styles.loginButtonText}
          testID="login-button"
        >
          Iniciar sesión
        </Button>
      </View>
    </View>
  )
}
