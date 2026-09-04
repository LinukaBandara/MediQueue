<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\PatientSelfBookRequest;
use App\Http\Resources\AppointmentResource;
use App\Http\Resources\DoctorResource;
use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\Patient;
use Illuminate\Support\Facades\DB;

/**
 * Public, unauthenticated endpoints for patients booking themselves —
 * distinct from AppointmentController, which is staff-only and requires
 * auth:sanctum. Kept as a separate controller rather than adding public
 * methods to AppointmentController so the two trust boundaries (staff
 * acting on a clinic's behalf vs. a member of the public) never get
 * blurred in one class.
 */
class PatientBookingController extends Controller
{
    /**
     * List doctors + their specialization/avg wait for the public booking
     * page. No sensitive data — safe to expose without auth.
     */
    public function doctors()
    {
        $doctors = Doctor::with('user')
            ->withCount(['appointments as waiting_count' => function ($query) {
                $query->whereIn('status', ['waiting', 'called'])
                    ->whereDate('created_at', today());
            }])
            ->get();

        return DoctorResource::collection($doctors);
    }

    /**
     * A patient books themselves — either joins the walk-in queue or
     * requests an exact time slot. Finds-or-creates the Patient record by
     * phone number (the natural identifier for a walk-in system where
     * patients don't have accounts/passwords).
     */
    public function book(PatientSelfBookRequest $request)
    {
        $doctor = Doctor::findOrFail($request->validated('doctor_id'));

        $patient = Patient::firstOrCreate(
            ['phone' => $request->validated('phone')],
            ['name' => $request->validated('name')]
        );

        if ($request->validated('mode') === 'queue') {
            $appointment = Appointment::joinQueue($patient->id, $doctor);
        } else {
            $appointment = DB::transaction(function () use ($patient, $doctor, $request) {
                $lastToken = Appointment::where('doctor_id', $doctor->id)
                    ->whereDate('created_at', today())
                    ->lockForUpdate()
                    ->max('token_number');

                return Appointment::create([
                    'patient_id' => $patient->id,
                    'doctor_id' => $doctor->id,
                    'clinic_id' => $doctor->clinic_id,
                    'token_number' => ($lastToken ?? 0) + 1,
                    'scheduled_at' => $request->validated('scheduled_at'),
                    'status' => 'waiting',
                    'queue_position' => null, // exact-time bookings aren't in the walk-in queue
                ]);
            });
        }

        return new AppointmentResource($appointment->load('patient', 'doctor.user'));
    }

    /**
     * A patient looks up their own bookings by phone number — this is the
     * closest thing to "patient login" in a system with no patient
     * passwords. Scoped to today's appointments only; a phone number
     * alone isn't a strong enough credential to expose someone's entire
     * history.
     */
    public function lookup(\Illuminate\Http\Request $request)
    {
        $request->validate(['phone' => ['required', 'string']]);

        $patient = Patient::where('phone', $request->query('phone'))->first();

        if (! $patient) {
            return AppointmentResource::collection(collect());
        }

        $appointments = $patient->appointments()
            ->whereDate('created_at', today())
            ->with('doctor.user')
            ->latest()
            ->get();

        return AppointmentResource::collection($appointments);
    }

    /**
     * A patient checks their own booking status/position — identified by
     * appointment id + phone, so a guessed id alone isn't enough to see
     * someone else's booking.
     */
    public function status(Appointment $appointment)
    {
        abort_unless(
            request('phone') === $appointment->patient->phone,
            403,
            'Phone number does not match this booking.'
        );

        return new AppointmentResource($appointment->load('patient', 'doctor.user'));
    }
}
