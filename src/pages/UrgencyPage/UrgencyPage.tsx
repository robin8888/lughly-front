/**
 * UrgencyPage
 * Publicar una urgencia, según MobileApp.dc.html (`isUrgencia`).
 *
 * Se diferencia de publicar un trabajo normal en tres cosas, y las tres
 * vienen del README §7:
 *
 * - **La dirección es obligatoria**, no opcional. Solo se avisa a quien la
 *   cubre con su radio, así que sin punto no hay a quién avisar.
 * - **Se dice antes de escribir si hay alguien**, con el indicador de
 *   cobertura en vivo. Rellenar un formulario entero con una fuga en casa
 *   para descubrir al final que no hay nadie sería cruel.
 * - **El recargo se avisa por adelantado**, como exige el README: entre un
 *   25% y un 50% según la hora y la disponibilidad.
 *
 * Este formulario es más corto a propósito. Quien tiene una urgencia no está
 * para elegir presupuesto máximo ni fecha preferida.
 */

import { useState } from 'react'
import { View, Text, ScrollView, Pressable } from 'react-native'
import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/atoms/Input'
import { FormField } from '@/components/molecules/FormField'
import { Picker } from '@/components/molecules/Picker'
import { PhotoPicker } from '@/components/molecules/PhotoPicker'
import { CoverageIndicator } from '@/components/organisms/CoverageIndicator'
import { useAddressCoverage } from '@/hooks/domain/useAddressCoverage'
import { usePublishJob } from '@/hooks/domain/usePublishJob'
import type { PickedImage } from '@/hooks/media/usePickImage'
import { TRADE_OPTIONS } from '@/utils/trades'
import { URGENCY_SURCHARGE } from '@/utils/surcharges'
import { styles } from './UrgencyPage.styles'

/** Título automático: en una urgencia nadie quiere pensar un titular. */
function titleFor(tradeLabel: string): string {
  return `Urgencia de ${tradeLabel.toLowerCase()}`
}

export interface UrgencyPageProps {
  onPublished: (jobId: string, photosFailed: number) => void
  onPublishNormal: () => void
  onBack: () => void
}

export function UrgencyPage({
  onPublished,
  onPublishNormal,
  onBack,
}: UrgencyPageProps) {
  const [trade, setTrade] = useState('')
  const [address, setAddress] = useState('')
  const [description, setDescription] = useState('')
  const [photos, setPhotos] = useState<PickedImage[]>([])

  const coverage = useAddressCoverage(address, trade)
  const { publish, isPublishing, isUploadingPhotos, fieldErrors, formError, reset } =
    usePublishJob()

  const isBusy = isPublishing || isUploadingPhotos
  const located = coverage.status === 'ready' ? coverage.match : null

  const tradeLabel =
    TRADE_OPTIONS.find((option) => option.value === trade)?.label ?? ''

  /**
   * Sin coordenadas no se puede enviar: el servidor las exige para una
   * urgencia. Se espera a que la dirección esté situada en el mapa.
   */
  const canPublish =
    trade !== '' && description.trim().length >= 20 && located !== null && !isBusy

  const handlePublish = async () => {
    if (!located) return

    reset()

    const outcome = await publish(
      {
        type: 'URGENT',
        tradeSlug: trade,
        title: titleFor(tradeLabel),
        description: description.trim(),
        city: located.city ?? 'Sin ciudad',
        addressLine: located.label,
        latitude: located.lat,
        longitude: located.lng,
      },
      photos,
    )

    if (!outcome) return

    onPublished(outcome.job.id, outcome.photosFailed)
  }

  return (
    <View style={styles.screen} testID="urgency-page">
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.back} accessibilityRole="button">
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <Text style={styles.title}>Urgencia</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.intro}>
          Avisamos ahora mismo a los profesionales disponibles que lleguen a tu
          dirección. El primero que acepte va para allá.
        </Text>

        {formError && <Text style={styles.formError}>{formError}</Text>}

        <FormField label="Oficio que necesitas" error={fieldErrors.tradeSlug}>
          <Picker
            options={TRADE_OPTIONS}
            value={trade}
            onChange={setTrade}
            placeholder="Elige el oficio"
            title="¿Qué necesitas ahora?"
            testID="urgency-trade"
          />
        </FormField>

        <FormField
          label="Dirección"
          hint="Calle, número y ciudad. La verán solo los profesionales a los que avisemos."
          error={fieldErrors.addressLine}
        >
          <Input
            value={address}
            onChangeText={setAddress}
            placeholder="Calle, número, piso"
            editable={!isBusy}
            testID="urgency-address"
          />
        </FormField>

        <CoverageIndicator state={coverage} testID="urgency-coverage" />

        {coverage.status === 'ready' && coverage.coverage.available === 0 && (
          <Button
            variant="secondary"
            fullWidth
            onPress={onPublishNormal}
            style={styles.alternative}
            testID="urgency-publish-normal"
          >
            Publicarlo como trabajo normal
          </Button>
        )}

        <FormField
          label="Qué ocurre"
          hint="Mínimo 20 caracteres."
          error={fieldErrors.description}
        >
          <Input
            value={description}
            onChangeText={setDescription}
            placeholder="Ej. Se ha quedado la llave dentro y no puedo entrar."
            multiline
            numberOfLines={3}
            style={styles.textarea}
            editable={!isBusy}
            testID="urgency-description"
          />
        </FormField>

        <FormField
          label="Fotos (opcional pero ayuda)"
          hint="Se borra su ubicación antes de enviarlas."
        >
          <PhotoPicker
            value={photos}
            onChange={setPhotos}
            disabled={isBusy}
            testID="urgency-photos"
          />
        </FormField>

        <View style={styles.surcharge}>
          <Text style={styles.surchargeTitle}>Recargo por urgencia</Text>
          <Text style={styles.surchargeBody}>
            Entre un {URGENCY_SURCHARGE.min}% y un {URGENCY_SURCHARGE.max}% sobre
            la tarifa, según la hora y la disponibilidad. Lo concreta el
            profesional al aceptar, y verás el importe exacto antes de
            confirmar nada.
          </Text>
        </View>

        <Button
          fullWidth
          loading={isBusy}
          disabled={!canPublish}
          onPress={() => void handlePublish()}
          style={styles.submit}
          testID="urgency-submit"
        >
          Avisar a los disponibles
        </Button>

        {!located && address.trim().length > 0 && (
          <Text style={styles.hint}>
            Necesitamos situar la dirección en el mapa antes de poder avisar a
            nadie.
          </Text>
        )}
      </ScrollView>
    </View>
  )
}
