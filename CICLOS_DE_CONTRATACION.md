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
autorización cancelada no cuesta nada. Se decidió con la comisión de plataforma
al 0 %, cuando cada encargo caído salía íntegro de nuestro bolsillo; con el
10 % de `COMO_SE_CONTRATA.md` §12 duele menos, pero el reembolso sigue sin
devolver nada y la decisión no cambia.

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

### Y ningún camino sin cobro (3 Septiembre 2026)

Los puntos **1, 2 y 7** de la lista de arriba quedan cerrados, y con ellos los
tres caminos que llegaban a `COMPLETED` sin crear un `Charge` — más un cuarto
que no estaba en ninguna lista.

- **§0.1, `INSTANT` se inventaba el importe.** Ya no existe por esa ruta.
  Pedir presupuesto (`request-pro`) congela y cobra **la visita**, y reservar a
  tarifa fija va por `book-hours` o `book-services`, que ya cobraban. Publicar
  al aire (`create-job`) solo admite `URGENT`.
- **§0.2, la tarifa de urgencia no se guardaba.** Ahora se congela al pedirla:
  `mode: URGENT`, `agreedCalloutFee` (la salida, con su primera hora dentro) y
  `agreedHourlyRate` (lo que vale cada hora de más).
- **§0.7, `finish-urgency` cerraba solo.** Ahora deja 24 h al cliente y cierra
  `CompleteJobUseCase`, como cualquier trabajo. Al profesional se le suelta
  igual en el acto.
- **Y reasignar** (`reassign-job`), que no estaba apuntado: anulaba el cobro del
  primero y no creaba ninguno para el segundo, así que el nuevo trabajaba
  gratis con todo lo demás en verde.

**Dos desvíos deliberados respecto a lo que este documento decía**, los dos
marcados abajo donde toca: en §C2b y §D3 la visita y la salida se **retienen**
en vez de cobrarse, que es la decisión del 29 de agosto aplicada a los caminos
nuevos; y en §D3 la retención pasa al **momento de pedir** la urgencia, no al de
aceptarla.

Sigue sin existir el **presupuesto en sí** (§C5): no hay modelo `Quote` ni forma
de que el profesional diga cuánto cuesta el arreglo. Hoy el cliente paga la
visita y el precio del arreglo se acuerda fuera. No es un camino gratis, pero es
medio camino, y es el siguiente hueco de dinero.

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
Marta, comisión congelada al 10 %, PAID)`. Cobrado y retenido (S1).

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

Este esbozo se quedó corto en cuanto se miró de cerca: no decía hasta cuándo
dura, ni qué pasa cuando un día de la serie no le cabe al profesional, que es
casi todo el asunto. **El caso entero está en §F**, y esta línea se conserva
solo porque es de donde salió.

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
Se retiene ahora; se cobra cuando Sergio acepte.
Si no puede o no contesta a tiempo, se suelta y no se cobra nada.
Se cobra aunque el presupuesto no te convenza: el viaje ya se hizo.
```

`Job(QUOTE, agreedVisitFee 30)` y `Charge(VISIT, 30, AUTHORIZED)`.

**Construido el 3 Septiembre 2026, con dos diferencias respecto a lo de
arriba.** El cobro nace `AUTHORIZED` y no `PAID` —es la decisión del 29 de
agosto: un reembolso no recupera la comisión de Stripe y una autorización
anulada no cuesta nada—, y no hay `Appointment(VISIT)` todavía: hoy solo hay una
cita en juego por trabajo y la crea el reparto (`assign-job`), como en cualquier
encargo. El descuento de la visita al aceptar el presupuesto tampoco: vive en
§C5, que no existe.

**Y quien cobra por horas también tiene visita.** `visitFee` es excluyente con
`hourlyRate`, así que la mitad del directorio no tiene ninguna puesta; en ellos
la visita es **su suelo**, la tarifa por el `minHours` que declaró, o una hora
si no tiene mínimo (`visitPriceOf`). Sin esa rama, pedirles presupuesto seguiría
siendo gratis.

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
Sergio. `Charge(QUOTE, 198, PAID)` con su comisión congelada. Si Sergio
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
guardado. Si nadie acepta, no hay cobro que anular.

**Construido el 3 Septiembre 2026, y el dinero se movió de sitio.** Se retiene
al **pedir** la urgencia (`request-urgency`) y se captura al aceptar, no se
cobra al aceptar. El motivo es el 3D Secure: pedir es el único momento con el
cliente delante, y a las tres de la mañana el profesional acepta desde su móvil
sin que haya nadie a quien pedirle que autentique una tarjeta. Con captura
manual eso no cuesta nada — si dice que no, la autorización se suelta.

Congelar el precio también se adelanta a `request-urgency`, por lo mismo: es
donde se sabe qué vio el cliente. Y en la vía sin carta —la única que hay hoy,
porque los dos precios por servicio de §D1 no existen— la salida es **una hora
al precio de urgencia**, así que `agreedCalloutFee` y `agreedHourlyRate` salen
iguales: la salida vale una hora y cada hora de más vale lo mismo. `Job CONTRACTED`,
`Appointment(WORK, ahora, CONFIRMED)`. En D4, con servicio de carta **no hay
parte de horas**: Tomás abre, marca Terminar, y son 110 tarde lo que tarde.

**D4. Tomás llega y abre.**
*Hoy*: «terminar» → `COMPLETED`, suelta `busyWithJobId`; sin horas ni cliente.
*Cambio*: Empezar 02:55 → `STARTED`; Terminar 03:20 → **`DONE` suelta
`busyWithJobId` ya**: Tomás vuelve a estar de guardia en el acto, no cuando
Laura confirme. 25 min, dentro de la hora: total 90. Laura confirma o calla
24 h → `COMPLETED`, `RELEASED`. Si hubiera tardado 1 h 40: `Charge(URGENT_HOURS,
45, PAID)` que Laura aprueba antes de que se cobre.

**Construido el 3 Septiembre 2026.** El cierre por silencio a las 24 h es el de
`FinishJobUseCase` y ya existía; lo que faltaba era que la urgencia pasara por
él. Las horas de más nacen `AUTHORIZED` y las captura el cierre, así que Laura
tiene sus 24 horas **antes de que ese dinero se mueva**: es la aprobación de
este párrafo resuelta con el plazo que ya había, en vez de con un botón nuevo.
Los cuarenta minutos se facturan como tres cuartos de hora —bloques de cuarto,
redondeando arriba—, que es de donde salen los 45 €.

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

## F. Recurrente — Lucía contrata a Marta los lunes, miércoles y viernes

**Diseñado el 31 de agosto de 2026.** Desarrolla lo que §A8 dejó apuntado.

### F0. Qué problema es

Lucía quiere a Marta tres horas los lunes, miércoles y viernes. Hoy eso son
**tres encargos nuevos cada semana**: buscar a Marta, rellenar el formulario,
elegir hueco, pagar. Ciento cuarenta veces al año para un acuerdo que se toma
una vez.

Lo que se contrata aquí no es un trabajo repetido: es **un contrato con muchas
sesiones**. Un solo acuerdo, un solo precio pactado, un solo «sí» del
profesional, y después las sesiones caen solas.

**Y la regla que lo gobierna todo**: en ningún momento se le dice a Lucía que
tiene un día que Marta no tiene. Ni al contratar, ni tres semanas después
cuando Marta se coja vacaciones.

### F0b. Lo que hace falta y no existe

Esto va encima de dos piezas sin construir, y conviene decirlo antes de
empezar:

1. **La reserva por horas (`book-hours`).** Lo único que sabe contratar hoy es
   la carta a precio cerrado (`book-services`). Lo recurrente es por horas.
2. **El selector de huecos en el móvil.** `FreeSlotsUseCase` está hecho y
   probado en el servidor desde hace semanas y **no lo llama nadie desde la
   app**. Es justo la pantalla de «estas son las horas que tiene libres».

Construir lo recurrente construye las dos: una reserva de una sola vez es una
serie de una sesión.

### F1. Lucía elige

*Hoy*: `ProProfilePage` con «Reservar ahora» / «Presupuesto», sin horas ni
huecos.
*Cambio*: un botón **Contratar**, y dentro la elección que hoy no existe:

```
¿Cómo lo quieres?
  ○ Una vez            un día concreto
  ● Fijo cada semana   los mismos días, todas las semanas
```

Con «fijo cada semana», tres preguntas y ya:

```
¿Qué días?     L  M  X  J  V  S  D      (los mismos botones del horario)
¿A qué hora?   10:00        ¿Cuánto?   3 h
¿Desde?        lunes 7 de septiembre
```

**Una sola hora y una sola duración para todos los días**, a propósito. «Los
lunes tres horas y los viernes dos» dobla el modelo y la pantalla, y quien lo
necesite contrata dos fijos sobre el mismo profesional, que es exactamente lo
mismo y no cuesta nada. Si algún día se pide de verdad, se añade otra
`JobRecurrence` al mismo `Job` y la pantalla crece; el modelo ya lo admite.

### F2. Se le dice qué días puede y cuáles no

Es el paso que da sentido a todo. Antes de pedir la tarjeta, el servidor cruza
la serie con la agenda de Marta —su horario semanal, las excepciones de días
sueltos, sus ausencias, los festivos que no trabaja y **las citas que ya
tiene**— y devuelve la respuesta día a día.

**Y cuando un día choca, no se tira: se ofrece otra hora de ese mismo día.**
Que Marta esté pillada a las 10:00 el 6 de octubre no quiere decir que ese día
no pueda; quiere decir que ese día no puede *a esa hora*. Saltárselo sin
preguntar le quita a Lucía una limpieza que sí existía.

```
Tu horario con Marta
──────────────────────────────────────────
L · X · V   10:00 – 13:00
42,00 € por día (3 h × 14 €/h)

✓ 22 días confirmados, hasta el 2 de noviembre

⚠ 6 oct — ya tiene otro trabajo a las 10:00
     Ese día sí puede:
       ○ 08:00 – 11:00
       ○ 14:00 – 17:00
       ○ no vayas ese día

⚠ 13 oct — está de vacaciones
     Ese día no se contrata y no se cobra.

Se retiene el importe de cada día 24 h antes.
Cancela un día suelto o el contrato entero cuando quieras.

              [ Contratar ]
```

Los dos avisos no son el mismo aviso, y por eso no se enseñan igual:

| Motivo | ¿Hay algo que ofrecer? | Qué se enseña |
|---|---|---|
| Ya tiene otro trabajo a esa hora | **Sí**: el resto del día está libre | Los huecos de ese día, y «no vayas ese día» |
| Está de vacaciones o de baja | No | Se salta, dicho |
| Ese día no trabaja / es festivo que no trabaja | No | Se salta, dicho |
| Cae dentro de la antelación mínima (los primeros) | No | Se salta, dicho |

**Los días que no tienen alternativa se saltan, no bloquean.** Decisión tomada
el 31 de agosto sobre las tres opciones: bloquear la contratación entera por un
choque que cae dentro de cinco semanas deja a casi todas las series sin poder
contratarse, y contratarlas a ciegas rompe la única regla de F0.

El motivo se dice **en las palabras del cliente y sin destapar la agenda de
nadie**: «ya tiene otro trabajo» y no con quién ni dónde. Es la misma regla que
en los huecos libres, que se devuelven en negativo.

### F2b. Por qué mover un día no es un caso especial

Porque **la hora vive en la sesión, no en la regla**. `JobRecurrence` dice la
hora por defecto —«las diez»— y cada `Appointment` guarda la suya en
`scheduledAt`, que es lo que ya hace hoy cualquier cita. Un 6 de octubre a las
14:00 dentro de una serie de las diez es una sesión con otro `scheduledAt` y
nada más: ni tabla nueva, ni excepción, ni segundo camino en el código.

Es la misma forma que tiene el horario del profesional desde el 31 de agosto
—un patrón semanal con excepciones por fecha encima— y no es casualidad: son el
mismo problema visto desde los dos lados del contrato.

### F3. Lucía paga — y aquí el dinero cambia de forma

*Cambio*: `Job(HOURLY, agreedHourlyRate 14, agreedMinHours 2, status
PENDING_PRO)` + `JobRecurrence` + N `Appointment(SESSION, PENDING_WORKER)`.

**Lo que no se puede hacer**: retener las veinticuatro sesiones al contratar.
Una autorización de Stripe caduca a los siete días —está escrito en §0, es lo
que obligó a que el barrido reintente las capturas—, así que ocho semanas de
retención no existen. Y cobrarlas por adelantado es pedirle a Lucía tres meses
de limpieza el día uno.

Así que el dinero va **por sesión**, y reusa el ciclo de tres pasos que ya está
construido:

| Cuándo | Qué pasa | Pieza que ya existe |
|---|---|---|
| Al contratar | Se guarda el método de pago. **No se cobra nada** | `SetupIntent`, como en las urgencias (§D2) |
| 24 h antes de cada sesión | `Charge(HOURS, 42)` nace `AUTHORIZED`: se retiene | `capture_method: 'manual'` |
| Al empezar la sesión | `CAPTURED` | `CaptureJobChargesUseCase` |
| Al confirmarla, o 24 h de silencio | `RELEASED` a Marta | `ReleaseJobChargesUseCase` |
| Plantón del profesional | `VOIDED`, coste cero | ya es lo que se hace |

Las 24 h no son un número redondo: **son el mismo momento en que la cancelación
deja de ser gratis** (§A2). Se retiene justo cuando ya no se puede deshacer sin
coste, que es lo único que hace legítima la retención.

**Si la tarjeta falla a las 24 h**: esa sesión se cancela y se les avisa a los
dos con un día de margen, que es tiempo de sobra para que Lucía cambie la
tarjeta y para que Marta no se plante en la puerta. Tres fallos seguidos cortan
el contrato: a la cuarta ya no es un descuido.

### F3b. Por qué por día, y no por semana ni por mes

La pregunta se hizo el 31 de agosto y merece la respuesta entera, porque la
cadencia del cobro es de lo poco que después no se puede cambiar sin tocar a
clientes que ya tienen contratos vivos.

**Primero, son dos movimientos distintos y solo uno cuesta comisión.**
Confundirlos es lo que hace que la pregunta parezca más difícil de lo que es:

| | Qué es | Qué cuesta |
|---|---|---|
| **Cliente → Lughly** | Retener y capturar en la tarjeta | 1,5 % + **0,25 € fijos** por transacción |
| **Lughly → Marta** | Marcar el cobro `RELEASED` y transferirlo a su cuenta de Connect | Va con el calendario de pagos de Stripe; no es una transacción de tarjeta |

Así que **«que se le vaya habilitando el pago al trabajador por día» no obliga a
nada del lado del cliente**: se puede liberar sesión a sesión conforme cada una
se da por buena, cobre el cliente como cobre. Eso se hace, y es lo justo: Marta
cobra el lunes por el lunes, sin esperar a que acabe la semana.

La pregunta que queda es solo la de la izquierda.

**Los números**, sobre el contrato de Lucía: 42 € por sesión, 13 sesiones al
mes, 546 € facturados.

| Cadencia | Comisión al mes | Sobre lo facturado |
|---|---|---|
| Por día (13 cobros de 42 €) | 11,44 € | 2,10 % |
| Por semana (4,33 cobros de 126 €) | 9,27 € | 1,70 % |
| Por mes (1 cobro de 546 €) | 8,44 € | 1,55 % |

Por semana se ahorran **2,17 € al mes**, 26 € al año por contrato. Y aun así
**se cobra por día**, por tres motivos que pesan más:

**1. Por semana no se puede construir.** La idea buena sería retener la semana
entera y capturar cada día lo suyo. No se puede: una captura parcial en Stripe
**libera el resto de la retención**, y la captura múltiple es una función
limitada con la que no se puede contar. Así que «por semana» solo puede
significar cobrar la semana entera por adelantado, que es otra cosa.

**2. Reabriría el agujero que se tapó el 29 de agosto.** Cobrada la semana el
domingo, cada sesión que se cae después es un **reembolso**, y un reembolso no
devuelve la comisión. Por día, una sesión cancelada con más de 24 h es un
`VOIDED` que **cuesta cero**. En un contrato fijo de meses las cancelaciones no
son la excepción: son una gripe, un festivo, un viaje. El ahorro de 2,17 € se lo
come el primer día que se cae.

**3. Lucía no paga por trabajo sin hacer.** El contrato no tiene fecha de fin
(F5): pedirle 126 € cada domingo por adelantado, indefinidamente, es una venta
mucho más difícil que «solo pagas los días que se trabajan». Y es lo que
permite decir sin letra pequeña que cancelar un día suelto no cuesta nada.

**Lo que sí hay que vigilar: el 0,25 € fijo en sesiones cortas.**

| Sesión | Comisión | % |
|---|---|---|
| 1 h — 14 € | 0,46 € | **3,3 %** |
| 2 h — 28 € | 0,67 € | 2,4 % |
| 3 h — 42 € | 0,88 € | 2,1 % |
| 4 h — 56 € | 1,09 € | 1,9 % |

Una hora suelta se lleva el 3,3 %. Ahí el que protege es **`agreedMinHours`**,
que ya existe: el mínimo de Marta son 2 h. No hace falta nada nuevo, pero sí
saber que un oficio que acepte sesiones de una hora en fijo es el caso caro.

**Qué cambiaría esta decisión.** Se escribió que la cambiaría cobrar comisión
de plataforma. **Se decidió cobrar el 10 % el 31 de agosto
(`COMO_SE_CONTRATA.md` §12) y no la cambia**, porque el motivo que manda es el 1
y es técnico, no económico: por
semana no se puede construir. Lo que sí hace el 10 % es quitarle importancia al
2 —los 2,17 € pasan a ser el 4 % de una comisión de 54,60 € al mes en vez de
salir del bolsillo—, y con eso la balanza se inclina más hacia el día, no menos.

Lo único que la cambiaría de verdad es que **la captura múltiple de Stripe esté
disponible para esta cuenta**: es lo que haría posible «retener la semana,
capturar por día» sin reembolsos. Merece una comprobación antes de construir
F3; no conviene darlo por hecho.

**Un efecto secundario a favor**: por día son trece oportunidades al mes de que
la tarjeta falle en vez de cuatro, pero **cada fallo se lleva un solo día**, no
una semana. Con la regla de los tres fallos seguidos de F3, un descuido con la
tarjeta no tumba el contrato.

### F4. Marta dice que sí **una vez**

*Cambio*: en su bandeja no le llegan veinticuatro encargos, le llega uno:

```
Lucía · Limpieza
Fijo: lunes, miércoles y viernes, 10:00 – 13:00
Desde el 7 de septiembre, sin fecha de fin
42,00 € por día
El 6 de octubre, de 14:00 a 17:00

Aceptar compromete tus lunes, miércoles y viernes
a esa hora. Puedes cancelar un día suelto o el
contrato entero cuando quieras.
```

El día movido se le dice aquí, en la misma tarjeta: es parte de a lo que está
diciendo que sí.

Acepta → `Job CONTRACTED` y **las N sesiones a `CONFIRMED` de golpe**. Es todo
el sentido de la función: un «sí» por acuerdo, no uno por día. Plazo, el de
siempre: `min(24 h, primera sesión − antelación)`.

**Si Marta es empleada de una empresa**, el camino es el de §E sin cambios: la
empresa asigna la serie, Jorge la confirma entera. Un día suelto que no pueda se
resuelve como una cita cualquiera —`SUBSTITUTE_PROPOSED` solo de esa sesión— y
**el sustituto no hereda el resto de la serie**: va ese día y ya.

### F5. La ventana móvil

Sin fecha de fin, decidido el 31 de agosto. «Los lunes, miércoles y viernes» y
ya está, hasta que alguien lo corte, que es lo que quiere quien contrata una
limpieza fija.

Pero no se pueden crear infinitas sesiones, así que se crean **las de las
próximas 8 semanas** y el barrido va añadiendo. En `JobRecurrence`:

- `generatedUntil` — hasta qué día hay sesiones creadas.
- Un paso diario en `expire-overdue` que estira hasta hoy + 8 semanas,
  **comprobando la disponibilidad en ese momento**, no la de hace dos meses.

Ocho semanas y no cuatro porque una limpieza fija se piensa por meses, y no
veinticuatro porque una agenda a seis meses vista no significa nada: cuanto más
lejos, más sesiones habría que cancelar después.

Cuando el barrido estira y una fecha nueva no cabe, **no la crea y se lo dice a
Lucía**, con los huecos de ese día si los hay. Nunca se crea una sesión que no
quepa.

### F6. Un choque que aparece más tarde

Es el caso que no cubría §A8 y el que de verdad ocurre. Marta contrata en
septiembre y en octubre se coge una semana.

- **Al marcar la ausencia**, a Marta se le dice qué se lleva por delante: «esta
  semana tienes 3 sesiones fijas con Lucía. Si te vas, se cancelan y se le
  avisa». La pantalla del horario ya sabe hacerlo: el panel del día enseña lo
  comprometido desde el 31 de agosto.
- Las sesiones pasan a `CANCELLED(by PRO)`. Como están a más de 24 h, **no hay
  cobro que devolver**: nunca llegó a retenerse. Ese es el segundo regalo de
  cobrar por sesión.
- **A Lucía se le avisa**, con los días concretos, y con la salida delante:
  «buscar a otra persona para esos días», con el encargo precargado (§A5).

### F7. Cancelar

Dos cosas distintas, y la diferencia importa:

| | Quién | Qué pasa |
|---|---|---|
| **Una sesión** | Lucía o Marta | Esa sesión `CANCELLED`. El contrato sigue. Gratis a más de 24 h; dentro de 24 h, la tabla de §6 |
| **El contrato** | Lucía o Marta | `Job CANCELLED`, todas las sesiones no empezadas `CANCELLED`, `JobRecurrence` inactiva. Se devuelve lo retenido y no empezado |

Un profesional que corta un contrato fijo deja a alguien sin limpieza en
noviembre, así que **la marca en su ficha vale más que la de una cita suelta**:
se cuenta aparte. No es una penalización, es información para el siguiente
cliente que se plantee un fijo con él.

### F8. El precio

Congelado al contratar, como todo (§5): `agreedHourlyRate` y `agreedMinHours`
del `Job`. Si Marta sube su tarifa en octubre, Lucía sigue pagando 14 €/h hasta
que el contrato se corte y se rehaga.

**Los recargos se calculan por sesión**, no una vez: un fijo que incluye sábados
cobra el recargo de sábado los sábados y no los martes, y un festivo que cae en
lunes lleva el suyo. Como los recargos siguen sin aplicarse en ningún caso de
uso (§0.3), la primera versión de esto cobra plano y la capa de recargos entra
por el mismo sitio cuando se construya: el importe de cada `Charge` se calcula
al crearlo, 24 h antes, que es cuando ya se sabe qué día es.

Si las horas pedidas quedan por debajo del mínimo de Marta, se cobra el mínimo,
igual que en una reserva suelta.

### F9. Lo que ve cada uno

| | Lucía | Marta | Su empresa, si la tiene |
|---|---|---|---|
| Los días que no caben, al contratar | **sí**, con el motivo en sus palabras | — | — |
| Las horas libres de un día que choca | **sí** | — | — |
| Con quién es el trabajo que choca | **no** | sí, es suyo | sí |
| El contrato fijo entero | sí | sí | sí |
| Los días movidos de hora | sí | sí, al aceptar | sí |
| Cada sesión en la agenda | sí | sí | sí |
| El importe por sesión | paga | sí, si es autónoma | recibe |
| Cancelar una sesión | sí | sí | sí |
| Cancelar el contrato | sí | sí | sí |

### F10. Piezas

**Esquema**

| Pieza | Cambio |
|---|---|
| `JobRecurrence` | **nueva**: `jobId`, `weekdays Int[]`, `startMinute`, `durationMin`, `startsOn`, `generatedUntil`, `active`, `createdAt`. Una fila por regla; varias por `Job` si algún día hacen falta horarios distintos por día |
| `Appointment` | sin campos nuevos. `kind: SESSION` ya existe; la hora de cada sesión ya vive en `scheduledAt`, que es lo que deja mover un día suelto sin caso especial |
| `Job` | sin campos nuevos. `mode: HOURLY` y los `agreed*` ya congelan el precio |
| `Charge` | sin campos nuevos. `appointmentId` ya existe: un cobro por sesión es un cobro atado a su cita |
| `ProProfile` | sin campos nuevos. Las series contratadas se cuentan aparte para la ficha (F7) |

**Servidor**

| Caso de uso | Qué hace |
|---|---|
| `check-recurrence` | La respuesta de F2: por fecha, si cabe, el motivo si no, y **los huecos de ese día** cuando el motivo es un solape. No crea nada |
| `book-recurring` | `Job` + `JobRecurrence` + N `Appointment(SESSION)` + `SetupIntent`. Salta lo que no cabe y respeta las horas movidas |
| `accept-recurring` | El «sí» de F4: `Job CONTRACTED` y las sesiones a `CONFIRMED` de una vez |
| `authorize-session-charges` | Paso del barrido: 24 h antes, `Charge AUTHORIZED` por sesión. Cancela la sesión si la tarjeta falla, y el contrato a los tres fallos |
| `extend-recurrences` | Paso del barrido: estira la ventana a 8 semanas comprobando disponibilidad |
| `cancel-session` / `cancel-recurring` | Los dos caminos de F7 |
| `expire-overdue` | + los dos pasos de arriba |
| `FreeSlotsUseCase` | sin cambios: `check-recurrence` lo usa por fecha. Ya conoce el horario, las excepciones, las ausencias y las citas |

**Móvil**

| Pantalla | Cambio |
|---|---|
| `ProProfilePage` | «Contratar» → una vez / fijo cada semana |
| **`SlotPickerPage`** (nueva) | Las horas libres de un día. Es la pieza que falta desde que existe `/slots`, y la usan las dos vías |
| **`RecurringBookingPage`** (nueva) | Días, hora, duración y desde cuándo. Los botones de día son los del horario del profesional, ya construidos |
| **`RecurrenceReviewPage`** (nueva) | La pantalla de F2: lo que encaja, lo que no, y elegir otra hora donde la haya |
| `MyJobsPage`, `JobDetailPage` | El contrato fijo y sus sesiones; cancelar una o el contrato |
| `AgendaPage` | Las sesiones entran como citas normales, sin cambios |
| `InboxPage` | La tarjeta de F4: un encargo, no veinticuatro |
| `AbsencesPage` | El aviso de F6: qué sesiones fijas se lleva por delante |
| `MonthCalendar` | **sin cambios**: una sesión es una cita, y las citas ya salen en rojo desde el 31 de agosto |

**Plazos**

| Plazo | Propuesta |
|---|---|
| Responder a un contrato fijo | `min(24 h, primera sesión − antelación)` |
| Ventana de sesiones creadas | 8 semanas, estirada a diario |
| Retención de cada sesión | 24 h antes |
| Cancelación gratis de una sesión | hasta 24 h antes |
| Fallos de tarjeta seguidos antes de cortar | 3 |

### F11. Orden para construirlo

1. **`SlotPickerPage` sobre `/slots`.** Da valor sola —hoy no hay forma de ver
   los huecos de nadie— y es la mitad de lo que pide F2.
2. **`book-hours`**: reserva de una vez, con desglose y cobro. Es §A2–A3, que
   está pendiente desde la v3.
3. **`check-recurrence`** y la pantalla de F2, que es la parte que más importa.
4. **La serie**: `book-recurring`, `accept-recurring` y los dos pasos del
   barrido.
5. **Cancelaciones y el aviso de las ausencias** (F6, F7).

Los tres primeros dejan algo usable aunque lo recurrente no llegue: un cliente
que ve huecos y reserva por horas.

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
| `CommissionPolicy` | — | nuevo: una fila por kind, `validFrom`. **Construido**; al 10 % desde `COMO_SE_CONTRATA.md` §12, y con `level` cuando entren los niveles |
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
