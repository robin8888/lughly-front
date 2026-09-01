/**
 * MyProfilePage
 * Los datos propios: nombre, teléfono, dirección, correo y —si es
 * profesional— la descripción de su trabajo.
 *
 * Faltaba entera. De todo lo que se pide al registrarse solo se podían cambiar
 * después la contraseña, la foto y los oficios: quien tecleaba mal su nombre en
 * el alta se quedaba así, y ese nombre sale en su ficha y en los avisos que le
 * llegan al cliente.
 *
 * **La descripción no la escribía nadie.** El único sitio del proyecto que
 * tocaba ese campo era el script de datos de ejemplo, y por eso solo la tenían
 * los profesionales de prueba.
 *
 * La dirección se edita aquí porque es aquí donde se editan los demás datos
 * de la persona, y desde que se pide en el alta habría quedado como el único
 * campo obligatorio imposible de cambiar: una trampa para cualquiera que se
 * mude. Se cambia con el mismo campo de sugerencias del registro, así que
 * sigue llevando coordenadas y el directorio se reordena solo.
 *
 * **A un profesional no le mueve la zona de cobertura.** Dónde vive y desde
 * dónde sale a trabajar son dos cosas: quien cambia de piso y mantiene el
 * taller donde estaba vería si no su radio saltar a la otra punta de la ciudad
 * —y con él, a qué urgencias le avisan— sin haberlo pedido. La zona tiene su
 * pantalla, su mapa y su endpoint.
 *
 * El correo se enseña pero no se edita, y se dice por qué. No es un descuido:
 * es la identidad con la que se entra y el camino para recuperar la cuenta, así
 * que cambiarlo pide comprobar antes que el nuevo existe y es de quien dice.
 * Un campo que lo cambiara de un toque puede dejar a alguien fuera de su cuenta
 * para siempre.
 */

import { useEffect, useState } from 'react'
import { View, Text, ActivityIndicator, Pressable, Alert } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { FormScrollView } from '@/components/templates/FormScrollView'
import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/atoms/Input'
import { FormField } from '@/components/molecules/FormField'
import { AddressInput } from '@/components/molecules/AddressInput'
import type { ApiGeocodeMatch } from '@/api/geocode.api'
import { InfoCard } from '@/components/molecules/InfoCard'
import { useMyBio, useSaveMyProfile } from '@/hooks/domain/useMyProfile'
import { useNavScrollHandler } from '@/hooks/ui/useCompactNav'
import { useTabBarClearance } from '@/hooks/ui/useTabBarClearance'
import { useUser } from '@/stores/useAuthStore'
import { useEffectiveRole } from '@/hooks/auth/useEffectiveRole'
import { theme } from '@/theme'
import { styles } from './MyProfilePage.styles'

/** Lo mismo que admite el servidor: caben tres o cuatro frases */
const MAX_BIO = 400

export interface MyProfilePageProps {
  onBack: () => void
  /**
   * A Mis oficios, donde vive la descripción de cada uno.
   *
   * Desde aquí y no solo desde Mi cuenta: quien está escribiendo su
   * descripción es justo quien tiene que saber que hay otra por oficio, y
   * mandarle a buscarla por su cuenta es como no decírselo.
   */
  onEditTrades?: () => void
}

export function MyProfilePage({ onBack, onEditTrades }: MyProfilePageProps) {
  const onScroll = useNavScrollHandler()
  const tabBarClearance = useTabBarClearance()
  const user = useUser()
  const isPro = useEffectiveRole() === 'pro'

  const { data: bioData, isPending: loadingBio } = useMyBio(isPro)
  const { save, isSaving } = useSaveMyProfile()

  const [name, setName] = useState(user?.name ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')
  /**
   * La suya, la que dio en el alta. `null` en las cuentas anteriores a que se
   * pidiera: para esas, el campo sale vacío y es la primera vez que se les
   * puede preguntar.
   */
  const [address, setAddress] = useState<ApiGeocodeMatch | null>(
    user?.address ?? null,
  )
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
    const payload: {
      name?: string
      phone?: string
      address?: ApiGeocodeMatch
      bio?: string
    } = {}

    if (trimmedName !== (user?.name ?? '')) payload.name = trimmedName
    if (phone.trim() !== (user?.phone ?? '')) payload.phone = phone.trim()

    /*
      Por coordenadas y no por texto: dos portales distintos de la misma calle
      traen la misma etiqueta recortada más de una vez, y comparar el texto
      dejaría pasar por "sin cambios" una mudanza de verdad. Y al revés: el
      proveedor puede devolver la misma dirección con la etiqueta escrita de
      otra forma, y eso no es un cambio que merezca una petición.
    */
    if (
      address &&
      (address.lat !== user?.address?.lat || address.lng !== user?.address?.lng)
    ) {
      payload.address = address
    }
    if (isPro && loadedBio && bio.trim() !== (bioData?.bio ?? '')) {
      payload.bio = bio.trim()
    }

    return payload
  }

  const handleSave = async () => {
    /*
      Se avisa antes de comparar nada. Quien tenía dirección y se pone a
      escribir otra sin elegirla de la lista deja el campo sin coordenadas, y
      `changes()` la descarta: sin esto, guardaría y le diría "no has cambiado
      nada" justo después de haber escrito su nueva calle.
    */
    if (address === null && user?.address) {
      setError('Elige tu dirección de la lista de sugerencias.')
      return
    }

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
        {/* La cabecera ocupa también la franja del sistema: la hora, en claro */}
        <StatusBar style="light" />
        <Pressable onPress={onBack} style={styles.back} accessibilityRole="button">
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <Text style={styles.title} numberOfLines={1}>
          Mis datos
        </Text>
      </View>

      <FormScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={[styles.content, { paddingBottom: tabBarClearance }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {isPro && (
          <InfoCard variant="accent">
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

          <FormField
            label="Dirección"
            hint={
              isPro
                ? 'Dónde vives. No se publica, y cambiarla no mueve tu zona de trabajo: eso se hace en Mi zona de trabajo.'
                : 'La usamos para enseñarte a los profesionales que tienes más cerca. No se publica.'
            }
          >
            <AddressInput
              value={address}
              onChange={setAddress}
              editable={!isSaving}
              testID="profile-address"
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
            /**
             * La general, la de la persona. Desde el 20 Agosto 2026 cada
             * oficio puede tener la suya, y son dos cosas distintas: aquí va
             * quién eres y cómo trabajas, y allí qué haces en ese oficio
             * concreto. Esta se sigue enseñando en los oficios que no tengan
             * la suya, así que no sobra ni se queda vieja.
             */
            <FormField
              label="Sobre ti"
              hint={`${bio.length}/${MAX_BIO}. Quién eres y cómo trabajas, no lo que haces en cada oficio: eso va en Mis oficios, uno a uno.`}
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
                  placeholder="Ej. Doce años en obra y reforma. Voy con el material, aviso si me retraso y dejo la casa recogida."
                  multiline
                  numberOfLines={4}
                  style={styles.bio}
                  editable={!isSaving}
                  error={bio.length > MAX_BIO}
                  testID="profile-bio"
                />
              )}

              {/*
                Y de aquí a la otra. Se enseña donde se está escribiendo esta,
                que es cuando importa saber que existe: si no, quien tiene tres
                oficios cuenta uno solo aquí y sale igual en los tres listados.
              */}
              {onEditTrades && (
                <Pressable
                  onPress={onEditTrades}
                  disabled={isSaving}
                  accessibilityRole="button"
                  style={styles.toTrades}
                  testID="profile-to-trades"
                >
                  <Text style={styles.toTradesText}>
                    Escribir una por oficio
                  </Text>
                </Pressable>
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
      </FormScrollView>
    </View>
  )
}
