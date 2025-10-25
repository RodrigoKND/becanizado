import React, { useState, useEffect } from 'react';
import { Calendar, User, MessageSquare, X, Download } from 'lucide-react'; // Importar X y Download
import { Exercise, Submission, supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface ExerciseCardProps {
  exercise: Exercise;
  onSubmit?: () => void;
}
interface ImageModalProps {
  imageUrl: string;
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ imageUrl, onClose }) => {
  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = 'imagen_ejercicio.jpg';
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url); // Libera memoria
    } catch (error) {
      console.error('Error al descargar la imagen:', error);
    }
  };
  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Contenedor del contenido del modal */}
      <div
        className="relative bg-[#3e4145] rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
        onClick={handleContentClick}
      >
        {/* Imagen */}
        <div className="relative h-full w-full">
          <img
            src={imageUrl}
            alt="Imagen Ampliada"
            className="w-full h-full object-contain max-h-[80vh]"
          />
        </div>

        {/* Botones de acción (arriba a la derecha) */}
        <div className="absolute top-2 right-2 flex gap-2 z-[60]">
          <button
            onClick={handleDownload}
            title="Descargar Imagen"
            className="p-3 bg-white/20 hover:bg-white/40 text-white rounded-full transition-colors backdrop-blur-sm"
          >
            <Download size={20} />
          </button>
          <button
            onClick={onClose}
            title="Cerrar"
            className="p-3 bg-white/20 hover:bg-white/40 text-white rounded-full transition-colors backdrop-blur-sm"
          >
            <X size={20} />
          </button>
        </div>

      </div>
    </div>
  );
};

export default function ExerciseCard({ exercise, onSubmit }: ExerciseCardProps) {
  const { profile } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [showSubmissions, setShowSubmissions] = useState(false);
  // Nuevo estado para el modal: almacena la URL de la imagen a mostrar
  const [modalImage, setModalImage] = useState<string | null>(null);

  useEffect(() => {
    loadSubmissions();
  }, [exercise.id]);

  const loadSubmissions = async () => {
    // ... (Tu función loadSubmissions es la misma, no necesita cambios)
    try {
      const query = supabase
        .from('submissions')
        .select(`
          *,
          student:profiles!student_id(id, full_name, email)
        `)
        .eq('exercise_id', exercise.id)
        .order('created_at', { ascending: false });

      if (profile?.role === 'student') {
        query.eq('student_id', profile.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error('Error loading submissions:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Función para abrir el modal
  const openModal = (url?: string) => {
    if (!url) return;
    setModalImage(url);
  };

  // Función para cerrar el modal
  const closeModal = () => {
    setModalImage(null);
  };
  const handleDeleteExercise = async (exerciseId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este ejercicio? Esta acción no se puede deshacer.')) return;

    try {
      const { error } = await supabase
        .from('exercises')
        .delete()
        .eq('id', exerciseId)
        .eq('professor_id', profile?.id);

      if (error) throw error;

      alert('Ejercicio eliminado correctamente.');
      window.location.reload();
    } catch (error) {
      console.error('Error eliminando ejercicio:', error);
      alert('Ocurrió un error al eliminar el ejercicio.');
    }
  };

  return (
    <>
      {/* 1. Renderiza el Modal si hay una imagen seleccionada */}
      {modalImage && <ImageModal imageUrl={modalImage} onClose={closeModal} />}

      <article className="bg-[#3e4145] rounded-xl overflow-hidden border border-[#787e86] hover:border-[#84888c] transition-all duration-300 shadow-lg hover:shadow-xl flex flex-col h-full">
        {exercise.image_url && (
          <header className="relative overflow-hidden group h-48 bg-[#787e86] bg-opacity-10 cursor-pointer"
            // 2. Añade el onClick a la capa contenedora de la imagen del ejercicio
            onClick={() => openModal(exercise.image_url)}
          >
            <img
              src={exercise.image_url}
              alt={exercise.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-60 flex items-center justify-center transition-opacity">
              <span className="text-white text-lg font-bold opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-full bg-black/50">
                Ver
              </span>
            </div>
          </header>
        )}

        <div className="p-4 md:p-5 flex flex-col flex-1">
          <h3 className="text-lg md:text-xl font-bold text-[#b7babe] mb-3 line-clamp-2">
            {exercise.title}
          </h3>

          <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm text-[#84888c] mb-3">
            <div className="flex items-center gap-1.5">
              <Calendar size={14} className="flex-shrink-0" />
              <span>{formatDate(exercise.created_at)}</span>
            </div>
            {exercise.professor && (
              <div className="flex items-center gap-1.5">
                <User size={14} className="flex-shrink-0" />
                <span className="truncate">{exercise.professor.full_name}</span>
              </div>
            )}
          </div>

          <p className="text-[#b7babe] text-sm md:text-base whitespace-pre-wrap mb-4 line-clamp-3 flex-1">
            {exercise.description}
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-[#787e86]">
            <button
              onClick={() => setShowSubmissions(!showSubmissions)}
              className="flex items-center justify-center sm:justify-start gap-2 text-[#787e86] hover:text-[#84888c] transition-colors py-2 sm:py-0"
            >
              <MessageSquare size={18} />
              <span className="font-medium text-sm md:text-base">
                {submissions.length} {submissions.length === 1 ? 'Respuesta' : 'Respuestas'}
              </span>
            </button>

            {profile?.role === 'student' && onSubmit && (
              <button
                onClick={onSubmit}
                className="px-4 py-2 bg-[#787e86] hover:bg-[#84888c] text-white rounded-lg transition-colors font-medium text-sm md:text-base shadow-md hover:shadow-lg"
              >
                Responder
              </button>
            )}
          </div>
          {profile?.role === 'professor' && profile.id === exercise.professor_id && (
            <button
              onClick={() => handleDeleteExercise(exercise.id)}
              className="flex items-center justify-center gap-2 px-4 py-2 
               bg-[#161b1f] hover:bg-[#1f262b] text-white 
               rounded-lg transition-colors font-medium 
               text-sm md:text-base shadow-md hover:shadow-lg border border-[#2b3238]">
              <X size={18} />
              Eliminar
            </button>
          )}
          {showSubmissions && submissions.length > 0 && (
            <div className="mt-4 space-y-3 pt-4 border-t border-[#787e86]">
              {submissions.map((submission) => (
                <div key={submission.id} className="bg-[#787e86] bg-opacity-20 rounded-lg p-3 md:p-4 border border-[#787e86]">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-[#b7babe] font-medium text-sm md:text-base truncate">
                        {submission.student?.full_name}
                      </p>
                      <p className="text-xs text-[#84888c] mt-0.5">
                        {formatDate(submission.created_at)}
                      </p>
                    </div>
                  </div>
                  <img
                    src={submission.image_url}
                    alt="Respuesta"
                    className="w-full rounded-lg mb-3 max-h-48 object-cover cursor-pointer"
                    onClick={() => openModal(submission.image_url)}
                  />

                  {submission.feedback && (
                    <div className="bg-[#3e4145] rounded-lg p-3 border border-[#787e86]">
                      <p className="text-xs text-[#84888c] mb-1 font-semibold">Retroalimentación</p>
                      <p className="text-[#b7babe] text-sm">{submission.feedback}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </article>
    </>
  );
}