using WebApplication1.Models;

namespace WebApplication1.ViewModels;

public class AdminDashboardViewModel
{
    public List<ArtworkSubmission> Pending { get; set; } = [];
    public List<ArtworkSubmission> InOcean { get; set; } = [];
    public List<ArtworkSubmission> Trash { get; set; } = [];
}
