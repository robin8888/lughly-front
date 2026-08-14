/**
 * Ruta /registro
 * Solo conecta la navegación; UI y lógica en RegisterPage + useRegister.
 */

import { useRouter } from 'expo-router'
import { RegisterPage } from '@/pages/RegisterPage'

export default function RegistroRoute() {
  const router = useRouter()

  return (
    <RegisterPage
      // Tras el alta se va al login: la sesión temporal del registro
      // (necesaria para subir los documentos) se cierra antes de llegar aquí.
      onSuccess={() => router.replace('/login')}
      onLogin={() => router.replace('/login')}
    />
  )
}
