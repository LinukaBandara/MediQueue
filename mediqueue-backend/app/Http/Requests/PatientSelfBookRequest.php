<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Patient self-service booking has no logged-in user — it identifies the
 * patient by phone number instead. This is deliberately looser auth than
 * staff-side JoinQueueRequest (which requires an authenticated
 * admin/staff user), because the person booking IS the patient, not staff
 * acting on their behalf. Basic abuse protection (rate limiting) is
 * applied at the route level, not here.
 */
class PatientSelfBookRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:32'],
            'doctor_id' => ['required', 'integer', 'exists:doctors,id'],
            'mode' => ['required', 'in:queue,scheduled'],
            'scheduled_at' => ['required_if:mode,scheduled', 'nullable', 'date', 'after:now'],
        ];
    }
}
