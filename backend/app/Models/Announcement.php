<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Announcement extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'announcements';

    protected $fillable = [
        'title',
        'content',
        'type',       // info | warning | success | urgent
        'target_role', // all | teacher | student
        'created_by',
        'is_active',
        'expires_at',
        'attachment_url',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'expires_at' => 'datetime',
    ];

    public function author()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
