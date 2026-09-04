# MediQueue — Laravel Backend Scaffold

Migrations, Eloquent models, and the queue broadcast event for the clinic
queue system. This is the backend foundation to drop into a fresh Laravel
11 project — it assumes `composer create-project laravel/laravel mediqueue`
has already been run.

## How to use this scaffold

1. Create a fresh Laravel project: `composer create-project laravel/laravel mediqueue`
2. Copy `database/migrations/*`, `database/factories/*`, `app/Models/*`, and
   `app/Events/*` into the matching folders in your new project (overwrite
   the default `User.php` model).
3. Set your `.env` database credentials (MySQL recommended).
4. Install Sanctum: `php artisan install:api` (Laravel 11+) or
   `composer require laravel/sanctum` on older setups.
5. Install Reverb: `php artisan install:broadcasting` — this scaffolds the
   Reverb config and env vars for you.
6. Run migrations: `php artisan migrate`
7. Run `php artisan tinker` and use the factories to seed a clinic, a
   doctor, and a few patients to test the queue logic manually before
   building the API endpoints on top of it.

## What's included

- **Migrations** for `clinics`, `doctors`, `patients`, `appointments`,
  `queue_events`, and a migration that adds `role`/`clinic_id` to the
  default `users` table.
- **Models** with the relationships wired up (`Clinic`, `User`, `Doctor`,
  `Patient`, `Appointment`, `QueueEvent`).
- **`Appointment::joinQueue()`**, **`markCalled()`**, and **`resolve()`** —
  the actual queue state machine, with the position-recalculation logic
  wrapped in DB transactions with row locks.
- **`QueuePositionUpdated`** — the Reverb broadcast event, fired whenever
  the queue changes. The Next.js frontend subscribes to
  `doctor-queue.{doctorId}` via Laravel Echo.

## The design decision to know cold for interviews

`queue_position` is a **stored, recalculated integer column**, not derived
on the fly with `ORDER BY created_at`. When a patient is skipped, marked
no-show, or completed, `recalculateQueuePositions()` re-numbers everyone
still waiting — inside a transaction with `lockForUpdate()` — so two staff
members acting on the queue at the same instant can't produce inconsistent
positions. Only after that transaction commits does the app broadcast
`QueuePositionUpdated`, which just carries the `doctorId` — clients
refetch the queue rather than trusting a broadcast payload, so a
network reordering of two rapid events can never leave a client stuck on
a stale queue snapshot.

## API layer (added)

- **`AuthController`** — Sanctum SPA login/logout/me. The Next.js app must
  call `GET /sanctum/csrf-cookie` before `POST /api/login`, with
  `credentials: 'include'` on every request, and `SANCTUM_STATEFUL_DOMAINS`
  in `.env` must include your Next.js dev/prod domain.
- **`DoctorController`** — list doctors, and `GET /doctors/{doctor}/queue`
  which returns the live queue — this is what the Next.js queue screen
  polls/refetches whenever Echo receives `queue.updated`.
- **`PatientController`** — search + create patients (front-desk lookup).
- **`AppointmentController`** — `join` (add to queue), `call` (doctor calls
  next), `resolve` (completed/no_show/cancelled — triggers re-sequencing).
- **`AppointmentPolicy`** — role-based authorization: admins/staff act
  within their clinic, doctors only on their own appointments. Registered
  in `AuthServiceProvider`.
- API Resources (`PatientResource`, `DoctorResource`, `AppointmentResource`)
  control the exact JSON shape sent to Next.js.

All routes live in `routes/api.php` behind `auth:sanctum` except `/login`.

## What's not in this scaffold yet

- Sanctum's `config/sanctum.php` + `bootstrap/app.php` middleware wiring
  (the `EnsureFrontendRequestsAreStateful` middleware needs to run before
  the session/cookie middleware — this is the most common setup mistake)
- Laravel Echo + Reverb client wiring on the Next.js side
- Notifications (mail/SMS on "you're almost up")
- Feature tests for the queue state machine (join → call → resolve →
  verify positions re-sequence correctly)

These are the natural next steps — see the MediQueue project plan for the
week-by-week build order.
