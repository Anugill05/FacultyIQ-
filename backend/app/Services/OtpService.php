<?php

namespace App\Services;

use App\Models\User;

class OtpService
{
    public function generateOtp(User $user): string
    {
        $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        $user->update([
            'otp' => $otp,
            'otp_expires_at' => now()->addMinutes(config('app.otp_expiry', 10)),
        ]);

        return $otp;
    }

    public function verifyOtp(User $user, string $otp): array
    {
        if (!$user->otp) {
            return ['success' => false, 'message' => 'No OTP found. Please request a new one.'];
        }

        if (now()->isAfter($user->otp_expires_at)) {
            return ['success' => false, 'message' => 'OTP has expired. Please request a new one.'];
        }

        if ($user->otp !== $otp) {
            return ['success' => false, 'message' => 'Invalid OTP. Please try again.'];
        }

        return ['success' => true, 'message' => 'OTP verified successfully'];
    }
}
