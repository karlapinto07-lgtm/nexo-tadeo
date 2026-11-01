# NexoTadeo · Red de gestión de conocimiento (v3)

Red de gestión de conocimiento que conecta a estudiantes y egresados de Diseño Industrial de la Universidad Jorge Tadeo Lozano: **7 campos → áreas → personas → proyectos**. Sin instalación, lista para GitHub Pages.

## Archivos
| Archivo | Qué contiene |
|---|---|
| `index.html` | Introducción, red, pestaña Proyectos, perfil, ventana NexoTadeo, inicio de sesión, registro, gestor de proyecto y Cabito |
| `style.css` | Guía de estilo: Poppins, primario `#5A81FA`, secundario `#2C3D8F`, fondos `#F2F5FF` / `#F8F9FD` (los colores de los campos no cambian) |
| `script.js` | Toda la lógica |
| `data.json` | 7 campos, 25 áreas, 12 sectores de desempeño, 14 perfiles y 7 proyectos de ejemplo |
| `assets/` | Logos (ver `assets/LEEME.txt`) |

## Publicar en GitHub Pages
1. Sube todo (incluida `assets/`) a la raíz de un repositorio.
2. **Settings → Pages** → *Deploy from a branch* → `main` / `(root)`.
3. Queda en `https://TU-USUARIO.github.io/NOMBRE-DEL-REPO/` (la pestaña de proyectos tiene enlace directo: `…/#proyectos`).

## Cuentas de prueba
- Registro: solo con correo **@utadeo.edu.co** (se cambia en `data.json → meta.dominio`).
- Los 14 perfiles de ejemplo entran con su nombre completo y la contraseña `nexo2026` (`meta.claveDemo`).

## Proyectos y Cabito
- **Publicar:** desde *Mi perfil → Proyectos* o desde la pestaña *Proyectos*. Se elige sector de desempeño, estado (en ejecución / finalizado), áreas, imágenes, enlaces y equipo (mencionando personas de la red).
- **Borradores:** todo lo que se guarde sin publicar, o lo que se arme con Cabito, queda en *Mi perfil → Borradores*.
- **Cabito:** pide primero el sector, luego la idea (hasta 300 palabras), recomienda el equipo y, tras 15 segundos (o al pulsar "Gestiona tu proyecto"), abre el proyecto con apoyo sugerido de la universidad (espacios, acompañamiento, financiación y presupuesto), el brief, la descarga en PDF y el envío como propuesta.
- **PDF:** se genera con jsPDF, que se carga desde cdnjs solo al descargar. Si no carga, se abre el diálogo de impresión para "Guardar como PDF".
- **Enviar a la universidad:** marca el proyecto como "Propuesta enviada". Si escribes un correo en `data.json → meta.correoUniversidad`, además abre un correo con el resumen del brief.

> Las cuentas, fotos, proyectos y borradores se guardan en el navegador (localStorage); no hay servidor. Para una red compartida real se necesita un backend (Firebase, Supabase, etc.). Las recomendaciones de apoyo son orientativas y deben validarse con la universidad.
