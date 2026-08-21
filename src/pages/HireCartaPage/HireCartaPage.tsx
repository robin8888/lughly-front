/**
 * HireCartaPage
 * Contratar la carta de un profesional: la visita, más lo que se haya
 * marcado en su ficha, cobrado en el momento.
 *
 * No reutiliza `RequestProPage`: ahí el precio es orientativo o no existe
 * —el cliente escribe título y descripción y espera respuesta—, aquí el
 * precio ya está pactado con la carta y lo único que hace falta es dónde y
 * cuándo. Pedir un título aquí sería inventarle un paso a algo que la carta
 * ya describe.
 */

import { useEffect, useState } from 'react'
import { View, Text, ActivityIndicator, Pressable } from 'react-native'
import Animated from 'react-native-reanimated'
import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/atoms/Input'
import { Money, formatAmount } from '@/components/atoms/Money'
import { DateTimeField } from '@/components/molecules/DateTimeField'
import { EmptyState } from '@/components/molecules/EmptyState'
import { FormField } from '@/components/molecules/FormField'
import { InfoCard } from '@/components/molecules/InfoCard'
import { useProProfile } from '@/hooks/domain/useProProfile'
import { usePaymentMethods } from '@/hooks/domain/usePaymentMethods'
import { useBookServices } from '@/hooks/domain/useBookServices'
import { useNavScrollHandler } from '@/hooks/ui/useCompactNav'
import { formatLongDateTime, startOfToday, toIsoDateTime } from '@/utils/dates'
import { theme } from '@/theme'
import { styles } from './HireCartaPage.styles'

export interface HireCartaPageProps {
  proId: string | undefined
  tradeSlug: string
  serviceIds: string[]
  onBack: () => void
  onBooked: (jobId: string) => void
  onAddPaymentMethod: () => void
}

export function HireCartaPage({
  proId,
  tradeSlug,
  serviceIds,
  onBack,
  onBooked,
  onAddPaymentMethod,
}: HireCartaPageProps) {
  const onScroll = useNavScrollHandler()

  const { data: pro, isPending, isError, refetch } = useProProfile(proId)
  const {
    data: methods,
    isPending: isPendingMethods,
    isError: isErrorMethods,
  } = usePaymentMethods()
  const { book, isBooking, formError } = useBookServices(proId)

  const [city, setCity] = useState('')
  const [addressLine, setAddressLine] = useState('')
  const [preferredDate, setPreferredDate] = useState<Date | null>(null)
  const [cityTouched, setCityTouched] = useState(false)

  // La ciudad se rellena una vez con la suya, como punto de partida
  useEffect(() => {
    if (pro && !cityTouched) setCity(pro.city)
  }, [pro, cityTouched])

  const trade = pro?.trades.find((entry) => entry.slug === tradeSlug)
  const services = (trade?.services ?? []).filter((service) =>
    serviceIds.includes(service.id),
  )
  const total = (trade?.visitFee ?? 0) + services.reduce((sum, service) => sum + service.price, 0)

  const method = methods?.[0] ?? null
  const canSubmit =
    trade?.visitFee != null &&
    city.trim().length >= 2 &&
    addressLine.trim().length >= 5 &&
    method !== null &&
    !isBooking

  const handleBook = async () => {
    if (!method) return

    const result = await book({
      tradeSlug,
      serviceIds,
      city: city.trim(),
      addressLine: addressLine.trim(),
      ...(preferredDate && { preferredDate: toIsoDateTime(preferredDate) }),
      paymentMethodId: method.id,
    })

    if (result) onBooked(result.jobId)
  }

  const header = (
    <View style={styles.header}>
      <Pressable onPress={onBack} style={styles.back} accessibilityRole="button">
        <Text style={styles.backIcon}>←</Text>
      </Pressable>
      <Text style={styles.title}>Contratar</Text>
    </View>
  )

  if (isPending || isPendingMethods) {
    return (
      <View style={styles.screen} testID="hire-carta-page">
        {header}
        <View style={styles.state} testID="hire-carta-loading">
          <ActivityIndicator size="large" color={theme.colors.accent} />
        </View>
      </View>
    )
  }

  if (isError || !pro || !trade || trade.visitFee == null) {
    return (
      <View style={styles.screen} testID="hire-carta-page">
        {header}
        <EmptyState
          title="No hemos podido cargar esta carta"
          message="Puede que el profesional haya dejado de tener carta en este oficio. Vuelve a su ficha e inténtalo de nuevo."
          actions={[{ label: 'Volver', onPress: onBack, testID: 'hire-carta-back' }]}
          testID="hire-carta-error"
        />
      </View>
    )
  }

  return (
    <View style={styles.screen} testID="hire-carta-page">
      {header}

      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <InfoCard testID="hire-carta-summary">
          <Text style={styles.proName}>
            {pro.employerName ?? pro.name} · {trade.label}
          </Text>

          <View style={styles.line}>
            <Text style={styles.lineLabel}>Visita a domicilio</Text>
            <Money amount={trade.visitFee} style={styles.lineAmount} />
          </View>

          {services.map((service) => (
            <View key={service.id} style={styles.line}>
              <Text style={styles.lineLabel}>{service.name}</Text>
              <Money amount={service.price} style={styles.lineAmount} />
            </View>
          ))}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Money amount={total} style={styles.total} />
          </View>

          <Text style={styles.note}>
            Se cobra ahora, con tu tarjeta guardada. Si {pro.name.split(' ')[0]} no
            puede o no contesta a tiempo, se te devuelve entero.
          </Text>
        </InfoCard>

        {formError && <Text style={styles.formError}>{formError}</Text>}

        {isErrorMethods || !method ? (
          <InfoCard style={styles.paymentCard} testID="hire-carta-no-method">
            <Text style={styles.paymentTitle}>Necesitas una tarjeta guardada</Text>
            <Text style={styles.paymentBody}>
              Para contratar por la carta hace falta un método de pago guardado.
            </Text>
            <Button
              variant="secondary"
              onPress={onAddPaymentMethod}
              testID="hire-carta-add-method"
            >
              Añadir tarjeta
            </Button>
          </InfoCard>
        ) : (
          <InfoCard style={styles.paymentCard} testID="hire-carta-method">
            <Text style={styles.paymentTitle}>Se cobrará a</Text>
            <Text style={styles.paymentBody}>
              {method.brand} •••• {method.last4}
            </Text>
          </InfoCard>
        )}

        <FormField label="Ciudad">
          <Input
            value={city}
            onChangeText={(text) => {
              setCity(text)
              setCityTouched(true)
            }}
            placeholder="Ej. Madrid"
            autoCapitalize="words"
            editable={!isBooking}
            testID="hire-carta-city"
          />
        </FormField>

        <FormField
          label="Dirección"
          hint="Con el número. Solo la verá quien acabe haciendo el trabajo."
        >
          <Input
            value={addressLine}
            onChangeText={setAddressLine}
            placeholder="Ej. Calle Mayor 14, 3º B"
            editable={!isBooking}
            testID="hire-carta-address"
          />
        </FormField>

        <FormField
          label="¿Cuándo lo necesitas?"
          hint={
            preferredDate
              ? formatLongDateTime(preferredDate)
              : 'Opcional. Ayuda a saber si le encaja en la agenda.'
          }
        >
          <DateTimeField
            value={preferredDate}
            onChange={setPreferredDate}
            mode="datetime"
            placeholder="Elegir día y hora"
            minimumDate={startOfToday()}
            disabled={isBooking}
            testID="hire-carta-date"
          />
        </FormField>

        <Button
          fullWidth
          loading={isBooking}
          disabled={!canSubmit}
          onPress={() => void handleBook()}
          style={styles.submit}
          testID="hire-carta-submit"
        >
          Pagar y contratar por {formatAmount(total)} €
        </Button>
      </Animated.ScrollView>
    </View>
  )
}
