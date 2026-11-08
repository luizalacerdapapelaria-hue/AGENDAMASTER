import React, { useState, useEffect, useRef } from 'react';
import {
  Palette,
  Plus,
  Trash2,
  Download,
  Upload,
  Check,
  Copy,
  Sparkles,
  RotateCcw,
  X,
  Type,
  Square,
  Maximize2,
  FileText,
  HelpCircle,
} from 'lucide-react';
import {
  FavoriteColor,
  getFavoriteColors,
  saveFavoriteColors,
  addFavoriteColor,
  removeFavoriteColor,
  updateFavoriteColor,
  resetFavoriteColorsToDefault,
  exportFavoriteColorsToFile,
  importFavoriteColorsFromFile,
  extractUniqueColorsFromProject,
  EVENT_FAVORITE_COLORS_UPDATED,
} from '../../../core/logic/colorPaletteStorage';
import { AgendaConfig, LayoutElement } from '../../../types';

interface FavoriteColorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AgendaConfig;
  selectedElements?: LayoutElement[];
  onApplyColorToSelected?: (colorHex: string, role: 'color' | 'fill' | 'border') => void;
  onToast?: (message: string) => void;
}

export const FavoriteColorsModal: React.FC<FavoriteColorsModalProps> = ({
  isOpen,
  onClose,
  config,
  selectedElements = [],
  onApplyColorToSelected,
  onToast,
}) => {
  const [colors, setColors] = useState<FavoriteColor[]>([]);
  const [newHex, setNewHex] = useState<string>('#b84a56');
  const [newName, setNewName] = useState<string>('');
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');
  const [filterQuery, setFilterQuery] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Carrega cores salvas e escuta eventos de atualização
  useEffect(() => {
    if (!isOpen) return;
    setColors(getFavoriteColors());

    const handleUpdated = (e: any) => {
      if (e.detail) {
        setColors(e.detail);
      } else {
        setColors(getFavoriteColors());
      }
    };

    window.addEventListener(EVENT_FAVORITE_COLORS_UPDATED, handleUpdated);
    return () => {
      window.removeEventListener(EVENT_FAVORITE_COLORS_UPDATED, handleUpdated);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddColor = () => {
    if (!newHex) return;
    const updated = addFavoriteColor(newHex, newName);
    setColors(updated);
    setNewName('');
    onToast?.(`Cor ${newHex.toUpperCase()} salva nas suas cores preferidas!`);
  };

  const handleRemoveColor = (id: string, name: string) => {
    const updated = removeFavoriteColor(id);
    setColors(updated);
    onToast?.(`Cor "${name}" removida da sua paleta.`);
  };

  const handleStartEdit = (color: FavoriteColor) => {
    setEditingId(color.id);
    setEditingName(color.name);
  };

  const handleSaveEdit = (id: string) => {
    if (editingName.trim()) {
      const updated = updateFavoriteColor(id, { name: editingName.trim() });
      setColors(updated);
    }
    setEditingId(null);
  };

  const handleCopyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    onToast?.(`Código ${hex.toUpperCase()} copiado!`);
    setTimeout(() => {
      setCopiedHex(null);
    }, 2000);
  };

  const handleExportFile = () => {
    exportFavoriteColorsToFile(colors);
    onToast?.('Arquivo da sua paleta de cores salvo no computador com sucesso!');
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const res = await importFavoriteColorsFromFile(file, 'merge');
    if (res.success) {
      setColors(res.colors);
      onToast?.(`${res.count} cores importadas e salvas no computador!`);
    } else {
      alert(res.error || 'Erro ao importar paleta de cores.');
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleExtractProjectColors = () => {
    const projectColors = extractUniqueColorsFromProject(config);
    if (projectColors.length === 0) {
      onToast?.('Nenhuma cor específica encontrada no projeto atual.');
      return;
    }

    let addedCount = 0;
    const current = getFavoriteColors();
    const existingHexes = new Set(current.map(c => c.hex.toLowerCase()));

    const newFavorites: FavoriteColor[] = [];
    projectColors.forEach(({ hex }) => {
      if (!existingHexes.has(hex.toLowerCase())) {
        addedCount++;
        newFavorites.push({
          id: `fav_proj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          hex,
          name: `Cor do Projeto (${hex.toUpperCase()})`,
          createdAt: Date.now(),
        });
      }
    });

    if (addedCount > 0) {
      const combined = [...newFavorites, ...current];
      saveFavoriteColors(combined);
      setColors(combined);
      onToast?.(`${addedCount} novas cores do projeto adicionadas às suas preferidas!`);
    } else {
      onToast?.('Todas as cores deste projeto já estão na sua lista de preferidas.');
    }
  };

  const handleReset = () => {
    if (window.confirm('Deseja restaurar as cores padrão recomendadas? Suas cores atuais serão substituídas pelas cores clássicas.')) {
      const def = resetFavoriteColorsToDefault();
      setColors(def);
      onToast?.('Paleta restaurada para os padrões elegantes.');
    }
  };

  const filteredColors = colors.filter(c => {
    if (!filterQuery) return true;
    const q = filterQuery.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.hex.toLowerCase().includes(q);
  });

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-rose-50/70 via-white to-amber-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#b84a56] to-[#db2777] flex items-center justify-center text-white shadow-md shadow-rose-900/10">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-gray-900 flex items-center gap-2">
                Minhas Cores Preferidas
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#fdeeed] text-[#b84a56] border border-[#eedad5]">
                  Salvas no Computador
                </span>
              </h2>
              <p className="text-xs text-gray-500">
                Sua paleta pessoal fica guardada neste computador e disponível em todos os seus projetos.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            title="Fechar (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar de Ações de Arquivo no Computador */}
        <div className="px-6 py-3 bg-gray-50/80 border-b border-gray-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleExportFile}
              className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg font-bold flex items-center gap-1.5 shadow-2xs hover:border-[#b84a56]/40 transition-all cursor-pointer"
              title="Baixar arquivo da paleta (.json) para salvar numa pasta do seu computador ou fazer backup"
            >
              <Download className="w-3.5 h-3.5 text-[#b84a56]" />
              <span>Salvar no Computador (.json)</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg font-bold flex items-center gap-1.5 shadow-2xs hover:border-[#b84a56]/40 transition-all cursor-pointer"
              title="Carregar um arquivo de paleta (.json) salvo anteriormente no seu computador"
            >
              <Upload className="w-3.5 h-3.5 text-indigo-600" />
              <span>Carregar do Computador</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />

            <button
              type="button"
              onClick={handleExtractProjectColors}
              className="px-3 py-1.5 bg-[#fdeeed] hover:bg-[#fadbd8] text-[#9f3d4a] border border-[#eedad5] rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Detectar automaticamente todas as cores já utilizadas nos layouts deste projeto e adicioná-las às suas preferidas"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#b84a56]" />
              <span>Capturar Cores Deste Projeto</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="text-[11px] font-semibold text-gray-500 hover:text-gray-800 flex items-center gap-1 hover:underline cursor-pointer"
            title="Restaurar lista para as cores clássicas de fábrica"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Restaurar Padrão</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Formulário: Adicionar Nova Cor */}
          <div className="bg-gradient-to-r from-slate-50 to-rose-50/30 p-4 rounded-xl border border-slate-200/80 shadow-2xs">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-[#b84a56]" />
              Adicionar Nova Cor Preferida
            </h3>
            <div className="flex flex-wrap items-center gap-3">
              {/* Seletor visual */}
              <div className="flex items-center gap-2">
                <label
                  className="relative w-10 h-10 rounded-xl border-2 border-white shadow-md ring-1 ring-gray-300 overflow-hidden shrink-0 cursor-pointer group"
                  title="Clique para escolher uma cor no seletor do computador"
                >
                  <input
                    type="color"
                    value={newHex}
                    onChange={e => setNewHex(e.target.value)}
                    className="absolute inset-0 w-16 h-16 -top-3 -left-3 cursor-pointer opacity-0"
                  />
                  <div className="w-full h-full" style={{ backgroundColor: newHex }} />
                </label>
                <div>
                  <label className="block text-[9px] font-bold text-gray-400 uppercase">Hexadecimal</label>
                  <input
                    type="text"
                    value={newHex}
                    onChange={e => setNewHex(e.target.value)}
                    placeholder="#b84a56"
                    className="w-24 text-xs font-mono font-bold uppercase text-gray-800 px-2 py-1.5 border border-gray-300 rounded-lg bg-white shadow-2xs focus:border-[#b84a56] focus:outline-none"
                  />
                </div>
              </div>

              {/* Nome da Cor */}
              <div className="flex-1 min-w-[200px]">
                <label className="block text-[9px] font-bold text-gray-400 uppercase">Nome / Rótulo da Cor</label>
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="Ex: Marsala Suave, Dourado Nobre, Fundo Neutro..."
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleAddColor();
                  }}
                  className="w-full text-xs font-medium text-gray-800 px-3 py-1.5 border border-gray-300 rounded-lg bg-white shadow-2xs focus:border-[#b84a56] focus:outline-none"
                />
              </div>

              {/* Botão Adicionar */}
              <div className="pt-3">
                <button
                  type="button"
                  onClick={handleAddColor}
                  className="px-4 py-2 bg-[#b84a56] hover:bg-[#9f3d4a] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Salvar Cor</span>
                </button>
              </div>
            </div>
          </div>

          {/* Dica de Uso */}
          {selectedElements.length > 0 && (
            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between text-xs text-indigo-900">
              <span className="font-semibold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                {selectedElements.length} elemento(s) selecionado(s) na tela. Você pode aplicar qualquer cor diretamente neles clicando nos botões abaixo:
              </span>
            </div>
          )}

          {/* Barra de Filtro / Busca */}
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
              <span>Cores Salvas ({filteredColors.length})</span>
            </h3>
            <input
              type="text"
              value={filterQuery}
              onChange={e => setFilterQuery(e.target.value)}
              placeholder="Buscar por nome ou #hex..."
              className="text-xs px-2.5 py-1 border border-gray-200 rounded-lg w-48 focus:border-indigo-400 focus:outline-none"
            />
          </div>

          {/* Grid de Cores */}
          {filteredColors.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-xs">
              Nenhuma cor encontrada com esse filtro.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {filteredColors.map(c => {
                const isCopied = copiedHex === c.hex;
                const isEditing = editingId === c.id;

                return (
                  <div
                    key={c.id}
                    className="p-3 rounded-xl border border-gray-200 hover:border-gray-300 bg-white hover:shadow-xs transition-all flex flex-col justify-between gap-2.5 group"
                  >
                    <div className="flex items-center gap-2.5">
                      {/* Amostra da cor */}
                      <div
                        className="w-10 h-10 rounded-lg border border-black/10 shadow-xs shrink-0 relative overflow-hidden"
                        style={{ backgroundColor: c.hex }}
                      />

                      {/* Informações */}
                      <div className="flex-1 min-w-0">
                        {isEditing ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              value={editingName}
                              onChange={e => setEditingName(e.target.value)}
                              onBlur={() => handleSaveEdit(c.id)}
                              onKeyDown={e => {
                                if (e.key === 'Enter') handleSaveEdit(c.id);
                              }}
                              autoFocus
                              className="text-xs font-bold text-gray-900 border-b border-indigo-500 outline-none w-full px-1 py-0.5"
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(c.id)}
                              className="text-emerald-600 hover:text-emerald-700 p-0.5"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() => handleStartEdit(c)}
                            title="Clique para renomear"
                            className="text-xs font-bold text-gray-800 truncate cursor-pointer hover:text-indigo-600"
                          >
                            {c.name}
                          </div>
                        )}

                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] font-mono text-gray-500 uppercase">{c.hex}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyHex(c.hex)}
                            className="p-0.5 text-gray-400 hover:text-gray-700 transition-colors"
                            title="Copiar código hex"
                          >
                            {isCopied ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Excluir */}
                      <button
                        type="button"
                        onClick={() => handleRemoveColor(c.id, c.name)}
                        className="text-gray-300 hover:text-red-500 p-1 rounded transition-colors opacity-0 group-hover:opacity-100"
                        title="Remover cor da lista"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Ações de aplicação aos elementos selecionados */}
                    {selectedElements.length > 0 && onApplyColorToSelected && (
                      <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-1 text-[10px]">
                        <span className="text-gray-400 font-medium">Aplicar:</span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => onApplyColorToSelected(c.hex, 'color')}
                            className="px-1.5 py-0.5 bg-gray-100 hover:bg-indigo-100 hover:text-indigo-700 text-gray-700 font-semibold rounded cursor-pointer transition-colors"
                            title="Aplicar no Texto / Linhas dos elementos selecionados"
                          >
                            Texto
                          </button>
                          <button
                            type="button"
                            onClick={() => onApplyColorToSelected(c.hex, 'fill')}
                            className="px-1.5 py-0.5 bg-gray-100 hover:bg-indigo-100 hover:text-indigo-700 text-gray-700 font-semibold rounded cursor-pointer transition-colors"
                            title="Aplicar no Fundo dos elementos selecionados"
                          >
                            Fundo
                          </button>
                          <button
                            type="button"
                            onClick={() => onApplyColorToSelected(c.hex, 'border')}
                            className="px-1.5 py-0.5 bg-gray-100 hover:bg-indigo-100 hover:text-indigo-700 text-gray-700 font-semibold rounded cursor-pointer transition-colors"
                            title="Aplicar na Borda dos elementos selecionados"
                          >
                            Borda
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Armazenado permanentemente neste computador (LocalStorage).</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
};
