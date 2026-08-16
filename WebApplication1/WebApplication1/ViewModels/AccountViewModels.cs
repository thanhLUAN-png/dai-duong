using System.ComponentModel.DataAnnotations;

namespace WebApplication1.ViewModels;

public class RegisterViewModel
{
    [Required, Display(Name = "Tên hiển thị")] public string DisplayName { get; set; } = string.Empty;
    [Required, EmailAddress] public string Email { get; set; } = string.Empty;
    [Required, StringLength(100, MinimumLength = 6), DataType(DataType.Password), Display(Name = "Mật khẩu")] public string Password { get; set; } = string.Empty;
    [Required, DataType(DataType.Password), Display(Name = "Nhập lại mật khẩu"), Compare(nameof(Password), ErrorMessage = "Mật khẩu nhập lại không khớp.")]
    public string ConfirmPassword { get; set; } = string.Empty;
}

public class LoginViewModel
{
    [Required, EmailAddress] public string Email { get; set; } = string.Empty;
    [Required, DataType(DataType.Password), Display(Name = "Mật khẩu")] public string Password { get; set; } = string.Empty;
}

public class OtpViewModel
{
    [Required, Display(Name = "Email")] public string Email { get; set; } = string.Empty;
    [Required, StringLength(6, MinimumLength = 6), Display(Name = "Mã OTP")] public string Otp { get; set; } = string.Empty;
}

public class PendingRegistration
{
    public string DisplayName { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}
