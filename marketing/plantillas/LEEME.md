# Plantillas visuales

`diseno.mjs` define cómo se ve cada tipo de pieza. Las tres fuentes de la marca están en `fuentes/` (Archivo, Inter y JetBrains Mono) y los ejemplos ya hechos en `muestras/`.

## Los diseños disponibles

**Feed (1080 × 1350):** `portada`, `punto`, `lista`, `dato`, `cita`, `captura`, `cta`.
**Historias (1080 × 1920):** `texto`, `lista`, `encuesta`, `pregunta`, `cuenta`, `captura`, `cta`.
**Portada de reel (1080 × 1920):** una sola.

## Cómo usarlos

- **Con el programa:** editá los textos en `../herramientas/datos/` y corré `npm run marketing:render`.
- **A mano en Canva o Figma:** tamaño personalizado, las fuentes y colores de `../02-guia-de-marca.md`, y copiá la estructura de las muestras.

## Cómo agregar un diseño nuevo

1. En `diseno.mjs`, sumá una función en `feed` o `historia` que devuelva el HTML de la pieza.
2. Usá el nuevo nombre como primer valor de una diapositiva en los datos (por ejemplo `['mi-diseno', { ... }]`).
3. Corré `npm run marketing:render -- --pieza s01-f1 --forzar` para probarlo.
