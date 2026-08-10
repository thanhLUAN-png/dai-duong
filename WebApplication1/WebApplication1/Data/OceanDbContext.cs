using Microsoft.EntityFrameworkCore;
using WebApplication1.Models;

namespace WebApplication1.Data;

public class OceanDbContext(DbContextOptions<OceanDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<CreatureTemplate> CreatureTemplates => Set<CreatureTemplate>();
    public DbSet<ArtworkSubmission> ArtworkSubmissions => Set<ArtworkSubmission>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>().HasIndex(x => x.Email).IsUnique();
        modelBuilder.Entity<ArtworkSubmission>().HasOne(x => x.User).WithMany(x => x.Submissions).HasForeignKey(x => x.UserId);
        modelBuilder.Entity<ArtworkSubmission>().HasOne(x => x.Template).WithMany().HasForeignKey(x => x.TemplateId);
    }
}
