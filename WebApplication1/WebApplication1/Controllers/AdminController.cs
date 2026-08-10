using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApplication1.Data;
using WebApplication1.ViewModels;

namespace WebApplication1.Controllers;

[Authorize(Roles = "Admin")]
public class AdminController(OceanDbContext db) : Controller
{
    public async Task<IActionResult> Index()
    {
        var artworks = await db.ArtworkSubmissions.Include(x => x.User).Include(x => x.Template).OrderBy(x => x.CreatedAt).ToListAsync();
        return View(new AdminDashboardViewModel
        {
            Pending = artworks.Where(x => x.Status == "Pending").ToList(),
            InOcean = artworks.Where(x => x.Status == "Approved").OrderByDescending(x => x.ReviewedAt).ToList(),
            Trash = artworks.Where(x => x.Status == "RemovedFromOcean" || x.Status == "Rejected").OrderByDescending(x => x.ReviewedAt).ToList()
        });
    }
    [HttpPost, ValidateAntiForgeryToken] public async Task<IActionResult> Review(int id, bool approve, string? note)
    {
        var submission = await db.ArtworkSubmissions.FindAsync(id); if (submission is null) return NotFound();
        submission.Status = approve ? "Approved" : "Rejected"; submission.ReviewNote = note?.Trim(); submission.ReviewedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(); return RedirectToAction(nameof(Index));
    }

    [HttpPost, ValidateAntiForgeryToken]
    public async Task<IActionResult> RemoveFromOcean(int id)
    {
        var submission = await db.ArtworkSubmissions.FindAsync(id);
        if (submission is null)
        {
            TempData["OceanMessage"] = "Không tìm thấy cá này trong bể.";
            return RedirectToAction(nameof(Index));
        }
        if (submission.Status == "RemovedFromOcean")
        {
            TempData["UndoOceanId"] = submission.Id;
            TempData["OceanMessage"] = "Cá này đã được đưa ra khỏi bể trước đó.";
            return RedirectToAction(nameof(Index));
        }
        submission.Status = "RemovedFromOcean"; await db.SaveChangesAsync();
        TempData["UndoOceanId"] = submission.Id;
        TempData["OceanMessage"] = "Đã đưa cá ra khỏi bể.";
        return RedirectToAction(nameof(Index));
    }

    [HttpPost, ValidateAntiForgeryToken]
    public async Task<IActionResult> UndoRemoveFromOcean(int id)
    {
        var submission = await db.ArtworkSubmissions.FindAsync(id);
        if (submission is null)
        {
            TempData["OceanMessage"] = "Không tìm thấy cá để hoàn tác.";
            return RedirectToAction(nameof(Index));
        }
        if (submission.Status == "Approved")
        {
            TempData["OceanMessage"] = "Cá này đang ở trong bể.";
            return RedirectToAction(nameof(Index));
        }
        submission.Status = "Approved"; submission.ReviewedAt ??= DateTime.UtcNow; await db.SaveChangesAsync();
        TempData["OceanMessage"] = "Đã hoàn tác — cá đã trở lại bể.";
        return RedirectToAction(nameof(Index));
    }
}
