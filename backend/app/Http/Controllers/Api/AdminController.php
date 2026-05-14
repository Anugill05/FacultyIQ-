<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Workshop;
use App\Models\Announcement;
use App\Models\PerformanceScore;
use App\Models\Feedback;
use App\Models\Achievement;
use App\Services\MailService;
use App\Services\PerformanceService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class AdminController extends Controller
{
    public function __construct(
        private MailService $mailService,
        private PerformanceService $performanceService
    ) {}

    // ==================== DASHBOARD ====================

    public function dashboard()
    {
        $totalTeachers = User::where('role', 'teacher')->count();
        $totalStudents = User::where('role', 'student')->count();
        $totalWorkshops = Workshop::count();
        $avgPerformance = PerformanceScore::avg('overall_score') ?? 0;

        $departmentPerformance = PerformanceScore::raw(function ($collection) {
            return $collection->aggregate([
                ['$lookup' => [
                    'from' => 'users',
                    'localField' => 'teacher_id',
                    'foreignField' => '_id',
                    'as' => 'teacher'
                ]],
                ['$unwind' => '$teacher'],
                ['$group' => [
                    '_id' => '$teacher.department',
                    'avg_score' => ['$avg' => '$overall_score'],
                    'count' => ['$sum' => 1]
                ]],
                ['$sort' => ['avg_score' => -1]]
            ]);
        });

        $topPerformers = User::where('role', 'teacher')
            ->with(['performanceScore' => fn($q) => $q->orderByDesc('overall_score')])
            ->get()
            ->sortByDesc(fn($t) => $t->performanceScore?->overall_score ?? 0)
            ->take(5)
            ->values();

        $workshopStats = [
            'upcoming' => Workshop::where('status', 'upcoming')->count(),
            'ongoing' => Workshop::where('status', 'ongoing')->count(),
            'completed' => Workshop::where('status', 'completed')->count(),
        ];

        $recentFeedbacks = Feedback::with(['teacher:id,name,department', 'student:id,name'])
            ->orderByDesc('created_at')
            ->take(5)
            ->get();

        $gradeDistribution = PerformanceScore::raw(function ($collection) {
            return $collection->aggregate([
                ['$group' => ['_id' => '$grade', 'count' => ['$sum' => 1]]],
                ['$sort' => ['_id' => 1]]
            ]);
        });

        return response()->json([
            'success' => true,
            'data' => [
                'stats' => [
                    'total_teachers' => $totalTeachers,
                    'total_students' => $totalStudents,
                    'total_workshops' => $totalWorkshops,
                    'avg_performance' => round($avgPerformance, 1),
                ],
                'department_performance' => collect($departmentPerformance)->values(),
                'top_performers' => $topPerformers->map(fn($t) => [
                    'id' => $t->id,
                    'name' => $t->name,
                    'department' => $t->department,
                    'designation' => $t->designation,
                    'avatar' => $t->avatar ? asset('storage/' . $t->avatar) : null,
                    'score' => $t->performanceScore?->overall_score ?? 0,
                    'grade' => $t->performanceScore?->grade ?? 'N/A',
                    'badge' => $t->performanceScore?->badge ?? 'N/A',
                ]),
                'workshop_stats' => $workshopStats,
                'recent_feedbacks' => $recentFeedbacks,
                'grade_distribution' => collect($gradeDistribution)->values(),
            ]
        ]);
    }

    // ==================== TEACHERS ====================

    public function getTeachers(Request $request)
    {
        $query = User::where('role', 'teacher');

        if ($request->department) $query->where('department', $request->department);
        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%")
                  ->orWhere('employee_id', 'like', "%{$request->search}%");
            });
        }

        $teachers = $query->with('performanceScore')
            ->orderBy('name')
            ->paginate($request->per_page ?? 15);

        return response()->json(['success' => true, 'data' => $teachers]);
    }

    public function createTeacher(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|min:2|max:100',
            'email' => 'required|email|unique:mongodb.users,email',
            'employee_id' => 'required|string|unique:mongodb.users,employee_id',
            'department' => 'required|string',
            'designation' => 'required|string',
            'qualification' => 'required|string',
            'specialization' => 'nullable|string',
            'experience_years' => 'required|integer|min:0',
            'phone' => 'nullable|string|max:15',
            'bio' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $tempPassword = Str::random(10);

        $teacher = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($tempPassword),
            'role' => 'teacher',
            'employee_id' => $request->employee_id,
            'department' => $request->department,
            'designation' => $request->designation,
            'qualification' => $request->qualification,
            'specialization' => $request->specialization,
            'experience_years' => $request->experience_years,
            'phone' => $request->phone,
            'bio' => $request->bio,
            'is_active' => true,
            'email_verified_at' => now(),
            'created_by' => auth()->id(),
        ]);

        $this->mailService->sendWelcomeEmail($teacher->email, $teacher->name, $tempPassword);

        return response()->json([
            'success' => true,
            'message' => 'Teacher account created. Welcome email sent.',
            'data' => $teacher,
        ], 201);
    }

    public function updateTeacher(Request $request, string $id)
    {
        $teacher = User::where('role', 'teacher')->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|min:2|max:100',
            'department' => 'sometimes|string',
            'designation' => 'sometimes|string',
            'qualification' => 'sometimes|string',
            'specialization' => 'nullable|string',
            'experience_years' => 'sometimes|integer|min:0',
            'phone' => 'nullable|string|max:15',
            'bio' => 'nullable|string|max:500',
            'is_active' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $teacher->update($validator->validated());

        return response()->json(['success' => true, 'message' => 'Teacher updated', 'data' => $teacher]);
    }

    public function deleteTeacher(string $id)
    {
        $teacher = User::where('role', 'teacher')->findOrFail($id);
        $teacher->delete();
        return response()->json(['success' => true, 'message' => 'Teacher removed']);
    }

    // ==================== STUDENTS ====================

    public function getStudents(Request $request)
    {
        $query = User::where('role', 'student');
        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%")
                  ->orWhere('student_id', 'like', "%{$request->search}%");
            });
        }
        $students = $query->orderBy('name')->paginate($request->per_page ?? 15);
        return response()->json(['success' => true, 'data' => $students]);
    }

    // ==================== WORKSHOPS ====================

    public function createWorkshop(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:200',
            'description' => 'required|string',
            'category' => 'required|in:technical,pedagogical,research,soft_skills,leadership',
            'facilitator' => 'required|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'start_time' => 'required|string',
            'end_time' => 'required|string',
            'venue' => 'required|string',
            'mode' => 'required|in:online,offline,hybrid',
            'max_participants' => 'required|integer|min:1',
            'registration_deadline' => 'required|date|before:start_date',
            'points_awarded' => 'required|integer|min:0',
            'certificate_provided' => 'boolean',
            'tags' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $workshop = Workshop::create([
            ...$validator->validated(),
            'status' => 'upcoming',
            'current_participants' => 0,
            'created_by' => auth()->id(),
        ]);

        return response()->json(['success' => true, 'message' => 'Workshop created', 'data' => $workshop], 201);
    }

    public function getWorkshops(Request $request)
    {
        $query = Workshop::with('createdBy:id,name');
        if ($request->status) $query->where('status', $request->status);
        if ($request->category) $query->where('category', $request->category);

        $workshops = $query->orderByDesc('start_date')->paginate($request->per_page ?? 12);
        return response()->json(['success' => true, 'data' => $workshops]);
    }

    public function updateWorkshop(Request $request, string $id)
    {
        $workshop = Workshop::findOrFail($id);
        $workshop->update($request->all());
        return response()->json(['success' => true, 'data' => $workshop]);
    }

    public function deleteWorkshop(string $id)
    {
        Workshop::findOrFail($id)->delete();
        return response()->json(['success' => true, 'message' => 'Workshop deleted']);
    }

    // ==================== PERFORMANCE REPORTS ====================

    public function generatePerformanceReport(Request $request)
    {
        $request->validate([
            'academic_year' => 'required|string',
            'semester' => 'required|integer|in:1,2',
            'teacher_id' => 'nullable|string',
        ]);

        if ($request->teacher_id) {
            $score = $this->performanceService->calculateScore(
                $request->teacher_id,
                $request->academic_year,
                $request->semester
            );
            return response()->json(['success' => true, 'data' => $score->load('teacher')]);
        }

        $teachers = User::where('role', 'teacher')->where('is_active', true)->get();
        $results = [];

        foreach ($teachers as $teacher) {
            $results[] = $this->performanceService->calculateScore(
                $teacher->id,
                $request->academic_year,
                $request->semester
            );
        }

        return response()->json([
            'success' => true,
            'message' => "Performance calculated for {$teachers->count()} teachers",
            'data' => PerformanceScore::where('academic_year', $request->academic_year)
                ->where('semester', $request->semester)
                ->with('teacher:id,name,department,designation,avatar')
                ->orderByDesc('overall_score')
                ->get()
        ]);
    }

    public function getPerformanceReports(Request $request)
    {
        $query = PerformanceScore::with('teacher:id,name,department,designation,avatar,employee_id');

        if ($request->academic_year) $query->where('academic_year', $request->academic_year);
        if ($request->semester) $query->where('semester', $request->semester);
        if ($request->department) {
            $query->whereHas('teacher', fn($q) => $q->where('department', $request->department));
        }

        $scores = $query->orderByDesc('overall_score')->paginate($request->per_page ?? 15);
        return response()->json(['success' => true, 'data' => $scores]);
    }

    // ==================== ANNOUNCEMENTS ====================

    public function createAnnouncement(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:200',
            'content' => 'required|string',
            'type' => 'required|in:info,warning,success,urgent',
            'target_role' => 'required|in:all,teacher,student',
            'expires_at' => 'nullable|date|after:now',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $announcement = Announcement::create([
            ...$validator->validated(),
            'created_by' => auth()->id(),
            'is_active' => true,
        ]);

        return response()->json(['success' => true, 'data' => $announcement], 201);
    }

    public function getAnnouncements()
    {
        $announcements = Announcement::with('author:id,name')
            ->orderByDesc('created_at')
            ->paginate(10);
        return response()->json(['success' => true, 'data' => $announcements]);
    }

    public function deleteAnnouncement(string $id)
    {
        Announcement::findOrFail($id)->delete();
        return response()->json(['success' => true, 'message' => 'Announcement deleted']);
    }

    // ==================== ACHIEVEMENTS VERIFICATION ====================

    public function getPendingAchievements()
    {
        $achievements = Achievement::where('verified', false)
            ->with('teacher:id,name,department')
            ->orderByDesc('created_at')
            ->get();
        return response()->json(['success' => true, 'data' => $achievements]);
    }

    public function verifyAchievement(string $id)
    {
        $achievement = Achievement::findOrFail($id);
        $achievement->update([
            'verified' => true,
            'verified_by' => auth()->id(),
            'verified_at' => now(),
        ]);
        return response()->json(['success' => true, 'message' => 'Achievement verified']);
    }
}
