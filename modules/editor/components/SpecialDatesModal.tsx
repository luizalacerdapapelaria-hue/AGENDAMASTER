import React, { useState } from 'react';
import { 
  X, 
  CalendarHeart, 
  Plus, 
  Trash2, 
  Edit3, 
  Sparkles, 
  Clock, 
  Palmtree, 
  Check, 
  Heart, 
  Tag,
  Calendar as CalendarIcon,
  HelpCircle
} from 'lucide-react';
import { SpecialDateItem, SpecialDateType } from '../../../types';
import { SPECIAL_DATE_PRESETS, formatToIsoDate } from '../../../core/logic/specialDates';

interface SpecialDatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  specialDates: SpecialDateItem[];
  onUpdateSpecialDates: (dates: SpecialDateItem[]) => void;
  projectYear: number;
  onInsertSpecialElement?: (item?: SpecialDateItem) => void;
  showSpecialDateBadges?: boolean;
  onToggleShowBadges?: (show: boolean) => void;
}

const EMOJI_OPTIONS = [
  '🏖️', '💍', '🎂', '✈️', '🎓', '⭐', '📌', '❤️', 
  '🌴', '👶', '🩺', '🌿', '🌸', '🎁', '🥂', '💒', 
  '🚗', '🏠', '✨', '☕', '📖', '🚴‍♀️', '💼', '🎯'
];

const COLOR_OPTIONS = [
  { label: 'Rosa Casamento', text: '#db2777', bg: '#fdf2f8', border: '#f472b6' },
  { label: 'Azul Férias', text: '#0284c7', bg: '#f0f9ff', border: '#38bdf8' },
  { label: 'Dourado / Mostarda', text: '#b45309', bg: '#fffbeb', border: '#fcd34d' },
  { label: 'Verde Menta', text: '#059669', bg: '#ecfdf5', border: '#6ee7b7' },
  { label: 'Roxo Lavanda', text: '#7c3aed', bg: '#f5f3ff', border: '#c4b5fd' },
  { label: 'Coral Suave', text: '#e11d48', bg: '#fff1f2', border: '#fda4af' },
  { label: 'Grafite Elegante', text: '#374151', bg: '#f9fafb', border: '#d1d5db' },
];

export const SpecialDatesModal: React.FC<SpecialDatesModalProps> = ({
  isOpen,
  onClose,
  specialDates,
  onUpdateSpecialDates,
  projectYear,
  onInsertSpecialElement,
  showSpecialDateBadges = true,
  onToggleShowBadges
}) => {
  const [editingItem, setEditingItem] = useState<SpecialDateItem | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);
  const [isRangeDate, setIsRangeDate] = useState<boolean>(false);

  // Form State
  const [formType, setFormType] = useState<SpecialDateType>('vacation');
  const [formTitle, setFormTitle] = useState<string>('');
  const [formDate, setFormDate] = useState<string>(`${projectYear}-02-20`);
  const [formEndDate, setFormEndDate] = useState<string>(`${projectYear}-02-28`);
  const [formIcon, setFormIcon] = useState<string>('🏖️');
  const [formColor, setFormColor] = useState<string>('#0284c7');
  const [formBgColor, setFormBgColor] = useState<string>('#f0f9ff');
  const [formShowBadge, setFormShowBadge] = useState<boolean>(true);

  // Countdown specific
  const [formIsCountdown, setFormIsCountdown] = useState<boolean>(false);
  const [formDaysBefore, setFormDaysBefore] = useState<number>(100);
  const [formFrequency, setFormFrequency] = useState<'daily' | 'every_5' | 'every_10' | 'last_30_daily'>('last_30_daily');
  const [formCountdownMessage, setFormCountdownMessage] = useState<string>('Faltam {dias} dias para o casamento 💍');
  const [formFinalMessage, setFormFinalMessage] = useState<string>('Hoje é o grande dia: Nosso Casamento! 💍❤️');
  const [formOneDayMessage, setFormOneDayMessage] = useState<string>('Falta 1 dia! É amanhã o casamento! 💍✨');

  // Hover state for clean, progressive disclosure
  const [hoveredPresetId, setHoveredPresetId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleApplyPreset = (preset: typeof SPECIAL_DATE_PRESETS[0]) => {
    setIsCreatingNew(true);
    setEditingItem(null);
    setFormType(preset.type);
    setFormTitle(preset.defaultTitle);
    setFormIcon(preset.icon);
    setFormColor(preset.color);
    setFormBgColor(preset.bgColor);
    setFormShowBadge(true);

    if (preset.id === 'vacation') {
      // Exemplo solicitado pelo usuário: 20 de Fevereiro!
      setFormDate(`${projectYear}-02-20`);
      setFormEndDate(`${projectYear}-02-28`);
      setIsRangeDate(true);
      setFormIsCountdown(false);
    } else if (preset.isCountdown) {
      setFormDate(`${projectYear}-10-15`);
      setFormEndDate('');
      setIsRangeDate(false);
      setFormIsCountdown(true);
      setFormDaysBefore(preset.countdownDaysBefore || 100);
      setFormFrequency(preset.countdownFrequency || 'last_30_daily');
      setFormCountdownMessage(preset.countdownMessage || 'Faltam {dias} dias para o casamento 💍');
      setFormFinalMessage(preset.countdownFinalMessage || 'Hoje é o grande dia: Nosso Casamento! 💍❤️');
      setFormOneDayMessage(preset.countdownOneDayMessage || 'Falta 1 dia! É amanhã o casamento! 💍✨');
    } else {
      setFormDate(`${projectYear}-05-10`);
      setFormEndDate('');
      setIsRangeDate(false);
      setFormIsCountdown(false);
    }
  };

  const handleEdit = (item: SpecialDateItem) => {
    setEditingItem(item);
    setIsCreatingNew(true);
    setFormType(item.type);
    setFormTitle(item.title);
    setFormDate(item.date);
    setFormEndDate(item.endDate || '');
    setIsRangeDate(!!item.endDate && item.endDate !== item.date);
    setFormIcon(item.icon || '📌');
    setFormColor(item.color || '#4f46e5');
    setFormBgColor(item.bgColor || '#eef2ff');
    setFormShowBadge(item.showBadge !== false);

    const isCd = item.isCountdown || item.type === 'wedding_countdown' || item.type === 'countdown';
    setFormIsCountdown(isCd);
    setFormDaysBefore(item.countdownDaysBefore || 100);
    setFormFrequency(item.countdownFrequency || 'last_30_daily');
    setFormCountdownMessage(item.countdownMessage || 'Faltam {dias} dias para o casamento 💍');
    setFormFinalMessage(item.countdownFinalMessage || 'Hoje é o grande dia: Nosso Casamento! 💍❤️');
    setFormOneDayMessage(item.countdownOneDayMessage || 'Falta 1 dia! É amanhã o casamento! 💍✨');
  };

  const handleDelete = (id: string) => {
    onUpdateSpecialDates(specialDates.filter(d => d.id !== id));
    if (editingItem && editingItem.id === id) {
      setIsCreatingNew(false);
      setEditingItem(null);
    }
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDate) return;

    const newItem: SpecialDateItem = {
      id: editingItem ? editingItem.id : Math.random().toString(36).substr(2, 9),
      type: formType,
      title: formTitle.trim(),
      date: formDate,
      endDate: isRangeDate && formEndDate ? formEndDate : undefined,
      icon: formIcon,
      color: formColor,
      bgColor: formBgColor,
      showBadge: formShowBadge,
      isCountdown: formIsCountdown,
      countdownDaysBefore: formIsCountdown ? formDaysBefore : undefined,
      countdownFrequency: formIsCountdown ? formFrequency : undefined,
      countdownMessage: formIsCountdown ? formCountdownMessage : undefined,
      countdownFinalMessage: formIsCountdown ? formFinalMessage : undefined,
      countdownOneDayMessage: formIsCountdown ? formOneDayMessage : undefined,
    };

    if (editingItem) {
      onUpdateSpecialDates(specialDates.map(d => d.id === editingItem.id ? newItem : d));
    } else {
      onUpdateSpecialDates([...specialDates, newItem]);
    }

    setIsCreatingNew(false);
    setEditingItem(null);
  };

  const formatDateDisplay = (isoStr: string) => {
    if (!isoStr) return '';
    const parts = isoStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return isoStr;
  };

  return (
    <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-3xl shadow-[0_20px_60px_rgba(184,74,86,0.15)] border border-[#eedad5] w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#eedad5] bg-gradient-to-r from-[#fff5f5] via-white to-[#fdeeed] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#b84a56] to-[#d98b95] text-white flex items-center justify-center shadow-md shadow-[#b84a56]/20">
              <CalendarHeart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                Informações Importantes & Contagem Regressiva no Miolo
                <span className="text-[10px] uppercase font-extrabold bg-[#fdeeed] text-[#9f3d4a] px-2.5 py-0.5 rounded-full border border-[#eedad5]">
                  Exclusivo
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Adicione as férias da cliente (ex: 20 de Fevereiro), contagem regressiva para casamentos, datas de formaturas e lembretes nas páginas da sua agenda.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[#fff5f5] flex items-center justify-center text-slate-500 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Presets Bar */}
          {!isCreatingNew && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Modelos Rápidos (1 Clique):
                </label>
                <span className="text-[11px] text-stone-400 font-medium">
                  Passe o mouse para ver detalhes
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {SPECIAL_DATE_PRESETS.map(preset => {
                  const isHovered = hoveredPresetId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => handleApplyPreset(preset)}
                      onMouseEnter={() => setHoveredPresetId(preset.id)}
                      onMouseLeave={() => setHoveredPresetId(null)}
                      onFocus={() => setHoveredPresetId(preset.id)}
                      onBlur={() => setHoveredPresetId(null)}
                      className={`p-3 rounded-xl border text-left transition-all group flex items-center gap-2.5 cursor-pointer ${
                        isHovered 
                          ? 'bg-amber-50/80 border-amber-400 shadow-sm ring-1 ring-amber-300' 
                          : 'border-stone-200 bg-stone-50/70 hover:bg-stone-100 hover:border-stone-300'
                      }`}
                    >
                      <span className="text-xl group-hover:scale-110 transition-transform">{preset.icon}</span>
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-bold text-stone-800 block truncate group-hover:text-amber-900">{preset.name}</span>
                        <span className="text-[9px] text-stone-400 font-semibold uppercase">{preset.type}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Callout on Hover */}
              {hoveredPresetId ? (
                <div className="mt-2.5 p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs flex items-center gap-2.5 text-amber-950 animate-in fade-in duration-150">
                  <span className="text-lg shrink-0">
                    {SPECIAL_DATE_PRESETS.find(p => p.id === hoveredPresetId)?.icon}
                  </span>
                  <div>
                    <span className="font-bold">{SPECIAL_DATE_PRESETS.find(p => p.id === hoveredPresetId)?.name}: </span>
                    <span className="text-amber-900">{SPECIAL_DATE_PRESETS.find(p => p.id === hoveredPresetId)?.description}</span>
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-[11px] text-stone-400 text-center font-medium italic">
                  💡 Passe o mouse sobre qualquer modelo para conferir o que ele adiciona à sua agenda.
                </p>
              )}
            </div>
          )}

          {/* Form for Creating / Editing */}
          {isCreatingNew ? (
            <div className="bg-stone-50/80 border border-stone-200 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-200">
                <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                  <span className="text-lg">{formIcon}</span>
                  {editingItem ? 'Editar Informação no Miolo' : 'Nova Informação / Contagem no Miolo'}
                </h3>
                <button
                  onClick={() => { setIsCreatingNew(false); setEditingItem(null); }}
                  className="text-xs text-stone-500 hover:text-stone-800 underline"
                >
                  Voltar para lista
                </button>
              </div>

              <form onSubmit={handleSaveForm} className="space-y-4">
                {/* Tipo e Título */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Tipo de Evento</label>
                    <select
                      value={formType}
                      onChange={e => {
                        const val = e.target.value as SpecialDateType;
                        setFormType(val);
                        if (val === 'wedding_countdown') {
                          setFormIsCountdown(true);
                          setFormIcon('💍');
                          setFormColor('#db2777');
                          setFormBgColor('#fdf2f8');
                          setIsRangeDate(false);
                          setFormEndDate('');
                          if (!formTitle || formTitle.includes('Férias') || formTitle.includes('Aniversário') || formTitle.includes('Viagem') || formTitle.includes('Lembrete') || formTitle.includes('Conquista')) {
                            setFormTitle('Casamento 💍');
                          }
                          setFormDaysBefore(100);
                          setFormFrequency('last_30_daily');
                          setFormCountdownMessage('Faltam {dias} dias para o casamento 💍');
                          setFormFinalMessage('Hoje é o grande dia: Nosso Casamento! 💍❤️');
                          setFormOneDayMessage('Falta 1 dia! É amanhã o casamento! 💍✨');
                        } else if (val === 'vacation') {
                          setFormIsCountdown(false);
                          setFormIcon('🏖️');
                          setFormColor('#0284c7');
                          setFormBgColor('#f0f9ff');
                          setIsRangeDate(true);
                          setFormEndDate(`${projectYear}-02-28`);
                          if (!formTitle || formTitle.includes('Casamento') || formTitle.includes('Aniversário') || formTitle.includes('Viagem') || formTitle.includes('Lembrete') || formTitle.includes('Conquista')) {
                            setFormTitle('Férias da Cliente 🏖️');
                          }
                        } else if (val === 'birthday') {
                          setFormIsCountdown(false);
                          setFormIcon('🎂');
                          setFormColor('#d97706');
                          setFormBgColor('#fffbeb');
                          setIsRangeDate(false);
                          setFormEndDate('');
                          if (!formTitle || formTitle.includes('Casamento') || formTitle.includes('Férias') || formTitle.includes('Viagem') || formTitle.includes('Lembrete') || formTitle.includes('Conquista')) {
                            setFormTitle('Aniversário Especial 🎂');
                          }
                        } else if (val === 'countdown') {
                          setFormIsCountdown(true);
                          setFormIcon('⏳');
                          setFormColor('#7c3aed');
                          setFormBgColor('#f5f3ff');
                          setIsRangeDate(false);
                          setFormEndDate('');
                          if (!formTitle || formTitle.includes('Casamento') || formTitle.includes('Férias') || formTitle.includes('Aniversário')) {
                            setFormTitle('Grande Conquista 🎓');
                          }
                          setFormCountdownMessage('Faltam {dias} dias para {titulo} ⏳');
                          setFormFinalMessage('Hoje é o dia de {titulo}! Parabéns! 🎉');
                          setFormOneDayMessage('Falta apenas 1 dia para {titulo}! 🌟');
                        } else {
                          setFormIsCountdown(false);
                          setIsRangeDate(false);
                          setFormEndDate('');
                        }
                      }}
                      className="w-full text-xs rounded-lg border-stone-300 shadow-2xs py-2 px-3 focus:ring-amber-500 focus:border-amber-500"
                    >
                      <option value="vacation">🏖️ Férias da Cliente</option>
                      <option value="wedding_countdown">💍 Contagem Regressiva Casamento</option>
                      <option value="countdown">⏳ Contagem Regressiva Geral</option>
                      <option value="birthday">🎂 Aniversário</option>
                      <option value="custom_event">✈️ Viagem / Evento</option>
                      <option value="reminder">📌 Lembrete / Marco</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Título que aparecerá no miolo
                    </label>
                    <input
                      type="text"
                      required
                      value={formTitle}
                      onChange={e => setFormTitle(e.target.value)}
                      placeholder="Ex: Férias da Luiza 🏖️ ou Casamento Lucas & Luiza 💍"
                      className="w-full text-xs rounded-lg border-stone-300 shadow-2xs py-2 px-3 focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Datas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-3.5 rounded-xl border border-stone-200">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      {formIsCountdown ? 'Data do Casamento / Evento Alvo' : (isRangeDate ? 'Data de Início' : 'Data do Evento')}
                    </label>
                    <input
                      type="date"
                      required
                      value={formDate}
                      onChange={e => setFormDate(e.target.value)}
                      className="w-full text-xs rounded-lg border-stone-300 shadow-2xs py-1.5 px-3 focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>

                  {!formIsCountdown && (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-stone-700">Data de Término (Período)</label>
                        <label className="text-[11px] text-stone-500 flex items-center gap-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isRangeDate}
                            onChange={e => setIsRangeDate(e.target.checked)}
                            className="rounded text-amber-600 focus:ring-amber-500 w-3 h-3"
                          />
                          Período de dias
                        </label>
                      </div>
                      <input
                        type="date"
                        disabled={!isRangeDate}
                        value={formEndDate}
                        onChange={e => setFormEndDate(e.target.value)}
                        className={`w-full text-xs rounded-lg border-stone-300 shadow-2xs py-1.5 px-3 ${!isRangeDate ? 'bg-stone-100 opacity-50 cursor-not-allowed' : 'focus:ring-amber-500 focus:border-amber-500'}`}
                      />
                    </div>
                  )}
                </div>

                {/* Seção Exclusiva: Contagem Regressiva */}
                {formIsCountdown && (
                  <div className="bg-rose-50/60 border border-rose-200/80 rounded-xl p-3.5 space-y-3">
                    <div className="flex items-center gap-2 text-rose-900 font-bold text-xs">
                      <Clock className="w-4 h-4 text-rose-600" />
                      Regras da Contagem Regressiva nas Páginas
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                          Iniciar contagem quantos dias antes?
                        </label>
                        <select
                          value={formDaysBefore}
                          onChange={e => setFormDaysBefore(Number(e.target.value))}
                          className="w-full text-xs rounded-lg border-stone-300 shadow-2xs py-1.5 px-2.5"
                        >
                          <option value={30}>Últimos 30 dias (Faltam 30, 29, 28...)</option>
                          <option value={60}>Últimos 60 dias (2 meses antes)</option>
                          <option value={100}>Últimos 100 dias (Mais popular para casamentos!)</option>
                          <option value={180}>Últimos 180 dias (6 meses antes)</option>
                          <option value={365}>O ano inteiro (Até 365 dias antes)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                          Frequência nas páginas
                        </label>
                        <select
                          value={formFrequency}
                          onChange={e => setFormFrequency(e.target.value as any)}
                          className="w-full text-xs rounded-lg border-stone-300 shadow-2xs py-1.5 px-2.5"
                        >
                          <option value="last_30_daily">Diária nos últimos 30 dias (e a cada 10 dias antes)</option>
                          <option value="daily">Em todas as páginas (Diariamente)</option>
                          <option value="every_5">A cada 5 dias (ex: Faltam 50, 45, 40...)</option>
                          <option value="every_10">A cada 10 dias (ex: Faltam 100, 90, 80...)</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-700">
                          Mensagem padrão (use <code className="text-rose-600 font-bold">{'{dias}'}</code> para os dias restantes):
                        </label>
                        <input
                          type="text"
                          value={formCountdownMessage}
                          onChange={e => setFormCountdownMessage(e.target.value)}
                          placeholder="Faltam {dias} dias para o casamento 💍"
                          className="w-full text-xs rounded-lg border-stone-300 py-1.5 px-3 mt-0.5"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] text-stone-600">Véspera (Falta 1 dia):</label>
                          <input
                            type="text"
                            value={formOneDayMessage}
                            onChange={e => setFormOneDayMessage(e.target.value)}
                            className="w-full text-xs rounded-lg border-stone-300 py-1 px-2.5"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-stone-600">No dia do evento:</label>
                          <input
                            type="text"
                            value={formFinalMessage}
                            onChange={e => setFormFinalMessage(e.target.value)}
                            className="w-full text-xs rounded-lg border-stone-300 py-1 px-2.5"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Ícone e Cores */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-3.5 rounded-xl border border-stone-200">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">Ícone / Emoji</label>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-stone-50 rounded-lg border border-stone-200">
                      {EMOJI_OPTIONS.map(em => (
                        <button
                          key={em}
                          type="button"
                          onClick={() => setFormIcon(em)}
                          className={`w-7 h-7 text-sm rounded flex items-center justify-center transition-all ${formIcon === em ? 'bg-amber-500 text-white scale-110 shadow-xs' : 'hover:bg-stone-200'}`}
                        >
                          {em}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">Paleta de Cores</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {COLOR_OPTIONS.map(c => (
                        <button
                          key={c.label}
                          type="button"
                          onClick={() => {
                            setFormColor(c.text);
                            setFormBgColor(c.bg);
                          }}
                          className={`flex items-center gap-2 p-1.5 rounded-lg border text-left text-[11px] transition-all ${formColor === c.text ? 'ring-2 ring-amber-500 border-amber-500 font-bold' : 'border-stone-200 hover:bg-stone-50'}`}
                        >
                          <span className="w-3.5 h-3.5 rounded-full border shrink-0" style={{ backgroundColor: c.text, borderColor: c.border }} />
                          <span className="truncate">{c.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Visual Preview Box */}
                <div className="p-3 bg-stone-100 rounded-xl flex items-center justify-between">
                  <span className="text-[11px] text-stone-500">Prévia de como aparecerá na página:</span>
                  <div 
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-2xs"
                    style={{ color: formColor, backgroundColor: formBgColor, borderColor: formColor }}
                  >
                    <span>{formIcon}</span>
                    <span>{formIsCountdown ? formCountdownMessage.replace('{dias}', '45') : formTitle}</span>
                  </div>
                </div>

                {/* Botões do Formulário */}
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => { setIsCreatingNew(false); setEditingItem(null); }}
                    className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-200 rounded-xl transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    Salvar Informação no Miolo
                  </button>
                </div>
              </form>
            </div>
          ) : null}

          {/* Lista de Eventos Atuais */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                <CalendarIcon className="w-3.5 h-3.5 text-stone-500" />
                Informações e Contagens Ativas no Projeto ({specialDates.length})
              </label>

              {!isCreatingNew && (
                <button
                  onClick={() => {
                    setIsCreatingNew(true);
                    setEditingItem(null);
                    setFormTitle('');
                    setFormDate(`${projectYear}-02-20`);
                    setFormEndDate(`${projectYear}-02-28`);
                    setIsRangeDate(false);
                    setFormIsCountdown(false);
                  }}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Novo Evento / Contagem
                </button>
              )}
            </div>

            {specialDates.length === 0 ? (
              <div className="text-center py-10 px-4 bg-stone-50 rounded-2xl border-2 border-dashed border-stone-200">
                <CalendarHeart className="w-10 h-10 text-stone-300 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-stone-700 mb-1">Nenhuma data especial cadastrada ainda</h4>
                <p className="text-xs text-stone-400 max-w-md mx-auto mb-4">
                  Clique em um dos modelos acima para adicionar rapidamente as <strong>Férias da Cliente (20 de Fevereiro)</strong> ou uma <strong>Contagem Regressiva para Casamento</strong>.
                </p>
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => handleApplyPreset(SPECIAL_DATE_PRESETS[0])}
                    className="px-3 py-1.5 bg-sky-100 hover:bg-sky-200 text-sky-800 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                  >
                    🏖️ Adicionar Férias da Cliente (20/Fev)
                  </button>
                  <button
                    onClick={() => handleApplyPreset(SPECIAL_DATE_PRESETS[1])}
                    className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                  >
                    💍 Adicionar Contagem de Casamento
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {specialDates.map(item => {
                  const isCd = item.isCountdown || item.type === 'wedding_countdown' || item.type === 'countdown';
                  return (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-xl border border-stone-200 bg-white hover:border-amber-300 transition-all shadow-xs flex flex-col justify-between gap-3 group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl">{item.icon || '📌'}</span>
                          <div>
                            <h4 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                              {item.title}
                              {isCd && (
                                <span className="text-[9px] bg-rose-100 text-rose-700 font-extrabold px-1.5 py-0.5 rounded-full">
                                  Contagem Regressiva
                                </span>
                              )}
                            </h4>
                            <div className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5">
                              <CalendarIcon className="w-3 h-3 text-stone-400" />
                              <span>{formatDateDisplay(item.date)}</span>
                              {item.endDate && item.endDate !== item.date && (
                                <span>até {formatDateDisplay(item.endDate)}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-1 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-100"
                            title="Editar"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1 rounded-md text-stone-400 hover:text-red-600 hover:bg-red-50"
                            title="Excluir"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Tag Preview & Quick Insert */}
                      <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-stone-400 text-[10px] shrink-0">No miolo:</span>
                          <div
                            className="px-2 py-0.5 rounded-full text-[10px] font-bold border truncate"
                            style={{ color: item.color || '#4f46e5', backgroundColor: item.bgColor || '#eef2ff', borderColor: item.color || '#4f46e5' }}
                          >
                            {isCd ? (item.countdownMessage?.replace('{dias}', '30') || `💍 Faltam 30 dias`) : item.title}
                          </div>
                        </div>

                        {onInsertSpecialElement && (
                          <button
                            type="button"
                            onClick={() => {
                              onInsertSpecialElement(item);
                              onClose();
                            }}
                            className="px-2.5 py-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg flex items-center gap-1 transition-all cursor-pointer shadow-2xs shrink-0 active:scale-95"
                            title={`Inserir ${item.title} diretamente no layout do miolo`}
                          >
                            <Plus className="w-3 h-3 text-indigo-600" />
                            <span>Inserir no Layout</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-stone-50 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            {onToggleShowBadges && (
              <label className="flex items-center gap-2 text-xs font-semibold text-stone-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showSpecialDateBadges}
                  onChange={e => onToggleShowBadges(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                />
                Exibir badges elegantes automaticamente no miolo
              </label>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onInsertSpecialElement && (
              <button
                onClick={() => {
                  let targetItem = editingItem;
                  if (!targetItem && isCreatingNew) {
                    const fallbackTitle = formTitle.trim() || (formType === 'wedding_countdown' ? 'Casamento 💍' : (formType === 'vacation' ? 'Férias da Cliente 🏖️' : 'Data Especial'));
                    const createdItem: SpecialDateItem = {
                      id: Math.random().toString(36).substr(2, 9),
                      type: formType,
                      title: fallbackTitle,
                      date: formDate,
                      endDate: isRangeDate && formEndDate ? formEndDate : undefined,
                      icon: formIcon,
                      color: formColor,
                      bgColor: formBgColor,
                      showBadge: formShowBadge,
                      isCountdown: formIsCountdown,
                      countdownDaysBefore: formIsCountdown ? formDaysBefore : undefined,
                      countdownFrequency: formIsCountdown ? formFrequency : undefined,
                      countdownMessage: formIsCountdown ? formCountdownMessage : undefined,
                      countdownFinalMessage: formIsCountdown ? formFinalMessage : undefined,
                      countdownOneDayMessage: formIsCountdown ? formOneDayMessage : undefined,
                    };
                    onUpdateSpecialDates([...specialDates, createdItem]);
                    targetItem = createdItem;
                  }
                  if (!targetItem) {
                    targetItem = specialDates.slice().reverse().find(d => d.type === 'wedding_countdown' || d.isCountdown)
                      || (specialDates.length > 0 ? specialDates[specialDates.length - 1] : undefined);
                  }
                  onInsertSpecialElement(targetItem);
                  onClose();
                }}
                className="px-3.5 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
                title="Inserir um bloco arrastável de Informações Importantes no layout atual"
              >
                <Plus className="w-3.5 h-3.5 text-indigo-600" />
                Inserir Bloco no Layout
              </button>
            )}

            <button
              onClick={onClose}
              className="px-5 py-2 bg-gradient-to-r from-[#b84a56] to-[#c45663] hover:from-[#a83f4b] hover:to-[#b84a56] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              Concluir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
