namespace WebApplication1.Models;

public class User
{
    public int Id { get; set; }
    public string? GoogleId { get; set; }
    public string DisplayName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? PasswordHash { get; set; }
    public string Role { get; set; } = "User";
    public DateTime CreatedAt { get; set; }
    public ICollection<ArtworkSubmission> Submissions { get; set; } = new List<ArtworkSubmission>();
}
