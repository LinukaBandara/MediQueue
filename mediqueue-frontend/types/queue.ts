export interface Patient {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  date_of_birth: string | null;
}

export interface Doctor {
  id: number;
  name: string;
  specialization: string | null;
  avg_consult_minutes: number;
  clinic_id: number;
}

export type AppointmentStatus =
  | 'waiting'
  | 'called'
  | 'in_progress'
  | 'completed'
  | 'no_show'
  | 'cancelled';

export interface Appointment {
  id: number;
  token_number: number;
  status: AppointmentStatus;
  queue_position: number | null;
  scheduled_at: string | null;
  checked_in_at: string | null;
  called_at: string | null;
  completed_at: string | null;
  patient: Patient;
  doctor?: Doctor;
}
