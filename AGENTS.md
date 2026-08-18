# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

# Este repositorio es SOLO la app móvil

Lughly son dos repositorios separados. Este es el cliente; el servidor está en
otro sitio del disco y no se ve desde aquí.

| | Dónde | Qué es |
|---|---|---|
| **Móvil** (este) | `C:\Users\robin\Desktop\design_handoff_lughly\apps\mobile` | Expo / React Native. Es la raíz de git: `design_handoff_lughly` **no** es el repositorio. |
| **Backend** | `C:\Users\robin\Desktop\lughly-backend` | NestJS + Prisma + PostgreSQL. Repositorio propio, rama `main`. |

- Móvil: https://github.com/robin8888/lughly-front
- Backend: https://github.com/robin8888/lughly-backend

## Por qué esto está escrito aquí

Porque no verlo lleva a conclusiones falsas, y ya ha pasado: mirando solo esta
carpeta, la asignación de trabajos por el empleador parecía sin construir
—no hay tablas, ni endpoints, ni envío de avisos— cuando estaba entera en el
backend. El `ROADMAP.md` de aquí describe el producto completo, así que hay
cosas marcadas en él que se implementan allí.

**Antes de dar por ausente cualquier cosa de servidor, mírala en el otro
repositorio.**

## Qué va en cada uno

**En el backend**: el esquema de la base de datos y sus migraciones (Prisma),
los endpoints, las reglas de negocio, los permisos, el envío de notificaciones
push y todo lo que decida qué datos ve cada rol.

**Aquí**: pantallas, componentes, estado del cliente, y los tipos que copian el
contrato de la API. Esos tipos son un **espejo**, no la fuente: viven en
`src/api/*.api.ts` y 9 de los 11 dicen en su cabecera de qué controlador del
backend son reflejo, con una línea `Contrato: lughly-backend/src/modules/…`.
Si cambia el contrato, se tocan los dos lados.

## Cómo se trabaja: los dos desde aquí

**El backend se edita desde esta misma sesión.** No hay que abrir otro Claude
Code en `lughly-backend` ni pasarle un encargo a nadie: la carpeta está en el
disco y se puede leer y escribir con normalidad —`cd` a ella y trabajar—. Así
se ha venido haciendo.

Es además lo que conviene. Un cambio de contrato toca los dos lados a la vez
—el endpoint y el tipo que lo copia—, y hacerlos en el mismo movimiento evita
que se queden desparejados, que es el fallo caro: compila cada repositorio por
su cuenta y revienta en el móvil de alguien.

Lo único que **no** se comparte es git. Cada repositorio tiene el suyo, con su
remoto y su historial, así que un trabajo que toque los dos lleva **un commit
en cada uno**. Ninguno de los dos se queda a medias esperando al otro.

Antes de dar por terminado algo de servidor, comprueba el estado de `git` en
`lughly-backend`: es fácil dejarse cambios sin commitear ahí después de haber
commiteado aquí.

## Materiales de origen

Las piezas en bruto que llegan de diseño —secuencias de fotogramas, imágenes a
tamaño completo— viven en `C:\Users\robin\Desktop\design_handoff_lughly\_fuentes`,
**fuera del repositorio**, con un `LEEME.md` que explica de qué asset es origen
cada una y el comando exacto para regenerarlo.

No se meten aquí: son cientos de veces más grandes que el asset que se saca de
ellas, no hacen falta para compilar, y GitHub rechaza cualquier fichero de más
de 100 MiB —cosa que un zip de fotogramas se pasa él solo—. `*.zip` está en el
`.gitignore` como red por si alguno vuelve a caer dentro.
