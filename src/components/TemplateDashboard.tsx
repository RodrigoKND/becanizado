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
  profile?: any;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
  selectedExercise?: string | null;
  setSelectedExercise?: (id: string | null) => void;
  selectedSubmission?: Submission | null;
  setSelectedSubmission?: (sub: Submission | null) => void;
}

export default function TemplateDashboard({
  children,
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

        <aside className="flex-1 overflow-y-auto">
          <section className="w-full mx-auto px-4 md:px-6 py-6">
            <div className={`grid grid-cols-1 lg:grid-cols-[1fr_${path !== route.youtube ? '500px' : '100px'}] gap-6`}>
              <div className="w-full">
                {children}
              </div>
            </div>
          </section>
        </aside>
      </div>

      {
        showCreateExercise && (
          <CreateExercise onClose={() => setShowCreateExercise(false)} onSuccess={() => { }} />
        )
      }
      {
        selectedExercise && (
          <SubmitExercise
            exerciseId={selectedExercise}
            onClose={() => setSelectedExercise && setSelectedExercise(null)}
            onSuccess={() => { }}
          />
        )
      }
      {
        selectedSubmission && (
          <FeedbackModal
            submission={selectedSubmission}
            onClose={() => setSelectedSubmission && setSelectedSubmission(null)}
            onSuccess={() => { }}
          />
        )
      }
    </section >
  );
}

