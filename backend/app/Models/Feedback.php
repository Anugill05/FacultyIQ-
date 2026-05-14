<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Feedback extends Model
{
    protected $connection = 'mongodb';

    protected $collection = 'feedbacks';

    protected $fillable = [
        'teacher_id',
        'student_id',
        'subject',
        'semester',
        'academic_year',
        'ratings',
        'overall_rating',
        'comment',
        'is_anonymous',
        'status',
    ];

    protected $casts = [
        'ratings' => 'array',
        'overall_rating' => 'float',
        'is_anonymous' => 'boolean',
    ];

    public function teacher()
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }
}