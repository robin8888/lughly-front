/**
 * HolidaysPage
 * Los festivos del año, los de la comunidad donde está su base.
 *
 * El calendario sale de la resolución que el BOE publica cada octubre. **Se le
 * aplica el de su base y no el del sitio del trabajo**: es el que puede saber
 * por adelantado, y cuando pone sus precios todavía no hay ningún trabajo.
 *
 * No es la pantalla de ausencias aunque se le parezca: un festivo es un día en
 * el que se cobra más, no un día en el que no se trabaja. Para no trabajarlo
 * están las ausencias, y esta pantalla lo dice cuando el festivo cae dentro de
 * unas.
 *
 * **Faltan los festivos locales** —los dos que pone cada ayuntamiento— y el de
 * cada isla en Canarias. No los publica el BOE, así que se avisa en vez de
 * dejar creer que la lista está completa.
 */

import { useState } from 'react'
import { View, Text, ActivityIndicator, Pressable, Alert } from 'react-native'
import Animated from 'react-native-reanimated'
import { Switch } from '@/components/atoms/Switch'
import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/atoms/Input'
import { FormField } from '@/components/molecules/FormField'
import { DateTimeField } from '@/components/molecules/DateTimeField'
import { EmptyState } from '@/components/molecules/EmptyState'
import { InfoCard } from '@/components/molecules/InfoCard'
import type { ApiHoliday } from '@/api/pros.api'
import {
  useMyHolidays,
  useSetHolidayChoice,
  useLocalHolidays,
} from '@/hooks/domain/useMyHolidays'
import { useNavScrollHandler } from '@/hooks/ui/useCompactNav'
import { formatDate, parseIsoDate, toIsoDate } from '@/utils/dates'
import { theme } from '@/theme'
import { styles } from './HolidaysPage.styles'

/** Un día en texto, como se lee: "8 de diciembre de 2026" */
function readable(day: string): string {
  const date = parseIsoDate(day)
  return date ? formatDate(date) : day
}

/** De dónde viene la fiesta. Las tres se trabajan igual; cambia de quién es. */
function origin(kind: ApiHoliday['kind']): string {
  if (kind === 'local') return 'De tu municipio'
  return kind === 'regional' ? 'De tu comunidad' : 'De toda España'
}

export interface HolidaysPageProps {
  onBack: () => void
  /** Para el que todavía no tiene base: sin ella no hay calendario que enseñar */
  onSetZone: () => void
  /** Cuando los lleva la empresa: los festivos son los de ese trabajador */
  employeeId?: string
  employeeName?: string
}

export function HolidaysPage({
  onBack,
  onSetZone,
  employeeId,
  employeeName,
}: HolidaysPageProps) {
  const onScroll = useNavScrollHandler()

  const isForEmployee = employeeId !== undefined
  const year = new Date().getFullYear()

  /**
   * Un empleado **sí** ve su calendario, aunque no pueda tocarlo: son los días
   * que va a trabajar. Lo que se apaga es el interruptor, con el motivo al
   * lado; esconderle la lista sería peor.
   */
  const { data, isPending, isError, refetch } = useMyHolidays(year, true, employeeId)
  const { choose, isSaving } = useSetHolidayChoice(year, employeeId)
  const { add, remove, isWorking } = useLocalHolidays(year)

  /**
   * Los del municipio se ponen a mano, así que hace falta un sitio donde
   * escribirlos. Cerrado por defecto: la pantalla es para consultar el
   * calendario, y añadir es lo que se hace una vez al año.
   */
  const [adding, setAdding] = useState(false)
  const [newDate, setNewDate] = useState(() => new Date())
  const [newName, setNewName] = useState('')

  const saveLocal = async () => {
    const { ok, error } = await add(toIsoDate(newDate), newName.trim())

    if (!ok) {
      Alert.alert('No se ha podido añadir', error ?? 'Inténtalo de nuevo.')
      return
    }

    setNewName('')
    setAdding(false)
  }

  const confirmRemove = (date: string, name: string) => {
    Alert.alert('¿Quitar este festivo?', `Dejará de contar como festivo ${name}.`, [
      { text: 'Volver', style: 'cancel' },
      {
        text: 'Quitar',
        style: 'destructive',
        onPress: () => void remove(date),
      },
    ])
  }

  const canDecide = data ? isForEmployee || !data.setByEmployer : false

  const header = (
    <View style={styles.header}>
      <Pressable onPress={onBack} style={styles.back} accessibilityRole="button">
        <Text style={styles.backIcon}>←</Text>
      </Pressable>
      <Text style={styles.title} numberOfLines={1}>
        {isForEmployee ? (employeeName ?? 'Sus festivos') : 'Mis festivos'}
      </Text>
    </View>
  )

  if (isPending) {
    return (
      <View style={styles.screen} testID="holidays-page">
        {header}
        <View style={styles.state} testID="holidays-loading">
          <ActivityIndicator size="large" color={theme.colors.accent} />
        </View>
      </View>
    )
  }

  if (isError || !data) {
    return (
      <View style={styles.screen} testID="holidays-page">
        {header}
        <EmptyState
          title="No hemos podido cargar el calendario"
          message="Revisa tu conexión e inténtalo de nuevo."
          actions={[
            {
              label: 'Reintentar',
              onPress: () => void refetch(),
              testID: 'holidays-retry',
            },
          ]}
          testID="holidays-error"
        />
      </View>
    )
  }

  /**
   * Sin base no se sabe de qué comunidad es, y los festivos de Andalucía no
   * son los de Cataluña. Se manda a ponerla en vez de enseñar una lista vacía,
   * que se leería como un año sin fiestas.
   */
  if (data.region === null) {
    return (
      <View style={styles.screen} testID="holidays-page">
        {header}
        <EmptyState
          title={isForEmployee ? 'Le falta la zona' : 'Te falta la zona'}
          message={
            isForEmployee
              ? 'Los festivos son los de la comunidad donde tenga la base, y todavía no la tiene puesta. Ponsela y aparecerán aquí.'
              : 'Los festivos no son los mismos en toda España: dependen de la comunidad donde tengas la base. Pon tu zona de trabajo y aparecerán aquí.'
          }
          actions={[
            {
              label: isForEmployee ? 'Poner su zona' : 'Poner mi zona',
              onPress: onSetZone,
              testID: 'holidays-set-zone',
            },
          ]}
          testID="holidays-no-region"
        />
      </View>
    )
  }

  /**
   * Que no haya calendario de un año no es que no haya fiestas: es que el BOE
   * todavía no lo ha publicado. Lo hace cada octubre, así que esto se ve de
   * verdad los últimos meses del año anterior.
   */
  if (!data.known) {
    return (
      <View style={styles.screen} testID="holidays-page">
        {header}
        <EmptyState
          title={`El calendario de ${year} todavía no está`}
          message="El BOE publica las fiestas de cada año en octubre del anterior. En cuanto salga, aparecerán aquí."
          testID="holidays-unknown-year"
        />
      </View>
    )
  }

  return (
    <View style={styles.screen} testID="holidays-page">
      {header}

      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <InfoCard variant="accent">
          <Text style={styles.intro}>
            Los festivos de {data.regionName} en {year}, que son los que te
            tocan por tener ahí la base. El recargo que se aplica es el de
            domingos y festivos.
          </Text>

          <Text style={styles.note}>
            Los dos festivos de tu municipio no salen del BOE —los pone tu
            ayuntamiento—, así que los añades tú aquí abajo y cuentan igual que
            los demás.
          </Text>
        </InfoCard>

        {!canDecide && (
          <Text style={styles.locked} testID="holidays-employee">
            Los recargos los pone la empresa para la que trabajas, así que estos
            días no los decides tú. Lo que te corresponda por trabajarlos va en
            tu nómina.
          </Text>
        )}

        <View style={styles.list}>
          {data.holidays.map((holiday) => (
            <InfoCard key={holiday.date} style={styles.holiday}>
              <Text style={styles.day}>{readable(holiday.date)}</Text>
              <Text style={styles.name}>{holiday.name}</Text>

              <View style={styles.tags}>
                <Text
                  style={[
                    styles.tag,
                    holiday.kind === 'local' && styles.tagLocal,
                  ]}
                >
                  {origin(holiday.kind)}
                </Text>
                {holiday.away && (
                  <Text style={[styles.tag, styles.tagAway]}>
                    {isForEmployee ? 'No está' : 'Estás fuera'}
                  </Text>
                )}
                {!holiday.away && holiday.worksThatDay && (
                  <Text style={styles.tag}>
                    {isForEmployee ? 'Tiene horario' : 'Tienes horario'}
                  </Text>
                )}
              </View>

              {/* Los suyos se quitan; los del BOE no, que no son suyos */}
              {holiday.kind === 'local' && canDecide && (
                <Pressable
                  onPress={() => confirmRemove(holiday.date, holiday.name)}
                  disabled={isWorking}
                  accessibilityRole="button"
                  style={styles.removeLocal}
                  testID={`holidays-remove-${holiday.date}`}
                >
                  <Text style={styles.removeLocalText}>Quitar este festivo</Text>
                </Pressable>
              )}

              <View style={styles.choice}>
                <Text style={styles.choiceLabel}>
                  {holiday.percent === 0
                    ? 'Sin recargo puesto'
                    : `Cobrar el recargo (+${holiday.percent}%)`}
                </Text>
                <Switch
                  value={holiday.appliesSurcharge}
                  onValueChange={(value) => void choose(holiday.date, value)}
                  disabled={!canDecide || isSaving || holiday.percent === 0}
                  testID={`holidays-switch-${holiday.date}`}
                />
              </View>
            </InfoCard>
          ))}
        </View>

        {/*
          Añadir los del municipio. Al final y plegado: la pantalla se abre
          para consultar el calendario, y esto se hace una vez al año.
        */}
        {canDecide && (
          <View style={styles.addBlock}>
            {adding ? (
              <>
                <FormField label="Qué día es">
                  <DateTimeField
                    value={newDate}
                    onChange={setNewDate}
                    mode="date"
                    testID="holidays-new-date"
                  />
                </FormField>

                <FormField label="Qué se celebra">
                  <Input
                    value={newName}
                    onChangeText={setNewName}
                    placeholder="San Isidro, la patrona…"
                    maxLength={60}
                    testID="holidays-new-name"
                  />
                </FormField>

                <Button
                  fullWidth
                  onPress={() => void saveLocal()}
                  disabled={newName.trim().length < 2 || isWorking}
                  testID="holidays-new-save"
                >
                  {isWorking ? 'Guardando…' : 'Añadir el festivo'}
                </Button>

                <Button
                  fullWidth
                  variant="secondary"
                  onPress={() => setAdding(false)}
                  style={styles.addCancel}
                  testID="holidays-new-cancel"
                >
                  Cancelar
                </Button>
              </>
            ) : (
              <Button
                fullWidth
                variant="secondary"
                onPress={() => setAdding(true)}
                testID="holidays-add"
              >
                Añadir un festivo de mi municipio
              </Button>
            )}
          </View>
        )}
      </Animated.ScrollView>
    </View>
  )
}
