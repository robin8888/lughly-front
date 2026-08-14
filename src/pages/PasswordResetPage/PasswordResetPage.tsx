/**
 * PasswordResetPage
 * Según MobileApp.dc.html (loginModeForgot / loginModeSent).
 *
 * Tres pasos: pedir el código → introducirlo con la contraseña nueva → hecho.
 *
 * El diseño habla de un enlace; usamos un código de 6 dígitos porque un enlace
 * exigiría deep links configurados (que no funcionan de forma fiable en
 * Expo Go) o una web donde aterrizar. Se puede cambiar cuando exista la web.
 */

import { useState } from 'react'
import { Text, View } from 'react-native'
import { AuthShell } from '@/components/templates/AuthShell'
import { FormField } from '@/components/molecules/FormField'
import { Input } from '@/components/atoms/Input'
import { Button } from '@/components/atoms/Button'
import { usePasswordReset } from '@/hooks/auth/usePasswordReset'
import { MIN_PASSWORD_LENGTH } from '@/hooks/auth/useRegister'
import { styles } from './PasswordResetPage.styles'

type Step = 'request' | 'confirm' | 'done'

export interface PasswordResetPageProps {
  onBackToLogin: () => void
}

export function PasswordResetPage({ onBackToLogin }: PasswordResetPageProps) {
  const [step, setStep] = useState<Step>('request')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const {
    requestCode,
    confirmReset,
    isLoading,
    fieldErrors,
    formError,
    clearErrors,
  } = usePasswordReset()

  const handleRequest = async () => {
    if (await requestCode({ email })) setStep('confirm')
  }

  const handleConfirm = async () => {
    if (await confirmReset({ code, password })) setStep('done')
  }

  const handleResend = async () => {
    clearErrors()
    await requestCode({ email })
  }

  if (step === 'done') {
    return (
      <AuthShell title="Contraseña cambiada" testID="password-reset-done">
        <View style={styles.badge}>
          <Text style={styles.badgeIcon}>✓</Text>
        </View>
        <Text style={styles.success}>
          Ya puedes entrar con tu contraseña nueva.
        </Text>
        <Text style={styles.hint}>
          Por seguridad hemos cerrado las sesiones que hubiera abiertas en otros
          dispositivos.
        </Text>
        <Button
          fullWidth
          onPress={onBackToLogin}
          style={styles.submit}
          testID="reset-go-login"
        >
          Iniciar sesión
        </Button>
      </AuthShell>
    )
  }

  if (step === 'confirm') {
    return (
      <AuthShell
        title="Revisa tu correo"
        subtitle={`Si ${email} tiene cuenta en Lughly, recibirás un código de 6 dígitos. Caduca en 30 minutos.`}
        error={formError}
        testID="password-reset-confirm"
      >
        <FormField label="Código recibido" error={fieldErrors.code} testID="reset-code-field">
          <Input
            value={code}
            onChangeText={setCode}
            placeholder="000000"
            keyboardType="number-pad"
            maxLength={6}
            autoComplete="one-time-code"
            textContentType="oneTimeCode"
            style={styles.code}
            error={Boolean(fieldErrors.code)}
            editable={!isLoading}
            testID="reset-code"
          />
        </FormField>

        <FormField
          label="Contraseña nueva"
          hint={`Mínimo ${MIN_PASSWORD_LENGTH} caracteres.`}
          error={fieldErrors.password}
          action={{
            label: showPassword ? 'Ocultar' : 'Mostrar',
            onPress: () => setShowPassword((visible) => !visible),
            testID: 'reset-password-toggle',
          }}
          testID="reset-password-field"
        >
          <Input
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••••"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoComplete="new-password"
            textContentType="newPassword"
            error={Boolean(fieldErrors.password)}
            editable={!isLoading}
            testID="reset-password"
          />
        </FormField>

        <Button
          fullWidth
          loading={isLoading}
          onPress={() => void handleConfirm()}
          style={styles.submit}
          testID="reset-submit"
        >
          Cambiar contraseña
        </Button>

        <Text style={styles.footer}>
          ¿No llega? Mira en spam o{' '}
          <Text
            style={styles.footerLink}
            onPress={() => void handleResend()}
            testID="reset-resend"
          >
            vuelve a enviarlo
          </Text>
          .
        </Text>

        <Text style={styles.footer}>
          <Text
            style={styles.footerLink}
            onPress={onBackToLogin}
            testID="reset-back-login"
          >
            ← Volver a iniciar sesión
          </Text>
        </Text>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      title="Recuperar contraseña"
      subtitle="Te enviaremos un código para crear una nueva."
      error={formError}
      testID="password-reset-request"
    >
      <FormField
        label="Email de tu cuenta"
        error={fieldErrors.email}
        testID="reset-email-field"
      >
        <Input
          value={email}
          onChangeText={setEmail}
          placeholder="tucorreo@ejemplo.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
          error={Boolean(fieldErrors.email)}
          editable={!isLoading}
          onSubmitEditing={() => void handleRequest()}
          returnKeyType="send"
          testID="reset-email"
        />
      </FormField>

      <Button
        fullWidth
        loading={isLoading}
        onPress={() => void handleRequest()}
        style={styles.submit}
        testID="reset-request-submit"
      >
        Enviar código
      </Button>

      <Text style={styles.footer}>
        <Text
          style={styles.footerLink}
          onPress={onBackToLogin}
          testID="reset-back-login"
        >
          ← Volver a iniciar sesión
        </Text>
      </Text>
    </AuthShell>
  )
}
