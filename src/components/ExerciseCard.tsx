import React, { useState, useEffect } from 'react';
import { Calendar, Trash2, User, MessageSquare, X, Download, CheckCircle, AlertCircle, ChevronUp, ChevronDown } from 'lucide-react';
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
      className="bg-card-bg border border-border-color rounded-xl p-6 max-w-sm w-full text-center shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      <h2 className="text-lg font-semibold text-primary mb-3">Confirmar acción</h2>
      <p className="text-primary mb-6">{message}</p>
      <div className="flex justify-center gap-3">
        <button
          onClick={onCancel}
          className="btn-secondary"
        >
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          className="btn-primary"
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
      className="bg-card-bg border border-border-color rounded-xl p-6 max-w-sm w-full text-center shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex flex-col items-center justify-center mb-3">
        {type === 'success' ? (
          <CheckCircle size={40} className="text-green-400 mb-2" />
        ) : (
          <AlertCircle size={40} className="text-red-400 mb-2" />
        )}
        <h2 className="text-lg font-semibold text-primary">
          {type === 'success' ? 'Éxito' : 'Error'}
        </h2>
      </div>
      <p className="text-primary mb-6">{message}</p>
      <button
        onClick={onClose}
        className="btn-primary"
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
        className="relative bg-card-bg rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
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
  }, [exercise.id, submissions]);

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

      const { data, error } = await query;
      if (error) throw error;

      setSubmissions(data || []);
    } catch (error) {
      setAlertModal({ type: 'error', message: 'Ocurrió un error al cargar las respuestas.' });
    }
  };

  const handleDeleteExercise = async (exerciseId: string) => {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .delete()
        .eq('id', exerciseId)
        .select();

      if (error) throw error;
      if (!data || data.length === 0) {
        setAlertModal({
          type: 'error',
          message: 'No se encontró el ejercicio o no tienes permisos para eliminarlo.',
        });
        return;
      }

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
      setAlertModal({ type: 'error', message: 'Ocurrió un error al eliminar el ejercicio.' });
    }
  };

  const handleDeleteSubmission = async (submissionId: string) => {
    try {
      const { error } = await supabase
        .from('submissions')
        .delete()
        .eq('id', submissionId);

      if (error) throw error;

      setAlertModal({ type: 'success', message: 'Respuesta eliminada correctamente.' });
      setSubmissions((prev) => prev.filter((s) => s.id !== submissionId));
      queryClient.setQueryData(['submissions'], (old: any) => {
        if (!old) return [];
        if (Array.isArray(old)) return old.filter((e: any) => e.id !== submissionId);
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

      <article className="bg-card-bg rounded-xl overflow-hidden border border-border-color hover:border-[#84888c] transition-all duration-300 shadow-lg hover:shadow-xl flex flex-col h-full">
        {exercise.image_url && (
          <header
            className="relative overflow-hidden group h-48 bg-input-bg bg-opacity-10 cursor-pointer"
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

        <div className="p-4 md:p-5 flex flex-col flex-1">
          <h3 className="text-lg md:text-xl font-bold text-primary mb-3 line-clamp-2">{exercise.title}</h3>

          <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm text-secondary mb-3">
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

          <p className="text-primary text-sm md:text-base whitespace-pre-wrap mb-4 line-clamp-3 flex-1">
            {exercise.description}
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-border-color">
            <button
              onClick={() => setShowSubmissions(!showSubmissions)}
              className="flex items-center justify-center sm:justify-start gap-2 
                bg-input-bg hover-bg text-primary 
                transition-colors py-2 px-4 rounded-lg 
                font-medium text-sm md:text-base shadow-sm hover:shadow-md"
            >
              <MessageSquare size={18} />
              <span>
                {submissions.length} {submissions.length === 1 ? 'Respuesta' : 'Respuestas'}
              </span>
              {showSubmissions ? (
                <ChevronUp size={18} fill="currentColor" />
              ) : (
                <ChevronDown size={18} fill="currentColor" />
              )}
            </button>

            {profile?.role === 'student' && onSubmit && (
              <button
                onClick={onSubmit}
                className="btn-primary shadow-md hover:shadow-lg"
              >
                Responder
              </button>
            )}
          </div>

          {profile?.role === 'professor' && profile?.id === exercise.professor_id && (
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 mt-5 
                bg-input-bg hover-bg text-primary 
                rounded-lg transition-colors font-medium 
                text-sm md:text-base shadow-md hover:shadow-lg border border-border-color"
            >
              <X size={18} />
              Eliminar ejercicio
            </button>
          )}

          {/* Mostrar respuestas */}
          {showSubmissions && submissions.length > 0 && (
            <div className="mt-4 space-y-3 pt-4 border-t border-border-color">
              {submissions.map((submission) => (
                <div key={submission.id} className="bg-input-bg bg-opacity-20 rounded-lg p-3 md:p-4 border border-border-color">
                  
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-primary font-medium text-sm md:text-base truncate">
                        {submission.student?.full_name}
                      </p>
                      <p className="text-xs text-secondary mt-0.5">{formatDate(submission.created_at)}</p>
                    </div>
                    
                    {profile?.role === 'professor' && (
                      <button
                        onClick={() => setConfirmDeleteSubmission(submission.id)}
                        className="p-2 hover-bg rounded-lg transition-colors ml-2"
                        title="Eliminar respuesta"
                      >
                        <Trash2 size={18} className="text-red-400 hover:text-red-300" />
                      </button>
                    )}
                  </div>

                  {/* 📝 TEXTO DE RESPUESTA - MEJORADO */}
                  {submission.text_response && (
                    <div className="bg-card-bg rounded-lg p-3 mb-3 border border-border-color">
                      <p className="text-xs text-secondary mb-2 font-semibold uppercase tracking-wide">
                        Respuesta del estudiante
                      </p>
                      <p className="text-primary text-sm md:text-base whitespace-pre-wrap leading-relaxed">
                        {submission.text_response}
                      </p>
                    </div>
                  )}

                  {/* 🖼 IMAGEN DE RESPUESTA */}
                  {submission.image_url && (
                    <div className="mb-3">
                      <p className="text-xs text-secondary mb-2 font-semibold uppercase tracking-wide">
                        Imagen adjunta
                      </p>
                      <img
                        src={submission.image_url}
                        alt="Respuesta"
                        className="w-full rounded-lg max-h-64 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => setModalImage(submission.image_url)}
                      />
                    </div>
                  )}
                  
                  {/* 💬 RETROALIMENTACIÓN DEL PROFESOR */}
                  {submission.feedback && (
                    <div className="bg-card-bg rounded-lg p-3 border border-border-color">
                      <p className="text-xs text-secondary mb-2 font-semibold uppercase tracking-wide">
                        Retroalimentación del profesor
                      </p>
                      <p className="text-primary text-sm md:text-base whitespace-pre-wrap leading-relaxed">
                        {submission.feedback}
                      </p>
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