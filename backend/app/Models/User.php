<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;
use Illuminate\Auth\Authenticatable;
use Illuminate\Contracts\Auth\Authenticatable as AuthenticatableContract;
use Tymon\JWTAuth\Contracts\JWTSubject;
use Illuminate\Notifications\Notifiable;

class User extends Model implements AuthenticatableContract, JWTSubject
{
    use Authenticatable, Notifiable;

    protected $connection = 'mongodb';
    protected $collection = 'users';

    protected $fillable = [
        'name',
        'email',
        'password',
        'role', // admin | teacher | student
        'phone',
        'avatar',
        'department',
        'employee_id',
        'student_id',
        'designation',
        'qualification',
        'specialization',
        'experience_years',
        'bio',
        'is_active',
        'otp',
        'otp_expires_at',
        'email_verified_at',
        'created_by',
    ];

    protected $hidden = [
        'password',
        'otp',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'otp_expires_at' => 'datetime',
        'is_active' => 'boolean',
        'experience_years' => 'integer',
    ];

    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [
            'role' => $this->role,
            'email' => $this->email,
        ];
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isTeacher(): bool
    {
        return $this->role === 'teacher';
    }

    public function isStudent(): bool
    {
        return $this->role === 'student';
    }

    public function feedbacksReceived()
    {
        return $this->hasMany(Feedback::class, 'teacher_id');
    }

    public function feedbacksGiven()
    {
        return $this->hasMany(Feedback::class, 'student_id');
    }

    public function achievements()
    {
        return $this->hasMany(Achievement::class, 'teacher_id');
    }

    public function workshopParticipations()
    {
        return $this->hasMany(WorkshopParticipant::class, 'user_id');
    }

    public function attendanceRecords()
    {
        return $this->hasMany(Attendance::class, 'teacher_id');
    }

    public function performanceScore()
    {
        return $this->hasOne(PerformanceScore::class, 'teacher_id');
    }
}
