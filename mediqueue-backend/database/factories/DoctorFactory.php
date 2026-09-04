<?php

namespace Database\Factories;

use App\Models\Clinic;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class DoctorFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory()->state(['role' => 'doctor']),
            'clinic_id' => Clinic::factory(),
            'specialization' => fake()->randomElement([
                'General Physician', 'Pediatrics', 'Dermatology', 'Cardiology',
            ]),
            'avg_consult_minutes' => fake()->numberBetween(10, 25),
        ];
    }
}
