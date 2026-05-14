<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Workshop extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'workshops';

    protected $fillable = [
        'title',
        'description',
        'category', // technical | pedagogical | research | soft_skills | leadership
        'facilitator',
        'start_date',
        'end_date',
        'start_time',
        'end_time',
        'venue',
        'mode', // online | offline | hybrid
        'max_participants',
        'current_participants',
        'registration_deadline',
        'status', // upcoming | ongoing | completed | cancelled
        'points_awarded',
        'certificate_provided',
        'created_by',
        'tags',
        'resources',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'registration_deadline' => 'date',
        'certificate_provided' => 'boolean',
        'max_participants' => 'integer',
        'current_participants' => 'integer',
        'points_awarded' => 'integer',
        'tags' => 'array',
        'resources' => 'array',
    ];

    public function participants()
    {
        return $this->hasMany(WorkshopParticipant::class, 'workshop_id');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
