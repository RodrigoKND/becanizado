import React, { useState, useEffect } from 'react';
import { Calendar,Trash2, User, MessageSquare, X, Download, CheckCircle, AlertCircle, ChevronUp, ChevronDown } from 'lucide-react';
import { Exercise, Submission, supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';

interface ExerciseCardProps {
  exercise: Exercise;
  onSubmit?: () => void;
}

interface ImageModalProps {
  imageUrl: string;
  onClose: () => void;
}

interface ConfirmModalProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

interface AlertModalProps {
  type: 'success' | 'error';
  message: string;
  onClose: () => void;
}

/* ✅ Modal de Confirmación */
const ConfirmModal: React.FC<ConfirmModalProps> = ({ message, onConfirm, onCancel }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    onClick={onCancel}
  >
    <div
      className="bg-[#3e4145] border border-[#787e86] rounded-xl p-6 max-w-sm w-full text-center shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      <h2 className="text-lg font-semibold text-[#b7babe] mb-3">Confirmar acción</h2>
      <p className="text-[#b7babe] mb-6">{message}</p>
      <div className="flex justify-center gap-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-[#161b1f] hover:bg-[#1f262b] text-[#b7babe] rounded-lg border border-[#2b3238] transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 bg-[#787e86] hover:bg-[#84888c] text-white rounded-lg transition-colors"
        >
          Eliminar
        </button>
      </div>
    </div>
  </div>
);

/* 🎉 Modal de Alerta (éxito/error) */
const AlertModal: React.FC<AlertModalProps> = ({ type, message, onClose }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    onClick={onClose}
  >
    <div
      className="bg-[#3e4145] border border-[#787e86] rounded-xl p-6 max-w-sm w-full text-center shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex flex-col items-center justify-center mb-3">
        {type === 'success' ? (
          <CheckCircle size={40} className="text-green-400 mb-2" />
        ) : (
          <AlertCircle size={40} className="text-red-400 mb-2" />
        )}
        <h2 className="text-lg font-semibold text-[#b7babe]">
          {type === 'success' ? 'Éxito' : 'Error'}
        </h2>
      </div>
      <p className="text-[#b7babe] mb-6">{message}</p>
      <button
        onClick={onClose}
        className="px-4 py-2 bg-[#787e86] hover:bg-[#84888c] text-white rounded-lg transition-colors"
      >
        Aceptar
      </button>
    </div>
  </div>
);

/* 🖼 Modal para ver imagen */
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
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al descargar la imagen:', error);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-[#3e4145] rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-full w-full">
          <img src={imageUrl} alt="Imagen Ampliada" className="w-full h-full object-contain max-h-[80vh]" />
        </div>
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
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmDeleteSubmission, setConfirmDeleteSubmission] = useState<string | null>(null);
  const [alertModal, setAlertModal] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const queryClient = useQueryClient();
  useEffect(() => {
    loadSubmissions();
  }, [exercise.id]);

  const loadSubmissions = async () => {
    try {
      const query = supabase
        .from('submissions')
        .select(`
          *,
          student:profiles!student_id(id, full_name, email)
        `)
        .eq('exercise_id', exercise.id)
        .order('created_at', { ascending: false });

      if (profile?.role === 'student') query.eq('student_id', profile.id);

      const { data, error } = await query;
      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error('Error loading submissions:', error);
    }
  };

  const handleDeleteExercise = async (exerciseId: string) => {
  try {
    console.log('Intentando eliminar ejercicio:', exerciseId);

    const { data, error } = await supabase
      .from('exercises')
      .delete()
      .eq('id', exerciseId)
      .select();

    console.log('✅ Resultado delete:', data, 'Error:', error);

    if (error) throw error;
    if (!data || data.length === 0) {
      setAlertModal({
        type: 'error',
        message: 'No se encontró el ejercicio o no tienes permisos para eliminarlo.',
      });
      return;
    }

    setAlertModal({ type: 'success', message: 'Ejercicio eliminado correctamente.' });
  } catch (error) {
    console.error('Error eliminando ejercicio:', error);
    setAlertModal({ type: 'error', message: 'Ocurrió un error al eliminar el ejercicio.' });
  }
};



  /* 🗑️ Nueva función: eliminar una respuesta */
  const handleDeleteSubmission = async (submissionId: string) => {
    try {
      const { error } = await supabase
        .from('submissions')
        .delete()
        .eq('id', submissionId);

      if (error) throw error;

      setAlertModal({ type: 'success', message: 'Respuesta eliminada correctamente.' });
      setSubmissions((prev) => prev.filter((s) => s.id !== submissionId));
      queryClient.setQueryData(['exercises'], (old: any) => {
        if (!old) return [];
        if (Array.isArray(old)) return old.filter((e: any) => e.id !== exercise.id);
        if ((old as any).pages) {
          return {
            ...old,
            pages: (old as any).pages.map((page: any) =>
              page.filter((e: any) => e.id !== exercise.id)
            ),
          };
        }
        return old;
      });
      setAlertModal({ type: 'success', message: 'Ejercicio eliminado correctamente.' });
    } catch (error) {
      console.error('Error eliminando respuesta:', error);
      setAlertModal({ type: 'error', message: 'No se pudo eliminar la respuesta.' });
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  return (
    <>
      {modalImage && <ImageModal imageUrl={modalImage} onClose={() => setModalImage(null)} />}
      {confirmDelete && (
        <ConfirmModal
          message="¿Estás seguro de que quieres eliminar este ejercicio? Esta acción no se puede deshacer."
          onCancel={() => setConfirmDelete(false)}
          onConfirm={() => {
            handleDeleteExercise(exercise.id);
            setConfirmDelete(false);
          }}
        />
      )}

      {/* ⚠️ Confirmar eliminación de respuesta */}
      {confirmDeleteSubmission && (
        <ConfirmModal
          message="¿Estás seguro de que deseas eliminar esta respuesta? Esta acción no se puede deshacer."
          onCancel={() => setConfirmDeleteSubmission(null)}
          onConfirm={() => {
            handleDeleteSubmission(confirmDeleteSubmission);
            setConfirmDeleteSubmission(null);
          }}
        />
      )}

      {alertModal && (
        <AlertModal
          type={alertModal.type}
          message={alertModal.message}
          onClose={() => setAlertModal(null)}
        />
      )}

      <article className="bg-[#3e4145] rounded-xl overflow-hidden border border-[#787e86] hover:border-[#84888c] transition-all duration-300 shadow-lg hover:shadow-xl flex flex-col h-full">
        {/* Imagen y encabezado */}
        {exercise.image_url && (
          <header
            className="relative overflow-hidden group h-48 bg-[#787e86] bg-opacity-10 cursor-pointer"
            onClick={() => setModalImage(exercise.image_url ?? null)}
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

        {/* Contenido */}
        <div className="p-4 md:p-5 flex flex-col flex-1">
          <h3 className="text-lg md:text-xl font-bold text-[#b7babe] mb-3 line-clamp-2">{exercise.title}</h3>

          <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm text-[#84888c] mb-3">
            <div className="flex items-center gap-1.5">
              <Calendar size={14} />
              <span>{formatDate(exercise.created_at)}</span>
            </div>
            {exercise.professor && (
              <div className="flex items-center gap-1.5">
                <User size={14} />
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
              className="flex items-center justify-center sm:justify-start gap-2 
                bg-[#2b3238]/50 hover:bg-[#2b3238]/80 text-[#e2e2e2] 
                transition-colors py-2 px-4 rounded-lg 
                font-medium text-sm md:text-base shadow-sm hover:shadow-md"
            >
              <MessageSquare size={18} />
              <span>
                {submissions.length} {submissions.length === 1 ? 'Respuesta' : 'Respuestas'}
              </span>
              {showSubmissions ? (
                <ChevronUp size={18} fill="#fff" />
              ) : (
                <ChevronDown size={18} fill="#fff" />
              )}
            </button>

            {profile?.role === 'student' && onSubmit && (
              <button
                onClick={onSubmit}
                className="px-4 py-2 bg-[#787e86] hover:bg-[#84888c] 
                  text-white rounded-lg transition-colors 
                  font-medium text-sm md:text-base shadow-md hover:shadow-lg"
              >
                Responder
              </button>
            )}
          </div>

          {/* Botón eliminar ejercicio */}
          {profile?.role === 'professor' && profile.id === exercise.professor_id && (
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 mt-5 
                bg-[#161b1f] hover:bg-[#1f262b] text-white 
                rounded-lg transition-colors font-medium 
                text-sm md:text-base shadow-md hover:shadow-lg border border-[#2b3238]"
            >
              <X size={18} />
              Eliminar ejercicio
            </button>
          )}

          {/* Mostrar respuestas */}
          {showSubmissions && submissions.length > 0 && (
            <div className="mt-4 space-y-3 pt-4 border-t border-[#787e86]">
              {submissions.map((submission) => (
                <div key={submission.id} className="bg-[#787e86]/20 rounded-lg p-3 md:p-4 border border-[#787e86]">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-[#b7babe] font-medium text-sm md:text-base truncate">
                        {submission.student?.full_name}
                      </p>
                      <p className="text-xs text-[#84888c] mt-0.5">{formatDate(submission.created_at)}</p>
                    </div>

                    {/* 🗑️ Botón eliminar respuesta */}
                    {profile?.role === 'professor' && profile.id === exercise.professor_id && (
                      <button
                        onClick={() => setConfirmDeleteSubmission(submission.id)}
                        title="Eliminar respuesta"
                        className="p-2 bg-[#161b1f] hover:bg-[#1f262b] text-red-400 rounded-full transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  {submission.image_url && (
                    <img
                      src={submission.image_url}
                      alt="Respuesta"
                      className="w-full rounded-lg mb-3 max-h-48 object-cover cursor-pointer"
                      onClick={() => setModalImage(submission.image_url)}
                    />
                  )}
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