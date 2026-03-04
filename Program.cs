using System.Text;
using FormulariosAPI.Services;
using FormulariosAPI.Services.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;

using Microsoft.EntityFrameworkCore;
using FormulariosAPI.Data;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy.WithOrigins("http://localhost:5173")
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});
builder.Services.AddOpenApi(); // For OpenAPI / Swagger generation

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Register database-backed services as Scoped
builder.Services.AddScoped<IAreaService, AreaService>();
builder.Services.AddScoped<IFormService, FormService>();
builder.Services.AddScoped<ICargaService, CargaService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserService, UserService>();

// Configure JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"] ?? "ClaveSuperSecretaDePrueba1234567890!!";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "MyAppAPI";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "MyAppClients";

Microsoft.IdentityModel.Logging.IdentityModelEventSource.ShowPII = true;

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false; // Set to true in prod
    options.SaveToken = true;
    options.UseSecurityTokenValidators = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        ValidateIssuer = true,
        ValidIssuer = jwtIssuer,
        ValidateAudience = true,
        ValidAudience = jwtAudience,
        ValidateLifetime = true,
        ClockSkew = System.TimeSpan.Zero
    };
    options.Events = new JwtBearerEvents
    {
        OnAuthenticationFailed = context =>
        {
            var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<Program>>();
            logger.LogError(context.Exception, "Authentication failed. Exception details:");
            return System.Threading.Tasks.Task.CompletedTask;
        }
    };
});

builder.Services.AddAuthorization();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseHttpsRedirection();

app.UseStaticFiles(); // Allow to serve /wwwroot contents for uploads

app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
