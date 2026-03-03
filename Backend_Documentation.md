# Documentación del Backend: FormulariosAPI

Esta documentación está diseñada para ayudar al equipo de Frontend a entender la arquitectura, los modelos de datos y los endpoints disponibles en el backend (`FormulariosAPI`). 

## 1. Arquitectura General y Tecnologías

El proyecto es una **API RESTful** construida con **ASP.NET Core**. Utiliza un enfoque de arquitectura en capas (N-Layer) que separa las responsabilidades de enrutamiento (Controllers), lógica de negocio (Services) y acceso a datos (Entity Framework Core).

- **Framework:** .NET Core (C#)
- **Base de Datos:** SQL Server (configurado en `appsettings.json` mediante Entity Framework Core).
- **ORM:** Entity Framework Core (EF Core).
- **Autenticación:** JSON Web Tokens (JWT).

El flujo de una petición típica es:
`Cliente HTTP (Frontend) -> Controller -> Service -> AppDbContext (Base de Datos)`

---

## 2. Autenticación y Autorización

La API está protegida mediante **JWT (JSON Web Tokens)**. Para consumir la mayoría de los endpoints, el Frontend debe enviar el token en la cabecera HTTP de autorización.

**Formato de la cabecera:**
```http
Authorization: Bearer <tu_token_jwt>
```

### Roles de Usuario
El sistema maneja tres roles principales que dictan los permisos dentro de la aplicación:
- **Admin**: Acceso total. Puede crear/eliminar áreas, publicar/eliminar formularios y registrar usuarios.
- **Manager**: Acceso intermedio. Puede crear formularios y publicarlos.
- **Collector**: Acceso básico. Su principal función es la carga de datos (responder formularios asignados a su área).

*Nota: La validación de roles se realiza a nivel de controlador mediante el atributo `[Authorize(Roles = "...")]`.*

---

## 3. Entidades Principales (Modelos)

El dominio de la aplicación gira en torno a las siguientes entidades clave:

1. **User (Usuario):**
   - Propiedades principales: `Id`, `Email`, `PasswordHash`, `Role`, `AreaId` (opcional).
   - Relación: Un usuario puede estar asociado a un `Area` específica.

2. **Area:**
   - Propiedades principales: `Id`, `Name`.
   - Propósito: Agrupar formularios y usuarios lógicamente (ej. "Recursos Humanos", "Ventas").

3. **Form (Formulario):**
   - Propiedades principales: `Id`, `Name`, `SchemaJson`, `IsPublished`, `AreaId`.
   - Propósito: Define la estructura de un formulario. La propiedad `SchemaJson` es un string (JSON) donde el Frontend puede almacenar la definición dinámica de los campos del formulario. Sólo los formularios donde `IsPublished = true` deberían estar disponibles para carga final.

4. **Cargas (Respuestas de Formularios):**
   - Propósito: Almacena la información o las respuestas enviadas por los usuarios (Collectors) al completar un formulario.
   - Relaciones: Vinculado a un `Formulario` y posiblemente al `Usuario` que realizó la carga.

---

## 4. Endpoints de la API

A continuación, se detallan los principales endpoints, indicando quién tiene acceso y qué datos esperan (DTOs).

### 4.1. Autenticación (`/api/Auth`)
- **`POST /api/auth/register`**
  - **Acceso:** Público (o dependiendo de la regla de registro que defina el admin).
  - **Body (RegisterDto):** `{ "email": "...", "password": "...", "role": "..." }`
  - **Respuesta:** Mensaje de éxito o error.
- **`POST /api/auth/login`**
  - **Acceso:** Público.
  - **Body (LoginDto):** `{ "email": "...", "password": "..." }`
  - **Respuesta:** Devuelve un objeto con el token `{ "token": "eyJ..." }`.

### 4.2. Áreas (`/api/Areas`)
Todos los endpoints requieren autenticación.
- **`GET /api/areas`**
  - **Acceso:** Todos los usuarios autenticados.
  - **Respuesta:** Lista de `AreaDto`.
- **`GET /api/areas/{id}`**
  - **Acceso:** Todos los usuarios autenticados.
- **`POST /api/areas`**
  - **Acceso:** Sólo `Admin` y `Manager`.
  - **Body:** Nombre del área.
- **`DELETE /api/areas/{id}`**
  - **Acceso:** Sólo `Admin`.

### 4.3. Formularios (`/api/Forms`)
Todos los endpoints requieren autenticación.
- **`GET /api/forms`**
  - **Respuesta:** Lista total de formularios (`FormDto`).
- **`GET /api/forms/area/{areaId}`**
  - **Respuesta:** Formularios filtrados por un `Area` específica. Útil para mostrar al usuario (Collector) los formularios que le corresponden.
- **`GET /api/forms/{id}`**
  - **Respuesta:** Obtiene los detalles de un formulario, incluyendo su `SchemaJson` para renderizar el formulario dinámico en el Frontend.
- **`POST /api/forms`**
  - **Acceso:** Sólo `Admin` y `Manager`.
  - **Body (FormCreateDto):** `{ "name": "...", "schemaJson": "...", "areaId": "..." }`
- **`PATCH /api/forms/{id}/publish`**
  - **Acceso:** Sólo `Admin` y `Manager`.
  - **Acción:** Cambia `IsPublished` a verdadero.
- **`DELETE /api/forms/{id}`**
  - **Acceso:** Sólo `Admin`.

### 4.4. Cargas/Respuestas (`/api/Cargas`)
Endpoints dedicados a la recolección de los datos enviados por los usuarios. Requieren autenticación.
- **`GET /api/cargas`** y **`GET /api/cargas/area/{areaId}`**
  - Obtiene todas las respuestas enviadas, ideal para listados o tablas en paneles administrativos.
- **`GET /api/cargas/{id}`**
  - Obtiene la respuesta de una carga en particular.
- **`POST /api/cargas`**
  - **Acceso:** Típicamente el rol `Collector` o cualquier validado.
  - **Body:** Recibe un `CargaCreateDto` que contendrá la data en formato JSON u otro string serializado y los IDs del formulario correspondiente.

---

## 5. Guía de Integración para el Frontend

### 5.1. Manejo del Token en el Frontend
1. Al invocar `/api/auth/login`, recibe el token.
2. Almacena el token en `localStorage`, `sessionStorage` o un gestor de estado (como Redux/Zustand en React o Vuex/Pinia en Vue).
3. Configura un **Interceptor de Axios** (o con `fetch`) para inyectar la cabecera `Authorization: Bearer <token>` en todas las peticiones subsecuentes.

### 5.2. Manejo de Formularios Dinámicos (`SchemaJson`)
El backend asume que el contenido y la validación particular de los campos del formulario se maneja dinámicamente. 
- Al crear un formulario (`POST`), el Frontend debe enviar la configuración (qué inputs tiene, placeholders, required alerts) serializada como string dentro del campo `schemaJson`.
- Al consultar un formulario por ID (`GET`), el Frontend toma `schemaJson`, hace un `JSON.parse()`, y renderiza la UI correspondiente.

### 5.3. Códigos de Estado Comunes
El backend está programado de acuerdo a los estándares REST:
- **`200 OK`**: Petición GET, PUT o PATCH exitosa.
- **`201 Created`**: Petición POST exitosa (ej. al crear áreas o formularios).
- **`204 No Content`**: Petición de borrado o actualización exitosa que no devuelve contenido (ej. publicación/borrado de un form).
- **`400 Bad Request`**: Datos inválidos desde el Frontend u operaciones fallidas como registro duplicado.
- **`401 Unauthorized`**: Falta el token JWT o ha expirado.
- **`403 Forbidden`**: El usuario está autenticado pero su rol no tiene permiso para ejecutar la acción solicitada.
- **`404 Not Found`**: El recurso (ID) solicitado no existe.

---

*Fin del documento. Estas referencias se basan en el código actual de FormulariosAPI.*
