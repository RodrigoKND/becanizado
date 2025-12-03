import { useState } from "react";
import { Filter, Clock, CheckCircle, MessageSquare } from 'lucide-react';
import { Submission } from '../lib/supabase';
import ExerciseCard from "./ExerciseCard";
import SelectMatter from "./SelectMatter";
import { useExercises } from "../hooks/useExercises";

type FilterType = 'all' | 'student' | 'exercise';

const SubmissionPost = ({ submission, onClick }: { submission: Submission; onClick: () => void }) => (
    <article
        key={submission.id}
        className="bg-card-bg rounded-xl p-4 md:p-5 border border-border-color hover:border-[#84888c] transition-all duration-200 shadow-xl cursor-pointer mb-4 last:mb-0"
        onClick={onClick}
    >
        <header className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-input-bg flex items-center justify-center text-primary font-bold text-lg">
                {submission.student?.full_name[0]}
            </div>
            <div>
                <p className="text-sm font-semibold text-primary hover:underline">
                    {submission.student?.full_name}
                </p>
                <p className="text-xs text-secondary flex items-center gap-1">
                    <Clock size={12} />
                    {new Date(submission.created_at).toLocaleDateString()}
                </p>
            </div>
        </header>

        {/* Contenido principal: Título del Ejercicio y Status */}
        <h3 className="text-lg font-bold text-primary mb-2">
            Respuesta a: {submission.exercise?.title}
        </h3>

        <img
            src={submission.image_url}
            alt="Respuesta del estudiante"
            className="w-full max-h-96 object-cover rounded-lg mb-3 border border-border-color"
        />

        {/* Feedback/Acción */}
        <footer className={`flex items-center justify-between mt-3 p-2 rounded-lg ${submission.feedback ? 'bg-input-bg bg-opacity-20' : 'bg-input-bg bg-opacity-10'}`}>
            <div className="flex items-center gap-2 text-sm font-medium">
                {submission.feedback ? (
                    <span className="text-green-400 flex items-center gap-1">
                        <CheckCircle size={16} /> Retroalimentación Dada
                    </span>
                ) : (
                    <span className="text-primary flex items-center gap-1">
                        <MessageSquare size={16} /> Pendiente de Revisión
                    </span>
                )}
            </div>
            <button
                className="px-3 py-1 bg-input-bg hover-bg text-primary rounded-full transition-colors text-xs font-semibold"
                onClick={(e) => {
                    e.stopPropagation();
                    onClick();
                }}
            >
                {submission.feedback ? 'Ver Detalle' : 'Revisar'}
            </button>

        </footer>
    </article>
);

interface ExerciseCardProps {
    searchQuery: string;
    profile: any;
    setSelectedExercise: (exerciseId: string | null) => void;
    submissions: Submission[];
    setSelectedSubmission: (submission: Submission | null) => void;
}

export default function AnswersAndExercises({
    searchQuery,
    profile,
    submissions,
    setSelectedExercise,
    setSelectedSubmission,
}: ExerciseCardProps) {

    const [filterType, setFilterType] = useState<FilterType>('all');
    const [selectedMatter, setSelectedMatter] = useState<string>('');
    
const { data: exercises } = useExercises();
const filteredExercises = exercises?.filter((exercise) => {
  const query = searchQuery?.toLowerCase() || '';
  const matchesSearch =
    !query ||
    exercise.title?.toLowerCase().includes(query) ||
    exercise.description?.toLowerCase().includes(query) ||
    exercise.profiles?.some((p: { full_name?: string }) =>
      p.full_name?.toLowerCase().includes(query)
    );

  const matchesMatter = !selectedMatter || exercise.matter === selectedMatter;

  return matchesSearch && matchesMatter;
});


    const filteredSubmissions = submissions.filter((submission) => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return submission.student?.full_name.toLowerCase().includes(query) ||
            submission.exercise?.title.toLowerCase().includes(query);
    });


    const getFilteredContent = () => {
        // Feed de Respuestas (para el Profesor)
        if (profile?.role === 'professor' && filterType === 'student') {
            return (
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-primary mb-6 border-b border-border-color pb-3 flex items-center gap-2">
                        <Filter size={20} className="text-muted" />
                        Feed de Respuestas
                    </h2>
                    {filteredSubmissions.length === 0 ? (
                        <div className="text-center py-12 text-secondary bg-card-bg rounded-xl p-6">
                            No hay respuestas para mostrar en el feed.
                        </div>
                    ) : (
                        <div className="space-y-4">
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
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
                    <h2 className="text-xl font-bold text-primary border-b border-border-color pb-3 flex-1">
                        {profile?.role === 'professor' ? 'Mis Ejercicios y Publicaciones' : 'Explorar Ejercicios'}
                    </h2>
                    
                    {/* Selector de materia */}
                    <div className="w-full sm:w-64">
                        <SelectMatter 
                            value={selectedMatter} 
                            onChange={setSelectedMatter} 
                        />
                    </div>
                </div>

                {filteredExercises?.length === 0 ? (
                    <div className="text-center py-12 text-secondary bg-card-bg rounded-xl p-6">
                        {searchQuery || selectedMatter
                            ? 'No se encontraron ejercicios con los filtros seleccionados.'
                            : 'No hay ejercicios disponibles para mostrar en el feed.'}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredExercises?.map((exercise) => (
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

    return (
        <div className="lg:col-span-2 xl:col-span-3">
            {/* Encabezado Principal y Filtros */}
            <div className="bg-card-bg sticky top-0 z-10 pt-1 pb-4 mb-4">
                <h3 className="text-2xl md:text-3xl font-normal text-primary mb-1">
                    Inicio
                </h3>

                <p className="text-secondary text-sm mb-4">
                    {profile?.role === 'professor'
                        ? 'Tu línea de tiempo de ejercicios y respuestas.'
                        : 'Descubre y participa en nuevos ejercicios.'}
                </p>

                {/* Botones de Navegación/Filtro (tipo tabs de Twitter) */}
                {profile?.role === 'professor' && (
                    <div className="flex border-b border-border-color">
                        <button
                            onClick={() => setFilterType('all')}
                            className={`flex-1 text-center py-3 transition-colors font-semibold text-sm md:text-base border-b-4 ${filterType === 'all'
                                ? 'text-primary border-input-bg'
                                : 'text-secondary border-transparent hover-bg'
                                }`}
                        >
                            Ejercicios
                        </button>
                        <button
                            onClick={() => setFilterType('student')}
                            className={`flex-1 text-center py-3 transition-colors font-semibold text-sm md:text-base border-b-4 ${filterType === 'student'
                                ? 'text-primary border-input-bg'
                                : 'text-secondary border-transparent hover-bg'
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
    );
}