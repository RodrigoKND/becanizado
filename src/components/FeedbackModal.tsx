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
    <div className="fixed inset-0 flex items-center justify-center p-3 sm:p-4 z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      <div 
        className="rounded-lg shadow-xl w-full max-w-3xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: '#3e4145' }}
      >
        {/* Header del modal */}
        <div 
          className="sticky top-0 border-b p-4 sm:p-6 flex items-center justify-between gap-3"
          style={{ backgroundColor: '#3e4145', borderColor: '#84888c' }}
        >
          <h2 className="text-xl sm:text-2xl font-bold" style={{ color: '#b7babe' }}>
            Retroalimentación
          </h2>
          <button
            onClick={onClose}
            className="transition-colors p-1 rounded hover:bg-opacity-80"
            style={{ color: '#b7babe' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#787e86')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <X size={24} />
          </button>
        </div>

        {/* Contenido del modal */}
        <div className="p-4 sm:p-6">
          {/* Mensaje de éxito */}
          {success && (
            <div 
              className="mb-4 p-3 border rounded-lg"
              style={{ 
                backgroundColor: 'rgba(120, 126, 134, 0.2)', 
                borderColor: '#b7babe'
              }}
            >
              <p className="text-sm sm:text-base font-semibold" style={{ color: '#b7babe' }}>
                ✓ ¡Retroalimentación guardada correctamente!
              </p>
            </div>
          )}

          {/* Información del estudiante */}
          <div className="mb-4 sm:mb-6">
            <p className="text-xs sm:text-sm mb-2" style={{ color: '#84888c' }}>
              Estudiante
            </p>
            <p className="text-sm sm:text-base font-medium" style={{ color: '#b7babe' }}>
              {submission.student?.full_name}
            </p>
          </div>

          {/* Respuesta del estudiante */}
          <div className="mb-4 sm:mb-6">
            <p className="text-xs sm:text-sm mb-2" style={{ color: '#84888c' }}>
              Respuesta del estudiante
            </p>
            <img
              src={submission.image_url}
              alt="Respuesta"
              className="w-full rounded-lg border"
              style={{ borderColor: '#84888c' }}
            />
          </div>

          {/* Mensaje de error */}
          {error && (
            <div 
              className="mb-4 p-3 border rounded text-sm"
              style={{ 
                backgroundColor: 'rgba(220, 38, 38, 0.2)', 
                borderColor: '#dc2626',
                color: '#fca5a5'
              }}
            >
              {error}
            </div>
          )}

          {/* Área de retroalimentación */}
          <div className="space-y-4">
            <div>
              <label 
                htmlFor="feedback" 
                className="block text-xs sm:text-sm font-medium mb-2"
                style={{ color: '#b7babe' }}
              >
                Tu retroalimentación
              </label>
              <textarea
                id="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                required
                rows={6}
                className="w-full px-3 sm:px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent resize-none text-sm sm:text-base"
                style={{
                  backgroundColor: '#787e86',
                  borderColor: '#84888c',
                  color: '#b7babe',
                  caretColor: '#b7babe',
                }}
                placeholder="Escribe tu retroalimentación aquí..."
              />
            </div>

            {/* Botones */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:flex-1 px-4 py-2 sm:py-2.5 border rounded-lg transition-colors text-sm sm:text-base font-medium"
                style={{ 
                  borderColor: '#84888c',
                  color: '#b7babe'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#787e86')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || !feedback.trim()}
                className="w-full sm:flex-1 flex items-center justify-center gap-2 font-medium py-2 sm:py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                style={{
                  backgroundColor: '#787e86',
                  color: '#b7babe'
                }}
                onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = '#5a5f66')}
                onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = '#787e86')}
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