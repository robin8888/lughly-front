/**
 * Pujas recibidas: /pujas?jobId=…
 *
 * Del cliente. Se llega tocando una subasta en Mis trabajos, y se vuelve allí
 * al adjudicar: es donde el trabajo aparece ya con su estado nuevo.
 */

import { useLocalSearchParams, useRouter } from 'expo-router'
import { JobBidsPage } from '@/pages/JobBidsPage'

export default function JobBidsRoute() {
  const router = useRouter()
  const { jobId, title } = useLocalSearchParams<{ jobId?: string; title?: string }>()

  return (
    <JobBidsPage
      jobId={jobId}
      {...(title ? { jobTitle: title } : {})}
      onBack={() => router.navigate('/jobs')}
      onAwarded={() => router.navigate('/jobs')}
    />
  )
}
