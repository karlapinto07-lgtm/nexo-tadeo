# NexoTadeo · v4

Red de gestión de conocimiento de Diseño Industrial (Utadeo). Sitio estático: HTML, CSS y JavaScript sin compilación, listo para **GitHub Pages**.

## Archivos
| Archivo | Para qué |
|---|---|
| `index.html` | Estructura de todas las pantallas (inicio de sesión, registro, red, proyectos, equipos, board, perfil, Cabito). |
| `style.css` | Sistema de diseño (tokens al inicio del archivo) y estilos. |
| `script.js` | Toda la lógica. Incluye una copia de `data.json` para que funcione aunque se abra sin servidor. |
| `data.json` | Nichos, áreas, sectores, perfiles, proyectos y equipos semilla. **Edita aquí los datos.** |
| `assets/logo-nexotadeo.png` | Logo (es también el botón de inicio). |
| `assets/avatars/av01…av28.png` | Avatares ilustrados para el registro. |
| `assets/fonts/` | Pon aquí `Ruddy.woff2` (y/o `Ruddy.otf`) con su licencia; el título de acceso la usa automáticamente. |

## Publicar en GitHub Pages
1. Sube todos los archivos y la carpeta `assets/` a la raíz del repositorio.
2. *Settings → Pages → Deploy from a branch → main / root*.
3. Si cambias `data.json`, también se recomienda regenerar la copia dentro de `script.js` (o simplemente publicar en GitHub Pages, que siempre lee `data.json`).

## Cuentas de prueba
Cualquier perfil semilla entra con su correo o nombre completo y la clave `nexo2026` (campo `meta.claveDemo` de `data.json`). Ejemplo: `luisa.hernandez@utadeo.edu.co`.

## Qué hay en esta versión
- **Inicio de sesión** como primera pantalla, con «Unirme a la red» y opción de explorar sin cuenta.
- **Registro en una página**: datos, campo y áreas, aptitudes únicas, avatar (28 personajes + color del hexágono con selector claro que solo abre con «+», o foto), historia del avatar y proyectos propios con las personas de la red que participaron y cómo.
- **Barra superior** con el logo como botón de inicio, Red, Proyectos, Equipos, Mi board, buscador, Crear un equipo, Crear un proyecto, notificaciones y cuenta. Fondo de puntos.
- **Red**: panales separados por nicho, con hexágonos de proyectos publicados y un «+» por nicho. Al publicar un proyecto el panal crece. Líneas de conexión finas. Pestaña lateral de **equipos públicos**.
- **Crear un equipo**: filtros por habilidades, rubro, lo que han hecho y rol; tarjetas para arrastrar al board; «lo que tienen en común», «en qué se complementan»; al formar el equipo cada persona recibe la invitación «X quiere que te unas a su equipo». Equipos públicos y Mis equipos.
- **Proyectos**: como antes, más **Unirme a un proyecto** (los abiertos a nuevo talento, roles que buscan, fecha de cierre y botón Postularme). El gestor de proyecto permite marcar el proyecto como abierto y elegir a quién busca.
- **Perfil = marca personal**: portada, avatar/foto en hexágono, productos con fotos (ver, me gusta, guardar), proyectos con el rol de la persona, portafolio, aptitudes, historia del avatar, trayectoria y con quién ha trabajado.
- **Mi board**: post-its, stickers, textos, imágenes, enlaces y elementos guardados de la red; se arrastran (o se mueven con flechas) y se borran con Suprimir.
- **Cabito · Ayuda** (botón grande abajo a la derecha): Conoce la red, Pregúntale (preguntas frecuentes con accesos directos) y Comentarios para los desarrolladores.
- **Crear un proyecto** (barra superior): el asistente de Cabito de siempre (sector → idea → equipo sugerido → brief en PDF).

## Limitaciones del prototipo
- No hay servidor: cuentas, proyectos, equipos, notificaciones, board y comentarios se guardan en el **navegador** (`localStorage`). Otra persona en otro computador no los verá.
- Los comentarios a desarrolladores se guardan en el navegador; si llenas `meta.correoComentarios` en `data.json`, además se abre un correo prellenado para enviarlos.
- Recuperar contraseña no envía correos.
- Las fotos de los perfiles semilla vienen de Unsplash (internet). Los avatares se recortaron de una captura; para la versión final conviene reemplazarlos por los archivos originales en alta resolución (mismo nombre).

## Accesibilidad
Contraste AAA en textos principales, foco visible, navegación por teclado (pestañas, menús, board, selector de color), ventanas con foco atrapado, `aria-*` en controles, enlace «Saltar al contenido» y respeto a «reducir movimiento».
