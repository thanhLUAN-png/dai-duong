using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApplication1.Data;
using WebApplication1.Models;
using WebApplication1.ViewModels;

namespace WebApplication1.Controllers;

public class AccountController(OceanDbContext db) : Controller
{
    [HttpGet] public IActionResult Login(string? returnUrl = null) { ViewBag.ReturnUrl = returnUrl; return View(); }
    [HttpPost, ValidateAntiForgeryToken] public async Task<IActionResult> Login(LoginViewModel model, string? returnUrl = null)
    {
        if (!ModelState.IsValid) return View(model);
        var user = await db.Users.SingleOrDefaultAsync(x => x.Email == model.Email);
        if (user is null || string.IsNullOrEmpty(user.PasswordHash) || new PasswordHasher<User>().VerifyHashedPassword(user, user.PasswordHash, model.Password) == PasswordVerificationResult.Failed)
        { ModelState.AddModelError("", "Email hoặc mật khẩu chưa đúng."); return View(model); }
        await SignIn(user);
        return LocalRedirect(string.IsNullOrWhiteSpace(returnUrl) ? "/Studio" : returnUrl);
    }
    [HttpGet] public IActionResult Register() => View();
    [HttpPost, ValidateAntiForgeryToken] public async Task<IActionResult> Register(RegisterViewModel model)
    {
        if (!ModelState.IsValid) return View(model);
        if (await db.Users.AnyAsync(x => x.Email == model.Email)) { ModelState.AddModelError("Email", "Email này đã được đăng ký."); return View(model); }
        var user = new User { DisplayName = model.DisplayName.Trim(), Email = model.Email.Trim().ToLowerInvariant(), CreatedAt = DateTime.UtcNow };
        user.PasswordHash = new PasswordHasher<User>().HashPassword(user, model.Password);
        db.Users.Add(user); await db.SaveChangesAsync(); await SignIn(user);
        return RedirectToAction("Index", "Studio");
    }
    [HttpPost, ValidateAntiForgeryToken] public async Task<IActionResult> Logout() { await HttpContext.SignOutAsync(); return RedirectToAction("Index", "Home"); }
    private Task SignIn(User user) => HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, new ClaimsPrincipal(new ClaimsIdentity(new[] { new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()), new Claim(ClaimTypes.Name, user.DisplayName), new Claim(ClaimTypes.Role, user.Role) }, CookieAuthenticationDefaults.AuthenticationScheme)));
}
