/**
 * JobCard Molecule
 * Un trabajo publicado, según MobileApp.dc.html (`isMisTrabajos`).
 *
 * El diseño enseña además el número de pujas y la más baja. No están aquí
 * porque **no existe todavía el modelo `Bid`**: inventar un "0 pujas" sería
 * indistinguible de un trabajo que de verdad no ha recibido ninguna, y el
 * cliente no podría saber cuál de las dos cosas está mirando.
 */

import { View, Text, Pressable, Image } from 'react-native'
import { InfoCard } from '@/components/molecules/InfoCard'
import { Tag } from '@/components/atoms/Tag'
import { Money } from '@/components/atoms/Money'
import type { ApiJob } from '@/api/jobs.api'
import { jobStatusLook, jobTypeLabel, timeLeftLabel } from '@/utils/jobStatus'
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

          {job.biddingEndsAt !== null && job.status === 'OPEN' && (
            <Text style={styles.deadline}>{timeLeftLabel(job.biddingEndsAt)}</Text>
          )}
        </View>
      </InfoCard>
    </Pressable>
  )
}
