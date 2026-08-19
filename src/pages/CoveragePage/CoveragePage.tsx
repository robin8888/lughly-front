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
import Animated from 'react-native-reanimated'
import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/atoms/Input'
import { EmptyState } from '@/components/molecules/EmptyState'
import { FormField } from '@/components/molecules/FormField'
import { InfoCard } from '@/components/molecules/InfoCard'
import { Picker } from '@/components/molecules/Picker'
import { CoverageMap } from '@/components/organisms/CoverageMap'
import { useMyCoverage, useSetMyCoverage } from '@/hooks/domain/useMyCoverage'
import { useIsEmployee } from '@/hooks/domain/useIsEmployee'
import { useShareLocation } from '@/hooks/domain/useShareLocation'
import { useNavScrollHandler } from '@/hooks/ui/useCompactNav'
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
}

export function CoveragePage({ onBack }: CoveragePageProps) {
  const onScroll = useNavScrollHandler()
  const isEmployee = useIsEmployee()
  const { data, isPending, isError, refetch } = useMyCoverage(!isEmployee)
  const { save, isSaving } = useSetMyCoverage()
  const { status: shareStatus, share } = useShareLocation()

  const [point, setPoint] = useState<{ lat: number; lng: number } | null>(null)
  const [radiusKm, setRadiusKm] = useState(15)
  const [city, setCity] = useState<string | undefined>(undefined)
  const [query, setQuery] = useState('')
  const [matches, setMatches] = useState<ApiGeocodeMatch[] | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [loaded, setLoaded] = useState(false)

  /**
   * Se copia lo guardado una sola vez. Si se copiara en cada respuesta, un
   * refresco de fondo devolvería el marcador a su sitio mientras se arrastra.
   */
  useEffect(() => {
    if (!data || loaded) return

    if (data.latitude !== null && data.longitude !== null) {
      setPoint({ lat: data.latitude, lng: data.longitude })
    }

    setRadiusKm(data.radiusKm)
    setLoaded(true)
  }, [data, loaded])

  const handleSearch = async () => {
    const term = query.trim()
    if (term.length < 3) return

    setIsSearching(true)

    try {
      const { matches: found } = await geocodeApi.search(term)
      setMatches(found)
    } catch {
      // Sin resultados y sin drama: quedan el mapa y la ubicación actual
      setMatches([])
    } finally {
      setIsSearching(false)
    }
  }

  const choose = (match: ApiGeocodeMatch) => {
    setPoint({ lat: match.lat, lng: match.lng })
    // La ciudad viaja solo si viene del buscador: es por donde se le busca
    if (match.city) setCity(match.city)
    setMatches(null)
    setQuery(match.label)
  }

  const handleShare = async () => {
    const position = await share()
    if (!position) return

    setPoint({ lat: position.lat, lng: position.lng })
    if (position.city) setCity(position.city)
    if (position.label) setQuery(position.label)
    setMatches(null)
  }

  const handleSave = async () => {
    if (!point) return

    const { ok, error } = await save({
      latitude: point.lat,
      longitude: point.lng,
      radiusKm,
      city,
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
      <Pressable onPress={onBack} style={styles.back} accessibilityRole="button">
        <Text style={styles.backIcon}>←</Text>
      </Pressable>
      <Text style={styles.title} numberOfLines={1}>
        Mi zona
      </Text>
    </View>
  )

  /**
   * A un empleado se la pone su empresa, igual que sus oficios y su horario:
   * la zona a la que se le manda a trabajar es de quien organiza el trabajo.
   */
  if (isEmployee) {
    return (
      <View style={styles.screen} testID="coverage-page">
        {header}
        <EmptyState
          title="Tu zona la pone tu empresa"
          message="Quien te dio de alta decide desde dónde y hasta dónde trabajas, igual que tus oficios y tu horario. Si algo no cuadra, háblalo con ellos."
          illustration="greeting"
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
          illustration="greeting"
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

      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <InfoCard>
          <Text style={styles.intro}>
            Desde dónde sales y hasta dónde te desplazas. El cliente lo ve en tu
            ficha antes de escribirte, así que decide cuánta gente te encuentra.
          </Text>

          <Text style={styles.note}>
            Las urgencias también se reparten por esta distancia: sin punto base
            te llegan todas, incluidas las que te pillan a dos horas de coche.
          </Text>
        </InfoCard>

        <View style={styles.field}>
          <FormField label="Tu base">
          <Input
            value={query}
            onChangeText={setQuery}
            placeholder="Calle, número y ciudad"
            autoCapitalize="words"
            editable={!isSaving}
            returnKeyType="search"
            onSubmitEditing={() => void handleSearch()}
              testID="coverage-address"
            />
          </FormField>
        </View>

        <View style={styles.searchRow}>
          <Button
            variant="secondary"
            onPress={() => void handleSearch()}
            loading={isSearching}
            disabled={query.trim().length < 3 || isSaving}
            style={styles.searchButton}
            testID="coverage-search"
          >
            Buscar
          </Button>

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

        {matches !== null &&
          (matches.length === 0 ? (
            <Text style={styles.hint} testID="coverage-no-matches">
              No hemos encontrado esa dirección. Prueba con la calle y la ciudad,
              o mueve el marcador en el mapa.
            </Text>
          ) : (
            <View style={styles.matches} testID="coverage-matches">
              {matches.map((match) => (
                <Pressable
                  key={`${match.lat},${match.lng}`}
                  onPress={() => choose(match)}
                  style={styles.match}
                  accessibilityRole="button"
                  testID={`coverage-match-${match.lat},${match.lng}`}
                >
                  <Text style={styles.matchLabel}>{match.label}</Text>
                </Pressable>
              ))}
            </View>
          ))}

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
          El mapa enseña lo que se va a guardar, y el marcador se arrastra: es
          la forma más rápida de corregir los cien metros que el buscador de
          direcciones casi nunca acierta.
        */}
        <CoverageMap
          center={point ? [point.lng, point.lat] : FALLBACK_CENTER}
          radiusKm={radiusKm}
          editable
          onChange={([lng, lat]) => setPoint({ lat, lng })}
          style={styles.map}
          testID="coverage-map"
        />

        {point === null && (
          <Text style={styles.hint}>
            Todavía no tienes base. Búscala arriba o arrastra el marcador hasta
            donde sales a trabajar.
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
      </Animated.ScrollView>
    </View>
  )
}
