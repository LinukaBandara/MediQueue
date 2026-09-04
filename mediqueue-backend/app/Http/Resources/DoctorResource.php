<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DoctorResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->whenLoaded('user', fn () => $this->user->name),
            'specialization' => $this->specialization,
            'avg_consult_minutes' => $this->avg_consult_minutes,
            'clinic_id' => $this->clinic_id,
            'waiting_count' => $this->whenCounted('activeQueue'),
        ];
    }
}
