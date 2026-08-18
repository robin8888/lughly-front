/**
 * AccountPage
 * "Mi cuenta", según MobileApp.dc.html (isCuenta).
 *
 * Secciones en el orden del diseño: ficha del usuario, cambio de modo,
 * cambio de contraseña, accesos y cierre de sesión.
 */

import { useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Image,
  Text,
  View,
  Pressable,
} from 'react-native'
import Animated from 'react-native-reanimated'
import { useNavScrollHandler } from '@/hooks/ui/useCompactNav'
import { Icon } from '@/components/atoms/Icon'
import { Input } from '@/components/atoms/Input'
import { Button } from '@/components/atoms/Button'
import { FormField } from '@/components/molecules/FormField'
import { InfoCard } from '@/components/molecules/InfoCard'
import { VerifyEmailNotice } from '@/components/molecules/VerifyEmailNotice'
import { useAvatarUpload } from '@/hooks/auth/useAvatarUpload'
import { useChangePassword } from '@/hooks/auth/useChangePassword'
import { useLogout } from '@/hooks/auth/useLogout'
import { useMyDocuments } from '@/hooks/domain/useMyDocuments'
import { useEffectiveRole } from '@/hooks/auth/useEffectiveRole'
import { MIN_PASSWORD_LENGTH } from '@/hooks/auth/useRegister'
import { API_BASE_URL } from '@/api'
import { useUser } from '@/stores/useAuthStore'
import { useRoleStore } from '@/stores/useRoleStore'
import { theme } from '@/theme'
import { styles } from './AccountPage.styles'

export interface AccountLink {
  label: string
  onPress?: () => void
  /** Pantallas aún no construidas: se muestran, pero no navegan */
  comingSoon?: boolean
}

export interface AccountPageProps {
  links: AccountLink[]
  onBack: () => void
  /** Abre "Mis documentos", que es la salida de las puertas de identidad */
  onDocuments: () => void
}

export function AccountPage({ links, onBack, onDocuments }: AccountPageProps) {
  /**
   * La barra inferior se encoge al bajar y vuelve al subir. Va en todas
   * las pantallas con scroll, no solo en el inicio: si en una se moviera
   * y en la siguiente no, parecería que la barra falla.
   */
  const onScroll = useNavScrollHandler()

  const user = useUser()
  const role = useEffectiveRole()
  const setActiveRole = useRoleStore((s) => s.setActiveRole)
  const { logout, isLoading: isLoggingOut } = useLogout()

  /*
   * `isPending` no es "no tiene": mientras carga no se sabe, y enseñar "te
   * falta el documento" durante medio segundo a alguien que lo tiene todo es
   * peor que no enseñar nada.
   */
  /*
   * El documento de identidad es cosa del profesional. Al cliente no se le pide
   * —se identifica con su forma de pago—, así que ni se le avisa, ni se le
   * enseña la puerta, ni se consultan sus documentos.
   */
  const isPro = role === 'pro'
  const { hasIdentity, isPending: isLoadingDocuments } = useMyDocuments(isPro)
  const { chooseAndUpload, isUploading } = useAvatarUpload()
  const { change, isLoading, fieldErrors, formError, clearErrors } =
    useChangePassword()

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [showPasswords, setShowPasswords] = useState(false)

  /** Solo una cuenta profesional puede alternar entre los dos modos */
  const canSwitchMode = user?.role === 'pro'

  const handleChangePassword = async () => {
    const ok = await change({ currentPassword, newPassword, repeatPassword })

    if (ok) {
      setCurrentPassword('')
      setNewPassword('')
      setRepeatPassword('')
      clearErrors()
      Alert.alert(
        'Contraseña cambiada',
        'Hemos cerrado las sesiones abiertas en otros dispositivos.',
      )
    }
  }

  const confirmLogout = () => {
    Alert.alert('Cerrar sesión', '¿Seguro que quieres salir de tu cuenta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar sesión',
        style: 'destructive',
        onPress: () => void logout(),
      },
    ])
  }

  return (
    <View style={styles.screen} testID="account-page">
      <View style={styles.header}>
        <Pressable
          onPress={onBack}
          style={styles.back}
          accessibilityRole="button"
          accessibilityLabel="Volver"
          testID="account-back"
        >
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <Text style={styles.title}>Mi cuenta</Text>
      </View>

      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <VerifyEmailNotice />

        <InfoCard style={styles.identityCard}>
          <View style={styles.identityRow}>
            <Pressable
              onPress={() => chooseAndUpload(Boolean(user?.avatarUrl))}
              disabled={isUploading}
              style={styles.avatar}
              accessibilityRole="button"
              accessibilityLabel={
                user?.avatarUrl ? 'Cambiar foto de perfil' : 'Añadir foto de perfil'
              }
              testID="account-avatar"
            >
              {isUploading ? (
                <ActivityIndicator size="small" color={theme.colors.accent} />
              ) : user?.avatarUrl ? (
                <Image
                  source={{ uri: `${API_BASE_URL}${user.avatarUrl}` }}
                  style={styles.avatarImage}
                />
              ) : (
                <Icon name="user-circle" size={30} color={theme.colors.accent700} />
              )}
            </Pressable>

            <View style={styles.identityText}>
              <Text style={styles.name} numberOfLines={1}>
                {user?.name ?? 'Sin sesión'}
              </Text>
              <Text style={styles.email} numberOfLines={1}>
                {user?.email}
              </Text>

              <Pressable
                onPress={() => chooseAndUpload(Boolean(user?.avatarUrl))}
                disabled={isUploading}
                testID="account-change-photo"
                accessibilityRole="button"
              >
                <Text style={styles.photoAction}>
                  {isUploading
                    ? 'Subiendo…'
                    : user?.avatarUrl
                      ? 'Cambiar foto'
                      : 'Añadir foto de perfil'}
                </Text>
              </Pressable>
            </View>

            <View style={styles.roleTag}>
              <Text style={styles.roleTagText}>
                {role === 'pro' ? 'Profesional' : 'Cliente'}
              </Text>
            </View>
          </View>

          {/*
            Antes esto era un texto inerte: "Identidad pendiente de verificar"
            y nada más, sin decir qué hacer ni adónde ir. Y quien se quedaba sin
            documentos porque la subida del alta falló leía lo mismo, cuando lo
            suyo no estaba pendiente de revisar: no había llegado nunca.

            Ahora distingue los dos casos y los dos llevan a la pantalla donde
            se arregla, que es lo que faltaba.
          */}
          {isPro && !hasIdentity && !isLoadingDocuments && (
            <Pressable
              onPress={onDocuments}
              accessibilityRole="button"
              testID="account-documents-missing"
            >
              <Text style={styles.missing}>
                Te falta el documento de identidad. Sin él no puedes contratar
                ni pujar. Subirlo →
              </Text>
            </Pressable>
          )}

          {isPro && hasIdentity && !user?.verified && (
            <Pressable
              onPress={onDocuments}
              accessibilityRole="button"
              testID="account-documents-pending"
            >
              <Text style={styles.pending}>
                Identidad pendiente de verificar. Revisaremos tus documentos en
                breve; mientras tanto no te bloquea nada. Ver mis documentos →
              </Text>
            </Pressable>
          )}
        </InfoCard>

        {canSwitchMode && (
          <View style={styles.modes}>
            <Pressable
              onPress={() => setActiveRole('client')}
              style={[styles.mode, role === 'client' && styles.modeActive]}
              accessibilityRole="button"
              accessibilityState={{ selected: role === 'client' }}
              testID="account-mode-client"
            >
              <Text
                style={[styles.modeText, role === 'client' && styles.modeTextActive]}
              >
                Modo cliente
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setActiveRole('pro')}
              style={[styles.mode, role === 'pro' && styles.modeActive]}
              accessibilityRole="button"
              accessibilityState={{ selected: role === 'pro' }}
              testID="account-mode-pro"
            >
              <Text
                style={[styles.modeText, role === 'pro' && styles.modeTextActive]}
              >
                Modo profesional
              </Text>
            </Pressable>
          </View>
        )}

        <InfoCard style={styles.passwordCard}>
          <Text style={styles.sectionTitle}>Cambiar contraseña</Text>

          {formError && <Text style={styles.formError}>{formError}</Text>}

          <FormField
            label="Contraseña actual"
            error={fieldErrors.currentPassword}
            testID="account-current-field"
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
              testID="account-current-password"
            />
          </FormField>

          <FormField
            label="Nueva contraseña"
            hint={`Mínimo ${MIN_PASSWORD_LENGTH} caracteres.`}
            error={fieldErrors.newPassword}
            action={{
              label: showPasswords ? 'Ocultar' : 'Mostrar',
              onPress: () => setShowPasswords((visible) => !visible),
              testID: 'account-toggle-passwords',
            }}
            testID="account-new-field"
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
              testID="account-new-password"
            />
          </FormField>

          <FormField
            label="Repetir nueva contraseña"
            error={fieldErrors.repeatPassword}
            testID="account-repeat-field"
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
              testID="account-repeat-password"
            />
          </FormField>

          <Button
            loading={isLoading}
            onPress={() => void handleChangePassword()}
            style={styles.saveButton}
            textStyle={styles.saveButtonText}
            testID="account-save-password"
          >
            Guardar cambios
          </Button>
        </InfoCard>

        <View style={styles.links}>
          {links.map((link) => (
            <Pressable
              key={link.label}
              onPress={link.onPress}
              disabled={link.comingSoon || !link.onPress}
              style={styles.link}
              accessibilityRole="button"
              testID={`account-link-${link.label}`}
            >
              <Text
                style={[styles.linkLabel, link.comingSoon && styles.linkDisabled]}
              >
                {link.label}
              </Text>

              {link.comingSoon ? (
                <Text style={styles.soon}>Pronto</Text>
              ) : (
                <Text style={styles.chevron}>›</Text>
              )}
            </Pressable>
          ))}

          <Pressable
            onPress={confirmLogout}
            disabled={isLoggingOut}
            style={styles.link}
            accessibilityRole="button"
            testID="account-logout"
          >
            <Text style={styles.logout}>
              {isLoggingOut ? 'Cerrando sesión…' : 'Cerrar sesión'}
            </Text>
          </Pressable>
        </View>
      </Animated.ScrollView>
    </View>
  )
}
