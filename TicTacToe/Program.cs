using Microsoft.EntityFrameworkCore;
using TicTacToe.Models;
using TicTacToe.Repository;
using TicTacToe.SingnalRHub;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddDbContext<TicTacToeContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddScoped<GameRepository>();
builder.Services.AddCors(o =>
{
    o.AddPolicy("MyPolicy", p => p
        .WithOrigins("http://localhost:4200")
        .AllowAnyHeader()
        .AllowCredentials());
});

builder.Services.AddSignalR();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("MyPolicy");
app.UseHttpsRedirection();
app.MapHub<GameHub>("/gamehub");

app.Run();