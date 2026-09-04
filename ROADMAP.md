# 🗺️ Roadmap de Desarrollo - Lughly Mobile

Plan de trabajo estructurado para continuar el desarrollo después de la Fase 1.

---

## ⚠️ Regla del proyecto: sin tests en el front

**La app móvil no tiene tests** (decisión del 14 Agosto 2026): se eliminaron
junto con jest y sus dependencias. La verificación es `npm run type-check` más
comprobarlo en el móvil. No se añaden tests en ninguna tarea de este roadmap.

El backend sí conserva los suyos.

---

## 📋 Estado Actual

✅ **Fase 1 Completada** (11 Agosto 2026)
- Andamiaje completo
- 10 átomos
- Stores base (Auth + Role)
- Seguridad M9 implementada
- Template ScreenShell
- SplashPage

---

## 🔌 Backend

El backend vive en `C:\Users\robin\Desktop\lughly-backend` (NestJS + PostgreSQL +
Prisma) y se construye **en paralelo**: cada función del front que necesite
servidor se implementa allí primero.

Ya conectado:
- `POST /v1/auth/register` ← `useRegister`
- `POST /v1/auth/login` ← `useLogin`
- `POST /v1/auth/refresh` ← renovación automática en `src/api/http.ts`
- `POST /v1/auth/logout`, `GET /v1/auth/me`, `GET /v1/trades`
- `POST /v1/me/avatar` y `POST /v1/me/documents` ← adjuntos del registro
- `POST /v1/auth/password/forgot` y `/reset` ← `PasswordResetPage`
- `POST /v1/auth/email/verify/resend` ← `VerifyEmailNotice`
- `GET /v1/pros` ← `usePros` (directorio) · `GET /v1/pros/:id` ← `useProProfile` (ficha)

Correo: **Brevo** (verificado funcionando el 13/08/2026). En desarrollo se
puede usar `EMAIL_PROVIDER=console`, que imprime el correo por consola.

La app resuelve sola la URL del backend a partir del host de Metro; para fijarla
crea `apps/mobile/.env` con `EXPO_PUBLIC_API_URL=http://<ip-del-pc>:3000`.

---

## 🎯 Fase 2: Autenticación y Navegación Base

**Duración estimada**: 5-7 días
**Objetivo**: Usuario puede registrarse, hacer login y navegar entre roles

### Día 1: Login y Formularios Base ✅ (12 Agosto 2026)
**Objetivo**: Implementar sistema de login funcional

**Tareas**:
- [x] Crear LoginPage con formulario
  - Input email + password
  - Validación con zod
  - Estado de error
  - Link a "¿Olvidaste tu contraseña?"
- [x] Hook useLogin (mock inicial)
  - Validar credenciales
  - Guardar tokens en useAuthStore
  - Navegar a tabs (la navegación la hace la ruta vía `onSuccess`)
- [x] Actualizar navegación: splash → login → tabs

**Extras necesarios para que el flujo funcione**:
- Rutas placeholder `/registro` (Día 2) y `/recuperar` (con backend de auth)
- Todas las imágenes movidas a `src/images` y consumidas desde `@/images`
- Corregidas rutas rotas de assets en `app.json` y en SplashPage

**Archivos a crear**:
```
src/pages/LoginPage/
  ├── LoginPage.tsx
  ├── LoginPage.styles.ts
  └── index.ts
src/hooks/auth/
  ├── useLogin.ts
```

**Criterio de aceptación**:
- [x] Usuario puede escribir email y password
- [x] Validación muestra errores
- [x] Mock login guarda tokens y navega a tabs

---

### Día 2: Registro de Usuario (Parte 1) ✅ (12 Agosto 2026)
**Objetivo**: Formulario de registro básico

**Tareas**:
- [x] Crear RegisterPage: datos básicos
  - Nombre, email, password (mín. 10)
  - Selector de rol (cliente/profesional)
  - Validación zod + consentimiento RGPD obligatorio
- [x] Molecule FormField (label + acción + helper/hint + error)
- [x] Hook useRegister (mock)

**Nota**: el diseño no es multi-paso. MobileApp.dc.html usa un único formulario
con bloque condicional para profesional, y así se ha implementado.
Además se extrajo el template `AuthShell` (tarjeta blueprint compartida
por Login y Registro) y el átomo `Checkbox`.

**Archivos a crear**:
```
src/pages/RegisterPage/
  ├── RegisterPage.tsx
  ├── RegisterPage.styles.ts
  └── index.ts
src/components/molecules/FormField/
  ├── FormField.tsx
  ├── FormField.styles.ts
  └── index.ts
```

**Criterio de aceptación**:
- [x] Formulario multi-paso funciona
- [x] Validación reactiva
- [x] Navegación entre pasos

---

### Día 3: Registro de Usuario (Parte 2) ✅ (12 Agosto 2026)
**Objetivo**: Completar registro con datos profesionales

**Tareas**:
- [x] Bloque condicional de RegisterPage (solo si rol=pro):
  - Selector de oficio (18 opciones)
  - Tarifa por hora (acepta coma decimal)
  - Ciudad
  - Aviso de habilitación en oficios regulados
- [x] Molecule Picker (hoja inferior; sustituye al `<select>` del diseño)
- [x] `src/utils/trades.ts` con los 18 oficios + imagen por oficio
- [x] Conectar registro completo

### Adjuntos del registro ✅ (13 Agosto 2026)
- [x] Molécula `ImagePickerField` + hook `usePickImage`
- [x] Foto de perfil, documento de identidad (DNI/NIE 2 caras o pasaporte)
      y habilitación profesional (opcional)
- [x] Backend: `POST /v1/me/avatar`, `POST /v1/me/documents`, tabla `documents`
- [x] Compresión y borrado de EXIF en el móvil antes de subir

**Pendiente**: panel de backoffice que revise los documentos y ponga
`identity_verified_at` — hoy nada lo escribe, así que ninguna cuenta llega a
verificarse. Y pasar el almacenamiento de disco local a S3/R2 antes de
producción (ver `PENDIENTE_PARA_PRODUCCION.md` del backend).

**Archivos a crear**:
```
src/components/molecules/Picker/
  ├── Picker.tsx
  ├── Picker.styles.ts
  └── index.ts
src/utils/trades.ts  # Lista de 18 oficios
```

**Criterio de aceptación**:
- [x] Registro completo funciona
- [x] Datos se guardan en useAuthStore
- [x] Redirección según rol

---

### Día 4: HomePage Cliente ✅ (13 Agosto 2026)
**Objetivo**: Pantalla principal del cliente

**Tareas**:
- [x] Crear HomePage (versión cliente)
  - Hero con título y descripción
  - Buscador rápido **con sugerencias por sinónimos** ("fuga" → Fontanería)
  - CTA "Publicar", "Ver profesionales" y "Lo necesito urgente"
  - Carrusel de los 18 oficios con sus ilustraciones
  - Sección "02 · Cómo funciona" y bloque "03 · Subasta inversa"
- [x] Molecule HeroSection
- [x] Organism TradeCarousel
- [x] Molecule BlueprintCard (tarjeta con esquinas, reutilizable)
- [x] `src/utils/tradeSearch.ts` con los sinónimos del diseño

**Nota de diseño**: el prototipo web coloca los oficios en posiciones
absolutas y los mueve con flechas. En móvil se ha hecho carrusel horizontal
con ajuste por página, que es el gesto natural; se conservan los puntos.

**Archivos a crear**:
```
src/pages/HomePage/
  ├── HomePage.tsx
  ├── HomePage.styles.ts
  └── index.ts
src/components/molecules/HeroSection/
src/components/organisms/TradeCarousel/
```

**Criterio de aceptación**:
- [x] Hero visible con estilo del diseño
- [x] Carrusel muestra 18 oficios
- [x] Botones navegan a rutas correctas
- [x] Responsive

---

### Mi cuenta ✅ (14 Agosto 2026)
**Objetivo**: Pantalla de cuenta completa

- [x] Ficha con avatar, nombre, email y rol
- [x] **Foto de perfil**: añadir o cambiar desde la propia pantalla
- [x] Cambio de modo cliente/profesional (solo cuentas profesionales)
- [x] Cambiar contraseña (`PATCH /v1/me/password`), cierra las demás sesiones
- [x] Aviso de email sin confirmar, con reenvío
- [x] Cerrar sesión con confirmación
- [x] Accesos por rol; los que aún no tienen pantalla salen como "Pronto"

**Nota técnica**: la subida de ficheros pasó de `fetch` con FormData a la vía
nativa de `expo-file-system`. En iOS, `fetch` con un fichero dentro de un
FormData falla con un error de red genérico aunque el servidor responda al
resto de peticiones. Afectaba también a los documentos del registro.

---

### Día 5: Navegación y Estados ✅ (14 Agosto 2026)
**Objetivo**: Sistema completo de navegación

**Tareas**:
- [x] Organism RoleGate — bloquea y explica, con salidas concretas
- [x] Hook useRoleGate
- [x] Rutas protegidas: `publish`, `jobs` (cliente) · `offers`, `schedule`,
      `wallet` (profesional)
- [x] `urgent` **dejó de estar protegida** el 15 Agosto 2026: no bloquea al
      profesional, le enseña su propia pantalla de urgencias. Bloquearle sería
      absurdo, porque es a quien más le importan
- [ ] ~~Pantalla "Cambiar Modo"~~ — no se hace, ver abajo

**Criterio de aceptación**:
- [x] Cliente no puede ver pantallas de pro
- [x] Pro no puede ver pantallas de cliente
- [x] Switch de modo funciona (hecho en "Mi cuenta")
- [x] Mensaje claro al intentar acceso no autorizado

**Decisiones**:

- **Nada de mensajes genéricos.** El diseño (`isPublicarDenied`,
  `isUrgenciaDenied`) no dice "no tienes permiso": dice qué le toca a esa
  persona en su lugar y le enseña dónde. Por eso título, texto y acciones
  llegan por props, y cada una de las seis rutas trae los suyos.
- **Se distingue "modo equivocado" de "cuenta equivocada".** Una cuenta
  profesional en modo cliente que abre Agenda solo tiene que cambiar de modo.
  Una cuenta de cliente **no tiene** modo profesional al que cambiar: se le
  explica que hay que darse de alta, en vez de darle un botón inerte. Este
  caso no está en el diseño, que da por hecho que todo el mundo tiene ambos.
- **Sin `SwitchModePage`.** El cambio de modo ya está en "Mi cuenta" y en el
  propio RoleGate, que es donde hace falta. Una pantalla dedicada sería un
  destino al que solo se llega a propósito para hacer algo que ya se puede
  hacer donde surge la necesidad.

**Ojo**: esto es cosmético, como dice el README. La autorización real la hace
el backend en cada operación; el RoleGate solo evita enseñar pantallas que no
tienen sentido para quien mira.

---

### Día 6-7: HomePage Pro ✅ (14 Agosto 2026)
**Objetivo**: Pantalla principal del profesional

**Tareas**:
- [x] `HomePagePro` — pantalla propia, no la del cliente con otros textos
- [x] Estadísticas **reales** (no mock): valoración, trabajos terminados,
      tarifa y radio de cobertura
- [x] Estado "Disponible ahora" con `PATCH /v1/pro/available-now`
- [x] Molecule StatCard
- [x] "Cómo te valoran" reutilizando `ReviewList`
- [ ] ~~Trabajos cerca de ti~~ · ~~Plan y contador de pujas~~ — sin datos, ver abajo
- [ ] ~~Switch mejorado~~ — el átomo actual sirve

**Criterio de aceptación**:
- [x] Dashboard pro muestra estadísticas
- [x] Switch "Disponible ahora" funciona (probado contra el servidor)
- [x] Todo el flujo login → home → cambio de modo funciona

**Backend nuevo**: `PATCH /v1/pro/available-now`, en un controlador aparte
(`ProSelfController`, espacio `v1/pro`) para no mezclar rutas privadas con el
directorio público de `v1/pros`. Protegido con `@Roles(PRO)`.

**Decisiones**:

- **Las estadísticas no son mock.** El roadmap las pedía inventadas; salen de
  `ProProfile`, que ya tiene todo lo necesario. Un panel con cifras falsas se
  queda así durante meses porque parece terminado.
- **El interruptor escribe en el perfil, no en el móvil.** "Disponible ahora"
  decide a quién se avisa en una urgencia (README §7). Si viviera en el
  dispositivo, cerrar la app dejaría al cliente esperando a alguien que ya no
  está. Se actualiza de forma optimista para que no se sienta lento.
- **Fuera por falta de tablas**: trabajos cerca de ti y contador de pujas
  (necesitan `Job` y `Bid`, Fases 4-5), reserva instantánea (Fase 7) e
  ingresos de 6 meses (`Payment`, Fase 9).

---

## 🎯 Fase 3: Directorio y Perfiles

**Duración estimada**: 4-5 días
**Objetivo**: Buscar y ver perfiles de profesionales

### Día 8: Directorio de Profesionales ✅ (14 Agosto 2026)
**Tareas**:
- [x] DirectoryPage — con datos reales, no mock: `GET /v1/pros`
- [x] Buscador con sinónimos (`searchTrades`) en vez de un SearchField propio
- [x] Filtro por oficio (`Picker`) y por "disponible ahora"
- [x] Orden por cercanía y disponibilidad — lo decide el backend, no la app
- [x] Molecule ProDirectoryCard

**Criterio de aceptación**:
- [x] Lista muestra profesionales
- [x] Filtro funciona
- [x] Tap en card navega a perfil

**Nota**: no se hicieron `SearchField` ni `ProList`. El buscador con
sugerencias ya existía en la home (`QuickSearch`) y la lista es un `map` de
cinco líneas: envolverla en un organism solo añadía una capa que atravesar.

---

### Día 9: Perfil de Profesional ✅ (14 Agosto 2026)
**Tareas**:
- [x] `GET /v1/pros/:id` en el backend (`GetProUseCase`), público
- [x] ProProfilePage: avatar, nombre, oficio, ciudad, tarifa, valoración,
      distintivos, bio, trabajos terminados, recargos y radio de cobertura
- [x] Molecule PriceBreakdown
- [x] Ruta `/pro/[id]` y enlace desde el directorio
- [x] Hook `useProProfile` — sin reintentos ante un 404

**Criterio de aceptación**:
- [x] Perfil muestra todos los datos que hoy existen en la base
- [x] Recargos visibles
- [x] Botones preparados para acciones (avisan de en qué fase llegan)

**Fuera de alcance a propósito** — el diseño (`isPerfil`) los pinta, pero no
hay tablas que los sostengan y no se inventan:

| Bloque | Necesita | Llega en |
| --- | --- | --- |
| Resumen de reputación (IA) y etiquetas de carácter | `Review` | Día 10 |
| Rejilla de disponibilidad por día y franja | `Availability` | Fase 6 |
| Mapa de cobertura | react-native-maps + lat/lng | Día 11 |

Los recargos salen de `src/utils/surcharges.ts`, con los valores del README
§6. Son informativos: el servidor los vuelve a aplicar al cobrar.

---

### Día 10: Valoraciones ✅ (14 Agosto 2026)
**Tareas**:
- [x] Modelo `Review` + migración `20260814131115_reviews`
- [x] `GET /v1/pros/:id/reviews`, público y paginado
- [x] Organism ReviewList — desglose por criterio + lista + "ver más"
- [x] Molecule ReviewCard — firma, nota, comentario, las 8 notas plegadas
      y respuesta pública del profesional
- [x] Datos reales por seed (`npm run db:seed:reviews`), no mock en el front

**Decisiones**:

- **No hay `POST /v1/reviews`.** Quién puede valorar a quién depende de haber
  contratado y terminado un trabajo, y `Job` llega en la Fase 10. Crear sin esa
  comprobación sería un buzón abierto para inflar o hundir reputaciones.
  Cuando exista `Job`, `Review` gana `jobId` y unicidad por trabajo.
- **El autor es opcional** (`authorId` nullable + `authorLabel` congelado). Si
  un cliente se da de baja la reseña sobrevive: si no, un profesional podría
  perder su reputación entera porque sus clientes se dieran de baja.
- **Las 8 notas van plegadas** tras "Ver las 8 notas". Desplegadas, tres
  reseñas son veinticuatro filas de estrellas y nadie las lee.
- **`ratingAverage` y `reviewCount` se recalculan desde las reseñas reales.**
  Antes los escribía a mano `seed-pros.ts` (Lucía decía tener 187 y no había
  ninguna). Ahora salen de contar y promediar, y por eso bajaron a una docena.

Falta el **resumen de reputación por IA** que pinta el diseño: ya hay datos que
resumir, pero exige llamar a un modelo y decidir cuándo se recalcula.

---

### Día 11: Mapas ✅ (14 Agosto 2026)

Especificación completa en `MAPS_MOBILE.md`. **No se usa react-native-maps ni
Google Maps**: MapLibre con teselas de OpenFreeMap, sin cuenta ni clave.

**Tareas**:
- [x] `@maplibre/maplibre-react-native` + `expo-location`, con el permiso
      solo "mientras se usa la app"
- [x] `theme/map.ts` — la URL del estilo vive en un único sitio
- [x] `utils/geo.ts` — `haversineKm`, `circleToPolygon`, `formatDistance`
- [x] Organism `CoverageMap` — círculo geodésico, no una vista redonda
- [x] Organism `ProsMap` — con agrupación desde el primer momento
- [x] Molecule `MapAttribution` · Atom `MapMarker`
- [x] Hook `useCoverage` · Hook `useUserLocation`
- [x] `POST /v1/geocode` en el backend (Photon, sin clave en el cliente)
- [x] `haversineKm` también en el backend, con los mismos casos de prueba
- [x] Enganchados: `CoverageMap` en la ficha, `ProsMap` en el directorio
- [x] **Radio de cobertura** (19 Agosto 2026). Se pone en `/mi-zona`, con la
      dirección buscada, la ubicación actual o arrastrando el marcador, y el
      mapa enseña el resultado mientras se elige.

      No era solo que faltara la pantalla: `radiusKm` se escribía en **un solo
      sitio de todo el backend**, al dar de alta a un empleado. Un autónomo se
      quedaba sin punto base para siempre, sin mapa en su ficha y sin filtro de
      distancia en las urgencias —le entraban todas—.

      Lista de radios en vez de deslizador: nadie distingue trabajar a 17 km o a
      18, y una lista se toca bien con el pulgar, que un deslizador de 1 a 50 en
      un móvil no.
- [ ] **Development build con EAS**: lo tiene que lanzar el usuario

**Tests**: 39 en el móvil y 7 en el backend. Se reinstaló jest para esto,
revirtiendo la regla de "sin tests en el front" solo para los mapas.

**Decisiones**:

- El círculo es un polígono geodésico de 65 vértices. Un test comprueba que
  todos caen al radio pedido con 1% de tolerancia, **y lo repite en Reikiavik**
  (lat. 64°), que es donde un círculo dibujado con una vista deja de valer.
- La agrupación va activada desde el principio, no cuando empiece a ir lento.
- La atribución de OpenStreetMap no tiene prop para ocultarla: la exige la
  licencia ODbL. Si se pudiera apagar, alguien la apagaría.
- Los marcadores no llevan dirección ni datos personales en sus `properties`,
  solo id, nombre y disponibilidad. Hay un test que lo fija.
- El mapa del directorio se monta solo al pulsar "Mapa": mantenerlo vivo bajo
  la lista gastaría teselas y batería sin que nadie lo mire.

---

## 🎯 Fase 4: Publicar Trabajo y Urgencias

**Duración estimada**: 5-6 días
**Objetivo**: Cliente puede publicar trabajos normales y urgentes

### Día 12-13: PublishPage ✅ parcial (14 Agosto 2026)

**Backend nuevo** — migración `20260814184317_jobs`:
- [x] Modelo `Job` con los cuatro tipos del README y siete estados
- [x] Modelo `JobPhoto`, hasta cuatro por trabajo
- [x] `POST /v1/jobs` y `GET /v1/jobs`, restringidos a `CLIENT` con el guard

**Front**:
- [x] PublishPage: subasta inversa y reserva instantánea en la misma pantalla
- [x] Selector de oficio, título, descripción, ciudad, presupuesto y fechas
- [x] Molecule PhotoPicker (rejilla de 4)
- [x] Hook `useDraftJobStore`, persistido
- [x] `POST /v1/jobs/:id/photos` y las fotos enganchadas al formulario
- [ ] ~~Redacción asistida por IA~~ — necesita proveedor, clave y presupuesto:
      es decisión de producto, no de esta pantalla

**Decisiones**:

- **El borrador vive en el móvil, no en la base.** Existe el estado `DRAFT`,
  pero el trabajo se crea ya `OPEN`: guardar cada tecleo serían muchas filas
  basura para algo que se publica o se descarta en la misma sesión.
- **Las fotos no se persisten en el borrador.** Son URIs temporales que el
  sistema borra cuando quiere; guardar la ruta solo serviría para que al
  volver apareciesen rotas. La pantalla lo dice.
- **El borrador se limpia solo al confirmar el servidor.** Borrarlo al pulsar
  publicar dejaría al usuario sin texto y sin trabajo si falla la red.
- **Sin fecha de cierre, la subasta dura 7 días.** Una subasta abierta para
  siempre no le sirve a nadie.
- Las dos validaciones cruzadas de la subasta (hace falta fecha de cierre, y
  futura) son `refine` de zod, así que llegan al formulario con el campo
  señalado y se pintan bajo el input correcto.
- **Si una foto falla, el trabajo sigue publicado.** Deshacer la publicación
  por una imagen sería peor: el usuario ya lo ha escrito todo y quiere que se
  vea. Se publica, se dice cuántas no subieron y se sigue. Añadirlas después
  es un toque; volver a escribirlo todo, no.
- Las fotos se suben **en serie**: el servidor las numera por orden de
  llegada, y en paralelo el orden que vería el profesional no sería el que
  eligió el cliente.
- **Las fotos de trabajo exigen sesión para verse; los avatares no.** Una
  foto de perfil se enseña en un directorio abierto; la de una avería muestra
  el interior de la casa de alguien.

---

### Día 14-15: UrgencyPage ✅ (15 Agosto 2026)
**Tareas**:
- [x] UrgencyPage: oficio, dirección, descripción, fotos y aviso de recargo
- [x] Organism CoverageIndicator, con la cobertura en vivo
- [x] Hook `useAddressCoverage` — geocodifica y cuenta, con espera de 700 ms
- [x] Backend: tipo `URGENT` al publicar y `GET /v1/pros/coverage`
- [ ] ~~Hook useSurcharge~~ — los porcentajes ya están en
      `utils/surcharges.ts`; el cálculo sobre un importe llega con la
      reserva instantánea (Fase 7), que es donde hay importe que calcular

**Decisiones**:

- **La dirección es obligatoria aquí y opcional al publicar normal.** Solo se
  avisa a quien la cubre con su radio (README §7): sin punto no hay a quién
  avisar. Lo valida el servidor, no solo el formulario.
- **Se dice si hay alguien ANTES de escribir la descripción.** Rellenar un
  formulario entero con una fuga en casa para descubrir al final que nadie
  cubre tu calle sería cruel. Y si no hay nadie, el mensaje es honesto y trae
  salida —publicarlo como trabajo normal—, que es lo que pide el README.
- **La cobertura devuelve números, nunca la lista.** Una lista de nombres
  sería una forma cómoda de rastrear a los profesionales.
- **No se consulta en cada tecla**: se esperan 700 ms desde la última.
  "C", "Ca", "Cal" son peticiones inútiles al geocodificador.
- El formulario es más corto a propósito: quien tiene una urgencia no está
  para elegir presupuesto máximo ni fecha preferida.

---

### Día 16: Confirmación y Draft
**Tareas**:
- [ ] Template ConfirmationModal
- [ ] Persistir borradores en useDraftJobStore
- [ ] Recovery de borradores

---

## 🎯 Fase 5: Flujo de Pujas (Profesional)

**Duración estimada**: 4-5 días

### Día 17-18: OffersPage (Pro) ✅ (15 Agosto 2026)

**Backend nuevo** — migración `20260815073602_bids`:
- [x] Modelo `Bid` con importe, plazo y condiciones
- [x] `GET /v1/jobs/open` y `POST /v1/jobs/:id/bids`, restringidos a `PRO`
- [x] `GET /v1/jobs` del cliente ahora trae `bidCount` y `lowestBid`

**Front**:
- [x] OffersPage con la lista de subastas abiertas
- [x] Filtro por oficio (por defecto, el suyo)
- [x] Organism AuctionCard, con el formulario de puja plegado dentro
- [x] "Mis trabajos" ya enseña pujas recibidas y la más baja
- [ ] ~~Orden por cercanía e indicador de distancia~~ — el trabajo solo
      guarda ciudad; su punto exacto es la dirección, y esa no se enseña a
      quien todavía no ha ganado la subasta

**Decisiones**:

- **Una puja por profesional**, con unicidad en la base. Volver a pujar
  corrige la suya; no apila otra. Si no, alguien podría inundar una subasta
  y el cliente vería la misma cara diez veces.
- **Se enseña la puja más baja, nunca de quién es.** Es una subasta inversa:
  ocultar por dónde van los demás no protege a nadie, solo hace pujar a
  ciegas.
- **El formulario de puja va dentro de la tarjeta**, no en otra pantalla.
  Pujar es comparar presupuesto máximo, puja más baja y plazo: sacarlo fuera
  obligaría a memorizar esos tres números o a ir y volver.
- El profesional no ve la dirección ni el nombre del cliente. Eso se entrega
  al adjudicado.

**FALTA una regla del README (§3)**: sin cuenta de cobro verificada
(NIF + Stripe) no se debería poder pujar. Stripe no existe todavía, así que
hoy cualquier profesional puede. Anotado en `place-bid.use-case.ts`.

**Pendiente**: pantalla de detalle de la subasta con las fotos. La tarjeta
dice cuántas hay pero no las enseña.

---

### Trabajadores a cargo ✅ (15 Agosto 2026)

Fuera del plan original. Sale de una pregunta del negocio: qué pasa con una
empresa que quiere ofrecer sus servicios y tiene varios profesionales del
mismo oficio.

**No se ha añadido un rol de empresa.** Lo que cambia el comportamiento de la
app no es la forma jurídica sino mandar a otros a los trabajos, y un autónomo
también puede tener oficiales. Así que en el registro se pregunta "¿tienes
trabajadores a cargo?" y solo después, para saber si el identificador es un
NIF o un CIF, si es autónomo o empresa.

**Backend** — migración `20260815120000_employers_and_phone`:
- [x] Modelo `Employer` (forma jurídica, identificador fiscal, razón social,
      fecha de aceptación de la responsabilidad) y `ProProfile.employerId`
- [x] `User.phone`, `User.mustChangePassword`, `User.temporaryPasswordExpiresAt`
- [x] `GET/POST /v1/employer`, `GET/POST /v1/employees`
- [x] El alta de un trabajador genera contraseña temporal y le manda un correo
      con usuario, contraseña, por qué hay que cambiarla y dónde
- [x] Un empleado no puja ni ve la lista de subastas abiertas (lleva
      presupuestos e importes), ni puede darse de alta como empleador
- [x] `POST /v1/auth/register` acepta teléfono

**Front**:
- [x] Pregunta en el registro, con forma jurídica, NIF/CIF y razón social
- [x] Botón de trabajadores en el hero del inicio, solo para quien los tiene
- [x] EmployeesPage: lista y alta, más el alta como empleador para quien no
      la hizo en el registro (o para el autónomo que contrata al primero)
- [x] Cambio de contraseña obligatorio en el primer acceso, con las tabs
      retiradas del navegador hasta que se haga
- [x] Al empleado se le ocultan Ofertas, Cartera y su propia tarifa
- [x] La tarjeta del directorio y la ficha las encabeza el empleador, con el
      trabajador debajo

**Decisiones**:

- **Los oficios de la empresa no se declaran: se derivan de sus
  trabajadores.** Así no puede aparecer en fontanería sin tener un fontanero,
  y deja de aparecer el día que ese trabajador se va.
- **La empresa no sube los documentos de sus empleados.** Los sube cada uno
  desde su móvil, que es donde no cuesta nada; a cambio, quien da de alta
  acepta responder de esa persona ante los clientes. Pedirle a una empresa
  que fotografíe cincuenta DNI es garantizar que no da de alta a nadie.
- **La tarifa es del empleador, no del trabajador.** Es lo que la empresa
  cobra por su hora, no su sueldo. Por eso al trabajador no se le enseña: si
  se le enseñara, confundiría una cosa con la otra.
- **La tarjeta la encabeza el empleador.** A quien se contrata es a la
  empresa —pone el precio, factura y responde—; el trabajador es quien irá a
  la casa. Al revés parecería que se contrata a un autónomo.
- **El modelo tiene un nivel, no una cadena.** Un empleado no puede tener
  empleados: con dos niveles no habría forma de decir a quién se le paga.

**Pendiente**: las facturas y los pagos al empleador dependen de `Payment`
(Fase 9). Hoy no hay dinero que dirigir a ningún sitio.

---

### Día 19-20: Pujar en Subasta
**Tareas**:
- [ ] AuctionDetailPage
  - Detalles completos
  - Fotos en galería
  - Pujas actuales
  - Formulario de puja
- [ ] Molecule BidForm
- [ ] Hook useCanBid (validación NIF + Stripe)

---

### Día 21: Bloqueos y Validaciones
**Tareas**:
- [x] **Documento de identidad para comprometerse** (18 Agosto 2026). Sin él no
      se puja, no se adjudica, no se encarga un trabajo y no se pide una
      urgencia. Publicar una subasta o un presupuesto sigue libre: todavía no
      hay nadie al otro lado, y pedir el DNI para probar la app espanta a quien
      aún no sabe si le sirve.

      **Solo al profesional** (18 Agosto 2026). Al cliente se le pedía también
      y se retiró: quien contrata se identifica con la tarjeta con la que paga,
      ya verificada por su banco, y eso es una señal más fuerte que una foto de
      un DNI. Guardar imágenes de documentos de todos los clientes obliga a
      custodiarlas y a responder si se filtran, sin ganancia a cambio. Con el
      profesional es distinto: cobra, entra en casas ajenas y su reputación es
      pública. Así que la única puerta que queda es pujar.

      Se exige **subido, no aprobado**, y esto es lo importante: nada en el
      sistema saca un documento de `PENDING` —no hay panel de backoffice—, así
      que una puerta atada a `identityVerifiedAt` cerraría al 100 % de las
      cuentas para siempre. Ya había una así, aceptar urgencias, que no la pasa
      nadie desde agosto. Cuando exista la revisión se endurece cambiando la
      condición de `common/identity-documents.ts`.

      Con ello llegó **`/mis-documentos`**, que faltaba: el alta era el único
      sitio donde se subían, y si aquella subida fallaba —el registro está hecho
      para no tumbarse si falla— la cuenta se quedaba sin ellos y sin salida.
      Dos textos ya prometían esa pantalla: el del registro ("Podrás intentarlo
      desde tu perfil") y el error de urgencias del servidor ("Súbelo desde Mi
      cuenta"). Las dos mentían.
- [x] **Letra del NIF/NIE/CIF comprobada** (18 Agosto 2026). La validación de
      `taxId` era una expresión regular de forma, que aceptaba `12345678A`
      cuando la letra correcta es la Z: cualquier número inventado con la forma
      adecuada entraba, siendo el dato con el que un empleador responde de su
      gente. La letra se calcula, así que comprobarla es aritmética y gratis.
      Cubre DNI, NIE —X, Y y Z valen 0, 1 y 2— y CIF, cuyo control es dígito o
      letra según la inicial de la sociedad. No dice que el número esté dado de
      alta en Hacienda ni que sea de quien lo escribe: solo que es posible.
- [ ] **Que la foto sea de un documento.** Sigue abierto: se dio por resuelto
      con el escáner nativo y era falso. Los escáneres de iOS y Android llevan
      **disparador manual**, así que quien insista fotografía lo que quiera —
      comprobado en el móvil, subiendo cualquier cosa—. La detección de bordes
      encuadra y recorta; no veta.

      Lo que el escáner sí deja, y hace viable el siguiente paso: la imagen
      llega recortada, recta y con buen contraste. La comprobación tiene que ir
      **en el servidor**, sobre esa imagen, buscando marcas: un número cuya letra
      cuadre con la validación ya escrita, la zona MRZ del pasaporte, palabras
      como "APELLIDOS" o "DOCUMENTO NACIONAL DE IDENTIDAD".

- [x] **Escáner nativo para capturar** (18 Agosto 2026). VisionKit en iOS y el
      escáner de ML Kit en Android, con carga en diferido para que su ausencia
      degrade a la galería en vez de tumbar la app.

      Se probó primero lo obvio, OCR en el servidor, y falló: sobre una imagen de
      césped y cielo devolvió 983 caracteres de basura, y sobre un logotipo con
      una palabra real, 6. Contar texto no distingue un documento de una textura,
      así que ese criterio habría dejado pasar el césped y rechazado el
      documento.

      La galería se queda como salida: hay quien ya tiene la foto hecha, y en un
      aparato sin escáner —Android sin Play Services— es el único camino.
- [ ] Verificación automática del contenido. Lo que se puede hacer gratis:
      leer el documento en el móvil con VisionKit o ML Kit —los dos gratis y en
      el propio aparato—, sacar número y caducidad, comprobar la letra con lo ya
      hecho, cotejar el nombre con el de la cuenta y detectar el mismo número en
      dos cuentas. Eso permite **rechazar** solo, no aprobar: aprobar
      automáticamente traslada la responsabilidad a quien lo programó.
      La verificación de verdad llega gratis con **Stripe Connect** en la Fase 9,
      que hace el KYC como parte de su alta y lo devuelve por webhook — y ese
      webhook es lo que puede escribir por fin `identityVerifiedAt`.
- [x] **Panel para revisar documentos** (18 Agosto 2026). En el backend,
      `GET /v1/admin/documents/pending` y `POST /v1/admin/documents/:id/review`
      con `@Roles(ADMIN)`; en el móvil, "Revisar documentos" en Mi cuenta, que
      solo aparece con rol `ADMIN`.

      `identityVerifiedAt` **se deriva** de los documentos aprobados —pasaporte,
      o las dos caras— y se retira si se rechaza uno que la sostenía. Con esto la
      puerta de aceptar urgencias, cerrada para todo el mundo desde agosto, ya
      puede abrirse.

      La imagen se sirve por el endpoint que ya existía y admite administrador;
      no se duplicó el camino a datos privados. El motivo del rechazo es
      obligatorio: es lo único que el usuario lee en su pantalla.

      Ojo para producción: el registro solo crea `CLIENT` y `PRO`, así que el
      primer `ADMIN` hay que ponerlo a mano en la base.
- [ ] Sin Stripe verificado → no puede pujar. **Bloqueado por la Fase 9**:
      Stripe no existe en el proyecto. La mitad de identidad ya está puesta.
- [ ] Límite de plan Free. **No hay plan**: ni campo, ni tabla, ni contador de
      pujas, en ninguno de los dos repositorios.
- [ ] Recargos no acumulables — los porcentajes están en `@/utils/surcharges`
      con la regla escrita ("se aplica el más alto"), pero no hay cálculo que
      la aplique todavía.

---

## 🎯 Asignación de trabajos por el empleador ✅ (18 Agosto 2026)

Cuando el profesional que elige el cliente trabaja para alguien, entre los dos
hay un tercero. Esto define quién recibe qué y en qué orden.

**El modelo, en una frase**: el cliente elige a la persona, pero quien recibe
el encargo es su empresa —salvo en urgencias, donde la empresa ha dejado dicho
de antemano cuándo puede ir esa persona.

### Contratación normal (presupuesto directo y reserva)

- El cliente busca por oficio y elige a un trabajador del listado.
- **El aviso de "te han elegido" le llega al empleador, no al trabajador.**
  Es coherente con lo ya construido: quien contrata, presupuesta, factura y
  cobra es el empleador, y el importe no lo ve el trabajador.
- El empleador decide: asigna el trabajo a esa persona, o manda el
  presupuesto al cliente si lo ha pedido.
- **El trabajador solo se entera cuando el empleador se lo asigna.** Recibe
  el trabajo con dirección y hora; el importe no.

### Urgencias: el empleador no puede estar de guardia

Una urgencia se decide en minutos. Si hubiera que esperar a que el empleador
la reparta, se perdería, y tenerlo de guardia con cada trabajador no es un
sistema, es una persona sin dormir.

- El empleador declara por adelantado, para cada trabajador, **qué días y en
  qué horario** puede atender urgencias.
- Dentro de esa ventana el trabajador **aparece disponible** en el listado y
  **el cliente le asigna la urgencia directamente**, sin intermediario.
- Al asignar la ventana, el empleador **fija también la tarifa**.

### Lo que ya está y sirve

- `Employer` + `ProProfile.employerId`: quién trabaja para quién.
- `ProTrade`: oficios y tarifas por oficio, que el empleador ya edita.
- `Job` con sus cuatro rutas y `awardedProId`.
- `ProProfile.busyWithJobId`: atendiendo una urgencia, no le llegan más.
- Los muros del empleado: no puja, no ve importes, no ve su tarifa.

### Lo que se construyó

**Ojo: casi todo esto vive en el backend, que es OTRO repositorio** —
`lughly-backend` (NestJS + Prisma), fuera de este árbol. Mirando solo
`apps/mobile` esta sección parece sin empezar, y no lo está.

- [x] Modelo de ventanas de urgencia por trabajador, con tarifa: `UrgencyWindow`
      (`prisma/schema.prisma`), con las rutas `GET`/`PUT
      /v1/employees/:id/urgency-windows`, que exigen ser el empleador de esa
      persona. Las franjas que cruzan medianoche se parten en dos filas y la
      semana entera se reemplaza en una transacción con bloqueo de fila.
      **Desviación**: es tabla propia y no compartida con `Availability`, como
      decía la idea original — porque `Availability` no existe todavía, la
      Fase 6 está sin empezar. Cuando llegue, hay que decidir si se unifican.
- [x] `availableNow` de un empleado deja de ser suyo. El servidor lo rechaza
      (`EmployeeHasNoSwitchError`) y lo deriva de sus franjas, en el camino SQL
      y en el de Prisma. El móvil ya no le enseña el interruptor: le explica
      que su horario lo fija su empresa (18 Agosto 2026).
- [x] Estado intermedio del trabajo. No es uno sino dos: `PENDING_PRO`
      —elegido por el cliente, esperando a que la empresa asigne— y
      `SUBSTITUTE_PROPOSED` —la empresa propone a otro y el cliente aún no ha
      dicho nada—. La asignación va con `updateMany` condicionado al estado, así
      que dos asignaciones en paralelo no se pisan. `OPEN → AWARDED` de una vez
      solo ocurre con un autónomo sin gente, que es lo correcto.
- [x] Notificaciones. Once envíos reales a la API de Expo desde siete casos de
      uso, incluidos "te han elegido" al empleador y "te han asignado" al
      trabajador. Registro y baja del dispositivo en `POST`/`DELETE
      /v1/me/devices`, y el móvil se registra al arrancar y se suelta al salir.
      En desarrollo `PUSH_PROVIDER=console`, así que no sale nada del ordenador;
      producción no arranca con ese valor.
- [x] Pantalla del empleador: `InboxPage`. No es aceptar o rechazar, es un
      selector de persona —"¿Quién va?"— con el profesional pedido, uno mismo y
      cada trabajador. Elegir a otro distinto pide confirmación y deja el
      trabajo en `SUBSTITUTE_PROPOSED`.
- [x] Pantalla del trabajador: `AgendaPage`, con dirección, cliente y teléfono
      para llamar. El importe llega `null` desde el servidor para un empleado, o
      sea que no se oculta en la pantalla: no se envía.

### Lo que quedó pendiente de esto

- [x] **Hecho** (19 Agosto 2026). `GET /v1/pro/inbox` ya dice, trabajo a
      trabajo, si quien mira puede quedárselo (`canAssignToSelf`), y la bandeja
      apaga el botón cuando no.

      Buscando el motivo del rechazo resultó no ser el que se apuntó aquí —"una
      empresa sin ficha propia"—: sin ficha ni siquiera se llega a la bandeja,
      que devuelve 404 antes. Lo que rechaza de verdad es el **oficio**: al
      asignar se exige que el elegido lo tenga dado de alta, así que una empresa
      que gana una subasta de fontanería estando dada de alta como electricista
      pulsaba "Yo mismo" y se comía el error.

      Y el mismo fallo estaba en la plantilla, que no se había mirado: se
      ofrecían todos los empleados, tuvieran el oficio o no. Ese caso se
      resuelve en el móvil sin preguntar nada, porque los oficios de cada uno ya
      vienen en la lista de empleados.

      Las dos opciones se apagan con el motivo en vez de esconderse: quien no
      encuentra a los suyos en la lista cree que la app los ha perdido.

### El trabajador confirma el trabajo (acordado el 20 Agosto 2026)

Hasta hoy, cuando la empresa asigna un trabajo a uno de los suyos, el trabajo
pasa a adjudicado y se acabó: al trabajador se le avisa, pero no se le pregunta.
La empresa compromete sus horas sin que él diga nada, y si ese día está de baja
o ya tiene otra cosa, **el cliente se entera cuando no aparece nadie**.

A partir de ahora, entre "asignado" y "adjudicado" hay un paso: **el trabajador
acepta o rechaza**, y quien va a ir es quien lo dice.

**El recorrido**

1. La empresa asigna → el trabajo queda **pendiente de confirmar** y sale en
   **Encargos del trabajador**, con un plazo corto —un par de horas—.
2. **Acepta** → pasa a su Agenda y **se avisa al cliente**: confirmado, y quién
   va.
3. **Rechaza**, y entonces tiene que decir por qué. Con empresa, vuelve al jefe
   para que mande a otro por la vía de la sustitución que ya existe; el cliente
   solo se entera si eso le cambia la persona. Sin empresa —un autónomo— vuelve
   al cliente y el trabajo queda libre, y ahí sí hay que decírselo, porque se
   queda sin nadie.
4. **Se le pasa el plazo** → lo mismo que un rechazo, sin motivo.

**El motivo del rechazo no se le enseña al cliente.** Es el mismo criterio de
las ausencias: el motivo es para quien organiza el trabajo, y una baja médica es
asunto de quien la tiene. Al cliente le llega lo que le afecta —"te proponen a
otro profesional"—, no la razón de nadie.

**Modal para decidir, aviso para informar.** Al trabajador se le enseña un
diálogo al entrar: bloquear la pantalla se justifica porque hay que responder.
Al cliente, cuando solo se le informa de que su trabajo queda confirmado, no:
un diálogo con un único botón de aceptar es un estorbo. El cliente ve diálogo
cuando **hay algo que decidir**, que es el caso que ya existe de aceptar o
cancelar un sustituto.

Del diálogo del trabajador quedan dos cosas decididas:

- **Sale el más urgente, no todos.** Tres diálogos encadenados al abrir la app
  son una encerrona; el resto espera en Encargos y la home dice cuántos quedan.
- **Se puede cerrar sin responder.** Quien abre la app para otra cosa tiene
  derecho a hacerla, y el trabajo sigue esperando hasta que venza el plazo. Un
  diálogo sin salida se acaba respondiendo de cualquier manera con tal de
  quitarlo de en medio.

**Los colores del diálogo**: aceptado va en el azul de la barra de abajo con su
misma transparencia (`accentGlass`), y rechazado en el rojo del anillo de
disponibilidad con esa misma transparencia — `rgba(209, 84, 74, 0.72)`—, que es
el rojo que ya usa la app para decir "ahora no", no el de error. En los dos,
Uhiro arriba.

**Las urgencias se quedan fuera de todo esto.** Se deciden en minutos y su
ventana existe justamente para que el cliente asigne al trabajador directo, sin
intermediario: una confirmación en dos pasos la rompería.

**Lo que hay que construir**

- Backend: el estado de "pendiente de confirmar", el endpoint de aceptar y
  rechazar con motivo, el plazo corto con su vencimiento en `expire-overdue`, y
  los avisos que faltan.
- Móvil: un diálogo reutilizable —hoy no hay ninguno, solo `Modal` suelto dentro
  del selector y del campo de fecha—, la pantalla del motivo, y el aviso en la
  home de cuántas confirmaciones quedan.

**Y un agujero que hay que tapar en cualquier caso** (visto el 20 Agosto 2026):
cuando la empresa asigna a la persona que el cliente eligió, el aviso se manda
**solo al trabajador** (`assign-job.use-case.ts`). Al cliente no se le dice
nada: el caso normal —"sí, va quien pediste"— hoy lo descubre entrando a mirar.

### Selectores de fecha y hora, en toda la app

Va junto con esto porque las ventanas de urgencias son días y horas, y no
tiene sentido construirlas con campos de texto mientras el resto de la app
los usa.

Hoy la publicación de un trabajo pide dos fechas escritas a mano —cuándo
cierra la subasta y cuándo se necesita— y eso es pedir errores: formatos
distintos, meses cambiados, fechas imposibles.

- [x] Un solo componente de fecha y hora para toda la app: `DateTimeField`
      (14 Agosto 2026). Ya no queda ningún campo de fecha escrito a mano.
- [x] **Capturar la hora, no solo el día** (18 Agosto 2026). Publicar un
      trabajo y encargárselo a alguien concreto piden ya día **y** hora. El
      backend no hubo que tocarlo: `preferredDate` ya era `DateTime` y la
      validación `z.coerce.date()`; la hora se perdía en el móvil, en
      `toIsoDate`.

      Se manda como instante en UTC (`toIsoDateTime`) y no como hora local, que
      es lo que hace que el cambio de hora no sea un problema: en el día de 25
      horas hay dos "02:30" locales y un solo instante para cada uno.

      Conviven dos formas de dato antiguo sin hora —"2026-08-16" en los
      borradores del móvil y "2026-08-16T00:00:00.000Z" en lo que devuelve el
      servidor— y `formatJobWhen` las reconoce para no inventarse una hora: sin
      eso, un trabajo de antes se vería "a las 02:00", que es la medianoche UTC
      y no una hora a la que nadie va a ir.
- [ ] **Horario de verano.** Es lo que hace que esto no sea trivial: en
      España hay un día de 23 horas y otro de 25. Una franja "de 22:00 a
      06:00" en la madrugada del cambio no dura ocho horas, y el cierre de
      una subasta puesto en la hora que se repite es ambiguo.
      Las fechas se guardan y se comparan en UTC —ya lo son en la base— y se
      pintan en la zona del usuario; lo que no se puede hacer es sumar horas
      a mano sobre una hora local.
- [ ] Revisar dónde hay ya fechas u horas: publicar trabajo (cierre de
      subasta y cuándo se necesita), reserva instantánea (Fase 7),
      disponibilidad y ausencias (Fase 6).

### Decisiones que ya se tomaron

1. **¿Puede el empleador mandar a otro trabajador?** Sí, pero no a la callada:
   el trabajo pasa a `SUBSTITUTE_PROPOSED` y es el cliente quien acepta o
   rechaza el cambio (`POST /v1/jobs/:id/substitute`). Hasta que conteste, el
   trabajo sigue en el aire: no es una adjudicación.
2. **Si el empleador no responde**: 24 horas, y luego el trabajo queda libre.
   Se le dice al avisarle ("Tenéis 24 horas para responder") y lo aplica
   `expire-overdue`. En urgencias siguen siendo 30 minutos.
3. **La tarifa de urgencia lleva los recargos dentro** (18 Agosto 2026). El
   `hourlyRate` que el empleador pone en la franja es el precio final: no se le
   suman encima el +20% de sábado, el +35% de domingo y festivo ni el +25%
   nocturno. Es él quien decide si esa hora vale más por caer en sábado, y lo
   mete en el número.

   Tiene sentido con el resto: la franja ya es "este trabajador, este día, a
   esta hora", así que la hora ya está elegida cuando se pone el precio.
   Aplicar encima un recargo por la hora sería cobrarla dos veces.

   No había que cambiar ningún cálculo —no existe: en el backend no hay
   aritmética de porcentajes por ninguna parte—, solo dos textos que afirmaban
   lo contrario, en el aviso al empleador y en el esquema de la API.

---

### ✅ RESUELTO: el aviso de "te falta el documento" (19 Agosto 2026)

`GET /v1/me/documents` devolvía el **array pelado** y el cliente del móvil leía
`data.items`. Eso daba `undefined`, la lista quedaba vacía por el `?? []`, y
`hasIdentity` era falso **siempre**: aprobar los documentos no cambiaba nada,
porque nunca llegaban a contarse.

Era el único endpoint de lista de la API que no usaba sobre `{ items }`
—assignments, urgencies, inbox y el de administración sí—. Se corrigió el
servidor y no el móvil, para que la excepción desapareciera en vez de
propagarse.

Lo que costó encontrarlo: el síntoma apuntaba a la aprobación y a la caché, que
es donde se miró primero. Por el camino se encontró y arregló una fuga real de
caché entre cuentas, pero no era la causa de esto.

**Lo que hay que aprender de esto:** un `?? []` convierte un desajuste de
contrato en una lista vacía perfectamente plausible, y ahí no hay nada que
delate el fallo. El fichero tenía su línea `Contrato:` apuntando al controlador
y aun así se escribió el cliente suponiendo la forma. La línea no basta si no se
abre lo que señala.

---

## 🎯 Fase 6: Calendario y Disponibilidad (Pro)

**Duración estimada**: 4-5 días

### Día 22-23: AvailabilityPage ✅ (19 Agosto 2026)
**Hecho**:
- [x] `AvailabilityPage` en `/mi-horario`, enlazada desde Mi cuenta, donde el
      "Calendario de disponibilidad" no llevaba a ninguna parte.
- [x] Tabla `availability_windows` y `GET`/`PUT /v1/pro/availability`.
- [x] Hook `useMyAvailability`.

**La duda que lo tenía parado**: si compartía tabla con `UrgencyWindow`. **No.**
Tienen la misma forma pero son dos cosas: la de urgencia dice "salgo a una
avería el sábado de noche y la hora cuesta esto", esta dice "trabajo de nueve a
seis". Compartirla obligaría a una columna discriminadora y a dejar la tarifa
opcional, con la regla "obligatoria si es de urgencia" viviendo en el código en
vez de en la base. Lo que sí se comparte es lo difícil —hora local española y
partir en la medianoche—, que ahora vive en `common/local-time`.

**Lo que se añadió sobre las urgencias**: al guardar se juntan las franjas del
mismo día que se tocan. Quien pone "de 9 a 13" y luego "de 11 a 14" quiere decir
de 9 a 14; el hueco de la comida no se toca.

**Decidido por el camino**:
- El horario de un empleado lo pone su empresa, igual que sus oficios. A él se
  le explica en vez de enseñarle un editor que el servidor va a rechazar.
- En lugar del "toggle 24h" y el "aplicar a todos los lunes" que decía este
  plan, un atajo que solo sale con el horario vacío: de lunes a viernes de 9 a
  18. Es el horario de mucha gente y ahorra montar cinco franjas; quien no lo
  tenga así cambia lo que necesite.

**La empresa también** (19 Agosto 2026, más tarde): las mismas tres pantallas
—horario, zona y ausencias— las usa un empleador con la ficha de su gente, con
el trabajador en la dirección. Detrás está el mismo código: los casos de uso se
partieron en "quién puede" y "qué se guarda", y solo lo primero cambia.

Faltaba, y no era un detalle: al empleado se le decía "esto lo pone tu empresa"
en tres pantallas y la empresa no tenía dónde ponerlo. Solo podía fijarle las
franjas de urgencia.

**Sin hacer, y a propósito**: el editor no reagrupa para enseñarlo. Un turno de
noche de viernes vuelve del servidor partido en dos —viernes 22:00-00:00 y
sábado 00:00-06:00—, que es como está guardado. Se verá si molesta cuando
alguien lo use de verdad.

- [ ] ~~Organism AvailabilityWeek~~ · ~~Molecule TimeRangeRow~~ — no hicieron
      falta: la pantalla es una tarjeta por franja con los componentes que ya
      hay (`Picker`, `DateTimeField`, `FormField`), igual que el horario de
      urgencias.

---

### Día 24-25: Recargos y Ausencias
**Tareas**:
- [ ] **Los recargos los pone cada profesional, con la ley de base**

      Hoy son tres constantes en `src/utils/surcharges.ts` —sábado +20%,
      domingo y festivo +35%, nocturno +25%—, iguales para todo el mundo y sin
      nadie que las aplique. Pasan a ser de cada quien: el autónomo pone los
      suyos, y **el empleador los pone para cada uno de sus trabajadores**,
      igual que ya le pone el horario, la zona y las ausencias.

      Se entra con los valores de la ley ya puestos y una nota que dice qué
      manda la ley en cada caso, con dos salidas: dejarlos como están o
      cambiarlos. **Lo que la app sugiere es ajustarse a la ley**, y así lo
      dice.

      **Qué manda la ley, que no es un porcentaje para todo:**

      | | Lo que dice | De base |
      |---|---|---|
      | **Nocturno** (22:00–06:00) | Obliga a pagarlo aparte pero **no dice cuánto**: lo fija el convenio (art. 36.2 ET). El 25% es lo más extendido. | +25% |
      | **Domingo y festivo** | Trabajar el día de descanso semanal o un festivo, sin descanso compensatorio, se paga con **+75% como mínimo** (art. 47 del RD 2001/1983, que sigue vigente). | +75% |
      | **Sábado** | No existe recargo de sábado en la ley. Lo que sí dice es que el descanso semanal comprende "la tarde del sábado […] y el día completo del domingo" (art. 37.1 ET), así que para quien descansa entonces la tarde del sábado cae en la casilla de arriba. | +20%, sin respaldo legal y se puede quitar |

      **Esto cambia dos de los tres números de hoy.** El de domingo y festivo
      se queda muy corto: +35% donde la ley pide +75%. El de sábado no lo
      manda ninguna ley, así que se ofrece como costumbre del oficio y no como
      obligación.

      **Cuidado con lo que promete la nota.** Todo lo de la tabla es lo que una
      empresa debe **pagarle a su trabajador en nómina**. No es lo que un
      autónomo le cobra a un cliente: ahí el precio es libre y la ley no fija
      nada. La nota tiene que decirlo con esas palabras, porque si no le
      estamos colocando a un autónomo una obligación que no tiene, y dándole a
      un empleador la idea de que cobrándole el recargo al cliente ya cumple
      con su gente. Son dos cosas distintas y la app las ve las dos: al
      autónomo se le habla de precio y se le da la ley como referencia; al
      empleador se le recuerda que ese porcentaje es además lo que le debe a
      quien va a hacer el trabajo.

      **Lo que hay que construir:**

      - Backend: dónde viven los porcentajes de cada profesional —tres campos
        en `ProProfile` o tabla propia, según cuántos tipos acaben siendo— y
        `GET`/`PUT /v1/pro/surcharges`, con la variante del empleador sobre la
        ficha de su trabajador. Los casos de uso ya están partidos en "quién
        puede" y "qué se guarda" desde el horario y la zona: aquí solo cambia
        lo primero.
      - Móvil: pantalla `/mis-recargos` colgando de Mi cuenta, con la nota y un
        botón de "dejar lo que dice la ley" que devuelve los valores de base.
        Al empleado se le explica que los pone su empresa, como en las otras
        tres pantallas.
      - `utils/surcharges.ts` deja de ser la fuente: se queda con los valores
        legales de referencia y el texto de la nota. Los que se enseñan salen
        del profesional.
      - Los dos sitios que hoy pintan la constante —la ficha del profesional y
        el aviso de Publicar— pasan a leer los del profesional.

      **Lo que no se toca:**

      - **No se acumulan, se aplica el más alto.** Un sábado por la noche es
        nocturno, no nocturno más sábado. Con porcentajes libres eso pasa a
        importar de verdad: alguien puede poner el sábado por encima del
        nocturno y entonces manda el sábado.
      - **La tarifa de urgencia sigue llevando los recargos dentro** (decisión
        del 18 Agosto). Sobre una franja de urgencia no se aplica nada de
        esto: el empleador ya eligió el día y la hora al ponerle precio.
      - La franja nocturna cruza la medianoche, y partirla ya está resuelto en
        `common/local-time` para el horario y las urgencias. Se reutiliza.

      **Sin decidir:**

      1. **Qué es festivo.** Hoy no hay ningún calendario en el proyecto, así
         que "domingo y festivo" solo sabe de domingos. Cómo se resuelve, en el
         apartado siguiente.
      2. **Si hay techo.** Nada impide poner +500% y que la app lo enseñe. O se
         acota, o se avisa al cliente, o se deja al mercado.
      3. **Qué hereda un trabajador nuevo**: los de su empresa o los de la ley.
      4. **Si se permite el 0** —trabajar el domingo al mismo precio—. Para un
         autónomo es legítimo; para un empleador es una señal de que a su
         trabajador tampoco le está pagando el recargo.
#### Los festivos: de dónde salen y hasta dónde llegamos

Sí se puede automatizar, con una corrección: **no los descarga la app**. Los
descarga el backend una vez al año y los guarda en la base. Si los bajara cada
móvil serían miles de peticiones a la misma fuente para leer lo mismo, no
habría festivos sin cobertura, y el día que un boletín cambie de formato
habría que actualizar la app en las dos tiendas en vez de tocar un servidor.

**Son tres niveles y solo dos son fáciles.**

- **Nacionales y autonómicos** (los 14 del año: 8 comunes y el resto que cada
  comunidad fija o sustituye). Salen de **una sola resolución del BOE cada
  octubre** —la de 2026 es `BOE-A-2025-21667`—, y el BOE tiene datos abiertos
  con XML por documento. Son unas 250 filas al año de una fuente estable y
  oficial, que además se puede citar en pantalla: "según el BOE". Esto se
  automatiza entero.
- **Locales**: dos días por municipio, y aquí se rompe. No los publica el BOE
  sino cada comunidad en su boletín, con formatos distintos. Madrid, Andalucía,
  Catalunya y Euskadi tienen datos abiertos —Euskadi incluso una API REST—; de
  otras solo hay PDF. Son **8.131 municipios por dos días**, de diecisiete
  fuentes que cambian de forma cuando quieren.

**Lo que se propone**: automatizar los nacionales y autonómicos desde el BOE;
para los locales, empezar por las comunidades que publican datos abiertos e ir
sumando, y en las demás **dejar que el profesional añada sus dos días**,
diciéndole de dónde salen los que ya ve y cuáles ha puesto él. Prometer los
8.131 municipios desde el primer día es prometer lo que no se puede sostener,
y un festivo local que falta significa cobrar de menos sin enterarse.

**Falta saber de qué comunidad es cada base.** Hoy de la base solo se guarda
`city` —el texto que devuelve Photon— más las coordenadas y el radio. Photon
devuelve también `state` (la comunidad) y `postcode`, y `toMatch` los tira.

Lo sólido no es el nombre del municipio, que se repite por toda España, sino
**el código postal: sus dos primeras cifras son la provincia**, sin excepciones.
De ahí a la comunidad hay una tabla de 52 filas que no cambia. Con eso el
calendario autonómico sale sin depender de nadie más. Para el local hace falta
el municipio de verdad —el código del INE—, y eso es otra conversación.

**Qué festivo cuenta: el de la base.** Un fontanero de Móstoles que arregla
una avería en Madrid capital el 15 de mayo está trabajando en un festivo que no
es el suyo, y aun así se le aplica el de Móstoles: es el que puede saber por
adelantado y el que se le puede enseñar en una lista.

**La pantalla**: los festivos del año de su comunidad, en una lista, diciendo
de cuáles cobra recargo y cuáles ha añadido él. Y no confundirla con las
ausencias: un festivo es un día en que se cobra más, no un día en que no se
trabaja.

**Decidido: manda el festivo de la base** (20 Agosto 2026). El calendario que
se le aplica a alguien es el de la comunidad donde tiene puesta la base, no el
del sitio al que va. Es lo que puede saber por adelantado y lo que puede
enseñársele en una lista; el trabajo todavía no existe cuando pone sus precios.

**Ya construido** (20 Agosto 2026, backend):

- `src/common/spanish-region.ts`: código postal → provincia → comunidad, las 52
  provincias y las 19 columnas del BOE.
- `scripts/fetch-holidays.ts`: baja la resolución del BOE de un año y deja
  `src/common/holidays/<año>.ts` generado. El de 2026 ya está: 36 fechas.
- `src/common/holidays/index.ts`: `holidaysFor(año, comunidad)` y
  `holidayOn(día, comunidad)`.

La prueba que lo valida es contar: **12 festivos por comunidad**, que son los
14 de ley menos los 2 locales. Salen 12 en dieciocho y 11 en Canarias, que es
exactamente la nota (1) del BOE —allí el duodécimo lo pone cada isla—. Si
alguna vez sale otro número, algo se rompió al bajarlo.

Dos cosas que costaron y conviene no volver a descubrir: el BOE numera con
sufijo las fiestas que caen el mismo día (`header2304A`, `header2304B`), y en
2026 escribe `headerheaderCastillaLM` con el prefijo duplicado. Saltarse las
casillas raras en silencio dejaba 27 fechas de 36 y un calendario que parecía
correcto. Ahora una columna desconocida **para el script**.

#### El aviso en el horario y quién decide cobrar el recargo

**El editor del horario semanal no puede marcar festivos, y no es un olvido**:
`AvailabilityWindow` va por `weekday` —0 a 6, cada semana igual—, y un festivo
es una fecha. En "los martes" no cabe "el 8 de diciembre".

Lo que sí se puede, y es lo que se hará:

- **Avisar en el editor.** Al abrir o guardar el horario, los festivos que
  vienen y caen en días que trabaja: "El martes 8 de diciembre es festivo
  (Inmaculada Concepción) y tienes horario de 9:00 a 18:00". Sirve de puente
  entre las dos pantallas sin meter fechas en una tabla de días de la semana.
- **Decidir fecha a fecha, en el calendario de festivos.** Tres respuestas por
  festivo: no trabajo, trabajo con recargo, trabajo sin recargo. Por defecto,
  lo que tenga puesto en sus recargos —que arranca en lo que dice la ley—, y
  el mismo botón de "dejar lo que dice la ley" pero para ese día.
- **"Ese día no trabajo" ya existe: es una ausencia de un día.** No hace falta
  inventar nada para eso; se marca como ausencia y manda sobre el horario,
  igual que las vacaciones. Lo único que hay que guardar de verdad es **si
  cobra el recargo ese día**, y solo cuando se aparta de lo que tiene puesto:
  una fila por excepción, no una por festivo.

**Quién decide**: el autónomo, él. El empleado, no —se lo pone su empresa,
como el horario, la zona y las ausencias—. Y ahí la app dice una vez lo que
toca y no vuelve a insistir: la empresa es libre de no cobrarle el recargo al
cliente, pero el recargo del festivo se lo debe igual a su trabajador, en
nómina o en descanso compensatorio. Son dos bolsillos distintos.


#### Lo construido el 20 de agosto de 2026

**Backend, entero.**

- `ProProfile` guarda `postcode` y los tres recargos, con la ley de base:
  `sunday_surcharge` a 75, `night_surcharge` a 25 y `saturday_surcharge` a 20.
  Migración `recargos_y_festivos`, aplicada.
- `HolidayChoice`, tabla **solo de excepciones**: quien cobra el recargo todos
  los festivos no tiene ninguna fila. Volver a lo de siempre borra la fila en
  vez de guardarla, porque si guardara las coincidencias, cambiar el recargo
  general dejaría de afectar a los días que nadie tocó nunca.
- `GET`/`PUT /v1/pro/surcharges`, `GET /v1/pro/holidays?year=` y
  `PUT /v1/pro/holidays/:date`, con las cuatro variantes del empleador sobre
  `/v1/employees/:id/…`. Los casos de uso, partidos en "quién puede" y "qué se
  guarda" como el horario y la zona.
- La respuesta de los recargos **lleva dentro los valores de la ley**. No se
  dejan solo en el móvil a propósito: con una copia en cada lado, el día que
  cambie una enseñaríamos una cosa y cobraríamos otra.
- Un festivo que no lo es en la comunidad de quien pregunta se rechaza con
  `NOT_A_HOLIDAY` en vez de guardarse por si acaso.

**Móvil**: los tipos espejo de los cuatro endpoints, y el **código postal
viajando** desde el buscador de direcciones y desde "usar mi ubicación" hasta
`PUT /v1/pro/coverage`. Sin eso el calendario no sabría de qué comunidad es
nadie, que era el único cabo suelto que dejaba la pantalla de la zona.

**Las dos pantallas, hechas el mismo día.** `/mis-recargos` con la nota de la
ley y un botón para volver a ella —que **no toca el sábado**: ninguna ley lo
fija, así que ponerle un número y llamarlo legal sería inventárselo—, y
`/mis-festivos`, la lista del año con un interruptor por día. Las dos cuelgan
de Mi cuenta y las dos las usa el empleador con la ficha de su gente, con el
trabajador en la dirección, como el horario y la zona.

Un empleado **sí ve** su calendario aunque no pueda tocarlo: son los días que
va a trabajar. Lo que se apaga es el interruptor, con el motivo al lado.

**El aviso en el editor del horario**, que era lo que no encajaba: el horario
va por día de la semana y un festivo es una fecha, así que en "los martes" no
cabe "el 8 de diciembre". Lo que hace es avisar de los tres festivos que vienen
y caen en días con horario, y mandar al calendario a decidirlos. Se cruzan con
el horario **guardado**, no con el que se está editando.

**Falta**: el cálculo del recargo sobre un importe, que llegará con la reserva
instantánea (Fase 7), y los festivos locales.

- [x] **Ausencias** (19 Agosto 2026). Tabla `absences`, `GET`/`POST`/`DELETE
      /v1/pro/absences` y la pantalla `/mis-ausencias`.

      Se adelantó al resto de este día porque publicar el horario en la ficha
      dejó a la app prometiendo "lunes de 9 a 14" el lunes que uno está en la
      playa.

      Días completos con los dos extremos incluidos: "del 1 al 15" son quince
      días y el de vuelta es el 16. Sin horas —nadie se va de vacaciones a las
      14:37—. El **motivo no sale en la ficha**: al cliente le basta con la
      fecha y una baja médica es asunto de quien la tiene.

      Mandan sobre todo lo demás: desaparece de "disponible ahora", no le llegan
      urgencias, y su ficha dice el día que vuelve —el siguiente al último que
      está fuera, que enseñar el último diría "vuelve el 25" de alguien que el
      25 sigue fuera—.
- [ ] Vista previa de precio, con los porcentajes de quien lo mira.
- [ ] Hook useSurcharge (fórmula completa), leyendo los del profesional y no
      la constante.

---

## 🎯 Fase 7: Reserva Instantánea y Presupuesto

**Duración estimada**: 3-4 días

### Día 26-27: Reserva Instantánea
**Tareas**:
- [ ] BookingFlow
  - Selector de día
  - Selector de hora
  - Duración
  - Dirección
  - Desglose de precio
- [ ] Molecule DateTimePicker
- [ ] Hook usePriceQuote (cálculo completo)

---

### Día 28: Presupuesto Directo
**Tareas**:
- [ ] QuoteRequestPage
  - Formulario privado
  - 24h para responder
  - Mock de envío

---

## 🎯 Fase 8: Integración con Backend

**Duración estimada**: 5-7 días
**Prerequisito**: Backend con OpenAPI disponible

### Día 29-30: Cliente API
**Tareas**:
- [ ] Instalar openapi-typescript + openapi-fetch
- [ ] Generar tipos del schema OpenAPI
- [ ] Configurar cliente base
- [ ] Interceptors para tokens
- [ ] Refresh token automático

---

### Día 31-32: TanStack Query Hooks
**Tareas**:
- [ ] Hook usePros (GET /v1/pros)
- [ ] Hook useProProfile (GET /v1/pros/:id)
- [ ] Hook useJobs (GET /v1/jobs)
- [ ] Hook useCreateJob (POST /v1/jobs)
- [ ] Hook useBids (GET /v1/jobs/:id/bids)

---

### Día 33-34: Reemplazar Mocks
**Tareas**:
- [ ] Conectar todas las pantallas a API real
- [ ] Eliminar datos mock
- [ ] Manejo de errores
- [ ] Estados de carga

---

## 🎯 Fase 9: Cartera y Pagos (Pro)

**Duración estimada**: 4-5 días

### Día 35-36: WalletPage
**Tareas**:
- [ ] WalletPage
  - Saldo actual
  - Onboarding Stripe Connect
  - Botón retirar
  - Historial de movimientos
- [ ] Integrar @stripe/stripe-react-native

---

### Día 37-38: Retiradas
**Tareas**:
- [ ] WithdrawalFlow
  - Importe
  - IBAN (validación)
  - Estándar gratis / Instantáneo 1%
  - Confirmación
- [ ] IBAN validator

---

## 🎯 Fase 10: Trabajos y Hitos (Cliente)

**Duración estimada**: 5-6 días

### Día 39-40: JobDetailPage
**Tareas**:
- [ ] JobDetailPage
  - Progreso visual
  - Fotos del trabajo (galería)
  - Lista de hitos
  - Acciones según estado
- [ ] Organism JobGallery
- [ ] Organism MilestoneTimeline

---

### Día 41-42: Gestión de Hitos
**Tareas**:
- [ ] MilestoneCard interactivo
  - Retener pago
  - Solicitar liberación
  - Aprobar
  - Pedir cambios
  - Abrir disputa
- [ ] Hook useMilestoneFlow

---

### Día 43: Valoraciones Mutuas
**Tareas**:
- [ ] ReviewForm
  - 8 criterios con estrellas
  - Comentario
  - Recomendación sí/no
- [ ] Organism CriteriaRating

---

## 🎯 Fase 11: Notificaciones y Chat

**Duración estimada**: 4-5 días

### Día 44-45: Notificaciones
**Tareas**:
- [ ] NotificationsPage
  - Lista de notificaciones
  - Leído/no leído
  - Filtro
  - Marcar todas
  - Accionables (navegan)
- [ ] Integrar expo-notifications
- [ ] Push notifications (EAS)

---

### Día 46-47: Chat
**Tareas**:
- [ ] MessagesPage (lista de threads)
- [ ] ThreadDetailPage
  - Mensajes con contexto del trabajo
  - Adjuntos
  - WebSocket real-time

---

## 🎯 Fase 12: Seguridad y Release

**Duración estimada**: 5-7 días

### Día 48-49: Seguridad Completa
**Tareas**:
- [ ] Certificate pinning (M5)
- [ ] Biometría para pagos (M3)
- [ ] Root/jailbreak detection (M7)
- [ ] FLAG_SECURE en Android (M7)

---

### Día 50-51: Build de Release
**Tareas**:
- [ ] Configurar EAS Build
- [ ] Ofuscación y minify (M7)
- [ ] Eliminar console.log
- [ ] Sourcemaps privados

---

### Día 52: CI/CD
**Tareas**:
- [ ] GitHub Actions / GitLab CI
- [ ] npm audit en pipeline
- [ ] SAST scanning
- [ ] Dependabot
- [ ] Auto-deploy a EAS

---

## 📊 Resumen de Fases

| Fase | Días | Componentes Clave | Prioridad |
|------|------|-------------------|-----------|
| 2 - Auth | 7 | Login, Register, HomePage | 🔴 Alta |
| 3 - Directorio | 5 | ProList, ProProfile, Reviews | 🔴 Alta |
| 4 - Publicar | 6 | PublishPage, UrgencyPage | 🔴 Alta |
| 5 - Pujas | 5 | OffersPage, BidForm | 🔴 Alta |
| 6 - Disponibilidad | 5 | Calendar, TimeRanges | 🟡 Media |
| 7 - Reservas | 4 | BookingFlow, PriceQuote | 🔴 Alta |
| 8 - API | 7 | OpenAPI, TanStack Query | 🔴 Alta |
| 9 - Cartera | 5 | WalletPage, Stripe | 🔴 Alta |
| 10 - Trabajos | 6 | JobDetail, Milestones | 🔴 Alta |
| 11 - Notif+Chat | 5 | Push, WebSocket | 🟡 Media |
| 12 - Security | 7 | Pinning, Biometrics | 🔴 Alta |

**Total estimado**: ~54 días (~11 semanas)

---

## 🎯 Cómo Usar Este Roadmap

### Cada Día:
1. ✅ Lee la tarea del día
2. 🔧 Implementa los componentes listados
3. 📱 Compruébalo en el móvil
4. 📝 Actualiza el checklist
5. 🚀 Commit al final del día

### Cada Semana:
- 📊 Revisar progreso vs estimado
- 🔄 Ajustar prioridades si es necesario
- 🧹 Refactorizar código acumulado
- 📚 Actualizar documentación

### Flexibilidad:
- ⏩ Puedes saltar días si ya dominas el tema
- ⏸️ Puedes tomar más tiempo en secciones complejas
- 🔀 Puedes reordenar fases según necesidades del proyecto

---

## 📌 Comandos Útiles Diarios

```bash
# Al empezar el día
git pull
npm install  # Por si hay nuevas deps
npm run type-check

# Durante desarrollo
npm start  # Expo en un terminal
npm run type-check  # Comprobación de tipos

# Al terminar el día
npm run type-check
git add .
git commit -m "Day X: [descripción de lo implementado]"
git push
```

---

## 🎯 El horario en calendario, los niveles y los recurrentes ✅ parcial (31 Agosto 2026)

Tres cosas de la misma tarde, y el hilo que las une es la agenda: **quién está
libre, cuándo, y qué se cobra por ello**.

### El horario del profesional pasa a ser un calendario ✅

`AvailabilityPage` era una lista de siete filas —una por día de la semana—.
Compacta y mentirosa en dos sentidos: no dejaba decir "este jueves solo por la
mañana", y no enseñaba lo ya comprometido, así que se podía abrir un hueco
encima de un trabajo que ya se tenía.

- [x] Tabla `availability_overrides`: excepciones por fecha encima del patrón
      semanal. Sin filas manda el semanal; con filas la fecha queda sustituida
      entera; una fila con las horas a nulo es el día cerrado —**que no es lo
      mismo que no tener filas**, y por eso guardar vacío y el `DELETE` son dos
      operaciones distintas—.
- [x] `GET /v1/pro/availability/calendar?month=` — el mes resuelto día a día:
      horario, excepciones, ausencias, festivos y citas.
- [x] `PUT/DELETE /v1/pro/availability/days/:date` y el atajo
      `PUT /v1/pro/availability/weekdays`.
- [x] `MonthCalendar` (organismo nuevo), `AvailabilityPage` rehecha, y el
      horario semanal listado y editable debajo del calendario.
- [x] Lo mismo para la empresa sobre sus trabajadores.

**Un fallo que borraba datos, encontrado por el camino**: el servidor escribe la
medianoche como `"00:00"`, así que al reguardar un turno de noche se creaba una
franja de cero minutos el día siguiente y **se le borraba a ese día su horario
de verdad**. La aritmética vive ahora en `weeklyPieces`/`weekdaysTouched`,
aparte y probada.

### Los niveles de comisión ✅ (`COMO_SE_CONTRATA.md` §12)

De 0 % a **10 %**, y baja con el volumen que el profesional trae a la
plataforma. Los nombres son las castas de un hormiguero: **Obrera, Forrajera,
Soldado y Reina**.

- [x] La comisión deja de ser un porcentaje puro: pasa a
      `porcentaje × importe + 0,40 €`, que es la forma con la que cobra Stripe.
      Con solo un porcentaje **siempre** hay un importe por debajo del cual se
      pierde dinero, y un mínimo en euros no lo arregla: mueve el punto malo al
      cruce en vez de quitarlo.
- [x] `CommissionPolicy` con clave `(kind, level)` y `fixedFee`; 44 filas
      sembradas. `Employer.commissionLevel`.
- [x] `ReviewCommissionLevelsUseCase` + cron el día 1 de cada mes sobre los 90
      días anteriores. Un plantón congela la subida pero **no** la bajada.
- [x] `GET /v1/payments/commission-level` y la pantalla `/mi-nivel`, en Mi
      cuenta al lado de la cartera.

La comisión se congela al crear cada cobro, así que en un contrato recurrente
—un cobro por sesión— **subir de nivel se nota en la sesión siguiente**, también
en lo ya firmado.

### Contratos recurrentes 🚧 (`CICLOS_DE_CONTRATACION.md` §F)

Diseñado entero y construida la primera pieza.

- [x] **El diseño**, §F: sin fecha de fin con ventana móvil de 8 semanas; los
      días que no caben se avisan antes de pagar; **los que chocan por hora se
      pueden mover a otra hora de ese mismo día**; y el dinero va por sesión,
      porque una autorización de Stripe caduca a los 7 días.
- [x] **La comprobación de disponibilidad**: `recurrence.ts`,
      `CheckRecurrenceUseCase` y `POST /v1/pros/:id/recurrence-check`. Cinco
      motivos de choque, y **solo dos llevan alternativas** —`busy` y
      `outside`—; `away`, `closed` y `notice` no tienen nada que ofrecer.
- [x] `prisma/seed-recurrentes.ts`: cuatro clientes y cuatro trabajadores de
      prueba, uno de ellos (**Rosa**) con las mañanas de L/X/V ya comprometidas,
      que es lo que hace falta para ver el choque.
- [ ] `book-hours` — la reserva por horas. **No existe**: hoy solo se sabe
      contratar la carta a precio cerrado.
- [ ] El selector de huecos en el móvil. `FreeSlotsUseCase` lleva semanas hecho
      y probado en el servidor y **no lo llama nadie desde la app**.
- [ ] `book-recurring`, `accept-recurring`, los dos pasos del barrido
      —autorizar 24 h antes y estirar la ventana— y las cancelaciones.
- [ ] Las tres pantallas de §F10.

**El orden para seguir está en §F11**: selector de huecos → `book-hours` →
la pantalla de la comprobación → la serie → cancelaciones.

### Suelto

- [x] Oficio **Reformas**, con su ilustración (`src/images/reformas.png`).
- [x] **El icono de la app**: era el logotipo apaisado (2067x761) con
      transparencia, así que iOS lo estiraba dentro del cuadrado y se veía
      enorme. Ahora 1024x1024, sin alfa y con margen para la máscara de
      esquinas. Hay una variante con la cara de Uhiro sin aplicar en
      `_fuentes/icono/icon-uhiro.png` — decisión de marca.

**Verde al terminar: 427 pruebas en el backend, 322 en el móvil**, `tsc` limpio
en los dos. Commits `172029e` (backend), `42001e3` y `550e521` (móvil).

---

## 🎯 El dinero no llega a casi ningún camino (comprobado el 31 Agosto 2026)

Robin cerró un trabajo entero en pruebas y **en ningún momento se le pidió
pagar**. No es un fallo: es que ese camino no cobra.

### Lo comprobado en su base

- **Un solo caso de uso crea cobros: `book-services`** —la carta a precio
  cerrado—. Ningún otro.
- **Cero `Charge` en toda la base.**
- Todos sus trabajos son `INSTANT`: ninguno pasó por la carta.
- **Un solo `Employer` con cuenta de Stripe.** Los del seed no la tienen.

### Qué significa

El ciclo del dinero del 29 de agosto —autorizar, capturar al contratar, liberar
al cerrar, anular gratis, 3D Secure— **está construido y probado, pero solo
cuelga de `book-services`**. El camino genérico (`request-pro` → asignar →
empezar → terminar → cerrar) crea el trabajo sin ningún `Charge`, así que
`complete-job` cierra y no hay nada que liberar.

Es lo que ya decía §0 de `CICLOS_DE_CONTRATACION.md` —"`INSTANT` se inventa el
importe"—, pero visto desde el uso real pesa más de lo que parecía en la lista:
**la parte más delicada del sistema está hecha y casi nadie pasa por ella.**

Y detrás hay un segundo muro: `CreateChargeUseCase` exige que quien cobra tenga
`stripeAccountId` y `stripeTransfersEnabled`. Aunque el primer problema no
existiera, un cobro a los profesionales de prueba fallaría con
`PayoutAccountNotVerifiedError`.

### Qué hacer

- [x] **El precio por horas** (§A1–A2): el mínimo del oficio y el desglose que
      se enseña antes de pagar. Hecho el 1 de septiembre, abajo.
- [x] **`book-hours`** (§A3): `Job(HOURLY)` + `Appointment(RESERVED)` +
      `Charge(HOURS)` con ese desglose. Hecho el 1 de septiembre, abajo.
- [x] **Decidir qué pasa con `request-pro`** — primer paso dado el 2 de
      septiembre: **deja de ser el destino de «Reservar ahora»**. Ese botón
      lleva ahora a donde se paga, por horas o por carta según cobre ese
      oficio. **Pero no basta**: ver la regla de abajo, que manda sobre esto.
- [x] **Cuenta de cobro para todo profesional**. Hecho el 2 de septiembre por
      la tarde: pantalla propia, accesible desde Mi cuenta, y exigida para
      aceptar. Lo que queda es **pedirla en el alta** y los 30 días de gracia
      de §9 —abajo—.
- [x] Sembrar cuentas de Stripe de prueba en `seed-recurrentes.ts`. Hecho el
      1 de septiembre: `prisma/seed-stripe.ts`, y con él **el ciclo del dinero
      se ha visto entero por primera vez** —abajo—.

---

## 🎯 El precio de contratar por horas ✅ (1 Septiembre 2026)

El primer paso de `book-hours`: **saber cuánto cuesta antes de pagar**
(`CICLOS_DE_CONTRATACION.md` §A1–A2). No cobra nada todavía; deja hecha la
cuenta que va a cobrar el paso siguiente.

### El mínimo de horas, que no existía

La ficha decía «14 €/h» y nada más, así que se le podía pedir a alguien media
hora de limpieza: el desplazamiento se lo come entero y no había forma de decir
que no antes de que llegara el encargo.

- `ProTrade.minHours`, nuevo, con su migración. **Nulo es sin mínimo, no cero**,
  y solo tiene sentido con `hourlyRate` puesto: quien cobra por visita ya tiene
  un suelo, que es la propia visita, y `proTradeSchema` lo rechaza ahí.
- Va en el **oficio** y no en el perfil: a nadie le compensa desplazarse por
  cuarenta minutos de limpieza, y una clase suelta de una hora es el caso
  normal. Con un solo mínimo para todo el perfil habría que elegir entre perder
  los encargos cortos o regalar los desplazamientos.
- En el móvil: campo propio en «Mis oficios y tarifas» y en el alta —solo en
  modo por hora—, y **en la tarjeta del directorio pegado al precio**,
  «14 €/h · mín. 2 h», que es donde el cliente tiene que verlo.

### El desglose

`priceHours`, cuenta pura, y `GET /v1/pros/:id/hours-quote` encima. Es el
ejemplo literal de §A2:

```
3 h × 14 €/h                        42,00 €
Jueves laborable                    sin recargo
Total                               42,00 €
```

Tres decisiones que estaban escritas y ahora están construidas:

- **El recargo lo decide la hora de inicio.** Una limpieza que empieza el
  sábado a las 23:00 y cruza a domingo se cobra a un solo precio. Partirla por
  tramos daría un desglose que nadie sabe leer y una discusión por cada minuto;
  el sector cobra la salida, no el reloj.
- **No se acumulan: manda el más alto.** Un festivo en sábado no es +95 %. A
  igualdad gana el que mejor lo explica —«Festivo (Todos los Santos)» antes que
  «Domingo»—.
- **El festivo es el de esa persona**: el de su comunidad por código postal, más
  los locales que añadió a mano, más la excepción que le haya puesto a ese día.
  Misma regla que su calendario (`decided ?? sundaySurcharge > 0`), porque es la
  que se le enseña ahí.

Y **la misma cuenta la hará `book-hours`**: el precio que se enseña y el que se
cobra no pueden salir de dos sitios, o un redondeo distinto enseña 42,00 y cobra
42,01.

### Lo que queda pegado a esto

- [ ] `book-hours` (§A3), que es lo siguiente.
- [ ] **El selector de huecos en el móvil.** El espejo ya está —`prosApi.slots`
      y `prosApi.hoursQuote`—, falta la pantalla. `FreeSlotsUseCase` sigue sin
      que lo llame nadie desde la app.

**Verde al terminar: 460 pruebas en el backend, 325 en el móvil**, `tsc` limpio
en los dos.

---

## 🎯 Reservar por horas, y el dinero en el camino normal ✅ (1 Septiembre 2026)

`book-hours` (§A3). Lo que hace que el ciclo del dinero del 29 de agosto deje
de colgar solo de la carta.

### La cita nace al reservar, y eso cambia de forma el resto

`book-services` no crea cita: la abre el profesional al aceptar. Por horas no
vale, porque el cliente **ha elegido una hora concreta y ha puesto el dinero**.
Si la cita no existiera hasta la aceptación, ese jueves a las diez se le
seguiría ofreciendo a todo el mundo durante 24 horas.

- **`AppointmentStatus.RESERVED`**, nuevo: ocupa agenda como cualquier cita en
  juego, pero no espera respuesta de nadie a nivel de cita —el reloj de quien
  tiene que contestar vive en el trabajo—.
- **`assign-job` la confirma en su sitio** en vez de abrir otra. Sin esto el
  profesional recibía un 404 al aceptar un encargo que sí era suyo: el índice
  de "una sola cita en juego por trabajo" no deja abrir la segunda. Y la hora
  no se toca nunca: es la que se pagó.
- **Rechazar, cancelar y caducar la sueltan.** Cada uno por su camino, y los
  tres hacían falta: una reserva que se cae sin soltar el hueco deja la agenda
  ocupada para siempre por un trabajo cerrado.
- El índice único pasa a decirse en negativo —en juego es todo lo que no ha
  terminado— para no tener que tocarlo cada vez que aparece un estado nuevo.

### El hueco se comprueba dos veces

Una antes, con su horario y sus ausencias, para poder decir que no sin cobrar.
Y otra dentro de la transacción **con la fila del profesional bloqueada**,
porque entre las dos pasan minutos y la agenda es de otro: sin el cerrojo, dos
clientes que pulsan a la vez pasan los dos y los dos insertan.

### El plazo deja de ser siempre 24 h

Es lo que quede hasta **dos horas antes de la cita**, si es menos (§A4). Con 24
h fijas, una reserva para mañana a las diez se contestaría después de la hora a
la que había que estar allí.

### Dos agujeros que estaban abiertos y aparecieron por el camino

- **`book-services` buscaba al que cobra por la relación equivocada.**
  `ProProfile.employer` es «para quién trabajo» y en un autónomo es nulo
  siempre; la empresa propia cuelga del **usuario**. O sea que **ningún
  autónomo podía cobrar** —y son justo los que tienen carta—. Es la razón de
  que no hubiera ni un `Charge` en la base, y no solo que el camino genérico no
  cobre. Los dobles de prueba tenían la forma vieja, así que el fallo no lo veía
  nadie.
- **Cancelar no soltaba el dinero.** Quien contrataba y se arrepentía antes de
  que el profesional contestase se quedaba con el importe retenido para
  siempre: el trabajo se cancelaba y el `Charge` no lo tocaba nadie. Ahora pasa
  por el mismo `UndoJobChargesUseCase` que rechazar y caducar.

### Comprobado contra la base

Un hueco ya ocupado se rechaza con `SLOT_NOT_AVAILABLE` sin tocar dinero; uno
libre llega hasta la tarjeta y se para en `PAYMENT_METHOD_MISSING`, que es el
muro que queda. Sin encargos fantasma ni citas sueltas detrás.

### Visto entero, por fin

`prisma/seed-stripe.ts` le da cuenta de cobro a los cuatro trabajadores y
tarjeta guardada a los cuatro clientes, en el Stripe de pruebas. Con eso, el
recorrido completo contra el servidor local:

```
1. tarjeta de Lucía: visa ···4242
2. hueco libre: 2026-09-02T09:00Z
3. desglose: 3 h × 14 €/h = 42 €
4. reserva: booked · cobro AUTHORIZED · 42 €
5. Rosa acepta: CONTRACTED · cita CONFIRMED
6-7. empieza y termina
8. Lucía da por bueno: COMPLETED · released 42
```

Y en la base: `Charge HOURS 42 € RELEASED`, comisión del 10 % congelada en
4,60 €, con transferencia real de Stripe (`tr_…`). La cita conserva la hora que
se pagó de principio a fin.

**Lo que hizo falta para activar una cuenta sin formulario**, comprobado contra
la API y no deducido: una `recipient` con identidad y términos rellenados se
queda restringida por dos cosas y solo dos, `defaults.profile.business_url` y
una cuenta bancaria. Con la url basta para transferir; el banco solo abre los
`payouts`. Y hay un cerrojo: con una clave que no sea `sk_test_`, el seed no se
ejecuta.

### Lo que falta

- [ ] **Las pantallas**: el selector de huecos y la de confirmar con el
      desglose. El espejo está entero —`prosApi.slots`, `prosApi.hoursQuote`,
      `assignmentsApi.bookHours`—, no lo llama nadie todavía. **Es lo único que
      separa esto de poder usarse desde el móvil.**

**Verde al terminar: 479 pruebas en el backend, 325 en el móvil**, `tsc` limpio
en los dos.

---

## 🎯 Que la app se entere sola, sin recargar (pedido por Robin, 31 Agosto 2026)

Hoy hay que salir de la pantalla y volver para ver que te han aceptado un
trabajo, que un cliente te ha mandado uno, o que te han escrito. En una app así
eso no se sostiene.

**No es "poner notificaciones": los avisos ya están casi todos.** Lo que falta
es que la app haga algo con ellos.

### Lo que ya hay, verificado el 31 Agosto 2026

- **18 casos de uso del backend mandan push**: `assign-job`,
  `confirm-assignment`, `respond-substitute`, `decline-request`, `cancel-job`,
  `cancel-contract`, `book-services`, `request-pro`, `request-urgency`,
  `accept-urgency`, `start-job`, `finish-job`, `complete-job`, `reassign-job`,
  `expire-overdue`, `send-job-message`, `send-admin-reply` y
  `review-commission-levels`.
- El móvil **registra el token** (`usePushRegistration`).
- **Solo el chat se refresca solo**, y por sondeo: hilos cada 20 s, mensajes
  cada 5 s, no leídos cada 30 s.

### El agujero

`usePushRegistration` **no tiene un solo `invalidateQueries`**. Llega el aviso
al móvil y la pantalla se queda como estaba. Ese es el fallo, y es pequeño de
tapar comparado con lo que parece desde fuera.

**Un ejemplo de que el problema es ese y no otro** (comprobado el 31 Agosto,
sobre una petición de Robin de "avisar al cliente cuando el trabajador empieza o
termina"): ese aviso **ya existe y es correcto**.

- `start-job` → al cliente: *"Han empezado — [Pro] ha empezado «[trabajo]»"*
- `finish-job` → al cliente: *"¿Ha quedado bien? … Si no dices lo contrario en
  24 horas, lo damos por bueno y se le paga."*
- Las dos con `data: { screen: 'job', jobId }`.

Es decir: **el estado del trabajo no es reactivo por el mismo motivo**, no por
falta de avisos. El aviso trae el `jobId` dentro; lo que falta es que alguien lo
lea y refresque ese trabajo. Un solo arreglo tapa los dos síntomas.

### Qué hacer ✅ (1 Septiembre 2026)

- [x] **Escuchar la notificación recibida** y traducir su `data.screen` a una
      invalidación. `usePushInvalidation`, en la raíz de la app: escucha el
      aviso que llega con la app abierta **y** el que el usuario toca, que no
      son el mismo caso —al tocar, lo que se pinte tiene que estar al día en
      ese primer pintado—.
- [x] **Refrescar al volver a primer plano**: `useRefreshOnForeground`, que
      sale de generalizar el de la cuenta de cobro. **Invalida, no solo
      refresca**: con cinco minutos de `staleTime`, volver a la app a los
      treinta segundos no traería nada, y treinta segundos es justo lo que
      tarda alguien en contestarte.
- [x] **Repasada la lista de quién avisa.** De los 19 casos de uso que cambian
      algo, faltaban dos: `start-urgency` y `finish-urgency`. Sus equivalentes
      normales avisaban desde hace tiempo. Se nota más aquí que en ningún
      sitio: quien tiene una fuga a las tres de la mañana está esperando a que
      llamen al timbre.
- [x] **El chat sondea según lleguen o no los avisos.** Con ellos, los mensajes
      pasan de 5 s a 20 s; sin ellos se queda como estaba. Elegir un solo
      número obligaba a gastarle batería a todo el mundo o a dejar el chat
      muerto a quien no da el permiso. Lo dice `usePushStore`, que
      `usePushRegistration` escribe en cada arranque —el permiso puede
      cambiarse desde los ajustes del sistema entre dos aperturas—.

### Cómo quedó, y por qué así

**Se invalida a lo bruto, a propósito.** `invalidateQueries` solo vuelve a
pedir lo que está montado; lo demás se marca caducado y se pedirá al abrirlo.
Así que enumerar de más no cuesta peticiones, y afinar de menos **no se ve**:
la app sigue enseñando lo viejo, que es exactamente el fallo que esto arregla y
que nadie sabría distinguir de "todavía no ha llegado el aviso".

**Un `screen` desconocido refresca lo que caduca solo.** Una app instalada no
se actualiza a la vez que el servidor; quedarse quieto ante un aviso nuevo
dejaría al usuario viendo lo de antes sin ninguna pista.

**Dos escrituras para lo mismo**: el backend manda `screen: 'jobs'` en nueve
sitios y `screen: 'job'` en cuatro. Se aceptan las dos y no se toca el
servidor: un aviso ya encolado en Expo seguirá trayendo la que traía.

### Lo que sigue sin hacerse, y sigue bien así

- **Navegar al tocar el aviso.** `data.screen` dice a dónde llevar al usuario,
  pero llevarle es otra decisión —a qué pestaña, qué pasa si está a medias de
  escribir algo—. Refrescar arregla el fallo de hoy sin mover a nadie.
- **Websockets.** Nada de lo de arriba los necesita.

**Lo que NO hay que hacer todavía**: websockets. Con push + invalidación +
refresco al volver a primer plano se cubre todo esto sin montar un transporte
nuevo, y si algún día hace falta tiempo real de verdad —ver "está escribiendo"—
se decide entonces y por su cuenta.

---

## 🎯 Los avisos, de verdad y en los dos móviles ✅ (1 Septiembre 2026, tarde)

La invalidación por push estaba hecha esa misma mañana, pero **no había llegado
nunca un aviso a ningún móvil**. Tres muros, uno detrás de otro, y cada uno se
veía igual desde la app: "no me llega nada".

1. **`PUSH_PROVIDER=console` en el `.env`.** El servidor imprimía una línea en
   su consola y no mandaba nada. Puesto en `expo`, y avisado en `.env.example`
   —cuesta una tarde descubrirlo—.
2. **Con la app abierta, iOS no enseña nada** salvo que se lo digas.
   `setNotificationHandler` con `shouldShowBanner`: el aviso llegaba y los
   oyentes se disparaban, pero no se veía.
3. **Android no tenía canal.** En Android 8+ el canal decide si suena y si se
   asoma; sin ninguno, todo caía en el que Expo crea solo, sin prioridad. Se
   crea `avisos`, y el servidor lo nombra al enviar (`channelId`).

### Y Android necesitaba Firebase, que no estaba

El síntoma era "a Android no le llegan", pero la verdad era otra: **ese móvil
nunca llegó a pedir un token**. Sin `google-services.json` no puede registrarse
en FCM. iOS no pasa por ahí —habla con Apple y de eso se encarga EAS— y por eso
funcionaba uno y el otro no.

- `google-services.json` del proyecto `lughly`, commiteado (solo lleva
  identificadores públicos) y enganchado con `android.googleServicesFile`.
- La clave de cuenta de servicio FCM V1, subida a EAS. Esa **no** va al
  repositorio.

**Y se hizo visible el fallo**, que es lo que costó la tarde: quedarse sin
token no daba error, así que "no llegan avisos" y "nunca pidió token" se veían
idénticos. Ahora `usePushRegistration` dice el motivo en desarrollo —emulador,
permiso, projectId, o FCM—. En producción sigue callado.

### Dos trampas que conviene tener escritas

- **El token es del aparato, no de la persona.** Probando dos cuentas en un
  mismo móvil, solo la última que entra recibe avisos. Para probar los dos
  lados hacen falta dos aparatos, y ninguno puede ser un emulador.
- **De un canal de Android ya creado solo se pueden cambiar el nombre y la
  descripción.** El sonido y la prioridad se quedan como se pusieron la primera
  vez, en cada móvil que ya lo tenga. Cambiarlos de verdad obliga a desinstalar
  o a estrenar identificador. (Pasó: el canal se creó con `sound: 'default'`,
  que en la entrada es **un nombre de fichero**, no la palabra.)

---

## 🎯 El reloj del trabajo ✅ (1 Septiembre 2026, tarde)

Empezar y terminar movían el trabajo pero solo se lo contaban a una parte, y el
tiempo trabajado no salía a ninguna pantalla.

- **`WorkTimer`**, igual en los dos lados. El origen lo pone el servidor
  (`startedAt`): dos relojes de pared no coinciden, y un contador que a cada uno
  le diga una cosa es peor que no tenerlo.
- **El cliente confirma el inicio** (`approve-start`) y al profesional le llega
  que del otro lado se han enterado. **No es un permiso**: el reloj corre desde
  que él pulsa Empezar. Si esperase, un cliente con el móvil en silencio dejaría
  a alguien trabajando sin que le contaran las horas.
- **Al terminar se avisa a los dos.** Al profesional le faltaba, y es el aviso
  de que el reloj se ha parado y de cuándo cobra.
- **"En curso" deja de mentir.** Con la hora de fin puesta, la etiqueta dice
  «Falta darlo por bueno». El dato ni siquiera viajaba en la lista.

**El reloj todavía no cobra**: se factura lo pactado al reservar, no lo que
marque el contador. Enlazarlos es §A6 y es otra pieza.

---

## 🎯 El teclado tapaba los campos en Android ✅ (1 Septiembre 2026, tarde)

El remedio que había era `automaticallyAdjustKeyboardInsets`, **solo de iOS**.
Estaba en catorce pantallas, y otras cuatro con campos no tenían ni eso.

`react-native-keyboard-controller` —lo que recomienda Expo para formularios
largos— detrás de `FormScrollView`, que recoge la configuración una vez para
las dieciséis: el hueco bajo el campo enfocado es el mismo que se reserva para
la píldora flotante (sigue ahí con el teclado abierto), y
`keyboardShouldPersistTaps` para que el primer toque en un botón no se lo coma
el teclado.

**Es nativa, así que hay que reconstruir el dev client.** Y como revienta al
importarse si falta su módulo, `keyboardController` la carga con cuidado y cae
a lo de antes: la app arranca igual mientras la build de EAS termina. En cuanto
está, entra sola.

---

## 🎯 Lo siguiente (2 Septiembre 2026)

### 1. El botón de reservar no se habilita ✅ (hecho esa misma noche)

Rellenas el formulario de encargar y «Enviar la reserva» sigue apagado, sin
decir por qué. No es un fallo nuevo: son cinco condiciones invisibles.

```
chosenTrade !== null
title.trim().length >= 8
description.trim().length >= 20
city.trim().length >= 2
address !== null
```

Las dos que muerden: la **descripción pide 20 caracteres** («cambiar bombilla»
son 16), y la **dirección tiene que elegirse de las sugerencias** —solo
entonces se rellena `address`, porque de ahí salen las coordenadas—. El campo se
ve lleno y por dentro está a `null`.

Un botón apagado sin explicación es un callejón sin salida, y ya se arregló una
vez en otro sitio (commit del 26 de agosto, «Formularios que dicen qué les
falta»).

- [x] Decir qué falta debajo del botón, con lo que falla y no con la lista de
      normas. En el color del texto, no en rojo: es lo que queda por hacer, no
      un reproche a quien está rellenando.
- [x] Marcar el campo, contando lo que falta —«Te faltan 4 caracteres»— y solo
      cuando ya se ha escrito algo: un formulario recién abierto no puede salir
      en rojo. El error del servidor sigue mandando sobre el de aquí.
- [ ] Revisar si 20 caracteres son razonables en una reserva instantánea a
      tarifa conocida. Para un presupuesto sí; sin decidir.

**Y el patrón que lo produce, que es lo que conviene recordar**: la regla vive
solo en la condición que apaga el botón, así que existe pero no se puede leer.
Ha pasado dos veces en una semana. Merece un vistazo en cualquier formulario
nuevo.

### 2. Las pantallas de reservar por horas ✅ (hecho el 2 de septiembre)

`BookHoursPage`, la ruta `/reservar-horas` y el reparto de «Reservar ahora»
según cómo cobre cada oficio. Abajo, en su propia sección.

### 3. Suelto

- [ ] `BlurView` en Android avisa de que le falta `blurTarget` y se cae a "sin
      desenfoque": los botones de cristal de la entrada no se ven como en iOS.
- [ ] El importe en los avisos se escribe «42.00 €», con punto. Viene de
      `toFixed(2)` y está en los dos sitios; hay que arreglarlos a la vez.

---

## 🎯 Contratar por horas desde el móvil ✅ (2 Septiembre 2026)

Robin volvió a probar el ciclo entero —Leti de clienta, él de trabajador— y el
resultado fue el mismo que el 31 de agosto: **los avisos perfectos y a Leti no
se le pidió pagar en ningún momento**. Seis trabajos entre los dos en la base,
los seis `INSTANT`, `mode` a nulo, **cero cobros**.

No era un fallo nuevo: era que «Reservar ahora» llevaba al encargo genérico,
que no cobra. Y Leti no tenía forma de llegar a lo que sí cobra —Robin no tiene
carta, y las pantallas de horas no existían—.

### El botón lleva a donde se paga

«Reservar ahora» ya no tiene un solo destino. Lo decide **cómo cobra ese
oficio**, que es un dato del profesional y no algo que el cliente deba adivinar:

| Cómo cobra | A dónde va | Qué se paga |
|---|---|---|
| Por hora (`hourlyRate`) | `/reservar-horas` | Las horas elegidas, con el mínimo del oficio y los recargos |
| Por visita (`visitFee`) | `/contratar-carta` | La visita, más lo que se haya marcado de la carta |
| Ninguna de las dos | `/encargar` (`INSTANT`) | Nada: el camino de antes |

Se prefiere el oficio con el que venía mirando el cliente; si no traía ninguno,
el primero que tenga. **`Presupuesto` no cambia**: pedir precio es justo lo que
no lleva precio todavía.

### La pantalla: se elige un rato de la agenda de alguien

`BookHoursPage`. El orden es el de la pregunta real —cuánto, qué día, a qué
hora— y no el del formulario de antes:

1. **Cuánto tiempo**, en pasos de media hora hasta ocho. De aquí salen las
   horas que se cobran **y** los huecos donde le cabe: son el mismo dato.
2. **Qué día**, hasta un mes vista, que es lo que mira el servidor.
3. **A qué hora**, y esto es lo que hace que sea una reserva y no un encargo:
   una rejilla con **sus huecos libres de ese día para ese rato**, sacados de
   su horario menos sus ausencias menos lo que ya tiene.
4. Dirección, y una nota opcional.
5. **El desglose del servidor**, tal cual: horas × tarifa, el mínimo del oficio
   si ha subido las horas, el recargo que toque, el total y las dos frases de
   las condiciones. Aquí no se suma nada —el calendario de festivos y las
   excepciones de esa persona viven en el servidor— porque rehacer la cuenta
   acabaría enseñando un total distinto del que se cobra.

**El día sin huecos no se queda en un «no» a secas.** Los primeros que tenga
después ya vienen en la misma respuesta, así que se ofrecen para tocarlos: sin
eso, quien pide un martes lleno se pone a probar días a ciegas.

Y el formulario dice qué le falta, con el patrón del 1 de septiembre: la hora,
la dirección —que hay que elegir de las sugerencias—, la tarjeta.

### El segundo muro: quien se registra a mano no puede cobrar

Con las pantallas hechas, la reserva seguía sin poder salir: **`robin@yopmail.com`
no tenía `Employer`**, o sea nadie a quien pagarle, y `CreateChargeUseCase` la
habría parado con `PayoutAccountNotVerifiedError`.

No es un olvido del seed. La cuenta de cobro cuelga del `Employer`, y **un
autónomo solo tiene `Employer` si se declara así** (`BecomeEmployerUseCase`),
cosa que el alta de profesional no pregunta. `seed-stripe.ts` se salta con un
aviso a quien no lo tenga, así que las cuentas creadas a mano desde la app
—las que se usan para probar de verdad— quedaban fuera del dinero.

`prisma/seed-cuentas.ts`: le crea el `Employer` de autónomo a quien le falte y
después llama al seed de siempre. Se le pasan correos y reparte por rol.

```
npx ts-node prisma/seed-cuentas.ts robin@yopmail.com leti@yopmail.com
```

Es una **muleta**, no el arreglo: lo que hay que construir es pedir la cuenta
de cobro en el alta, que sigue en la lista de arriba.

### Lo que apareció al probarlo, esa misma tarde

**El día sin huecos no decía nada útil.** «Ese día no le queda hueco de 3 h» y
se acabó. Con la lista de comienzos vacía no se puede distinguir «solo le caben
dos horas» de «ese día no trabaja», que son dos respuestas muy distintas para
quien está eligiendo, y mandarle a otro día por media hora teniendo la tarde
libre es la forma más tonta de perder una reserva.

- **`GET /v1/pros/:id/day-ranges`**: los ratos libres seguidos de ese día y el
  más largo de todos, con la antelación mínima aplicada. Sale de partir en dos
  lo que ya hacía `findFreeSlots` —los huecos primero, los comienzos después—,
  así que la búsqueda de siempre no cambia.
- En la pantalla, el aviso **en rojo**, debajo su horario libre de ese día
  («10:00 – 12:00 · 2 h») y un botón para pedir lo que sí cabe sin cambiar de
  día.

**Y detrás, el motivo de verdad: 18 de los 23 perfiles sembrados no tenían
horario.** Los huecos salen del horario, así que esos no tenían ni uno **en
todo el mes**: salían en el directorio, su ficha ofrecía «Reservar ahora» y la
pantalla no encontraba nada ningún día. Dos arreglos, y son distintos:

- **El horario supuesto** (`weeklyByWeekday`): quien no ha puesto ninguno se
  considera disponible **todos los días de 8 a 18**. Es una suposición nuestra,
  no un dato suyo, y vive en un solo sitio para que los huecos que se enseñan y
  los que acepta la reserva salgan de la misma. Una excepción de un día suelto
  sigue mandando sobre ella.
- **`seed-pros.ts` les pone horario**: de lunes a viernes, 9–14 y 16–19. Con
  parón de comida a propósito, que es lo que hace que la pantalla enseñe dos
  ratos sueltos y no un bloque.

### Y la otra cara: no se acepta con la ficha a medias

Si al profesional se le supone un horario, no puede comprometerse de verdad
sobre esa suposición. **Aceptar un trabajo exige ahora tener puesto el horario
y aportado el documento de identidad** (`requireReadyToWork`, en `assign-job` y
en `confirm-assignment`).

- Se comprueba **al aceptar y no en el alta**: quien se registra un domingo por
  la noche puede terminar su ficha, y solo cuando hay un trabajo de verdad
  delante se le pide lo que hace falta.
- **Decir que no sí puede** aunque le falte: bloquearlo dejaría la cita colgada
  esperando a alguien que ya sabe que no va.
- El mensaje dice **qué** falta, y se escribe distinto según quién lo lea: al
  autónomo se le tutea, a la empresa que manda a uno de los suyos se le nombra
  a quién le falta.
- Y en la bandeja —la pantalla a la que lleva el aviso de «te han elegido»—
  sale arriba, con un botón a cada cosa. Enterarse **al pulsar «Aceptar»**, con
  el reloj de 24 horas corriendo, es la peor forma de saberlo.

### Lo que falta

- [ ] Probarlo en los dos móviles de punta a punta: reservar, aceptar, empezar,
      terminar y cerrar, mirando que el cobro pase de retenido a liberado.
- [ ] Un profesional de pruebas **con carta**, para ver el otro reparto del
      botón. Robin no tiene servicios, así que hoy solo se recorre la rama de
      horas.
- [ ] Si tiene un oficio por horas y otro por visita, «Reservar ahora» elige el
      de horas sin preguntar. Lo suyo es preguntar para cuál se le contrata,
      como hace el formulario de encargo.

**Verde al terminar: 505 pruebas en el backend, 389 en el móvil**, `tsc` limpio
en los dos.

---

## 🎯 El profesional no tenía dónde cobrar ✅ (2 Septiembre 2026, tarde)

Leti intenta contratar a Rocío Vega y el pago muere en «Todavía no se puede
contratar: falta completar la cuenta de cobro». Ni ella ni Rocío podían
arreglarlo desde ninguna pantalla.

### El nudo

La cuenta de cobro cuelga del `Employer`, y **la única forma de tener uno era
declararse con gente a cargo**. El autónomo que trabaja solo —la mayoría— no
pasaba por ahí nunca:

- En el alta, los datos fiscales solo se piden si marca «tengo gente a cargo».
- El único botón para abrirla vivía **dentro de «Mis trabajadores»**, y solo
  aparece con `Employer` ya creado.
- La Cartera está sin construir.

Resultado: se registra, sale en el directorio, le eligen, y el cliente se
estrella en el paso de pagar. **Los quince profesionales sembrados estaban
así**, y por eso se topó con ello a la primera.

### Cómo se resolvió

- **`PUT /v1/payments/identity`** guarda nombre fiscal y NIF **sin** pasar por
  la declaración de empleador. Colar esa aceptación para poder abrir la cuenta
  dejaría a todo autónomo firmado como responsable de una plantilla que no
  tiene: `staffResponsibilityAcceptedAt` se queda a nulo, que es lo que dice.
- **`PayoutAccountPage`** (`/mi-cobro`), desde Mi cuenta. Empieza explicando
  qué es —«aquí se te consigna el total de cada trabajo que te pague un
  cliente, menos la comisión»— porque es la única pantalla donde alguien teclea
  un número de cuenta.
- **Aceptar un trabajo la exige**, junto con el horario y el documento
  (`requireReadyToWork`). Aceptar uno que no se puede cobrar no es aceptar
  nada. Rechazar sigue pudiéndose.
- **`seed-pros.ts` les da cuenta de cobro** a los doce, con el cerrojo de
  siempre: sin clave `sk_test_` no se ejecuta.

### El camino del dinero, escrito para no volver a deducirlo

Son **tres saltos** y solo hacemos el segundo:

1. La tarjeta del cliente se retiene contra **nuestra** cuenta de Stripe.
2. Al cerrar el trabajo, `transfers.create` mueve **total − comisión** al saldo
   de la cuenta Connect del profesional (`transfersEnabled`).
3. Stripe le hace el *payout* a su banco según su calendario
   (`payoutsEnabled`). Ese salto no lo tocamos.

**El IBAN no pasa por nuestro servidor.** Se teclea en el formulario alojado de
Stripe y lo único que vuelve es el `acct_…`.

### Lo que falta

- [ ] **Pedirla en el alta**, con un «Ahora no» bien visible: obligar a pasar
      por Stripe en el registro pierde altas.
- [ ] **Los 30 días de gracia de §9.** Ojo con el orden: la gracia **no
      protege al cliente**, porque el muro está al reservar y no al aceptar.
      Solo tiene sentido para el camino genérico, que no cobra.

---

## 🎯 Lo que salió de probar la reserva por horas ✅ (2 Septiembre 2026, tarde)

Robin fue recorriendo la pantalla y apareciendo cosas. Todas arregladas:

- **El día lleno decía dos cosas a la vez.** La pista del campo —«sus huecos
  libres de 1 h ese día»— salía debajo de «ese día no trabaja». La pista solo
  aparece si hay algo que elegir, y el aviso es uno solo.
- **«Lo más pronto que puede» enseñaba tres comienzos del mismo día** —09:00,
  09:30, 10:00—, que se leen como un horario de 9 a 10 en vez de como tres
  formas de reservar el mismo rato. Ahora es **uno por día**, con su hora de
  fin, el campo se llama «¿A qué hora empieza?» y el desglose abre diciendo
  cuándo es.
- **La hora elegida** se pinta en el azul de la app con letra blanca
  (`accent700`: el blanco sobre el azul claro se queda en 2,6:1).
- **La tarjeta de arriba**: foto, nombre y oficio a la izquierda, la tarifa al
  otro extremo en grande, y el aviso de la retención en naranja.
- **La dirección, a la española**: número y código postal en una fila —los dos
  que no se pueden dejar en blanco— y escalera, piso y puerta debajo. Antes era
  un solo campo libre que dejaba fuera **lo único que no es opcional**, el
  número. `composeAddressLine` los junta en la línea que lee quien va.
- **El horario de la ficha**, un tramo por línea: dos tramos son veintinueve
  caracteres y la línea se partía por la mitad de una hora.
- **La descripción que no vale se marca en rojo** al salir del campo, no solo
  debajo del botón.

**Verde al cerrar el día: 511 pruebas en el backend, 406 en el móvil**, `tsc`
limpio en los dos.

---

## 🔴 Regla: no hay camino que no cobra (Robin, 2 Septiembre 2026)

**En Lughly no puede existir un camino de contratación que no cobre.** El que
aparezca se analiza y se corrige; no se deja «para más adelante» ni se
documenta como excepción aceptable.

**Por qué.** Un camino gratis vacía la plataforma por dentro: el trabajo se
hace, el cliente paga por fuera, la comisión no existe, y ni el cobro retenido
ni la garantía protegen a nadie. Y es el fallo que no se ve — todo lo demás
funciona: avisos, estados, chat—. Se ha topado con él dos veces seguidas
probando en el móvil, el 31 de agosto y el 2 de septiembre, las dos con «se
hizo el trabajo entero y no se me pidió pagar».

**Cómo se comprueba.** Antes de dar por bueno cualquier flujo, mirar si termina
creando un `Charge`. Hoy solo lo hacen **dos** casos de uso: `book-hours` y
`book-services`. Cualquier otro camino que llegue a `COMPLETED` es un agujero,
aunque nadie se haya quejado.

### Lo que quedaba abierto ✅ (cerrado el 3 Septiembre 2026)

- [x] **`request-pro`** — el encargo directo. Era el hueco abierto a todo el
      directorio: el botón «Presupuesto» de cualquier ficha. Ahora pedir
      presupuesto es contratar una visita, y `INSTANT` se ha ido de esa ruta.
- [x] **`create-job`** — solo admite `URGENT`. Publicar al aire a tarifa fija
      creaba un trabajo sin precio y sin nadie a quien pedírselo, porque la
      subasta que tenía que recogerlo **no existe** (no hay modelo `Bid` ni
      endpoint para pujar). Volverá con la subasta y con su cobro puesto.
- [x] **Las urgencias enteras** — se retiene la salida al pedirla, se captura
      al aceptar, y el rato que pasa de la primera hora se cobra al cerrar.
- [x] **Reasignar**, que no estaba en la lista y era el más silencioso de los
      cuatro. Ver abajo.

Detalle entero en la sección de abajo. **La regla sigue en pie**: el próximo
camino de contratación que se construya nace con su cobro puesto, y antes de dar
por bueno cualquier flujo se mira si termina creando un `Charge`.

---

## ✅ Ningún camino sin cobro: los cuatro, cerrados (3 Septiembre 2026)

Tres caminos llegaban a `COMPLETED` sin crear un solo `Charge`. Buscándolos
apareció un cuarto que no estaba en ninguna lista, y era el peor de los cuatro
porque no se ve desde ninguna pantalla.

Hoy **los seis casos de uso que cobran** son: `book-hours`, `book-services`,
`request-pro`, `reassign-job`, `request-urgency` y `finish-urgency`.

### 1. Pedir presupuesto: la visita se paga

`request-pro` creaba un `Job` y nada más. Ni cobro, ni precio pactado, ni forma
de que nadie cobrara nunca — y era el botón «Presupuesto» de **cualquier ficha
del directorio**, así que el hueco estaba abierto para todo el mundo.

Ahora pedir presupuesto es contratar una visita: se retiene lo que ese
profesional cobra por presentarse y se cobra cuando acepta. Lo que se paga es el
desplazamiento y el rato de mirarlo, **no el arreglo**, y por eso se cobra
aunque el presupuesto no convenza: el viaje ya se hizo.

**Y solo lo da quien tiene tarifa de visita** (corregido por Robin el mismo
día). `visitFee` es literalmente lo que cobra por ir a ver la avería antes de
dar un precio, así que quien la tiene es quien presupuesta.

La primera versión se lo calculaba también a los oficios por hora —`hourlyRate ×
minHours`, «su suelo»— para que el camino cobrara. **Cobraba, pero vendía algo
que en ese oficio nadie ofrece**: quien cobra por horas no vende precios
cerrados, vende ratos de su agenda, y a una limpiadora no se le pide
presupuesto. `hourlyRate` y `visitFee` son excluyentes en el esquema, y esa
exclusión son **dos modelos de negocio**, no un detalle de columnas.

Así que `visitPriceOf` devuelve tres cosas y no un número: `fee` (presupuesta,
y cuesta esto), `hourly` (no presupuesta, pero **sí se le puede contratar** por
horas) y `none` (no se le puede contratar de ninguna forma). Los dos últimos
acaban igual —no hay presupuesto— y llevan a sitios distintos, que es todo el
motivo de distinguirlos.

**Y el móvil avisa antes.** Un botón que hasta ayer era gratis y hoy cobra no
puede llevar directo al formulario: eso es un cobro a traición, aunque el
importe salga después en pantalla. El diálogo de la ficha dice las tres cosas
que el cliente no puede deducir: que alguien va a ir a su casa, cuánto cuesta
eso, y que se cobra aunque el presupuesto no le convenza.

Al que cobra por horas **no se le esconde el botón**: se le explica que no da
presupuestos y se le lleva a su puerta, que es reservarle horas y también cobra.
Un botón desaparecido deja al cliente buscándolo; uno que no explica nada, le
deja pensando que no se puede contratar.

El precio es **del oficio y no del profesional**, así que el oficio viaja a la
pantalla, y el desplegable del formulario solo trae los oficios suyos que
presupuestan.

### 2. Las urgencias, enteras

El camino más caro y el único gratis de punta a punta.

- **Al pedirla** (`request-urgency`) se retiene la **salida**: una hora al
  precio de urgencia que el cliente acaba de ver en la lista. Y se congela el
  precio en el `Job` (`mode: URGENT`, `agreedCalloutFee`, `agreedHourlyRate`),
  que es §0.2 de `CICLOS` —«la tarifa de urgencia que vio el cliente no se
  guarda»— por fin resuelto.
- **Al aceptar** (`accept-urgency`) se captura, que es el mismo sitio que en los
  otros tres caminos: donde un trabajo pasa a `CONTRACTED`.
- **Al terminar** (`finish-urgency`) se cobra el rato que pasó de la primera
  hora, en bloques de cuarto de hora redondeando arriba. Es la cuenta del §D4:
  una hora y cuarenta minutos son cuarenta de más, que se facturan como tres
  cuartos de hora.

**Se retiene al pedirla y no al aceptar**, aunque el §D3 lo contara al revés, y
es a propósito: con el cliente delante se puede resolver un 3D Secure, y a las
tres de la mañana el profesional acepta desde su móvil sin que haya nadie a
quien pedirle que autentique una tarjeta. Una autorización anulada no cuesta
nada, así que pedir el dinero antes de que nadie conteste no le cuesta al
cliente un céntimo si dicen que no.

### 3. `finish-urgency` deja de cerrar solo

Era el **único camino de la app que se cerraba por fuera de
`CompleteJobUseCase`**: ponía `COMPLETED` directamente. Dos consecuencias, y la
segunda solo aparece en cuanto hay dinero:

- El trabajo lo daba por bueno quien lo cobra, sin que el cliente dijera nada
  (§0.7).
- El cobro capturado se habría quedado retenido en la plataforma **para
  siempre**, porque quien libera es el cierre.

Ahora hace lo mismo que `FinishJobUseCase`: deja el trabajo `IN_PROGRESS` con la
hora de fin y 24 horas para el cliente. Al profesional se le suelta igual **en
el acto** — quien acaba de abrir una puerta de madrugada vuelve a estar de
guardia al salir del portal, no al día siguiente.

### 4. Reasignar, el que no estaba apuntado

**Era la forma más silenciosa de dejar de cobrar, y no se ve desde ninguna
pantalla.** El cobro del primero se anula al rechazar —y bien—, pero
`reassign-job` no creaba ninguno para el segundo. El nuevo aceptaba,
`CaptureJobChargesUseCase` no encontraba nada que capturar (devuelve cero, no
falla), hacía el trabajo, y el cierre liberaba 0 €. Todo verde: avisos, estados,
chat, cierre. Y nadie cobrando.

Ahora se suelta lo del anterior y se retiene **la visita del nuevo**, que es la
suya y puede no ser la misma. Y lo que se contrató con la agenda o la carta del
primero **ya no se reasigna**: las horas eran de aquel hueco y los servicios de
aquella lista, con aquellos precios. Se responde con salida —contratar al nuevo
desde su ficha— en vez de cobrarle al cliente el precio de uno por el trabajo de
otro.

### Lo que se arregló de camino

- **`complete-job` captura antes de liberar.** Liberar solo mueve cobros en
  `PAID`, así que una retención que llegara al cierre sin capturar no habría
  salido nunca: se habría quedado en la tarjeta del cliente hasta caducar a los
  siete días. Pasa con las horas de más de una urgencia, que nacen retenidas
  para que el cliente tenga sus 24 horas antes de que ese dinero se mueva.
- **El barrido de los cinco minutos suelta lo retenido.** Era la única de las
  tres ramas de caducidad que no lo hacía. Sin esto, una urgencia pedida a
  cuatro personas seguidas habría dejado cuatro retenciones vivas en la tarjeta
  del cliente.
- **El importe de los avisos, con coma.** Salía «42.00 €» con punto, de
  `toFixed(2)`. Lo escribe `formatEuros` (`common/money`), sin
  `Intl.NumberFormat`: según cómo se haya compilado Node el `es-ES` puede no
  estar, y volvería a salir con punto sin que nadie se enterara. El test de la
  reserva por horas **comprobaba el fallo** —«42.00 €» en un `expect`—, que es
  la forma más segura de que un fallo no se arregle nunca.
- **El reto del banco, en una pieza** (`useCardChallenge`). Estaba escrito dos
  veces y con la visita iba a ser la tercera; son cuatro mensajes y un orden de
  pasos donde el paso que se salta es el que decide si alguien trabaja gratis.

### Lo único que hizo falta en la base

`Job.paymentMethodRef`. El segundo cobro de una urgencia —las horas de más—
nace al terminar, de madrugada y sin el cliente delante, así que sin recordar la
tarjeta con la que autorizó la salida no habría con qué cobrarlo. Es el `pm_…`
de Stripe, pegado al `Customer` de ese cliente: no sirve para cobrar a nadie
más, y el número no pasa nunca por aquí.

### Lo que sigue abierto, y a la vista

- **La subasta no existe**: ni modelo `Bid`, ni endpoint para pujar, ni pantalla.
  Cuando llegue, nace con su cobro.
- **El presupuesto en sí tampoco**: `QUOTE` congela y cobra la visita, pero no
  hay modelo `Quote` ni forma de que el profesional diga cuánto cuesta el
  arreglo. Hoy el cliente paga la visita y el precio del arreglo se acuerda
  fuera. Es §C5 de `CICLOS`, y es el siguiente hueco de dinero — no un camino
  gratis, pero sí medio camino.
- **Las urgencias viejas** (pedidas antes de hoy) no tienen precio congelado ni
  tarjeta: al cerrarse no cobran las horas de más y lo dicen en el log.

---

## ✅ El ciclo del trabajo, de punta a punta (3 Septiembre 2026, tarde)

Todo lo que pasa entre que el profesional llega y el cliente paga. Estaba
construido a medias: los avisos existían, los botones existían, y entre unos y
otros faltaba lo que convierte eso en un recorrido.

### La agenda del profesional

- **El fondo dice en qué punto está cada trabajo**, con el tono suave de la
  familia que ya lleva su etiqueta. Sin esto son diez tarjetas blancas y hay
  que leer la etiqueta de cada una para saber cuál es la de ahora. Lo terminado
  va en gris y con el título apagado: lo hecho tiene que pesar menos que lo que
  está por hacer.
- **Ordenada por lo último aceptado.** Estaba por la fecha en que hay que ir,
  con el argumento de que una agenda ordena por lo que toca antes; lo que trae
  aquí al profesional no es planificar la semana sino lo que acaba de pasar.
- **El contador, en la propia tarjeta.** Quien está dentro de una casa
  trabajando no debería abrir una ficha para ver cuánto lleva.
- **Un trabajo cada vez.** No se empieza teniendo otro en marcha: dos relojes
  corriendo cuentan las mismas horas dos veces, y en dos trabajos por horas eso
  son dos facturas por el mismo rato. Se mira sobre el adjudicado y no sobre
  quien pulsa, y cuenta también la urgencia que tenga entre manos.
- **Y a su hora.** No se empieza más de diez minutos antes de la acordada.
  Tarde sí, siempre; sin hora acordada no se comprueba nada.

### Los dos avisos que el cliente tiene que contestar

Le llegaban al móvil y le traían a una ficha larga donde el botón que
correspondía era uno más entre otros. Ahora se abre un diálogo al entrar, que
cuenta qué ha pasado y qué significa responder. Cerrarlo sin contestar es
válido y no vuelve a saltar en esa visita.

### El reloj: el que cuenta y el que se ve

Son dos cosas y se confundían. El que **cuenta** corre desde que el profesional
pulsa Empezar y no lo mueve nadie — si lo moviera la confirmación del cliente,
un móvil en silencio dejaría a alguien trabajando sin horas contadas, y en un
trabajo por horas sin que se las paguen. El que **se ve** espera: al cliente no
se le pinta un contador de algo que no ha dado por cierto, y al confirmar
aparece ya con el tiempo corrido.

### El visto bueno deja de darse a ciegas

Es el botón que paga, y el cliente lo pulsaba sin ver nada de lo que estaba
dando por bueno. O callaba — y callar se trataba igual que decir que sí.

- **Fotos de cómo ha quedado.** El profesional las adjunta antes de marcar «He
  terminado» y el cliente las ve **encima** del botón que paga: la decisión se
  toma mirando eso. Van en la misma tabla que las del cliente con un `kind`, y
  los dos límites de cuatro son independientes.
- **«Falta algo».** La salida que no existía. Apaga el cierre por silencio y le
  manda el motivo a quien tiene que volver, al móvil y a su agenda. No es una
  disputa: es el paso de antes, el que casi siempre se arregla con que vuelva.
- **Un toque a la hora.** El aviso de «he terminado» se ve de pasada, así que a
  los sesenta minutos se le vuelve a tocar al cliente. **Recordar no es
  vencer**: el plazo real sigue siendo el de `confirmByAt`.
- **El diálogo avisa, no decide.** Preguntaba «¿ha quedado todo bien?» con el
  sí y el no dentro, y la respuesta a esa pregunta **no estaba en el diálogo**:
  está en las fotos que hay debajo, y el diálogo las tapa. Ahora dice que las
  mire y se quita; las dos respuestas —«Todo bien, dalo por bueno» y «Falta
  algo», ésta en rojo— viven en la ficha, pegadas a lo que hay que mirar.
- **El plazo, con su nombre y al lado de quien lo ha hecho.** Estaba suelto
  entre los dos botones del final: un «23h 05m» en medio de la pantalla que no
  decía de qué era. Va en la tarjeta de «Quién lo hace», en grande, con rótulo
  arriba y la consecuencia debajo. Siguen siendo 24 horas.

### Los avisos llevan a donde hablan

Tocar una notificación abría la app por donde se hubiera quedado. Ahora cada
`screen` tiene su destino (`pushRoutes`), y lo que no se reconoce no mueve a
nadie — abrir una pantalla al azar es peor que abrir por donde estabas. Va con
`useLastNotificationResponse` porque el caso que más importa es el que un
listener no ve: la app cerrada del todo.

### El chat se cierra con el trabajo

Terminado, cancelado, caducado o rechazado no tienen conversación pendiente.
Se decide en `chatWith`, que es lo que mira la app, así que se apaga en la ficha
y en la lista a la vez.

## 🐛 Tres fallos que solo se veían usándolo

**Las fotos no se veían en Android.** En el iPhone sí. La ruta exigía sesión y
`RemotePhoto` le metía la cabecera al `<Image>`; eso lo respeta iOS y no
Android, donde las carga Fresco y con la New Architecture no propaga esas
cabeceras. El permiso se mudó de la cabecera a la URL: `MediaSignerService`
firma cada clave con un vencimiento y la ruta pasa a `@Public()` exigiendo esa
firma. **No es el token de sesión** —ese no puede ir en una URL— y el
vencimiento va por tramos de una hora para que la caché de imágenes del móvil
siga acertando.

**Hooks detrás de un `return`.** La ficha reventaba al abrirla con «Rendered
more hooks than during the previous render»: el estado de los diálogos se puso
junto a lo que lo usa, y eso está después de las salidas de cargando y error. Y
**los quince tests pasaban**, porque el doble de `useJob` decía `isPending:
false` siempre — se renderizaba con la ficha ya puesta, que es como no se entra
nunca.

**El `.gitignore` se comía el módulo de almacenamiento.** `storage/` sin barra
delante casa con cualquier carpeta llamada así a cualquier profundidad, y se
llevaba `src/infrastructure/storage/` entera: siete ficheros que **nunca han
estado en el repositorio**. Lo clonado no compilaba. Se descubrió al añadir uno
nuevo ahí y ver que `git commit` decía «nothing to commit».

### Lo que queda de esto

- [x] **El contador de «se cierra en» debajo del botón de dar por bueno**: se
      muda a la tarjeta de quien hace el trabajo, en grande y diciendo qué
      cuenta. El plazo no cambia: siguen siendo 24 horas.
- [ ] **`BlurView` en Android** sigue avisando de que le falta `blurTarget`.
- [ ] El barrido no reabre el plazo cuando un profesional vuelve a terminar
      tras un reparo: hoy `finish-job` exige la cita `STARTED`, así que hay que
      empezar otra vez. Sin probar en el móvil.

---

## ✅ Qué se ha movido, sin leerlo todo (4 Septiembre 2026)

Mis trabajos separa por forma de contratar —Presupuesto directo, Reserva
instantánea, Urgencia— y hasta ahora la pestaña cerrada no contaba nada de lo
suyo salvo cuántos había. El aviso al móvil llega una vez y se pierde con el
teléfono en silencio, así que **para saber si algo se había movido había que
entrar en las dos pestañas y leerlas enteras**.

- **Un punto rojo en la pestaña** donde hay algo nuevo, y **otro en la esquina
  del trabajo** que ha cambiado: cuál, sin leer ninguna tarjeta.
- **Qué cuenta como novedad**: la firma `estado|cita|terminado`
  (`jobStateSignature`). Son tres cosas y no una porque el paso que más importa
  —«ha terminado»— no mueve el estado: sigue `IN_PROGRESS` y lo único que
  cambia es `workFinishedAt`. Igual el sustituto propuesto, que es de la cita.
- **Se apaga al abrir la ficha**, no al ver la lista: en la lista se ve el
  rótulo, no lo que ha pasado.
- **Lo que se ve por primera vez no lleva punto.** De un trabajo que no
  habíamos visto nunca no se sabe qué cambió, y una lista entera de puntos
  rojos no señala nada.

Vive en el móvil (`useSeenJobStatesStore`, AsyncStorage y por cuenta, como
`useSeenAnswersStore`) y no en el servidor: «lo he mirado» es de este teléfono.
**Lo que cuesta**: quien use dos móviles verá el punto en los dos y tendrá que
quitarlo en los dos. Se acepta a sabiendas; llevarlo al servidor es una columna,
una migración y una escritura en cada lectura de la ficha.

---

## 🆘 Si te Bloqueas

1. **Revisa el README.md principal** - Tiene todas las reglas de negocio
2. **Mira los .dc.html** - Referencia visual exacta
3. **Consulta SECURITY.md** - Para dudas de seguridad
4. **Revisa componentes ya implementados** - Busca patrones similares
5. **Revisa componentes parecidos** - Muestran los patrones del proyecto

---

## ✅ Checklist de Calidad (Para Cada Componente)

- [ ] Sigue atomic design (átomo no conoce el dominio)
- [ ] No tiene valores literales (usa theme)
- [ ] TypeScript strict (no any)
- [ ] Props tipadas con interface
- [ ] Exporta tipos en index.ts
- [ ] Comentarios JSDoc en props complejas

---

**🐜 Lughly** — Un experto para cada trabajo
**Próximo paso**: Día 1 - LoginPage

_Última actualización: la cuenta de cobro del profesional — 2 Septiembre 2026_
