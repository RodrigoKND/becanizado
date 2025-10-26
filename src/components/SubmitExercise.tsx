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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !image) return;

    setLoading(true);
    setError('');

    try {
      const fileExt = image.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('submissions')
        .upload(fileName, image);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('submissions')
        .getPublicUrl(fileName);

      const { error: insertError } = await supabase
        .from('submissions')
        .insert({
          exercise_id: exerciseId,
          student_id: user.id,
          image_url: publicUrl,
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
        <div className="bg-[#787e86] bg-opacity-10 border-b border-[#787e86] p-4 md:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#787e86] bg-opacity-20 p-2 rounded-lg">
              <Send size={24} className="text-[#b7babe]" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-[#b7babe]">Enviar Respuesta</h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#84888c] hover:text-[#b7babe] transition-colors p-2 hover:bg-[#787e86] hover:bg-opacity-20 rounded-lg"
          >
            <X size={24} />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          {success && (
            <div className="mx-4 md:mx-6 mt-4 md:mt-6 p-3 md:p-4 bg-[#787e86] bg-opacity-20 border border-[#b7babe] rounded-lg">
              <p className="text-[#b7babe] text-sm md:text-base font-semibold">✓ ¡Respuesta enviada correctamente!</p>
            </div>
          )}
          
          {error && (
            <div className="mx-4 md:mx-6 mt-4 md:mt-6 p-3 md:p-4 bg-red-900/30 border border-red-700/50 rounded-lg">
              <p className="text-red-200 text-sm md:text-base">{error}</p>
            </div>
          )}

          <div className="p-4 md:p-6 space-y-6">
            <div>
              <label className="block text-sm md:text-base font-semibold text-[#b7babe] mb-3">
                Imagen de tu respuesta
              </label>
              <div className="border-2 border-dashed border-[#787e86] rounded-xl p-6 md:p-8 text-center hover:border-[#84888c] transition-colors bg-[#787e86] bg-opacity-5">
                {imagePreview ? (
                  <div className="relative group">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-h-64 md:max-h-96 mx-auto rounded-xl shadow-lg"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-xl pointer-events-none" />
                    <button
                      type="button"
                      onClick={() => {
                        setImage(null);
                        setImagePreview('');
                      }}
                      className="absolute top-2 right-2 z-20 bg-red-600 hover:bg-red-700 text-white p-2 md:p-3 rounded-full transition-all shadow-lg hover:scale-110"
                    >
                      <X size={18} />
                    </button>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-xl" />
                  </div>
                ) : (
                  <label className="cursor-pointer block">
                    <div className="flex flex-col items-center gap-3 md:gap-4">
                      <div className="bg-[#787e86] bg-opacity-20 p-4 md:p-5 rounded-2xl">
                        <Upload className="text-[#b7babe]" size={48} />
                      </div>
                      <div>
                        <p className="text-[#b7babe] text-base md:text-lg font-semibold mb-2">
                          Haz clic para subir tu respuesta
                        </p>
                        <p className="text-[#84888c] text-sm md:text-base">
                          Sube una foto clara de tu ejercicio resuelto
                        </p>
                      </div>
                      <div className="flex items-center gap-2 px-4 py-2 bg-[#787e86] bg-opacity-20 rounded-lg">
                        <FileImage size={18} className="text-[#84888c]" />
                        <span className="text-[#84888c] text-sm">JPG, PNG, HEIC</span>
                      </div>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      required
                    />
                  </label>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-[#787e86] text-[#b7babe] hover:bg-[#787e86] hover:bg-opacity-20 rounded-xl transition-all font-medium text-sm md:text-base"
              >
                Cancelar
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={loading || !image}
                className="flex-1 flex items-center justify-center gap-2 bg-[#787e86] hover:bg-[#84888c] text-[#3e4145] font-bold py-3 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl disabled:hover:shadow-lg text-sm md:text-base"
              >
                <Send size={20} />
                {loading ? 'Enviando...' : 'Enviar Respuesta'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}