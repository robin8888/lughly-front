/**
 * DisputeCard Organism
 * Un trabajo en revisión, tal y como lo leen los dos (`CICLOS` §C9).
 *
 * **La misma tarjeta para el cliente y para el profesional**, como el
 * presupuesto y por lo mismo: lo que está pasando con el dinero de los dos no
 * puede contarse de dos maneras. Lo único que cambia según quién mire es de
 * quién se dice que abrió la revisión, y los botones de debajo, que los pone la
 * pantalla.
 *
 * ## Lo que no puede faltar aquí
 *
 * **El plazo**, porque es la mitad de lo que necesita saber alguien que tiene
 * el dinero parado: no tranquiliza que alguien lo esté mirando, tranquiliza
 * saber cuándo termina.
 *
 * **Y que esto no es una sentencia.** Lughly decide qué hace con lo que tiene
 * retenido, según unos términos aceptados; ni cierra la vía de consumo ni la
 * judicial. Decirlo no es letra pequeña: es la diferencia entre una
 * intermediaria y alguien que se arroga resolver pleitos ajenos.
 */

import type { ReactNode } from 'react'
import { View, Text, Pressable } from 'react-native'
import { InfoCard } from '@/components/molecules/InfoCard'
import { RemotePhoto } from '@/components/molecules/RemotePhoto'
import { formatAmount } from '@/components/atoms/Money'
import { API_BASE_URL } from '@/api'
import type { ApiJobDispute, ApiJobEvidence } from '@/api/jobs.api'
import { styles } from './DisputeCard.styles'

/** «el 27 de septiembre», que es como se dice una fecha de verdad */
function elDia(iso: string): string {
  return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })
}

/** Y para el expediente, con la hora: dos pruebas del mismo día se ordenan */
function elMomento(iso: string): string {
  return new Date(iso).toLocaleString('es-ES', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Quién la abrió, dicho desde donde se mira.
 *
 * `byDeadline` no es un tercero: es que el reparo se quedó sin contestar y el
 * plazo lo mandó a revisión solo. Decir «la abrió Lughly» sonaría a que hemos
 * tomado partido antes de mirar nada.
 */
function quienLaAbrio(dispute: ApiJobDispute, viewer: 'client' | 'pro'): string {
  if (dispute.byDeadline) return 'Se abrió sola al pasar el plazo del reparo'
  if (dispute.openedByMe) return 'La pediste tú'

  return viewer === 'client' ? 'La pidió el profesional' : 'La pidió el cliente'
}

/** Cómo acabó, contado para quien lo lee y no con el nombre del estado */
function comoAcabo(dispute: ApiJobDispute, viewer: 'client' | 'pro'): string {
  const devuelto = dispute.refunded ?? 0

  switch (dispute.outcome) {
    case 'TO_PRO':
      return viewer === 'client'
        ? 'Se le abonó al profesional lo que estaba retenido.'
        : 'Se te abonó lo que estaba retenido.'
    case 'TO_CLIENT':
      return viewer === 'client'
        ? `Se te devolvieron ${formatAmount(devuelto)} €.`
        : `Se le devolvieron al cliente ${formatAmount(devuelto)} €.`
    case 'SPLIT':
      return viewer === 'client'
        ? `Se te devolvieron ${formatAmount(devuelto)} € y el resto se le abonó a él.`
        : `Se le devolvieron al cliente ${formatAmount(devuelto)} € y el resto es tuyo.`
    default:
      return ''
  }
}

export interface DisputeCardProps {
  dispute: ApiJobDispute
  viewer: 'client' | 'pro'
  /** Lo que ha aportado cada parte, en el orden en que llegó */
  evidence: ApiJobEvidence[]
  onOpenEvidence: (index: number) => void
  /** Los botones de aportar, que dependen de si sigue abierta */
  children?: ReactNode
  testID?: string
}

export function DisputeCard({
  dispute,
  viewer,
  evidence,
  onOpenEvidence,
  children,
  testID = 'dispute-card',
}: DisputeCardProps) {
  const abierta = dispute.resolvedAt === null

  return (
    <InfoCard style={styles.card} testID={testID}>
      <View style={styles.header}>
        <Text style={styles.title}>{abierta ? 'En revisión' : 'Revisión resuelta'}</Text>
        <Text style={[styles.badge, abierta ? styles.open : styles.done]}>
          {abierta ? `Antes del ${elDia(dispute.dueAt)}` : elDia(dispute.resolvedAt!)}
        </Text>
      </View>

      <Text style={styles.who}>{quienLaAbrio(dispute, viewer)}</Text>
      <Text style={styles.reason}>«{dispute.reason}»</Text>

      {abierta ? (
        <>
          <Text style={styles.body}>
            Lo estamos mirando. Mientras tanto el dinero sigue retenido: no se le
            paga a nadie hasta que haya decisión.
          </Text>
          {/*
            Y lo que esto es y lo que no. Va dentro de la tarjeta y no en un
            aviso legal aparte porque es aquí donde alguien se pregunta «¿y si
            no me dan la razón?».
          */}
          <Text style={styles.rights} testID={`${testID}-rights`}>
            Decidimos qué hacemos con el dinero que tenemos retenido, no quién
            tiene razón. Pase lo que pase, conservas tus derechos: puedes acudir
            a consumo o a los tribunales.
          </Text>
        </>
      ) : (
        <>
          <Text style={styles.decision} testID={`${testID}-decision`}>
            {dispute.decision}
          </Text>
          <Text style={styles.body}>{comoAcabo(dispute, viewer)}</Text>
        </>
      )}

      {/**
        * El expediente: lo que ha aportado cada parte, con su fecha y su lado.
        *
        * **Se ve entero desde los dos lados.** Un expediente en el que cada uno
        * solo ve lo suyo son dos monólogos, y enterarse de lo que enseñó el
        * otro cuando ya está decidido es motivo legítimo de queja.
        */}
      {evidence.length > 0 && (
        <View style={styles.evidence} testID={`${testID}-evidence`}>
          <Text style={styles.evidenceTitle}>Lo aportado</Text>

          <View style={styles.strip}>
            {evidence.map((prueba, index) => (
              <Pressable
                key={prueba.id}
                onPress={() => onOpenEvidence(index)}
                accessibilityRole="button"
                accessibilityLabel={`Ver la prueba del ${elMomento(prueba.createdAt)}`}
                style={styles.thumb}
                testID={`${testID}-evidence-${index}`}
              >
                <RemotePhoto
                  uri={`${API_BASE_URL}${prueba.url}`}
                  style={styles.thumbImage}
                  fallback="No carga"
                />
                <Text style={styles.stamp} numberOfLines={1}>
                  {prueba.side === 'CLIENT' ? 'Cliente' : 'Profesional'}
                </Text>
                <Text style={styles.stampDate} numberOfLines={1}>
                  {elMomento(prueba.createdAt)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {children}
    </InfoCard>
  )
}
