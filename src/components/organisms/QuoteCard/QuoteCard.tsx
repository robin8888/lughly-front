/**
 * QuoteCard Organism
 * El presupuesto, tal y como lo leen los dos (`CICLOS` §C5).
 *
 * **La misma tarjeta para el cliente y para el profesional**, y a propósito:
 * un presupuesto es un documento entre dos, y dos versiones distintas del
 * mismo papel es exactamente lo que produce la discusión que esto viene a
 * evitar. Lo único que cambia según quién mire son los botones de debajo, que
 * los pone la pantalla.
 *
 * **Las líneas se enseñan enteras**: «3 × 12,50 € = 37,50 €». Un total a secas
 * hay que creérselo; una columna se comprueba. Y el descuento de la visita va
 * en su propia línea, porque es dinero que el cliente ya puso y que si no se
 * dice parece que no se le ha tenido en cuenta.
 */

import { View, Text } from 'react-native'
import { InfoCard } from '@/components/molecules/InfoCard'
import { formatAmount } from '@/components/atoms/Money'
import type { ApiJobQuote, ApiQuoteLineKind } from '@/api/jobs.api'
import { styles } from './QuoteCard.styles'

const KIND_LABEL: Record<ApiQuoteLineKind, string> = {
  LABOUR: 'Mano de obra',
  MATERIALS: 'Material',
  OTHER: 'Otros',
}

/**
 * En qué punto está, dicho para quien lo lee y no con el nombre del estado.
 *
 * `SUPERSEDED` no es un "no": es que llegó otra versión. Llamarlo "rechazado"
 * dejaría en la ficha un rechazo que el cliente nunca hizo.
 */
function estadoDe(quote: ApiJobQuote): { label: string; tone: 'open' | 'closed' | 'done' } {
  switch (quote.status) {
    case 'SENT':
      return { label: 'Pendiente de respuesta', tone: 'open' }
    case 'ACCEPTED':
      return { label: 'Aceptado', tone: 'done' }
    case 'REJECTED':
      return { label: 'Rechazado', tone: 'closed' }
    case 'EXPIRED':
      return { label: 'Caducado', tone: 'closed' }
    case 'SUPERSEDED':
      return { label: 'Sustituido por otra versión', tone: 'closed' }
  }
}

/** «hasta el 22 de septiembre», que es como se dice un plazo */
function hasta(iso: string): string {
  const date = new Date(iso)

  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })
}

export interface QuoteCardProps {
  quote: ApiJobQuote
  /** Los botones de contestar, que dependen de quién mire */
  children?: React.ReactNode
  testID?: string
}

export function QuoteCard({ quote, children, testID = 'quote-card' }: QuoteCardProps) {
  const estado = estadoDe(quote)
  const vencido = new Date(quote.validUntil) <= new Date()

  return (
    <InfoCard style={styles.card} testID={testID}>
      <View style={styles.header}>
        <Text style={styles.version}>Presupuesto v{quote.version}</Text>
        <Text style={[styles.status, styles[estado.tone]]}>{estado.label}</Text>
      </View>

      <View style={styles.lines}>
        {quote.lines.map((line, index) => (
          <View key={`${line.concept}-${index}`} style={styles.line}>
            <View style={styles.lineText}>
              <Text style={styles.concept}>{line.concept}</Text>
              <Text style={styles.detail}>
                {KIND_LABEL[line.kind]}
                {/*
                  El «1 ×» no se escribe: en la mayoría de las líneas la
                  cantidad es una, y decirlo en todas convierte la columna en
                  ruido justo donde hay que fijarse.
                */}
                {line.quantity !== 1
                  ? ` · ${line.quantity} × ${formatAmount(line.unitPrice)} €`
                  : ''}
              </Text>
            </View>
            <Text style={styles.amount}>{formatAmount(line.amount)} €</Text>
          </View>
        ))}
      </View>

      {quote.visitCredit > 0 && (
        <>
          <View style={styles.line}>
            <Text style={styles.subtotalLabel}>Suma</Text>
            <Text style={styles.subtotal}>{formatAmount(quote.linesTotal)} €</Text>
          </View>
          {/*
            El descuento, en negativo y con su porqué. Sin esta línea, quien
            pagó 30 € por la visita ve un total que no cuadra con la columna y
            piensa que se le ha olvidado a alguien.
          */}
          <View style={styles.line}>
            <Text style={styles.subtotalLabel}>Visita ya pagada</Text>
            <Text style={styles.credit}>−{formatAmount(quote.visitCredit)} €</Text>
          </View>
        </>
      )}

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.total}>{formatAmount(quote.total)} €</Text>
      </View>

      {quote.materialsUpfront && (
        <Text style={styles.note}>
          El material se paga al aceptar, antes de empezar: se retiene hasta que
          esté comprado.
        </Text>
      )}

      {quote.status === 'SENT' && (
        <Text style={[styles.note, vencido && styles.noteExpired]}>
          {vencido
            ? 'Se ha pasado de plazo.'
            : `Válido hasta el ${hasta(quote.validUntil)}.`}
        </Text>
      )}

      {/*
        El motivo del rechazo, dentro de la propia tarjeta. Es la mitad de la
        conversación: sin él, la versión siguiente aparece de la nada y nadie
        recuerda por qué ésta no valía.
      */}
      {quote.rejectionReason && (
        <Text style={styles.reason} testID={`${testID}-reason`}>
          «{quote.rejectionReason}»
        </Text>
      )}

      {children}
    </InfoCard>
  )
}
