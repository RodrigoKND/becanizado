import React, { useState } from 'react';
import { X, Upload, Send } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface SubmitExerciseProps {
  exerciseId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function SubmitExercise({ exerciseId, onClose, onSuccess }: SubmitExerciseProps) {
  const { user } = useAuth();
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [textResponse, setTextResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!image && !textResponse.trim()) {
      setError("Debes enviar texto, imagen o ambos.");
      return;
    }

    setLoading(true);
    setError('');

    try {
      let imageUrl = null;

      if (image) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('submissions')
          .upload(fileName, image);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('submissions')
          .getPublicUrl(fileName);

        imageUrl = publicUrl;
      }

      const { error: insertError } = await supabase
        .from('submissions')
        .insert({
          exercise_id: exerciseId,
          student_id: user.id,
          image_url: imageUrl,
          text_response: textResponse.trim(),
        });

      if (insertError) throw insertError;

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);

    } catch (err: any) {
      setError(err.message || 'Error al enviar la respuesta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        
        {/* HEADER */}
        <div className="modal-header">
          <h2 className="modal-title">Enviar Respuesta</h2>
          <button onClick={onClose} className="modal-close">
            <X size={24} />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-4 md:p-6 space-y-6">

          {/* ÉXITO */}
          {success && (
            <div className="p-4 bg-input-bg bg-opacity-20 border border-border-color rounded-lg">
              <p className="text-primary font-semibold">✓ ¡Respuesta enviada correctamente!</p>
            </div>
          )}

          {/* ERROR */}
          {error && (
            <div className="alert-error">
              {error}
            </div>
          )}

          {/* RESPUESTA EN TEXTO */}
          <div>
            <label className="label">
              Respuesta en texto (opcional)
            </label>
            <textarea
              value={textResponse}
              onChange={(e) => setTextResponse(e.target.value)}
              rows={4}
              placeholder="Escribe tu respuesta aquí..."
              className="textarea"
            />
          </div>

          {/* IMAGEN */}
          <div>
            <label className="label">
              Imagen de tu respuesta (opcional)
            </label>

            <div className="image-upload">
              {imagePreview ? (
                <div className="image-preview">
                  <img
                    src={imagePreview}
                    alt="Vista previa"
                    className="max-h-64 mx-auto rounded-xl shadow-lg"
                  />
                  <button
                    type="button"
                    onClick={() => { setImage(null); setImagePreview(''); }}
                    className="image-remove"
                  >
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <label className="upload-label cursor-pointer block">
                  <Upload className="upload-icon mx-auto mb-3" size={48} />
                  <p className="text-primary font-semibold">Haz clic para subir imagen</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* BOTONES */}
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
              disabled={loading}
              className="btn-primary"
            >
              <Send size={20} />
              {loading ? 'Enviando...' : 'Enviar Respuesta'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}