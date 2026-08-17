import React, { useState } from 'react';
import { 
  Sparkles, Globe, Laptop, ArrowRight, CheckCircle2, Heart, 
  ShieldCheck, Settings, Layout, Calendar, BookOpen, 
  Feather, ClipboardList, Check, Download, Lock, LogIn,
  FolderUp, Printer, AlertCircle, XCircle, Wand2, Star,
  HelpCircle, Flower2, Scissors, Smile, Lightbulb, Compass,
  ChevronRight, RefreshCw, FileText, Info, Zap, Monitor,
  Play, Radio, Video, Clock, Timer, Rocket
} from 'lucide-react';
import { AppState } from '../../types';

interface LandingPageProps {
  onNavigate: (state: AppState) => void;
  exeUrl?: string;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, exeUrl }) => {
  const [liveVideoUrl] = useState<string>('https://www.youtube.com/live/FBqMHhpH8pg');

  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return 'https://www.youtube.com/embed/FBqMHhpH8pg';
    if (url.includes('embed/')) return url;
    const liveMatch = url.match(/youtube\.com\/live\/([^?&/]+)/);
    if (liveMatch && liveMatch[1]) return `https://www.youtube.com/embed/${liveMatch[1]}`;
    const vMatch = url.match(/[?&]v=([^&#]+)/);
    if (vMatch && vMatch[1]) return `https://www.youtube.com/embed/${vMatch[1]}`;
    const shortMatch = url.match(/youtu\.be\/([^?&#]+)/);
    if (shortMatch && shortMatch[1]) return `https://www.youtube.com/embed/${shortMatch[1]}`;
    return `https://www.youtube.com/embed/${url}`;
  };

  const scrollToStep = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-orange-50/30 text-stone-800 font-sans antialiased selection:bg-orange-200 selection:text-orange-950 flex flex-col">
      {/* Background Soft Glow - Clean and Non-fatiguing */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-80 bg-gradient-to-b from-orange-100/50 via-amber-50/20 to-transparent blur-3xl pointer-events-none z-0" />

      {/* TOP ANNOUNCEMENT BAR */}
      <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white text-[11px] font-semibold py-2 px-4 text-center shadow-xs flex items-center justify-center gap-2 z-50">
        <Sparkles className="w-3.5 h-3.5 fill-white/80" />
        <span>Feito para <strong>Artesãs, Encadernadoras e Papeleiras</strong> que valorizam tempo, agilidade e independência!</span>
        <Sparkles className="w-3.5 h-3.5 fill-white/80" />
      </div>

      {/* HEADER NAVBAR */}
      <header className="w-full border-b border-orange-100 bg-white/95 backdrop-blur-md sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate(AppState.WELCOME)}>
            <div className="bg-gradient-to-br from-orange-500 to-amber-500 w-9 h-9 rounded-xl flex items-center justify-center shadow-sm">
              <Sparkles className="text-white w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black tracking-tight text-stone-900 leading-none">
                  Agenda Master <span className="text-orange-500">AI</span>
                </span>
                <span className="bg-orange-50 text-orange-700 border border-orange-200 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Artesã v1.1.9
                </span>
              </div>
              <p className="text-[10px] text-stone-500 font-medium">Sua fábrica de miolos e planners em PDF</p>
            </div>
          </div>

          {/* Quick Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-stone-600">
            <button 
              onClick={() => scrollToStep('live-section')} 
              className="hover:text-orange-600 transition-colors cursor-pointer flex items-center gap-1.5 text-orange-600 font-extrabold"
            >
              <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
              Live Tira-Dúvidas
            </button>
            <button 
              onClick={() => scrollToStep('step-1')} 
              className="hover:text-orange-600 transition-colors cursor-pointer"
            >
              1. Acesso
            </button>
            <button 
              onClick={() => scrollToStep('step-2')} 
              className="hover:text-orange-600 transition-colors cursor-pointer"
            >
              2. Miolos
            </button>
            <button 
              onClick={() => scrollToStep('step-3')} 
              className="hover:text-orange-600 transition-colors cursor-pointer"
            >
              3. Automação
            </button>
            <button 
              onClick={() => scrollToStep('step-4')} 
              className="hover:text-orange-600 transition-colors cursor-pointer"
            >
              4. Impressão
            </button>
          </nav>

          {/* Action Header Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => onNavigate(AppState.LOGIN)}
              className="text-xs font-bold text-stone-700 hover:text-orange-600 bg-stone-100 hover:bg-orange-50 border border-stone-200 px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-orange-500" />
              <span>Entrar</span>
            </button>

            <button
              onClick={() => onNavigate(AppState.DASHBOARD)}
              className="text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 px-4 py-2 rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Criar Meu Miolo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION - CLEAN, FAST, ORANGE PALETTE */}
      <section className="relative pt-12 pb-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full text-center z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-100/80 border border-orange-200 text-orange-800 text-xs font-bold tracking-wide mb-6 shadow-2xs">
          <Rocket className="w-3.5 h-3.5 text-orange-600" />
          <span>PRODUÇÃO ULTRARRÁPIDA PARA O SEU ATELIÊ</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-stone-900 tracking-tight max-w-4xl mx-auto leading-tight">
          Crie Miolos Exclusivos de Agendas e Planners <span className="text-orange-500">em Minutos</span>
        </h1>

        <p className="mt-4 text-sm sm:text-base text-stone-600 max-w-2xl mx-auto font-normal leading-relaxed">
          Chega de perder horas em planilhas ou softwares complexos. O <strong>Agenda Master AI</strong> gera miolos completos e arquivos de impressão de alta resolução na velocidade que o seu ateliê precisa.
        </p>

        {/* 4 ITENS ABAIXO DO SUBTÍTULO: FOCADOS EM AGILIDADE DO PRODUTO */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto text-left">
          {/* Item 1: Agilidade Máxima */}
          <div className="bg-white border border-orange-100/80 p-3.5 rounded-2xl shadow-2xs flex items-center gap-3">
            <div className="bg-orange-50 p-2.5 rounded-xl text-orange-600">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-900">Agilidade Total</p>
              <p className="text-[10px] text-stone-500">Miolo anual pronto em segundos</p>
            </div>
          </div>

          {/* Item 2: Datas Automáticas */}
          <div className="bg-white border border-orange-100/80 p-3.5 rounded-2xl shadow-2xs flex items-center gap-3">
            <div className="bg-orange-50 p-2.5 rounded-xl text-orange-600">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-900">Geração Instantânea</p>
              <p className="text-[10px] text-stone-500">Calendários e datas em 1 clique</p>
            </div>
          </div>

          {/* Item 3: Sem Softwares Pesados */}
          <div className="bg-white border border-orange-100/80 p-3.5 rounded-2xl shadow-2xs flex items-center gap-3">
            <div className="bg-orange-50 p-2.5 rounded-xl text-orange-600">
              <Timer className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-900">Economia de Tempo</p>
              <p className="text-[10px] text-stone-500">Produza 10x mais rápido</p>
            </div>
          </div>

          {/* Item 4: PDF Pronto para Impressão */}
          <div className="bg-white border border-orange-100/80 p-3.5 rounded-2xl shadow-2xs flex items-center gap-3">
            <div className="bg-orange-50 p-2.5 rounded-xl text-orange-600">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-900">PDF Vetorial HD</p>
              <p className="text-[10px] text-stone-500">Exportação limpa e imediata</p>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO LIVE TIRA-DÚVIDAS */}
      <section id="live-section" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full my-6">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-orange-200/80 shadow-sm relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-stone-100">
            <div className="space-y-1.5 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-600 text-xs font-extrabold tracking-wide">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <Radio className="w-3.5 h-3.5 text-red-500" />
                <span>ESPAÇO AO VIVO</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-stone-900">
                Live Tira-Dúvidas com a Professora
              </h2>
              <p className="text-xs text-stone-600 max-w-lg">
                Assista às aulas práticas, tire dúvidas em tempo real e aprenda a dominar a criação de miolos para faturar no seu ateliê.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-stone-500 bg-stone-100 px-3 py-1.5 rounded-xl border border-stone-200">
                Transmissão Oficial
              </span>
            </div>
          </div>

          {/* Video Player / Live Screen Area */}
          <div className="mt-6">
            <div className="relative w-full aspect-video bg-stone-900 rounded-2xl overflow-hidden shadow-md border border-orange-200 flex items-center justify-center">
              <iframe 
                className="w-full h-full"
                src={getYouTubeEmbedUrl(liveVideoUrl)}
                title="Agenda Master AI - Vídeo Demonstrativo"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-stone-500 px-1">
              <span className="flex items-center gap-1.5 font-medium text-orange-700">
                <Video className="w-4 h-4 text-orange-600" />
                Demonstração prática ao vivo e tira-dúvidas
              </span>
              <a 
                href={liveVideoUrl} 
                target="_blank" 
                rel="noreferrer" 
                className="text-stone-600 hover:text-orange-600 font-bold underline transition-colors"
              >
                Assistir diretamente no YouTube ↗
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* DORES DIÁRIAS ATUALIZADAS: CLEAN & DIRETO */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full my-8">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-orange-100 shadow-sm">
          
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-[11px] font-bold text-orange-600 uppercase tracking-wider bg-orange-50 border border-orange-200 px-3 py-1 rounded-full">
              VOCÊ SE IDENTIFICA COM ISSO?
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 mt-3">
              Dores Diárias no Ateliê de Encadernação
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-2">
              Se você passa por essas dificuldades técnicas, o Agenda Master AI foi criado exatamente para você.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {/* DOR 1: Não sei fazer planilha de dados */}
            <div className="bg-orange-50/40 p-5 rounded-2xl border border-orange-100 space-y-2.5">
              <div className="flex items-center gap-2.5 text-stone-900 font-bold text-sm">
                <div className="p-1.5 bg-orange-100 text-orange-700 rounded-lg">
                  <XCircle className="w-4 h-4" />
                </div>
                <span>"Não sei fazer planilha de dados"</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                Ter que criar tabelas gigantescas no Excel cheias de colunas de datas, dias da semana e feriados consome um tempo enorme e gera dor de cabeça.
              </p>
              <div className="bg-white p-3 rounded-xl border border-orange-200/80 text-xs text-orange-950 font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0" />
                <span><strong>No Agenda Master:</strong> Todas as datas e calendários são gerados automaticamente sem planilhas!</span>
              </div>
            </div>

            {/* DOR 2: Minha mesclagem sempre dá errado */}
            <div className="bg-orange-50/40 p-5 rounded-2xl border border-orange-100 space-y-2.5">
              <div className="flex items-center gap-2.5 text-stone-900 font-bold text-sm">
                <div className="p-1.5 bg-orange-100 text-orange-700 rounded-lg">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <span>"Minha mesclagem sempre dá errado"</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                Tentar importar dados e mesclar no Word ou em softwares gráficos frequentemente desconfigura as páginas, pula dias ou gera erros no miolo todo.
              </p>
              <div className="bg-white p-3 rounded-xl border border-orange-200/80 text-xs text-orange-950 font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0" />
                <span><strong>No Agenda Master:</strong> O motor de IA monta as páginas perfeitamente alinhadas, com 100% de precisão!</span>
              </div>
            </div>

            {/* DOR 3: Não tenho Corel Draw nem InDesign */}
            <div className="bg-orange-50/40 p-5 rounded-2xl border border-orange-100 space-y-2.5 md:col-span-2">
              <div className="flex items-center gap-2.5 text-stone-900 font-bold text-sm">
                <div className="p-1.5 bg-orange-100 text-orange-700 rounded-lg">
                  <XCircle className="w-4 h-4" />
                </div>
                <span>"Não tenho Corel Draw nem InDesign"</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                Softwares profissionais de design são extremamente caros, exigem assinaturas pesadas e são muito difíceis de aprender a usar no dia a dia.
              </p>
              <div className="bg-white p-3 rounded-xl border border-orange-200/80 text-xs text-orange-950 font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0" />
                <span><strong>No Agenda Master:</strong> Você cria miolos profissionais direto no navegador ou no computador, de forma 100% visual e descomplicada.</span>
              </div>
            </div>
          </div>

          <div className="text-center mt-8">
            <button
              onClick={() => onNavigate(AppState.INITIAL_SETUP)}
              className="py-3.5 px-8 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-md shadow-orange-500/20 transition-all cursor-pointer inline-flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 fill-white" />
              <span>Quero Criar Meus Miolos Sem Dificuldade</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </section>

      {/* STEP DETAILED CONTENT SHOWCASE - CLEAN ORANGE THEME */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 pb-16 space-y-6 sm:space-y-8">
        <div className="text-center pt-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-orange-700 bg-orange-100 px-3.5 py-1 rounded-full border border-orange-200">
            PASSO A PASSO ILUSTRADO DO SISTEMA
          </span>
          <h3 className="text-xl sm:text-3xl font-black text-stone-900 mt-2.5">Como Funciona na Prática</h3>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-xl mx-auto">
            Veja como é simples e intuitivo criar os seus miolos de papelaria em apenas 4 passos descomplicados.
          </p>
        </div>

        {/* =========================================================================
            PASSO 1: COMO ACESSAR (Web vs .EXE)
           ========================================================================= */}
        <div id="step-1">
          <div className="bg-white border border-orange-100 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
            <div className="flex flex-col lg:flex-row gap-8 items-center">
              
              {/* Left Info Column */}
              <div className="lg:w-5/12 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-[11px] font-bold uppercase tracking-wider">
                  <Globe className="w-3.5 h-3.5 text-orange-500" />
                  <span>Passo 1 • Acesso Descomplicado</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight leading-tight">
                  Escolha Como Usar no Ateliê
                </h2>

                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  Acesse 100% online direto pelo navegador sem instalar nada, ou utilize nosso aplicativo leve para Windows (.EXE) para produção em alta velocidade.
                </p>

                <div className="pt-2">
                  <button
                    onClick={() => onNavigate(AppState.LOGIN)}
                    className="w-full sm:w-auto py-3 px-6 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-white" />
                    <span>Quero Adquirir o Meu Acesso</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Right Interface Mockup */}
              <div className="lg:w-7/12 w-full bg-stone-50 rounded-2xl p-4 text-stone-800 border border-stone-200 shadow-2xs">
                <div className="text-center space-y-3">
                  <span className="inline-block bg-orange-100 text-orange-800 border border-orange-200 text-[10px] font-extrabold px-3 py-0.5 rounded-full uppercase">
                    MODO DE ACESSO
                  </span>

                  <h3 className="text-base font-extrabold text-stone-900">
                    Navegador Web ou Aplicativo Windows
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left pt-1">
                    {/* Card 1 - Navegador */}
                    <div className="bg-white border border-stone-200 rounded-xl p-3 flex flex-col justify-between space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
                          <Globe className="w-4 h-4" />
                        </div>
                        <span className="text-[8px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">SEM INSTALAÇÃO</span>
                      </div>
                      <h4 className="text-xs font-bold text-stone-900">No Navegador Web</h4>
                      <p className="text-[10px] text-stone-500">Acesse de qualquer computador. Direto e leve sem ocupar espaço no HD.</p>
                      <button 
                        onClick={() => onNavigate(AppState.LOGIN)}
                        className="w-full py-1.5 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-[9px] rounded-lg uppercase cursor-pointer transition-colors"
                      >
                        ACESSAR NO NAVEGADOR
                      </button>
                    </div>

                    {/* Card 2 - Computador (.EXE) */}
                    <div className="bg-white border border-stone-200 rounded-xl p-3 flex flex-col justify-between space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
                          <Laptop className="w-4 h-4" />
                        </div>
                        <span className="text-[8px] font-bold bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full border border-orange-200">ALTA PERFORMANCE</span>
                      </div>
                      <h4 className="text-xs font-bold text-stone-900">Programa Windows (.EXE)</h4>
                      <p className="text-[10px] text-stone-500">Aplicativo nativo otimizado para exportar PDFs pesados com velocidade máxima.</p>
                      <a 
                        href={exeUrl || 'https://github.com/luizalacerdapapelaria-hue/AGENDAMASTER/releases/download/v1.1.9/Agenda.Master.Setup.1.1.9.exe'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-[9px] rounded-lg uppercase cursor-pointer text-center block transition-colors"
                      >
                        INSTALAR NO COMPUTADOR (.EXE)
                      </a>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* =========================================================================
            PASSO 2: O QUE CRIAR HOJE (4 Tipos de Miolos)
           ========================================================================= */}
        <div id="step-2">
          <div className="bg-white border border-orange-100 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
            <div className="flex flex-col lg:flex-row gap-8 items-center">
              
              {/* Left Info Column */}
              <div className="lg:w-5/12 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-[11px] font-bold uppercase tracking-wider">
                  <Layout className="w-3.5 h-3.5 text-orange-500" />
                  <span>Passo 2 • Variedade no Ateliê</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight leading-tight">
                  Projetos Mais Vendidos da Papelaria
                </h2>

                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  Crie agendas diárias, planners semanais, cadernos pautados/pontilhados e devocionais bíblicos com personalização total.
                </p>

                <div className="pt-2">
                  <button
                    onClick={() => onNavigate(AppState.LOGIN)}
                    className="w-full sm:w-auto py-3 px-6 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-white" />
                    <span>Quero Adquirir o Meu Acesso</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Right Interface Mockup */}
              <div className="lg:w-7/12 w-full bg-stone-50 rounded-2xl p-4 text-stone-900 border border-stone-200 shadow-2xs">
                <div className="text-center space-y-3">
                  <h3 className="text-xs font-black text-stone-900 uppercase tracking-wider">
                    SELECIONE O TIPO DE PROJETO
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                    {/* Agenda */}
                    <div className="bg-white border border-stone-200 p-3 rounded-xl flex flex-col items-center justify-between space-y-1">
                      <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <h4 className="text-xs font-bold text-stone-900">Agenda</h4>
                      <span className="text-[9px] text-stone-500">1 ou 2 Dias/Pág</span>
                    </div>

                    {/* Planner */}
                    <div className="bg-white border border-stone-200 p-3 rounded-xl flex flex-col items-center justify-between space-y-1">
                      <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <h4 className="text-xs font-bold text-stone-900">Planner</h4>
                      <span className="text-[9px] text-stone-500">Visão Semanal</span>
                    </div>

                    {/* Caderno */}
                    <div className="bg-white border border-stone-200 p-3 rounded-xl flex flex-col items-center justify-between space-y-1">
                      <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                        <Feather className="w-4 h-4" />
                      </div>
                      <h4 className="text-xs font-bold text-stone-900">Caderno</h4>
                      <span className="text-[9px] text-stone-500">Pautado/Pontilhado</span>
                    </div>

                    {/* Devocional */}
                    <div className="bg-white border border-stone-200 p-3 rounded-xl flex flex-col items-center justify-between space-y-1">
                      <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                        <ClipboardList className="w-4 h-4" />
                      </div>
                      <h4 className="text-xs font-bold text-stone-900">Devocional</h4>
                      <span className="text-[9px] text-stone-500">Estudo Bíblico</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* =========================================================================
            PASSO 3: CONFIGURAÇÃO AUTOMÁTICA (Sem Planilhas)
           ========================================================================= */}
        <div id="step-3">
          <div className="bg-white border border-orange-100 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
            <div className="flex flex-col lg:flex-row gap-8 items-center">
              
              {/* Left Info Column */}
              <div className="lg:w-5/12 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-[11px] font-bold uppercase tracking-wider">
                  <Settings className="w-3.5 h-3.5 text-orange-600" />
                  <span>Passo 3 • Automação Inteligente</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight leading-tight">
                  Sem Planilhas no Excel
                </h2>

                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  Defina o ano desejado e o sistema gera automaticamente todos os dias da semana, feriados nacionais, municipais e alinhamentos de página.
                </p>

                <div className="pt-2">
                  <button
                    onClick={() => onNavigate(AppState.LOGIN)}
                    className="w-full sm:w-auto py-3 px-6 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-white" />
                    <span>Quero Adquirir o Meu Acesso</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Right Interface Mockup */}
              <div className="lg:w-7/12 w-full bg-stone-50 rounded-2xl p-4 text-stone-900 border border-stone-200 shadow-2xs">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-white p-3 rounded-xl border border-stone-200">
                    <span className="text-[10px] font-bold text-orange-600 block mb-1">DATA E ANO</span>
                    <p className="font-extrabold text-stone-900">Ano Automático</p>
                    <p className="text-[10px] text-stone-500 mt-0.5">2025, 2026, 2027 até janeiro de 2028 inclusos.</p>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-stone-200">
                    <span className="text-[10px] font-bold text-orange-600 block mb-1">AGILIDADE</span>
                    <p className="font-extrabold text-stone-900">Geração Completa</p>
                    <p className="text-[10px] text-stone-500 mt-0.5">Miolo montado com precisão e rapidez.</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* =========================================================================
            PASSO 4: EDITOR & EXPORTAÇÃO PDF HD (PDF de Gráfica)
           ========================================================================= */}
        <div id="step-4">
          <div className="bg-white border border-orange-100 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
            <div className="flex flex-col lg:flex-row gap-8 items-center">
              
              {/* Left Info Column */}
              <div className="lg:w-5/12 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-[11px] font-bold uppercase tracking-wider">
                  <Printer className="w-3.5 h-3.5 text-orange-600" />
                  <span>Passo 4 • PDF Vetorial Perfeito</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight leading-tight">
                  Editor Visual & Exportação PDF
                </h2>

                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  Ajuste páginas pares e ímpares, adicione elementos decorativos e baixe o PDF pronto para impressão na sua impressora.
                </p>

                <div className="pt-2">
                  <button
                    onClick={() => onNavigate(AppState.LOGIN)}
                    className="w-full sm:w-auto py-3 px-6 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-white" />
                    <span>Quero Adquirir o Meu Acesso</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Right Interface Mockup */}
              <div className="lg:w-7/12 w-full bg-stone-50 rounded-2xl p-4 text-stone-900 border border-stone-200 shadow-2xs">
                <div className="bg-white p-3 rounded-xl border border-stone-200 text-center space-y-2">
                  <div className="inline-flex items-center gap-1.5 bg-orange-100 text-orange-800 text-[10px] font-extrabold px-3 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5 text-orange-600" /> PDF VETORIAL EM ALTA DEFINIÇÃO
                  </div>
                  <h4 className="text-xs font-extrabold text-stone-900">Impressão Limpa e Nítida</h4>
                  <p className="text-[10px] text-stone-500 max-w-sm mx-auto">
                    Exportação otimizada sem borrões em linhas finas e com alinhamento perfeito de frente e verso.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>

      </main>

      {/* 7-DAY MONEY BACK GUARANTEE SECTION */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full my-6">
        <div className="bg-white border-2 border-orange-200/90 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8">
            {/* Guarantee Emblem */}
            <div className="shrink-0 flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-orange-400 via-amber-400 to-yellow-300 p-1 shadow-md relative flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-white flex flex-col items-center justify-center p-3 border border-orange-200 text-center">
                  <ShieldCheck className="w-7 h-7 text-orange-500 mb-0.5" />
                  <span className="text-lg sm:text-xl font-black text-orange-600 leading-none">7 DIAS</span>
                  <span className="text-[8px] font-extrabold text-stone-700 tracking-wider uppercase mt-0.5">DE GARANTIA</span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-orange-800 bg-orange-50 border border-orange-200 px-3 py-0.5 rounded-full mt-2.5">
                RISCO ZERO PARA VOCÊ
              </span>
            </div>

            {/* Guarantee Content */}
            <div className="space-y-2.5 text-center md:text-left flex-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 border border-orange-200 text-orange-900 text-xs font-bold uppercase tracking-wider">
                <Heart className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
                <span>Sua Satisfação em Primeiro Lugar</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight leading-snug">
                Garantia Incondicional de 7 Dias de Satisfação
              </h3>

              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
                Você pode adquirir o seu acesso ao <strong>Agenda Master AI</strong> com tranquilidade absoluta. Experimente todas as ferramentas, crie seus miolos e teste os arquivos no seu ateliê por 7 dias inteiros. Se achar que não atendeu às suas expectativas, devolvemos <strong>100% do seu dinheiro</strong>!
              </p>

              <div className="pt-1 flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={() => onNavigate(AppState.LOGIN)}
                  className="w-full sm:w-auto py-3 px-6 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Quero Adquirir com 7 Dias de Garantia</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FREQUENTLY ASKED QUESTIONS */}
      <section className="bg-white border-t border-orange-100 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-1.5">
            <span className="text-[10px] font-bold text-orange-700 bg-orange-100 px-3 py-1 rounded-full uppercase tracking-wider">
              DÚVIDAS FREQUENTES
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900">
              Perguntas & Respostas
            </h2>
            <p className="text-xs text-stone-500">
              Tudo o que você precisa saber para transformar o fluxo de trabalho do seu ateliê.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-1.5">
              <h4 className="font-extrabold text-stone-900 flex items-center gap-1.5 text-xs">
                <HelpCircle className="w-4 h-4 text-orange-500" />
                <span>Preciso saber usar Corel, Photoshop ou InDesign?</span>
              </h4>
              <p className="text-stone-600 leading-relaxed text-[11px]">
                Não! O Agenda Master AI foi criado exatamente para que você não precise de nenhum software pesado ou complexo. Tudo é feito em cliques simples e visuais.
              </p>
            </div>

            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-1.5">
              <h4 className="font-extrabold text-stone-900 flex items-center gap-1.5 text-xs">
                <ShieldCheck className="w-4 h-4 text-orange-500" />
                <span>Como funciona a garantia de 7 dias?</span>
              </h4>
              <p className="text-stone-600 leading-relaxed text-[11px]">
                Sua compra é 100% segura. Teste o Agenda Master AI por até 7 dias no seu ateliê. Se por qualquer motivo você não se adaptar, basta solicitar o reembolso que devolvemos 100% do seu dinheiro.
              </p>
            </div>

            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-1.5">
              <h4 className="font-extrabold text-stone-900 flex items-center gap-1.5 text-xs">
                <Zap className="w-4 h-4 text-orange-500" />
                <span>O sistema é realmente rápido?</span>
              </h4>
              <p className="text-stone-600 leading-relaxed text-[11px]">
                Sim! Você seleciona o tipo de projeto, define o ano e o miolo inteiro com todas as páginas é construído em poucos instantes, pronto para imprimir.
              </p>
            </div>

            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-1.5">
              <h4 className="font-extrabold text-stone-900 flex items-center gap-1.5 text-xs">
                <Calendar className="w-4 h-4 text-orange-500" />
                <span>Posso gerar agendas para qualquer ano?</span>
              </h4>
              <p className="text-stone-600 leading-relaxed text-[11px]">
                Não para qualquer ano arbitrário. O Agenda Master funciona no modelo de <strong>assinatura anual</strong> e permite que você gere agendas e planners completos até <strong>janeiro de 2028</strong> (cobrindo 2025, 2026, 2027 e início de 2028). Conforme as atualizações anuais são lançadas, novos anos e calendários continuam sendo disponibilizados.
              </p>
            </div>

            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-1.5 md:col-span-2">
              <h4 className="font-extrabold text-stone-900 flex items-center gap-1.5 text-xs">
                <Printer className="w-4 h-4 text-orange-500" />
                <span>O arquivo baixado é compatível com minha impressora?</span>
              </h4>
              <p className="text-stone-600 leading-relaxed text-[11px]">
                Sim! O arquivo é exportado em PDF Vetorial de alta definição, pronto para imprimir em impressoras jato de tinta ou laser (Epson, Canon, HP, Brother).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-gradient-to-r from-orange-500 to-amber-500 text-white py-10 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
        <div className="max-w-3xl mx-auto space-y-4 relative z-10">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center mx-auto border border-white/30 shadow-xs">
            <Sparkles className="w-5 h-5 fill-white text-white" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            Pronta para Ter Sua Própria Fábrica de Miolos Exclusivos?
          </h2>

          <p className="text-xs sm:text-sm text-orange-100 max-w-xl mx-auto font-normal leading-relaxed">
            Economize tempo, evite desperdícios de papel e encante suas clientes com produtos 100% personalizados feitos por você.
          </p>

          <div className="pt-1 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onNavigate(AppState.LOGIN)}
              className="w-full sm:w-auto py-3.5 px-8 bg-white hover:bg-stone-100 text-orange-600 font-extrabold text-xs sm:text-sm rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-orange-500" />
              <span>Quero Adquirir o Meu Acesso</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full bg-stone-900 text-stone-400 text-xs py-5 px-4 sm:px-6 lg:px-8 border-t border-stone-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-orange-500 to-amber-500 w-6 h-6 rounded-lg flex items-center justify-center">
              <Sparkles className="text-white w-3.5 h-3.5" />
            </div>
            <span className="font-extrabold text-white">Agenda Master AI</span>
            <span className="text-[10px] text-stone-500">• Papelaria Artesanal & Encadernação</span>
          </div>

          <p className="text-[10px] text-stone-500">
            © 2026 Agenda Master AI. Feito com carinho para criadoras de papelaria personalizada.
          </p>
        </div>
      </footer>
    </div>
  );
};
