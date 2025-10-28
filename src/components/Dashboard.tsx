import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Submission } from '../lib/supabase';
import AnswersAndExercises from './AnswersAndExercises';
import TemplateDashboard from './TemplateDashboard';
import { Navigate } from 'react-router-dom';
import { useLoadExercises } from '../hooks/useExercises';
import { useSubmissions } from '../hooks/useSubmissions';

export default function Dashboard() {
  const { profile, user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [, setLoading] = useState(true);
  const { data } = useLoadExercises();
  const { data: submissionsData } = useSubmissions();

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
      return data || [];
    } catch (error) {
      console.error('Error loading exercises:', error);
    }
  };
  
  const loadSubmissions = async () => {
    if (profile?.role !== 'professor') return;
    try {
      setSubmissions(submissionsData || []);
    } catch (error) {
      console.error('Error loading submissions:', error);
    }
  };

  if (!user || !profile) {
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
        submissions={submissions}
        searchQuery={searchQuery}
        profile={profile}
        setSelectedExercise={setSelectedExercise}
        setSelectedSubmission={setSelectedSubmission}
      />
    </TemplateDashboard>
  );
}
