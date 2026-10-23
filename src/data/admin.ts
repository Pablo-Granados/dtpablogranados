/**
 * Esquema del panel privado (/admin). Lo usan la API (para validar) y la pantalla (para armar
 * tablas y formularios). Para sumar un módulo o un campo: se agrega acá y en supabase/admin.sql.
 */

import { pasos } from './mensajes';
import { sistemaPrecios } from './sistemas';
import { perfiles, tiposClase } from './programa';

export type FieldType = 'text' | 'longtext' | 'select' | 'date' | 'number' | 'url' | 'uuid' | 'email' | 'bool';

export type Field = {
  name: string;
  label: string;
  type: FieldType;
  options?: readonly string[];
  required?: boolean;
  max?: number;
  /** Aparece como columna en la tabla. */
  list?: boolean;
  placeholder?: string;
  /** No se muestra en el formulario: lo completa la pantalla (por ejemplo, la venta de un cobro). */
  hidden?: boolean;
};

export type ResourceKey = 'tareas' | 'contenido' | 'contactos' | 'registro' | 'metas' | 'ventas' | 'cobros' | 'historial' | 'mentorados' | 'semanas' | 'enlaces' | 'reservas' | 'mensajes' | 'programa';

export type Resource = {
  key: ResourceKey;
  table: string;
  label: string;
  singular: string;
  /** Columna que identifica la fila (`id` salvo en metas). */
  pk: 'id' | 'tipo';
  /** Orden para PostgREST. */
  order: string;
  fields: Field[];
  defaults?: Record<string, string | number>;
  /** Solo lectura desde el panel: lo escribe el servidor. */
  readonly?: boolean;
};

export const estadosTarea = ['pendiente', 'en curso', 'hecha'] as const;
export const prioridades = ['alta', 'media', 'baja'] as const;
export const tiposContenido = ['Dato de la semana', 'Análisis en 60 s', 'Detrás de la herramienta', 'Otro'] as const;
export const canales = ['Instagram', 'YouTube', 'Ambos'] as const;
export const estadosContenido = ['idea', 'guion', 'grabada', 'editada', 'publicada'] as const;
export const tiposContacto = ['Club local', 'Club del exterior', 'Agencia', 'Entrenador o analista', 'Otro'] as const;
export const canalesContacto = ['Instagram', 'WhatsApp', 'Mail', 'Otro'] as const;
export const estadosContacto = ['Por contactar', 'Contactado', 'Respondió', 'Informe enviado', 'Propuesta', 'Cliente', 'Descartado'] as const;
export const estadosMentorado = ['activo', 'pausado', 'terminado'] as const;
export const estadosSemana = ['pendiente', 'hecha', 'saltada'] as const;
export const tiposEnlace = ['Entregable', 'Devolución', 'Material', 'Otro'] as const;
export const cohortes = ['Estándar', 'Fundadora'] as const;
export const origenesContacto = ['Instagram', 'YouTube', 'Diagnóstico', 'Plantillas', 'Formulario web', 'Cal.com', 'Red personal', 'Recomendación', 'Otro'] as const;

/** Etapas del embudo, en orden. "Descartado" queda afuera: no es una etapa. */
export const etapasEmbudo = ['Por contactar', 'Contactado', 'Respondió', 'Informe enviado', 'Propuesta', 'Cliente'] as const;

/**
 * Días hasta el próximo seguimiento al pasar un prospecto a cada estado.
 * `null` borra el seguimiento (ya no hay nada que seguir); un estado ausente no cambia la fecha.
 */
export const plazosSeguimiento: Record<string, number | null> = {
  Contactado: 3,
  Respondió: 2,
  'Informe enviado': 4,
  Propuesta: 3,
  Cliente: null,
  Descartado: null,
};

/**
 * Metas y contadores. `periodo` define si se acumula por semana o por mes.
 * Las `auto` se calculan solas desde Ventas y no se registran a mano.
 */
export const metaTypes: readonly { tipo: string; etiqueta: string; periodo: 'semana' | 'mes'; paso: readonly number[]; auto?: boolean }[] = [
  { tipo: 'mensajes', etiqueta: 'Mensajes enviados', periodo: 'semana', paso: [1, 5] },
  { tipo: 'conversaciones', etiqueta: 'Conversaciones (respuestas)', periodo: 'semana', paso: [1] },
  { tipo: 'informes', etiqueta: 'Informes de cortesía', periodo: 'semana', paso: [1] },
  { tipo: 'publicaciones', etiqueta: 'Publicaciones', periodo: 'semana', paso: [1] },
  { tipo: 'ventas', etiqueta: 'Ventas cerradas', periodo: 'mes', paso: [], auto: true },
  { tipo: 'ingresos', etiqueta: 'Ingresos cobrados (USD)', periodo: 'mes', paso: [], auto: true },
];

/**
 * Productos para registrar una venta. Cada uno trae sus cobros sugeridos (se editan después);
 * `dias` es el desfase del vencimiento desde la fecha de la venta. Los precios salen de las ofertas del sitio.
 */
export type Producto = { id: string; nombre: string; cobros: { concepto: string; usd: number; dias: number }[]; ars?: number; /** Se cobra todos los meses hasta dar de baja. */ recurrente?: boolean };
export const productos: readonly Producto[] = [
  { id: 'mini-taller', nombre: 'Mini-taller: informe de rival', ars: 9900, cobros: [{ concepto: 'Pago único', usd: 0, dias: 0 }] },
  { id: 'taller', nombre: 'Taller en vivo: informe de rival', cobros: [{ concepto: 'Pago único', usd: 120, dias: 0 }] },
  { id: 'sesion', nombre: 'Sesión 1:1', cobros: [{ concepto: 'Pago único', usd: 80, dias: 0 }] },
  {
    id: 'sistema',
    nombre: 'Sistema Propio',
    cobros: [
      { concepto: 'Cuota 1 de 3', usd: 590, dias: 0 },
      { concepto: 'Cuota 2 de 3', usd: 450, dias: 28 },
      { concepto: 'Cuota 3 de 3', usd: 450, dias: 56 },
    ],
  },
  {
    id: 'fundadora',
    nombre: 'Sistema Propio · Fundadora',
    cobros: [
      { concepto: 'Cuota 1 de 2', usd: 375, dias: 0 },
      { concepto: 'Cuota 2 de 2', usd: 375, dias: 42 },
    ],
  },
  { id: 'intensivo', nombre: 'Intensivo de pretemporada', cobros: [{ concepto: 'Pago único', usd: 490, dias: 0 }] },
  {
    id: 'pro',
    nombre: 'Sistema Propio Pro',
    cobros: [
      { concepto: 'Cuota 1 de 3', usd: 1000, dias: 0 },
      { concepto: 'Cuota 2 de 3', usd: 950, dias: 42 },
      { concepto: 'Cuota 3 de 3', usd: 950, dias: 84 },
    ],
  },
  {
    id: 'cuerpo-tecnico',
    nombre: 'Cuerpo Técnico',
    cobros: [
      { concepto: 'Cuota 1 de 3', usd: 1000, dias: 0 },
      { concepto: 'Cuota 2 de 3', usd: 700, dias: 28 },
      { concepto: 'Cuota 3 de 3', usd: 700, dias: 56 },
    ],
  },
  { id: 'seguimiento', nombre: 'Plan Seguimiento', recurrente: true, cobros: [{ concepto: 'Mes 1', usd: 220, dias: 0 }] },
  { id: 'integral', nombre: 'Plan Integral', recurrente: true, cobros: [{ concepto: 'Mes 1', usd: 350, dias: 0 }] },
  { id: 'medida', nombre: 'Plan A medida', recurrente: true, cobros: [{ concepto: 'Mes 1', usd: 500, dias: 0 }] },
  { id: 'ebook', nombre: 'Ebook', ars: 29500, cobros: [{ concepto: 'Pago único', usd: 0, dias: 0 }] },
  {
    id: 'herramientas',
    nombre: 'Sistema a medida · Una herramienta',
    cobros: [
      { concepto: 'Anticipo', usd: sistemaPrecios.base / 2, dias: 0 },
      { concepto: 'Entrega', usd: sistemaPrecios.base / 2, dias: 30 },
    ],
  },
  {
    id: 'sistema-completo',
    nombre: 'Sistema a medida · Club completo',
    cobros: [
      { concepto: 'Anticipo', usd: sistemaPrecios.completo / 2, dias: 0 },
      { concepto: 'Entrega parcial', usd: sistemaPrecios.completo / 4, dias: 30 },
      { concepto: 'Entrega final', usd: sistemaPrecios.completo / 4, dias: 60 },
    ],
  },
  { id: 'mantenimiento', nombre: 'Mantenimiento de sistema', recurrente: true, cobros: [{ concepto: 'Mes 1', usd: sistemaPrecios.mantenimiento, dias: 0 }] },
  { id: 'personalizada', nombre: 'Personalizada', cobros: [{ concepto: 'Pago único', usd: 0, dias: 0 }] },
];

export const resources: Record<ResourceKey, Resource> = {
  tareas: {
    key: 'tareas',
    table: 'admin_tareas',
    label: 'Tareas',
    singular: 'tarea',
    pk: 'id',
    order: 'fecha_limite.asc.nullslast,created_at.desc',
    defaults: { estado: 'pendiente', prioridad: 'media' },
    fields: [
      { name: 'titulo', label: 'Tarea', type: 'text', required: true, max: 160, list: true },
      { name: 'estado', label: 'Estado', type: 'select', options: estadosTarea, required: true, list: true },
      { name: 'prioridad', label: 'Prioridad', type: 'select', options: prioridades, required: true, list: true },
      { name: 'fecha_limite', label: 'Fecha límite', type: 'date', list: true },
      { name: 'detalle', label: 'Detalle', type: 'longtext', max: 1500 },
    ],
  },
  contenido: {
    key: 'contenido',
    table: 'admin_contenido',
    label: 'Contenido',
    singular: 'pieza',
    pk: 'id',
    order: 'fecha.asc.nullslast,created_at.desc',
    defaults: { estado: 'idea', canal: 'Instagram', tipo: 'Dato de la semana' },
    fields: [
      { name: 'titulo', label: 'Gancho o título', type: 'text', required: true, max: 200, list: true },
      { name: 'tipo', label: 'Tipo', type: 'select', options: tiposContenido, required: true, list: true },
      { name: 'canal', label: 'Canal', type: 'select', options: canales, required: true },
      { name: 'fecha', label: 'Fecha', type: 'date', list: true },
      { name: 'estado', label: 'Estado', type: 'select', options: estadosContenido, required: true, list: true },
      { name: 'enlace', label: 'Enlace publicado', type: 'url', max: 500 },
      { name: 'vistas', label: 'Vistas o alcance', type: 'number' },
      { name: 'interacciones', label: 'Interacciones (likes, comentarios, guardados)', type: 'number' },
      { name: 'mensajes', label: 'Mensajes o consultas que generó', type: 'number' },
      { name: 'resultado', label: 'Comentario sobre el resultado', type: 'text', max: 300 },
      { name: 'notas', label: 'Notas', type: 'longtext', max: 1500 },
    ],
  },
  contactos: {
    key: 'contactos',
    table: 'admin_contactos',
    label: 'Prospectos',
    singular: 'prospecto',
    pk: 'id',
    order: 'proximo_seguimiento.asc.nullslast,created_at.desc',
    defaults: { estado: 'Por contactar', tipo: 'Club local', canal: 'Instagram' },
    fields: [
      { name: 'nombre', label: 'Nombre', type: 'text', required: true, max: 120, list: true },
      { name: 'organizacion', label: 'Club u organización', type: 'text', max: 120, list: true },
      { name: 'email', label: 'Mail (evita duplicados)', type: 'email', max: 160 },
      { name: 'tipo', label: 'Tipo', type: 'select', options: tiposContacto, required: true },
      { name: 'canal', label: 'Canal', type: 'select', options: canalesContacto, required: true },
      { name: 'estado', label: 'Estado', type: 'select', options: estadosContacto, required: true, list: true },
      { name: 'proximo_seguimiento', label: 'Próximo seguimiento', type: 'date', list: true },
      { name: 'contacto', label: 'Usuario de Instagram o teléfono', type: 'text', max: 160 },
      { name: 'origen', label: 'Cómo llegó', type: 'select', options: origenesContacto },
      { name: 'notas', label: 'Notas', type: 'longtext', max: 1500 },
    ],
  },
  registro: {
    key: 'registro',
    table: 'admin_registro',
    label: 'Registro',
    singular: 'registro',
    pk: 'id',
    order: 'fecha.desc,created_at.desc',
    fields: [
      { name: 'fecha', label: 'Fecha', type: 'date', required: true, list: true },
      { name: 'tipo', label: 'Meta', type: 'select', options: metaTypes.filter((m) => !m.auto).map((m) => m.tipo), required: true, list: true },
      { name: 'cantidad', label: 'Cantidad', type: 'number', required: true, list: true },
      { name: 'nota', label: 'Nota', type: 'text', max: 200 },
    ],
  },
  ventas: {
    key: 'ventas',
    table: 'admin_ventas',
    label: 'Ventas',
    singular: 'venta',
    pk: 'id',
    order: 'fecha.desc,created_at.desc',
    fields: [
      { name: 'cliente', label: 'Cliente', type: 'text', required: true, max: 120, list: true },
      { name: 'producto', label: 'Producto', type: 'text', required: true, max: 120, list: true },
      { name: 'fecha', label: 'Fecha de la venta', type: 'date', required: true, list: true },
      { name: 'origen', label: 'Cómo llegó el cliente', type: 'select', options: origenesContacto, list: true },
      { name: 'contacto_id', label: 'Prospecto', type: 'uuid', hidden: true },
      { name: 'recurrente', label: 'Se renueva cada mes', type: 'bool', hidden: true },
      { name: 'activa', label: 'Activa', type: 'bool', hidden: true },
      { name: 'notas', label: 'Notas', type: 'longtext', max: 1500 },
    ],
  },
  cobros: {
    key: 'cobros',
    table: 'admin_cobros',
    label: 'Cobros',
    singular: 'cobro',
    pk: 'id',
    order: 'vencimiento.asc,created_at.asc',
    fields: [
      { name: 'venta_id', label: 'Venta', type: 'uuid', required: true, hidden: true },
      { name: 'concepto', label: 'Concepto', type: 'text', required: true, max: 120, list: true },
      { name: 'monto_usd', label: 'Monto en USD', type: 'number', required: true, list: true },
      { name: 'monto_ars', label: 'Monto en pesos (si cobraste en ARS)', type: 'number' },
      { name: 'vencimiento', label: 'Vence', type: 'date', required: true, list: true },
      { name: 'cobrado_en', label: 'Cobrado el (vacío si falta cobrar)', type: 'date' },
    ],
  },
  historial: {
    key: 'historial',
    table: 'admin_contacto_log',
    label: 'Historial',
    singular: 'movimiento',
    pk: 'id',
    order: 'created_at.asc',
    readonly: true,
    fields: [
      { name: 'contacto_id', label: 'Prospecto', type: 'uuid', required: true, hidden: true },
      { name: 'tipo', label: 'Tipo', type: 'text' },
      { name: 'estado', label: 'Estado', type: 'text' },
      { name: 'texto', label: 'Texto', type: 'text' },
    ],
  },
  mentorados: {
    key: 'mentorados',
    table: 'admin_mentorados',
    label: 'Mentorados',
    singular: 'mentorado',
    pk: 'id',
    order: 'inicio.desc,created_at.desc',
    defaults: { estado: 'activo', cohorte: 'Estándar' },
    fields: [
      { name: 'nombre', label: 'Nombre y apellido', type: 'text', required: true, max: 120, list: true },
      { name: 'email', label: 'Mail', type: 'email', max: 160 },
      { name: 'perfil', label: 'Perfil', type: 'select', options: perfiles.map((p) => p.label) },
      { name: 'cohorte', label: 'Cohorte', type: 'select', options: cohortes, required: true },
      { name: 'inicio', label: 'Fecha de la primera llamada', type: 'date', required: true, list: true },
      { name: 'estado', label: 'Estado', type: 'select', options: estadosMentorado, required: true, list: true },
      { name: 'equipo', label: 'Equipo y video con los que trabaja', type: 'text', max: 200 },
      { name: 'objetivo', label: 'Resultado que quiere en la semana 12', type: 'longtext', max: 1500 },
      { name: 'trabado', label: 'Dónde está trabado hoy', type: 'text', max: 300 },
      { name: 'control_fecha', label: 'Llamada de control (30 días después)', type: 'date' },
      { name: 'venta_id', label: 'Venta', type: 'uuid', hidden: true },
      { name: 'contacto_id', label: 'Prospecto', type: 'uuid', hidden: true },
      { name: 'notas', label: 'Notas generales', type: 'longtext', max: 1500 },
    ],
  },
  semanas: {
    key: 'semanas',
    table: 'admin_mentorado_semanas',
    label: 'Semanas',
    singular: 'semana',
    pk: 'id',
    order: 'semana.asc',
    fields: [
      { name: 'mentorado_id', label: 'Mentorado', type: 'uuid', required: true, hidden: true },
      { name: 'semana', label: 'Semana', type: 'number', required: true, list: true },
      { name: 'estado', label: 'Estado', type: 'select', options: estadosSemana, required: true, list: true },
      { name: 'fecha_llamada', label: 'Fecha de la llamada', type: 'date', list: true },
      { name: 'hora_llamada', label: 'Hora de la llamada', type: 'text', max: 5 },
      { name: 'cal_uid', label: 'Reserva en Cal.com', type: 'text', hidden: true },
      { name: 'plan', label: 'Plan para esta persona', type: 'longtext', max: 4000 },
      { name: 'notas', label: 'Lo que se vio', type: 'longtext', max: 4000 },
      { name: 'tarea', label: 'Tarea acordada', type: 'text', max: 600 },
      { name: 'entregable_en', label: 'Entregable recibido el', type: 'date' },
      { name: 'devolucion_url', label: 'Enlace a la devolución en video', type: 'url', max: 500 },
    ],
  },
  mensajes: {
    key: 'mensajes',
    table: 'admin_mensajes',
    label: 'Mensajes',
    singular: 'mensaje',
    pk: 'id',
    order: 'orden.asc,created_at.asc',
    defaults: { seguimiento: 'no cambia', paso: 'Por contactar' },
    fields: [
      { name: 'titulo', label: 'Título (solo para vos)', type: 'text', required: true, max: 160, list: true },
      { name: 'paso', label: 'Se usa cuando el prospecto está en', type: 'select', options: pasos, required: true, list: true },
      { name: 'tipos', label: 'Solo para estos tipos de prospecto (separados por coma; vacío = todos)', type: 'text', max: 200 },
      { name: 'origenes', label: 'Solo si llegó por (separados por coma; vacío = todos)', type: 'text', max: 200 },
      { name: 'texto', label: 'Mensaje', type: 'longtext', required: true, max: 3000 },
      { name: 'avanza', label: 'Al marcarlo como enviado, pasa a', type: 'select', options: ['', ...pasos] },
      { name: 'seguimiento', label: 'Seguimiento al marcarlo como enviado', type: 'select', options: ['no cambia', 'en días', 'quitar'], required: true },
      { name: 'dias', label: 'Días hasta el seguimiento (si elegiste "en días")', type: 'number' },
      { name: 'orden', label: 'Orden dentro del paso (menor = primero)', type: 'number', required: true },
    ],
  },
  programa: {
    key: 'programa',
    table: 'admin_programa',
    label: 'Programa',
    singular: 'semana del programa',
    pk: 'id',
    order: 'semana.asc',
    fields: [
      { name: 'semana', label: 'Semana', type: 'number', required: true, list: true },
      { name: 'titulo', label: 'Título', type: 'text', required: true, max: 160, list: true },
      { name: 'tipo', label: 'Tipo de clase', type: 'select', options: tiposClase, required: true, list: true },
      { name: 'objetivo', label: 'Objetivo', type: 'longtext', max: 600 },
      { name: 'antes', label: 'Antes de la llamada (uno por renglón)', type: 'longtext', max: 1200 },
      { name: 'llamada', label: 'En la llamada de 45 min (uno por renglón)', type: 'longtext', max: 1200 },
      { name: 'tarea', label: 'Tarea de la semana', type: 'longtext', max: 600 },
      { name: 'entregable', label: 'Entregable', type: 'text', max: 200 },
      { name: 'devolucion', label: 'Qué mirar en la devolución (uno por renglón)', type: 'longtext', max: 1200 },
      { name: 'herramientas', label: 'Herramientas y material (uno por renglón)', type: 'longtext', max: 800 },
      { name: 'avanza', label: 'Para pasar a la semana siguiente', type: 'longtext', max: 400 },
      ...perfiles.map((p) => ({ name: `var_${p.id}`, label: `Variante: ${p.label}`, type: 'longtext' as const, max: 600 })),
    ],
  },
  reservas: {
    key: 'reservas',
    table: 'admin_reservas',
    label: 'Reservas',
    singular: 'reserva',
    pk: 'id',
    order: 'inicio.desc',
    readonly: true,
    fields: [
      { name: 'evento', label: 'Evento', type: 'text' },
      { name: 'nombre', label: 'Nombre', type: 'text' },
      { name: 'email', label: 'Mail', type: 'text' },
      { name: 'estado', label: 'Estado', type: 'text' },
    ],
  },
  enlaces: {
    key: 'enlaces',
    table: 'admin_mentorado_links',
    label: 'Enlaces',
    singular: 'enlace',
    pk: 'id',
    order: 'created_at.desc',
    defaults: { tipo: 'Entregable' },
    fields: [
      { name: 'mentorado_id', label: 'Mentorado', type: 'uuid', required: true, hidden: true },
      { name: 'semana', label: 'Semana', type: 'number' },
      { name: 'titulo', label: 'Título', type: 'text', required: true, max: 160, list: true },
      { name: 'url', label: 'Enlace', type: 'url', required: true, max: 500 },
      { name: 'tipo', label: 'Tipo', type: 'select', options: tiposEnlace, required: true, list: true },
    ],
  },
  metas: {
    key: 'metas',
    table: 'admin_metas',
    label: 'Metas',
    singular: 'meta',
    pk: 'tipo',
    order: 'tipo.asc',
    fields: [
      { name: 'objetivo', label: 'Objetivo', type: 'number', required: true },
      { name: 'periodo', label: 'Período', type: 'select', options: ['semana', 'mes'], required: true },
    ],
  },
};

/** Contactos que entran por los formularios de la web. Cada origen es una tabla de Supabase. */
export type EntranteOrigen = 'diagnosticos' | 'aplicaciones' | 'solicitudes_equipos' | 'plantillas_leads' | 'clips';

export const entrantes: Record<EntranteOrigen, { label: string; estados: readonly string[] }> = {
  aplicaciones: { label: 'Aplicación a la mentoría', estados: ['nueva', 'llamada', 'propuesta', 'cerrada', 'descartada'] },
  solicitudes_equipos: { label: 'Consulta de equipos', estados: ['nueva', 'llamada', 'propuesta', 'cerrada', 'descartada'] },
  clips: { label: 'Clip', estados: ['recibido', 'elegido', 'publicado', 'descartado'] },
  diagnosticos: { label: 'Diagnóstico', estados: ['nuevo', 'contactado', 'descartado'] },
  plantillas_leads: { label: 'Plantilla o aviso', estados: ['nuevo', 'contactado', 'descartado'] },
};
