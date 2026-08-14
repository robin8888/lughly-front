/**
 * PublishPage
 * Publicar un trabajo, según MobileApp.dc.html (`isPublicar`).
 *
 * Dos vías desde la misma pantalla: subasta inversa —se reciben pujas y
 * adjudica el cliente— o reserva instantánea a tarifa fija. Cambia el texto
 * de ayuda y si hay o no fecha de cierre; el resto del formulario es igual.
 *
 * El borrador se guarda en cada tecla (`useDraftJobStore`) y sobrevive a
 * cerrar la app. Las fotos no: son ficheros temporales que el sistema borra,
 * y guardar su ruta solo serviría para reaparecer rota.
 *
 * Del diseño queda fuera **la redacción asistida por IA**: necesita un
 * proveedor, una clave y un presupuesto, que son decisiones de producto y no
 * de esta pantalla. El resto del formulario está completo.
 */

import { useState } from 'react'
import { View, Text, ScrollView, Pressable, Alert } from 'react-native'
import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/atoms/Input'
import { FormField } from '@/components/molecules/FormField'
import { Picker } from '@/components/molecules/Picker'
import { PhotoPicker } from '@/components/molecules/PhotoPicker'
import { usePublishJob } from '@/hooks/domain/usePublishJob'
import type { PickedImage } from '@/hooks/media/usePickImage'
import { useDraftJobStore, useJobDraft, type JobDraftType } from '@/stores/useDraftJobStore'
import { TRADE_OPTIONS } from '@/utils/trades'
import { surchargesSummary } from '@/utils/surcharges'
import { styles } from './PublishPage.styles'

const MODE_HINT: Record<JobDraftType, string> = {
  AUCTION:
    'Gratis. Recibes pujas de varios profesionales y eliges tú, comparando precio, plazo y reputación.',
  INSTANT:
    'Contratas a tarifa fija, sin esperar pujas. El profesional tiene 30 minutos para confirmar.',
}

/** Días por defecto que dura una subasta si el usuario no toca la fecha. */
const DEFAULT_AUCTION_DAYS = 7

function isoDateIn(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

export interface PublishPageProps {
  onPublished: (jobId: string) => void
  onUrgent: () => void
  onBack: () => void
}

export function PublishPage({ onPublished, onUrgent, onBack }: PublishPageProps) {
  const draft = useJobDraft()
  const update = useDraftJobStore((s) => s.update)
  const { publish, isPublishing, fieldErrors, formError, reset } = usePublishJob()

  const [photos, setPhotos] = useState<PickedImage[]>([])

  const isAuction = draft.type === 'AUCTION'

  const handlePublish = async () => {
    reset()

    const budget = Number(draft.maxBudget.replace(',', '.'))

    const job = await publish({
      type: draft.type,
      tradeSlug: draft.tradeSlug,
      title: draft.title.trim(),
      description: draft.description.trim(),
      city: draft.city.trim(),
      ...(draft.maxBudget !== '' && Number.isFinite(budget) && { maxBudget: budget }),
      ...(draft.preferredDate !== '' && { preferredDate: draft.preferredDate }),
      ...(isAuction && {
        // Si no eligió fecha, se cierra en una semana: es lo que espera
        // quien publica y evita subastas abiertas para siempre.
        biddingEndsAt: new Date(
          draft.biddingEndsAt || isoDateIn(DEFAULT_AUCTION_DAYS),
        ).toISOString(),
      }),
    })

    if (!job) return

    if (photos.length > 0) {
      // Las fotos se suben aparte, contra el trabajo ya creado: hasta que no
      // existe no hay id al que asociarlas. Llega en el siguiente paso.
      Alert.alert(
        'Trabajo publicado',
        'Las fotos todavía no se envían: esa parte llega en el siguiente paso del roadmap.',
      )
    }

    onPublished(job.id)
  }

  const canPublish =
    draft.tradeSlug !== '' &&
    draft.title.trim().length >= 8 &&
    draft.description.trim().length >= 20 &&
    draft.city.trim().length >= 2

  return (
    <View style={styles.screen} testID="publish-page">
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.back} accessibilityRole="button">
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <View>
          <Text style={styles.kicker}>Nuevo encargo</Text>
          <Text style={styles.title}>Publicar un trabajo</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Pressable onPress={onUrgent} style={styles.urgent} testID="publish-go-urgent">
          <View style={styles.urgentText}>
            <Text style={styles.urgentTitle}>¿Es una emergencia?</Text>
            <Text style={styles.urgentBody}>
              Avisamos a todos los disponibles de tu zona ahora mismo.
            </Text>
          </View>
          <Text style={styles.urgentArrow}>→</Text>
        </Pressable>

        <View style={styles.modes}>
          {(['AUCTION', 'INSTANT'] as const).map((mode) => (
            <Pressable
              key={mode}
              onPress={() => update({ type: mode })}
              style={[styles.mode, draft.type === mode && styles.modeActive]}
              accessibilityRole="button"
              accessibilityState={{ selected: draft.type === mode }}
              testID={`publish-mode-${mode}`}
            >
              <Text
                style={[styles.modeText, draft.type === mode && styles.modeTextActive]}
              >
                {mode === 'AUCTION' ? 'Subasta inversa' : 'Reserva instantánea'}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.modeHint}>{MODE_HINT[draft.type]}</Text>

        {formError && <Text style={styles.formError}>{formError}</Text>}

        <FormField label="Oficio o actividad" error={fieldErrors.tradeSlug}>
          <Picker
            options={TRADE_OPTIONS}
            value={draft.tradeSlug}
            onChange={(value) => update({ tradeSlug: value })}
            placeholder="Elige el oficio"
            title="¿Qué necesitas?"
            testID="publish-trade"
          />
        </FormField>

        <FormField
          label="Título del trabajo"
          hint="Mínimo 8 caracteres."
          error={fieldErrors.title}
        >
          <Input
            value={draft.title}
            onChangeText={(value) => update({ title: value })}
            placeholder="Ej. Reparar fuga bajo el fregadero"
            editable={!isPublishing}
            testID="publish-title"
          />
        </FormField>

        <FormField
          label="Descripción"
          hint="Cuanto más detalle, mejores pujas recibirás. Mínimo 20 caracteres."
          error={fieldErrors.description}
        >
          <Input
            value={draft.description}
            onChangeText={(value) => update({ description: value })}
            placeholder="Describe qué necesitas, con el mayor detalle posible…"
            multiline
            numberOfLines={4}
            style={styles.textarea}
            editable={!isPublishing}
            testID="publish-description"
          />
        </FormField>

        <FormField label="Ciudad" error={fieldErrors.city}>
          <Input
            value={draft.city}
            onChangeText={(value) => update({ city: value })}
            placeholder="Ej. Madrid"
            editable={!isPublishing}
            testID="publish-city"
          />
        </FormField>

        <FormField
          label="Presupuesto máximo (€)"
          hint="Orientativo. Ayuda a que no te lleguen pujas fuera de tu alcance."
          error={fieldErrors.maxBudget}
        >
          <Input
            value={draft.maxBudget}
            onChangeText={(value) => update({ maxBudget: value.replace(/[^0-9.,]/g, '') })}
            placeholder="Ej. 300"
            keyboardType="numeric"
            editable={!isPublishing}
            testID="publish-budget"
          />
        </FormField>

        <FormField
          label={isAuction ? 'Cuándo lo necesitas' : 'Día del servicio'}
          hint="Formato AAAA-MM-DD."
          error={fieldErrors.preferredDate}
        >
          <Input
            value={draft.preferredDate}
            onChangeText={(value) => update({ preferredDate: value })}
            placeholder={isoDateIn(3)}
            editable={!isPublishing}
            testID="publish-date"
          />
        </FormField>

        {isAuction && (
          <FormField
            label="La subasta cierra el"
            hint={`Si lo dejas vacío, se cierra en ${DEFAULT_AUCTION_DAYS} días.`}
            error={fieldErrors.biddingEndsAt}
          >
            <Input
              value={draft.biddingEndsAt}
              onChangeText={(value) => update({ biddingEndsAt: value })}
              placeholder={isoDateIn(DEFAULT_AUCTION_DAYS)}
              editable={!isPublishing}
              testID="publish-bidding-ends"
            />
          </FormField>
        )}

        <FormField
          label="Fotos del trabajo (opcional)"
          hint="Sube fotos del problema para que el profesional pueda valorarlo mejor. Se borra su ubicación antes de enviarlas."
        >
          <PhotoPicker
            value={photos}
            onChange={setPhotos}
            disabled={isPublishing}
            testID="publish-photos"
          />
        </FormField>

        <Text style={styles.surcharges}>
          Recargos que pueden aplicarse: {surchargesSummary()}. No se suman
          entre sí; verás el importe exacto antes de confirmar.
        </Text>

        <Button
          fullWidth
          loading={isPublishing}
          disabled={!canPublish}
          onPress={() => void handlePublish()}
          style={styles.submit}
          testID="publish-submit"
        >
          {isAuction ? 'Publicar y recibir pujas' : 'Publicar reserva'}
        </Button>

        <Text style={styles.draftNote}>
          Lo que escribes se guarda solo. Puedes cerrar la app y seguir
          después; las fotos habrá que volver a elegirlas.
        </Text>
      </ScrollView>
    </View>
  )
}
