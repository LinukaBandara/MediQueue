<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\JoinQueueRequest;
use App\Http\Resources\AppointmentResource;
use App\Models\Appointment;
use App\Models\Doctor;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AppointmentController extends Controller
{
    /**
     * Add a walk-in / queue-based patient to a doctor's queue for today.
     * Token number and initial queue position are assigned atomically
     * inside Appointment::joinQueue().
     */
    public function join(JoinQueueRequest $request)
    {
        $doctor = Doctor::findOrFail($request->validated('doctor_id'));

        $appointment = Appointment::joinQueue(
            $request->validated('patient_id'),
            $doctor
        );

        return new AppointmentResource($appointment->load('patient', 'doctor.user'));
    }

    /**
     * Doctor/staff calls the next patient in the queue.
     */
    public function call(Appointment $appointment)
    {
        $this->authorize('update', $appointment);

        $appointment->markCalled();

        return new AppointmentResource($appointment->fresh(['patient', 'doctor.user']));
    }

    /**
     * Resolve an appointment: completed, no_show, or cancelled.
     * This is the endpoint that triggers queue re-sequencing.
     */
    public function resolve(Request $request, Appointment $appointment)
    {
        $this->authorize('update', $appointment);

        $validated = $request->validate([
            'status' => ['required', Rule::in(['completed', 'no_show', 'cancelled'])],
        ]);

        $appointment->resolve($validated['status']);

        return new AppointmentResource($appointment->fresh(['patient', 'doctor.user']));
    }

    public function show(Appointment $appointment)
    {
        $this->authorize('view', $appointment);

        return new AppointmentResource($appointment->load('patient', 'doctor.user'));
    }
}
