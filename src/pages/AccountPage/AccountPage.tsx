/**
 * AccountPage
 * "Mi cuenta", según MobileApp.dc.html (isCuenta).
 *
 * Secciones en el orden del diseño: ficha del usuario, cambio de modo,
 * accesos y cierre de sesión.
 *
 * El cambio de contraseña estaba aquí incrustado y se ha ido a su propia
 * pantalla: tres campos y un botón en medio de una lista de accesos cortan la
 * lectura, y ocupaban sitio permanente para algo que se hace una vez al año.
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
import { Button } from '@/components/atoms/Button'
import { InfoCard } from '@/components/molecules/InfoCard'
import { VerifyEmailNotice } from '@/components/molecules/VerifyEmailNotice'
import { useAvatarUpload } from '@/hooks/auth/useAvatarUpload'
import { useLogout } from '@/hooks/auth/useLogout'
import { useMyDocuments } from '@/hooks/domain/useMyDocuments'
import { useEffectiveRole } from '@/hooks/auth/useEffectiveRole'
import { API_BASE_URL } from '@/api'
import { useUser } from '@/stores/useAuthStore'
import { useRoleStore } from '@/stores/useRoleStore'
import { theme } from '@/theme'
import { styles } from './AccountPage.styles'

/**
 * Un aviso al lado del acceso, para lo que está sin poner.
 *
 * **Solo lo que falta.** Se pensó en pintar de rojo lo que falta y de verde lo
 * que está, y lo verde se descartó: con el perfil completo serían siete líneas
 * verdes, y siete avisos iguales no dicen nada —la información está en la
 * excepción, no en la norma—. Además el color solo no vale como aviso: hay
 * quien no distingue el rojo del verde, así que cada uno lleva su palabra.
 *
 * Y no todo lo que falta es igual de grave, que es lo que el rojo para todo se
 * lleva por delante:
 *
 * - `blocking`: sin esto no se puede trabajar —sin oficios no sale en el
 *   directorio, sin documentos no puede pujar—. Va en el color de urgencia.
 * - `optional`: se puede trabajar, pero con esto le iría mejor. En un tono
 *   neutro, porque no es un error suyo.
 * - `pending`: hecho y esperando a otro. Ni le falta ni tiene que hacer nada.
 */
export interface AccountLinkNote {
  label: string
  tone: 'blocking' | 'optional' | 'pending'
}

export interface AccountLink {
  label: string
  onPress?: () => void
  /** Pantallas aún no construidas: se muestran, pero no navegan */
  comingSoon?: boolean
  note?: AccountLinkNote
}

/**
 * Un bloque de accesos con su rótulo.
 *
 * La lista llegó a once accesos seguidos, y once cosas en fila sin ningún orden
 * se leen de arriba abajo cada vez que se busca una. Con rótulos, la vista va
 * directa al grupo.
 *
 * Se agrupan aquí y **no** se esconden dentro de "Configuración": lo que un
 * profesional edita —sus oficios, su horario, su zona, sus fotos— no es la
 * configuración de una app, es su escaparate. Meterlo un nivel más adentro
 * dejaría lo que le da trabajo más lejos que "Notificaciones", y encima
 * "Configuración" significa otra cosa en todas las apps: contraseña, avisos,
 * idioma, borrar la cuenta.
 */
export interface AccountLinkGroup {
  title: string
  links: AccountLink[]
}

export interface AccountPageProps {
  groups: AccountLinkGroup[]
  onBack: () => void
  /** Abre "Mis documentos", que es la salida de las puertas de identidad */
  onDocuments: () => void
}

export function AccountPage({ groups, onBack, onDocuments }: AccountPageProps) {
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
  /** Solo una cuenta profesional puede alternar entre los dos modos */
  const canSwitchMode = user?.role === 'pro'

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

        {groups.map((group) => (
          <View key={group.title} style={styles.group}>
            <Text style={styles.groupTitle}>{group.title}</Text>

            {group.links.map((link) => (
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
                  <View style={styles.linkRight}>
                    {link.note && (
                      <Text
                        style={[styles.note, styles[`note_${link.note.tone}`]]}
                        testID={`account-note-${link.label}`}
                      >
                        {link.note.label}
                      </Text>
                    )}
                    <Text style={styles.chevron}>›</Text>
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        ))}

        <View style={styles.links}>
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
