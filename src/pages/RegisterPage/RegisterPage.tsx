/**
 * RegisterPage
 * Según MobileApp.dc.html (STACK: REGISTRO)
 *
 * Formulario único con bloque condicional para profesionales.
 * La subida de foto de perfil y documento de identidad llega cuando
 * exista el endpoint POST /v1/me/documents (multipart a S3).
 */

import { useState } from 'react'
import { View, Text, Alert } from 'react-native'
import { AuthShell } from '@/components/templates/AuthShell'
import { FormField } from '@/components/molecules/FormField'
import { Picker } from '@/components/molecules/Picker'
import { ImagePickerField } from '@/components/molecules/ImagePickerField'
import { Input } from '@/components/atoms/Input'
import { Button } from '@/components/atoms/Button'
import { Checkbox } from '@/components/atoms/Checkbox'
import { useRegister, MIN_PASSWORD_LENGTH } from '@/hooks/auth/useRegister'
import { useRegistrationUploads } from '@/hooks/auth/useRegistrationUploads'
import { useAuthStore } from '@/stores/useAuthStore'
import type { PickedImage } from '@/hooks/media/usePickImage'
import type { IdentityKind } from '@/api'
import { TRADE_OPTIONS, isRegulatedTrade } from '@/utils/trades'
import { styles } from './RegisterPage.styles'

const ROLE_OPTIONS = [
  { value: 'client', label: 'Cliente — publico trabajos y contrato' },
  { value: 'pro', label: 'Profesional — ofrezco mis servicios' },
]

const IDENTITY_OPTIONS = [
  { value: 'DNI', label: 'DNI (2 caras)' },
  { value: 'NIE', label: 'NIE (2 caras)' },
  { value: 'PASSPORT', label: 'Pasaporte (1 página)' },
]

/**
 * Autónomo o empresa. No es un rol distinto ni cambia lo que se puede hacer
 * en la app: sirve para saber si el identificador fiscal es un NIF o un CIF,
 * y para dirigirse a quien sea con las palabras que le corresponden.
 */
const LEGAL_FORM_OPTIONS = [
  { value: 'SELF_EMPLOYED', label: 'Autónomo — trabajo por mi cuenta' },
  { value: 'COMPANY', label: 'Empresa — sociedad con CIF' },
]

export interface RegisterPageProps {
  onSuccess: () => void
  onLogin: () => void
}

export function RegisterPage({ onSuccess, onLogin }: RegisterPageProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState<'client' | 'pro'>('client')
  const [hasStaff, setHasStaff] = useState(false)
  const [legalForm, setLegalForm] = useState<'SELF_EMPLOYED' | 'COMPANY' | null>(null)
  const [taxId, setTaxId] = useState('')
  const [legalName, setLegalName] = useState('')
  const [acceptsStaffResponsibility, setAcceptsStaffResponsibility] = useState(false)
  const [trade, setTrade] = useState<string | null>(null)
  const [hourlyRate, setHourlyRate] = useState('')
  const [city, setCity] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [acceptComms, setAcceptComms] = useState(false)
  /**
   * Mostrar/ocultar en vez de un campo "repetir contraseña": el usuario
   * comprueba lo que ha escrito de un vistazo. Teclear dos veces a ciegas
   * no detecta el error de quien se equivoca igual las dos veces.
   */
  const [showPassword, setShowPassword] = useState(false)

  // Adjuntos: se seleccionan aquí y se suben al crear la cuenta
  const [avatar, setAvatar] = useState<PickedImage | null>(null)
  const [license, setLicense] = useState<PickedImage | null>(null)
  const [identityKind, setIdentityKind] = useState<IdentityKind>('DNI')
  const [identityFront, setIdentityFront] = useState<PickedImage | null>(null)
  const [identityBack, setIdentityBack] = useState<PickedImage | null>(null)

  const { register, isLoading, fieldErrors, formError } = useRegister()
  const { uploadAll, isUploading } = useRegistrationUploads()
  const clearAuth = useAuthStore((s) => s.clearAuth)

  const isPro = role === 'pro'
  const isPassport = identityKind === 'PASSPORT'
  const isBusy = isLoading || isUploading

  const handleSubmit = async () => {
    const result = await register({
      name,
      email,
      password,
      phone,
      role,
      trade: trade ?? undefined,
      hourlyRate,
      city,
      acceptTerms,
      acceptComms,
      hasStaff: isPro && hasStaff,
      legalForm: legalForm ?? undefined,
      taxId,
      legalName,
      acceptsStaffResponsibility,
    })

    if (!result.ok) return

    // El alta deja una sesión activa momentánea: hace falta para subir los
    // adjuntos, que son endpoints autenticados. La cuenta ya existe, así que
    // un fallo aquí no debe tumbar el registro.
    const { failed } = await uploadAll({
      avatar,
      identityFront,
      identityBack,
      license,
      identityKind,
    })

    // Se cierra esa sesión: el usuario entra por el login, como cualquier
    // otra vez. Así el primer inicio de sesión es siempre explícito.
    clearAuth()
    onSuccess()

    const problems: string[] = []

    if (failed.length > 0) {
      problems.push(
        `No hemos podido subir ${failed.join(', ')}. Podrás intentarlo desde tu perfil.`,
      )
    }

    // Si esto falla se queda sin el botón de trabajadores en su inicio, y sin
    // aviso no tendría forma de entender por qué.
    if (result.staffDeclared === false) {
      problems.push(
        'No hemos podido guardar los datos de tu empresa. Podrás darte de alta como empleador desde Mi cuenta.',
      )
    }

    Alert.alert(
      'Cuenta creada',
      problems.length > 0
        ? `${problems.join(' ')} Revisa tu correo para confirmar el email e inicia sesión.`
        : 'Revisa tu correo para confirmar tu email. Ya puedes iniciar sesión.',
    )
  }

  return (
    <AuthShell
      title="Crear cuenta"
      subtitle="Contrata profesionales o trabaja como profesional. Necesitamos verificar tu identidad para proteger a toda la comunidad."
      align="left"
      error={formError}
      testID="register-page"
    >
      <FormField label="Nombre" error={fieldErrors.name} testID="register-name-field">
        <Input
          value={name}
          onChangeText={setName}
          placeholder="Tu nombre completo"
          autoCapitalize="words"
          autoComplete="name"
          textContentType="name"
          error={Boolean(fieldErrors.name)}
          editable={!isLoading}
          testID="register-name"
        />
      </FormField>

      <FormField label="Email" error={fieldErrors.email} testID="register-email-field">
        <Input
          value={email}
          onChangeText={setEmail}
          placeholder="tucorreo@ejemplo.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
          error={Boolean(fieldErrors.email)}
          editable={!isLoading}
          testID="register-email"
        />
      </FormField>

      <FormField
        label="Contraseña"
        hint={`Mínimo ${MIN_PASSWORD_LENGTH} caracteres.`}
        error={fieldErrors.password}
        action={{
          label: showPassword ? 'Ocultar' : 'Mostrar',
          onPress: () => setShowPassword((visible) => !visible),
          testID: 'register-password-toggle',
        }}
        testID="register-password-field"
      >
        <Input
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••••"
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="new-password"
          textContentType="newPassword"
          error={Boolean(fieldErrors.password)}
          editable={!isBusy}
          testID="register-password"
        />
      </FormField>

      <FormField
        label="Teléfono"
        hint="Para que el cliente pueda llamarte el día del trabajo. No se publica en tu perfil."
        error={fieldErrors.phone}
        testID="register-phone-field"
      >
        <Input
          value={phone}
          onChangeText={setPhone}
          placeholder="600 000 000"
          keyboardType="phone-pad"
          autoComplete="tel"
          textContentType="telephoneNumber"
          error={Boolean(fieldErrors.phone)}
          editable={!isLoading}
          testID="register-phone"
        />
      </FormField>

      <FormField
        label="Uso la plataforma como"
        error={fieldErrors.role}
        testID="register-role-field"
      >
        <Picker
          options={ROLE_OPTIONS}
          value={role}
          onChange={(value) => setRole(value as 'client' | 'pro')}
          title="Uso la plataforma como"
          disabled={isLoading}
          testID="register-role"
        />
      </FormField>

      {isPro && (
        <View testID="register-pro-fields">
          <FormField
            label="Oficio principal"
            error={fieldErrors.trade}
            testID="register-trade-field"
          >
            <Picker
              options={TRADE_OPTIONS}
              value={trade}
              onChange={setTrade}
              placeholder="Elige tu oficio"
              title="Oficio principal"
              error={Boolean(fieldErrors.trade)}
              disabled={isLoading}
              testID="register-trade"
            />
          </FormField>

          <FormField
            label="Tarifa orientativa (€/h)"
            error={fieldErrors.hourlyRate}
            testID="register-rate-field"
          >
            <Input
              value={hourlyRate}
              onChangeText={setHourlyRate}
              placeholder="Ej. 25"
              keyboardType="decimal-pad"
              error={Boolean(fieldErrors.hourlyRate)}
              editable={!isLoading}
              testID="register-rate"
            />
          </FormField>

          <FormField
            label="Ciudad base"
            error={fieldErrors.city}
            testID="register-city-field"
          >
            <Input
              value={city}
              onChangeText={setCity}
              placeholder="Ej. Madrid"
              autoCapitalize="words"
              error={Boolean(fieldErrors.city)}
              editable={!isLoading}
              testID="register-city"
            />
          </FormField>

          <FormField
            label="Habilitación profesional (si tu oficio es regulado)"
            helper={
              trade && isRegulatedTrade(trade)
                ? 'Tu oficio está regulado: sin el certificado aprobado no podrás pujar. Puedes subirlo ahora o más tarde.'
                : 'Opcional. Súbela si tu oficio la requiere.'
            }
            testID="register-license-field"
          >
            <ImagePickerField
              value={license}
              onChange={setLicense}
              placeholder="Subir certificado"
              disabled={isBusy}
              testID="register-license"
            />
          </FormField>

          {/**
           * Gente a cargo. Se pregunta aquí y no se dan de alta aquí: quien
           * llega con ocho trabajadores no va a meterlos en el formulario de
           * registro. Solo se recoge lo fiscal, que es lo que no se puede
           * deducir después, y el alta de cada uno se hace desde su inicio.
           */}
          <View style={styles.staffBox} testID="register-staff-fields">
            <Checkbox
              checked={hasStaff}
              onChange={setHasStaff}
              disabled={isLoading}
              testID="register-has-staff"
            >
              <Text style={styles.consentText}>
                Tengo trabajadores a mi cargo.{' '}
                <Text style={styles.consentSecondary}>
                  Los darás de alta después, desde tu inicio. Ellos ejecutan
                  los trabajos; tú pujas, facturas y cobras.
                </Text>
              </Text>
            </Checkbox>

            {hasStaff && (
              <View style={styles.staffFields}>
                <FormField
                  label="Trabajas como"
                  helper="Solo cambia si el identificador fiscal es un NIF o un CIF. Lo demás funciona igual."
                  error={fieldErrors.legalForm}
                  testID="register-legal-form-field"
                >
                  <Picker
                    options={LEGAL_FORM_OPTIONS}
                    value={legalForm}
                    onChange={(value) =>
                      setLegalForm(value as 'SELF_EMPLOYED' | 'COMPANY')
                    }
                    placeholder="Autónomo o empresa"
                    title="Trabajas como"
                    error={Boolean(fieldErrors.legalForm)}
                    disabled={isLoading}
                    testID="register-legal-form"
                  />
                </FormField>

                <FormField
                  label={legalForm === 'COMPANY' ? 'Razón social' : 'Nombre fiscal'}
                  hint="Es el nombre que verá el cliente encabezando la ficha de cada uno de tus trabajadores."
                  error={fieldErrors.legalName}
                  testID="register-legal-name-field"
                >
                  <Input
                    value={legalName}
                    onChangeText={setLegalName}
                    placeholder={
                      legalForm === 'COMPANY'
                        ? 'Ej. Instalaciones Ruiz S.L.'
                        : 'Ej. Miguel Ruiz Navarro'
                    }
                    autoCapitalize="words"
                    error={Boolean(fieldErrors.legalName)}
                    editable={!isLoading}
                    testID="register-legal-name"
                  />
                </FormField>

                <FormField
                  label={legalForm === 'COMPANY' ? 'CIF' : 'NIF'}
                  error={fieldErrors.taxId}
                  testID="register-tax-id-field"
                >
                  <Input
                    value={taxId}
                    onChangeText={(value) => setTaxId(value.toUpperCase())}
                    placeholder={legalForm === 'COMPANY' ? 'B12345678' : '12345678Z'}
                    autoCapitalize="characters"
                    autoCorrect={false}
                    error={Boolean(fieldErrors.taxId)}
                    editable={!isLoading}
                    testID="register-tax-id"
                  />
                </FormField>

                <Checkbox
                  checked={acceptsStaffResponsibility}
                  onChange={setAcceptsStaffResponsibility}
                  error={Boolean(fieldErrors.acceptsStaffResponsibility)}
                  disabled={isLoading}
                  testID="register-staff-responsibility"
                >
                  <Text style={styles.consentText}>
                    Respondo ante los clientes de Lughly de las personas que
                    dé de alta.{' '}
                    <Text style={styles.strong}>(obligatorio)</Text>
                  </Text>
                </Checkbox>

                {fieldErrors.acceptsStaffResponsibility && (
                  <Text style={styles.consentError} testID="register-staff-error">
                    {fieldErrors.acceptsStaffResponsibility}
                  </Text>
                )}
              </View>
            )}
          </View>
        </View>
      )}

      <FormField
        label="Foto de perfil"
        testID="register-avatar-field"
      >
        <ImagePickerField
          value={avatar}
          onChange={setAvatar}
          variant="avatar"
          placeholder="Subir"
          sideText="Ayuda a generar confianza. Se mostrará en tu perfil público."
          disabled={isBusy}
          testID="register-avatar"
        />
      </FormField>

      <FormField
        label="Documento de identidad"
        helper="Solo se usa para verificar tu identidad, no se muestra públicamente."
        testID="register-identity-field"
      >
        <Picker
          options={IDENTITY_OPTIONS}
          value={identityKind}
          onChange={(value) => setIdentityKind(value as IdentityKind)}
          title="Documento de identidad"
          disabled={isBusy}
          testID="register-identity-kind"
        />
      </FormField>

      <View style={styles.documentRow}>
        <View style={styles.documentSlot}>
          <ImagePickerField
            value={identityFront}
            onChange={setIdentityFront}
            placeholder={isPassport ? 'Página de datos' : 'Cara frontal'}
            disabled={isBusy}
            testID="register-identity-front"
          />
        </View>

        {!isPassport && (
          <View style={styles.documentSlot}>
            <ImagePickerField
              value={identityBack}
              onChange={setIdentityBack}
              placeholder="Cara trasera"
              disabled={isBusy}
              testID="register-identity-back"
            />
          </View>
        )}
      </View>

      <View style={styles.consentBox}>
        <Checkbox
          checked={acceptTerms}
          onChange={setAcceptTerms}
          error={Boolean(fieldErrors.acceptTerms)}
          disabled={isLoading}
          testID="register-terms"
        >
          <Text style={styles.consentText}>
            Acepto los <Text style={styles.link}>Términos y condiciones</Text> y la{' '}
            <Text style={styles.link}>Política de privacidad</Text>. Lughly es
            plataforma intermediaria; el contrato de obra se celebra entre cliente
            y profesional. <Text style={styles.strong}>(obligatorio)</Text>
          </Text>
        </Checkbox>

        <Checkbox
          checked={acceptComms}
          onChange={setAcceptComms}
          disabled={isLoading}
          testID="register-comms"
        >
          <Text style={[styles.consentText, styles.consentSecondary]}>
            Quiero recibir novedades y ofertas por email (opcional).
          </Text>
        </Checkbox>
      </View>

      {fieldErrors.acceptTerms && (
        <Text style={styles.consentError} testID="register-terms-error">
          {fieldErrors.acceptTerms}
        </Text>
      )}

      <Button
        fullWidth
        loading={isBusy}
        onPress={() => void handleSubmit()}
        style={styles.submit}
        testID="register-submit"
      >
        {isUploading ? 'Subiendo documentos…' : 'Crear cuenta'}
      </Button>

      <Text style={styles.footer}>
        ¿Ya tienes cuenta?{' '}
        <Text style={styles.footerLink} onPress={onLogin} testID="go-login-link">
          Inicia sesión
        </Text>
      </Text>
    </AuthShell>
  )
}
