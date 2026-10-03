# Política de Privacidad de Lughly

> ## ⚠️ BORRADOR PARA REVISIÓN JURÍDICA
>
> Redactado el 3 de octubre de 2026 por el equipo técnico sobre los datos que
> trata de verdad la aplicación (ver `LOGICA_DE_NEGOCIO.md` §12). **No es
> asesoramiento jurídico y no debe publicarse sin que lo revise un abogado
> especializado en protección de datos.**
>
> Los campos entre `[corchetes]` son datos que hay que rellenar. Los recuadros
> «**Nota de revisión**» señalan los puntos donde hace falta una decisión
> jurídica o algo que construir, y **no forman parte del texto que se
> publica**. Los marcados **bloqueante** son los que de verdad impiden
> publicar esto con garantías.
>
> Esta política es la que cita `TERMINOS_Y_CONDICIONES.md` cláusula 17, y las
> dos deben publicarse juntas: una referencia a un documento que no existe es
> peor que no tener ninguna de las dos.

---

## 1. Responsable del tratamiento

- **Titular**: `[nombre y apellidos, o denominación social completa]`
- **NIF/CIF**: `[  ]`
- **Domicilio**: `[  ]`
- **Correo de contacto para protección de datos**: `[  ]`
- **Nombre comercial y aplicación**: Lughly

> **Nota de revisión**: Lughly es hoy un autónomo —el propio titular—, no una
> sociedad (`LOGICA_DE_NEGOCIO.md` §1). El responsable del tratamiento es esa
> persona física, con su NIF, no un CIF que todavía no existe.

## 2. Qué datos se tratan

Los que recoge la aplicación para que el servicio funcione, agrupados por
quién los da — nada de lo de aquí se infiere ni se compra a terceros.

**De cualquiera que se registra**: correo electrónico, contraseña (cifrada,
nunca en claro), nombre, teléfono, dirección, código postal, coordenadas,
foto de perfil, fecha y hora de aceptación de los Términos, si acepta
recibir comunicaciones comerciales, historial de accesos (último acceso,
intentos fallidos, bloqueos) e identificador del dispositivo para los avisos
push.

**De quien se registra como profesional, además**: imagen del DNI, NIE o
pasaporte, las habilitaciones profesionales que acredite, NIF o CIF, razón
social, forma jurídica, el identificador de su cuenta en Stripe, sus
tarifas, su horario, y sus ausencias y vacaciones.

**De cada trabajo contratado**: su descripción, las fotos que aporta el
cliente y las del resultado, la dirección exacta donde se hace, sus
coordenadas, las fechas y horas de cada paso, las conversaciones del chat,
las pruebas que cada parte aporte si hay una reclamación, el importe y el
estado de cada cobro, el motivo si se cancela, y las valoraciones que se
dejan al terminar.

**Registro de auditoría**: toda acción relevante —quién, qué y cuándo—,
independiente del resto, con fines de seguridad y de prueba ante una
reclamación.

> **Nota de revisión**: ninguno de estos datos se recoge por un formulario
> aparte de consentimiento — se recogen porque hacen falta para la función
> que se está usando (alta, contratar, cobrar). Hay que confirmar que esto
> encaja con la base jurídica de cada uno (§4) y no hace falta un
> consentimiento específico en ningún punto además de aceptar estos
> documentos al registrarse.

## 3. Con qué finalidad se tratan

- **Prestar el servicio**: poner en contacto a quien necesita un trabajo con
  quien lo hace, gestionar el alta, el cobro y la comunicación entre las
  partes.
- **Verificar la identidad** de los profesionales, requisito para que
  puedan aceptar encargos y, en particular, atender urgencias — es lo que
  sostiene la confianza de quien abre la puerta de su casa a alguien que no
  conoce.
- **Procesar los cobros**, a través de Stripe, incluida la verificación
  antifraude que exige la normativa de medios de pago.
- **Resolver reclamaciones**, con las pruebas que cada parte aporta.
- **Enviar avisos operativos**: que alguien ha aceptado un encargo, que una
  urgencia necesita respuesta, que un cobro se ha liberado. No son
  publicidad y no se pueden desactivar sin dejar de poder usar la app.
- **Comunicaciones comerciales**, solo si se ha marcado la casilla
  correspondiente al registrarse, y se puede retirar el consentimiento en
  cualquier momento.
- **Cumplir obligaciones legales**: fiscales (facturación, DAC7 — informar a
  la Agencia Tributaria de los ingresos de cada profesional a través de la
  plataforma, Directiva (UE) 2021/514), de prevención del fraude, y las que
  imponga una autoridad competente.

## 4. Base jurídica de cada tratamiento

- **Ejecución del contrato** (art. 6.1.b RGPD): los datos imprescindibles
  para dar de alta la cuenta, contratar un trabajo y cobrarlo.
- **Obligación legal** (art. 6.1.c RGPD): la verificación de identidad del
  profesional, la conservación de las facturas, el informe DAC7.
- **Interés legítimo** (art. 6.1.f RGPD): el registro de auditoría, la
  prevención del fraude, y resolver una reclamación con las pruebas
  aportadas.
- **Consentimiento** (art. 6.1.a RGPD): las comunicaciones comerciales,
  revocable en cualquier momento sin afectar al resto del servicio.

> **Nota de revisión**: confirmar que esta asignación es correcta artículo
> por artículo — en particular, si el documento de identidad del profesional
> necesita su propia base jurídica distinta (es un dato especialmente
> protegido a efectos prácticos, aunque no sea una "categoría especial" del
> art. 9 RGPD en sentido estricto).

## 5. A quién se ceden los datos

Lughly no vende ni cede datos a terceros para fines publicitarios. Los
únicos que los reciben son los proveedores que hacen posible el servicio,
como encargados del tratamiento:

- **Stripe** (pagos, verificación de identidad y prevención del fraude).
- El proveedor de **avisos push** (Expo).
- El proveedor de **correo electrónico** (Brevo).
- El proveedor de **geocodificación** de direcciones.
- El proveedor de **almacenamiento en la nube** donde se guardan las
  fotos y los documentos de identidad.

Y, cuando la ley lo exige: la **Agencia Tributaria** (DAC7, facturación), y
cualquier autoridad competente que lo requiera.

> **Nota de revisión — bloqueante**: `LOGICA_DE_NEGOCIO.md` §12 ya lo señala
> y sigue sin resolverse: **no existe un contrato de encargado de
> tratamiento firmado con ninguno de estos proveedores**
> (`PENDIENTE_PARA_PRODUCCION.md`). Sin él, cederles datos no está amparado.

## 6. Transferencias internacionales

`[Pendiente de confirmar con cada proveedor]`: si Stripe, el proveedor de
avisos push, el de correo o el de almacenamiento tratan datos fuera del
Espacio Económico Europeo, hace falta decir aquí con qué garantía —cláusulas
contractuales tipo, decisión de adecuación— se ampara esa transferencia.

> **Nota de revisión — bloqueante**: no se ha comprobado dónde procesa cada
> proveedor los datos. Es habitual que EE. UU. esté entre los destinos
> (Stripe, Expo); hay que confirmarlo con cada uno antes de publicar.

## 7. Plazo de conservación

- **Mientras la cuenta esté activa**, los datos necesarios para prestar el
  servicio.
- **Los documentos de identidad**: `[pendiente de decidir]`.
- **Las facturas**: mínimo 4 años, por obligación fiscal (Ley General
  Tributaria).
- **Las pruebas de una reclamación**: se conservan sin fecha de borrado a
  propósito, porque pueden hacer falta como prueba — hay que fijar un plazo
  máximo razonable de todos modos.
- **El registro de auditoría**: `[pendiente de decidir]`.

> **Nota de revisión — bloqueante**: `LOGICA_DE_NEGOCIO.md` §12 ya lo señala
> y sigue sin resolverse — **no hay plazos de conservación definidos en
> ningún sitio de la aplicación**. Fijarlos es un requisito del principio de
> minimización (art. 5.1.e RGPD), no un detalle de redacción: sin plazo, el
> dato se conserva para siempre, y eso en sí mismo incumple el reglamento.

## 8. Derechos de las personas

Quien tiene una cuenta en Lughly puede ejercer, dirigiéndose a
`[correo de contacto]`:

- **Acceso**: saber qué datos suyos se tratan.
- **Rectificación**: corregir un dato incorrecto.
- **Supresión**: pedir que se borren, cuando no haya una obligación legal
  que obligue a conservarlos (una factura, por ejemplo).
- **Portabilidad**: recibir sus datos en un formato que pueda llevarse a
  otro servicio.
- **Oposición y limitación**: oponerse a un tratamiento basado en interés
  legítimo, o pedir que se limite mientras se resuelve una disputa sobre
  ellos.
- **Reclamación ante la Agencia Española de Protección de Datos**
  (www.aepd.es), si considera que no se han atendido bien sus derechos.

> **Nota de revisión — bloqueante**: `LOGICA_DE_NEGOCIO.md` §12 y
> `PENDIENTE_PARA_PRODUCCION.md` ya lo señalan — **no existe hoy ningún
> camino en la app para pedir el borrado de la cuenta ni la exportación de
> los datos**, aunque la pantalla de cuenta suspendida ya promete
> «Descargar mis datos (RGPD)». Sin eso construido, este apartado describe
> un derecho que hoy no se puede ejercer desde la app — solo escribiendo al
> correo de contacto, que tampoco está decidido.

## 9. Decisiones automatizadas

Lughly calcula de forma automática el nivel de comisión de cada profesional
según su facturación, y qué recargo aplica una reserva según la hora en que
empieza. Ninguno de los dos produce efectos jurídicos significativos sobre
la persona en el sentido del art. 22 RGPD: son cálculos de precio, no
decisiones que la afecten de forma relevante y automática sin intervención
humana en algo con consecuencias legales.

> **Nota de revisión**: confirmar esta lectura. Si se considerase que el
> nivel de comisión sí tiene un efecto significativo, haría falta el
> derecho a la intervención humana que exige el art. 22.3 RGPD.

## 10. Medidas de seguridad

- Las contraseñas se guardan **cifradas**, nunca en texto plano.
- Los documentos de identidad `[pendiente: confirmar cifrado en reposo y
  control de acceso una vez se despliegue el almacenamiento definitivo, ver
  `PENDIENTE_PARA_PRODUCCION.md`]`.
- El acceso a los datos de cada usuario está limitado a quien necesita verlos
  para hacer su trabajo.

## 11. Menores de edad

Lughly no está dirigida a menores de edad. No se solicita conscientemente
ningún dato de un menor.

> **Nota de revisión — bloqueante**: `LOGICA_DE_NEGOCIO.md` §13 ya lo señala
> — **la app no comprueba la edad de quien se registra**. Mientras eso siga
> así, esta cláusula describe una intención, no un hecho verificado.

## 12. Cambios en esta política

Lughly podrá modificar esta política por motivos legales, técnicos o de
negocio. Los cambios sustanciales se comunicarán con la misma antelación que
los Términos y Condiciones (cláusula 18.2), y seguirán aplicándose a los
datos ya recogidos salvo que la ley exija lo contrario.

---

## Anexo — Lo que falta antes de poder publicar esto

Por orden de dependencia. Los cuatro primeros bloquean la publicación.

1. **Rellenar los datos del responsable** (cláusula 1) — mismo bloqueante
   que `TERMINOS_Y_CONDICIONES.md` punto 1: hace falta el NIF y el domicilio
   reales.
2. **Firmar el contrato de encargado de tratamiento** con Stripe, el
   proveedor de correo, el de avisos push, el de geocodificación y el de
   almacenamiento (cláusula 5).
3. **Confirmar las transferencias internacionales** de cada proveedor y su
   garantía (cláusula 6).
4. **Fijar los plazos de conservación** que hoy no existen en ningún sitio
   de la aplicación (cláusula 7), y que el código aplique el borrado al
   cumplirse.
5. **Construir el camino de borrado de cuenta y exportación de datos**
   (cláusula 8) — es lo mismo que pide `TERMINOS_Y_CONDICIONES.md` 18.3 para
   la baja, y aquí además hace falta que de verdad borre o anonimice los
   datos, no solo que desactive la cuenta.
6. Decidir el cifrado en reposo de los documentos de identidad una vez se
   despliegue el almacenamiento definitivo (cláusula 10).
7. Comprobar la edad al registrarse (cláusula 11), o decidir explícitamente
   no hacerlo y asumir el riesgo.
