<?php

namespace App\Models;

use App\Events\QueuePositionUpdated;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;

class Appointment extends Model
{
    use HasFactory;

    protected $fillable = [
        'patient_id',
        'doctor_id',
        'clinic_id',
        'token_number',
        'scheduled_at',
        'status',
        'queue_position',
        'checked_in_at',
        'called_at',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'scheduled_at' => 'datetime',
            'checked_in_at' => 'datetime',
            'called_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function doctor(): BelongsTo
    {
        return $this->belongsTo(Doctor::class);
    }

    public function clinic(): BelongsTo
    {
        return $this->belongsTo(Clinic::class);
    }

    public function queueEvents(): HasMany
    {
        return $this->hasMany(QueueEvent::class);
    }

    /**
     * Create a new queue-based appointment for a doctor, assigning the next
     * token number and initial queue position atomically.
     */
    public static function joinQueue(int $patientId, Doctor $doctor): self
    {
        return DB::transaction(function () use ($patientId, $doctor) {
            $lastToken = self::where('doctor_id', $doctor->id)
                ->whereDate('created_at', today())
                ->lockForUpdate()
                ->max('token_number');

            $waitingCount = $doctor->activeQueue()->count();

            $appointment = self::create([
                'patient_id' => $patientId,
                'doctor_id' => $doctor->id,
                'clinic_id' => $doctor->clinic_id,
                'token_number' => ($lastToken ?? 0) + 1,
                'status' => 'waiting',
                'queue_position' => $waitingCount + 1,
                'checked_in_at' => now(),
            ]);

            $appointment->queueEvents()->create([
                'event_type' => 'joined',
                'old_position' => null,
                'new_position' => $appointment->queue_position,
            ]);

            broadcast(new QueuePositionUpdated($doctor->id))->toOthers();

            return $appointment;
        });
    }

    /**
     * Mark this appointment as called (doctor is ready to see the patient),
     * then re-sequence and re-broadcast everyone behind them.
     */
    public function markCalled(): void
    {
        DB::transaction(function () {
            $this->update(['status' => 'called', 'called_at' => now()]);

            $this->queueEvents()->create([
                'event_type' => 'called',
                'old_position' => $this->queue_position,
                'new_position' => $this->queue_position,
            ]);
        });

        broadcast(new QueuePositionUpdated($this->doctor_id))->toOthers();
    }

    /**
     * Mark completed / no-show / skipped, then recalculate positions for
     * everyone still waiting behind this appointment. This whole operation
     * is wrapped in a transaction with row locks so two staff members acting
     * on the queue at the same moment can't produce inconsistent positions.
     */
    public function resolve(string $status): void
    {
        if (! in_array($status, ['completed', 'no_show', 'cancelled'], true)) {
            throw new \InvalidArgumentException("Invalid resolution status: {$status}");
        }

        DB::transaction(function () use ($status) {
            $this->lockForUpdate()->refresh();

            $this->update([
                'status' => $status,
                'completed_at' => $status === 'completed' ? now() : $this->completed_at,
            ]);

            $this->queueEvents()->create([
                'event_type' => $status === 'no_show' ? 'skipped' : 'completed',
                'old_position' => $this->queue_position,
                'new_position' => null,
            ]);

            $this->recalculateQueuePositions();
        });

        broadcast(new QueuePositionUpdated($this->doctor_id))->toOthers();
    }

    /**
     * Re-number the remaining waiting/called appointments for this doctor
     * so positions stay contiguous (1, 2, 3, ...) after someone leaves the
     * queue. Must be called from inside a transaction that already holds
     * the relevant row locks.
     */
    protected function recalculateQueuePositions(): void
    {
        $remaining = self::where('doctor_id', $this->doctor_id)
            ->whereIn('status', ['waiting', 'called'])
            ->whereDate('created_at', today())
            ->orderBy('queue_position')
            ->lockForUpdate()
            ->get();

        foreach ($remaining->values() as $index => $appointment) {
            $newPosition = $index + 1;
            if ($appointment->queue_position !== $newPosition) {
                $appointment->queueEvents()->create([
                    'event_type' => 'position_changed',
                    'old_position' => $appointment->queue_position,
                    'new_position' => $newPosition,
                ]);
                $appointment->update(['queue_position' => $newPosition]);
            }
        }
    }
}
