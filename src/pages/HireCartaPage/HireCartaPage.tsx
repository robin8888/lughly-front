/**
 * HireCartaPage
 * Contratar la carta de un profesional: la visita, más lo que se haya
 * marcado en su ficha, **retenido** en el momento.
 *
 * No reutiliza `RequestProPage`: ahí el precio es orientativo o no existe
 * —el cliente escribe título y descripción y espera respuesta—, aquí el
 * precio ya está pactado con la carta y lo único que hace falta es dónde y
 * cuándo. Pedir un título aquí sería inventarle un paso a algo que la carta
 * ya describe.
 */

import { useEffect, useState } from 'react'
import { View, Text, ActivityIndicator, Pressable } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { FormScrollView } from '@/components/templates/FormScrollView'
import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/atoms/Input'
import { AddressInput } from '@/components/molecules/AddressInput'
import type { ApiGeocodeMatch } from '@/api/geocode.api'
import { Money, formatAmount } from '@/components/atoms/Money'
import { DateTimeField } from '@/components/molecules/DateTimeField'
import { EmptyState } from '@/components/molecules/EmptyState'
import { FormField } from '@/components/molecules/FormField'
import { InfoCard } from '@/components/molecules/InfoCard'
import { useProProfile } from '@/hooks/domain/useProProfile'
import { usePaymentMethods } from '@/hooks/domain/usePaymentMethods'
import { useBookServices } from '@/hooks/domain/useBookServices'
import { useNavScrollHandler } from '@/hooks/ui/useCompactNav'
import { useTabBarClearance } from '@/hooks/ui/useTabBarClearance'
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
  const tabBarClearance = useTabBarClearance()

  const { data: pro, isPending, isError, refetch } = useProProfile(proId)
  const {
    data: methods,
    isPending: isPendingMethods,
    isError: isErrorMethods,
  } = usePaymentMethods()
  const { book, isBooking, formError } = useBookServices(proId)

  const [city, setCity] = useState('')
  const [address, setAddress] = useState<ApiGeocodeMatch | null>(null)
  /** Piso, puerta, escalera: lo que el geocodificador no sabe */
  const [detail, setDetail] = useState('')
  const [preferredDate, setPreferredDate] = useState<Date | null>(null)
  const [cityTouched, setCityTouched] = useState(false)

  /*
   * La ciudad se rellena una vez con la del profesional, como punto de
   * partida, y a partir de ahí manda la dirección que se elija: el cliente
   * puede estar contratando para otro sitio, y la del profesional solo era
   * una suposición razonable mientras no hubiera nada mejor.
   */
  useEffect(() => {
    if (pro && !cityTouched) setCity(pro.city)
  }, [pro, cityTouched])

  const trade = pro?.trades.find((entry) => entry.slug === tradeSlug)
  const services = (trade?.services ?? []).filter((service) =>
    serviceIds.includes(service.id),
  )
  /**
   * Un servicio de la carta ya lleva el desplazamiento metido en su precio
   * —no es "visita + arreglo", es un precio cerrado de puerta a puerta—, así
   * que la visita solo se cobra aparte cuando no se ha marcado ninguno.
   */
  const total =
    services.length > 0
      ? services.reduce((sum, service) => sum + service.price, 0)
      : (trade?.visitFee ?? 0)

  const method = methods?.[0] ?? null
  const canSubmit =
    trade?.visitFee != null &&
    city.trim().length >= 2 &&
    address !== null &&
    method !== null &&
    !isBooking

  const handleBook = async () => {
    if (!method) return

    const result = await book({
      tradeSlug,
      serviceIds,
      city: city.trim(),
      // La dirección normalizada más el piso: una línea que se lee entera
      addressLine: detail.trim()
        ? `${address!.label} (${detail.trim()})`
        : address!.label,
      ...(preferredDate && { preferredDate: toIsoDateTime(preferredDate) }),
      paymentMethodId: method.id,
    })

    if (result) onBooked(result.jobId)
  }

  const header = (
    <View style={styles.header}>
      {/* La cabecera ocupa también la franja del sistema: la hora, en claro */}
      <StatusBar style="light" />
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

      <FormScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={[styles.content, { paddingBottom: tabBarClearance }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <InfoCard testID="hire-carta-summary">
          <Text style={styles.proName}>
            {pro.employerName ?? pro.name} · {trade.label}
          </Text>

          {/*
            Solo cuando no hay ningún servicio marcado: si lo hay, su precio
            ya lleva el desplazamiento dentro y la visita no se cobra aparte.
          */}
          {services.length === 0 && (
            <View style={styles.line}>
              <Text style={styles.lineLabel}>Visita a domicilio</Text>
              <Money amount={trade.visitFee} style={styles.lineAmount} />
            </View>
          )}

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

          {/*
            "Se retiene" y no "se cobra", porque es literalmente lo que pasa:
            el importe se aparta en la tarjeta y solo se cobra cuando el
            profesional acepta. Contarlo bien no es solo honestidad — es lo
            que evita que alguien busque un cargo que no existe, y de paso se
            vende mejor que "te cobramos y ya te devolveremos".
          */}
          <Text style={styles.note}>
            Se retiene ahora en tu tarjeta y solo se te cobra cuando{' '}
            {pro.name.split(' ')[0]} lo acepte. Si no puede o no contesta a
            tiempo, se suelta y no se te cobra nada.
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
            <Text style={styles.paymentTitle}>Se retendrá en</Text>
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
          hint="Elígela de las sugerencias. Solo la verá quien acabe haciendo el trabajo."
        >
          <AddressInput
            value={address}
            onChange={(elegida) => {
              setAddress(elegida)
              if (elegida?.city && !cityTouched) setCity(elegida.city)
            }}
            placeholder="Ej. Calle Mayor 14"
            editable={!isBooking}
            detail={detail}
            onDetailChange={setDetail}
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
          Contratar por {formatAmount(total)} €
        </Button>
      </FormScrollView>
    </View>
  )
}
