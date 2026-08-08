# DT Pablo Granados — Landing Page

Página simple en HTML/CSS/JS puro + Tailwind (CDN). Sin build, sin instalar nada.

## Estructura

```
index.html          → toda la maquetación de la página
css/style.css        → estilos propios (colores, animaciones, tarjetas)
js/config.js          → ⭐ ACÁ EDITÁS VOS: ebook, primera generación, qué secciones se muestran y en qué orden
js/main.js             → la lógica (scroll, acordeón, carrusel, render de config.js)
favicon.png
```

## Cómo editar contenido (sin tocar código)

Abrí `js/config.js`. Ahí están, con comentarios:

1. **`secciones`** → `visible: true/false` prende o apaga cada bloque, y `orden` define en qué posición aparece.
2. **`ebook`** → título, precio, bullets y el `checkoutUrl` de Hotmart (**hoy tiene un placeholder, reemplazalo cuando tengas el link real**).
3. **`primeraGeneracion`** → lista de compradores. Copiás un bloque `{ nombre: "...", dato: "..." }` por cada persona nueva.

Guardás el archivo y ya está — no hace falta build ni deploy especial más que subir los archivos.

## Cómo probarla en tu compu

Simplemente abrí `index.html` con doble click, o si querés levantar un servidor local:

```
npx serve .
```

## Deploy

Es un sitio 100% estático. Se puede subir tal cual a Vercel, Netlify o GitHub Pages — no requiere configurar build command ni output directory (o dejalos vacíos si el proveedor los pide).

## Pendiente

- [ ] Reemplazar `checkoutUrl` en `config.js` por el link real de Hotmart
- [ ] Cargar los compradores reales en `primeraGeneracion`
- [ ] (Opcional) reemplazar `img/ebook-cover.png` por la tapa real del ebook