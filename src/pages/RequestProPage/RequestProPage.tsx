/**
 * RequestProPage
 * Encargar un trabajo a un profesional concreto del directorio.
 *
 * Es la otra forma de contratar: en vez de publicar al aire y esperar pujas,
 * el cliente ya ha elegido a alguien mirando su ficha. De ahí que el
 * formulario sea más corto —no hay plazo de subasta ni presupuesto
 * obligatorio— y que lo importante sea contar bien qué hace falta.
 *
 * Se avisa de quién va a responder. Si esa persona trabaja para una empresa,
 * el encargo lo recibe ella; decirlo antes evita que la respuesta a nombre de
 * otro parezca un cambiazo cuando llegue.
 */

import { useState } from 'react'
import { View, Text, ActivityIndicator, Pressable, Alert } from 'react-native'
import Animated from 'react-native-reanimated'
import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/atoms/Input'
import { EmptyState } from '@/components/molecules/EmptyState'
import { FormField } from '@/components/molecules/FormField'
import { InfoCard } from '@/components/molecules/InfoCard'
import { Picker } from '@/components/molecules/Picker'
import { DateTimeField } from '@/components/molecules/DateTimeField'
import { PhotoPicker } from '@/components/molecules/PhotoPicker'
import { useProProfile } from '@/hooks/domain/useProProfile'
import { useRequestPro } from '@/hooks/domain/useRequestPro'
import { useNavScrollHandler } from '@/hooks/ui/useCompactNav'
import type { PickedImage } from '@/hooks/media/usePickImage'
import { useDraftJobStore } from '@/stores/useDraftJobStore'
import {
  formatLongDateTime,
  parseIsoDateTime,
  startOfToday,
  toIsoDateTime,
} from '@/utils/dates'
import { theme } from '@/theme'
import { styles } from './RequestProPage.styles'

export type RequestType = 'QUOTE' | 'INSTANT'

export interface RequestProPageProps {
  proId: string | undefined
  type: RequestType
  /** El oficio con el que venía filtrando el directorio, si venía con uno */
  initialTrade?: string
  onBack: () => void
  onSent: () => void
}

export function RequestProPage({
  proId,
  type,
  initialTrade,
  onBack,
  onSent,
}: RequestProPageProps) {
  const onScroll = useNavScrollHandler()
  const { data: pro, isPending, isError } = useProProfile(proId)
  const { request, isRequesting, fieldErrors, formError, reset } = useRequestPro(proId)

  /**
   * Lo que ya escribió en Publicar, si viene de ahí.
   *
   * Hay dos formas de llegar a esta pantalla y solo una trae trabajo hecho:
   *
   * - Desde **Publicar**, eligiendo reserva instantánea y luego profesional.
   *   Ahí el formulario ya está relleno, y volver a pedirlo todo es pedirle a
   *   alguien que escriba dos veces la misma avería.
   * - Desde el **directorio**, mirando fichas y reservando a quien le gusta.
   *   Ahí no ha escrito nada todavía y el formulario sale en blanco.
   *
   * Se distinguen por el borrador: si tiene contenido y es de tipo reserva, es
   * que viene del primer camino. Y se le dice, con un botón para vaciarlo, por
   * si el borrador era de otra cosa.
   */
  const draft = useDraftJobStore((state) => state.draft)
  const hasDraft = useDraftJobStore((state) => state.hasContent)()
  const clearDraft = useDraftJobStore((state) => state.clear)
  const [fromDraft, setFromDraft] = useState(
    hasDraft && draft.type === 'INSTANT',
  )

  const [trade, setTrade] = useState<string | null>(
    initialTrade ?? (fromDraft && draft.tradeSlug !== '' ? draft.tradeSlug : null),
  )
  const [title, setTitle] = useState(fromDraft ? draft.title : '')
  const [description, setDescription] = useState(
    fromDraft ? draft.description : '',
  )
  const [city, setCity] = useState(fromDraft ? draft.city : '')
  const [addressLine, setAddressLine] = useState(
    fromDraft ? draft.addressLine : '',
  )
  const [preferredDate, setPreferredDate] = useState<Date | null>(
    fromDraft && draft.preferredDate !== ''
      ? parseIsoDateTime(draft.preferredDate)
      : null,
  )
  const [maxBudget, setMaxBudget] = useState(fromDraft ? draft.maxBudget : '')
  /** Las fotos no se guardan en el borrador: se eligen aquí */
  const [photos, setPhotos] = useState<PickedImage[]>([])

  const startOver = () => {
    setFromDraft(false)
    setTitle('')
    setDescription('')
    setCity('')
    setAddressLine('')
    setPreferredDate(null)
    setMaxBudget('')
    clearDraft()
  }

  const isInstant = type === 'INSTANT'

  /**
   * Quien ejerce varios oficios cobra distinto por cada uno, así que hay que
   * decir para cuál se le contrata. Con uno solo no se pregunta: sería un
   * desplegable de una única opción.
   */
  const tradeOptions =
    pro?.trades.map((entry) => ({
      value: entry.slug,
      label: `${entry.label} · ${entry.hourlyRate} €/h`,
    })) ?? []

  const chosenTrade = trade ?? pro?.trades[0]?.slug ?? null
  const chosenRate = pro?.trades.find((entry) => entry.slug === chosenTrade)?.hourlyRate

  const canSend =
    chosenTrade !== null &&
    title.trim().length >= 8 &&
    description.trim().length >= 20 &&
    city.trim().length >= 2 &&
    addressLine.trim().length >= 5 &&
    !isRequesting

  const handleSend = async () => {
    reset()
    if (!chosenTrade) return

    const budget = Number(maxBudget.replace(',', '.'))

    const sent = await request({
      type,
      tradeSlug: chosenTrade,
      title: title.trim(),
      description: description.trim(),
      city: city.trim(),
      addressLine: addressLine.trim(),
      ...(preferredDate && { preferredDate: toIsoDateTime(preferredDate) }),
      ...(maxBudget !== '' &&
        Number.isFinite(budget) &&
        budget > 0 && { maxBudget: budget }),
    }, photos)

    if (!sent) return

    // El encargo ya existe: si el borrador venía de Publicar, ya no hace falta
    if (fromDraft) clearDraft()

    const { request: encargo, photosFailed } = sent

    const quien =
      encargo.respondedByName === encargo.requestedProName
        ? `${encargo.requestedProName} tiene 24 horas para responderte. Lo verás en Mis trabajos.`
        : `Responde ${encargo.respondedByName}, la empresa de ${encargo.requestedProName}, en un plazo de 24 horas. Si te proponen mandar a otra persona, decides tú.`

    Alert.alert(
      'Encargo enviado',
      photosFailed > 0
        ? `${quien} ${photosFailed === 1 ? 'Una foto no se pudo enviar' : `${photosFailed} fotos no se pudieron enviar`}.`
        : quien,
    )
    onSent()
  }

  const header = (
    <View style={styles.header}>
      <Pressable onPress={onBack} style={styles.back} accessibilityRole="button">
        <Text style={styles.backIcon}>←</Text>
      </Pressable>
      <Text style={styles.title}>
        {isInstant ? 'Reservar ahora' : 'Pedir presupuesto'}
      </Text>
    </View>
  )

  if (isPending) {
    return (
      <View style={styles.screen} testID="request-pro-page">
        {header}
        <View style={styles.state} testID="request-pro-loading">
          <ActivityIndicator size="large" color={theme.colors.accent} />
        </View>
      </View>
    )
  }

  if (isError || !pro) {
    return (
      <View style={styles.screen} testID="request-pro-page">
        {header}
        <EmptyState
          title="No hemos podido cargar el perfil"
          message="Revisa tu conexión e inténtalo de nuevo."
          actions={[{ label: 'Volver', onPress: onBack, testID: 'request-pro-back' }]}
          testID="request-pro-error"
        />
      </View>
    )
  }

  return (
    <View style={styles.screen} testID="request-pro-page">
      {header}

      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <InfoCard style={styles.who}>
          <Text style={styles.whoName}>{pro.employerName ?? pro.name}</Text>
          {pro.employerName && (
            <Text style={styles.whoWorker}>Trabajo de {pro.name}</Text>
          )}

          {/**
           * Quién responde. Si trabaja para una empresa es ella, y decirlo
           * ahora evita que la respuesta a nombre de otro parezca un
           * cambiazo cuando llegue.
           */}
          <Text style={styles.whoNote}>
            {pro.employerName
              ? `Responde ${pro.employerName}, que es quien contrata y factura. Puede proponerte a otra persona del equipo, y entonces decides tú.`
              : `${pro.name} tiene 24 horas para responderte.`}
          </Text>
        </InfoCard>

        {/*
          Viene de Publicar con todo escrito, así que aquí solo hay que
          repasarlo. Se dice, porque encontrarse un formulario relleno sin
          saber de dónde sale desconcierta; y se ofrece vaciarlo, por si el
          borrador era de otra cosa.
        */}
        {fromDraft && (
          <View style={styles.fromDraft}>
            <Text style={styles.fromDraftText}>
              Hemos traído lo que escribiste al publicar. Repásalo y añade las
              fotos si quieres.
            </Text>
            <Pressable
              onPress={startOver}
              accessibilityRole="button"
              testID="request-start-over"
            >
              <Text style={styles.fromDraftAction}>Empezar de cero</Text>
            </Pressable>
          </View>
        )}

        {formError && <Text style={styles.formError}>{formError}</Text>}

        {tradeOptions.length > 1 && (
          <FormField
            label="¿Para qué le contratas?"
            hint="Cobra distinto según el oficio, así que conviene decirlo."
            error={fieldErrors.tradeSlug}
          >
            <Picker
              options={tradeOptions}
              value={chosenTrade}
              onChange={setTrade}
              placeholder="Elige el oficio"
              title="Oficio"
              disabled={isRequesting}
              testID="request-trade"
            />
          </FormField>
        )}

        <FormField
          label="¿Qué necesitas?"
          hint="Un título corto, como lo dirías por teléfono."
          error={fieldErrors.title}
        >
          <Input
            value={title}
            onChangeText={setTitle}
            placeholder="Ej. Cambiar el grifo del baño"
            editable={!isRequesting}
            error={Boolean(fieldErrors.title)}
            testID="request-title"
          />
        </FormField>

        <FormField
          label="Cuéntalo con detalle"
          hint={
            isInstant
              ? 'Cuanto mejor lo describas, menos sorpresas el día del trabajo.'
              : 'Sin detalle no puede darte un precio y tendrá que ir a verlo antes.'
          }
          error={fieldErrors.description}
        >
          <Input
            value={description}
            onChangeText={setDescription}
            placeholder="Qué pasa, desde cuándo, y cualquier cosa que ayude a valorarlo."
            multiline
            numberOfLines={5}
            editable={!isRequesting}
            error={Boolean(fieldErrors.description)}
            testID="request-description"
          />
        </FormField>

        <FormField label="Ciudad" error={fieldErrors.city}>
          <Input
            value={city}
            onChangeText={setCity}
            placeholder="Ej. Madrid"
            autoCapitalize="words"
            editable={!isRequesting}
            error={Boolean(fieldErrors.city)}
            testID="request-city"
          />
        </FormField>

        <FormField
          label="Dirección"
          hint="Con el número. Solo la verá quien acabe haciendo el trabajo, no antes."
          error={fieldErrors.addressLine}
        >
          <Input
            value={addressLine}
            onChangeText={setAddressLine}
            placeholder="Ej. Calle Mayor 14, 3º B"
            editable={!isRequesting}
            error={Boolean(fieldErrors.addressLine)}
            testID="request-address"
          />
        </FormField>

        <FormField
          label="¿Cuándo lo necesitas?"
          hint={
            preferredDate
              ? formatLongDateTime(preferredDate)
              : 'Opcional. Ayuda a saber si le encaja en la agenda.'
          }
          error={fieldErrors.preferredDate}
        >
          <DateTimeField
            value={preferredDate}
            onChange={setPreferredDate}
            mode="datetime"
            placeholder="Elegir día y hora"
            minimumDate={startOfToday()}
            disabled={isRequesting}
            testID="request-date"
          />
        </FormField>

        {!isInstant && (
          <FormField
            label="Presupuesto máximo"
            hint="Opcional. Decirlo ahorra idas y venidas si hay un tope claro."
            error={fieldErrors.maxBudget}
          >
            <Input
              value={maxBudget}
              onChangeText={(value) => setMaxBudget(value.replace(/[^0-9.,]/g, ''))}
              placeholder="200"
              suffix="€"
              keyboardType="decimal-pad"
              editable={!isRequesting}
              testID="request-budget"
            />
          </FormField>
        )}

        {/*
          Las fotos, como en Publicar: en oficios se valora mirando, y un
          encargo directo sin ellas obliga al profesional a preguntar por chat
          lo que se ve en un vistazo. No viajan en el borrador —son ficheros
          temporales que el sistema borra—, así que se eligen aquí.
        */}
        <InfoCard style={styles.photosCard}>
          <View style={styles.photosHead}>
            <Text style={styles.photosTitle}>Cargar imágenes del trabajo</Text>
            <View style={styles.photosTag}>
              <Text style={styles.photosTagText}>
                {photos.length > 0 ? `${photos.length} elegidas` : 'Opcional'}
              </Text>
            </View>
          </View>

          <Text style={styles.photosHint}>
            Con una foto del problema afina el precio y sabe lo que va a
            encontrarse. Les quitamos la ubicación antes de enviarlas.
          </Text>

          <PhotoPicker
            value={photos}
            onChange={setPhotos}
            disabled={isRequesting}
            testID="request-photos"
          />
        </InfoCard>

        {/**
         * La dirección no se pide aquí. Se entrega cuando hay alguien
         * asignado, igual que en una subasta al adjudicar: mientras el
         * encargo pueda no salir adelante, no hay motivo para darla.
         */}
        {/**
         * Se explica el recorrido de la dirección, que es la duda razonable
         * de quien la acaba de escribir: la da ahora, pero no la ve nadie
         * hasta que hay una persona asignada que tiene que ir.
         */}
        <Text style={styles.privacy}>
          Ni la empresa ni nadie más ve tu dirección mientras deciden. Solo la
          recibe quien quede asignado al trabajo.
        </Text>

        {isInstant && chosenRate !== undefined && (
          <Text style={styles.rate}>
            Tarifa: {chosenRate} €/h. Los recargos de fin de semana, festivo y
            horario nocturno se aplican encima y los verás antes de confirmar.
          </Text>
        )}

        <Button
          fullWidth
          loading={isRequesting}
          disabled={!canSend}
          onPress={() => void handleSend()}
          style={styles.send}
          testID="request-send"
        >
          {isInstant ? 'Enviar la reserva' : 'Pedir presupuesto'}
        </Button>
      </Animated.ScrollView>
    </View>
  )
}
