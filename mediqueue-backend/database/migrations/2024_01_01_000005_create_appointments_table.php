<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained()->cascadeOnDelete();
            $table->foreignId('doctor_id')->constrained()->cascadeOnDelete();
            $table->foreignId('clinic_id')->constrained()->cascadeOnDelete();

            $table->unsignedInteger('token_number');
            $table->dateTime('scheduled_at')->nullable(); // null = pure queue-based visit

            $table->enum('status', [
                'waiting', 'called', 'in_progress', 'completed', 'no_show', 'cancelled',
            ])->default('waiting');

            // Stored + recalculated column, not derived on the fly via ORDER BY.
            // Recalculated inside a DB transaction whenever the queue changes
            // (skip / no-show / completed) so the broadcast to clients is atomic
            // and race-free even with two staff members acting at once.
            $table->unsignedInteger('queue_position')->nullable();

            $table->dateTime('checked_in_at')->nullable();
            $table->dateTime('called_at')->nullable();
            $table->dateTime('completed_at')->nullable();

            $table->timestamps();

            $table->index(['clinic_id', 'doctor_id', 'status']);
            $table->unique(['clinic_id', 'doctor_id', 'token_number']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};
