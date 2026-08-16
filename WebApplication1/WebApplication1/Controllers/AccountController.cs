using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using WebApplication1.Data;
using WebApplication1.Models;
using WebApplication1.Services;
using WebApplication1.ViewModels;

namespace WebApplication1.Controllers;

public class AccountController(OceanDbContext db, IEmailService emailService, IMemoryCache cache) : Controller
{
    // ─── Login ───────────────────────────────────────────────────────────────
    [HttpGet] public IActionResult Login(string? returnUrl = null) { ViewBag.ReturnUrl = returnUrl; return View(); }

    [HttpPost, ValidateAntiForgeryToken]
    public async Task<IActionResult> Login(LoginViewModel model, string? returnUrl = null)
    {
        if (!ModelState.IsValid) return View(model);
        var user = await db.Users.SingleOrDefaultAsync(x => x.Email == model.Email);
        if (user is null || string.IsNullOrEmpty(user.PasswordHash) ||
            new PasswordHasher<User>().VerifyHashedPassword(user, user.PasswordHash, model.Password) == PasswordVerificationResult.Failed)
        { ModelState.AddModelError("", "Email hoặc mật khẩu chưa đúng."); return View(model); }
        await SignIn(user);
        return LocalRedirect(string.IsNullOrWhiteSpace(returnUrl) ? "/Studio" : returnUrl);
    }

    // ─── Register ─────────────────────────────────────────────────────────────
    [HttpGet] public IActionResult Register() => View();

    [HttpPost, ValidateAntiForgeryToken]
    public async Task<IActionResult> Register(RegisterViewModel model)
    {
        if (!ModelState.IsValid) return View(model);
        var email = model.Email.Trim().ToLowerInvariant();
        if (await db.Users.AnyAsync(x => x.Email == email))
        { ModelState.AddModelError("Email", "Email này đã được đăng ký."); return View(model); }

        // Tạo OTP 6 số
        var otp = Random.Shared.Next(100000, 999999).ToString();

        // Lưu thông tin đăng ký + OTP vào cache, hiệu lực 5 phút
        cache.Set($"otp:{email}", otp, TimeSpan.FromMinutes(5));
        cache.Set($"reg:{email}", new PendingRegistration { DisplayName = model.DisplayName.Trim(), Password = model.Password }, TimeSpan.FromMinutes(5));

        // Gửi OTP qua email
        try { await emailService.SendOtpAsync(email, otp); }
        catch { ModelState.AddModelError("", "Không gửi được email. Vui lòng kiểm tra lại địa chỉ email."); return View(model); }

        // Dùng query string thay TempData cho đáng tin cậy hơn
        return RedirectToAction(nameof(VerifyOtp), new { e = email });
    }

    // ─── Verify OTP ───────────────────────────────────────────────────────────
    [HttpGet]
    public IActionResult VerifyOtp(string? e)
    {
        if (string.IsNullOrEmpty(e)) return RedirectToAction(nameof(Register));
        return View(new OtpViewModel { Email = e });
    }

    [HttpPost, ValidateAntiForgeryToken]
    public async Task<IActionResult> VerifyOtp(OtpViewModel model)
    {
        if (!ModelState.IsValid) return View(model);

        var email = model.Email.Trim().ToLowerInvariant();
        var cachedOtp = cache.Get<string>($"otp:{email}");

        if (cachedOtp is null)
        { ModelState.AddModelError("", "Mã OTP đã hết hạn. Vui lòng đăng ký lại."); return View(model); }
        if (cachedOtp != model.Otp.Trim())
        { ModelState.AddModelError("Otp", "Mã OTP không đúng. Vui lòng thử lại."); return View(model); }

        // OTP đúng → lấy thông tin đăng ký từ cache
        var reg = cache.Get<PendingRegistration>($"reg:{email}");
        cache.Remove($"otp:{email}");
        cache.Remove($"reg:{email}");

        if (reg is null)
        { ModelState.AddModelError("", "Phiên đăng ký đã hết hạn. Vui lòng đăng ký lại."); return View(model); }

        var user = new User
        {
            DisplayName = reg.DisplayName,
            Email = email,
            CreatedAt = DateTime.UtcNow
        };
        user.PasswordHash = new PasswordHasher<User>().HashPassword(user, reg.Password);
        db.Users.Add(user);
        await db.SaveChangesAsync();
        await SignIn(user);
        return RedirectToAction("Index", "Studio");
    }

    // ─── Resend OTP ───────────────────────────────────────────────────────────
    [HttpPost, ValidateAntiForgeryToken]
    public async Task<IActionResult> ResendOtp(string email)
    {
        email = email.Trim().ToLowerInvariant();
        var reg = cache.Get<PendingRegistration>($"reg:{email}");
        if (reg is null) return RedirectToAction(nameof(Register));

        var otp = Random.Shared.Next(100000, 999999).ToString();
        cache.Set($"otp:{email}", otp, TimeSpan.FromMinutes(5));

        try { await emailService.SendOtpAsync(email, otp); TempData["ResendOk"] = "Đã gửi lại mã OTP mới!"; }
        catch { TempData["ResendError"] = "Gửi lại thất bại. Thử lại sau."; }

        return RedirectToAction(nameof(VerifyOtp), new { e = email });
    }

    // ─── Logout ───────────────────────────────────────────────────────────────
    [HttpPost, ValidateAntiForgeryToken]
    public async Task<IActionResult> Logout() { await HttpContext.SignOutAsync(); return RedirectToAction("Index", "Home"); }

    private Task SignIn(User user) => HttpContext.SignInAsync(
        CookieAuthenticationDefaults.AuthenticationScheme,
        new ClaimsPrincipal(new ClaimsIdentity(
            new[] {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.DisplayName),
                new Claim(ClaimTypes.Role, user.Role)
            },
            CookieAuthenticationDefaults.AuthenticationScheme)));
}
