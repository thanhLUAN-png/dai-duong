using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using WebApplication1.Data;
using WebApplication1.Models;

namespace WebApplication1.Controllers
{
    public class HomeController : Controller
    {
        private readonly OceanDbContext _db;
        public HomeController(OceanDbContext db) => _db = db;

        public IActionResult Index()
        {
            ViewBag.ApprovedCount  = _db.ArtworkSubmissions.Count(a => a.Status == "Approved");
            ViewBag.TemplateCount  = _db.CreatureTemplates.Count(t => t.IsActive);
            ViewBag.ArtistCount    = _db.Users.Count();
            return View();
        }

        public IActionResult Privacy()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
