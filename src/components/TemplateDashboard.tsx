import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Submission } from '../lib/supabase';
import CreateExercise from './CreateExercise';
import SubmitExercise from './SubmitExercise';
import FeedbackModal from './FeedbackModal';
import Header from './Header';
import Sidebar from './Sidebar';

interface TemplateDashboardProps {
  children: React.ReactNode;
  profile: any;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
  selectedExercise?: string | null;
  setSelectedExercise?: (id: string | null) => void;
  selectedSubmission?: Submission | null;
  setSelectedSubmission?: (sub: Submission | null) => void;
}

export default function TemplateDashboard({
  children,
  profile,
  searchQuery,
  setSearchQuery,
  selectedExercise,
  setSelectedExercise,
  selectedSubmission,
  setSelectedSubmission,
}: TemplateDashboardProps) {
  const [showCreateExercise, setShowCreateExercise] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const path = window.location.pathname;
  const route = { youtube: '/sobre-mi-canal-yt' };

  return (
    <section className="min-h-screen bg-card-bg flex">
      
      {/* Overlay Sidebar en Mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar sidebarOpen={sidebarOpen} />

      <div className="flex flex-col w-full">
        <Header searchQuery={searchQuery || ''} onSearchChange={setSearchQuery!} />

        {/* Botón flotante para TODOS (mobile) */}
        <button
          onClick={() => setShowCreateExercise(true)}
          className="lg:hidden fixed bottom-6 right-6 z-30 p-4 bg-input-bg hover-bg text-primary rounded-full shadow-2xl transition-colors"
          title="Crear Nuevo Ejercicio"
        >
          <Plus size={24} />
        </button>

        <div className="flex-1 overflow-y-auto">
          <div className="w-full max-w-[100%] mx-auto px-4 md:px-6 py-6">
            <div className={`grid grid-cols-1 lg:grid-cols-[1fr_${path !== route.youtube ? '300px': '100px'}] gap-6`}>
              <div className="w-full">{children}</div>
              {path !== route.youtube && (
                {/* Columna derecha */}
            <div className="hidden lg:block lg:col-span-1">
              <div className="sticky top-20 space-y-6">

                {/* Perfil rápido */}
                <div className="bg-card-bg rounded-xl p-4 shadow-xl border border-border-color">
                  <h3 className="text-lg font-bold text-primary mb-3 border-b border-border-color pb-2">
                    Bienvenido {profile?.full_name}
                  </h3>
                  <p className="text-secondary text-sm">{profile?.email}</p>
                  <p className="text-secondary text-sm capitalize">
                    Rol: {profile?.role}
                  </p>
                </div>

                {/* Acciones (Ahora para TODOS) */}
                <div className="bg-card-bg rounded-xl p-4 shadow-xl border border-border-color">
                  <h3 className="text-lg font-bold text-primary mb-3">Acciones</h3>
                  <button
                    onClick={() => setShowCreateExercise(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-input-bg hover-bg text-primary rounded-xl transition-colors font-bold shadow-lg"
                  >
                    <Plus size={20} />
                    Crear Nuevo Ejercicio
                  </button>
                </div>

              </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modales */}
      {showCreateExercise && (
        <CreateExercise onClose={() => setShowCreateExercise(false)} onSuccess={() => {}} />
      )}
      {selectedExercise && (
        <SubmitExercise
          exerciseId={selectedExercise}
          onClose={() => setSelectedExercise && setSelectedExercise(null)}
          onSuccess={() => {}}
        />
      )}
      {selectedSubmission && (
        <FeedbackModal
          submission={selectedSubmission}
          onClose={() => setSelectedSubmission && setSelectedSubmission(null)}
          onSuccess={() => {}}
        />
      )}
    </section>
  );
}

