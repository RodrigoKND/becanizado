import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Exercise, Submission } from '../lib/supabase';
import AnswersAndExercises from './AnswersAndExercises';
import TemplateDashboard from './TemplateDashboard';

export default function Dashboard() {
    const { profile } = useAuth();
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [searchQuery, _] = useState('');
    const [, setSelectedExercise] = useState<string | null>(null);
    const [, setSelectedSubmission] = useState<Submission | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
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

    if (loading) {
        return (
            <div className="min-h-screen bg-[#3e4145] flex items-center justify-center">
                <div className="text-[#b7babe] text-xl">Cargando...</div>
            </div>
        );
    }

    return (
        <TemplateDashboard>
            <AnswersAndExercises exercises={exercises} searchQuery={searchQuery} profile={profile} setSelectedExercise={setSelectedExercise} submissions={submissions} setSelectedSubmission={setSelectedSubmission} />
        </TemplateDashboard>
    );
}