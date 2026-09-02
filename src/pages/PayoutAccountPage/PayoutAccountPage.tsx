/**
 * PayoutAccountPage
 * La cuenta de cobro: dónde se le consigna al profesional el dinero de sus
 * trabajos.
 *
 * ## Por qué existe
 *
 * Porque hasta hoy **no se pedía en ningún sitio**. El único botón para
 * abrirla vivía dentro de «Mis trabajadores» y solo aparecía después de
 * declararse con gente a cargo, así que el autónomo que trabaja solo —la
 * mayoría— se registraba, salía en el directorio, y el cliente que intentaba
 * contratarle se estrellaba contra un «Todavía no se puede contratar: falta
 * completar la cuenta de cobro» que **no podía arreglar ninguno de los dos**.
 *
 * ## Los dos pasos, y por qué son dos
 *
 * 1. **Los datos fiscales**: con qué nombre y qué NIF cobra. Se guardan aquí
 *    porque son nuestros —van en la factura— y porque la cuenta de Stripe se
 *    abre a nombre de ellos.
 * 2. **La cuenta bancaria**, en Stripe y no aquí. El IBAN se teclea en su
 *    formulario, en el navegador, y **no pasa por el servidor de Lughly ni por
 *    este código**. Lo único que vuelve es el identificador de la cuenta. Es
 *    lo mismo que hace la tarjeta del cliente, del otro lado.
 *
 * ## Lo que se le dice
 *
 * Que ahí se le consigna el total de lo que paguen los clientes menos la
 * comisión. No es un detalle de redacción: es la única pantalla donde alguien
 * teclea un número de cuenta, y quien lo hace tiene derecho a saber
 * exactamente qué va a caer ahí y cuándo.
 */

import { useEffect, useState } from 'react'
import { View, Text, ActivityIndicator, Pressable, Alert } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { FormScrollView } from '@/components/templates/FormScrollView'
import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/atoms/Input'
import { Tag } from '@/components/atoms/Tag'
import { FormField } from '@/components/molecules/FormField'
import { InfoCard } from '@/components/molecules/InfoCard'
import { Picker } from '@/components/molecules/Picker'
import {
  useAccountStatus,
  useBillingIdentity,
  useRefreshAccountStatusOnForeground,
  useRequestOnboardingLink,
  useSaveBillingIdentity,
} from '@/hooks/domain/usePaymentAccount'
import { useNavScrollHandler } from '@/hooks/ui/useCompactNav'
import { useTabBarClearance } from '@/hooks/ui/useTabBarClearance'
import { TAX_ID_LABELS, TAX_ID_PLACEHOLDERS, isValidTaxIdOfKind } from '@/utils/taxId'
import { theme } from '@/theme'
import { styles } from './PayoutAccountPage.styles'

export interface PayoutAccountPageProps {
  onBack: () => void
}

/**
 * Los documentos con los que se puede cobrar.
 *
 * El pasaporte no está, y no es un descuido: identifica a una persona pero no
 * sirve para facturar en España, y una factura sin identificador fiscal válido
 * no vale. Por eso este tipo es más estrecho que el del registro.
 */
type BillingTaxIdKind = 'DNI' | 'NIF' | 'NIE' | 'CIF'

const KINDS: BillingTaxIdKind[] = ['DNI', 'NIF', 'NIE', 'CIF']

export function PayoutAccountPage({ onBack }: PayoutAccountPageProps) {
  const onScroll = useNavScrollHandler()
  const tabBarClearance = useTabBarClearance()

  const { data: identity, isPending } = useBillingIdentity()
  const { data: account } = useAccountStatus()
  /*
    Al volver del navegador de Stripe la app no se entera de nada por su
    cuenta: las cuentas `recipient` no avisan por webhook. Se vuelve a
    preguntar cada vez que la app vuelve a primer plano, que es justo lo que
    pasa al terminar allí.
  */
  useRefreshAccountStatusOnForeground(true)

  const { save, isSaving, fieldErrors, formError, reset } = useSaveBillingIdentity()
  const { start, isStarting } = useRequestOnboardingLink()

  const [legalForm, setLegalForm] = useState<'SELF_EMPLOYED' | 'COMPANY'>('SELF_EMPLOYED')
  const [taxIdKind, setTaxIdKind] = useState<BillingTaxIdKind>('DNI')
  const [taxId, setTaxId] = useState('')
  const [legalName, setLegalName] = useState('')
  /** Si está editando unos datos que ya estaban guardados */
  const [editing, setEditing] = useState(false)

  /* Lo guardado, puesto una vez: se corrige, no se vuelve a escribir entero */
  useEffect(() => {
    if (!identity) return

    setLegalForm(identity.legalForm)
    setTaxId(identity.taxId)
    setLegalName(identity.legalName)
    setTaxIdKind(identity.legalForm === 'COMPANY' ? 'CIF' : 'DNI')
  }, [identity])

  /* Una sociedad se identifica con su CIF, y una persona nunca */
  useEffect(() => {
    setTaxIdKind((antes) =>
      legalForm === 'COMPANY' ? 'CIF' : antes === 'CIF' ? 'DNI' : antes,
    )
  }, [legalForm])

  const taxIdError =
    fieldErrors.taxId ??
    (taxId.trim() !== '' && !isValidTaxIdOfKind(taxIdKind, taxId.trim().toUpperCase())
      ? `Ese ${TAX_ID_LABELS[taxIdKind]} no es correcto: revisa el último carácter`
      : undefined)

  const missing = [
    legalName.trim().length < 3 && 'el nombre fiscal',
    taxId.trim() === '' && `tu ${TAX_ID_LABELS[taxIdKind]}`,
  ].filter((entry): entry is string => typeof entry === 'string')

  const canSave = missing.length === 0 && taxIdError === undefined && !isSaving

  const handleSave = async () => {
    reset()

    const saved = await save({
      legalForm,
      taxIdKind,
      taxId: taxId.trim().toUpperCase(),
      legalName: legalName.trim(),
    })

    if (saved) setEditing(false)
  }

  const handleOnboarding = async () => {
    const { ok, error } = await start()

    if (!ok) {
      Alert.alert(
        'No se ha podido abrir la cuenta de cobro',
        error ?? 'Inténtalo de nuevo en un momento.',
      )
    }
  }

  const header = (
    <View style={styles.header}>
      {/* La cabecera ocupa también la franja del sistema: la hora, en claro */}
      <StatusBar style="light" />
      <Pressable onPress={onBack} style={styles.back} accessibilityRole="button">
        <Text style={styles.backIcon}>←</Text>
      </Pressable>
      <Text style={styles.title}>Cuenta de cobro</Text>
    </View>
  )

  if (isPending) {
    return (
      <View style={styles.screen} testID="payout-account-page">
        {header}
        <View style={styles.state} testID="payout-account-loading">
          <ActivityIndicator size="large" color={theme.colors.accent} />
        </View>
      </View>
    )
  }

  const hasIdentity = identity !== null && identity !== undefined && !editing

  return (
    <View style={styles.screen} testID="payout-account-page">
      {header}

      <FormScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={[styles.content, { paddingBottom: tabBarClearance }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/**
         * Qué es esto, dicho antes de pedir nada. Quien va a teclear un número
         * de cuenta tiene derecho a saber qué va a caer ahí y cuándo.
         */}
        <InfoCard testID="payout-account-what">
          <Text style={styles.leadTitle}>Dónde cobras tus trabajos</Text>
          <Text style={styles.lead}>
            Aquí se te consigna el <Text style={styles.strong}>total de cada trabajo
            que te pague un cliente</Text>, menos la comisión de la plataforma. El
            cliente paga al reservar y el importe se queda retenido; cuando el
            trabajo se da por bueno, el dinero pasa a tu cuenta.
          </Text>
          <Text style={styles.leadNote}>
            La cuenta bancaria la tecleas en el formulario de Stripe, que es
            quien hace las transferencias. No pasa por Lughly ni la guardamos:
            aquí solo quedan tu nombre fiscal y tu NIF, que son los que van en
            la factura.
          </Text>
        </InfoCard>

        {formError && <Text style={styles.formError}>{formError}</Text>}

        {/* Paso 1: con qué nombre cobra */}
        {hasIdentity ? (
          <InfoCard testID="payout-account-identity">
            <Text style={styles.cardTitle}>Cobras como</Text>
            <Text style={styles.identityName}>{identity.legalName}</Text>
            <Text style={styles.identityMeta}>
              {identity.legalForm === 'COMPANY' ? 'Empresa' : 'Autónomo'} ·{' '}
              {identity.taxId}
            </Text>

            <Pressable
              onPress={() => setEditing(true)}
              accessibilityRole="button"
              testID="payout-account-edit"
            >
              <Text style={styles.link}>Corregir estos datos</Text>
            </Pressable>
          </InfoCard>
        ) : (
          <InfoCard testID="payout-account-form">
            <Text style={styles.cardTitle}>Con qué nombre cobras</Text>

            <FormField label="Trabajas como" error={fieldErrors.legalForm}>
              <Picker
                options={[
                  { value: 'SELF_EMPLOYED', label: 'Autónomo' },
                  { value: 'COMPANY', label: 'Empresa' },
                ]}
                value={legalForm}
                onChange={(value) => setLegalForm(value as 'SELF_EMPLOYED' | 'COMPANY')}
                title="Trabajas como"
                disabled={isSaving}
                testID="payout-account-legal-form"
              />
            </FormField>

            <FormField
              label={legalForm === 'COMPANY' ? 'Razón social' : 'Nombre fiscal'}
              hint="Como aparece en tus facturas."
              error={fieldErrors.legalName}
            >
              <Input
                value={legalName}
                onChangeText={setLegalName}
                placeholder={legalForm === 'COMPANY' ? 'Reformas Ruiz S.L.' : 'Rocío Vega Pérez'}
                autoCapitalize="words"
                editable={!isSaving}
                error={Boolean(fieldErrors.legalName)}
                testID="payout-account-legal-name"
              />
            </FormField>

            {legalForm !== 'COMPANY' && (
              <FormField label="Documento" error={fieldErrors.taxIdKind}>
                <Picker
                  options={KINDS.filter((kind) => kind !== 'CIF').map((kind) => ({
                    value: kind,
                    label: TAX_ID_LABELS[kind],
                  }))}
                  value={taxIdKind}
                  onChange={(value) => setTaxIdKind(value as BillingTaxIdKind)}
                  title="Con qué documento te identificas"
                  disabled={isSaving}
                  testID="payout-account-tax-id-kind"
                />
              </FormField>
            )}

            <FormField
              label={legalForm === 'COMPANY' ? 'CIF' : `Número de ${TAX_ID_LABELS[taxIdKind]}`}
              error={taxIdError}
            >
              <Input
                value={taxId}
                onChangeText={(value) => setTaxId(value.toUpperCase())}
                placeholder={TAX_ID_PLACEHOLDERS[taxIdKind]}
                autoCapitalize="characters"
                autoCorrect={false}
                editable={!isSaving}
                error={Boolean(taxIdError)}
                testID="payout-account-tax-id"
              />
            </FormField>

            <Button
              fullWidth
              loading={isSaving}
              disabled={!canSave}
              onPress={() => void handleSave()}
              testID="payout-account-save"
            >
              Guardar
            </Button>

            {!canSave && !isSaving && missing.length > 0 && (
              <Text style={styles.missing} testID="payout-account-missing">
                {missing.length === 1
                  ? `Falta ${missing[0]}.`
                  : `Faltan ${missing.slice(0, -1).join(', ')} y ${missing[missing.length - 1]}.`}
              </Text>
            )}
          </InfoCard>
        )}

        {/**
         * Paso 2: la cuenta bancaria, en Stripe. Solo cuando ya hay datos
         * fiscales: la cuenta se abre a nombre de ellos, y ofrecerlo antes
         * sería mandar a alguien a un formulario que va a fallar.
         */}
        {identity && (
          <InfoCard testID="payout-account-bank">
            <Text style={styles.cardTitle}>Tu cuenta bancaria</Text>

            {account?.transfersEnabled ? (
              <>
                <Tag variant="available">Lista para recibir tu dinero</Tag>
                <Text style={styles.bankNote}>
                  {account.payoutsEnabled
                    ? 'Stripe te transfiere el saldo a tu banco automáticamente.'
                    : 'Ya puedes cobrar. Para que el saldo salga a tu banco, termina los datos bancarios en Stripe.'}
                </Text>
              </>
            ) : (
              <Text style={styles.bankWarning}>
                {account?.hasAccount
                  ? 'La tienes a medias: hasta que la termines no se te puede contratar.'
                  : 'Todavía no la has dado. Sin ella no se te puede contratar, porque no habría dónde pagarte.'}
              </Text>
            )}

            {!account?.transfersEnabled || !account.payoutsEnabled ? (
              <Button
                variant="secondary"
                loading={isStarting}
                onPress={() => void handleOnboarding()}
                testID="payout-account-onboarding"
              >
                {account?.hasAccount ? 'Terminar en Stripe' : 'Añadir mi cuenta bancaria'}
              </Button>
            ) : null}

            <Text style={styles.bankNote}>
              Se abre el formulario de Stripe en el navegador. Te pedirá tu IBAN
              y unos datos para verificar tu identidad, como exige la ley a
              cualquiera que reciba pagos.
            </Text>
          </InfoCard>
        )}
      </FormScrollView>
    </View>
  )
}
