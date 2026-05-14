<?php

namespace App\Services;

use App\Models\User;
use App\Models\Feedback;
use App\Models\Achievement;
use App\Models\WorkshopParticipant;
use App\Models\Attendance;
use App\Models\PerformanceScore;

class PerformanceService
{
    // Weights for scoring components
    const WEIGHTS = [
        'student_rating' => 0.30,
        'attendance'     => 0.20,
        'achievement'    => 0.25,
        'workshop'       => 0.15,
        'feedback'       => 0.10,
    ];

    public function calculateScore(string $teacherId, string $academicYear, int $semester): PerformanceScore
    {
        $teacher = User::findOrFail($teacherId);

        // 1. Student Rating Score (0-100)
        $ratingScore = $this->calculateRatingScore($teacherId, $academicYear, $semester);

        // 2. Attendance Score (0-100)
        $attendanceScore = $this->calculateAttendanceScore($teacherId, $academicYear);

        // 3. Achievement Score (0-100)
        $achievementScore = $this->calculateAchievementScore($teacherId, $academicYear);

        // 4. Workshop Score (0-100)
        $workshopScore = $this->calculateWorkshopScore($teacherId, $academicYear);

        // 5. Feedback Sentiment Score (0-100)
        $feedbackScore = $this->calculateFeedbackSentimentScore($teacherId, $academicYear, $semester);

        // Weighted Overall Score
        $overall = (
            $ratingScore    * self::WEIGHTS['student_rating'] +
            $attendanceScore * self::WEIGHTS['attendance'] +
            $achievementScore * self::WEIGHTS['achievement'] +
            $workshopScore   * self::WEIGHTS['workshop'] +
            $feedbackScore   * self::WEIGHTS['feedback']
        );

        $grade = $this->getGrade($overall);
        $badge = $this->getBadge($overall);

        $score = PerformanceScore::updateOrCreate(
            [
                'teacher_id' => $teacherId,
                'academic_year' => $academicYear,
                'semester' => $semester,
            ],
            [
                'student_rating_score' => round($ratingScore, 2),
                'attendance_score' => round($attendanceScore, 2),
                'achievement_score' => round($achievementScore, 2),
                'workshop_score' => round($workshopScore, 2),
                'feedback_sentiment_score' => round($feedbackScore, 2),
                'overall_score' => round($overall, 2),
                'grade' => $grade,
                'badge' => $badge,
                'calculated_at' => now(),
            ]
        );

        // Update department rank
        $this->updateDepartmentRanks($teacher->department, $academicYear, $semester);

        return $score;
    }

    private function calculateRatingScore(string $teacherId, string $academicYear, int $semester): float
    {
        $feedbacks = Feedback::where('teacher_id', $teacherId)
            ->where('academic_year', $academicYear)
            ->where('semester', $semester)
            ->get();

        if ($feedbacks->isEmpty()) return 70.0; // Default neutral score

        $avgRating = $feedbacks->avg('overall_rating');
        return ($avgRating / 5) * 100;
    }

    private function calculateAttendanceScore(string $teacherId, string $academicYear): float
    {
        $year = (int) explode('-', $academicYear)[0];
        $attendances = Attendance::where('teacher_id', $teacherId)
            ->where('year', $year)
            ->get();

        if ($attendances->isEmpty()) return 75.0;

        return $attendances->avg('attendance_percentage');
    }

    private function calculateAchievementScore(string $teacherId, string $academicYear): float
    {
        $year = (int) explode('-', $academicYear)[0];

        $achievements = Achievement::where('teacher_id', $teacherId)
            ->where('verified', true)
            ->whereYear('date_achieved', $year)
            ->get();

        $totalPoints = $achievements->sum('points');

        // Scale: 100 points = 100% score, cap at 100
        return min(100, $totalPoints);
    }

    private function calculateWorkshopScore(string $teacherId, string $academicYear): float
    {
        $participations = WorkshopParticipant::where('user_id', $teacherId)
            ->where('status', 'completed')
            ->with('workshop')
            ->get()
            ->filter(fn($p) => $p->workshop && str_contains($p->workshop->start_date, explode('-', $academicYear)[0]));

        $count = $participations->count();

        // 0 = 0%, 5+ = 100%
        return min(100, ($count / 5) * 100);
    }

    private function calculateFeedbackSentimentScore(string $teacherId, string $academicYear, int $semester): float
    {
        $feedbacks = Feedback::where('teacher_id', $teacherId)
            ->where('academic_year', $academicYear)
            ->where('semester', $semester)
            ->whereNotNull('comment')
            ->pluck('comment');

        if ($feedbacks->isEmpty()) return 70.0;

        $positiveKeywords = ['excellent', 'great', 'good', 'wonderful', 'best', 'helpful', 'clear', 'inspiring', 'knowledgeable', 'professional', 'amazing', 'fantastic'];
        $negativeKeywords = ['bad', 'poor', 'worst', 'boring', 'unclear', 'unhelpful', 'confusing', 'disappointing', 'lacks', 'improve'];

        $positiveCount = 0;
        $negativeCount = 0;

        foreach ($feedbacks as $comment) {
            $lower = strtolower($comment);
            foreach ($positiveKeywords as $kw) {
                if (str_contains($lower, $kw)) $positiveCount++;
            }
            foreach ($negativeKeywords as $kw) {
                if (str_contains($lower, $kw)) $negativeCount++;
            }
        }

        $total = $positiveCount + $negativeCount;
        if ($total === 0) return 70.0;

        return ($positiveCount / $total) * 100;
    }

    private function getGrade(float $score): string
    {
        return match(true) {
            $score >= 90 => 'A+',
            $score >= 80 => 'A',
            $score >= 70 => 'B+',
            $score >= 60 => 'B',
            $score >= 50 => 'C',
            default      => 'D',
        };
    }

    private function getBadge(float $score): string
    {
        return match(true) {
            $score >= 90 => 'star_performer',
            $score >= 80 => 'excellence',
            $score >= 70 => 'rising_star',
            $score >= 60 => 'consistent',
            default      => 'needs_improvement',
        };
    }

    private function updateDepartmentRanks(string $department, string $academicYear, int $semester): void
    {
        $scores = PerformanceScore::whereHas('teacher', function ($q) use ($department) {
            $q->where('department', $department)->where('role', 'teacher');
        })
        ->where('academic_year', $academicYear)
        ->where('semester', $semester)
        ->orderByDesc('overall_score')
        ->get();

        foreach ($scores as $rank => $score) {
            $score->update(['rank_in_department' => $rank + 1]);
        }
    }
}
