/**
 * LoginPage
 * Según MobileApp.dc.html (STACK: LOGIN)
 *
 * La página solo compone UI y delega la lógica en useLogin.
 * La navegación llega por props para que la página sea testeable sin router.
 */

import { useState } from 'react'
import { Text } from 'react-native'
import { AuthShell } from '@/components/templates/AuthShell'
import { FormField } from '@/components/molecules/FormField'
import { Input } from '@/components/atoms/Input'
import { Button } from '@/components/atoms/Button'
import { useLogin } from '@/hooks/auth/useLogin'
import { styles } from './LoginPage.styles'

export interface LoginPageProps {
  onSuccess: () => void
  onRegister: () => void
  onForgotPassword?: () => void
}

export function LoginPage({
  onSuccess,
  onRegister,
  onForgotPassword,
}: LoginPageProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login, isLoading, fieldErrors, formError } = useLogin({ onSuccess })

  const handleSubmit = () => {
    void login({ email, password })
  }

  return (
    <AuthShell
      title="Iniciar sesión"
      subtitle="Bienvenido de nuevo a Lughly"
      error={formError}
      testID="login-page"
    >
      <FormField label="Email" error={fieldErrors.email} testID="login-email-field">
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
          testID="login-email"
        />
      </FormField>

      <FormField
        label="Contraseña"
        error={fieldErrors.password}
        action={
          onForgotPassword
            ? {
                label: '¿Olvidaste?',
                onPress: onForgotPassword,
                testID: 'forgot-password-link',
              }
            : undefined
        }
        testID="login-password-field"
      >
        <Input
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          secureTextEntry
          autoCapitalize="none"
          autoComplete="current-password"
          textContentType="password"
          error={Boolean(fieldErrors.password)}
          editable={!isLoading}
          onSubmitEditing={handleSubmit}
          returnKeyType="go"
          testID="login-password"
        />
      </FormField>

      <Button
        fullWidth
        loading={isLoading}
        onPress={handleSubmit}
        style={styles.submit}
        testID="login-submit"
      >
        Entrar
      </Button>

      <Text style={styles.footer}>
        ¿No tienes cuenta?{' '}
        <Text
          style={styles.footerLink}
          onPress={onRegister}
          testID="go-register-link"
        >
          Regístrate
        </Text>
      </Text>
    </AuthShell>
  )
}
