<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Attendance extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'attendances';

    protected $fillable = [
        'teacher_id',
        'month',
        'year',
        'total_working_days',
        'days_present',
        'days_absent',
        'leaves_taken',
        'attendance_percentage',
        'marked_by',
    ];

    protected $casts = [
        'total_working_days'    => 'integer',
        'days_present'          => 'integer',
        'days_absent'           => 'integer',
        'leaves_taken'          => 'integer',
        'attendance_percentage' => 'float',
        'month'                 => 'integer',
        'year'                  => 'integer',
    ];

    public function teacher()
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    public function markedBy()
    {
        return $this->belongsTo(User::class, 'marked_by');
    }
}
