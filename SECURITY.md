# Cumplimiento OWASP Mobile Top 10 (2024)

Documento de cumplimiento de seguridad para Lughly Mobile App, siguiendo las directrices del README.md.

## Estado: Fase 1 - Andamiaje Base

Este documento detalla cómo cada punto del OWASP Mobile Top 10 se implementa o se planifica implementar.

---

## ✅ M1 · Uso Indebido de Credenciales

**Estado: CUMPLIDO**

### Implementación Actual:
- ✅ No hay claves ni secretos hardcodeados en el código
- ✅ Variables `EXPO_PUBLIC_*` solo contienen URL pública de la API
- ✅ Estructura preparada para claves de Stripe: publicable en cliente, secreta solo en backend

### Archivos Relevantes:
- `app.json`: No contiene secrets
- `src/security/secureStorage.ts`: Define qué datos son sensibles
- `src/stores/useAuthStore.ts`: Gestión de tokens sin exponer secrets

### Próximos Pasos (Fase 2+):
- [ ] Configurar variables de entorno para desarrollo/staging/producción
- [ ] Implementar rotación de API keys
- [ ] Certificate pinning para prevenir MITM

---

## ⏳ M2 · Cadena de Suministro Insegura

**Estado: PARCIAL**

### Implementación Actual:
- ✅ `package-lock.json` fijado en el repositorio
- ✅ Dependencias mínimas y auditadas manualmente
- ✅ Solo packages oficiales de Expo y librerías bien mantenidas

### Archivos Relevantes:
- `package.json`: Dependencias explícitas con versiones
- `package-lock.json`: Versiones fijadas

### Próximos Pasos (Fase 2+):
- [ ] Configurar Dependabot en GitHub/GitLab
- [ ] `npm audit` en CI/CD pipeline
- [ ] Builds reproducibles con EAS
- [ ] Firmado de artefactos en release
- [ ] Verificación de checksums de dependencias críticas

---

## ✅ M3 · Autenticación y Autorización Inseguras

**Estado: PREPARADO**

### Implementación Actual:
- ✅ Estructura de auth con access token + refresh token
- ✅ Store de autenticación con persistencia segura
- ✅ Selectores atómicos para prevenir re-renders innecesarios
- ✅ Acción `clearAuth()` para logout completo

### Archivos Relevantes:
- `src/stores/useAuthStore.ts`: Gestión de sesión
- `src/stores/useAuthStore.test.ts`: Tests de flujos de auth
- `src/security/secureStorage.ts`: Almacenamiento seguro de tokens

### Próximos Pasos (Fase 2+):
- [ ] Implementar refresh token con rotación
- [ ] Access token de vida corta (15 min)
- [ ] Biometría opcional con `expo-local-authentication` para confirmar pagos
- [ ] Revocación de refresh tokens en backend
- [ ] Verificación de rol en backend para cada endpoint

**IMPORTANTE**: El rol del store es cosmético. La autorización real se valida en el backend en cada request.

---

## ⏳ M4 · Validación de Entrada/Salida Insuficiente

**Estado: PREPARADO**

### Implementación Actual:
- ✅ Dependencias instaladas: `zod` + `react-hook-form`
- ✅ TypeScript strict mode habilitado

### Próximos Pasos (Fase 2+):
- [ ] Esquemas zod para todos los formularios
- [ ] Validación equivalente en backend (nunca solo cliente)
- [ ] Sanitización de texto en descripciones y comentarios
- [ ] Límite de tamaño y validación de tipo MIME en uploads
- [ ] Rate limiting por IP y por usuario en login, pujas, urgencias

---

## ⏳ M5 · Comunicación Insegura

**Estado: PENDIENTE (requiere backend)**

### Preparación Actual:
- ✅ Configuración de app.json con permisos correctos
- ✅ `usesCleartextTraffic: false` (Android)
- ✅ `NSAllowsArbitraryLoads: false` (iOS)

### Archivos Relevantes:
- `app.json`: Configuración de seguridad de red

### Próximos Pasos (Fase 2+):
- [ ] Implementar certificate pinning (`react-native-ssl-pinning`)
- [ ] Forzar TLS 1.2+ en todas las requests
- [ ] Configurar HSTS en el backend
- [ ] Validar certificados SSL en producción
- [ ] Prohibir tráfico en claro completamente

---

## ✅ M6 · Controles de Privacidad Inadecuados

**Estado: CUMPLIDO (Fase 1)**

### Implementación Actual:
- ✅ Permisos mínimos en manifiestos (cámara, fotos, ubicación solo cuando se usa)
- ✅ Mensajes descriptivos de permisos en iOS (`NSCameraUsageDescription`, etc.)
- ✅ No se guardan documentos de identidad en el dispositivo (se suben y borran)

### Archivos Relevantes:
- `app.json`: Permisos y descripciones de uso

### Próximos Pasos (Fase 2+):
- [ ] Ubicación solo con permiso justificado y en uso (nunca en segundo plano)
- [ ] Consentimiento RGPD explícito y granular
- [ ] Ejercicio de derechos RGPD en la app (descargar y suprimir datos)
- [ ] Política de privacidad accesible desde la app
- [ ] No tracking ni analytics sin consentimiento

---

## ⏳ M7 · Protecciones Binarias Insuficientes

**Estado: PENDIENTE (se aplica en release)**

### Próximos Pasos (Release):
- [ ] Ofuscación y minificado con Hermes + `--minify`
- [ ] Eliminar `console.log` en producción
- [ ] No publicar sourcemaps
- [ ] Detección de root/jailbreak en pantallas de pago
- [ ] `FLAG_SECURE` en Android para capturas de documentos y datos bancarios
- [ ] Bloqueo de depurador en release

---

## ✅ M8 · Configuración de Seguridad Incorrecta

**Estado: CUMPLIDO (Fase 1)**

### Implementación Actual:
- ✅ Entornos separados preparados (dev/staging/prod via `EXPO_PUBLIC_API_URL`)
- ✅ Permisos mínimos en manifiestos
- ✅ Deep links con scheme `lughly://` configurado
- ✅ `usesCleartextTraffic: false`
- ✅ Depuración desactivada por defecto en release builds

### Archivos Relevantes:
- `app.json`: Configuración completa de la app
- `.gitignore`: Excluye archivos sensibles

### Próximos Pasos (Fase 2+):
- [ ] Verificar App Links (Android) y Universal Links (iOS)
- [ ] Configuración de variables de entorno por ambiente
- [ ] Secrets management con EAS Secrets
- [ ] Separar claves de Stripe por ambiente

---

## ✅ M9 · Almacenamiento Inseguro de Datos

**Estado: CUMPLIDO**

### Implementación Actual:
- ✅ **Tokens en `expo-secure-store`** (Keychain/Keystore), NUNCA en AsyncStorage
- ✅ `secureStorage` adapter implementado y testeado (8 tests passed)
- ✅ Solo datos no sensibles en AsyncStorage (preferencia de rol)
- ✅ No se almacenan datos de tarjetas (siempre tokenizados por Stripe)
- ✅ No se cachean documentos de identidad

### Archivos Relevantes:
- `src/security/secureStorage.ts`: ✅ Implementado
- `src/security/secureStorage.test.ts`: ✅ 8 tests passed
- `src/stores/useAuthStore.ts`: Usa secureStorage para tokens
- `src/stores/useRoleStore.ts`: Usa AsyncStorage (dato no sensible)

### Prohibido Almacenar:
- ❌ Datos de tarjetas (siempre tokenizados por Stripe)
- ❌ Documentos de identidad (se suben cifrados y se borran)
- ❌ Contraseñas en claro
- ❌ Tokens en AsyncStorage

### Próximos Pasos (Fase 2+):
- [ ] Base de datos local cifrada si es necesaria (SQLCipher)
- [ ] Deshabilitar caché de imágenes de documentos
- [ ] Limpiar datos sensibles al cerrar sesión

---

## ⏳ M10 · Criptografía Insuficiente

**Estado: PREPARADO**

### Implementación Actual:
- ✅ No se implementa criptografía propia
- ✅ Preparado para usar `expo-crypto` (no `Math.random()`)

### Próximos Pasos (Fase 2+):
- [ ] Contraseñas con Argon2id o bcrypt en backend (coste alto)
- [ ] Cifrado en tránsito por TLS
- [ ] Cifrado en reposo por el proveedor (S3 SSE-KMS)
- [ ] Aleatoriedad con `expo-crypto` para tokens/referencias
- [ ] Verificación de firma en webhooks de Stripe

---

## Extras Específicos de Lughly

### Pagos y Transacciones
- ✅ Estructura preparada para Stripe Connect
- ⏳ Webhooks con verificación de firma (pendiente backend)
- ⏳ Idempotencia en eventos de pago (pendiente backend)

### Auditoría
- ⏳ Log inmutable de acciones de administración (pendiente backend)
- ⏳ Retención 6 años de auditoría (pendiente backend)

### Anti-Fraude
- ⏳ Límites de pujas por hora
- ⏳ Detección de pagos fuera de plataforma en chat
- ⏳ Bloqueo de adjudicación sin verificación

### CI/CD
- ⏳ SAST y secret scanning
- ⏳ npm audit en pipeline
- ⏳ Revisión de seguridad al cerrar cada fase

---

## Checklist de Aceptación (Fase 1)

- [x] M1: No secrets en código ✅
- [x] M3: Estructura de auth con tokens ✅
- [x] M6: Permisos mínimos configurados ✅
- [x] M8: Configuración segura de app ✅
- [x] M9: Tokens en SecureStore con tests ✅

### Próxima Fase (Fase 2)
Cuando se implemente el backend y las pantallas principales:
- [ ] M2: Dependabot + npm audit en CI
- [ ] M3: Refresh token con rotación
- [ ] M4: Validación zod en formularios
- [ ] M5: Certificate pinning
- [ ] M7: Ofuscación en release
- [ ] M10: expo-crypto para aleatoriedad

---

**Última actualización**: Fase 1 - Andamiaje completado
**Próxima revisión**: Al completar Fase 2 (Login/Registro + API)
