/**
 * EmployeesPage
 * Los trabajadores que tiene a su cargo un autónomo o una empresa.
 *
 * La lista y el formulario van juntos: quien entra aquí viene a dar de alta
 * a alguien, y sacar el formulario a otra pantalla añadiría un paso a la
 * única acción de la página.
 *
 * **No se piden documentos.** Solo datos. El trabajador sube su DNI desde su
 * propio móvil al entrar, que es donde no cuesta nada; pedirle a una empresa
 * que fotografíe cincuenta documentos desde un formulario es garantizar que
 * no da de alta a nadie.
 */

import { useState } from 'react'
import { View, Text, ActivityIndicator, Pressable, Alert } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import Animated from 'react-native-reanimated'
import { useNavScrollHandler } from '@/hooks/ui/useCompactNav'
import { useTabBarClearance } from '@/hooks/ui/useTabBarClearance'
import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/atoms/Input'
import { Tag } from '@/components/atoms/Tag'
import { Checkbox } from '@/components/atoms/Checkbox'
import { EmptyState } from '@/components/molecules/EmptyState'
import { FormField } from '@/components/molecules/FormField'
import { InfoCard } from '@/components/molecules/InfoCard'
import { Picker } from '@/components/molecules/Picker'
import { TradeRatesField, type TradeRate } from '@/components/molecules/TradeRatesField'
import {
  useEmployees,
  useEmployer,
  useCreateEmployee,
  useRemoveEmployee,
  useBecomeEmployer,
} from '@/hooks/domain/useEmployees'
import {
  useAccountStatus,
  useRefreshAccountStatusOnForeground,
  useRequestOnboardingLink,
} from '@/hooks/domain/usePaymentAccount'
import type { LegalForm } from '@/api/employees.api'
import { TRADE_OPTIONS } from '@/utils/trades'
import { theme } from '@/theme'
import { styles } from './EmployeesPage.styles'
import { useUser } from '@/stores/useAuthStore'
import {
  TAX_ID_LABELS,
  TAX_ID_PLACEHOLDERS,
  isValidTaxIdOfKind,
  type TaxIdKind,
} from '@/utils/taxId'

const EMPTY_FORM = {
  name: '',
  email: '',
  phone: '',
  nationalId: '',
  city: '',
}

const EMPTY_EMPLOYER_FORM = {
  legalForm: '' as '' | LegalForm,
  legalName: '',
  taxIdKind: '' as '' | TaxIdKind,
  taxId: '',
}

/**
 * Con qué documento se identifica una persona física.
 *
 * DNI y NIF son el mismo número —el NIF es el DNI con su letra— y se validan
 * igual. Están los dos porque es como los llama la gente: obligar a elegir el
 * nombre "correcto" hace dudar sobre un dato que se tiene delante.
 *
 * Una sociedad no elige: se identifica con su CIF y punto, así que ahí el
 * selector no sale.
 */
const TAX_ID_KIND_OPTIONS: { value: TaxIdKind; label: string }[] = [
  { value: 'DNI', label: 'DNI' },
  { value: 'NIF', label: 'NIF' },
  { value: 'NIE', label: 'NIE' },
  { value: 'PASSPORT', label: 'Pasaporte' },
]

const LEGAL_FORM_OPTIONS = [
  { value: 'SELF_EMPLOYED', label: 'Autónomo — trabajo por mi cuenta' },
  { value: 'COMPANY', label: 'Empresa — sociedad con CIF' },
]

export interface EmployeesPageProps {
  onBack: () => void
  /** Al horario de urgencias de ese trabajador */
  onUrgencySchedule: (employeeId: string, employeeName: string) => void
  /**
   * A lo demás que la empresa le lleva: su horario de trabajo, su zona y sus
   * días fuera. Hasta hoy solo podía fijarle las urgencias, y en las otras tres
   * pantallas al trabajador se le decía "esto lo pone tu empresa" sin que la
   * empresa tuviera dónde.
   */
  onEmployeeSetting: (
    setting: 'horario' | 'zona' | 'ausencias' | 'recargos' | 'festivos',
    employeeId: string,
    employeeName: string,
  ) => void
}

/**
 * Alta como empleador. Es lo mismo que se pregunta en el registro, aquí para
 * quien entonces dijo que no —o para quien no llegó a guardarse—. Solo se
 * piden los datos fiscales: el resto ya está en su cuenta.
 */
function EmployerForm({ onBack }: { onBack: () => void }) {
  const { declare, isDeclaring, fieldErrors, formError, reset } = useBecomeEmployer()
  const user = useUser()

  /**
   * El nombre fiscal viene puesto con el de su cuenta.
   *
   * Para un autónomo son la misma cosa —su nombre fiscal es su nombre— así que
   * pedírselo otra vez es pedirle que copie algo que ya nos dio al
   * registrarse. Queda editable: hay quien factura con los dos apellidos
   * completos y en la app puso solo uno.
   *
   * El NIF **no** se puede rellenar: no se guarda en ninguna parte hasta que
   * existe este `Employer`, que es justo lo que este formulario crea. Es el
   * único de los tres que hay que escribir.
   */
  const [form, setForm] = useState({
    ...EMPTY_EMPLOYER_FORM,
    legalName: user?.name ?? '',
  })
  const [accepts, setAccepts] = useState(false)

  const isCompany = form.legalForm === 'COMPANY'

  /**
   * Al pasar a empresa, el nombre puesto se retira **si no lo han tocado**.
   *
   * Una razón social no es el nombre de una persona: dejar "Felipe Riaño" en
   * el campo de una S.L. es peor que dejarlo vacío, porque parece rellenado a
   * conciencia y se firma sin mirar.
   */
  const elegirForma = (value: LegalForm) => {
    setForm((current) => ({
      ...current,
      legalForm: value,
      legalName:
        value === 'COMPANY' && current.legalName === (user?.name ?? '')
          ? ''
          : current.legalName,
    }))
  }

  /* Una sociedad va siempre con CIF; una persona elige entre los cuatro */
  const taxIdKind: TaxIdKind | '' = isCompany ? 'CIF' : form.taxIdKind

  /**
   * Qué falta para poder continuar.
   *
   * El botón se apagaba sin decir por qué, y este formulario tiene cinco
   * requisitos: es imposible adivinar cuál falla. Pasa sobre todo con el
   * documento —es un campo nuevo y se pasa por alto— y con la casilla, que
   * queda debajo del identificador y fuera de vista mientras se teclea.
   *
   * Es el mismo arreglo que el horario de urgencias: la validación estaba
   * bien, lo que faltaba era decirlo donde se mira.
   */
  const problemas: string[] = []

  if (form.legalForm === '') problemas.push('Elige si trabajas como autónomo o como empresa.')

  if (form.legalName.trim().length < 3) {
    problemas.push(
      isCompany ? 'Escribe la razón social.' : 'Escribe tu nombre fiscal.',
    )
  }

  if (taxIdKind === '') {
    problemas.push('Elige con qué documento te identificas.')
  } else if (!isValidTaxIdOfKind(taxIdKind, form.taxId)) {
    problemas.push(
      form.taxId.trim() === ''
        ? `Escribe tu número de ${TAX_ID_LABELS[taxIdKind]}.`
        : taxIdKind === 'PASSPORT'
          ? 'Ese número de pasaporte no tiene una forma válida.'
          : `Ese ${TAX_ID_LABELS[taxIdKind]} no es correcto: revisa el último carácter.`,
    )
  }

  if (!accepts) problemas.push('Marca que respondes ante los clientes de tus trabajadores.')

  const canSubmit = problemas.length === 0 && !isDeclaring

  const handleSubmit = async () => {
    reset()

    // El botón está deshabilitado sin forma jurídica; esto es para el tipo.
    if (form.legalForm === '') return

    await declare({
      legalForm: form.legalForm,
      legalName: form.legalName.trim(),
      taxIdKind: taxIdKind as TaxIdKind,
      taxId: form.taxId.trim().toUpperCase(),
      acceptsStaffResponsibility: true,
    })
  }

  return (
    <InfoCard testID="employer-form">
      <Text style={styles.formTitle}>Trabajadores a tu cargo</Text>
      <Text style={styles.formIntro}>
        Para dar de alta a alguien necesitamos tus datos fiscales: la factura
        del trabajo la emites tú, no la persona que lo ejecuta. Es lo mismo
        para un autónomo con un oficial que para una empresa con veinte.
      </Text>

      {formError && <Text style={styles.formError}>{formError}</Text>}

      <FormField
        label="Trabajas como"
        hint="Solo cambia si el identificador es un NIF o un CIF."
        error={fieldErrors.legalForm}
      >
        <Picker
          options={LEGAL_FORM_OPTIONS}
          value={form.legalForm === '' ? null : form.legalForm}
          onChange={(value) => elegirForma(value as LegalForm)}
          placeholder="Autónomo o empresa"
          title="Trabajas como"
          testID="employer-legal-form"
        />
      </FormField>

      <FormField
        label={isCompany ? 'Razón social' : 'Nombre fiscal'}
        hint={
          isCompany
            ? 'Es el nombre que verá el cliente encabezando la ficha de cada uno de tus trabajadores.'
            : 'Lo hemos puesto con el de tu cuenta. Cámbialo si facturas con otro.'
        }
        error={fieldErrors.legalName}
      >
        <Input
          value={form.legalName}
          onChangeText={(value) =>
            setForm((current) => ({ ...current, legalName: value }))
          }
          placeholder={
            isCompany ? 'Ej. Instalaciones Ruiz S.L.' : 'Ej. Miguel Ruiz Navarro'
          }
          autoCapitalize="words"
          editable={!isDeclaring}
          testID="employer-legal-name"
        />
      </FormField>

      {/**
        * Primero **con qué documento**, y después el número.
        *
        * Se pregunta en vez de adivinarse por el pasaporte: no se puede
        * comprobar —no lleva dígito de control y cada país numera a su
        * manera—, así que deduciendo la clase del número habría que aceptar
        * como pasaporte cualquier cosa que no encajara en las formas
        * españolas, incluido un NIF con una cifra de menos. Sabiendo la clase,
        * cada uno se valida con su regla.
        *
        * Una sociedad no elige: va con su CIF y el selector no sale.
        */}
      {!isCompany && (
        <FormField
          label="Documento"
          hint="El NIF es el número de tu DNI con su letra: son el mismo."
          error={fieldErrors.taxIdKind}
        >
          <Picker
            options={TAX_ID_KIND_OPTIONS}
            value={form.taxIdKind === '' ? null : form.taxIdKind}
            onChange={(value) =>
              setForm((current) => ({ ...current, taxIdKind: value as TaxIdKind }))
            }
            placeholder="DNI, NIF, NIE o pasaporte"
            title="Con qué documento te identificas"
            testID="employer-tax-id-kind"
          />
        </FormField>
      )}

      <FormField
        label={taxIdKind === '' ? 'Número' : `Número de ${TAX_ID_LABELS[taxIdKind]}`}
        hint={
          taxIdKind === 'PASSPORT'
            ? 'Un pasaporte no se puede comprobar, así que revísalo bien antes de seguir.'
            : undefined
        }
        error={fieldErrors.taxId}
      >
        <Input
          value={form.taxId}
          onChangeText={(value) =>
            setForm((current) => ({ ...current, taxId: value.toUpperCase() }))
          }
          placeholder={taxIdKind === '' ? '' : TAX_ID_PLACEHOLDERS[taxIdKind]}
          autoCapitalize="characters"
          autoCorrect={false}
          editable={!isDeclaring}
          testID="employer-tax-id"
        />
      </FormField>

      <Checkbox
        checked={accepts}
        onChange={setAccepts}
        disabled={isDeclaring}
        testID="employer-responsibility"
      >
        <Text style={styles.responsibility}>
          Respondo ante los clientes de Lughly de las personas que dé de alta.
          Por eso no les pedimos documentación por adelantado.
        </Text>
      </Checkbox>

      {/*
        Lo que falta, justo encima del botón: es donde se mira cuando no se
        puede pulsar. Los avisos de cada campo siguen estando; la diferencia es
        que estos se ven sin tener que subir a buscarlos.
      */}
      {problemas.length > 0 && (
        <View style={styles.missing} testID="employer-missing">
          {problemas.map((problema) => (
            <Text key={problema} style={styles.missingText}>
              {problema}
            </Text>
          ))}
        </View>
      )}

      <Button
        fullWidth
        loading={isDeclaring}
        disabled={!canSubmit}
        onPress={() => void handleSubmit()}
        testID="employer-submit"
      >
        Continuar
      </Button>

      <Pressable onPress={onBack} disabled={isDeclaring} accessibilityRole="button">
        <Text style={styles.cancel}>Ahora no</Text>
      </Pressable>
    </InfoCard>
  )
}

export function EmployeesPage({
  onBack,
  onUrgencySchedule,
  onEmployeeSetting,
}: EmployeesPageProps) {
  /**
   * La barra inferior se encoge al bajar y vuelve al subir. Va en todas
   * las pantallas con scroll, no solo en el inicio: si en una se moviera
   * y en la siguiente no, parecería que la barra falla.
   */
  const onScroll = useNavScrollHandler()
  const tabBarClearance = useTabBarClearance()

  const { data: employerData, isPending: loadingEmployer } = useEmployer()
  const employer = employerData?.employer ?? null

  /**
   * Sin darse de alta como empleador no hay trabajadores que listar y el
   * backend responde 403. Se espera a saberlo antes de preguntar.
   */
  const { data, isPending, isError, refetch } = useEmployees(employer !== null)
  const { create, isCreating, fieldErrors, formError, reset } = useCreateEmployee()
  const { remove, isRemoving, resetRemove } = useRemoveEmployee()

  /**
   * Sin cuenta de cobro no se puede contratar (COMO_SE_CONTRATA.md v3 §9):
   * se enseña su estado aquí, donde ya está lo demás que sostiene poder
   * cobrar por la app.
   */
  const { data: accountStatus } = useAccountStatus(employer !== null)
  useRefreshAccountStatusOnForeground(employer !== null)
  const { start: startOnboarding, isStarting: isStartingOnboarding } =
    useRequestOnboardingLink()

  const handleOnboarding = async () => {
    const { ok, error } = await startOnboarding()
    if (!ok) {
      Alert.alert(
        'No se ha podido abrir la cuenta de cobro',
        error ?? 'Inténtalo de nuevo en un momento.',
      )
    }
  }

  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [trades, setTrades] = useState<TradeRate[]>([])

  const employees = data?.items ?? []

  const set = (patch: Partial<typeof EMPTY_FORM>) =>
    setForm((current) => ({ ...current, ...patch }))

  /** La coma decimal es lo que se teclea aquí */
  const rateOf = (value: string) => Number(value.replace(',', '.'))

  const canSubmit =
    form.name.trim().length >= 3 &&
    form.email.trim() !== '' &&
    form.phone.trim() !== '' &&
    form.nationalId.trim() !== '' &&
    trades.length > 0 &&
    trades.every((trade) => rateOf(trade.hourlyRate) > 0) &&
    form.city.trim().length >= 2 &&
    !isCreating

  const handleCreate = async () => {
    reset()

    const employee = await create({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      nationalId: form.nationalId.trim(),
      trades: trades.map((trade) => ({
        slug: trade.slug,
        hourlyRate: rateOf(trade.hourlyRate),
        /* Lo que el cliente leerá en su ficha, por oficio */
        description: trade.description.trim(),
      })),
      city: form.city.trim(),
    })

    if (!employee) return

    setForm(EMPTY_FORM)
    setTrades([])
    setOpen(false)

    Alert.alert(
      'Trabajador dado de alta',
      `Le hemos enviado un correo a ${employee.email} con su usuario y una contraseña temporal. Tendrá que cambiarla la primera vez que entre.`,
    )
  }

  const header = (
    <View style={styles.header}>
      {/* La cabecera ocupa también la franja del sistema: la hora, en claro */}
      <StatusBar style="light" />
      <Pressable onPress={onBack} style={styles.back} accessibilityRole="button">
        <Text style={styles.backIcon}>←</Text>
      </Pressable>
      <Text style={styles.title}>Mis trabajadores</Text>
    </View>
  )

  /**
   * Se pregunta antes: dar de baja cierra su cuenta y le echa de la app en
   * ese momento. El texto dice qué pasa con lo que ya hizo, porque es la
   * duda razonable de quien va a pulsar.
   */
  const confirmRemove = (id: string, name: string) => {
    resetRemove()

    Alert.alert(
      `Dar de baja a ${name}`,
      'Dejará de aparecer en el directorio y no podrá entrar. Sus valoraciones y los trabajos que hizo se quedan como están: son de los clientes que los contrataron.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Dar de baja',
          style: 'destructive',
          onPress: () => {
            void remove(id).then(({ ok, error }) => {
              if (ok) return

              // El motivo del servidor tal cual: casi siempre es accionable
              Alert.alert(
                'No se ha podido dar de baja',
                error ?? 'Inténtalo de nuevo en un momento.',
              )
            })
          },
        },
      ],
    )
  }

  if (loadingEmployer) {
    return (
      <View style={styles.screen} testID="employees-page">
        {header}
        <View style={styles.state} testID="employees-loading">
          <ActivityIndicator size="large" color={theme.colors.accent} />
        </View>
      </View>
    )
  }

  /**
   * Quien no se declaró empleador en el registro llega aquí sin nada. Se le
   * pide ahora: un autónomo que empieza solo y contrata al primero un año
   * después no debería tener que crearse otra cuenta.
   */
  if (!employer) {
    return (
      <View style={styles.screen} testID="employees-page">
        {header}
        <Animated.ScrollView
          onScroll={onScroll}
          scrollEventThrottle={16}
          contentContainerStyle={[styles.content, { paddingBottom: tabBarClearance }]}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets
          showsVerticalScrollIndicator={false}
        >
          <EmployerForm onBack={onBack} />
        </Animated.ScrollView>
      </View>
    )
  }

  return (
    <View style={styles.screen} testID="employees-page">
      {header}

      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={[styles.content, { paddingBottom: tabBarClearance }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {employer && (
          <InfoCard style={styles.employerCard}>
            <Text style={styles.employerName}>{employer.legalName}</Text>
            <Text style={styles.employerMeta}>
              {employer.legalForm === 'COMPANY' ? 'Empresa' : 'Autónomo'} ·{' '}
              {employer.taxId}
            </Text>
            {employer.trades.length > 0 && (
              <Text style={styles.employerTrades}>
                Oficios que cubres: {employer.trades.length}. Salen de tus
                trabajadores, no se declaran.
              </Text>
            )}

            <View style={styles.accountRow}>
              {accountStatus?.transfersEnabled ? (
                <Tag variant="available">Cuenta de cobro activa</Tag>
              ) : (
                <>
                  <Text style={styles.accountWarning}>
                    {accountStatus?.hasAccount
                      ? 'Cuenta de cobro sin terminar: todavía no puedes cobrar por la app.'
                      : 'Todavía no tienes cuenta de cobro: sin ella no puedes cobrar por la app.'}
                  </Text>
                  <Pressable
                    onPress={() => void handleOnboarding()}
                    disabled={isStartingOnboarding}
                    style={styles.accountAction}
                    accessibilityRole="button"
                    testID="employer-connect-onboarding"
                  >
                    <Text style={styles.accountActionText}>
                      {isStartingOnboarding
                        ? 'Abriendo…'
                        : accountStatus?.hasAccount
                          ? 'Terminar cuenta de cobro'
                          : 'Configurar cuenta de cobro'}
                    </Text>
                  </Pressable>
                </>
              )}
            </View>
          </InfoCard>
        )}

        {isPending ? (
          <View style={styles.state} testID="employees-loading">
            <ActivityIndicator size="large" color={theme.colors.accent} />
          </View>
        ) : isError ? (
          <EmptyState
            title="No hemos podido cargar tus trabajadores"
            message="Revisa tu conexión e inténtalo de nuevo."
            actions={[
              { label: 'Reintentar', onPress: () => void refetch(), testID: 'employees-retry' },
            ]}
            testID="employees-error"
          />
        ) : (
          <>
            {employees.length === 0 ? (
              <EmptyState
                title="Todavía no has dado de alta a nadie"
                message="Cada trabajador tendrá su propia cuenta y aparecerá en el directorio con tu nombre encima. Tú gestionas y facturas; ellos ejecutan."
                testID="employees-empty"
              />
            ) : (
              <>
                <Text style={styles.count}>
                  {employees.length}{' '}
                  {employees.length === 1 ? 'trabajador' : 'trabajadores'}
                </Text>

                <View style={styles.list}>
                  {employees.map((employee) => (
                    <InfoCard key={employee.id} testID={`employee-${employee.id}`}>
                      <View style={styles.employeeHead}>
                        <Text style={styles.employeeName}>{employee.name}</Text>
                        {employee.identityVerified ? (
                          <Tag variant="available">Verificado</Tag>
                        ) : (
                          <Tag variant="outline">Sin verificar</Tag>
                        )}
                      </View>

                      <Text style={styles.employeeMeta}>
                        {employee.trades.map((trade) => trade.label).join(' · ')} ·{' '}
                        {employee.city}
                      </Text>
                      <Text style={styles.employeeContact}>
                        {employee.email}
                        {employee.phone && ` · ${employee.phone}`}
                      </Text>

                      {employee.pendingFirstLogin && (
                        <Text style={styles.pending}>
                          Todavía no ha entrado. Sigue con la contraseña
                          temporal que le enviamos por correo.
                        </Text>
                      )}

                      {!employee.identityVerified && (
                        <Text style={styles.unverified}>
                          Hasta que suba su DNI aparece como acreditado por ti
                          y no puede aceptar urgencias.
                        </Text>
                      )}

                      {/**
                       * Dentro de estas horas el cliente le asigna urgencias
                       * directamente, sin pasar por el empleador. Va en su
                       * ficha porque es un ajuste de esa persona, no de la
                       * empresa: cada uno tiene el suyo.
                       */}
                      {/*
                        Los cuatro ajustes que le lleva la empresa, con forma de
                        botón. Eran cuatro líneas de texto seguidas y se leían
                        como un párrafo con flechas, no como cuatro cosas que se
                        pueden tocar.

                        El de urgencias va el primero porque es el único que
                        decide si un cliente puede llamar a su puerta sin pasar
                        por la empresa.
                      */}
                      <View style={styles.settings}>
                        <Pressable
                          onPress={() => onUrgencySchedule(employee.id, employee.name)}
                          disabled={isRemoving}
                          accessibilityRole="button"
                          style={styles.setting}
                          testID={`employee-schedule-${employee.id}`}
                        >
                          <Text style={styles.settingText}>Horario de urgencias</Text>
                        </Pressable>

                        <Pressable
                          onPress={() =>
                            onEmployeeSetting('horario', employee.id, employee.name)
                          }
                          disabled={isRemoving}
                          accessibilityRole="button"
                          style={styles.setting}
                          testID={`employee-availability-${employee.id}`}
                        >
                          <Text style={styles.settingText}>Horario de trabajo</Text>
                        </Pressable>

                        <Pressable
                          onPress={() =>
                            onEmployeeSetting('zona', employee.id, employee.name)
                          }
                          disabled={isRemoving}
                          accessibilityRole="button"
                          style={styles.setting}
                          testID={`employee-coverage-${employee.id}`}
                        >
                          <Text style={styles.settingText}>Zona de trabajo</Text>
                        </Pressable>

                        <Pressable
                          onPress={() =>
                            onEmployeeSetting('ausencias', employee.id, employee.name)
                          }
                          disabled={isRemoving}
                          accessibilityRole="button"
                          style={styles.setting}
                          testID={`employee-absences-${employee.id}`}
                        >
                          <Text style={styles.settingText}>Días que no está</Text>
                        </Pressable>

                        {/*
                          Los recargos y los festivos, al final: son lo único
                          de esta lista que habla de dinero, y quien entra aquí
                          casi siempre viene a mover horarios.
                        */}
                        <Pressable
                          onPress={() =>
                            onEmployeeSetting('recargos', employee.id, employee.name)
                          }
                          disabled={isRemoving}
                          accessibilityRole="button"
                          style={styles.setting}
                          testID={`employee-surcharges-${employee.id}`}
                        >
                          <Text style={styles.settingText}>Recargos</Text>
                        </Pressable>

                        <Pressable
                          onPress={() =>
                            onEmployeeSetting('festivos', employee.id, employee.name)
                          }
                          disabled={isRemoving}
                          accessibilityRole="button"
                          style={styles.setting}
                          testID={`employee-holidays-${employee.id}`}
                        >
                          <Text style={styles.settingText}>Festivos</Text>
                        </Pressable>
                      </View>

                      {/*
                        La baja, separada de los ajustes y en el color de
                        urgencia: es la única de las cinco que no se deshace, y
                        no debe quedar pegada a las que sí.
                      */}
                      <Pressable
                        onPress={() => confirmRemove(employee.id, employee.name)}
                        disabled={isRemoving}
                        accessibilityRole="button"
                        style={styles.remove}
                        testID={`employee-remove-${employee.id}`}
                      >
                        <Text style={styles.removeText}>Dar de baja</Text>
                      </Pressable>
                    </InfoCard>
                  ))}
                </View>
              </>
            )}

            {!open ? (
              <Button
                fullWidth
                onPress={() => setOpen(true)}
                style={styles.add}
                testID="employees-open-form"
              >
                Añadir trabajador
              </Button>
            ) : (
              <InfoCard style={styles.form} testID="employees-form">
                <Text style={styles.formTitle}>Nuevo trabajador</Text>
                <Text style={styles.formIntro}>
                  Le crearemos su cuenta y le enviaremos por correo un usuario
                  y una contraseña temporal. No hace falta que subas sus
                  documentos: los sube él desde su móvil.
                </Text>

                {formError && <Text style={styles.formError}>{formError}</Text>}

                <FormField label="Nombre y apellidos" error={fieldErrors.name}>
                  <Input
                    value={form.name}
                    onChangeText={(value) => set({ name: value })}
                    placeholder="Ej. Luis Martínez Gómez"
                    editable={!isCreating}
                    testID="employee-name"
                  />
                </FormField>

                <FormField
                  label="Correo"
                  hint="Ahí le llegarán sus credenciales, así que tiene que ser suyo."
                  error={fieldErrors.email}
                >
                  <Input
                    value={form.email}
                    onChangeText={(value) => set({ email: value })}
                    placeholder="nombre@correo.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!isCreating}
                    testID="employee-email"
                  />
                </FormField>

                <FormField label="Teléfono" error={fieldErrors.phone}>
                  <Input
                    value={form.phone}
                    onChangeText={(value) => set({ phone: value })}
                    placeholder="600 000 000"
                    keyboardType="phone-pad"
                    editable={!isCreating}
                    testID="employee-phone"
                  />
                </FormField>

                <FormField
                  label="DNI, NIE o pasaporte"
                  hint="Solo el número. Él subirá la foto del documento al entrar."
                  error={fieldErrors.nationalId}
                >
                  <Input
                    value={form.nationalId}
                    onChangeText={(value) => set({ nationalId: value.toUpperCase() })}
                    placeholder="12345678Z"
                    autoCapitalize="characters"
                    editable={!isCreating}
                    testID="employee-national-id"
                  />
                </FormField>

                <FormField
                  label="Oficios y tarifas"
                  hint="La tarifa es la tuya, no su sueldo: es lo que cobras por su hora de trabajo. Él no la verá."
                  error={fieldErrors.trades}
                >
                  <TradeRatesField
                    value={trades}
                    onChange={setTrades}
                    disabled={isCreating}
                    testID="employee-trades"
                  />
                </FormField>

                <FormField label="Ciudad donde trabaja" error={fieldErrors.city}>
                  <Input
                    value={form.city}
                    onChangeText={(value) => set({ city: value })}
                    placeholder="Ej. Madrid"
                    editable={!isCreating}
                    testID="employee-city"
                  />
                </FormField>

                <Text style={styles.responsibility}>
                  Al darle de alta confirmas que respondes de esta persona ante
                  los clientes de Lughly.
                </Text>

                <Button
                  fullWidth
                  loading={isCreating}
                  disabled={!canSubmit}
                  onPress={() => void handleCreate()}
                  testID="employee-submit"
                >
                  Dar de alta y enviarle el acceso
                </Button>

                <Pressable
                  onPress={() => setOpen(false)}
                  disabled={isCreating}
                  accessibilityRole="button"
                >
                  <Text style={styles.cancel}>Cancelar</Text>
                </Pressable>
              </InfoCard>
            )}
          </>
        )}
      </Animated.ScrollView>
    </View>
  )
}
