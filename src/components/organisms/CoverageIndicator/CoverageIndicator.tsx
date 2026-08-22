/**
 * CoverageIndicator Organism
 * Cuántos profesionales recibirían esta urgencia (diseño `isUrgencia`).
 *
 * La razón de existir: en una urgencia lo que angustia es no saber si hay
 * alguien al otro lado. Decirlo **antes** de escribir la descripción evita
 * que alguien con una fuga rellene un formulario entero para descubrir al
 * final que no hay nadie que cubra su calle.
 *
 * Por eso el estado de "no hay nadie" no es un error ni un vacío: es una
 * respuesta honesta con una salida —probar con otro oficio—, que es lo que
 * pide el README §7 ("si nadie cubre, mensaje honesto, no reutilizar otros
 * oficios").
 */

import { View, Text, ActivityIndicator } from 'react-native'
import { InfoCard } from '@/components/molecules/InfoCard'
import type { CoverageState } from '@/hooks/domain/useAddressCoverage'
import { formatDistance } from '@/utils/geo'
import { theme } from '@/theme'
import { styles } from './CoverageIndicator.styles'

export interface CoverageIndicatorProps {
  state: CoverageState
  testID?: string
}

export function CoverageIndicator({ state, testID }: CoverageIndicatorProps) {
  if (state.status === 'idle') return null

  return (
    <InfoCard style={styles.card} testID={testID ?? 'coverage-indicator'}>
      {state.status === 'searching' ? (
        <View style={styles.row}>
          <ActivityIndicator size="small" color={theme.colors.accent} />
          <Text style={styles.body}>Mirando quién cubre esa dirección…</Text>
        </View>
      ) : state.status === 'not-found' ? (
        <>
          <Text style={styles.title}>No encontramos esa dirección</Text>
          <Text style={styles.body}>
            Prueba a escribirla con la calle, el número y la ciudad.
          </Text>
        </>
      ) : state.status === 'failed' ? (
        <>
          <Text style={styles.title}>No hemos podido comprobarlo</Text>
          <Text style={styles.body}>
            Puedes enviar la urgencia igualmente: avisaremos a quien cubra tu
            zona.
          </Text>
        </>
      ) : state.coverage.available > 0 ? (
        <>
          <View style={styles.row}>
            <View style={[styles.dot, styles.dotAvailable]} />
            <Text style={styles.title}>
              {state.coverage.available === 1
                ? 'Hay 1 profesional disponible'
                : `Hay ${state.coverage.available} profesionales disponibles`}
            </Text>
          </View>
          <Text style={styles.body}>
            {state.match.label}
            {state.coverage.nearestKm !== null &&
              ` · el más cercano a ${formatDistance(state.coverage.nearestKm)}`}
          </Text>
          <Text style={styles.note}>
            Al terminar los verás con su tarifa de urgencia y eliges tú. El que
            elijas tiene cinco minutos para contestar.
          </Text>
        </>
      ) : (
        <>
          <View style={styles.row}>
            <View style={[styles.dot, styles.dotEmpty]} />
            <Text style={styles.title}>Ahora mismo no hay nadie disponible</Text>
          </View>
          <Text style={styles.body}>
            {state.coverage.offline > 0
              ? `${state.coverage.offline === 1 ? 'Hay 1 profesional' : `Hay ${state.coverage.offline} profesionales`} de este oficio que cubren tu dirección, pero ninguno está disponible en este momento.`
              : 'Ningún profesional de este oficio llega hasta esa dirección.'}
          </Text>
          <Text style={styles.note}>
            Prueba con otro oficio si encaja, o vuelve más tarde: la
            disponibilidad cambia.
          </Text>
        </>
      )}
    </InfoCard>
  )
}
