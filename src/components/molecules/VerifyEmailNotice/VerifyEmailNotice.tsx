/**
 * VerifyEmailNotice Molecule
 * Aviso de que falta confirmar el email, con reenvío.
 *
 * Se refresca solo al volver la app a primer plano: el usuario confirma desde
 * el navegador, vuelve a la app y el aviso desaparece sin tocar nada.
 * También hay un botón manual, por si el sistema no dispara ese evento.
 *
 * Es informativo, no bloqueante: las puertas que exijan email confirmado las
 * decide el backend en cada operación, no esconder botones en la app.
 */

import { useState } from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { authApi } from '@/api'
import { Button } from '@/components/atoms/Button'
import { useRefreshUser, useRefreshUserOnForeground } from '@/hooks/auth/useRefreshUser'
import { useUser } from '@/stores/useAuthStore'
import { theme } from '@/theme'

export function VerifyEmailNotice() {
  const user = useUser()
  const refreshUser = useRefreshUser()
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>(
    'idle',
  )
  const [isChecking, setIsChecking] = useState(false)
  /**
   * En qué quedó la última comprobación manual. Sin esto, pulsar "Ya lo he
   * confirmado" y que el aviso siga ahí no distingue entre "no se pudo
   * preguntar al servidor" y "se le preguntó y el email aún no consta": la
   * pantalla queda igual en los dos casos y el botón parece muerto.
   */
  const [check, setCheck] = useState<'idle' | 'error' | 'pendiente'>('idle')

  // Al volver de confirmar en el navegador, el aviso se retira solo
  useRefreshUserOnForeground()

  if (!user || user.emailVerified) return null

  const handleResend = async () => {
    setState('sending')
    try {
      await authApi.resendVerification()
      setState('sent')
    } catch {
      setState('error')
    }
  }

  const handleCheck = async () => {
    setIsChecking(true)
    setCheck('idle')

    const refreshed = await refreshUser()

    setIsChecking(false)

    if (!refreshed) {
      setCheck('error')
      return
    }

    // Si ya consta, este componente deja de pintarse y no hay nada que decir
    if (!refreshed.emailVerified) setCheck('pendiente')
  }

  return (
    <View style={styles.container} testID="verify-email-notice">
      <Text style={styles.title}>Confirma tu email</Text>
      <Text style={styles.body}>
        Te hemos enviado un enlace a {user.email}. Míralo también en spam.
      </Text>

      {state === 'sent' && (
        <Text style={styles.sent} testID="verify-email-sent">
          Correo reenviado.
        </Text>
      )}
      {state === 'error' && (
        <Text style={styles.error}>
          No hemos podido reenviarlo. Inténtalo más tarde.
        </Text>
      )}

      <Button
        variant="secondary"
        loading={state === 'sending'}
        disabled={state === 'sent'}
        onPress={() => void handleResend()}
        style={styles.button}
        testID="verify-email-resend"
      >
        Reenviar correo
      </Button>

      {check === 'error' && (
        <Text style={styles.error} testID="verify-email-check-error">
          No hemos podido comprobarlo. Revísalo cuando tengas conexión.
        </Text>
      )}
      {check === 'pendiente' && (
        <Text style={styles.error} testID="verify-email-check-pending">
          Todavía no nos consta. Abre el enlace del correo y vuelve a probar.
        </Text>
      )}

      <Pressable
        onPress={() => void handleCheck()}
        disabled={isChecking}
        testID="verify-email-check"
        accessibilityRole="button"
      >
        <Text style={styles.check}>
          {isChecking ? 'Comprobando…' : 'Ya lo he confirmado'}
        </Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing[4],
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.accent300,
    backgroundColor: theme.colors.accent100,
    marginBottom: theme.spacing[4],
  },
  title: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.text,
    marginBottom: theme.spacing[1],
  },
  body: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.text,
    opacity: 0.8,
  },
  sent: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.available,
    marginTop: theme.spacing[2],
  },
  error: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.error,
    marginTop: theme.spacing[2],
  },
  button: {
    marginTop: theme.spacing[3],
  },
  check: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.accent600,
    textAlign: 'center',
    marginTop: theme.spacing[3],
  },
})
