import React, { useState } from 'react';
import { X, MessageSquare } from 'lucide-react';
import { supabase, Submission } from '../lib/supabase';

interface FeedbackModalProps {
  submission: Submission;
  onClose: () => void;
  onSuccess: () => void;
}

export default function FeedbackModal({ submission, onClose, onSuccess }: FeedbackModalProps) {
  const [feedback, setFeedback] = useState(submission.feedback || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error: updateError } = await supabase
        .from('submissions')
        .update({ feedback })
        .eq('id', submission.id);

      if (updateError) throw updateError;

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Error al guardar la retroalimentación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        {/* Header del modal */}
        <div className="modal-header">
          <h2 className="modal-title">
            Retroalimentación
          </h2>
          <button
            onClick={onClose}
            className="modal-close"
          >
            <X size={24} />
          </button>
        </div>

        {/* Contenido del modal */}
        <div className="p-4 sm:p-6">
          {/* Mensaje de éxito */}
          {success && (
            <div className="mb-4 p-3 border border-border-color rounded-lg bg-input-bg bg-opacity-20">
              <p className="text-sm sm:text-base font-semibold text-primary">
                ✓ ¡Retroalimentación guardada correctamente!
              </p>
            </div>
          )}

          {/* Información del estudiante */}
          <div className="mb-4 sm:mb-6">
            <p className="text-xs sm:text-sm mb-2 font-semibold uppercase tracking-wide text-secondary">
              Estudiante
            </p>
            <p className="text-sm sm:text-base font-medium text-primary">
              {submission.student?.full_name}
            </p>
          </div>

          {/* Respuesta del estudiante */}
          <div className="mb-4 sm:mb-6">
            <p className="text-xs sm:text-sm mb-3 font-semibold uppercase tracking-wide text-secondary">
              Respuesta del estudiante
            </p>
            
            <div className="space-y-3">
              {/* 📝 TEXTO DE RESPUESTA */}
              {submission.text_response && (
                <div className="p-3 sm:p-4 rounded-lg border border-border-color bg-card-bg">
                  <p className="text-xs mb-2 font-semibold uppercase tracking-wide text-secondary">
                    Texto
                  </p>
                  <p className="text-sm sm:text-base whitespace-pre-wrap leading-relaxed text-primary">
                    {submission.text_response}
                  </p>
                </div>
              )}

              {/* 🖼 IMAGEN DE RESPUESTA */}
              {submission.image_url && (
                <div>
                  <p className="text-xs mb-2 font-semibold uppercase tracking-wide text-secondary">
                    Imagen adjunta
                  </p>
                  <img
                    src={submission.image_url}
                    alt="Respuesta del estudiante"
                    className="w-full rounded-lg border border-border-color"
                  />
                </div>
              )}

              {/* Mensaje si no hay respuesta */}
              {!submission.text_response && !submission.image_url && (
                <div className="p-4 rounded-lg border border-border-color text-center bg-input-bg bg-opacity-10">
                  <p className="text-sm text-secondary">
                    El estudiante no proporcionó respuesta
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Mensaje de error */}
          {error && (
            <div className="alert-error">
              {error}
            </div>
          )}

          {/* Área de retroalimentación */}
          <div className="space-y-4">
            <div>
              <label 
                htmlFor="feedback" 
                className="label"
              >
                Tu retroalimentación
              </label>
              <textarea
                id="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                required
                rows={6}
                className="textarea"
                placeholder="Escribe tu retroalimentación aquí..."
              />
            </div>

            {/* Botones */}
            <div className="modal-actions">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || !feedback.trim()}
                className="btn-primary"
              >
                <MessageSquare size={20} />
                <span className="hidden xs:inline sm:inline">{loading ? 'Guardando...' : 'Guardar Retroalimentación'}</span>
                <span className="xs:hidden sm:hidden">{loading ? 'Guardando...' : 'Guardar'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}