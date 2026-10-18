import React, { useState, useEffect } from 'react';
import { AgendaConfig, PageSize, PageOrientation, PageMargins, PageLayoutType, Holiday, LayoutElement, ProjectType } from '../../types';
import { FileText, BookOpen, ArrowRight, ArrowLeft, Settings, Grid, Columns, Upload, Plus, Trash2, Calendar, ClipboardList, PenTool, LogOut, Lock, Zap, Sparkles, DollarSign, Clock, Wallet, Heart, CheckSquare, Grid3X3, ListTodo, Square, Check } from 'lucide-react';
import { importProject } from '../../core/logic/fileSystem';
import { isProjectYearRestricted, generateHolidayListFullText, HolidayDateFormat } from '../../core/backend/calendar';
import { WEEKLY_VERTICAL_LEFT, WEEKLY_VERTICAL_RIGHT, WEEKLY_HORIZONTAL_LEFT, WEEKLY_HORIZONTAL_RIGHT, WEEKLY_ONE_PAGE_VERTICAL, WEEKLY_ONE_PAGE_HORIZONTAL } from './templates/plannerTemplates';
import { DAILY_CLASSIC, DAILY_FINANCIAL, DAILY_APPOINTMENT_PRO, DAILY_PLANNER_COMMON, APPOINTMENT_2DPP_TOP, APPOINTMENT_2DPP_BOTTOM } from './templates/dailyTemplates';
import { INTRO_TEMPLATES } from './templates/introTemplates';
import { NOTEBOOK_TEMPLATES, DEVOTIONAL_TEMPLATES } from './templates/extraTemplates';
import { buildStandardAgendaConfig } from './templates/standardAgendaTemplate';
import { LAYOUT_LIBRARY, LayoutLibraryItem, resolveLayoutLibraryConfig } from './templates/layoutLibrary';

interface InitialSetupProps {
  onComplete: (config: Partial<AgendaConfig>) => void;
  userEmail: string;
  defaultValues?: Partial<AgendaConfig>;
  onLogout?: () => void;
  userPlan?: string;
}

const PAGE_SIZES: Record<PageSize, { name: string, w: number, h: number }> = {
    'A5': { name: 'A5 (Padrão Agenda)', w: 148, h: 210 },
    'A4': { name: 'A4 (Sulfite)', w: 210, h: 297 },
    'Letter': { name: 'Carta (Letter)', w: 216, h: 279 },
    'Custom': { name: 'Personalizado', w: 148, h: 210 }
};

export interface ObjectiveModelOption {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  iconName: 'calendar' | 'dollar' | 'clock' | 'sparkles' | 'columns' | 'check' | 'wallet' | 'book' | 'lines' | 'dots' | 'grid' | 'square';
  libraryItemId?: string;
  defaultLayout: PageLayoutType;
  defaultName: string;
  notebookElements?: LayoutElement[];
  isPureBlank?: boolean;
}

export const AGENDA_OBJECTIVE_OPTIONS: ObjectiveModelOption[] = [
  {
    id: 'agenda_diaria',
    title: 'Agenda Diária',
    subtitle: 'Planejamento diário completo com horários (07h às 20h), prioridades e compromissos.',
    tag: 'Mais Utilizada',
    iconName: 'calendar',
    libraryItemId: 'agenda-padrao-completa',
    defaultLayout: '1_per_page',
    defaultName: 'Minha Agenda Diária'
  },
  {
    id: 'agenda_em_branco',
    title: 'Começar com Layout em Branco',
    subtitle: 'Página 100% limpa em branco com margens prontas para você desenhar seu próprio miolo do zero.',
    tag: 'Folha em Branco',
    iconName: 'square',
    libraryItemId: 'layout-em-branco',
    defaultLayout: '1_per_page',
    defaultName: 'Minha Agenda em Branco',
    isPureBlank: true
  },
  {
    id: 'agenda_financeira',
    title: 'Agenda Financeira',
    subtitle: 'Fluxo de caixa diário, entradas, saídas, formas de pagamento e fechamento diário.',
    tag: 'Caixa & Finanças',
    iconName: 'dollar',
    libraryItemId: 'planner-financeiro',
    defaultLayout: '1_per_page',
    defaultName: 'Minha Agenda Financeira'
  },
  {
    id: 'agenda_agendamento',
    title: 'Agendamento & Clientes',
    subtitle: 'Horários detalhados para atendimento de clientes, serviços, valores e status de pagamento.',
    tag: 'Salões & Clínicas',
    iconName: 'clock',
    libraryItemId: 'agenda-agendamento-profissional',
    defaultLayout: '1_per_page',
    defaultName: 'Agenda de Agendamentos'
  },
  {
    id: 'agenda_permanente',
    title: 'Agenda Permanente',
    subtitle: 'Sem datas pré-fixadas no miolo, ideal para começar e usar em qualquer época do ano.',
    tag: 'Não Datada',
    iconName: 'sparkles',
    libraryItemId: 'agenda-padrao-completa',
    defaultLayout: '1_per_page',
    defaultName: 'Minha Agenda Permanente'
  }
];

export const PLANNER_OBJECTIVE_OPTIONS: ObjectiveModelOption[] = [
  {
    id: 'planner_semanal',
    title: 'Planner Semanal',
    subtitle: 'Visão dos 7 dias da semana aberta em duas páginas com rastreador de hábitos e metas.',
    tag: 'Semanal Completo',
    iconName: 'columns',
    libraryItemId: 'planner-semanal-vertical',
    defaultLayout: 'weekly_vertical',
    defaultName: 'Meu Planner Semanal'
  },
  {
    id: 'planner_em_branco',
    title: 'Começar com Layout em Branco',
    subtitle: 'Páginas em branco sem grades ou blocos pré-definidos para você desenhar seu próprio planner do zero.',
    tag: 'Folha em Branco',
    iconName: 'square',
    libraryItemId: 'planner-em-branco',
    defaultLayout: 'weekly_vertical',
    defaultName: 'Meu Planner em Branco',
    isPureBlank: true
  },
  {
    id: 'planner_diario',
    title: 'Planner Diário de Foco',
    subtitle: 'Alta produtividade com blocos de tempo (time blocking), prioridades e checklists.',
    tag: 'Produtividade',
    iconName: 'check',
    libraryItemId: 'planner-diario-comum',
    defaultLayout: '1_per_page',
    defaultName: 'Meu Planner Diário'
  },
  {
    id: 'planner_financeiro',
    title: 'Planner Financeiro',
    subtitle: 'Planejamento e controle de receitas, despesas, orçamentos e metas financeiras.',
    tag: 'Finanças Pessoais',
    iconName: 'wallet',
    libraryItemId: 'planner-financeiro-pessoal',
    defaultLayout: '1_per_page',
    defaultName: 'Meu Planner Financeiro'
  },
  {
    id: 'planner_estudos',
    title: 'Planner de Estudos & Rotina',
    subtitle: 'Cronograma de matérias, métodos de estudo, leituras e rotina de hábitos diários.',
    tag: 'Estudos & Concursos',
    iconName: 'book',
    libraryItemId: 'planner-estudos',
    defaultLayout: '1_per_page',
    defaultName: 'Meu Planner de Estudos'
  }
];

export const NOTEBOOK_OBJECTIVE_OPTIONS: ObjectiveModelOption[] = [
  {
    id: 'notebook_pautado',
    title: 'Caderno Pautado',
    subtitle: 'Linhas horizontais clássicas espaçadas para escrita confortável, anotações e resumos.',
    tag: 'Linhas Clássicas',
    iconName: 'lines',
    defaultLayout: 'notebook',
    defaultName: 'Meu Caderno Pautado',
    notebookElements: NOTEBOOK_TEMPLATES[0].elements as LayoutElement[]
  },
  {
    id: 'notebook_pontilhado',
    title: 'Caderno Pontilhado',
    subtitle: 'Grade de micropontos discretos para Bullet Journal, anotações livres e esboços.',
    tag: 'Bullet Journal',
    iconName: 'dots',
    defaultLayout: 'notebook',
    defaultName: 'Meu Caderno Pontilhado',
    notebookElements: (NOTEBOOK_TEMPLATES.find(t => t.id === 'nb-pontilhado')?.elements || NOTEBOOK_TEMPLATES[0].elements) as LayoutElement[]
  },
  {
    id: 'notebook_quadriculado',
    title: 'Caderno Quadriculado',
    subtitle: 'Grade quadriculada de 5mm para tabelas, cálculos, listas e geometria.',
    tag: 'Grid 5mm',
    iconName: 'grid',
    defaultLayout: 'notebook',
    defaultName: 'Meu Caderno Quadriculado',
    notebookElements: [{ id: 'grid-nb', type: 'note_grid' as const, x: 10, y: 10, w: 80, h: 80, zIndex: 1, style: { variant: 'grid', color: '#e5e7eb' } }]
  },
  {
    id: 'notebook_liso',
    title: 'Caderno Liso (Em Branco)',
    subtitle: 'Páginas em branco sem linhas para rascunhos livres, ideias e ilustrações.',
    tag: 'Páginas em Branco',
    iconName: 'square',
    defaultLayout: 'notebook',
    defaultName: 'Meu Caderno Liso',
    notebookElements: []
  }
];

export const renderObjectiveIcon = (iconName: ObjectiveModelOption['iconName']) => {
  switch (iconName) {
    case 'calendar': return <Calendar className="w-6 h-6 text-[#b84a56]" />;
    case 'dollar': return <DollarSign className="w-6 h-6 text-[#9f3d4a]" />;
    case 'clock': return <Clock className="w-6 h-6 text-[#b84a56]" />;
    case 'sparkles': return <Sparkles className="w-6 h-6 text-[#c45663]" />;
    case 'columns': return <Columns className="w-6 h-6 text-[#b84a56]" />;
    case 'check': return <CheckSquare className="w-6 h-6 text-[#b84a56]" />;
    case 'wallet': return <Wallet className="w-6 h-6 text-[#9f3d4a]" />;
    case 'book': return <BookOpen className="w-6 h-6 text-[#b84a56]" />;
    case 'lines': return <FileText className="w-6 h-6 text-[#b84a56]" />;
    case 'dots': return <Grid3X3 className="w-6 h-6 text-[#b84a56]" />;
    case 'grid': return <Grid className="w-6 h-6 text-[#b84a56]" />;
    case 'square': return <Square className="w-6 h-6 text-[#b84a56]" />;
    default: return <Sparkles className="w-6 h-6 text-[#c45663]" />;
  }
};

export const InitialSetup: React.FC<InitialSetupProps> = ({ onComplete, userEmail, defaultValues, onLogout, userPlan = 'pro' }) => {
  const [step, setStep] = useState<'type' | 'library' | 'template' | 'config'>(defaultValues ? 'config' : 'type');
  const [projectType, setProjectType] = useState<ProjectType | null>(defaultValues?.projectType || null);
  const [templateCategory, setTemplateCategory] = useState<'intro' | 'planner'>('intro');
  const [plannerStyle, setPlannerStyle] = useState<'blank' | 'lines' | 'dots' | 'grid' | 'timetable'>('lines');
  const [selectedIntroTemplate, setSelectedIntroTemplate] = useState<string | null>(null);
  const [selectedTemplateElements, setSelectedTemplateElements] = useState<LayoutElement[] | null>(null);
  const [useStandardAgendaModel, setUseStandardAgendaModel] = useState<boolean>(!defaultValues);
  const [selectedLibraryItemId, setSelectedLibraryItemId] = useState<string>('agenda-padrao-completa');
  const [variationCategoryFilter, setVariationCategoryFilter] = useState<string>('all');
  const [isSelectionExplicit, setIsSelectionExplicit] = useState(false);
  const [projectName, setProjectName] = useState(defaultValues?.name || 'Meu Novo Projeto');
  const [year, setYear] = useState(defaultValues?.year || new Date().getFullYear() + 1);
  const [pageSize, setPageSize] = useState<PageSize>(defaultValues?.pageSize || 'A5');
  const [customWidth, setCustomWidth] = useState(defaultValues?.customPageSize?.width || 148);
  const [customHeight, setCustomHeight] = useState(defaultValues?.customPageSize?.height || 210);
  const [orientation, setOrientation] = useState<PageOrientation>(defaultValues?.orientation || 'portrait');
  const [margins, setMargins] = useState<PageMargins>(defaultValues?.margins || { top: 15, bottom: 15, inside: 15, outside: 15 });
  const [mirrorEvenPages, setMirrorEvenPages] = useState(defaultValues?.mirrorEvenPages ?? true);
  const [mirrorContentOnVerso, setMirrorContentOnVerso] = useState<boolean>(defaultValues?.mirrorContentOnVerso ?? false);
  const [customVerso, setCustomVerso] = useState(defaultValues?.customVerso ?? false);
  const [versoAdvancesSequence, setVersoAdvancesSequence] = useState<boolean>(defaultValues?.versoAdvancesSequence ?? true);
  const [layoutType, setLayoutType] = useState<PageLayoutType>(defaultValues?.layoutType || '1_per_page');
  const [municipalHolidays, setMunicipalHolidays] = useState<Holiday[]>(defaultValues?.municipalHolidays || []);
  const [startMonth, setStartMonth] = useState<number>(defaultValues?.startMonth ?? 0);
  const [durationMonths, setDurationMonths] = useState<number>(defaultValues?.durationMonths ?? 12);

  const [startMonthOnRightPage, setStartMonthOnRightPage] = useState<boolean>(defaultValues?.startMonthOnRightPage ?? true);
  const [includeMonthlyDividers, setIncludeMonthlyDividers] = useState<boolean>(defaultValues?.includeMonthlyDividers ?? true);
  const [includeMonthlyIntroPages, setIncludeMonthlyIntroPages] = useState<boolean>(defaultValues?.includeMonthlyIntroPages ?? true);
  const [fillerPageContent, setFillerPageContent] = useState<string>(defaultValues?.fillerPageContent ?? 'blank');
  const [monthlyDividerVersoContent, setMonthlyDividerVersoContent] = useState<string>(defaultValues?.monthlyDividerVersoContent ?? 'blank');

  useEffect(() => {
      if (defaultValues) {
          if (defaultValues.name) setProjectName(defaultValues.name);
          if (defaultValues.year) setYear(defaultValues.year);
          if (defaultValues.startMonth !== undefined) setStartMonth(defaultValues.startMonth);
          if (defaultValues.durationMonths !== undefined) setDurationMonths(defaultValues.durationMonths);
          if (defaultValues.pageSize) setPageSize(defaultValues.pageSize);
          if (defaultValues.customPageSize) {
              setCustomWidth(defaultValues.customPageSize.width);
              setCustomHeight(defaultValues.customPageSize.height);
          }
          if (defaultValues.orientation) setOrientation(defaultValues.orientation);
          if (defaultValues.margins) setMargins(defaultValues.margins);
          if (defaultValues.mirrorEvenPages !== undefined) setMirrorEvenPages(defaultValues.mirrorEvenPages);
          if (defaultValues.mirrorContentOnVerso !== undefined) setMirrorContentOnVerso(defaultValues.mirrorContentOnVerso);
          if (defaultValues.customVerso !== undefined) setCustomVerso(defaultValues.customVerso);
          if (defaultValues.versoAdvancesSequence !== undefined) setVersoAdvancesSequence(defaultValues.versoAdvancesSequence);
          if (defaultValues.startMonthOnRightPage !== undefined) setStartMonthOnRightPage(defaultValues.startMonthOnRightPage);
          if (defaultValues.includeMonthlyDividers !== undefined) setIncludeMonthlyDividers(defaultValues.includeMonthlyDividers);
          if (defaultValues.includeMonthlyIntroPages !== undefined) setIncludeMonthlyIntroPages(defaultValues.includeMonthlyIntroPages);
          if (defaultValues.fillerPageContent !== undefined) setFillerPageContent(defaultValues.fillerPageContent);
          if (defaultValues.monthlyDividerVersoContent !== undefined) setMonthlyDividerVersoContent(defaultValues.monthlyDividerVersoContent);
          if (defaultValues.layoutType) {
              setLayoutType(defaultValues.layoutType);
              if (['weekly_vertical', 'weekly_horizontal', 'weekly_one_page_vertical', 'weekly_one_page_horizontal'].includes(defaultValues.layoutType)) {
                  setProjectType('planner');
              } else if (defaultValues.layoutType === 'notebook') {
                  setProjectType('notebook');
              } else if (defaultValues.layoutType === 'devotional') {
                  setProjectType('devotional');
              } else {
                  setProjectType('agenda');
              }
          }
          if (defaultValues.projectType) setProjectType(defaultValues.projectType);
          if (defaultValues.municipalHolidays) setMunicipalHolidays(defaultValues.municipalHolidays);
          setStep('config');
      }
  }, [defaultValues]);

  const handleProjectTypeSelect = (type: ProjectType) => {
      setProjectType(type);
      setIsSelectionExplicit(true);
      setSelectedTemplateElements(null);
      setSelectedIntroTemplate(null);
      if (type === 'agenda') {
          setLayoutType('1_per_page');
          setSelectedLibraryItemId('agenda-padrao-completa');
          setVariationCategoryFilter('all');
          setTemplateCategory('intro');
          setStep('template');
      } else if (type === 'planner') {
          setLayoutType('weekly_vertical');
          setSelectedLibraryItemId('planner-semanal-vertical');
          setVariationCategoryFilter('all');
          setTemplateCategory('planner');
          setStep('template');
      } else if (type === 'notebook') {
          setLayoutType('notebook');
          setTemplateCategory('planner');
          setStep('template');
      } else if (type === 'devotional') {
          setLayoutType('devotional');
          setTemplateCategory('planner');
          setStep('template');
      }
  };

  const handleStartBlankProject = (targetType: 'agenda' | 'planner' = 'agenda') => {
      setProjectType(targetType);
      setIsSelectionExplicit(true);
      setSelectedTemplateElements([]);
      setSelectedIntroTemplate(null);
      if (targetType === 'planner') {
          setSelectedLibraryItemId('planner-em-branco');
          setLayoutType('weekly_vertical');
          setProjectName('Meu Planner em Branco');
      } else {
          setSelectedLibraryItemId('layout-em-branco');
          setLayoutType('1_per_page');
          setProjectName('Minha Agenda em Branco');
      }
      setUseStandardAgendaModel(true);
      setIncludeMonthlyDividers(false);
      setIncludeMonthlyIntroPages(false);
      setStep('config');
  };

  const handleSelectObjectiveModel = (option: ObjectiveModelOption) => {
      setIsSelectionExplicit(true);
      setSelectedIntroTemplate(null);

      const isBlank = option.isPureBlank || option.libraryItemId === 'layout-em-branco' || option.libraryItemId === 'planner-em-branco' || (option.notebookElements && option.notebookElements.length === 0);

      if (option.libraryItemId) {
          setSelectedLibraryItemId(option.libraryItemId);
          setUseStandardAgendaModel(true);
          if (isBlank) {
              setIncludeMonthlyDividers(false);
              setIncludeMonthlyIntroPages(false);
              setSelectedTemplateElements([]);
          } else {
              setIncludeMonthlyDividers(true);
              setIncludeMonthlyIntroPages(true);
          }
      } else {
          setUseStandardAgendaModel(false);
      }

      if (option.notebookElements) {
          setSelectedTemplateElements(option.notebookElements);
      } else {
          setSelectedTemplateElements(isBlank ? [] : null);
      }

      setLayoutType(option.defaultLayout);
      if (!defaultValues?.name || projectName === 'Meu Novo Projeto') {
          setProjectName(option.defaultName);
      }
      setStep('config');
  };

  const getSelectedModelName = (): string => {
      if (projectType === 'notebook') {
          if (selectedTemplateElements && selectedTemplateElements.length === 0) return 'Caderno Liso (Em Branco)';
          if (selectedTemplateElements?.some(el => el.type === 'note_grid' && (el.style as any)?.variant === 'dots')) return 'Caderno Pontilhado';
          if (selectedTemplateElements?.some(el => el.type === 'note_grid' && (el.style as any)?.variant === 'grid')) return 'Caderno Quadriculado';
          return 'Caderno Pautado';
      }
      const item = LAYOUT_LIBRARY.find(i => i.id === selectedLibraryItemId);
      if (item) {
          if (item.id === 'planner-financeiro') return 'Agenda Financeira';
          if (item.id === 'agenda-padrao-completa') return 'Agenda Diária';
          if (item.id === 'agenda-agendamento-profissional') return 'Agendamento & Clientes';
          if (item.id === 'planner-semanal-vertical') return 'Planner Semanal';
          if (item.id === 'planner-diario-comum') return 'Planner Diário de Foco';
          if (item.id === 'planner-financeiro-pessoal') return 'Planner Financeiro';
          if (item.id === 'planner-estudos') return 'Planner de Estudos & Rotina';
          return item.name.replace(/•.*$/, '').trim();
      }
      if (projectType === 'agenda') return 'Agenda Diária';
      if (projectType === 'planner') return 'Planner Semanal';
      return 'Modelo Padrão';
  };

  const handleSelectPastelVariation = (item: LayoutLibraryItem) => {
      setSelectedLibraryItemId(item.id);
      setUseStandardAgendaModel(true);
      setProjectType(item.projectGroup);
      setLayoutType(item.modelOptions.layoutType || '1_per_page');
      if (item.modelOptions.pageSize) {
          setPageSize(item.modelOptions.pageSize);
      }
      setIncludeMonthlyDividers(true);
      setIncludeMonthlyIntroPages(true);
      setIsSelectionExplicit(true);
      setStep('config');
  };

  const handleTemplateSelect = (type: PageLayoutType, style: 'blank' | 'lines' | 'dots' | 'grid' | 'timetable') => {
      setUseStandardAgendaModel(false);
      setLayoutType(type);
      setPlannerStyle(style);
      setIsSelectionExplicit(true);
      setStep('config');
  };

  const handlExtraTemplateSelect = (elements: LayoutElement[]) => {
      setSelectedTemplateElements(elements);
      setStep('config');
  };

  const handleIntroTemplateSelect = (templateId: string) => {
      setSelectedIntroTemplate(templateId);
      setStep('config');
  };

  const mapTemplateElements = (elements: LayoutElement[], style: string = 'lines') => {
    return elements.map(el => {
        const newEl = { ...el, id: Math.random().toString(36).substr(2, 9) };
        if (newEl.type === 'planner_day_box') {
            newEl.style = { 
                ...newEl.style, 
                plannerDayBox: { ...newEl.style.plannerDayBox, contentStyle: style as any } 
            };
        }
        return newEl;
    });
  };

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const importedConfig = await importProject(file);
      const isImportedYearRestricted = isProjectYearRestricted(
        importedConfig.projectType, 
        importedConfig.year || 2027, 
        importedConfig.startMonth || 0, 
        importedConfig.durationMonths || 12, 
        userPlan
      );

      if (isImportedYearRestricted) {
          alert(`As configurações do projeto importado (ano ${importedConfig.year}, ${importedConfig.durationMonths || 12} meses) excedem o limite permitido do seu plano de assinatura (no máximo 1 mês de 2028). Reajustando para 2027 para permitir o uso.`);
          importedConfig.year = 2027;
          importedConfig.startMonth = 0;
          importedConfig.durationMonths = 12;
      }
      onComplete(importedConfig);
    } catch (err) {
      alert('Erro ao importar projeto: ' + (err instanceof Error ? err.message : 'Arquivo inválido'));
    } finally {
      e.target.value = '';
    }
  };

  const handleSubmit = () => {
      const isYearRestricted = isProjectYearRestricted(projectType || 'agenda', year, startMonth, durationMonths, userPlan);

      if (isYearRestricted) {
          alert(`As configurações selecionadas (ano ${year}, mês inicial ${['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'][startMonth]}, duração ${durationMonths} meses) englobam mais de 1 mês de 2028, o que está bloqueado na sua assinatura anual. Para agendas de 2027, é permitido no máximo até Janeiro/2028 (13 meses de Jan a Jan). Para liberar mais meses de 2028, é necessária a renovação da sua assinatura.`);
          return;
      }
      
      let elements = defaultValues?.elements ? [...defaultValues.elements] : [];
      let elementsWeeklyLeft: LayoutElement[] | undefined = defaultValues?.elementsWeeklyLeft ? [...defaultValues.elementsWeeklyLeft] : undefined;
      let elementsWeeklyRight: LayoutElement[] | undefined = defaultValues?.elementsWeeklyRight ? [...defaultValues.elementsWeeklyRight] : undefined;

      const projectTypeChanged = defaultValues && defaultValues.projectType !== projectType;
      const layoutTypeChanged = defaultValues && defaultValues.layoutType !== layoutType;
      const shouldRegenerate = isSelectionExplicit || projectTypeChanged || layoutTypeChanged;

      // Se selecionou um template de extra (notebook/devocional)
      if (selectedTemplateElements) {
          elements = selectedTemplateElements.map(el => ({ ...el, id: Math.random().toString(36).substr(2, 9) }));
      }

      // Se selecionou um template de intro
      if (selectedIntroTemplate) {
          const template = INTRO_TEMPLATES.find(t => t.id === selectedIntroTemplate);
          if (template) {
              elements = template.elements.map(el => {
                  let content = el.content;
                  if (el.type === 'holiday_list') {
                      content = generateHolidayListFullText(year, {
                          format: (el.style?.holidayFormat as HolidayDateFormat) || 'full_written',
                          includeOptional: true,
                          includeEaster: true
                      });
                  } else if (el.type === 'text' && typeof el.content === 'string' && /CALENDÁRIO\s*\d{4}/i.test(el.content)) {
                      content = el.content.replace(/\d{4}/, String(year));
                  }
                  return { ...el, content, id: Math.random().toString(36).substr(2, 9) };
              });
          }
      }

      // Se for planner / semanal
      if (projectType === 'planner' || layoutType.startsWith('weekly')) {
          if (shouldRegenerate || !elementsWeeklyLeft?.length || !elementsWeeklyRight?.length) {
              if (layoutType === 'weekly_vertical') {
                  elementsWeeklyLeft = mapTemplateElements(WEEKLY_VERTICAL_LEFT, plannerStyle);
                  elementsWeeklyRight = mapTemplateElements(WEEKLY_VERTICAL_RIGHT, plannerStyle);
                  elements = [];
              } else if (layoutType === 'weekly_horizontal') {
                  elementsWeeklyLeft = mapTemplateElements(WEEKLY_HORIZONTAL_LEFT, plannerStyle);
                  elementsWeeklyRight = mapTemplateElements(WEEKLY_HORIZONTAL_RIGHT, plannerStyle);
                  elements = [];
              } else if (layoutType === 'weekly_one_page_vertical') {
                  elements = mapTemplateElements(WEEKLY_ONE_PAGE_VERTICAL, plannerStyle);
                  elementsWeeklyLeft = undefined;
                  elementsWeeklyRight = undefined;
              } else if (layoutType === 'weekly_one_page_horizontal') {
                  elements = mapTemplateElements(WEEKLY_ONE_PAGE_HORIZONTAL, plannerStyle);
                  elementsWeeklyLeft = undefined;
                  elementsWeeklyRight = undefined;
              }
          }
      } else {
          // Não é planner semanal: limpa elementos de planner semanal
          elementsWeeklyLeft = undefined;
          elementsWeeklyRight = undefined;

          // Se mudou de planner para agenda/caderno/devocional ou se elements contém elementos de planner
          const hasPlannerBoxes = elements.some(el => el.type === 'planner_day_box');
          if (shouldRegenerate || hasPlannerBoxes || elements.length === 0) {
              if (projectType === 'notebook' || layoutType === 'notebook') {
                  elements = NOTEBOOK_TEMPLATES[0].elements.map(el => ({ ...el, id: Math.random().toString(36).substr(2, 9) })) as LayoutElement[];
              } else if (projectType === 'devotional' || layoutType === 'devotional') {
                  elements = DEVOTIONAL_TEMPLATES[0].elements.map(el => ({ ...el, id: Math.random().toString(36).substr(2, 9) })) as LayoutElement[];
              } else {
                  // Agenda (1_per_page, 2_per_page, 1_per_page_weekend_shared)
                  const clean = elements.filter(el => el.type !== 'planner_day_box');
                  if (clean.length > 0) {
                      elements = clean;
                  } else {
                      elements = [
                          {
                              id: Math.random().toString(36).substr(2, 9),
                              name: 'Pautas',
                              type: 'lines',
                              x: 10, y: 15, w: 80, h: 75,
                              zIndex: 1,
                              style: { lineSpacing: 25, color: '#e5e7eb' }
                          }
                      ];
                  }
              }
          }
      }

      // Se for agenda ou planner com Modelo Pastel Artístico Completo ativado
      if (!(projectType === 'notebook' || projectType === 'devotional') && useStandardAgendaModel) {
          const isPureBlankSelected = selectedLibraryItemId === 'layout-em-branco' || selectedLibraryItemId === 'planner-em-branco';
          const stdConfig = resolveLayoutLibraryConfig(selectedLibraryItemId, year) || buildStandardAgendaConfig(year);
          let finalElements = isPureBlankSelected ? [] : (stdConfig.elements ? [...stdConfig.elements] : []);
          let finalWeeklyLeft = isPureBlankSelected ? (layoutType.startsWith('weekly') ? [] : undefined) : stdConfig.elementsWeeklyLeft;
          let finalWeeklyRight = isPureBlankSelected ? (layoutType.startsWith('weekly') ? [] : undefined) : stdConfig.elementsWeeklyRight;

          // Se for Planner e o layout selecionado na tela de configuração for ajustado pelo usuário:
          if (projectType === 'planner' && !isPureBlankSelected) {
              if (layoutType === 'weekly_vertical') {
                  finalWeeklyLeft = WEEKLY_VERTICAL_LEFT.map(el => ({ ...el, id: Math.random().toString(36).substr(2, 9) }));
                  finalWeeklyRight = WEEKLY_VERTICAL_RIGHT.map(el => ({ ...el, id: Math.random().toString(36).substr(2, 9) }));
                  finalElements = [];
              } else if (layoutType === 'weekly_horizontal') {
                  finalWeeklyLeft = WEEKLY_HORIZONTAL_LEFT.map(el => ({ ...el, id: Math.random().toString(36).substr(2, 9) }));
                  finalWeeklyRight = WEEKLY_HORIZONTAL_RIGHT.map(el => ({ ...el, id: Math.random().toString(36).substr(2, 9) }));
                  finalElements = [];
              } else if (layoutType === 'weekly_one_page_vertical') {
                  finalElements = WEEKLY_ONE_PAGE_VERTICAL.map(el => ({ ...el, id: Math.random().toString(36).substr(2, 9) }));
                  finalWeeklyLeft = undefined;
                  finalWeeklyRight = undefined;
              } else if (layoutType === 'weekly_one_page_horizontal') {
                  finalElements = WEEKLY_ONE_PAGE_HORIZONTAL.map(el => ({ ...el, id: Math.random().toString(36).substr(2, 9) }));
                  finalWeeklyLeft = undefined;
                  finalWeeklyRight = undefined;
              } else if (layoutType === '1_per_page') {
                  finalElements = finalElements.length > 0 ? finalElements : DAILY_PLANNER_COMMON.map(el => ({ ...el, id: Math.random().toString(36).substr(2, 9) }));
                  finalWeeklyLeft = undefined;
                  finalWeeklyRight = undefined;
              }
          }

          const finalProjectType = projectType || (layoutType.startsWith('weekly') ? 'planner' : 'agenda');
          onComplete({
              name: projectName,
              projectType: finalProjectType,
              year,
              startMonth,
              durationMonths,
              pageSize,
              customPageSize: pageSize === 'Custom' ? { width: Math.max(20, customWidth || 148), height: Math.max(20, customHeight || 210) } : undefined,
              orientation,
              margins,
              initialMargins: margins,
              bindingMargins: margins,
              mirrorEvenPages,
              mirrorContentOnVerso,
              customVerso,
              versoAdvancesSequence,
              elementsVerso: customVerso
                ? (finalElements.map(el => ({ ...el, id: 'verso_' + Math.random().toString(36).substring(2, 9) })))
                : undefined,
              layoutType,
              includeHolidays: true,
              includeMoonPhases: defaultValues?.includeMoonPhases ?? true,
              includeQuotes: true,
              quoteCategory: defaultValues?.quoteCategory || 'feminine_strength',
              includeVerses: true,
              municipalHolidays,
              elements: finalElements,
              elementsSaturday: isPureBlankSelected ? [] : stdConfig.elementsSaturday,
              elementsSunday: isPureBlankSelected ? [] : stdConfig.elementsSunday,
              elementsTop: isPureBlankSelected ? [] : stdConfig.elementsTop,
              elementsBottom: isPureBlankSelected ? [] : stdConfig.elementsBottom,
              elementsWeeklyLeft: finalWeeklyLeft,
              elementsWeeklyRight: finalWeeklyRight,
              startMonthOnRightPage,
              includeMonthlyDividers: isPureBlankSelected ? false : true,
              includeMonthlyIntroPages: isPureBlankSelected ? false : true,
              fillerPageContent,
              monthlyDividerVersoContent: monthlyDividerVersoContent as any,
              monthlyDividerStyle: isPureBlankSelected ? undefined : stdConfig.monthlyDividerStyle,
              monthlyIntroPages: isPureBlankSelected ? [] : stdConfig.monthlyIntroPages,
              introPages: isPureBlankSelected ? [] : (stdConfig.introPages || []),
              background: defaultValues?.background,
              backgrounds: defaultValues?.backgrounds,
              backgroundRules: defaultValues?.backgroundRules
          });
          return;
      }

      onComplete({
          name: projectName,
          projectType: projectType || 'agenda',
          year,
          startMonth,
          durationMonths,
          pageCount: (projectType === 'notebook' || projectType === 'devotional') ? 100 : undefined,
          pageSize,
          customPageSize: pageSize === 'Custom' ? { width: Math.max(20, customWidth || 148), height: Math.max(20, customHeight || 210) } : undefined,
          orientation,
          margins,
          initialMargins: margins,
          bindingMargins: margins,
          mirrorEvenPages,
          mirrorContentOnVerso,
          customVerso,
          versoAdvancesSequence,
          elementsVerso: customVerso
            ? ((defaultValues?.elementsVerso && defaultValues.elementsVerso.length > 0)
                ? defaultValues.elementsVerso
                : elements.map(el => ({ ...el, id: 'verso_' + Math.random().toString(36).substring(2, 9) })))
            : undefined,
          layoutType,
          includeHolidays: defaultValues?.includeHolidays ?? true,
          includeMoonPhases: defaultValues?.includeMoonPhases ?? true,
          includeQuotes: defaultValues?.includeQuotes ?? true,
          quoteCategory: defaultValues?.quoteCategory || 'feminine_strength',
          includeVerses: defaultValues?.includeVerses ?? true,
          municipalHolidays,
          elements,
          elementsWeeklyLeft,
          elementsWeeklyRight,
          startMonthOnRightPage,
          includeMonthlyDividers,
          includeMonthlyIntroPages,
          fillerPageContent,
          monthlyDividerVersoContent: monthlyDividerVersoContent as any,
          monthlyDividerStyle: defaultValues?.monthlyDividerStyle,
          monthlyIntroPages: defaultValues?.monthlyIntroPages,
          introPages: defaultValues?.introPages ?? [],
          background: defaultValues?.background,
          backgrounds: defaultValues?.backgrounds,
          backgroundRules: defaultValues?.backgroundRules
      });
  };

  const addHoliday = () => {
    setMunicipalHolidays([...municipalHolidays, { date: `${year}-01-01`, name: '', type: 'national' }]);
  };

  const removeHoliday = (index: number) => {
    setMunicipalHolidays(municipalHolidays.filter((_, i) => i !== index));
  };

  const updateHoliday = (index: number, field: keyof Holiday, value: string) => {
    const newHolidays = [...municipalHolidays];
    newHolidays[index] = { ...newHolidays[index], [field]: value };
    setMunicipalHolidays(newHolidays);
  };

  const currentSize = pageSize === 'Custom' 
    ? { w: Math.max(20, customWidth || 148), h: Math.max(20, customHeight || 210) } 
    : (PAGE_SIZES[pageSize] || PAGE_SIZES['A5']);
  const displayW = orientation === 'portrait' ? currentSize.w : currentSize.h;
  const displayH = orientation === 'portrait' ? currentSize.h : currentSize.w;

  if (step === 'type') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#faf6f4] via-[#fffbf9] to-[#f9f1ee] text-slate-800 flex items-center justify-center p-6 font-sans antialiased relative">
        {/* Background glow */}
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-80 bg-[#b84a56]/5 rounded-full blur-3xl pointer-events-none z-0" />

        {onLogout && (
          <button
            onClick={onLogout}
            className="absolute top-6 right-6 flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-[#eedad5] rounded-xl transition-all shadow-xs cursor-pointer z-50"
          >
            <LogOut className="w-4 h-4 text-[#b84a56]" />
            <span>Sair do Aplicativo</span>
          </button>
        )}
        <div className="max-w-5xl w-full flex flex-col gap-8 relative z-10">
          <div className="text-center space-y-2.5">
            <div className="inline-flex items-center gap-2 bg-[#fdeeed] border border-[#f5ded9] px-4 py-1.5 rounded-full text-xs font-bold text-[#9f3d4a] uppercase tracking-widest shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#b84a56]" />
              <span>Agenda Master</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              O que você vai criar hoje?
            </h1>
            <p className="text-sm text-slate-600 font-normal max-w-lg mx-auto leading-relaxed">
              Escolha o tipo de projeto que deseja criar para começar a personalizar no Agenda Master.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Agenda */}
            <button 
              onClick={() => handleProjectTypeSelect('agenda')}
              className="group bg-white p-7 rounded-3xl shadow-xs hover:shadow-xl border-2 border-[#eedad5] hover:border-[#b84a56] transition-all flex flex-col items-center text-center gap-5 relative overflow-hidden cursor-pointer active:scale-98"
            >
              <div className="w-14 h-14 bg-[#fdeeed] border border-[#f5ded9] rounded-2xl flex items-center justify-center text-[#b84a56] group-hover:scale-110 group-hover:bg-[#b84a56] group-hover:text-white transition-all shadow-xs">
                <Calendar className="w-7 h-7 transition-colors" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 group-hover:text-[#b84a56] transition-colors mb-1.5">
                  Agenda
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-normal">Layouts diários. 1 ou 2 dias por página com horários ou pautado.</p>
              </div>
              <div className="mt-auto px-5 py-2 bg-[#fdeeed] border border-[#f5ded9] rounded-full text-[11px] font-bold text-[#b84a56] group-hover:bg-[#b84a56] group-hover:text-white transition-all uppercase tracking-wide">
                Criar Agenda
              </div>
            </button>

            {/* Planner */}
            <button 
              onClick={() => handleProjectTypeSelect('planner')}
              className="group bg-white p-7 rounded-3xl shadow-xs hover:shadow-xl border-2 border-[#eedad5] hover:border-[#b84a56] transition-all flex flex-col items-center text-center gap-5 relative overflow-hidden cursor-pointer active:scale-98"
            >
              <div className="w-14 h-14 bg-[#fdeeed] border border-[#f5ded9] rounded-2xl flex items-center justify-center text-[#b84a56] group-hover:scale-110 group-hover:bg-[#b84a56] group-hover:text-white transition-all shadow-xs">
                <BookOpen className="w-7 h-7 transition-colors" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 group-hover:text-[#b84a56] transition-colors mb-1.5">
                  Planner
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-normal">Visão semanal em duas páginas. Metas, hábitos e finanças.</p>
              </div>
              <div className="mt-auto px-5 py-2 bg-[#fdeeed] border border-[#f5ded9] rounded-full text-[11px] font-bold text-[#b84a56] group-hover:bg-[#b84a56] group-hover:text-white transition-all uppercase tracking-wide">
                Criar Planner
              </div>
            </button>

            {/* Caderno */}
            <button 
              onClick={() => handleProjectTypeSelect('notebook')}
              className="group bg-white p-7 rounded-3xl shadow-xs hover:shadow-xl border-2 border-[#eedad5] hover:border-[#b84a56] transition-all flex flex-col items-center text-center gap-5 relative overflow-hidden cursor-pointer active:scale-98"
            >
              <div className="w-14 h-14 bg-[#fdeeed] border border-[#f5ded9] rounded-2xl flex items-center justify-center text-[#b84a56] group-hover:scale-110 group-hover:bg-[#b84a56] group-hover:text-white transition-all shadow-xs">
                <PenTool className="w-7 h-7 transition-colors" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 group-hover:text-[#b84a56] transition-colors mb-1.5">
                  Caderno
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-normal">Pautados, quadriculados, pontilhados ou em branco.</p>
              </div>
              <div className="mt-auto px-5 py-2 bg-[#fdeeed] border border-[#f5ded9] rounded-full text-[11px] font-bold text-[#b84a56] group-hover:bg-[#b84a56] group-hover:text-white transition-all uppercase tracking-wide">
                Criar Caderno
              </div>
            </button>
          </div>

          <div className="flex justify-center mt-2">
            <button 
              onClick={handleImportClick}
              className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-[#faf5f3] rounded-2xl text-xs font-bold text-slate-700 hover:text-[#b84a56] transition-all border border-[#eedad5] hover:border-[#b84a56]/50 shadow-xs cursor-pointer"
            >
              <Upload className="w-4 h-4 text-[#b84a56]" />
              <span>OU IMPORTAR PROJETO EXISTENTE (.JSON)</span>
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept=".json" 
              className="hidden" 
            />
          </div>
        </div>
      </div>
    );
  }

  if (step === 'template') {
    const isPlanner = projectType === 'planner';
    const isAgenda = projectType === 'agenda';

    const getObjectiveOptions = (): ObjectiveModelOption[] => {
      if (isAgenda) return AGENDA_OBJECTIVE_OPTIONS;
      if (isPlanner) return PLANNER_OBJECTIVE_OPTIONS;
      return NOTEBOOK_OBJECTIVE_OPTIONS;
    };

    const options = getObjectiveOptions();

    const title = isAgenda
      ? 'Qual tipo de Agenda você quer criar?'
      : isPlanner
      ? 'Qual tipo de Planner você quer criar?'
      : 'Qual tipo de Caderno você quer criar?';

    const subtitle = isAgenda
      ? 'Escolha o objetivo principal da sua agenda. No próximo passo você poderá escolher o layout e características.'
      : isPlanner
      ? 'Escolha o formato principal do seu planner. No próximo passo você definirá o layout e características.'
      : 'Escolha o estilo de miolo para as páginas do seu caderno.';

    return (
      <div className="min-h-screen bg-gradient-to-b from-[#faf6f4] via-[#fffbf9] to-[#f9f1ee] text-slate-800 flex items-center justify-center p-6 font-sans antialiased relative">
        {/* Background glow */}
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-80 bg-[#b84a56]/5 rounded-full blur-3xl pointer-events-none z-0" />

        {/* Top actions */}
        <div className="absolute top-6 left-6 z-50">
          <button
            onClick={() => setStep('type')}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-[#eedad5] rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#b84a56]" />
            <span>Voltar</span>
          </button>
        </div>

        {onLogout && (
          <button
            onClick={onLogout}
            className="absolute top-6 right-6 flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-[#eedad5] rounded-xl transition-all shadow-xs cursor-pointer z-50"
          >
            <LogOut className="w-4 h-4 text-[#b84a56]" />
            <span>Sair do Aplicativo</span>
          </button>
        )}

        <div className="max-w-4xl w-full flex flex-col gap-8 relative z-10 py-10">
          {/* Header */}
          <div className="text-center space-y-2.5">
            <div className="inline-flex items-center gap-2 bg-[#fdeeed] border border-[#f5ded9] px-4 py-1.5 rounded-full text-xs font-bold text-[#9f3d4a] uppercase tracking-widest shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#b84a56]" />
              <span>Passo 2 • Escolha do Modelo</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {title}
            </h1>
            <p className="text-sm text-slate-600 font-normal max-w-lg mx-auto leading-relaxed">
              {subtitle}
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {options.map((opt) => {
              const isBlank = opt.isPureBlank || opt.id === 'notebook_liso';
              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelectObjectiveModel(opt)}
                  className={`group bg-white hover:bg-[#fff9f8] p-6 rounded-3xl border-2 transition-all flex flex-col text-left gap-4 relative overflow-hidden cursor-pointer shadow-xs hover:shadow-lg active:scale-99 ${
                    isBlank 
                      ? 'border-[#eedad5] hover:border-[#b84a56]' 
                      : 'border-[#eedad5] hover:border-[#b84a56]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="w-13 h-13 bg-[#fdeeed] border border-[#f5ded9] rounded-2xl flex items-center justify-center transition-all shadow-xs text-[#b84a56] group-hover:scale-105 group-hover:bg-[#b84a56] group-hover:text-white">
                      {renderObjectiveIcon(opt.iconName)}
                    </div>
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-colors border bg-[#fcedea] text-[#9f3d4a] border-[#f8d4ce]">
                      {opt.tag}
                    </span>
                  </div>

                  <div className="space-y-1.5 flex-1">
                    <h3 className="text-lg font-black transition-colors text-slate-900 group-hover:text-[#b84a56]">
                      {opt.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed font-normal">
                      {opt.subtitle}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#f2deda] flex items-center justify-between text-xs font-bold transition-colors text-slate-500 group-hover:text-[#b84a56]">
                    <span>Avançar para Configuração</span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform text-[#b84a56]" />
                  </div>
                </button>
              );
            })}
          </div>

          <div className="text-center pt-2">
            <p className="text-xs text-slate-500 font-medium">
              Na próxima página de configuração você definirá layout (1 ou 2 dias por página, semanal), tamanho do papel, datas e margens.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#faf6f4] via-[#fffbf9] to-[#f9f1ee] flex items-center justify-center p-6 font-sans antialiased relative">
      {onLogout && (
        <button
          onClick={onLogout}
          className="absolute top-6 right-6 flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-[#eedad5] rounded-xl transition-all shadow-xs cursor-pointer z-50"
        >
          <LogOut className="w-4 h-4 text-[#b84a56]" />
          <span>Sair do Aplicativo</span>
        </button>
      )}
      <div className="max-w-5xl w-full bg-white rounded-3xl shadow-[0_16px_50px_rgba(184,74,86,0.08)] border border-[#eedad5] overflow-hidden flex flex-col md:flex-row">
        {/* Left Side: Visual Preview */}
        <div className="w-full md:w-1/3 bg-gradient-to-b from-[#b84a56] via-[#c45663] to-[#9f3d4a] p-8 text-white flex flex-col justify-between">
            <div>
                <button 
                  onClick={() => setStep('template')}
                  className="mb-6 flex items-center gap-2 text-rose-100 hover:text-white transition-colors text-xs font-black uppercase tracking-widest cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" /> Voltar para Modelos
                </button>
                <h2 className="text-2xl font-black mb-2 text-white">{defaultValues ? 'Editar Projeto' : 'Novo Projeto'}</h2>
                <div className="text-rose-100 text-sm font-semibold">
                  {getSelectedModelName()}
                </div>
                
                {!defaultValues && (
                  <button 
                    onClick={handleImportClick}
                    className="mt-6 flex items-center gap-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-bold transition-colors border border-white/30 text-white shadow-sm"
                  >
                    <Upload className="w-4 h-4 text-white" /> Importar Projeto (.json)
                  </button>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept=".json" 
                  className="hidden" 
                />
            </div>

            <div className="flex-1 flex items-center justify-center py-8 flex-col gap-4">
                <div 
                    className="bg-white shadow-2xl transition-all duration-500 relative"
                    style={{
                        width: orientation === 'portrait' ? '148px' : '210px',
                        height: orientation === 'portrait' ? '210px' : '148px',
                        borderRadius: '4px'
                    }}
                >
                    {/* Margins Visualization */}
                    <div className="absolute border-2 border-dashed border-[#b84a56]/50"
                        style={{
                            top: `${margins.top/2}px`,
                            bottom: `${margins.bottom/2}px`,
                            left: `${margins.inside/2}px`,
                            right: `${margins.outside/2}px`
                        }}
                    >
                        {/* Layout Visualization Placeholder */}
                        <div className="w-full h-full flex flex-col p-2 gap-1 opacity-40">
                            {layoutType === '1_per_page' && <div className="flex-1 bg-[#b84a56] rounded"></div>}
                            {layoutType === '2_per_page' && <><div className="flex-1 bg-[#b84a56] rounded"></div><div className="flex-1 bg-[#b84a56] rounded"></div></>}
                            {layoutType === '1_per_page_weekend_shared' && <div className="flex-1 bg-[#b84a56] rounded border-2 border-white"></div>}
                            {layoutType === 'weekly_vertical' && <div className="flex-1 flex gap-1"><div className="flex-1 bg-[#b84a56] rounded"></div><div className="flex-1 bg-[#b84a56] rounded"></div><div className="flex-1 bg-[#b84a56] rounded"></div></div>}
                            {layoutType === 'weekly_horizontal' && <div className="flex-1 flex flex-col gap-1"><div className="flex-1 bg-[#b84a56] rounded"></div><div className="flex-1 bg-[#b84a56] rounded"></div><div className="flex-1 bg-[#b84a56] rounded"></div></div>}
                            {(projectType === 'notebook' || projectType === 'devotional') && <div className="flex-1 bg-[#b84a56]/60 rounded flex flex-col p-1 gap-1">
                                <div className="h-0.5 bg-[#b84a56] w-1/2"></div>
                                <div className="h-0.5 bg-[#b84a56]/70 w-3/4"></div>
                                <div className="h-0.5 bg-[#b84a56]/70 w-full"></div>
                            </div>}
                        </div>
                    </div>
                    <div className="absolute -bottom-6 left-0 right-0 text-center text-white font-bold text-[11px] font-mono drop-shadow">
                        {displayW}mm x {displayH}mm
                    </div>
                </div>
            </div>

            <div className="text-xs text-white font-medium bg-black/20 px-3 py-1.5 rounded-xl border border-white/10">
                Usuário: <span className="font-bold text-white">{userEmail}</span>
            </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-2/3 p-8 md:p-10 overflow-y-auto max-h-[90vh] custom-scrollbar bg-white">
            <div className="space-y-8">
                
                {/* Nome do Projeto */}
                <div className="bg-[#fdeeed] p-6 rounded-2xl border-2 border-[#f5ded9] mb-2 shadow-2xs">
                    <label className="flex items-center text-sm font-black text-[#9f3d4a] uppercase mb-3 gap-2">
                        <FileText className="w-4 h-4 text-[#b84a56]" /> Nome do Projeto
                    </label>
                    <input 
                        type="text" 
                        value={projectName} 
                        onChange={(e) => setProjectName(e.target.value)} 
                        placeholder="Ex: Agenda 2026 Florada"
                        className="w-full p-3.5 border-2 border-[#eedad5] focus:border-[#b84a56] bg-white rounded-xl focus:ring-2 focus:ring-[#b84a56]/20 outline-none text-lg font-black text-slate-900 placeholder:text-slate-400 shadow-xs"
                    />
                    <p className="text-xs text-slate-600 mt-2 font-medium">Esse nome será usado para salvar o arquivo no seu computador.</p>
                </div>

                {/* Layout Type Selection (New) - Esconder se for notebook ou devotional */}
                {!(projectType === 'notebook' || projectType === 'devotional') && (
                    <div>
                        <label className="flex items-center text-sm font-black text-slate-800 uppercase mb-3 gap-2">
                            <Grid className="w-4 h-4 text-[#b84a56]" /> Layout do Miolo
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {projectType === 'agenda' ? (
                                <>
                                    <button 
                                        type="button"
                                        onClick={() => setLayoutType('1_per_page')}
                                        className={`p-3.5 border-2 rounded-xl flex flex-col items-center gap-2.5 transition-all cursor-pointer ${layoutType === '1_per_page' ? 'bg-[#fdeeed] border-[#b84a56] ring-2 ring-[#b84a56]/20 shadow-xs' : 'border-gray-200 hover:border-[#b84a56]/50 bg-white hover:bg-[#faf5f3]'}`}
                                    >
                                        <div className={`w-8 h-10 border-2 rounded bg-white flex items-center justify-center ${layoutType === '1_per_page' ? 'border-[#b84a56]' : 'border-gray-400'}`}>
                                            <div className={`w-4 h-6 rounded-xs ${layoutType === '1_per_page' ? 'bg-[#b84a56]' : 'bg-gray-500'}`}></div>
                                        </div>
                                        <span className={`text-xs font-black text-center ${layoutType === '1_per_page' ? 'text-[#9f3d4a]' : 'text-slate-800'}`}>1 Dia / Pág</span>
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setLayoutType('2_per_page')}
                                        className={`p-3.5 border-2 rounded-xl flex flex-col items-center gap-2.5 transition-all cursor-pointer ${layoutType === '2_per_page' ? 'bg-[#fdeeed] border-[#b84a56] ring-2 ring-[#b84a56]/20 shadow-xs' : 'border-gray-200 hover:border-[#b84a56]/50 bg-white hover:bg-[#faf5f3]'}`}
                                    >
                                        <div className={`w-8 h-10 border-2 rounded bg-white flex flex-col p-0.5 gap-0.5 ${layoutType === '2_per_page' ? 'border-[#b84a56]' : 'border-gray-400'}`}>
                                            <div className={`flex-1 rounded-xs ${layoutType === '2_per_page' ? 'bg-[#b84a56]' : 'bg-gray-500'}`}></div>
                                            <div className="h-0.5 bg-gray-300"></div>
                                            <div className={`flex-1 rounded-xs ${layoutType === '2_per_page' ? 'bg-[#b84a56]' : 'bg-gray-500'}`}></div>
                                        </div>
                                        <span className={`text-xs font-black text-center ${layoutType === '2_per_page' ? 'text-[#9f3d4a]' : 'text-slate-800'}`}>2 Dias / Pág</span>
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setLayoutType('1_per_page_weekend_shared')}
                                        className={`p-3.5 border-2 rounded-xl flex flex-col items-center gap-2.5 transition-all cursor-pointer ${layoutType === '1_per_page_weekend_shared' ? 'bg-[#fdeeed] border-[#b84a56] ring-2 ring-[#b84a56]/20 shadow-xs' : 'border-gray-200 hover:border-[#b84a56]/50 bg-white hover:bg-[#faf5f3]'}`}
                                    >
                                        <div className={`w-8 h-10 border-2 rounded bg-white flex flex-col p-0.5 gap-0.5 ${layoutType === '1_per_page_weekend_shared' ? 'border-[#b84a56]' : 'border-gray-400'}`}>
                                            <div className={`flex-[2] rounded-xs border border-dashed ${layoutType === '1_per_page_weekend_shared' ? 'bg-[#b84a56]/60 border-[#b84a56]' : 'bg-gray-400 border-gray-500'}`}></div>
                                            <div className="flex-1 flex gap-0.5">
                                                <div className={`flex-1 rounded-xs ${layoutType === '1_per_page_weekend_shared' ? 'bg-[#b84a56]' : 'bg-gray-600'}`}></div>
                                                <div className={`flex-1 rounded-xs ${layoutType === '1_per_page_weekend_shared' ? 'bg-[#b84a56]' : 'bg-gray-600'}`}></div>
                                            </div>
                                        </div>
                                        <span className={`text-xs font-black text-center ${layoutType === '1_per_page_weekend_shared' ? 'text-[#9f3d4a]' : 'text-slate-800'}`}>Fim de Semana Dividido</span>
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button 
                                        type="button"
                                        onClick={() => setLayoutType('weekly_vertical')}
                                        className={`p-3.5 border-2 rounded-xl flex flex-col items-center gap-2.5 transition-all cursor-pointer ${layoutType === 'weekly_vertical' ? 'bg-[#fdeeed] border-[#b84a56] ring-2 ring-[#b84a56]/20 shadow-xs' : 'border-gray-200 hover:border-[#b84a56]/50 bg-white hover:bg-[#faf5f3]'}`}
                                    >
                                        <div className={`w-8 h-10 border-2 rounded bg-white flex p-0.5 gap-0.5 ${layoutType === 'weekly_vertical' ? 'border-[#b84a56]' : 'border-gray-400'}`}>
                                            <div className={`flex-1 rounded-xs ${layoutType === 'weekly_vertical' ? 'bg-[#b84a56]' : 'bg-gray-500'}`}></div>
                                            <div className={`flex-1 rounded-xs ${layoutType === 'weekly_vertical' ? 'bg-[#b84a56]' : 'bg-gray-500'}`}></div>
                                            <div className={`flex-1 rounded-xs ${layoutType === 'weekly_vertical' ? 'bg-[#b84a56]' : 'bg-gray-500'}`}></div>
                                        </div>
                                        <span className={`text-xs font-black text-center ${layoutType === 'weekly_vertical' ? 'text-[#9f3d4a]' : 'text-slate-800'}`}>Semanal Vertical (2 Págs)</span>
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setLayoutType('weekly_horizontal')}
                                        className={`p-3.5 border-2 rounded-xl flex flex-col items-center gap-2.5 transition-all cursor-pointer ${layoutType === 'weekly_horizontal' ? 'bg-[#fdeeed] border-[#b84a56] ring-2 ring-[#b84a56]/20 shadow-xs' : 'border-gray-200 hover:border-[#b84a56]/50 bg-white hover:bg-[#faf5f3]'}`}
                                    >
                                        <div className={`w-8 h-10 border-2 rounded bg-white flex flex-col p-0.5 gap-0.5 ${layoutType === 'weekly_horizontal' ? 'border-[#b84a56]' : 'border-gray-400'}`}>
                                            <div className={`flex-1 rounded-xs ${layoutType === 'weekly_horizontal' ? 'bg-[#b84a56]' : 'bg-gray-500'}`}></div>
                                            <div className={`flex-1 rounded-xs ${layoutType === 'weekly_horizontal' ? 'bg-[#b84a56]' : 'bg-gray-500'}`}></div>
                                            <div className={`flex-1 rounded-xs ${layoutType === 'weekly_horizontal' ? 'bg-[#b84a56]' : 'bg-gray-500'}`}></div>
                                        </div>
                                        <span className={`text-xs font-black text-center ${layoutType === 'weekly_horizontal' ? 'text-[#9f3d4a]' : 'text-slate-800'}`}>Semanal Horizontal (2 Págs)</span>
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setLayoutType('weekly_one_page_vertical')}
                                        className={`p-3.5 border-2 rounded-xl flex flex-col items-center gap-2.5 transition-all cursor-pointer ${layoutType === 'weekly_one_page_vertical' ? 'bg-[#fdeeed] border-[#b84a56] ring-2 ring-[#b84a56]/20 shadow-xs' : 'border-gray-200 hover:border-[#b84a56]/50 bg-white hover:bg-[#faf5f3]'}`}
                                    >
                                        <div className={`w-8 h-10 border-2 rounded bg-white flex p-0.5 gap-0.5 ${layoutType === 'weekly_one_page_vertical' ? 'border-[#b84a56]' : 'border-gray-400'}`}>
                                            <div className={`flex-1 rounded-xs ${layoutType === 'weekly_one_page_vertical' ? 'bg-[#b84a56]' : 'bg-gray-500'}`}></div>
                                            <div className={`flex-1 rounded-xs ${layoutType === 'weekly_one_page_vertical' ? 'bg-[#b84a56]' : 'bg-gray-500'}`}></div>
                                            <div className={`flex-1 rounded-xs ${layoutType === 'weekly_one_page_vertical' ? 'bg-[#b84a56]' : 'bg-gray-500'}`}></div>
                                        </div>
                                        <span className={`text-xs font-black text-center ${layoutType === 'weekly_one_page_vertical' ? 'text-[#9f3d4a]' : 'text-slate-800'}`}>Semanal 1 Pág (Colunas)</span>
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setLayoutType('weekly_one_page_horizontal')}
                                        className={`p-3.5 border-2 rounded-xl flex flex-col items-center gap-2.5 transition-all cursor-pointer ${layoutType === 'weekly_one_page_horizontal' ? 'bg-[#fdeeed] border-[#b84a56] ring-2 ring-[#b84a56]/20 shadow-xs' : 'border-gray-200 hover:border-[#b84a56]/50 bg-white hover:bg-[#faf5f3]'}`}
                                    >
                                        <div className={`w-8 h-10 border-2 rounded bg-white flex flex-col p-0.5 gap-0.5 ${layoutType === 'weekly_one_page_horizontal' ? 'border-[#b84a56]' : 'border-gray-400'}`}>
                                            <div className={`flex-1 rounded-xs ${layoutType === 'weekly_one_page_horizontal' ? 'bg-[#b84a56]' : 'bg-gray-500'}`}></div>
                                            <div className={`flex-1 rounded-xs ${layoutType === 'weekly_one_page_horizontal' ? 'bg-[#b84a56]' : 'bg-gray-500'}`}></div>
                                            <div className={`flex-1 rounded-xs ${layoutType === 'weekly_one_page_horizontal' ? 'bg-[#b84a56]' : 'bg-gray-500'}`}></div>
                                        </div>
                                        <span className={`text-xs font-black text-center ${layoutType === 'weekly_one_page_horizontal' ? 'text-[#9f3d4a]' : 'text-slate-800'}`}>Semanal 1 Pág (Linhas)</span>
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setLayoutType('1_per_page')}
                                        className={`p-3.5 border-2 rounded-xl flex flex-col items-center gap-2.5 transition-all cursor-pointer ${layoutType === '1_per_page' ? 'bg-[#fdeeed] border-[#b84a56] ring-2 ring-[#b84a56]/20 shadow-xs' : 'border-gray-200 hover:border-[#b84a56]/50 bg-white hover:bg-[#faf5f3]'}`}
                                    >
                                        <div className={`w-8 h-10 border-2 rounded bg-white flex items-center justify-center ${layoutType === '1_per_page' ? 'border-[#b84a56]' : 'border-gray-400'}`}>
                                            <div className={`w-4 h-6 rounded-xs ${layoutType === '1_per_page' ? 'bg-[#b84a56]' : 'bg-gray-500'}`}></div>
                                        </div>
                                        <span className={`text-xs font-black text-center ${layoutType === '1_per_page' ? 'text-[#9f3d4a]' : 'text-slate-800'}`}>Planner Diário (1 Dia/Pág)</span>
                                    </button>
                                </>
                            )}
                        </div>
                        {(projectType === 'agenda' || projectType === 'planner') && (
                            <div className="mt-4 p-4 rounded-2xl bg-[#fdeeed] border-2 border-[#f5ded9] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white text-[#b84a56] border border-[#f5ded9] flex items-center justify-center shrink-0 shadow-2xs">
                                        <Sparkles className="w-5 h-5 text-[#b84a56]" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black uppercase tracking-wider text-[#9f3d4a]">Modelo Selecionado</span>
                                            <span className="px-2 py-0.5 bg-[#b84a56] text-white text-[9px] font-black uppercase rounded-full">Ativo</span>
                                        </div>
                                        <h4 className="text-sm font-black text-slate-900 mt-0.5">
                                            {getSelectedModelName()}
                                        </h4>
                                        <p className="text-[11px] text-slate-500 font-medium">
                                            Páginas iniciais, divisórias mensais e páginas mensais já inclusas.
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setStep('template')}
                                    className="px-3.5 py-2 bg-white hover:bg-[#faf5f3] text-[#b84a56] font-black text-xs rounded-xl border-2 border-[#eedad5] hover:border-[#b84a56] transition-all shadow-2xs cursor-pointer shrink-0"
                                >
                                    Alterar Modelo
                                </button>
                            </div>
                        )}
                    </div>
                )}

                <div className="h-px bg-gray-300"></div>

                {/* Ano - Esconder se for notebook ou devotional */}
                {!(projectType === 'notebook' || projectType === 'devotional') && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="flex items-center text-sm font-black text-slate-800 uppercase mb-3 gap-2">
                                    <Settings className="w-4 h-4 text-[#b84a56]" /> Ano de Referência
                                </label>
                                <input 
                                    type="number" 
                                    value={year} 
                                    onChange={(e) => setYear(parseInt(e.target.value) || 2027)} 
                                    className={`w-full p-3 border-2 rounded-xl focus:ring-2 focus:ring-[#b84a56]/20 outline-none text-lg font-black bg-white ${
                                      isProjectYearRestricted(projectType || 'agenda', year, startMonth, durationMonths, userPlan)
                                         ? 'border-amber-400 bg-amber-50/40 text-amber-950' 
                                         : 'border-[#eedad5] text-slate-900 focus:border-[#b84a56]'
                                    }`}
                                />
                                <p className="text-xs text-slate-600 mt-1.5 font-medium">Define os feriados nacionais automaticamente.</p>

                                {isProjectYearRestricted(projectType || 'agenda', year, startMonth, durationMonths, userPlan) && (
                                    <div className="mt-3 p-4 bg-amber-50 border-2 border-amber-300 rounded-xl text-xs text-amber-950 leading-relaxed shadow-sm">
                                        <p className="font-black flex items-center gap-1.5 mb-1.5 text-amber-950 text-sm">
                                            <Zap className="w-4 h-4 text-amber-600 fill-amber-500 animate-pulse" /> Assinatura Requerida para {year}
                                        </p>
                                        <p className="font-medium text-amber-950">Seu plano atual cobre os anos de <strong>2026 e 2027</strong> e permite no máximo <strong>1 mês de 2028</strong> (ex: agenda de 13 meses de Jan/2027 a Jan/2028).</p>
                                        <p className="mt-1.5 font-bold text-amber-950">Para liberar mais meses de 2028 em diante, é necessária a renovação da sua assinatura anual!</p>
                                        <div className="mt-3 flex gap-2">
                                            <button 
                                                type="button"
                                                onClick={() => { setYear(2027); setStartMonth(0); setDurationMonths(12); }} 
                                                className="bg-[#b84a56] hover:bg-[#9f3d4a] text-white font-black py-1.5 px-3 rounded-lg text-xs transition-colors shadow-sm cursor-pointer"
                                            >
                                                Ajustar para 2027 (12 meses)
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={() => { setYear(2027); setStartMonth(0); setDurationMonths(13); }} 
                                                className="bg-white hover:bg-slate-50 text-slate-800 font-black py-1.5 px-3 rounded-lg text-xs border-2 border-[#eedad5] transition-colors shadow-xs cursor-pointer"
                                            >
                                                Jan/27 a Jan/28 (13 meses)
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="flex items-center text-sm font-black text-slate-800 uppercase mb-3 gap-2">
                                    <Calendar className="w-4 h-4 text-[#b84a56]" /> Mês Inicial da Agenda
                                </label>
                                <select
                                    value={startMonth}
                                    onChange={(e) => setStartMonth(parseInt(e.target.value))}
                                    className="w-full p-3 border-2 border-[#eedad5] rounded-xl focus:ring-2 focus:ring-[#b84a56]/20 focus:border-[#b84a56] outline-none text-sm font-black text-slate-900 bg-white shadow-xs cursor-pointer"
                                >
                                    {['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'].map((mName, idx) => (
                                        <option key={idx} value={idx} className="text-slate-900 font-bold bg-white">{mName}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="flex items-center text-sm font-black text-slate-800 uppercase mb-3 gap-2">
                                    <Settings className="w-4 h-4 text-[#b84a56]" /> Duração da Agenda
                                </label>
                                <select
                                    value={durationMonths}
                                    onChange={(e) => setDurationMonths(parseInt(e.target.value))}
                                    className="w-full p-3 border-2 border-[#eedad5] rounded-xl focus:ring-2 focus:ring-[#b84a56]/20 focus:border-[#b84a56] outline-none text-sm font-black text-slate-900 bg-white shadow-xs cursor-pointer"
                                >
                                    {Array.from({ length: 13 }, (_, i) => i + 1).map(m => (
                                        <option key={m} value={m} className="text-slate-900 font-bold bg-white">{m} {m === 1 ? 'mês' : 'meses'}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="flex items-center text-sm font-black text-slate-800 uppercase mb-3 gap-2">
                                <Calendar className="w-4 h-4 text-[#b84a56]" /> Feriados Municipais
                            </label>
                            <div className="space-y-2">
                                {municipalHolidays.map((holiday, index) => (
                                    <div key={index} className="flex gap-2 items-center bg-[#faf6f4] p-2.5 rounded-xl border-2 border-[#eedad5]">
                                        <input 
                                            type="date" 
                                            value={holiday.date} 
                                            onChange={(e) => updateHoliday(index, 'date', e.target.value)}
                                            className="text-xs p-2 border-2 border-[#eedad5] rounded-lg focus:ring-1 focus:ring-[#b84a56] outline-none text-slate-900 font-black bg-white"
                                        />
                                        <input 
                                            type="text" 
                                            placeholder="Nome do Feriado"
                                            value={holiday.name} 
                                            onChange={(e) => updateHoliday(index, 'name', e.target.value)}
                                            className="flex-1 text-xs p-2 border-2 border-[#eedad5] rounded-lg focus:ring-1 focus:ring-[#b84a56] outline-none text-slate-900 font-bold bg-white placeholder-slate-400"
                                        />
                                        <button onClick={() => removeHoliday(index)} className="text-[#b84a56] hover:text-[#9f3d4a] p-1.5 cursor-pointer">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                <button 
                                    type="button"
                                    onClick={addHoliday}
                                    className="w-full py-2.5 border-2 border-dashed border-[#eedad5] hover:border-[#b84a56] rounded-xl text-xs font-black text-slate-700 hover:text-[#b84a56] transition-all flex items-center justify-center gap-1.5 bg-white hover:bg-[#fdeeed] cursor-pointer shadow-xs"
                                >
                                    <Plus className="w-4 h-4 text-[#b84a56]" /> Adicionar Feriado Municipal
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tamanho e Orientação */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="flex items-center text-sm font-black text-slate-800 uppercase mb-3 gap-2">
                            <FileText className="w-4 h-4 text-[#b84a56]" /> Tamanho da Página
                        </label>
                        <div className="space-y-2.5">
                            {(Object.keys(PAGE_SIZES) as PageSize[]).map((size) => (
                                <label key={size} className={`flex items-center p-3.5 border-2 rounded-xl cursor-pointer transition-all ${pageSize === size ? 'border-[#b84a56] bg-[#fdeeed] ring-2 ring-[#b84a56]/20 shadow-xs' : 'border-[#eedad5] hover:border-[#b84a56]/50 bg-white hover:bg-[#faf5f3]'}`}>
                                    <input type="radio" name="pageSize" className="hidden" checked={pageSize === size} onChange={() => setPageSize(size)} />
                                    <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center transition-all ${pageSize === size ? 'border-[#b84a56] bg-[#b84a56]' : 'border-slate-300 bg-white'}`}>
                                        {pageSize === size && <div className="w-2 h-2 rounded-full bg-white" />}
                                    </div>
                                    <div className="flex-1">
                                        <div className={`text-sm ${pageSize === size ? 'text-[#9f3d4a] font-black' : 'text-slate-800 font-bold'}`}>{PAGE_SIZES[size].name}</div>
                                        {size !== 'Custom' && (
                                            <div className={`text-xs font-bold ${pageSize === size ? 'text-[#b84a56]' : 'text-slate-600'}`}>{PAGE_SIZES[size].w}mm x {PAGE_SIZES[size].h}mm</div>
                                        )}
                                    </div>
                                </label>
                            ))}
                        </div>

                        {pageSize === 'Custom' && (
                            <div className="mt-4 grid grid-cols-2 gap-4 bg-[#fdeeed]/60 p-4 rounded-xl border-2 border-[#f5ded9]">
                                <div>
                                    <label className="block text-[11px] uppercase font-black text-slate-800 mb-1">Largura (mm)</label>
                                    <input 
                                        type="number" 
                                        value={customWidth} 
                                        onChange={(e) => setCustomWidth(parseInt(e.target.value) || 0)} 
                                        className="w-full p-2.5 border-2 border-[#eedad5] rounded-lg focus:ring-2 focus:ring-[#b84a56]/20 outline-none text-slate-900 font-black bg-white text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] uppercase font-black text-slate-800 mb-1">Altura (mm)</label>
                                    <input 
                                        type="number" 
                                        value={customHeight} 
                                        onChange={(e) => setCustomHeight(parseInt(e.target.value) || 0)} 
                                        className="w-full p-2.5 border-2 border-[#eedad5] rounded-lg focus:ring-2 focus:ring-[#b84a56]/20 outline-none text-slate-900 font-black bg-white text-sm"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="flex items-center text-sm font-black text-slate-800 uppercase mb-3 gap-2">
                            <Columns className="w-4 h-4 text-[#b84a56]" /> Orientação
                        </label>
                        <div className="flex gap-3">
                            <button 
                                type="button"
                                onClick={() => setOrientation('portrait')}
                                className={`flex-1 p-3.5 border-2 rounded-xl flex flex-col items-center gap-2.5 transition-all cursor-pointer ${orientation === 'portrait' ? 'bg-[#fdeeed] border-[#b84a56] text-[#9f3d4a] ring-2 ring-[#b84a56]/20 shadow-xs font-black' : 'bg-white border-[#eedad5] text-slate-700 hover:border-[#b84a56]/50 hover:bg-[#faf5f3] font-bold'}`}
                            >
                                <div className={`w-6 h-8 border-2 rounded-xs ${orientation === 'portrait' ? 'border-[#b84a56] bg-[#fdeeed]' : 'border-slate-400 bg-slate-100'}`}></div>
                                <span className="text-xs">Retrato</span>
                            </button>
                            <button 
                                type="button"
                                onClick={() => setOrientation('landscape')}
                                className={`flex-1 p-3.5 border-2 rounded-xl flex flex-col items-center gap-2.5 transition-all cursor-pointer ${orientation === 'landscape' ? 'bg-[#fdeeed] border-[#b84a56] text-[#9f3d4a] ring-2 ring-[#b84a56]/20 shadow-xs font-black' : 'bg-white border-[#eedad5] text-slate-700 hover:border-[#b84a56]/50 hover:bg-[#faf5f3] font-bold'}`}
                            >
                                <div className={`w-8 h-6 border-2 rounded-xs ${orientation === 'landscape' ? 'border-[#b84a56] bg-[#fdeeed]' : 'border-slate-400 bg-slate-100'}`}></div>
                                <span className="text-xs">Paisagem</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Margens */}
                <div>
                    <label className="flex items-center text-sm font-black text-slate-800 uppercase mb-3 gap-2">
                        <BookOpen className="w-4 h-4 text-[#b84a56]" /> Margens e Sangria (mm)
                    </label>
                    <div className="grid grid-cols-4 gap-3 bg-[#faf6f4] p-4 rounded-xl border-2 border-[#eedad5]">
                        <div>
                            <span className="block text-[11px] uppercase font-black text-slate-700 mb-1">Topo</span>
                            <input 
                                type="number" 
                                value={margins.top} 
                                onChange={(e) => setMargins({...margins, top: parseInt(e.target.value) || 0})} 
                                className="w-full p-2.5 text-sm border-2 border-[#eedad5] rounded-lg bg-white text-slate-900 font-black text-center focus:ring-2 focus:ring-[#b84a56]/20 focus:border-[#b84a56] outline-none shadow-xs" 
                            />
                        </div>
                        <div>
                            <span className="block text-[11px] uppercase font-black text-slate-700 mb-1">Base</span>
                            <input 
                                type="number" 
                                value={margins.bottom} 
                                onChange={(e) => setMargins({...margins, bottom: parseInt(e.target.value) || 0})} 
                                className="w-full p-2.5 text-sm border-2 border-[#eedad5] rounded-lg bg-white text-slate-900 font-black text-center focus:ring-2 focus:ring-[#b84a56]/20 focus:border-[#b84a56] outline-none shadow-xs" 
                            />
                        </div>
                        <div>
                            <span className="block text-[11px] uppercase font-black text-slate-700 mb-1">Interna</span>
                            <input 
                                type="number" 
                                value={margins.inside} 
                                onChange={(e) => setMargins({...margins, inside: parseInt(e.target.value) || 0})} 
                                className="w-full p-2.5 text-sm border-2 border-[#eedad5] rounded-lg bg-white text-slate-900 font-black text-center focus:ring-2 focus:ring-[#b84a56]/20 focus:border-[#b84a56] outline-none shadow-xs" 
                                title="Margem da Espiral/Lombada" 
                            />
                        </div>
                        <div>
                            <span className="block text-[11px] uppercase font-black text-slate-700 mb-1">Externa</span>
                            <input 
                                type="number" 
                                value={margins.outside} 
                                onChange={(e) => setMargins({...margins, outside: parseInt(e.target.value) || 0})} 
                                className="w-full p-2.5 text-sm border-2 border-[#eedad5] rounded-lg bg-white text-slate-900 font-black text-center focus:ring-2 focus:ring-[#b84a56]/20 focus:border-[#b84a56] outline-none shadow-xs" 
                            />
                        </div>
                    </div>
                    <div className="mt-4 space-y-3">
                        <div className="flex items-center">
                            <input 
                                type="checkbox" 
                                id="mirror" 
                                checked={mirrorEvenPages} 
                                onChange={(e) => setMirrorEvenPages(e.target.checked)} 
                                className="w-4 h-4 text-[#b84a56] rounded border-2 border-[#eedad5] focus:ring-[#b84a56]"
                            />
                            <label htmlFor="mirror" className="ml-2.5 text-sm text-slate-800 font-black cursor-pointer">Espelhar páginas pares no verso (Frente/Verso)</label>
                        </div>
                        {mirrorEvenPages && (
                            <div className="ml-6 pl-4 border-l-2 border-[#eedad5] mt-2 space-y-2">
                                <span className="block text-[11px] uppercase font-black text-slate-700">Modo de Espelhamento no Verso</span>
                                <div className="flex rounded-xl bg-[#faf6f4] p-1 border-2 border-[#eedad5]">
                                    <button
                                        type="button"
                                        onClick={() => setMirrorContentOnVerso(false)}
                                        className={`flex-1 py-1.5 px-3 text-xs font-black rounded-lg transition-all cursor-pointer ${
                                            !mirrorContentOnVerso 
                                                ? 'bg-[#b84a56] text-white shadow-xs' 
                                                : 'text-slate-700 hover:text-slate-900 hover:bg-white'
                                        }`}
                                    >
                                        Apenas Margens
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setMirrorContentOnVerso(true)}
                                        className={`flex-1 py-1.5 px-3 text-xs font-black rounded-lg transition-all cursor-pointer ${
                                            mirrorContentOnVerso 
                                                ? 'bg-[#b84a56] text-white shadow-xs' 
                                                : 'text-slate-700 hover:text-slate-900 hover:bg-white'
                                        }`}
                                    >
                                        Margens + Conteúdo
                                    </button>
                                </div>
                                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                                    {!mirrorContentOnVerso
                                        ? '✓ Apenas as margens interna/externa invertem para encadernação. O conteúdo mantém a mesma posição da frente.'
                                        : '✓ As margens e a posição horizontal de todos os elementos são invertidas no verso.'}
                                </p>
                            </div>
                        )}

                        <div className="flex items-center">
                            <input 
                                type="checkbox" 
                                id="customVerso" 
                                checked={customVerso} 
                                onChange={(e) => setCustomVerso(e.target.checked)} 
                                className="w-4 h-4 text-[#b84a56] rounded border-2 border-[#eedad5] focus:ring-[#b84a56]"
                            />
                            <label htmlFor="customVerso" className="ml-2.5 text-sm font-black text-slate-800 cursor-pointer">Diferenciar layout da Frente e do Verso (Costas)</label>
                        </div>
                        {customVerso && (
                            <div className="ml-6 flex items-center pl-4 border-l-2 border-[#eedad5]">
                                <input 
                                    type="checkbox" 
                                    id="versoAdvancesSequence" 
                                    checked={versoAdvancesSequence === false} 
                                    onChange={(e) => setVersoAdvancesSequence(!e.target.checked)} 
                                    className="w-4 h-4 text-[#b84a56] rounded border-2 border-[#eedad5] focus:ring-[#b84a56]"
                                />
                                <label htmlFor="versoAdvancesSequence" className="ml-2.5 text-xs text-slate-700 font-medium cursor-pointer">
                                    Não pular sequência de datas no verso (manter mesma data na frente e verso)
                                </label>
                            </div>
                        )}
                    </div>
                </div>

                {/* Transição de Meses e Alinhamento à Direita */}
                {!(projectType === 'notebook' || projectType === 'devotional') && (
                    <div className="space-y-4 pt-4 border-t-2 border-[#eedad5]">
                        <label className="flex items-center text-sm font-black text-slate-800 uppercase mb-1 gap-2">
                            <BookOpen className="w-4 h-4 text-[#b84a56]" /> Transição de Meses & Alinhamento
                        </label>
                        <div className="bg-[#faf6f4] p-5 rounded-2xl border-2 border-[#eedad5] space-y-3.5">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={includeMonthlyDividers} 
                                    onChange={(e) => setIncludeMonthlyDividers(e.target.checked)} 
                                    className="rounded text-[#b84a56] focus:ring-[#b84a56] h-4 w-4 border-2 border-[#eedad5]" 
                                />
                                <span className="text-xs font-black text-slate-800">Incluir Divisórias de Meses (Capas)</span>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={includeMonthlyIntroPages} 
                                    onChange={(e) => setIncludeMonthlyIntroPages(e.target.checked)} 
                                    className="rounded text-[#b84a56] focus:ring-[#b84a56] h-4 w-4 border-2 border-[#eedad5]" 
                                />
                                <span className="text-xs font-black text-slate-800">Incluir Páginas Mensais (Notas/Planejamentos)</span>
                            </label>

                            <div className="pt-3 border-t-2 border-[#eedad5]">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={startMonthOnRightPage} 
                                        onChange={(e) => setStartMonthOnRightPage(e.target.checked)} 
                                        className="rounded text-[#b84a56] focus:ring-[#b84a56] h-4 w-4 border-2 border-[#eedad5]" 
                                    />
                                    <span className="text-xs font-black text-slate-800">Sempre iniciar o primeiro dia do mês na página direita</span>
                                </label>
                                <p className="text-xs text-slate-600 ml-7 mt-1 font-medium leading-relaxed">
                                    Garante que o dia 1 de cada mês comece sempre em página ímpar (direita), inserindo página complementar ao final do período anterior quando necessário.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Submit */}
                <div className="pt-4 border-t border-[#eedad5] flex justify-end">
                    <button 
                        onClick={handleSubmit}
                        className="bg-gradient-to-r from-[#b84a56] to-[#c45663] hover:from-[#a83f4b] hover:to-[#b84a56] text-white font-black py-3.5 px-8 rounded-xl shadow-lg hover:shadow-xl shadow-[#b84a56]/20 transition-all flex items-center gap-2 transform hover:scale-[1.02] cursor-pointer"
                    >
                        {defaultValues ? 'Atualizar Layout' : 'Criar Layout'} <ArrowRight className="w-5 h-5" />
                    </button>
                </div>

            </div>
        </div>
      </div>
    </div>
  );
};
