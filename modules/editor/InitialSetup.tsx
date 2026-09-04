import React, { useState, useEffect } from 'react';
import { AgendaConfig, PageSize, PageOrientation, PageMargins, PageLayoutType, Holiday, LayoutElement, ProjectType } from '../../types';
import { FileText, BookOpen, ArrowRight, Settings, Grid, Columns, Upload, Plus, Trash2, Calendar, ClipboardList, PenTool, LogOut, Lock, Zap } from 'lucide-react';
import { importProject } from '../../core/logic/fileSystem';
import { isProjectYearRestricted } from '../../core/backend/calendar';
import { WEEKLY_VERTICAL_LEFT, WEEKLY_VERTICAL_RIGHT, WEEKLY_HORIZONTAL_LEFT, WEEKLY_HORIZONTAL_RIGHT, WEEKLY_ONE_PAGE_VERTICAL, WEEKLY_ONE_PAGE_HORIZONTAL } from './templates/plannerTemplates';
import { INTRO_TEMPLATES } from './templates/introTemplates';
import { NOTEBOOK_TEMPLATES, DEVOTIONAL_TEMPLATES } from './templates/extraTemplates';

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

export const InitialSetup: React.FC<InitialSetupProps> = ({ onComplete, userEmail, defaultValues, onLogout, userPlan = 'pro' }) => {
  const [step, setStep] = useState<'type' | 'library' | 'template' | 'config'>(defaultValues ? 'config' : 'type');
  const [projectType, setProjectType] = useState<ProjectType | null>(defaultValues?.projectType || null);
  const [templateCategory, setTemplateCategory] = useState<'intro' | 'planner'>('intro');
  const [plannerStyle, setPlannerStyle] = useState<'blank' | 'lines' | 'dots' | 'grid' | 'timetable'>('lines');
  const [selectedIntroTemplate, setSelectedIntroTemplate] = useState<string | null>(null);
  const [selectedTemplateElements, setSelectedTemplateElements] = useState<LayoutElement[] | null>(null);
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
          setTemplateCategory('intro');
          setStep('config');
      } else if (type === 'planner') {
          setLayoutType('weekly_vertical');
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

  const handleTemplateSelect = (type: PageLayoutType, style: 'blank' | 'lines' | 'dots' | 'grid' | 'timetable') => {
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
              elements = template.elements.map(el => ({ ...el, id: Math.random().toString(36).substr(2, 9) }));
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-sans relative">
        {onLogout && (
          <button
            onClick={onLogout}
            className="absolute top-6 right-6 flex items-center gap-2 px-4 py-2 text-xs font-bold text-gray-600 hover:text-red-650 bg-white hover:bg-red-50/50 border border-gray-200 hover:border-red-200 rounded-xl transition-all shadow-sm cursor-pointer z-50"
          >
            <LogOut className="w-4 h-4 text-gray-400" />
            <span>Sair do Aplicativo</span>
          </button>
        )}
        <div className="max-w-4xl w-full flex flex-col gap-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">O que você vai criar hoje?</h1>
            <p className="text-gray-500">Escolha o tipo de projeto para começar a configurar seu miolo.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button 
              onClick={() => handleProjectTypeSelect('agenda')}
              className="group bg-white p-8 rounded-2xl shadow-sm border-2 border-transparent hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-50 transition-all flex flex-col items-center text-center gap-6"
            >
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                <Calendar className="w-8 h-8 text-indigo-600 group-hover:text-white transition-colors" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Agenda</h3>
                <p className="text-xs text-gray-500 leading-relaxed">Layouts diários. 1 ou 2 dias por página.</p>
              </div>
              <div className="mt-auto px-4 py-2 bg-gray-100 rounded-full text-[10px] font-bold text-gray-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-all">
                SELECIONAR
              </div>
            </button>

            <button 
              onClick={() => handleProjectTypeSelect('planner')}
              className="group bg-white p-8 rounded-2xl shadow-sm border-2 border-transparent hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-50 transition-all flex flex-col items-center text-center gap-6"
            >
              <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center group-hover:bg-amber-500 transition-colors">
                <BookOpen className="w-8 h-8 text-amber-600 group-hover:text-white transition-colors" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Planner</h3>
                <p className="text-xs text-gray-500 leading-relaxed">Visão semanal em duas páginas.</p>
              </div>
              <div className="mt-auto px-4 py-2 bg-gray-100 rounded-full text-[10px] font-bold text-gray-400 group-hover:bg-amber-100 group-hover:text-amber-600 transition-all">
                SELECIONAR
              </div>
            </button>

            <button 
              onClick={() => handleProjectTypeSelect('notebook')}
              className="group bg-white p-8 rounded-2xl shadow-sm border-2 border-transparent hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-50 transition-all flex flex-col items-center text-center gap-6"
            >
              <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center group-hover:bg-emerald-500 transition-colors">
                <PenTool className="w-8 h-8 text-emerald-600 group-hover:text-white transition-colors" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Caderno</h3>
                <p className="text-xs text-gray-500 leading-relaxed">Pautados, quadriculados ou pontilhados.</p>
              </div>
              <div className="mt-auto px-4 py-2 bg-gray-100 rounded-full text-[10px] font-bold text-gray-400 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-all">
                SELECIONAR
              </div>
            </button>
          </div>

          <div className="flex justify-center mt-4">
            <button 
              onClick={handleImportClick}
              className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 rounded-xl text-sm font-bold text-gray-600 transition-all border border-gray-200 shadow-sm"
            >
              <Upload className="w-4 h-4" /> OU IMPORTAR PROJETO EXISTENTE
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
    const isNotebook = projectType === 'notebook';
    const isDevotional = projectType === 'devotional';

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-sans relative">
        {onLogout && (
          <button
            onClick={onLogout}
            className="absolute top-6 right-6 flex items-center gap-2 px-4 py-2 text-xs font-bold text-gray-600 hover:text-red-650 bg-white hover:bg-red-50/50 border border-gray-200 hover:border-red-200 rounded-xl transition-all shadow-sm cursor-pointer z-50"
          >
            <LogOut className="w-4 h-4 text-gray-400" />
            <span>Sair do Aplicativo</span>
          </button>
        )}
        <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-gray-100">
          <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-3">
              <button onClick={() => setStep('type')} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><ArrowRight className="w-5 h-5 rotate-180" /></button>
              <div>
                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">
                    {isNotebook ? 'Modelos de Cadernos' : isAgenda ? 'Modelos de Agenda' : 'Modelos de Planner'}
                </h3>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Escolha um ponto de partida</p>
              </div>
            </div>
          </div>

          <div className="p-10 overflow-y-auto max-h-[70vh] bg-white">
            {isPlanner ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                    <Columns className="w-4 h-4 text-indigo-500" />
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Semanal Vertical (2 Págs)</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => handleTemplateSelect('weekly_vertical', 'blank')} className="group p-4 bg-white border-2 border-gray-100 rounded-2xl hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-50 transition-all flex flex-col items-center gap-4">
                      <div className="w-16 h-20 border-2 border-gray-200 rounded-lg bg-gray-50 group-hover:bg-white transition-colors"></div>
                      <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Em Branco</span>
                    </button>
                    <button onClick={() => handleTemplateSelect('weekly_vertical', 'timetable')} className="group p-4 bg-white border-2 border-gray-100 rounded-2xl hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-50 transition-all flex flex-col items-center gap-4">
                      <div className="w-16 h-20 border-2 border-gray-200 rounded-lg bg-gray-50 group-hover:bg-white transition-colors flex flex-col justify-center gap-1.5 px-2">
                        <div className="h-px bg-gray-300 w-full"></div>
                        <div className="h-px bg-gray-300 w-full"></div>
                        <div className="h-px bg-gray-300 w-full"></div>
                        <div className="h-px bg-gray-300 w-full"></div>
                      </div>
                      <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest text-center leading-tight">Tabela de Horários</span>
                    </button>
                    <button onClick={() => handleTemplateSelect('weekly_vertical', 'dots')} className="group p-4 bg-white border-2 border-gray-100 rounded-2xl hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-50 transition-all flex flex-col items-center gap-4">
                      <div className="w-16 h-20 border-2 border-gray-200 rounded-lg bg-gray-50 group-hover:bg-white transition-colors flex flex-wrap content-center justify-center gap-1.5 p-2 overflow-hidden">
                        {Array.from({length: 12}).map((_, i) => <div key={i} className="w-1 h-1 rounded-full bg-gray-300"></div>)}
                      </div>
                      <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Pontilhado</span>
                    </button>
                    <button onClick={() => handleTemplateSelect('weekly_vertical', 'grid')} className="group p-4 bg-white border-2 border-gray-100 rounded-2xl hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-50 transition-all flex flex-col items-center gap-4">
                      <div className="w-16 h-20 border-2 border-gray-200 rounded-lg bg-gray-50 group-hover:bg-white transition-colors grid grid-cols-3 grid-rows-4 border-collapse">
                        {Array.from({length: 12}).map((_, i) => <div key={i} className="border-[0.5px] border-gray-200"></div>)}
                      </div>
                      <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Quadriculado</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                    <Grid className="w-4 h-4 text-amber-500" />
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Semanal Horizontal (2 Págs)</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => handleTemplateSelect('weekly_horizontal', 'blank')} className="group p-4 bg-white border-2 border-gray-100 rounded-2xl hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-50 transition-all flex flex-col items-center gap-4">
                      <div className="w-20 h-16 border-2 border-gray-200 rounded-lg bg-gray-50 group-hover:bg-white transition-colors"></div>
                      <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Em Branco</span>
                    </button>
                    <button onClick={() => handleTemplateSelect('weekly_horizontal', 'timetable')} className="group p-4 bg-white border-2 border-gray-100 rounded-2xl hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-50 transition-all flex flex-col items-center gap-4">
                      <div className="w-20 h-16 border-2 border-gray-200 rounded-lg bg-gray-50 group-hover:bg-white transition-colors flex flex-col justify-center gap-1.5 px-2">
                        <div className="h-px bg-gray-300 w-full"></div>
                        <div className="h-px bg-gray-300 w-full"></div>
                        <div className="h-px bg-gray-300 w-full"></div>
                      </div>
                      <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest text-center leading-tight">Tabela de Horários</span>
                    </button>
                    <button onClick={() => handleTemplateSelect('weekly_horizontal', 'dots')} className="group p-4 bg-white border-2 border-gray-100 rounded-2xl hover:border-orange-500 hover:shadow-xl hover:shadow-orange-50 transition-all flex flex-col items-center gap-4">
                      <div className="w-20 h-16 border-2 border-gray-200 rounded-lg bg-gray-50 group-hover:bg-white transition-colors flex flex-wrap content-center justify-center gap-1.5 p-2 overflow-hidden">
                        {Array.from({length: 12}).map((_, i) => <div key={i} className="w-1 h-1 rounded-full bg-gray-300"></div>)}
                      </div>
                      <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Pontilhado</span>
                    </button>
                    <button onClick={() => handleTemplateSelect('weekly_horizontal', 'grid')} className="group p-4 bg-white border-2 border-gray-100 rounded-2xl hover:border-orange-500 hover:shadow-xl hover:shadow-orange-50 transition-all flex flex-col items-center gap-4">
                      <div className="w-20 h-16 border-2 border-gray-200 rounded-lg bg-gray-50 group-hover:bg-white transition-colors grid grid-cols-4 grid-rows-3 border-collapse">
                        {Array.from({length: 12}).map((_, i) => <div key={i} className="border-[0.5px] border-gray-200"></div>)}
                      </div>
                      <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Quadriculado</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                    <Columns className="w-4 h-4 text-emerald-500" />
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Semanal 1 Pág (Colunas)</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => handleTemplateSelect('weekly_one_page_vertical', 'blank')} className="group p-4 bg-white border-2 border-gray-100 rounded-2xl hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-50 transition-all flex flex-col items-center gap-4">
                      <div className="w-16 h-20 border-2 border-gray-200 rounded-lg bg-gray-50 group-hover:bg-white transition-colors flex p-1 gap-1">
                        <div className="flex-1 bg-gray-200 rounded-sm"></div>
                        <div className="flex-1 bg-gray-200 rounded-sm"></div>
                        <div className="flex-1 bg-gray-200 rounded-sm"></div>
                      </div>
                      <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Padrão Colunas</span>
                    </button>
                    <button onClick={() => handleTemplateSelect('weekly_one_page_vertical', 'lines')} className="group p-4 bg-white border-2 border-gray-100 rounded-2xl hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-50 transition-all flex flex-col items-center gap-4">
                      <div className="w-16 h-20 border-2 border-gray-200 rounded-lg bg-gray-50 group-hover:bg-white transition-colors flex p-1 gap-1">
                        <div className="flex-1 border border-gray-200 rounded-sm flex flex-col justify-around p-0.5">
                          <div className="h-px bg-gray-300 w-full"></div>
                          <div className="h-px bg-gray-300 w-full"></div>
                        </div>
                        <div className="flex-1 border border-gray-200 rounded-sm flex flex-col justify-around p-0.5">
                          <div className="h-px bg-gray-300 w-full"></div>
                          <div className="h-px bg-gray-300 w-full"></div>
                        </div>
                      </div>
                      <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Colunas Pautadas</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                    <Grid className="w-4 h-4 text-purple-500" />
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Semanal 1 Pág (Linhas)</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => handleTemplateSelect('weekly_one_page_horizontal', 'blank')} className="group p-4 bg-white border-2 border-gray-100 rounded-2xl hover:border-purple-500 hover:shadow-xl hover:shadow-purple-50 transition-all flex flex-col items-center gap-4">
                      <div className="w-16 h-20 border-2 border-gray-200 rounded-lg bg-gray-50 group-hover:bg-white transition-colors flex flex-col p-1 gap-1">
                        <div className="flex-1 bg-gray-200 rounded-sm"></div>
                        <div className="flex-1 bg-gray-200 rounded-sm"></div>
                        <div className="flex-1 bg-gray-200 rounded-sm"></div>
                      </div>
                      <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Padrão Faixas</span>
                    </button>
                    <button onClick={() => handleTemplateSelect('weekly_one_page_horizontal', 'lines')} className="group p-4 bg-white border-2 border-gray-100 rounded-2xl hover:border-purple-500 hover:shadow-xl hover:shadow-purple-50 transition-all flex flex-col items-center gap-4">
                      <div className="w-16 h-20 border-2 border-gray-200 rounded-lg bg-gray-50 group-hover:bg-white transition-colors flex flex-col p-1 gap-1">
                        <div className="flex-1 border border-gray-200 rounded-sm flex flex-col justify-around px-0.5">
                          <div className="h-px bg-gray-300 w-full"></div>
                        </div>
                        <div className="flex-1 border border-gray-200 rounded-sm flex flex-col justify-around px-0.5">
                          <div className="h-px bg-gray-300 w-full"></div>
                        </div>
                      </div>
                      <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Faixas Pautadas</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {(isNotebook ? NOTEBOOK_TEMPLATES : DEVOTIONAL_TEMPLATES).map((template) => (
                  <button 
                    key={template.id}
                    onClick={() => handlExtraTemplateSelect(template.elements)}
                    className="group p-4 bg-white border-2 border-gray-100 rounded-2xl hover:border-orange-500 hover:shadow-xl hover:shadow-orange-50 transition-all flex flex-col items-center gap-4"
                  >
                    <div className="w-full aspect-[3/4] border-2 border-gray-200 rounded-lg bg-gray-50 group-hover:bg-white transition-colors relative overflow-hidden p-1">
                      <div className="absolute inset-2 opacity-40 pointer-events-none scale-75 origin-top">
                        {template.elements.slice(0, 5).map((el, i) => (
                          <div 
                            key={i} 
                            className="absolute bg-gray-300 rounded-sm"
                            style={{ left: `${el.x}%`, top: `${el.y}%`, width: `${el.w}%`, height: `${el.h/2}%` }}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest text-center">{template.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="p-6 bg-gray-50 border-t border-gray-100 text-center">
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.3em]">Selecione um ponto de partida para personalizar</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-sans relative">
      {onLogout && (
        <button
          onClick={onLogout}
          className="absolute top-6 right-6 flex items-center gap-2 px-4 py-2 text-xs font-bold text-gray-600 hover:text-red-650 bg-white hover:bg-red-50/50 border border-gray-200 hover:border-red-200 rounded-xl transition-all shadow-sm cursor-pointer z-50"
        >
          <LogOut className="w-4 h-4 text-gray-400" />
          <span>Sair do Aplicativo</span>
        </button>
      )}
      <div className="max-w-5xl w-full bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        {/* Left Side: Visual Preview */}
        <div className="w-full md:w-1/3 bg-orange-600 p-8 text-white flex flex-col justify-between">
            <div>
                <button 
                  onClick={() => setStep('type')}
                  className="mb-6 flex items-center gap-2 text-orange-200 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest cursor-pointer"
                >
                  ← Escolher outro tipo de projeto
                </button>
                <h2 className="text-2xl font-bold mb-2">{defaultValues ? 'Editar Projeto' : 'Novo Projeto'}</h2>
                <div className="text-orange-200 text-sm">
                  {projectType === 'agenda' && 'Configurando Agenda Diária'}
                  {projectType === 'planner' && 'Configurando Planner Semanal'}
                  {projectType === 'notebook' && 'Configurando Novo Caderno'}
                  {projectType === 'devotional' && 'Configurando Novo Devocional'}
                </div>
                
                {!defaultValues && (
                  <button 
                    onClick={handleImportClick}
                    className="mt-6 flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors border border-white/20"
                  >
                    <Upload className="w-4 h-4" /> Importar Projeto (.json)
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
                    <div className="absolute border border-dashed border-orange-300"
                        style={{
                            top: `${margins.top/2}px`,
                            bottom: `${margins.bottom/2}px`,
                            left: `${margins.inside/2}px`,
                            right: `${margins.outside/2}px`
                        }}
                    >
                        {/* Layout Visualization Placeholder */}
                        <div className="w-full h-full flex flex-col p-2 gap-1 opacity-20">
                            {layoutType === '1_per_page' && <div className="flex-1 bg-orange-900 rounded"></div>}
                            {layoutType === '2_per_page' && <><div className="flex-1 bg-orange-900 rounded"></div><div className="flex-1 bg-orange-900 rounded"></div></>}
                            {layoutType === '1_per_page_weekend_shared' && <div className="flex-1 bg-orange-900 rounded border-2 border-white"></div>}
                            {layoutType === 'weekly_vertical' && <div className="flex-1 flex gap-1"><div className="flex-1 bg-orange-900 rounded"></div><div className="flex-1 bg-orange-900 rounded"></div><div className="flex-1 bg-orange-900 rounded"></div></div>}
                            {layoutType === 'weekly_horizontal' && <div className="flex-1 flex flex-col gap-1"><div className="flex-1 bg-orange-900 rounded"></div><div className="flex-1 bg-orange-900 rounded"></div><div className="flex-1 bg-orange-900 rounded"></div></div>}
                            {(projectType === 'notebook' || projectType === 'devotional') && <div className="flex-1 bg-orange-900/50 rounded flex flex-col p-1 gap-1">
                                <div className="h-0.5 bg-orange-300 w-1/2"></div>
                                <div className="h-0.5 bg-orange-300/50 w-3/4"></div>
                                <div className="h-0.5 bg-orange-300/50 w-full"></div>
                            </div>}
                        </div>
                    </div>
                    <div className="absolute -bottom-6 left-0 right-0 text-center text-orange-100 text-[10px] font-mono">
                        {displayW}mm x {displayH}mm
                    </div>
                </div>
            </div>

            <div className="text-xs text-orange-200 opacity-70">
                Usuário: {userEmail}
            </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-2/3 p-8 md:p-10 overflow-y-auto max-h-[90vh] custom-scrollbar">
            <div className="space-y-8">
                
                {/* Nome do Projeto */}
                <div className="bg-orange-50/50 p-6 rounded-2xl border border-orange-100 mb-2">
                    <label className="flex items-center text-sm font-bold text-orange-900 uppercase mb-3 gap-2">
                        <FileText className="w-4 h-4 text-orange-500" /> Nome do Projeto
                    </label>
                    <input 
                        type="text" 
                        value={projectName} 
                        onChange={(e) => setProjectName(e.target.value)} 
                        placeholder="Ex: Agenda 2025 Florada"
                        className="w-full p-3 border-2 border-white bg-white rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-lg font-bold text-gray-700 shadow-sm"
                    />
                    <p className="text-xs text-orange-400 mt-2 font-medium">Esse nome será usado para salvar o arquivo no seu computador.</p>
                </div>

                {/* Layout Type Selection (New) - Esconder se for notebook ou devotional */}
                {!(projectType === 'notebook' || projectType === 'devotional') && (
                    <div>
                        <label className="flex items-center text-sm font-bold text-gray-700 uppercase mb-3 gap-2">
                            <Grid className="w-4 h-4 text-orange-500" /> Layout do Miolo
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {projectType === 'agenda' ? (
                                <>
                                    <button 
                                        onClick={() => setLayoutType('1_per_page')}
                                        className={`p-3 border rounded-lg flex flex-col items-center gap-2 transition-all ${layoutType === '1_per_page' ? 'bg-orange-50 border-orange-500 ring-1 ring-orange-500' : 'hover:border-orange-300'}`}
                                    >
                                        <div className="w-8 h-10 border border-gray-400 rounded bg-white flex items-center justify-center"><div className="w-4 h-6 bg-gray-200 rounded-sm"></div></div>
                                        <span className="text-xs font-bold text-gray-700 text-center">1 Dia / Pág</span>
                                    </button>
                                    <button 
                                        onClick={() => setLayoutType('2_per_page')}
                                        className={`p-3 border rounded-lg flex flex-col items-center gap-2 transition-all ${layoutType === '2_per_page' ? 'bg-orange-50 border-orange-500 ring-1 ring-orange-500' : 'hover:border-orange-300'}`}
                                    >
                                        <div className="w-8 h-10 border border-gray-400 rounded bg-white flex flex-col p-0.5 gap-0.5"><div className="flex-1 bg-gray-200 rounded-sm"></div><div className="h-px bg-gray-300"></div><div className="flex-1 bg-gray-200 rounded-sm"></div></div>
                                        <span className="text-xs font-bold text-gray-700 text-center">2 Dias / Pág</span>
                                    </button>
                                    <button 
                                        onClick={() => setLayoutType('1_per_page_weekend_shared')}
                                        className={`p-3 border rounded-lg flex flex-col items-center gap-2 transition-all ${layoutType === '1_per_page_weekend_shared' ? 'bg-orange-50 border-orange-500 ring-1 ring-orange-500' : 'hover:border-orange-300'}`}
                                    >
                                        <div className="w-8 h-10 border border-gray-400 rounded bg-white flex flex-col p-0.5 gap-0.5"><div className="flex-[2] bg-gray-200 rounded-sm border border-dashed border-gray-400"></div><div className="flex-1 flex gap-0.5"><div className="flex-1 bg-gray-300 rounded-sm"></div><div className="flex-1 bg-gray-300 rounded-sm"></div></div></div>
                                        <span className="text-xs font-bold text-gray-700 text-center">Fim de Semana Dividido</span>
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button 
                                        onClick={() => setLayoutType('weekly_vertical')}
                                        className={`p-3 border rounded-lg flex flex-col items-center gap-2 transition-all ${layoutType === 'weekly_vertical' ? 'bg-orange-50 border-orange-500 ring-1 ring-orange-500' : 'hover:border-orange-300'}`}
                                    >
                                        <div className="w-8 h-10 border border-gray-400 rounded bg-white flex p-0.5 gap-0.5"><div className="flex-1 bg-gray-200 rounded-sm"></div><div className="flex-1 bg-gray-200 rounded-sm"></div><div className="flex-1 bg-gray-200 rounded-sm"></div></div>
                                        <span className="text-xs font-bold text-gray-700 text-center">Semanal Vertical (2 Págs)</span>
                                    </button>
                                    <button 
                                        onClick={() => setLayoutType('weekly_horizontal')}
                                        className={`p-3 border rounded-lg flex flex-col items-center gap-2 transition-all ${layoutType === 'weekly_horizontal' ? 'bg-orange-50 border-orange-500 ring-1 ring-orange-500' : 'hover:border-orange-300'}`}
                                    >
                                        <div className="w-8 h-10 border border-gray-400 rounded bg-white flex flex-col p-0.5 gap-0.5"><div className="flex-1 bg-gray-200 rounded-sm"></div><div className="flex-1 bg-gray-200 rounded-sm"></div><div className="flex-1 bg-gray-200 rounded-sm"></div></div>
                                        <span className="text-xs font-bold text-gray-700 text-center">Semanal Horizontal (2 Págs)</span>
                                    </button>
                                    <button 
                                        onClick={() => setLayoutType('weekly_one_page_vertical')}
                                        className={`p-3 border rounded-lg flex flex-col items-center gap-2 transition-all ${layoutType === 'weekly_one_page_vertical' ? 'bg-orange-50 border-orange-500 ring-1 ring-orange-500' : 'hover:border-orange-300'}`}
                                    >
                                        <div className="w-8 h-10 border border-gray-400 rounded bg-white flex p-0.5 gap-0.5"><div className="flex-1 bg-gray-200 rounded-sm"></div><div className="flex-1 bg-gray-200 rounded-sm"></div><div className="flex-1 bg-gray-200 rounded-sm"></div><div className="flex-1 bg-gray-200 rounded-sm"></div></div>
                                        <span className="text-xs font-bold text-gray-700 text-center">Semanal 1 Pág (Colunas)</span>
                                    </button>
                                    <button 
                                        onClick={() => setLayoutType('weekly_one_page_horizontal')}
                                        className={`p-3 border rounded-lg flex flex-col items-center gap-2 transition-all ${layoutType === 'weekly_one_page_horizontal' ? 'bg-orange-50 border-orange-500 ring-1 ring-orange-500' : 'hover:border-orange-300'}`}
                                    >
                                        <div className="w-8 h-10 border border-gray-400 rounded bg-white flex flex-col p-0.5 gap-0.5"><div className="flex-1 bg-gray-200 rounded-sm"></div><div className="flex-1 bg-gray-200 rounded-sm"></div><div className="flex-1 bg-gray-200 rounded-sm"></div><div className="flex-1 bg-gray-200 rounded-sm"></div></div>
                                        <span className="text-xs font-bold text-gray-700 text-center">Semanal 1 Pág (Linhas)</span>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}

                <div className="h-px bg-gray-100"></div>

                {/* Ano - Esconder se for notebook ou devotional */}
                {!(projectType === 'notebook' || projectType === 'devotional') && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="flex items-center text-sm font-bold text-gray-700 uppercase mb-3 gap-2">
                                    <Settings className="w-4 h-4 text-orange-500" /> Ano de Referência
                                </label>
                                <input 
                                    type="number" 
                                    value={year} 
                                    onChange={(e) => setYear(parseInt(e.target.value) || 2027)} 
                                    className={`w-full p-2 border rounded focus:ring-2 focus:ring-orange-500 outline-none text-lg font-bold ${
                                      isProjectYearRestricted(projectType || 'agenda', year, startMonth, durationMonths, userPlan)
                                         ? 'border-amber-400 bg-amber-50/20 text-amber-900' 
                                         : 'border-gray-300 text-gray-700'
                                    }`}
                                />
                                <p className="text-xs text-gray-400 mt-1">Define os feriados nacionais automaticamente.</p>

                                {isProjectYearRestricted(projectType || 'agenda', year, startMonth, durationMonths, userPlan) && (
                                    <div className="mt-3 p-3.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 leading-relaxed shadow-sm">
                                        <p className="font-bold flex items-center gap-1.5 mb-1 text-amber-950">
                                            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-pulse" /> Assinatura Requerida para {year}
                                        </p>
                                        <p>Seu plano atual cobre os anos de <strong>2026 e 2027</strong> e permite no máximo <strong>1 mês de 2028</strong> (ex: agenda de 13 meses de Jan/2027 a Jan/2028).</p>
                                        <p className="mt-1 font-semibold">Para liberar mais meses de 2028 em diante, é necessária a renovação da sua assinatura anual!</p>
                                        <div className="mt-2.5 flex gap-2">
                                            <button 
                                                type="button"
                                                onClick={() => { setYear(2027); setStartMonth(0); setDurationMonths(12); }} 
                                                className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-1 px-2.5 rounded text-[10px] transition-colors"
                                            >
                                                Ajustar para 2027 (12 meses)
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={() => { setYear(2027); setStartMonth(0); setDurationMonths(13); }} 
                                                className="bg-gray-100 hover:bg-gray-200 text-gray-750 font-bold py-1 px-2.5 rounded text-[10px] border border-gray-200 transition-colors"
                                            >
                                                Jan/27 a Jan/28 (13 meses)
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="flex items-center text-sm font-bold text-gray-700 uppercase mb-3 gap-2">
                                    <Calendar className="w-4 h-4 text-orange-500" /> Mês Inicial da Agenda
                                </label>
                                <select
                                    value={startMonth}
                                    onChange={(e) => setStartMonth(parseInt(e.target.value))}
                                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 outline-none text-sm font-bold text-gray-755 bg-white"
                                >
                                    {['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'].map((mName, idx) => (
                                        <option key={idx} value={idx}>{mName}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="flex items-center text-sm font-bold text-gray-700 uppercase mb-3 gap-2">
                                    <Settings className="w-4 h-4 text-orange-500" /> Duração da Agenda
                                </label>
                                <select
                                    value={durationMonths}
                                    onChange={(e) => setDurationMonths(parseInt(e.target.value))}
                                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 outline-none text-sm font-bold text-gray-755 bg-white"
                                >
                                    {Array.from({ length: 13 }, (_, i) => i + 1).map(m => (
                                        <option key={m} value={m}>{m} {m === 1 ? 'mês' : 'meses'}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="flex items-center text-sm font-bold text-gray-700 uppercase mb-3 gap-2">
                                <Calendar className="w-4 h-4 text-orange-500" /> Feriados Municipais
                            </label>
                            <div className="space-y-2">
                                {municipalHolidays.map((holiday, index) => (
                                    <div key={index} className="flex gap-2 items-center bg-gray-50 p-2 rounded border border-gray-200">
                                        <input 
                                            type="date" 
                                            value={holiday.date} 
                                            onChange={(e) => updateHoliday(index, 'date', e.target.value)}
                                            className="text-xs p-1 border border-gray-300 rounded focus:ring-1 focus:ring-orange-500 outline-none"
                                        />
                                        <input 
                                            type="text" 
                                            placeholder="Nome do Feriado"
                                            value={holiday.name} 
                                            onChange={(e) => updateHoliday(index, 'name', e.target.value)}
                                            className="flex-1 text-xs p-1 border border-gray-300 rounded focus:ring-1 focus:ring-orange-500 outline-none"
                                        />
                                        <button onClick={() => removeHoliday(index)} className="text-red-500 hover:text-red-700 p-1">
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                                <button 
                                    onClick={addHoliday}
                                    className="w-full py-2 border-2 border-dashed border-gray-200 rounded-lg text-xs font-bold text-gray-400 hover:border-orange-300 hover:text-orange-500 transition-all flex items-center justify-center gap-1"
                                >
                                    <Plus className="w-3 h-3" /> Adicionar Feriado Municipal
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tamanho e Orientação */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="flex items-center text-sm font-bold text-gray-700 uppercase mb-3 gap-2">
                            <FileText className="w-4 h-4 text-orange-500" /> Tamanho da Página
                        </label>
                        <div className="space-y-2">
                            {(Object.keys(PAGE_SIZES) as PageSize[]).map((size) => (
                                <label key={size} className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${pageSize === size ? 'border-orange-500 bg-orange-50 ring-1 ring-orange-500' : 'border-gray-200 hover:border-orange-300'}`}>
                                    <input type="radio" name="pageSize" className="hidden" checked={pageSize === size} onChange={() => setPageSize(size)} />
                                    <div className="flex-1">
                                        <div className={`text-sm font-bold ${pageSize === size ? 'text-orange-900' : 'text-gray-700'}`}>{PAGE_SIZES[size].name}</div>
                                        {size !== 'Custom' && (
                                            <div className="text-xs text-gray-400">{PAGE_SIZES[size].w}mm x {PAGE_SIZES[size].h}mm</div>
                                        )}
                                    </div>
                                </label>
                            ))}
                        </div>

                        {pageSize === 'Custom' && (
                            <div className="mt-4 grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-orange-100">
                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Largura (mm)</label>
                                    <input 
                                        type="number" 
                                        value={customWidth} 
                                        onChange={(e) => setCustomWidth(parseInt(e.target.value) || 0)} 
                                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Altura (mm)</label>
                                    <input 
                                        type="number" 
                                        value={customHeight} 
                                        onChange={(e) => setCustomHeight(parseInt(e.target.value) || 0)} 
                                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 outline-none"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="flex items-center text-sm font-bold text-gray-700 uppercase mb-3 gap-2">
                            <Columns className="w-4 h-4 text-orange-500" /> Orientação
                        </label>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setOrientation('portrait')}
                                className={`flex-1 p-3 border rounded-lg flex flex-col items-center gap-2 transition-all ${orientation === 'portrait' ? 'bg-orange-50 border-orange-500 text-orange-700' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                            >
                                <div className="w-6 h-8 border-2 border-current rounded-sm"></div>
                                <span className="text-xs font-bold">Retrato</span>
                            </button>
                            <button 
                                onClick={() => setOrientation('landscape')}
                                className={`flex-1 p-3 border rounded-lg flex flex-col items-center gap-2 transition-all ${orientation === 'landscape' ? 'bg-orange-50 border-orange-500 text-orange-700' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                            >
                                <div className="w-8 h-6 border-2 border-current rounded-sm"></div>
                                <span className="text-xs font-bold">Paisagem</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Margens */}
                <div>
                    <label className="flex items-center text-sm font-bold text-gray-700 uppercase mb-3 gap-2">
                        <BookOpen className="w-4 h-4 text-orange-500" /> Margens e Sangria (mm)
                    </label>
                    <div className="grid grid-cols-4 gap-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div>
                            <span className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Topo</span>
                            <input type="number" value={margins.top} onChange={(e) => setMargins({...margins, top: parseInt(e.target.value)})} className="w-full p-1.5 text-sm border border-gray-300 rounded" />
                        </div>
                        <div>
                            <span className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Base</span>
                            <input type="number" value={margins.bottom} onChange={(e) => setMargins({...margins, bottom: parseInt(e.target.value)})} className="w-full p-1.5 text-sm border border-gray-300 rounded" />
                        </div>
                        <div>
                            <span className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Interna</span>
                            <input type="number" value={margins.inside} onChange={(e) => setMargins({...margins, inside: parseInt(e.target.value)})} className="w-full p-1.5 text-sm border border-gray-300 rounded bg-white" title="Margem da Espiral/Lombada" />
                        </div>
                        <div>
                            <span className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Externa</span>
                            <input type="number" value={margins.outside} onChange={(e) => setMargins({...margins, outside: parseInt(e.target.value)})} className="w-full p-1.5 text-sm border border-gray-300 rounded" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <div className="flex items-center">
                            <input 
                                type="checkbox" 
                                id="mirror" 
                                checked={mirrorEvenPages} 
                                onChange={(e) => setMirrorEvenPages(e.target.checked)} 
                                className="w-4 h-4 text-orange-600 rounded border-gray-300 focus:ring-orange-500"
                            />
                            <label htmlFor="mirror" className="ml-2 text-sm text-gray-700 font-medium">Espelhar páginas pares no verso (Frente/Verso)</label>
                        </div>
                        {mirrorEvenPages && (
                            <div className="ml-6 pl-3 border-l-2 border-orange-200 mt-2 space-y-1.5">
                                <span className="block text-[10px] uppercase font-bold text-gray-500">Modo de Espelhamento no Verso</span>
                                <div className="flex rounded-md bg-gray-100 p-0.5 border border-gray-200">
                                    <button
                                        type="button"
                                        onClick={() => setMirrorContentOnVerso(false)}
                                        className={`flex-1 py-1 px-2 text-xs font-semibold rounded transition-all ${
                                            !mirrorContentOnVerso 
                                                ? 'bg-white text-orange-600 shadow-sm' 
                                                : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                    >
                                        Apenas Margens
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setMirrorContentOnVerso(true)}
                                        className={`flex-1 py-1 px-2 text-xs font-semibold rounded transition-all ${
                                            mirrorContentOnVerso 
                                                ? 'bg-white text-orange-600 shadow-sm' 
                                                : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                    >
                                        Margens + Conteúdo
                                    </button>
                                </div>
                                <p className="text-[11px] text-gray-500">
                                    {!mirrorContentOnVerso
                                        ? '✓ Apenas as margens interna/externa invertem para encadernação. O conteúdo mantém a mesma posição da frente.'
                                        : '✓ As margens e a posição horizontal de todos os elementos são invertidas no verso.'}
                                </p>
                            </div>
                        )}
                    </div>
                    <div className="mt-2 flex items-center">
                        <input 
                            type="checkbox" 
                            id="customVerso" 
                            checked={customVerso} 
                            onChange={(e) => setCustomVerso(e.target.checked)} 
                            className="w-4 h-4 text-orange-600 rounded border-gray-300 focus:ring-orange-500"
                        />
                        <label htmlFor="customVerso" className="ml-2 text-sm font-medium text-gray-700">Diferenciar layout da Frente e do Verso (Costas)</label>
                    </div>
                    {customVerso && (
                        <div className="mt-2 ml-6 flex items-center">
                            <input 
                                type="checkbox" 
                                id="versoAdvancesSequence" 
                                checked={versoAdvancesSequence === false} 
                                onChange={(e) => setVersoAdvancesSequence(!e.target.checked)} 
                                className="w-4 h-4 text-orange-600 rounded border-gray-300 focus:ring-orange-500"
                            />
                            <label htmlFor="versoAdvancesSequence" className="ml-2 text-xs text-gray-600">
                                Não pular sequência de datas no verso (manter mesma data na frente e verso)
                            </label>
                        </div>
                    )}
                </div>

                {/* Transição de Meses e Alinhamento à Direita */}
                {!(projectType === 'notebook' || projectType === 'devotional') && (
                    <div className="space-y-4 pt-4 border-t border-gray-100">
                        <label className="flex items-center text-sm font-bold text-gray-700 uppercase mb-1 gap-2">
                            <BookOpen className="w-4 h-4 text-orange-500" /> Transição de Meses & Alinhamento
                        </label>
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={includeMonthlyDividers} 
                                    onChange={(e) => setIncludeMonthlyDividers(e.target.checked)} 
                                    className="rounded text-orange-600 focus:ring-orange-500 h-4 w-4" 
                                />
                                <span className="text-xs font-semibold text-gray-800">Incluir Divisórias de Meses (Capas)</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={includeMonthlyIntroPages} 
                                    onChange={(e) => setIncludeMonthlyIntroPages(e.target.checked)} 
                                    className="rounded text-orange-600 focus:ring-orange-500 h-4 w-4" 
                                />
                                <span className="text-xs font-semibold text-gray-800">Incluir Páginas Mensais (Notas/Planejamentos)</span>
                            </label>

                            <div className="pt-2 border-t border-gray-200">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={startMonthOnRightPage} 
                                        onChange={(e) => setStartMonthOnRightPage(e.target.checked)} 
                                        className="rounded text-orange-600 focus:ring-orange-500 h-4 w-4" 
                                    />
                                    <span className="text-xs font-bold text-gray-900">Sempre iniciar o primeiro dia do mês na página direita</span>
                                </label>
                                <p className="text-[11px] text-gray-500 ml-6 mt-0.5 leading-tight">
                                    Garante que o dia 1 de cada mês comece sempre em página ímpar (direita), inserindo página complementar ao final do período anterior quando necessário.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Submit */}
                <div className="pt-4 border-t border-gray-100 flex justify-end">
                    <button 
                        onClick={handleSubmit}
                        className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-2 transform hover:scale-[1.02]"
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
