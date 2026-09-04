<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Assumes the default Laravel `users` migration has already run.
// This adds the fields MediQueue needs on top of the stock users table.
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['admin', 'doctor', 'staff'])->default('staff')->after('email');
            $table->foreignId('clinic_id')->nullable()->after('role')
                ->constrained('clinics')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['clinic_id']);
            $table->dropColumn(['role', 'clinic_id']);
        });
    }
};
