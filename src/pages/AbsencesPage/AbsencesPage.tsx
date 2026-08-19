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
import Animated from 'react-native-reanimated'
import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/atoms/Input'
import { EmptyState } from '@/components/molecules/EmptyState'
import { FormField } from '@/components/molecules/FormField'
import { InfoCard } from '@/components/molecules/InfoCard'
import { DateTimeField } from '@/components/molecules/DateTimeField'
import { useMyAbsences, useManageMyAbsences } from '@/hooks/domain/useMyAbsences'
import { useIsEmployee } from '@/hooks/domain/useIsEmployee'
import { useNavScrollHandler } from '@/hooks/ui/useCompactNav'
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
}

export function AbsencesPage({ onBack }: AbsencesPageProps) {
  const onScroll = useNavScrollHandler()
  const isEmployee = useIsEmployee()
  const { data, isPending, isError, refetch } = useMyAbsences(!isEmployee)
  const { add, remove, isWorking } = useManageMyAbsences()

  const [from, setFrom] = useState(() => new Date())
  const [to, setTo] = useState(() => new Date())
  const [reason, setReason] = useState('')
  const [notice, setNotice] = useState<{ text: string; ok: boolean } | null>(null)

  const absences = data ?? []
  const isBackwards = toIsoDate(to) < toIsoDate(from)

  const handleAdd = async () => {
    const { ok, error } = await add({
      startsOn: toIsoDate(from),
      endsOn: toIsoDate(to),
      ...(reason.trim() !== '' && { reason: reason.trim() }),
    })

    if (!ok) {
      setNotice({ text: error ?? 'No hemos podido guardar esos días.', ok: false })
      return
    }

    setReason('')
    setNotice({ text: 'Guardado. Esos días no te llegará nada.', ok: true })
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
      <Pressable onPress={onBack} style={styles.back} accessibilityRole="button">
        <Text style={styles.backIcon}>←</Text>
      </Pressable>
      <Text style={styles.title} numberOfLines={1}>
        Mis ausencias
      </Text>
    </View>
  )

  if (isEmployee) {
    return (
      <View style={styles.screen} testID="absences-page">
        {header}
        <EmptyState
          title="Tus días libres los lleva tu empresa"
          message="Quien te dio de alta organiza cuándo trabajas, igual que tu horario y tus oficios. Habla con ellos para tus vacaciones."
          illustration="greeting"
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
          illustration="greeting"
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

      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <InfoCard>
          <Text style={styles.intro}>
            Los días que no estás. Mandan sobre tu horario: esos días no
            aparecerás disponible, no te llegarán urgencias, y tu ficha dirá
            hasta cuándo.
          </Text>

          <Text style={styles.note}>
            El motivo es solo para ti, para distinguir unos días de otros. No se
            enseña a nadie.
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
            loading={isWorking}
            disabled={isBackwards || isWorking}
            onPress={() => void handleAdd()}
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
      </Animated.ScrollView>
    </View>
  )
}
