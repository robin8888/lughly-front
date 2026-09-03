/**
 * RequestProPage
 * Pedirle presupuesto a un profesional concreto del directorio, que es
 * **contratarle una visita**.
 *
 * El cliente ya ha elegido a alguien mirando su ficha, así que el formulario es
 * corto y lo importante es contar bien qué hace falta.
 *
 * Se avisa de quién va a responder. Si esa persona trabaja para una empresa,
 * el encargo lo recibe ella; decirlo antes evita que la respuesta a nombre de
 * otro parezca un cambiazo cuando llegue.
 *
 * ## Aquí se paga, y hasta el 3 de septiembre de 2026 no
 *
 * Esta pantalla servía para dos cosas —pedir precio y reservar a tarifa fija—
 * y no cobraba ninguna de las dos. Era el camino gratis abierto a todo el
 * directorio. Ahora es una sola cosa: se retiene lo que ese profesional cobra
 * por presentarse, y se le paga cuando acepta. Reservar tiene sus pantallas,
 * `BookHoursPage` y `HireCartaPage`, que también cobran.
 *
 * El desglose está arriba y no debajo del botón a propósito: es lo primero que
 * hay que leer, no la letra pequeña de lo que ya has decidido. La ficha ya ha
 * avisado con un diálogo antes de llegar; esto lo repite con la cifra
 * definitiva del oficio que se elija, que puede no ser el de la ficha.
 */

import { useState } from 'react'
import { View, Text, ActivityIndicator, Pressable, Alert } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { FormScrollView } from '@/components/templates/FormScrollView'
import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/atoms/Input'
import { AddressInput } from '@/components/molecules/AddressInput'
import type { ApiGeocodeMatch } from '@/api/geocode.api'
import {
  EMPTY_ADDRESS_DETAIL,
  composeAddressLine,
  isPostcode,
  type AddressDetail,
} from '@/utils/address'
import { EmptyState } from '@/components/molecules/EmptyState'
import { FormField } from '@/components/molecules/FormField'
import { InfoCard } from '@/components/molecules/InfoCard'
import { Money, formatAmount } from '@/components/atoms/Money'
import { Picker } from '@/components/molecules/Picker'
import { DateTimeField } from '@/components/molecules/DateTimeField'
import { PhotoPicker } from '@/components/molecules/PhotoPicker'
import { useProProfile } from '@/hooks/domain/useProProfile'
import { usePaymentMethods } from '@/hooks/domain/usePaymentMethods'
import { useRequestPro } from '@/hooks/domain/useRequestPro'
import { visitPriceOf, visitPriceReason } from '@/utils/visitPrice'
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

export interface RequestProPageProps {
  proId: string | undefined
  /** El oficio por el que se le pide, que es de quien sale el precio */
  initialTrade?: string
  onBack: () => void
  onSent: () => void
  /** Sin tarjeta guardada no hay visita que retener */
  onAddPaymentMethod: () => void
}

export function RequestProPage({
  proId,
  initialTrade,
  onBack,
  onSent,
  onAddPaymentMethod,
}: RequestProPageProps) {
  const onScroll = useNavScrollHandler()
  const tabBarClearance = useTabBarClearance()
  const { data: pro, isPending, isError } = useProProfile(proId)
  const {
    data: methods,
    isPending: isPendingMethods,
    isError: isErrorMethods,
  } = usePaymentMethods()
  const { request, isRequesting, fieldErrors, formError, reset } = useRequestPro(proId)

  const [trade, setTrade] = useState<string | null>(initialTrade ?? null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [city, setCity] = useState('')
  /** Si tocó la ciudad a mano; hasta entonces la pone la dirección elegida */
  const [cityTouched, setCityTouched] = useState(false)
  const [address, setAddress] = useState<ApiGeocodeMatch | null>(null)
  /** Número, escalera, piso, puerta y código postal: lo que el
   * geocodificador no sabe y quien va necesita para llamar al timbre */
  const [detail, setDetail] = useState<AddressDetail>(EMPTY_ADDRESS_DETAIL)
  const [preferredDate, setPreferredDate] = useState<Date | null>(null)
  const [maxBudget, setMaxBudget] = useState('')
  const [photos, setPhotos] = useState<PickedImage[]>([])

  /**
   * Quien ejerce varios oficios cobra distinto por cada uno, así que hay que
   * decir para cuál se le contrata. Con uno solo no se pregunta: sería un
   * desplegable de una única opción.
   *
   * La etiqueta dice **lo que va a costar la visita** y no su tarifa: es lo
   * que se paga aquí, y cambiar de oficio en el desplegable cambia el importe
   * del botón. Poner «14 €/h» al lado de un botón que cobra 28 € sería el
   * mejor sitio posible para un malentendido.
   */
  const tradeOptions =
    pro?.trades.map((entry) => {
      const visita = visitPriceOf(entry)

      return {
        value: entry.slug,
        label:
          visita === null
            ? `${entry.label} · sin precio`
            : `${entry.label} · visita ${formatAmount(visita)} €`,
      }
    }) ?? []

  const chosenTrade = trade ?? pro?.trades[0]?.slug ?? null
  const chosenTradeEntry = pro?.trades.find((entry) => entry.slug === chosenTrade)

  /**
   * Lo que cuesta la visita de ESE oficio, con la misma cuenta que hace el
   * servidor (`visitPrice`, espejo de `visit-price.ts`). Nulo es un oficio sin
   * precios, con el que no se puede contratar.
   */
  const visitFee = visitPriceOf(chosenTradeEntry)
  const visitReason = visitPriceReason(chosenTradeEntry)

  const method = methods?.[0] ?? null

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
   * Los campos por los que ya ha pasado el cliente.
   *
   * Un formulario recién abierto no puede salir en rojo —todavía no ha hecho
   * nada mal nadie—, pero **uno que se ha rellenado y se ha dejado a medias
   * sí**: quien escribe la descripción, la borra y se va al siguiente campo ha
   * dejado ahí algo que no vale, y decírselo solo debajo del botón obliga a
   * atar el aviso al campo por su cuenta.
   *
   * Se marca al salir del campo, que es cuando se sabe que ha terminado con
   * él. Mientras escribe no: contar en rojo los caracteres que le faltan a una
   * frase a medio escribir es regañar a alguien por no haber acabado.
   */
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const touch = (campo: string) => setTouched((antes) => ({ ...antes, [campo]: true }))

  /**
   * El error de un campo: cuando ya se ha escrito algo, o cuando se ha pasado
   * por él y se ha dejado como estaba.
   *
   * El del servidor manda sobre el de aquí: si ya contestó, sabe más.
   */
  const errorDe = (
    campo: string | undefined,
    valor: string,
    minimo: number,
    nombre: string,
  ) =>
    campo ??
    ((valor.trim().length > 0 || touched[nombre] === true) &&
    valor.trim().length < minimo
      ? faltan(valor, minimo)
      : undefined)

  const titleError = errorDe(fieldErrors.title, title, MIN_TITLE, 'title')
  const descriptionError = errorDe(
    fieldErrors.description,
    description,
    MIN_DESCRIPTION,
    'description',
  )
  const cityError = errorDe(fieldErrors.city, city, MIN_CITY, 'city')

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
    address !== null && detail.number.trim() === '' && 'el número de la calle',
    address !== null && !isPostcode(detail.postcode) && 'el código postal',
    /*
      Y la tarjeta, que es lo nuevo: la visita se retiene al pedirla. Va al
      final de la lista porque es lo último que se resuelve y porque tiene su
      propia tarjeta con su botón más arriba; aquí solo cierra la cuenta de por
      qué el botón está apagado.
    */
    method === null && 'una tarjeta guardada',
    chosenTradeEntry != null && visitFee === null && 'el precio de ese oficio (no lo tiene puesto)',
  ].filter((entrada): entrada is string => typeof entrada === 'string')

  const canSend = missing.length === 0 && !isRequesting

  const handleSend = async () => {
    reset()
    if (!chosenTrade || !method) return

    const budget = Number(maxBudget.replace(',', '.'))

    const sent = await request({
      type: 'QUOTE',
      tradeSlug: chosenTrade,
      title: title.trim(),
      description: description.trim(),
      city: city.trim(),
      /*
        La dirección entera en una línea, a la española: calle y número,
        escalera, piso y puerta, y el código postal con la ciudad. Quien la lee
        es la persona que va a presentarse allí, así que va seguida: se puede
        copiar al navegador del coche y llamar al timbre.

        No viajan las coordenadas, y no es un olvido: en un encargo directo el
        profesional ya está elegido, así que no hay ninguna distancia que
        calcular. Las urgencias sí las mandan, porque ahí el punto decide a
        quién se avisa.
      */
      addressLine: composeAddressLine(address!, detail),
      ...(preferredDate && { preferredDate: toIsoDateTime(preferredDate) }),
      ...(maxBudget !== '' &&
        Number.isFinite(budget) &&
        budget > 0 && { maxBudget: budget }),
      paymentMethodId: method.id,
    }, photos)

    if (!sent) return

    const { request: encargo, photosFailed } = sent

    const quien =
      encargo.respondedByName === encargo.requestedProName
        ? `${encargo.requestedProName} tiene 24 horas para responderte. Lo verás en Mis trabajos.`
        : `Responde ${encargo.respondedByName}, la empresa de ${encargo.requestedProName}, en un plazo de 24 horas. Si te proponen mandar a otra persona, decides tú.`

    /*
      El dinero, primero. Es lo que el cliente acaba de hacer y lo que no puede
      quedarle en duda: se ha apartado un importe en su tarjeta y todavía no se
      le ha cobrado nada.
    */
    const dinero = `Se han retenido ${formatAmount(encargo.amount)} € de la visita; solo se cobran si acepta.`

    Alert.alert(
      'Visita pedida',
      photosFailed > 0
        ? `${dinero} ${quien} ${photosFailed === 1 ? 'Una foto no se pudo enviar' : `${photosFailed} fotos no se pudieron enviar`}.`
        : `${dinero} ${quien}`,
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
      <Text style={styles.title}>Pedir presupuesto</Text>
    </View>
  )

  if (isPending || isPendingMethods) {
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

        {/**
         * Lo que cuesta la visita, arriba y con su porqué.
         *
         * No es la letra pequeña de una decisión ya tomada: es la decisión. Un
         * botón que dice «Pedir presupuesto por 28 €» sin nada que explique de
         * dónde salen esos 28 € parece un cargo sorpresa, y quien cobra por
         * horas no tiene ninguna «tarifa de visita» que el cliente pueda haber
         * visto en la ficha — es su mínimo, y hay que decirlo.
         */}
        {visitFee !== null && (
          <InfoCard testID="request-visit-summary">
            <View style={styles.line}>
              <Text style={styles.lineLabel}>
                Visita para presupuesto{chosenTradeEntry ? ` · ${chosenTradeEntry.label}` : ''}
              </Text>
              <Money amount={visitFee} style={styles.total} />
            </View>

            {visitReason && <Text style={styles.note}>{visitReason}</Text>}

            {/*
              "Se retiene" y no "se cobra", porque es literalmente lo que pasa.
              Y la última frase es la que evita el enfado de verdad: lo que se
              paga es el viaje, no el arreglo, así que el presupuesto puede no
              gustar y la visita se cobra igual.
            */}
            <Text style={styles.note}>
              Se retiene ahora en tu tarjeta y solo se te cobra cuando{' '}
              {pro.name.split(' ')[0]} lo acepte. Si no puede o no contesta a
              tiempo, se suelta y no se te cobra nada.
            </Text>

            <Text style={styles.note}>
              Lo que pagas es que vaya a verlo. El precio del arreglo te lo dirá
              después y decides tú; la visita se cobra igual si no lo aceptas.
            </Text>
          </InfoCard>
        )}

        {formError && <Text style={styles.formError}>{formError}</Text>}

        {isErrorMethods || !method ? (
          <InfoCard style={styles.paymentCard} testID="request-no-method">
            <Text style={styles.paymentTitle}>Necesitas una tarjeta guardada</Text>
            <Text style={styles.paymentBody}>
              La visita se retiene al pedirla, así que hace falta un método de
              pago guardado.
            </Text>
            <Button
              variant="secondary"
              onPress={onAddPaymentMethod}
              testID="request-add-method"
            >
              Añadir tarjeta
            </Button>
          </InfoCard>
        ) : (
          <InfoCard style={styles.paymentCard} testID="request-method">
            <Text style={styles.paymentTitle}>Se retendrá en</Text>
            <Text style={styles.paymentBody}>
              {method.brand} •••• {method.last4}
            </Text>
          </InfoCard>
        )}

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
            onBlur={() => touch('title')}
            placeholder="Ej. Cambiar el grifo del baño"
            editable={!isRequesting}
            error={Boolean(titleError)}
            testID="request-title"
          />
        </FormField>

        <FormField
          label="Cuéntalo con detalle"
          hint="Con detalle llega sabiendo lo que va a encontrarse, y la visita sirve para algo más que para mirar."
          error={descriptionError}
        >
          <Input
            value={description}
            onChangeText={setDescription}
            onBlur={() => touch('description')}
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
            onBlur={() => touch('city')}
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

        {/*
          El tope es del arreglo, no de la visita — la visita ya tiene su
          precio arriba—. Sirve para que no le presupuesten algo que no se va a
          poder pagar, y por eso el texto dice de qué habla: dejarlo en
          «Presupuesto máximo» al lado de un importe que se retiene ahora
          invita a leerlo como un tope de lo que se va a cobrar hoy.
        */}
        <FormField
          label="Tope para el arreglo"
          hint="Opcional. Decirlo ahorra idas y venidas si hay un límite claro."
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


        <Button
          fullWidth
          loading={isRequesting}
          disabled={!canSend}
          onPress={() => void handleSend()}
          style={styles.send}
          testID="request-send"
        >
          {visitFee === null
            ? 'Pedir presupuesto'
            : `Pedir la visita por ${formatAmount(visitFee)} €`}
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
