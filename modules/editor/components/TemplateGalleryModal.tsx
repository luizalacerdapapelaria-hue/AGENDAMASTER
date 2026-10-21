import React from 'react';
import { 
  Sparkles, X, Layout, Square, Plus, Download, Upload, Star, FileText, CheckCircle2, Bookmark
} from 'lucide-react';
import { AgendaConfig, LayoutElement, IntroPage, CustomTemplateItem } from '../../../types';
import { INTRO_TEMPLATES } from '../templates/introTemplates';
import { 
  AGENDA_OBJECTIVE_OPTIONS, 
  PLANNER_OBJECTIVE_OPTIONS, 
  NOTEBOOK_OBJECTIVE_OPTIONS, 
  renderObjectiveIcon,
  ObjectiveModelOption 
} from '../InitialSetup';

export interface TemplateGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AgendaConfig;
  templateCategory: 'intro' | 'planner' | 'library' | 'agenda' | 'notebook' | 'devotional' | 'custom';
  setTemplateCategory: (cat: 'intro' | 'planner' | 'library' | 'agenda' | 'notebook' | 'devotional' | 'custom') => void;
  applyLibraryLayout: (layoutId: string, mioloOnly?: boolean) => void;
  addIntroTemplate: (template: IntroPage) => void;
  customTemplates: CustomTemplateItem[];
  exportCustomTemplates: () => void;
  importCustomTemplates: (e: React.ChangeEvent<HTMLInputElement>) => void;
  deleteCustomTemplate: (id: string, name: string) => void;
  applyCustomTemplate: (template: CustomTemplateItem, targetMode?: 'miolo' | 'page') => void;
  saveCurrentMioloAsTemplate?: () => void;
  templateFileInputRef: React.RefObject<HTMLInputElement | null>;
  setPdfImportModalOpen: (open: boolean) => void;
  setConfig: (c: AgendaConfig | ((prev: AgendaConfig) => AgendaConfig)) => void;
  setToastMessage: (msg: string | null) => void;
}

export const TemplateGalleryModal: React.FC<TemplateGalleryModalProps> = ({
  isOpen,
  onClose,
  config,
  templateCategory,
  setTemplateCategory,
  applyLibraryLayout,
  addIntroTemplate,
  customTemplates,
  exportCustomTemplates,
  importCustomTemplates,
  deleteCustomTemplate,
  applyCustomTemplate,
  saveCurrentMioloAsTemplate,
  templateFileInputRef,
  setPdfImportModalOpen,
  setConfig,
  setToastMessage
}) => {
  if (!isOpen) return null;

  const effectiveCategory = (templateCategory === 'library' || !templateCategory)
    ? (config.projectType === 'planner' ? 'planner' : config.projectType === 'notebook' ? 'notebook' : 'agenda')
    : templateCategory;

  const agendaList: ObjectiveModelOption[] = [
    ...AGENDA_OBJECTIVE_OPTIONS,
    {
      id: 'agenda_30min',
      title: 'Horários 30 em 30 min',
      subtitle: 'Atendimento de 07h às 21h em duas colunas com balanço diário e fechamento.',
      tag: 'Duas Colunas',
      iconName: 'clock',
      libraryItemId: 'agenda-agendamento-30min',
      defaultLayout: '1_per_page',
      defaultName: 'Agenda Horários 30min'
    },
    {
      id: 'agenda_executiva_2dpp',
      title: 'Agenda Executiva (2 DPP)',
      subtitle: 'Dois dias por página em caixas horizontais em paleta pastel rosé e sálvia.',
      tag: '2 Dias por Pág',
      iconName: 'columns',
      libraryItemId: 'agenda-executiva-horizontal',
      defaultLayout: '2_per_page',
      defaultName: 'Agenda Executiva 2 DPP'
    }
  ];

  const plannerList: ObjectiveModelOption[] = [
    ...PLANNER_OBJECTIVE_OPTIONS,
    {
      id: 'planner_saude_extra',
      title: 'Planner de Saúde & Bem-Estar',
      subtitle: 'Diário alimentar completo, registro de treino, hidratação, energia e autocuidado.',
      tag: 'Saúde & Autocuidado',
      iconName: 'sparkles',
      libraryItemId: 'planner-saude',
      defaultLayout: '1_per_page',
      defaultName: 'Planner de Saúde'
    },
    {
      id: 'planner_semanal_horizontal_extra',
      title: 'Planner Semanal Horizontal',
      subtitle: 'Visão dos 7 dias em faixas horizontais com blocos para cada dia e notas semanais.',
      tag: 'Semanal 2 Págs',
      iconName: 'columns',
      libraryItemId: 'planner-semanal-horizontal',
      defaultLayout: 'weekly_horizontal',
      defaultName: 'Planner Semanal Horizontal'
    }
  ];

  const activeList: ObjectiveModelOption[] = 
    effectiveCategory === 'planner' ? plannerList :
    effectiveCategory === 'notebook' ? NOTEBOOK_OBJECTIVE_OPTIONS :
    agendaList;

  const handleApplyOption = (opt: ObjectiveModelOption, mioloOnly: boolean) => {
    const isBlank = opt.isPureBlank || opt.id === 'notebook_liso' || opt.id === 'agenda_em_branco' || opt.id === 'planner_em_branco';
    if (isBlank) {
      const layoutId = opt.libraryItemId || (config.projectType === 'planner' ? 'planner-em-branco' : 'layout-em-branco');
      applyLibraryLayout(layoutId, mioloOnly);
      return;
    }
    if (opt.libraryItemId) {
      applyLibraryLayout(opt.libraryItemId, mioloOnly);
      return;
    }
    if (opt.notebookElements) {
      const newElements = opt.notebookElements.map(el => ({ ...el, id: Math.random().toString(36).substr(2, 9) })) as LayoutElement[];
      setConfig(prev => ({
        ...prev,
        projectType: 'notebook',
        layoutType: 'notebook',
        elements: newElements,
        elementsWeeklyLeft: undefined,
        elementsWeeklyRight: undefined,
        elementsSaturday: undefined,
        elementsSunday: undefined,
        elementsTop: undefined,
        elementsBottom: undefined,
        ...(mioloOnly ? {} : { introPages: [] })
      }));
      onClose();
      setToastMessage(`Caderno "${opt.title}" aplicado com sucesso!`);
      return;
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-3 sm:p-6 no-print overflow-y-auto" 
      onClick={onClose}
    >
      <div 
        className="bg-white text-slate-800 rounded-3xl border border-[#eedad5] shadow-[0_20px_60px_rgba(184,74,86,0.15)] w-full max-w-5xl my-auto flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200" 
        onClick={e => e.stopPropagation()}
      >
        {/* Header no estilo feminino delicado */}
        <div className="p-6 sm:p-8 pb-5 relative border-b border-[#eedad5] bg-gradient-to-b from-[#faf6f4] to-white">
          {/* Ações superiores: Importar PDF e Botão Fechar */}
          <div className="absolute top-6 right-6 flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                setPdfImportModalOpen(true);
              }}
              className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-[#9f3d4a] hover:text-[#b84a56] bg-[#fdeeed] hover:bg-[#f9e2df] border border-[#f5ded9] px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-2xs"
              title="Importar layout editável de PDF (CorelDraw, Canva, Illustrator)"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#b84a56]" />
              <span>Importar PDF (Corel)</span>
            </button>
            <button 
              type="button"
              onClick={onClose} 
              className="text-slate-400 hover:text-slate-700 bg-white hover:bg-slate-100 border border-[#eedad5] p-2.5 rounded-xl transition-all cursor-pointer shadow-2xs"
              title="Fechar"
            >
              <X className="w-5 h-5"/>
            </button>
          </div>

          {/* Título e Subtítulo */}
          <div className="text-center space-y-2 max-w-2xl mx-auto pt-1 sm:pt-2">
            <div className="inline-flex items-center gap-2 bg-[#fdeeed] border border-[#f5ded9] px-4 py-1.5 rounded-full text-xs font-bold text-[#b84a56] uppercase tracking-widest shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#b84a56]" />
              <span>Catálogo de Modelos • Papelaria Fina</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {effectiveCategory === 'planner'
                ? 'Qual tipo de Planner você quer usar?'
                : effectiveCategory === 'notebook'
                ? 'Qual tipo de Caderno você quer usar?'
                : effectiveCategory === 'intro'
                ? 'Escolha uma Página Inicial'
                : effectiveCategory === 'custom'
                ? 'Meus Modelos Personalizados'
                : 'Qual tipo de Agenda você quer usar?'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              {effectiveCategory === 'planner'
                ? 'Escolha o objetivo principal do seu planner. Você pode aplicar apenas no miolo ou o modelo completo.'
                : effectiveCategory === 'notebook'
                ? 'Escolha o padrão de folhas do seu caderno (pautado, pontilhado, quadriculado ou liso).'
                : effectiveCategory === 'intro'
                ? 'Adicione páginas iniciais padronizadas para estruturar os dados e calendários do seu miolo.'
                : effectiveCategory === 'custom'
                ? 'Gerencie seus modelos salvos com opções de backup e restauração em JSON.'
                : 'Escolha o objetivo principal da sua agenda. Você pode aplicar apenas no miolo ou o modelo completo.'}
            </p>
          </div>

          {/* Abas Superiores no Estilo Feminino */}
          <div className="flex items-center justify-center gap-2 flex-wrap pt-5">
            <button
              type="button"
              onClick={() => setTemplateCategory('agenda')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                effectiveCategory === 'agenda'
                  ? 'bg-gradient-to-r from-[#b84a56] to-[#c45663] text-white font-black shadow-xs'
                  : 'bg-white text-slate-700 hover:text-slate-900 hover:bg-[#faf5f3] border border-[#eedad5]'
              }`}
            >
              Agenda
            </button>
            <button
              type="button"
              onClick={() => setTemplateCategory('planner')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                effectiveCategory === 'planner'
                  ? 'bg-gradient-to-r from-[#b84a56] to-[#c45663] text-white font-black shadow-xs'
                  : 'bg-white text-slate-700 hover:text-slate-900 hover:bg-[#faf5f3] border border-[#eedad5]'
              }`}
            >
              Planner
            </button>
            <button
              type="button"
              onClick={() => setTemplateCategory('notebook')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                effectiveCategory === 'notebook'
                  ? 'bg-gradient-to-r from-[#b84a56] to-[#c45663] text-white font-black shadow-xs'
                  : 'bg-white text-slate-700 hover:text-slate-900 hover:bg-[#faf5f3] border border-[#eedad5]'
              }`}
            >
              Caderno
            </button>
            <button
              type="button"
              onClick={() => setTemplateCategory('intro')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                effectiveCategory === 'intro'
                  ? 'bg-gradient-to-r from-[#b84a56] to-[#c45663] text-white font-black shadow-xs'
                  : 'bg-white text-slate-700 hover:text-slate-900 hover:bg-[#faf5f3] border border-[#eedad5]'
              }`}
            >
              Páginas Iniciais
            </button>
            <button
              type="button"
              onClick={() => setTemplateCategory('custom')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                effectiveCategory === 'custom'
                  ? 'bg-gradient-to-r from-[#b84a56] to-[#c45663] text-white font-black shadow-xs'
                  : 'bg-white text-slate-700 hover:text-[#b84a56] hover:bg-[#faf5f3] border border-[#eedad5]'
              }`}
            >
              Meus Modelos ⭐
            </button>
          </div>
        </div>

        {/* Corpo com Grid de Cards */}
        <div className="p-6 sm:p-8 overflow-y-auto max-h-[68vh] custom-scrollbar space-y-6 bg-[#faf6f4]">
          {(effectiveCategory === 'agenda' || effectiveCategory === 'planner' || effectiveCategory === 'notebook') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {activeList.map((opt) => {
                const isBlank = opt.isPureBlank || opt.id === 'notebook_liso' || opt.id === 'agenda_em_branco' || opt.id === 'planner_em_branco';
                return (
                  <div
                    key={opt.id}
                    className={`group bg-white hover:bg-[#fff9f8] p-6 rounded-3xl border-2 transition-all flex flex-col justify-between text-left gap-4 relative overflow-hidden shadow-xs hover:shadow-lg ${
                      isBlank 
                        ? 'border-amber-300 hover:border-amber-400 bg-amber-50/20' 
                        : 'border-[#eedad5] hover:border-[#b84a56]'
                    }`}
                  >
                    {/* Topo do Card: Ícone + Tag */}
                    <div className="flex items-center justify-between gap-3">
                      <div className={`w-13 h-13 bg-[#fdeeed] border rounded-2xl flex items-center justify-center transition-all ${
                        isBlank
                          ? 'border-amber-300 group-hover:scale-105 bg-amber-50'
                          : 'border-[#f5ded9] group-hover:scale-105'
                      }`}>
                        {renderObjectiveIcon(opt.iconName)}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-colors border ${
                        isBlank
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : 'bg-[#fdeeed] text-[#b84a56] border-[#f5ded9]'
                      }`}>
                        {opt.tag}
                      </span>
                    </div>

                    {/* Título e Descrição */}
                    <div className="space-y-1.5 flex-1">
                      <h3 className={`text-lg font-black transition-colors ${
                        isBlank ? 'text-slate-900 group-hover:text-amber-800' : 'text-slate-900 group-hover:text-[#b84a56]'
                      }`}>
                        {opt.title}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed font-medium">
                        {opt.subtitle}
                      </p>
                    </div>

                    {/* Barra de Ações do Card */}
                    <div className="pt-3 border-t border-[#eedad5] flex items-center justify-between gap-2.5">
                      <button
                        type="button"
                        onClick={() => handleApplyOption(opt, true)}
                        className="flex-1 py-2.5 px-3 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-[#eedad5] hover:border-[#b84a56]"
                        title="Aplica somente o Miolo mantendo suas Páginas Iniciais e Divisórias atuais"
                      >
                        <Layout className="w-3.5 h-3.5 text-[#b84a56]" />
                        <span>{isBlank ? 'Só o Miolo Limpo' : 'Só o Miolo'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyOption(opt, false)}
                        className="flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs bg-gradient-to-r from-[#b84a56] to-[#c45663] hover:from-[#a83f4b] hover:to-[#b84a56] text-white"
                        title="Aplica o Modelo Completo com todas as páginas e divisórias"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-white" />
                        <span>{isBlank ? 'Projeto do Zero' : 'Modelo Completo'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Seção de Páginas Iniciais */}
          {effectiveCategory === 'intro' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {INTRO_TEMPLATES.map((template) => (
                <div 
                  key={template.id} 
                  className="group bg-white hover:bg-[#fff9f8] p-5 rounded-3xl border-2 border-[#eedad5] hover:border-[#b84a56] transition-all flex flex-col justify-between text-left gap-3 shadow-xs hover:shadow-lg"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="w-12 h-12 bg-[#fdeeed] border border-[#f5ded9] rounded-2xl flex items-center justify-center group-hover:scale-105 transition-all">
                      <FileText className="w-6 h-6 text-[#b84a56]" />
                    </div>
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#fdeeed] text-[#b84a56] border border-[#f5ded9]">
                      {template.elements.length} elementos editáveis
                    </span>
                  </div>
                  <div className="space-y-1 flex-1">
                    <h4 className="text-base font-black text-slate-900 group-hover:text-[#b84a56] transition-colors">
                      {template.name}
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      Página inicial padronizada para compor os dados ou planejamento do início da agenda.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-[#eedad5] flex justify-end">
                    <button
                      type="button"
                      onClick={() => addIntroTemplate(template)}
                      className="w-full py-2.5 px-3 bg-gradient-to-r from-[#b84a56] to-[#c45663] hover:from-[#a83f4b] hover:to-[#b84a56] text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5 text-white" />
                      <span>Adicionar Página Inicial</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Seção de Meus Modelos */}
          {effectiveCategory === 'custom' && (
            <div className="space-y-5 w-full">
              {/* Gerenciador de Backup e Ações Rápidas */}
              <div className="bg-white border border-[#eedad5] rounded-2xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#fdeeed] border border-[#f5ded9] flex items-center justify-center text-[#b84a56] shrink-0">
                    <Star className="w-5 h-5 fill-[#b84a56]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 leading-tight">Meus Modelos Personalizados</h4>
                    <p className="text-xs text-slate-600 mt-0.5 leading-normal">
                      Salve seus layouts de <b>Miolo</b> ou <b>Páginas</b> para reutilizar sempre que quiser ou exportar em <code className="bg-[#fdeeed] text-[#b84a56] px-1.5 py-0.5 rounded font-mono text-[10px] font-bold">.json</code>.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap self-start md:self-center">
                  {saveCurrentMioloAsTemplate && (
                    <button
                      type="button"
                      onClick={saveCurrentMioloAsTemplate}
                      className="flex items-center gap-1.5 text-xs text-white bg-gradient-to-r from-[#b84a56] to-[#c45663] hover:from-[#a83f4b] hover:to-[#b84a56] font-black px-3.5 py-1.5 rounded-xl transition-all shadow-xs cursor-pointer active:scale-95"
                      title="Salvar o layout do Miolo que você está editando agora no canvas como um novo modelo"
                    >
                      <Star className="w-3.5 h-3.5 fill-white text-white" />
                      <span>Salvar Miolo Atual</span>
                    </button>
                  )}

                  <div className="flex bg-[#faf6f4] rounded-xl p-1 border border-[#eedad5] gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={exportCustomTemplates}
                      disabled={customTemplates.length === 0}
                      className="flex items-center gap-1.5 text-xs text-slate-700 hover:text-slate-900 font-bold hover:bg-white px-3 py-1.5 rounded-lg transition-all disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer"
                      title="Exportar modelos como arquivo .json"
                    >
                      <Download className="w-3.5 h-3.5 text-[#b84a56]" />
                      <span>Exportar</span>
                    </button>
                    <div className="w-px bg-[#eedad5] my-1"></div>
                    <button
                      type="button"
                      onClick={() => templateFileInputRef.current?.click()}
                      className="flex items-center gap-1.5 text-xs text-slate-700 hover:text-[#b84a56] font-bold hover:bg-white px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                      title="Importar modelos de um arquivo .json"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#b84a56]" />
                      <span>Importar</span>
                    </button>
                    <input
                      type="file"
                      ref={templateFileInputRef}
                      onChange={importCustomTemplates}
                      accept=".json"
                      className="hidden"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {customTemplates.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-slate-500 bg-white border border-[#eedad5] rounded-3xl p-8 flex flex-col items-center justify-center gap-3">
                    <Star className="w-12 h-12 text-[#b84a56] animate-bounce fill-[#b84a56]/20" />
                    <p className="font-black text-slate-800 text-base">Você ainda não tem modelos salvos</p>
                    <p className="text-xs text-slate-600 max-w-md leading-relaxed">
                      Você pode salvar tanto o <b>Miolo Diário/Semanal</b> quanto <b>Páginas Iniciais e Mensais</b>:
                    </p>
                    <div className="text-xs text-left bg-[#faf6f4] p-4 rounded-2xl border border-[#eedad5] space-y-2 max-w-md text-slate-700">
                      <div className="flex items-start gap-2">
                        <span className="text-[#b84a56] font-bold">1.</span>
                        <span><b>Salvar Miolo:</b> Clique no botão acima <em>"Salvar Miolo Atual"</em> ou na barra lateral esquerda em <em>Modelos &gt; Salvar Miolo Atual</em>.</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-[#b84a56] font-bold">2.</span>
                        <span><b>Salvar Páginas:</b> Na barra lateral esquerda em <em>Páginas Iniciais</em> ou <em>Páginas Mensais</em>, clique na estrela (⭐) ao lado de qualquer página.</span>
                      </div>
                    </div>
                    {saveCurrentMioloAsTemplate && (
                      <button
                        type="button"
                        onClick={saveCurrentMioloAsTemplate}
                        className="mt-2 px-5 py-2.5 bg-gradient-to-r from-[#b84a56] to-[#c45663] text-white rounded-xl text-xs font-black shadow-xs hover:opacity-95 transition-all cursor-pointer flex items-center gap-2"
                      >
                        <Star className="w-4 h-4 fill-white" />
                        <span>Salvar Miolo Atual Agora</span>
                      </button>
                    )}
                  </div>
                ) : (
                  customTemplates.map(template => {
                    const isMiolo = template.templateType === 'miolo' || template.id.startsWith('miolo-');
                    return (
                      <div 
                        key={template.id}
                        className="group bg-white hover:bg-[#fff9f8] border-2 border-[#eedad5] hover:border-[#b84a56] rounded-3xl overflow-hidden transition-all flex flex-col justify-between shadow-xs"
                      >
                        <div className="p-5 flex-1 space-y-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-[#fdeeed] border border-[#f5ded9] flex items-center justify-center text-[#b84a56]">
                              {isMiolo ? <Layout className="w-4 h-4 text-[#b84a56]" /> : <Star className="w-4 h-4 fill-[#b84a56]" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="text-sm font-black text-slate-900 truncate">{template.name}</h5>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                  isMiolo 
                                    ? 'bg-[#fdeeed] text-[#b84a56] border border-[#f5ded9]' 
                                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                                }`}>
                                  {isMiolo ? 'Modelo de Miolo' : 'Página Avulsa'}
                                </span>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                  {template.elements.length} elementos
                                </span>
                              </div>
                            </div>
                          </div>
                          <p className="text-[11px] text-slate-600 leading-relaxed bg-[#faf6f4] p-2.5 rounded-xl border border-[#eedad5]">
                            {isMiolo 
                              ? 'Layout completo de miolo diário ou semanal. Pode ser reaplicado no miolo ou inserido como página.'
                              : 'Layout de página personalizada. Pode ser inserido como Página Inicial, Mensal ou aplicado no Miolo.'}
                          </p>
                        </div>
                        <div className="p-3 border-t border-[#eedad5] bg-[#faf6f4] flex items-center justify-between gap-2 flex-wrap">
                          <button 
                            onClick={(e) => { e.stopPropagation(); deleteCustomTemplate(template.id, template.name); }}
                            className="text-xs text-slate-500 hover:text-red-500 font-bold hover:bg-white py-1.5 px-2.5 rounded-lg transition-colors cursor-pointer"
                            title="Excluir Modelo"
                          >
                            Excluir
                          </button>
                          <div className="flex items-center gap-1.5">
                            <button 
                              type="button"
                              onClick={() => applyCustomTemplate(template, isMiolo ? 'page' : 'miolo')}
                              className="text-[11px] text-slate-600 hover:text-[#b84a56] font-bold hover:bg-white border border-[#eedad5] py-1.5 px-2.5 rounded-lg transition-colors cursor-pointer"
                              title={isMiolo ? 'Inserir como Página Inicial/Mensal' : 'Aplicar desenho no Miolo Atual'}
                            >
                              {isMiolo ? '+ Como Página' : 'No Miolo'}
                            </button>
                            <button 
                              type="button"
                              onClick={() => applyCustomTemplate(template, isMiolo ? 'miolo' : 'page')}
                              className="text-xs bg-gradient-to-r from-[#b84a56] to-[#c45663] text-white font-black py-1.5 px-3 rounded-lg shadow-xs transition-all uppercase tracking-wider cursor-pointer active:scale-95"
                              title={isMiolo ? 'Substituir elementos do Miolo Atual com este modelo' : 'Inserir como Página'}
                            >
                              {isMiolo ? 'Aplicar no Miolo' : 'Inserir Página'}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Rodapé informativo */}
        <div className="p-4 border-t border-[#eedad5] bg-white text-center flex flex-col sm:flex-row items-center justify-between gap-3 px-6">
          <span className="text-[11px] text-slate-600 font-medium">
            💡 <strong>Só o Miolo:</strong> altera apenas a diagramação diária preservando suas páginas iniciais e divisórias.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-[#9f3d4a] hover:text-[#7e2d38] bg-[#fff5f5] hover:bg-[#fdeeed] border border-[#eedad5] rounded-xl transition-all cursor-pointer shadow-xs"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
