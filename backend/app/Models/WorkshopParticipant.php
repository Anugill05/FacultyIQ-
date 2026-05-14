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
        'status',
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