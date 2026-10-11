/**
 * Esquema del panel privado (/admin). Lo usan la API (para validar) y la pantalla (para armar
 * tablas y formularios). Para sumar un módulo o un campo: se agrega acá y en supabase/admin.sql.
 */

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

export type ResourceKey = 'tareas' | 'contenido' | 'contactos' | 'registro' | 'metas' | 'ventas' | 'cobros' | 'historial';

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
export const origenesContacto = ['Instagram', 'YouTube', 'Diagnóstico', 'Plantillas', 'Formulario web', 'Red personal', 'Recomendación', 'Otro'] as const;

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
  { id: 'sesion', nombre: 'Sesión 1:1', cobros: [{ concepto: 'Pago único', usd: 80, dias: 0 }] },
  {
    id: 'sistema',
    nombre: 'Sistema Propio',
    cobros: [
      { concepto: 'Cuota 1 de 3', usd: 250, dias: 0 },
      { concepto: 'Cuota 2 de 3', usd: 250, dias: 42 },
      { concepto: 'Cuota 3 de 3', usd: 190, dias: 84 },
    ],
  },
  {
    id: 'fundadora',
    nombre: 'Sistema Propio · Fundadora',
    cobros: [
      { concepto: 'Cuota 1 de 2', usd: 175, dias: 0 },
      { concepto: 'Cuota 2 de 2', usd: 175, dias: 42 },
    ],
  },
  { id: 'seguimiento', nombre: 'Plan Seguimiento', recurrente: true, cobros: [{ concepto: 'Mes 1', usd: 220, dias: 0 }] },
  { id: 'integral', nombre: 'Plan Integral', recurrente: true, cobros: [{ concepto: 'Mes 1', usd: 350, dias: 0 }] },
  { id: 'medida', nombre: 'Plan A medida', recurrente: true, cobros: [{ concepto: 'Mes 1', usd: 500, dias: 0 }] },
  { id: 'ebook', nombre: 'Ebook', ars: 29500, cobros: [{ concepto: 'Pago único', usd: 0, dias: 0 }] },
  { id: 'herramientas', nombre: 'Herramientas a medida', cobros: [{ concepto: 'Pago único', usd: 1200, dias: 0 }] },
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
