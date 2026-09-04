<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePatientRequest;
use App\Http\Resources\PatientResource;
use App\Models\Patient;
use Illuminate\Http\Request;

class PatientController extends Controller
{
    public function index(Request $request)
    {
        $patients = Patient::query()
            ->when($request->query('search'), function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            })
            ->orderBy('name')
            ->paginate(20);

        return PatientResource::collection($patients);
    }

    public function store(StorePatientRequest $request)
    {
        $patient = Patient::create($request->validated());

        return new PatientResource($patient);
    }

    public function show(Patient $patient)
    {
        return new PatientResource($patient->load('appointments.doctor.user'));
    }
}
