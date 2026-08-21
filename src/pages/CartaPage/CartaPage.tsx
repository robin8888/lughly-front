/**
 * CartaPage
 * La carta: tarifa de visita a domicilio y servicios a precio fijo, por
 * oficio (COMO_SE_CONTRATA.md v3 §2).
 *
 * No todos los oficios la usan — limpieza, clases o cuidado siguen siendo
 * por horas — así que es opcional en cada uno, y se guarda oficio a oficio:
 * a diferencia de "Mis oficios y tarifas", aquí no tiene sentido un único
 * botón de guardar para todos a la vez, porque montar la carta de uno no
 * tiene nada que ver con la de otro.
 *
 * Sin la tarifa de visita puesta no hay carta que guardar: es lo mínimo que
 * se cobra aunque no se marque ningún servicio, así que el botón de guardar
 * de cada oficio se queda apagado hasta que tenga un número mayor que cero.
 */

import { useEffect, useState } from 'react'
import { View, Text, ActivityIndicator, Pressable, Alert } from 'react-native'
import Animated from 'react-native-reanimated'
import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/atoms/Input'
import { EmptyState } from '@/components/molecules/EmptyState'
import { InfoCard } from '@/components/molecules/InfoCard'
import { ServiceItemsField, type ServiceItemRate } from '@/components/molecules/ServiceItemsField'
import { useMyTrades } from '@/hooks/domain/useMyTrades'
import { useMyCarta, useSetMyCarta } from '@/hooks/domain/useMyCarta'
import { useIsEmployee } from '@/hooks/domain/useIsEmployee'
import { useNavScrollHandler } from '@/hooks/ui/useCompactNav'
import { theme } from '@/theme'
import { styles } from './CartaPage.styles'

export interface CartaPageProps {
  onBack: () => void
}

interface CartaTradeSectionProps {
  tradeSlug: string
  label: string
}

function CartaTradeSection({ tradeSlug, label }: CartaTradeSectionProps) {
  const { data, isPending, isError, refetch } = useMyCarta(tradeSlug)
  const { save, isSaving, formError } = useSetMyCarta(tradeSlug)

  const [visitFee, setVisitFee] = useState('')
  const [services, setServices] = useState<ServiceItemRate[]>([])
  const [loaded, setLoaded] = useState(false)

  /**
   * Se copia lo guardado una sola vez. Si se copiara en cada respuesta, un
   * refresco de fondo borraría lo que se está escribiendo.
   */
  useEffect(() => {
    if (!data || loaded) return

    setVisitFee(data.visitFee === null ? '' : String(data.visitFee))
    setServices(
      data.services.map((service) => ({
        id: service.id,
        name: service.name,
        price: String(service.price),
      })),
    )
    setLoaded(true)
  }, [data, loaded])

  const visitFeeOf = Number(visitFee.trim().replace(',', '.'))
  const canSave =
    visitFee.trim() !== '' &&
    visitFeeOf > 0 &&
    services.every((service) => {
      const price = Number(service.price.trim().replace(',', '.'))
      return service.name.trim().length >= 2 && price > 0
    }) &&
    !isSaving

  const handleSave = async () => {
    const saved = await save({
      visitFee: visitFeeOf,
      services: services.map((service) => ({
        name: service.name.trim(),
        price: Number(service.price.trim().replace(',', '.')),
      })),
    })

    if (!saved) return

    Alert.alert(
      'Carta guardada',
      `Ya se ve en tu ficha de ${label.toLowerCase()}: la visita y ${saved.services.length} ${
        saved.services.length === 1 ? 'servicio' : 'servicios'
      }.`,
    )
  }

  if (isPending) {
    return (
      <InfoCard style={styles.tradeCard} testID={`carta-trade-${tradeSlug}`}>
        <Text style={styles.tradeTitle}>{label}</Text>
        <View style={styles.state}>
          <ActivityIndicator color={theme.colors.accent} />
        </View>
      </InfoCard>
    )
  }

  if (isError) {
    return (
      <InfoCard style={styles.tradeCard} testID={`carta-trade-${tradeSlug}`}>
        <Text style={styles.tradeTitle}>{label}</Text>
        <Text style={styles.formError}>No hemos podido cargar esta carta.</Text>
        <Pressable onPress={() => void refetch()} testID={`carta-retry-${tradeSlug}`}>
          <Text style={styles.retry}>Reintentar</Text>
        </Pressable>
      </InfoCard>
    )
  }

  return (
    <InfoCard style={styles.tradeCard} testID={`carta-trade-${tradeSlug}`}>
      <Text style={styles.tradeTitle}>{label}</Text>

      {formError && <Text style={styles.formError}>{formError}</Text>}

      <View style={styles.visitField}>
        <Text style={styles.fieldLabel}>Tarifa de visita a domicilio</Text>
        <Input
          value={visitFee}
          onChangeText={(text) => setVisitFee(text.replace(/[^0-9.,]/g, ''))}
          placeholder="0"
          suffix="€"
          keyboardType="decimal-pad"
          editable={!isSaving}
          testID={`carta-visit-fee-${tradeSlug}`}
        />
        <Text style={styles.fieldHint}>
          Lo que cobras por presentarte, con o sin servicio de la carta
          detrás. Es lo mínimo que se paga aunque no se marque ningún
          servicio.
        </Text>
      </View>

      <ServiceItemsField
        value={services}
        onChange={setServices}
        disabled={isSaving}
        testID={`carta-services-${tradeSlug}`}
      />

      <Button
        loading={isSaving}
        disabled={!canSave}
        onPress={() => void handleSave()}
        style={styles.save}
        testID={`carta-save-${tradeSlug}`}
      >
        Guardar carta de {label.toLowerCase()}
      </Button>
    </InfoCard>
  )
}

export function CartaPage({ onBack }: CartaPageProps) {
  const onScroll = useNavScrollHandler()
  const isEmployee = useIsEmployee()

  const { data: trades, isPending, isError, refetch } = useMyTrades(!isEmployee)

  const header = (
    <View style={styles.header}>
      <Pressable onPress={onBack} style={styles.back} accessibilityRole="button">
        <Text style={styles.backIcon}>←</Text>
      </Pressable>
      <Text style={styles.title}>Mi carta</Text>
    </View>
  )

  /**
   * La carta la pone quien pone el precio de cada oficio. Un empleado no
   * fija sus tarifas, así que tampoco su carta.
   */
  if (isEmployee) {
    return (
      <View style={styles.screen} testID="carta-page">
        {header}
        <EmptyState
          title="La lleva tu empresa"
          message="La carta de cada oficio la monta quien pone el precio, y eso lo hace quien te dio de alta."
          actions={[{ label: 'Volver', onPress: onBack, testID: 'carta-employee-back' }]}
          testID="carta-employee"
        />
      </View>
    )
  }

  return (
    <View style={styles.screen} testID="carta-page">
      {header}

      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {isPending ? (
          <View style={styles.state} testID="carta-loading">
            <ActivityIndicator size="large" color={theme.colors.accent} />
          </View>
        ) : isError ? (
          <EmptyState
            title="No hemos podido cargar tus oficios"
            message="Revisa tu conexión e inténtalo de nuevo."
            actions={[{ label: 'Reintentar', onPress: () => void refetch(), testID: 'carta-retry' }]}
            testID="carta-error"
          />
        ) : !trades || trades.length === 0 ? (
          <EmptyState
            title="Todavía no tienes ningún oficio"
            message="Añade al menos uno en Mis oficios y tarifas antes de montar su carta."
            testID="carta-empty"
          />
        ) : (
          <>
            <InfoCard variant="accent">
              <Text style={styles.intro}>
                No todos los oficios la necesitan: limpieza, clases o cuidado
                siguen siendo por horas. Móntala solo donde tenga sentido ir
                a ver antes de cobrar, o donde cobres precios cerrados por
                servicio.
              </Text>
            </InfoCard>

            {trades.map((trade) => (
              <CartaTradeSection key={trade.slug} tradeSlug={trade.slug} label={trade.label} />
            ))}
          </>
        )}
      </Animated.ScrollView>
    </View>
  )
}
