/**
 * Contenido del "Mapa de observación" (futsal).
 * Es el criterio de Pablo: editar acá y volver a correr `npm run mapa` para regenerar los archivos.
 */

export const meta = {
  titulo: 'Mapa de observación',
  subtitulo: 'Qué mirar antes de abrir el video',
  autor: 'Pablo Granados',
  web: 'dtpablogranados.vercel.app',
  version: 'Versión 1',
};

export const intro = [
  'Un análisis sin pregunta es una colección de clips. Este mapa ordena lo que mirás en cada partido para que el video responda algo concreto.',
  'Está escrito con ejemplos de futsal. Sirve igual para fútbol: cambian las estructuras (líneas, espacios, tiempos de juego), no las preguntas.',
];

export const pasos = [
  'Elegí 2 fases para el partido. No mires todo: priorizá lo que tu equipo está trabajando esta semana.',
  'Dentro de cada fase, quedate con 1 o 2 principios. Cada uno trae una pregunta y qué buscar en el video.',
  'Mirá el partido con esas preguntas y marcá en la hoja si se cumple, se cumple a medias o no se cumple. Anotá el minuto.',
  'Cerrá con una sola decisión: qué se entrena el martes. Si no hay decisión, el análisis no terminó.',
];

/** fase → principios. Cada principio: nombre, pregunta, qué buscar, indicador de ejemplo. */
export const fases = [
  {
    nombre: 'Ataque organizado',
    principios: [
      {
        nombre: 'Ocupación de espacios',
        pregunta: '¿La estructura ofrece líneas de pase y ocupa ambos lados de la cancha?',
        buscar: 'Distancias entre jugadores, dos jugadores en el mismo carril, pivote fijo o móvil, quién da la profundidad.',
        indicador: '% de posesiones que llegan al último tercio.',
      },
      {
        nombre: 'Circulación',
        pregunta: '¿Mueve la pelota para desordenar al rival o la juega hacia adelante sin ventaja?',
        buscar: 'Cambios de lado, uso del pase atrás, paciencia ante la presión, pérdidas por apuro.',
        indicador: 'Pases por posesión antes del remate.',
      },
      {
        nombre: 'Finalización',
        pregunta: '¿Qué situaciones generan los remates y desde dónde?',
        buscar: 'Jugada previa al remate, zona de remate, remates tras 1v1, tras pared o tras segunda jugada.',
        indicador: 'Remates por posesión y zona de remate.',
      },
    ],
  },
  {
    nombre: 'Defensa organizada',
    principios: [
      {
        nombre: 'Presión',
        pregunta: '¿Dónde presiona el equipo y qué dispara la presión?',
        buscar: 'Altura de la línea de presión, presión zonal o individual, quién sale primero, señal para salir.',
        indicador: 'Recuperaciones en campo rival.',
      },
      {
        nombre: 'Cobertura y equilibrio',
        pregunta: '¿Hay cobertura al que presiona? ¿Qué espacios deja libres?',
        buscar: 'Distancia entre presionante y cobertura, espalda del pivote, pase interior que rompe la presión.',
        indicador: 'Remates recibidos desde la zona central.',
      },
      {
        nombre: 'Faltas y acumuladas',
        pregunta: '¿Cómo se gestionan las faltas? ¿Llega al límite del tiempo con margen?',
        buscar: 'Faltas por tiempo, quién las comete, cuándo se llega a la quinta, faltas tácticas vs. por llegar tarde.',
        indicador: 'Faltas por tiempo y minuto en que llega a la quinta.',
      },
    ],
  },
  {
    nombre: 'Transición ofensiva',
    principios: [
      {
        nombre: 'Primer pase',
        pregunta: '¿Qué hace el equipo en los 3 segundos posteriores a recuperar?',
        buscar: 'Quién juega primero, hacia dónde, si busca al pivote, al lateral o al arquero.',
        indicador: '% de recuperaciones que terminan en ataque directo.',
      },
      {
        nombre: 'Velocidad y número',
        pregunta: '¿Cuántos jugadores se suman y a qué velocidad llegan al remate?',
        buscar: 'Carriles ocupados, apoyos en profundidad, segundos entre recuperar y rematar.',
        indicador: 'Ataques que terminan en remate dentro de 10 segundos.',
      },
      {
        nombre: 'Elección: contra o pausa',
        pregunta: '¿Elige bien entre contragolpear y asegurar la posesión?',
        buscar: 'Contraataques sin superioridad numérica, pérdidas inmediatas después de recuperar.',
        indicador: 'Pérdidas dentro de los 5 segundos posteriores a recuperar.',
      },
    ],
  },
  {
    nombre: 'Transición defensiva',
    principios: [
      {
        nombre: 'Reacción inmediata',
        pregunta: '¿Presiona la pelota al perderla o se repliega? ¿En cuántos segundos se reorganiza?',
        buscar: 'Quién reacciona primero, si hay un criterio común, si el equipo queda partido.',
        indicador: 'Segundos hasta recuperar o hasta tener la estructura formada.',
      },
      {
        nombre: 'Protección del centro y del arco',
        pregunta: '¿Dónde se pierde la pelota y qué espacio queda desprotegido?',
        buscar: 'Zona de pérdidas, jugadores por detrás de la pelota, cobertura del carril central.',
        indicador: 'Mapa de zonas de pérdida y remates recibidos tras pérdida.',
      },
      {
        nombre: 'Cuando falla',
        pregunta: '¿Cómo corrige el equipo cuando la reacción llega tarde?',
        buscar: 'Faltas tácticas, retroceso del arquero, 1v1 que deja el equipo en inferioridad.',
        indicador: 'Faltas tácticas y ocasiones concedidas en transición.',
      },
    ],
  },
  {
    nombre: 'Pelota parada',
    principios: [
      {
        nombre: 'Saque de banda',
        pregunta: '¿Hay rutinas definidas? ¿Cuántas variantes tiene y cuál usa en cada zona?',
        buscar: 'Quién saca, jugadores que se mueven antes, variante repetida, cómo defiende el saque rival.',
        indicador: 'Saques con continuidad vs. pérdidas inmediatas.',
      },
      {
        nombre: 'Córner',
        pregunta: '¿Cuál es la estructura ofensiva y defensiva? ¿Qué jugadas se repiten?',
        buscar: 'Ejecutor, bloqueos, uso de zonas, marca zonal o individual, quién queda en transición.',
        indicador: 'Remates y goles por córner a favor y en contra.',
      },
      {
        nombre: 'Tiro libre y faltas laterales',
        pregunta: '¿Hay ejecución preparada o improvisada? ¿Cómo se defiende la barrera?',
        buscar: 'Ejecutor, distribución en la cancha, diferencia entre tiro directo e indirecto, rebote.',
        indicador: 'Remates por tiro libre y calidad del rebote.',
      },
    ],
  },
  {
    nombre: 'Situaciones especiales',
    principios: [
      {
        nombre: 'Portero-jugador',
        pregunta: '¿Cuándo y cómo juega con quinto jugador de campo? ¿Qué riesgo asume?',
        buscar: 'Cuándo lo activa, estructura elegida, rotaciones, pérdidas que terminan en gol a arco vacío.',
        indicador: 'Remates a favor y goles en contra durante el portero-jugador.',
      },
      {
        nombre: 'Superioridad e inferioridad',
        pregunta: '¿Cómo se organiza con un jugador más o uno menos?',
        buscar: 'Estructura, tiempo de posesión, riesgos asumidos, cómo se gestionan los 2 minutos.',
        indicador: 'Goles a favor y en contra por cada período con distinto número.',
      },
      {
        nombre: 'Gestión del partido',
        pregunta: '¿Cómo usa el equipo los tiempos muertos, los cambios y los últimos minutos?',
        buscar: 'Momento del tiempo muerto, cambios con intención, ajustes entre tiempos.',
        indicador: 'Resultado y juego antes y después de cada decisión de banco.',
      },
    ],
  },
];

/** Ejemplo ilustrativo: así se ve una fase ya observada. Los números son inventados a propósito. */
export const ejemplo = {
  contexto: 'Ejemplo ilustrativo (los datos no son de un partido real).',
  fase: 'Transición defensiva',
  filas: [
    { principio: 'Reacción inmediata', se: 'No se cumple', evidencia: '12\' 40" · 18\' 05" · 31\' 10"', nota: 'Tres pérdidas en zona media: el pivote queda lejos de la pelota y el cierre llega tarde.' },
    { principio: 'Protección del centro y del arco', se: 'Parcial', evidencia: '12\' 40" · 31\' 10"', nota: 'El carril central queda libre cuando pierde el ala derecha.' },
  ],
  decision: 'Entrenar el martes: pérdida en zona media con 4 jugadores. Objetivo: que el más cercano presione y los otros 3 cierren el centro en menos de 3 segundos.',
};

export const cierre = {
  siguiente: 'Hay tres plantillas más, gratis: panel de codificación, ficha de partido y checklist semanal.',
  texto: 'Están en la web. Y si querés trabajar este mapa con tu propio equipo, con devolución sobre tus partidos, eso es lo que hacemos en Sistema Propio: dtpablogranados.vercel.app/mentoria',
  url: 'dtpablogranados.vercel.app/plantillas',
};
