/**
 * AbsencesPage
 * Los días que el profesional no está: vacaciones, una baja, un viaje.
 *
 * Mandan sobre el horario, que dice cuándo trabaja en una **semana normal**, y
 * una semana de vacaciones no lo es. Hizo falta en cuanto el horario empezó a
 * verse en la ficha: hasta entonces uno se lo prometía a sí mismo, y desde
 * entonces la app promete "lunes de 9 a 14" el lunes que está en la playa.
 *
 * Mientras dura una ausencia desaparece de "disponible ahora", no le llegan
 * urgencias, y su ficha dice hasta cuándo. El motivo se guarda para él y **no**
 * se enseña: al cliente le basta con la fecha, y una baja es asunto suyo.
 */

import { useState } from 'react'
import { View, Text, ActivityIndicator, Pressable, Alert } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { FormScrollView } from '@/components/templates/FormScrollView'
import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/atoms/Input'
import { EmptyState } from '@/components/molecules/EmptyState'
import { FormField } from '@/components/molecules/FormField'
import { InfoCard } from '@/components/molecules/InfoCard'
import { Dialog } from '@/components/organisms/Dialog'
import { DateTimeField } from '@/components/molecules/DateTimeField'
import { useMyAbsences, useManageMyAbsences } from '@/hooks/domain/useMyAbsences'
import type { ApiAbsenceImpact } from '@/api/pros.api'
import { useIsEmployee } from '@/hooks/domain/useIsEmployee'
import { useNavScrollHandler } from '@/hooks/ui/useCompactNav'
import { useTabBarClearance } from '@/hooks/ui/useTabBarClearance'
import { formatDate, parseIsoDate, toIsoDate } from '@/utils/dates'
import { theme } from '@/theme'
import { styles } from './AbsencesPage.styles'

/** Un día en texto, como se lee: "19 de agosto de 2026" */
function readable(day: string): string {
  const date = parseIsoDate(day)
  return date ? formatDate(date) : day
}

export interface AbsencesPageProps {
  onBack: () => void
  /** Cuando los lleva la empresa: los días son los de ese trabajador */
  employeeId?: string
  employeeName?: string
}

export function AbsencesPage({
  onBack,
  employeeId,
  employeeName,
}: AbsencesPageProps) {
  const onScroll = useNavScrollHandler()
  const tabBarClearance = useTabBarClearance()
  const isEmployee = useIsEmployee()

  const isForEmployee = employeeId !== undefined
  const blocked = isEmployee && !isForEmployee

  const { data, isPending, isError, refetch } = useMyAbsences(!blocked, employeeId)
  const { add, remove, checkImpact, isWorking } = useManageMyAbsences(employeeId)

  const [from, setFrom] = useState(() => new Date())
  const [to, setTo] = useState(() => new Date())
  const [reason, setReason] = useState('')
  const [notice, setNotice] = useState<{ text: string; ok: boolean } | null>(null)
  /**
   * Lo que estos días se van a llevar por delante, cuando hay algo
   * (`CICLOS_DE_CONTRATACION.md` §F6).
   *
   * `null` es "todavía no se ha preguntado o no hay nada que avisar". Con algo
   * dentro, la pantalla está esperando un sí: unas vacaciones son, para quien
   * tiene contratos fijos, un botón que cancela el trabajo de otra gente, y
   * eso no se pulsa sin verlo.
   */
  const [impact, setImpact] = useState<ApiAbsenceImpact | null>(null)
  /** Mientras se pregunta qué se llevaría: el botón no puede quedarse mudo */
  const [checking, setChecking] = useState(false)

  const absences = data ?? []
  const isBackwards = toIsoDate(to) < toIsoDate(from)

  /**
   * Antes de marcar, mirar qué se lleva por delante.
   *
   * Si no hay contratos fijos esos días —el caso normal— no se pregunta nada y
   * se guarda directamente: un diálogo de confirmación para decir "no pasa
   * nada" es un toque de más en cada vacación.
   */
  const handleAsk = async () => {
    setChecking(true)

    const posible = await checkImpact(toIsoDate(from), toIsoDate(to))

    setChecking(false)

    if (posible && posible.sessions > 0) {
      setImpact(posible)
      return
    }

    await handleAdd()
  }

  const handleAdd = async () => {
    setImpact(null)

    const { ok, error, impact: caido } = await add({
      startsOn: toIsoDate(from),
      endsOn: toIsoDate(to),
      ...(reason.trim() !== '' && { reason: reason.trim() }),
    })

    if (!ok) {
      setNotice({ text: error ?? 'No hemos podido guardar esos días.', ok: false })
      return
    }

    setReason('')

    /*
      Y lo que se ha caído se dice al guardar, no solo antes: es la confirmación
      de que ha pasado de verdad, y es el único aviso que ve quien llega por el
      camino de la empresa, que no tiene el previo.
    */
    setNotice({
      text:
        caido && caido.sessions > 0
          ? `Guardado. Se han cancelado ${caido.sessions} ${
              caido.sessions === 1 ? 'sesión fija' : 'sesiones fijas'
            } y hemos avisado a ${caido.contracts.length === 1 ? 'su cliente' : 'sus clientes'}.`
          : 'Guardado. Esos días no te llegará nada.',
      ok: true,
    })
  }

  /**
   * Se pregunta antes de quitar: volver a estar disponible unos días que uno
   * había apartado es justo lo que no se quiere descubrir por un toque.
   */
  const handleRemove = (id: string, label: string) => {
    Alert.alert('¿Quitar estos días?', `Volverás a estar disponible ${label}.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Quitar',
        style: 'destructive',
        onPress: () => {
          void remove(id).then(({ ok, error }) => {
            setNotice({
              text: ok ? 'Quitado.' : (error ?? 'No hemos podido quitarlo.'),
              ok,
            })
          })
        },
      },
    ])
  }

  const header = (
    <View style={styles.header}>
      {/* La cabecera ocupa también la franja del sistema: la hora, en claro */}
      <StatusBar style="light" />
      <Pressable onPress={onBack} style={styles.back} accessibilityRole="button">
        <Text style={styles.backIcon}>←</Text>
      </Pressable>
      <Text style={styles.title} numberOfLines={1}>
        {isForEmployee ? (employeeName ?? 'Sus ausencias') : 'Mis ausencias'}
      </Text>
    </View>
  )

  if (blocked) {
    return (
      <View style={styles.screen} testID="absences-page">
        {header}
        <EmptyState
          title="Tus días libres los lleva tu empresa"
          message="Quien te dio de alta organiza cuándo trabajas, igual que tu horario y tus oficios. Habla con ellos para tus vacaciones."
          testID="absences-employee"
        />
      </View>
    )
  }

  if (isPending) {
    return (
      <View style={styles.screen} testID="absences-page">
        {header}
        <View style={styles.state} testID="absences-loading">
          <ActivityIndicator size="large" color={theme.colors.accent} />
        </View>
      </View>
    )
  }

  if (isError) {
    return (
      <View style={styles.screen} testID="absences-page">
        {header}
        <EmptyState
          title="No hemos podido cargar tus ausencias"
          message="Revisa tu conexión e inténtalo de nuevo."
          actions={[
            {
              label: 'Reintentar',
              onPress: () => void refetch(),
              testID: 'absences-retry',
            },
          ]}
          testID="absences-error"
        />
      </View>
    )
  }

  return (
    <View style={styles.screen} testID="absences-page">
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
            {isForEmployee
              ? 'Los días que no está. Mandan sobre su horario: esos días no aparecerá disponible, no le llegarán urgencias, y su ficha dirá hasta cuándo.'
              : 'Los días que no estás. Mandan sobre tu horario: esos días no aparecerás disponible, no te llegarán urgencias, y tu ficha dirá hasta cuándo.'}
          </Text>

          <Text style={styles.note}>
            {isForEmployee
              ? 'El motivo es para vosotros, para distinguir unos días de otros. No se enseña al cliente.'
              : 'El motivo es solo para ti, para distinguir unos días de otros. No se enseña a nadie.'}
          </Text>
        </InfoCard>

        {notice && (
          <Text
            style={[styles.notice, notice.ok ? styles.noticeOk : styles.noticeError]}
            testID="absences-notice"
          >
            {notice.text}
          </Text>
        )}

        <View style={styles.form}>
          <View style={styles.days}>
            <View style={styles.day}>
              <FormField label="Desde">
                <DateTimeField
                  value={from}
                  onChange={(picked) => {
                    setFrom(picked)
                    // Empujar el final evita el error más común: dejarlo atrás
                    if (toIsoDate(to) < toIsoDate(picked)) setTo(picked)
                  }}
                  mode="date"
                  disabled={isWorking}
                  testID="absence-from"
                />
              </FormField>
            </View>

            <View style={styles.day}>
              <FormField label="Hasta (incluido)">
                <DateTimeField
                  value={to}
                  onChange={setTo}
                  mode="date"
                  disabled={isWorking}
                  testID="absence-to"
                />
              </FormField>
            </View>
          </View>

          {isBackwards && (
            <Text style={styles.invalid}>
              El último día no puede ser anterior al primero.
            </Text>
          )}

          <FormField label="Motivo (opcional)">
            <Input
              value={reason}
              onChangeText={setReason}
              placeholder="Vacaciones, baja, viaje…"
              editable={!isWorking}
              maxLength={120}
              testID="absence-reason"
            />
          </FormField>

          <Button
            fullWidth
            loading={isWorking || checking}
            disabled={isBackwards || isWorking || checking}
            onPress={() => void handleAsk()}
            style={styles.save}
            testID="absences-add"
          >
            Marcar estos días
          </Button>
        </View>

        {absences.length === 0 ? (
          <Text style={styles.empty} testID="absences-empty">
            No tienes ningún día marcado. Cuando cojas vacaciones, márcalas aquí
            y nadie contará contigo esos días.
          </Text>
        ) : (
          <View style={styles.list}>
            {absences.map((absence) => {
              const label =
                absence.startsOn === absence.endsOn
                  ? `el ${readable(absence.startsOn)}`
                  : `del ${readable(absence.startsOn)} al ${readable(absence.endsOn)}`

              return (
                <InfoCard
                  key={absence.id}
                  style={styles.absence}
                  testID={`absence-${absence.id}`}
                >
                  <Text style={styles.range}>
                    {label.charAt(0).toUpperCase() + label.slice(1)}
                  </Text>

                  {absence.reason && (
                    <Text style={styles.reason}>{absence.reason}</Text>
                  )}

                  <Pressable
                    onPress={() => handleRemove(absence.id, label)}
                    disabled={isWorking}
                    accessibilityRole="button"
                    style={styles.remove}
                    testID={`absence-${absence.id}-remove`}
                  >
                    <Text style={styles.removeText}>Quitar estos días</Text>
                  </Pressable>
                </InfoCard>
              )
            })}
          </View>
        )}
      </FormScrollView>

      {/*
        El aviso de §F6: qué se lleva por delante marcar estos días.

        Se enseña **antes** y con los días concretos, porque lo que se cancela
        es el trabajo de otra persona: quien lee "tienes 3 sesiones fijas con
        Lucía esa semana" todavía puede irse la siguiente.
      */}
      <Dialog
        visible={impact !== null}
        tone="danger"
        title="Esos días tienes trabajo fijo"
        message={
          impact === null
            ? ''
            : `Se cancelan ${impact.sessions} ${
                impact.sessions === 1 ? 'sesión' : 'sesiones'
              } y se avisa a ${
                impact.contracts.length === 1 ? 'quien la contrató' : 'quien las contrató'
              }. No se les cobra nada.`
        }
        onDismiss={() => setImpact(null)}
        actions={[
          {
            label: 'Volver',
            variant: 'secondary',
            onPress: () => setImpact(null),
            testID: 'absences-impact-back',
          },
          {
            label: isWorking ? 'Guardando…' : 'Marcar estos días',
            disabled: isWorking,
            onPress: () => void handleAdd(),
            testID: 'absences-impact-confirm',
          },
        ]}
        testID="absences-impact-dialog"
      >
        {/*
          Y con quién y qué días, contrato por contrato: el número solo dice
          cuánto, y lo que hace decidir es a quién se le deja tirado.
        */}
        <View style={styles.impact}>
          {(impact?.contracts ?? []).map((contract) => (
            <Text key={contract.jobId} style={styles.impactLine}>
              {contract.clientName}: {contract.days.map(readable).join(', ')}
            </Text>
          ))}
        </View>
      </Dialog>
    </View>
  )
}
