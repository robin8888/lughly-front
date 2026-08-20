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
import Animated from 'react-native-reanimated'
import { useNavScrollHandler } from '@/hooks/ui/useCompactNav'
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
import type { LegalForm } from '@/api/employees.api'
import { TRADE_OPTIONS } from '@/utils/trades'
import { theme } from '@/theme'
import { styles } from './EmployeesPage.styles'

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
  taxId: '',
}

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
  const [form, setForm] = useState(EMPTY_EMPLOYER_FORM)
  const [accepts, setAccepts] = useState(false)

  const isCompany = form.legalForm === 'COMPANY'

  const canSubmit =
    form.legalForm !== '' &&
    form.legalName.trim().length >= 3 &&
    /^([0-9]{8}[A-Z]|[XYZ][0-9]{7}[A-Z]|[A-Z][0-9]{7}[A-Z0-9])$/.test(
      form.taxId.trim().toUpperCase(),
    ) &&
    accepts &&
    !isDeclaring

  const handleSubmit = async () => {
    reset()

    // El botón está deshabilitado sin forma jurídica; esto es para el tipo.
    if (form.legalForm === '') return

    await declare({
      legalForm: form.legalForm,
      legalName: form.legalName.trim(),
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
          onChange={(value) =>
            setForm((current) => ({ ...current, legalForm: value as LegalForm }))
          }
          placeholder="Autónomo o empresa"
          title="Trabajas como"
          testID="employer-legal-form"
        />
      </FormField>

      <FormField
        label={isCompany ? 'Razón social' : 'Nombre fiscal'}
        hint="Es el nombre que verá el cliente encabezando la ficha de cada uno de tus trabajadores."
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

      <FormField label={isCompany ? 'CIF' : 'NIF'} error={fieldErrors.taxId}>
        <Input
          value={form.taxId}
          onChangeText={(value) =>
            setForm((current) => ({ ...current, taxId: value.toUpperCase() }))
          }
          placeholder={isCompany ? 'B12345678' : '12345678Z'}
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

  const { data: employerData, isPending: loadingEmployer } = useEmployer()
  const employer = employerData?.employer ?? null

  /**
   * Sin darse de alta como empleador no hay trabajadores que listar y el
   * backend responde 403. Se espera a saberlo antes de preguntar.
   */
  const { data, isPending, isError, refetch } = useEmployees(employer !== null)
  const { create, isCreating, fieldErrors, formError, reset } = useCreateEmployee()
  const { remove, isRemoving, resetRemove } = useRemoveEmployee()

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
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
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
        contentContainerStyle={styles.content}
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
            illustration="greeting"
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
                message="Cada trabajador tendrá su propia cuenta y aparecerá en el directorio con tu nombre encima. Tú pujas y facturas; ellos ejecutan."
                illustration="none"
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
