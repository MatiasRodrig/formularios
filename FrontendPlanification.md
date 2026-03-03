Crea un proyecto completo en React + Vite + JavaScript + CSS Modules llamado "FormForge".
Es una aplicación web para crear formularios dinámicos, cargar datos y generar actas (documentos) 
rellenadas con los datos de esos formularios.

---

## STACK TÉCNICO

- React 18 + Vite
- JavaScript (sin TypeScript)
- CSS Modules para todos los estilos
- React Router DOM v6 para navegación
- Axios para las peticiones HTTP
- @atlaskit/drag-and-drop para el creador de formularios
- @react-pdf/renderer para generación de PDFs
- react-hot-toast para notificaciones
- zustand para manejo de estado global (auth, usuario)

---

## BACKEND (FormulariosAPI)

Base URL configurable en un archivo `.env`: VITE_API_URL=http://localhost:5000

### Autenticación JWT
- POST /api/auth/login → { email, password } → devuelve { token }
- POST /api/auth/register → { email, password, role }
- El token se guarda en localStorage
- Configurar un interceptor de Axios que inyecte el header:
  Authorization: Bearer <token> en todas las peticiones

### Roles
- Admin: acceso total
- Manager: crear/publicar formularios y áreas
- Collector: solo cargar datos en formularios publicados

### Endpoints principales
- GET/POST/DELETE /api/areas
- GET/POST/PATCH/DELETE /api/forms
- GET /api/forms/area/:areaId
- GET /api/forms/:id → devuelve schemaJson (string JSON con la definición del formulario)
- POST /api/cargas → enviar datos de un formulario
- GET /api/cargas, GET /api/cargas/area/:areaId

### Códigos HTTP a manejar
- 401 → redirigir al login
- 403 → mostrar mensaje "Sin permisos"
- 404 → mostrar mensaje "No encontrado"
- 400 → mostrar errores de validación

---

## ESTRUCTURA DE CARPETAS

src/
├── api/
│   ├── axiosInstance.js       # instancia de Axios con interceptor JWT
│   ├── authApi.js
│   ├── areasApi.js
│   ├── formsApi.js
│   └── cargasApi.js
├── store/
│   └── authStore.js           # zustand: token, user, rol, login(), logout()
├── router/
│   └── AppRouter.jsx          # rutas protegidas por rol
├── layouts/
│   ├── MainLayout/            # sidebar + header + outlet
│   └── AuthLayout/            # layout simple para login
├── pages/
│   ├── Login/
│   ├── Dashboard/
│   ├── Areas/                 # listar, crear, eliminar áreas
│   ├── Forms/
│   │   ├── FormList/          # listado de formularios
│   │   ├── FormBuilder/       # DRAG & DROP editor de formularios
│   │   ├── FormFill/          # Collector llena un formulario publicado
│   │   └── FormDetail/        # ver respuestas/cargas de un formulario
│   ├── Cargas/
│   │   └── CargasList/        # tabla de respuestas enviadas
│   └── Actas/
│       ├── ActaTemplateEditor/ # editor de plantillas de actas
│       └── ActaPreview/        # preview y exportación de acta generada
├── components/
│   ├── ProtectedRoute/
│   ├── Sidebar/
│   ├── Header/
│   ├── FieldCard/             # tarjeta de un field en el DnD
│   ├── FieldPalette/          # panel izquierdo con tipos de campos disponibles
│   ├── FormRenderer/          # renderiza un formulario a partir del schemaJson
│   ├── ActaRenderer/          # renderiza una plantilla de acta con variables
│   └── ui/                    # Button, Input, Select, Modal, Badge, Spinner
└── utils/
    ├── schemaHelpers.js        # parse/stringify del schemaJson
    └── actaHelpers.js          # reemplazar variables {{variable}} en plantillas

---

## DETALLE: FormBuilder con Drag & Drop

Esta es la pieza central. Usar @atlaskit/drag-and-drop.

### Layout del FormBuilder
Dividido en 3 columnas:
1. **Panel izquierdo - Paleta de campos**: Lista fija de tipos de campos disponibles que se pueden arrastrar:
   - Text Input
   - Number Input
   - Textarea
   - Select (con opciones configurables)
   - Date Picker
   - Checkbox
   - Radio Group

2. **Panel central - Canvas del formulario**: Zona de drop donde caen los campos.
   Cada campo soltado se convierte en un FieldCard con:
   - Handle para reordenar (DnD entre campos del canvas)
   - Nombre/label del campo (editable inline)
   - Tipo de campo (badge)
   - Botón de configuración (abre modal)
   - Botón de eliminar

3. **Panel derecho - Configuración del campo seleccionado**:
   Al hacer click en un FieldCard se muestra su configuración:
   - label (string)
   - placeholder (string)
   - required (boolean)
   - options (array de strings, solo para Select/Radio)
   - variableName (string): nombre de la variable que usará el acta (ej: "nombre_paciente")

### Estructura del schemaJson
El formBuilder genera y guarda este objeto serializado como string:

{
  "fields": [
    {
      "id": "uuid-generado",
      "type": "text" | "number" | "textarea" | "select" | "date" | "checkbox" | "radio",
      "label": "Nombre del paciente",
      "placeholder": "Ingrese el nombre...",
      "required": true,
      "options": [],          // para select y radio
      "variableName": "nombre_paciente"  // para vincular con actas
    }
  ]
}

Al hacer POST /api/forms se envía:
{ "name": "Nombre del form", "schemaJson": JSON.stringify(schema), "areaId": "..." }

---

## DETALLE: FormFill (Collector carga datos)

1. Obtener el formulario por ID: GET /api/forms/:id
2. Parsear schemaJson con JSON.parse()
3. Usar el componente <FormRenderer schema={schema} /> para renderizar los campos dinámicamente
4. Al enviar: POST /api/cargas con { formId, data: JSON.stringify(formValues) }

---

## DETALLE: Actas (Plantillas de documentos)

### ActaTemplateEditor
- Editor de texto enriquecido simple (puede ser un textarea grande con monospace) donde el usuario escribe el acta usando variables con la sintaxis {{variableName}}
- Ejemplo: "El día {{fecha}} se reunieron {{nombre_responsable}} y {{nombre_participante}}..."
- El usuario puede elegir a qué formulario está vinculada el acta
- Al guardar, el acta se guarda en localStorage (o estado global) como:
  { id, name, formId, templateHtml, createdAt }
- Un botón "Detectar variables" analiza el template y lista automáticamente las variables encontradas

### ActaPreview (Generación del acta)
1. El usuario selecciona una carga/respuesta existente de ese formulario
2. El sistema reemplaza cada {{variable}} con el valor correspondiente del campo con ese variableName
3. Muestra el acta renderizada en HTML limpio con estilos de documento
4. Botón "Exportar PDF" usa @react-pdf/renderer para generar y descargar el PDF
5. Botón "Exportar HTML" descarga el HTML renderizado como archivo .html

---

## DISEÑO VISUAL

Estilo: aplicación de gestión profesional, oscura y técnica. Tipo "forja" o taller industrial.

- Paleta: fondo muy oscuro (#0f1117), sidebar en (#161b27), cards en (#1c2333), acentos en azul eléctrico (#3b82f6) y un toque de ámbar (#f59e0b) para alertas/publicados
- Tipografía: "IBM Plex Mono" o "JetBrains Mono" para labels y datos; "DM Sans" o "Plus Jakarta Sans" para texto corrido
- Bordes sutiles, sombras suaves, transiciones de 150ms
- Los campos en el FormBuilder canvas tienen apariencia de "fichas" o "bloques modulares"
- Estado "publicado" de un formulario se distingue con un badge ámbar brillante

---

## RUTAS

/ → redirect a /dashboard
/login → Login (público)
/dashboard → resumen, stats, accesos rápidos
/areas → lista y gestión de áreas (Admin/Manager)
/forms → lista de formularios
/forms/new → FormBuilder vacío
/forms/:id/edit → FormBuilder con datos existentes
/forms/:id/fill → FormFill (Collector)
/forms/:id/responses → listado de cargas de ese form
/cargas → todas las cargas (Admin/Manager)
/actas → listado de plantillas de actas
/actas/new → ActaTemplateEditor vacío
/actas/:id/edit → ActaTemplateEditor con datos
/actas/:id/preview → ActaPreview (seleccionar carga y exportar)

---

## CONSIDERACIONES FINALES

- Usar ProtectedRoute que verifica rol antes de renderizar
- Manejar loading states en cada fetch con un spinner centrado
- Manejar errores globalmente desde el interceptor de Axios (401 → logout + redirect)
- El FormBuilder debe ser completamente funcional: arrastrar desde paleta al canvas,
  reordenar campos dentro del canvas, configurar cada campo, y guardar el schema
- Las plantillas de actas pueden guardarse en localStorage si no hay endpoint dedicado en el backend
- Generar IDs únicos para los fields con crypto.randomUUID()
- El proyecto debe correr con `npm run dev` sin errores desde el primer momento