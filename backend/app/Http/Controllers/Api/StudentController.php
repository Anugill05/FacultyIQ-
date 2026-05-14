<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Feedback;
use App\Models\Announcement;
use App\Models\Workshop;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class StudentController extends Controller
{
    public function dashboard()
    {
        $student = auth()->user();

        $feedbacksGiven = Feedback::where('student_id', $student->id)->count();

        $announcements = Announcement::where('is_active', true)
            ->where(fn($q) => $q->where('target_role', 'all')->orWhere('target_role', 'student'))
            ->where(fn($q) => $q->whereNull('expires_at')->orWhere('expires_at', '>=', now()))
            ->orderByDesc('created_at')
            ->take(5)
            ->get();

        $topTeachers = User::where('role', 'teacher')
            ->where('department', $student->department)
            ->with(['performanceScore' => fn($q) => $q->orderByDesc('overall_score')])
            ->get()
            ->sortByDesc(fn($t) => $t->performanceScore?->overall_score ?? 0)
            ->take(5)
            ->values()
            ->map(fn($t) => [
                'id' => $t->id,
                'name' => $t->name,
                'designation' => $t->designation,
                'avatar' => $t->avatar ? asset('storage/' . $t->avatar) : null,
                'score' => $t->performanceScore?->overall_score ?? 0,
                'avg_rating' => round(Feedback::where('teacher_id', $t->id)->avg('overall_rating') ?? 0, 2),
            ]);

        $upcomingWorkshops = Workshop::where('status', 'upcoming')
            ->orderBy('start_date')
            ->take(3)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'feedbacks_given' => $feedbacksGiven,
                'announcements' => $announcements,
                'top_teachers_in_department' => $topTeachers,
                'upcoming_workshops' => $upcomingWorkshops,
            ]
        ]);
    }

    public function getTeachers(Request $request)
    {
        $query = User::where('role', 'teacher')->where('is_active', true);

        if ($request->department) $query->where('department', $request->department);
        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('specialization', 'like', "%{$request->search}%");
            });
        }

        $teachers = $query->with('performanceScore')->orderBy('name')->paginate(12);

        $teachers->getCollection()->transform(function ($t) {
            return [
                'id' => $t->id,
                'name' => $t->name,
                'email' => $t->email,
                'department' => $t->department,
                'designation' => $t->designation,
                'specialization' => $t->specialization,
                'experience_years' => $t->experience_years,
                'qualification' => $t->qualification,
                'bio' => $t->bio,
                'avatar' => $t->avatar ? asset('storage/' . $t->avatar) : null,
                'score' => $t->performanceScore?->overall_score ?? 0,
                'grade' => $t->performanceScore?->grade ?? 'N/A',
                'avg_rating' => round(Feedback::where('teacher_id', $t->id)->avg('overall_rating') ?? 0, 2),
                'total_reviews' => Feedback::where('teacher_id', $t->id)->count(),
            ];
        });

        return response()->json(['success' => true, 'data' => $teachers]);
    }

    public function getTeacherProfile(string $id)
    {
        $teacher = User::where('role', 'teacher')->where('is_active', true)->findOrFail($id);

        $feedbacks = Feedback::where('teacher_id', $id)
            ->where(fn($q) => $q->where('is_anonymous', false)->orWhere('is_anonymous', null))
            ->orderByDesc('created_at')
            ->take(10)
            ->get(['overall_rating', 'comment', 'subject', 'created_at', 'ratings']);

        $ratingBreakdown = [1 => 0, 2 => 0, 3 => 0, 4 => 0, 5 => 0];
        foreach (Feedback::where('teacher_id', $id)->get() as $f) {
            $r = (int) round($f->overall_rating);
            if (isset($ratingBreakdown[$r])) $ratingBreakdown[$r]++;
        }

        $myFeedback = Feedback::where('teacher_id', $id)
            ->where('student_id', auth()->id())
            ->first();

        return response()->json([
            'success' => true,
            'data' => [
                'teacher' => [
                    'id' => $teacher->id,
                    'name' => $teacher->name,
                    'email' => $teacher->email,
                    'department' => $teacher->department,
                    'designation' => $teacher->designation,
                    'specialization' => $teacher->specialization,
                    'experience_years' => $teacher->experience_years,
                    'qualification' => $teacher->qualification,
                    'bio' => $teacher->bio,
                    'avatar' => $teacher->avatar ? asset('storage/' . $teacher->avatar) : null,
                ],
                'avg_rating' => round(Feedback::where('teacher_id', $id)->avg('overall_rating') ?? 0, 2),
                'total_reviews' => Feedback::where('teacher_id', $id)->count(),
                'rating_breakdown' => $ratingBreakdown,
                'feedbacks' => $feedbacks,
                'my_feedback' => $myFeedback,
            ]
        ]);
    }

    public function submitFeedback(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'teacher_id' => 'required|string',
            'subject' => 'required|string|max:100',
            'semester' => 'required|integer|in:1,2',
            'academic_year' => 'required|string',
            'ratings.teaching_quality' => 'required|integer|min:1|max:5',
            'ratings.communication' => 'required|integer|min:1|max:5',
            'ratings.subject_knowledge' => 'required|integer|min:1|max:5',
            'ratings.student_interaction' => 'required|integer|min:1|max:5',
            'ratings.punctuality' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
            'is_anonymous' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        // Check if already submitted for this teacher/semester
        $existing = Feedback::where('teacher_id', $request->teacher_id)
            ->where('student_id', auth()->id())
            ->where('academic_year', $request->academic_year)
            ->where('semester', $request->semester)
            ->first();

        if ($existing) {
            return response()->json(['success' => false, 'message' => 'Feedback already submitted for this teacher this semester'], 409);
        }

        // Ensure teacher exists
        $teacher = User::where('role', 'teacher')->find($request->teacher_id);
        if (!$teacher) {
            return response()->json(['success' => false, 'message' => 'Teacher not found'], 404);
        }

        $ratings = $request->ratings;
        $overall = array_sum($ratings) / count($ratings);

        $feedback = Feedback::create([
            'teacher_id' => $request->teacher_id,
            'student_id' => auth()->id(),
            'subject' => $request->subject,
            'semester' => $request->semester,
            'academic_year' => $request->academic_year,
            'ratings' => $ratings,
            'overall_rating' => round($overall, 2),
            'comment' => $request->comment,
            'is_anonymous' => $request->is_anonymous ?? false,
            'status' => 'pending',
        ]);

        return response()->json(['success' => true, 'message' => 'Feedback submitted successfully', 'data' => $feedback], 201);
    }

    public function getMyFeedbacks()
    {
        $feedbacks = Feedback::where('student_id', auth()->id())
            ->with('teacher:id,name,department,designation,avatar')
            ->orderByDesc('created_at')
            ->get();
        return response()->json(['success' => true, 'data' => $feedbacks]);
    }
}
