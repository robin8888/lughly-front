/**
 * RequestProPage
 * Encargar un trabajo a un profesional concreto del directorio.
 *
 * Es la forma de contratar: el cliente ya ha elegido a alguien mirando su
 * ficha, así que el formulario es corto y lo importante es contar bien qué
 * hace falta.
 *
 * Se avisa de quién va a responder. Si esa persona trabaja para una empresa,
 * el encargo lo recibe ella; decirlo antes evita que la respuesta a nombre de
 * otro parezca un cambiazo cuando llegue.
 */

import { useState } from 'react'
import { View, Text, ActivityIndicator, Pressable, Alert } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { FormScrollView } from '@/components/templates/FormScrollView'
import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/atoms/Input'
import { AddressInput } from '@/components/molecules/AddressInput'
import type { ApiGeocodeMatch } from '@/api/geocode.api'
import { EmptyState } from '@/components/molecules/EmptyState'
import { FormField } from '@/components/molecules/FormField'
import { InfoCard } from '@/components/molecules/InfoCard'
import { Picker } from '@/components/molecules/Picker'
import { DateTimeField } from '@/components/molecules/DateTimeField'
import { PhotoPicker } from '@/components/molecules/PhotoPicker'
import { useProProfile } from '@/hooks/domain/useProProfile'
import { useRequestPro } from '@/hooks/domain/useRequestPro'
import { useNavScrollHandler } from '@/hooks/ui/useCompactNav'
import { useTabBarClearance } from '@/hooks/ui/useTabBarClearance'
import type { PickedImage } from '@/hooks/media/usePickImage'
import {
  formatLongDateTime,
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
  const tabBarClearance = useTabBarClearance()
  const { data: pro, isPending, isError } = useProProfile(proId)
  const { request, isRequesting, fieldErrors, formError, reset } = useRequestPro(proId)

  const [trade, setTrade] = useState<string | null>(initialTrade ?? null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [city, setCity] = useState('')
  /** Si tocó la ciudad a mano; hasta entonces la pone la dirección elegida */
  const [cityTouched, setCityTouched] = useState(false)
  const [address, setAddress] = useState<ApiGeocodeMatch | null>(null)
  /** Piso, puerta, escalera: lo que el geocodificador no sabe */
  const [detail, setDetail] = useState('')
  const [preferredDate, setPreferredDate] = useState<Date | null>(null)
  const [maxBudget, setMaxBudget] = useState('')
  const [photos, setPhotos] = useState<PickedImage[]>([])

  const isInstant = type === 'INSTANT'

  /**
   * Quien ejerce varios oficios cobra distinto por cada uno, así que hay que
   * decir para cuál se le contrata. Con uno solo no se pregunta: sería un
   * desplegable de una única opción.
   */
  const tradeOptions =
    pro?.trades.map((entry) => ({
      value: entry.slug,
      label: `${entry.label} · ${
        entry.visitFee != null ? `Visita ${entry.visitFee} €` : `${entry.hourlyRate} €/h`
      }`,
    })) ?? []

  const chosenTrade = trade ?? pro?.trades[0]?.slug ?? null
  const chosenTradeEntry = pro?.trades.find((entry) => entry.slug === chosenTrade)
  /** "Visita X €" en modo visita, "X €/h" por hora — nunca `null €/h` */
  const chosenRateLabel =
    chosenTradeEntry &&
    (chosenTradeEntry.visitFee != null
      ? `Visita ${chosenTradeEntry.visitFee} €`
      : `${chosenTradeEntry.hourlyRate} €/h`)

  /**
   * Lo que hace falta para poder enviar, en un solo sitio.
   *
   * Estaba escrito solo como una condición del botón, así que el botón se
   * quedaba apagado **sin decir por qué**: rellenas el formulario, lo ves
   * completo, y no pasa nada. Un callejón sin salida, porque no hay forma de
   * saber qué falta.
   *
   * Ahora cada regla lleva su mensaje y se usa dos veces: para marcar el campo
   * que la incumple y para decir debajo del botón qué queda por hacer.
   */
  const MIN_TITLE = 8
  const MIN_DESCRIPTION = 20
  const MIN_CITY = 2

  /**
   * Cuántos caracteres faltan, dicho como se cuenta y no como se programa.
   * «Te faltan 4 caracteres» sirve; «mínimo 20» obliga a contar a mano.
   */
  const faltan = (valor: string, minimo: number) => {
    const restan = minimo - valor.trim().length
    return `Te ${restan === 1 ? 'falta 1 carácter' : `faltan ${restan} caracteres`}.`
  }

  /**
   * El error de un campo **solo cuando ya se ha escrito algo**.
   *
   * Un formulario recién abierto no puede salir en rojo: todavía no ha hecho
   * nada mal nadie. Lo que está vacío se dice debajo del botón, que es donde
   * se mira cuando no pasa nada al pulsarlo.
   *
   * El del servidor manda sobre el de aquí: si ya contestó, sabe más.
   */
  const errorDe = (campo: string | undefined, valor: string, minimo: number) =>
    campo ??
    (valor.trim().length > 0 && valor.trim().length < minimo
      ? faltan(valor, minimo)
      : undefined)

  const titleError = errorDe(fieldErrors.title, title, MIN_TITLE)
  const descriptionError = errorDe(fieldErrors.description, description, MIN_DESCRIPTION)
  const cityError = errorDe(fieldErrors.city, city, MIN_CITY)

  /** Lo que falta, en el orden en que está el formulario */
  const missing = [
    chosenTrade === null && 'el oficio',
    title.trim().length < MIN_TITLE && 'el título',
    description.trim().length < MIN_DESCRIPTION && 'la descripción',
    city.trim().length < MIN_CITY && 'la ciudad',
    /*
      La que más despista: el campo se ve lleno y por dentro está a nulo,
      porque `address` solo se rellena al **elegir una sugerencia** —de ahí
      salen las coordenadas—. Quien la teclea entera y no toca ninguna se queda
      mirando un botón apagado con la dirección escrita delante, así que aquí
      se dice con esas palabras.
    */
    address === null && 'la dirección (elígela de las sugerencias)',
  ].filter((entrada): entrada is string => typeof entrada === 'string')

  const canSend = missing.length === 0 && !isRequesting

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
      /*
        La dirección normalizada del geocodificador más el piso. Quien la lee
        es la persona que va a presentarse allí, así que van juntos: una línea
        que se puede copiar al navegador del coche y llamar al timbre.

        No viajan las coordenadas, y no es un olvido: en un encargo directo el
        profesional ya está elegido, así que no hay ninguna distancia que
        calcular. Las urgencias sí las mandan, porque ahí el punto decide a
        quién se avisa.
      */
      addressLine: detail.trim()
        ? `${address!.label} (${detail.trim()})`
        : address!.label,
      ...(preferredDate && { preferredDate: toIsoDateTime(preferredDate) }),
      ...(maxBudget !== '' &&
        Number.isFinite(budget) &&
        budget > 0 && { maxBudget: budget }),
    }, photos)

    if (!sent) return

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
      {/* La cabecera ocupa también la franja del sistema: la hora, en claro */}
      <StatusBar style="light" />
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

      <FormScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={[styles.content, { paddingBottom: tabBarClearance }]}
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
          error={titleError}
        >
          <Input
            value={title}
            onChangeText={setTitle}
            placeholder="Ej. Cambiar el grifo del baño"
            editable={!isRequesting}
            error={Boolean(titleError)}
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
          error={descriptionError}
        >
          <Input
            value={description}
            onChangeText={setDescription}
            placeholder="Qué pasa, desde cuándo, y cualquier cosa que ayude a valorarlo."
            multiline
            numberOfLines={5}
            editable={!isRequesting}
            error={Boolean(descriptionError)}
            testID="request-description"
          />
        </FormField>

        <FormField label="Ciudad" error={cityError}>
          <Input
            value={city}
            onChangeText={(texto) => {
              setCityTouched(true)
              setCity(texto)
            }}
            placeholder="Ej. Madrid"
            autoCapitalize="words"
            editable={!isRequesting}
            error={Boolean(cityError)}
            testID="request-city"
          />
        </FormField>

        <FormField
          label="Dirección"
          hint="Elígela de las sugerencias. Solo la verá quien acabe haciendo el trabajo, no antes."
          error={fieldErrors.addressLine}
        >
          <AddressInput
            value={address}
            onChange={(elegida) => {
              setAddress(elegida)
              if (elegida?.city && !cityTouched) setCity(elegida.city)
            }}
            placeholder="Ej. Calle Mayor 14"
            editable={!isRequesting}
            error={Boolean(fieldErrors.addressLine)}
            detail={detail}
            onDetailChange={setDetail}
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
          En oficios se valora mirando, y un encargo directo sin fotos obliga
          al profesional a preguntar por chat lo que se ve en un vistazo.
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
         * asignado: mientras el encargo pueda no salir adelante, no hay
         * motivo para darla.
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

        {isInstant && chosenRateLabel && (
          <Text style={styles.rate}>
            Tarifa: {chosenRateLabel}. Los recargos de fin de semana, festivo y
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

        {/**
         * Qué falta, debajo del botón que no se puede pulsar.
         *
         * Es donde se mira cuando no pasa nada al tocarlo. Los campos ya
         * marcan lo que está a medias; esto cubre lo que está **vacío**, que
         * no lleva error propio —un formulario recién abierto no puede salir
         * en rojo— y es justo lo que dejaba el botón apagado sin explicación.
         */}
        {!canSend && !isRequesting && (
          <Text style={styles.missing} testID="request-missing">
            {missing.length === 1
              ? `Falta ${missing[0]}.`
              : `Faltan ${missing.slice(0, -1).join(', ')} y ${missing[missing.length - 1]}.`}
          </Text>
        )}
      </FormScrollView>
    </View>
  )
}
