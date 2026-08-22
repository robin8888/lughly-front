/**
 * JobCard Molecule
 * Un trabajo publicado, según MobileApp.dc.html (`isMisTrabajos`).
 *
 * Las pujas solo se enseñan en subastas: una reserva instantánea es a tarifa
 * fija y una urgencia se acepta, no se puja.
 *
 * El plazo va con cuenta atrás viva (`Countdown`) y no con un texto fijo: es
 * lo que le dice al cliente si aún puede esperar más ofertas o si conviene
 * decidirse ya.
 */

import { View, Text, Pressable, Image } from 'react-native'
import { InfoCard } from '@/components/molecules/InfoCard'
import { Countdown } from '@/components/atoms/Countdown'
import { Tag } from '@/components/atoms/Tag'
import { Money } from '@/components/atoms/Money'
import { Avatar } from '@/components/atoms/Avatar'
import { API_BASE_URL } from '@/api'
import type { ApiJob } from '@/api/jobs.api'
import { jobStatusLook, jobTypeLabel } from '@/utils/jobStatus'
import { getTradeImage } from '@/utils/trades'
import { styles } from './JobCard.styles'

export interface JobCardProps {
  job: ApiJob
  onPress?: () => void
  /**
   * La empresa propone mandar a otra persona y el cliente decide. Va en la
   * tarjeta y no en una pantalla aparte porque es la respuesta a algo que ya
   * está mirando, y sacarla fuera obligaría a memorizar a quién pidió.
   */
  onRespondSubstitute?: (accept: boolean) => void
  /**
   * Buscar otro profesional para un trabajo que se quedó sin nadie. Sin esto
   * el aviso de "no pueden" es un callejón: dice qué ha pasado y no a dónde ir.
   */
  onReassign?: () => void
  isRespondingSubstitute?: boolean
  testID?: string
}

export function JobCard({
  job,
  onPress,
  onRespondSubstitute,
  onReassign,
  isRespondingSubstitute = false,
  testID,
}: JobCardProps) {
  const status = jobStatusLook(job.status, job.appointmentStatus)
  const image = getTradeImage(job.trade)

  /** La empresa propone a otra persona y el cliente tiene que decir */
  const isSubstituteProposed = job.appointmentStatus === 'SUBSTITUTE_PROPOSED'

  /**
   * Si el trabajo ya tiene dueño. Cambia lo que se dice de la persona: "se lo
   * has encargado" mientras se espera, y "lo hace" cuando ya está cerrado.
   */
  const isDecided =
    job.status === 'CONTRACTED' ||
    job.status === 'IN_PROGRESS' ||
    job.status === 'COMPLETED'

  /**
   * Se quedó sin nadie y le toca mover a él.
   *
   * Va remarcado en naranja porque es lo único de la lista donde el trabajo se
   * ha parado esperándole: "no pueden" y "se cumplió el plazo" acaban en lo
   * mismo —hay que buscar a otro— y entre diez tarjetas se pasan por alto.
   *
   * El naranja es el de los encargos sin responder, no un rojo: no ha fallado
   * nada, hay algo que hacer.
   */
  const needsYou = job.status === 'DECLINED' || job.status === 'EXPIRED'

  /**
   * Y una urgencia abierta, que también le está esperando a él.
   *
   * Se publica y lo siguiente es elegir a quién llamar, así que si sale de esa
   * pantalla sin elegir, la urgencia se queda quieta: no se avisa a nadie por
   * su cuenta, que es justo lo que cambió del modelo anterior. Sin esto, la
   * única salida sería cancelarla y volver a escribirla entera.
   */
  const pickPro = job.type === 'URGENT' && job.status === 'OPEN'

  const waiting = needsYou || pickPro

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      testID={testID}
    >
      <InfoCard style={waiting ? styles.needsYou : undefined}>
        {waiting && (
          <View style={styles.needsYouBlock}>
            <Text style={styles.needsYouNote}>
              {pickPro
                ? 'Falta elegir a quién llamar: nadie lo sabe todavía.'
                : job.status === 'DECLINED'
                  ? 'No pueden hacerlo, puedes buscar otro profesional.'
                  : 'Nadie ha respondido a tiempo, puedes buscar otro profesional.'}
            </Text>

            {onReassign && (
              <Pressable
                onPress={onReassign}
                accessibilityRole="button"
                style={styles.reassign}
                testID={`job-${job.id}-reassign`}
              >
                {/* Corto: la frase de arriba ya ha dicho qué se busca */}
                <Text style={styles.reassignText}>
                  {pickPro ? 'Elegir' : 'Buscar'}
                </Text>
              </Pressable>
            )}
          </View>
        )}

        <View style={styles.row}>
          <View style={styles.thumb}>
            {image && <Image source={image} style={styles.thumbImage} resizeMode="contain" />}
            {job.photoCount > 0 && (
              <View style={styles.photoCount}>
                <Text style={styles.photoCountText}>{job.photoCount}</Text>
              </View>
            )}
          </View>

          <View style={styles.body}>
            <View style={styles.head}>
              <Text style={styles.title} numberOfLines={2}>
                {job.title}
              </Text>
              <Tag variant={status.variant}>{status.label}</Tag>
            </View>

            <Text style={styles.meta} numberOfLines={1}>
              {job.tradeLabel} · {job.city}
            </Text>
            <Text style={styles.type}>{jobTypeLabel(job.type)}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          {job.maxBudget !== null && (
            <Text style={styles.budgetLabel}>
              Hasta <Money amount={job.maxBudget} size="small" style={styles.budget} />
            </Text>
          )}

          {job.status === 'OPEN' && (
            <Countdown
              target={job.biddingEndsAt}
              prefix="Cierra en"
              expiredLabel="Plazo cumplido"
              style={styles.deadline}
            />
          )}

          {/**
           * Lo que corre en un encargo directo no es una subasta sino el
           * plazo de quien tiene que contestar. Es el mismo dato para el
           * cliente: cuándo deja de esperar.
           */}
          {job.status === 'PENDING_PRO' && !isSubstituteProposed && (
            <Countdown
              target={job.respondByAt}
              prefix="Responde en"
              expiredLabel="Sin respuesta a tiempo"
              style={styles.deadline}
            />
          )}
        </View>

        {/*
          Con quién está el trabajo, con su cara. En una lista de diez se
          reconoce antes una foto que un nombre, y era lo que faltaba para
          saber de un vistazo a quién se espera o quién va a ir.

          En una propuesta de cambio no sale: ahí manda el bloque de abajo,
          que cuenta las dos personas y es donde se decide.
        */}
        {job.proName && !isSubstituteProposed && (
          <View style={styles.pro}>
            <Avatar
              uri={
                job.proAvatarUrl ? `${API_BASE_URL}${job.proAvatarUrl}` : null
              }
              size={32}
            />
            <Text style={styles.proName} numberOfLines={1}>
              {isDecided ? 'Lo hace ' : 'Se lo has encargado a '}
              <Text style={styles.strong}>{job.proName}</Text>
            </Text>
          </View>
        )}

        {/**
         * El cambio de persona. Se explica a quién pidió y a quién le mandan,
         * porque eligió mirando una ficha concreta y esa es justamente la
         * información que necesita para decidir.
         */}
        {isSubstituteProposed && onRespondSubstitute && (
          <View style={styles.substitute}>
            <Text style={styles.substituteText}>
              Pediste a <Text style={styles.strong}>{job.requestedProName}</Text>,
              pero te proponen enviar a{' '}
              <Text style={styles.strong}>{job.substituteProName}</Text>.
            </Text>

            <Text style={styles.substituteHint}>
              Si no te convence, el encargo se cancela sin coste.
            </Text>

            <View style={styles.substituteActions}>
              <Pressable
                onPress={() => onRespondSubstitute(true)}
                disabled={isRespondingSubstitute}
                style={styles.accept}
                accessibilityRole="button"
                testID={testID ? `${testID}-accept` : undefined}
              >
                <Text style={styles.acceptText}>Acepto el cambio</Text>
              </Pressable>

              <Pressable
                onPress={() => onRespondSubstitute(false)}
                disabled={isRespondingSubstitute}
                style={styles.reject}
                accessibilityRole="button"
                testID={testID ? `${testID}-reject` : undefined}
              >
                <Text style={styles.rejectText}>No, gracias</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/**
         * Las pujas solo tienen sentido en una subasta: una reserva
         * instantánea es a tarifa fija y una urgencia se acepta, no se puja.
         */}
        {/*
          Y solo mientras la subasta siga abierta: una vez adjudicada, "sin
          pujas todavía" habla de algo que ya terminó, y el trabajo ya tiene
          quien lo haga.
        */}
        {job.type === 'AUCTION' && job.status === 'OPEN' && (
          <Text style={styles.bids}>
            {job.bidCount === 0 ? (
              'Sin pujas todavía'
            ) : (
              <>
                {job.bidCount} {job.bidCount === 1 ? 'puja' : 'pujas'} · la más baja{' '}
                {job.lowestBid !== null && (
                  <Money amount={job.lowestBid} size="small" style={styles.lowest} />
                )}
              </>
            )}
          </Text>
        )}
      </InfoCard>
    </Pressable>
  )
}
