/**
 * MyProfilePage
 * Los datos propios: nombre, teléfono, correo y —si es profesional— la
 * descripción de su trabajo.
 *
 * Faltaba entera. De todo lo que se pide al registrarse solo se podían cambiar
 * después la contraseña, la foto y los oficios: quien tecleaba mal su nombre en
 * el alta se quedaba así, y ese nombre sale en su ficha, en sus pujas y en los
 * avisos que le llegan al cliente.
 *
 * **La descripción no la escribía nadie.** El único sitio del proyecto que
 * tocaba ese campo era el script de datos de ejemplo, y por eso solo la tenían
 * los profesionales de prueba.
 *
 * El correo se enseña pero no se edita, y se dice por qué. No es un descuido:
 * es la identidad con la que se entra y el camino para recuperar la cuenta, así
 * que cambiarlo pide comprobar antes que el nuevo existe y es de quien dice.
 * Un campo que lo cambiara de un toque puede dejar a alguien fuera de su cuenta
 * para siempre.
 */

import { useEffect, useState } from 'react'
import { View, Text, ActivityIndicator, Pressable, Alert } from 'react-native'
import Animated from 'react-native-reanimated'
import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/atoms/Input'
import { FormField } from '@/components/molecules/FormField'
import { InfoCard } from '@/components/molecules/InfoCard'
import { useMyBio, useSaveMyProfile } from '@/hooks/domain/useMyProfile'
import { useNavScrollHandler } from '@/hooks/ui/useCompactNav'
import { useUser } from '@/stores/useAuthStore'
import { useEffectiveRole } from '@/hooks/auth/useEffectiveRole'
import { theme } from '@/theme'
import { styles } from './MyProfilePage.styles'

/** Lo mismo que admite el servidor: caben tres o cuatro frases */
const MAX_BIO = 400

export interface MyProfilePageProps {
  onBack: () => void
}

export function MyProfilePage({ onBack }: MyProfilePageProps) {
  const onScroll = useNavScrollHandler()
  const user = useUser()
  const isPro = useEffectiveRole() === 'pro'

  const { data: bioData, isPending: loadingBio } = useMyBio(isPro)
  const { save, isSaving } = useSaveMyProfile()

  const [name, setName] = useState(user?.name ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [bio, setBio] = useState('')
  const [loadedBio, setLoadedBio] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * La descripción llega del servidor y se copia una sola vez. Si se copiara en
   * cada respuesta, un refresco de fondo borraría lo que se está escribiendo.
   */
  useEffect(() => {
    if (bioData && !loadedBio) {
      setBio(bioData.bio ?? '')
      setLoadedBio(true)
    }
  }, [bioData, loadedBio])

  const trimmedName = name.trim()
  const isValid = trimmedName.length >= 2 && bio.length <= MAX_BIO

  /** Solo lo que ha cambiado: mandar el resto sería reescribirlo sin motivo */
  const changes = () => {
    const payload: { name?: string; phone?: string; bio?: string } = {}

    if (trimmedName !== (user?.name ?? '')) payload.name = trimmedName
    if (phone.trim() !== (user?.phone ?? '')) payload.phone = phone.trim()
    if (isPro && loadedBio && bio.trim() !== (bioData?.bio ?? '')) {
      payload.bio = bio.trim()
    }

    return payload
  }

  const handleSave = async () => {
    const payload = changes()

    if (Object.keys(payload).length === 0) {
      setError('No has cambiado nada.')
      return
    }

    setError(null)
    const { ok, error: reason } = await save(payload)

    if (!ok) {
      setError(reason ?? 'No hemos podido guardar. Inténtalo de nuevo.')
      return
    }

    Alert.alert('Guardado', 'Tus datos se han actualizado.')
    onBack()
  }

  return (
    <View style={styles.screen} testID="my-profile-page">
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.back} accessibilityRole="button">
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <Text style={styles.title} numberOfLines={1}>
          Mis datos
        </Text>
      </View>

      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {isPro && (
          <InfoCard>
            <Text style={styles.intro}>
              Tu nombre y tu descripción salen en tu ficha y en el listado, que
              es lo que ve el cliente antes de escribirte.
            </Text>
          </InfoCard>
        )}

        {error !== null && <Text style={styles.formError}>{error}</Text>}

        <View style={styles.form}>
          <FormField label="Nombre y apellidos">
            <Input
              value={name}
              onChangeText={setName}
              placeholder="Tu nombre completo"
              autoCapitalize="words"
              autoComplete="name"
              editable={!isSaving}
              error={trimmedName !== '' && trimmedName.length < 2}
              testID="profile-name"
            />
          </FormField>

          <FormField
            label="Teléfono"
            hint={
              isPro
                ? 'El cliente te llama por aquí cuando la cosa corre prisa.'
                : 'Para que el profesional pueda avisarte si se retrasa.'
            }
          >
            <Input
              value={phone}
              onChangeText={setPhone}
              placeholder="600 12 34 56"
              keyboardType="phone-pad"
              autoComplete="tel"
              editable={!isSaving}
              testID="profile-phone"
            />
          </FormField>

          {/*
            El correo se enseña y no se edita. Se dice por qué: un campo gris sin
            explicación se lee como una app a medio hacer, y esto no lo es —es
            que cambiarlo pide comprobar el nuevo antes, o se pierde la cuenta—.
          */}
          <FormField
            label="Correo"
            hint="Es con lo que entras. Para cambiarlo hay que verificar el nuevo, así que se hace desde otro sitio."
          >
            <Input
              value={user?.email ?? ''}
              editable={false}
              testID="profile-email"
            />
          </FormField>

          {isPro && (
            <FormField
              label="Tu descripción"
              hint={`${bio.length}/${MAX_BIO}. Qué haces y cómo trabajas. Vacía, no sale nada.`}
              error={bio.length > MAX_BIO ? 'Te has pasado de largo' : undefined}
            >
              {loadingBio ? (
                <View style={styles.loading} testID="profile-bio-loading">
                  <ActivityIndicator size="small" color={theme.colors.accent} />
                </View>
              ) : (
                <Input
                  value={bio}
                  onChangeText={setBio}
                  placeholder="Ej. Fugas y reformas de baño. Presupuesto el mismo día."
                  multiline
                  numberOfLines={4}
                  style={styles.bio}
                  editable={!isSaving}
                  error={bio.length > MAX_BIO}
                  testID="profile-bio"
                />
              )}
            </FormField>
          )}

          <Button
            fullWidth
            loading={isSaving}
            disabled={!isValid || isSaving}
            onPress={() => void handleSave()}
            style={styles.save}
            testID="profile-save"
          >
            Guardar
          </Button>
        </View>
      </Animated.ScrollView>
    </View>
  )
}
