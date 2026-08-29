# Ciclos de contratación: lo que hay y lo que cambia

**Versión 3 — acompaña a `COMO_SE_CONTRATA.md` v3 (21 Agosto 2026).** Por cada
casuística, el ciclo paso a paso; en cada paso, **qué hay hoy** (leído del
código, corregido tras la segunda revisión) y **qué cambia**. Los cambios
están escritos sobre las tres entidades de la v3: `Job` (contrato),
`Appointment` (cita), `Charge` (cobro).

| | Caso | Modo | Persona |
|---|---|---|---|
| A | Limpieza | Por hora, y la clase recurrente | Marta, autónoma |
| B | Peluquería | Tarifa cerrada | Iván, autónomo |
| C | Mecánica | Visita y presupuesto, con carta | Sergio, autónomo |
| D | Cerrajería de noche | Urgencia | Tomás, autónomo y después empleado |
| E | Fontanería con empleado | Visita vía empresa | Ruiz S.L., Carmen y Jorge |

---

## §0. Lo que hay hoy y no cuadra, verificado

1. **`INSTANT` se inventa el importe.** No es que no haya precio: `get-job`
   sirve como «acordado» el `maxBudget` que el cliente escribió como tope
   orientativo, y `list-assigned-jobs` se lo enseña al profesional como lo que
   va a cobrar. El cambio es dejar de inventarlo.
2. **La tarifa de urgencia que vio el cliente no se guarda** (`request-urgency`
   la devuelve a `null`; `Job` no tiene campo).
3. **Recargos y festivos existen y no se aplican.** Perfil con sábado/domingo/
   noche, tres capas de festivos (autonómico por CP, `HolidayChoice` por fecha,
   locales) y una función que ya devuelve por día si aplica y cuánto
   (`holidays.use-case`). Ningún caso de uso de trabajos la llama.
4. **La ficha pinta una constante, no los recargos del profesional.**
   `surcharges.ts` (domingo +35 %, «urgencia 25–50 %») es lo que enseña
   `ProProfilePage` de todos, aunque el servidor sirva los de cada uno.
5. **`hourlyRate` obligatorio** para los 18 oficios.
6. **Se sale en el directorio con la cuenta activa**, verificada o no.
7. **`finish-urgency` cierra solo**, sin `IN_PROGRESS` ni cliente.
8. **El profesional no puede cancelar nunca**; el cliente solo hasta
   `PENDING_*`.
9. **La dirección llega al trabajador antes de confirmar** (`get-job`,
   `awardedProId` puesto en `PENDING_WORKER`).
10. **El empleador tiene `ProProfile`** y puede asignarse trabajos; no existe
    «registrarse como empleadora».
11. **`EXPIRED` permite reasignar** (`reassign-job`) sin mirar si hubo cobros.
12. **Ni pagos, ni valoraciones creables, ni cuenta de cobro.**

### Lo construido de esta lista (29 Agosto 2026)

**El cierre del ciclo, y con él la salida del dinero.** Un trabajo contratado
desde la carta se cobraba al contratar y el cobro se quedaba retenido en la
plataforma **para siempre**: no había ningún camino de `CONTRACTED` a
`COMPLETED` fuera de las urgencias, que no cobran, así que
`ReleaseChargeUseCase` existía sin que lo llamara nadie. Ahora:

- `POST /v1/jobs/:id/start` y `/finish` — de quien lo hace o de su empresa.
  Terminar **no cierra ni cobra**: pone `Job.workFinishedAt` y abre
  `Job.confirmByAt`, 24 h.
- `POST /v1/jobs/:id/complete` — del cliente: cierra y libera.
- El barrido de plazos cierra por silencio cuando vence `confirmByAt`, y
  reintenta los cobros que se quedaron sin salir (`releaseStuckCharges`).

Son las tres rutas sobre el **trabajo**, no sobre la cita: hoy solo hay una
cita en juego por trabajo y actúan sobre ella. Cuando un trabajo tenga dos
—visita y después arreglo, §C— habrá que llevarlas a `Appointment`, que es lo
que dice la tabla de §Z.

### Y el dinero se retiene, no se cobra (29 Agosto 2026)

Los pasos 3 y 4 del ciclo de §A —autorizar al reservar, capturar al aceptar—
**ya están**, aplicados a lo único que hoy cobra: la carta.

- `Charge` nace `AUTHORIZED`: `capture_method: 'manual'`, el importe se retiene
  en la tarjeta del cliente y no se cobra nada.
- Se **captura** en los tres sitios donde un trabajo pasa a `CONTRACTED`: el
  autónomo que se asigna a sí mismo, el trabajador que confirma, y el cliente
  que acepta un sustituto.
- Se **anula** (`VOIDED`, coste cero) donde antes se reembolsaba: rechazo,
  plazo cumplido, sustituto rechazado y contrato roto antes de capturar.
- El barrido reintenta las capturas que no salieron: la autorización caduca a
  los 7 días y después el dinero se suelta solo.

Motivo, en una línea: un reembolso no recupera la comisión de Stripe y una
autorización cancelada no cuesta nada. Con la comisión de plataforma al 0 %,
cada encargo caído salía de nuestro bolsillo.

**Y el 3D Secure, tapado el mismo día.** El cobro se confirma en el servidor,
así que una tarjeta que pedía autenticación devolvía `requires_action` y el
contrato moría sin salida: ese cliente no podía contratar nunca con esa
tarjeta. Ahora:

- El `Job` nace en `DRAFT` —no lo ve nadie, ningún reloj corre— y solo pasa a
  `PENDING_PRO` cuando la tarjeta ha dicho que sí. El plazo de 24 h del
  profesional empieza ahí, no al pulsar contratar.
- `book-services` devuelve `status: 'requires_action'` con el `clientSecret`;
  la app abre el reto con `handleNextAction` y llama a
  `POST /v1/jobs/:id/confirm-payment`.
- Ese endpoint **le pregunta a Stripe** cómo acabó (`RefreshChargeUseCase`), no
  se cree al móvil: si no, cualquiera que sepa llamarlo tendría un profesional
  trabajando gratis.
- Lo que se queda a medias —cierra la app, se le va la batería— lo recoge el
  barrido a la media hora: suelta el intento y borra el borrador.

Todo esto vive dentro de `useBookServices`: para la pantalla es la misma
llamada de siempre, que a veces tarda un poco más.

Sigue sin hacerse todo lo demás del cobro por horas: el desglose con
`minHours` y recargos, y `book-hours` (que ya solo tendría que reusar lo de
arriba).

---

## Común: el alta

**Hoy.** Rol cliente o profesional; identidad; ciudad, CP, radio; oficios con
`TradeRatesField` (€/h y €/h de urgencia por oficio, descripción); fotos. Se
sale en el directorio al activarse la cuenta. Quien quiere gente a cargo se
hace empleador después (`useBecomeEmployer`): `Employer` con NIF/CIF y razón
social, y da de alta trabajadores en `EmployeesPage`.

**Cambio.**
- `TradeRatesField` pide, por oficio, los modos admitidos con el por defecto
  desplegado. Un componente, tres sitios.
- **Cuenta de cobro en `Employer`** (Stripe Connect Express). El autónomo sin
  gente tiene su `Employer` propio (hoy ya lo tiene quien se hace empleador;
  pasa a crearse a todos al activar el cobro). Un trabajador por cuenta ajena
  no tiene.
- **Despliegue con gracia**: 30 días en que sin cuenta de cobro se sale en el
  directorio pero no se puede contratar; la ficha dice «aún no acepta
  reservas por la app». Pasado el plazo, no se sale.
- Migración: `hourlyRate` existentes → modo por hora; `urgencyHourlyRate` se
  conserva; `urgencyCalloutFee` nace a null (= no atiende urgencias).

---

## A. Por hora — Marta, limpieza

**A1. Alta.** *Hoy*: 14 €/h. *Cambio*: 14 €/h y mínimo 2 h; carta y visita
plegadas. Tarjeta «Limpieza · 14 €/h · mín. 2 h».

**A2. Lucía reserva.**
*Hoy*: «Reservar ahora» → `RequestProPage` genérico (título, descripción,
ciudad, dirección, fecha preferida, tope orientativo, fotos). Sin horas, sin
total. El tope que escriba se le enseñará a Marta como su importe (§0.1).
*Cambio*: «Contratar» → pregunta síntoma/encargo → «sé lo que hay» → horas y
**hueco** sobre `AvailabilityWindow` menos ausencias menos citas ya
confirmadas. Antelación mínima 2 h. El servidor devuelve el desglose antes de
pagar, con los recargos de Marta por la **hora de inicio** y la función de
festivos que ya existe:

```
3 h × 14 €/h                        42,00 €
Jueves laborable                    sin recargo
Total                               42,00 €
Se cobra ahora y se le paga a Marta cuando confirmes.
Cancelación gratis hasta 24 h antes.
```

**A3. Lucía paga.** *Hoy*: no existe. *Cambio*: `Job(HOURLY, agreedHourlyRate
14, agreedMinHours 2, status PENDING_PRO)` + `Appointment(WORK, jueves 10:00,
180 min, PENDING_WORKER)` + `Charge(HOURS, 42, payer Lucía, payee Employer de
Marta, 0 %, PAID)`. Cobrado y retenido (S1).

**A4. Marta responde.** *Hoy*: `InboxPage`, acepta (`assign` a sí misma →
`AWARDED`) o rechaza con motivo; 24 h. *Cambio*: igual, pero aceptar lleva a
`Job CONTRACTED` + `Appointment CONFIRMED` (autónoma: confirma en el mismo
gesto), y rechazar o expirar **reembolsa**. Plazo `min(24 h, cita − 2 h)`.

**A5. Marta con gripe el miércoles.** *Hoy*: no tiene salida. *Cambio*:
`cancel-by-pro` → `Appointment CANCELLED(by PRO)`, `Charge REFUNDED`, marca en
ficha, y Lucía recibe «Marta no puede; buscar otra» con el encargo
precargado.

**A6. El jueves.**
*Hoy*: nada entre `AWARDED` y `COMPLETED`.
*Cambio*: **Empezar** → `Appointment STARTED`, `Job IN_PROGRESS`, `WorkLog`.
**Terminar** 13:40 → `Appointment DONE`, 3 h 45 por cuartos; Marta elige si
cobra el extra. Lucía confirma o calla 24 h → `Job COMPLETED`, `Charge HOURS
RELEASED`, `Charge(HOURS_EXTRA, 10,50, PAID → RELEASED)`. Si Lucía discute
**lo que sea** (no solo el extra: «vino una hora de tres»), `DISPUTED` sobre el
`Charge` que señale; admin resuelve; lo no disputado sigue su curso.
Si nadie pulsa Empezar: `scheduledAt` + 2 h → `expire-overdue` marca
`NO_SHOW_PRO` y reembolsa, salvo que Marta haya marcado «cliente ausente» con
hora y foto → `NO_SHOW_CLIENT`, se cobra el mínimo (28 €), resto devuelto.

**A7. Lucía cancela a mitad** (1 h 20 trabajada). *Cambio*: `WorkLog` se cierra
con la hora de la cancelación; se cobra lo trabajado redondeado, mínimo el
mínimo: 2 h = 28 €, 14 € devueltos.

**A8. Las clases de los martes** (Marta también da clases).
*Hoy*: no hay forma; cada martes sería un encargo nuevo con su formulario.
*Cambio*: un `Job(HOURLY)` con 8 `Appointment(SESSION)` y **un `Charge` por
sesión cobrado 24 h antes** de cada una. Cancelar una sesión no cancela el
contrato; cancelar el contrato devuelve las sesiones no empezadas.

---

## B. Tarifa cerrada — Iván, peluquería

**B1. Alta.** *Hoy*: un €/h obligatorio que no es como cobra. *Cambio*: carta
con precio y duración, domicilio con suplemento; `hourlyRate` null. Tarjeta
«desde 14 €».

**B2. Ana reserva.** *Cambio*: marca servicios; la app suma duraciones y
ofrece huecos donde quepan; desglose con domicilio y recargo de sábado (sí
aplica a la carta):

```
Corte señora 22 · Tinte raíz 38 · Domicilio 5 · Sábado +20 % 12
Total                               77,00 €
```

`Job(FIXED)` con `JobServiceLine` a precio congelado, `Appointment(WORK,
120 min)`, `Charge(FIXED_SERVICE, 77, PAID)`.

**B3–B5.** Como A4–A6 sin parte de horas. «¿Y las mechas?» → Iván añade la
línea → Ana acepta en el móvil → `Charge(FIXED_EXTRA, 65, PAID)`; si no, se
queda en lo contratado. Cancelación tardía: se cobra **el servicio más
barato** de los reservados (22 €).

**B6. Iván recibe «quiero un recogido de novia para el sábado».**
*Cambio*: la válvula de escape. Iván responde `propose-visit`: «esto no se
cierra sin verlo; prueba de peinado 25 €». El `Charge FIXED_SERVICE` se
**reembolsa**, el `Job` pasa a modo `QUOTE` con `agreedVisitFee 25`, y a Ana le
llega un **nuevo paso de pago**: acepta (nuevo `Charge VISIT`) o cancela sin
coste. 24 h; si calla, cancelado.

---

## C. Visita y presupuesto — Sergio, mecánico

**C1. Alta.** Carta (aceite 79, pre-ITV 45…) + visita 30 € descontable,
validez 15 días. Tarjeta «desde 25 € · visita 30 €».

**C2a. Cambio de aceite.** Ciclo B.

**C2b. Ruido al frenar.**
*Hoy*: «Presupuesto» → formulario genérico → Sergio acepta → `AWARDED` sin
ninguna cifra (o con el tope de Pablo como cifra, §0.1). Todo lo demás, fuera
de la app.
*Cambio*: «que vaya a verlo» → hueco, dónde, qué pasa, fotos. Desglose:

```
Visita para presupuesto             30,00 €
Se cobra ahora; se le paga a Sergio cuando la visita se haga.
Si aceptas el presupuesto, se descuenta. Si no, se cobra igual.
Cancelación gratis hasta 4 h antes.
```

`Job(QUOTE, agreedVisitFee 30)`, `Appointment(VISIT)`, `Charge(VISIT, 30, PAID)`.

**C3. Sergio acepta.** *Hoy*: `AWARDED` + dirección. *Cambio*: `Job CONTRACTED`,
`Appointment CONFIRMED`, y **la dirección llega aquí** (`get-job` cambia:
hoy llegaría al asignar, antes de confirmar).

**C4. La visita.** *Cambio*: «Visita hecha» → `Appointment DONE`. Pablo 24 h
para «no vino»; si calla, `Charge VISIT RELEASED`. Si dice que no vino y
Sergio no lo discute en 24 h, `NO_SHOW_PRO`, reembolso, marca. Si Pablo no
estaba (foto y hora), `NO_SHOW_CLIENT`, se cobra.
**Y un plazo que la v2 no tenía**: Sergio tiene **72 h** para presupuestar
tras la visita; si no, `Job CLOSED` con la visita cobrada. `reassign-job` no
se aplica a un trabajo con cobros liberados.

**C5. Presupuesto.** `Quote v1` (líneas tipadas, visita −30, `validUntil`) →
`Job QUOTED`. Pablo rechaza con motivo → `QUOTE_REJECTED`; Sergio emite v2 →
`QUOTED`. Si `validUntil` vence → `CLOSED` (no `EXPIRED`). Si `QUOTE_REJECTED`
pasa 15 días sin reemisión → `CLOSED`.

**C6. Pablo acepta v2 (198 €).** `Job CONTRACTED` otra vez —es el mismo hecho,
hay acuerdo y dinero— con una **nueva `Appointment(WORK)`** sobre el horario de
Sergio. `Charge(QUOTE, 198, PAID)` con su fila de política a 0 %. Si Sergio
marcó pago a cuenta: `Charge(MATERIALS_ADVANCE, 138, PAID)` que **se retiene**
hasta que marca «material comprado» con justificante; entonces `RELEASED`. Si
Pablo cancela antes de eso, se devuelve; después, se cobra el material.

**C7. El arreglo.** Empezar/Terminar sobre la cita; Pablo confirma →
`COMPLETED`, `QUOTE RELEASED`. El latiguillo: `Quote` con `parentQuoteId`, una
línea, 45 € → Pablo acepta → `Charge(QUOTE_EXTRA, 45)`; si no, Sergio termina
lo contratado.

**C8. Pablo cancela el arreglo dos días antes.** Tabla de §6 de la propuesta:
gratis hasta 48 h antes; después, 10 % con tope en el material ya comprado.
Aquí: 138 € de material comprado → se cobra 138, se devuelven 60.

---

## D. Urgencia — Tomás, cerrajero, 02:30

**D1. Alta y guardia.** *Hoy*: 35 €/h + 60 €/h de urgencia, interruptor
`availableNow`. *Cambio*: carta con **dos precios por servicio** —apertura de
puerta 60 / **110 en urgencia**, cambio de bombín 90 / 150, copia de llave 15
/ — (no la ofrece de guardia)— y, para lo que no está en la carta, **salida
90 € con 1.ª hora incluida, después 60 €/h**. Todo precio de urgencia es
final, sin recargos; franjas de urgencia opcionales si quiere distinto de
noche.

**D2. Laura fuera de casa.**
*Hoy*: `UrgencyPage` → `UrgencyProsPage` por cercanía con «60 €/h». Laura no
sabe cuánto pagará.
*Cambio*: `UrgencyPage` pregunta primero **qué pasa**: elige «no puedo entrar
en casa» → es un servicio de carta (apertura). `UrgencyProsPage` enseña solo a
quien lo ofrece de guardia: «**Apertura de puerta · 110 €** · a 3 km». Si
hubiera descrito algo sin servicio («huele a quemado»), vería «Salida 90 €
(1.ª h incl.) · después 60 €/h». Laura **guarda el método de pago una vez**
(SetupIntent) y pide. **No se cobra todavía**.

**D3. Tomás tiene 5 minutos.**
*Hoy*: 5 min; si no contesta, Laura elige a otro; a quien dijo no, no se le
repregunta (tras `EXPIRED` sí). Al aceptar: `AWARDED`, `busyWithJobId`,
dirección y teléfono en los dos sentidos. Bien, y se conserva.
*Cambio*: `accept-urgency` **revalida** franja y `availableNow` en ese
instante, congela el precio en el `Job` —aquí la línea «apertura 110» como
`JobServiceLine`; en la otra vía, `agreedCalloutFee 90` y `agreedHourlyRate
60`— y **crea el `Charge(URGENT_SERVICE, 110, PAID)` ahora**, con el método
guardado. Si nadie acepta, no hay cobro que anular. `Job CONTRACTED`,
`Appointment(WORK, ahora, CONFIRMED)`. En D4, con servicio de carta **no hay
parte de horas**: Tomás abre, marca Terminar, y son 110 tarde lo que tarde.

**D4. Tomás llega y abre.**
*Hoy*: «terminar» → `COMPLETED`, suelta `busyWithJobId`; sin horas ni cliente.
*Cambio*: Empezar 02:55 → `STARTED`; Terminar 03:20 → **`DONE` suelta
`busyWithJobId` ya**: Tomás vuelve a estar de guardia en el acto, no cuando
Laura confirme. 25 min, dentro de la hora: total 90. Laura confirma o calla
24 h → `COMPLETED`, `RELEASED`. Si hubiera tardado 1 h 40: `Charge(URGENT_HOURS,
45, PAID)` que Laura aprueba antes de que se cobre.

**D5. La cerradura está rota.** *Hoy*: de palabra en el rellano. *Cambio*:
Tomás añade de su carta «bombín 140 €» → Laura acepta con la cerradura
delante → `Charge(FIXED_EXTRA, 140)`. Si no, cobra la salida y se va.

**D6. Tomás es empleado de Cerrajería Norte.**
*Hoy*: su empresa le fija `UrgencyWindow`s con €/h final; Laura le asigna
directamente; no ve importes en la agenda.
*Cambio*: `UrgencyWindow` gana `calloutFee` (las dos mitades de una franja
partida llevan la misma, como ya pasa con `hourlyRate`). `payee` = la
empresa. Y a las 03:21, **S2**: Tomás añade «bombín» de la carta de la empresa
**sin ver el precio**; el servidor lo valora (140 €), Laura lo ve y acepta;
Tomás ve «aceptado» y nada más. Si la cerradura pide algo que no está en la
carta —obra de 600 €—, Tomás rellena un `VisitReport` y el presupuesto lo
emite Carmen por la mañana sobre el mismo `Job` (→ `QUOTED`); la salida ya
está cobrada.

**D7. Tomás no aparece.** `Appointment NO_SHOW_PRO` (Laura lo declara, o 2 h sin
`STARTED`), reembolso, marca, y **`availableNow` se apaga** hasta que lo
vuelva a encender.

---

## E. Empresa — Ruiz S.L., Carmen y Jorge

**E1. Alta.** *Hoy*: Carmen es profesional que se hizo empleadora; tiene
`ProProfile` y `Employer`; da de alta a Jorge con sus €/h; Jorge sin
`MyTradesPage`, sin horario propio, sin importes. *Cambio*: Carmen rellena los
modos de Jorge; la cuenta de cobro es del `Employer`; Carmen puede ir ella
misma a un trabajo (es asignable) y entonces es emisora y asignada a la vez.

**E2. Elena pide la visita.**
*Hoy*: aviso «te responderá la empresa» → Carmen asigna → `PENDING_WORKER` →
Jorge 2 h → `AWARDED`; si no puede, vuelve a Carmen → Rubén →
`SUBSTITUTE_PROPOSED` → Elena acepta → `AWARDED` directo (Rubén no confirma).
Se conserva entero.
*Cambio*: todo eso pasa a la **`Appointment`**: `PENDING_WORKER` →
`CONFIRMED`, o `SUBSTITUTE_PROPOSED` → `CONFIRMED`. El `Job` está en
`PENDING_PRO` hasta que Carmen asigna, y en `CONTRACTED` desde entonces.
`Charge(VISIT, 35, PAID)` existe desde que Elena pagó, antes de que Carmen
viera nada; si Carmen rechaza o expira, reembolso. Antelación mínima 4 h
(empresa). **Jorge ve la dirección con `CONFIRMED`**, no al asignar.

**E3. Jorge va.** «Visita hecha» → `DONE`; rellena `VisitReport` (describe, no
valora). Elena calla 24 h → 35 € `RELEASED` **a la empresa**. Carmen tiene
72 h para presupuestar.

**E4. Carmen presupuesta.** `Quote(issuedBy Employer)`: 30 + 18 − 35 = **13 €**.
Jorge no lo ve. Elena acepta → `Job CONTRACTED` + **nueva `Appointment(WORK)`**
que vuelve a pasar por `PENDING_WORKER`; si va Rubén, `SUBSTITUTE_PROPOSED` con
aprobación de Elena, como en cualquier cita. `Charge(QUOTE, 13, PAID)`.

**E5. Lo que ve cada uno.**

| | Elena | Carmen | Jorge |
|---|---|---|---|
| Precio de la visita | sí | sí | **no** |
| Informe | no | sí | lo escribe |
| Presupuesto | sí | lo emite | **no** |
| Dirección | — | sí | desde `CONFIRMED` |
| Extra de la carta en el sitio | acepta con importe | lo ve después | lo añade **sin importe** |
| Cobros | paga | recibe | **no** |

---

## §Z. Cambios por pieza

**Esquema**

| Pieza | Hoy | Cambio |
|---|---|---|
| `Trade` | slug, label, regulated | + `defaultMode`, `allowedModes` |
| `ProTrade` | `hourlyRate` no nulo, `urgencyHourlyRate`, description | `hourlyRate` nullable; + `minHours`, `visitFee`, `visitDeductible`, `quoteValidityDays`, `urgencyCalloutFee`; `ServiceItem[]` |
| `ServiceItem` | — | nuevo: nombre, `price`, `urgencyPrice` (nullable = no de guardia), minutos, position |
| `UrgencyWindow` | `hourlyRate` final, solo empleados | + `calloutFee`; opcional para autónomos |
| `Employer` | NIF/CIF, razón social, responsabilidad | + `stripeAccountId`; se crea a todo autónomo al activar cobro |
| `Job` | type, status (11), title, city, address, `maxBudget`, `preferredDate`, requested/awarded/substitute, `respondByAt` | `mode` (HOURLY/FIXED/QUOTE/URGENT); estados de contrato (`PENDING_PRO`, `CONTRACTED`, `QUOTED`, `QUOTE_REJECTED`, `IN_PROGRESS`, `COMPLETED`, `DISPUTED`, `CLOSED`, `DECLINED`, `EXPIRED`, `CANCELLED`); `agreed*` congelados; `JobServiceLine[]`; **salen** `PENDING_WORKER`, `SUBSTITUTE_PROPOSED`, `AWARDED`, `substituteProId`, `maxBudget`, `preferredDate`, `biddingEndsAt` |
| `Appointment` | — | **nuevo**: jobId, kind, scheduledAt, durationMin, assignedProId, substituteProId, status (`PENDING_WORKER`, `SUBSTITUTE_PROPOSED`, `CONFIRMED`, `STARTED`, `DONE`, `NO_SHOW_PRO`, `NO_SHOW_CLIENT`, `CANCELLED`), `cancelledBy`, `cancelledAt` |
| `WorkLog` | — | nuevo, cuelga de `Appointment` |
| `Quote` | — | nuevo: versiones, líneas tipadas, `deductsVisit`, `parentQuoteId`, `validUntil`, `issuedBy` (Employer) |
| `VisitReport` | — | nuevo, cuelga de `Appointment` |
| `Charge` | — | **nuevo**: jobId, appointmentId?, kind (10), amount, payer, payee (Employer), comisión congelada, status (`PAID`, `RELEASED`, `REFUNDED`, `DISPUTED`, `PARTIAL`), providerRef |
| `CommissionPolicy` | — | nuevo: una fila por kind a 0 %, `validFrom` |
| `Review` | solo lectura | + `appointmentId` único: una por cita hecha |
| `ProProfile` | recargos, `availableNow`, `busyWithJobId`, `completedJobs` | sin campos nuevos; `busyWithJobId` se suelta en `DONE`; recargos se aplican en el servidor |

**Casos de uso del backend**

| Hoy | Cambio |
|---|---|
| `request-pro` (QUOTE/INSTANT sin importe) | `quote-price` (desglose previo, sin crear nada) + `book-hours`, `book-services`, `book-visit`: crean `Job` + `Appointment` + `Charge PAID` |
| `request-urgency` sin tarifa | guarda método de pago; no cobra |
| `accept-urgency` | revalida franja/`availableNow`, congela `agreed*`, **crea el `Charge`** |
| `finish-urgency` | desaparece → `start-appointment`, `finish-appointment` (suelta `busyWithJobId`), `confirm-appointment` (cliente) |
| `assign-job`, `confirm-assignment`, `respond-substitute` | operan sobre `Appointment`; misma lógica, misma 2 h |
| `get-job` (importe = `maxBudget`; dirección al asignar) | importe de `agreed*`/`Charge`; dirección con `CONFIRMED` |
| `list-assigned-jobs` (filtra AWARDED/IN_PROGRESS/COMPLETED) | lista `Appointment`s del trabajador |
| `cancel-job` (cliente, hasta PENDING) | `cancel-appointment` (cliente **y** profesional) con la tabla de §6; `cancel-job` para el contrato |
| `expire-overdue` | + vence `Quote.validUntil`, `QUOTE_REJECTED` 15 d, `VISIT DONE` 72 h sin presupuesto, `scheduledAt`+2 h sin `STARTED`, y **los silencios de 24 h que liberan dinero** |
| `reassign-job` | bloqueado si hay `Charge` liberado |
| `decline-request` | + reembolso |
| — | `propose-visit`, `mark-visit-done`, `submit-visit-report`, `issue-quote`, `respond-quote`, `add-extra` (con S2 para empleados), `open-dispute`, `resolve-dispute` (admin), `mark-materials-bought`, `create-review`, `cancel-by-pro` |
| — | módulo `payments`: Connect onboarding, cobro, transferencia, reembolso, webhooks, `SetupIntent` para urgencias |
| `set-my-trades`, `set-urgency-windows`, `list-urgency-pros`, `jobs.schemas` (`listMyJobsSchema` no admite `PENDING_PRO`) | campos y estados nuevos |
| push | + visita hecha, presupuesto emitido, extra por aprobar, cobro devuelto, plantón, cita cancelada |

**Móvil**

| Hoy | Cambio |
|---|---|
| `TradeRatesField` | modos por oficio; carta editable |
| `RegisterPage`, `EmployeesPage`, `MyTradesPage` | componente nuevo; cuenta de cobro (no empleados) |
| `ProProfilePage` («Reservar ahora» / «Presupuesto»; recargos de `surcharges.ts`) | un botón Contratar; bloque por modo; **recargos del profesional** |
| `DirectoryPage` | precio según modo; «aún no acepta reservas» en gracia |
| `RequestProPage` | pregunta; tres formularios cortos con huecos; pantalla de desglose y pago |
| `PublishPage`, `useDraftJobStore` | se retiran |
| `UrgencyPage`, `UrgencyProsPage` | guardar método de pago; salida + €/h |
| `ProUrgenciesPage` | Empezar/Terminar en la urgencia activa; añadir de la carta |
| `UrgencySchedulePage` | campo de salida |
| `JobDetailPage`, `MyJobsPage` | citas del trabajo, presupuesto con versiones, confirmar, aprobar extras, disputar, cancelar |
| `AgendaPage` | citas; Empezar/Terminar; informe; extra sin importe si empleado |
| `InboxPage` | + informes para presupuestar |
| `surcharges.ts` | se vacía |
| `src/api/*` | espejo; `appointments.api.ts`, `quotes.api.ts`, `payments.api.ts` |

**Plazos**

| Plazo | Hoy | Propuesta |
|---|---|---|
| Responder a un encargo | 24 h | `min(24 h, cita − antelación)` |
| Antelación mínima | — | 2 h autónomo · 4 h empresa |
| Confirmar el trabajador | 2 h | igual |
| Responder a una urgencia | 5 min | igual |
| Cliente: visita hecha / parte / terminado | — | 24 h, el silencio confirma |
| Empezar tras la hora de la cita | — | 2 h, luego plantón |
| Presupuestar tras la visita | — | 72 h |
| Validez del presupuesto | — | la del profesional, 15 d por defecto |
| `QUOTE_REJECTED` sin reemisión | — | 15 d → `CLOSED` |
| Nuevo paso de pago (válvula de escape) | — | 24 h |
| Discutir un plantón | — | 24 h |
| Gracia para la cuenta de cobro | — | 30 d |
