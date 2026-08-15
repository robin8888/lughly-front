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
  testID?: string
}

export function JobCard({ job, onPress, testID }: JobCardProps) {
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
        </View>

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
