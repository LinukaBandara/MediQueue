<?php

namespace App\Policies;

use App\Models\Appointment;
use App\Models\User;

class AppointmentPolicy
{
    /**
     * Admins can act on anything in their clinic. Doctors can only act on
     * their own appointments. Staff can view/update anything in their
     * clinic (front-desk operations), but cannot act across clinics.
     */
    public function view(User $user, Appointment $appointment): bool
    {
        return $this->belongsToUsersClinic($user, $appointment);
    }

    public function update(User $user, Appointment $appointment): bool
    {
        if (! $this->belongsToUsersClinic($user, $appointment)) {
            return false;
        }

        if ($user->isDoctor()) {
            return $appointment->doctor->user_id === $user->id;
        }

        return $user->isAdmin() || $user->isStaff();
    }

    protected function belongsToUsersClinic(User $user, Appointment $appointment): bool
    {
        return $user->clinic_id === $appointment->clinic_id;
    }
}
