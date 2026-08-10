using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApplication1.Data;
using WebApplication1.Models;

namespace WebApplication1.Controllers;

[Authorize]
public class StudioController(OceanDbContext db, IWebHostEnvironment environment) : Controller
{
    public async Task<IActionResult> Index() => View(await db.CreatureTemplates.Where(x => x.IsActive).OrderBy(x => x.Id).ToListAsync());

    public async Task<IActionResult> Color(int id)
    {
        var template = await db.CreatureTemplates.FindAsync(id);
        return template is null || !template.IsActive ? NotFound() : View(template);
    }

    [HttpPost, ValidateAntiForgeryToken]
    public async Task<IActionResult> Submit(int templateId, string? title, string imageData)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var template = await db.CreatureTemplates.FindAsync(templateId);
        if (template is null || string.IsNullOrWhiteSpace(imageData) || !imageData.StartsWith("data:image/png;base64,")) return BadRequest();
        var bytes = Convert.FromBase64String(imageData["data:image/png;base64,".Length..]);
        if (bytes.Length > 5_000_000) return BadRequest("Ảnh quá lớn.");
        var folder = Path.Combine(environment.WebRootPath, "uploads"); Directory.CreateDirectory(folder);
        var filename = $"{Guid.NewGuid():N}.png"; await System.IO.File.WriteAllBytesAsync(Path.Combine(folder, filename), bytes);
        db.ArtworkSubmissions.Add(new ArtworkSubmission { UserId = userId, TemplateId = templateId, Title = title?.Trim(), ImagePath = $"/uploads/{filename}", CreatedAt = DateTime.UtcNow });
        await db.SaveChangesAsync();
        TempData["Message"] = "Đã gửi tác phẩm! Sinh vật của bạn đang chờ được thả xuống biển.";
        return RedirectToAction(nameof(MyArt));
    }

    public async Task<IActionResult> MyArt()
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        return View(await db.ArtworkSubmissions.Include(x => x.Template).Where(x => x.UserId == userId).OrderByDescending(x => x.CreatedAt).ToListAsync());
    }
}
