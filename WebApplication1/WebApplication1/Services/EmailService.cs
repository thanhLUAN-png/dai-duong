using System.Net;
using System.Net.Mail;

namespace WebApplication1.Services;

public interface IEmailService
{
    Task SendOtpAsync(string toEmail, string otp);
}

public class EmailService(IConfiguration config) : IEmailService
{
    public async Task SendOtpAsync(string toEmail, string otp)
    {
        var smtp = config.GetSection("Smtp");
        var host = smtp["Host"]!;
        var port = int.Parse(smtp["Port"]!);
        var user = smtp["User"]!;
        var pass = smtp["Password"]!;
        var from = smtp["From"]!;

        using var client = new SmtpClient(host, port)
        {
            EnableSsl = true,
            Credentials = new NetworkCredential(user, pass)
        };

        var mail = new MailMessage
        {
            From = new MailAddress(from, "Biển Của Chúng Mình 🐟"),
            Subject = "Mã xác nhận OTP của bạn",
            IsBodyHtml = true,
            Body = $"""
                <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#f0f8ff;border-radius:16px;">
                  <h2 style="color:#0077b6;">🌊 Biển Của Chúng Mình</h2>
                  <p>Chào bạn! Đây là mã OTP xác nhận email của bạn:</p>
                  <div style="font-size:40px;font-weight:bold;letter-spacing:12px;text-align:center;
                              padding:24px;background:#fff;border-radius:12px;color:#0077b6;margin:24px 0;">
                    {otp}
                  </div>
                  <p style="color:#666;">Mã có hiệu lực trong <strong>5 phút</strong>. Không chia sẻ mã này với ai nhé! 🐠</p>
                </div>
            """
        };
        mail.To.Add(toEmail);

        await client.SendMailAsync(mail);
    }
}
