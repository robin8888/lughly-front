/**
 * AuctionCard Organism
 * Una subasta abierta, con su formulario de puja plegado dentro.
 *
 * Es un organism y no una molecule porque contiene estado y una acción sobre
 * el servidor, no solo presentación.
 *
 * **El formulario va aquí y no en una pantalla aparte.** Pujar es comparar:
 * el profesional mira el presupuesto máximo, por dónde va la puja más baja y
 * cuánto queda de plazo, y decide. Sacarlo a otra pantalla le obligaría a
 * memorizar esos tres números o a ir y volver.
 *
 * Lo que **no** está: las fotos del trabajo. Necesitan la pantalla de detalle
 * (Fase 5, Día 19-20); aquí solo se dice cuántas hay.
 */

import { useState } from 'react'
import { View, Text, Pressable } from 'react-native'
import { Button } from '@/components/atoms/Button'
import { Countdown } from '@/components/atoms/Countdown'
import { Input } from '@/components/atoms/Input'
import { Money } from '@/components/atoms/Money'
import { Tag } from '@/components/atoms/Tag'
import { FormField } from '@/components/molecules/FormField'
import { InfoCard } from '@/components/molecules/InfoCard'
import { usePlaceBid } from '@/hooks/domain/usePlaceBid'
import type { ApiOpenJob } from '@/api/bids.api'
import { styles } from './AuctionCard.styles'

export interface AuctionCardProps {
  job: ApiOpenJob
  testID?: string
}

export function AuctionCard({ job, testID }: AuctionCardProps) {
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState(job.myBid ? String(job.myBid.amount) : '')
  const [days, setDays] = useState(
    job.myBid ? String(job.myBid.estimatedDays) : '',
  )
  const [conditions, setConditions] = useState('')

  const { place, isPlacing, fieldErrors, formError, reset } = usePlaceBid()

  const parsedAmount = Number(amount.replace(',', '.'))
  const parsedDays = Number(days)

  const canSend =
    Number.isFinite(parsedAmount) &&
    parsedAmount > 0 &&
    Number.isInteger(parsedDays) &&
    parsedDays >= 1 &&
    !isPlacing

  const handleSend = async () => {
    reset()

    const bid = await place(job.id, {
      amount: parsedAmount,
      estimatedDays: parsedDays,
      ...(conditions.trim() !== '' && { conditions: conditions.trim() }),
    })

    if (bid) setOpen(false)
  }

  return (
    <InfoCard testID={testID}>
      <View style={styles.head}>
        <Text style={styles.title} numberOfLines={2}>
          {job.title}
        </Text>
        {job.myBid && <Tag variant="accent">Ya pujaste</Tag>}
      </View>

      <Text style={styles.meta}>
        {job.tradeLabel} · {job.city}
        {job.photoCount > 0 &&
          ` · ${job.photoCount} ${job.photoCount === 1 ? 'foto' : 'fotos'}`}
      </Text>

      <Text style={styles.description} numberOfLines={open ? undefined : 3}>
        {job.description}
      </Text>

      <View style={styles.numbers}>
        <View style={styles.number}>
          <Text style={styles.numberLabel}>Presupuesto máximo</Text>
          <Text style={styles.numberValue}>
            {job.maxBudget !== null ? (
              <Money amount={job.maxBudget} size="small" style={styles.numberValue} />
            ) : (
              'Sin tope'
            )}
          </Text>
        </View>

        <View style={styles.number}>
          <Text style={styles.numberLabel}>
            {job.bidCount === 0
              ? 'Pujas'
              : job.bidCount === 1
                ? '1 puja · la más baja'
                : `${job.bidCount} pujas · la más baja`}
          </Text>
          <Text style={styles.numberValue}>
            {job.lowestBid !== null ? (
              <Money amount={job.lowestBid} size="small" style={styles.numberValue} />
            ) : (
              'Ninguna todavía'
            )}
          </Text>
        </View>
      </View>

      {/**
       * Cuenta atrás viva y no un texto fijo: en una subasta el plazo es
       * medio argumento para pujar, y verlo correr en la última hora es lo
       * que empuja a decidirse.
       */}
      <Countdown
        target={job.biddingEndsAt}
        prefix="Cierra en"
        expiredLabel="El plazo ya se ha cumplido"
        style={styles.deadline}
        testID={`${testID ?? 'auction'}-countdown`}
      />

      {!open ? (
        <Button
          variant={job.myBid ? 'secondary' : 'primary'}
          fullWidth
          onPress={() => setOpen(true)}
          style={styles.action}
          testID={`${testID ?? 'auction'}-open`}
        >
          {job.myBid ? 'Cambiar mi puja' : 'Pujar'}
        </Button>
      ) : (
        <View style={styles.form}>
          {formError && <Text style={styles.formError}>{formError}</Text>}

          <View style={styles.formRow}>
            <View style={styles.formCol}>
              <FormField label="Tu precio" error={fieldErrors.amount}>
                <Input
                  value={amount}
                  onChangeText={(value) => setAmount(value.replace(/[^0-9.,]/g, ''))}
                  placeholder="180"
                  suffix="€"
                  keyboardType="numeric"
                  editable={!isPlacing}
                  testID={`${testID ?? 'auction'}-amount`}
                />
              </FormField>
            </View>

            <View style={styles.formCol}>
              <FormField label="Días" error={fieldErrors.estimatedDays}>
                <Input
                  value={days}
                  onChangeText={(value) => setDays(value.replace(/[^0-9]/g, ''))}
                  placeholder="Ej. 2"
                  keyboardType="number-pad"
                  editable={!isPlacing}
                  testID={`${testID ?? 'auction'}-days`}
                />
              </FormField>
            </View>
          </View>

          <FormField
            label="Condiciones (opcional)"
            hint="Qué incluye y qué no: materiales, garantía, horario. Es lo que te diferencia del precio más bajo."
            error={fieldErrors.conditions}
          >
            <Input
              value={conditions}
              onChangeText={setConditions}
              placeholder="Ej. Incluye material y garantía de 12 meses."
              multiline
              numberOfLines={3}
              style={styles.textarea}
              editable={!isPlacing}
              testID={`${testID ?? 'auction'}-conditions`}
            />
          </FormField>

          <Button
            fullWidth
            loading={isPlacing}
            disabled={!canSend}
            onPress={() => void handleSend()}
            testID={`${testID ?? 'auction'}-send`}
          >
            {job.myBid ? 'Guardar cambios' : 'Enviar puja'}
          </Button>

          <Pressable
            onPress={() => setOpen(false)}
            disabled={isPlacing}
            accessibilityRole="button"
          >
            <Text style={styles.cancel}>Cancelar</Text>
          </Pressable>
        </View>
      )}
    </InfoCard>
  )
}
