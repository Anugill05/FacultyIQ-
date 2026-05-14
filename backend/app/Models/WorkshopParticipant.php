<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class WorkshopParticipant extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'workshop_participants';

    protected $fillable = [
        'workshop_id',
        'user_id',
        'status', // registered | attended | completed | absent
        'registered_at',
        'completed_at',
        'certificate_issued',
    ];

    protected $casts = [
        'registered_at' => 'datetime',
        'completed_at' => 'datetime',
        'certificate_issued' => 'boolean',
    ];

    public function workshop()
    {
        return $this->belongsTo(Workshop::class, 'workshop_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}


// ---- Attendance.php ----
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
        'total_working_days' => 'integer',
        'days_present' => 'integer',
        'days_absent' => 'integer',
        'leaves_taken' => 'integer',
        'attendance_percentage' => 'float',
        'month' => 'integer',
        'year' => 'integer',
    ];

    public function teacher()
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }
}
