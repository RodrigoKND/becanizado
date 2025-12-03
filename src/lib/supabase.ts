import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: 'student' | 'professor';
  youtube_channel?: string;
  created_at: string;
}

export interface Exercise {
  id: string;
  professor_id: string;
  title: string;
  description: string;
  image_url?: string;
  created_at: string;
  professor?: Profile;
  matter?: string;
}

export interface Submission {
  id: string;
  exercise_id: string;
  student_id: string;
  image_url: string;
  feedback?: string;
  text_response?: string;
  created_at: string;
  student?: Profile;
  exercise?: Exercise;
}
