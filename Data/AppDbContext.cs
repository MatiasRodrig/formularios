using FormulariosAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace FormulariosAPI.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Area> Areas { get; set; }
        public DbSet<Form> Forms { get; set; }
        public DbSet<Carga> Cargas { get; set; }
        public DbSet<Plantilla> Plantillas { get; set; }
        public DbSet<Adjunto> Adjuntos { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Avoid multiple cascade paths issue in SQL Server
            modelBuilder.Entity<Carga>()
                .HasOne(c => c.Form)
                .WithMany()
                .HasForeignKey(c => c.FormId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Carga>()
                .HasOne(c => c.Area)
                .WithMany()
                .HasForeignKey(c => c.AreaId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Carga>()
                .HasOne(c => c.User)
                .WithMany()
                .HasForeignKey(c => c.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
