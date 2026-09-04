<?php

namespace App\Providers;

use App\Models\Appointment;
use App\Policies\AppointmentPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * NOTE: In Laravel 11, policies are usually auto-discovered by naming
     * convention (App\Models\Appointment -> App\Policies\AppointmentPolicy),
     * so this explicit mapping is often unnecessary — but keeping it here
     * makes the wiring visible for anyone reading the codebase, and is
     * required if you ever rename either class off the convention.
     */
    protected $policies = [
        Appointment::class => AppointmentPolicy::class,
    ];

    public function boot(): void
    {
        //
    }
}
