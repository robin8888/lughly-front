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
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
// El de `react-native` está deprecado; este además respeta el notch en Android
import { SafeAreaView } from 'react-native-safe-area-context'
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
            <Text style={styles.brand}>Lughly</Text>

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
