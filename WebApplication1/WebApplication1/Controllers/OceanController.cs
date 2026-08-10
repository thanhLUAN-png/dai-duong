using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApplication1.Data;

namespace WebApplication1.Controllers;

public class OceanController(OceanDbContext db) : Controller
{
    public async Task<IActionResult> Index()
    {
        try
        {
            var creatures = await db.ArtworkSubmissions.Include(x => x.User).Include(x => x.Template).Where(x => x.Status == "Approved").OrderByDescending(x => x.ReviewedAt).ToListAsync();
            return View(creatures);
        }
        catch
        {
            return View(Array.Empty<WebApplication1.Models.ArtworkSubmission>());
        }
    }
}
