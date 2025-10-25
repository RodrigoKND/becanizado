import React, { useState, useEffect } from 'react';
import { Plus, Filter, CheckCircle, Clock, MessageSquare } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Exercise, Submission } from '../lib/supabase';
import Header from './Header';
import Sidebar from './Sidebar';
import ExerciseCard from './ExerciseCard'; 
import CreateExercise from './CreateExercise';
import SubmitExercise from './SubmitExercise';
import FeedbackModal from './FeedbackModal';

type FilterType = 'all' | 'student' | 'exercise';
const SubmissionPost = ({ submission, onClick }: { submission: Submission; onClick: () => void }) => (
    <article
        key={submission.id}
        className="bg-[#3e4145] rounded-xl p-4 md:p-5 border border-[#787e86]/50 hover:border-[#84888c] transition-all duration-200 shadow-xl cursor-pointer mb-4 last:mb-0"
        onClick={onClick}
    >
        <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-[#787e86] flex items-center justify-center text-white font-bold text-lg">
                {submission.student?.full_name[0]}
            </div>
            <div>
                <p className="text-sm font-semibold text-[#b7babe] hover:underline">
                    {submission.student?.full_name}
                </p>
                <p className="text-xs text-[#84888c] flex items-center gap-1">
                    <Clock size={12} />
                    {new Date(submission.created_at).toLocaleDateString()}
                </p>
            </div>
        </div>

        {/* Contenido principal: Título del Ejercicio y Status */}
        <h3 className="text-lg font-bold text-[#b7babe] mb-2">
            Respuesta a: {submission.exercise?.title}
        </h3>

        <img
            src={submission.image_url}
            alt="Respuesta del estudiante"
            className="w-full max-h-96 object-cover rounded-lg mb-3 border border-[#787e86]/30"
        />
        
        {/* Feedback/Acción */}
        <div className={`flex items-center justify-between mt-3 p-2 rounded-lg ${submission.feedback ? 'bg-[#787e86] bg-opacity-20' : 'bg-[#787e86] bg-opacity-10'}`}>
            <div className="flex items-center gap-2 text-sm font-medium">
                {submission.feedback ? (
                    <span className="text-green-400 flex items-center gap-1">
                        <CheckCircle size={16} /> Retroalimentación Dada
                    </span>
                ) : (
                    <span className="text-[#b7babe] flex items-center gap-1">
                        <MessageSquare size={16} /> Pendiente de Revisión
                    </span>
                )}
            </div>
            <button
                className="px-3 py-1 bg-[#787e86] hover:bg-[#84888c] text-white rounded-full transition-colors text-xs font-semibold"
                onClick={onClick}
            >
                {submission.feedback ? 'Ver Detalle' : 'Revisar'}
            </button>
        </div>
    </article>
);


export default function Dashboard() {
    const { profile } = useAuth();
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<FilterType>('all');
    const [showCreateExercise, setShowCreateExercise] = useState(false);
    const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);

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

    const filteredExercises = exercises.filter((exercise) => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return exercise.title.toLowerCase().includes(query) ||
               exercise.description.toLowerCase().includes(query) ||
               exercise.professor?.full_name.toLowerCase().includes(query);
    });

    const filteredSubmissions = submissions.filter((submission) => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return submission.student?.full_name.toLowerCase().includes(query) ||
               submission.exercise?.title.toLowerCase().includes(query);
    });

    // Cambiamos el diseño a un feed tipo Brainly/Twitter
    const getFilteredContent = () => {
        // Feed de Respuestas (para el Profesor)
        if (profile?.role === 'professor' && filterType === 'student') {
            return (
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-[#b7babe] mb-6 border-b border-[#787e86]/50 pb-3 flex items-center gap-2">
                        <Filter size={20} className="text-[#787e86]" />
                        Feed de Respuestas
                    </h2>
                    {filteredSubmissions.length === 0 ? (
                        <div className="text-center py-12 text-[#84888c] bg-[#3e4145] rounded-xl p-6">
                            No hay respuestas para mostrar en el feed.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Aquí usamos el nuevo SubmissionPost con estilo de 'Tweet' o 'Pregunta' */}
                            {filteredSubmissions.map((submission) => (
                                <SubmissionPost 
                                    key={submission.id}
                                    submission={submission}
                                    onClick={() => setSelectedSubmission(submission)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            );
        }
        return (
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-[#b7babe] mb-6 border-b border-[#787e86]/50 pb-3">
                    {profile?.role === 'professor' ? 'Mis Ejercicios y Publicaciones' : 'Explorar Ejercicios'}
                </h2>
                {filteredExercises.length === 0 ? (
                    <div className="text-center py-12 text-[#84888c] bg-[#3e4145] rounded-xl p-6">
                        {searchQuery
                            ? 'No se encontraron ejercicios con tu búsqueda.'
                            : 'No hay ejercicios disponibles para mostrar en el feed.'}
                    </div>
                ) : (
                    // Usamos una columna única para el 'feed' de tarjetas
                    <div className="space-y-4">
                        {filteredExercises.map((exercise) => (
                            // ExerciseCard debería tener un diseño más vertical y enfocado al contenido (tipo Brainly)
                            <ExerciseCard
                                key={exercise.id}
                                exercise={exercise}
                                onSubmit={
                                    profile?.role === 'student'
                                        ? () => setSelectedExercise(exercise.id)
                                        : undefined
                                }
                            />
                        ))}
                    </div>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#3e4145] flex items-center justify-center">
                <div className="text-[#b7babe] text-xl">Cargando...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#3e4145] flex">
            
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
            
            {/* Sidebar (Columna Izquierda Fija, tipo Twitter) */}
            <div className={`fixed lg:static inset-y-0 left-0 z-50 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out lg:w-64 xl:w-72 flex-shrink-0`}>
                <Sidebar />
            </div>

            <div className="flex-1 flex flex-col w-full">
                <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

                

                {/* Nuevo Botón de Acción Flotante (FAB) para Crear Ejercicio (Mobile) */}
                {profile?.role === 'professor' && (
                    <button
                        onClick={() => setShowCreateExercise(true)}
                       className="lg:hidden fixed bottom-6 right-6 z-30 p-4 bg-[#151B26] hover:bg-[#151B26] text-white rounded-full shadow-2xl transition-colors"
                        
                        title="Crear Nuevo Ejercicio"
                    >
                        <Plus size={24} />
                    </button>
                )}

                {/* Contenido Principal (Columna Central de Feed) */}
                <main className="flex-1 overflow-y-auto">
                    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4 md:p-6 lg:p-8">
                        
                        {/* Columna Central: EL FEED (ocupa 2/3 en desktop) */}
                        <div className="lg:col-span-2 xl:col-span-3">
                            {/* Encabezado Principal y Filtros */}
                            <div className="bg-[#3e4145] sticky top-0 z-10 pt-1 pb-4 mb-4">
                                <h1 className="text-2xl md:text-3xl font-normal text-[#b7babe] mb-1">
                                    Inicio
                                </h1>

                                <p className="text-[#84888c] text-sm mb-4">
                                    {profile?.role === 'professor'
                                        ? 'Tu línea de tiempo de ejercicios y respuestas.'
                                        : 'Descubre y participa en nuevos ejercicios.'}
                                </p>
                                
                                {/* Botones de Navegación/Filtro (tipo tabs de Twitter) */}
                                {profile?.role === 'professor' && (
                                    <div className="flex border-b border-[#787e86]/50">
                                        <button
                                            onClick={() => setFilterType('all')}
                                            className={`flex-1 text-center py-3 transition-colors font-semibold text-sm md:text-base border-b-4 ${
                                                filterType === 'all'
                                                    ? 'text-[#b7babe] border-[#787e86]'
                                                    : 'text-[#84888c] border-transparent hover:bg-[#787e86]/10'
                                            }`}
                                        >
                                            Ejercicios
                                        </button>
                                        <button
                                            onClick={() => setFilterType('student')}
                                            className={`flex-1 text-center py-3 transition-colors font-semibold text-sm md:text-base border-b-4 ${
                                                filterType === 'student'
                                                    ? 'text-[#b7babe] border-[#787e86]'
                                                    : 'text-[#84888c] border-transparent hover:bg-[#787e86]/10'
                                            }`}
                                        >
                                            Respuestas
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Contenido del Feed (Ejercicios o Respuestas) */}
                            {getFilteredContent()}
                        </div>

                        {/* Columna Derecha (Para Acciones Rápidas o Información Adicional - Brainly/Twitter widget) */}
                        <div className="hidden lg:block lg:col-span-1">
                            <div className="sticky top-20 space-y-6">
                                {/* Widget: Perfil Rápido */}
                                <div className="bg-[#3e4145] rounded-xl p-4 shadow-xl border border-[#787e86]/50">
                                    <h3 className="text-lg font-bold text-[#b7babe] mb-3 border-b border-[#787e86]/30 pb-2">Bienvenido {profile?.role === 'professor' ? "profesor" : profile?.full_name}</h3>
                                    <p className="text-[#84888c] text-sm mt-1">{profile?.email}</p>
                                    <p className="text-[#84888c] text-sm capitalize mt-1">
                                         Rol: {profile?.role === 'professor' ? 'Profesor' : profile?.role === 'student' ? 'Alumno' : 'Desconocido'}
                                    </p>

                                </div>
                 
                                {profile?.role === 'professor' && (
                                    <div className="bg-[#3e4145] rounded-xl p-4 shadow-xl border border-[#787e86]/50">
                                        <h3 className="text-lg font-bold text-[#b7babe] mb-3">Acciones</h3>
                                        <button
                                            onClick={() => setShowCreateExercise(true)}
                                          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#151B26] hover:bg-[#151B26] text-white rounded-xl transition-colors font-bold shadow-lg text-sm md:text-base"
                                        >
                                            <Plus size={20} />
                                            Crear Nuevo Ejercicio
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Modales - Se mantienen igual */}
            {showCreateExercise && (
                <CreateExercise
                    onClose={() => setShowCreateExercise(false)}
                    onSuccess={loadData}
                />
            )}

            {selectedExercise && (
                <SubmitExercise
                    exerciseId={selectedExercise}
                    onClose={() => setSelectedExercise(null)}
                    onSuccess={loadData}
                />
            )}

            {selectedSubmission && (
                <FeedbackModal
                    submission={selectedSubmission}
                    onClose={() => setSelectedSubmission(null)}
                    onSuccess={loadData}
                />
            )}
        </div>
    );
}