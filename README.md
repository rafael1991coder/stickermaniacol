# StickerManiaCol — primer borrador

Tienda estática en español, adaptable a celulares y lista para GitHub Pages. No requiere instalación ni compilación.

Sitio publicado: https://rafael1991coder.github.io/stickermaniacol/

## Abrir localmente

Con Node.js instalado, ejecuta `node server.cjs` y abre http://localhost:4173. Tienda: `/index.html`. Administración: `/admin.html`.

## Funciones

- Logo y favicon con el mismo símbolo de sticker, generados con IA; fuentes del arte en assets/logo-prompt.txt.
- Selector aleatorio de todo el catálogo: animación de aproximadamente cuatro segundos, ganador equiprobable, detalles, selección de material y agregado al carrito. Respeta la preferencia de movimiento reducido.

- Búsqueda de diseños y filtros por material.
- Precios independientes para holográfico, papel y plástico blanco, en COP.
- Bolsa con cantidades, materiales, notas y total; abre WhatsApp al **+57 312 661 1414** con el resumen. El visitante envía el mensaje desde WhatsApp.
- Administración separada: alta, edición y eliminación, enlaces HTTPS de imágenes, carga por múltiples enlaces, tabla editable y CSV.
- Importación y exportación del catálogo JSON. Los materiales sin precio no se ofrecen.
- Datos de muestra claramente identificados. Reemplázalos por diseños y precios reales antes del lanzamiento.

## Publicar en GitHub Pages

1. Sube `index.html`, `admin.html`, `styles.css`, `app.js`, `surprise.js`, `catalog.json`, `.nojekyll` y la carpeta `assets/` a un repositorio.
2. En Settings → Pages, selecciona Deploy from a branch y la carpeta raíz de tu rama.
3. En la administración, elimina los ejemplos y agrega tus diseños. Exporta el catálogo.
4. Reemplaza `catalog.json` en el repositorio con el archivo exportado y confirma el cambio. Los visitantes nuevos verán el catálogo publicado.

Los cambios del administrador se guardan únicamente en localStorage del navegador y origen donde se editaron. **No se sincronizan ni publican automáticamente.** Ese navegador seguirá mostrando su catálogo local hasta usar “Volver al catálogo publicado”. No borres sus datos sin exportar un respaldo. El archivo inicial incluye ocho ejemplos; un catálogo publicado vacío se mantiene vacío.

`admin.html` es una interfaz local sin autenticación. No contiene claves, datos privados ni acceso de escritura al repositorio. No equivale a un panel administrativo protegido. Para una tienda final con edición centralizada, hace falta integrar autenticación y una base de datos o servicio de catálogo. No pongas tokens ni contraseñas en estos archivos.

Las imágenes deben ser URLs HTTPS públicas y directas. Su disponibilidad depende de su proveedor. No se cargan los archivos de imagen al catálogo; solo se guardan URLs. Las imágenes se cargan de forma diferida. Las tipografías usan Google Fonts con fuentes de sistema como respaldo.

## CSV de carga masiva

Usa UTF-8, delimitador coma y encabezado exacto:

```csv
nombre,imagen,descripcion,holografico,papel,plastico
Flor,https://ejemplo.com/flor.png,Una flor para tu agenda,5000,2500,3500
Rayo,https://ejemplo.com/rayo.png,Energía bonita,5500,,4000
```

Precios enteros, sin símbolo de moneda ni separadores. Puedes entrecomillar textos con comas. La importación prepara filas para revisar; “Guardar todos” valida el lote completo antes de incorporarlo.

## Comprobación

`node --check app.js` y `node tests.cjs` verifican sintaxis, validación del catálogo e importación CSV. No hay pagos en línea; envío, existencias y pago se confirman por WhatsApp.


## Acceso administrativo privado

admin.html redirige a la aplicación de Google Apps Script, restringida a la cuenta personal del propietario. Allí se comprueban el usuario y la contraseña antes de entregar el panel. El verificador se guarda en un archivo privado de Drive; no hay credenciales ni verificadores en este repositorio. Diez intentos fallidos bloquean el acceso durante quince minutos.

Al recargar o usar Cerrar sesión se vuelve a pedir el usuario y la contraseña. El catálogo conserva el flujo de edición local, exportación y publicación manual del JSON; autenticarse no sincroniza automáticamente los cambios con GitHub.
