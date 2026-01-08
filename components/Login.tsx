
import React, { useState } from 'react';
import Logo from './Logo';
import { supabase } from '../supabaseClient';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    
    try {
      if (isRegister) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setMessage('Registo efetuado! Verifique o seu e-mail para confirmar a conta ou faça login se a confirmação não for necessária.');
        setIsRegister(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        onLogin();
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro na autenticação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-yellow-400/5 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-10">
          <Logo size="lg" className="mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Bet<span className="text-yellow-400">Profit</span>
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Sua performance, sob controlo.</p>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-8 text-center">
            {isRegister ? 'Criar nova conta' : 'Aceder à plataforma'}
          </h2>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-xs animate-in slide-in-from-top-2">
              <i className="fas fa-exclamation-circle text-sm"></i>
              {error}
            </div>
          )}
          
          {message && (
            <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3 text-emerald-400 text-xs animate-in slide-in-from-top-2">
              <i className="fas fa-check-circle text-sm"></i>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest ml-1">E-mail</label>
              <div className="relative">
                <i className="fas fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 text-sm"></i>
                <input 
                  type="email" 
                  required
                  placeholder="exemplo@email.com"
                  className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl pl-12 pr-4 py-4 text-white outline-none focus:border-yellow-400/50 focus:ring-4 focus:ring-yellow-400/5 transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest ml-1">Palavra-passe</label>
              <div className="relative">
                <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 text-sm"></i>
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl pl-12 pr-4 py-4 text-white outline-none focus:border-yellow-400/50 focus:ring-4 focus:ring-yellow-400/5 transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:opacity-50 text-slate-900 py-4 rounded-2xl font-bold shadow-xl shadow-yellow-400/10 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loading ? (
                <i className="fas fa-circle-notch animate-spin"></i>
              ) : (
                <>
                  <span>{isRegister ? 'Registar agora' : 'Entrar na conta'}</span>
                  <i className="fas fa-arrow-right text-xs"></i>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-800/50 text-center">
            <p className="text-slate-500 text-sm">
              {isRegister ? 'Já tem uma conta?' : 'Ainda não é membro?'}
              <button 
                onClick={() => {
                  setIsRegister(!isRegister);
                  setError(null);
                  setMessage(null);
                }}
                className="ml-2 text-yellow-400 font-bold hover:underline"
              >
                {isRegister ? 'Fazer Login' : 'Criar Conta'}
              </button>
            </p>
          </div>
        </div>
        
        <p className="mt-8 text-center text-slate-600 text-xs">
          &copy; {new Date().getFullYear()} BetProfit Analytics. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
};

export default Login;
