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
 * - **El precio se ve antes de elegir**. El README pedía avisar del recargo por
 *   adelantado; desde el 20 Agosto 2026 se hace mejor que eso: cada profesional
 *   publica su tarifa de urgencia y el cliente las compara en la pantalla
 *   siguiente. Un porcentaje sobre una tarifa que no se conoce no es un aviso.
 *
 * Este formulario es más corto a propósito. Quien tiene una urgencia no está
 * para elegir presupuesto máximo ni fecha preferida.
 */

import { useState } from 'react'
import { View, Text, Pressable } from 'react-native'
import Animated from 'react-native-reanimated'
import { useNavScrollHandler } from '@/hooks/ui/useCompactNav'
import { useTabBarClearance } from '@/hooks/ui/useTabBarClearance'
import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/atoms/Input'
import { InfoCard } from '@/components/molecules/InfoCard'
import { FormField } from '@/components/molecules/FormField'
import { Picker } from '@/components/molecules/Picker'
import { PhotoPicker } from '@/components/molecules/PhotoPicker'
import { CoverageIndicator } from '@/components/organisms/CoverageIndicator'
import { useAddressCoverage } from '@/hooks/domain/useAddressCoverage'
import { usePublishJob } from '@/hooks/domain/usePublishJob'
import {
  useShareLocation,
  type SharedLocation,
} from '@/hooks/domain/useShareLocation'
import type { PickedImage } from '@/hooks/media/usePickImage'
import { TRADE_OPTIONS } from '@/utils/trades'
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
  /**
   * La barra inferior se encoge al bajar y vuelve al subir. Va en todas
   * las pantallas con scroll, no solo en el inicio: si en una se moviera
   * y en la siguiente no, parecería que la barra falla.
   */
  const onScroll = useNavScrollHandler()
  const tabBarClearance = useTabBarClearance()

  const [trade, setTrade] = useState('')
  const [address, setAddress] = useState('')
  const [description, setDescription] = useState('')
  const [photos, setPhotos] = useState<PickedImage[]>([])

  /**
   * Si el cliente comparte su ubicación, mandan estas coordenadas y no lo
   * que ponga en el campo: el GPS es más exacto que traducir un texto, y el
   * texto pasa a ser la aclaración —piso, puerta— que el GPS no puede dar.
   */
  const [shared, setShared] = useState<SharedLocation | null>(null)
  const { status: shareStatus, share } = useShareLocation()

  const coverage = useAddressCoverage(address, trade, shared)
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

  /**
   * Qué falta para poder seguir.
   *
   * El botón se quedaba apagado sin decir por qué, y lo único que se decía
   * era lo de la dirección —debajo del botón y solo si había algo escrito—.
   * Con una fuga en casa, un botón apagado y mudo es un callejón: hay tres
   * motivos posibles y ninguno se ve.
   *
   * Se dice **antes** del botón, que es donde se mira al no poder pulsarlo.
   */
  const missing: string[] = []

  if (trade === '') missing.push('Elige el oficio que necesitas.')

  if (description.trim().length < 20) {
    missing.push('Cuenta qué ocurre, con veinte caracteres o más.')
  }

  if (located === null) {
    missing.push(
      coverage.status === 'searching'
        ? 'Estamos situando la dirección…'
        : coverage.status === 'not-found'
          ? 'No encontramos esa dirección. Prueba con la calle, el número y la ciudad.'
          : coverage.status === 'failed'
            ? 'No hemos podido situar la dirección. Inténtalo otra vez.'
            : 'Escribe la dirección o comparte tu ubicación.',
    )
  }

  const handleShareLocation = async () => {
    const position = await share()
    if (!position) return

    setShared(position)

    // Se rellena el campo con lo que devuelva el mapa, pero editable: el
    // cliente añade el piso y la puerta, que es lo que el GPS no sabe.
    if (position.label !== '') setAddress(position.label)
  }

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

      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={[styles.content, { paddingBottom: tabBarClearance }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <InfoCard variant="accent" style={styles.introCard}>
          <Text style={styles.intro}>
            Al terminar te enseñamos quién está de guardia ahora mismo y llega a
            tu dirección, con su precio de urgencia. Eliges tú.
          </Text>
        </InfoCard>

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

          {/*
            Como botón y no como enlace: quien tiene una fuga a las tres de la
            mañana no sabe el número de su portal, y esta es su salida. Un
            texto azul entre dos campos se pasa por alto.
          */}
          <Pressable
            onPress={() => void handleShareLocation()}
            disabled={isBusy || shareStatus === 'locating'}
            accessibilityRole="button"
            style={styles.share}
            testID="urgency-share-location"
          >
            <Text style={styles.shareLink}>
              {shareStatus === 'locating'
                ? 'Buscando dónde estás…'
                : shared
                  ? 'Usar otra vez mi ubicación'
                  : 'No sé la dirección: usar mi ubicación'}
            </Text>
          </Pressable>

          {shareStatus === 'denied' && (
            <Text style={styles.shareError}>
              No hemos podido acceder a tu ubicación. Puedes activarla en los
              ajustes del móvil, o escribir la dirección a mano.
            </Text>
          )}

          {shared && (
            <Text style={styles.shareNote}>
              Usando tu ubicación. El GPS acierta la calle, no el piso:
              añade el piso y la puerta al texto para que sepan dónde llamar.
            </Text>
          )}
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

        {/*
          Las fotos, en su tarjeta como al publicar. Aquí importan todavía
          más: quien acepta una urgencia sale de casa en minutos y decide con
          lo que vea, sin tiempo de preguntar nada por chat.
        */}
        <InfoCard style={styles.photosCard}>
          <View style={styles.photosHead}>
            <Text style={styles.photosTitle}>Fotos de la avería</Text>
            <View style={styles.photosTag}>
              <Text style={styles.photosTagText}>
                {photos.length > 0 ? `${photos.length} elegidas` : 'Opcional'}
              </Text>
            </View>
          </View>

          <Text style={styles.photosHint}>
            Con una foto sabe qué se va a encontrar y qué herramienta llevar.
            Les quitamos la ubicación antes de enviarlas.
          </Text>

          <PhotoPicker
            value={photos}
            onChange={setPhotos}
            disabled={isBusy}
            testID="urgency-photos"
          />
        </InfoCard>

        <View style={styles.surcharge}>
          <View style={styles.surchargeHead}>
            <View style={styles.surchargeDot} />
            <Text style={styles.surchargeTitle}>Recargo por urgencia</Text>
          </View>
          <Text style={styles.surchargeBody}>
            Cada profesional pone su propio precio por hora para las urgencias,
            con el recargo ya dentro. Los verás todos en la lista antes de
            elegir a nadie.
          </Text>
        </View>

        {missing.length > 0 && !isBusy && (
          <View style={styles.missing} testID="urgency-missing">
            {missing.map((item) => (
              <Text key={item} style={styles.missingItem}>
                {item}
              </Text>
            ))}
          </View>
        )}

        <Button
          fullWidth
          loading={isBusy}
          disabled={!canPublish}
          onPress={() => void handlePublish()}
          style={styles.submit}
          testID="urgency-submit"
        >
          Ver profesionales
        </Button>
      </Animated.ScrollView>
    </View>
  )
}
