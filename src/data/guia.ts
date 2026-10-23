/**
 * Guía del panel (/admin → Guía): manual de uso, plan y seguimiento, y referencia.
 * Son los textos iniciales: "Habilitar edición" los copia a Supabase y desde ahí se editan en el panel.
 * Formato simple: ## título, ### subtítulo, - lista, 1. lista numerada, **negrita**, `código`, [texto](enlace),
 * > cita (se muestra con botón para copiar), tablas con | y líneas en blanco entre párrafos.
 */

export const seccionesGuia = ['Manual', 'Plan y seguimiento', 'Referencia'] as const;
export type SeccionGuia = (typeof seccionesGuia)[number];

export type DocGuia = { seccion: SeccionGuia; titulo: string; contenido: string };

export const guia: readonly DocGuia[] = [
  /* ====================================================== MANUAL ====================================================== */
  {
    seccion: 'Manual',
    titulo: 'Empezar: entrar, menú y consejos',
    contenido: `## Cómo entrar
- Desde el sitio: **5 clics seguidos en el logo** del header (menos de 2 segundos entre clics) llevan a \`/admin\`.
- Ingresás con tu mail y contraseña de Supabase. La sesión dura 7 días y se renueva sola. **Salir** te lleva a la home.

## El menú: 6 grupos
- **Hoy:** Hoy, Semana y Metas.
- **Vender:** Embudo, Contactos, Ventas, Proyección y Mensajes.
- **Contenido:** Calendario de publicaciones.
- **Mentoría:** Mentorados, Enlaces y Programa.
- **Gestión:** Tareas y Datos.
- **Guía:** esta guía.

Los números en el menú marcan lo que está sin atender. El título de la pestaña del navegador también lo muestra, por ejemplo "(5) Panel".

## Consejos
- Si algo no aparece o se ve viejo: **Ctrl + F5** (recarga sin caché). Casi siempre es eso.
- En el celular, los grupos y secciones se deslizan hacia los costados.
- Cada vez que borrás algo, el panel pide confirmación en un modal. Lo que tiene pagos, ventas o cobros asociados no se puede borrar hasta eliminar esas partes.`,
  },
  {
    seccion: 'Manual',
    titulo: 'Rutina diaria (15 minutos)',
    contenido: `## Cada mañana
1. Abrí el panel y andá a **Hoy**. Es lo único que hace falta mirar para saber qué hacer.
2. Recorré los bloques de arriba hacia abajo:
  - **Reservas de hoy y mañana:** llamadas agendadas en Cal.com.
  - **Seguimientos:** prospectos a los que les toca un mensaje. Abrí la ficha, copiá el mensaje sugerido y marcalo como enviado.
  - **Cobros vencidos o de hoy:** botón **Mensaje** para copiar el recordatorio y **Cobrado** cuando entra el pago.
  - **Renovaciones de planes:** planes mensuales a los que hay que generar el próximo cobro.
  - **Mentoría:** llamadas que tocan y entregables sin recibir.
  - **Tareas** y **Contenido para publicar.**
  - **Contactos nuevos sin atender:** formularios que entraron.
3. Mientras trabajás, usá las **acciones rápidas** de arriba: **+1 Mensaje** y **+1 Respuesta** suman a tus metas de la semana; **Registrar cobro**, **Nueva venta** y **Nuevo prospecto** abren su formulario.

## El mail de las 8
Todos los días a las 8 (puede llegar hasta las 9) te llega un mail con lo mismo que ves en Hoy. Si no hay nada pendiente, no manda nada. En Hoy hay un botón para enviártelo en el momento.`,
  },
  {
    seccion: 'Manual',
    titulo: 'Rutina semanal',
    contenido: `## Lunes (20 minutos)
1. **Hoy → Semana:** los lunes muestra la semana que terminó. Mirá qué metas se cumplieron, cuánto cobraste, qué quedó vencido y qué viene.
2. **Vender → Embudo:** dónde se está cayendo la gente (el panel marca el paso más flojo).
3. Elegí las 3 prioridades de la semana y cargalas como **Tareas** si todavía no están.

## Viernes (20 minutos)
1. **Contenido → Calendario:** cargá las vistas, interacciones y mensajes de lo que publicaste ("Cargar resultados de la semana"). Se guardan solos al salir de cada campo.
2. Revisá **Vender → Proyección:** cuánto falta para la meta y en cuánto tiempo llegás con los escenarios.
3. Actualizá los **prospectos**: estado, próximo seguimiento y notas de lo que hablaste.

## Una vez por mes
- **Gestión → Datos:** descargá la **copia de seguridad (JSON)** y guardala en tu computadora.`,
  },
  {
    seccion: 'Manual',
    titulo: 'Prospectos: cargar, escribir y avanzar',
    contenido: `## Cargar un prospecto
- Desde Hoy: **Nuevo prospecto**. O **Vender → Contactos → Prospectos → + Agregar prospecto**.
- Completá nombre, club u organización, **mail** (si lo tenés: evita duplicados), tipo y canal. **"Cómo llegó"** importa: si elegís **Instagram**, el panel te sugiere los mensajes de Instagram.
- Si cargás un mail que ya existe, el panel avisa "Ya existe un prospecto con ese mail".

## La ficha del prospecto
Tocá un prospecto y se abre su ficha:
- **Mensaje sugerido para este paso**, con el nombre y el club ya puestos. Podés editarlo antes de copiarlo. **Copiar** solo copia; **Copiar y marcar como enviado** además lo anota, mueve al prospecto al estado siguiente y agenda el próximo seguimiento.
- **Todos los mensajes:** el resto, por si querés usar otro.
- **Estado y próximo seguimiento:** al cambiar el estado, el seguimiento se agenda solo (Contactado 3 días, Respondió 2, Informe enviado 4, Propuesta 3). Si cambiás la fecha a mano, se respeta la tuya.
- **Notas e historial:** cada nota queda con fecha y hora, mezclada con los cambios de estado.
- **Editar datos**, **Pasar a cliente** y **Eliminar prospecto**.

## Los estados
Por contactar → Contactado → Respondió → Informe enviado → Propuesta → Cliente. "Descartado" saca al prospecto de los seguimientos.

## Pasar a cliente
En la ficha, **Pasar a cliente** abre una venta con el nombre ya cargado. Al guardarla, el prospecto pasa a Cliente solo y la venta queda vinculada.

## Eliminar
Un prospecto sin ventas ni mentorado asociado se puede eliminar (con confirmación). Si tiene ventas o cobros, hay que eliminar primero esas ventas.`,
  },
  {
    seccion: 'Manual',
    titulo: 'Entrantes y Personas (lo que llega por la web)',
    contenido: `## Dos vistas de lo mismo (Vender → Contactos)
- **Entrantes (formularios):** cada diagnóstico, aplicación, consulta de clubes, clip o descarga de plantilla, con su resumen. Desde ahí cambiás el estado y dejás notas.
- **Personas (por mail):** una fila por persona, con todo lo que hizo en la web (qué plantillas bajó, si hizo el diagnóstico, etc.). Tiene buscador por nombre o mail.

## Convertir a alguien en prospecto
En **Personas**, abrí a la persona y tocá **Pasar a prospectos**. Se crea con su mail, el origen (Plantillas, Diagnóstico o Formulario web) y las notas de lo que hizo, en estado "Respondió" y con seguimiento a 2 días. Si ya era prospecto, te lo dice y te deja abrirlo.

## Qué tiene que pasar con cada tipo
- **Diagnóstico y plantillas:** una vez que alguien muestra interés, usá los mensajes "Respuesta a quien hizo el diagnóstico" o "Plantillas · 1. ¿Te sirvió?".
- **Aplicación a la mentoría y consultas de clubes:** respondé en menos de 24 horas. Es lo que prometen los mails de confirmación.
- **Clips:** mirá los del mes y elegí cuáles analizar en público.`,
  },
  {
    seccion: 'Manual',
    titulo: 'Ventas y cobros',
    contenido: `## Registrar una venta
**Vender → Ventas → + Nueva venta.** Elegís el producto y el panel arma las cuotas sugeridas, con su vencimiento.
- Podés cambiar el total (las cuotas se reparten solas), marcar **"Ya cobré el primer pago"** y elegir **"Cómo llegó el cliente"**.
- Los **planes mensuales** (Seguimiento, Integral, A medida) se marcan "se cobra todos los meses".
- Para algo fuera de lista, elegí **Personalizada**.

## Cobros
- Cada cobro tiene concepto, monto en USD (y en pesos si cobraste en ARS) y vencimiento.
- **Cobrado** lo marca con la fecha de hoy. **Editar** cambia monto, vencimiento o fecha de cobro. **Eliminar** lo borra (con confirmación).
- **Mensaje** copia un recordatorio de pago listo para enviar, con el monto y la fecha. No incluye datos de pago: esos los mandás vos.

## Planes mensuales
- A los 25 días del último pago, **Hoy** te avisa en "Renovaciones de planes". Tocá **Generar cobro** (o "Generar cobro del mes siguiente" en la venta) y se crea el cobro del mes siguiente.
- **Dar de baja** frena las renovaciones; se puede **Reactivar**.

## Reglas para borrar
- Una venta con **pagos ya cobrados** no se puede eliminar: primero eliminá esos cobros.
- Una venta sin cobros cobrados se elimina con sus cobros pendientes.

## Lo que ves arriba
Cobrado este mes, vencido sin cobrar y a cobrar en 30 días. Abajo, una tabla de **de dónde vienen las ventas**.`,
  },
  {
    seccion: 'Manual',
    titulo: 'Mentorados: la ficha y las 12 semanas',
    contenido: `## Crear un mentorado
- **Mentoría → Mentorados → + Nuevo mentorado** crea todo junto: el prospecto (como cliente), la venta con sus cuotas (estándar o fundadora) y las 12 semanas armadas a partir del esqueleto, con la variante de su perfil.
- Si ya tenés la venta, en **Ventas** aparece **Crear mentorado** en las ventas de Sistema Propio.
- Si alguien quedó cargado sin venta o sin prospecto, abrí su ficha: al final tiene **Crear prospecto** y **Crear venta**.

## La ficha
- **Estado**, avance (semanas y entregables), pagos de su venta y **"Dónde está trabado hoy"**.
- **La tira de 12 semanas:** tocá una semana para ver y editar su detalle. Verde = hecha, rojo = saltada, borde cian = la actual.
- **Cada semana:** estado, fecha y hora de la llamada, el **esqueleto** (desplegable), **tu plan para esa persona**, lo que se vio, la tarea acordada, el entregable (con **Recibido hoy**) y el enlace a tu devolución en video.
- **Marcar llamada hecha:** pide confirmación y pasa a la semana siguiente. Si completa las 12 semanas, el mentorado pasa solo a "terminado".
- **Entregables y enlaces:** cargá los links de lo que entrega cada persona (Drive, YouTube, etc.) con título, tipo y semana. Se abren y se copian con un clic. En **Mentoría → Enlaces** ves los de todos, con buscador.
- **Resumen:** una tabla de las 12 semanas y un botón para **copiar un resumen listo para enviarle**.

## Agendar las llamadas
En la semana pendiente, **Copiar mensaje para que agende** genera un link a \`/agendar\` con su nombre y mail. Al reservar, la fecha y hora quedan en la ficha ("Reservada en Cal.com"). **Importante:** tiene que reservar con el mismo mail que cargaste.

## El esqueleto
**Mentoría → Programa** es la plantilla maestra de las 12 semanas. Si la editás, afecta solo a los mentorados nuevos, no a los que ya empezaron.`,
  },
  {
    seccion: 'Manual',
    titulo: 'Contenido, Embudo y Proyección',
    contenido: `## Contenido → Calendario
- Cada pieza tiene fecha, canal, estado (idea → guion → grabada → editada → publicada), enlace y notas.
- Cuando se publica, aparece en **Cargar resultados de la semana**: vistas, interacciones y mensajes. Con datos cargados, **Qué funciona** te muestra el promedio por tipo de pieza y las 5 con más vistas.

## Vender → Embudo
Barras por etapa (Por contactar → … → Cliente) con el porcentaje que pasa de una a otra, y el **paso más flojo** marcado en rojo con un consejo. Solo marca un paso si hay 5 o más prospectos en la etapa anterior. Abajo, la conversión por tipo de contacto.

## Vender → Proyección
- Tu ingreso recurrente actual contra la meta de USD 2.000.
- Un gráfico de los últimos 6 meses y los próximos 3.
- **Escenarios:** cuántos meses tardás en llegar con 1, 2 o 4 clientes nuevos por mes, o el escenario que armes vos. También cuántas personas tenés que contactar por mes.
- Los planes mensuales cuentan como recurrentes; la mentoría y las sesiones son puntuales.

## Hoy → Metas
Contadores semanales (mensajes, conversaciones, informes, publicaciones). **Ventas** e **Ingresos** se calculan solos desde Ventas. El botón **Meta** de cada tarjeta cambia el objetivo.`,
  },
  {
    seccion: 'Manual',
    titulo: 'Mensajes y Programa editables',
    contenido: `## Vender → Mensajes
Los textos que ves en la ficha de cada prospecto, agrupados por paso. Por cada uno podés:
- cambiar el título y el texto,
- elegir **para qué tipos de prospecto** se usa y **si llegó por** un origen (por ejemplo, Instagram),
- decidir **a qué estado pasa** al marcarlo como enviado y **cuántos días** después va el seguimiento,
- cambiar el **orden**: el menor número se sugiere primero.

Datos que se completan solos: \`{nombre}\` (primer nombre), \`{organizacion}\` y \`{sitio}\`. Lo que va entre [corchetes] lo completás a mano antes de enviar.

## Mentoría → Programa
Las 12 semanas con su objetivo, agenda de la llamada, tarea, entregable, qué mirar en la devolución y las 5 variantes por perfil. Cada semana tiene **Editar esta semana**.

## La primera vez
Cada sección muestra "Habilitar edición" mientras use los textos iniciales. Un clic los copia a tu base y desde ahí todo se guarda en Supabase.`,
  },
  {
    seccion: 'Manual',
    titulo: 'Cal.com, reservas y agenda',
    contenido: `## Cómo funciona
- Cada reserva, reprogramación o cancelación en Cal.com llega al panel sola (webhook).
- Si el mail es de un **mentorado activo**, la llamada se asigna a su próxima semana pendiente, con fecha y hora.
- Si es **otra persona**, queda como prospecto "Respondió" (origen Cal.com) con una nota y seguimiento ese día. Si ya existía, se le anota.
- **Hoy → Reservas de hoy y mañana** las muestra.

## La agenda de mentoría
Se reserva desde \`/agendar\`, una página del sitio que muestra tu evento de Cal.com y, al terminar, lleva a la página de gracias. El link lo copiás desde la ficha del mentorado.

## Si algo no funciona
- El mensaje de la ficha dice que falta algo: revisá la variable \`PUBLIC_CAL_MENTORIA_LINK\` en Vercel y hacé Redeploy.
- La reserva no aparece: revisá en Cal.com → Webhooks que esté apuntando a la dirección del sitio y que los eventos "creada", "reprogramada" y "cancelada" estén tildados.
- La reserva se registró como prospecto nuevo: la persona usó un mail distinto al del mentorado. Corregilo en su ficha.`,
  },
  {
    seccion: 'Manual',
    titulo: 'Datos, copias de seguridad y problemas comunes',
    contenido: `## Gestión → Datos
- **Copia de seguridad completa (JSON):** todo lo que hay en el panel en un archivo. Descargala una vez por mes.
- **CSV:** prospectos, personas de la web, formularios recibidos, ventas y cobros, contenido, tareas y mentorados. Abren directo en Excel o Google Sheets.

## Problemas comunes
| Qué pasa | Qué hacer |
|---|---|
| El panel muestra un error de carga | Falta correr un archivo de \`supabase/\` en el SQL Editor (elegí "Run and enable RLS"). |
| Algo no aparece o se ve viejo | Ctrl + F5. |
| Entré y me saca | La sesión venció: volvé a entrar. |
| No llega el mail de las 8 | Mirá Vercel → Settings → Cron Jobs y que exista \`CRON_SECRET\`. Si no hay nada pendiente, no se manda. |
| Cargué una variable y no hace efecto | En Vercel hay que hacer **Redeploy**; en tu computadora, reiniciar \`astro dev\`. |
| Un formulario de la web no guarda | Revisá \`SUPABASE_SERVICE_ROLE_KEY\` y, si corriste \`seguridad.sql\`, \`SUPABASE_ANON_KEY\`. |

## Para tener a mano
Las tablas del panel tienen la seguridad activada y solo se acceden desde el servidor con tu sesión: ningún visitante puede leerlas.`,
  },

  /* ============================================ PLAN Y SEGUIMIENTO ============================================ */
  {
    seccion: 'Plan y seguimiento',
    titulo: 'Plan semanal hasta enero y condición de salida',
    contenido: `## Tu condición de salida
**USD 1.200/mes recurrentes más el colchón de USD 4.000 intacto, o 3 meses seguidos sobre USD 2.000.** No hay una fecha fija: depende de las ventas.

## Cómo llegar a USD 1.200 recurrentes
La mentoría es puntual y no cuenta como recurrente. Algunas combinaciones:
- 3 planes Integral (350) + 1 mantenimiento (150) = 1.200.
- 2 Integral + 1 Seguimiento + 2 mantenimientos = 1.220.
- 4 Seguimiento + 2 mantenimientos = 1.180.

Con cero ventas al 23/10, sumar 3 o 4 clientes recurrentes en 9 semanas es posible pero ajustado. Se decide mirando los números cada semana.

## Cómo repartir las 2 a 3 horas diarias
50 % conversaciones y mensajes · 25 % contenido (voz sobre video) · 15 % producto y panel · 10 % administración.

## Semana por semana
| Semana | Foco | Meta |
|---|---|---|
| 26/10 | Validar | Mensaje a quienes bajaron plantillas, LinkedIn actualizado, 30 prospectos cargados, 5 llamadas pedidas |
| 2/11 | Validar | 5 conversaciones hechas y 5 pedidas |
| 9/11 | Decidir | Las 10 hechas y la tabla completa; decisión sobre el sistema a medida |
| 16/11 | Proponer | 2 o 3 propuestas cortas a los "A"; sesiones 1:1 a quienes respondieron lo de plantillas |
| 23/11 | Cohorte | Empuje a la lista; **si el 25/11 no hay inscriptos, mover la cohorte a enero** |
| 30/11 | Cohorte | Cierre de fundadores; arranca el 2/12 |
| 7/12 | Cobrar | Cerrar propuestas pendientes y empezar a trabajar |
| 14/12 | Chequeo | Revisión el 15/12: ¿cuánto recurrente hay? ¿qué segmento paga? |
| 21/12 | Recurrente | Ofrecer plan de cuerpo técnico a los clientes nuevos |
| 28/12 | Ordenar | Cierre del año y plan de enero |
| 4/1, 11/1, 18/1 | Recurrente | Llegar a 1.200: sumar los planes que falten |
| 25/1 | Chequeo | Revisión el 31/1 contra la condición de salida |

## Lo que mirás cada semana
Conversaciones (mínimo 5), propuestas enviadas (mínimo 1 desde el 16/11) y cobrado en el mes. Están en **Hoy → Semana**, **Embudo** y **Proyección**.

Los hitos con fecha ya están cargados en **Gestión → Tareas**.`,
  },
  {
    seccion: 'Plan y seguimiento',
    titulo: 'Guion de las 10 conversaciones',
    contenido: `## Objetivo
Aprender si pagan y cuánto. **No es una venta.** Meta: 10 conversaciones de 20 minutos antes del 8/11.

## A quiénes
4 agencias de representantes · 3 dirigentes de clubes con sponsors o estructura · 1 liga u organizador de torneos · 2 entrenadores con cuerpo técnico.

## Cómo pedirla
Los mensajes están en **Vender → Mensajes** ("Pedir llamada de 20 min" y los de Instagram). Para Instagram, mirá antes su perfil y escribí algo real.

## La llamada (20 minutos)
### 0–2 min: apertura
> Te hago unas preguntas y tomo notas. Si en algún momento sirve algo de lo que hago, te lo digo, pero esto es para entender.

### 2–12 min: descubrimiento
1. Contame cómo lo resuelven hoy. ¿Qué herramientas usan?
2. ¿Qué es lo que más tiempo te saca?
3. La última vez que pasó, ¿qué hicieron? ¿Cuánto tiempo o plata les costó?
4. ¿Alguna vez pagaron por resolverlo (una herramienta, una persona)? ¿Cómo les fue?
5. Si esto se resolviera, ¿qué cambiaría?
6. ¿Quién decide y cómo se aprueba un gasto así? ¿Hay presupuesto o sponsors?
7. ¿Para cuándo lo necesitarían?

### 12–17 min: la idea y una sonda de precio
Contá en 30 segundos un ejemplo concreto (Futsal Hub o LAA). Después:
> Sin compromiso: para algo así, ¿en qué rango de inversión tendría sentido para ustedes? ¿Y un mantenimiento mensual de USD 150, les parecería razonable?

### 17–20 min: cierre
> ¿Qué te sería más útil que te mande, una propuesta corta?

Acordá fecha de seguimiento y preguntá: ¿conocés a alguien más con este problema?

## Cómo clasificar
- **A, paga:** ya pagaron antes por algo parecido, hay decisor en la llamada, hay presupuesto o sponsors, hay fecha de urgencia, o pidieron el precio solos.
- **B, tal vez:** les interesa pero no decide, o "lo vemos más adelante".
- **C, no:** "me encanta, pero…", quieren todo gratis o no hay presupuesto.

## Después de las 10
Con 3 o más "A": armás la propuesta del sistema a medida. Con 0 o 1: foco en analista para cuerpo técnico y en la mentoría. Cargá a cada persona como prospecto con sus notas: la tabla sale sola en **Embudo**.

## Antes de prometer
Hasta que lo confirmes, **no prometas** "si no cierra, no pagás nada", la migración de planillas ni que los datos son del club exportables.`,
  },
  {
    seccion: 'Plan y seguimiento',
    titulo: 'Mensajes para quienes bajaron plantillas',
    contenido: `Ya están cargados en **Vender → Mensajes** como "Plantillas · 1, 2 y 3". Se sugieren solos a los prospectos que llegaron por plantillas.

## 1. Hoy (el primer mensaje)
> Hola {nombre}, soy Pablo. Hace unos días bajaste una de mis plantillas y quería preguntarte algo simple: ¿ya la usaste, o la vas a usar? ¿En tu equipo o para otra cosa?
>
> Las voy mejorando con lo que me cuentan, así que tu respuesta me sirve de verdad. Y si te trabaste en algún punto, decime cuál y te lo resuelvo por acá.

## 2. A los 5 días, si no contestó
> Hola {nombre}, te dejo algo más por si te sirve: el diagnóstico gratis dura 3 minutos y te dice cómo analizás hoy y por dónde empezar.

## 3. Si contestó con interés
> Gracias por contarme, {nombre}. Por lo que decís, hay dos caminos: una sesión 1:1 de video (USD 80, que se descuenta si después entrás a Sistema Propio) o la mentoría completa de 12 semanas, cuya próxima cohorte arranca el 2 de diciembre y tiene 3 lugares fundadores a USD 750.
>
> ¿Cuál te hace más sentido?

No ofrezcas nada en el primer mensaje: si contesta, ya tenés una conversación.

## Cómo hacerlo
1. **Vender → Contactos → Personas.** Buscá a quien bajó una plantilla.
2. **Pasar a prospectos.**
3. En su ficha, copiá el mensaje y marcalo como enviado.`,
  },
  {
    seccion: 'Plan y seguimiento',
    titulo: 'Mensajes de Instagram',
    contenido: `Ya están cargados en **Vender → Mensajes** como "Instagram · 1, 2 y 3". Se sugieren solos cuando el prospecto tiene **"Cómo llegó: Instagram"**.

## 1. Apertura (algo específico de esa persona)
> Hola {nombre}, vi [el partido de X / el informe que subieron / lo que armó la agencia con Y] y me gustó [algo concreto]. Soy Pablo, DT de futsal y hago análisis en @dtpablogranados.
>
> Te escribo porque estoy aprendiendo cómo [trabajan las agencias / se organizan los clubes] con [las fichas / el plantel / los partidos].

## 2. Si contestó
> Gracias por contestar, {nombre}. Estoy hablando con gente del medio para entender qué les hace perder más tiempo con [las fichas de jugadores / las cuotas y el plantel / los partidos].
>
> ¿Te puedo hacer unas preguntas en una llamada de 20 minutos? No te vendo nada: me sirve tu mirada.

## 3. Si no contestó (a los 3 días, una sola vez)
> {nombre}, te dejo esto por si quedó perdido el mensaje. Si ahora no es momento, sin problema.

## Reglas
- Mirá su perfil antes de escribir. Sin un detalle real en el primer mensaje, es lo mismo que mandar una plantilla.
- Sin link ni precio en el primer mensaje.
- Máximo 5 o 6 DMs nuevos por día: Instagram frena las cuentas que mandan muchos seguidos.
- Tu perfil tiene que verse trabajado: bio clara y el link al sitio.
- Cuando acepte la llamada, coordiná por WhatsApp o mail y cargalo con canal "Instagram".`,
  },
  {
    seccion: 'Plan y seguimiento',
    titulo: 'LinkedIn: textos y checklist',
    contenido: `## Titular
> Analista de futsal que construye sus propias herramientas | Futsal Hub · Mentoría Sistema Propio | DT Licencia A (CONMEBOL)

## Acerca de
> Analizo futsal y construyo las herramientas para hacerlo.
>
> Soy entrenador desde 2019 (Licencia A, CONMEBOL vía ATFA) y jugué hasta 2021. Trabajé como videoanalista remoto para Valdetires Ferrol (España) hasta mayo de 2026.
>
> Desarrollo mis propias herramientas: Futsal Hub (futsalhub.com.ar), una plataforma de datos del futsal de Rosario con más de 3.500 partidos registrados, y sitios y sistemas para agencias y clubes, como el de LAA Sports.
>
> Hoy hago tres cosas:
> • Sistema Propio: mentoría 1:1 de 12 semanas para entrenadores y analistas que quieren ordenar cómo analizan (informes de rival, informe propio, scout individual).
> • Sistemas a medida para clubes y agencias: cuotas, fichas de plantel, partidos y paneles para dirigentes.
> • Análisis para cuerpos técnicos: informes de rival y seguimiento mensual.
>
> Si trabajás en un club o una agencia de futsal y querés ordenar datos, partidos o jugadores, escribime. pablogranados.com.ar

## Checklist
- [ ] Titular y Acerca de actualizados.
- [ ] Destacados: Futsal Hub, el diagnóstico gratis y \`/sistemas\`.
- [ ] Banner con el logo.
- [ ] Experiencia: "Analista y desarrollador independiente — pablogranados.com.ar", desde 2026.
- [ ] No nombrar el club que dirigís.
- [ ] Educación: si querés incluirla, "Contador Público (en curso)" con la universidad que corresponda.`,
  },
  {
    seccion: 'Plan y seguimiento',
    titulo: 'Pendientes técnicos y de configuración',
    contenido: `Revisá cada uno y tildalo mentalmente (o pasalo a **Gestión → Tareas**).

## En Supabase (SQL Editor, pegar el archivo completo y elegir "Run and enable RLS")
- Todos los archivos de \`supabase/\` corridos en el orden de la bitácora, incluidos \`cal.sql\`, \`seguridad.sql\`, \`admin_textos.sql\` y \`admin_guia.sql\`.
- \`limpieza.sql\`: primero mirás las filas de prueba y después borrás solo las tuyas.

## En Vercel (Settings → Environment Variables, y Redeploy después)
- \`CRON_SECRET\`: para el mail de las 8. Verificá en **Settings → Cron Jobs** que aparezca \`/api/cron/resumen\`.
- \`PUBLIC_CAL_MENTORIA_LINK\` y \`CAL_WEBHOOK_SECRET\`: para las llamadas de mentoría.
- \`SUPABASE_ANON_KEY\`: **solo después** de correr \`seguridad.sql\`. Es la clave \`anon public\` del proyecto de la web.
- \`SITE_URL\`: la dirección definitiva del sitio.

## Con el dominio propio
- Actualizar el sitio en Umami.
- Cambiar la dirección del webhook en Cal.com.
- Más adelante: mails desde tu dominio con un servicio de envío (por ejemplo Resend).

## Pruebas pendientes
- Una reserva real en \`/agendar\`: tiene que llevar a "Listo, quedó agendada" y mostrarse en la ficha del mentorado.
- Mandar un clip y una consulta de verdad, y ver que terminen en la página de gracias.
- Ver llegar el mail de las 8.`,
  },

  /* ============================================== REFERENCIA ============================================== */
  {
    seccion: 'Referencia',
    titulo: 'Ofertas y precios',
    contenido: `Siempre mirá \`/mentoria\`, \`/sistemas\` y \`/trabajar-juntos\` por el detalle vigente. Lo que sigue es el resumen.

| Producto | Precio |
|---|---|
| Diagnóstico, 4 plantillas, análisis de un clip | Gratis |
| Sesión 1:1 de video | USD 80 (se descuenta si entran a Sistema Propio en 30 días) |
| Taller en vivo | USD 120 |
| **Sistema Propio** (mentoría 1:1, 12 semanas) | USD 1.490 (cuotas 590 + 450 + 450; 10 % de descuento pagando todo junto) |
| Cohorte fundadora (3 lugares) | USD 750. **Próxima cohorte: 2/12/2026** |
| Analista para cuerpo técnico | USD 220 / 350 / desde 500 por mes |
| Sistema a medida (\`/sistemas\`) | Sin precio público: propuesta por mail. Mantenimiento opcional de USD 150/mes |

## Regla de precios
Todo lo que supera USD 800 se muestra como "A medida" o "A cotizar". Pro y Cuerpo Técnico, de la mentoría, también.

## A quiénes les sirve cada cosa
- **Clubes con estructura, agencias de representantes y ligas:** sistema a medida y analista para cuerpo técnico.
- **Clubes amateur:** suelen no pagar high ticket. Probar con el plan de cuerpo técnico o el informe de cortesía.
- **Entrenadores y analistas:** sesión 1:1, taller y mentoría.

## Por confirmar antes de prometer
- "Si no cierra la propuesta, no pagás nada."
- "Migración de las planillas que ya tienen."
- "Los datos del club son del club: se pueden exportar cuando quieran."`,
  },
  {
    seccion: 'Referencia',
    titulo: 'Quién sos y tus activos',
    contenido: `## Resumen
- **Pablo Granados**, Rosario. Entrenador de futsal desde 2019 (Licencia A, CONMEBOL vía ATFA); jugó de 2010 a 2021. Videoanalista remoto de Valdetires Ferrol (España) hasta mayo de 2026.
- Hace desarrollo web (React/Vite, Astro, Supabase, Vercel).
- Tiempo disponible: 2 a 3 horas por día. Empieza con voz sobre video (le da vergüenza la cámara).

## Activos
- **pablogranados.com.ar**: el sitio y este panel.
- **Futsal Hub** (futsalhub.com.ar): datos del futsal de Rosario. 3.500+ partidos registrados y 1.500+ usuarios recurrentes. Producto propio, sin ingresos.
- **Mosca** (moscapp.com.ar): finanzas personales para Argentina. Todavía no cobra.
- **Clientes:** LAA Sports y La Chiostrina (mismo cliente, llegó por Futsal Hub).
- **Audiencia:** YouTube @dtpablogranados (1.100+ suscriptores, monetizado) e Instagram (2.000+ seguidores).

## Posicionamiento
**"Analista de futsal que construye sus propias herramientas."** Dos líneas: la mentoría Sistema Propio y los sistemas a medida para clubes y agencias.

## Objetivo
Independizarse en 2027 con USD 2.000/mes y un colchón de USD 4.000.`,
  },
  {
    seccion: 'Referencia',
    titulo: 'Reglas de trabajo',
    contenido: `## Para trabajar con Claude (o cualquier colaborador)
- Respondé en español rioplatense (voseo), directo y concreto.
- Trabajar directo en **main**; los commits y el push los hace Pablo.
- Preguntar antes de desarrollar y avanzar de a un paso.
- Nunca leer ni mostrar el \`.env\` ni claves.
- No inventar datos ni testimonios para la web: solo cifras verificables.
- No nombrar el club que dirige.
- Los SQL los corre él a mano en Supabase: avisar el orden y que pegue el archivo completo.
- Después de cambiar variables de entorno: reiniciar \`astro dev\` y hacer Redeploy en Vercel.
- Antes de dar algo por terminado: \`npx astro check\` sin errores.

## Contenido y tono
Directo, técnico, humano. Autoridad por evidencia. Sin frases de gurú.`,
  },
];
