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
- [ ] Sección de recargos
  - Sábado +20%
  - Domingo/festivo +35%
  - Nocturno +25%
  - Vista previa de precio
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
- [ ] Hook useSurcharge (fórmula completa)

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

_Última actualización: Fase 1 completada - 11 Agosto 2026_
