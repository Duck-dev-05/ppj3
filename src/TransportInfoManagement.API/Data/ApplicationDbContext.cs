using Microsoft.EntityFrameworkCore;
using TransportInfoManagement.API.Models;

namespace TransportInfoManagement.API.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Service> Services { get; set; }
    public DbSet<Department> Departments { get; set; }
    public DbSet<Employee> Employees { get; set; }
    public DbSet<Client> Clients { get; set; }
    public DbSet<ClientService> ClientServices { get; set; }
    public DbSet<Product> Products { get; set; }
    public DbSet<Payment> Payments { get; set; }
    public DbSet<ServiceFee> ServiceFees { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Service Fee Configuration
        modelBuilder.Entity<ServiceFee>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FeePerDayPerEmployee).HasColumnType("decimal(18,2)");
        });

        // Service Configuration
        modelBuilder.Entity<Service>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Name).IsUnique();
        });

        // Department Configuration
        modelBuilder.Entity<Department>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Name).IsUnique();
        });

        // Employee Configuration
        modelBuilder.Entity<Employee>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.Service)
                  .WithMany()
                  .HasForeignKey(e => e.ServiceId)
                  .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(e => e.Department)
                  .WithMany()
                  .HasForeignKey(e => e.DepartmentId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // Client Configuration
        modelBuilder.Entity<Client>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Email).IsUnique();
        });

        // ClientService Configuration
        modelBuilder.Entity<ClientService>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.Client)
                  .WithMany()
                  .HasForeignKey(e => e.ClientId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.Service)
                  .WithMany()
                  .HasForeignKey(e => e.ServiceId)
                  .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(e => e.Employee)
                  .WithMany()
                  .HasForeignKey(e => e.EmployeeId)
                  .OnDelete(DeleteBehavior.SetNull);
        });

        // Product Configuration
        modelBuilder.Entity<Product>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.Client)
                  .WithMany()
                  .HasForeignKey(e => e.ClientId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Payment Configuration
        modelBuilder.Entity<Payment>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.Client)
                  .WithMany()
                  .HasForeignKey(e => e.ClientId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.Property(e => e.Amount).HasColumnType("decimal(18,2)");
        });

        // User Configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Username).IsUnique();
        });

        // Seed initial data
        SeedData(modelBuilder);
    }

    private void SeedData(ModelBuilder modelBuilder)
    {
        // Seed Services
        modelBuilder.Entity<Service>().HasData(
            new Service { Id = 1, Name = "In-bound Services", Description = "Nhận cuộc gọi từ khách hàng" },
            new Service { Id = 2, Name = "Out-bound Services", Description = "Nhân viên chủ động gọi cho khách hàng" },
            new Service { Id = 3, Name = "Tele Marketing Services", Description = "Dịch vụ tiếp thị và bán hàng qua điện thoại" }
        );

        // Seed Service Fees
        modelBuilder.Entity<ServiceFee>().HasData(
            new ServiceFee { Id = 1, ServiceId = 1, FeePerDayPerEmployee = 4500.00m },
            new ServiceFee { Id = 2, ServiceId = 2, FeePerDayPerEmployee = 6000.00m },
            new ServiceFee { Id = 3, ServiceId = 3, FeePerDayPerEmployee = 5500.00m }
        );

        // Seed Departments
        modelBuilder.Entity<Department>().HasData(
            new Department { Id = 1, Name = "HR", Description = "Human Resources" },
            new Department { Id = 2, Name = "Admin", Description = "Administration" },
            new Department { Id = 3, Name = "Service", Description = "Service Department" },
            new Department { Id = 4, Name = "Training", Description = "Training Department" },
            new Department { Id = 5, Name = "Internet Security", Description = "Internet Security Department" },
            new Department { Id = 6, Name = "Auditors", Description = "Auditing Department" }
        );

        // Seed default admin user (password: admin123)
        modelBuilder.Entity<User>().HasData(
            new User 
            { 
                Id = 1, 
                Username = "admin", 
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
                Email = "admin@excell-on.com",
                FullName = "Administrator",
                Role = "Admin"
            }
        );
    }
}

