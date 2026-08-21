/**
 * CartaTradeSection
 * La carta de UN oficio —tarifa de visita y servicios a precio fijo—,
 * dentro de "Mis oficios y tarifas".
 *
 * Vivía en su propia pantalla ("Mi carta") y se trasladó aquí: la tarifa por
 * hora, la de urgencia y la carta son la misma pregunta —cuánto cobras en
 * este oficio— contestada de tres maneras, y tenerlas en dos sitios distintos
 * obligaba a acordarse de cuál se tocaba en cada uno.
 *
 * Guarda aparte de la lista de oficios, con su propio botón: a diferencia de
 * los oficios —que se mandan enteros o no se manda nada—, la carta de un
 * oficio no tiene nada que ver con la de otro, y esperar a guardar los
 * quince campos de una tarifa por hora para poder guardar un solo servicio
 * sería un mal trato.
 */

import { useEffect, useState } from 'react'
import { View, Text, ActivityIndicator, Pressable } from 'react-native'
import { Button } from '@/components/atoms/Button'
import { ServiceItemsField, type ServiceItemRate } from '@/components/molecules/ServiceItemsField'
import { useMyCarta, useSetMyCarta } from '@/hooks/domain/useMyCarta'
import { theme } from '@/theme'
import { styles } from './CartaTradeSection.styles'

export interface CartaTradeSectionProps {
  tradeSlug: string
  label: string
  disabled?: boolean
}

export function CartaTradeSection({ tradeSlug, label, disabled = false }: CartaTradeSectionProps) {
  const { data, isPending, isError, refetch } = useMyCarta(tradeSlug)
  const { save, isSaving, formError } = useSetMyCarta(tradeSlug)

  const [services, setServices] = useState<ServiceItemRate[]>([])
  const [loaded, setLoaded] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  /**
   * Se copia lo guardado una sola vez. Si se copiara en cada respuesta, un
   * refresco de fondo borraría lo que se está escribiendo.
   */
  useEffect(() => {
    if (!data || loaded) return

    setServices(
      data.services.map((service) => ({
        id: service.id,
        name: service.name,
        price: String(service.price),
      })),
    )
    setLoaded(true)
  }, [data, loaded])

  const canSave =
    !disabled &&
    !isSaving &&
    services.every((service) => {
      const price = Number(service.price.trim().replace(',', '.'))
      return service.name.trim().length >= 2 && price > 0
    })

  const handleSave = async () => {
    const saved = await save({
      services: services.map((service) => ({
        name: service.name.trim(),
        price: Number(service.price.trim().replace(',', '.')),
      })),
    })

    setNotice(
      saved
        ? `Carta guardada: ${saved.services.length} ${
            saved.services.length === 1 ? 'servicio' : 'servicios'
          }, además de la visita.`
        : null,
    )
  }

  if (isPending) {
    return (
      <View style={styles.block} testID={`carta-section-${tradeSlug}`}>
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Carta</Text>
        </View>
        <ActivityIndicator color={theme.colors.accent} style={styles.loading} />
      </View>
    )
  }

  if (isError) {
    return (
      <View style={styles.block} testID={`carta-section-${tradeSlug}`}>
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Carta</Text>
        </View>
        <Text style={styles.error}>No hemos podido cargar la carta de este oficio.</Text>
        <Pressable onPress={() => void refetch()} testID={`carta-retry-${tradeSlug}`}>
          <Text style={styles.retry}>Reintentar</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <View style={styles.block} testID={`carta-section-${tradeSlug}`}>
      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle}>Carta</Text>
        <Text style={styles.sectionHint}>
          Opcional: servicios a precio fijo que se suman a tu tarifa de
          visita{data && data.visitFee !== null ? ` (${data.visitFee} €)` : ''}.
          El cliente marca lo que necesite y paga todo junto al contratar.
        </Text>
      </View>

      {formError && <Text style={styles.error}>{formError}</Text>}

      <ServiceItemsField
        value={services}
        onChange={setServices}
        disabled={disabled || isSaving}
        testID={`carta-services-${tradeSlug}`}
      />

      {notice && <Text style={styles.notice}>{notice}</Text>}

      <Button
        variant="secondary"
        loading={isSaving}
        disabled={!canSave}
        onPress={() => void handleSave()}
        style={styles.save}
        testID={`carta-save-${tradeSlug}`}
      >
        Guardar carta de {label.toLowerCase()}
      </Button>
    </View>
  )
}
