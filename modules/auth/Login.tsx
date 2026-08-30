import React, { useState } from 'react';
import { localStorage } from '../../services/safeStorage';
import { User } from '../../types';
import { Lock, Mail, ArrowRight, Star, CheckCircle, Database, AlertCircle, Sparkles, ShieldCheck, Code, Copy, Check, Monitor, Smartphone, Zap, X, Info, HelpCircle, RefreshCw, Download, Settings } from 'lucide-react';
import { supabase, isSupabaseConfigured, isDevelopmentEnvironment, isTutorOrAllowedEmail } from '../../services/supabase';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  
  // PWA (Progressive Web Application) Installation States
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showPwaGuide, setShowPwaGuide] = useState(false);
  const [detectedOS, setDetectedOS] = useState<'windows' | 'mac' | 'ios' | 'android' | 'other'>('windows');

  const isElectron = typeof window !== 'undefined' && (
    navigator.userAgent.toLowerCase().includes('electron') ||
    !!(window as any).electronAPI?.isElectron
  );

  const isEmailAdmin = email.trim().toLowerCase() === 'luizalacerdaatelie@gmail.com' || email.trim().toLowerCase() === 'luizalacerdapapelaria@gmail.com';

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsInstalled(
        window.matchMedia('(display-mode: standalone)').matches ||
        (navigator as any).standalone ||
        (window as any).isAppInstalled ||
        false
      );

      setCanInstall(!!(window as any).deferredPrompt);

      const handlePromptReady = () => {
        setCanInstall(true);
      };
      const handleInstalled = () => {
        setIsInstalled(true);
        setCanInstall(false);
      };

      window.addEventListener('pwa-prompt-ready', handlePromptReady);
      window.addEventListener('pwa-installed', handleInstalled);

      // Detect OS for custom step-by-step guidance
      const ua = navigator.userAgent.toLowerCase();
      if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) {
        setDetectedOS('ios');
      } else if (ua.includes('android')) {
        setDetectedOS('android');
      } else if (ua.includes('macintosh') || ua.includes('mac os')) {
        setDetectedOS('mac');
      } else {
        setDetectedOS('windows');
      }

      return () => {
        window.removeEventListener('pwa-prompt-ready', handlePromptReady);
        window.removeEventListener('pwa-installed', handleInstalled);
      };
    }
  }, []);

  const handleInstallClick = async () => {
    const promptEvent = (window as any).deferredPrompt;
    if (promptEvent) {
      try {
        promptEvent.prompt();
        const { outcome } = await promptEvent.userChoice;
        console.log('[PWA Login] Resposta do usuário à instalação:', outcome);
        (window as any).deferredPrompt = null;
        setCanInstall(false);
      } catch (err) {
        console.error('[PWA Login] Falha ao disparar prompt de instalação:', err);
        setShowPwaGuide(true);
      }
    } else {
      setShowPwaGuide(true);
    }
  };

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState<'email' | 'password' | 'create_password'>('email');
  const [allowedUserData, setAllowedUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showForgotHelp, setShowForgotHelp] = useState(false);

  const [registeredEmails, setRegisteredEmails] = useState<{ email: string; active: boolean }[]>([]);
  const [loadingEmails, setLoadingEmails] = useState(false);

  React.useEffect(() => {
    if (isSupabaseConfigured && isDevelopmentEnvironment) {
      const fetchData = async () => {
        setLoadingEmails(true);
        try {
          const { data, error } = await supabase
            .from('allowed_users')
            .select('email, active');
          
          if (!error && data) {
            setRegisteredEmails(data);
          }
        } catch (err) {
          console.warn('[Login] Erro ao carregar e-mails permitidos:', err);
        } finally {
          setLoadingEmails(false);
        }
      };
      fetchData();
    }
  }, []);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    if (!email) {
      setError('Por favor, informe seu e-mail.');
      setIsLoading(false);
      return;
    }

    if (isSupabaseConfigured) {
      try {
        const enteredEmail = email.trim().toLowerCase();
        console.log('[Login] Verificando acesso para o e-mail:', enteredEmail);

        const fetchPromise = (async () => {
          // 1. Tentar busca exata por e-mail no banco
          let { data: allowedData, error: allowedError } = await supabase
            .from('allowed_users')
            .select('*')
            .eq('email', enteredEmail)
            .maybeSingle();

          if (allowedError) {
            console.warn('[Login] Erro na busca exata por e-mail:', allowedError);
            const msg = (allowedError.message || '').toLowerCase();
            if (msg.includes('fetch') || msg.includes('network') || msg.includes('failed') || msg.includes('load') || msg.includes('connect')) {
              throw allowedError;
            }
          } else if (allowedData) {
            console.log('[Login] Sucesso: Registro encontrado no exato:', allowedData);
          }

          // 2. Se não achar, tentar busca case-insensitive exata por e-mail no banco (ilike)
          if (!allowedData) {
            console.log('[Login] Tentando busca case-insensitive exata...');
            const { data: fuzzyData, error: fuzzyError } = await supabase
              .from('allowed_users')
              .select('*')
              .ilike('email', enteredEmail)
              .maybeSingle();

            if (fuzzyError) {
              console.warn('[Login] Erro na busca case-insensitive:', fuzzyError);
              const msg = (fuzzyError.message || '').toLowerCase();
              if (msg.includes('fetch') || msg.includes('network') || msg.includes('failed') || msg.includes('load') || msg.includes('connect')) {
                throw fuzzyError;
              }
            } else if (fuzzyData) {
              allowedData = fuzzyData;
              console.log('[Login] Sucesso: Registro encontrado no case-insensitive:', allowedData);
            }
          }

          // 3. Se ainda não achar, buscar similaridade com wildcard para contornar espaços em branco adicionais salvos no banco
          if (!allowedData) {
            console.log('[Login] Tentando busca de similaridade com wildcard...');
            const { data: searchData, error: searchError } = await supabase
              .from('allowed_users')
              .select('*')
              .ilike('email', `%${enteredEmail}%`)
              .limit(10);

            if (searchError) {
              console.warn('[Login] Erro na busca de similaridade:', searchError);
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
                console.log('[Login] Sucesso: Registro encontrado com wildcard + trim:', allowedData);
              }
            }
          }
          return allowedData;
        })();

        let allowedData: any = null;
        try {
          allowedData = await fetchPromise;
        } catch (err: any) {
          console.error('[Login] Erro de busca do e-mail:', err);
          const errMsg = err?.message || String(err);
          if (errMsg.toLowerCase().includes('fetch') || errMsg.toLowerCase().includes('network') || errMsg.toLowerCase().includes('failed')) {
            throw new Error(`Não foi possível conectar ao banco de dados (${errMsg}). Por favor, confira sua conexão com a internet e tente novamente.`);
          }
          throw new Error(`Não foi possível verificar seu cadastro. Se o erro persistir, confira seu sinal de rede. Detalhes: ${errMsg}`);
        }

        // Se o e-mail inserido for de tutor/administrador, injetar registro ativo mesmo se não estiver na tabela customizada 'allowed_users'
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

        if (!allowedData) {
          console.error('[Login] Erro: Nenhum registro correspondente encontrado na tabela allowed_users para:', enteredEmail);
          throw new Error('Acesso recusado: Seu e-mail não foi encontrado na lista de alunos cadastrados. Por favor, verifique se digitou o e-mail correto ou entre em contato com o suporte.');
        }

        if (allowedData.active === false || allowedData.active === 'FALSE') {
          console.warn('[Login] Erro: Registro encontrado porém inativo:', allowedData);
          throw new Error('Acesso recusado: Sua assinatura ou plano está inativo no momento.');
        }

        setAllowedUserData(allowedData);

        // Se for e-mail de tutor/administrador, sempre pula para a digitação de senha verdadeira (pois já possuem contas no Auth)
        if (isTutorOrAllowedEmail(enteredEmail)) {
          setStep('password');
        } else if (!allowedData.password) {
          // Se o registro de aluno não possuir senha gravada ainda, é o primeiro acesso!
          setStep('create_password');
          setSuccessMessage('Primeiro acesso detectado! Vamos cadastrar sua senha.');
        } else {
          setStep('password');
        }
      } catch (err: any) {
        console.error('[Login] Exceção capturada durante fluxo de verificação:', err);
        setError(err.message || 'Ocorreu um erro ao verificar sua conta.');
      } finally {
        setIsLoading(false);
      }
    } else {
      setError('As chaves do Supabase não estão configuradas para este ambiente. Por favor, configure as variáveis de ambiente necessárias.');
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    if (!password) {
      setError('Por favor, digite a sua senha.');
      setIsLoading(false);
      return;
    }

    if (isSupabaseConfigured) {
      try {
        let sessionData = null;
        try {
          const { data, error: signInError } = await supabase.auth.signInWithPassword({
            email: email.trim().toLowerCase(),
            password
          });

          if (signInError) {
            // Check if user exists in the allowed_users table with this correct password, but is not in Auth yet
            if (allowedUserData && allowedUserData.password && allowedUserData.password === password) {
              console.log('[Login] Usuário na tabela de permitidos com senha correta, mas não no Auth. Criando no Auth...');
              const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                email: email.trim().toLowerCase(),
                password,
                options: {
                  data: {
                    name: allowedUserData.name || email.split('@')[0]
                  }
                }
              });

              if (!signUpError) {
                const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
                  email: email.trim().toLowerCase(),
                  password
                });
                if (!retryError && retryData.user) {
                  sessionData = retryData;
                } else {
                  throw retryError || new Error("Erro de re-autenticação após sincronização.");
                }
              } else {
                throw signUpError;
              }
            } else {
              throw signInError;
            }
          } else {
            sessionData = data;
          }
        } catch (signInErr: any) {
          const errMsg = signInErr?.message || String(signInErr);
          if (errMsg.toLowerCase().includes('fetch') || errMsg.toLowerCase().includes('network') || errMsg.toLowerCase().includes('failed')) {
            throw new Error(`Não foi possível conectar ao banco de dados (${errMsg}). Por favor, confira sua conexão com a internet e tente novamente.`);
          }
          throw signInErr;
        }

        if (sessionData && sessionData.user) {
          onLogin({
            email: sessionData.user.email || email,
            name: sessionData.user.user_metadata?.name || allowedUserData?.plano || email.split('@')[0],
            plan: allowedUserData?.plan_tier || 'pro'
          });
        }
      } catch (err: any) {
        console.error('[Login] Erro durante o login:', err);
        const errMsg = err.message || '';
        if (
          errMsg.toLowerCase().includes('refresh_token') || 
          errMsg.toLowerCase().includes('refresh token') || 
          errMsg.toLowerCase().includes('not found') || 
          errMsg.toLowerCase().includes('invalid')
        ) {
          // Clear stale localstorage keys of Supabase
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
          } catch (_) {}
          setError('Sua sessão anterior ficou inválida. O sistema já limpou o histórico problemático, por favor tente digitar sua senha e entrar de novo.');
        } else {
          setError(errMsg || 'Senha incorreta ou erro de autenticação.');
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      setError('Erro: Conexão com o banco de dados pendente.');
      setIsLoading(false);
    }
  };

  const handleCreatePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    if (!password || !confirmPassword) {
      setError('Por favor, preencha a senha e a confirmação.');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Sua senha deve ter no mínimo 6 caracteres.');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas digitadas não batem.');
      setIsLoading(false);
      return;
    }

    if (isSupabaseConfigured) {
      try {
        // 1. Cadastrar usuário no Supabase Auth
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: {
            data: {
              name: allowedUserData?.name || email.split('@')[0]
            }
          }
        });

        if (signUpError) {
          // Se o usuário por algum motivo já estiver registrado em Auth
          if (signUpError.message.includes('already') || signUpError.message.includes('registered') || signUpError.status === 422) {
            // Tenta login para ver se a senha do primeiro acesso já funciona
            const { error: signInError } = await supabase.auth.signInWithPassword({
              email: email.trim().toLowerCase(),
              password
            });
            if (signInError) {
              throw new Error("Este e-mail já possui login registrado em nossa base de autenticação. Por favor, contate o suporte.");
            }
          } else {
            throw signUpError;
          }
        }

        // 2. Grava a senha limpa na tabela allowed_users para a sua manutenção
        const targetDbEmail = allowedUserData?.email || email.trim().toLowerCase();
        const { error: updateError } = await supabase
          .from('allowed_users')
          .update({
            password: password,
            updated_at: new Date().toISOString()
          })
          .eq('email', targetDbEmail);

        if (updateError) {
          console.warn("Nota: Senha gravada no Auth, mas não pôde ser salva na tabela custom devido às diretivas de RLS.");
        }

        setSuccessMessage('Sua senha foi cadastrada com sucesso! Entrando...');

        // 3. Efetua login para gerar a sessão de forma garantida
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password
        });

        if (loginError) throw loginError;

        if (loginData.user) {
          onLogin({
            email: loginData.user.email || email,
            name: loginData.user.user_metadata?.name || allowedUserData?.plano || email.split('@')[0],
            plan: allowedUserData?.plan_tier || 'pro'
          });
        }
      } catch (err: any) {
        setError(err.message || 'Erro de autenticação ao registrar sua senha.');
      } finally {
        setIsLoading(false);
      }
    } else {
      setError('Erro: Conexão com o banco de dados pendente.');
      setIsLoading(false);
    }
  };

  const handleResetStep = () => {
    setStep('email');
    setPassword('');
    setConfirmPassword('');
    setError('');
    setSuccessMessage('');
  };

  const handleLocalBypass = () => {
    setIsLoading(true);
    setError('');
    setTimeout(() => {
      onLogin({
        email: 'aluno@agendamaster.ai',
        name: 'Aluno Alvo',
        plan: 'pro'
      });
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-amber-50 to-yellow-100 flex flex-col items-center justify-center p-4 gap-4 md:py-12">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 flex flex-col shrink-0">
        
        {/* Informative Guidance banner if database keys are not yet stored */}
        {!isSupabaseConfigured && (
          <div className="mx-6 mt-6 p-4 bg-amber-50 rounded-2xl border border-amber-200/60 text-xs text-amber-800 flex flex-col gap-2 shadow-sm">
            <div className="flex gap-2 font-bold text-amber-900 items-start">
              <Database className="w-4 h-4 flex-shrink-0 text-amber-600 mt-0.5" />
              <span>Chaves de API Supabase não detectadas</span>
            </div>
            <p className="text-amber-700 leading-relaxed">
              O aplicativo está pronto para autenticação via Supabase! Para ativar o login com a lista de alunos cadastrados, declare 
              <code className="bg-amber-100/80 px-1 py-0.5 rounded mx-1 text-amber-900 font-mono">VITE_SUPABASE_URL</code> e 
              <code className="bg-amber-100/80 px-1 py-0.5 rounded mx-1 text-amber-900 font-mono">VITE_SUPABASE_ANON_KEY</code> 
              nas configurações do seu projeto e execute um novo deploy.
            </p>
          </div>
        )}



        {/* Login Box Area */}
        <div className="p-8 md:p-10 flex-grow">
          
          {step === 'email' && (
            <>
              <div className="text-center mb-6">
                <div className="bg-orange-600 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-orange-200">
                  <Mail className="text-white w-6 h-6" />
                </div>
                <h1 className="text-2xl font-bold font-sans text-gray-900 tracking-tight">
                  Acesse a Área do Aluno
                </h1>
                <p className="text-gray-500 mt-2 text-xs font-medium max-w-sm mx-auto">
                  Por favor, insira o e-mail que você utilizou para realizar a compra do curso na HeroSpark.
                </p>
              </div>

              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Email de Aluno</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 block w-full border-gray-200 rounded-xl border p-3.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all placeholder-gray-400"
                      placeholder="seuemail@exemplo.com"
                    />
                  </div>
                </div>

                {error && (
                  <div className="text-red-650 text-xs bg-red-50/70 p-4 rounded-xl border border-red-200/60 flex gap-2.5 items-start leading-relaxed animate-shake">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="flex-1 font-medium text-left">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-orange-600/10 text-xs font-bold uppercase tracking-wider text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <span>Continuar</span> 
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  )}
                </button>

                <div className="pt-1 text-center">
                  <a
                    href="https://pay.herospark.com/agenda-master-523399"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-orange-600 hover:text-orange-700 font-semibold hover:underline inline-flex items-center gap-1.5 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                    <span>Ainda não é aluno? Adquira seu acesso aqui</span>
                  </a>
                </div>

              </form>
            </>
          )}

          {step === 'create_password' && (
            <>
              <div className="text-center mb-6">
                <div className="bg-emerald-500 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-emerald-100">
                  <Sparkles className="text-white w-6 h-6 animate-pulse" />
                </div>
                <h1 className="text-2xl font-bold font-sans text-gray-900 tracking-tight">
                  Seja bem-vindo(a)! 🎉
                </h1>
                <p className="text-gray-500 mt-2 text-xs font-medium max-w-sm mx-auto leading-relaxed">
                  Identificamos que este é o seu **primeiro acesso**. Por favor, cadastre uma senha segura para proteger sua conta e acessar seus cursos de agora em diante.
                </p>
                <div className="mt-3 inline-block bg-slate-100 px-3 py-1 rounded-full text-[11px] text-gray-600 font-mono">
                  E-mail: <span className="font-semibold">{email}</span>
                </div>
              </div>

              <form onSubmit={handleCreatePasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Escolha uma Senha</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 block w-full border-gray-200 rounded-xl border p-3.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all placeholder-gray-400 font-mono"
                      placeholder="No mínimo 6 caracteres"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Confirme a Senha</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 block w-full border-gray-200 rounded-xl border p-3.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all placeholder-gray-400 font-mono"
                      placeholder="Repita a senha escolhida"
                    />
                  </div>
                </div>

                {error && (
                  <div className="text-red-600 text-xs bg-red-50 p-3 rounded-xl border border-red-200 flex gap-2 items-start leading-relaxed animate-shake">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {successMessage && (
                  <div className="text-emerald-700 text-xs bg-emerald-50 p-3 rounded-xl border border-emerald-200 flex gap-2 items-start leading-relaxed">
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span>{successMessage}</span>
                  </div>
                )}

                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleResetStep}
                    className="flex-1 py-3.5 px-4 border border-gray-200 rounded-xl text-xs font-bold uppercase tracking-wider text-gray-500 bg-white hover:bg-gray-50 transition-all text-center"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-[2] flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-emerald-500/10 text-xs font-bold uppercase tracking-wider text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <span>Ativar Conta e Entrar</span>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}

          {step === 'password' && (
            <>
              <div className="text-center mb-6">
                <div className="bg-orange-600 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-orange-200">
                  <Lock className="text-white w-6 h-6" />
                </div>
                <h1 className="text-2xl font-bold font-sans text-gray-900 tracking-tight">
                  Insira sua Senha
                </h1>
                <p className="text-gray-500 mt-2 text-xs font-medium max-w-sm mx-auto">
                  A conta já possui senha cadastrada. Digite abaixo para acessar seu painel de criação.
                </p>
                <div className="mt-3 inline-block bg-slate-100 px-3 py-1 rounded-full text-[11px] text-gray-600 font-mono">
                  Logado como: <span className="font-semibold text-orange-600">{email}</span>
                </div>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider">Senha de Aluno</label>
                    <button
                      type="button"
                      onClick={handleResetStep}
                      className="text-xs text-orange-600 hover:text-orange-800 font-bold"
                    >
                      Alterar E-mail
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 block w-full border-gray-200 rounded-xl border p-3.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all placeholder-gray-400"
                      placeholder="Insira sua senha de acesso"
                      autoFocus
                    />
                  </div>
                  
                  <div className="flex justify-end mt-1.5">
                    <button
                      type="button"
                      onClick={() => setShowForgotHelp(!showForgotHelp)}
                      className="text-xs text-orange-600 hover:text-orange-800 hover:underline font-semibold focus:outline-none"
                    >
                      Esqueceu sua senha?
                    </button>
                  </div>

                  {showForgotHelp && (
                    <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl text-xs text-orange-900 leading-relaxed shadow-sm mt-3 flex flex-col gap-2 animate-fade-in text-left">
                      <div className="flex gap-2 font-bold text-orange-950 items-center">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span>Recuperação de Acesso do Aluno</span>
                      </div>
                      <p>
                        Para sua segurança e privacidade, a alteração ou reset de senha deve ser validada manualmente. 
                      </p>
                      <p>
                        Envie uma mensagem para o suporte com o e-mail de compra para que possamos resetar sua senha no banco:
                        <a 
                          href="mailto:luizalacerdaatelie@gmail.com?subject=Recuperar Senha AgendaMaster" 
                          className="font-bold text-orange-700 hover:underline block mt-1"
                        >
                          luizalacerdaatelie@gmail.com
                        </a>
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowForgotHelp(false)}
                        className="text-[10px] uppercase font-bold text-orange-700 hover:text-orange-900 self-end mt-1 border border-orange-200 px-2.5 py-1 rounded-lg bg-white shadow-sm"
                      >
                        Entendi
                      </button>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="text-red-600 text-xs bg-red-50 p-3 rounded-xl border border-red-200 flex gap-2 items-start leading-relaxed animate-shake">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-orange-600/10 text-xs font-bold uppercase tracking-wider text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <span>Acessar Portal</span> 
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  )}
                </button>

              </form>
            </>
          )}

          {/* Secure transaction notice */}
          <div className="mt-6 flex justify-center items-center gap-1.5 text-gray-400 text-[10px] font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Portal do Aluno Protegido e Criptografado</span>
          </div>

          {/* Self-healing Cache purger option */}
          <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={async () => {
                if (typeof window !== 'undefined' && (window as any).clearAppCache) {
                  const confirm = window.confirm("Deseja limpar o cache e carregar a versão mais recente? Isso resolverá problemas de travamento ou tela em branco e garantirá o acesso imediato.");
                  if (confirm) {
                    await (window as any).clearAppCache(true);
                  }
                } else {
                  localStorage.clear();
                  sessionStorage.clear();
                  window.location.reload();
                }
              }}
              className="text-[10px] text-orange-500 hover:text-orange-700 hover:underline font-bold uppercase tracking-wider flex items-center justify-center gap-1 bg-orange-50/50 hover:bg-orange-50 px-3.5 py-2 rounded-xl transition-all border border-orange-200 w-full animate-pulse-slow"
            >
              🛠️ Travamentos ou problemas para carregar? Limpar Cache
            </button>
          </div>
        </div>
        
      </div>



      {/* PWA ALTERNATIVE GUIDE MODAL */}
      {showPwaGuide && (
        <div className="fixed inset-0 z-[10000] bg-black/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 flex flex-col text-gray-800 animate-in zoom-in-95 duration-200 my-8">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-[10px] font-black tracking-widest text-orange-600 uppercase">Tecnologia Híbrida</span>
                <h3 className="text-xl font-black text-orange-950 mt-0.5">Métodos Alternativos de Uso</h3>
              </div>
              <button 
                type="button"
                onClick={() => setShowPwaGuide(false)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                title="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-gray-500 mb-5 leading-relaxed">
              O <strong>Agenda Master</strong> foi construído com as melhores tecnologias modernas de desenvolvimento. Além de baixar o instalador oficial `.exe` para computador, você também pode usar o recurso PWA integrado do seu próprio navegador se estiver no Mac, Linux ou Celular:
            </p>

            <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
              {/* Windows / Chrome / Edge */}
              <div className={`border rounded-xl p-4 flex gap-3 text-left transition-all ${detectedOS === 'windows' ? 'bg-orange-50/50 border-orange-200 ring-1 ring-orange-200' : 'bg-gray-50/50 border-gray-100'}`}>
                <div className={`p-2.5 h-fit rounded-lg shrink-0 ${detectedOS === 'windows' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-400'}`}>
                  <Monitor className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-bold text-orange-950">Navegadores de Computador (Chrome / Edge)</h4>
                    {detectedOS === 'windows' && <span className="text-[9px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-black uppercase">Seu Sistema</span>}
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed mb-2 mt-0.5">
                    Se você não quiser baixar o instalador `.exe`, pode simplesmente "instalar" diretamente da aba do seu navegador:
                  </p>
                  <ol className="list-decimal list-inside text-xs text-gray-600 space-y-1">
                    <li>Olhe para o canto direito da sua barra de endereços (onde digita o link).</li>
                    <li>Clique no ícone de monitor com uma seta para baixo (<kbd className="bg-gray-100 border border-gray-300 rounded px-1 text-[10px]">Instalar</kbd>).</li>
                    <li>Confirme a instalação e o app criará um atalho de abertura instantânea na sua área de trabalho!</li>
                  </ol>
                </div>
              </div>

              {/* Mac (Safari or Chrome) */}
              <div className={`border rounded-xl p-4 flex gap-3 text-left transition-all ${detectedOS === 'mac' ? 'bg-orange-50/50 border-orange-200 ring-1 ring-orange-200' : 'bg-gray-50/50 border-gray-100'}`}>
                <div className={`p-2.5 h-fit rounded-lg shrink-0 ${detectedOS === 'mac' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-400'}`}>
                  <Monitor className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-bold text-orange-950">macOS (Apple Safari)</h4>
                    {detectedOS === 'mac' && <span className="text-[9px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-black uppercase">Seu Sistema</span>}
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed mb-2 mt-0.5">
                    Se você está no Mac e usa o Safari para acessar:
                  </p>
                  <ol className="list-decimal list-inside text-xs text-gray-600 space-y-1">
                    <li>Vá no menu superior <strong>Arquivo</strong> do seu Mac.</li>
                    <li>Clique na opção <strong>"Adicionar ao Dock..."</strong>.</li>
                    <li>O Agenda Master ganhará um ícone de alta resolução diretamente no Launchpad e Dock do seu Mac.</li>
                  </ol>
                </div>
              </div>

              {/* iOS / iPhone */}
              <div className={`border rounded-xl p-4 flex gap-3 text-left transition-all ${detectedOS === 'ios' ? 'bg-orange-50/50 border-orange-200 ring-1 ring-orange-200' : 'bg-gray-50/50 border-gray-100'}`}>
                <div className={`p-2.5 h-fit rounded-lg shrink-0 ${detectedOS === 'ios' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-400'}`}>
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-bold text-orange-950">iPhone / iPad (Apple iOS)</h4>
                    {detectedOS === 'ios' && <span className="text-[9px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-black uppercase">Seu Sistema</span>}
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed mb-2 mt-0.5">
                    Se você quer fixar na tela inicial do iPhone:
                  </p>
                  <ol className="list-decimal list-inside text-xs text-gray-600 space-y-1">
                    <li>Abra o Agenda Master no Safari do celular.</li>
                    <li>Toque no botão de <strong>Compartilhar</strong> (quadrado com uma seta para cima).</li>
                    <li>Escolha a opção <strong>"Adicionar à Tela de Início"</strong> e toque em Adicionar.</li>
                  </ol>
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button 
                type="button"
                onClick={() => setShowPwaGuide(false)}
                className="w-full px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg hover:shadow-orange-500/20 transition-all text-center"
              >
                Entendi, fechar guia
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default Login;