import React from 'react';
import { 
  Sparkles, ArrowRight, Check, X, 
  Layers, Palette, Layout, FileText, 
  Printer, ShieldCheck, Download, LogIn,
  Sliders, Calendar, CheckCircle2,
  ExternalLink, RefreshCw, Zap,
  Play, Video, BookOpen, Hash, Columns, Grid,
  Laptop, Smartphone, Cloud, Headphones, Lock,
  ListOrdered
} from 'lucide-react';
import { AppState } from '../../types';

interface LandingPageProps {
  onNavigate: (state: AppState) => void;
  exeUrl?: string;
  checkoutUrl?: string;
  originalOfferUrl?: string;
}

export const LandingPage: React.FC<LandingPageProps> = ({ 
  onNavigate, 
  exeUrl,
  checkoutUrl = 'https://pay.herospark.com/agenda-master-545764',
  originalOfferUrl = 'https://pay.herospark.com/agenda-master-523399'
}) => {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#faf6f4] via-[#fffbf9] to-[#f9f1ee] text-slate-800 font-sans antialiased selection:bg-[#fcedea] selection:text-[#9f3d4a] flex flex-col">
      
      {/* ── HEADER NAVBAR ── */}
      <header className="w-full border-b border-[#f2deda] bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <div 
            className="flex items-center gap-2.5 cursor-pointer select-none" 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            id="landing-logo-btn"
          >
            <div className="bg-[#fdeeed] border border-[#f5ded9] w-9 h-9 rounded-xl flex items-center justify-center shadow-xs">
              <Sparkles className="text-[#b84a56] w-5 h-5" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tight text-slate-900">
                Agenda <span className="text-[#b84a56]">Master</span>
              </span>
              <span className="bg-[#fcedea] text-[#9f3d4a] border border-[#f8d4ce] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                v2.0.3
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate(AppState.LOGIN)}
              className="text-slate-600 hover:text-slate-900 text-xs font-semibold px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors flex items-center gap-1.5"
              id="landing-login-btn"
            >
              <LogIn className="w-3.5 h-3.5 text-[#b84a56]" />
              <span>Entrar</span>
            </button>
            <a
              href={checkoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-[#c45663] to-[#b84a56] hover:from-[#b84a56] hover:to-[#9f3d4a] text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md shadow-rose-900/15 transition-all flex items-center gap-1.5 active:scale-95"
              id="landing-header-checkout-btn"
            >
              <span>Garantir Acesso</span>
              <ArrowRight className="w-3.5 h-3.5 text-rose-200" />
            </a>
          </div>

        </div>
      </header>

      {/* ── 1. HERO: VENDA A TRANSFORMAÇÃO ── */}
      <section className="pt-12 pb-16 md:pt-20 md:pb-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full text-center">
        
        {/* Core Tagline Badge */}
        <div className="inline-flex items-center gap-2 bg-[#fdeeed] border border-[#f5ded9] text-[#9f3d4a] text-xs font-bold px-4 py-1.5 rounded-full mb-6 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-[#b84a56]" />
          <span>Pare de montar agendas. Comece a personalizá-las.</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.12] max-w-4xl mx-auto mb-6">
          Crie agendas e planners incríveis <span className="text-[#b84a56]">sem Corel, InDesign ou Excel</span>.
        </h1>

        {/* Subhead */}
        <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed mb-8 font-normal">
          Personalize capas, miolos pastéis, páginas mensais, divisórias e fundos da sua agenda em poucos cliques — e gere o PDF pronto para imprimir.
        </p>

        {/* Hero CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-12">
          <a
            href={checkoutUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto bg-gradient-to-r from-[#c45663] to-[#b84a56] hover:from-[#b84a56] hover:to-[#9f3d4a] text-white text-base font-extrabold px-8 py-4 rounded-2xl shadow-lg shadow-rose-900/15 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95"
            id="hero-primary-cta"
          >
            <span>QUERO MEU ACESSO AO AGENDA MASTER</span>
            <ArrowRight className="w-4 h-4 text-rose-200" />
          </a>
        </div>

        {/* ── VÍDEO DEMONSTRAÇÃO DO SISTEMA FUNCIONANDO ── */}
        <div className="bg-white border-2 border-[#eedad5] rounded-3xl shadow-xl overflow-hidden max-w-4xl mx-auto text-left transform-gpu">
          <div className="bg-[#faf5f3] text-slate-600 px-4 py-3 border-b border-[#eedad5] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
              <span className="ml-2 font-mono text-[11px] text-slate-500">Demonstração Prática • Agenda Master em Ação</span>
            </div>
            <a 
              href="https://www.youtube.com/watch?v=FBqMHhpH8pg"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-semibold text-[#b84a56] hover:underline flex items-center gap-1 transition-colors"
              title="Assistir diretamente no YouTube em alta definição"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Abrir no YouTube</span>
            </a>
          </div>
          
          <div className="relative w-full aspect-video bg-black overflow-hidden transform-gpu will-change-transform">
            <iframe
              src="https://www.youtube-nocookie.com/embed/FBqMHhpH8pg?autoplay=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1"
              title="Demonstração do Agenda Master"
              className="w-full h-full border-0 transform-gpu will-change-transform"
              loading="eager"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>

          <div className="p-4 bg-[#faf5f3] text-slate-600 text-xs flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#eedad5]">
            <div className="flex items-center gap-2 text-slate-600">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Veja como gerar centenas de páginas personalizadas e prontas para impressão em segundos.</span>
            </div>
            <a
              href={checkoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#b84a56] hover:text-[#9f3d4a] text-xs font-bold flex items-center gap-1 shrink-0"
            >
              <span>Garantir meu acesso agora</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

      </section>

      {/* ── 1.5. O QUE VOCÊ PODE CRIAR COM O AGENDA MASTER ── */}
      <section className="py-16 md:py-20 bg-white/60 px-4 sm:px-6 lg:px-8 border-y border-[#eedad5]" id="produtos-section">
        <div className="max-w-6xl mx-auto w-full">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-black uppercase tracking-widest text-[#9f3d4a] bg-[#fcedea] px-3.5 py-1 rounded-full inline-block mb-3 border border-[#f8d4ce]">
              Versatilidade Total
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-3">
              O que você cria em segundos:
            </h2>
            <p className="text-slate-600 text-sm sm:text-base font-medium">
              Arquivos completos em PDF 300 DPI, prontos para imprimir e encadernar sem Corel, InDesign ou Excel.
            </p>
          </div>

          {/* 4 Impactful Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            
            {/* 1. AGENDAS */}
            <div className="bg-white border-2 border-[#eedad5] hover:border-[#b84a56] rounded-3xl p-6 sm:p-7 shadow-xs hover:shadow-lg transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-[#fdeeed] text-[#b84a56] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Calendar className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-black uppercase tracking-wider text-[#9f3d4a] bg-[#fcedea] border border-[#f8d4ce] px-3 py-1 rounded-full">
                  Datadas & Permanentes
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-4">
                Agendas Personalizadas
              </h3>

              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5 text-sm text-slate-700 font-bold bg-[#faf5f3] p-3 rounded-2xl border border-[#f2deda]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#b84a56] shrink-0" />
                  <span>1 Dia por Página (1 DPP)</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-slate-700 font-bold bg-[#faf5f3] p-3 rounded-2xl border border-[#f2deda]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#b84a56] shrink-0" />
                  <span>2 Dias por Página (2 DPP)</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-slate-700 font-bold bg-[#faf5f3] p-3 rounded-2xl border border-[#f2deda]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#b84a56] shrink-0" />
                  <span>1 DPP com Finais de Semana Compartilhados (Sábado e Domingo juntos)</span>
                </div>
              </div>
            </div>

            {/* 2. PLANNERS */}
            <div className="bg-white border-2 border-[#eedad5] hover:border-[#b84a56] rounded-3xl p-6 sm:p-7 shadow-xs hover:shadow-lg transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-[#fdeeed] text-[#b84a56] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <BookOpen className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-black uppercase tracking-wider text-[#9f3d4a] bg-[#fcedea] border border-[#f8d4ce] px-3 py-1 rounded-full">
                  Semanais & Diários
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-4">
                Planners Completos
              </h3>

              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5 text-sm text-slate-700 font-bold bg-[#faf5f3] p-3 rounded-2xl border border-[#f2deda]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#b84a56] shrink-0" />
                  <span>Layouts Semanais Horizontais</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-slate-700 font-bold bg-[#faf5f3] p-3 rounded-2xl border border-[#f2deda]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#b84a56] shrink-0" />
                  <span>Layouts Semanais Verticais</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-slate-700 font-bold bg-[#faf5f3] p-3 rounded-2xl border border-[#f2deda]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#b84a56] shrink-0" />
                  <span>Visão Mensal e Financeiro</span>
                </div>
              </div>
            </div>

            {/* 3. CADERNOS */}
            <div className="bg-white border-2 border-[#eedad5] hover:border-[#b84a56] rounded-3xl p-6 sm:p-7 shadow-xs hover:shadow-lg transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-[#fdeeed] text-[#b84a56] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <FileText className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-black uppercase tracking-wider text-[#9f3d4a] bg-[#fcedea] border border-[#f8d4ce] px-3 py-1 rounded-full">
                  Personalizáveis
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-4">
                Cadernos Personalizados
              </h3>

              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5 text-sm text-slate-700 font-bold bg-[#faf5f3] p-3 rounded-2xl border border-[#f2deda]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#b84a56] shrink-0" />
                  <span>Cadernos Pautados</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-slate-700 font-bold bg-[#faf5f3] p-3 rounded-2xl border border-[#f2deda]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#b84a56] shrink-0" />
                  <span>Cadernos Pontilhados (Bullet Journal)</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-slate-700 font-bold bg-[#faf5f3] p-3 rounded-2xl border border-[#f2deda]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#b84a56] shrink-0" />
                  <span>Cadernos Quadriculados e Lisos</span>
                </div>
              </div>
            </div>

            {/* 4. BLOCOS & RIFAS */}
            <div className="bg-white border-2 border-[#eedad5] hover:border-[#b84a56] rounded-3xl p-6 sm:p-7 shadow-xs hover:shadow-lg transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-[#fdeeed] text-[#b84a56] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Hash className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-black uppercase tracking-wider text-[#9f3d4a] bg-[#fcedea] border border-[#f8d4ce] px-3 py-1 rounded-full">
                  Em Sequência
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-4">
                Blocos & Rifas com Numeração
              </h3>

              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5 text-sm text-slate-700 font-bold bg-[#faf5f3] p-3 rounded-2xl border border-[#f2deda]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#b84a56] shrink-0" />
                  <span>Numeração Sequencial Automática (001 a 1000)</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-slate-700 font-bold bg-[#faf5f3] p-3 rounded-2xl border border-[#f2deda]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#b84a56] shrink-0" />
                  <span>Blocos de Pedidos, Comandas e Recibos</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-slate-700 font-bold bg-[#faf5f3] p-3 rounded-2xl border border-[#f2deda]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#b84a56] shrink-0" />
                  <span>Rifas e Ingressos com Canhoto</span>
                </div>
              </div>
            </div>

          </div>

          {/* Quick CTA button */}
          <div className="text-center">
            <a
              href={checkoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 bg-gradient-to-r from-[#c45663] to-[#b84a56] hover:from-[#b84a56] hover:to-[#9f3d4a] text-white font-extrabold text-sm px-8 py-4 rounded-2xl shadow-lg shadow-rose-900/15 transition-all hover:scale-[1.02]"
              id="landing-products-explore-btn"
            >
              <span>Garantir Acesso a Todos os Modelos</span>
              <ArrowRight className="w-4 h-4 text-rose-200" />
            </a>
          </div>

        </div>
      </section>

      {/* ── 2. O PROBLEMA (Agora no estilo ateliê) ── */}
      <section className="py-16 md:py-20 bg-[#2d1c22] text-stone-100 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          
          <div className="text-center mb-12">
            <span className="text-xs font-extrabold uppercase tracking-widest text-rose-300 mb-2 block">
              Gargalo de Produção
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Você ainda perde horas fazendo isso?
            </h2>
          </div>

          <div className="space-y-3 max-w-2xl mx-auto mb-10">
            
            <div className="bg-[#3a252c] border border-rose-900/40 p-4 rounded-2xl flex items-start gap-3.5">
              <div className="bg-red-500/20 text-red-300 p-1.5 rounded-xl shrink-0 mt-0.5">
                <X className="w-4 h-4" />
              </div>
              <p className="text-sm sm:text-base text-stone-200 font-medium">
                Montando planilhas para mesclagem de dados
              </p>
            </div>

            <div className="bg-[#3a252c] border border-rose-900/40 p-4 rounded-2xl flex items-start gap-3.5">
              <div className="bg-red-500/20 text-red-300 p-1.5 rounded-xl shrink-0 mt-0.5">
                <X className="w-4 h-4" />
              </div>
              <p className="text-sm sm:text-base text-stone-200 font-medium">
                Ajustando centenas de páginas no Corel
              </p>
            </div>

            <div className="bg-[#3a252c] border border-rose-900/40 p-4 rounded-2xl flex items-start gap-3.5">
              <div className="bg-red-500/20 text-red-300 p-1.5 rounded-xl shrink-0 mt-0.5">
                <X className="w-4 h-4" />
              </div>
              <p className="text-sm sm:text-base text-stone-200 font-medium">
                Duplicando páginas manualmente
              </p>
            </div>

            <div className="bg-[#3a252c] border border-rose-900/40 p-4 rounded-2xl flex items-start gap-3.5">
              <div className="bg-red-500/20 text-red-300 p-1.5 rounded-xl shrink-0 mt-0.5">
                <X className="w-4 h-4" />
              </div>
              <p className="text-sm sm:text-base text-stone-200 font-medium">
                Procurando onde uma alteração ficou errada
              </p>
            </div>

            <div className="bg-[#3a252c] border border-rose-900/40 p-4 rounded-2xl flex items-start gap-3.5">
              <div className="bg-red-500/20 text-red-300 p-1.5 rounded-xl shrink-0 mt-0.5">
                <X className="w-4 h-4" />
              </div>
              <p className="text-sm sm:text-base text-stone-200 font-medium">
                Dependendo de programas caros para personalizar seus arquivos
              </p>
            </div>

          </div>

          <div className="text-center pt-2">
            <p className="text-lg sm:text-xl font-bold text-rose-300 max-w-xl mx-auto">
              O Agenda Master foi criado para eliminar essa parte chata.
            </p>
          </div>

        </div>
      </section>

      {/* ── 3. MOSTRA O PRODUTO ── */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight mb-4">
            Você escolhe. O Agenda Master faz o trabalho pesado.
          </h2>
          <p className="text-base sm:text-lg text-slate-600">
            Personalize sua agenda do seu jeito com controle total de cada elemento visual.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          
          <div className="bg-white p-5 rounded-3xl border border-[#eedad5] shadow-xs hover:border-[#b84a56] transition-all">
            <div className="w-10 h-10 rounded-2xl bg-[#fdeeed] text-[#b84a56] flex items-center justify-center mb-3">
              <Palette className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Fundo de toda a agenda</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Aplique temas florais, texturas ou padrões em todas as páginas simultaneamente.
            </p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-[#eedad5] shadow-xs hover:border-[#b84a56] transition-all">
            <div className="w-10 h-10 rounded-2xl bg-[#fdeeed] text-[#b84a56] flex items-center justify-center mb-3">
              <Layout className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Fundo apenas do miolo</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Deixe dados pessoais e páginas iniciais neutras e decore apenas os dias do ano.
            </p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-[#eedad5] shadow-xs hover:border-[#b84a56] transition-all">
            <div className="w-10 h-10 rounded-2xl bg-[#fdeeed] text-[#b84a56] flex items-center justify-center mb-3">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Fundos das páginas mensais</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Visão mensal e planejamento com artes personalizadas exclusivas para cada mês.
            </p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-[#eedad5] shadow-xs hover:border-[#b84a56] transition-all">
            <div className="w-10 h-10 rounded-2xl bg-[#fdeeed] text-[#b84a56] flex items-center justify-center mb-3">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Fundos das divisórias</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Abas e divisórias mensais com frente temática e verso funcional (notas ou frases).
            </p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-[#eedad5] shadow-xs hover:border-[#b84a56] transition-all">
            <div className="w-10 h-10 rounded-2xl bg-[#fdeeed] text-[#b84a56] flex items-center justify-center mb-3">
              <Sliders className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Páginas específicas</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Altere apenas a folha de contatos, dados, calendário ou anotações conforme seu gosto.
            </p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-[#eedad5] shadow-xs hover:border-[#b84a56] transition-all">
            <div className="w-10 h-10 rounded-2xl bg-[#fdeeed] text-[#b84a56] flex items-center justify-center mb-3">
              <RefreshCw className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Pares e ímpares separadamente</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Espelhamento automático de margem para Wire-o e encadernação sem cortar nada.
            </p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-[#eedad5] shadow-xs hover:border-[#b84a56] transition-all">
            <div className="w-10 h-10 rounded-2xl bg-[#fdeeed] text-[#b84a56] flex items-center justify-center mb-3">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Textos e elementos personalizados</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Fontes tipográficas, versículos bíblicos, frases motivacionais e feriados do Brasil.
            </p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-[#eedad5] shadow-xs hover:border-[#b84a56] transition-all">
            <div className="w-10 h-10 rounded-2xl bg-[#fdeeed] text-[#b84a56] flex items-center justify-center mb-3">
              <Printer className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Exportação final em PDF</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Arquivo em altíssima resolução gráfica com sangrias e margens prontas para a impressora.
            </p>
          </div>

        </div>

        {/* Action button */}
        <div className="text-center">
          <a
            href={checkoutUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#c45663] to-[#b84a56] hover:from-[#b84a56] hover:to-[#9f3d4a] text-white text-sm font-bold px-8 py-4 rounded-2xl shadow-lg shadow-rose-900/15 transition-all hover:scale-[1.02]"
            id="showcase-access-btn"
          >
            <span>Liberar Acesso Completo aos Recursos</span>
            <ArrowRight className="w-4 h-4 text-rose-200" />
          </a>
        </div>

      </section>

      {/* ── 4. COMPARAÇÃO SIMPLES (ANTES x AGORA) ── */}
      <section className="py-16 md:py-20 bg-white/70 px-4 sm:px-6 lg:px-8 border-y border-[#eedad5]">
        <div className="max-w-4xl mx-auto">
          
          <div className="text-center mb-12">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#9f3d4a] bg-[#fcedea] px-3.5 py-1 rounded-full inline-block mb-2 border border-[#f8d4ce]">
              Evolução do Fluxo
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Antes x Com Agenda Master
            </h2>
          </div>

          <div className="bg-white border-2 border-[#eedad5] rounded-3xl shadow-sm overflow-hidden">
            
            {/* Table Header */}
            <div className="grid grid-cols-2 bg-[#2d1c22] text-white text-xs sm:text-sm font-bold">
              <div className="p-4 border-r border-stone-800 text-stone-300 flex items-center gap-2">
                <X className="w-4 h-4 text-red-400" />
                <span>Como você fazia (Antes)</span>
              </div>
              <div className="p-4 bg-[#b84a56] text-white flex items-center gap-2">
                <Check className="w-4 h-4 text-white" />
                <span>Com o Agenda Master (Agora)</span>
              </div>
            </div>

            {/* Row 1 */}
            <div className="grid grid-cols-2 border-b border-[#eedad5] text-xs sm:text-sm font-medium">
              <div className="p-4 sm:p-5 border-r border-[#eedad5] text-slate-600 bg-[#faf5f3]">
                CorelDRAW pesado travando o computador
              </div>
              <div className="p-4 sm:p-5 text-slate-900 font-bold bg-[#fdf2f0]">
                Agenda Master online ou aplicativo nativo rápido
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-2 border-b border-[#eedad5] text-xs sm:text-sm font-medium">
              <div className="p-4 sm:p-5 border-r border-[#eedad5] text-slate-600 bg-[#faf5f3]">
                Excel + mesclagem de dados complexa
              </div>
              <div className="p-4 sm:p-5 text-slate-900 font-bold bg-[#fdf2f0]">
                Personalização visual direta dentro do sistema
              </div>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-2 border-b border-[#eedad5] text-xs sm:text-sm font-medium">
              <div className="p-4 sm:p-5 border-r border-[#eedad5] text-slate-600 bg-[#faf5f3]">
                Centenas de páginas para ajustar uma a uma
              </div>
              <div className="p-4 sm:p-5 text-slate-900 font-bold bg-[#fdf2f0]">
                Estrutura e datas geradas 100% no automático
              </div>
            </div>

            {/* Row 4 */}
            <div className="grid grid-cols-2 border-b border-[#eedad5] text-xs sm:text-sm font-medium">
              <div className="p-4 sm:p-5 border-r border-[#eedad5] text-slate-600 bg-[#faf5f3]">
                Alterações manuais propensas a erros
              </div>
              <div className="p-4 sm:p-5 text-slate-900 font-bold bg-[#fdf2f0]">
                Personalização em lote em poucos segundos
              </div>
            </div>

            {/* Row 5 */}
            <div className="grid grid-cols-2 text-xs sm:text-sm font-medium">
              <div className="p-4 sm:p-5 border-r border-[#eedad5] text-slate-600 bg-[#faf5f3]">
                Depender de 3 a 4 programas caros e separados
              </div>
              <div className="p-4 sm:p-5 text-slate-900 font-bold bg-[#fdf2f0]">
                Uma única plataforma profissional integrada
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ── 5. SEÇÃO DE DÚVIDAS FREQUENTES (EXATAMENTE COMO NA IMAGEM DA USUÁRIA) ── */}
      <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full" id="duvidas-section">
        
        {/* Header da Seção de Dúvidas */}
        <div className="text-center mb-12 space-y-3">
          <div className="inline-block bg-[#fcedea] text-[#9f3d4a] border border-[#f8d4ce] text-xs font-black px-5 py-1.5 rounded-full uppercase tracking-widest shadow-2xs">
            DÚVIDAS FREQUENTES
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            Agenda <span className="text-[#b84a56]">Master</span>
          </h2>
          <p className="text-slate-600 text-sm sm:text-base max-w-lg mx-auto">
            Tudo o que você precisa saber sobre o sistema para criar suas agendas com total tranquilidade.
          </p>
        </div>

        {/* 10 Cards Exatos da Imagem */}
        <div className="space-y-4 max-w-2xl mx-auto">
          
          {/* 1. O que é o Agenda Master? */}
          <div className="bg-white border border-[#f2deda] rounded-3xl p-5 sm:p-6 shadow-[0_4px_20px_rgba(184,74,86,0.04)] flex items-start gap-4 transition-all hover:shadow-md hover:border-[#b84a56]/40">
            <div className="w-12 h-12 rounded-2xl bg-[#fdeeed] text-[#b84a56] flex items-center justify-center shrink-0">
              <Laptop className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 mb-1">
                O que é o Agenda Master?
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                É uma ferramenta online para criar e personalizar miolos de encadernação, como agendas, planners, blocos numerados e outros projetos.
              </p>
            </div>
          </div>

          {/* 2. Quais tipos de projetos posso criar? */}
          <div className="bg-white border border-[#f2deda] rounded-3xl p-5 sm:p-6 shadow-[0_4px_20px_rgba(184,74,86,0.04)] flex items-start gap-4 transition-all hover:shadow-md hover:border-[#b84a56]/40">
            <div className="w-12 h-12 rounded-2xl bg-[#fdeeed] text-[#b84a56] flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 mb-1">
                Quais tipos de projetos posso criar?
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                Você pode criar agendas, planners, blocos numerados e desenvolver seus próprios projetos do zero. O sistema também oferece modelos para guiar quem está iniciando.
              </p>
            </div>
          </div>

          {/* 3. Posso personalizar do meu jeito? */}
          <div className="bg-white border border-[#f2deda] rounded-3xl p-5 sm:p-6 shadow-[0_4px_20px_rgba(184,74,86,0.04)] flex items-start gap-4 transition-all hover:shadow-md hover:border-[#b84a56]/40">
            <div className="w-12 h-12 rounded-2xl bg-[#fdeeed] text-[#b84a56] flex items-center justify-center shrink-0">
              <Palette className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 mb-1">
                Posso personalizar do meu jeito?
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                Sim. Você pode alterar textos, fontes, cores, imagens e outros elementos. É possível criar seu projeto do zero, sem ficar preso a modelos ou estruturas predefinidas.
              </p>
            </div>
          </div>

          {/* 4. O sistema tem modelos prontos? */}
          <div className="bg-white border border-[#f2deda] rounded-3xl p-5 sm:p-6 shadow-[0_4px_20px_rgba(184,74,86,0.04)] flex items-start gap-4 transition-all hover:shadow-md hover:border-[#b84a56]/40">
            <div className="w-12 h-12 rounded-2xl bg-[#fdeeed] text-[#b84a56] flex items-center justify-center shrink-0">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 mb-1">
                O sistema tem modelos prontos?
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                Sim. O Agenda Master conta com modelos que servem de guia para facilitar seus primeiros projetos. Você também pode criar projetos completamente do zero.
              </p>
            </div>
          </div>

          {/* 5. Tem função para blocos numerados? */}
          <div className="bg-white border border-[#f2deda] rounded-3xl p-5 sm:p-6 shadow-[0_4px_20px_rgba(184,74,86,0.04)] flex items-start gap-4 transition-all hover:shadow-md hover:border-[#b84a56]/40">
            <div className="w-12 h-12 rounded-2xl bg-[#fdeeed] text-[#b84a56] flex items-center justify-center shrink-0">
              <ListOrdered className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 mb-1">
                Tem função para blocos numerados?
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                Sim. O sistema possui uma função específica para criar blocos numerados, com mais praticidade e controle.
              </p>
            </div>
          </div>

          {/* 6. Preciso instalar algum programa? */}
          <div className="bg-white border border-[#f2deda] rounded-3xl p-5 sm:p-6 shadow-[0_4px_20px_rgba(184,74,86,0.04)] flex items-start gap-4 transition-all hover:shadow-md hover:border-[#b84a56]/40">
            <div className="w-12 h-12 rounded-2xl bg-[#fdeeed] text-[#b84a56] flex items-center justify-center shrink-0">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 mb-1">
                Preciso instalar algum programa?
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                Não. O Agenda Master funciona 100% online no navegador e conta também com aplicativo opcional para Windows se preferir instalar.
              </p>
            </div>
          </div>

          {/* 7. Em quais dispositivos posso usar? */}
          <div className="bg-white border border-[#f2deda] rounded-3xl p-5 sm:p-6 shadow-[0_4px_20px_rgba(184,74,86,0.04)] flex items-start gap-4 transition-all hover:shadow-md hover:border-[#b84a56]/40">
            <div className="w-12 h-12 rounded-2xl bg-[#fdeeed] text-[#b84a56] flex items-center justify-center shrink-0">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 mb-1">
                Em quais dispositivos posso usar?
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                Você pode acessar pelo computador, tablet ou celular, desde que tenha acesso à internet e um navegador atualizado.
              </p>
            </div>
          </div>

          {/* 8. Consigo exportar para imprimir? */}
          <div className="bg-white border border-[#f2deda] rounded-3xl p-5 sm:p-6 shadow-[0_4px_20px_rgba(184,74,86,0.04)] flex items-start gap-4 transition-all hover:shadow-md hover:border-[#b84a56]/40">
            <div className="w-12 h-12 rounded-2xl bg-[#fdeeed] text-[#b84a56] flex items-center justify-center shrink-0">
              <Printer className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 mb-1">
                Consigo exportar para imprimir?
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                Sim. Os projetos podem ser exportados em formatos prontos para impressão em PDF de alta qualidade, de acordo com a configuração do seu projeto.
              </p>
            </div>
          </div>

          {/* 9. Tenho suporte se precisar? */}
          <div className="bg-white border border-[#f2deda] rounded-3xl p-5 sm:p-6 shadow-[0_4px_20px_rgba(184,74,86,0.04)] flex items-start gap-4 transition-all hover:shadow-md hover:border-[#b84a56]/40">
            <div className="w-12 h-12 rounded-2xl bg-[#fdeeed] text-[#b84a56] flex items-center justify-center shrink-0">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 mb-1">
                Tenho suporte se precisar?
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                Sim. Você conta com suporte dedicado para tirar dúvidas sobre o uso da ferramenta e orientações de produção.
              </p>
            </div>
          </div>

          {/* 10. Meus projetos ficam seguros? */}
          <div className="bg-white border border-[#f2deda] rounded-3xl p-5 sm:p-6 shadow-[0_4px_20px_rgba(184,74,86,0.04)] flex items-start gap-4 transition-all hover:shadow-md hover:border-[#b84a56]/40">
            <div className="w-12 h-12 rounded-2xl bg-[#fdeeed] text-[#b84a56] flex items-center justify-center shrink-0">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 mb-1">
                Meus projetos ficam seguros?
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                Sim. Seus projetos são armazenados na sua conta, de forma segura, e você pode acessá-los sempre que precisar.
              </p>
            </div>
          </div>

        </div>

      </section>

      {/* ── 6. PARA QUEM É ── */}
      <section className="py-16 md:py-20 bg-white/70 px-4 sm:px-6 lg:px-8 border-y border-[#eedad5]">
        <div className="max-w-4xl mx-auto">
          
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              O Agenda Master é para você que:
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            
            {[
              'Vende agendas personalizadas',
              'Trabalha com encadernação artesanal',
              'Produz planners e cadernos sob encomenda',
              'Quer aumentar sua escala de produção',
              'Quer diminuir o tempo gasto montando arquivos',
              'Não quer depender de Corel, InDesign ou Excel'
            ].map((text, idx) => (
              <div key={idx} className="bg-white border border-[#f2deda] p-4.5 rounded-2xl flex items-center gap-3.5 shadow-xs">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
                  <Check className="w-4 h-4 stroke-[2.5]" />
                </div>
                <span className="text-sm sm:text-base font-bold text-slate-800">
                  {text}
                </span>
              </div>
            ))}

          </div>

        </div>
      </section>

      {/* ── 7. PREÇO + CTA ── */}
      <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto w-full text-center" id="pricing-section">
        
        <div className="bg-white border-2 border-[#eedad5] rounded-3xl p-8 sm:p-12 shadow-[0_16px_50px_rgba(184,74,86,0.08)] relative">
          
          <div className="inline-block bg-[#fcedea] text-[#9f3d4a] border border-[#f8d4ce] text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider mb-6">
            Acesso Completo Anual
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight mb-3">
            Pare de gastar horas montando seus arquivos.
          </h2>
          
          <p className="text-base sm:text-lg text-slate-600 mb-8 font-medium">
            Tenha o Agenda Master por 1 ano completo com todas as atualizações.
          </p>

          {/* Pricing Box */}
          <div className="bg-gradient-to-br from-[#fff7f5] via-white to-[#faebe6] border-2 border-[#eedad5] rounded-3xl p-6 mb-8 max-w-md mx-auto shadow-sm">
            <div className="text-sm text-slate-400 line-through font-semibold mb-1">
              De R$ 349,90
            </div>
            
            <div className="flex items-baseline justify-center gap-1.5 mb-2">
              <span className="text-slate-700 text-2xl font-extrabold">Por apenas</span>
              <span className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">R$ 249,90</span>
            </div>

            <p className="text-xs sm:text-sm font-bold text-[#b84a56]">
              ou em até 12x no cartão
            </p>
          </div>

          {/* Primary Action Button */}
          <a
            href={checkoutUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full max-w-md mx-auto bg-gradient-to-r from-[#c45663] to-[#b84a56] hover:from-[#b84a56] hover:to-[#9f3d4a] text-white text-base sm:text-lg font-black py-4.5 px-8 rounded-2xl shadow-xl shadow-rose-900/20 transition-all flex items-center justify-center gap-2 mb-4 hover:scale-[1.02] active:scale-95"
            id="pricing-checkout-btn"
          >
            <span>QUERO MEU ACESSO AO AGENDA MASTER</span>
            <ArrowRight className="w-5 h-5 text-rose-200" />
          </a>

          {/* Small Guarantee / Terms Info */}
          <p className="text-xs text-slate-500 font-medium">
            Acesso anual. Renovação pelo mesmo valor enquanto a assinatura permanecer ativa.
          </p>

        </div>

      </section>

      {/* ── FOOTER ── */}
      <footer className="w-full bg-white border-t border-[#f2deda] py-8 px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-black text-slate-800">Agenda Master</span>
            <span>• Versão 2.0.3</span>
          </div>
          <p>© {new Date().getFullYear()} Luiza Lacerda Papelaria. Todos os direitos reservados.</p>
        </div>
      </footer>

    </div>
  );
};
