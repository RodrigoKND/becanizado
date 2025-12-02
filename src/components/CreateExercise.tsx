import React, { useState } from 'react';
import { X, Upload, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';

interface CreateExerciseProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateExercise({ onClose, onSuccess }: CreateExerciseProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const queryClient = useQueryClient();
  
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

    setLoading(true);
    setError('');

    try {
      let imageUrl = '';

      if (image) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('exercises')
          .upload(fileName, image, {
            upsert: true,
            contentType: image.type,
          });

        if (uploadError) throw uploadError;

        const { data: publicData } = supabase.storage
          .from('exercises')
          .getPublicUrl(fileName);

        imageUrl = publicData.publicUrl;
      }

      const { data:insertedData, error: insertError } = await supabase
        .from('exercises')
        .insert({
          professor_id: user.id,
          title,
          description,
          image_url: imageUrl || null,
        }).select().single();

      if (insertError) throw insertError;

      queryClient.setQueryData(['exercises'], (old: any) => {
        if (!old) return [insertedData];
        if ((old as any).pages) {
          return {
            ...old,
            pages: (old as any).pages.map((page: any, i: number) =>
              i === 0 ? [insertedData, ...page] : page
            ),
          };
        }
        return [insertedData, ...old];
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al crear el ejercicio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <h2 className="modal-title">Nuevo Ejercicio</h2>
          <button onClick={onClose} className="modal-close">
            <X size={24} />
          </button>
        </div>

        {error && <div className="alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="modal-form">
          <div>
            <label htmlFor="title" className="label">
              Título del ejercicio
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="input"
              placeholder="Ej: Ejercicio de Álgebra #1"
            />
          </div>

          <div>
            <label htmlFor="description" className="label">
              Descripción
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={5}
              className="textarea"
              placeholder="Describe el ejercicio en detalle..."
            />
          </div>

          <div>
            <label className="label">Imagen del ejercicio (opcional)</label>
            <div className="image-upload">
              {imagePreview ? (
                <div className="image-preview">
                  <img src={imagePreview} alt="Preview" />
                  <button
                    type="button"
                    onClick={() => {
                      setImage(null);
                      setImagePreview('');
                    }}
                    className="image-remove"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <label className="upload-label">
                  <Upload size={48} className="upload-icon" />
                  <p>Haz clic para subir una imagen</p>
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

          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              <Plus size={20} />
              {loading ? 'Creando...' : 'Crear Ejercicio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}