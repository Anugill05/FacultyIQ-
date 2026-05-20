<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\OtpService;
use App\Services\MailService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    protected OtpService $otpService;
    protected MailService $mailService;

    public function __construct(OtpService $otpService, MailService $mailService)
    {
        $this->otpService = $otpService;
        $this->mailService = $mailService;
    }

    /**
     * Student Registration - Send OTP
     */
    public function registerSendOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|min:2|max:100',
            'email' => 'required|email|unique:mongodb.users,email',
            'password' => 'required|string|min:8|confirmed',
            'student_id' => 'required|string|unique:mongodb.users,student_id',
            'department' => 'required|string',
            'phone' => 'nullable|string|max:15',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Create unverified user
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'student',
            'student_id' => $request->student_id,
            'department' => $request->department,
            'phone' => $request->phone,
            'is_active' => false,
        ]);

        // Generate and send OTP
        try {
            $otp = $this->otpService->generateOtp($user);
            $this->mailService->sendOtpEmail($user->email, $user->name, $otp);
            } catch (\Exception $e) {
                $user->delete(); // rollback user creation
                return response()->json([
                'success' => false,
                'message' => 'Failed to send OTP email. Please try again.',
                'debug' => config('app.debug') ? $e->getMessage() : null,
                ], 500);
            }

        return response()->json([
            'success' => true,
            'message' => 'OTP sent to your email. Please verify to complete registration.',
            'user_id' => $user->id,
        ], 201);
    }

    /**
     * Verify OTP and activate account
     */
    public function verifyOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|string',
            'otp' => 'required|string|size:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::find($request->user_id);

        if (!$user) {
            return response()->json(['success' => false, 'message' => 'User not found'], 404);
        }

        $result = $this->otpService->verifyOtp($user, $request->otp);

        if (!$result['success']) {
            return response()->json(['success' => false, 'message' => $result['message']], 400);
        }

        $user->update([
            'is_active' => true,
            'email_verified_at' => now(),
            'otp' => null,
            'otp_expires_at' => null,
        ]);

        $token = JWTAuth::fromUser($user);

        return response()->json([
            'success' => true,
            'message' => 'Email verified successfully! Welcome to FacultyUp.',
            'token' => $token,
            'user' => $this->formatUser($user),
        ]);
    }

    /**
     * Login
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid email or password'
            ], 401);
        }

        if (!$user->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Account is inactive. Please contact admin.',
                'needs_verification' => !$user->email_verified_at,
                'user_id' => $user->id,
            ], 403);
        }

        if (!$user->email_verified_at) {
            $otp = $this->otpService->generateOtp($user);
            $this->mailService->sendOtpEmail($user->email, $user->name, $otp);
            return response()->json([
                'success' => false,
                'message' => 'Email not verified. OTP sent again.',
                'needs_verification' => true,
                'user_id' => $user->id,
            ], 403);
        }

        $token = JWTAuth::fromUser($user);

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'token' => $token,
            'user' => $this->formatUser($user),
        ]);
    }

    /**
     * Resend OTP
     */
    public function resendOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['success' => false, 'message' => 'User not found'], 404);
        }

        $otp = $this->otpService->generateOtp($user);
        $this->mailService->sendOtpEmail($user->email, $user->name, $otp);

        return response()->json([
            'success' => true,
            'message' => 'OTP resent successfully',
            'user_id' => $user->id,
        ]);
    }

    /**
     * Get authenticated user
     */
    public function me(Request $request)
    {
        $user = auth()->user();
        return response()->json([
            'success' => true,
            'user' => $this->formatUser($user),
        ]);
    }

    /**
     * Logout
     */
    public function logout()
    {
        try {
            JWTAuth::invalidate(JWTAuth::getToken());
            return response()->json(['success' => true, 'message' => 'Logged out successfully']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Failed to logout'], 500);
        }
    }

    /**
     * Forgot Password - Send OTP
     */
    public function forgotPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:mongodb.users,email',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $user = User::where('email', $request->email)->first();
        $otp = $this->otpService->generateOtp($user);
        $this->mailService->sendPasswordResetEmail($user->email, $user->name, $otp);

        return response()->json([
            'success' => true,
            'message' => 'Password reset OTP sent to your email.',
            'user_id' => $user->id,
        ]);
    }

    /**
     * Reset Password
     */
    public function resetPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|string',
            'otp' => 'required|string|size:6',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $user = User::find($request->user_id);
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'User not found'], 404);
        }

        $result = $this->otpService->verifyOtp($user, $request->otp);
        if (!$result['success']) {
            return response()->json(['success' => false, 'message' => $result['message']], 400);
        }

        $user->update([
            'password' => Hash::make($request->password),
            'otp' => null,
            'otp_expires_at' => null,
        ]);

        return response()->json(['success' => true, 'message' => 'Password reset successfully. Please login.']);
    }

    private function formatUser(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'avatar' => $user->avatar ? asset('storage/' . $user->avatar) : null,
            'department' => $user->department,
            'designation' => $user->designation,
            'employee_id' => $user->employee_id,
            'student_id' => $user->student_id,
            'is_active' => $user->is_active,
            'email_verified_at' => $user->email_verified_at,
        ];
    }
}
