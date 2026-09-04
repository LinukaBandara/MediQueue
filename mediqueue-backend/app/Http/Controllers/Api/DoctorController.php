<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AppointmentResource;
use App\Http\Resources\DoctorResource;
use App\Models\Doctor;
use Illuminate\Http\Request;

class DoctorController extends Controller
{
    public function index(Request $request)
    {
        $doctors = Doctor::query()
            ->when($request->user()->clinic_id, fn ($q, $clinicId) => $q->where('clinic_id', $clinicId))
            ->with('user')
            ->get();

        return DoctorResource::collection($doctors);
    }

    /**
     * The live queue for a single doctor — this is what the Next.js
     * "queue display" page polls on load and refetches whenever the
     * Echo/Reverb `queue.updated` event fires for this doctor.
     */
    public function queue(Doctor $doctor)
    {
        $appointments = $doctor->activeQueue()
            ->with('patient')
            ->get();

        return AppointmentResource::collection($appointments);
    }
}
