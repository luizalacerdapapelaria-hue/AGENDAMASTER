import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sparkles, ArrowRight, ArrowLeft, Check, CheckCircle2, 
  Clock, ShieldCheck, Zap, AlertTriangle, Video, 
  Flame, Award, Layers, Palette, RefreshCw,
  Gift, Heart, Star, Lock, Timer, HelpCircle,
  ExternalLink, MousePointerClick, ChevronRight,
  TrendingDown, TrendingUp, Scissors, Moon
} from 'lucide-react';
import { AppState } from '../../types';
import { 
  QUIZ_QUESTIONS, 
  RESULT_PROFILES, 
  QuizQuestion, 
  QuizOption, 
  QuizResultProfile 
} from './quizData';
import { ScratchCard } from './ScratchCard';

interface QuizPageProps {
  onNavigate: (state: AppState) => void;
  originalOfferUrl?: string;
  offerUrl?: string;
  checkoutUrl?: string;
}

type QuizStage = 'intro' | 'question' | 'calculating' | 'diagnostic' | 'video' | 'scratch';

// Celebratory Confetti Burst Component
const ConfettiBurst: React.FC = () => {
  const pieces = useMemo(() => {
    const colors = ['#b84a56', '#d66d7d', '#f6cfbe', '#e5a59c', '#10b981', '#f59e0b', '#ec4899'];
    return Array.from({ length: 48 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.4,
      duration: 2.2 + Math.random() * 1.8,
      size: 7 + Math.random() * 9,
      color: colors[i % colors.length],
      rotation: Math.random() * 360
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[99999] overflow-hidden">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-sm opacity-90"
          style={{
            left: `${p.left}%`,
            top: '-20px',
            width: `${p.size}px`,
            height: `${p.size * 1.5}px`,
            backgroundColor: p.color,
            animation: `fallDown ${p.duration}s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${p.delay}s forwards`,
            transform: `rotate(${p.rotation}deg)`
          }}
        />
      ))}
      <style>{`
        @keyframes fallDown {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          80% { opacity: 0.9; }
          100% { transform: translateY(105vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

const OFFER_STORAGE_KEY = 'agendamaster_quiz_offer_expires_at';
const OFFER_DURATION_MS = 15 * 60 * 1000; // 15 minutos

const getOfferExpiration = (): number | null => {
  try {
    const val = localStorage.getItem(OFFER_STORAGE_KEY);
    if (!val) return null;
    const num = Number(val);
    return isNaN(num) ? null : num;
  } catch {
    return null;
  }
};

const initOfferExpiration = (): number => {
  try {
    const existing = getOfferExpiration();
    if (existing) return existing;
    const expiresAt = Date.now() + OFFER_DURATION_MS;
    localStorage.setItem(OFFER_STORAGE_KEY, String(expiresAt));
    return expiresAt;
  } catch {
    return Date.now() + OFFER_DURATION_MS;
  }
};

// Isolated countdown component to avoid re-rendering whole page
interface CountdownTimerProps {
  onExpire?: () => void;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ onExpire }) => {
  const [remainingSeconds, setRemainingSeconds] = useState<number>(() => {
    const expiresAt = getOfferExpiration() || (Date.now() + OFFER_DURATION_MS);
    return Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
  });

  useEffect(() => {
    const checkTimer = () => {
      const expiresAt = getOfferExpiration();
      if (!expiresAt) return;
      const diff = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
      setRemainingSeconds(diff);
      if (diff <= 0) {
        onExpire?.();
      }
    };

    checkTimer();
    const interval = setInterval(checkTimer, 1000);
    return () => clearInterval(interval);
  }, [onExpire]);

  if (remainingSeconds <= 0) {
    return (
      <span className="font-mono text-xs text-red-700 font-extrabold bg-red-100 px-2.5 py-1 rounded-md border border-red-200">
        EXPIRADO
      </span>
    );
  }

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  return (
    <span className="font-mono text-sm text-[#b84a56] font-extrabold bg-[#fdeeed] px-2.5 py-0.5 rounded-md border border-[#f5ded9]">
      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </span>
  );
};

const getInitialStage = (): QuizStage => {
  if (typeof window === 'undefined') return 'intro';
  const path = (window.location.pathname || '').toLowerCase().replace(/\/+$/, '');
  const search = new URLSearchParams(window.location.search);
  const stageParam = (search.get('stage') || search.get('etapa') || '').toLowerCase();
  const hash = (window.location.hash || '').toLowerCase().replace(/^#\/?/, '').replace(/\/+$/, '');

  if (
    path === '/raspadinha' || 
    path.endsWith('/raspadinha') || 
    path === '/desconto' || 
    path.endsWith('/desconto') || 
    path === '/oferta' || 
    path.endsWith('/oferta') || 
    stageParam === 'scratch' || 
    stageParam === 'raspadinha' || 
    stageParam === 'desconto' ||
    hash === 'raspadinha' ||
    hash === 'desconto' ||
    hash === 'oferta'
  ) {
    return 'scratch';
  }

  return 'intro';
};

export const QuizPage: React.FC<QuizPageProps> = ({
  onNavigate,
  originalOfferUrl = 'https://pay.herospark.com/agenda-master-523399',
  offerUrl = 'https://pay.herospark.com/agenda-master-545764',
  checkoutUrl
}) => {
  const activeOfferUrl = checkoutUrl || offerUrl;
  const activeOriginalOfferUrl = originalOfferUrl;
  const [currentStage, setCurrentStage] = useState<QuizStage>(getInitialStage);

  // Allow external stage changes
  useEffect(() => {
    const handleSetStage = (e: any) => {
      if (e?.detail) {
        setCurrentStage(e.detail);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    window.addEventListener('agendamaster-set-stage', handleSetStage);
    return () => window.removeEventListener('agendamaster-set-stage', handleSetStage);
  }, []);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, QuizOption>>({});
  
  // Progress calculating animation step
  const [calcStep, setCalcStep] = useState<number>(0);

  const isDev = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const urlParams = new URLSearchParams(window.location.search);
    return (
      urlParams.has('dev') ||
      urlParams.has('reset') ||
      urlParams.has('preview') ||
      urlParams.get('oferta') === '50' ||
      localStorage.getItem('agendamaster_dev_unlimited_offer') === 'true' ||
      window.location.hostname.includes('ais-dev') ||
      window.location.hostname.includes('ais-pre') ||
      window.location.hostname.includes('localhost')
    );
  }, []);

  // Offer expiration state persisted in localStorage
  const [isOfferExpired, setIsOfferExpired] = useState<boolean>(() => {
    try {
      if (localStorage.getItem('agendamaster_dev_unlimited_offer') === 'true') {
        return false;
      }
    } catch {}
    const existing = getOfferExpiration();
    if (existing && Date.now() >= existing) {
      return true;
    }
    return false;
  });

  // Scratch card and confetti celebration state
  const [isScratched, setIsScratched] = useState<boolean>(() => {
    try {
      return localStorage.getItem('agendamaster_quiz_scratched') === 'true';
    } catch {
      return false;
    }
  });
  const [showConfetti, setShowConfetti] = useState<boolean>(false);

  const handleRevealCoupon = () => {
    setIsScratched(true);
    setShowConfetti(true);
    initOfferExpiration();
    try {
      localStorage.setItem('agendamaster_quiz_scratched', 'true');
    } catch {}
    setTimeout(() => {
      setShowConfetti(false);
    }, 5000);
  };

  const handleDevResetOffer = () => {
    try {
      localStorage.removeItem(OFFER_STORAGE_KEY);
      localStorage.removeItem('agendamaster_quiz_scratched');
      localStorage.setItem('agendamaster_dev_unlimited_offer', 'true');
    } catch {}
    const newExpires = Date.now() + OFFER_DURATION_MS;
    try {
      localStorage.setItem(OFFER_STORAGE_KEY, String(newExpires));
    } catch {}
    setIsOfferExpired(false);
    setIsScratched(false);
  };

  // When user reaches scratch stage and scratched, check countdown expiration
  useEffect(() => {
    if (currentStage === 'scratch' && isScratched) {
      const expiresAt = initOfferExpiration();
      if (Date.now() >= expiresAt) {
        try {
          if (localStorage.getItem('agendamaster_dev_unlimited_offer') === 'true') {
            setIsOfferExpired(false);
            return;
          }
        } catch {}
        setIsOfferExpired(true);
      }
    }
  }, [currentStage, isScratched]);

  // Calculating screen simulation
  useEffect(() => {
    if (currentStage === 'calculating') {
      const step1 = setTimeout(() => setCalcStep(1), 700);
      const step2 = setTimeout(() => setCalcStep(2), 1500);
      const step3 = setTimeout(() => setCalcStep(3), 2300);
      const finish = setTimeout(() => {
        setCurrentStage('diagnostic');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 3100);
      return () => {
        clearTimeout(step1);
        clearTimeout(step2);
        clearTimeout(step3);
        clearTimeout(finish);
      };
    }
  }, [currentStage]);

  // Determine final profile based on selected answers
  const computedProfile = useMemo<QuizResultProfile>(() => {
    const counts: Record<string, number> = {
      artesanal: 0,
      iniciante: 0,
      grafica: 0,
      designer: 0
    };

    let totalLostHours = 0;
    let totalLostMoney = 0;

    Object.values(selectedAnswers).forEach(ans => {
      if (counts[ans.category] !== undefined) {
        counts[ans.category]++;
      }
      totalLostHours += ans.timeLostHours || 0;
      totalLostMoney += ans.moneyLostEstimate || 0;
    });

    let topCategory = 'artesanal';
    let maxCount = -1;
    Object.entries(counts).forEach(([cat, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topCategory = cat;
      }
    });

    const baseProfile = RESULT_PROFILES[topCategory] || RESULT_PROFILES.artesanal;
    return {
      ...baseProfile,
      estimatedLostHoursPerYear: Math.max(totalLostHours, 120),
      estimatedLostMoneyPerYear: Math.max(totalLostMoney, 2400)
    };
  }, [selectedAnswers]);

  // Actions
  const handleStartQuiz = () => {
    setCurrentStage('question');
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetScratch = () => {
    try {
      localStorage.removeItem('agendamaster_quiz_scratched');
      localStorage.removeItem(OFFER_STORAGE_KEY);
      localStorage.setItem('agendamaster_dev_unlimited_offer', 'true');
    } catch {}
    setIsScratched(false);
    setIsOfferExpired(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectOption = (option: QuizOption) => {
    const qIndex = currentQuestionIndex;
    const currentQ = QUIZ_QUESTIONS[qIndex];
    
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQ.id]: option
    }));

    setTimeout(() => {
      if (qIndex + 1 < QUIZ_QUESTIONS.length) {
        setCurrentQuestionIndex(qIndex + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setCurrentStage('calculating');
        setCalcStep(0);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 280);
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setCurrentStage('intro');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const currentQuestion = QUIZ_QUESTIONS[currentQuestionIndex];
  const progressPercent = currentStage === 'intro' ? 0 : Math.round(((currentQuestionIndex + 1) / QUIZ_QUESTIONS.length) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#faf6f4] via-[#fffbf9] to-[#f9f1ee] text-slate-800 font-sans selection:bg-[#fcedea] selection:text-[#9f3d4a] flex flex-col">
      {/* ── TOP ANNOUNCEMENT BAR (Feminine Rose Aesthetic) ── */}
      <div className="bg-gradient-to-r from-[#b84a56] via-[#c45b6a] to-[#b84a56] text-white text-xs font-bold py-2.5 px-4 text-center shadow-xs flex items-center justify-center gap-2">
        <Sparkles className="w-4 h-4 animate-spin-slow shrink-0 text-rose-200" />
        <span className="tracking-wide">DIAGNÓSTICO RÁPIDO DE PRODUÇÃO • DESCUBRA SE O AGENDA MASTER FACILITARIA SUA VIDA</span>
      </div>

      {/* ── HEADER ── */}
      <header className="border-b border-[#f2deda] bg-white/95 backdrop-blur-md sticky top-0 z-40 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div 
            onClick={() => onNavigate(AppState.LANDING)}
            className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity"
          >
            <div className="bg-[#fdeeed] w-8 h-8 rounded-xl flex items-center justify-center border border-[#f5ded9] shadow-xs">
              <Sparkles className="text-[#b84a56] w-4 h-4" />
            </div>
            <div>
              <span className="font-black text-base tracking-tight text-slate-900">
                Agenda <span className="text-[#b84a56]">Master</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-bold tracking-wider text-[#9f3d4a] bg-[#fcedea] px-2.5 py-0.5 rounded-full border border-[#f8d4ce]">
                Quiz Oficial
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {currentStage === 'question' && (
              <span className="text-xs font-semibold text-slate-600 bg-[#fdeeed] px-3 py-1.5 rounded-full border border-[#f5ded9]">
                Pergunta <span className="text-[#b84a56] font-bold">{currentQuestionIndex + 1}</span> de {QUIZ_QUESTIONS.length}
              </span>
            )}
            <button
              onClick={() => onNavigate(AppState.LANDING)}
              className="text-slate-500 hover:text-slate-800 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Voltar ao Início
            </button>
          </div>
        </div>

        {/* Progress Bar (during questions) */}
        {currentStage === 'question' && (
          <div className="w-full bg-[#faece8] h-1.5">
            <div 
              className="bg-gradient-to-r from-[#d66d7d] to-[#b84a56] h-1.5 transition-all duration-300 ease-out shadow-xs"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}
      </header>

      {/* ── MAIN CONTENT CONTAINER ── */}
      <main className="flex-1 flex flex-col justify-center max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 md:py-12">
        
        {/* ========================================================
            STAGE 1: INTRO (HOOK & ELEVAÇÃO DO NÍVEL DE CONSCIÊNCIA)
        ======================================================== */}
        {currentStage === 'intro' && (
          <div className="text-center max-w-2xl mx-auto py-6 sm:py-10 animate-fadeIn">
            
            <div className="inline-flex items-center gap-2 bg-[#fdeeed] border border-[#f5ded9] text-[#9f3d4a] text-xs font-bold px-4 py-1.5 rounded-full mb-6 shadow-xs">
              <Flame className="w-4 h-4 text-[#b84a56]" />
              <span>Teste Prático de 60 Segundos • Papelaria & Encadernação</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 mb-6 leading-[1.15]">
              Quantas horas você perde montando calendários, corrigindo datas ou quebrando a cabeça com <span className="text-[#b84a56]">mesclagem de dados</span>?
            </h1>

            <p className="text-slate-600 text-base sm:text-lg mb-10 leading-relaxed max-w-xl mx-auto">
              Fazer centenas de páginas na mão, sofrer com planilhas de datas no Excel, CorelDraw, InDesign ou Canva consome sua energia e atrasa entregas. 
              Responda a 6 perguntas práticas e <strong>vamos ver se o Agenda Master facilitaria a sua vida!</strong>
            </p>

            <button
              onClick={handleStartQuiz}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-gradient-to-r from-[#c45663] to-[#b84a56] hover:from-[#b84a56] hover:to-[#9f3d4a] text-white font-black text-base sm:text-lg px-8 py-4.5 rounded-2xl shadow-lg shadow-rose-900/15 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              id="quiz-start-btn"
            >
              <span>VAMOS VER SE ELE FACILITARIA SUA VIDA</span>
              <ArrowRight className="w-5 h-5 text-rose-200" />
            </button>

            <p className="text-[11px] text-slate-500 mt-4 flex items-center justify-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Respostas 100% confidenciais • Diagnóstico gratuito em 60 segundos</span>
            </p>
          </div>
        )}

        {/* ========================================================
            STAGE 2: QUESTION STEPS (PERGUNTAS DO QUIZ)
        ======================================================== */}
        {currentStage === 'question' && currentQuestion && (
          <div className="max-w-2xl mx-auto w-full py-2 animate-fadeIn">
            
            {/* Top Navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={handlePrevQuestion}
                className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors py-1.5 px-3 rounded-lg hover:bg-slate-100"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Voltar</span>
              </button>

              <span className="text-xs font-bold text-[#b84a56]">
                {progressPercent}% Concluído
              </span>
            </div>

            {/* Question Badge */}
            <div className="inline-block bg-[#fdeeed] text-[#b84a56] border border-[#f5ded9] text-[11px] font-bold px-3 py-1 rounded-full mb-3">
              {currentQuestion.badge}
            </div>

            {/* Question Title & Subtitle */}
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 mb-2.5 leading-snug">
              {currentQuestion.title}
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mb-6 leading-relaxed">
              {currentQuestion.subtitle}
            </p>

            {/* Answer Options (Feminine Atelier Cards) */}
            <div className="space-y-3">
              {currentQuestion.options.map((opt, idx) => {
                const isSelected = selectedAnswers[currentQuestion.id]?.id === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectOption(opt)}
                    className={`w-full text-left p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex items-start gap-4 cursor-pointer relative group ${
                      isSelected
                        ? 'bg-[#fdf2f0] border-[#b84a56] shadow-[0_4px_16px_rgba(184,74,86,0.12)]'
                        : 'bg-white border-[#eedad5] hover:border-[#b84a56]/50 hover:bg-[#fff9f8] shadow-xs'
                    }`}
                  >
                    {/* Index circle */}
                    <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-[#b84a56] text-white font-black'
                        : 'bg-[#fdeeed] text-[#b84a56] group-hover:bg-[#fcedea]'
                    }`}>
                      {String.fromCharCode(65 + idx)}
                    </div>

                    <div className="flex-1 pr-2">
                      <div className="text-sm sm:text-base font-bold text-slate-800 group-hover:text-slate-900 leading-snug mb-1">
                        {opt.label}
                      </div>
                      {opt.sublabel && (
                        <div className="text-xs text-slate-500 leading-relaxed font-normal">
                          {opt.sublabel}
                        </div>
                      )}
                    </div>

                    <div className="shrink-0 pt-0.5">
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                        isSelected 
                          ? 'border-[#b84a56] bg-[#b84a56] text-white' 
                          : 'border-slate-300 group-hover:border-[#b84a56]'
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Hint */}
            <div className="mt-6 flex items-center justify-center gap-1.5 text-slate-400 text-[11px]">
              <MousePointerClick className="w-3.5 h-3.5 text-[#b84a56]" />
              <span>Clique na alternativa que melhor descreve sua situação</span>
            </div>

          </div>
        )}

        {/* ========================================================
            STAGE 3: CALCULATING / ANALYZING SCREEN (AUTENTICIDADE)
        ======================================================== */}
        {currentStage === 'calculating' && (
          <div className="max-w-lg mx-auto w-full py-12 text-center animate-fadeIn">
            
            <div className="w-20 h-20 mx-auto mb-6 relative flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-[#b84a56]/20 animate-ping" />
              <div className="w-16 h-16 rounded-full bg-[#fdeeed] border-2 border-[#b84a56] flex items-center justify-center text-[#b84a56]">
                <RefreshCw className="w-8 h-8 animate-spin" />
              </div>
            </div>

            <h3 className="text-2xl font-black text-slate-900 mb-2">
              Cruzando seus Dados de Produção...
            </h3>
            <p className="text-xs text-slate-500 mb-8 max-w-sm mx-auto leading-relaxed">
              Nossa inteligência está calculando o tempo manual desperdiçado e verificando se o Agenda Master facilitaria sua vida.
            </p>

            {/* Step Checkpoints */}
            <div className="bg-white border border-[#eedad5] rounded-2xl p-5 text-left space-y-3.5 max-w-sm mx-auto shadow-sm">
              <div className="flex items-center gap-3 text-xs">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${calcStep >= 1 ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                  {calcStep >= 1 ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : '1'}
                </div>
                <span className={calcStep >= 1 ? 'text-slate-800 font-bold' : 'text-slate-400'}>
                  Mapeando gargalos manuais e dias perdidos...
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${calcStep >= 2 ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                  {calcStep >= 2 ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : '2'}
                </div>
                <span className={calcStep >= 2 ? 'text-slate-800 font-bold' : 'text-slate-400'}>
                  Calculando perda com mesclagem e alinhamento de datas...
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${calcStep >= 3 ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                  {calcStep >= 3 ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : '3'}
                </div>
                <span className={calcStep >= 3 ? 'text-slate-800 font-bold' : 'text-slate-400'}>
                  Gerando diagnóstico exclusivo do seu perfil...
                </span>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================
            STAGE 4: DIAGNÓSTICO CONCLUÍDO (GANCHO DIRETO & RASPADINHA)
        ======================================================== */}
        {currentStage === 'diagnostic' && (
          <div className="max-w-2xl mx-auto w-full py-6 animate-fadeIn">
            
            {/* Card Principal Feminino com Gancho para Raspadinha */}
            <div className="bg-white border-2 border-[#f2deda] rounded-3xl p-6 sm:p-10 text-center shadow-[0_12px_40px_rgba(184,74,86,0.08)] space-y-6">
              <div className="inline-flex items-center gap-2 bg-[#fdeeed] border border-[#f5ded9] text-[#b84a56] text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-[#b84a56]" />
                <span>DIAGNÓSTICO CONCLUÍDO</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Seu resultado está pronto!
              </h1>

              <div className="max-w-xl mx-auto space-y-4">
                <p className="text-slate-700 text-base sm:text-lg leading-relaxed font-medium">
                  Pelas suas respostas, você precisa de <strong className="text-[#b84a56] font-black">liberdade para criar seus próprios miolos</strong>, mas precisa <strong className="text-slate-900 font-black">parar de perder tempo com tarefas repetitivas</strong>.
                </p>

                <div className="p-4 rounded-2xl bg-[#fdf2f0] border border-[#f5ded9]">
                  <p className="text-[#b84a56] font-black text-xl sm:text-2xl">
                    O Agenda Master é perfeito pra isso!
                  </p>
                </div>

                <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                  E pra você não deixar passar essa oportunidade, liberamos um <strong className="text-slate-900 font-bold">desconto único e exclusivo</strong> pra você se juntar a centenas de usuárias:
                </p>
              </div>

              {/* Botão de Destaque para a Raspadinha */}
              <div className="pt-2">
                <button
                  onClick={() => {
                    setCurrentStage('scratch');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-gradient-to-r from-[#c45663] to-[#b84a56] hover:from-[#b84a56] hover:to-[#9f3d4a] text-white font-black text-base sm:text-lg px-8 py-5 rounded-2xl shadow-xl shadow-rose-900/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  id="go-to-scratch-direct-btn"
                >
                  <Gift className="w-6 h-6 text-white animate-bounce" />
                  <span>DESCOBRIR MEU DESCONTO NA RASPADINHA »</span>
                </button>
              </div>

              {/* Opção secundária: vídeo */}
              <div className="pt-2">
                <button
                  onClick={() => {
                    setCurrentStage('video');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-[#b84a56] transition-colors"
                  id="go-to-video-btn"
                >
                  <Video className="w-3.5 h-3.5 text-[#b84a56]" />
                  <span>Prefere ver o sistema funcionando antes? Assistir vídeo rápido (30s)</span>
                </button>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================
            STAGE 5: VÍDEO SHOWCASE (DEMONSTRAÇÃO DE 30 SEGUNDOS)
        ======================================================== */}
        {currentStage === 'video' && (
          <div className="max-w-3xl mx-auto w-full py-4 animate-fadeIn">
            
            <div className="text-center mb-6">
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#b84a56] block mb-1">
                Demonstração Rápida
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight mb-2">
                VEJA COMO FUNCIONA
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm max-w-xl mx-auto">
                Vídeo de 30 segundos.
              </p>
            </div>

            {/* Video Player Box */}
            <div className="bg-white border border-[#eedad5] rounded-3xl overflow-hidden shadow-xl mb-8 transform-gpu">
              <div className="bg-[#faf5f3] px-4 py-2.5 border-b border-[#eedad5] flex items-center justify-between text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span className="font-mono text-[11px] text-slate-500 ml-1">Demonstração ao Vivo • 30 Segundos</span>
                </div>
                <a
                  href="https://www.youtube.com/watch?v=FBqMHhpH8pg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-semibold text-[#b84a56] hover:underline flex items-center gap-1 transition-colors"
                  title="Abrir no YouTube"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Abrir no YouTube</span>
                </a>
              </div>

              <div className="relative w-full aspect-video bg-black overflow-hidden">
                <iframe
                  src="https://www.youtube-nocookie.com/embed/FBqMHhpH8pg?autoplay=1&mute=0&rel=0&modestbranding=1&playsinline=1"
                  title="Demonstração Prática do Agenda Master"
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>

              <div className="p-4 bg-[#faf5f3] text-xs flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#eedad5]">
                <div className="flex items-center gap-2 text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Calendários de qualquer ano, miolos pastéis, divisórias e margem para encadernação.</span>
                </div>
                <div className="flex items-center gap-2 text-[#b84a56] font-bold shrink-0">
                  <Zap className="w-4 h-4" />
                  <span>100% Automático e Sem Planilhas</span>
                </div>
              </div>
            </div>

            {/* Card de Transição com Gancho para a Raspadinha */}
            <div className="bg-white border-2 border-[#f2deda] rounded-3xl p-6 sm:p-8 text-center shadow-xl space-y-4">
              <div className="inline-flex items-center gap-2 bg-[#fdeeed] text-[#b84a56] border border-[#f5ded9] text-xs font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-[#b84a56]" />
                <span>DIAGNÓSTICO CONCLUÍDO</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                O Agenda Master é perfeito pra você!
              </h3>

              <p className="text-slate-600 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
                Pelas suas respostas, você precisa de <strong className="text-[#b84a56]">liberdade para criar seus próprios miolos</strong>, mas precisa <strong className="text-slate-900">parar de perder tempo com tarefas repetitivas</strong>. Liberamos um <strong className="text-slate-900">desconto único e exclusivo</strong> pra você se juntar a centenas de usuárias:
              </p>

              <button
                onClick={() => {
                  setCurrentStage('scratch');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-gradient-to-r from-[#c45663] to-[#b84a56] hover:from-[#b84a56] hover:to-[#9f3d4a] text-white font-black text-base sm:text-lg px-8 py-4.5 rounded-2xl shadow-xl shadow-rose-900/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                id="go-to-scratch-btn"
              >
                <Gift className="w-5 h-5 text-white animate-bounce" />
                <span>DESCOBRIR MEU DESCONTO NA RASPADINHA »</span>
              </button>

              <div className="pt-2">
                <button
                  onClick={() => {
                    setCurrentStage('diagnostic');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800 underline transition-colors"
                >
                  « Voltar ao Diagnóstico
                </button>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================
            STAGE 6: A RASPADINHA INTERATIVA & A OFERTA DESBLOQUEADA
        ======================================================== */}
        {currentStage === 'scratch' && (
          <div className="max-w-2xl mx-auto w-full py-6 space-y-6 animate-fadeIn">
            {showConfetti && <ConfettiBurst />}

            {/* Card da Raspadinha */}
            <div className="bg-white border-2 border-[#f2deda] rounded-3xl p-6 sm:p-8 text-center shadow-[0_12px_40px_rgba(184,74,86,0.08)]">
              <div className="inline-flex items-center gap-2 bg-[#fdeeed] border border-[#f5ded9] text-[#b84a56] text-xs font-bold px-4 py-1.5 rounded-full mb-3 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-[#b84a56]" />
                <span>BENEFÍCIO EXCLUSIVO DESBLOQUEADO</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">
                Descubra Seu Desconto Exclusivo
              </h1>

              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-lg mx-auto mb-6">
                Raspe a área abaixo com o dedo ou mouse para revelar seu desconto especial:
              </p>

              {/* Componente Canvas da Raspadinha 100% Funcional */}
              <ScratchCard 
                onReveal={handleRevealCoupon} 
                isRevealed={isScratched} 
                onReset={handleResetScratch}
              />

              <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => {
                    setCurrentStage('diagnostic');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-xs text-slate-500 hover:text-[#b84a56] transition-colors inline-flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Voltar ao Resultado do Diagnóstico</span>
                </button>

                {isScratched && (
                  <button
                    onClick={handleResetScratch}
                    className="text-xs text-[#b84a56] hover:text-[#9f3d4a] transition-colors inline-flex items-center gap-1.5 underline underline-offset-4 cursor-pointer font-semibold"
                    title="Recarregar a camada da raspadinha"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Raspar novamente</span>
                  </button>
                )}
              </div>
            </div>

            {/* Oferta Liberada (Aparece com destaque ao raspar) */}
            {isScratched && (
              <div className="animate-fadeIn space-y-6">
                
                {/* Bloco de Preço e Acesso */}
                {isOfferExpired ? (
                  <div className="bg-white border-2 border-red-300 rounded-3xl p-6 sm:p-8 text-center relative overflow-hidden shadow-xl">
                    <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-xs font-bold px-4 py-1.5 rounded-full mb-4">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <span>CONDIÇÃO DE MOMENTO EXPIRADA NESTE NAVEGADOR</span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">
                      O tempo limite para esta sessão encerrou.
                    </h3>

                    <p className="text-slate-600 text-xs sm:text-sm max-w-lg mx-auto mb-6 leading-relaxed">
                      O acesso ao Agenda Master retornou ao seu valor regular de tabela.
                    </p>

                    <div className="bg-[#faf5f3] border border-[#eedad5] rounded-2xl p-4 max-w-sm mx-auto mb-6">
                      <span className="text-xs text-slate-500 block mb-1">Valor de Tabela Regular</span>
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-3xl font-black text-slate-900">R$ 299,90</span>
                      </div>
                      <span className="text-xs text-slate-500 block mt-0.5">Acesso completo</span>
                    </div>

                    <a
                      href={activeOriginalOfferUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-base sm:text-lg px-8 py-4 rounded-2xl shadow-xl transition-all hover:scale-[1.02] cursor-pointer text-center"
                      id="expired-checkout-cta"
                    >
                      <span>ACESSAR NO VALOR REGULAR (R$ 299,90)</span>
                      <ArrowRight className="w-5 h-5" />
                    </a>

                    {/* Botão de Exceção para Desenvolvedora */}
                    <div className="mt-5 pt-5 border-t border-slate-200 flex flex-col items-center gap-2">
                      <button
                        onClick={handleDevResetOffer}
                        className="inline-flex items-center gap-2 bg-[#fdeeed] hover:bg-[#fae1dc] text-[#b84a56] font-black text-xs sm:text-sm px-6 py-3.5 rounded-2xl border border-[#f5ded9] shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
                        id="dev-bypass-offer-btn"
                      >
                        <Sparkles className="w-4 h-4 text-[#b84a56]" />
                        <span>REATIVAR OFERTA DE 50% (MODO REINICIAR)</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white border-2 border-[#f2deda] rounded-3xl p-6 sm:p-8 text-center relative overflow-hidden shadow-[0_12px_40px_rgba(184,74,86,0.12)]">
                    {/* Dev simulation toggle */}
                    {isDev && (
                      <div className="flex items-center justify-end mb-2">
                        <button
                          onClick={() => setIsOfferExpired(true)}
                          className="text-[10px] text-slate-400 hover:text-[#b84a56] underline"
                          title="Simular visualização da tela quando os 15 minutos expiram"
                        >
                          [Simular tela expirada]
                        </button>
                      </div>
                    )}

                    <div className="inline-flex items-center gap-2 bg-[#fdeeed] border border-[#f5ded9] text-[#b84a56] text-xs font-bold px-4 py-1.5 rounded-full mb-3 uppercase tracking-wider">
                      <AlertTriangle className="w-4 h-4 text-[#b84a56]" />
                      <span>ATENÇÃO: CONDIÇÃO ÚNICA LIBERADA</span>
                    </div>

                    <h2 className="text-xl sm:text-3xl font-black text-slate-900 mb-6 leading-tight max-w-xl mx-auto">
                      Condição exclusiva desbloqueada!<br />
                      <span className="text-[#b84a56] font-extrabold">Aproveite enquanto o cronômetro estiver ativo:</span>
                    </h2>

                    {/* Price Display */}
                    <div className="bg-gradient-to-br from-[#fff7f5] via-white to-[#faebe6] border-2 border-[#eedad5] rounded-3xl p-6 max-w-sm mx-auto mb-4 shadow-md">
                      <span className="text-sm text-slate-400 line-through block mb-1">
                        De R$ 299,90
                      </span>

                      <div className="text-3xl sm:text-4xl font-black text-slate-900 mb-0.5">
                        R$ 149,90
                      </div>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-3">
                        à vista
                      </span>

                      <div className="text-xs text-slate-400 font-semibold mb-2">
                        ou
                      </div>

                      <div className="text-2xl sm:text-3xl font-black text-[#b84a56] mb-3">
                        12x de R$ 12,49
                      </div>

                      <div className="inline-block bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">
                        Você economiza R$ 150,00 garantidos
                      </div>
                    </div>

                    {/* Countdown Timer */}
                    <div className="flex items-center justify-center gap-2 mb-6 text-xs text-slate-600 font-medium">
                      <span className="flex items-center gap-1.5">
                        <Timer className="w-4 h-4 text-[#b84a56] animate-pulse" />
                        <span>Condição disponível por tempo limitado:</span>
                      </span>
                      <CountdownTimer onExpire={() => setIsOfferExpired(true)} />
                    </div>

                    {/* Main CTA */}
                    <a
                      href={activeOfferUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-[#c45663] to-[#b84a56] hover:from-[#b84a56] hover:to-[#9f3d4a] text-white font-black text-base sm:text-lg px-8 py-5 rounded-2xl shadow-xl shadow-rose-900/20 transition-all hover:scale-[1.02] cursor-pointer text-center"
                      id="final-checkout-cta"
                    >
                      <span>QUERO MEU ACESSO COM 50% OFF</span>
                      <ArrowRight className="w-5 h-5 text-rose-200" />
                    </a>

                    {/* Badges de garantia */}
                    <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-slate-500 text-xs">
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>7 dias de garantia</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-[#b84a56]" />
                        <span>Acesso imediato</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1.5">
                        <Lock className="w-4 h-4 text-[#b84a56]" />
                        <span>Pagamento 100% seguro</span>
                      </span>
                    </div>
                  </div>
                )}

                {/* Por que o Agenda Master? */}
                <div className="bg-white border border-[#eedad5] rounded-3xl p-6 sm:p-8 shadow-sm">
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-2 text-center">
                    Por que o Agenda Master?
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 text-center max-w-lg mx-auto mb-6 leading-relaxed">
                    Em vez de usar ferramentas genéricas para fazer tudo manualmente, você tem uma ferramenta criada especificamente para a produção de miolos e papelaria.
                  </p>

                  <div className="space-y-2.5 max-w-md mx-auto">
                    {[
                      'Datas e calendários 100% automáticos',
                      'Projetos e estilos personalizados em tons pastéis',
                      'Blocos numerados com controle rápido',
                      'Liberdade para criar do zero sem Corel ou Excel',
                      'Modelos prontos para guiar e acelerar sua produção'
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-[#fdf8f6] border border-[#f5ded9] rounded-xl text-xs sm:text-sm text-slate-800 font-semibold">
                        <div className="w-2 h-2 rounded-full bg-[#b84a56] shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dúvidas rápidas */}
                <div className="bg-white border border-[#eedad5] rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 text-center mb-6">
                    Ainda está em dúvida?
                  </h3>

                  <div className="space-y-3.5 max-w-lg mx-auto text-left">
                    <div className="bg-[#fdf8f6] border border-[#f5ded9] rounded-2xl p-4.5">
                      <h4 className="text-sm font-bold text-slate-900 mb-1.5">
                        Preciso ter Corel ou Illustrator?
                      </h4>
                      <p className="text-xs sm:text-sm text-[#b84a56] font-bold">
                        Não. O Agenda Master foi feito para dispensar programas complexos e caros.
                      </p>
                    </div>

                    <div className="bg-[#fdf8f6] border border-[#f5ded9] rounded-2xl p-4.5">
                      <h4 className="text-sm font-bold text-slate-900 mb-1.5">
                        Posso criar meu próprio projeto do meu jeito?
                      </h4>
                      <p className="text-xs sm:text-sm text-emerald-700 font-bold">
                        Sim! Você pode personalizar cores, textos, fundos e adicionar seus próprios elementos.
                      </p>
                    </div>

                    <div className="bg-[#fdf8f6] border border-[#f5ded9] rounded-2xl p-4.5">
                      <h4 className="text-sm font-bold text-slate-900 mb-1.5">
                        E se eu não gostar?
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-600 font-medium">
                        Você tem 7 dias de garantia incondicional para testar à vontade.
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* Aviso se ainda não raspou */}
            {!isScratched && (
              <div className="p-4 bg-white border border-[#f2deda] rounded-2xl text-center text-xs text-slate-500 shadow-xs">
                <span>👆 Passe o dedo ou mouse na raspadinha acima para revelar o desconto exclusivo e desbloquear sua condição especial.</span>
              </div>
            )}

          </div>
        )}

      </main>

      {/* ── FOOTER ── */}
      <footer className="border-t border-[#f2deda] bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>Agenda Master • O software definitivo para encadernação e papelaria</span>
          <div className="flex items-center gap-4">
            <span className="hover:text-[#b84a56] cursor-pointer" onClick={() => onNavigate(AppState.LANDING)}>
              Apresentação Geral
            </span>
            <span className="hover:text-[#b84a56] cursor-pointer" onClick={() => onNavigate(AppState.LOGIN)}>
              Área de Membros
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};
