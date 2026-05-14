<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\TeacherController;
use App\Http\Controllers\Api\StudentController;

/*
|--------------------------------------------------------------------------
| API Routes - FacultyUp LPU
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {

    // ======================== PUBLIC AUTH ROUTES ========================
    Route::prefix('auth')->group(function () {
        Route::post('/register', [AuthController::class, 'registerSendOtp']);
        Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);
        Route::post('/login', [AuthController::class, 'login']);
        Route::post('/resend-otp', [AuthController::class, 'resendOtp']);
        Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
        Route::post('/reset-password', [AuthController::class, 'resetPassword']);
    });

    // ======================== PROTECTED ROUTES ========================
    Route::middleware(['jwt.auth'])->group(function () {

        // Auth
        Route::prefix('auth')->group(function () {
            Route::get('/me', [AuthController::class, 'me']);
            Route::post('/logout', [AuthController::class, 'logout']);
        });

        // ======================== ADMIN ROUTES ========================
        Route::middleware(['role:admin'])->prefix('admin')->group(function () {
            Route::get('/dashboard', [AdminController::class, 'dashboard']);

            // Teachers CRUD
            Route::get('/teachers', [AdminController::class, 'getTeachers']);
            Route::post('/teachers', [AdminController::class, 'createTeacher']);
            Route::put('/teachers/{id}', [AdminController::class, 'updateTeacher']);
            Route::delete('/teachers/{id}', [AdminController::class, 'deleteTeacher']);

            // Students
            Route::get('/students', [AdminController::class, 'getStudents']);

            // Workshops CRUD
            Route::get('/workshops', [AdminController::class, 'getWorkshops']);
            Route::post('/workshops', [AdminController::class, 'createWorkshop']);
            Route::put('/workshops/{id}', [AdminController::class, 'updateWorkshop']);
            Route::delete('/workshops/{id}', [AdminController::class, 'deleteWorkshop']);

            // Announcements
            Route::get('/announcements', [AdminController::class, 'getAnnouncements']);
            Route::post('/announcements', [AdminController::class, 'createAnnouncement']);
            Route::delete('/announcements/{id}', [AdminController::class, 'deleteAnnouncement']);

            // Performance
            Route::post('/performance/generate', [AdminController::class, 'generatePerformanceReport']);
            Route::get('/performance/reports', [AdminController::class, 'getPerformanceReports']);

            // Achievements verification
            Route::get('/achievements/pending', [AdminController::class, 'getPendingAchievements']);
            Route::put('/achievements/{id}/verify', [AdminController::class, 'verifyAchievement']);
        });

        // ======================== TEACHER ROUTES ========================
        Route::middleware(['role:teacher'])->prefix('teacher')->group(function () {
            Route::get('/dashboard', [TeacherController::class, 'dashboard']);
            Route::get('/profile', [TeacherController::class, 'getProfile']);
            Route::post('/profile', [TeacherController::class, 'updateProfile']);
            Route::get('/feedbacks', [TeacherController::class, 'getMyFeedbacks']);
            Route::get('/achievements', [TeacherController::class, 'getAchievements']);
            Route::post('/achievements', [TeacherController::class, 'uploadAchievement']);
            Route::post('/workshops/{workshopId}/join', [TeacherController::class, 'joinWorkshop']);
            Route::get('/workshops', [TeacherController::class, 'getMyWorkshops']);
            Route::get('/performance', [TeacherController::class, 'getPerformanceHistory']);
        });

        // ======================== STUDENT ROUTES ========================
        Route::middleware(['role:student'])->prefix('student')->group(function () {
            Route::get('/dashboard', [StudentController::class, 'dashboard']);
            Route::get('/teachers', [StudentController::class, 'getTeachers']);
            Route::get('/teachers/{id}', [StudentController::class, 'getTeacherProfile']);
            Route::post('/feedback', [StudentController::class, 'submitFeedback']);
            Route::get('/feedbacks', [StudentController::class, 'getMyFeedbacks']);
        });

        // ======================== SHARED ROUTES ========================
        // Workshops (for teachers to browse)
        Route::middleware(['role:teacher,admin'])->get('/workshops', function () {
            return response()->json([
                'success' => true,
                'data' => \App\Models\Workshop::orderByDesc('start_date')->paginate(12)
            ]);
        });

        // Announcements (public within auth)
        Route::get('/announcements', function () {
            $role = auth()->user()->role;
            return response()->json([
                'success' => true,
                'data' => \App\Models\Announcement::where('is_active', true)
                    ->where(fn($q) => $q->where('target_role', 'all')->orWhere('target_role', $role))
                    ->where(fn($q) => $q->whereNull('expires_at')->orWhere('expires_at', '>=', now()))
                    ->orderByDesc('created_at')
                    ->get()
            ]);
        });
    });
});
