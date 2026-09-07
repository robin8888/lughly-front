/**
 * RecurringBookingPage
 * Contratar a alguien de forma fija (`CICLOS_DE_CONTRATACION.md` §F1–F3).
 *
 * «Los lunes, miércoles y viernes de 10 a 13» son hoy tres encargos nuevos cada
 * semana —buscar, rellenar, elegir hueco, pagar—: ciento cuarenta veces al año
 * para un acuerdo que se toma una vez.
 *
 * ## Dos pasos en una pantalla, y en este orden
 *
 * Primero se elige —qué días, a qué hora, cuánto y desde cuándo— y después se
 * **repasa**, con la respuesta del servidor día a día. El repaso no es un
 * resumen de cortesía: es la única regla de §F0 puesta en pantalla —**en ningún
 * momento se le dice al cliente que tiene un día que el profesional no
 * tiene**—, y es donde se ve qué se cae y qué se puede mover.
 *
 * ## Y un día que choca no se tira: se ofrece otra hora
 *
 * Que esté pillado a las diez el 6 de octubre no quiere decir que ese día no
 * pueda; quiere decir que no puede *a esa hora*. Saltárselo sin preguntar le
 * quita al cliente una limpieza que sí existía. Por eso los días con `busy` u
 * `outside` traen las otras horas de ese mismo día, y los de vacaciones no
 * traen nada: no hay nada que ofrecer.
 *
 * ## Una sola hora para todos los días, a propósito
 *
 * «Los lunes tres horas y los viernes dos» dobla el modelo y la pantalla, y
 * quien lo necesite contrata dos fijos sobre la misma persona, que es
 * exactamente lo mismo y no cuesta nada.
 */

import { useMemo, useState } from 'react'
import { View, Text, Pressable, Alert } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { FormScrollView } from '@/components/templates/FormScrollView'
import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/atoms/Input'
import { formatAmount } from '@/components/atoms/Money'
import { AddressInput } from '@/components/molecules/AddressInput'
import { EmptyState } from '@/components/molecules/EmptyState'
import { FormField } from '@/components/molecules/FormField'
import { InfoCard } from '@/components/molecules/InfoCard'
import { Picker } from '@/components/molecules/Picker'
import { useProProfile } from '@/hooks/domain/useProProfile'
import { usePaymentMethods } from '@/hooks/domain/usePaymentMethods'
import { useRecurrenceCheck, useBookRecurring } from '@/hooks/domain/useRecurring'
import { useNavScrollHandler } from '@/hooks/ui/useCompactNav'
import { useTabBarClearance } from '@/hooks/ui/useTabBarClearance'
import type { ApiGeocodeMatch } from '@/api/geocode.api'
import {
  EMPTY_ADDRESS_DETAIL,
  composeAddressLine,
  isPostcode,
  type AddressDetail,
} from '@/utils/address'
import type { ApiRecurrenceDay, ApiRecurrenceMiss } from '@/api/pros.api'
import { WEEKDAY_NAMES, formatIsoDayLong } from '@/utils/dates'
import { theme } from '@/theme'
import { styles } from './RecurringBookingPage.styles'

/** Los botones de día, empezando en lunes: es como se lee una semana */
const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0]

const HOUR_OPTIONS = Array.from({ length: 27 }, (_, index) => {
  const minutes = 7 * 60 + index * 30
  const label = `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${minutes % 60 === 0 ? '00' : '30'}`

  return { value: label, label }
})

const DURATION_OPTIONS = [
  { value: '60', label: '1 hora' },
  { value: '90', label: '1 h 30' },
  { value: '120', label: '2 horas' },
  { value: '180', label: '3 horas' },
  { value: '240', label: '4 horas' },
  { value: '300', label: '5 horas' },
  { value: '480', label: '8 horas' },
]

/**
 * El motivo, en las palabras del cliente y **sin destapar la agenda de nadie**.
 *
 * «Ya tiene otro trabajo» y no con quién ni dónde: es la misma regla que en los
 * huecos libres, que se devuelven en negativo.
 */
const MISS_TEXT: Record<ApiRecurrenceMiss, string> = {
  busy: 'ya tiene otro trabajo a esa hora',
  outside: 'ese día no trabaja a esa hora',
  away: 'está de vacaciones o de baja',
  closed: 'ese día no trabaja',
  notice: 'es demasiado pronto para reservarlo',
}

/** "AAAA-MM-DD" de hoy, en la hora del móvil: es el suelo del selector */
function hoyIso(): string {
  const now = new Date()

  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

/** Los siete próximos lunes, martes… para elegir desde cuándo empieza */
function proximosDias(): { value: string; label: string }[] {
  const days: { value: string; label: string }[] = []
  const now = new Date()

  for (let index = 0; index < 21; index += 1) {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() + index)
    const iso = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`

    days.push({ value: iso, label: formatIsoDayLong(iso) })
  }

  return days
}

export interface RecurringBookingPageProps {
  proId: string | undefined
  tradeSlug: string
  onBack: () => void
  /** Contratado: a la ficha del trabajo, que es donde vive el contrato */
  onBooked: (jobId: string) => void
  /** A guardar una tarjeta, para quien no tiene ninguna */
  onAddPaymentMethod: () => void
}

export function RecurringBookingPage({
  proId,
  tradeSlug,
  onBack,
  onBooked,
  onAddPaymentMethod,
}: RecurringBookingPageProps) {
  const onScroll = useNavScrollHandler()
  const tabBarClearance = useTabBarClearance()

  const { data: pro, isPending, isError, refetch } = useProProfile(proId)
  const { data: methods } = usePaymentMethods()
  const { check, isChecking, result } = useRecurrenceCheck(proId)
  const { book, isBooking } = useBookRecurring(proId)

  const [weekdays, setWeekdays] = useState<number[]>([])
  const [from, setFrom] = useState('10:00')
  const [durationMin, setDurationMin] = useState('180')
  const [startsOn, setStartsOn] = useState(hoyIso())
  const [address, setAddress] = useState<ApiGeocodeMatch | null>(null)
  /**
   * Número, escalera, piso, puerta y código postal: lo que el geocodificador no
   * sabe y quien va necesita para llamar al timbre. En un fijo importa más que
   * en ningún sitio —se va a repetir cada semana durante meses—.
   */
  const [detail, setDetail] = useState<AddressDetail>(EMPTY_ADDRESS_DETAIL)
  const [note, setNote] = useState('')

  /**
   * Lo que el cliente ha decidido sobre los días que no caben a la hora
   * pedida: otra hora de ese mismo día, o `null` para apartarlo.
   *
   * Empieza vacío, y eso significa «déjalo fuera»: no se mueve nada por su
   * cuenta —cambiarle la hora de una limpieza sin decírselo sería justo lo que
   * esta pantalla viene a evitar—.
   */
  const [moves, setMoves] = useState<Record<string, string | null>>({})

  const card = methods?.[0] ?? null
  const dias = result?.days ?? []

  const toggleDay = (weekday: number) =>
    setWeekdays((actuales) =>
      actuales.includes(weekday)
        ? actuales.filter((day) => day !== weekday)
        : [...actuales, weekday],
    )

  /** Cuántas sesiones quedarían con lo que hay elegido ahora mismo */
  const cuentan = useMemo(
    () =>
      dias.filter((day) => {
        const move = moves[day.date]

        if (move === null) return false
        if (move !== undefined) return true

        return day.fits
      }).length,
    [dias, moves],
  )

  const repasar = () => {
    if (weekdays.length === 0) return

    void (async () => {
      const { ok, error } = await check({
        weekdays,
        from,
        durationMin: Number(durationMin),
        startsOn,
      })

      if (!ok) {
        Alert.alert(
          'No hemos podido mirar su agenda',
          error ?? 'Inténtalo de nuevo en un momento.',
        )
      }

      // Lo elegido antes deja de valer: es de otra hora o de otros días
      setMoves({})
    })()
  }

  /** Sin número no hay portal al que ir, y sin código postal tampoco */
  const direccionLista =
    address !== null && detail.number.trim() !== '' && isPostcode(detail.postcode)

  const contratar = () => {
    if (!card || !address || !direccionLista || cuentan === 0) return

    void (async () => {
      const { ok, result: booked, error } = await book({
        tradeSlug,
        weekdays,
        from,
        durationMin: Number(durationMin),
        startsOn,
        moves: Object.entries(moves).map(([date, hora]) => ({ date, from: hora })),
        // La dirección entera en una línea, a la española: se lee de corrido
        addressLine: composeAddressLine(address, detail),
        city: address.city ?? '',
        ...(note.trim() && { note: note.trim() }),
        paymentMethodId: card.id,
      })

      if (!ok || !booked) {
        Alert.alert(
          'No se ha podido contratar',
          error ?? 'Inténtalo de nuevo en un momento.',
        )
        return
      }

      onBooked(booked.jobId)
    })()
  }

  const header = (
    <View style={styles.header}>
      <StatusBar style="light" />
      <Pressable onPress={onBack} style={styles.back} accessibilityRole="button">
        <Text style={styles.backIcon}>←</Text>
      </Pressable>
      <Text style={styles.title} numberOfLines={1}>
        Fijo cada semana
      </Text>
    </View>
  )

  if (isPending || isError || !pro) {
    return (
      <View style={styles.screen} testID="recurring-page">
        {header}
        <EmptyState
          title={isPending ? 'Un momento' : 'No hemos podido cargar su ficha'}
          message={
            isPending
              ? 'Cargando…'
              : 'Revisa tu conexión e inténtalo de nuevo.'
          }
          actions={
            isPending
              ? []
              : [
                  {
                    label: 'Reintentar',
                    onPress: () => void refetch(),
                    testID: 'recurring-retry',
                  },
                ]
          }
          testID="recurring-loading"
        />
      </View>
    )
  }

  return (
    <View style={styles.screen} testID="recurring-page">
      {header}

      <FormScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={[styles.content, { paddingBottom: tabBarClearance }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <InfoCard variant="accent">
          <Text style={styles.intro}>
            {`Los mismos días todas las semanas con ${pro.name.split(' ')[0]}, sin fecha de fin. Solo pagas los días que se trabajan, y cancelas un día suelto o el contrato entero cuando quieras.`}
          </Text>
        </InfoCard>

        <FormField label="¿Qué días?">
          <View style={styles.weekdays}>
            {WEEKDAY_ORDER.map((weekday) => {
              const on = weekdays.includes(weekday)

              return (
                <Pressable
                  key={weekday}
                  onPress={() => toggleDay(weekday)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: on }}
                  accessibilityLabel={WEEKDAY_NAMES[weekday]}
                  style={[styles.weekday, on && styles.weekdayOn]}
                  testID={`recurring-weekday-${weekday}`}
                >
                  <Text style={[styles.weekdayText, on && styles.weekdayTextOn]}>
                    {/* La inicial, en mayúscula: X para miércoles, como se escribe */}
                    {weekday === 3 ? 'X' : WEEKDAY_NAMES[weekday]![0]!.toUpperCase()}
                  </Text>
                </Pressable>
              )
            })}
          </View>
        </FormField>

        <View style={styles.row}>
          <View style={styles.rowItem}>
            <FormField label="¿A qué hora?">
              <Picker
                options={HOUR_OPTIONS}
                value={from}
                onChange={setFrom}
                title="Hora de empezar"
                testID="recurring-from"
              />
            </FormField>
          </View>
          <View style={styles.rowItem}>
            <FormField label="¿Cuánto?">
              <Picker
                options={DURATION_OPTIONS}
                value={durationMin}
                onChange={setDurationMin}
                title="Duración de cada sesión"
                testID="recurring-duration"
              />
            </FormField>
          </View>
        </View>

        <FormField label="¿Desde?">
          <Picker
            options={proximosDias()}
            value={startsOn}
            onChange={setStartsOn}
            title="Primer día"
            testID="recurring-starts-on"
          />
        </FormField>

        <Button
          fullWidth
          variant="secondary"
          onPress={repasar}
          loading={isChecking}
          disabled={weekdays.length === 0}
          style={styles.check}
          testID="recurring-check"
        >
          {result ? 'Volver a mirar su agenda' : 'Ver qué días puede'}
        </Button>

        {/*
          El repaso: la pantalla de §F2. No es un resumen de cortesía, es la
          única regla de §F0 puesta delante — lo que encaja, lo que no y por
          qué, y qué se puede mover.
        */}
        {result && (
          <View testID="recurring-review">
            <InfoCard style={styles.summary}>
              <Text style={styles.summaryTitle}>
                {cuentan === 0
                  ? 'No queda ningún día'
                  : `${cuentan} ${cuentan === 1 ? 'día confirmado' : 'días confirmados'}`}
              </Text>
              {result.pricePerSession !== null && (
                <Text style={styles.summaryBody}>
                  {`${formatAmount(result.pricePerSession)} € por día`}
                  {result.hourlyRate !== null
                    ? ` (${Number(durationMin) / 60} h × ${formatAmount(result.hourlyRate)} €/h)`
                    : ''}
                </Text>
              )}
              <Text style={styles.summaryNote}>
                Se retiene el importe de cada día 24 h antes. Hasta entonces,
                cancelar ese día no cuesta nada.
              </Text>
            </InfoCard>

            {dias
              .filter((day) => !day.fits)
              .map((day) => (
                <DiaQueNoCabe
                  key={day.date}
                  day={day}
                  chosen={moves[day.date]}
                  onChoose={(hora) =>
                    setMoves((actuales) => ({ ...actuales, [day.date]: hora }))
                  }
                />
              ))}
          </View>
        )}

        {/*
          La dirección y la tarjeta, al final: no hacen falta para mirar la
          agenda, y pedirlas antes convierte una pregunta en un formulario.
        */}
        {result && cuentan > 0 && (
          <>
            <FormField label="¿Dónde?">
              <AddressInput
                value={address}
                onChange={setAddress}
                detail={detail}
                onDetailChange={setDetail}
                testID="recurring-address"
              />
            </FormField>

            <FormField label="Algo que deba saber (opcional)">
              <Input
                value={note}
                onChangeText={setNote}
                placeholder="Ej. El portal se abre con llave, la dejo en el buzón"
                multiline
                numberOfLines={3}
                testID="recurring-note"
              />
            </FormField>

            {card ? (
              <Button
                fullWidth
                onPress={contratar}
                loading={isBooking}
                disabled={!direccionLista}
                style={styles.book}
                testID="recurring-book"
              >
                Contratar
              </Button>
            ) : (
              <Button
                fullWidth
                onPress={onAddPaymentMethod}
                style={styles.book}
                testID="recurring-add-card"
              >
                Guardar una tarjeta
              </Button>
            )}

            <Text style={styles.footnote}>
              No se te cobra nada ahora. El primer importe se retiene 24 h antes
              del primer día, y solo si {pro.name.split(' ')[0]} acepta.
            </Text>
          </>
        )}
      </FormScrollView>
    </View>
  )
}

/**
 * Un día que no cabe a la hora pedida.
 *
 * Los dos avisos no son el mismo aviso y no se enseñan igual: uno tiene algo
 * que ofrecer —otras horas de ese mismo día— y el otro no. Enseñarlos con la
 * misma cara haría que el cliente buscara una salida donde no la hay.
 */
function DiaQueNoCabe({
  day,
  chosen,
  onChoose,
}: {
  day: ApiRecurrenceDay
  /** Lo elegido: una hora, `null` para apartarlo, o nada todavía */
  chosen: string | null | undefined
  onChoose: (hora: string | null) => void
}) {
  return (
    <InfoCard style={styles.missCard} testID={`recurring-miss-${day.date}`}>
      <Text style={styles.missDay}>{formatIsoDayLong(day.date)}</Text>
      <Text style={styles.missReason}>
        {day.miss ? MISS_TEXT[day.miss] : 'no cabe'}
      </Text>

      {day.alternatives.length > 0 ? (
        <>
          <Text style={styles.missOffer}>Ese día sí puede:</Text>

          {day.alternatives.map((alternative) => {
            const on = chosen === alternative.from

            return (
              <Pressable
                key={alternative.from}
                onPress={() => onChoose(alternative.from)}
                accessibilityRole="radio"
                accessibilityState={{ selected: on }}
                style={[styles.option, on && styles.optionOn]}
                testID={`recurring-alt-${day.date}-${alternative.from}`}
              >
                <Text style={[styles.optionText, on && styles.optionTextOn]}>
                  {`${alternative.from} – ${alternative.to}`}
                </Text>
              </Pressable>
            )
          })}

          <Pressable
            onPress={() => onChoose(null)}
            accessibilityRole="radio"
            accessibilityState={{ selected: chosen === null }}
            style={[styles.option, chosen === null && styles.optionOn]}
            testID={`recurring-skip-${day.date}`}
          >
            <Text style={[styles.optionText, chosen === null && styles.optionTextOn]}>
              No vayas ese día
            </Text>
          </Pressable>
        </>
      ) : (
        /*
          Sin nada que ofrecer, el día se salta y se dice. Bloquear el contrato
          entero por un choque que cae dentro de cinco semanas dejaría casi
          todas las series sin poder contratarse.
        */
        <Text style={styles.missSkipped}>
          Ese día no se contrata y no se cobra.
        </Text>
      )}
    </InfoCard>
  )
}
