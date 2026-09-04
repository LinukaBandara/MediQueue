<?php

namespace App\Events;

use App\Models\Doctor;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Broadcast on a per-doctor public channel whenever the queue changes
 * (join, call, complete, skip). The Next.js client subscribes to
 * `doctor-queue.{doctorId}` via Echo and refetches/updates the queue view.
 *
 * Kept deliberately "thin" (just the doctor id) rather than broadcasting the
 * full queue payload — the client re-fetches the queue list on this signal.
 * That trades a little extra latency for guaranteed consistency: broadcasting
 * a full snapshot risks the client applying a stale one if two updates fire
 * in quick succession.
 */
class QueuePositionUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public int $doctorId)
    {
    }

    public function broadcastOn(): array
    {
        return [
            new Channel("doctor-queue.{$this->doctorId}"),
        ];
    }

    public function broadcastAs(): string
    {
        return 'queue.updated';
    }
}
