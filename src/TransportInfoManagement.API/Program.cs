using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using TransportInfoManagement.API.Data;
using TransportInfoManagement.API.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Configure Entity Framework with MySQL
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? "Server=localhost;Database=TransportInfoDB;User=root;Password=;Port=3306;";
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

// Configure JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"] ?? "YourSuperSecretKeyForJWTTokenGeneration12345";
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"] ?? "TransportInfoManagement",
        ValidAudience = jwtSettings["Audience"] ?? "TransportInfoManagement",
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey))
    };
});

// Register services
builder.Services.AddScoped<IAuthService, AuthService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();

// Enable default files (index.html) - must be before UseStaticFiles
app.UseDefaultFiles();

// Serve static files from wwwroot
app.UseStaticFiles();

// Map API controllers
app.MapControllers();

var env = app.Services.GetRequiredService<IWebHostEnvironment>();

// Login page route
app.MapGet("/login", async (context) =>
{
    var loginFilePath = Path.Combine(env.WebRootPath, "login.html");
    if (File.Exists(loginFilePath))
    {
        context.Response.ContentType = "text/html";
        await context.Response.SendFileAsync(loginFilePath);
        return;
    }
    // Fallback to admin login if login.html doesn't exist
    var adminFilePath = Path.Combine(env.WebRootPath, "index.html");
    if (File.Exists(adminFilePath))
    {
        context.Response.ContentType = "text/html";
        await context.Response.SendFileAsync(adminFilePath);
    }
});

// User dashboard route
app.MapGet("/user", async (context) =>
{
    var userFilePath = Path.Combine(env.WebRootPath, "user.html");
    if (File.Exists(userFilePath))
    {
        context.Response.ContentType = "text/html";
        await context.Response.SendFileAsync(userFilePath);
        return;
    }
    // Redirect to home if user.html doesn't exist
    context.Response.Redirect("/");
});

// Admin panel route - serve admin panel at /admin
app.MapGet("/admin", async (context) =>
{
    var adminFilePath = Path.Combine(env.WebRootPath, "index.html");
    if (File.Exists(adminFilePath))
    {
        context.Response.ContentType = "text/html";
        await context.Response.SendFileAsync(adminFilePath);
    }
});

// Public website route - serve public/index.html at root
app.MapGet("/", async (context) =>
{
    var publicFilePath = Path.Combine(env.WebRootPath, "public", "index.html");
    if (File.Exists(publicFilePath))
    {
        context.Response.ContentType = "text/html";
        await context.Response.SendFileAsync(publicFilePath);
        return;
    }
    // Fallback to admin if public folder doesn't exist
    var adminFilePath = Path.Combine(env.WebRootPath, "index.html");
    if (File.Exists(adminFilePath))
    {
        context.Response.ContentType = "text/html";
        await context.Response.SendFileAsync(adminFilePath);
    }
});

// Fallback for admin panel SPA routing (routes starting with /admin)
app.MapFallback(context =>
{
    var path = context.Request.Path.Value?.ToLower();
    // Only handle /admin routes for SPA fallback
    if (path?.StartsWith("/admin") == true && !path.StartsWith("/api"))
    {
        var adminFilePath = Path.Combine(env.WebRootPath, "index.html");
        if (File.Exists(adminFilePath))
        {
            context.Response.ContentType = "text/html";
            return context.Response.SendFileAsync(adminFilePath);
        }
    }
    return Task.CompletedTask;
});

// Ensure database is created
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    db.Database.EnsureCreated();
}

app.Run();

