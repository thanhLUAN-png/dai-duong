using System.ComponentModel.DataAnnotations;

namespace WebApplication1.ViewModels;

public class RegisterViewModel
{
    [Required, Display(Name = "Tên hiển thị")] public string DisplayName { get; set; } = string.Empty;
    [Required, EmailAddress] public string Email { get; set; } = string.Empty;
    [Required, StringLength(100, MinimumLength = 6), DataType(DataType.Password), Display(Name = "Mật khẩu")] public string Password { get; set; } = string.Empty;
}
public class LoginViewModel
{
    [Required, EmailAddress] public string Email { get; set; } = string.Empty;
    [Required, DataType(DataType.Password), Display(Name = "Mật khẩu")] public string Password { get; set; } = string.Empty;
}
