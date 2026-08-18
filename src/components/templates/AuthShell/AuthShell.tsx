/**
 * AuthShell Template
 * Envoltorio compartido por Login y Registro: fondo oscuro, marca y tarjeta.
 *
 * Sin marcas de registro en las esquinas, igual que `InfoCard`
 * (decisión del 14 Agosto 2026).
 *
 * No contiene lógica: solo composición y scroll con teclado.
 */

import { ReactNode } from 'react'
import {
  View,
  Text,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { images } from '@/images'
// El de `react-native` está deprecado; este además respeta el notch en Android
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { styles } from './AuthShell.styles'

export interface AuthShellProps {
  title: string
  subtitle?: string
  children: ReactNode
  /** Error global del formulario (credenciales, servidor…) */
  error?: string | null
  align?: 'center' | 'left'
  testID?: string
}

export function AuthShell({
  title,
  subtitle,
  children,
  error,
  align = 'center',
  testID,
}: AuthShellProps) {
  const alignStyle = align === 'center' ? styles.centered : undefined

  return (
    <SafeAreaView style={styles.safeArea} testID={testID}>
      {/*
        El fondo de aquí es accent-900, así que la hora y la batería van en
        blanco. Hace falta decirlo porque la pantalla de entrada declara el
        estilo contrario —su fondo es claro— y el ajuste no se deshace al
        salir de ella: sin esto, se entra a Login con los iconos en negro
        sobre el navy.
      */}
      <StatusBar style="light" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.wrapper}>
            {/*
              El logotipo sustituye al nombre escrito. Lleva su etiqueta de
              accesibilidad porque, al dejar de ser texto, un lector de
              pantalla no tendría de dónde sacarlo.
            */}
            <Image
              source={images.wordmark}
              style={styles.brand}
              resizeMode="contain"
              accessibilityRole="image"
              accessibilityLabel="Lughly"
              testID="auth-brand"
            />

            <View style={styles.card}>
              <Text style={[styles.title, alignStyle]}>{title}</Text>
              {subtitle && (
                <Text style={[styles.subtitle, alignStyle]}>{subtitle}</Text>
              )}

              {error && (
                <Text style={styles.error} testID="auth-form-error">
                  {error}
                </Text>
              )}

              {children}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
