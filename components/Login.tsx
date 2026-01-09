import React, { useState, useEffect } from 'react';
import Logo from './Logo';

export interface User {
  id: string;
  name: string;
  email?: string;
  password: string;
}

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [view, setView] = useState<'QUICK' | 'LIST' | 'REGISTER'>('REGISTER');
  const [users, setUsers] = useState<User[]>([]);
  const [activeUser, setActiveUser] = useState<User | null>(null);
  
  // Register inputs
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Login input
  const [loginPassword, setLoginPassword] = useState('');
  
  const [error, setError] = useState('');

  useEffect(() => {
    // Migration & Load Logic
    const storedUsersStr = localStorage.getItem('betprofit_users');
    let loadedUsers: User[] = [];

    if (storedUsersStr) {
      try {
        loadedUsers = JSON.parse(storedUsersStr);
      } catch (e) {
        console.error("Erro ao carregar utilizadores, dados corrompidos:", e);
        // Opcional: limpar dados corrompidos para permitir que a app inicie
        // localStorage.removeItem('betprofit_users');
      }
    } else {
      // Check legacy single user
      const legacyUserStr = localStorage.getItem('betprofit_user');
      if (legacyUserStr) {
        try {
          const legacyUser = JSON.parse(legacyUserStr);
          // Assign 'default' ID to preserve access to existing root-level data in App.tsx
          const migratedUser: User = { ...legacyUser, id: 'default' };
          loadedUsers = [migratedUser];
          localStorage.setItem('betprofit_users', JSON.stringify(loadedUsers));
          // Optional: localStorage.removeItem('betprofit_user'); 
        } catch (e) {
          console.error("Erro ao migrar utilizador legado:", e);
        }
      }
    }

    setUsers(loadedUsers);

    // Determine initial view
    const lastActiveId = localStorage.getItem('betprofit_last_user_id');
    const lastUser = loadedUsers.find(u => u.id === lastActiveId);

    if (lastUser) {
      setActiveUser(lastUser);
      setView('QUICK');
    } else if (loadedUsers.length > 0) {
      setView('LIST');
    } else {
      setView('REGISTER');
    }
  }, []);

  const handleQuickLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (activeUser && loginPassword === activeUser.password) {
      completeLogin(activeUser);
    } else {
      setError('Palavra-passe incorreta.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password) {
      setError('Por favor preencha todos os campos.');
      return;
    }

    // Check if name already exists
    if (users.some(u => u.name.toLowerCase() === name.toLowerCase())) {
       setError('Já existe um perfil com este nome.');
       return;
    }

    // Ensure crypto.randomUUID is available, fallback if not (e.g. non-secure context)
    let newId;
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      newId = crypto.randomUUID();
    } else {
      newId = Date.now().toString(36) + Math.random().toString(36).substring(2);
    }

    const newUser: User = {
      id: newId,
      name,
      email,
      password
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('betprofit_users', JSON.stringify(updatedUsers));
    
    completeLogin(newUser);
  };

  const completeLogin = (user: User) => {
    localStorage.setItem('betprofit_last_user_id', user.id);
    onLogin(user);
  };

  const handleSwitchUser = () => {
    setLoginPassword('');
    setError('');
    setView('LIST');
  };

  const selectUserFromList = (user: User) => {
    setActiveUser(user);
    setLoginPassword('');
    setError('');
    setView('QUICK');
  };

  // Views

  const renderQuickLogin = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-bold text-white mb-2 text-center">Olá, {activeUser?.name}</h2>
      <p className="text-slate-400 text-center mb-8 text-sm">Bem-vindo de volta!</p>
      
      <form onSubmit={handleQuickLogin} className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs uppercase font-bold text-slate-500 tracking-widest ml-1">Palavra-passe</label>
          <div className="relative">
            <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"></i>
            <input 
              type="password" 
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white outline-none focus:border-yellow-400 transition-colors"
              placeholder="******"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2 animate-pulse">
            <i className="fas fa-exclamation-circle"></i> {error}
          </div>
        )}

        <button 
          type="submit" 
          className="w-full bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold py-4 rounded-xl shadow-lg shadow-yellow-400/20 transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <i className="fas fa-sign-in-alt"></i> Entrar
        </button>
      </form>

      <div className="mt-6 space-y-3">
        <button 
          type="button"
          onClick={handleSwitchUser}
          className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-xl transition-all border border-slate-700"
        >
          <i className="fas fa-users mr-2"></i> Entrar com outra conta
        </button>
      </div>
    </div>
  );

  const renderList = () => (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      <h2 className="text-xl font-bold text-white mb-6 text-center">Escolher Perfil</h2>
      
      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-700 mb-6">
        {users.map(user => (
          <button
            key={user.id}
            onClick={() => selectUserFromList(user)}
            className="w-full bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-yellow-400/50 p-4 rounded-xl flex items-center gap-4 transition-all group text-left"
          >
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-yellow-400 font-bold text-lg group-hover:bg-yellow-400 group-hover:text-slate-900 transition-colors">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-white font-bold group-hover:text-yellow-400 transition-colors">{user.name}</p>
              <p className="text-xs text-slate-500">{user.email}</p>
            </div>
            <i className="fas fa-chevron-right ml-auto text-slate-600 group-hover:text-yellow-400"></i>
          </button>
        ))}
      </div>

      <button 
        type="button"
        onClick={() => { setName(''); setEmail(''); setPassword(''); setError(''); setView('REGISTER'); }}
        className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
      >
        <i className="fas fa-plus-circle"></i> Criar Nova Conta
      </button>

      {users.length > 0 && activeUser && (
        <button 
          type="button"
          onClick={() => { setView('QUICK'); setError(''); }}
          className="w-full mt-3 text-slate-500 hover:text-white text-xs py-2 transition-colors"
        >
          Voltar
        </button>
      )}
    </div>
  );

  const renderRegister = () => (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">Criar Perfil</h2>
      
      <form onSubmit={handleRegister} className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs uppercase font-bold text-slate-500 tracking-widest ml-1">Username</label>
          <div className="relative">
            <i className="fas fa-user absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"></i>
            <input 
              type="text" 
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white outline-none focus:border-yellow-400 transition-colors"
              placeholder="Seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase font-bold text-slate-500 tracking-widest ml-1">Email</label>
          <div className="relative">
            <i className="fas fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"></i>
            <input 
              type="email" 
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white outline-none focus:border-yellow-400 transition-colors"
              placeholder="email@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase font-bold text-slate-500 tracking-widest ml-1">Palavra-passe</label>
          <div className="relative">
            <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"></i>
            <input 
              type="password" 
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white outline-none focus:border-yellow-400 transition-colors"
              placeholder="******"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2 animate-pulse">
            <i className="fas fa-exclamation-circle"></i> {error}
          </div>
        )}

        <button 
          type="submit" 
          className="w-full bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold py-4 rounded-xl shadow-lg shadow-yellow-400/20 transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <i className="fas fa-save"></i> Criar e Entrar
        </button>
      </form>

      {users.length > 0 && (
        <button 
          type="button"
          onClick={() => { 
            // Return to list or quick view based on state
            setView(users.length > 0 ? 'LIST' : 'REGISTER'); 
            setError('');
          }}
          className="w-full mt-4 text-slate-500 hover:text-white text-sm py-2 transition-colors flex items-center justify-center gap-2"
        >
          <i className="fas fa-arrow-left"></i> Voltar
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-yellow-500/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="w-full max-w-md p-8 relative z-10">
        <div className="flex flex-col items-center mb-10">
          <Logo size="xl" className="mb-6" />
          <h1 className="text-4xl font-black text-white tracking-tight mb-2">Bet<span className="text-yellow-400">Profit</span></h1>
          <p className="text-slate-400 text-center">Gestão Profissional de Apostas</p>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl backdrop-blur-sm relative overflow-hidden">
          {view === 'QUICK' && renderQuickLogin()}
          {view === 'LIST' && renderList()}
          {view === 'REGISTER' && renderRegister()}
        </div>
        
        <p className="text-center text-xs text-slate-600 mt-8">
          <i className="fas fa-lock mr-1"></i> Modo Local Seguro. Os seus dados não saem deste dispositivo.
        </p>
      </div>
    </div>
  );
};

export default Login;