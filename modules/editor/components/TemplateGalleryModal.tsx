import React from 'react';
import { 
  Sparkles, X, Layout, Square, Plus, Download, Upload, Star, FileText
} from 'lucide-react';
import { AgendaConfig, LayoutElement, IntroPage } from '../../../types';
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
  customTemplates: IntroPage[];
  exportCustomTemplates: () => void;
  importCustomTemplates: (e: React.ChangeEvent<HTMLInputElement>) => void;
  deleteCustomTemplate: (id: string, name: string) => void;
  applyCustomTemplate: (template: IntroPage) => void;
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
        elements: newElements,
        ...(mioloOnly ? {} : { introPages: [] })
      }));
      onClose();
      setToastMessage(`Caderno "${opt.title}" aplicado com sucesso!`);
      return;
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 no-print overflow-y-auto" 
      onClick={onClose}
    >
      <div 
        className="bg-stone-950 text-white rounded-3xl border border-stone-800 shadow-2xl w-full max-w-5xl my-auto flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200" 
        onClick={e => e.stopPropagation()}
      >
        {/* Header no estilo idêntico à página inicial */}
        <div className="p-6 sm:p-8 pb-5 relative border-b border-stone-850">
          {/* Ações superiores: Importar PDF e Botão Fechar */}
          <div className="absolute top-6 right-6 flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                setPdfImportModalOpen(true);
              }}
              className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-orange-400 hover:text-orange-300 bg-stone-900 hover:bg-stone-850 border border-stone-800 px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-xs"
              title="Importar layout editável de PDF (CorelDraw, Canva, Illustrator)"
            >
              <Sparkles className="w-3.5 h-3.5 text-orange-400" />
              <span>Importar PDF (Corel)</span>
            </button>
            <button 
              type="button"
              onClick={onClose} 
              className="text-stone-400 hover:text-white bg-stone-900 hover:bg-stone-850 border border-stone-800 p-2.5 rounded-xl transition-all cursor-pointer shadow-xs"
              title="Fechar"
            >
              <X className="w-5 h-5"/>
            </button>
          </div>

          {/* Título e Subtítulo */}
          <div className="text-center space-y-2 max-w-2xl mx-auto pt-1 sm:pt-2">
            <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 px-4 py-1.5 rounded-full text-xs font-bold text-orange-400 uppercase tracking-widest shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-orange-400" />
              <span>Catálogo de Modelos • Coleção Pastel</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
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
            <p className="text-xs sm:text-sm text-stone-400 font-medium">
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

          {/* Abas Superiores no Estilo Dark Luxury */}
          <div className="flex items-center justify-center gap-2 flex-wrap pt-5">
            <button
              type="button"
              onClick={() => setTemplateCategory('agenda')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                effectiveCategory === 'agenda'
                  ? 'bg-orange-500 text-stone-950 font-black shadow-md'
                  : 'bg-stone-900 text-stone-400 hover:text-white hover:bg-stone-850 border border-stone-800'
              }`}
            >
              Agenda
            </button>
            <button
              type="button"
              onClick={() => setTemplateCategory('planner')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                effectiveCategory === 'planner'
                  ? 'bg-orange-500 text-stone-950 font-black shadow-md'
                  : 'bg-stone-900 text-stone-400 hover:text-white hover:bg-stone-850 border border-stone-800'
              }`}
            >
              Planner
            </button>
            <button
              type="button"
              onClick={() => setTemplateCategory('notebook')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                effectiveCategory === 'notebook'
                  ? 'bg-orange-500 text-stone-950 font-black shadow-md'
                  : 'bg-stone-900 text-stone-400 hover:text-white hover:bg-stone-850 border border-stone-800'
              }`}
            >
              Caderno
            </button>
            <button
              type="button"
              onClick={() => setTemplateCategory('intro')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                effectiveCategory === 'intro'
                  ? 'bg-orange-500 text-stone-950 font-black shadow-md'
                  : 'bg-stone-900 text-stone-400 hover:text-white hover:bg-stone-850 border border-stone-800'
              }`}
            >
              Páginas Iniciais
            </button>
            <button
              type="button"
              onClick={() => setTemplateCategory('custom')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                effectiveCategory === 'custom'
                  ? 'bg-amber-500 text-stone-950 font-black shadow-md'
                  : 'bg-stone-900 text-stone-400 hover:text-amber-400 hover:bg-stone-850 border border-stone-800'
              }`}
            >
              Meus Modelos ⭐
            </button>
          </div>
        </div>

        {/* Corpo com Grid de Cards */}
        <div className="p-6 sm:p-8 overflow-y-auto max-h-[68vh] custom-scrollbar space-y-6 bg-stone-950/60">
          {(effectiveCategory === 'agenda' || effectiveCategory === 'planner' || effectiveCategory === 'notebook') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {activeList.map((opt) => {
                const isBlank = opt.isPureBlank || opt.id === 'notebook_liso' || opt.id === 'agenda_em_branco' || opt.id === 'planner_em_branco';
                return (
                  <div
                    key={opt.id}
                    className={`group bg-stone-900 hover:bg-stone-850 p-6 rounded-3xl border-2 transition-all flex flex-col justify-between text-left gap-4 relative overflow-hidden shadow-lg hover:shadow-2xl ${
                      isBlank 
                        ? 'border-amber-500/50 hover:border-amber-400 bg-amber-950/10 hover:shadow-amber-500/10' 
                        : 'border-stone-800 hover:border-orange-500/80 hover:shadow-orange-500/10'
                    }`}
                  >
                    {/* Topo do Card: Ícone + Tag */}
                    <div className="flex items-center justify-between gap-3">
                      <div className={`w-13 h-13 bg-stone-800 border rounded-2xl flex items-center justify-center transition-all shadow-inner ${
                        isBlank
                          ? 'border-amber-500/30 group-hover:scale-105 group-hover:bg-amber-500/15 group-hover:border-amber-500/50'
                          : 'border-stone-700/80 group-hover:scale-105 group-hover:bg-orange-500/15 group-hover:border-orange-500/40'
                      }`}>
                        {renderObjectiveIcon(opt.iconName)}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-colors border ${
                        isBlank
                          ? 'bg-amber-500/15 text-amber-300 border-amber-500/30 group-hover:border-amber-400'
                          : 'bg-stone-800 text-stone-300 border-stone-700 group-hover:border-orange-500/40 group-hover:text-orange-300'
                      }`}>
                        {opt.tag}
                      </span>
                    </div>

                    {/* Título e Descrição */}
                    <div className="space-y-1.5 flex-1">
                      <h3 className={`text-lg font-black transition-colors ${
                        isBlank ? 'text-white group-hover:text-amber-300' : 'text-white group-hover:text-orange-400'
                      }`}>
                        {opt.title}
                      </h3>
                      <p className="text-xs text-stone-400 leading-relaxed font-medium">
                        {opt.subtitle}
                      </p>
                    </div>

                    {/* Barra de Ações do Card */}
                    <div className="pt-3 border-t border-stone-800 flex items-center justify-between gap-2.5">
                      <button
                        type="button"
                        onClick={() => handleApplyOption(opt, true)}
                        className="flex-1 py-2 px-3 bg-stone-800 hover:bg-stone-750 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-stone-700 hover:border-orange-500/50"
                        title="Aplica somente o Miolo mantendo suas Páginas Iniciais e Divisórias atuais"
                      >
                        <Layout className="w-3.5 h-3.5 text-orange-400" />
                        <span>{isBlank ? 'Só o Miolo Limpo' : 'Só o Miolo'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyOption(opt, false)}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md ${
                          isBlank
                            ? 'bg-amber-500 hover:bg-amber-400 text-stone-950'
                            : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-stone-950'
                        }`}
                        title="Aplica o Modelo Completo com todas as páginas e divisórias"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-stone-950" />
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
                  className="group bg-stone-900 hover:bg-stone-850 p-5 rounded-3xl border-2 border-stone-800 hover:border-orange-500/80 transition-all flex flex-col justify-between text-left gap-3 shadow-lg hover:shadow-2xl"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="w-12 h-12 bg-stone-800 border border-stone-700/80 rounded-2xl flex items-center justify-center group-hover:scale-105 group-hover:bg-orange-500/15 group-hover:border-orange-500/40 transition-all">
                      <FileText className="w-6 h-6 text-orange-400" />
                    </div>
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-stone-800 text-stone-300 border border-stone-700">
                      {template.elements.length} elementos editáveis
                    </span>
                  </div>
                  <div className="space-y-1 flex-1">
                    <h4 className="text-base font-black text-white group-hover:text-orange-400 transition-colors">
                      {template.name}
                    </h4>
                    <p className="text-xs text-stone-400 leading-relaxed font-medium">
                      Página inicial padronizada para compor os dados ou planejamento do início da agenda.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-stone-800 flex justify-end">
                    <button
                      type="button"
                      onClick={() => addIntroTemplate(template)}
                      className="w-full py-2.5 px-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-stone-950 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <Plus className="w-3.5 h-3.5 text-stone-950" />
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
              {/* Gerenciador de Backup de Modelos */}
              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                    <Star className="w-5 h-5 fill-amber-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white leading-tight">Backup de Modelos Personalizados</h4>
                    <p className="text-xs text-stone-400 mt-0.5 leading-normal">
                      Salve seus modelos no computador em formato <code className="bg-stone-800 text-amber-300 px-1.5 py-0.5 rounded font-mono text-[10px] font-bold">.json</code> para guardá-los ou usá-los em outro navegador.
                    </p>
                  </div>
                </div>
                <div className="flex bg-stone-850 rounded-xl p-1 border border-stone-800 gap-1 shrink-0 self-start sm:self-center">
                  <button
                    type="button"
                    onClick={exportCustomTemplates}
                    disabled={customTemplates.length === 0}
                    className="flex items-center gap-1.5 text-xs text-stone-300 hover:text-white font-bold hover:bg-stone-800 px-3 py-1.5 rounded-lg transition-all disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-stone-500 cursor-pointer"
                    title="Exportar modelos como arquivo .json"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-400" />
                    <span>Exportar</span>
                  </button>
                  <div className="w-px bg-stone-750 my-1"></div>
                  <button
                    type="button"
                    onClick={() => templateFileInputRef.current?.click()}
                    className="flex items-center gap-1.5 text-xs text-stone-300 hover:text-white font-bold hover:bg-stone-800 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                    title="Importar modelos de um arquivo .json"
                  >
                    <Upload className="w-3.5 h-3.5 text-orange-400" />
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

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {customTemplates.length === 0 ? (
                  <div className="col-span-full text-center py-16 text-stone-400 bg-stone-900 border border-stone-800 rounded-3xl p-8 flex flex-col items-center justify-center gap-3">
                    <Star className="w-12 h-12 text-amber-400 animate-bounce fill-amber-400/20" />
                    <p className="font-black text-white text-base">Você ainda não tem modelos salvos</p>
                    <p className="text-xs text-stone-400 max-w-sm leading-relaxed">
                      Para salvar um modelo personalizado, vá na barra lateral esquerda em <b>Páginas Iniciais</b> ou <b>Páginas Mensais</b>, clique na estrela (⭐) ao lado de qualquer página e salve como seu modelo! Ele ficará disponível aqui.
                    </p>
                  </div>
                ) : (
                  customTemplates.map(template => (
                    <div 
                      key={template.id}
                      className="group bg-stone-900 hover:bg-stone-850 border-2 border-stone-800 hover:border-amber-400/70 rounded-3xl overflow-hidden transition-all flex flex-col justify-between shadow-lg"
                    >
                      <div className="p-5 flex-1 space-y-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                            <Star className="w-4 h-4 fill-amber-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="text-sm font-black text-white truncate">{template.name}</h5>
                            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">{template.elements.length} elementos</span>
                          </div>
                        </div>
                        <p className="text-[11px] text-stone-400 leading-relaxed bg-stone-950/60 p-2.5 rounded-xl border border-stone-800">
                          Este modelo pode ser inserido como Página Inicial ou Página Mensal.
                        </p>
                      </div>
                      <div className="p-3 border-t border-stone-800 bg-stone-950/40 flex items-center justify-between gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); deleteCustomTemplate(template.id, template.name); }}
                          className="text-xs text-stone-400 hover:text-red-400 font-bold hover:bg-stone-800 py-1.5 px-3 rounded-lg transition-colors cursor-pointer"
                          title="Excluir Modelo"
                        >
                          Excluir
                        </button>
                        <button 
                          onClick={() => applyCustomTemplate(template)}
                          className="text-xs bg-amber-500 hover:bg-amber-400 text-stone-950 font-black py-1.5 px-3 rounded-lg shadow-md transition-all uppercase tracking-wider cursor-pointer"
                        >
                          Aplicar
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Rodapé informativo */}
        <div className="p-4 border-t border-stone-800 bg-stone-900/60 text-center flex flex-col sm:flex-row items-center justify-between gap-3 px-6">
          <span className="text-[11px] text-stone-400 font-medium">
            💡 <strong>Só o Miolo:</strong> altera apenas a diagramação diária preservando suas páginas iniciais e divisórias.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold text-stone-400 hover:text-white bg-stone-800 hover:bg-stone-750 border border-stone-700 rounded-xl transition-all cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
