import React, { useState } from 'react';
import { localStorage } from '../../services/safeStorage';
import { User } from '../../types';
import { Lock, Mail, ArrowRight, ArrowLeft, Star, CheckCircle, Database, AlertCircle, Sparkles, ShieldCheck, Code, Copy, Check, Monitor, Smartphone, Zap, X, Info, HelpCircle, RefreshCw, Download, Settings, Key, Eye, EyeOff } from 'lucide-react';
import { supabase, supabasePublic, isSupabaseConfigured, isDevelopmentEnvironment, isTutorOrAllowedEmail } from '../../services/supabase';

interface LoginProps {
  onLogin: (user: User) => void;
  onNavigateToLanding?: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onNavigateToLanding }) => {
  const [email, setEmail] = useState(() => {
    try {
      return localStorage.getItem('agendamaster_saved_email') || '';
    } catch (_) {
      return '';
    }
  });
  const clearBrokenAuthTokensOnly = () => {
    try {
      if (!localStorage) return;
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (
          key &&
          (key.startsWith('sb-') ||
            key.includes('supabase.auth') ||
            key.includes('supabase-js') ||
            key === 'agendamaster_verified_profile')
        ) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => {
        try {
          localStorage.removeItem(k);
        } catch (_) {}
      });
    } catch (_) {}
  };

  // Auto-limpeza 100% automática ao abrir a tela de Login (faz sozinho o que o antigo botão "Limpar Cache" fazia!)
  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Limpa silenciosamente caches antigos de arquivos estáticos sem recarregar e sem apagar projetos
    if ((window as any).clearAppCache) {
      Promise.resolve((window as any).clearAppCache(false, false)).catch(() => {});
    }

    // 2. Se não estiver em recuperação de senha, verifica se sobrou algum token expirado/inválido e já limpa sozinho
    if (
      isSupabaseConfigured &&
      !(window as any).__isPasswordRecoveryFlow &&
      !(window as any).__isLinkRecovery
    ) {
      supabase.auth
        .getSession()
        .then(({ data, error }) => {
          if (error || !data?.session?.user) {
            clearBrokenAuthTokensOnly();
          }
        })
        .catch(() => {
          clearBrokenAuthTokensOnly();
        });
    }
  }, []);
  
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
  const [otpCode, setOtpCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [step, setStep] = useState<'email' | 'password' | 'create_password' | 'forgot_request' | 'verify_recovery_code' | 'reset_new_password'>('email');
  const [allowedUserData, setAllowedUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showForgotHelp, setShowForgotHelp] = useState(false);

  React.useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = window.setInterval(() => {
      setResendCooldown((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendCooldown]);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const activateLinkRecovery = async (recoveryEmail?: string) => {
      let resolvedEmail = recoveryEmail || (window as any).__recoveryEmail || '';
      if (!resolvedEmail && isSupabaseConfigured) {
        const { data } = await supabase.auth.getSession();
        resolvedEmail = data.session?.user?.email || '';
      }
      if (resolvedEmail) {
        setEmail(resolvedEmail);
      }
      setPassword('');
      setConfirmPassword('');
      setError('');
      setSuccessMessage('Identificamos sua recuperação de acesso! Escolha sua nova senha abaixo.');
      setStep('reset_new_password');
    };

    if ((window as any).__isLinkRecovery) {
      activateLinkRecovery();
    }

    const handleRecoveryEvent = (ev: Event) => {
      const customEv = ev as CustomEvent<{ email?: string }>;
      activateLinkRecovery(customEv.detail?.email);
    };

    window.addEventListener('agendamaster-password-recovery', handleRecoveryEvent);
    return () => {
      window.removeEventListener('agendamaster-password-recovery', handleRecoveryEvent);
    };
  }, []);

  const [registeredEmails, setRegisteredEmails] = useState<{ email: string; active: boolean }[]>([]);
  const [loadingEmails, setLoadingEmails] = useState(false);

  React.useEffect(() => {
    if (isSupabaseConfigured && isDevelopmentEnvironment) {
      const fetchData = async () => {
        setLoadingEmails(true);
        try {
          const { data, error } = await supabasePublic
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

        const lookupWithClient = async (dbClient: typeof supabase) => {
          let { data: exactData, error: allowedError } = await dbClient
            .from('allowed_users')
            .select('*')
            .eq('email', enteredEmail)
            .maybeSingle();

          let found = exactData;
          if (allowedError) {
            const msg = (allowedError.message || '').toLowerCase();
            if (msg.includes('fetch') || msg.includes('network') || msg.includes('failed') || msg.includes('load') || msg.includes('connect')) {
              throw allowedError;
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
          // Consulta primeiro via cliente público sem estado (imune a tokens antigos expirados no navegador!)
          const publicMatch = await lookupWithClient(supabasePublic);
          if (publicMatch) return publicMatch;
          return await lookupWithClient(supabase);
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
        try {
          localStorage.setItem('agendamaster_saved_email', enteredEmail);
        } catch (_) {}

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
      const normalizedEmail = email.trim().toLowerCase();
      try {
        let sessionData = null;
        try {
          let { data, error: signInError } = await supabase.auth.signInWithPassword({
            email: normalizedEmail,
            password
          });

          // Se houver resquício de token antigo no navegador, limpa de forma transparente e tenta entrar na mesma hora
          if (signInError) {
            const firstErrLower = (signInError.message || '').toLowerCase();
            if (
              firstErrLower.includes('refresh_token') ||
              firstErrLower.includes('refresh token') ||
              firstErrLower.includes('session_not_found')
            ) {
              clearBrokenAuthTokensOnly();
              const retryAfterClean = await supabase.auth.signInWithPassword({
                email: normalizedEmail,
                password
              });
              data = retryAfterClean.data;
              signInError = retryAfterClean.error;
            }
          }

          if (signInError) {
            // Caso a aluna exista na tabela allowed_users com esta exata senha, mas ainda não tenha sido sincronizada no Auth
            if (allowedUserData && allowedUserData.password && allowedUserData.password === password) {
              console.log('[Login] Usuário na tabela de permitidos com senha correta, sincronizando no Auth...');
              const { error: signUpError } = await supabase.auth.signUp({
                email: normalizedEmail,
                password,
                options: {
                  data: {
                    name: allowedUserData.name || normalizedEmail.split('@')[0]
                  }
                }
              });

              if (!signUpError) {
                const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
                  email: normalizedEmail,
                  password
                });
                if (!retryError && retryData.user) {
                  sessionData = retryData;
                } else {
                  throw retryError || new Error('Erro de autenticação após sincronizar sua conta.');
                }
              } else {
                const signUpLower = (signUpError.message || '').toLowerCase();
                if (signUpLower.includes('already') || signUpLower.includes('registered') || signUpError.status === 422) {
                  throw new Error('Sua senha foi redefinida anteriormente. Digite sua senha mais recente ou clique em "Esqueceu sua senha?" abaixo para receber um código no e-mail.');
                }
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
          const lower = errMsg.toLowerCase();
          if (lower.includes('fetch') || lower.includes('network') || lower.includes('failed to fetch')) {
            throw new Error('Não foi possível conectar ao servidor no momento. Confira sua conexão com a internet e tente novamente.');
          }
          throw signInErr;
        }

        if (sessionData && sessionData.user) {
          try {
            localStorage.setItem('agendamaster_saved_email', normalizedEmail);
          } catch (_) {}
          onLogin({
            email: sessionData.user.email || normalizedEmail,
            name: sessionData.user.user_metadata?.name || allowedUserData?.plano || normalizedEmail.split('@')[0],
            plan: allowedUserData?.plan_tier || 'pro'
          });
        }
      } catch (err: any) {
        console.error('[Login] Erro durante o login:', err);
        const errMsg = err?.message || '';
        const lowerMsg = errMsg.toLowerCase();

        if (
          lowerMsg.includes('invalid login credentials') ||
          lowerMsg.includes('invalid_credentials') ||
          lowerMsg.includes('invalid credentials')
        ) {
          setError('Senha incorreta. Confira se digitou corretamente (clique no ícone de olho para visualizar) ou clique em "Esqueceu sua senha?" logo abaixo para criar uma nova.');
        } else if (lowerMsg.includes('email not confirmed')) {
          setError('Seu acesso precisa de validação de senha. Clique em "Esqueceu sua senha?" abaixo para receber um código rápido no seu e-mail.');
        } else if (lowerMsg.includes('too many requests') || lowerMsg.includes('rate limit') || err?.status === 429) {
          setError('Muitas tentativas seguidas. Aguarde cerca de 1 minuto e tente novamente.');
        } else if (
          lowerMsg.includes('refresh_token') ||
          lowerMsg.includes('refresh token') ||
          lowerMsg.includes('session_not_found')
        ) {
          clearBrokenAuthTokensOnly();
          try {
            await supabase.auth.signOut({ scope: 'local' });
          } catch (_) {}
          setError('Atualizamos sua conexão de acesso automaticamente. Por favor, clique em Entrar mais uma vez.');
        } else {
          setError(errMsg || 'Senha incorreta. Confira os dados digitados ou clique em "Esqueceu sua senha?".');
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
            // Tenta login para ver se a senha digitada já é a cadastrada no Auth
            const { error: signInError } = await supabase.auth.signInWithPassword({
              email: email.trim().toLowerCase(),
              password
            });
            if (signInError) {
              setPassword('');
              setConfirmPassword('');
              setStep('password');
              throw new Error('Este e-mail já possui uma senha cadastrada anteriormente. Digite sua senha atual ou clique em "Esqueceu sua senha?" para receber um código no seu e-mail.');
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

  const handleSendRecoveryCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (resendCooldown > 0) return;

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setError('Por favor, informe seu e-mail antes de recuperar a senha.');
      setStep('email');
      return;
    }

    if (!isSupabaseConfigured) {
      setError('Erro: Conexão com o banco de dados pendente.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const redirectUrl =
        typeof window !== 'undefined' && window.location.origin.startsWith('http')
          ? `${window.location.origin}/acesso`
          : 'https://agendamaster2027.netlify.app/acesso';

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo: redirectUrl,
      });

      if (resetError) {
        const lowerMsg = (resetError.message || '').toLowerCase();
        if (
          lowerMsg.includes('rate limit') ||
          lowerMsg.includes('security purposes') ||
          lowerMsg.includes('only request this after') ||
          resetError.status === 429
        ) {
          throw new Error(
            'Um código já foi enviado recentemente. Aguarde cerca de 60 segundos antes de pedir outro e confira sua Caixa de Entrada e a pasta de Spam.'
          );
        }
        throw resetError;
      }

      setOtpCode('');
      setResendCooldown(60);
      setShowForgotHelp(false);
      setSuccessMessage('Código enviado! Confira sua Caixa de Entrada e também a pasta de Spam/Promoções.');
      setStep('verify_recovery_code');
    } catch (err: any) {
      console.error('[Recovery] Erro ao enviar código de recuperação:', err);
      setError(err?.message || 'Não foi possível enviar o código de recuperação. Tente novamente em instantes.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyRecoveryCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = otpCode.replace(/\s|-/g, '').trim();

    if (!cleanCode || cleanCode.length < 6) {
      setError('Por favor, digite o código completo recebido no seu e-mail.');
      return;
    }

    if (!isSupabaseConfigured) {
      setError('Erro: Conexão com o banco de dados pendente.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const normalizedEmail = email.trim().toLowerCase();
      if (typeof window !== 'undefined') {
        (window as any).__isPasswordRecoveryFlow = true;
      }

      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email: normalizedEmail,
        token: cleanCode,
        type: 'recovery',
      });

      if (verifyError || !data?.session) {
        if (typeof window !== 'undefined') {
          (window as any).__isPasswordRecoveryFlow = false;
        }
        const lowerMsg = (verifyError?.message || '').toLowerCase();
        if (lowerMsg.includes('expired') || lowerMsg.includes('invalid') || lowerMsg.includes('token')) {
          throw new Error('Código inválido ou expirado. Confira os números no e-mail mais recente ou clique em Reenviar código.');
        }
        throw verifyError || new Error('Não foi possível validar o código informado.');
      }

      setPassword('');
      setConfirmPassword('');
      setShowPassword(false);
      setShowConfirmPassword(false);
      setSuccessMessage('Código validado com sucesso! Agora escolha sua nova senha.');
      setStep('reset_new_password');
    } catch (err: any) {
      console.error('[Recovery] Erro ao validar código OTP:', err);
      setError(err?.message || 'Código inválido ou expirado. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!password || !confirmPassword) {
      setError('Por favor, preencha a nova senha e a confirmação.');
      return;
    }

    if (password.length < 6) {
      setError('Sua nova senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas digitadas não coincidem.');
      return;
    }

    if (!isSupabaseConfigured) {
      setError('Erro: Conexão com o banco de dados pendente.');
      return;
    }

    setIsLoading(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const { error: updateAuthError } = await supabase.auth.updateUser({
        password,
      });

      if (updateAuthError) {
        const lowerMsg = (updateAuthError.message || '').toLowerCase();
        const isSamePassword =
          lowerMsg.includes('different from the old password') ||
          lowerMsg.includes('same_password');

        if (!isSamePassword) {
          if (lowerMsg.includes('session') || lowerMsg.includes('missing')) {
            throw new Error('Sua sessão de verificação expirou. Por favor, solicite um novo código.');
          }
          throw updateAuthError;
        }
      }

      // Sincroniza a nova senha na tabela allowed_users
      const targetDbEmail = allowedUserData?.email || normalizedEmail;
      const { error: dbUpdateError } = await supabase
        .from('allowed_users')
        .update({
          password,
          updated_at: new Date().toISOString(),
        })
        .eq('email', targetDbEmail);

      if (dbUpdateError) {
        console.warn('[Recovery] Senha atualizada no Auth, aviso ao sincronizar allowed_users:', dbUpdateError);
      }

      if (typeof window !== 'undefined') {
        (window as any).__isPasswordRecoveryFlow = false;
        (window as any).__isLinkRecovery = false;
        (window as any).__recoveryEmail = '';
      }

      const { data: userData } = await supabase.auth.getUser();
      const activeUser = userData?.user;
      const finalEmail = activeUser?.email || normalizedEmail;

      setSuccessMessage('Nova senha cadastrada com sucesso! Acessando o painel...');

      onLogin({
        email: finalEmail,
        name: activeUser?.user_metadata?.name || allowedUserData?.name || allowedUserData?.plano || finalEmail.split('@')[0],
        plan: allowedUserData?.plan_tier || 'pro',
      });
    } catch (err: any) {
      console.error('[Recovery] Erro ao salvar nova senha:', err);
      setError(err?.message || 'Ocorreu um erro ao salvar sua nova senha. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelRecovery = async () => {
    if (typeof window !== 'undefined' && (window as any).__isPasswordRecoveryFlow) {
      (window as any).__isPasswordRecoveryFlow = false;
      (window as any).__isLinkRecovery = false;
      (window as any).__recoveryEmail = '';
      if (isSupabaseConfigured) {
        try {
          await supabase.auth.signOut();
        } catch (_) {}
      }
    }
    setOtpCode('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setShowForgotHelp(false);
    setError('');
    setSuccessMessage('');
    setStep(email ? 'password' : 'email');
  };

  const handleResetStep = () => {
    if (typeof window !== 'undefined') {
      (window as any).__isPasswordRecoveryFlow = false;
      (window as any).__isLinkRecovery = false;
    }
    setStep('email');
    setOtpCode('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setShowForgotHelp(false);
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
    <div className="min-h-screen bg-gradient-to-b from-[#faf6f4] via-[#fffbf9] to-[#f9f1ee] text-slate-800 flex flex-col items-center justify-center p-4 gap-4 md:py-12 relative font-sans antialiased">
      {/* Ambient feminine glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-72 bg-[#b84a56]/5 rounded-full blur-3xl pointer-events-none z-0" />

      <div className="bg-white rounded-3xl shadow-[0_16px_50px_rgba(184,74,86,0.08)] w-full max-w-lg overflow-hidden border border-[#eedad5] flex flex-col shrink-0 relative z-10">
        
        {/* Informative Guidance banner if database keys are not yet stored */}
        {!isSupabaseConfigured && (
          <div className="mx-6 mt-6 p-4 bg-[#fdeeed] rounded-2xl border border-[#f5ded9] text-xs text-[#9f3d4a] flex flex-col gap-2 shadow-2xs">
            <div className="flex gap-2 font-bold text-[#b84a56] items-start">
              <Database className="w-4 h-4 flex-shrink-0 text-[#b84a56] mt-0.5" />
              <span>Chaves de API Supabase não detectadas</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              O aplicativo está pronto para autenticação via Supabase! Para ativar o login com a lista de alunos cadastrados, declare 
              <code className="bg-[#fcedea] px-1 py-0.5 rounded mx-1 text-[#b84a56] font-mono">VITE_SUPABASE_URL</code> e 
              <code className="bg-[#fcedea] px-1 py-0.5 rounded mx-1 text-[#b84a56] font-mono">VITE_SUPABASE_ANON_KEY</code> 
              nas configurações do seu projeto e execute um novo deploy.
            </p>
          </div>
        )}

        {/* Login Box Area */}
        <div className="p-8 md:p-10 flex-grow">
          
          {step === 'email' && (
            <>
              <div className="text-center mb-6">
                <div className="bg-[#fdeeed] border border-[#f5ded9] w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xs text-white text-2xl select-none">
                  <Sparkles className="w-7 h-7 text-[#b84a56]" />
                </div>
                <div className="inline-block bg-[#fcedea] border border-[#f8d4ce] text-[#9f3d4a] text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider mb-2">
                  Portal do Aluno
                </div>
                <h1 className="text-2xl font-black font-sans text-slate-900 tracking-tight">
                  Área do Aluno
                </h1>
                <p className="text-slate-500 mt-2 text-xs font-normal max-w-sm mx-auto">
                  Por favor, insira o e-mail que você utilizou para realizar a compra do curso na HeroSpark.
                </p>
              </div>

              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Email de Aluno</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-[#b84a56]" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 block w-full bg-[#faf5f3] border-[#eedad5] rounded-xl border p-3.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#b84a56] focus:border-[#b84a56] transition-all placeholder-slate-400"
                      placeholder="seuemail@exemplo.com"
                    />
                  </div>
                </div>

                {error && (
                  <div className="text-red-700 text-xs bg-red-50 p-4 rounded-xl border border-red-200 flex gap-2.5 items-start leading-relaxed animate-shake">
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="flex-1 font-medium text-left">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center py-3.5 px-4 rounded-2xl shadow-lg shadow-rose-900/15 text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-[#c45663] to-[#b84a56] hover:from-[#b84a56] hover:to-[#9f3d4a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#b84a56] disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer active:scale-95"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <span>Continuar para o Painel</span> 
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  )}
                </button>

                <div className="pt-1 text-center flex flex-col items-center gap-2">
                  <a
                    href="https://pay.herospark.com/agenda-master-523399"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#b84a56] hover:text-[#9f3d4a] font-semibold hover:underline inline-flex items-center gap-1.5 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#b84a56]" />
                    <span>Ainda não é aluno? Adquira seu acesso aqui</span>
                  </a>
                </div>

              </form>
            </>
          )}

          {step === 'create_password' && (
            <>
              <div className="text-center mb-6">
                <div className="bg-[#fdeeed] text-[#b84a56] border border-[#f5ded9] w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xs text-2xl select-none">
                  <Key className="w-7 h-7 text-[#b84a56]" />
                </div>
                <h1 className="text-2xl font-black font-sans text-slate-900 tracking-tight">
                  Seja muito bem-vindo!
                </h1>
                <p className="text-slate-500 mt-2 text-xs font-normal max-w-sm mx-auto leading-relaxed">
                  Identificamos que este é o seu <strong>primeiro acesso</strong>. Por favor, cadastre uma senha segura para proteger sua conta e acessar a plataforma de agora em diante.
                </p>
                <div className="mt-3 inline-block bg-[#faf5f3] border border-[#eedad5] px-3 py-1 rounded-full text-[11px] text-slate-600 font-mono">
                  E-mail: <span className="font-semibold text-[#b84a56]">{email}</span>
                </div>
              </div>

              <form onSubmit={handleCreatePasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Escolha uma Senha</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-[#b84a56]" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 block w-full bg-[#faf5f3] border-[#eedad5] rounded-xl border p-3.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#b84a56] focus:border-[#b84a56] transition-all placeholder-slate-400 font-mono"
                      placeholder="No mínimo 6 caracteres"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-[#b84a56] transition-colors cursor-pointer"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Confirme a Senha</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-[#b84a56]" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 pr-10 block w-full bg-[#faf5f3] border-[#eedad5] rounded-xl border p-3.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#b84a56] focus:border-[#b84a56] transition-all placeholder-slate-400 font-mono"
                      placeholder="Repita a senha escolhida"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-[#b84a56] transition-colors cursor-pointer"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="text-red-700 text-xs bg-red-50 p-3 rounded-xl border border-red-200 flex gap-2 items-start leading-relaxed animate-shake">
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {successMessage && (
                  <div className="text-emerald-800 text-xs bg-emerald-50 p-3 rounded-xl border border-emerald-200 flex gap-2 items-start leading-relaxed">
                    <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>{successMessage}</span>
                  </div>
                )}

                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleResetStep}
                    className="flex-1 py-3.5 px-4 border border-[#eedad5] rounded-xl text-xs font-bold uppercase tracking-wider text-slate-700 bg-white hover:bg-slate-50 transition-all text-center cursor-pointer"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-[2] flex justify-center items-center py-3.5 px-4 rounded-xl shadow-lg shadow-rose-900/15 text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-[#c45663] to-[#b84a56] hover:from-[#b84a56] hover:to-[#9f3d4a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#b84a56] disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
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
                <div className="bg-[#fdeeed] border border-[#f5ded9] w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xs text-[#b84a56]">
                  <Lock className="w-6 h-6 text-[#b84a56]" />
                </div>
                <h1 className="text-2xl font-black font-sans text-slate-900 tracking-tight">
                  Insira sua Senha
                </h1>
                <p className="text-slate-500 mt-2 text-xs font-normal max-w-sm mx-auto">
                  A conta já possui senha cadastrada. Digite abaixo para acessar seu painel de criação.
                </p>
                <div className="mt-3 inline-block bg-[#faf5f3] border border-[#eedad5] px-3 py-1 rounded-full text-[11px] text-slate-600 font-mono">
                  Logado como: <span className="font-semibold text-[#b84a56]">{email}</span>
                </div>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Senha de Aluno</label>
                    <button
                      type="button"
                      onClick={handleResetStep}
                      className="text-xs text-[#b84a56] hover:text-[#9f3d4a] font-bold cursor-pointer"
                    >
                      Alterar E-mail
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-[#b84a56]" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 block w-full bg-[#faf5f3] border-[#eedad5] rounded-xl border p-3.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#b84a56] focus:border-[#b84a56] transition-all placeholder-slate-400"
                      placeholder="Insira sua senha de acesso"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-[#b84a56] transition-colors cursor-pointer"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  
                  <div className="flex justify-end mt-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setError('');
                        setSuccessMessage('');
                        setShowForgotHelp(false);
                        setStep('forgot_request');
                      }}
                      className="text-xs text-[#b84a56] hover:text-[#9f3d4a] hover:underline font-semibold focus:outline-none cursor-pointer"
                    >
                      Esqueceu sua senha?
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="text-red-700 text-xs bg-red-50 p-3 rounded-xl border border-red-200 flex gap-2 items-start leading-relaxed animate-shake">
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center py-3.5 px-4 rounded-2xl shadow-lg shadow-rose-900/15 text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-[#c45663] to-[#b84a56] hover:from-[#b84a56] hover:to-[#9f3d4a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#b84a56] disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer active:scale-95"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <span>Acessar Painel</span> 
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  )}
                </button>

              </form>
            </>
          )}

          {step === 'forgot_request' && (
            <>
              <div className="text-center mb-6">
                <div className="bg-[#fdeeed] border border-[#f5ded9] w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xs text-[#b84a56]">
                  <Mail className="w-6 h-6 text-[#b84a56]" />
                </div>
                <h1 className="text-2xl font-black font-sans text-slate-900 tracking-tight">
                  Recuperar Senha
                </h1>
                <p className="text-slate-500 mt-2 text-xs font-normal max-w-sm mx-auto leading-relaxed">
                  Enviaremos automaticamente um <strong>código numérico</strong> para o seu e-mail para você cadastrar uma nova senha na hora.
                </p>
                <div className="mt-3 inline-block bg-[#faf5f3] border border-[#eedad5] px-3 py-1 rounded-full text-[11px] text-slate-600 font-mono">
                  Enviar para: <span className="font-semibold text-[#b84a56]">{email}</span>
                </div>
              </div>

              <form onSubmit={handleSendRecoveryCode} className="space-y-4">
                {error && (
                  <div className="text-red-700 text-xs bg-red-50 p-3 rounded-xl border border-red-200 flex gap-2 items-start leading-relaxed animate-shake">
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || resendCooldown > 0}
                  className="w-full flex justify-center items-center py-3.5 px-4 rounded-2xl shadow-lg shadow-rose-900/15 text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-[#c45663] to-[#b84a56] hover:from-[#b84a56] hover:to-[#9f3d4a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#b84a56] disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer active:scale-95"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : resendCooldown > 0 ? (
                    <span>Aguarde {resendCooldown}s para reenviar</span>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <span>Enviar Código por E-mail</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  )}
                </button>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={handleCancelRecovery}
                    className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Voltar para senha</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setError('');
                      setSuccessMessage('');
                      setStep('verify_recovery_code');
                    }}
                    className="text-xs font-bold text-[#b84a56] hover:text-[#9f3d4a] hover:underline transition-colors cursor-pointer"
                  >
                    Já recebi um código
                  </button>
                </div>
              </form>
            </>
          )}

          {step === 'verify_recovery_code' && (
            <>
              <div className="text-center mb-5">
                <div className="bg-[#fdeeed] border border-[#f5ded9] w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xs text-[#b84a56]">
                  <ShieldCheck className="w-7 h-7 text-[#b84a56]" />
                </div>
                <h1 className="text-2xl font-black font-sans text-slate-900 tracking-tight">
                  Digite o Código
                </h1>
                <p className="text-slate-500 mt-2 text-xs font-normal max-w-sm mx-auto leading-relaxed">
                  Insira abaixo o código numérico enviado para o seu e-mail. Confira também as abas <strong>Spam</strong> ou <strong>Promoções</strong>.
                </p>
                <div className="mt-3 inline-block bg-[#faf5f3] border border-[#eedad5] px-3 py-1 rounded-full text-[11px] text-slate-600 font-mono">
                  E-mail: <span className="font-semibold text-[#b84a56]">{email}</span>
                </div>
              </div>

              <form onSubmit={handleVerifyRecoveryCode} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 text-center">
                    Código de Verificação
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    required
                    maxLength={8}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                    className="block w-full bg-[#faf5f3] border-[#eedad5] rounded-2xl border py-3.5 px-4 text-center text-xl font-black tracking-[0.35em] text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#b84a56] focus:border-[#b84a56] transition-all placeholder:text-slate-300 placeholder:tracking-normal placeholder:text-sm placeholder:font-normal font-mono"
                    placeholder="000000"
                    autoFocus
                  />
                </div>

                {successMessage && (
                  <div className="text-emerald-800 text-xs bg-emerald-50 p-3 rounded-xl border border-emerald-200 flex gap-2 items-start leading-relaxed">
                    <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>{successMessage}</span>
                  </div>
                )}

                {error && (
                  <div className="text-red-700 text-xs bg-red-50 p-3 rounded-xl border border-red-200 flex gap-2 items-start leading-relaxed animate-shake">
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || otpCode.length < 6}
                  className="w-full flex justify-center items-center py-3.5 px-4 rounded-2xl shadow-lg shadow-rose-900/15 text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-[#c45663] to-[#b84a56] hover:from-[#b84a56] hover:to-[#9f3d4a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#b84a56] disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer active:scale-95"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <span>Validar Código</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  )}
                </button>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={handleCancelRecovery}
                    className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Voltar</span>
                  </button>

                  <button
                    type="button"
                    disabled={isLoading || resendCooldown > 0}
                    onClick={() => handleSendRecoveryCode()}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#b84a56] hover:text-[#9f3d4a] disabled:text-slate-400 disabled:no-underline hover:underline transition-colors cursor-pointer disabled:cursor-not-allowed"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>
                      {resendCooldown > 0 ? `Reenviar em ${resendCooldown}s` : 'Reenviar código'}
                    </span>
                  </button>
                </div>

                <div className="pt-2 border-t border-[#f5e6e2] text-center">
                  <button
                    type="button"
                    onClick={() => setShowForgotHelp(!showForgotHelp)}
                    className="text-[11px] text-slate-400 hover:text-[#b84a56] font-semibold transition-colors cursor-pointer"
                  >
                    Não tem mais acesso a este e-mail? Falar com suporte
                  </button>
                  {showForgotHelp && (
                    <div className="mt-2 p-3 bg-[#fdeeed] border border-[#f5ded9] rounded-xl text-[11px] text-slate-600 leading-relaxed text-left">
                      Caso você tenha digitado outro e-mail na compra ou perdido acesso à caixa de entrada, envie uma mensagem para{' '}
                      <a
                        href="mailto:luizalacerdaatelie@gmail.com?subject=Recuperar Acesso AgendaMaster"
                        className="font-bold text-[#b84a56] hover:underline"
                      >
                        luizalacerdaatelie@gmail.com
                      </a>
                      .
                    </div>
                  )}
                </div>
              </form>
            </>
          )}

          {step === 'reset_new_password' && (
            <>
              <div className="text-center mb-6">
                <div className="bg-[#fdeeed] border border-[#f5ded9] w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xs text-[#b84a56]">
                  <Key className="w-7 h-7 text-[#b84a56]" />
                </div>
                <h1 className="text-2xl font-black font-sans text-slate-900 tracking-tight">
                  Criar Nova Senha
                </h1>
                <p className="text-slate-500 mt-2 text-xs font-normal max-w-sm mx-auto leading-relaxed">
                  Escolha sua nova senha de acesso abaixo. Ela passará a valer imediatamente.
                </p>
                {email && (
                  <div className="mt-3 inline-block bg-[#faf5f3] border border-[#eedad5] px-3 py-1 rounded-full text-[11px] text-slate-600 font-mono">
                    Conta: <span className="font-semibold text-[#b84a56]">{email}</span>
                  </div>
                )}
              </div>

              <form onSubmit={handleSaveNewPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Nova Senha</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-[#b84a56]" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 block w-full bg-[#faf5f3] border-[#eedad5] rounded-xl border p-3.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#b84a56] focus:border-[#b84a56] transition-all placeholder-slate-400 font-mono"
                      placeholder="No mínimo 6 caracteres"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-[#b84a56] transition-colors cursor-pointer"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Confirmar Nova Senha</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-[#b84a56]" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 pr-10 block w-full bg-[#faf5f3] border-[#eedad5] rounded-xl border p-3.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#b84a56] focus:border-[#b84a56] transition-all placeholder-slate-400 font-mono"
                      placeholder="Repita a nova senha"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-[#b84a56] transition-colors cursor-pointer"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {successMessage && (
                  <div className="text-emerald-800 text-xs bg-emerald-50 p-3 rounded-xl border border-emerald-200 flex gap-2 items-start leading-relaxed">
                    <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>{successMessage}</span>
                  </div>
                )}

                {error && (
                  <div className="text-red-700 text-xs bg-red-50 p-3 rounded-xl border border-red-200 flex gap-2 items-start leading-relaxed animate-shake">
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleCancelRecovery}
                    className="flex-1 py-3.5 px-4 border border-[#eedad5] rounded-xl text-xs font-bold uppercase tracking-wider text-slate-700 bg-white hover:bg-slate-50 transition-all text-center cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-[2] flex justify-center items-center py-3.5 px-4 rounded-xl shadow-lg shadow-rose-900/15 text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-[#c45663] to-[#b84a56] hover:from-[#b84a56] hover:to-[#9f3d4a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#b84a56] disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <span>Salvar Senha e Entrar</span>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}

          {/* Secure transaction notice */}
          <div className="mt-6 flex justify-center items-center gap-1.5 text-slate-400 text-[10px] font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-[#b84a56]" />
            <span>Portal do Aluno Protegido e Criptografado</span>
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