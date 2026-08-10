namespace WebApplication1.Models;

public class ArtworkSubmission
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int TemplateId { get; set; }
    public string? Title { get; set; }
    public string ImagePath { get; set; } = string.Empty;
    public string Status { get; set; } = "Pending";
    public string? ReviewNote { get; set; }
    public DateTime? ReviewedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public User User { get; set; } = null!;
    public CreatureTemplate Template { get; set; } = null!;
}
