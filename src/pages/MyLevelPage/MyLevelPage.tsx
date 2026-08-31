/**
 * MyLevelPage
 * Su nivel de comisión, lo que lleva facturado y cuánto le falta para bajarla.
 *
 * ## Por qué existe esta pantalla
 *
 * Porque **un descuento que nadie sabe que existe no incentiva nada**
 * (`COMO_SE_CONTRATA.md` §12.6). La escalera de comisiones puede estar
 * perfectamente calculada en el servidor y no servir de nada si el profesional
 * no ve dónde está ni cuánto le falta para el siguiente escalón. Esa cifra
 * —`missingToNext`— es la pantalla entera; lo demás la acompaña.
 *
 * ## Lo que no se escribe aquí
 *
 * Ningún porcentaje ni ningún rótulo. Las tasas y los nombres llegan del
 * servidor, que es quien los cobra: un número pintado a mano que no coincida
 * con el que se aplica es la peor clase de error, porque nadie lo mira hasta
 * que alguien reclama por su transferencia.
 *
 * ## Los nombres
 *
 * Son las castas de un hormiguero —Obrera, Forrajera, Soldado, Reina— y suben
 * con el volumen que se trae a la plataforma.
 */

import { View, Text, ActivityIndicator, Pressable } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import Animated from 'react-native-reanimated'
import { formatAmount } from '@/components/atoms/Money'
import { EmptyState } from '@/components/molecules/EmptyState'
import { InfoCard } from '@/components/molecules/InfoCard'
import { useCommissionLevel } from '@/hooks/domain/useCommissionLevel'
import { useNavScrollHandler } from '@/hooks/ui/useCompactNav'
import { useTabBarClearance } from '@/hooks/ui/useTabBarClearance'
import type { ApiLevelStep } from '@/api/payments.api'
import { formatDate, parseIsoDateTime } from '@/utils/dates'
import { theme } from '@/theme'
import { styles } from './MyLevelPage.styles'

/** "8 % + 0,40 €", que es como se cobra de verdad */
function readableRate(step: ApiLevelStep): string {
  return `${formatRate(step.rate)} % + ${formatAmount(step.fixedFee)} €`
}

/** Sin decimales cuando no hacen falta: "8 %", no "8,00 %" */
function formatRate(rate: number): string {
  return Number.isInteger(rate) ? String(rate) : formatAmount(rate)
}

export interface MyLevelPageProps {
  onBack: () => void
  /** Adónde se manda a quien todavía no tiene cuenta de cobro */
  onOpenWallet: () => void
}

export function MyLevelPage({ onBack, onOpenWallet }: MyLevelPageProps) {
  const onScroll = useNavScrollHandler()
  const tabBarClearance = useTabBarClearance()

  const { data, isPending, isError, refetch, withoutAccount } = useCommissionLevel()

  const header = (
    <View style={styles.header}>
      {/* La cabecera ocupa también la franja del sistema: la hora, en claro */}
      <StatusBar style="light" />
      <Pressable onPress={onBack} style={styles.back} accessibilityRole="button">
        <Text style={styles.backIcon}>←</Text>
      </Pressable>
      <Text style={styles.title}>Mi nivel</Text>
    </View>
  )

  /**
   * Sin cuenta de cobro no hay nivel que enseñar, y son dos situaciones muy
   * distintas metidas en la misma respuesta: o trabaja para una empresa —y
   * entonces la comisión es de ella, no suya— o todavía no ha activado el
   * cobro. Como desde aquí no se puede saber cuál de las dos es, se dicen las
   * dos y se le deja la salida a mano.
   */
  if (withoutAccount) {
    return (
      <View style={styles.screen} testID="level-page">
        {header}
        <EmptyState
          title="Todavía no tienes nivel"
          message="Los niveles son de quien cobra. Si trabajas para una empresa, la comisión es suya y no tuya. Si trabajas por tu cuenta, activa tu cuenta de cobro y empezarás como Obrera."
          actions={[
            {
              label: 'Ir a mi cartera',
              onPress: onOpenWallet,
              testID: 'level-wallet',
            },
          ]}
          testID="level-no-account"
        />
      </View>
    )
  }

  if (isPending) {
    return (
      <View style={styles.screen} testID="level-page">
        {header}
        <View style={styles.state} testID="level-loading">
          <ActivityIndicator size="large" color={theme.colors.accent} />
        </View>
      </View>
    )
  }

  if (isError) {
    return (
      <View style={styles.screen} testID="level-page">
        {header}
        <EmptyState
          title="No hemos podido cargar tu nivel"
          message="Revisa tu conexión e inténtalo de nuevo."
          actions={[
            { label: 'Reintentar', onPress: () => void refetch(), testID: 'level-retry' },
          ]}
          testID="level-error"
        />
      </View>
    )
  }

  const current = data.ladder.find((step) => step.current)

  /*
    A mano y no con `Intl`: en Hermes va incompleto y devuelve cosas distintas
    según el dispositivo, que es por lo que todas las fechas de la app pasan por
    `utils/dates`.
  */
  const reviewedAt = data.reviewedAt ? parseIsoDateTime(data.reviewedAt) : null
  const reviewedOn = reviewedAt ? formatDate(reviewedAt) : null

  return (
    <View style={styles.screen} testID="level-page">
      {header}

      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={[styles.content, { paddingBottom: tabBarClearance }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Dónde está, y lo que paga por estar ahí */}
        <InfoCard variant="accent">
          <Text style={styles.hereLabel}>Ahora mismo eres</Text>
          <Text style={styles.hereName} testID="level-name">
            {data.name}
          </Text>
          {current && (
            <Text style={styles.hereRate} testID="level-rate">
              Pagas {readableRate(current)} de cada cobro
            </Text>
          )}
        </InfoCard>

        {/*
          La cifra por la que se entra aquí. Va sola y grande: si se pierde
          entre el resto, la escalera vuelve a ser una tabla de precios.
        */}
        <View style={styles.next} testID="level-next">
          {data.missingToNext === null || data.nextName === null ? (
            <Text style={styles.nextTop}>
              Estás en el nivel más alto. No hay comisión más baja que esta.
            </Text>
          ) : data.earnedName ? (
            /*
              El nivel se revisa una vez al mes y el volumen cambia cada día, así
              que hay un rato en que ya se ha ganado el escalón pero todavía no
              se tiene. Decir "te faltan 0,00 €" ahí parece un error.
            */
            <>
              <Text style={styles.nextAmount} testID="level-earned">
                Ya te da para {data.earnedName}
              </Text>
              <Text style={styles.nextNote}>
                Se aplica en la próxima revisión, el día 1. A partir de ahí pagarás
                menos en cada cobro.
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.nextLead}>Para llegar a {data.nextName}</Text>
              <Text style={styles.nextAmount} testID="level-missing">
                te faltan {formatAmount(data.missingToNext)} €
              </Text>
              <Text style={styles.nextNote}>
                Llevas {formatAmount(data.volume)} € cobrados en los últimos{' '}
                {data.windowDays} días. Solo cuenta el trabajo hecho y dado por
                bueno.
              </Text>
            </>
          )}
        </View>

        {/* La escalera entera: el incentivo es ver adónde lleva */}
        <Text style={styles.ladderTitle}>Los niveles</Text>

        <View style={styles.ladder} testID="level-ladder">
          {data.ladder.map((step) => (
            <View
              key={step.level}
              style={[styles.step, step.current && styles.stepCurrent]}
              testID={`level-step-${step.level}`}
            >
              <View style={styles.stepHead}>
                <Text style={[styles.stepName, step.current && styles.stepNameCurrent]}>
                  {step.name}
                </Text>
                <Text style={[styles.stepRate, step.current && styles.stepRateCurrent]}>
                  {readableRate(step)}
                </Text>
              </View>

              <Text style={styles.stepFrom}>
                {step.from === 0
                  ? 'Al empezar'
                  : `Desde ${formatAmount(step.from)} € en ${data.windowDays} días`}
              </Text>
            </View>
          ))}
        </View>

        <InfoCard style={styles.explain}>
          <Text style={styles.explainTitle}>Cómo funciona</Text>
          <Text style={styles.explainLine}>
            Se mira lo cobrado en los últimos {data.windowDays} días y se revisa el
            día 1 de cada mes. Se sube y se baja, así que un buen trimestre no se
            queda para siempre y uno malo tampoco te hunde: noventa días son
            muchos días.
          </Text>
          <Text style={styles.explainLine}>
            Un plantón en esos {data.windowDays} días no te baja de nivel, pero para
            la subida hasta la siguiente revisión.
          </Text>
          <Text style={styles.explainLine}>
            La comisión de cada cobro se fija cuando se cobra. Si subes de nivel, lo
            notas en el cobro siguiente, también en los trabajos que ya tengas
            cerrados.
          </Text>
        </InfoCard>

        {reviewedOn && (
          <Text style={styles.reviewed} testID="level-reviewed">
            Revisado por última vez el {reviewedOn}
          </Text>
        )}
      </Animated.ScrollView>
    </View>
  )
}
