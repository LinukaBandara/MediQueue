<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('doctors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('clinic_id')->constrained()->cascadeOnDelete();
            $table->string('specialization')->nullable();
            $table->unsignedSmallInteger('avg_consult_minutes')->default(15);
            $table->timestamps();

            $table->index(['clinic_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('doctors');
    }
};
