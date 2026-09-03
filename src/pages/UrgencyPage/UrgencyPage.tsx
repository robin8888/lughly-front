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
import { StatusBar } from 'expo-status-bar'
import { FormScrollView } from '@/components/templates/FormScrollView'
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
import { AddressInput } from '@/components/molecules/AddressInput'
import type { ApiGeocodeMatch } from '@/api/geocode.api'
import {
  EMPTY_ADDRESS_DETAIL,
  composeAddressLine,
  isPostcode,
  type AddressDetail,
} from '@/utils/address'
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
  /**
   * La dirección elegida de las sugerencias. Llega con coordenadas, que es lo
   * que el servidor exige para una urgencia; `detail` es el número, la
   * escalera, el piso, la puerta y el código postal, que ningún geocodificador
   * sabe y quien va a llamar al timbre necesita.
   */
  const [address, setAddress] = useState<ApiGeocodeMatch | null>(null)
  const [detail, setDetail] = useState<AddressDetail>(EMPTY_ADDRESS_DETAIL)
  const [description, setDescription] = useState('')
  /**
   * Si ya ha pasado por el campo de la descripción y lo ha dejado corto.
   *
   * Con una fuga en casa, el aviso de debajo del botón se lee tarde: lo que se
   * mira es el campo que se acaba de dejar. Se marca al salir de él y no
   * mientras escribe —contar en rojo lo que le falta a una frase a medias es
   * regañar a alguien por no haber acabado—.
   */
  const [descriptionTouched, setDescriptionTouched] = useState(false)
  const [photos, setPhotos] = useState<PickedImage[]>([])

  /**
   * Si el cliente comparte su ubicación, mandan estas coordenadas y no lo
   * que ponga en el campo: el GPS es más exacto que traducir un texto, y el
   * texto pasa a ser la aclaración —piso, puerta— que el GPS no puede dar.
   */
  const [shared, setShared] = useState<SharedLocation | null>(null)
  const { status: shareStatus, share } = useShareLocation()

  /**
   * Las del GPS mandan sobre las de la dirección escrita: son más exactas que
   * traducir un texto. Cuando se comparte la ubicación, la dirección pasa a
   * ser lo que lee la persona que va, no lo que sitúa el punto.
   */
  const point = shared
    ? { lat: shared.lat, lng: shared.lng, label: shared.label, city: shared.city }
    : address
      ? { lat: address.lat, lng: address.lng, label: address.label, city: address.city }
      : null

  const coverage = useAddressCoverage(point, trade)
  const { publish, isPublishing, isUploadingPhotos, fieldErrors, formError, reset } =
    usePublishJob()

  const isBusy = isPublishing || isUploadingPhotos
  const located = coverage.status === 'ready' ? coverage.point : null

  const tradeLabel =
    TRADE_OPTIONS.find((option) => option.value === trade)?.label ?? ''

  /**
   * Sin coordenadas no se puede enviar: el servidor las exige para una
   * urgencia. Se espera a que la dirección esté situada en el mapa.
   */
  const canPublish =
    trade !== '' &&
    description.trim().length >= 20 &&
    located !== null &&
    /*
      El número, también en una urgencia. Es lo primero que pregunta quien va
      de camino a las tres de la mañana, y preguntarlo por teléfono a esa hora
      es media hora perdida. El código postal no se exige aquí: lo trae el
      punto del mapa, y con una fuga en casa un campo más es un campo de más.
    */
    detail.number.trim() !== '' &&
    !isBusy

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

  /**
   * Y el mismo aviso pegado al campo, contando lo que falta.
   *
   * Solo cuando ya ha escrito algo o ha pasado por él: un formulario recién
   * abierto no puede salir en rojo, que ahí todavía no ha hecho nada mal
   * nadie. El del servidor manda sobre el de aquí.
   */
  const faltanCaracteres = 20 - description.trim().length
  const descriptionError =
    fieldErrors.description ??
    ((description.trim().length > 0 || descriptionTouched) && faltanCaracteres > 0
      ? `Te ${faltanCaracteres === 1 ? 'falta 1 carácter' : `faltan ${faltanCaracteres} caracteres`}.`
      : undefined)

  if (located !== null && detail.number.trim() === '') {
    missing.push('Pon el número de la calle: sin él no hay portal al que ir.')
  }

  if (located === null) {
    missing.push(
      coverage.status === 'searching'
        ? 'Estamos mirando quién cubre esa dirección…'
        : coverage.status === 'failed'
          ? 'No hemos podido comprobar la cobertura. Inténtalo otra vez.'
          : 'Elige tu dirección de las sugerencias o comparte tu ubicación.',
    )
  }

  const handleShareLocation = async () => {
    const position = await share()
    if (!position) return

    setShared(position)

    /*
      Y se rellena el campo con lo que devuelva el mapa. Va como dirección
      elegida —con las coordenadas del GPS, no las del texto— porque eso es lo
      que es: un punto real, solo que situado por el móvil en vez de por una
      lista. El número, el piso y la puerta se siguen añadiendo aparte.
    */
    if (position.label !== '') {
      setAddress({
        label: position.label,
        lat: position.lat,
        lng: position.lng,
        city: position.city,
        postcode: position.postcode,
      })
    }
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
        /*
          Las piezas se juntan en una línea al enviar: el servidor guarda una
          sola, y quien la lee la lee entera. Separarlas en el contrato
          obligaría a tocarlo para un dato que nunca se consulta por separado.
        */
        addressLine: composeAddressLine(located, detail),
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
        {/* La cabecera ocupa también la franja del sistema: la hora, en claro */}
        <StatusBar style="light" />
        <Pressable onPress={onBack} style={styles.back} accessibilityRole="button">
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <Text style={styles.title}>Urgencia</Text>
      </View>

      <FormScrollView
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
          hint="Elígela de las sugerencias. La verán solo los profesionales a los que avisemos."
          error={fieldErrors.addressLine}
        >
          <AddressInput
            value={address}
            onChange={(elegida) => {
              setAddress(elegida)
              /*
                Cambiar de dirección a mano descarta la ubicación compartida.
                Sin esto mandaban las coordenadas del GPS mientras el campo
                enseñaba otra calle, que es exactamente el desajuste que este
                campo existe para evitar.
              */
              setShared(null)
            }}
            placeholder="Calle y número"
            error={Boolean(fieldErrors.addressLine)}
            editable={!isBusy}
            detail={detail}
            onDetailChange={setDetail}
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
              Usando tu ubicación. El GPS acierta la calle, no el piso: añade
              el piso y la puerta debajo para que sepan dónde llamar.
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
          {...(descriptionError ? { error: descriptionError } : {})}
        >
          <Input
            value={description}
            onChangeText={setDescription}
            onBlur={() => setDescriptionTouched(true)}
            placeholder="Ej. Se ha quedado la llave dentro y no puedo entrar."
            multiline
            numberOfLines={3}
            style={styles.textarea}
            editable={!isBusy}
            error={Boolean(descriptionError)}
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
          {/*
            Y cuándo se pone el dinero. Publicar la urgencia no cuesta nada
            —hasta aquí no hay ni precio ni persona—, pero al elegir a alguien
            se aparta la salida en la tarjeta, así que hace falta tenerla. Vale
            más decirlo ahora que dejar que lo descubra con la avería delante.
          */}
          <Text style={styles.surchargeBody}>
            Publicarla no cuesta nada. Al avisar a quien elijas se aparta una
            hora suya —la salida— en tu tarjeta, y solo se cobra si acepta: ten
            una guardada en Mis pagos.
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
      </FormScrollView>
    </View>
  )
}
