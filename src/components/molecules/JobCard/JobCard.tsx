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
  isRespondingSubstitute?: boolean
  testID?: string
}

export function JobCard({
  job,
  onPress,
  onRespondSubstitute,
  isRespondingSubstitute = false,
  testID,
}: JobCardProps) {
  const status = jobStatusLook(job.status)
  const image = getTradeImage(job.trade)

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      testID={testID}
    >
      <InfoCard>
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
          {job.status === 'PENDING_PRO' && (
            <Countdown
              target={job.respondByAt}
              prefix="Responde en"
              expiredLabel="Sin respuesta a tiempo"
              style={styles.deadline}
            />
          )}
        </View>

        {job.status === 'PENDING_PRO' && job.requestedProName && (
          <Text style={styles.requested}>
            Se lo has encargado a {job.requestedProName}.
          </Text>
        )}

        {/**
         * El cambio de persona. Se explica a quién pidió y a quién le mandan,
         * porque eligió mirando una ficha concreta y esa es justamente la
         * información que necesita para decidir.
         */}
        {job.status === 'SUBSTITUTE_PROPOSED' && onRespondSubstitute && (
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
        {job.type === 'AUCTION' && (
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
