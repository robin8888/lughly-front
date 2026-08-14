/**
 * ComingSoonPage
 * Marcador para pantallas aún no implementadas.
 * Mantiene la navegación completa y honesta mientras avanza el ROADMAP:
 * la barra de pestañas funciona y cada destino dice qué falta.
 */

import { ScreenShell } from '@/components/templates/ScreenShell'

export interface ComingSoonPageProps {
  title: string
  /** Día del ROADMAP en el que se construye esta pantalla */
  roadmap: string
  testID?: string
}

export function ComingSoonPage({ title, roadmap, testID }: ComingSoonPageProps) {
  return (
    <ScreenShell
      title={title}
      empty={{ message: `Esta pantalla se construye en ${roadmap}.` }}
      testID={testID}
    >
      {null}
    </ScreenShell>
  )
}
