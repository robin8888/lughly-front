/**
 * Ruta /recuperar
 * Solo conecta la navegación; UI y lógica en PasswordResetPage.
 */

import { useRouter } from 'expo-router'
import { PasswordResetPage } from '@/pages/PasswordResetPage'

export default function RecuperarRoute() {
  const router = useRouter()

  return <PasswordResetPage onBackToLogin={() => router.replace('/login')} />
}
