/**
 * BookHoursPage
 * Contratar a un profesional **por horas**: se elige el día, cuánto rato hace
 * falta y una de las horas que él tiene libres, y se paga por adelantado.
 *
 * Es el camino que le faltaba al dinero. Hasta ahora «Reservar ahora» llevaba
 * al formulario genérico —título, descripción, tope orientativo— que crea el
 * encargo **sin ningún cobro**: el trabajo se hacía entero y a nadie se le
 * pedía pagar. Aquí el precio existe antes de contratar, sale del servidor con
 * los recargos y el mínimo del oficio dentro, y se retiene en la tarjeta.
 *
 * ## Por qué se elige un hueco y no «el jueves por la mañana»
 *
 * Porque lo que se está comprando son horas concretas de la agenda de alguien.
 * Los huecos salen de su horario menos sus ausencias menos lo que ya tiene, y
 * al reservar el servidor los vuelve a comprobar: entre mirar y pagar pasan
 * minutos y la agenda es de otro.
 *
 * No sustituye a `HireCartaPage`, que es el otro modo de cobrar: quien cobra
 * por visita tiene un precio cerrado de puerta a puerta y ahí no hay horas que
 * elegir. La ficha manda a una o a otra según cómo cobre ese oficio.
 *
 * ## Al que no ha puesto su horario se le supone uno
 *
 * Todos los días de 8 a 18, y lo hace el servidor. Sin eso, quien se da de
 * alta y no lo rellena sale en el directorio y **no tiene un solo hueco en
 * todo el mes**, porque los huecos salen del horario: el cliente prueba día
 * tras día leyendo «ese día no trabaja» en los treinta y uno. Es una
 * suposición, no un dato suyo, y por eso el servidor **le exige poner el suyo
 * de verdad antes de dejarle aceptar** el trabajo.
 */

import { useMemo, useState } from 'react'
import { View, Text, ActivityIndicator, Pressable } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { FormScrollView } from '@/components/templates/FormScrollView'
import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/atoms/Input'
import { Money, formatAmount } from '@/components/atoms/Money'
import { Avatar } from '@/components/atoms/Avatar'
import { AddressInput } from '@/components/molecules/AddressInput'
import type { ApiGeocodeMatch } from '@/api/geocode.api'
import {
  EMPTY_ADDRESS_DETAIL,
  composeAddressLine,
  isPostcode,
  type AddressDetail,
} from '@/utils/address'
import { DateTimeField } from '@/components/molecules/DateTimeField'
import { EmptyState } from '@/components/molecules/EmptyState'
import { FormField } from '@/components/molecules/FormField'
import { InfoCard } from '@/components/molecules/InfoCard'
import { Picker } from '@/components/molecules/Picker'
import { useProProfile } from '@/hooks/domain/useProProfile'
import { usePaymentMethods } from '@/hooks/domain/usePaymentMethods'
import { useFreeSlots } from '@/hooks/domain/useFreeSlots'
import { useDayRanges } from '@/hooks/domain/useDayRanges'
import { useHoursQuote } from '@/hooks/domain/useHoursQuote'
import { useBookHours } from '@/hooks/domain/useBookHours'
import { useNavScrollHandler } from '@/hooks/ui/useCompactNav'
import { useTabBarClearance } from '@/hooks/ui/useTabBarClearance'
import {
  addDays,
  atTime,
  formatLongDate,
  formatTime,
  startOfToday,
  toIsoDate,
  toIsoDateTime,
} from '@/utils/dates'
import { API_BASE_URL } from '@/api'
import { theme } from '@/theme'
import { styles } from './BookHoursPage.styles'

export interface BookHoursPageProps {
  proId: string | undefined
  /** El oficio con el que venía mirando, si venía con uno */
  initialTrade?: string
  onBack: () => void
  onBooked: (jobId: string) => void
  onAddPaymentMethod: () => void
}

/**
 * Cuánto se puede contratar de una vez, en pasos de media hora.
 *
 * Media hora es lo más corto que admite el servidor, y ocho horas es una
 * jornada: por encima ya no es una cita, son varias.
 */
const DURATION_STEP = 30
const MIN_DURATION = 30
const MAX_DURATION = 8 * 60

/** «2 h», «1 h 30 min», «45 min» */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60

  if (hours === 0) return `${rest} min`
  if (rest === 0) return `${hours} h`
  return `${hours} h ${rest} min`
}

export function BookHoursPage({
  proId,
  initialTrade,
  onBack,
  onBooked,
  onAddPaymentMethod,
}: BookHoursPageProps) {
  const onScroll = useNavScrollHandler()
  const tabBarClearance = useTabBarClearance()

  const { data: pro, isPending, isError } = useProProfile(proId)
  const {
    data: methods,
    isPending: isPendingMethods,
    isError: isErrorMethods,
  } = usePaymentMethods()

  const [trade, setTrade] = useState<string | null>(initialTrade ?? null)
  const [durationMin, setDurationMin] = useState(60)
  const [day, setDay] = useState<Date>(startOfToday())
  /** El hueco elegido, en ISO. Nada queda reservado hasta pagar. */
  const [startAt, setStartAt] = useState<string | null>(null)
  const [city, setCity] = useState('')
  const [cityTouched, setCityTouched] = useState(false)
  const [address, setAddress] = useState<ApiGeocodeMatch | null>(null)
  /** Número, escalera, piso, puerta y código postal: lo que el
   * geocodificador no sabe y quien va necesita para llamar al timbre */
  const [detail, setDetail] = useState<AddressDetail>(EMPTY_ADDRESS_DETAIL)
  const [note, setNote] = useState('')

  /**
   * Solo los oficios que cobra por hora.
   *
   * Los de visita se contratan por la carta, a precio cerrado, y en ellos no
   * hay horas que elegir: ofrecerlos aquí sería preguntar cuánto rato quiere
   * de algo que no se vende por ratos.
   */
  const hourTrades = useMemo(
    () => (pro?.trades ?? []).filter((entry) => entry.hourlyRate != null),
    [pro],
  )

  const chosenTrade =
    hourTrades.find((entry) => entry.slug === trade)?.slug ?? hourTrades[0]?.slug ?? null
  const tradeEntry = hourTrades.find((entry) => entry.slug === chosenTrade)

  /*
    La ciudad se rellena una vez con la del profesional, como punto de partida,
    y a partir de ahí manda la dirección que se elija: el cliente puede estar
    contratando para otro sitio, y la del profesional solo era una suposición
    razonable mientras no hubiera nada mejor.
  */
  const cityValue = city === '' && !cityTouched ? (pro?.city ?? '') : city

  /**
   * Los huecos, mirando **desde el día elegido**.
   *
   * Se piden veinte y no los tres de por defecto: aquí se está eligiendo entre
   * las horas de un día, no leyendo tres alternativas. Y los que sobran del
   * día pedido son justo lo que hace falta para poder ofrecer «lo más pronto»
   * cuando ese día no le cabe nada.
   */
  const { data: freeSlots, isFetching: isLoadingSlots } = useFreeSlots(proId, {
    durationMin,
    from: toIsoDateTime(atTime(day, 0, 0)),
    limit: 20,
  })

  const dayKey = toIsoDate(day)
  const slotsOfDay = (freeSlots?.slots ?? []).filter(
    (slot) => toIsoDate(new Date(slot.startAt)) === dayKey,
  )
  /**
   * Lo primero que tiene después, para cuando el día pedido está lleno:
   * **el primer hueco de cada uno de los días siguientes**, no los primeros
   * huecos que haya.
   *
   * Los comienzos van en cuadrícula de media hora, así que los tres primeros
   * de una mañana libre son «jueves 09:00, jueves 09:30, jueves 10:00»: tres
   * formas de reservar el mismo rato, que además se leen como si fueran un
   * horario de 9 a 10. Uno por día dice lo que de verdad se pregunta —cuándo
   * es lo más pronto— y ofrece tres días en vez de media hora.
   */
  const nextSlots = (freeSlots?.slots ?? [])
    .filter((slot) => toIsoDate(new Date(slot.startAt)) !== dayKey)
    .filter(
      (slot, index, all) =>
        all.findIndex(
          (other) => toIsoDate(new Date(other.startAt)) === toIsoDate(new Date(slot.startAt)),
        ) === index,
    )
    .slice(0, 3)

  /**
   * Y qué tiene libre **ese día**, que es lo que de verdad se pregunta al ver
   * el «no».
   *
   * Solo se pide cuando hace falta: mandar a alguien a otro día porque le
   * faltan treinta minutos, teniendo el resto de la tarde libre, es la forma
   * más tonta de perder una reserva. Con esto se puede ofrecer lo que sí le
   * cabe sin salir del día.
   */
  const { data: dayRanges, isFetching: isLoadingRanges } = useDayRanges(
    proId,
    dayKey,
    !isLoadingSlots && slotsOfDay.length === 0,
  )

  /** Ese día no tiene nada libre: o no trabaja, o lo tiene ocupado entero */
  const closedThatDay = dayRanges !== undefined && dayRanges.ranges.length === 0

  /**
   * El rato más largo que le cabe ese día, redondeado al paso de media hora.
   * `null` cuando no hay nada que ofrecer: o no tiene sitio, o ya cabe lo que
   * se pidió.
   */
  const shorter =
    dayRanges && dayRanges.longestMinutes >= MIN_DURATION && dayRanges.longestMinutes < durationMin
      ? Math.min(
          MAX_DURATION,
          Math.floor(dayRanges.longestMinutes / DURATION_STEP) * DURATION_STEP,
        )
      : null

  const {
    data: quote,
    isPending: isQuoting,
    error: quoteError,
  } = useHoursQuote(
    proId,
    chosenTrade && startAt ? { tradeSlug: chosenTrade, startAt, durationMin } : null,
  )

  const { book, isBooking, formError, reset } = useBookHours(proId)

  const method = methods?.[0] ?? null

  const MIN_CITY = 2

  /**
   * Lo que falta para poder reservar, cada regla con su nombre.
   *
   * Se dice debajo del botón en vez de dejarlo apagado y callado: un botón que
   * no se puede pulsar y no explica por qué es un callejón sin salida, y ya ha
   * pasado dos veces en esta app.
   */
  const missing = [
    chosenTrade === null && 'el oficio',
    startAt === null && 'la hora',
    cityValue.trim().length < MIN_CITY && 'la ciudad',
    /*
      La que más despista: el campo se ve lleno y por dentro está a nulo,
      porque `address` solo se rellena al **elegir una sugerencia**.
    */
    address === null && 'la dirección (elígela de las sugerencias)',
    address !== null && detail.number.trim() === '' && 'el número de la calle',
    address !== null && !isPostcode(detail.postcode) && 'el código postal',
    method === null && 'una tarjeta guardada',
    startAt !== null && quote === undefined && 'saber el precio',
  ].filter((entry): entry is string => typeof entry === 'string')

  const canBook = missing.length === 0 && !isBooking

  /** Cambiar de rato o de día invalida el hueco: era de la otra búsqueda */
  const changeDuration = (value: string) => {
    setDurationMin(Number(value))
    setStartAt(null)
  }

  const changeDay = (value: Date | null) => {
    if (!value) return
    setDay(value)
    setStartAt(null)
  }

  const handleBook = async () => {
    reset()
    if (!chosenTrade || !startAt || !method) return

    const booked = await book({
      tradeSlug: chosenTrade,
      startAt,
      durationMin,
      city: cityValue.trim(),
      // La dirección entera en una línea, a la española: se lee de corrido
      addressLine: composeAddressLine(address!, detail),
      ...(note.trim() !== '' && { note: note.trim() }),
      paymentMethodId: method.id,
    })

    if (booked) onBooked(booked.jobId)
  }

  const header = (
    <View style={styles.header}>
      {/* La cabecera ocupa también la franja del sistema: la hora, en claro */}
      <StatusBar style="light" />
      <Pressable onPress={onBack} style={styles.back} accessibilityRole="button">
        <Text style={styles.backIcon}>←</Text>
      </Pressable>
      <Text style={styles.title}>Reservar horas</Text>
    </View>
  )

  if (isPending || isPendingMethods) {
    return (
      <View style={styles.screen} testID="book-hours-page">
        {header}
        <View style={styles.state} testID="book-hours-loading">
          <ActivityIndicator size="large" color={theme.colors.accent} />
        </View>
      </View>
    )
  }

  if (isError || !pro) {
    return (
      <View style={styles.screen} testID="book-hours-page">
        {header}
        <EmptyState
          title="No hemos podido cargar el perfil"
          message="Revisa tu conexión e inténtalo de nuevo."
          actions={[{ label: 'Volver', onPress: onBack, testID: 'book-hours-back' }]}
          testID="book-hours-error"
        />
      </View>
    )
  }

  /**
   * Sin ningún oficio por horas no hay nada que reservar aquí. Pasa al llegar
   * con un enlace viejo a alguien que ha cambiado su forma de cobrar: mejor
   * decirlo que enseñar un formulario que no puede terminar.
   */
  if (!tradeEntry) {
    return (
      <View style={styles.screen} testID="book-hours-page">
        {header}
        <EmptyState
          title="No cobra por horas"
          message={`${pro.name} cobra por visita. Vuelve a su ficha y contrata desde su carta, que lleva el precio cerrado.`}
          actions={[{ label: 'Volver', onPress: onBack, testID: 'book-hours-no-hourly' }]}
          testID="book-hours-empty"
        />
      </View>
    )
  }

  const durationOptions = Array.from(
    { length: (MAX_DURATION - MIN_DURATION) / DURATION_STEP + 1 },
    (_, index) => {
      const minutes = MIN_DURATION + index * DURATION_STEP
      return { value: String(minutes), label: formatDuration(minutes) }
    },
  )

  const tradeOptions = hourTrades.map((entry) => ({
    value: entry.slug,
    label: `${entry.label} · ${entry.hourlyRate} €/h`,
  }))

  return (
    <View style={styles.screen} testID="book-hours-page">
      {header}

      <FormScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={[styles.content, { paddingBottom: tabBarClearance }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/**
         * A quién se contrata y a cuánto, de un vistazo: la cara, el nombre y
         * la tarifa en la misma línea. El precio va al otro extremo y en
         * grande porque es lo que se está comprobando al llegar aquí —el
         * cliente viene de una ficha con diez cosas más— y porque todo lo que
         * viene debajo son multiplicaciones de ese número.
         */}
        <InfoCard testID="book-hours-who">
          <View style={styles.whoRow}>
            <Avatar
              uri={pro.avatarUrl ? `${API_BASE_URL}${pro.avatarUrl}` : null}
              size={48}
            />

            <Text style={styles.proName} numberOfLines={2}>
              {pro.employerName ?? pro.name}
            </Text>

            <Text style={styles.proRate}>{tradeEntry.hourlyRate} €/h</Text>
          </View>

          {/* El oficio debajo, que es de quién y de qué van esas horas */}
          <Text style={styles.trade}>
            {tradeEntry.label}
            {tradeEntry.minHours ? ` · mín. ${formatDuration(tradeEntry.minHours * 60)}` : ''}
            {pro.employerName ? ` · trabajo de ${pro.name}` : ''}
          </Text>

          {/*
            En naranja: no es un error ni una nota al pie, es lo que va a pasar
            con su dinero. El mismo naranja de "esto espera por ti" del resto
            de la app —el importe queda retenido esperando una respuesta—.
          */}
          <Text style={styles.whoNote}>
            {pro.employerName
              ? `Responde ${pro.employerName}, que es quien contrata y factura. El importe se retiene ahora y solo se cobra si aceptan.`
              : `Se retiene ahora en tu tarjeta y solo se te cobra cuando ${pro.name.split(' ')[0]} lo acepte. Si no puede o no contesta a tiempo, se suelta y no se te cobra nada.`}
          </Text>
        </InfoCard>

        {formError && <Text style={styles.formError}>{formError}</Text>}

        {tradeOptions.length > 1 && (
          <FormField
            label="¿Para qué le contratas?"
            hint="Cobra distinto según el oficio, así que conviene decirlo."
          >
            <Picker
              options={tradeOptions}
              value={chosenTrade}
              onChange={(value) => {
                setTrade(value)
                setStartAt(null)
              }}
              placeholder="Elige el oficio"
              title="Oficio"
              disabled={isBooking}
              testID="book-hours-trade"
            />
          </FormField>
        )}

        <FormField
          label="¿Cuánto tiempo le necesitas?"
          hint={
            tradeEntry.minHours && durationMin < tradeEntry.minHours * 60
              ? `Puedes pedir menos, pero cobra un mínimo de ${formatDuration(tradeEntry.minHours * 60)}.`
              : 'De aquí salen las horas que se cobran y los huecos donde le cabe.'
          }
        >
          <Picker
            options={durationOptions}
            value={String(durationMin)}
            onChange={changeDuration}
            title="Cuánto tiempo"
            disabled={isBooking}
            testID="book-hours-duration"
          />
        </FormField>

        <FormField label="¿Qué día?" hint={formatLongDate(day)}>
          <DateTimeField
            value={day}
            onChange={changeDay}
            mode="date"
            placeholder="Elegir día"
            minimumDate={startOfToday()}
            /* Un mes: es lo que mira el servidor hacia delante */
            maximumDate={addDays(startOfToday(), 31)}
            disabled={isBooking}
            testID="book-hours-day"
          />
        </FormField>

        {/**
         * Las horas que tiene libres ese día para ese rato. No es un reloj
         * abierto: son los ratos donde de verdad cabe lo que se ha pedido.
         */}
        {/*
          La pista solo cuando hay algo que elegir. Debajo de un «ese día no
          trabaja», «sus huecos libres de 1 h ese día» dice lo contrario de lo
          que se acaba de leer.
        */}
        <FormField
          label="¿A qué hora empieza?"
          {...(slotsOfDay.length > 0 && {
            hint: `Cada hora es el comienzo de un rato de ${formatDuration(durationMin)}.`,
          })}
        >
          {isLoadingSlots ? (
            <View style={styles.quoting} testID="book-hours-slots-loading">
              <ActivityIndicator color={theme.colors.accent} />
            </View>
          ) : slotsOfDay.length > 0 ? (
            <View style={styles.slots} testID="book-hours-slots">
              {slotsOfDay.map((slot) => {
                const chosen = slot.startAt === startAt

                return (
                  <Pressable
                    key={slot.startAt}
                    onPress={() => setStartAt(slot.startAt)}
                    disabled={isBooking}
                    accessibilityRole="button"
                    accessibilityState={{ selected: chosen }}
                    style={[styles.slot, chosen && styles.slotChosen]}
                    testID={`book-hours-slot-${slot.startAt}`}
                  >
                    <Text style={[styles.slotText, chosen && styles.slotTextChosen]}>
                      {formatTime(new Date(slot.startAt))}
                    </Text>
                  </Pressable>
                )
              })}
            </View>
          ) : (
            <View testID="book-hours-no-slots">
              {/*
                Uno solo. «No le queda hueco de 3 h» y «ese día no trabaja»
                juntos se leen como dos motivos distintos para lo mismo, y el
                segundo contradice al primero: si no trabaja, no es que le
                falten tres horas.
              */}
              <Text style={styles.slotsEmpty}>
                {closedThatDay
                  ? 'Ese día no trabaja.'
                  : `Ese día no le queda hueco de ${formatDuration(durationMin)}.`}
              </Text>

              {/*
                Y debajo, lo que sí tiene libre ese día. Es lo primero que se
                pregunta al leer el «no», y sin ello la única salida es probar
                días a ciegas: se pierde una reserva por media hora teniendo la
                tarde entera libre.
              */}
              {isLoadingRanges ? (
                <View style={styles.quoting}>
                  <ActivityIndicator color={theme.colors.accent} />
                </View>
              ) : dayRanges && dayRanges.ranges.length > 0 ? (
                <View style={styles.ranges} testID="book-hours-ranges">
                  <Text style={styles.nextDayLabel}>Ese día tiene libre:</Text>

                  {dayRanges.ranges.map((range) => (
                    <Text key={range.startAt} style={styles.rangeText}>
                      {formatTime(new Date(range.startAt))} –{' '}
                      {formatTime(new Date(range.endAt))} ·{' '}
                      {formatDuration(range.minutes)}
                    </Text>
                  ))}

                  {shorter !== null && (
                    <Button
                      variant="secondary"
                      onPress={() => changeDuration(String(shorter))}
                      style={styles.suggest}
                      disabled={isBooking}
                      testID="book-hours-shorter"
                    >
                      Ver sus horas de {formatDuration(shorter)} ese día
                    </Button>
                  )}
                </View>
              ) : null}

              {/*
                Un «no» a secas deja al cliente buscando a ciegas por el
                calendario. Lo que tiene libre después ya viene en la misma
                respuesta, así que se ofrece: se toca y se cambia de día.
              */}
              {nextSlots.length > 0 && (
                <View style={styles.nextDay}>
                  <Text style={styles.nextDayLabel}>Lo más pronto que puede:</Text>
                  <View style={styles.slots}>
                    {nextSlots.map((slot) => {
                      const when = new Date(slot.startAt)

                      return (
                        <Pressable
                          key={slot.startAt}
                          onPress={() => {
                            setDay(when)
                            setStartAt(slot.startAt)
                          }}
                          disabled={isBooking}
                          accessibilityRole="button"
                          style={styles.slot}
                          testID={`book-hours-next-${slot.startAt}`}
                        >
                          {/*
                            Con la hora de fin: «jueves, 3 de septiembre,
                            09:00» a secas no dice cuánto dura, y tres de esas
                            seguidas se leen como un horario en vez de como
                            tres opciones.
                          */}
                          <Text style={styles.slotText}>
                            {formatLongDate(when)}, {formatTime(when)} –{' '}
                            {formatTime(new Date(slot.endAt))}
                          </Text>
                        </Pressable>
                      )
                    })}
                  </View>
                </View>
              )}
            </View>
          )}
        </FormField>

        <FormField label="Ciudad">
          <Input
            value={cityValue}
            onChangeText={(value) => {
              setCityTouched(true)
              setCity(value)
            }}
            placeholder="Ej. Madrid"
            autoCapitalize="words"
            editable={!isBooking}
            testID="book-hours-city"
          />
        </FormField>

        <FormField
          label="Dirección"
          hint="Elígela de las sugerencias. Solo la verá quien acabe haciendo el trabajo."
        >
          <AddressInput
            value={address}
            onChange={(chosen) => {
              setAddress(chosen)
              if (chosen?.city && !cityTouched) setCity(chosen.city)
            }}
            placeholder="Ej. Calle Mayor 14"
            editable={!isBooking}
            detail={detail}
            onDetailChange={setDetail}
            testID="book-hours-address"
          />
        </FormField>

        <FormField
          label="¿Qué hay que hacer?"
          hint="Opcional. Se contratan horas de un oficio; quien quiera precisar, precisa."
        >
          <Input
            value={note}
            onChangeText={setNote}
            placeholder="Ej. Cambiar tres enchufes y revisar el cuadro."
            multiline
            numberOfLines={3}
            editable={!isBooking}
            testID="book-hours-note"
          />
        </FormField>

        {/**
         * El desglose, tal y como lo manda el servidor: es el mismo que se va
         * a cobrar. Aquí no se suma nada —el mínimo del oficio, los recargos y
         * el calendario de festivos viven allí— porque rehacer la cuenta
         * acabaría enseñando un total distinto del que se cobra.
         */}
        {startAt && (
          <InfoCard testID="book-hours-quote">
            {isQuoting ? (
              <View style={styles.quoting}>
                <ActivityIndicator color={theme.colors.accent} />
              </View>
            ) : quote ? (
              <>
                {/*
                  Cuándo, escrito entero y arriba del todo. Es lo que se está
                  comprando y lo único que no se puede deducir del desglose:
                  abajo pone «3 h × 75 €/h», que dice cuánto dura pero no
                  cuándo empieza ni cuándo se va.
                */}
                <Text style={styles.when} testID="book-hours-when">
                  {formatLongDate(new Date(startAt))}, de{' '}
                  {formatTime(new Date(startAt))} a{' '}
                  {formatTime(new Date(new Date(startAt).getTime() + durationMin * 60_000))}
                </Text>

                <View style={styles.line}>
                  <Text style={styles.lineLabel}>
                    {formatDuration(Math.round(quote.billedHours * 60))} × {quote.hourlyRate} €/h
                  </Text>
                  <Money amount={quote.base} style={styles.lineAmount} />
                </View>

                {quote.minApplied && (
                  <Text style={styles.minNote}>
                    Pides {formatDuration(Math.round(quote.requestedHours * 60))} y se cobran{' '}
                    {formatDuration(Math.round(quote.billedHours * 60))}: es el mínimo de este
                    oficio.
                  </Text>
                )}

                <View style={styles.line}>
                  <Text style={styles.lineLabel}>
                    {quote.surcharge
                      ? `${quote.surcharge.label} +${quote.surcharge.percent} %`
                      : 'Día laborable'}
                  </Text>
                  {quote.surcharge ? (
                    <Money amount={quote.surcharge.amount} style={styles.lineAmount} />
                  ) : (
                    <Text style={styles.lineFree}>sin recargo</Text>
                  )}
                </View>

                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Money
                    amount={quote.total}
                    style={styles.total}
                    testID="book-hours-total"
                  />
                </View>

                {/* Las dos frases las escribe el servidor: son las condiciones */}
                <Text style={styles.terms}>
                  {quote.terms.hold} {quote.terms.freeCancellation}
                </Text>
              </>
            ) : (
              <Text style={styles.formError} testID="book-hours-quote-error">
                {quoteError instanceof Error
                  ? quoteError.message
                  : 'No hemos podido calcular el precio de esa hora.'}
              </Text>
            )}
          </InfoCard>
        )}

        {isErrorMethods || !method ? (
          <InfoCard style={styles.paymentCard} testID="book-hours-no-method">
            <Text style={styles.paymentTitle}>Necesitas una tarjeta guardada</Text>
            <Text style={styles.paymentBody}>
              El importe se retiene al reservar, así que hace falta un método de pago
              guardado.
            </Text>
            <Button
              variant="secondary"
              onPress={onAddPaymentMethod}
              testID="book-hours-add-method"
            >
              Añadir tarjeta
            </Button>
          </InfoCard>
        ) : (
          <InfoCard style={styles.paymentCard} testID="book-hours-method">
            <Text style={styles.paymentTitle}>Se retendrá en</Text>
            <Text style={styles.paymentBody}>
              {method.brand} •••• {method.last4}
            </Text>
          </InfoCard>
        )}

        <Button
          fullWidth
          loading={isBooking}
          disabled={!canBook}
          onPress={() => void handleBook()}
          style={styles.submit}
          testID="book-hours-submit"
        >
          {quote ? `Reservar por ${formatAmount(quote.total)} €` : 'Reservar'}
        </Button>

        {/**
         * Qué falta, debajo del botón que no se puede pulsar. Es donde se mira
         * cuando no pasa nada al tocarlo.
         */}
        {!canBook && !isBooking && (
          <Text style={styles.missing} testID="book-hours-missing">
            {missing.length === 1
              ? `Falta ${missing[0]}.`
              : `Faltan ${missing.slice(0, -1).join(', ')} y ${missing[missing.length - 1]}.`}
          </Text>
        )}
      </FormScrollView>
    </View>
  )
}
