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
import { View, Text, Pressable } from 'react-native'
import Animated from 'react-native-reanimated'
import { useNavScrollHandler } from '@/hooks/ui/useCompactNav'
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
import { DateTimeField } from '@/components/molecules/DateTimeField'
import {
  addDays,
  atTime,
  formatLongDateTime,
  parseIsoDateTime,
  startOfToday,
  toIsoDateTime,
} from '@/utils/dates'
import { styles } from './PublishPage.styles'

const MODE_HINT: Record<JobDraftType, string> = {
  AUCTION:
    'Gratis. Recibes pujas de varios profesionales y eliges tú, comparando precio, plazo y reputación.',
  INSTANT:
    'Contratas a tarifa fija, sin esperar pujas. El profesional tiene 30 minutos para confirmar.',
}

/** Días por defecto que dura una subasta si el usuario no toca la fecha. */
const DEFAULT_AUCTION_DAYS = 7

/**
 * Hora a la que se cierra una subasta si solo se elige el día.
 *
 * Las ocho de la tarde y no la medianoche: quien publica espera comparar las
 * pujas esa tarde, no levantarse al día siguiente con la subasta cerrada de
 * madrugada.
 */
const DEFAULT_CLOSING_HOUR = 20

/** Cierre por defecto: dentro de una semana, a la hora de siempre. */
function defaultClosing(): Date {
  return atTime(addDays(new Date(), DEFAULT_AUCTION_DAYS), DEFAULT_CLOSING_HOUR)
}

export interface PublishPageProps {
  /** `photosFailed` es 0 salvo que alguna foto no llegara; el trabajo se publica igual */
  onPublished: (jobId: string, photosFailed: number) => void
  onUrgent: () => void
  onBack: () => void
}

export function PublishPage({ onPublished, onUrgent, onBack }: PublishPageProps) {
  /**
   * La barra inferior se encoge al bajar y vuelve al subir. Va en todas
   * las pantallas con scroll, no solo en el inicio: si en una se moviera
   * y en la siguiente no, parecería que la barra falla.
   */
  const onScroll = useNavScrollHandler()

  const draft = useJobDraft()
  const update = useDraftJobStore((s) => s.update)
  const { publish, isPublishing, isUploadingPhotos, fieldErrors, formError, reset } =
    usePublishJob()

  const [photos, setPhotos] = useState<PickedImage[]>([])
  const isBusy = isPublishing || isUploadingPhotos

  const isAuction = draft.type === 'AUCTION'

  /**
   * El borrador guarda texto —sobrevive a cerrar la app— y el selector
   * trabaja con fechas. Se convierte aquí, en el único sitio donde se sabe
   * que una es un día suelto y la otra un instante.
   */
  const preferredDate = parseIsoDateTime(draft.preferredDate)
  const biddingEndsAt = draft.biddingEndsAt ? new Date(draft.biddingEndsAt) : null

  const handlePublish = async () => {
    reset()

    const budget = Number(draft.maxBudget.replace(',', '.'))

    const outcome = await publish(
      {
        type: draft.type,
        tradeSlug: draft.tradeSlug,
        title: draft.title.trim(),
        description: draft.description.trim(),
        city: draft.city.trim(),
        addressLine: draft.addressLine.trim(),
        ...(draft.maxBudget !== '' && Number.isFinite(budget) && { maxBudget: budget }),
        ...(draft.preferredDate !== '' && { preferredDate: draft.preferredDate }),
        ...(isAuction && {
          // Si no eligió cierre, se cierra en una semana: es lo que espera
          // quien publica y evita subastas abiertas para siempre.
          biddingEndsAt: draft.biddingEndsAt || defaultClosing().toISOString(),
        }),
      },
      photos,
    )

    if (!outcome) return

    onPublished(outcome.job.id, outcome.photosFailed)
  }

  const canPublish =
    draft.tradeSlug !== '' &&
    draft.title.trim().length >= 8 &&
    draft.description.trim().length >= 20 &&
    draft.city.trim().length >= 2 &&
    draft.addressLine.trim().length >= 5

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

      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
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
            editable={!isBusy}
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
            editable={!isBusy}
            testID="publish-description"
          />
        </FormField>

        <FormField label="Ciudad" error={fieldErrors.city}>
          <Input
            value={draft.city}
            onChangeText={(value) => update({ city: value })}
            placeholder="Ej. Madrid"
            editable={!isBusy}
            testID="publish-city"
          />
        </FormField>

        {/**
         * La dirección se pide al publicar y no se enseña a quien no esté
         * adjudicado. Antes era opcional y no había ningún paso posterior
         * donde darla, así que quien ganaba la subasta se quedaba con el
         * trabajo y sin saber dónde ir.
         */}
        <FormField
          label="Dirección"
          hint="Con el número. Solo la verá quien acabe haciendo el trabajo, no quien puje."
          error={fieldErrors.addressLine}
        >
          <Input
            value={draft.addressLine}
            onChangeText={(value) => update({ addressLine: value })}
            placeholder="Ej. Calle Mayor 14, 3º B"
            editable={!isBusy}
            error={Boolean(fieldErrors.addressLine)}
            testID="publish-address"
          />
        </FormField>

        <FormField
          label="Presupuesto máximo"
          hint="Orientativo. Ayuda a que no te lleguen pujas fuera de tu alcance."
          error={fieldErrors.maxBudget}
        >
          <Input
            value={draft.maxBudget}
            onChangeText={(value) => update({ maxBudget: value.replace(/[^0-9.,]/g, '') })}
            placeholder="300"
            suffix="€"
            keyboardType="numeric"
            editable={!isBusy}
            testID="publish-budget"
          />
        </FormField>

        {/**
         * Fecha y hora con el selector del sistema, nunca escritas a mano.
         * Antes se pedían en texto con formato AAAA-MM-DD: un español teclea
         * el día primero, y "03/04" acaba siendo el 3 de abril para quien lo
         * escribe y el 4 de marzo para quien lo lee.
         */}
        {/*
          Con hora, no solo el día. Sin ella, el profesional recibía "el jueves"
          y tenía que llamar para acordarla, y la agenda del trabajador no podía
          enseñar más que un día suelto.

          Se manda como instante en UTC (`toIsoDateTime`), que es lo que hace
          que el cambio de hora no sea un problema: en el día de 25 horas hay
          dos "02:30" locales, pero un solo instante para cada uno.
        */}
        <FormField
          label={isAuction ? 'Cuándo lo necesitas' : 'Día y hora del servicio'}
          hint={
            preferredDate
              ? formatLongDateTime(preferredDate)
              : 'Opcional. Ayuda al profesional a saber si le encaja.'
          }
          error={fieldErrors.preferredDate}
        >
          <DateTimeField
            value={preferredDate}
            onChange={(picked) => update({ preferredDate: toIsoDateTime(picked) })}
            mode="datetime"
            placeholder="Elegir día y hora"
            // Nadie necesita un fontanero el martes pasado
            minimumDate={startOfToday()}
            disabled={isBusy}
            error={Boolean(fieldErrors.preferredDate)}
            testID="publish-date"
          />
        </FormField>

        {isAuction && (
          <FormField
            label="La subasta cierra el"
            hint={
              biddingEndsAt
                ? `Se cierra el ${formatLongDateTime(biddingEndsAt)}.`
                : `Si no eliges, se cierra en ${DEFAULT_AUCTION_DAYS} días a las ${DEFAULT_CLOSING_HOUR}:00.`
            }
            error={fieldErrors.biddingEndsAt}
          >
            <DateTimeField
              value={biddingEndsAt}
              onChange={(picked) => update({ biddingEndsAt: picked.toISOString() })}
              // Con hora: una subasta se cierra a una hora concreta, y
              // dejarlo en la medianoche sorprende a quien esperaba
              // compararlas por la tarde.
              mode="datetime"
              placeholder="Elegir cierre"
              minimumDate={new Date()}
              disabled={isBusy}
              error={Boolean(fieldErrors.biddingEndsAt)}
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
            disabled={isBusy}
            testID="publish-photos"
          />
        </FormField>

        <Text style={styles.surcharges}>
          Recargos que pueden aplicarse: {surchargesSummary()}. No se suman
          entre sí; verás el importe exacto antes de confirmar.
        </Text>

        <Button
          fullWidth
          loading={isBusy}
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
      </Animated.ScrollView>
    </View>
  )
}
