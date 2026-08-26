/**
 * ForcePasswordPage
 * Primer acceso de un trabajador dado de alta por su empleador.
 *
 * Entró con una contraseña que le pusieron otros y que viajó por correo. No
 * es una molestia burocrática: mientras siga en pie, su empleador puede
 * entrar como él, y entonces ninguna acción de esa cuenta prueba quién la
 * hizo. Por eso no hay forma de saltarse esta pantalla —ni "más tarde", ni
 * volver atrás—, solo cambiarla o cerrar sesión.
 *
 * Es la misma llamada que el cambio desde Mi cuenta; lo que cambia es que
 * aquí no se puede seguir sin hacerlo.
 */

import { useState } from 'react'
import { Text, Pressable } from 'react-native'
import { AuthShell } from '@/components/templates/AuthShell'
import { FormField } from '@/components/molecules/FormField'
import { Input } from '@/components/atoms/Input'
import { Button } from '@/components/atoms/Button'
import { useChangePassword } from '@/hooks/auth/useChangePassword'
import { MIN_PASSWORD_LENGTH } from '@/hooks/auth/useRegister'
import { useUser } from '@/stores/useAuthStore'
import { styles } from './ForcePasswordPage.styles'

export interface ForcePasswordPageProps {
  /** Se llama cuando ya está cambiada; la navegación la decide la ruta */
  onDone: () => void
  onLogout: () => void
}

export function ForcePasswordPage({ onDone, onLogout }: ForcePasswordPageProps) {
  const user = useUser()
  const { change, isLoading, fieldErrors, formError } = useChangePassword()

  const [newPassword, setNewPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  /**
   * **No se manda la contraseña temporal**, y por eso esta pantalla ya no la
   * pide: quien llega aquí la acaba de escribir para entrar, hace un momento y
   * en la pantalla anterior. Volvérsela a pedir era hacerle abrir el correo
   * para copiar un dato que el sistema ya había comprobado.
   *
   * El servidor lo admite solo mientras la cuenta esté marcada con contraseña
   * temporal; en "Cambiar contraseña", que es la misma llamada desde la
   * cuenta, la anterior se sigue exigiendo.
   */
  const handleSubmit = async () => {
    const ok = await change({ newPassword, repeatPassword })
    if (ok) onDone()
  }

  return (
    <AuthShell
      title="Cambia tu contraseña"
      subtitle={`Entraste con la contraseña temporal que te enviamos por correo${
        user?.email ? ` a ${user.email}` : ''
      }. Como la conoce quien te dio de alta, hay que sustituirla antes de seguir.`}
      align="left"
      error={formError}
      testID="force-password-page"
    >
      <FormField
        label="Contraseña nueva"
        hint={`Mínimo ${MIN_PASSWORD_LENGTH} caracteres. Solo la sabrás tú.`}
        error={fieldErrors.newPassword}
        action={{
          label: showPassword ? 'Ocultar' : 'Mostrar',
          onPress: () => setShowPassword((visible) => !visible),
          testID: 'force-password-toggle',
        }}
        testID="force-password-new-field"
      >
        <Input
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="••••••••••"
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="new-password"
          textContentType="newPassword"
          error={Boolean(fieldErrors.newPassword)}
          editable={!isLoading}
          testID="force-password-new"
        />
      </FormField>

      <FormField
        label="Repite la contraseña nueva"
        error={fieldErrors.repeatPassword}
        testID="force-password-repeat-field"
      >
        <Input
          value={repeatPassword}
          onChangeText={setRepeatPassword}
          placeholder="••••••••••"
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoCorrect={false}
          error={Boolean(fieldErrors.repeatPassword)}
          editable={!isLoading}
          testID="force-password-repeat"
        />
      </FormField>

      <Button
        fullWidth
        loading={isLoading}
        onPress={() => void handleSubmit()}
        style={styles.submit}
        testID="force-password-submit"
      >
        Guardar y entrar
      </Button>

      <Text style={styles.note}>
        Se cerrarán las demás sesiones abiertas con esta cuenta.
      </Text>

      <Pressable onPress={onLogout} disabled={isLoading} accessibilityRole="button">
        <Text style={styles.logout} testID="force-password-logout">
          Salir de la cuenta
        </Text>
      </Pressable>
    </AuthShell>
  )
}
