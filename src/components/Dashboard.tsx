import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Exercise, Submission } from '../lib/supabase';
import AnswersAndExercises from './AnswersAndExercises';
import TemplateDashboard from './TemplateDashboard';
import { Navigate } from 'react-router-dom';

export default function Dashboard() {
  const { profile, user } = useAuth();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [, setLoading] = useState(true);

  useEffect(() => {
    if (profile) loadData();
  }, [profile]);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([loadExercises(), loadSubmissions()]);
    } finally {
      setLoading(false);
    }
  };

  const loadExercises = async () => {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select(`
          *,
          professor:profiles!professor_id(id, full_name, email, youtube_channel)
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setExercises(data || []);
    } catch (error) {
      console.error('Error loading exercises:', error);
    }
  };

  const loadSubmissions = async () => {
    if (profile?.role !== 'professor') return;
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select(`
          *,
          student:profiles!student_id(id, full_name, email),
          exercise:exercises!exercise_id(id, title)
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error('Error loading submissions:', error);
    }
  };

  if(!user || !profile){
    return <Navigate to="/" replace />;
  }

  return (
    <TemplateDashboard
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      selectedExercise={selectedExercise}
      setSelectedExercise={setSelectedExercise}
      selectedSubmission={selectedSubmission}
      setSelectedSubmission={setSelectedSubmission}
      profile={profile}
    >
      <AnswersAndExercises
        exercises={exercises}
        submissions={submissions}
        searchQuery={searchQuery}
        profile={profile}
        setSelectedExercise={setSelectedExercise}
        setSelectedSubmission={setSelectedSubmission}
      />
    </TemplateDashboard>
  );
}
