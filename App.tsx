
import React, { useState, useEffect } from 'react';
import { localStorage } from './services/safeStorage';
import Login from './modules/auth/Login';
import { Welcome } from './modules/auth/Welcome';
import { Dashboard } from './modules/editor/Dashboard';
import { InitialSetup } from './modules/editor/InitialSetup';
import { LandingPage } from './modules/landing/LandingPage';
import { QuizPage } from './modules/quiz/QuizPage';
import { UpdateNotifier } from './modules/editor/components/UpdateNotifier';
import { User, AppState, AgendaConfig } from './types';
import { supabase, supabasePublic, isSupabaseConfigured, isDevelopmentEnvironment, isTutorOrAllowedEmail } from './services/supabase';
import { Wrench, Sparkles, Layout, LogIn, ChevronDown, ChevronUp, UserCheck, Settings, Globe, HelpCircle, RotateCcw, Gift } from 'lucide-react';

const App: React.FC = () => {
  const isElectron = typeof window !== 'undefined' && (
    navigator.userAgent.toLowerCase().includes('electron') ||
    !!(window as any).electronAPI?.isElectron
  );

  const VERIFIED_PROFILE_KEY = 'agendamaster_verified_profile';

  const getCachedVerifiedProfile = (): User | null => {
    try {
      if (!localStorage) return null;
      let hasSbToken = false;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
          const val = localStorage.getItem(key);
          if (val && val.includes('access_token')) {
            hasSbToken = true;
            break;
          }
        }
      }
      if (!hasSbToken) return null;
      const raw = localStorage.getItem(VERIFIED_PROFILE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.email === 'string' && parsed.email) {
        return {
          email: parsed.email,
          name: parsed.name || parsed.email.split('@')[0],
          plan: parsed.plan || 'pro',
        };
      }
    } catch (_) {}
    return null;
  };

  const getInitialAppState = (): AppState => {
    const cachedProfile = getCachedVerifiedProfile();

    if (isElectron) {
      return cachedProfile ? AppState.INITIAL_SETUP : AppState.LOGIN;
    }
    if (typeof window !== 'undefined') {
      const path = (window.location.pathname || '').toLowerCase().replace(/\/+$/, '');
      const search = new URLSearchParams(window.location.search);
      const pageParam = (search.get('page') || '').toLowerCase();
      const rawHash = (window.location.hash || '').toLowerCase();
      const hash = rawHash.replace(/^#\/?/, '').replace(/\/+$/, '');

      if (rawHash.includes('type=recovery') || (search.get('type') || '').toLowerCase() === 'recovery') {
        (window as any).__isPasswordRecoveryFlow = true;
        (window as any).__isLinkRecovery = true;
        return AppState.LOGIN;
      }

      if (
        path === '/agendamaster' || 
        path.endsWith('/agendamaster') || 
        path.includes('/agendamaster') ||
        pageParam === 'agendamaster' || 
        pageParam === 'landing' ||
        hash === 'agendamaster' ||
        hash === 'landing'
      ) {
        return AppState.LANDING;
      }
      if (
        path === '/quiz' || 
        path.endsWith('/quiz') || 
        path.includes('/quiz') ||
        path === '/diagnostico' ||
        path === '/raspadinha' ||
        path.endsWith('/raspadinha') ||
        path === '/desconto' ||
        path.endsWith('/desconto') ||
        path === '/oferta' ||
        path.endsWith('/oferta') ||
        pageParam === 'quiz' || 
        pageParam === 'diagnostico' ||
        pageParam === 'raspadinha' ||
        pageParam === 'desconto' ||
        pageParam === 'oferta' ||
        hash === 'quiz' ||
        hash === 'diagnostico' ||
        hash === 'raspadinha' ||
        hash === 'desconto' ||
        hash === 'oferta'
      ) {
        return AppState.QUIZ;
      }
      if (path === '/welcome' || pageParam === 'welcome' || hash === 'welcome') {
        return AppState.WELCOME;
      }
      if (cachedProfile) {
        return AppState.INITIAL_SETUP;
      }
      if (
        path === '/acesso' || 
        path.endsWith('/acesso') || 
        path === '/login' || 
        pageParam === 'acesso' || 
        pageParam === 'login' ||
        hash === 'acesso' ||
        hash === 'login'
      ) {
        return AppState.LOGIN;
      }
    }
    return AppState.WELCOME;
  };

  const [currentUser, setCurrentUser] = useState<User | null>(getCachedVerifiedProfile);
  const [appState, setAppState] = useState<AppState>(getInitialAppState);
  const [initialConfig, setInitialConfig] = useState<Partial<AgendaConfig> | undefined>(undefined);
  const [isDevOpen, setIsDevOpen] = useState(false);
  const [exeUrl, setExeUrl] = useState(() => {
    const defaultExeUrl = 'https://github.com/luizalacerdapapelaria-hue/AGENDAMASTER/releases/download/V2.0.3/Agenda.Master.Setup.2.0.3.exe';
    const saved = localStorage.getItem('agenda_master_exe_url');
    if (saved && !saved.includes('2.0.3')) {
      localStorage.removeItem('agenda_master_exe_url');
      return defaultExeUrl;
    }
    return saved || defaultExeUrl;
  });

  const verifiedEmailRef = React.useRef<string | null>(null);

  // Sync browser URL with application state for clean addresses like /agendamaster and /acesso
  const navigateToState = (targetState: AppState) => {
    setAppState(targetState);
    if (typeof window !== 'undefined' && window.history && !isElectron) {
      if (targetState === AppState.LANDING) {
        window.history.pushState({ state: 'landing' }, '', '/agendamaster');
      } else if (targetState === AppState.QUIZ) {
        window.history.pushState({ state: 'quiz' }, '', '/quiz');
      } else if (targetState === AppState.LOGIN) {
        window.history.pushState({ state: 'acesso' }, '', '/acesso');
      } else if (targetState === AppState.WELCOME) {
        window.history.pushState({ state: 'welcome' }, '', '/');
      }
    }
  };

  // Handle browser back/forward button and hash change
  useEffect(() => {
    if (isElectron) return;
    const handleNavigationChange = () => {
      const path = (window.location.pathname || '').toLowerCase().replace(/\/+$/, '');
      const search = new URLSearchParams(window.location.search);
      const pageParam = (search.get('page') || '').toLowerCase();
      const hash = (window.location.hash || '').toLowerCase().replace(/^#\/?/, '').replace(/\/+$/, '');

      if (
        path === '/agendamaster' || 
        path.endsWith('/agendamaster') || 
        pageParam === 'agendamaster' || 
        pageParam === 'landing' ||
        hash === 'agendamaster' ||
        hash === 'landing'
      ) {
        setAppState(AppState.LANDING);
      } else if (
        path === '/quiz' || 
        path.endsWith('/quiz') || 
        path === '/diagnostico' || 
        path === '/raspadinha' || 
        path.endsWith('/raspadinha') || 
        path === '/desconto' || 
        path.endsWith('/desconto') || 
        path === '/oferta' || 
        path.endsWith('/oferta') || 
        pageParam === 'quiz' || 
        pageParam === 'diagnostico' || 
        pageParam === 'raspadinha' || 
        pageParam === 'desconto' ||
        pageParam === 'oferta' ||
        hash === 'quiz' ||
        hash === 'diagnostico' ||
        hash === 'raspadinha' ||
        hash === 'desconto' ||
        hash === 'oferta'
      ) {
        setAppState(AppState.QUIZ);
      } else if (
        path === '/acesso' || 
        path.endsWith('/acesso') || 
        path === '/login' || 
        pageParam === 'acesso' || 
        pageParam === 'login' ||
        hash === 'acesso' ||
        hash === 'login'
      ) {
        setAppState(AppState.LOGIN);
      } else if (path === '/welcome' || pageParam === 'welcome' || hash === 'welcome') {
        setAppState(AppState.WELCOME);
      }
    };

    window.addEventListener('popstate', handleNavigationChange);
    window.addEventListener('hashchange', handleNavigationChange);
    return () => {
      window.removeEventListener('popstate', handleNavigationChange);
      window.removeEventListener('hashchange', handleNavigationChange);
    };
  }, [isElectron]);

  // Global network error fallback interceptor to prevent harmless network/HMR noise from crashing the app
  useEffect(() => {
    const isDynamicChunkError = (lower: string) =>
      lower.includes('dynamically imported module') ||
      lower.includes('importing a module script failed') ||
      lower.includes('chunkloaderror');

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const msg = reason?.message || String(reason || '');
      const lower = msg.toLowerCase();
      if (isDynamicChunkError(lower)) return;
      if (
        lower.includes('[vite]') ||
        lower.includes('send was called before connect') ||
        lower.includes('websocket') ||
        lower.includes('failed to fetch') || 
        lower.includes('fetch') ||
        lower.includes('network') ||
        lower.includes('cors') ||
        lower.includes('load')
      ) {
        console.warn('[Global Rejection Handler]: Intercepted and handled a harmless network/HMR exception:', msg);
        event.preventDefault();
      }
    };

    const handleGlobalError = (event: ErrorEvent) => {
      const msg = event.message || '';
      const lower = msg.toLowerCase();
      if (isDynamicChunkError(lower)) return;
      if (
        lower.includes('[vite]') ||
        lower.includes('send was called before connect') ||
        lower.includes('websocket') ||
        lower.includes('failed to fetch') || 
        lower.includes('fetch') ||
        lower.includes('network') ||
        lower.includes('cors') ||
        lower.includes('load')
      ) {
        console.warn('[Global Error Handler]: Intercepted and handled a harmless network/HMR error:', msg);
        event.preventDefault();
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleGlobalError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleGlobalError);
    };
  }, []);

  // Handle Supabase Auth State changes dynamically (single authoritative listener — avoids token refresh races)
  useEffect(() => {
    if (!isSupabaseConfigured) {
      return;
    }

    let isUnmounted = false;

    // Listen to changes in auth state (login/logout/token refresh/password recovery)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (isUnmounted) return;

      if (event === 'PASSWORD_RECOVERY' || (typeof window !== 'undefined' && (window as any).__isPasswordRecoveryFlow)) {
        if (event === 'PASSWORD_RECOVERY' && typeof window !== 'undefined') {
          (window as any).__isPasswordRecoveryFlow = true;
          (window as any).__isLinkRecovery = true;
          (window as any).__recoveryEmail = session?.user?.email || '';
          window.dispatchEvent(new CustomEvent('agendamaster-password-recovery', {
            detail: { email: session?.user?.email || '' }
          }));
          setAppState(AppState.LOGIN);
        }
        return;
      }

      if (session?.user) {
        const userEmail = session.user.email || '';
        const enteredEmail = userEmail.trim().toLowerCase();

        // Prevent duplicate concurrent searches or loops if already verified
        if (verifiedEmailRef.current === enteredEmail) {
          return;
        }

        try {
          console.log('[AuthChange] Verificando acesso na mudança de estado de autenticação para:', enteredEmail);

          const queryAllowedByClient = async (dbClient: typeof supabase) => {
            let { data: exactData, error: exactError } = await dbClient
              .from('allowed_users')
              .select('*')
              .eq('email', enteredEmail)
              .maybeSingle();

            let found = exactData;
            if (exactError) {
              const msg = (exactError.message || '').toLowerCase();
              if (msg.includes('fetch') || msg.includes('network') || msg.includes('failed') || msg.includes('load') || msg.includes('connect')) {
                throw exactError;
              }
            }

            if (!found) {
              const { data: fuzzyData, error: fuzzyError } = await dbClient
                .from('allowed_users')
                .select('*')
                .ilike('email', enteredEmail)
                .maybeSingle();

              if (fuzzyError) {
                const msg = (fuzzyError.message || '').toLowerCase();
                if (msg.includes('fetch') || msg.includes('network') || msg.includes('failed') || msg.includes('load') || msg.includes('connect')) {
                  throw fuzzyError;
                }
              } else if (fuzzyData) {
                found = fuzzyData;
              }
            }

            if (!found) {
              const { data: searchData, error: searchError } = await dbClient
                .from('allowed_users')
                .select('*')
                .ilike('email', `%${enteredEmail}%`)
                .limit(10);

              if (searchError) {
                const msg = (searchError.message || '').toLowerCase();
                if (msg.includes('fetch') || msg.includes('network') || msg.includes('failed') || msg.includes('load') || msg.includes('connect')) {
                  throw searchError;
                }
              } else if (searchData && searchData.length > 0) {
                const trimmedMatch = searchData.find(u => (u.email || '').trim().toLowerCase() === enteredEmail);
                if (trimmedMatch) {
                  found = trimmedMatch;
                }
              }
            }

            return found;
          };

          const fetchPromise = (async () => {
            const publicResult = await queryAllowedByClient(supabasePublic);
            if (publicResult) return publicResult;
            return await queryAllowedByClient(supabase);
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
            try {
              localStorage.removeItem(VERIFIED_PROFILE_KEY);
            } catch (_) {}
            await supabase.auth.signOut();
            setCurrentUser(null);
            setAppState(AppState.LOGIN);
          } else {
            console.log('[AuthChange] Login autorizado com sucesso para:', enteredEmail);
            verifiedEmailRef.current = enteredEmail;
            const resolvedUser: User = {
              email: userEmail,
              name: session.user.user_metadata?.name || allowedData.plano || userEmail.split('@')[0] || 'Usuário',
              plan: allowedData.plan_tier || 'pro'
            };
            try {
              localStorage.setItem(VERIFIED_PROFILE_KEY, JSON.stringify(resolvedUser));
              localStorage.setItem('agendamaster_saved_email', enteredEmail);
            } catch (_) {}
            setCurrentUser(resolvedUser);
            setAppState(prev =>
              prev === AppState.DASHBOARD || prev === AppState.LANDING || prev === AppState.QUIZ
                ? prev
                : AppState.INITIAL_SETUP
            );
          }
        } catch (err: any) {
          console.error("Erro na verificação de acesso:", err);
          const errText = String(err?.message || '').toLowerCase();
          const isNetworkError =
            errText.includes('fetch') ||
            errText.includes('network') ||
            errText.includes('failed') ||
            errText.includes('load') ||
            errText.includes('connect');

          if (isNetworkError) {
            console.warn("[AuthChange] Oscilação temporária de rede detectada; mantendo sessão local ativa.");
            const cached = getCachedVerifiedProfile();
            if ((cached && cached.email.trim().toLowerCase() === enteredEmail) || isTutorOrAllowedEmail(enteredEmail)) {
              const fallbackUser: User = cached || {
                email: userEmail,
                name: session.user.user_metadata?.name || userEmail.split('@')[0] || 'Usuário',
                plan: 'pro'
              };
              verifiedEmailRef.current = enteredEmail;
              setCurrentUser(fallbackUser);
              setAppState(prev =>
                prev === AppState.DASHBOARD || prev === AppState.LANDING || prev === AppState.QUIZ
                  ? prev
                  : AppState.INITIAL_SETUP
              );
              return;
            }
          } else {
            verifiedEmailRef.current = null;
            try {
              localStorage.removeItem(VERIFIED_PROFILE_KEY);
            } catch (_) {}
            try {
              await supabase.auth.signOut();
            } catch (signOutErr) {
              console.error("Erro ao deslogar após erro:", signOutErr);
            }
          }
          setCurrentUser(null);
          setAppState(AppState.LOGIN);
        }
      } else {
        verifiedEmailRef.current = null;
        try {
          localStorage.removeItem(VERIFIED_PROFILE_KEY);
        } catch (_) {}
        setCurrentUser(null);
        setAppState(current => {
          if (current === AppState.LANDING || current === AppState.QUIZ || current === AppState.WELCOME) {
            return current;
          }
          return AppState.LOGIN;
        });
      }
    });

    return () => {
      isUnmounted = true;
      subscription.unsubscribe();
    };
  }, []);

  const handleLogin = (user: User) => {
    try {
      localStorage.setItem(VERIFIED_PROFILE_KEY, JSON.stringify(user));
      if (user.email) {
        localStorage.setItem('agendamaster_saved_email', user.email.trim().toLowerCase());
      }
    } catch (_) {}
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
    try {
      localStorage.removeItem(VERIFIED_PROFILE_KEY);
    } catch (_) {}
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
      try {
        localStorage.removeItem(VERIFIED_PROFILE_KEY);
      } catch (_) {}
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
        <Welcome 
          onChooseBrowser={() => navigateToState(AppState.LOGIN)} 
          exeUrl={exeUrl} 
          onNavigateToLanding={() => navigateToState(AppState.LANDING)}
        />
      )}

      {appState === AppState.LOGIN && (
        <Login 
          onLogin={handleLogin} 
          onNavigateToLanding={() => navigateToState(AppState.LANDING)}
        />
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

      {appState === AppState.LANDING && (
        <LandingPage 
            onNavigate={(state) => navigateToState(state)} 
            exeUrl={exeUrl} 
            checkoutUrl="https://pay.herospark.com/agenda-master-545764"
            originalOfferUrl="https://pay.herospark.com/agenda-master-523399"
        />
      )}

      {appState === AppState.QUIZ && (
        <QuizPage 
            onNavigate={(state) => navigateToState(state)} 
            originalOfferUrl="https://pay.herospark.com/agenda-master-523399"
            offerUrl="https://pay.herospark.com/agenda-master-545764"
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
                    onClick={() => setDevState(AppState.QUIZ)}
                    className={`w-full flex items-center gap-2 p-2.5 rounded-xl border text-left text-xs font-semibold uppercase tracking-wider transition-all ${
                      appState === AppState.QUIZ 
                        ? 'bg-slate-800 border-amber-500 text-amber-300 shadow-sm' 
                        : 'bg-slate-800/40 border-slate-700 hover:bg-slate-800 hover:border-slate-650 text-slate-200'
                    }`}
                  >
                    <HelpCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="leading-tight">Quiz & Vídeo (50% OFF)</p>
                      <span className="text-[9px] text-slate-400 font-normal normal-case">Funil de conscientização de anúncios</span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      try {
                        localStorage.removeItem('agendamaster_quiz_offer_expires_at');
                        localStorage.setItem('agendamaster_dev_unlimited_offer', 'true');
                      } catch {}
                      setDevState(AppState.QUIZ);
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-[10px] font-bold transition-all -mt-1 mb-1"
                    title="Reseta o cronômetro do quiz e força a exibição do desconto de 50%"
                  >
                    <RotateCcw className="w-3 h-3 text-amber-400" />
                    <span>Resetar Trava do Quiz (Ver 50% OFF Ativo)</span>
                  </button>

                  <button
                    onClick={() => {
                      try {
                        localStorage.removeItem('agendamaster_quiz_offer_expires_at');
                        localStorage.removeItem('agendamaster_quiz_scratched');
                        localStorage.setItem('agendamaster_dev_unlimited_offer', 'true');
                      } catch {}
                      if (typeof window !== 'undefined' && window.history) {
                        window.history.pushState({ state: 'scratch' }, '', '/raspadinha');
                      }
                      setDevState(AppState.QUIZ);
                      window.dispatchEvent(new CustomEvent('agendamaster-set-stage', { detail: 'scratch' }));
                    }}
                    className="w-full flex items-center gap-2 p-2 rounded-xl border text-left text-xs font-semibold uppercase tracking-wider transition-all bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20"
                    title="Abre diretamente a tela com a raspadinha dourada interativa pronta para raspar"
                  >
                    <Gift className="w-4 h-4 text-amber-400 flex-shrink-0 animate-bounce" />
                    <div className="flex-1">
                      <p className="leading-tight text-[11px]">Ver Raspadinha Direta</p>
                      <span className="text-[9px] text-stone-400 font-normal normal-case">Dourada & pronta para raspar</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setDevState(AppState.LANDING)}
                    className={`w-full flex items-center gap-2 p-2.5 rounded-xl border text-left text-xs font-semibold uppercase tracking-wider transition-all ${
                      appState === AppState.LANDING 
                        ? 'bg-slate-800 border-orange-500 text-orange-300 shadow-sm' 
                        : 'bg-slate-800/40 border-slate-700 hover:bg-slate-800 hover:border-slate-650 text-slate-200'
                    }`}
                  >
                    <Globe className="w-4 h-4 text-orange-400 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="leading-tight">Landing Page</p>
                      <span className="text-[9px] text-slate-400 font-normal normal-case">Apresentação do Agenda Master AI</span>
                    </div>
                  </button>

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
      <UpdateNotifier autoApply={appState !== AppState.DASHBOARD} />
    </>
  );
};

export default App;
