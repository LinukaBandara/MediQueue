<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QueueEvent extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'appointment_id',
        'event_type',
        'old_position',
        'new_position',
    ];

    protected static function booted(): void
    {
        static::creating(function (QueueEvent $event) {
            $event->created_at ??= now();
        });
    }

    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class);
    }
}
