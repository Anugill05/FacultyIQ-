<?php

namespace App\Services;

use Illuminate\Support\Facades\Mail;
use Illuminate\Mail\Message;

class MailService
{
    public function sendOtpEmail(string $email, string $name, string $otp): void
    {
        $appName = config('app.name', 'FacultyUp');
        $expiry = config('app.otp_expiry', 10);

        Mail::send([], [], function (Message $message) use ($email, $name, $otp, $appName, $expiry) {
            $message->to($email, $name)
                ->subject("[$appName] Email Verification OTP")
                ->html($this->buildOtpEmailHtml($name, $otp, $expiry, $appName));
        });
    }

    public function sendPasswordResetEmail(string $email, string $name, string $otp): void
    {
        $appName = config('app.name', 'FacultyUp');
        $expiry = config('app.otp_expiry', 10);

        Mail::send([], [], function (Message $message) use ($email, $name, $otp, $appName, $expiry) {
            $message->to($email, $name)
                ->subject("[$appName] Password Reset OTP")
                ->html($this->buildPasswordResetHtml($name, $otp, $expiry, $appName));
        });
    }

    public function sendWelcomeEmail(string $email, string $name, string $password): void
    {
        $appName = config('app.name', 'FacultyUp');

        Mail::send([], [], function (Message $message) use ($email, $name, $password, $appName) {
            $message->to($email, $name)
                ->subject("Welcome to $appName - Your Account Details")
                ->html($this->buildWelcomeEmailHtml($name, $email, $password, $appName));
        });
    }

    private function buildOtpEmailHtml(string $name, string $otp, int $expiry, string $appName): string
    {
        return <<<HTML
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Email Verification</title></head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Arial,sans-serif;background:#f0f4f8;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg,#1a237e 0%,#283593 50%,#3949ab 100%);padding:40px 32px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:28px;font-weight:700;letter-spacing:-0.5px;">🎓 $appName</h1>
      <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px;">LPU Faculty Development Platform</p>
    </div>
    <div style="padding:40px 32px;">
      <h2 style="color:#1a237e;margin:0 0 8px;font-size:22px;">Hello, $name! 👋</h2>
      <p style="color:#546e7a;margin:0 0 32px;line-height:1.6;">Please verify your email address to complete your registration. Use the OTP below:</p>
      <div style="background:#f8f9ff;border:2px dashed #3949ab;border-radius:12px;padding:28px;text-align:center;margin-bottom:32px;">
        <p style="margin:0 0 8px;color:#546e7a;font-size:13px;text-transform:uppercase;letter-spacing:1px;">Your Verification Code</p>
        <div style="font-size:48px;font-weight:800;color:#1a237e;letter-spacing:12px;font-family:monospace;">$otp</div>
        <p style="margin:12px 0 0;color:#f44336;font-size:13px;">⏰ Expires in $expiry minutes</p>
      </div>
      <p style="color:#90a4ae;font-size:13px;margin:0;line-height:1.6;">If you didn't request this, please ignore this email. Never share your OTP with anyone.</p>
    </div>
    <div style="background:#f8f9ff;padding:20px 32px;text-align:center;border-top:1px solid #e8eaf6;">
      <p style="margin:0;color:#90a4ae;font-size:12px;">© 2024 $appName — Lovely Professional University</p>
    </div>
  </div>
</body>
</html>
HTML;
    }

    private function buildPasswordResetHtml(string $name, string $otp, int $expiry, string $appName): string
    {
        return <<<HTML
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Password Reset</title></head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Arial,sans-serif;background:#f0f4f8;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg,#1a237e 0%,#283593 50%,#3949ab 100%);padding:40px 32px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:28px;font-weight:700;">🔐 Password Reset</h1>
      <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px;">$appName — LPU</p>
    </div>
    <div style="padding:40px 32px;">
      <h2 style="color:#1a237e;margin:0 0 8px;font-size:22px;">Hi $name,</h2>
      <p style="color:#546e7a;margin:0 0 32px;line-height:1.6;">We received a request to reset your password. Use this OTP to proceed:</p>
      <div style="background:#fff3e0;border:2px solid #ff9800;border-radius:12px;padding:28px;text-align:center;margin-bottom:32px;">
        <p style="margin:0 0 8px;color:#e65100;font-size:13px;text-transform:uppercase;letter-spacing:1px;">Reset Code</p>
        <div style="font-size:48px;font-weight:800;color:#e65100;letter-spacing:12px;font-family:monospace;">$otp</div>
        <p style="margin:12px 0 0;color:#f44336;font-size:13px;">⏰ Expires in $expiry minutes</p>
      </div>
    </div>
    <div style="background:#f8f9ff;padding:20px 32px;text-align:center;border-top:1px solid #e8eaf6;">
      <p style="margin:0;color:#90a4ae;font-size:12px;">© 2024 $appName — Lovely Professional University</p>
    </div>
  </div>
</body>
</html>
HTML;
    }

    private function buildWelcomeEmailHtml(string $name, string $email, string $password, string $appName): string
    {
        $loginUrl = config('app.frontend_url', 'http://localhost:3000') . '/login';
        return <<<HTML
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Welcome</title></head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Arial,sans-serif;background:#f0f4f8;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg,#1a237e 0%,#283593 50%,#3949ab 100%);padding:40px 32px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:28px;font-weight:700;">🎓 Welcome to $appName</h1>
    </div>
    <div style="padding:40px 32px;">
      <h2 style="color:#1a237e;margin:0 0 8px;">Dear $name,</h2>
      <p style="color:#546e7a;margin:0 0 24px;line-height:1.6;">Your faculty account has been created by the admin. Here are your login credentials:</p>
      <div style="background:#e8f5e9;border-radius:12px;padding:24px;margin-bottom:24px;">
        <p style="margin:0 0 8px;color:#2e7d32;"><strong>Email:</strong> $email</p>
        <p style="margin:0;color:#2e7d32;"><strong>Temporary Password:</strong> $password</p>
      </div>
      <p style="color:#546e7a;font-size:13px;margin-bottom:24px;">Please login and change your password immediately.</p>
      <a href="$loginUrl" style="display:inline-block;background:#1a237e;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;">Login to FacultyUp →</a>
    </div>
    <div style="background:#f8f9ff;padding:20px 32px;text-align:center;border-top:1px solid #e8eaf6;">
      <p style="margin:0;color:#90a4ae;font-size:12px;">© 2024 $appName — Lovely Professional University</p>
    </div>
  </div>
</body>
</html>
HTML;
    }
}
