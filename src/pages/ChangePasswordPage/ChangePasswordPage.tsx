/**
 * ChangePasswordPage
 * Cambiar la contraseña.
 *
 * Estaba dentro de "Mi cuenta", en medio de una pantalla que por lo demás es
 * una lista de accesos. Tres campos y un botón de formulario ahí en medio
 * cortan la lectura de la lista, y encima ocupan sitio permanente para algo que
 * se hace una vez al año.
 *
 * Al cambiarla se cierran las sesiones de los demás dispositivos, que es
 * justamente lo que se quiere cuando uno la cambia porque sospecha. Se dice al
 * terminar para que nadie se lleve la sorpresa desde otro teléfono.
 */

import { useState } from 'react'
import { View, Text, Pressable, Alert } from 'react-native'
import Animated from 'react-native-reanimated'
import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/atoms/Input'
import { FormField } from '@/components/molecules/FormField'
import { InfoCard } from '@/components/molecules/InfoCard'
import { useChangePassword } from '@/hooks/auth/useChangePassword'
import { useNavScrollHandler } from '@/hooks/ui/useCompactNav'
import { MIN_PASSWORD_LENGTH } from '@/hooks/auth/useRegister'
import { styles } from './ChangePasswordPage.styles'

export interface ChangePasswordPageProps {
  onBack: () => void
}

export function ChangePasswordPage({ onBack }: ChangePasswordPageProps) {
  const onScroll = useNavScrollHandler()
  const { change, isLoading, fieldErrors, formError, clearErrors } =
    useChangePassword()

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [showPasswords, setShowPasswords] = useState(false)

  const handleChangePassword = async () => {
    const ok = await change({ currentPassword, newPassword, repeatPassword })

    if (!ok) return

    setCurrentPassword('')
    setNewPassword('')
    setRepeatPassword('')
    clearErrors()

    Alert.alert(
      'Contraseña cambiada',
      'Hemos cerrado las sesiones abiertas en otros dispositivos.',
    )
    onBack()
  }

  return (
    <View style={styles.screen} testID="change-password-page">
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.back} accessibilityRole="button">
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <Text style={styles.title} numberOfLines={1}>
          Contraseña
        </Text>
      </View>

      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <InfoCard>
          <Text style={styles.intro}>
            Al cambiarla cerraremos la sesión en los demás dispositivos. En este
            seguirás dentro.
          </Text>
        </InfoCard>

        <View style={styles.form}>
          {formError && <Text style={styles.formError}>{formError}</Text>}

          <FormField
            label="Contraseña actual"
            error={fieldErrors.currentPassword}
            testID="password-current-field"
          >
            <Input
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="••••••••••"
              secureTextEntry={!showPasswords}
              autoCapitalize="none"
              autoComplete="current-password"
              error={Boolean(fieldErrors.currentPassword)}
              editable={!isLoading}
              testID="password-current"
            />
          </FormField>

          <FormField
            label="Nueva contraseña"
            hint={`Mínimo ${MIN_PASSWORD_LENGTH} caracteres.`}
            error={fieldErrors.newPassword}
            action={{
              label: showPasswords ? 'Ocultar' : 'Mostrar',
              onPress: () => setShowPasswords((visible) => !visible),
              testID: 'password-toggle',
            }}
            testID="password-new-field"
          >
            <Input
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="••••••••••"
              secureTextEntry={!showPasswords}
              autoCapitalize="none"
              autoComplete="new-password"
              error={Boolean(fieldErrors.newPassword)}
              editable={!isLoading}
              testID="password-new"
            />
          </FormField>

          <FormField
            label="Repetir nueva contraseña"
            error={fieldErrors.repeatPassword}
            testID="password-repeat-field"
          >
            <Input
              value={repeatPassword}
              onChangeText={setRepeatPassword}
              placeholder="••••••••••"
              secureTextEntry={!showPasswords}
              autoCapitalize="none"
              autoComplete="new-password"
              error={Boolean(fieldErrors.repeatPassword)}
              editable={!isLoading}
              testID="password-repeat"
            />
          </FormField>

          <Button
            fullWidth
            loading={isLoading}
            onPress={() => void handleChangePassword()}
            style={styles.save}
            testID="password-save"
          >
            Cambiar contraseña
          </Button>
        </View>
      </Animated.ScrollView>
    </View>
  )
}
