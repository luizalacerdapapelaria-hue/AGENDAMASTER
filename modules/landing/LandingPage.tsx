import React from 'react';
import { 
  Sparkles, ArrowRight, Check, X, 
  Layers, Palette, Layout, FileText, 
  Printer, ShieldCheck, Download, LogIn,
  Sliders, Calendar, CheckCircle2, ChevronRight,
  ExternalLink, MousePointerClick, RefreshCw, Zap,
  Play, Video
} from 'lucide-react';
import { AppState } from '../../types';

interface LandingPageProps {
  onNavigate: (state: AppState) => void;
  exeUrl?: string;
  checkoutUrl?: string;
}

export const LandingPage: React.FC<LandingPageProps> = ({ 
  onNavigate, 
  exeUrl,
  checkoutUrl = 'https://pay.herospark.com/agenda-master-523399'
}) => {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 font-sans antialiased selection:bg-amber-200 selection:text-stone-900 flex flex-col">
      
      {/* ── HEADER NAVBAR ── */}
      <header className="w-full border-b border-stone-200 bg-white/95 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <div 
            className="flex items-center gap-2.5 cursor-pointer select-none" 
            onClick={() => onNavigate(AppState.WELCOME)}
            id="landing-logo-btn"
          >
            <div className="bg-gradient-to-br from-amber-600 to-orange-600 w-8 h-8 rounded-lg flex items-center justify-center shadow-xs">
              <Sparkles className="text-white w-4 h-4" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black tracking-tight text-stone-900">
                Agenda Master <span className="text-amber-600">AI</span>
              </span>
              <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                v1.1.2
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate(AppState.LOGIN)}
              className="text-stone-600 hover:text-stone-900 text-xs font-semibold px-3 py-2 rounded-lg hover:bg-stone-100 transition-colors flex items-center gap-1.5"
              id="landing-login-btn"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Entrar</span>
            </button>
            <a
              href={checkoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
              id="landing-header-checkout-btn"
            >
              <span>Garantir Acesso</span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
            </a>
          </div>

        </div>
      </header>

      {/* ── 1. HERO: VENDA A TRANSFORMAÇÃO ── */}
      <section className="pt-12 pb-16 md:pt-20 md:pb-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full text-center">
        
        {/* Core Tagline Badge */}
        <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold px-3.5 py-1.5 rounded-full mb-6 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Pare de montar agendas. Comece a personalizá-las.</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-stone-950 tracking-tight leading-[1.1] max-w-4xl mx-auto mb-6">
          Crie agendas personalizadas sem Corel, InDesign ou Excel.
        </h1>

        {/* Subhead */}
        <p className="text-base sm:text-lg md:text-xl text-stone-600 max-w-2xl mx-auto leading-relaxed mb-8">
          Personalize capas, miolos, páginas mensais, divisórias e fundos da sua agenda em poucos cliques — e gere o PDF pronto para imprimir.
        </p>

        {/* Hero CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-14">
          <a
            href={checkoutUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white text-sm sm:text-base font-extrabold px-8 py-4 rounded-xl shadow-md shadow-amber-600/20 transition-all flex items-center justify-center gap-2"
            id="hero-primary-cta"
          >
            <span>QUERO CONHECER O AGENDA MASTER</span>
            <ArrowRight className="w-4 h-4" />
          </a>
          <button
            onClick={() => onNavigate(AppState.WELCOME)}
            className="w-full sm:w-auto bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 text-sm sm:text-base font-bold px-6 py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
            id="hero-test-editor-btn"
          >
            <MousePointerClick className="w-4 h-4 text-amber-600" />
            <span>Experimentar o Editor</span>
          </button>
        </div>

        {/* ── VÍDEO DEMONSTRAÇÃO DO SISTEMA FUNCIONANDO ── */}
        <div className="bg-white border border-stone-200/90 rounded-2xl shadow-2xl overflow-hidden max-w-4xl mx-auto text-left">
          <div className="bg-stone-900 text-stone-300 px-4 py-3 border-b border-stone-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              <span className="ml-2 font-mono text-[11px] text-stone-400">Demonstração Prática • Agenda Master em Ação</span>
            </div>
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
              <Video className="w-3.5 h-3.5" /> Assista à Demonstração
            </span>
          </div>
          
          <div className="relative w-full aspect-video bg-black">
            <iframe
              src="https://www.youtube.com/embed/FBqMHhpH8pg?autoplay=0&rel=0&modestbranding=1"
              title="Demonstração do Agenda Master"
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          <div className="p-4 bg-stone-900 text-stone-300 text-xs flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-stone-800">
            <div className="flex items-center gap-2 text-stone-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Veja como gerar centenas de páginas personalizadas e prontas para impressão em segundos.</span>
            </div>
            <a
              href={checkoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:text-amber-300 text-xs font-bold flex items-center gap-1 shrink-0"
            >
              <span>Garantir meu acesso agora</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

      </section>

      {/* ── 2. O PROBLEMA ── */}
      <section className="py-16 md:py-20 bg-stone-900 text-stone-100 px-4 sm:px-6 lg:px-8 border-y border-stone-800">
        <div className="max-w-4xl mx-auto">
          
          <div className="text-center mb-12">
            <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400 mb-2 block">
              Gargalo de Produção
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Você ainda perde horas fazendo isso?
            </h2>
          </div>

          <div className="space-y-3 max-w-2xl mx-auto mb-10">
            
            <div className="bg-stone-800/80 border border-stone-700/80 p-4 rounded-xl flex items-start gap-3.5">
              <div className="bg-red-500/10 text-red-400 p-1 rounded-md shrink-0 mt-0.5">
                <X className="w-4 h-4" />
              </div>
              <p className="text-sm sm:text-base text-stone-200 font-medium">
                Montando planilhas para mesclagem de dados
              </p>
            </div>

            <div className="bg-stone-800/80 border border-stone-700/80 p-4 rounded-xl flex items-start gap-3.5">
              <div className="bg-red-500/10 text-red-400 p-1 rounded-md shrink-0 mt-0.5">
                <X className="w-4 h-4" />
              </div>
              <p className="text-sm sm:text-base text-stone-200 font-medium">
                Ajustando centenas de páginas no Corel
              </p>
            </div>

            <div className="bg-stone-800/80 border border-stone-700/80 p-4 rounded-xl flex items-start gap-3.5">
              <div className="bg-red-500/10 text-red-400 p-1 rounded-md shrink-0 mt-0.5">
                <X className="w-4 h-4" />
              </div>
              <p className="text-sm sm:text-base text-stone-200 font-medium">
                Duplicando páginas manualmente
              </p>
            </div>

            <div className="bg-stone-800/80 border border-stone-700/80 p-4 rounded-xl flex items-start gap-3.5">
              <div className="bg-red-500/10 text-red-400 p-1 rounded-md shrink-0 mt-0.5">
                <X className="w-4 h-4" />
              </div>
              <p className="text-sm sm:text-base text-stone-200 font-medium">
                Procurando onde uma alteração ficou errada
              </p>
            </div>

            <div className="bg-stone-800/80 border border-stone-700/80 p-4 rounded-xl flex items-start gap-3.5">
              <div className="bg-red-500/10 text-red-400 p-1 rounded-md shrink-0 mt-0.5">
                <X className="w-4 h-4" />
              </div>
              <p className="text-sm sm:text-base text-stone-200 font-medium">
                Dependendo de programas caros para personalizar seus arquivos
              </p>
            </div>

          </div>

          <div className="text-center pt-2">
            <p className="text-lg sm:text-xl font-bold text-amber-400 max-w-xl mx-auto">
              O Agenda Master foi criado para eliminar essa parte chata.
            </p>
          </div>

        </div>
      </section>

      {/* ── 3. MOSTRA O PRODUTO ── */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-2xl sm:text-4xl font-black text-stone-950 tracking-tight mb-4">
            Você escolhe. O Agenda Master faz o trabalho pesado.
          </h2>
          <p className="text-base sm:text-lg text-stone-600">
            Personalize sua agenda do seu jeito com controle total de cada elemento visual.
          </p>
        </div>

        {/* Feature Cards Grid (8 Core Capabilities) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs hover:border-amber-400 transition-all">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-3">
              <Palette className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-stone-900 mb-1">Fundo de toda a agenda</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Aplique temas florais, texturas ou padrões em todas as páginas simultaneamente.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs hover:border-amber-400 transition-all">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-3">
              <Layout className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-stone-900 mb-1">Fundo apenas do miolo</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Deixe dados pessoais e páginas iniciais neutras e decore apenas os dias do ano.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs hover:border-amber-400 transition-all">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-3">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-stone-900 mb-1">Fundos das páginas mensais</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Visão mensal e planejamento com artes personalizadas exclusivas para cada mês.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs hover:border-amber-400 transition-all">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-3">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-stone-900 mb-1">Fundos das divisórias</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Abas e divisórias mensais com frente temática e verso funcional (notas ou frases).
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs hover:border-amber-400 transition-all">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-3">
              <Sliders className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-stone-900 mb-1">Páginas específicas</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Altere apenas a folha de contatos, dados, calendário ou anotações conforme seu gosto.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs hover:border-amber-400 transition-all">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-3">
              <RefreshCw className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-stone-900 mb-1">Pares e ímpares separadamente</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Espelhamento automático de margem para Wire-o e encadernação sem cortar nada.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs hover:border-amber-400 transition-all">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-3">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-stone-900 mb-1">Textos e elementos personalizados</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Fontes tipográficas, versículos bíblicos, frases motivacionais e feriados do Brasil.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs hover:border-amber-400 transition-all">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-3">
              <Printer className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-stone-900 mb-1">Exportação final em PDF</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Arquivo em altíssima resolução gráfica com sangrias e margens prontas para a impressora.
            </p>
          </div>

        </div>

        {/* Action button */}
        <div className="text-center">
          <button
            onClick={() => onNavigate(AppState.WELCOME)}
            className="inline-flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-white text-xs sm:text-sm font-bold px-6 py-3.5 rounded-xl transition-colors"
            id="showcase-try-btn"
          >
            <span>Ver todas as opções no editor interativo</span>
            <ArrowRight className="w-4 h-4 text-amber-400" />
          </button>
        </div>

      </section>

      {/* ── 4. COMPARAÇÃO SIMPLES (ANTES x AGORA) ── */}
      <section className="py-16 md:py-20 bg-stone-100/80 px-4 sm:px-6 lg:px-8 border-y border-stone-200">
        <div className="max-w-4xl mx-auto">
          
          <div className="text-center mb-12">
            <span className="text-xs font-extrabold uppercase tracking-widest text-amber-700 mb-2 block">
              Evolução do Fluxo
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-stone-950 tracking-tight">
              Antes x Com Agenda Master
            </h2>
          </div>

          <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
            
            {/* Table Header */}
            <div className="grid grid-cols-2 bg-stone-900 text-white text-xs sm:text-sm font-bold">
              <div className="p-4 border-r border-stone-800 text-stone-400 flex items-center gap-2">
                <X className="w-4 h-4 text-red-400" />
                <span>Como você fazia (Antes)</span>
              </div>
              <div className="p-4 bg-amber-600 text-white flex items-center gap-2">
                <Check className="w-4 h-4 text-white" />
                <span>Com o Agenda Master (Agora)</span>
              </div>
            </div>

            {/* Row 1 */}
            <div className="grid grid-cols-2 border-b border-stone-200 text-xs sm:text-sm font-medium">
              <div className="p-4 sm:p-5 border-r border-stone-200 text-stone-600 bg-stone-50/50">
                CorelDRAW pesado travando o computador
              </div>
              <div className="p-4 sm:p-5 text-stone-900 font-bold bg-amber-50/30">
                Agenda Master online ou aplicativo nativo rápido
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-2 border-b border-stone-200 text-xs sm:text-sm font-medium">
              <div className="p-4 sm:p-5 border-r border-stone-200 text-stone-600 bg-stone-50/50">
                Excel + mesclagem de dados complexa
              </div>
              <div className="p-4 sm:p-5 text-stone-900 font-bold bg-amber-50/30">
                Personalização visual direta dentro do sistema
              </div>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-2 border-b border-stone-200 text-xs sm:text-sm font-medium">
              <div className="p-4 sm:p-5 border-r border-stone-200 text-stone-600 bg-stone-50/50">
                Centenas de páginas para ajustar uma a uma
              </div>
              <div className="p-4 sm:p-5 text-stone-900 font-bold bg-amber-50/30">
                Estrutura e datas geradas 100% no automático
              </div>
            </div>

            {/* Row 4 */}
            <div className="grid grid-cols-2 border-b border-stone-200 text-xs sm:text-sm font-medium">
              <div className="p-4 sm:p-5 border-r border-stone-200 text-stone-600 bg-stone-50/50">
                Alterações manuais propensas a erros
              </div>
              <div className="p-4 sm:p-5 text-stone-900 font-bold bg-amber-50/30">
                Personalização em lote em poucos segundos
              </div>
            </div>

            {/* Row 5 */}
            <div className="grid grid-cols-2 text-xs sm:text-sm font-medium">
              <div className="p-4 sm:p-5 border-r border-stone-200 text-stone-600 bg-stone-50/50">
                Depender de 3 a 4 programas caros e separados
              </div>
              <div className="p-4 sm:p-5 text-stone-900 font-bold bg-amber-50/30">
                Uma única plataforma profissional integrada
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ── 5. A GRANDE PROMESSA ── */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full text-center">
        
        <div className="bg-stone-900 text-white rounded-3xl p-8 sm:p-12 border border-stone-800 shadow-xl relative overflow-hidden">
          
          <div className="relative z-10 space-y-6">
            <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400 block">
              Simplicidade de Produção
            </span>

            <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-snug">
              Você não precisa aprender mais um programa de design.
            </h2>

            <p className="text-base sm:text-lg text-stone-300 max-w-2xl mx-auto leading-relaxed">
              Você já sabe criar agendas. O que faltava era uma ferramenta que transformasse essa criação em um processo mais <strong className="text-white">rápido, organizado e escalável</strong>.
            </p>

            <div className="pt-2">
              <span className="inline-block bg-amber-500/20 border border-amber-500/40 text-amber-300 font-extrabold text-sm sm:text-base px-6 py-2.5 rounded-full">
                O Agenda Master faz exatamente isso.
              </span>
            </div>
          </div>

        </div>

      </section>

      {/* ── 6. PARA QUEM É ── */}
      <section className="py-16 md:py-20 bg-white px-4 sm:px-6 lg:px-8 border-y border-stone-200">
        <div className="max-w-4xl mx-auto">
          
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-4xl font-black text-stone-950 tracking-tight">
              O Agenda Master é para você que:
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            
            <div className="bg-stone-50 border border-stone-200 p-4 rounded-xl flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Check className="w-4 h-4" />
              </div>
              <span className="text-sm sm:text-base font-bold text-stone-800">
                Vende agendas personalizadas
              </span>
            </div>

            <div className="bg-stone-50 border border-stone-200 p-4 rounded-xl flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Check className="w-4 h-4" />
              </div>
              <span className="text-sm sm:text-base font-bold text-stone-800">
                Trabalha com encadernação artesanal
              </span>
            </div>

            <div className="bg-stone-50 border border-stone-200 p-4 rounded-xl flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Check className="w-4 h-4" />
              </div>
              <span className="text-sm sm:text-base font-bold text-stone-800">
                Produz planners e cadernos sob encomenda
              </span>
            </div>

            <div className="bg-stone-50 border border-stone-200 p-4 rounded-xl flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Check className="w-4 h-4" />
              </div>
              <span className="text-sm sm:text-base font-bold text-stone-800">
                Quer aumentar sua escala de produção
              </span>
            </div>

            <div className="bg-stone-50 border border-stone-200 p-4 rounded-xl flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Check className="w-4 h-4" />
              </div>
              <span className="text-sm sm:text-base font-bold text-stone-800">
                Quer diminuir o tempo gasto montando arquivos
              </span>
            </div>

            <div className="bg-stone-50 border border-stone-200 p-4 rounded-xl flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Check className="w-4 h-4" />
              </div>
              <span className="text-sm sm:text-base font-bold text-stone-800">
                Não quer depender de Corel, InDesign ou Excel
              </span>
            </div>

          </div>

        </div>
      </section>

      {/* ── 7. PREÇO + CTA ── */}
      <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto w-full text-center" id="pricing-section">
        
        <div className="bg-white border-2 border-amber-500/40 rounded-3xl p-8 sm:p-12 shadow-2xl relative">
          
          <div className="inline-block bg-amber-50 text-amber-800 border border-amber-200 text-xs font-extrabold px-4 py-1.5 rounded-full uppercase tracking-wider mb-6">
            Acesso Completo Anual
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-stone-950 tracking-tight mb-3">
            Pare de gastar horas montando seus arquivos.
          </h2>
          
          <p className="text-base sm:text-lg text-stone-600 mb-8 font-medium">
            Tenha o Agenda Master por 1 ano.
          </p>

          {/* Pricing Box */}
          <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-6 mb-8 max-w-md mx-auto">
            <div className="text-sm text-stone-400 line-through font-semibold mb-1">
              De R$ 349,90
            </div>
            
            <div className="flex items-baseline justify-center gap-1.5 mb-2">
              <span className="text-stone-900 text-2xl font-extrabold">Por apenas</span>
              <span className="text-4xl sm:text-5xl font-black text-stone-950 tracking-tight">R$ 249,90</span>
            </div>

            <p className="text-xs sm:text-sm font-bold text-amber-700">
              ou em até 12x no cartão
            </p>
          </div>

          {/* Primary Action Button */}
          <a
            href={checkoutUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full max-w-md mx-auto bg-amber-600 hover:bg-amber-700 text-white text-base sm:text-lg font-black py-4 px-8 rounded-xl shadow-lg shadow-amber-600/30 transition-all flex items-center justify-center gap-2 mb-4"
            id="pricing-checkout-btn"
          >
            <span>QUERO MEU ACESSO AO AGENDA MASTER</span>
            <ArrowRight className="w-5 h-5" />
          </a>

          {/* Small Guarantee / Terms Info */}
          <p className="text-xs text-stone-500 font-medium">
            Acesso anual. Renovação pelo mesmo valor enquanto a assinatura permanecer ativa.
          </p>

        </div>

      </section>

      {/* ── 8. UMA ÚLTIMA QUEBRA DE OBJEÇÃO ── */}
      <section className="py-16 md:py-20 bg-stone-900 text-stone-100 px-4 sm:px-6 lg:px-8 border-t border-stone-800">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          
          <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400 block">
            Dúvida Frequente
          </span>

          <h2 className="text-2xl sm:text-3xl font-black text-white">
            “Mas eu preciso saber mexer com Corel?”
          </h2>

          <p className="text-2xl sm:text-3xl font-black text-amber-400">
            Não.
          </p>

          <p className="text-base sm:text-lg text-stone-300 leading-relaxed max-w-2xl mx-auto">
            O Agenda Master foi desenvolvido justamente para você conseguir personalizar seus produtos sem precisar dominar CorelDRAW, InDesign ou processos de mesclagem no Excel.
          </p>

          <p className="text-base sm:text-lg font-bold text-white">
            Você entra, personaliza e gera seu arquivo pronto para imprimir.
          </p>

          <div className="pt-4">
            <a
              href={checkoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white text-sm sm:text-base font-extrabold px-8 py-4 rounded-xl shadow-lg transition-colors"
              id="objection-checkout-btn"
            >
              <span>QUERO USAR O AGENDA MASTER</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="w-full bg-stone-950 border-t border-stone-800/80 py-8 px-4 sm:px-6 lg:px-8 text-center text-xs text-stone-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-black text-stone-300">Agenda Master AI</span>
            <span>• Versão 1.1.2</span>
          </div>
          <p>© {new Date().getFullYear()} Luiza Lacerda Papelaria. Todos os direitos reservados.</p>
        </div>
      </footer>

    </div>
  );
};
