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
    <section className="min-h-screen bg-[#3e4145] flex">
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

        {/* Botón flotante solo para mobile */}
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
          <div className="w-full max-w-[100%] mx-auto px-4 md:px-6 py-6">
            <div className={`grid grid-cols-1 lg:grid-cols-[1fr_${path !== route.youtube ? '300px': '100px'}] gap-6`}>
              <div className="w-full">{children}</div>

              {path !== route.youtube && (
                <div className="hidden lg:block">
                  <div className="sticky top-20 space-y-6">
                    {/* Perfil rápido */}
                    <div className="bg-[#3e4145] rounded-xl p-4 shadow-xl border border-[#787e86]/50">
                      <h3 className="text-lg font-bold text-[#b7babe] mb-3 border-b border-[#787e86]/30 pb-2">
                        Bienvenido {profile?.role === 'professor' ? 'profesor' : profile?.full_name}
                      </h3>
                      <p className="text-[#84888c] text-sm">{profile?.email}</p>
                      <p className="text-[#84888c] text-sm capitalize">
                        Rol: {profile?.role}
                      </p>
                    </div>

                    {/* Acciones profesor */}
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

