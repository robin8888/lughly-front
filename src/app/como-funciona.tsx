/**
 * Cómo funciona: /como-funciona
 *
 * Fuera de las pestañas: se lee una vez, al principio, y se entra desde la
 * home. No lleva `RoleGate` aunque esté escrita para el cliente — un
 * profesional que quiera leer cómo se ve la app desde el otro lado no está
 * haciendo nada que haya que impedirle, y bloquearlo sería una puerta cerrada
 * sin motivo.
 */

import { useRouter } from 'expo-router'
import { HowItWorksPage } from '@/pages/HowItWorksPage'

export default function HowItWorksRoute() {
  const router = useRouter()

  return (
    <HowItWorksPage
      onBack={() => router.navigate('/inicio')}
      onBrowse={() => router.navigate('/pros')}
    />
  )
}
