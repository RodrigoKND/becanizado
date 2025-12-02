import React, { useState } from 'react';
import { X, Upload, Send, FileImage } from 'lucide-react';
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[#3e4145] rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-[#787e86]">
        
        {/* HEADER */}
        <div className="bg-[#787e86] bg-opacity-10 border-b border-[#787e86] p-4 md:p-6 flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-bold text-[#b7babe]">Enviar Respuesta</h2>
          <button onClick={onClose} className="text-[#84888c] hover:text-[#b7babe] p-2">
            <X size={24} />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-4 md:p-6 space-y-6">

          {/* ÉXITO */}
          {success && (
            <div className="p-4 bg-[#787e86] bg-opacity-20 border border-[#b7babe] rounded-lg">
              <p className="text-[#b7babe] font-semibold">✓ ¡Respuesta enviada correctamente!</p>
            </div>
          )}

          {/* ERROR */}
          {error && (
            <div className="p-4 bg-red-900/30 border border-red-700/50 rounded-lg">
              <p className="text-red-200">{error}</p>
            </div>
          )}

          {/* RESPUESTA EN TEXTO */}
          <div>
            <label className="block text-sm font-semibold text-[#b7babe] mb-2">
              Respuesta en texto (opcional)
            </label>
            <textarea
              value={textResponse}
              onChange={(e) => setTextResponse(e.target.value)}
              rows={4}
              placeholder="Escribe tu respuesta aquí..."
              className="w-full p-3 rounded-xl bg-[#2a2c2e] text-[#b7babe] border border-[#787e86] focus:border-[#b7babe] outline-none"
            />
          </div>

          {/* IMAGEN */}
          <div>
            <label className="block text-sm font-semibold text-[#b7babe] mb-3">
              Imagen de tu respuesta (opcional)
            </label>

            <div className="border-2 border-dashed border-[#787e86] rounded-xl p-6 text-center bg-[#787e86] bg-opacity-5">
              {imagePreview ? (
                <div className="relative group">
                  <img
                    src={imagePreview}
                    className="max-h-64 mx-auto rounded-xl shadow-lg"
                  />
                  <button
                    type="button"
                    onClick={() => { setImage(null); setImagePreview(''); }}
                    className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full"
                  >
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer block">
                  <Upload className="mx-auto mb-3 text-[#b7babe]" size={48} />
                  <p className="text-[#b7babe] font-semibold">Haz clic para subir imagen</p>
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
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button onClick={onClose} className="flex-1 border border-[#787e86] text-[#b7babe] p-3 rounded-xl">
              Cancelar
            </button>

            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-[#787e86] hover:bg-[#84888c] text-[#3e4145] font-bold p-3 rounded-xl"
            >
              <Send size={20} className="inline-block" />
              {loading ? ' Enviando...' : ' Enviar Respuesta'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
