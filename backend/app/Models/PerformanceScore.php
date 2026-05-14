<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class PerformanceScore extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'performance_scores';

    protected $fillable = [
        'teacher_id',
        'academic_year',
        'semester',
        'student_rating_score',    // 0-100 (30% weight)
        'attendance_score',         // 0-100 (20% weight)
        'achievement_score',        // 0-100 (25% weight)
        'workshop_score',           // 0-100 (15% weight)
        'feedback_sentiment_score', // 0-100 (10% weight)
        'overall_score',            // 0-100 weighted
        'grade',                    // A+ A B+ B C
        'badge',                    // star_performer | excellence | rising_star | consistent | needs_improvement
        'rank_in_department',
        'calculated_at',
    ];

    protected $casts = [
        'student_rating_score' => 'float',
        'attendance_score' => 'float',
        'achievement_score' => 'float',
        'workshop_score' => 'float',
        'feedback_sentiment_score' => 'float',
        'overall_score' => 'float',
        'rank_in_department' => 'integer',
        'calculated_at' => 'datetime',
    ];

    public function teacher()
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }
}
