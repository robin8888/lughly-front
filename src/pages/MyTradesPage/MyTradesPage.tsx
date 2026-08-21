/**
 * MyTradesPage
 * Los oficios que ejerce el profesional y lo que cobra por cada uno.
 *
 * Sin esta pantalla, quien se registrara con un oficio no podría añadir otro
 * nunca: los oficios se declaran en el alta y ahí se quedaban. Y es un cambio
 * corriente —alguien que limpia empieza a cuidar mayores, o al revés—, no una
 * rareza que justifique pasar por soporte.
 *
 * Se guarda la lista entera de golpe. No hay guardado por oficio porque
 * quedarse a medias significaría desaparecer del directorio en el hueco.
 */

import { useEffect, useState } from 'react'
import { View, Text, ScrollView, ActivityIndicator, Pressable, Alert } from 'react-native'
import Animated from 'react-native-reanimated'
import { Button } from '@/components/atoms/Button'
import { EmptyState } from '@/components/molecules/EmptyState'
import { InfoCard } from '@/components/molecules/InfoCard'
import { TradeRatesField, type TradeRate } from '@/components/molecules/TradeRatesField'
import { useMyPhotos } from '@/hooks/domain/useMyPhotos'
import { useMyTrades, useSetMyTrades } from '@/hooks/domain/useMyTrades'
import { useIsEmployee } from '@/hooks/domain/useIsEmployee'
import { useNavScrollHandler } from '@/hooks/ui/useCompactNav'
import { getTradeLabel } from '@/utils/trades'
import { theme } from '@/theme'
import { CartaTradeSection } from './CartaTradeSection'
import { styles } from './MyTradesPage.styles'

export interface MyTradesPageProps {
  onBack: () => void
}

export function MyTradesPage({ onBack }: MyTradesPageProps) {
  const onScroll = useNavScrollHandler()
  const isEmployee = useIsEmployee()

  // A un empleado el backend le responde 403: no se le pide la lista
  const { data, isPending, isError, refetch } = useMyTrades(!isEmployee)
  const { save, isSaving, formError } = useSetMyTrades()

  // Para avisar de las fotos que se van con un oficio que se quita
  const photos = useMyPhotos(!isEmployee)

  const [trades, setTrades] = useState<TradeRate[] | null>(null)

  /**
   * El formulario arranca con lo que hay guardado y a partir de ahí es suyo.
   * Se copia una sola vez —cuando llega la respuesta— para que un refresco de
   * fondo no le borre lo que esté escribiendo.
   */
  useEffect(() => {
    if (data && trades === null) {
      setTrades(
        data.map((trade) => ({
          slug: trade.slug,
          hourlyRate: String(trade.hourlyRate),
          /* Vacío si no atiende urgencias de ese oficio, que es lo normal */
          urgencyRate:
            trade.urgencyHourlyRate == null ? '' : String(trade.urgencyHourlyRate),
          /* Vacía = sale la descripción general del perfil, como hasta ahora */
          description: trade.description ?? '',
        })),
      )
    }
  }, [data, trades])

  const rateOf = (value: string) => Number(value.replace(',', '.'))

  const current = trades ?? []

  /**
   * Solo los oficios que YA están guardados en el servidor pueden tener
   * carta: `SetMyCartaUseCase` exige un `ProTrade` existente, y uno recién
   * añadido en este formulario todavía no lo es hasta que se pulse
   * "Guardar" más abajo.
   */
  const savedSlugs = new Set((data ?? []).map((trade) => trade.slug))

  /**
   * Los oficios que tenía, tienen fotos y ya no están en la lista. El servidor
   * borra sus fotos al guardar, así que se dice antes.
   */
  const kept = new Set(current.map((trade) => trade.slug))
  const removesPhotos = (photos.data ?? [])
    .filter((photo) => !kept.has(photo.tradeSlug))
    .reduce<{ slug: string; label: string }[]>((list, photo) => {
      if (!list.some((entry) => entry.slug === photo.tradeSlug)) {
        list.push({ slug: photo.tradeSlug, label: photo.tradeLabel })
      }

      return list
    }, [])

  const canSave =
    current.length > 0 &&
    current.every((trade) => rateOf(trade.hourlyRate) > 0) &&
    /*
      La de urgencia puede estar vacía —significa que no las atiende—, pero si
      escribe algo tiene que ser un número: un "no sé" a medio teclear se
      guardaría como una tarifa de cero.
    */
    current.every(
      (trade) =>
        trade.urgencyRate.trim() === '' || rateOf(trade.urgencyRate) > 0,
    ) &&
    !isSaving

  const handleSave = async () => {
    const saved = await save({
      trades: current.map((trade) => ({
        slug: trade.slug,
        hourlyRate: rateOf(trade.hourlyRate),
        urgencyHourlyRate:
          trade.urgencyRate.trim() === '' ? null : rateOf(trade.urgencyRate),
        description: trade.description.trim(),
      })),
    })

    if (!saved) return

    Alert.alert(
      'Oficios guardados',
      'Ya apareces en el directorio de cada uno, con el precio que has puesto.',
    )
    onBack()
  }

  const header = (
    <View style={styles.header}>
      <Pressable onPress={onBack} style={styles.back} accessibilityRole="button">
        <Text style={styles.backIcon}>←</Text>
      </Pressable>
      <Text style={styles.title}>Mis oficios</Text>
    </View>
  )

  /**
   * Los oficios de un empleado los pone su empresa, porque llevan pegada la
   * tarifa y la tarifa es lo que ella cobra. Se dice aquí en vez de dejarle
   * llegar a un 403 sin explicación.
   */
  if (isEmployee) {
    return (
      <View style={styles.screen} testID="my-trades-page">
        {header}
        <ScrollView contentContainerStyle={styles.content}>
          <EmptyState
            title="Los lleva tu empresa"
            message="Tus oficios y lo que se cobra por tu hora los gestiona quien te dio de alta. Si haces algo que no aparece en tu ficha, díselo a ellos."
            actions={[
              { label: 'Volver', onPress: onBack, testID: 'my-trades-employee-back' },
            ]}
            testID="my-trades-employee"
          />
        </ScrollView>
      </View>
    )
  }

  return (
    <View style={styles.screen} testID="my-trades-page">
      {header}

      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {isPending ? (
          <View style={styles.state} testID="my-trades-loading">
            <ActivityIndicator size="large" color={theme.colors.accent} />
          </View>
        ) : isError ? (
          <EmptyState
            title="No hemos podido cargar tus oficios"
            message="Revisa tu conexión e inténtalo de nuevo."
            actions={[
              {
                label: 'Reintentar',
                onPress: () => void refetch(),
                testID: 'my-trades-retry',
              },
            ]}
            testID="my-trades-error"
          />
        ) : (
          <>
            {/*
              El párrafo que explica, en su propia tarjeta azul y fuera
              de la blanca: lo que se lee y lo que se toca, separados.
            */}
            <InfoCard variant="accent">
              <Text style={styles.intro}>
                Añade todo lo que hagas de verdad: cada oficio te pone en el
                listado de ese oficio, con su hora normal, su hora en urgencia,
                lo que cuentes de él y, si quieres, su carta.
              </Text>

              <Text style={styles.introNote}>
                Va todo por oficio porque no se cobra igual limpiar una casa
                que cuidar a un mayor, ni se cuenta lo mismo. Lo que escribas
                en cada uno es lo que lee el cliente que busca ese oficio.
              </Text>
            </InfoCard>

            <InfoCard>

            {/**
             * El aviso de las fotos va antes de guardar, no después: quitar un
             * oficio borra las fotos suyas, y eso no se deshace. Solo se dice
             * a quien tiene alguna, para no asustar al que no.
             */}
            {removesPhotos.length > 0 && (
              <Text style={styles.warning} testID="my-trades-photo-warning">
                Al guardar se borrarán las fotos de{' '}
                {removesPhotos.map((trade) => trade.label.toLowerCase()).join(', ')}
                : una foto solo se enseña en el listado de su oficio, así que sin
                el oficio no se vería en ninguna parte.
              </Text>
            )}

            {formError && <Text style={styles.formError}>{formError}</Text>}

            <TradeRatesField
              value={current}
              onChange={setTrades}
              disabled={isSaving}
              renderExtra={(trade) =>
                savedSlugs.has(trade.slug) ? (
                  <CartaTradeSection
                    tradeSlug={trade.slug}
                    label={getTradeLabel(trade.slug)}
                    disabled={isSaving}
                  />
                ) : (
                  <Text style={styles.cartaPending}>
                    Guarda este oficio para poder ponerle una carta.
                  </Text>
                )
              }
              testID="my-trades-field"
            />

            <Button
              fullWidth
              loading={isSaving}
              disabled={!canSave}
              onPress={() => void handleSave()}
              style={styles.save}
              testID="my-trades-save"
            >
              Guardar
            </Button>

            {current.length === 0 && (
              <Text style={styles.warning}>
                Si te quedas sin ningún oficio dejas de aparecer en el
                directorio. Por eso no se puede guardar la lista vacía.
              </Text>
            )}
          </InfoCard>
          </>
        )}
      </Animated.ScrollView>
    </View>
  )
}
