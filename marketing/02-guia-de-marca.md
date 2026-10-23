# Guía de marca para redes

Todo sale de la web (`src/styles/global.css`): el concepto es **"sala de análisis"**: oscuro, editorial, técnico. Nada de gradientes de agencia, stock ni emojis decorativos.

## 1. Colores

| Uso | Color | Código |
|---|---|---|
| Fondo | Tinta | `#0b0d10` |
| Superficies | Panel | `#12151a` |
| Líneas y grilla | Línea | `#262b33` |
| Texto principal | Hueso | `#edebe6` |
| Texto secundario | Gris | `#9aa0a8` |
| Texto terciario | Gris tenue | `#6b717a` |
| **Acento (uno solo)** | **Cian** | **`#00f2ff`** |

El cian es **la marca del analista**: se usa para lo que se anota, se marca o se destaca (kicker, números, barra, botón, una palabra o el punto final). Nunca más de un acento por pieza.

## 2. Tipografías (gratis en Google Fonts y en Canva)

| Uso | Fuente | Estilo |
|---|---|---|
| Títulos | **Archivo**, condensada (ancho 75) | Extrabold, mayúsculas, interlineado 0,95 |
| Texto | **Inter** | Regular, interlineado 1,35 a 1,4 |
| Etiquetas y datos | **JetBrains Mono** | Semibold, mayúsculas, espaciado amplio |

## 3. Elementos de diseño

- **Grilla de cancha:** líneas muy sutiles cada 90 px sobre el fondo.
- **Esquinas de encuadre:** dos ángulos cian (arriba a la derecha y abajo a la izquierda), como la marca de un cuadro de video.
- **Barra cian:** 150 × 10 px sobre el título en portadas y cierres.
- **Brillo:** un resplandor cian apenas visible arriba a la derecha.
- **Pie:** logo redondo + `@dtpablogranados` y el contador de diapositivas (`02 / 07`).
- **Logo:** `public/media/dtpablogranados.png` (círculo con el DT). No lo deformes ni le cambies el color.

## 3 bis. Fotos

La foto de la marca es `public/media/hero-pizarra.jpg`: vos con la pizarra táctica. Si la usás, **difuminá los bordes** hacia el fondo, como en la web. No uses fotos de stock. Las capturas de pantalla de Futsal Hub y de los sitios van con un borde fino gris, sobre fondo panel.

## 4. Formatos y tamaños

| Pieza | Tamaño | Notas |
|---|---|---|
| **Feed** (carrusel o imagen) | **1080 × 1350 px** (4:5) | Es el formato que más pantalla ocupa |
| **Historias** | **1080 × 1920 px** (9:16) | Dejá libres 250 px arriba y 340 px abajo |
| **Portada de reel** | **1080 × 1920 px** (9:16) | El centro 1080 × 1440 es lo que se ve en la grilla del perfil |
| **Reel** | 1080 × 1920 px, 20 a 60 segundos | Subtítulos grandes dentro del video |

## 5. Los diseños (plantillas)

**Feed:** `portada`, `punto` (número + título + texto), `lista`, `dato` (cifra grande), `cita` (frase), `captura` (pantalla con marco) y `cta` (cierre con botón).

**Historias:** `texto`, `lista`, `encuesta` y `pregunta` (con espacio para el sticker), `cuenta` (fecha grande), `captura` y `cta`.

Para ver todos en acción mirá las carpetas de `marketing/piezas/` o los ejemplos de `marketing/plantillas/muestras/`.

## 6. Reglas para el texto dentro de la imagen

- **Un título de menos de 8 palabras** y un texto de menos de 25.
- **Una idea por diapositiva.**
- **Tamaño mínimo:** 40 px en feed; 48 px en historias.
- **Contraste alto:** texto hueso sobre fondo tinta. No pongas texto gris sobre la imagen.
- **La última diapositiva siempre cierra** con un llamado a la acción (guardar, comentar, link en la bio o una palabra clave).

## 7. Voz: ejemplos

| Sí | No |
|---|---|
| "Mirar un partido sin preguntas es mirar 90 minutos sin saber qué buscás." | "El secreto que los grandes entrenadores no quieren que sepas." |
| "Guardalo y probalo en tu próximo partido." | "¡Aprovechá esta oferta única!" |
| "Un dato que no cambia una decisión es decoración." | "Datos increíbles que te van a volar la cabeza." |
| "Si querés que te cuente más, escribime CLUB." | "Contactame YA por privado." |

## 8. Accesibilidad

- **Texto alternativo en cada imagen.** El plan lo trae listo en cada documento semanal. En Instagram: al subir la imagen → "Opciones avanzadas" → "Texto alternativo".
- **Subtítulos** en todos los reels (la mayoría se mira sin sonido).
- **Contraste** y tamaño de letra grandes.

## 9. Cómo cambiar el diseño

- **Textos:** editá `marketing/herramientas/datos/semanas-XX-XX.mjs` y corré `npm run marketing:render -- --semana 3 --forzar`.
- **Estilo (colores, tamaños, esquinas):** editá `marketing/plantillas/diseno.mjs` y volvé a generar.
- **En Canva:** creá un tamaño personalizado (1080 × 1350 o 1080 × 1920), cargá las tres fuentes y los colores de arriba, y copiá la estructura de las muestras.
