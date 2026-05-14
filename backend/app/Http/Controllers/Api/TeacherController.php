<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Achievement;
use App\Models\Feedback;
use App\Models\Workshop;
use App\Models\WorkshopParticipant;
use App\Models\Attendance;
use App\Models\PerformanceScore;
use App\Models\Announcement;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class TeacherController extends Controller
{
    public function dashboard()
    {
        $teacher = auth()->user();

        $performanceScore = PerformanceScore::where('teacher_id', $teacher->id)
            ->orderByDesc('calculated_at')
            ->first();

        $feedbackStats = [
            'total' => Feedback::where('teacher_id', $teacher->id)->count(),
            'avg_rating' => round(Feedback::where('teacher_id', $teacher->id)->avg('overall_rating') ?? 0, 2),
            'recent' => Feedback::where('teacher_id', $teacher->id)
                ->orderByDesc('created_at')
                ->take(5)
                ->get(['overall_rating', 'comment', 'is_anonymous', 'subject', 'created_at']),
        ];

        $achievements = Achievement::where('teacher_id', $teacher->id)
            ->orderByDesc('date_achieved')
            ->take(5)
            ->get();

        $workshopsJoined = WorkshopParticipant::where('user_id', $teacher->id)
            ->with('workshop:id,title,category,start_date,status,points_awarded')
            ->orderByDesc('registered_at')
            ->take(5)
            ->get();

        $upcomingWorkshops = Workshop::where('status', 'upcoming')
            ->where('registration_deadline', '>=', now()->toDateString())
            ->orderBy('start_date')
            ->take(5)
            ->get();

        $announcements = Announcement::where('is_active', true)
            ->where(fn($q) => $q->where('target_role', 'all')->orWhere('target_role', 'teacher'))
            ->where(fn($q) => $q->whereNull('expires_at')->orWhere('expires_at', '>=', now()))
            ->orderByDesc('created_at')
            ->take(5)
            ->get();

        $latestAttendance = Attendance::where('teacher_id', $teacher->id)
            ->orderByDesc('year')->orderByDesc('month')
            ->first();

        return response()->json([
            'success' => true,
            'data' => [
                'performance_score' => $performanceScore,
                'feedback_stats' => $feedbackStats,
                'achievements' => $achievements,
                'workshops_joined' => $workshopsJoined,
                'upcoming_workshops' => $upcomingWorkshops,
                'announcements' => $announcements,
                'latest_attendance' => $latestAttendance,
                'badges' => $this->getBadges($teacher->id),
            ]
        ]);
    }

    public function getProfile()
    {
        $teacher = auth()->user();
        $score = PerformanceScore::where('teacher_id', $teacher->id)->latest('calculated_at')->first();

        return response()->json([
            'success' => true,
            'data' => [
                'user' => $teacher,
                'performance_score' => $score,
                'total_achievements' => Achievement::where('teacher_id', $teacher->id)->where('verified', true)->count(),
                'total_workshops' => WorkshopParticipant::where('user_id', $teacher->id)->where('status', 'completed')->count(),
                'avg_rating' => round(Feedback::where('teacher_id', $teacher->id)->avg('overall_rating') ?? 0, 2),
            ]
        ]);
    }

    public function updateProfile(Request $request)
    {
        $teacher = auth()->user();

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:100',
            'phone' => 'nullable|string|max:15',
            'bio' => 'nullable|string|max:500',
            'specialization' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        if ($request->hasFile('avatar')) {
            $path = $request->file('avatar')->store('avatars', 'public');
            $teacher->update(['avatar' => $path]);
        }

        $teacher->update($validator->validated());
        return response()->json(['success' => true, 'data' => $teacher]);
    }

    public function uploadAchievement(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:200',
            'description' => 'required|string',
            'category' => 'required|in:publication,award,certification,conference,patent,project',
            'date_achieved' => 'required|date',
            'issuing_organization' => 'required|string',
            'certificate' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $certificateUrl = null;
        if ($request->hasFile('certificate')) {
            $certificateUrl = $request->file('certificate')->store('certificates', 'public');
        }

        $points = match($request->category) {
            'publication' => 25,
            'patent' => 30,
            'award' => 20,
            'certification' => 15,
            'conference' => 15,
            'project' => 20,
            default => 10,
        };

        $achievement = Achievement::create([
            'teacher_id' => auth()->id(),
            'title' => $request->title,
            'description' => $request->description,
            'category' => $request->category,
            'date_achieved' => $request->date_achieved,
            'issuing_organization' => $request->issuing_organization,
            'certificate_url' => $certificateUrl,
            'points' => $points,
            'verified' => false,
        ]);

        return response()->json(['success' => true, 'message' => 'Achievement submitted for verification', 'data' => $achievement], 201);
    }

    public function getAchievements()
    {
        $achievements = Achievement::where('teacher_id', auth()->id())
            ->orderByDesc('date_achieved')
            ->get();
        return response()->json(['success' => true, 'data' => $achievements]);
    }

    public function joinWorkshop(string $workshopId)
    {
        $workshop = Workshop::findOrFail($workshopId);

        if ($workshop->status !== 'upcoming') {
            return response()->json(['success' => false, 'message' => 'Registration closed'], 400);
        }

        if (now()->toDateString() > $workshop->registration_deadline) {
            return response()->json(['success' => false, 'message' => 'Registration deadline passed'], 400);
        }

        if ($workshop->current_participants >= $workshop->max_participants) {
            return response()->json(['success' => false, 'message' => 'Workshop is full'], 400);
        }

        $existing = WorkshopParticipant::where('workshop_id', $workshopId)
            ->where('user_id', auth()->id())
            ->first();

        if ($existing) {
            return response()->json(['success' => false, 'message' => 'Already registered'], 409);
        }

        WorkshopParticipant::create([
            'workshop_id' => $workshopId,
            'user_id' => auth()->id(),
            'status' => 'registered',
            'registered_at' => now(),
        ]);

        $workshop->increment('current_participants');

        return response()->json(['success' => true, 'message' => 'Registered for workshop successfully']);
    }

    public function getMyWorkshops()
    {
        $workshops = WorkshopParticipant::where('user_id', auth()->id())
            ->with('workshop')
            ->orderByDesc('registered_at')
            ->get();
        return response()->json(['success' => true, 'data' => $workshops]);
    }

    public function getMyFeedbacks(Request $request)
    {
        $query = Feedback::where('teacher_id', auth()->id());
        if ($request->semester) $query->where('semester', $request->semester);
        if ($request->academic_year) $query->where('academic_year', $request->academic_year);

        $feedbacks = $query->orderByDesc('created_at')->paginate(10);

        $stats = [
            'avg_rating' => round(Feedback::where('teacher_id', auth()->id())->avg('overall_rating') ?? 0, 2),
            'total_reviews' => Feedback::where('teacher_id', auth()->id())->count(),
            'rating_breakdown' => $this->getRatingBreakdown(auth()->id()),
        ];

        return response()->json(['success' => true, 'data' => $feedbacks, 'stats' => $stats]);
    }

    public function getPerformanceHistory()
    {
        $scores = PerformanceScore::where('teacher_id', auth()->id())
            ->orderByDesc('calculated_at')
            ->get();
        return response()->json(['success' => true, 'data' => $scores]);
    }

    private function getRatingBreakdown(string $teacherId): array
    {
        $feedbacks = Feedback::where('teacher_id', $teacherId)->get();
        $breakdown = [1 => 0, 2 => 0, 3 => 0, 4 => 0, 5 => 0];

        foreach ($feedbacks as $f) {
            $rating = (int) round($f->overall_rating);
            if (isset($breakdown[$rating])) $breakdown[$rating]++;
        }

        return $breakdown;
    }

    private function getBadges(string $teacherId): array
    {
        $score = PerformanceScore::where('teacher_id', $teacherId)->latest('calculated_at')->first();
        $workshopCount = WorkshopParticipant::where('user_id', $teacherId)->where('status', 'completed')->count();
        $achievementCount = Achievement::where('teacher_id', $teacherId)->where('verified', true)->count();

        $badges = [];

        if ($score && $score->overall_score >= 90) {
            $badges[] = ['icon' => '⭐', 'name' => 'Star Performer', 'color' => '#FFD700'];
        }
        if ($workshopCount >= 5) {
            $badges[] = ['icon' => '🏆', 'name' => 'Workshop Champion', 'color' => '#FF6B35'];
        }
        if ($achievementCount >= 3) {
            $badges[] = ['icon' => '🎓', 'name' => 'Research Star', 'color' => '#4ECDC4'];
        }
        if ($score && $score->attendance_score >= 95) {
            $badges[] = ['icon' => '✅', 'name' => 'Perfect Attendance', 'color' => '#45B7D1'];
        }

        return $badges;
    }
}
