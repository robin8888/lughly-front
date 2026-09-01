/**
 * CoveragePage
 * Dónde trabaja el profesional: su base y hasta dónde se desplaza.
 *
 * Faltaba, y no era un detalle de acabado. Esto solo se podía fijar cuando una
 * empresa daba de alta a un trabajador, así que un autónomo se quedaba sin
 * punto base para siempre, y eso le costaba dos cosas:
 *
 * - **En su ficha no salía el mapa**, que es lo que responde a "¿me va a
 *   llegar?" sin tener que escribir para preguntarlo.
 * - **Las urgencias no se le filtraban por distancia**, porque el filtro se
 *   salta cuando no hay base. Le entraba todo, estuviera donde estuviera.
 *
 * La base se elige buscando la dirección, compartiendo la ubicación, o
 * arrastrando el marcador sobre el mapa. Las tres acaban en un punto, y el
 * mapa enseña siempre lo que se va a guardar: quien pone 5 km ve un círculo
 * pequeño y decide con eso, no con un número en abstracto.
 */

import { useEffect, useState } from 'react'
import { View, Text, ActivityIndicator, Pressable, Alert } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { FormScrollView } from '@/components/templates/FormScrollView'
import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/atoms/Input'
import { AddressInput } from '@/components/molecules/AddressInput'
import { EmptyState } from '@/components/molecules/EmptyState'
import { FormField } from '@/components/molecules/FormField'
import { InfoCard } from '@/components/molecules/InfoCard'
import { Picker } from '@/components/molecules/Picker'
import { CoverageMap } from '@/components/organisms/CoverageMap'
import { useMyCoverage, useSetMyCoverage } from '@/hooks/domain/useMyCoverage'
import { useIsEmployee } from '@/hooks/domain/useIsEmployee'
import { useShareLocation } from '@/hooks/domain/useShareLocation'
import { useNavScrollHandler } from '@/hooks/ui/useCompactNav'
import { useTabBarClearance } from '@/hooks/ui/useTabBarClearance'
import { geocodeApi, type ApiGeocodeMatch } from '@/api/geocode.api'
import { theme } from '@/theme'
import { styles } from './CoveragePage.styles'

/**
 * Los radios que se ofrecen. Una lista y no un deslizador: los kilómetros no
 * se afinan de uno en uno —nadie distingue trabajar a 17 o a 18— y una lista
 * se toca bien con el pulgar, que un deslizador de 1 a 50 en una pantalla de
 * móvil no.
 */
const RADIUS_OPTIONS = [1, 3, 5, 10, 15, 20, 30, 40, 50].map((km) => ({
  value: String(km),
  label: `${km} km`,
}))

/** Madrid, solo para encuadrar el mapa de quien todavía no tiene base */
const FALLBACK_CENTER: [number, number] = [-3.7038, 40.4168]

export interface CoveragePageProps {
  onBack: () => void
  /** Cuando la pone la empresa: la zona que se edita es la de ese trabajador */
  employeeId?: string
  employeeName?: string
}

export function CoveragePage({
  onBack,
  employeeId,
  employeeName,
}: CoveragePageProps) {
  const onScroll = useNavScrollHandler()
  const tabBarClearance = useTabBarClearance()
  const isEmployee = useIsEmployee()

  const isForEmployee = employeeId !== undefined
  const blocked = isEmployee && !isForEmployee

  const { data, isPending, isError, refetch } = useMyCoverage(!blocked, employeeId)
  const { save, isSaving } = useSetMyCoverage(employeeId)
  const { status: shareStatus, share } = useShareLocation()

  const [point, setPoint] = useState<{ lat: number; lng: number } | null>(null)
  const [radiusKm, setRadiusKm] = useState(15)
  const [city, setCity] = useState<string | undefined>(undefined)
  /**
   * El código postal del sitio elegido. No se enseña en ninguna parte: se
   * guarda porque sus dos primeras cifras son la provincia, y de ahí sale la
   * comunidad cuyo calendario de festivos se le aplica.
   *
   * Va con el punto del que salió, porque la base se mueve tocando el mapa y
   * eso no pasa por ningún geocodificador: sin recordar a qué punto pertenece,
   * quien arrastra el marcador de Madrid a Toledo guardaría el código postal
   * de Madrid y vería los festivos que no son.
   */
  const [postcode, setPostcode] = useState<string | undefined>(undefined)
  const [postcodeAt, setPostcodeAt] = useState<{ lat: number; lng: number } | null>(
    null,
  )
  /** La dirección elegida en el buscador, si el punto vino de ahí */
  const [address, setAddress] = useState<ApiGeocodeMatch | null>(null)
  /**
   * Fuerza a rehacer el campo de dirección cuando el punto se mueve **desde
   * el mapa**.
   *
   * Es el único sitio de la app donde el punto puede cambiar sin pasar por el
   * buscador: se arrastra el marcador y las coordenadas son otras. El texto
   * que quedara escrito describiría entonces un sitio distinto del que se va a
   * guardar, así que se vacía. Cambiar la `key` es lo que lo consigue sin
   * tener que sacar el texto del campo a este componente solo para poder
   * borrarlo desde fuera.
   */
  const [addressKey, setAddressKey] = useState(0)
  const [loaded, setLoaded] = useState(false)

  /**
   * Se copia lo guardado una sola vez. Si se copiara en cada respuesta, un
   * refresco de fondo devolvería el marcador a su sitio mientras se arrastra.
   */
  useEffect(() => {
    if (!data || loaded) return

    if (data.latitude !== null && data.longitude !== null) {
      setPoint({ lat: data.latitude, lng: data.longitude })

      // El que ya estaba guardado es el de ese punto: no hay que volver a pedirlo
      if (data.postcode) {
        setPostcode(data.postcode)
        setPostcodeAt({ lat: data.latitude, lng: data.longitude })
      }
    }

    setRadiusKm(data.radiusKm)
    setLoaded(true)
  }, [data, loaded])

  const choose = (match: ApiGeocodeMatch | null) => {
    setAddress(match)
    if (!match) return

    setPoint({ lat: match.lat, lng: match.lng })
    // La ciudad viaja solo si viene del buscador: es por donde se le busca
    if (match.city) setCity(match.city)
    setPostcode(match.postcode ?? undefined)
    setPostcodeAt({ lat: match.lat, lng: match.lng })
  }

  const handleShare = async () => {
    const position = await share()
    if (!position) return

    setPoint({ lat: position.lat, lng: position.lng })
    if (position.city) setCity(position.city)
    setPostcode(position.postcode ?? undefined)
    setPostcodeAt({ lat: position.lat, lng: position.lng })

    /*
      La posición del GPS entra en el campo como dirección elegida: es un
      punto real, solo que situado por el móvil en vez de por la lista.
    */
    if (position.label) {
      setAddress({
        label: position.label,
        lat: position.lat,
        lng: position.lng,
        city: position.city,
        postcode: position.postcode,
      })
    }
  }

  /**
   * El código postal del punto que se va a guardar.
   *
   * Si la base se ha movido tocando el mapa —que es como se pone casi
   * siempre— no ha pasado por ningún geocodificador y no hay código postal, o
   * peor, queda el del sitio anterior. Se pide aquí, una sola vez y solo
   * cuando hace falta, en vez de en cada arrastre del marcador.
   *
   * Si el geocodificador no responde se guarda igual: la zona es lo que ha
   * venido a hacer. Lo único que se queda sin saber es su comunidad, y el
   * calendario ya sabe decirlo.
   */
  const resolvePostcode = async (): Promise<string | null> => {
    if (!point) return null

    const isKnown =
      postcodeAt !== null &&
      postcodeAt.lat === point.lat &&
      postcodeAt.lng === point.lng

    if (postcode && isKnown) return postcode

    try {
      const { match } = await geocodeApi.reverse(point.lat, point.lng)
      return match?.postcode ?? null
    } catch {
      return null
    }
  }

  const handleSave = async () => {
    if (!point) return

    const { ok, error } = await save({
      latitude: point.lat,
      longitude: point.lng,
      radiusKm,
      city,
      postcode: await resolvePostcode(),
    })

    if (!ok) {
      Alert.alert(
        'No se ha podido guardar',
        error ?? 'Inténtalo de nuevo en un momento.',
      )
      return
    }

    Alert.alert(
      'Zona guardada',
      `Aparecerás disponible para trabajos a menos de ${radiusKm} km de tu base, y tu ficha enseñará el mapa.`,
    )
    onBack()
  }

  const header = (
    <View style={styles.header}>
      {/* La cabecera ocupa también la franja del sistema: la hora, en claro */}
      <StatusBar style="light" />
      <Pressable onPress={onBack} style={styles.back} accessibilityRole="button">
        <Text style={styles.backIcon}>←</Text>
      </Pressable>
      <Text style={styles.title} numberOfLines={1}>
        {isForEmployee ? (employeeName ?? 'Su zona') : 'Mi zona'}
      </Text>
    </View>
  )

  /**
   * A un empleado se la pone su empresa, igual que sus oficios y su horario:
   * la zona a la que se le manda a trabajar es de quien organiza el trabajo.
   */
  if (blocked) {
    return (
      <View style={styles.screen} testID="coverage-page">
        {header}
        <EmptyState
          title="Tu zona la pone tu empresa"
          message="Quien te dio de alta decide desde dónde y hasta dónde trabajas, igual que tus oficios y tu horario. Si algo no cuadra, háblalo con ellos."
          testID="coverage-employee"
        />
      </View>
    )
  }

  if (isPending) {
    return (
      <View style={styles.screen} testID="coverage-page">
        {header}
        <View style={styles.state} testID="coverage-loading">
          <ActivityIndicator size="large" color={theme.colors.accent} />
        </View>
      </View>
    )
  }

  if (isError) {
    return (
      <View style={styles.screen} testID="coverage-page">
        {header}
        <EmptyState
          title="No hemos podido cargar tu zona"
          message="Revisa tu conexión e inténtalo de nuevo."
          actions={[
            {
              label: 'Reintentar',
              onPress: () => void refetch(),
              testID: 'coverage-retry',
            },
          ]}
          testID="coverage-error"
        />
      </View>
    )
  }

  return (
    <View style={styles.screen} testID="coverage-page">
      {header}

      <FormScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={[styles.content, { paddingBottom: tabBarClearance }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <InfoCard variant="accent">
          <Text style={styles.intro}>
            {isForEmployee
              ? 'Desde dónde sale y hasta dónde se desplaza. El cliente lo ve en su ficha antes de escribirle, así que decide cuánta gente le encuentra.'
              : 'Desde dónde sales y hasta dónde te desplazas. El cliente lo ve en tu ficha antes de escribirte, así que decide cuánta gente te encuentra.'}
          </Text>

          <Text style={styles.note}>
            Las urgencias también se reparten por esta distancia: sin punto base
            te llegan todas, incluidas las que te pillan a dos horas de coche.
          </Text>
        </InfoCard>

        <View style={styles.field}>
          {/**
            * El botón "Buscar" se fue con el campo antiguo: ahora las
            * sugerencias salen mientras se escribe, así que no hay nada que
            * pulsar. Era además el único buscador de direcciones de la app que
            * pedía un gesto extra, y esta pantalla la usa un profesional que
            * ya está dentro —no tenía por qué ser la más torpe de las cinco—.
            */}
          <FormField label="Tu base">
            <AddressInput
              key={`coverage-address-${addressKey}`}
              value={address}
              onChange={choose}
              placeholder="Calle y número"
              editable={!isSaving}
              testID="coverage-address"
            />
          </FormField>
        </View>

        <View style={styles.searchRow}>
          <Button
            variant="secondary"
            onPress={() => void handleShare()}
            loading={shareStatus === 'locating'}
            disabled={isSaving}
            style={styles.searchButton}
            testID="coverage-locate"
          >
            Usar mi ubicación
          </Button>
        </View>

        {shareStatus === 'denied' && (
          <Text style={styles.hint}>
            No hemos podido acceder a tu ubicación. Búscala escribiendo la
            dirección, o mueve el marcador en el mapa.
          </Text>
        )}

        <View style={styles.field}>
          <FormField label="Hasta dónde te desplazas">
          <Picker
            options={RADIUS_OPTIONS}
            value={String(radiusKm)}
            onChange={(value) => setRadiusKm(Number(value))}
            title="Radio de trabajo"
            disabled={isSaving}
              testID="coverage-radius"
            />
          </FormField>
        </View>

        {/*
          El mapa enseña lo que se va a guardar, y sirve para ponerlo: un toque
          deja ahí la base. Es también la forma más rápida de corregir los cien
          metros que un buscador de direcciones casi nunca acierta.
        */}
        <Text style={styles.mapHint}>
          {point === null
            ? 'Toca el mapa donde tengas tu base, o búscala arriba.'
            : 'Toca el mapa para mover tu base, o arrastra el marcador.'}
        </Text>
        <CoverageMap
          center={point ? [point.lng, point.lat] : FALLBACK_CENTER}
          radiusKm={radiusKm}
          editable
          onChange={([lng, lat]) => {
            setPoint({ lat, lng })
            /*
              Mover el marcador deja de ser lo que dice el campo de arriba, así
              que el campo se vacía: ver `addressKey`. El código postal se
              vuelve a pedir solo, porque `postcodeAt` ya no cuadra con el
              punto nuevo.
            */
            setAddress(null)
            setAddressKey((n) => n + 1)
          }}
          style={styles.map}
          testID="coverage-map"
        />

        {/*
          Pegado al botón y no perdido más arriba: un botón apagado sin motivo
          al lado se lee como una app rota. Aquí pasó exactamente eso.
        */}
        {point === null && (
          <Text style={styles.blocked} testID="coverage-no-point">
            Para guardar falta decir dónde tienes la base: toca el mapa, busca
            tu dirección o usa tu ubicación.
          </Text>
        )}

        <Button
          fullWidth
          loading={isSaving}
          disabled={point === null || isSaving}
          onPress={() => void handleSave()}
          style={styles.save}
          testID="coverage-save"
        >
          Guardar mi zona
        </Button>
      </FormScrollView>
    </View>
  )
}
