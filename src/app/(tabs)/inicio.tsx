/**
 * Tab Inicio
 *
 * Son dos pantallas distintas, no una con otros textos: el cliente viene a
 * buscar a alguien y el profesional viene a ver cómo le va. Compartirlas
 * obligaría a esconder media home con condicionales.
 */

import { useRouter } from 'expo-router'
import { HomePage, HomePagePro } from '@/pages/HomePage'
import { useEffectiveRole } from '@/hooks/auth/useEffectiveRole'
import { useUser } from '@/stores/useAuthStore'

export default function InicioRoute() {
  const router = useRouter()
  const role = useEffectiveRole()
  const user = useUser()

  if (role === 'pro') {
    return (
      <HomePagePro
        userId={user?.id}
        onSecondary={() => router.navigate('/schedule')}
        onManageEmployees={() => router.navigate('/empleados')}
        onInbox={() => router.navigate('/encargos')}
      />
    )
  }

  /**
   * `navigate` y no `push` para moverse entre pestañas: reutiliza la que ya
   * existe y actualiza sus parámetros. Con `push` se apilarían pantallas y
   * el oficio elegido podría no llegar a una pestaña ya montada.
   */
  return (
    <HomePage
      role="client"
      onUrgent={() => router.navigate('/urgent')}
      // El oficio viaja como parámetro: el directorio abre ya filtrado
      onSelectTrade={(slug) =>
        router.navigate({ pathname: '/pros', params: { trade: slug } })
      }
      /*
       * `push` y no `navigate`: "Cómo funciona" no es una pestaña, es una
       * pantalla de pila que se apila sobre la home y de la que se vuelve.
       */
      onHowItWorks={() => router.push('/como-funciona')}
    />
  )
}
