/**
 * Ruta /login
 * Solo conecta la navegación; la UI y la lógica viven en LoginPage + useLogin.
 */

import { useRouter } from 'expo-router'
import { LoginPage } from '@/pages/LoginPage'

export default function LoginRoute() {
  const router = useRouter()

  return (
    <LoginPage
      onSuccess={() => router.replace('/inicio')}
      onRegister={() => router.replace('/registro')}
      onForgotPassword={() => router.push('/recuperar')}
    />
  )
}
