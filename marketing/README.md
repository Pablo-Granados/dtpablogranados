# Marketing: plan de contenido de 14 semanas

Todo lo que necesitás para publicar en Instagram (feed, historias y reels) y YouTube del **26/10/2026 al 31/1/2027**, con tu marca y listo para copiar y pegar.

## Por dónde empezar

1. Leé **`01-estrategia.md`** (10 minutos): a quién le hablás, los 4 pilares, el ritmo y cómo producirlo con 2 a 3 horas por día.
2. Abrí **`calendario/semana-01.md`**: ahí está todo lo de la primera semana, pieza por pieza.
3. Mirá las imágenes en **`piezas/semana-01/`**: ya están hechas.
4. Importá el calendario al panel (ver más abajo).

## Qué hay en la carpeta

| Archivo o carpeta | Qué contiene |
|---|---|
| `01-estrategia.md` | Objetivos, público, voz, pilares, fases, ritmo, producción y plan B de la cohorte |
| `02-guia-de-marca.md` | Colores, tipografías, formatos, diseños, voz y accesibilidad |
| `03-banco-de-textos.md` | Bio, destacados, estructura de captions, llamados a la acción, respuestas por palabra clave y a comentarios, 17 preguntas para historias |
| `04-youtube.md` | Cómo aprovechar el canal, ideas de videos y plantilla de descripción |
| `05-metricas-y-ajustes.md` | Qué medir, etiquetas en los links, revisión semanal y reglas de decisión |
| `calendario/semana-01.md` … `semana-14.md` | El plan completo de cada semana |
| `calendario/resumen.md` | Las 14 semanas en una tabla y las palabras clave |
| `calendario/calendario-panel.csv` | Las 56 piezas para importar en el panel |
| `piezas/` | Las 291 imágenes (diapositivas de feed 1080×1350, historias y portadas de reel 1080×1920). No se suben a git: se generan en tu computadora |
| `plantillas/` | Diseño de las piezas (`diseno.mjs`), las fuentes y ejemplos en `muestras/` |
| `herramientas/` | Los datos del plan y los programas que generan los documentos y las imágenes |

## Qué trae cada semana

- **3 publicaciones de feed** (lunes, miércoles y viernes) y **1 reel** (jueves).
- Por cada una: objetivo, gancho, llamado a la acción, **diapositiva por diapositiva**, **caption lista para pegar**, hashtags, **texto alternativo** (de cada imagen y general), tip de producción y los archivos de imagen.
- Para los reels: el **guion** con tiempos, voz en off y qué se ve en pantalla.
- **Historias** de lunes a viernes, con stickers, enlaces y texto alternativo.

## Importar el calendario en el panel

1. En el panel, andá a **Contenido → Calendario**.
2. Tocá **Importar calendario (CSV)** y elegí `marketing/calendario/calendario-panel.csv`.
3. Quedan las 56 piezas con su fecha, estado "guion" y el gancho. Si lo importás dos veces, no se duplican.

Los resultados de cada pieza los cargás cada viernes en **Cargar resultados de la semana**.

## Cambiar algo y volver a generar

Necesitás tener **Microsoft Edge o Google Chrome** instalado (el programa lo usa sin abrir ventanas).

```bash
# Editar los textos: marketing/herramientas/datos/semanas-XX-XX.mjs

npm run marketing:docs                           # regenera los documentos y el CSV
npm run marketing:render                         # genera las imágenes que falten
npm run marketing:render -- --semana 3 --forzar  # regenera una semana completa
npm run marketing:render -- --pieza s03-f1 --forzar   # regenera una sola pieza
```

Para cambiar el **estilo** de todas las imágenes (colores, tamaños, esquinas) editá `plantillas/diseno.mjs` y regenerá con `--forzar`.

## Cosas para decidir o confirmar antes de publicar

- **Piezas condicionales:** la de la semana 6 ("Hoy arranca la cohorte") solo se publica si hay inscriptos. Está marcada con ⚠️ y trae su alternativa.
- **Capturas de LAA Sports:** muestran fotos de atletas. Pedí el visto bueno de la agencia antes de publicarlas.
- **Promesas sin confirmar:** el plan no menciona "si no cierra, no pagás nada", la migración de planillas ni la exportación de datos del club. No las agregues hasta confirmarlas.
- **Fechas y precios:** salen de la web hoy (Sistema Propio, cohorte del 2/12, planes de USD 220/350/desde 500, sesión de USD 80, mantenimiento de USD 150). Si cambian, actualizá los textos.
- **Horarios:** son una hipótesis. Ajustalos con **Instagram → Estadísticas → Audiencia**.
