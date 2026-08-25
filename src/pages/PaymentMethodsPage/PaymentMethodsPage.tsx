/**
 * PaymentMethodsPage
 * "Métodos de pago" del cliente.
 *
 * COMO_SE_CONTRATA.md v3 §8: se guarda el método de pago una vez (SetupIntent)
 * y con él se cobra más tarde sin volver a pedirlo — incluida una urgencia a
 * las 3 de la mañana, sin pasar por la pasarela con nadie de camino.
 *
 * La tarjeta se guarda con el PaymentSheet de Stripe: esta pantalla nunca ve
 * un número de tarjeta, solo la lista de lo ya guardado.
 */

import { useState } from 'react'
import { Text, View, Pressable, ActivityIndicator } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import Animated from 'react-native-reanimated'
import { useNavScrollHandler } from '@/hooks/ui/useCompactNav'
import { useTabBarClearance } from '@/hooks/ui/useTabBarClearance'
import { Button } from '@/components/atoms/Button'
import { InfoCard } from '@/components/molecules/InfoCard'
import { EmptyState } from '@/components/molecules/EmptyState'
import { usePaymentMethods, useSaveCard } from '@/hooks/domain/usePaymentMethods'
import { theme } from '@/theme'
import { styles } from './PaymentMethodsPage.styles'

const BRAND_LABELS: Record<string, string> = {
  visa: 'Visa',
  mastercard: 'Mastercard',
  amex: 'American Express',
  discover: 'Discover',
  diners: 'Diners Club',
  jcb: 'JCB',
  unionpay: 'UnionPay',
}

function brandLabel(brand: string): string {
  return BRAND_LABELS[brand] ?? brand.charAt(0).toUpperCase() + brand.slice(1)
}

export interface PaymentMethodsPageProps {
  onBack: () => void
}

export function PaymentMethodsPage({ onBack }: PaymentMethodsPageProps) {
  const onScroll = useNavScrollHandler()
  const tabBarClearance = useTabBarClearance()

  const { data, isPending, isError, refetch } = usePaymentMethods()
  const { save, isSaving } = useSaveCard()
  const methods = data ?? []

  const [notice, setNotice] = useState<string | null>(null)

  const handleAddCard = async () => {
    const { error } = await save()
    setNotice(error)
  }

  const header = (
    <View style={styles.header}>
      {/* La cabecera ocupa también la franja del sistema: la hora, en claro */}
      <StatusBar style="light" />
      <Pressable onPress={onBack} style={styles.back} accessibilityRole="button">
        <Text style={styles.backIcon}>←</Text>
      </Pressable>
      <Text style={styles.title}>Métodos de pago</Text>
    </View>
  )

  if (isPending) {
    return (
      <View style={styles.screen} testID="payment-methods-page">
        {header}
        <View style={styles.state} testID="payment-methods-loading">
          <ActivityIndicator size="large" color={theme.colors.accent} />
        </View>
      </View>
    )
  }

  if (isError) {
    return (
      <View style={styles.screen} testID="payment-methods-page">
        {header}
        <EmptyState
          title="No hemos podido cargar tus tarjetas"
          message="Revisa tu conexión e inténtalo de nuevo."
          actions={[
            { label: 'Reintentar', onPress: () => void refetch(), testID: 'payment-methods-retry' },
          ]}
          testID="payment-methods-error"
        />
      </View>
    )
  }

  return (
    <View style={styles.screen} testID="payment-methods-page">
      {header}

      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={[styles.content, { paddingBottom: tabBarClearance }]}
        showsVerticalScrollIndicator={false}
      >
        <InfoCard variant="accent">
          <Text style={styles.intro}>
            Guarda una tarjeta para pagar sin volver a escribirla: al reservar,
            y para poder contratar una urgencia sin nadie de camino esperando
            a que termines de pagar.
          </Text>
        </InfoCard>

        {notice && (
          <Text style={styles.notice} testID="payment-methods-notice">
            {notice}
          </Text>
        )}

        {methods.length === 0 ? (
          <EmptyState
            title="Todavía no has guardado ninguna tarjeta"
            message="Añade una para poder contratar y pagar desde la app."
            testID="payment-methods-empty"
          />
        ) : (
          <View style={styles.list}>
            {methods.map((method) => (
              <InfoCard key={method.id} testID={`payment-method-${method.id}`}>
                <View style={styles.methodRow}>
                  <View>
                    <Text style={styles.methodBrand}>
                      {brandLabel(method.brand)} •••• {method.last4}
                    </Text>
                    <Text style={styles.methodExpiry}>
                      Caduca {String(method.expMonth).padStart(2, '0')}/{method.expYear}
                    </Text>
                  </View>
                </View>
              </InfoCard>
            ))}
          </View>
        )}

        <Button
          fullWidth
          loading={isSaving}
          onPress={() => void handleAddCard()}
          style={styles.add}
          testID="payment-methods-add"
        >
          Añadir tarjeta
        </Button>
      </Animated.ScrollView>
    </View>
  )
}
