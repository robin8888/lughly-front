/**
 * Mis favoritos: /mis-favoritos
 *
 * Fuera de las pestañas: se entra desde Mi cuenta, como Mis datos o Mis
 * trabajos publicados.
 */

import { useRouter } from 'expo-router'
import { FavoritesPage } from '@/pages/FavoritesPage'

export default function FavoritesRoute() {
  const router = useRouter()

  return (
    <FavoritesPage
      onBack={() => router.navigate('/account')}
      onSelectPro={(id, selection) =>
        router.navigate({
          pathname: '/pro/[id]',
          params: {
            id,
            ...(selection && {
              tradeSlug: selection.tradeSlug,
              serviceIds: selection.serviceIds.join(','),
            }),
          },
        })
      }
      onHireCarta={(proId, tradeSlug, serviceIds) =>
        router.navigate({
          pathname: '/contratar-carta',
          params: { proId, tradeSlug, serviceIds: serviceIds.join(',') },
        })
      }
    />
  )
}
