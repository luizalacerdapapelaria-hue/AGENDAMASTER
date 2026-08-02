
import React, { useState, useEffect } from 'react';
import { localStorage } from './services/safeStorage';
import Login from './modules/auth/Login';
import { Welcome } from './modules/auth/Welcome';
import { Dashboard } from './modules/editor/Dashboard';
import { InitialSetup } from './modules/editor/InitialSetup';
import { UpdateNotifier } from './modules/editor/components/UpdateNotifier';
import { User, AppState, AgendaConfig } from './types';
import { supabase, isSupabaseConfigured, isDevelopmentEnvironment, isTutorOrAllowedEmail } from './services/supabase';
import { Wrench, Sparkles, Layout, LogIn, ChevronDown, ChevronUp, UserCheck, Settings } from 'lucide-react';

const App: React.FC = () => {
  const isElectron = typeof window !== 'undefined' && (
    navigator.userAgent.toLowerCase().includes('electron') ||
    !!(window as any).electronAPI?.isElectron
  );

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [appState, setAppState] = useState<AppState>(isElectron ? AppState.LOGIN : AppState.WELCOME);
  const [initialConfig, setInitialConfig] = useState<Partial<AgendaConfig> | undefined>(undefined);
  const [isDevOpen, setIsDevOpen] = useState(false);
  const [exeUrl, setExeUrl] = useState(() => {
    return localStorage.getItem('agenda_master_exe_url') || 'https://github.com/luizalacerdapapelaria-hue/AGENDAMASTER/releases/download/vers%C3%A3o8/Agenda.Master.Setup.1.0.8.exe';
  });

  const verifiedEmailRef = React.useRef<string | null>(null);

  // Global network error fallback interceptor to prevent "Failed to fetch" from bubbling up as uncaught rejections/exceptions
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const msg = reason?.message || String(reason || '');
      if (
        msg.toLowerCase().includes('failed to fetch') || 
        msg.toLowerCase().includes('fetch') ||
        msg.toLowerCase().includes('network') ||
        msg.toLowerCase().includes('cors') ||
        msg.toLowerCase().includes('load')
      ) {
        console.warn('[Global Rejection Handler]: Intercepted and handled a harmless network exception:', msg);
        event.preventDefault(); // Prevents browser from treating this as an uncaught exception
      }
    };

    const handleGlobalError = (event: ErrorEvent) => {
      const msg = event.message || '';
      if (
        msg.toLowerCase().includes('failed to fetch') || 
        msg.toLowerCase().includes('fetch') ||
        msg.toLowerCase().includes('network') ||
        msg.toLowerCase().includes('cors') ||
        msg.toLowerCase().includes('load')
      ) {
        console.warn('[Global Error Handler]: Intercepted and handled a harmless network error:', msg);
        event.preventDefault(); // Prevents browser from treating this as a fatal crash
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleGlobalError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleGlobalError);
    };
  }, []);

  // Handle Supabase Auth State changes dynamically
  useEffect(() => {
    if (!isSupabaseConfigured) {
      // If Supabase is not configured, we start as LOGIN to let the user see instructions
      return;
    }

    let isUnmounted = false;

    // Pre-validate the current session's token integrity
    const preValidateSession = async () => {
      try {
        console.log('[Auth] Pré-validando integridade da sessão local...');
        const { error } = await supabase.auth.getSession();
        if (error) {
          console.warn('[Auth] Erro ao recuperar sessão inicial:', error.message);
          const msg = error.message.toLowerCase();
          if (
            msg.includes('refresh_token') || 
            msg.includes('refresh token') || 
            msg.includes('not found') || 
            msg.includes('invalid')
          ) {
            console.warn('[Auth] Token de atualização inválido ou inexistente detectado. Limpando dados do navegador...');
            if (localStorage) {
              const keysToRemove: string[] = [];
              for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && (key.startsWith('sb-') || key.includes('supabase.auth') || key.includes('supabase-js'))) {
                  keysToRemove.push(key);
                }
              }
              keysToRemove.forEach(k => localStorage.removeItem(k));
            }
            try {
              await supabase.auth.signOut();
            } catch (signOutErr) {
              console.warn('[Auth] Erro ao deslogar pós limpeza de tokens:', signOutErr);
            }
          }
        }
      } catch (err) {
        console.error('[Auth] Erro de exceção na pré-validação de sessão:', err);
      }
    };

    // Run async session check
    preValidateSession();

    // Listen to changes in auth state (login/logout/token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (isUnmounted) return;
      if (session?.user) {
        const userEmail = session.user.email || '';
        const enteredEmail = userEmail.trim().toLowerCase();

        // Prevent duplicate concurrent searches or loops if already verified
        if (verifiedEmailRef.current === enteredEmail) {
          return;
        }

        try {
          console.log('[AuthChange] Verificando acesso na mudança de estado de autenticação para:', enteredEmail);

          const fetchPromise = (async () => {
            // 1. Tentar busca exata por e-mail no banco
            let { data: exactData, error: exactError } = await supabase
              .from('allowed_users')
              .select('*')
              .eq('email', enteredEmail)
              .maybeSingle();

            let allowedData = exactData;

             if (exactError) {
               console.warn('[AuthChange] Erro na busca exata:', exactError);
               const msg = (exactError.message || '').toLowerCase();
               if (msg.includes('fetch') || msg.includes('network') || msg.includes('failed') || msg.includes('load') || msg.includes('connect')) {
                 throw exactError;
               }
             } else if (allowedData) {
               console.log('[AuthChange] Encontrado registro exato:', allowedData);
             }
 
             // 2. Se não achar, tentar busca case-insensitive exata (ilike)
             if (!allowedData) {
               console.log('[AuthChange] Registro não encontrado de forma exata. Tentando case-insensitive (ilike)...');
               const { data: fuzzyData, error: fuzzyError } = await supabase
                 .from('allowed_users')
                 .select('*')
                 .ilike('email', enteredEmail)
                 .maybeSingle();
 
               if (fuzzyError) {
                 console.warn('[AuthChange] Erro no check case-insensitive:', fuzzyError);
                 const msg = (fuzzyError.message || '').toLowerCase();
                 if (msg.includes('fetch') || msg.includes('network') || msg.includes('failed') || msg.includes('load') || msg.includes('connect')) {
                   throw fuzzyError;
                 }
               } else if (fuzzyData) {
                 allowedData = fuzzyData;
                 console.log('[AuthChange] Encontrado no case-insensitive:', allowedData);
               }
             }
 
             // 3. Se ainda não achar, tentar busca com similaridade wildcard + trim
             if (!allowedData) {
               console.log('[AuthChange] Registro não encontrado por ilike. Tentando wildcard...');
               const { data: searchData, error: searchError } = await supabase
                 .from('allowed_users')
                 .select('*')
                 .ilike('email', `%${enteredEmail}%`)
                 .limit(10);
 
               if (searchError) {
                 console.warn('[AuthChange] Erro no check de similaridade:', searchError);
                 const msg = (searchError.message || '').toLowerCase();
                 if (msg.includes('fetch') || msg.includes('network') || msg.includes('failed') || msg.includes('load') || msg.includes('connect')) {
                   throw searchError;
                 }
               } else if (searchData && searchData.length > 0) {
                const trimmedMatch = searchData.find(u => {
                  const dbEmail = (u.email || '').trim().toLowerCase();
                  return dbEmail === enteredEmail;
                });
                if (trimmedMatch) {
                  allowedData = trimmedMatch;
                  console.log('[AuthChange] Encontrado no wildcard + trim:', allowedData);
                }
              }
            }
            return allowedData;
          })();

          let allowedData: any = null;
          try {
            allowedData = await fetchPromise;
          } catch (err: any) {
            console.error('[AuthChange] Erro de rede ao consultar allowed_users:', err);
            throw err;
          }

          // Se for e-mail de tutor/administrador, permite a entrada mesmo que não esteja pré-cadastrado na tabela custom de alunos
          if (isTutorOrAllowedEmail(enteredEmail)) {
            if (!allowedData) {
              allowedData = {
                email: enteredEmail,
                active: true,
                plan_tier: 'pro',
                name: 'Administradora'
              };
            }
          }

          if (!allowedData || allowedData.active === false || allowedData.active === 'FALSE') {
            console.warn('[AuthChange] Acesso recusado ou inativo para o e-mail verificado.', allowedData);
            verifiedEmailRef.current = null;
            await supabase.auth.signOut();
            setCurrentUser(null);
            setAppState(AppState.LOGIN);
          } else {
            console.log('[AuthChange] Login autorizado com sucesso para:', enteredEmail);
            verifiedEmailRef.current = enteredEmail;
            setCurrentUser({
              email: userEmail,
              name: session.user.user_metadata?.name || allowedData.plano || userEmail.split('@')[0] || 'Usuário',
              plan: allowedData.plan_tier || 'pro'
            });
            setAppState(AppState.INITIAL_SETUP);
          }
        } catch (err: any) {
          console.error("Erro na verificação de acesso:", err);
          verifiedEmailRef.current = null;
          const isNetworkError = String(err?.message || '').toLowerCase().includes('fetch') || 
                                 String(err?.message || '').toLowerCase().includes('network') ||
                                 String(err?.message || '').toLowerCase().includes('failed');
          
          if (!isNetworkError) {
            try {
              await supabase.auth.signOut();
            } catch (signOutErr) {
              console.error("Erro ao deslogar após erro:", signOutErr);
            }
          } else {
            console.warn("[AuthChange] Ignorando chamada signOut devido a erro de conexão de rede.");
          }
          setCurrentUser(null);
          setAppState(AppState.LOGIN);
        }
      } else {
        verifiedEmailRef.current = null;
        setCurrentUser(null);
        setAppState(current => current === AppState.WELCOME ? AppState.WELCOME : AppState.LOGIN);
      }
    });

    return () => {
      isUnmounted = true;
      subscription.unsubscribe();
    };
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setAppState(AppState.INITIAL_SETUP);
  };

  const handleInitialSetupComplete = (config: Partial<AgendaConfig>) => {
      setInitialConfig(config);
      setAppState(AppState.DASHBOARD);
  };

  const handleConfigure = (currentConfig?: AgendaConfig) => {
      if (currentConfig) {
          setInitialConfig(currentConfig);
      }
      setAppState(AppState.INITIAL_SETUP);
  };

  const handleLogout = () => {
    if (isSupabaseConfigured) {
      supabase.auth.signOut().catch(err => {
        console.warn('[Logout] Erro ignorado ao tentar desautorizar Supabase:', err);
      });
    }
    setCurrentUser(null);
    setAppState(AppState.LOGIN);
    setInitialConfig(undefined);
  };

  // Helper method for the developer toolbar to force-jump between application screen flows
  const setDevState = (targetState: AppState) => {
    if (targetState === AppState.LOGIN || targetState === AppState.WELCOME) {
      if (isSupabaseConfigured) {
        supabase.auth.signOut().catch(err => {
          console.warn('[setDevState] Erro ignorado ao tentar desautorizar Supabase:', err);
        });
      }
      setCurrentUser(null);
      setAppState(targetState);
    } else {
      const mockDevUser: User = {
        email: 'desenvolvedora@agendamaster.ai',
        name: 'Desenvolvedora Master 🛠️',
        plan: 'pro'
      };
      setCurrentUser(mockDevUser);
      setAppState(targetState);
      
      if (targetState === AppState.DASHBOARD && !initialConfig) {
        // Populate standard default dev parameters so editor is immediately interactive
        setInitialConfig({
          name: 'Minha Agenda Dev',
          projectType: 'planner',
          year: 2026,
          layoutType: 'weekly_horizontal',
          pageSize: 'A5',
          orientation: 'portrait',
          includeHolidays: true,
          includeMoonPhases: true,
          includeQuotes: true,
          includeVerses: true,
          mirrorEvenPages: true,
          margins: { top: 10, bottom: 10, inside: 15, outside: 10 },
          elements: [],
          introPages: [],
          monthlyIntroPages: []
        });
      }
    }
  };

  return (
    <>
      {appState === AppState.WELCOME && (
        <Welcome onChooseBrowser={() => setAppState(AppState.LOGIN)} exeUrl={exeUrl} />
      )}

      {appState === AppState.LOGIN && (
        <Login onLogin={handleLogin} />
      )}

      {appState === AppState.INITIAL_SETUP && currentUser && (
          <InitialSetup 
            onComplete={handleInitialSetupComplete} 
            userEmail={currentUser.email}
            defaultValues={initialConfig}
            onLogout={handleLogout}
            userPlan={currentUser.plan}
          />
      )}
      
      {appState === AppState.DASHBOARD && currentUser && (
        <Dashboard 
            user={currentUser} 
            initialConfig={initialConfig} 
            onLogout={handleLogout} 
            onConfigure={handleConfigure}
        />
      )}

      {/* FLOATING ACTION DEVELOPMENT TOOLBAR PANEL */}
      {isDevelopmentEnvironment && (
        <div className="fixed bottom-5 right-5 z-[9999] no-print">
          {isDevOpen ? (
            <div className="bg-slate-900 border border-slate-700/80 shadow-2xl rounded-2xl w-80 overflow-hidden flex flex-col text-white transition-all duration-300">
              {/* Header */}
              <div className="bg-slate-800/80 px-4 py-3 border-b border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold uppercase tracking-wider">Atalhos da Desenvolvedora</span>
                </div>
                <button 
                  onClick={() => setIsDevOpen(false)}
                  className="p-1 hover:bg-slate-700 rounded transition-colors text-slate-400 hover:text-white"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
              
              {/* Content Body */}
              <div className="p-4 space-y-3.5">
                <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                  <span>Navegação Rápida entre Fluxos</span>
                </div>

                {/* Navigation Actions buttons */}
                <div className="grid grid-cols-1 gap-2">
                  <button
                    onClick={() => setDevState(AppState.WELCOME)}
                    className={`w-full flex items-center gap-2 p-2.5 rounded-xl border text-left text-xs font-semibold uppercase tracking-wider transition-all ${
                      appState === AppState.WELCOME 
                        ? 'bg-slate-800 border-violet-500 text-violet-300 shadow-sm' 
                        : 'bg-slate-800/40 border-slate-700 hover:bg-slate-800 hover:border-slate-650 text-slate-200'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-violet-400 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="leading-tight">Tela de Escolha</p>
                      <span className="text-[9px] text-slate-400 font-normal normal-case">Landing de boas-vindas (.EXE / Web)</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setDevState(AppState.LOGIN)}
                    className={`w-full flex items-center gap-2 p-2.5 rounded-xl border text-left text-xs font-semibold uppercase tracking-wider transition-all ${
                      appState === AppState.LOGIN 
                        ? 'bg-slate-800 border-indigo-500 text-indigo-300 shadow-sm' 
                        : 'bg-slate-800/40 border-slate-700 hover:bg-slate-800 hover:border-slate-650 text-slate-200'
                    }`}
                  >
                    <LogIn className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="leading-tight">Tela de Login</p>
                      <span className="text-[9px] text-slate-400 font-normal normal-case">Limpa login e volta à entrada</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setDevState(AppState.INITIAL_SETUP)}
                    className={`w-full flex items-center gap-2 p-2.5 rounded-xl border text-left text-xs font-semibold uppercase tracking-wider transition-all ${
                      appState === AppState.INITIAL_SETUP 
                        ? 'bg-slate-800 border-amber-500 text-amber-300 shadow-sm' 
                        : 'bg-slate-800/40 border-slate-700 hover:bg-slate-800 hover:border-slate-650 text-slate-200'
                    }`}
                  >
                    <Settings className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="leading-tight">Setup Inicial</p>
                      <span className="text-[9px] text-slate-400 font-normal normal-case">Configura ano, pág e tipo</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setDevState(AppState.DASHBOARD)}
                    className={`w-full flex items-center gap-2 p-2.5 rounded-xl border text-left text-xs font-semibold uppercase tracking-wider transition-all ${
                      appState === AppState.DASHBOARD 
                        ? 'bg-slate-800 border-emerald-500 text-emerald-300 shadow-sm' 
                        : 'bg-slate-800/40 border-slate-700 hover:bg-slate-800 hover:border-slate-650 text-slate-200'
                    }`}
                  >
                    <Layout className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="leading-tight">Editor Principal</p>
                      <span className="text-[9px] text-slate-400 font-normal normal-case">Navega direto para o Dashboard</span>
                    </div>
                  </button>
                </div>

                {/* Configuração do instalador .EXE para Admins/Desenvolvedoras */}
                <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50 text-[10px] text-slate-400 leading-relaxed flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-slate-300">
                    <Settings className="w-3.5 h-3.5 text-violet-400 animate-spin-slow" />
                    <span>Configurar URL do arquivo .EXE</span>
                  </div>
                  <input
                    type="text"
                    value={exeUrl}
                    onChange={(e) => {
                      const val = e.target.value;
                      localStorage.setItem('agenda_master_exe_url', val);
                      setExeUrl(val);
                    }}
                    placeholder="Cole o link direto do .exe..."
                    className="w-full text-[10px] bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-violet-500 transition-all font-mono"
                  />
                  <span className="text-[9px] text-slate-500 leading-normal">Seus clientes baixarão este arquivo ao acessar a tela de escolha.</span>
                </div>

                {/* Simulated parameters note */}
                <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50 text-[10px] text-slate-400 leading-relaxed flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-300">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Simulador de Integração</span>
                  </div>
                  <span>Ideal para testar páginas e layout sem precisar preencher formulários inteiros em cada recarga de página.</span>
                </div>
              </div>
              
              {/* Footer with email info */}
              <div className="bg-slate-950 px-4 py-2 border-t border-slate-800 text-[10px] text-slate-500 font-medium flex items-center justify-between">
                <span>Usuário Ativo:</span>
                <span className="text-slate-300 font-mono text-[9px] truncate max-w-[160px]">
                  {currentUser ? currentUser.email : 'Nenhum'}
                </span>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsDevOpen(true)}
              className="bg-slate-900 border border-slate-700 hover:bg-slate-850 hover:border-slate-650 text-white rounded-full p-3 shadow-2xl flex items-center justify-center gap-2 transition-all group scale-100 hover:scale-105 active:scale-95"
            >
              <Wrench className="w-5 h-5 text-amber-400 animate-spin-slow" />
              <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 text-xs font-bold uppercase tracking-widest leading-none">
                Dev Tools
              </span>
            </button>
          )}
        </div>
      )}
      <UpdateNotifier />
    </>
  );
};

export default App;
