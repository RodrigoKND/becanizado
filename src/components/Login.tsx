import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const MathSymbols = React.memo(() => {
  const symbols = ['π', '∑', '∫', '√', '∞', 'Δ', '∂', 'θ', 'α', 'Σ'];

  return (
    <div className="math-symbols-container">
      {symbols.map((char, i) => (
        <div key={i} className={`math-symbol math-symbol-${i + 1}`}>
          {char}
        </div>
      ))}
    </div>
  );
});

export default function Login() {
  const { user } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [imageLoaded, setImageLoaded] = useState(false);

  const profileCheckRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const userId = session.user.id;

        if (profileCheckRef.current.has(userId)) return;
        profileCheckRef.current.add(userId);

        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', userId)
            .maybeSingle();

          if (!profile) {
            await supabase.from('profiles').insert({
              id: userId,
              email: session.user.email,
              full_name: session.user.user_metadata?.full_name || session.user.email,
              role: 'student',
            });
          }
        } catch (err) {
          console.error('Error al verificar/crear perfil:', err);
          profileCheckRef.current.delete(userId);
        }
      }
    });

    return () => {
      listener.subscription.unsubscribe();
      profileCheckRef.current.clear();
    };
  }, []);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
          },
        });
        if (error) throw error;

        if (data.user) {
          await supabase.from('profiles').insert({
            id: data.user.id,
            email: data.user.email,
            full_name: fullName,
            role: 'student',
          });
        }

        setMessage('Revisa tu correo y confirma tu cuenta antes de iniciar sesión.');
      }
    } catch (err: any) {
      setError(err.message || 'Error en la autenticación');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin + '/dashboard' },
      });
      if (oauthError) throw oauthError;
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión con Google');
      setLoading(false);
    }
  };


  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <section className="min-h-screen relative overflow-hidden bg-main-gradient">
      {/* Patrón de fondo */}
      <div className="absolute inset-0 bg-pattern" />

      {/* Símbolos matemáticos */}
      <MathSymbols />

      {/* Contenido principal */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          <div className="rounded-lg shadow-2xl p-8 bg-card">

            {/* Logo */}
            <div className="flex justify-center mb-8">
              <div className="relative h-20 w-20">
                {!imageLoaded && (
                  <div className="absolute inset-0 rounded-full animate-pulse bg-input" />
                )}
                <img
                  src="/LogoBecanizado.jpeg"
                  alt="Becanizado Logo"
                  className={`h-20 w-20 object-contain transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                  onLoad={() => setImageLoaded(true)}
                  loading="lazy"
                />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-center mb-2 text-primary">
              Becanizado
            </h1>
            <p className="text-center mb-8 text-secondary">
              {mode === 'login' ? 'Inicia sesión en tu cuenta' : 'Crea tu cuenta gratuita'}
            </p>

            {error && (
              <div className="mb-4 p-3 rounded text-sm" style={{
                backgroundColor: 'rgba(220, 38, 38, 0.1)',
                border: '1px solid rgba(220, 38, 38, 0.3)',
                color: '#fca5a5',
              }}>
                {error}
              </div>
            )}

            {message && (
              <div className="mb-4 p-3 rounded text-sm" style={{
                backgroundColor: 'rgba(34,197,94,0.1)',
                border: '1px solid rgba(34,197,94,0.3)',
                color: '#86efac',
              }}>
                {message}
              </div>
            )}

            <form onSubmit={handleEmailLogin} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium mb-2 text-primary">
                    Nombre completo
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 transition-all bg-input border border-input text-primary"
                    placeholder="Tu nombre completo"
                  />
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2 text-primary">
                  Correo electrónico
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 transition-all bg-input border border-input text-primary"
                  placeholder="tu@email.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2 text-primary">
                  Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 transition-all bg-input border border-input text-primary"
                  placeholder="••••••••••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading || email.length === 0 || password.length === 0}
                className="w-full flex items-center justify-center gap-2 font-medium py-2 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-black text-white"
              >
                {mode === 'login' ? <LogIn size={20} /> : <UserPlus size={20} />}
                {loading ? (mode === 'login' ? 'Iniciando sesión...' : 'Registrando...') : (mode === 'login' ? 'Iniciar sesión' : 'Registrarse')}
              </button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-input"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-card text-secondary">
                    O continúa con
                  </span>
                </div>
              </div>

              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="mt-4 w-full flex items-center justify-center gap-3 font-medium py-2 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white hover:bg-gray-200"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
              </button>
            </div>

            <p className="mt-6 text-center text-sm text-secondary">
              {mode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
              <button
                onClick={() => {
                  setMode(mode === 'login' ? 'register' : 'login');
                  setError('');
                  setMessage('');
                }}
                className="font-medium transition-colors hover:brightness-125 text-primary"
              >
                {mode === 'login' ? 'Regístrate' : 'Inicia sesión'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}