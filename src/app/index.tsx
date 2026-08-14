/**
 * Ruta raíz "/"
 * - Con sesión activa → tabs
 * - Sin sesión → pantalla de entrada (Splash) con Registrarse / Iniciar sesión
 *
 * Ojo: esta ruta y `(tabs)/inicio.tsx` NO deben llamarse igual. Los grupos
 * entre paréntesis no añaden segmento a la URL, así que un
 * `(tabs)/index.tsx` reclamaría también "/" y ganaría a esta pantalla.
 */

import { Redirect, useRouter } from 'expo-router'
import { SplashPage } from '@/pages/SplashPage'
import { useIsAuthenticated } from '@/stores/useAuthStore'

export default function Index() {
  const router = useRouter()
  const isAuthenticated = useIsAuthenticated()

  if (isAuthenticated) {
    return <Redirect href="/inicio" />
  }

  return (
    <SplashPage
      onRegister={() => router.push('/registro')}
      onLogin={() => router.push('/login')}
    />
  )
}
