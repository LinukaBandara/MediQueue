<?php

use App\Http\Controllers\Api\AppointmentController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DoctorController;
use App\Http\Controllers\Api\PatientBookingController;
use App\Http\Controllers\Api\PatientController;
use Illuminate\Support\Facades\Route;

// Auth — Sanctum SPA (cookie) based. Next.js must call GET /sanctum/csrf-cookie
// before POSTing here, with credentials: 'include' on every request.
Route::post('/login', [AuthController::class, 'login']);

// Public patient self-service booking — no auth, so rate-limited to
// prevent abuse (spam bookings / queue flooding). Separate route group
// from the staff API on purpose: different trust boundary, different
// controller, different failure mode if abused.
Route::middleware('throttle:10,1')->prefix('public')->group(function () {
    Route::get('/doctors', [PatientBookingController::class, 'doctors']);
    Route::post('/book', [PatientBookingController::class, 'book']);
    Route::get('/lookup', [PatientBookingController::class, 'lookup']);
    Route::get('/appointments/{appointment}/status', [PatientBookingController::class, 'status']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::get('/doctors', [DoctorController::class, 'index']);
    Route::get('/doctors/{doctor}/queue', [DoctorController::class, 'queue']);

    Route::get('/patients', [PatientController::class, 'index']);
    Route::post('/patients', [PatientController::class, 'store']);
    Route::get('/patients/{patient}', [PatientController::class, 'show']);

    Route::post('/appointments/join', [AppointmentController::class, 'join']);
    Route::get('/appointments/{appointment}', [AppointmentController::class, 'show']);
    Route::post('/appointments/{appointment}/call', [AppointmentController::class, 'call']);
    Route::post('/appointments/{appointment}/resolve', [AppointmentController::class, 'resolve']);
});
