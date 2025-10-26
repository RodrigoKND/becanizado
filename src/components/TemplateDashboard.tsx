import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

import Header from './Header';
import Sidebar from './Sidebar';
import CreateExercise from './CreateExercise';
import SubmitExercise from './SubmitExercise';
import FeedbackModal from './FeedbackModal';
import { Submission } from '../lib/supabase';

interface TemplateDashboardProps {
  children: React.ReactNode;
}

export default function TemplateDashboard({ children }: TemplateDashboardProps) {
  const { profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateExercise, setShowCreateExercise] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <section className="min-h-screen bg-[#3e4145] flex">

      {/* Overlay Sidebar en Mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar sidebarOpen={sidebarOpen} />

      <div className="flex-1 flex flex-col w-full">
        <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

        {profile?.role === 'professor' && (
          <button
            onClick={() => setShowCreateExercise(true)}
            className="lg:hidden fixed bottom-6 right-6 z-30 p-4 bg-[#151B26] hover:bg-[#151B26] text-white rounded-full shadow-2xl transition-colors"
            title="Crear Nuevo Ejercicio"
          >
            <Plus size={24} />
          </button>
        )}

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4 md:p-6 lg:p-8">

            {/* Aquí entra el contenido dinámico */}
            {children}

            {/* Columna Derecha (Solo desktop) */}
            <div className="hidden lg:block lg:col-span-1">
              <div className="sticky top-20 space-y-6">

                {/* Perfil Rápido */}
                <div className="bg-[#3e4145] rounded-xl p-4 shadow-xl border border-[#787e86]/50">
                  <h3 className="text-lg font-bold text-[#b7babe] mb-3 border-b border-[#787e86]/30 pb-2">
                    Bienvenido {profile?.role === 'professor' ? 'profesor' : profile?.full_name}
                  </h3>
                  <p className="text-[#84888c] text-sm">{profile?.email}</p>
                  <p className="text-[#84888c] text-sm capitalize">
                    Rol: {profile?.role}
                  </p>
                </div>

                {/* Botón acciones solo para profesor */}
                {profile?.role === 'professor' && (
                  <div className="bg-[#3e4145] rounded-xl p-4 shadow-xl border border-[#787e86]/50">
                    <h3 className="text-lg font-bold text-[#b7babe] mb-3">Acciones</h3>
                    <button
                      onClick={() => setShowCreateExercise(true)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#151B26] hover:bg-[#151B26] text-white rounded-xl transition-colors font-bold shadow-lg"
                    >
                      <Plus size={20} />
                      Crear Nuevo Ejercicio
                    </button>
                  </div>
                )}

              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Modales */}
      {showCreateExercise && (
        <CreateExercise
          onClose={() => setShowCreateExercise(false)}
          onSuccess={() => {}}
        />
      )}

      {selectedExercise && (
        <SubmitExercise
          exerciseId={selectedExercise}
          onClose={() => setSelectedExercise(null)}
          onSuccess={() => {}}
        />
      )}

      {selectedSubmission && (
        <FeedbackModal
          submission={selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
          onSuccess={() => {}}
        />
      )}
    </section>
  );
}
