/**
 * Cambio obligatorio de contraseña: /cambiar-contrasena
 *
 * Va fuera de las pestañas y protegida al revés que el resto: solo existe
 * mientras haga falta. En cuanto la contraseña cambia, el layout raíz la
 * retira del navegador y monta las pestañas, así que no hay pantalla de la
 * que volver ni botón atrás que la esquive.
 */

import { useRouter } from 'expo-router'
import { ForcePasswordPage } from '@/pages/ForcePasswordPage'
import { useLogout } from '@/hooks/auth/useLogout'

export default function ForcePasswordRoute() {
  const router = useRouter()
  const { logout } = useLogout()

  return (
    <ForcePasswordPage
      onDone={() => router.replace('/inicio')}
      onLogout={() => void logout()}
    />
  )
}
