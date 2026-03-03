# Walkthrough: Creación de API Formularios sin Base de Datos

He completado la implementación de la API acorde a lo especificado en la guía [Planification.md](file:///c:/Users/matias.rodriguez/Desktop/formulariosapi/FormulariosAPI/Planification.md), pero sustituyendo `Entity Framework Core` y `SQL Server` por servicios manejadores de colecciones en memoria. De esta forma, la API es completamente funcional para pruebas sin depender de la base de datos alojada en la máquina virtual.

## Resumen de Cambios

1. **Modelos (Models)**: Se crearon las representaciones de las entidades de dominio: [User](file:///c:/Users/matias.rodriguez/Desktop/formulariosapi/FormulariosAPI/Models/User.cs#5-17), [Area](file:///c:/Users/matias.rodriguez/Desktop/formulariosapi/FormulariosAPI/Models/Area.cs#6-14), [Form](file:///c:/Users/matias.rodriguez/Desktop/formulariosapi/FormulariosAPI/Models/Form.cs#5-15), [Carga](file:///c:/Users/matias.rodriguez/Desktop/formulariosapi/FormulariosAPI/Models/Cargas.cs#5-21), [Plantilla](file:///c:/Users/matias.rodriguez/Desktop/formulariosapi/FormulariosAPI/Models/Plantilla.cs#5-16) y [Adjunto](file:///c:/Users/matias.rodriguez/Desktop/formulariosapi/FormulariosAPI/Models/Adjuntos.cs#5-15).
2. **Transferencia de Datos (DTOs)**: Se implementó la carpeta de DTOs para exponer y recibir los datos correctos en los Endpoints sin exponer la estructura interna ni tener referencias cíclicas, especialmente enfocados a [Auth](file:///c:/Users/matias.rodriguez/Desktop/formulariosapi/FormulariosAPI/Services/AuthService.cs#15-93) (Login/Register), [Areas](file:///c:/Users/matias.rodriguez/Desktop/formulariosapi/FormulariosAPI/Controllers/AreasController.cs#17-21), [Forms](file:///c:/Users/matias.rodriguez/Desktop/formulariosapi/FormulariosAPI/Controllers/FormsController.cs#10-68) y [Cargas](file:///c:/Users/matias.rodriguez/Desktop/formulariosapi/FormulariosAPI/Controllers/CargasController.cs#17-21).
3. **Servicios (Services)**: Se crearon servicios que implementan el patrón Singleton en memoria.
   - [AreaService](file:///c:/Users/matias.rodriguez/Desktop/formulariosapi/FormulariosAPI/Services/AreaService.cs#15-22), [FormService](file:///c:/Users/matias.rodriguez/Desktop/formulariosapi/FormulariosAPI/Services/FormService.cs#10-72) y [CargaService](file:///c:/Users/matias.rodriguez/Desktop/formulariosapi/FormulariosAPI/Services/CargaService.cs#10-58) implementan CRUD básicos guardando la información en Listas, simulando el almacenamiento.
   - [AuthService](file:///c:/Users/matias.rodriguez/Desktop/formulariosapi/FormulariosAPI/Services/AuthService.cs#15-93) provee soporte para Registrar y Loguear usuarios devolviendo un Token JWT, incluyendo un usuario por defecto (`admin@example.com` / `admin123`).
4. **Controladores (Controllers)**: Se crearon endpoints protegidos por JWT:
   - `[POST] /api/auth/login` y `[POST] /api/auth/register` (Accesibles públicamente).
   - `/api/areas` (Solo los `Admin` y `Manager` pueden crear o borrar).
   - `/api/forms` y `/api/cargas` para la interacción regular usando los ID de áreas generados en memoria.
5. **Configuración Inicial (Program.cs)**: Se instalaron e importaron las dependencias de JWT, se inyectaron los Servicios mediante Instancia Única (`AddSingleton`), y se estructuró la canalización de procesamiento del servidor para mapear Controladores y Autenticación.

## Validación

El proyecto compila de manera exitosa (`0 Errores`). Para probar la API puedes correrla mediante `dotnet run` y navegar hasta la interfaz de OpenAPI (Swagger). Puedes proceder usando `admin@example.com` con `admin123` en el endpoint de *Login* para obtener tu JWT y testear los distintos métodos protegidos.
