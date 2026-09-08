/**
 * Cómo funciona: /como-funciona
 *
 * Fuera de las pestañas: se lee una vez, al principio, y se entra desde la
 * home —la del cliente y la del profesional, cada una a su recorrido—.
 *
 * **Cuál toca lo decide la cuenta**, con `useEffectiveRole`, que es el mismo
 * que reparte las dos homes: quien está mirando la app de profesional lee cómo
 * se trabaja, y quien está en la de cliente lee cómo se contrata. Y por eso
 * mismo no lleva `RoleGate`: quien tiene las dos facetas cambia de modo y lee
 * la otra, que es exactamente lo que querría hacer.
 */

import { useRouter } from 'expo-router'
import { HowItWorksPage } from '@/pages/HowItWorksPage'
import { useEffectiveRole } from '@/hooks/auth/useEffectiveRole'

export default function HowItWorksRoute() {
  const router = useRouter()
  const role = useEffectiveRole()

  return (
    <HowItWorksPage
      role={role}
      onBack={() => router.navigate('/inicio')}
      /*
        El final de cada recorrido lleva a donde se empieza a hacer algo: el
        cliente al directorio, el profesional a sus encargos. Terminar de leer
        y quedarse en la misma pantalla sería contar cómo se hace algo y no
        dejar hacerlo.
      */
      onFinish={() => router.navigate(role === 'pro' ? '/encargos' : '/pros')}
    />
  )
}
