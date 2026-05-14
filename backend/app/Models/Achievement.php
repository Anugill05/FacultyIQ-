<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Achievement extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'achievements';

    protected $fillable = [
        'teacher_id',
        'title',
        'description',
        'category', // publication | award | certification | conference | patent | project
        'date_achieved',
        'issuing_organization',
        'certificate_url',
        'points',
        'verified',
        'verified_by',
        'verified_at',
    ];

    protected $casts = [
        'date_achieved' => 'date',
        'verified' => 'boolean',
        'verified_at' => 'datetime',
        'points' => 'integer',
    ];

    public function teacher()
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    public function verifiedBy()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }
}
