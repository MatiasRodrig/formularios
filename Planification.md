---

## 🧭 PLANIFICACIÓN INICIAL – GUÍA BASE

### **1️⃣ Roles y permisos**

| Rol | Descripción | Permisos principales |
| --- | --- | --- |
| 🧑‍💼 **Administrador** | Usuario con control total. | - Crear, editar y eliminar formularios y actas de cualquier área.- Administrar usuarios y áreas.- Consultar y exportar toda la información.- Asignar permisos a otros roles. |
| 📋 **Collector (recolector)** | Usuario que carga información en campo o desde oficina. | - Ver y llenar formularios asignados a su área.- Consultar sus propias cargas y las compartidas.- Trabajar **offline** y sincronizar luego. |
| 🧭 **Manager** | Encargado de un área específica. | - Mismo acceso que el admin, pero **limitado a su área**.- Crear formularios y actas para su área.- Revisar, aprobar o reenviar cargas dentro del área. |

**Regla general:**

👉 Si un Manager crea algo, se asigna automáticamente a su área.

👉 El Admin puede reasignar formularios/actas a cualquier área.

---

### **2️⃣ Tipos de objetos del sistema**

### 🧱 **Formularios**

- Diseñados por **admin o manager**.
- Guardados como JSON Schema (`SchemaJson`).
- Pueden incluir campos de texto, números, select, GPS, fotos, QR, firma, etc.
- Definición:
    - Nombre
    - Área
    - Versión
    - Lista de campos
    - Permisos (qué roles o usuarios pueden usarlo)

### 📄 **Actas (plantillas oficiales)**

- Creaciones basadas en formularios existentes.
- Pueden ser:
    - **Plantilla DOCX o HTML** (con placeholders `{{campo}}`).
- El sistema las **rellena automáticamente** con los datos del formulario.
- Generadas por Admin o Manager del área.
- Salida: PDF/DOCX descargable o enviable a otro usuario.

---

### **3️⃣ Áreas definidas**

| ID | Nombre |
| --- | --- |
| 1 | Desarrollo social y bromatología |
| 2 | Fiscalización |
| 3 | Obras privadas |
| 4 | Obras públicas |
| 5 | Industria y agro |
| 6 | Recaudaciones |
| 7 | Innovación |

> 🔹 Cada usuario (collector o manager) pertenece a **una sola área**.
> 
> 
> 🔹 El administrador puede ver y asignar usuarios a cualquier área.
> 

---

### **4️⃣ Flujo operativo (simplificado)**

### 🔹 **1. Crear formulario o plantilla**

- Admin o Manager crea formulario/acta desde la web.
- Si es Manager → el sistema asigna el área automáticamente.
- Si es Admin → elige el área manualmente.

### 🔹 **2. Publicar formulario**

- Se marca como “publicado” para que los collectors puedan verlo en sus apps (web/móvil).
- Se sincroniza al dispositivo móvil (descarga de schema JSON).

### 🔹 **3. Llenar en campo o en oficina**

- Collector abre el formulario (en línea u offline).
- Completa los campos y adjunta fotos, firmas, etc.
- Si no hay conexión: se guarda localmente como “pendiente”.

### 🔹 **4. Sincronización**

- Cuando hay conexión → la app móvil sube los datos (y archivos) al servidor.
- El backend guarda la respuesta como **Submission** asociada a:
    - Formulario
    - Usuario
    - Área
    - Fecha y ubicación (si aplica)

### 🔹 **5. Generar acta**

- Manager/Admin selecciona una carga (submission).
- Genera la **acta oficial** a partir de la plantilla vinculada.
- El sistema rellena automáticamente los campos (`{{nombre}}`, `{{fecha}}`, etc.)
- Se genera un **PDF o DOCX** descargable.

### 🔹 **6. Consultar o enviar**

- Manager o Admin puede:
    - Ver cargas del área.
    - Filtrar por usuario, fecha o estado.
    - Enviar la carga/acta a otro usuario (para revisión o firma).

---

### **5️⃣ Relaciones entre objetos**

**Usuarios → Áreas (N:1)**

**Formularios → Áreas (N:1)**

**Actas → Formularios (1:1 o 1:N)**

**Submissions → Formularios + Usuarios + Áreas (N:1:1)**

Visualmente:

```
Área ───┬──> Formularios ───┬──> Actas
         │                   └──> Submissions
         └──> Usuarios
```

---

### **6️⃣ Próximos pasos recomendados**

1. **Definir modelo de base de datos** con estos roles, áreas y relaciones.
2. **Crear endpoints básicos:**
    - `/api/auth/login`
    - `/api/areas`
    - `/api/forms`
    - `/api/templates`
    - `/api/submissions`
3. **Construir el “Form Builder” web.**
4. **Agregar el “Form Renderer”** (web + móvil).
5. **Implementar sincronización móvil offline.**
6. **Integrar la generación de actas (DOCX/PDF).**
7. **Permitir compartir o enviar actas a otros usuarios.**

---

---

## 🧭 GUÍA – Qué hacer después de crear el proyecto WebAPI (.NET Core)

---

### **1️⃣ Configurar la base de datos y Entity Framework Core**

**Objetivo:** Tener tus entidades (modelos) y la conexión lista para trabajar.

### Pasos:

1. **Agregá los paquetes necesarios:**
    
    ```bash
    dotnet add package Microsoft.EntityFrameworkCore
    dotnet add package Microsoft.EntityFrameworkCore.SqlServer
    dotnet add package Microsoft.EntityFrameworkCore.Tools
    ```
    
2. **Crea la carpeta `/Models`** y dentro define tus entidades principales:
    - `User.cs`
    - `Area.cs`
    - `Form.cs`
    - `Submission.cs`
    - `Template.cs`
    - `Attachment.cs`
3. **Ejemplo de modelo básico:**
    
    ```csharp
    namespace MyApp.Models
    {
        public class Area
        {
            public Guid Id { get; set; }
            public string Name { get; set; } = string.Empty;
    
            public ICollection<User>? Users { get; set; }
            public ICollection<Form>? Forms { get; set; }
        }
    }
    ```
    
4. **Crea la clase del contexto:**
    
    ```csharp
    using Microsoft.EntityFrameworkCore;
    using MyApp.Models;
    
    namespace MyApp.Data
    {
        public class AppDbContext : DbContext
        {
            public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
    
            public DbSet<User> Users => Set<User>();
            public DbSet<Area> Areas => Set<Area>();
            public DbSet<Form> Forms => Set<Form>();
            public DbSet<Submission> Submissions => Set<Submission>();
            public DbSet<Template> Templates => Set<Template>();
            public DbSet<Attachment> Attachments => Set<Attachment>();
        }
    }
    ```
    
5. **Agrega la conexión a SQL Server en `appsettings.json`:**
    
    ```json
    "ConnectionStrings": {
      "DefaultConnection": "Server=localhost;Database=FormAppDB;Trusted_Connection=True;TrustServerCertificate=True;"
    }
    ```
    
6. **Registra el contexto en `Program.cs`:**
    
    ```csharp
    builder.Services.AddDbContext<AppDbContext>(options =>
        options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
    ```
    
7. **Crea y aplica la primera migración:**
    
    ```bash
    dotnet ef migrations add InitialCreate
    dotnet ef database update
    ```
    

✅ Con esto ya tenés tu base de datos creada y lista para usar.

---

### **2️⃣ Crear los endpoints base (CRUDs simples)**

**Objetivo:** Tener API funcional para probar la conexión y flujo de datos.

### Endpoints prioritarios:

1. `/api/areas`
2. `/api/forms`
3. `/api/submissions`
4. `/api/templates`

Ejemplo simple (AreasController):

```csharp
[ApiController]
[Route("api/[controller]")]
public class AreasController : ControllerBase
{
    private readonly AppDbContext _context;
    public AreasController(AppDbContext context) => _context = context;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Area>>> GetAreas() =>
        await _context.Areas.ToListAsync();

    [HttpPost]
    public async Task<ActionResult<Area>> CreateArea(Area area)
    {
        _context.Areas.Add(area);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAreas), new { id = area.Id }, area);
    }
}
```

Probalo con Postman o Swagger (`/swagger` en el navegador).

---

### **3️⃣ Agregar autenticación (JWT)**

**Objetivo:** Controlar acceso según roles (admin, manager, collector).

### Pasos:

1. Agrega paquetes:
    
    ```bash
    dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer
    dotnet add package Microsoft.IdentityModel.Tokens
    ```
    
2. Configura JWT en `Program.cs` (puedo pasarte el bloque completo cuando llegues ahí).
3. Crea endpoints `/api/auth/login` y `/api/auth/register` (solo para Admin).
4. Usa roles con `[Authorize(Roles = "Admin")]`, `[Authorize(Roles = "Manager")]`, etc.

---

### **4️⃣ Implementar relación entre modelos**

Ejemplo (Form y Area):

```csharp
public class Form
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string SchemaJson { get; set; } = string.Empty;
    public bool IsPublished { get; set; }

    public Guid AreaId { get; set; }
    public Area? Area { get; set; }
}
```

Después de definir relaciones, ejecuta:

```bash
dotnet ef migrations add RelationsUpdate
dotnet ef database update
```

---

### **5️⃣ Testear el flujo completo**

1. Crear un área (POST `/api/areas`).
2. Crear un formulario (POST `/api/forms`).
3. Crear una submission (POST `/api/submissions`).
4. Consultar y verificar relaciones con `GET`.

Esto te asegura que la base está sólida antes de avanzar con builder o frontend.

---

### **6️⃣ Próximos pasos (una vez lo anterior funcione)**

1. **Agregar Auth JWT + Roles**
2. **Crear endpoints más avanzados (sync, templates, generación de PDFs)**
3. **Exponer endpoints públicos (solo lectura) para el frontend móvil/web.**
4. **Probar todo con Postman o Swagger**
5. **Conectar frontend web (React)** para consumir `/api/forms` y `/api/submissions`.

---

---

## 🛡️ Mejores prácticas de autenticación con JWT en ASP.NET Core

Antes de entrar en código, estos son **los conceptos clave de seguridad** que seguiremos:

✔️ **Tokens firmados y validados correctamente** (no inventar tu propio formato).

✔️ **Validación estricta de: issuer, audience, firma y expiración.**

✔️ **Tokens de corta duración** (p. ej. 10–15 min).

✔️ **Refresh tokens** para obtener nuevos access tokens sin necesidad de volver a loguear.

✔️ **Almacenamiento seguro del token en el cliente:**

— En móviles usar SecureStore/Keychain/Keystore (nunca en localStorage sin protección).

✔️ HTTPS obligatorio entre cliente y servidor.

✔️ Roles/claims usados correctamente para proteger recursos. ([BoldSign](https://boldsign.com/blogs/aspnet-core-jwt-authentication-guide/?utm_source=chatgpt.com))

---

## 🔐 Paso 1 — Agregá Identity y JWT Bearer

Primero agregá los paquetes:

```bash
dotnet add package Microsoft.AspNetCore.Identity.EntityFrameworkCore
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer
dotnet add package Microsoft.IdentityModel.Tokens
```

---

## 🧱 Paso 2 — Configurá Identity en DbContext

Modificá tu `AppDbContext` para heredar de Identity:

```csharp
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

public class AppDbContext : IdentityDbContext<IdentityUser>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    // Tus DbSet aquí
}
```

---

## 🔧 Paso 3 — Configurar JWT en `Program.cs`

Agregá esta configuración **antes de `app.UseAuthorization()`**:

```csharp
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// Identity (usuarios, roles, hashing de contraseñas)
builder.Services.AddIdentity<IdentityUser, IdentityRole>()
    .AddEntityFrameworkStores<AppDbContext>()
    .AddDefaultTokenProviders();

// JWT config
var jwtKey = builder.Configuration["Jwt:Key"];
var jwtIssuer = builder.Configuration["Jwt:Issuer"];
var jwtAudience = builder.Configuration["Jwt:Audience"];

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = true;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        ValidateIssuer = true,
        ValidIssuer = jwtIssuer,
        ValidateAudience = true,
        ValidAudience = jwtAudience,
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero, // sin tolerancias largas
        RequireExpirationTime = true
    };
});

builder.Services.AddAuthorization();

var app = builder.Build();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
```

> 📌 **Importante:** `TokenValidationParameters` con validación estricta de `issuer`, `audience`, `signature`, y expiración es crítico para seguridad actual (no ignorar). ([Microsoft Learn](https://learn.microsoft.com/es-es/aspnet/core/security/authentication/configure-jwt-bearer-authentication?view=aspnetcore-10.0&utm_source=chatgpt.com))
> 

---

## 🔑 Paso 4 — Crear endpoints de *Auth* (register + login)

### ➤ Register (crea usuario)

```csharp
[HttpPost("register")]
public async Task<IActionResult> Register(RegisterDto dto)
{
    var user = new IdentityUser { UserName = dto.Email, Email = dto.Email };
    var result = await _userManager.CreateAsync(user, dto.Password);

    if (!result.Succeeded)
        return BadRequest(result.Errors);

    // Podés además asignar rol aquí
    await _userManager.AddToRoleAsync(user, dto.Role);

    return Ok(new { message = "Usuario creado" });
}
```

### ➤ Login (devuelve JWT + refresh token)

```csharp
[HttpPost("login")]
public async Task<IActionResult> Login(LoginDto dto)
{
    var user = await _userManager.FindByEmailAsync(dto.Email);
    if (user == null || !await _userManager.CheckPasswordAsync(user, dto.Password))
        return Unauthorized();

    // generar JWT
    var authClaims = new List<Claim>
    {
        new Claim(ClaimTypes.Name, user.UserName),
        new Claim(ClaimTypes.NameIdentifier, user.Id),
        new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
    };

    var userRoles = await _userManager.GetRolesAsync(user);
    authClaims.AddRange(userRoles.Select(r => new Claim(ClaimTypes.Role, r)));

    var tokenHandler = new JwtSecurityTokenHandler();
    var key = Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]);

    var token = new JwtSecurityToken(
        issuer: builder.Configuration["Jwt:Issuer"],
        audience: builder.Configuration["Jwt:Audience"],
        claims: authClaims,
        expires: DateTime.UtcNow.AddMinutes(15), // corto por seguridad
        signingCredentials: new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256)
    );

    string jwtToken = tokenHandler.WriteToken(token);

    // Opción: generar refresh token y guardarlo en DB para futuras rotaciones
    var refreshToken = Guid.NewGuid().ToString();

    return Ok(new
    {
        token = jwtToken,
        expires = token.ValidTo,
        refreshToken = refreshToken
    });
}
```

📌 Acá generás un **access token corto (15 min)** y un **refresh token**. Esto limita el impacto si un token se filtra. ([BoldSign](https://boldsign.com/blogs/aspnet-core-jwt-authentication-guide/?utm_source=chatgpt.com))

---

## 🔓 Paso 5 — Proteger Endpoints con Roles

Ahora podés usar lo siguiente:

```csharp
[Authorize]                // requiere estar autenticado
public class SomeController : ControllerBase { ... }

[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase { ... }

[Authorize(Roles = "Manager,Admin")]
public class ManagerController : ControllerBase { ... }
```

✨ Esto asegura que sólo usuarios con rol correcto accedan. ([Microsoft Learn](https://learn.microsoft.com/es-es/aspnet/core/security/authentication/configure-jwt-bearer-authentication?view=aspnetcore-10.0&utm_source=chatgpt.com))

---

## 🧠 Consejos de seguridad extra (2026)

✔ **No guardes el JWT en localStorage sin protección.**

- En navegadores usa **cookies HttpOnly + Secure** si podés.
- En móvil guarda tokens en **SecureStore / Keychain (iOS) / Keystore (Android)**. ([BoldSign](https://boldsign.com/blogs/aspnet-core-jwt-authentication-guide/?utm_source=chatgpt.com))

✔ **Usá HTTPS en producción.**

- Nunca sirvas tu API sin TLS.

✔ **Minimizá claims en el token.**

- No incluyas datos sensibles.

✔ **Implementá revocación de refresh tokens.**

- Almacená y rotá refresh tokens en la base de datos.

✔ **Evita tokens largos.**

- Tokens cortos y refresh tokens hacen tus sistemas más seguros. ([BoldSign](https://boldsign.com/blogs/aspnet-core-jwt-authentication-guide/?utm_source=chatgpt.com))

---

## 🗂 Variables de configuración sugeridas (`appsettings.json`)

```json
"Jwt": {
  "Key": "TuClaveSuperSecretaMuyLarga12345!",
  "Issuer": "MyAppAPI",
  "Audience": "MyAppClients"
}
```

💡 En producción, la clave nunca va directamente en el archivo de configuración — usá **Azure Key Vault** o **AWS Secrets Manager**.

---