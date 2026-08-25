/**
 * SurchargesPage
 * Los recargos por sábado, domingo o festivo y nocturno.
 *
 * Se entra con los valores de la ley ya puestos y con una nota que dice qué
 * manda la ley en cada caso, porque **no es un porcentaje para todo**: el
 * nocturno hay que pagarlo pero la ley no dice cuánto, el de domingos y
 * festivos tiene un mínimo del 75%, y el del sábado no lo manda nadie.
 *
 * La distinción que esta pantalla no puede perder: lo que se pone aquí es lo
 * que se le cobra **al cliente**. Lo que una empresa le debe a su trabajador
 * por ese mismo día va por nómina y no se decide aquí. Sin decirlo, a un
 * autónomo le estaríamos colocando una obligación que no tiene y a un
 * empleador la idea de que cobrando el recargo ya cumple con su gente.
 */

import { useEffect, useState } from 'react'
import { View, Text, ActivityIndicator, Pressable } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import Animated from 'react-native-reanimated'
import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/atoms/Input'
import { EmptyState } from '@/components/molecules/EmptyState'
import { FormField } from '@/components/molecules/FormField'
import { InfoCard } from '@/components/molecules/InfoCard'
import { useMySurcharges, useSetMySurcharges } from '@/hooks/domain/useMySurcharges'
import { useIsEmployee } from '@/hooks/domain/useIsEmployee'
import { useNavScrollHandler } from '@/hooks/ui/useCompactNav'
import { useTabBarClearance } from '@/hooks/ui/useTabBarClearance'
import { theme } from '@/theme'
import { styles } from './SurchargesPage.styles'

/** Lo que se teclea es texto; lo que se guarda es un entero. */
function toPercent(value: string): number | null {
  const clean = value.trim()
  if (!/^\d{1,3}$/.test(clean)) return null

  const number = Number(clean)
  return number <= 500 ? number : null
}

export interface SurchargesPageProps {
  onBack: () => void
  /** Cuando los lleva la empresa: los recargos son los de ese trabajador */
  employeeId?: string
  employeeName?: string
}

export function SurchargesPage({
  onBack,
  employeeId,
  employeeName,
}: SurchargesPageProps) {
  const onScroll = useNavScrollHandler()
  const tabBarClearance = useTabBarClearance()
  const isEmployee = useIsEmployee()

  const isForEmployee = employeeId !== undefined
  const blocked = isEmployee && !isForEmployee

  const { data, isPending, isError, refetch } = useMySurcharges(!blocked, employeeId)
  const { save, isSaving } = useSetMySurcharges(employeeId)

  const [saturday, setSaturday] = useState('')
  const [sunday, setSunday] = useState('')
  const [night, setNight] = useState('')
  const [loaded, setLoaded] = useState(false)
  const [notice, setNotice] = useState<{ text: string; ok: boolean } | null>(null)

  /**
   * Se copia lo guardado una sola vez. Si se copiara en cada respuesta, un
   * refresco de fondo borraría lo que se está escribiendo.
   */
  useEffect(() => {
    if (!data || loaded) return

    setSaturday(String(data.saturday))
    setSunday(String(data.sunday))
    setNight(String(data.night))
    setLoaded(true)
  }, [data, loaded])

  const values = {
    saturday: toPercent(saturday),
    sunday: toPercent(sunday),
    night: toPercent(night),
  }

  const isValid =
    values.saturday !== null && values.sunday !== null && values.night !== null

  /**
   * Vuelve a lo que dice la ley. **No toca el sábado**: no hay ninguna ley que
   * fije un recargo de sábado, así que ponerle un número y llamarlo "legal"
   * sería inventárselo.
   */
  const applyLegal = () => {
    if (!data) return

    setSunday(String(data.legal.sunday))
    setNight(String(data.legal.night))
    setNotice({
      text: 'Puestos los de la ley. El del sábado lo dejamos como estaba: ninguna ley lo fija.',
      ok: true,
    })
  }

  const handleSave = async () => {
    if (
      values.saturday === null ||
      values.sunday === null ||
      values.night === null
    ) {
      return
    }

    const { ok, error } = await save({
      saturday: values.saturday,
      sunday: values.sunday,
      night: values.night,
    })

    setNotice(
      ok
        ? { text: 'Recargos guardados.', ok: true }
        : { text: error ?? 'No hemos podido guardarlos.', ok: false },
    )
  }

  const header = (
    <View style={styles.header}>
      {/* La cabecera ocupa también la franja del sistema: la hora, en claro */}
      <StatusBar style="light" />
      <Pressable onPress={onBack} style={styles.back} accessibilityRole="button">
        <Text style={styles.backIcon}>←</Text>
      </Pressable>
      <Text style={styles.title} numberOfLines={1}>
        {isForEmployee ? (employeeName ?? 'Sus recargos') : 'Mis recargos'}
      </Text>
    </View>
  )

  if (blocked) {
    return (
      <View style={styles.screen} testID="surcharges-page">
        {header}
        <EmptyState
          title="Tus recargos los pone tu empresa"
          message="Es quien le cobra al cliente y quien factura, igual que con tu horario y tu zona. Lo que te corresponda a ti por trabajar un festivo va en tu nómina: eso háblalo con ellos."
          testID="surcharges-employee"
        />
      </View>
    )
  }

  if (isPending) {
    return (
      <View style={styles.screen} testID="surcharges-page">
        {header}
        <View style={styles.state} testID="surcharges-loading">
          <ActivityIndicator size="large" color={theme.colors.accent} />
        </View>
      </View>
    )
  }

  if (isError || !data) {
    return (
      <View style={styles.screen} testID="surcharges-page">
        {header}
        <EmptyState
          title="No hemos podido cargar los recargos"
          message="Revisa tu conexión e inténtalo de nuevo."
          actions={[
            {
              label: 'Reintentar',
              onPress: () => void refetch(),
              testID: 'surcharges-retry',
            },
          ]}
          testID="surcharges-error"
        />
      </View>
    )
  }

  return (
    <View style={styles.screen} testID="surcharges-page">
      {header}

      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={[styles.content, { paddingBottom: tabBarClearance }]}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
        showsVerticalScrollIndicator={false}
      >
        <InfoCard variant="accent">
          <Text style={styles.intro}>
            {isForEmployee
              ? 'Lo que se le cobra al cliente cuando el trabajo cae en sábado, en domingo o festivo, o de noche. No se acumulan: se aplica el más alto.'
              : 'Lo que le cobras al cliente cuando el trabajo cae en sábado, en domingo o festivo, o de noche. No se acumulan: se aplica el más alto, así que un sábado por la noche es nocturno y no las dos cosas.'}
          </Text>
        </InfoCard>

        <InfoCard style={styles.legal}>
          <Text style={styles.legalTitle}>Lo que dice la ley</Text>

          <Text style={styles.legalLine}>
            <Text style={styles.legalTerm}>Nocturno, de 22:00 a 06:00. </Text>
            Hay que pagarlo aparte, pero la ley no dice cuánto: lo fija el
            convenio. El {data.legal.night}% es lo más extendido.
          </Text>

          <Text style={styles.legalLine}>
            <Text style={styles.legalTerm}>Domingos y festivos. </Text>
            Trabajar el día de descanso semanal o un festivo, sin descanso
            compensatorio, se paga con un {data.legal.sunday}% como mínimo.
          </Text>

          <Text style={styles.legalLine}>
            <Text style={styles.legalTerm}>Sábados. </Text>
            No hay recargo de sábado en ninguna ley. El que traes puesto es
            costumbre del oficio, y puedes dejarlo en cero.
          </Text>

          <Text style={styles.legalNote}>
            {isForEmployee
              ? 'Ojo, que son dos cosas: esos porcentajes son lo que la ley te obliga a pagarle a tu trabajador en nómina. Lo de arriba es lo que le cobras al cliente, y ahí el precio lo pones tú. Te sugerimos ajustarte a la ley en los dos sitios.'
              : 'Ojo, que son dos cosas: esos porcentajes son los que una empresa debe pagarle a su trabajador en nómina. Lo que tú le cobras a un cliente es libre y ninguna ley lo fija. Te lo damos como referencia, y te sugerimos ajustarte a ella.'}
          </Text>

          <Button
            variant="secondary"
            onPress={applyLegal}
            testID="surcharges-legal"
          >
            Poner los de la ley
          </Button>
        </InfoCard>

        {notice && (
          <Text
            style={[styles.notice, notice.ok ? styles.noticeOk : styles.noticeError]}
            testID="surcharges-notice"
          >
            {notice.text}
          </Text>
        )}

        <View style={styles.form}>
          <FormField label="Sábados">
            <Input
              value={saturday}
              onChangeText={setSaturday}
              keyboardType="number-pad"
              suffix="%"
              error={values.saturday === null && saturday !== ''}
              testID="surcharges-saturday"
            />
          </FormField>

          <FormField label="Domingos y festivos">
            <Input
              value={sunday}
              onChangeText={setSunday}
              keyboardType="number-pad"
              suffix="%"
              error={values.sunday === null && sunday !== ''}
              testID="surcharges-sunday"
            />
          </FormField>

          <FormField label="Nocturno (22:00–06:00)">
            <Input
              value={night}
              onChangeText={setNight}
              keyboardType="number-pad"
              suffix="%"
              error={values.night === null && night !== ''}
              testID="surcharges-night"
            />
          </FormField>

          <Text style={styles.hint}>
            El cero vale: significa que ese día se cobra el precio de siempre.
          </Text>
        </View>

        <Button
          onPress={() => void handleSave()}
          disabled={!isValid || isSaving}
          style={styles.save}
          testID="surcharges-save"
        >
          {isSaving ? 'Guardando…' : 'Guardar'}
        </Button>
      </Animated.ScrollView>
    </View>
  )
}
