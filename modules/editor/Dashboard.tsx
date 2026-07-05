import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { AgendaConfig, User, DayData, LayoutElement, ElementType, PageLayoutType, TextStyleConfig, PageSize, PageOrientation, IntroPage, BackgroundConfig } from '../../types';
import { generateCalendarYear, getMonthName, generatePlannerDays, generateGenericPages } from '../../core/backend/calendar';
import { generateMonthlyQuotes } from '../../core/backend/ai';
import { BIBLE_VERSES, getVerseForDay } from '../../core/constants/verses';
import { calculateDragPosition, calculateResize, SnapGuide } from '../../core/logic/interaction';
import { ELEMENT_VARIANTS, AVAILABLE_FONTS } from '../../core/constants/elements';
import { ElementRenderer } from './components/ElementRenderer';
import { BackgroundSettings } from './components/BackgroundSettings';
import { OpenTypeEditor } from './components/OpenTypeEditor';
import { compressImage } from './utils/imageCompressor';
import { saveFontToDB, getAllFontsFromDB } from '../../core/logic/fontStorage';
import * as icons from 'lucide-react';

import { exportProject, importProject } from '../../core/logic/fileSystem';
import { INTRO_TEMPLATES } from './templates/introTemplates';
import { WEEKLY_VERTICAL_LEFT, WEEKLY_VERTICAL_RIGHT, WEEKLY_HORIZONTAL_LEFT, WEEKLY_HORIZONTAL_RIGHT } from './templates/plannerTemplates';
import { NOTEBOOK_TEMPLATES, DEVOTIONAL_TEMPLATES } from './templates/extraTemplates';
import { LAYOUT_LIBRARY } from './templates/layoutLibrary';
import { 
  Calendar, LogOut, Moon, Type, CalendarRange,
  Trash2, Move, AlignLeft, AlignCenter, AlignRight, AlignJustify, Layout,
  Square, Circle, Flower, ListTodo, Grid3X3,
  ScanLine, Layers, ChevronDown,
  CalendarDays, X, Smile, Copy, ClipboardList, Shapes,
  ChevronUp, Book, Plus, FileText, Grid, List, Undo,
  Type as TypeIcon, CaseUpper, CaseLower,
  PanelTop, PanelBottom, PanelLeft, PanelRight, Columns, Rows, Minus, Flag,
  Table as TableIcon,
  ArrowUpToLine, ArrowDownToLine, AlignCenterVertical, 
  AlignStartHorizontal, AlignCenterHorizontal, AlignEndHorizontal,
  AlignStartVertical, AlignEndVertical, BoxSelect,
  Minimize2, Loader2, Settings, Search,
  FileDown, Download, Info, ArrowDownAZ, Settings2, FlipHorizontal, FlipVertical, Upload, Clock, Palmtree, Star, Heart, Leaf, ChevronLeft, ChevronRight, CheckCircle2, Eye, BookOpen, MousePointer2, Hand, CheckSquare, Smartphone, Monitor, Zap, Sparkles, FileImage, Printer, Lock, Ruler
} from 'lucide-react';

const PreviewPageScaleWrapper: React.FC<{ children: React.ReactNode; widthMm: number; heightMm: number }> = ({ children, widthMm, heightMm }) => {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);

    const nativeWidth = widthMm * 3.77952;
    const nativeHeight = heightMm * 3.77952;

    useEffect(() => {
        const wrapper = wrapperRef.current;
        if (!wrapper) return;

        const handleResize = () => {
            const currentWidth = wrapper.clientWidth;
            if (currentWidth > 0) {
                const targetScale = currentWidth / nativeWidth;
                setScale(Math.min(1.0, targetScale));
            }
        };

        handleResize();
        const observer = new ResizeObserver(handleResize);
        observer.observe(wrapper);

        window.addEventListener('resize', handleResize);
        return () => {
            observer.disconnect();
            window.removeEventListener('resize', handleResize);
        };
    }, [nativeWidth]);

    return (
        <div ref={wrapperRef} className="w-full flex justify-center items-start overflow-visible">
            <div 
                style={{
                    transform: `scale(${scale})`,
                    transformOrigin: 'top center',
                    width: `${widthMm}mm`,
                    height: `${heightMm}mm`,
                    marginBottom: `${nativeHeight * (scale - 1)}px`,
                }}
                className="shrink-0 overflow-visible"
            >
                {children}
            </div>
        </div>
    );
};

interface DashboardProps {
  user: User;
  initialConfig?: Partial<AgendaConfig>;
  onLogout: () => void;
  onConfigure?: (currentConfig: AgendaConfig) => void;
}

const COMMON_ICONS = [
  'Heart', 'Star', 'Smile', 'Sun', 'Moon', 'Cloud', 'Bell', 'Check', 'X', 
  'Home', 'User', 'Settings', 'Mail', 'Phone', 'MapPin', 'Calendar', 
  'Clock', 'Camera', 'Image', 'Music', 'Video', 'Book', 'Coffee', 'Gift',
  'ShoppingBag', 'ShoppingCart', 'CreditCard', 'DollarSign', 'Briefcase',
  'GraduationCap', 'Trophy', 'Medal', 'Target', 'Flag', 'Anchor', 'Rocket',
  'Plane', 'Car', 'Bike', 'Footprints', 'Leaf', 'Flower', 'TreeDeciduous',
  'Dog', 'Cat', 'Bird', 'Fish', 'Pizza', 'Apple', 'IceCream', 'Wine',
  'Pen', 'Trash2', 'Search', 'Filter', 'Share2', 'Download', 'Upload', 'Eye',
  'Lock', 'Unlock', 'Key', 'Shield', 'Zap', 'Flame', 'Droplets', 'Wind',
  'Hand', 'ThumbsUp', 'ThumbsDown', 'MessageCircle', 'Send', 'Paperclip'
];

const PAGE_SIZES_MM: Record<PageSize, { width: number; height: number }> = {
    'A4': { width: 210, height: 297 },
    'A5': { width: 148, height: 210 },
    'Letter': { width: 215.9, height: 279.4 },
    'Custom': { width: 0, height: 0 }
};

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { useGesture } from '@use-gesture/react';

const RULER_SIZE = 24;

interface RulerWrapperProps {
  widthPx: number;
  heightPx: number;
  widthMm: number;
  heightMm: number;
  scale: number;
  enabled: boolean;
  guides: { id: string; type: 'h' | 'v'; posMm: number }[];
  setGuides: React.Dispatch<React.SetStateAction<{ id: string; type: 'h' | 'v'; posMm: number }[]>>;
  children: React.ReactNode;
  responsiveScale?: number;
  isDragging?: boolean;
}

const RulerWrapper: React.FC<RulerWrapperProps> = ({
  widthPx,
  heightPx,
  widthMm,
  heightMm,
  scale,
  enabled,
  guides,
  setGuides,
  children,
  responsiveScale = 1,
  isDragging = false
}) => {
  const [hoverCoords, setHoverCoords] = useState<{ x: number; y: number } | null>(null);
  const [draggedGuide, setDraggedGuide] = useState<{ id?: string; type: 'h' | 'v'; isNew: boolean } | null>(null);
  const [scrollPos, setScrollPos] = useState({ x: 0, y: 0 });
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const [zeroOffsets, setZeroOffsets] = useState({ x: 0, y: 0 });
  const [portalTarget, setPortalTarget] = useState<Element | null>(null);

  useEffect(() => {
    const updateTarget = () => {
      const el = document.getElementById('editor-viewport-wrapper');
      if (el) {
        setPortalTarget(el);
      }
    };
    updateTarget();
    const timer = setTimeout(updateTarget, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const container = document.getElementById('editor-scroll-container');
    const page = document.getElementById('ruler-container-inner');
    if (!container) return;

    const updateCoords = () => {
      setScrollPos({
        x: container.scrollLeft,
        y: container.scrollTop
      });
      
      const rectViewport = container.getBoundingClientRect();
      setViewportSize({
        width: rectViewport.width,
        height: rectViewport.height
      });

      if (page) {
        const rectPage = page.getBoundingClientRect();
        setZeroOffsets({
          x: rectPage.left - rectViewport.left,
          y: rectPage.top - rectViewport.top
        });
      }
    };

    container.addEventListener('scroll', updateCoords, { passive: true });
    window.addEventListener('resize', updateCoords);
    
    // Initial update
    updateCoords();

    // Native ResizeObserver triggers updates performantly on layout shifts without active polling
    const resizeObserver = new ResizeObserver(() => {
      updateCoords();
    });
    resizeObserver.observe(container);
    if (page) resizeObserver.observe(page);

    return () => {
      container.removeEventListener('scroll', updateCoords);
      window.removeEventListener('resize', updateCoords);
      resizeObserver.disconnect();
    };
  }, [enabled, responsiveScale, widthPx, heightPx]);

  useEffect(() => {
    if (!draggedGuide) return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      const container = document.getElementById('ruler-container-inner');
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const currentScale = responsiveScale || 1;
      if (draggedGuide.type === 'h') {
        const y = (e.clientY - rect.top) / currentScale;
        const yMm = y / scale;
        const roundedY = Math.max(0, Math.min(heightMm, Math.round(yMm * 10) / 10));
        
        setGuides(prev => prev.map(g => g.id === draggedGuide.id ? { ...g, posMm: roundedY } : g));
      } else {
        const x = (e.clientX - rect.left) / currentScale;
        const xMm = x / scale;
        const roundedX = Math.max(0, Math.min(widthMm, Math.round(xMm * 10) / 10));

        setGuides(prev => prev.map(g => g.id === draggedGuide.id ? { ...g, posMm: roundedX } : g));
      }
    };

    const handleGlobalMouseUp = (e: MouseEvent) => {
      const container = document.getElementById('ruler-container-inner');
      if (container && draggedGuide) {
        const rect = container.getBoundingClientRect();
        const guideId = draggedGuide.id;
        const currentScale = responsiveScale || 1;
        
        if (draggedGuide.type === 'h') {
          const y = (e.clientY - rect.top) / currentScale;
          const yMm = y / scale;
          if (yMm < 4 || yMm > heightMm + 15) {
            setGuides(prev => prev.filter(g => g.id !== guideId));
          }
        } else {
          const x = (e.clientX - rect.left) / currentScale;
          const xMm = x / scale;
          if (xMm < 4 || xMm > widthMm + 15) {
            setGuides(prev => prev.filter(g => g.id !== guideId));
          }
        }
      }
      setDraggedGuide(null);
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [draggedGuide, scale, widthMm, heightMm, setGuides, responsiveScale]);

  if (!enabled) return <>{children}</>;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      if (hoverCoords !== null) setHoverCoords(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const currentScale = responsiveScale || 1;
    const x = (e.clientX - rect.left) / currentScale;
    const y = (e.clientY - rect.top) / currentScale;
    
    const xMm = x / scale;
    const yMm = y / scale;

    setHoverCoords({ x: xMm, y: yMm });
  };

  const handleMouseLeave = () => {
    setHoverCoords(null);
  };

  const handleTopRulerMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const newId = `guide-h-${Date.now()}-${Math.random()}`;
    const newGuide = { id: newId, type: 'h' as const, posMm: 0 };
    setGuides(prev => [...prev, newGuide]);
    setDraggedGuide({ id: newId, type: 'h', isNew: true });
  };

  const handleLeftRulerMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const newId = `guide-v-${Date.now()}-${Math.random()}`;
    const newGuide = { id: newId, type: 'v' as const, posMm: 0 };
    setGuides(prev => [...prev, newGuide]);
    setDraggedGuide({ id: newId, type: 'v', isNew: true });
  };

  const renderHorizontalRuler = () => {
    const ticks: React.ReactNode[] = [];
    const labels: React.ReactNode[] = [];

    for (let i = 0; i <= widthMm; i++) {
      const x_svg = zeroOffsets.x + i * scale * responsiveScale - 24;
      
      if (x_svg < -50 || x_svg > viewportSize.width) continue;

      if (i % 10 === 0) {
        ticks.push(
          <line
            key={`h-tick-major-${i}`}
            x1={x_svg}
            y1={6}
            x2={x_svg}
            y2={24}
            stroke="#94a3b8"
            strokeWidth={1}
          />
        );
        labels.push(
          <text
            key={`h-label-${i}`}
            x={x_svg + 2}
            y={14}
            fill="#64748b"
            fontSize="8px"
            fontWeight="600"
            fontFamily="monospace"
            className="select-none"
          >
            {i}
          </text>
        );
      } else if (i % 5 === 0) {
        ticks.push(
          <line
            key={`h-tick-medium-${i}`}
            x1={x_svg}
            y1={14}
            x2={x_svg}
            y2={24}
            stroke="#cbd5e1"
            strokeWidth={1}
          />
        );
      } else {
        ticks.push(
          <line
            key={`h-tick-minor-${i}`}
            x1={x_svg}
            y1={18}
            x2={x_svg}
            y2={24}
            stroke="#e2e8f0"
            strokeWidth={1}
          />
        );
      }
    }

    return (
      <div 
        className="absolute top-0 left-[24px] bg-slate-50 border-b border-slate-200 select-none overflow-hidden cursor-ns-resize hover:bg-slate-100 transition-colors z-[105]" 
        style={{ 
          width: `${viewportSize.width - 24}px`, 
          height: `${RULER_SIZE}px`,
        }}
        onMouseDown={handleTopRulerMouseDown}
        title="Clique e arraste para baixo para puxar uma linha guia horizontal"
      >
        <svg className="w-full h-full pointer-events-none">
          {ticks}
          {labels}
          {hoverCoords !== null && (
            <line
              x1={zeroOffsets.x + hoverCoords.x * scale * responsiveScale - 24}
              y1={0}
              x2={zeroOffsets.x + hoverCoords.x * scale * responsiveScale - 24}
              y2={RULER_SIZE}
              stroke="#6366f1"
              strokeWidth={1}
              strokeDasharray="2,2"
            />
          )}
        </svg>
      </div>
    );
  };

  const renderVerticalRuler = () => {
    const ticks: React.ReactNode[] = [];
    const labels: React.ReactNode[] = [];

    for (let i = 0; i <= heightMm; i++) {
      const y_svg = zeroOffsets.y + i * scale * responsiveScale - 24;

      if (y_svg < -50 || y_svg > viewportSize.height) continue;

      if (i % 10 === 0) {
        ticks.push(
          <line
            key={`v-tick-major-${i}`}
            x1={6}
            y1={y_svg}
            x2={24}
            y2={y_svg}
            stroke="#94a3b8"
            strokeWidth={1}
          />
        );
        labels.push(
          <text
            key={`v-label-${i}`}
            x={2}
            y={y_svg + 8}
            fill="#64748b"
            fontSize="8px"
            fontWeight="600"
            fontFamily="monospace"
            className="select-none"
          >
            {i}
          </text>
        );
      } else if (i % 5 === 0) {
        ticks.push(
          <line
            key={`v-tick-medium-${i}`}
            x1={14}
            y1={y_svg}
            x2={24}
            y2={y_svg}
            stroke="#cbd5e1"
            strokeWidth={1}
          />
        );
      } else {
        ticks.push(
          <line
            key={`v-tick-minor-${i}`}
            x1={18}
            y1={y_svg}
            x2={24}
            y2={y_svg}
            stroke="#e2e8f0"
            strokeWidth={1}
          />
        );
      }
    }

    return (
      <div 
        className="absolute top-[24px] left-0 bg-slate-50 border-r border-slate-200 select-none overflow-hidden cursor-ew-resize hover:bg-slate-100 transition-colors z-[105]" 
        style={{ 
          width: `${RULER_SIZE}px`, 
          height: `${viewportSize.height - 24}px`,
        }}
        onMouseDown={handleLeftRulerMouseDown}
        title="Clique e arraste para a direita para puxar uma linha guia vertical"
      >
        <svg className="w-full h-full pointer-events-none">
          {ticks}
          {labels}
          {hoverCoords !== null && (
            <line
              x1={0}
              y1={zeroOffsets.y + hoverCoords.y * scale * responsiveScale - 24}
              x2={RULER_SIZE}
              y2={zeroOffsets.y + hoverCoords.y * scale * responsiveScale - 24}
              stroke="#6366f1"
              strokeWidth={1}
              strokeDasharray="2,2"
            />
          )}
        </svg>
      </div>
    );
  };

  const rulersNode = portalTarget ? createPortal(
    <>
      <div 
        className="absolute top-0 left-0 bg-slate-100 border-r border-b border-slate-200 flex items-center justify-center text-[8px] font-bold text-slate-500 select-none cursor-pointer hover:bg-red-50 hover:text-red-600 transition-colors z-[110]"
        style={{ 
          width: `${RULER_SIZE}px`, 
          height: `${RULER_SIZE}px`,
        }}
        onClick={() => {
          if (guides.length > 0) {
            setGuides([]);
          }
        }}
        title={guides.length > 0 ? "Limpar todas as guias" : "Régua em milímetros"}
      >
        {guides.length > 0 ? "✕" : "mm"}
      </div>

      {renderHorizontalRuler()}
      {renderVerticalRuler()}
    </>,
    portalTarget
  ) : null;

  return (
    <div 
      className="relative select-none bg-white rounded-lg p-0 border border-slate-100 shadow-md"
      style={{ 
        width: `${widthPx}px`, 
        height: `${heightPx}px`,
      }}
    >
      {rulersNode}

      <div 
        id="ruler-container-inner"
        className="relative overflow-visible w-full h-full"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {children}

        {/* Render Guide Lines */}
        {guides.map((guide) => {
          const isHorizontal = guide.type === 'h';
          const posPx = guide.posMm * scale;
          
          if (guide.posMm <= 0) return null;

          return (
            <div
              key={guide.id}
              className="absolute z-[9999] group pointer-events-auto"
              style={{
                left: isHorizontal ? 0 : `${posPx}px`,
                top: isHorizontal ? `${posPx}px` : 0,
                width: isHorizontal ? '100%' : '1px',
                height: isHorizontal ? '1px' : '100%',
              }}
            >
              {/* Thin visual guide line */}
              <div 
                className={`absolute bg-cyan-400 shadow-[0_0_1px_rgba(0,0,0,0.3)] pointer-events-none ${
                  isHorizontal 
                    ? 'left-0 right-0 h-[1.5px] -translate-y-[0.75px]' 
                    : 'top-0 bottom-0 w-[1.5px] -translate-x-[0.75px]'
                }`}
              />

              {/* Larger drag handle/grabber area */}
              <div
                className={`absolute opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-150 ${
                  isHorizontal 
                    ? 'left-0 right-0 h-4 -translate-y-2 cursor-ns-resize bg-cyan-400/20' 
                    : 'top-0 bottom-0 w-4 -translate-x-2 cursor-ew-resize bg-cyan-400/20'
                }`}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setDraggedGuide({ id: guide.id, type: guide.type, isNew: false });
                }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  setGuides(prev => prev.filter(g => g.id !== guide.id));
                }}
                title="Arraste para mover. Duplo clique para excluir."
              >
                {/* Visual tooltip on hover */}
                <div 
                  className={`absolute pointer-events-none bg-slate-800/90 text-white text-[9px] px-2 py-0.5 rounded shadow-lg font-mono z-[10000] whitespace-nowrap opacity-0 group-hover:opacity-100 delay-150 transition-opacity duration-150 flex items-center gap-1 border border-slate-700`}
                  style={{
                    left: isHorizontal ? '50%' : '12px',
                    top: isHorizontal ? '12px' : '50%',
                    transform: isHorizontal ? 'translateX(-50%)' : 'translateY(-50%)'
                  }}
                >
                  <span className="text-cyan-300 font-bold">{isHorizontal ? 'Y' : 'X'}:</span> 
                  <span>{guide.posMm} mm</span>
                  <span className="text-gray-400 text-[8px] border-l border-gray-600 pl-1 ml-1">Duplo clique para remover</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const Dashboard: React.FC<DashboardProps> = ({ user, initialConfig, onLogout, onConfigure }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [mobileDrawer, setMobileDrawer] = useState<'none' | 'sidebar' | 'properties' | 'layers' | 'elements'>('none');

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const getDefaultElements = (): LayoutElement[] => [
      { 
          id: '1', 
          name: 'Texto Livre', 
          type: 'text', 
          content: 'Seu texto aqui', 
          x: 10, 
          y: 10, 
          w: 80, 
          h: 10, 
          zIndex: 10, 
          style: { fontSize: 14, fontWeight: 'normal', color: '#000000', textAlign: 'left', fontFamily: 'Inter' } 
      }
  ];

  const [config, _setConfig] = useState<AgendaConfig>({
    projectType: initialConfig?.projectType || 'agenda',
    year: initialConfig?.year || new Date().getFullYear() + 1,
    layoutType: initialConfig?.layoutType || '1_per_page',
    pageSize: initialConfig?.pageSize || 'A5',
    orientation: initialConfig?.orientation || 'portrait',
    includeHolidays: initialConfig?.includeHolidays ?? true,
    includeMoonPhases: initialConfig?.includeMoonPhases ?? false,
    includeQuotes: initialConfig?.includeQuotes ?? false,
    includeVerses: initialConfig?.includeVerses ?? true,
    mirrorEvenPages: initialConfig?.mirrorEvenPages ?? true,
    includeMonthlyDividers: initialConfig?.includeMonthlyDividers ?? true,
    includeMonthlyIntroPages: initialConfig?.includeMonthlyIntroPages ?? true,
    margins: initialConfig?.margins || { top: 15, bottom: 15, inside: 20, outside: 10 },
    elements: initialConfig?.elements && initialConfig.elements.length > 0 ? initialConfig.elements : getDefaultElements(),
    elementsSaturday: initialConfig?.elementsSaturday,
    elementsSunday: initialConfig?.elementsSunday,
    elementsTop: initialConfig?.elementsTop,
    elementsBottom: initialConfig?.elementsBottom,
    elementsWeeklyLeft: initialConfig?.elementsWeeklyLeft,
    elementsWeeklyRight: initialConfig?.elementsWeeklyRight,
    introPages: initialConfig?.introPages || INTRO_TEMPLATES,
    monthlyIntroPages: initialConfig?.monthlyIntroPages || []
  });

  const [history, setHistory] = useState<AgendaConfig[]>([]);

  const pushHistory = useCallback(() => {
    setHistory(h => [...h, config].slice(-50));
  }, [config]);

  const setConfig = useCallback((newConfig: AgendaConfig | ((prev: AgendaConfig) => AgendaConfig)) => {
    _setConfig(prev => {
      const resolved = typeof newConfig === 'function' ? newConfig(prev) : newConfig;
      setHistory(h => [...h, prev].slice(-50));
      return resolved;
    });
  }, []);

  const setConfigSilent = useCallback((newConfig: AgendaConfig | ((prev: AgendaConfig) => AgendaConfig)) => {
    _setConfig(newConfig);
  }, []);

  const handleUndo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setHistory(prev => prev.slice(0, -1));
    _setConfig(previous);
  };

  const [generatedData, setGeneratedData] = useState<DayData[]>([]);
  const [quotes, setQuotes] = useState<string[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const selectedId = selectedIds.length === 1 ? selectedIds[0] : null;
  const [marquee, setMarquee] = useState<{ x1: number, y1: number, x2: number, y2: number } | null>(null);
  const marqueeRef = useRef<{ x1: number, y1: number } | null>(null);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'opentype'>('editor');
  const [showMargins, setShowMargins] = useState(true);
  const [showRulers, setShowRulers] = useState(true);
  const [guides, setGuides] = useState<{ id: string; type: 'h' | 'v'; posMm: number }[]>([]);
  const [customFonts, setCustomFonts] = useState<string[]>([]);
  const [variantModal, setVariantModal] = useState<{type: ElementType, label: string} | null>(null);
  const [templateModal, setTemplateModal] = useState(false);
  const [templateCategory, setTemplateCategory] = useState<'intro' | 'planner' | 'library' | 'notebook' | 'devotional' | 'custom'>('intro');
  const [customTemplates, setCustomTemplates] = useState<IntroPage[]>(() => {
      try {
          const saved = localStorage.getItem('agendamaster_custom_page_templates');
          return saved ? JSON.parse(saved) : [];
      } catch (e) {
          return [];
      }
  });
  const [versesModalOpen, setVersesModalOpen] = useState(false);
  const [customVerses, setCustomVerses] = useState<string[]>(() => {
      try {
          if (typeof window !== 'undefined' && window.localStorage) {
              const saved = window.localStorage.getItem('agendamaster_custom_verses');
              return saved ? JSON.parse(saved) : [];
          }
      } catch (e) {
          console.error('Error loading custom verses', e);
      }
      return [];
  });
  const [editorViewMode, setEditorViewMode] = useState<'standard' | 'saturday' | 'sunday' | 'top' | 'bottom' | 'weekly_left' | 'weekly_right'>(
    initialConfig?.layoutType === 'weekly_vertical' || initialConfig?.layoutType === 'weekly_horizontal' 
    ? 'weekly_left' 
    : 'standard'
  );
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, elementId: string } | null>(null);
  
  // --- RENDERING STATE (Batching System) ---
  const [renderedPreviewCount, setRenderedPreviewCount] = useState(0); 
  const [renderedPrintCount, setRenderedPrintCount] = useState(0); 
  const [printStatus, setPrintStatus] = useState<'idle' | 'generating' | 'ready'>('idle');
  const [pdfExporting, setPdfExporting] = useState(false);
  const [pdfExportProgress, setPdfExportProgress] = useState(0);
  const [pdfScaleMode, setPdfScaleMode] = useState<'fast' | 'standard' | 'high'>('standard');
  const [pdfExportMethod, setPdfExportMethod] = useState<'vector' | 'canvas'>('vector');

  // PWA (Progressive Web Application) Installation States
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPwaGuideModal, setShowPwaGuideModal] = useState(false);
  const [isAppInstalled, setIsAppInstalled] = useState(false);

  // Panel States
  const [showLayers, setShowLayers] = useState(false);
  const [showProperties, setShowProperties] = useState(true);
  const [showImageElementWarning, setShowImageElementWarning] = useState(false);
  const [dontShowImageElementAgain, setDontShowImageElementAgain] = useState(false);
  const [pendingImageElementId, setPendingImageElementId] = useState<string | null>(null);
  const [showAlignment, setShowAlignment] = useState(false);
  const [alignmentReference, setAlignmentReference] = useState<'selection' | 'margins' | 'page'>('margins');
  const [showDividerCustomizer, setShowDividerCustomizer] = useState(false);

  // Interaction States
  const [isDragging, setIsDragging] = useState(false);
  const [resizeDir, setResizeDir] = useState<string | null>(null);
  const [activeGuides, setActiveGuides] = useState<SnapGuide[]>([]);
  
  // Table Specific Interactions
  const [resizingTableCol, setResizingTableCol] = useState<{ elementId: string, colIndex: number } | null>(null);
  const [resizingTableRow, setResizingTableRow] = useState<{ elementId: string, rowIndex: number } | null>(null);
  const [activeTableCell, setActiveTableCell] = useState<{ elementId: string, r: number, c: number } | null>(null);
  const [tableStyleScope, setTableStyleScope] = useState<'global' | 'row' | 'col'>('global');
  
  // Element Actions
  const [internalClipboard, setInternalClipboard] = useState<LayoutElement[] | null>(() => {
      try {
          const saved = localStorage.getItem('agenda_master_internal_clipboard');
          return saved ? JSON.parse(saved) : null;
      } catch (e) {
          return null;
      }
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
      if (toastMessage) {
          const t = setTimeout(() => setToastMessage(null), 2500);
          return () => clearTimeout(t);
      }
  }, [toastMessage]);

  const copyToClipboardRef = useRef<(id?: string) => void>(() => {});
  const pasteFromClipboardRef = useRef<() => void>(() => {});
  const duplicateElementRef = useRef<(elementId?: string) => void>(() => {});
  const removeElementRef = useRef<(id?: string) => void>(() => {});

  const copyToClipboard = (id?: string) => {
      const activeList = getActiveElements();
      const idsToCopy = id ? (selectedIds.includes(id) ? selectedIds : [id]) : selectedIds;
      if (idsToCopy.length === 0) {
          setToastMessage("Nenhum elemento selecionado para copiar!");
          return;
      }
      
      const elementsToCopy = activeList.filter(el => idsToCopy.includes(el.id));
      if (elementsToCopy.length === 0) return;

      const serialized = JSON.parse(JSON.stringify(elementsToCopy));
      setInternalClipboard(serialized);
      try {
          localStorage.setItem('agenda_master_internal_clipboard', JSON.stringify(serialized));
      } catch (e) {
          console.error(e);
      }
      
      if (elementsToCopy.length > 1) {
          setToastMessage(`${elementsToCopy.length} elementos copiados!`);
      } else {
          setToastMessage(`Elemento copiado!`);
      }
  };

  const pasteFromClipboard = () => {
      let clipboard = internalClipboard;
      if (!clipboard || clipboard.length === 0) {
          try {
              const saved = localStorage.getItem('agenda_master_internal_clipboard');
              if (saved) {
                  clipboard = JSON.parse(saved);
              }
          } catch (e) {
              console.error(e);
          }
      }
      if (!clipboard || clipboard.length === 0) {
          setToastMessage("Área de transferência vazia! Copie algo primeiro.");
          return;
      }
      pushHistory();
      
      const activeList = getActiveElements();
      const newElements: LayoutElement[] = [];
      const groupMapping = new Map<string, string>();
      
      clipboard.forEach(element => {
          const newId = Math.random().toString(36).substring(2, 11);
          let newGroupId = element.groupId;
          
          if (element.groupId) {
              if (!groupMapping.has(element.groupId)) {
                  groupMapping.set(element.groupId, Math.random().toString(36).substring(2, 11));
              }
              newGroupId = groupMapping.get(element.groupId);
          }

          // Use clean, independent copies of each copied element
          newElements.push({
              ...JSON.parse(JSON.stringify(element)),
              id: newId,
              groupId: newGroupId,
              x: Math.min(95, element.x + 5),
              y: Math.min(95, element.y + 5),
              zIndex: activeList.length + newElements.length + 1
          });
      });

      updateActiveElements([...activeList, ...newElements]);
      setSelectedIds(newElements.map(el => el.id));

      // Cascade the coordinates inside clipboard so next Ctrl+V staggers automatically!
      const nextClipboard = clipboard.map(el => ({
          ...el,
          x: Math.min(95, el.x + 5),
          y: Math.min(95, el.y + 5)
      }));
      setInternalClipboard(nextClipboard);
      try {
          localStorage.setItem('agenda_master_internal_clipboard', JSON.stringify(nextClipboard));
      } catch (e) {
          console.error(e);
      }

      if (newElements.length > 1) {
          setToastMessage(`${newElements.length} elementos colados!`);
      } else {
          setToastMessage(`Elemento colado!`);
      }
  };

  useEffect(() => {
      copyToClipboardRef.current = copyToClipboard;
      pasteFromClipboardRef.current = pasteFromClipboard;
  });

  const handleLayerClick = (e: React.MouseEvent, elId: string) => {
      e.stopPropagation();
      window.focus();
      const activeList = getActiveElements();
      const element = activeList.find(el => el.id === elId);
      if (!element) return;

      let newSelectedIds = [...selectedIds];
      const isAlreadySelected = selectedIds.includes(elId);

      if (e.shiftKey || e.ctrlKey || e.metaKey) {
          if (isAlreadySelected) {
              newSelectedIds = newSelectedIds.filter(sid => sid !== elId);
          } else {
              newSelectedIds.push(elId);
          }
      } else {
          if (element.groupId) {
              newSelectedIds = activeList.filter(el => el.groupId === element.groupId).map(el => el.id);
          } else {
              newSelectedIds = [elId];
          }
      }

      // Ensure all items in a group are selected if any of them is selected
      const groupsInSelection = new Set<string>();
      activeList.forEach(el => {
          if (newSelectedIds.includes(el.id) && el.groupId) groupsInSelection.add(el.groupId);
      });
      if (groupsInSelection.size > 0) {
          activeList.forEach(el => {
              if (el.groupId && groupsInSelection.has(el.groupId) && !newSelectedIds.includes(el.id)) {
                  newSelectedIds.push(el.id);
              }
          });
      }

      setSelectedIds(newSelectedIds);
  };
  
  const [fontControlTab, setFontControlTab] = useState<'title' | 'weekDays' | 'days' | 'highlight'>('title');
  const [zoom, setZoom] = useState(1);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [panMode, setPanMode] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<{ x: number, y: number, scrollLeft: number, scrollTop: number } | null>(null);

  const handlePanMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // We pan if:
    // 1. panMode is active
    // 2. Spacebar is held down
    // 3. Middle mouse button is clicked (e.button === 1)
    const shouldPan = panMode || isSpacePressed || e.button === 1;
    if (!shouldPan) return;

    e.preventDefault();
    const container = editorContainerRef.current;
    if (!container) return;

    setIsPanning(true);
    panStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      scrollLeft: container.scrollLeft,
      scrollTop: container.scrollTop
    };
  };

  const handlePanMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPanning || !panStartRef.current) return;

    const container = editorContainerRef.current;
    if (!container) return;

    e.preventDefault();
    const dx = e.clientX - panStartRef.current.x;
    const dy = e.clientY - panStartRef.current.y;

    container.scrollLeft = panStartRef.current.scrollLeft - dx;
    container.scrollTop = panStartRef.current.scrollTop - dy;
  };

  const handlePanMouseUpOrLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isPanning) {
      setIsPanning(false);
      panStartRef.current = null;
    }
  };

  const editorContainerRef = useRef<HTMLDivElement>(null);
  const [editorContainerWidth, setEditorContainerWidth] = useState<number>(0);

  useEffect(() => {
    if (!editorContainerRef.current) return;
    
    const updateSize = () => {
      if (editorContainerRef.current) {
        setEditorContainerWidth(editorContainerRef.current.clientWidth);
      }
    };
    
    updateSize();
    
    const observer = new ResizeObserver(() => {
      updateSize();
    });
    
    observer.observe(editorContainerRef.current);
    
    window.addEventListener('resize', updateSize);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  const defaultCalendarStyle = {
      title: { fontSize: 10, fontFamily: 'Inter', fontWeight: 'bold', color: '#000', textAlign: 'center' as const, textTransform: 'uppercase' as const, letterSpacing: 1, backgroundColor: 'transparent' },
      weekDays: { fontSize: 7, fontFamily: 'Inter', fontWeight: 'bold', color: '#666', textAlign: 'center' as const, textTransform: 'uppercase' as const, letterSpacing: 0, backgroundColor: 'transparent' },
      days: { fontSize: 8, fontFamily: 'Inter', fontWeight: 'normal', color: '#333', textAlign: 'center' as const, textTransform: 'none' as const, letterSpacing: 0, backgroundColor: 'transparent' },
      grid: { 
          borderColor: '#dddddd', borderWidth: 0.5, cellBackgroundColor: 'transparent', headerBackgroundColor: 'transparent',
          borders: { top: false, bottom: false, left: false, right: false, insideHorizontal: false, insideVertical: false, headerSeparator: true }
      },
      specialDays: {
          highlightSundays: true,
          highlightHolidays: false,
          style: { fontSize: 8, fontFamily: 'Inter', fontWeight: 'bold', color: '#dc2626', textAlign: 'center' as const, textTransform: 'none' as const, letterSpacing: 0, backgroundColor: 'transparent' }
      }
  };

  const [editMode, setEditMode] = useState<'daily' | 'intro' | 'monthly_intro' | 'divider'>('daily');
  const [currentIntroPageId, setCurrentIntroPageId] = useState<string | null>(config.introPages[0]?.id || null);
  const [currentMonthlyIntroPageId, setCurrentMonthlyIntroPageId] = useState<string | null>(null);
  
  const dragRef = useRef<any>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number | null>(null);
  const lastMouseEvent = useRef<{ clientX: number, clientY: number } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fontInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const workspaceRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const zoomStep = 0.05; 
        if (e.deltaY < 0) {
          setZoom(prev => Math.min(3, prev + zoomStep));
        } else {
          setZoom(prev => Math.max(0.3, prev - zoomStep));
        }
      }
    };

    const workspace = workspaceRef.current;
    if (workspace) {
      workspace.addEventListener('wheel', handleWheel, { passive: false });
    }
    return () => {
      if (workspace) {
        workspace.removeEventListener('wheel', handleWheel);
      }
    };
  }, []);

  const handleExport = () => {
    exportProject(config);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  // Carregar fontes personalizadas do IndexedDB ao montar o componente
  useEffect(() => {
    const loadStoredFonts = async () => {
      try {
        const stored = await getAllFontsFromDB();
        const loadedNames: string[] = [];
        
        for (const font of stored) {
          try {
            const fontFace = new FontFace(font.name, font.buffer);
            const loadedFace = await fontFace.load();
            (document as any).fonts.add(loadedFace);
            loadedNames.push(font.name);
            console.log(`[FontStorage] Fonte '${font.name}' carregada com sucesso do IndexedDB.`);
          } catch (err) {
            console.error(`[FontStorage] Erro ao carregar fonte do IndexedDB:`, err);
          }
        }
        
        if (loadedNames.length > 0) {
          setCustomFonts(loadedNames);
        }
      } catch (e) {
        console.error('[FontStorage] Erro geral ao buscar fontes do IndexedDB:', e);
      }
    };
    
    loadStoredFonts();
  }, []);

  // -- LOCAL STORAGE PERSISTENCE --
  useEffect(() => {
    const savedConfig = localStorage.getItem('agendamaster_current_project');
    if (savedConfig && !config.name) { // Only load if current config is "empty" or default
      try {
        // setConfig(JSON.parse(savedConfig));
        // We don't auto-load to avoid overwriting initial setup, 
        // but we could offer a "Restore" button.
      } catch (e) {
        console.error('Error loading from localStorage', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('agendamaster_current_project', JSON.stringify(config));
  }, [config]);
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingFile(file);
    setShowImportConfirm(true);
    e.target.value = ''; // Clear input
  };

  const confirmImport = async () => {
    if (!pendingFile) return;
    try {
      const importedConfig = await importProject(pendingFile);
      setConfig(importedConfig);
      // Reset state based on new config
      setSelectedIds([]);
      setEditMode('daily');
      if (importedConfig.introPages.length > 0) {
        setCurrentIntroPageId(importedConfig.introPages[0].id);
      }
      if (importedConfig.monthlyIntroPages && importedConfig.monthlyIntroPages.length > 0) {
        setCurrentMonthlyIntroPageId(importedConfig.monthlyIntroPages[0].id);
      }
    } catch (err) {
      alert('Erro ao importar projeto: ' + (err instanceof Error ? err.message : 'Arquivo inválido'));
    } finally {
      setShowImportConfirm(false);
      setPendingFile(null);
    }
  };

  const cancelImport = () => {
    setShowImportConfirm(false);
    setPendingFile(null);
  };

  const templateFileInputRef = useRef<HTMLInputElement>(null);

  const exportCustomTemplates = () => {
    if (customTemplates.length === 0) {
      alert("Você não possui modelos personalizados salvos para exportar.");
      return;
    }
    try {
      const dataStr = JSON.stringify(customTemplates, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = 'agendamaster_modelos_personalizados.json';
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (e) {
      console.error('[Export Templates] Erro ao exportar modelos:', e);
      alert('Houve um erro ao exportar seus modelos personalizados.');
    }
  };

  const importCustomTemplates = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const contentStr = event.target?.result as string;
        const parsed = JSON.parse(contentStr);
        
        if (!Array.isArray(parsed)) {
          throw new Error('O arquivo importado não é um formato de lista válido de modelos.');
        }

        const validTemplates: IntroPage[] = [];
        
        parsed.forEach((item: any, idx: number) => {
          if (item && typeof item === 'object' && item.name && Array.isArray(item.elements)) {
            const cleanTemplate: IntroPage = {
              id: item.id && !customTemplates.some(t => t.id === item.id) ? item.id : 'custom-' + Math.random().toString(36).substr(2, 9),
              name: item.name,
              elements: item.elements.map((el: any) => ({
                ...el,
                id: el.id || Math.random().toString(36).substr(2, 9)
              })),
              background: item.background
            };
            validTemplates.push(cleanTemplate);
          } else {
            console.warn(`[Import Templates] Modelo descartado no índice ${idx} devido a formato inválido.`);
          }
        });

        if (validTemplates.length === 0) {
          alert('Nenhum modelo válido foi encontrado no arquivo selecionado.');
          return;
        }

        if (confirm(`Deseja importar ${validTemplates.length} modelo(s) personalizado(s)? Se houver modelos com nomes duplicados, eles coexistirão.`)) {
          const updated = [...customTemplates];
          validTemplates.forEach(newT => {
            if (!updated.some(t => t.id === newT.id)) {
              updated.push(newT);
            } else {
              updated.push({ ...newT, id: 'custom-' + Math.random().toString(36).substr(2, 9) });
            }
          });
          
          setCustomTemplates(updated);
          localStorage.setItem('agendamaster_custom_page_templates', JSON.stringify(updated));
          alert(`${validTemplates.length} modelo(s) importado(s) com sucesso!`);
        }
      } catch (err: any) {
        console.error('[Import Templates] Erro ao ler ou validar o arquivo:', err);
        alert('Erro ao importar arquivo JSON: O conteúdo do arquivo parece não ser compatível com os modelos do AgendaMaster.');
      } finally {
        if (e.target) e.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleImportVersesFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        let importedList: string[] = [];
        
        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed)) {
            importedList = parsed.map(v => String(v).trim()).filter(Boolean);
          } else {
            throw new Error('Formato JSON inválido. Deve ser uma lista [] de textos.');
          }
        } else {
          importedList = text
            .split(/\r?\n/)
            .map(line => {
              let clean = line.trim();
              if (clean.startsWith('"') && clean.endsWith('"')) {
                clean = clean.slice(1, -1);
              }
              clean = clean.replace(/\t/g, ' - ');
              return clean;
            })
            .filter(Boolean);
        }

        if (importedList.length === 0) {
          alert('Nenhum versículo válido pôde ser extraído do arquivo.');
          return;
        }

        if (confirm(`Deseja importar ${importedList.length} versículo(s) novo(s)? Seus versículos atuais serão substituídos.`)) {
          setCustomVerses(importedList);
          localStorage.setItem('agendamaster_custom_verses', JSON.stringify(importedList));
          setRenderedPreviewCount(prev => prev + 1);
          alert(`${importedList.length} versículo(s) carregado(s) com sucesso!`);
        }
      } catch (err: any) {
        console.error('[Import Verses] Erro ao ler:', err);
        alert('Erro ao importar arquivo: ' + (err.message || 'Verifique o formato.'));
      } finally {
        if (e.target) e.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  const clearCustomVerses = () => {
    if (confirm('Deseja excluir todos os seus versículos personalizados e voltar aos versículos padrões do sistema?')) {
      setCustomVerses([]);
      localStorage.removeItem('agendamaster_custom_verses');
      setRenderedPreviewCount(prev => prev + 1);
      alert('Versículos personalizados excluídos com sucesso. O sistema voltou aos versículos padrões.');
    }
  };

  const handlePasteVersesText = (textValue: string) => {
    if (!textValue.trim()) {
      alert('Por favor, cole um texto com versículos.');
      return;
    }
    const lines = textValue
      .split(/\r?\n/)
      .map(line => {
        let clean = line.trim();
        if (clean.startsWith('"') && clean.endsWith('"')) {
          clean = clean.slice(1, -1);
        }
        return clean.replace(/\t/g, ' - ');
      })
      .filter(Boolean);
      
    if (lines.length === 0) {
      alert('Nenhum versículo válido encontrado.');
      return;
    }

    setCustomVerses(lines);
    localStorage.setItem('agendamaster_custom_verses', JSON.stringify(lines));
    setRenderedPreviewCount(prev => prev + 1);
    alert(`${lines.length} versículo(s) salvos com sucesso!`);
  };

  const triggerImageElementUpload = (elementId: string) => {
    const isDismissed = localStorage.getItem('agendamaster_dismissed_image_warning') === 'true';
    if (isDismissed) {
      setPendingImageElementId(elementId);
      setTimeout(() => {
        imageInputRef.current?.click();
      }, 50);
    } else {
      setPendingImageElementId(elementId);
      setShowImageElementWarning(true);
    }
  };

  const handleConfirmImageElementUpload = () => {
    if (dontShowImageElementAgain) {
      localStorage.setItem('agendamaster_dismissed_image_warning', 'true');
    }
    setShowImageElementWarning(false);
    setTimeout(() => {
      imageInputRef.current?.click();
    }, 100);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, elementId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await compressImage(file);
      if (!dataUrl) return;
      updateElementStyle(elementId, { imageUrl: dataUrl });
    } catch (error) {
      console.error('Erro ao comprimir imagem de elemento:', error);
    }
  };

  const handleFontUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Remover extensões e caracteres especiais do nome da fonte
      const fontName = file.name.split('.')[0].replace(/[^a-zA-Z0-9]/g, '_') + '_' + Math.random().toString(36).substr(2, 5);
      const reader = new FileReader();
      reader.onload = async (event) => {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        
        try {
          const fontFace = new FontFace(fontName, arrayBuffer);
          const loadedFace = await fontFace.load();
          (document as any).fonts.add(loadedFace);
          
          // Salvar no IndexedDB
          await saveFontToDB(fontName, arrayBuffer);
          
          setCustomFonts(prev => [...prev, fontName]);
          
          // Se tiver um elemento selecionado, já aplica a nova fonte
          if (selectedIds.length > 0) {
              updateElementStyle(selectedIds[0], { fontFamily: fontName } as any);
          }
        } catch (err) {
          console.error('Erro ao processar fonte:', err);
          alert('Erro ao carregar arquivo de fonte. Verifique se o formato é válido (TTF, OTF, WOFF).');
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      console.error('Font upload error:', err);
    }
  };

  // -- BATCH RENDERER LOGIC --
  useEffect(() => {
      if (activeTab === 'preview') {
          if (renderedPreviewCount < generatedData.length) {
              const timer = setTimeout(() => {
                  setRenderedPreviewCount(prev => Math.min(prev + 20, generatedData.length));
              }, 10);
              return () => clearTimeout(timer);
          }
      } else {
          if (renderedPreviewCount > 0) setRenderedPreviewCount(0);
      }
  }, [activeTab, renderedPreviewCount, generatedData.length]);

  const handlePrintRequest = () => {
      const isYearRestricted = !(config.projectType === 'notebook' || config.projectType === 'devotional') && 
        config.year !== 2026 && 
        config.year !== 2027 && 
        !(config.year === 2028 && (user.plan?.toLowerCase().includes('2028') || user.plan?.toLowerCase().includes('renovad') || user.plan?.toLowerCase().includes('master')));

      if (isYearRestricted) {
          alert(`Desculpe! O ano de referência do seu arquivo (${config.year}) não está liberado no seu plano anual. Para gerar o PDF e arquivos finais deste ano, é necessária a renovação da sua assinatura. Atualmente você pode gerar planners de 2026 e 2027.`);
          return;
      }
      setPrintStatus('generating');
      setRenderedPrintCount(0);
  };

  useEffect(() => {
      if (printStatus === 'generating') {
          const timer = setTimeout(() => {
              if (renderedPrintCount < generatedData.length) {
                  setRenderedPrintCount(prev => Math.min(prev + 50, generatedData.length));
              } else {
                  setTimeout(() => setPrintStatus('ready'), 500);
              }
          }, 50);
          return () => clearTimeout(timer);
      }
  }, [printStatus, renderedPrintCount, generatedData.length]);



  const isPageInRange = (page: number, rangeStr: string): boolean => {
    if (!rangeStr) return false;
    const parts = rangeStr.split(',').map(p => p.trim());
    for (const part of parts) {
        if (part.includes('-')) {
            const [start, end] = part.split('-').map(n => parseInt(n.trim()));
            if (!isNaN(start) && !isNaN(end) && page >= start && page <= end) return true;
        } else {
            const num = parseInt(part);
            if (!isNaN(num) && num === page) return true;
        }
    }
    return false;
  };

  const renderBackground = (bg?: BackgroundConfig, pageNumber?: number) => {
    if (!bg || bg.type === 'none') return null;

    if (pageNumber !== undefined && bg.customPages && bg.customPages.trim() !== '') {
       if (!isPageInRange(pageNumber, bg.customPages)) return null;
    }

    const style: React.CSSProperties = {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: 0,
      pointerEvents: 'none',
      opacity: bg.opacity ?? 1,
    };

    if (bg.type === 'solid' && bg.color) {
      style.backgroundColor = bg.color;
    } else if (bg.type === 'gradient' && bg.gradient) {
      const { type, colors, direction } = bg.gradient;
      if (type === 'linear') {
        style.background = `linear-gradient(${direction}deg, ${colors[0]}, ${colors[1]})`;
      } else {
        style.background = `radial-gradient(circle at center, ${colors[0]}, ${colors[1]})`;
      }
    } else if (bg.type === 'image' && bg.image) {
      return (
        <div style={style}>
          <img 
            src={bg.image.url} 
            alt="Page Background" 
            style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: bg.image.fit || 'cover',
                opacity: bg.image.opacity ?? 1
            }} 
          />
        </div>
      );
    }

    return <div style={style} />;
  };

  const cancelPrint = () => {
      setPrintStatus('idle');
      setRenderedPrintCount(0);
      setPdfExporting(false);
      setPdfExportProgress(0);
  };

  const handleKeyDownRef = useRef<(e: KeyboardEvent) => void>(() => {});

  useEffect(() => {
    handleKeyDownRef.current = (e: KeyboardEvent) => {
        const activeElement = document.activeElement;
        const isInputActive = activeElement && (
            activeElement.tagName === 'INPUT' || 
            activeElement.tagName === 'TEXTAREA' || 
            (activeElement as HTMLElement).isContentEditable
        );

        if (isInputActive) return;

        // Spacebar activation for panning
        if (e.code === 'Space' || e.key === ' ') {
            e.preventDefault();
            setIsSpacePressed(true);
            return;
        }

        // Toggle tools: H for Hand/Pan, V for Selection
        if (e.key.toLowerCase() === 'h') {
            setPanMode(true);
            return;
        }
        if (e.key.toLowerCase() === 'v') {
            setPanMode(false);
            return;
        }

        if (e.key === 'Delete' || e.key === 'Backspace') {
            if (activeTableCell) return; // Don't delete element when editing cell text
            e.preventDefault();
            removeElementRef.current();
        }

        // Duplicar (Ctrl + D)
        if ((e.ctrlKey || e.metaKey) && (e.code === 'KeyD' || e.key.toLowerCase() === 'd')) {
            e.preventDefault();
            duplicateElementRef.current();
        }

        // Copiar (Ctrl + C)
        if ((e.ctrlKey || e.metaKey) && (e.code === 'KeyC' || e.key.toLowerCase() === 'c')) {
            e.preventDefault();
            copyToClipboardRef.current();
        }

        // Colar (Ctrl + V)
        if ((e.ctrlKey || e.metaKey) && (e.code === 'KeyV' || e.key.toLowerCase() === 'v')) {
            e.preventDefault();
            pasteFromClipboardRef.current();
        }

        if (selectedIds.length > 0 && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            e.preventDefault();
            const activeList = getActiveElements();
            
            const step = e.shiftKey ? 5 : 1; 
            const newElements = activeList.map(el => {
                if (!selectedIds.includes(el.id)) return el;
                const newEl = { ...el };
                if (e.key === 'ArrowUp') newEl.y = Math.max(0, newEl.y - step);
                if (e.key === 'ArrowDown') newEl.y = Math.min(100 - newEl.h, newEl.y + step);
                if (e.key === 'ArrowLeft') newEl.x = Math.max(0, newEl.x - step);
                if (e.key === 'ArrowRight') newEl.x = Math.min(100 - newEl.w, newEl.x + step);
                return newEl;
            });
            updateActiveElements(newElements);
        }
    };
  });

  useEffect(() => {
    const handleKeyDownWrapper = (e: KeyboardEvent) => {
        handleKeyDownRef.current(e);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
        if (e.code === 'Space' || e.key === ' ') {
            setIsSpacePressed(false);
        }
    };

    const handleBlur = () => {
        setIsSpacePressed(false);
    };

    window.addEventListener('keydown', handleKeyDownWrapper);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);
    return () => {
        window.removeEventListener('keydown', handleKeyDownWrapper);
        window.removeEventListener('keyup', handleKeyUp);
        window.removeEventListener('blur', handleBlur);
    };
  }, []); 

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check if already in standalone display mode (installed)
      const checkInstallation = () => {
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                            (navigator as any).standalone || 
                            (window as any).isAppInstalled || 
                            false;
        setIsAppInstalled(isStandalone);
      };
      
      checkInstallation();

      // Check if global prompt is already available
      if ((window as any).deferredPrompt) {
        setDeferredPrompt((window as any).deferredPrompt);
      }

      const handleBeforeInstallPrompt = (e: Event) => {
          e.preventDefault();
          setDeferredPrompt(e);
          console.log('[PWA] Prompt de instalação interceptado com sucesso!');
      };

      const handleAppInstalled = () => {
          setIsAppInstalled(true);
          setDeferredPrompt(null);
          console.log('[PWA] Agenda Master instalado com sucesso!');
      };

      const handleGlobalPromptReady = () => {
        if ((window as any).deferredPrompt) {
          setDeferredPrompt((window as any).deferredPrompt);
        }
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.addEventListener('appinstalled', handleAppInstalled);
      window.addEventListener('pwa-prompt-ready', handleGlobalPromptReady);
      window.addEventListener('pwa-installed', handleAppInstalled);

      return () => {
          window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
          window.removeEventListener('appinstalled', handleAppInstalled);
          window.removeEventListener('pwa-prompt-ready', handleGlobalPromptReady);
          window.removeEventListener('pwa-installed', handleAppInstalled);
      };
    }
  }, []);

  const executeInstallApp = async () => {
      const activePrompt = deferredPrompt || (window as any).deferredPrompt;
      if (!activePrompt) {
          setShowPwaGuideModal(true);
          return;
      }
      try {
          activePrompt.prompt();
          const { outcome } = await activePrompt.userChoice;
          console.log(`[PWA] Resposta de instalação do usuário: ${outcome}`);
          setDeferredPrompt(null);
          (window as any).deferredPrompt = null;
      } catch (err) {
          console.error('[PWA] Erro ao disparar instalação nativa:', err);
          setShowPwaGuideModal(true);
      }
  };

  const getPageDimensions = () => {
      const base = config.pageSize === 'Custom' && config.customPageSize 
        ? config.customPageSize 
        : PAGE_SIZES_MM[config.pageSize];
      if (config.orientation === 'portrait') return base;
      return { width: base.height, height: base.width };
  };

  const { width: PAGE_WIDTH_MM, height: PAGE_HEIGHT_MM } = getPageDimensions();
  
  const EDITOR_WIDTH_PX = 400 * zoom; 
  const EDITOR_SCALE = EDITOR_WIDTH_PX / PAGE_WIDTH_MM;
  const EDITOR_HEIGHT_PX = PAGE_HEIGHT_MM * EDITOR_SCALE;

  const getResponsiveScale = () => {
    const baseWidth = 400;
    if (editorContainerWidth && editorContainerWidth < baseWidth + 32) {
      const fitScale = (editorContainerWidth - 32) / baseWidth;
      return fitScale;
    }
    return 1;
  };
  const responsiveScale = getResponsiveScale();

  useEffect(() => {
    const isWeekly = config.layoutType === 'weekly_vertical' || config.layoutType === 'weekly_horizontal';
    const isNotebookOrDevotional = config.projectType === 'notebook' || config.projectType === 'devotional';
    
    let data: DayData[] = [];
    
    if (isNotebookOrDevotional) {
        data = generateGenericPages(config.pageCount || 100);
    } else if (isWeekly) {
        data = generatePlannerDays(
            config.year,
            config.includeHolidays,
            config.municipalHolidays,
            config.startMonth ?? 0,
            config.durationMonths ?? 12
        );
    } else {
        data = generateCalendarYear(
            config.year,
            config.includeHolidays,
            config.municipalHolidays,
            config.startMonth ?? 0,
            config.durationMonths ?? 12
        );
    }
    
    setGeneratedData(data);
  }, [config.year, config.includeHolidays, config.municipalHolidays, config.layoutType, config.projectType, config.pageCount, config.startMonth, config.durationMonths]);

  useEffect(() => {
    if (config.includeQuotes && quotes.length === 0) {
       generateMonthlyQuotes(config.year).then(setQuotes);
    }
  }, [config.includeQuotes, config.year]);

  useEffect(() => {
    if (selectedId !== activeTableCell?.elementId) {
        setActiveTableCell(null);
    }
    if (selectedId) setShowProperties(true);
  }, [selectedId]);

  const getActiveElements = () => {
      if (editMode === 'daily') {
          if (config.layoutType === '1_per_page_weekend_shared') {
              if (editorViewMode === 'saturday') return config.elementsSaturday || config.elements;
              if (editorViewMode === 'sunday') return config.elementsSunday || config.elements;
          }
          if (config.layoutType === '2_per_page') {
              if (editorViewMode === 'top') return config.elementsTop || config.elements;
              if (editorViewMode === 'bottom') return config.elementsBottom || config.elements;
          }
          if (config.layoutType === 'weekly_vertical' || config.layoutType === 'weekly_horizontal') {
              if (editorViewMode === 'weekly_left') return config.elementsWeeklyLeft ?? config.elements;
              if (editorViewMode === 'weekly_right') return config.elementsWeeklyRight ?? config.elements;
              // Fallback for standard mode if it leaks
              if (editorViewMode === 'standard') return config.elementsWeeklyLeft ?? config.elements;
          }
          return config.elements;
      }
      if (editMode === 'intro' && currentIntroPageId) {
          return config.introPages.find(p => p.id === currentIntroPageId)?.elements || [];
      }
      if (editMode === 'monthly_intro' && currentMonthlyIntroPageId) {
          return config.monthlyIntroPages?.find(p => p.id === currentMonthlyIntroPageId)?.elements || [];
      }
      if (editMode === 'divider') {
          return config.monthlyDividerStyle?.elements || [];
      }
      return [];
  };

  const transferElementBetweenPages = (elementId: string, from: 'weekly_left' | 'weekly_right', to: 'weekly_left' | 'weekly_right', event: React.MouseEvent) => {
    setConfig(prev => {
        const fromKey = from === 'weekly_left' ? 'elementsWeeklyLeft' : 'elementsWeeklyRight';
        const toKey = to === 'weekly_left' ? 'elementsWeeklyLeft' : 'elementsWeeklyRight';
        
        const fromList = prev[fromKey] || prev.elements;
        const toList = prev[toKey] || prev.elements;
        
        const element = fromList.find(e => e.id === elementId);
        if (!element) return prev;

        // If we found it, move it
        const newFromList = fromList.filter(e => e.id !== elementId);
        
        // Calculate the new X position
        // If we are moving from left to right, we subtract ~100 to bring it to near 0 on the right page
        // If from right to left, we add ~100
        const newX = from === 'weekly_left' ? element.x - 100 : element.x + 100;
        
        const newElement = { ...element, x: Math.max(0, Math.min(100 - element.w, newX)) };
        const newToList = [...toList, newElement];

        // Update mode so getActiveElements works for the current drag
        setTimeout(() => setEditorViewMode(to), 0);

        // We also need to update dragRef because the coordinate system changed
        if (dragRef.current) {
            // Adjust start position relative to the new page
            const containerWidth = EDITOR_WIDTH_PX;
            const gapWidth = 32; // gap-8 = 2rem = 32px
            
            if (from === 'weekly_left') {
                dragRef.current.startX += (containerWidth + gapWidth);
                dragRef.current.initialX -= 100;
            } else {
                dragRef.current.startX -= (containerWidth + gapWidth);
                dragRef.current.initialX += 100;
            }
        }

        return {
            ...prev,
            [fromKey]: newFromList,
            [toKey]: newToList
        };
    });
  };

  const updateActiveElements = (newElements: LayoutElement[], silent = false) => {
      const setter = silent ? setConfigSilent : setConfig;
      if (editMode === 'daily') {
          if (config.layoutType === '1_per_page_weekend_shared') {
              if (editorViewMode === 'saturday') {
                  setter(prev => ({ ...prev, elementsSaturday: newElements }));
                  return;
              }
              if (editorViewMode === 'sunday') {
                  setter(prev => ({ ...prev, elementsSunday: newElements }));
                  return;
              }
          }
          if (config.layoutType === '2_per_page') {
              if (editorViewMode === 'top') {
                  setter(prev => ({ ...prev, elementsTop: newElements }));
                  return;
              }
              if (editorViewMode === 'bottom') {
                  setter(prev => ({ ...prev, elementsBottom: newElements }));
                  return;
              }
          }
          if (config.layoutType === 'weekly_vertical' || config.layoutType === 'weekly_horizontal') {
              if (editorViewMode === 'weekly_left' || editorViewMode === 'standard') {
                  setter(prev => ({ ...prev, elementsWeeklyLeft: newElements }));
              } else if (editorViewMode === 'weekly_right') {
                  setter(prev => ({ ...prev, elementsWeeklyRight: newElements }));
              }
              return;
          }
          setter(prev => ({ ...prev, elements: newElements }));
      } else if (editMode === 'intro' && currentIntroPageId) {
          setter(prev => ({
              ...prev,
              introPages: prev.introPages.map(p => p.id === currentIntroPageId ? { ...p, elements: newElements } : p)
          }));
      } else if (editMode === 'monthly_intro' && currentMonthlyIntroPageId) {
          setter(prev => {
              const pages = prev.monthlyIntroPages || [];
              const currentIdx = pages.findIndex(p => p.id === currentMonthlyIntroPageId);
              if (currentIdx === -1) {
                  return {
                      ...prev,
                      monthlyIntroPages: pages.map(p => p.id === currentMonthlyIntroPageId ? { ...p, elements: newElements } : p)
                  };
              }

              const currentCalendar = newElements.find(el => el.type === 'mini_calendar' || el.type === 'full_calendar');
              let updatedPages = pages.map(p => p.id === currentMonthlyIntroPageId ? { ...p, elements: newElements } : p);

              if (currentCalendar) {
                  const isLeftPage = currentIdx % 2 === 0;
                  const pairedIdx = isLeftPage ? currentIdx + 1 : currentIdx - 1;
                  const pairedPage = pages[pairedIdx];
                  
                  const isSplitPair = isLeftPage 
                      ? currentCalendar.style.fullCalendar?.splitMode === 'left'
                      : (pairedPage?.elements.find(el => el.type === 'mini_calendar' || el.type === 'full_calendar')?.style.fullCalendar?.splitMode === 'left');

                  if (pairedPage && isSplitPair) {
                      const pairedCalendarIdx = pairedPage.elements.findIndex(el => el.type === 'mini_calendar' || el.type === 'full_calendar');
                      if (pairedCalendarIdx !== -1) {
                          const pairedCalendar = pairedPage.elements[pairedCalendarIdx];
                          
                          const syncedStyle = {
                              ...currentCalendar.style,
                              fullCalendar: {
                                  ...currentCalendar.style.fullCalendar,
                                  splitMode: pairedCalendar.style.fullCalendar?.splitMode || (isLeftPage ? 'right' : 'left')
                              }
                          };

                          updatedPages = updatedPages.map((p, idx) => {
                              if (idx === pairedIdx) {
                                  const updatedElements = [...p.elements];
                                  updatedElements[pairedCalendarIdx] = {
                                      ...pairedCalendar,
                                      style: syncedStyle
                                  };
                                  return { ...p, elements: updatedElements };
                              }
                              return p;
                          });
                      }
                  }
              }

              return {
                  ...prev,
                  monthlyIntroPages: updatedPages
              };
          });
      } else if (editMode === 'divider') {
          setter(prev => ({
              ...prev,
              monthlyDividerStyle: {
                  ...(prev.monthlyDividerStyle || {}),
                  elements: newElements
              }
          }));
      }
  };

  const alignElement = (type: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
      if (selectedIds.length === 0) return;
      const activeList = getActiveElements();
      const selectedElements = activeList.filter(el => selectedIds.includes(el.id));
      
      let newElements: LayoutElement[];
      const ref = (selectedIds.length === 1 && alignmentReference === 'selection') ? 'margins' : alignmentReference;
      
      if (ref === 'selection' && selectedIds.length > 1) {
          // Align relative to the selection bounding box (professional editor behavior)
          const minX = Math.min(...selectedElements.map(el => el.x));
          const maxX = Math.max(...selectedElements.map(el => el.x + el.w));
          const minY = Math.min(...selectedElements.map(el => el.y));
          const maxY = Math.max(...selectedElements.map(el => el.y + el.h));
          const centerOfBoundBoxX = (minX + maxX) / 2;
          const centerOfBoundBoxY = (minY + maxY) / 2;
          
          newElements = activeList.map(el => {
              if (!selectedIds.includes(el.id)) return el;
              const newEl = { ...el };
              switch(type) {
                  case 'left': newEl.x = minX; break;
                  case 'center': newEl.x = centerOfBoundBoxX - (newEl.w / 2); break;
                  case 'right': newEl.x = maxX - newEl.w; break;
                  case 'top': newEl.y = minY; break;
                  case 'middle': newEl.y = centerOfBoundBoxY - (newEl.h / 2); break;
                  case 'bottom': newEl.y = maxY - newEl.h; break;
              }
              return newEl;
          });
      } else if (ref === 'page') {
          // Align relative to the physical page limits (0 to PAGE_WIDTH_MM / PAGE_HEIGHT_MM)
          const marginTop = config.margins?.top ?? 15;
          const marginBottom = config.margins?.bottom ?? 15;
          const marginLeft = config.margins?.inside ?? 20;
          const marginRight = config.margins?.outside ?? 10;
          
          const usableW = Math.max(1, PAGE_WIDTH_MM - marginLeft - marginRight);
          const usableH = Math.max(1, PAGE_HEIGHT_MM - marginTop - marginBottom);
          
          const pageLeftPercent = - (marginLeft / usableW) * 100;
          const pageRightPercent = 100 + (marginRight / usableW) * 100;
          const pageTopPercent = - (marginTop / usableH) * 100;
          const pageBottomPercent = 100 + (marginBottom / usableH) * 100;
          
          const centerPhysX_mm = (PAGE_WIDTH_MM / 2) - marginLeft;
          const pageCenterXPercent = (centerPhysX_mm / usableW) * 100;
          
          const centerPhysY_mm = (PAGE_HEIGHT_MM / 2) - marginTop;
          const pageCenterYPercent = (centerPhysY_mm / usableH) * 100;
          
          newElements = activeList.map(el => {
              if (!selectedIds.includes(el.id)) return el;
              const newEl = { ...el };
              switch(type) {
                  case 'left': newEl.x = pageLeftPercent; break;
                  case 'center': newEl.x = pageCenterXPercent - (newEl.w / 2); break;
                  case 'right': newEl.x = pageRightPercent - newEl.w; break;
                  case 'top': newEl.y = pageTopPercent; break;
                  case 'middle': newEl.y = pageCenterYPercent - (newEl.h / 2); break;
                  case 'bottom': newEl.y = pageBottomPercent - newEl.h; break;
              }
              return newEl;
          });
      } else {
          // Align relative to page margins (useful area bounds, i.e. 0 to 100)
          newElements = activeList.map(el => {
              if (!selectedIds.includes(el.id)) return el;
              const newEl = { ...el };
              switch(type) {
                  case 'left': newEl.x = 0; break;
                  case 'center': newEl.x = 50 - (newEl.w / 2); break;
                  case 'right': newEl.x = 100 - newEl.w; break;
                  case 'top': newEl.y = 0; break;
                  case 'middle': newEl.y = 50 - (newEl.h / 2); break;
                  case 'bottom': newEl.y = 100 - newEl.h; break;
              }
              return newEl;
          });
      }
      
      updateActiveElements(newElements);
  };

  const fitToText = () => {
      if (selectedIds.length === 0) return;
      const activeList = getActiveElements();
      
      const newElements = activeList.map(el => {
          if (!selectedIds.includes(el.id) || !el.content) return el;
          
          const charCount = el.content.length;
          const fontSize = el.style.fontSize || 14;
          const estWidthPx = charCount * (fontSize * 0.6); 
          const estWidthPercent = (estWidthPx / EDITOR_WIDTH_PX) * 100;
          
          const newWidth = Math.min(90, Math.max(10, estWidthPercent));
          const newHeight = Math.max(5, (fontSize * 1.5 * (Math.ceil(estWidthPercent/90)) / EDITOR_HEIGHT_PX) * 100);
          
          return { ...el, w: newWidth, h: newHeight };
      });

      updateActiveElements(newElements);
  };

  const addIntroPage = () => {
      const newPage = {
          id: Math.random().toString(36).substr(2, 9),
          name: `Página ${config.introPages.length + 1}`,
          elements: []
      };
      setConfig(prev => ({ ...prev, introPages: [...prev.introPages, newPage] }));
      setCurrentIntroPageId(newPage.id);
  };

  const addIntroTemplate = (template: IntroPage) => {
      const newPage = {
          ...template,
          id: Math.random().toString(36).substr(2, 9),
          // Deep copy elements to avoid reference issues
          elements: template.elements.map(el => ({ ...el, id: Math.random().toString(36).substr(2, 9) }))
      };
      if (editMode === 'monthly_intro') {
          setConfig(prev => ({ ...prev, monthlyIntroPages: [...(prev.monthlyIntroPages || []), newPage] }));
          setCurrentMonthlyIntroPageId(newPage.id);
      } else {
          setConfig(prev => ({ ...prev, introPages: [...prev.introPages, newPage] }));
          setCurrentIntroPageId(newPage.id);
      }
      setTemplateModal(false);
  };

  const applyLibraryLayout = (layoutId: string) => {
      const item = LAYOUT_LIBRARY.find(l => l.id === layoutId);
      if (!item) return;

      setConfig(prev => ({
          ...prev,
          ...item.config,
          // Ensure IDs are unique
          elements: item.config.elements?.map(el => ({ ...el, id: Math.random().toString(36).substr(2, 9) })) || prev.elements,
          elementsSaturday: item.config.elementsSaturday?.map(el => ({ ...el, id: Math.random().toString(36).substr(2, 9) })),
          elementsSunday: item.config.elementsSunday?.map(el => ({ ...el, id: Math.random().toString(36).substr(2, 9) })),
          elementsTop: item.config.elementsTop?.map(el => ({ ...el, id: Math.random().toString(36).substr(2, 9) })),
          elementsBottom: item.config.elementsBottom?.map(el => ({ ...el, id: Math.random().toString(36).substr(2, 9) })),
          elementsWeeklyLeft: item.config.elementsWeeklyLeft?.map(el => ({ ...el, id: Math.random().toString(36).substr(2, 9) })),
          elementsWeeklyRight: item.config.elementsWeeklyRight?.map(el => ({ ...el, id: Math.random().toString(36).substr(2, 9) })),
      }));
      setTemplateModal(false);
  };

  const applyPlannerTemplate = (type: 'weekly_vertical' | 'weekly_horizontal', style: 'blank' | 'lines' | 'dots' | 'grid' | 'timetable') => {
      let left: LayoutElement[] = [];
      let right: LayoutElement[] = [];

      const mapElements = (elements: LayoutElement[]) => elements.map(el => {
          const newEl = { ...el, id: Math.random().toString(36).substr(2, 9) };
          if (newEl.type === 'planner_day_box') {
              newEl.style = { 
                  ...newEl.style, 
                  plannerDayBox: { ...newEl.style.plannerDayBox, contentStyle: style as any } 
              };
          }
          return newEl;
      });

      if (type === 'weekly_vertical') {
          left = mapElements(WEEKLY_VERTICAL_LEFT);
          right = mapElements(WEEKLY_VERTICAL_RIGHT);
      } else {
          left = mapElements(WEEKLY_HORIZONTAL_LEFT);
          right = mapElements(WEEKLY_HORIZONTAL_RIGHT);
      }

      setConfig(prev => ({
          ...prev,
          layoutType: type,
          elementsWeeklyLeft: left,
          elementsWeeklyRight: right
      }));
      setEditMode('daily');
      setTemplateModal(false);
  };

  const applyCustomTemplate = (template: IntroPage) => {
      const newPage = {
          ...template,
          id: Math.random().toString(36).substr(2, 9),
          // Deep copy elements to avoid reference issues
          elements: template.elements.map(el => ({ ...el, id: Math.random().toString(36).substr(2, 9) }))
      };
      if (editMode === 'monthly_intro') {
          setConfig(prev => ({ ...prev, monthlyIntroPages: [...(prev.monthlyIntroPages || []), newPage] }));
          setCurrentMonthlyIntroPageId(newPage.id);
      } else {
          setConfig(prev => ({ ...prev, introPages: [...prev.introPages, newPage] }));
          setCurrentIntroPageId(newPage.id);
      }
      setTemplateModal(false);
  };

  const savePageAsTemplate = (page: IntroPage) => {
      let templateName: string | null = null;
      try {
          templateName = prompt("Digite o nome para o seu modelo personalizado:", page.name);
      } catch (e) {
          // Fallback if prompt is blocked/not available
          templateName = page.name;
      }
      
      if (templateName === null) return; // cancelled
      const finalName = templateName.trim() || page.name;
      const newTemplate: IntroPage = {
          id: 'custom-' + Math.random().toString(36).substr(2, 9),
          name: finalName,
          elements: (page.elements || []).map(el => ({ ...el, id: Math.random().toString(36).substr(2, 9) })),
          background: page.background
      };
      const updated = [...customTemplates, newTemplate];
      setCustomTemplates(updated);
      localStorage.setItem('agendamaster_custom_page_templates', JSON.stringify(updated));
      
      // Navigate and open tab automatically
      setTemplateCategory('custom');
      setTemplateModal(true);
  };

  const deleteCustomTemplate = (id: string, name: string) => {
      if (confirm(`Deseja excluir o modelo "${name}" permanentemente?`)) {
          const updated = customTemplates.filter(t => t.id !== id);
          setCustomTemplates(updated);
          localStorage.setItem('agendamaster_custom_page_templates', JSON.stringify(updated));
      }
  };

  const renameIntroPage = (id: string, name: string) => {
      setConfig(prev => ({
          ...prev,
          introPages: prev.introPages.map(p => p.id === id ? { ...p, name } : p)
      }));
  };

  const deleteIntroPage = (id: string) => {
      setConfig(prev => {
          const newPages = prev.introPages.filter(p => p.id !== id);
          if (currentIntroPageId === id) {
              setCurrentIntroPageId(newPages[0]?.id || null);
          }
          return { ...prev, introPages: newPages };
      });
  };

  const moveIntroPage = (id: string, direction: 'up' | 'down') => {
      setConfig(prev => {
          const index = prev.introPages.findIndex(p => p.id === id);
          if (index === -1) return prev;
          
          const newPages = [...prev.introPages];
          if (direction === 'up' && index > 0) {
              [newPages[index], newPages[index - 1]] = [newPages[index - 1], newPages[index]];
          } else if (direction === 'down' && index < newPages.length - 1) {
              [newPages[index], newPages[index + 1]] = [newPages[index + 1], newPages[index]];
          } else {
              return prev;
          }
          
          return { ...prev, introPages: newPages };
      });
  };

  const addMonthlyIntroPage = () => {
       const newPage = {
           id: Math.random().toString(36).substr(2, 9),
           name: `Página Mensal ${(config.monthlyIntroPages || []).length + 1}`,
           elements: []
       };
       setConfig(prev => ({ ...prev, monthlyIntroPages: [...(prev.monthlyIntroPages || []), newPage] }));
       setCurrentMonthlyIntroPageId(newPage.id);
  };

  const renameMonthlyIntroPage = (id: string, name: string) => {
       setConfig(prev => ({
           ...prev,
           monthlyIntroPages: (prev.monthlyIntroPages || []).map(p => p.id === id ? { ...p, name } : p)
       }));
  };

  const deleteMonthlyIntroPage = (id: string) => {
       setConfig(prev => {
           const newPages = (prev.monthlyIntroPages || []).filter(p => p.id !== id);
           if (currentMonthlyIntroPageId === id) {
               setCurrentMonthlyIntroPageId(newPages[0]?.id || null);
           }
           return { ...prev, monthlyIntroPages: newPages };
       });
  };

  const moveMonthlyIntroPage = (id: string, direction: 'up' | 'down') => {
       setConfig(prev => {
           const pagesList = prev.monthlyIntroPages || [];
           const index = pagesList.findIndex(p => p.id === id);
           if (index === -1) return prev;
           
           const newPages = [...pagesList];
           if (direction === 'up' && index > 0) {
               [newPages[index], newPages[index - 1]] = [newPages[index - 1], newPages[index]];
           } else if (direction === 'down' && index < newPages.length - 1) {
               [newPages[index], newPages[index + 1]] = [newPages[index + 1], newPages[index]];
           } else {
               return prev;
           }
           
           return { ...prev, monthlyIntroPages: newPages };
       });
  };

  const generateHolidayListText = () => {
      const holidays = generatedData.filter(d => d.holiday).sort((a,b) => a.date.getTime() - b.date.getTime());
      return holidays.map(h => {
          const day = String(h.dayOfMonth).padStart(2, '0');
          const month = String(h.month + 1).padStart(2, '0');
          return `${day}/${month} - ${h.holiday}`;
      }).join('\n');
  };

  const handleScrollToMonth = (monthIndex: number) => {
      if (activeTab !== 'preview') return;
      
      let dayIndex = 0;
      for (let i = 0; i < generatedData.length; i++) {
          if (generatedData[i].month === monthIndex) {
              dayIndex = i;
              break;
          }
      }

      let pageNumber = config.introPages.length + 1;
      if (config.layoutType === '1_per_page') {
          pageNumber += dayIndex;
      } else if (config.layoutType === '2_per_page') {
          pageNumber += Math.floor(dayIndex / 2);
      } else if (config.layoutType === '1_per_page_weekend_shared') {
          let currentDay = 0;
          let p = config.introPages.length + 1;
          while (currentDay < dayIndex) {
              const day = generatedData[currentDay];
              if (!day) break;
              const isWeekend = day.dayOfWeek === 6;
              if (isWeekend) {
                  currentDay += 2;
              } else {
                  currentDay += 1;
              }
              p++;
          }
          pageNumber = p;
      }

      const element = document.getElementById(`preview-page-${pageNumber}`);
      if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
  };

  const getCurrentPageHeight = () => {
      if (editMode === 'daily') {
          if (config.layoutType === '1_per_page_weekend_shared' && (editorViewMode === 'saturday' || editorViewMode === 'sunday')) {
              return EDITOR_HEIGHT_PX / 2;
          }
          if (config.layoutType === '2_per_page' && (editorViewMode === 'top' || editorViewMode === 'bottom')) {
              return EDITOR_HEIGHT_PX / 2;
          }
      }
      return EDITOR_HEIGHT_PX;
  };

  const addElement = (type: ElementType, label: string, styleOverride: any = {}, sizeOverride: any = {}) => {
    const activeList = getActiveElements();
    const currentPageHeight = getCurrentPageHeight();
    const newElement: LayoutElement = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      name: `${label} ${activeList.length + 1}`,
      x: 35, y: 40, w: sizeOverride.w || 20, h: sizeOverride.h || 10, zIndex: activeList.length + 1,
      style: { fontSize: 14, color: '#000000', textAlign: 'left', lineSpacing: 24, borderColor: '#000000', borderWidth: 0, backgroundColor: 'transparent', rotation: 0, opacity: 1, flipX: false, flipY: false, fontFamily: 'Inter', showTimes: false, startHour: 7, borderStyle: 'solid', ...styleOverride }
    };

    if (type === 'text') { newElement.content = styleOverride.content || "Novo Texto"; }

    if (!sizeOverride.w) {
        if (type === 'lines') { newElement.w = 80; newElement.h = 40; newElement.x = 10; newElement.style.borderWidth = 0.5; }
        if (type === 'box') { newElement.w = 30; newElement.h = 15; newElement.style.backgroundColor = '#f3f4f6'; newElement.style.borderWidth = 0; }
        if (type === 'circle') { 
            newElement.w = 10; 
            newElement.h = 10 * (PAGE_WIDTH_MM / PAGE_HEIGHT_MM); 
            newElement.style.backgroundColor = '#e0e7ff'; 
            newElement.style.borderRadius = 999; 
            newElement.style.borderWidth = 0; 
        }
        if (type === 'date_placeholder') { 
            newElement.w = 15; newElement.h = 10; 
            newElement.style.fontSize = 32; 
            newElement.style.fontWeight = 'bold'; 
            newElement.style.borderWidth = 0; 
            newElement.style.variant = (styleOverride as any)?.variant || 'day_number';
        }
        if (type === 'text') { newElement.w = 30; newElement.h = 8; newElement.style.fontSize = 16; newElement.style.borderWidth = 0; }
        if (type === 'holiday') { newElement.w = 40; newElement.h = 5; newElement.style.fontSize = 10; newElement.style.color = '#ef4444'; newElement.style.borderWidth = 0; newElement.style.fontWeight = '500'; }
        if (type === 'moon') { newElement.w = 20; newElement.h = 5; newElement.style.fontSize = 12; newElement.style.color = '#6b7280'; newElement.style.borderWidth = 0; }
        if (type === 'icon') { newElement.w = 5; newElement.h = 5 * (PAGE_WIDTH_MM / PAGE_HEIGHT_MM); newElement.style.borderWidth = 0; }
        if (type === 'verse') { 
            newElement.w = 80; newElement.h = 10; newElement.x = 10; 
            newElement.style.fontSize = 11; 
            newElement.style.fontStyle = 'italic'; 
            newElement.style.textAlign = 'center'; 
            newElement.style.borderWidth = 0; 
            setConfig(prev => ({ ...prev, includeVerses: true }));
        }
        if (type === 'habit_tracker') { 
            newElement.w = 40; newElement.h = 15; 
            newElement.style.borderWidth = 0; 
            newElement.style.borderColor = '#f3f4f6'; 
            newElement.style.habitMarkerType = 'square';
            newElement.style.habitMarkerSize = 16;
            newElement.style.habitMarkerStroke = 1.5;
            newElement.style.habitSpacing = 4;
            newElement.style.habitLineWidth = 1;
            newElement.style.habitColor = '#d1d5db';
            newElement.style.habitFillColor = 'transparent';
            newElement.style.habitShowLabel = true;
            newElement.style.habitLabel = 'Hábitos';
        }
        if (type === 'note_grid') { newElement.w = 40; newElement.h = 20; newElement.style.opacity = 0.5; newElement.style.borderWidth = 0; }
        
        if (type === 'mini_calendar') { 
            newElement.w = 25; newElement.h = 18; 
            newElement.style.calendarOffset = 0;
            newElement.style.borderWidth = 0;
            newElement.style.useGlobalStyle = true;
            newElement.style.fullCalendar = {} as any; // Start empty to allow sync to work as base
        }
        
        if (type === 'full_calendar') { 
            newElement.w = 90; newElement.h = 80; newElement.x = 5; newElement.y = 10; 
            newElement.style.borderWidth = 0; newElement.style.monthsPerRow = 3; newElement.style.gap = 15; 
            newElement.style.fullCalendar = {
                ...defaultCalendarStyle,
                title: { ...defaultCalendarStyle.title, fontSize: 14 },
                weekDays: { ...defaultCalendarStyle.weekDays, fontSize: 9 },
                days: { ...defaultCalendarStyle.days, fontSize: 10 },
                specialDays: { ...defaultCalendarStyle.specialDays, style: { ...defaultCalendarStyle.specialDays.style, fontSize: 10, backgroundColor: '#fee2e2' } }
            };
        }
        
        if (type === 'holiday_list') {
            newElement.w = 40; newElement.h = 60; newElement.x = 10; newElement.y = 10;
            newElement.style.fontSize = 10; newElement.style.color = '#333';
            newElement.style.columnCount = 1; // Default to 1 column
            newElement.content = generateHolidayListText();
        }

        if (type === 'table') {
            const defaultRows = 10;
            const defaultRowHeight = 20;
            const totalHeightPx = defaultRows * defaultRowHeight;
            newElement.w = 80; 
            newElement.h = (totalHeightPx / currentPageHeight) * 100;
            newElement.x = 10;
            newElement.style.borderWidth = 1;
            newElement.style.borderColor = '#d1d5db';
            newElement.style.table = {
                rows: defaultRows,
                cols: 2,
                rowHeight: defaultRowHeight,
                borderColor: '#d1d5db',
                borderWidth: 1,
                headerRow: true,
                columnWidths: [50, 50],
                cellContent: {},
                textStyle: {
                    fontFamily: 'Inter',
                    fontSize: 10,
                    fontWeight: 'normal',
                    color: '#4b5563',
                    textAlign: 'left',
                    verticalAlign: 'top',
                    textTransform: 'none',
                    letterSpacing: 0,
                    backgroundColor: 'transparent'
                },
                rowStyles: {},
                colStyles: {},
                borders: {
                    top: true, bottom: true, left: true, right: true,
                    insideHorizontal: true, insideVertical: true, headerSeparator: true
                }
            };
        }

        if (type === 'vector_shape') {
            newElement.w = 15;
            newElement.h = 15 * (PAGE_WIDTH_MM / PAGE_HEIGHT_MM);
            newElement.style.borderWidth = 1;
            newElement.style.borderColor = '#000000';
            newElement.style.backgroundColor = '#e0e7ff';
            newElement.style.shapeType = (styleOverride as any)?.shapeType || 'rectangle';
        }
        if (type === 'image') {
            newElement.w = 40; newElement.h = 30; newElement.x = 30; newElement.y = 35;
            newElement.style.borderWidth = 0;
            newElement.style.displayOn = 'all';
        }
    }
    
    if (type === 'holiday') setConfig(prev => ({ ...prev, includeHolidays: true }));
    if (type === 'moon') setConfig(prev => ({ ...prev, includeMoonPhases: true }));
    if (type === 'quote') setConfig(prev => ({ ...prev, includeQuotes: true }));

    updateActiveElements([...activeList, newElement]);
    setSelectedIds([newElement.id]);
    setVariantModal(null);
  };

  const openElementSelector = (type: ElementType, label: string) => {
      if (ELEMENT_VARIANTS[type]) {
          setVariantModal({ type, label });
      } else {
          addElement(type, label);
      }
  };

  const removeElement = (id?: string) => {
    const activeList = getActiveElements();
    let idsToRemove: string[] = [];
    if (id) {
        idsToRemove = selectedIds.includes(id) ? selectedIds : [id];
    } else {
        idsToRemove = selectedIds;
    }
    if (idsToRemove.length === 0) return;
    updateActiveElements(activeList.filter(e => !idsToRemove.includes(e.id)));
    setSelectedIds(selectedIds.filter(sid => !idsToRemove.includes(sid)));
    setContextMenu(null);
  };

  const groupSelected = () => {
    if (selectedIds.length < 2) return;
    const newGroupId = Math.random().toString(36).substr(2, 9);
    const activeList = getActiveElements();
    updateActiveElements(activeList.map(el => selectedIds.includes(el.id) ? { ...el, groupId: newGroupId } : el));
  };

  const ungroupSelected = () => {
    if (selectedIds.length === 0) return;
    const activeList = getActiveElements();
    // Se algum item selecionado tem um grupo, remove o groupId de TODOS os membros desse grupo na página
    const groupIdsToClear = new Set<string>();
    activeList.forEach(el => {
        if (selectedIds.includes(el.id) && el.groupId) {
            groupIdsToClear.add(el.groupId);
        }
    });

    if (groupIdsToClear.size === 0) return;

    updateActiveElements(activeList.map(el => el.groupId && groupIdsToClear.has(el.groupId) ? { ...el, groupId: undefined } : el));
  };

  const duplicateElement = (elementId?: string) => {
    const activeList = getActiveElements();
    let idsToDuplicate: string[] = [];
    if (elementId) {
        idsToDuplicate = selectedIds.includes(elementId) ? selectedIds : [elementId];
    } else {
        idsToDuplicate = selectedIds;
    }
    
    const elementsToDuplicate = activeList.filter(el => idsToDuplicate.includes(el.id));
    const newElements: LayoutElement[] = [];
    const groupMapping = new Map<string, string>();
    
    elementsToDuplicate.forEach(element => {
        const newId = Math.random().toString(36).substring(2, 11);
        let newGroupId = element.groupId;
        
        if (element.groupId) {
            if (!groupMapping.has(element.groupId)) {
                groupMapping.set(element.groupId, Math.random().toString(36).substring(2, 11));
            }
            newGroupId = groupMapping.get(element.groupId);
        }

        newElements.push({
            ...JSON.parse(JSON.stringify(element)),
            id: newId,
            groupId: newGroupId,
            name: `${element.name || element.type} (Cópia)`,
            x: Math.min(95, element.x + 2),
            y: Math.min(95, element.y + 2),
            zIndex: activeList.length + newElements.length + 1
        });
    });

    if (newElements.length === 0) return;

    updateActiveElements([...activeList, ...newElements]);
    setSelectedIds(newElements.map(el => el.id));
    setContextMenu(null);
  };

  useEffect(() => {
      duplicateElementRef.current = duplicateElement;
      removeElementRef.current = removeElement;
  });

  const moveLayer = (id: string, direction: 'up' | 'down' | 'top' | 'bottom') => {
      const activeList = getActiveElements();
      const index = activeList.findIndex(e => e.id === id);
      if (index === -1) return;
      
      let newElements = [...activeList];
      const element = newElements.splice(index, 1)[0];
      
      if (direction === 'up') {
          const newIndex = Math.min(index + 1, activeList.length - 1);
          newElements.splice(newIndex, 0, element);
      } else if (direction === 'down') {
          const newIndex = Math.max(index - 1, 0);
          newElements.splice(newIndex, 0, element);
      } else if (direction === 'top') {
          newElements.push(element);
      } else if (direction === 'bottom') {
          newElements.unshift(element);
      }
      
      const updatedElements = newElements.map((el, i) => ({ ...el, zIndex: i + 1 }));
      updateActiveElements(updatedElements);
      setContextMenu(null);
  };

  const updateMonthlyDividerStyle = (updates: Partial<NonNullable<typeof config.monthlyDividerStyle>>) => {
      setConfig(prev => ({
          ...prev,
          monthlyDividerStyle: {
              ...(prev.monthlyDividerStyle || {}),
              ...updates
          }
      }));
  };

  const convertPresetToCustomElements = () => {
      const style = config.monthlyDividerStyle || {};
      const layout = style.layout || 'classic';
      const textColor = style.textColor || '#312e81';
      const accentColor = style.accentColor || '#6366f1';
      const titleText = style.titleText || 'Planejamento Mensal';
      
      let elements: LayoutElement[] = [];
      
      if (layout === 'modern') {
          elements = [
              {
                  id: 'div_title_' + Date.now(),
                  type: 'text' as const,
                  content: titleText,
                  x: 12, y: 15, w: 76, h: 6, zIndex: 1,
                  style: { fontSize: 11, fontWeight: 'bold', textAlign: 'left' as const, color: accentColor, fontFamily: 'Inter', letterSpacing: 2 }
              },
              {
                  id: 'div_line1_' + Date.now(),
                  type: 'box' as const,
                  x: 12, y: 23, w: 12, h: 1, zIndex: 2,
                  style: { backgroundColor: accentColor, borderWidth: 0 }
              },
              {
                  id: 'div_month_' + Date.now(),
                  type: 'date_placeholder' as const,
                  content: '',
                  x: 12, y: 38, w: 76, h: 18, zIndex: 3,
                  style: { fontSize: 44, fontWeight: 'black', textAlign: 'left' as const, color: textColor, fontFamily: 'Inter', variant: 'month_name' }
              },
              {
                  id: 'div_year_' + Date.now(),
                  type: 'date_placeholder' as const,
                  content: '',
                  x: 12, y: 58, w: 76, h: 8, zIndex: 4,
                  style: { fontSize: 22, fontWeight: 'medium', textAlign: 'left' as const, color: accentColor, fontFamily: 'JetBrains Mono', variant: 'year' }
              }
          ];
      } else if (layout === 'minimalist') {
          elements = [
              {
                  id: 'div_title_' + Date.now(),
                  type: 'text' as const,
                  content: titleText,
                  x: 10, y: 20, w: 80, h: 6, zIndex: 1,
                  style: { fontSize: 10, fontWeight: 'medium', textAlign: 'center' as const, color: accentColor, fontFamily: 'Inter', letterSpacing: 4 }
              },
              {
                  id: 'div_month_' + Date.now(),
                  type: 'date_placeholder' as const,
                  content: '',
                  x: 10, y: 40, w: 80, h: 15, zIndex: 2,
                  style: { fontSize: 32, fontWeight: 'light', textAlign: 'center' as const, color: textColor, fontFamily: 'Inter', letterSpacing: 6, variant: 'month_name' }
              },
              {
                  id: 'div_year_' + Date.now(),
                  type: 'date_placeholder' as const,
                  content: '',
                  x: 10, y: 58, w: 80, h: 6, zIndex: 3,
                  style: { fontSize: 16, fontWeight: 'light', textAlign: 'center' as const, color: accentColor, fontFamily: 'Inter', letterSpacing: 4, variant: 'year' }
              }
          ];
      } else if (layout === 'geometric') {
          elements = [
              {
                  id: 'div_border_' + Date.now(),
                  type: 'box' as const,
                  x: 8, y: 8, w: 84, h: 84, zIndex: 1,
                  style: { backgroundColor: 'transparent', borderColor: accentColor + '30', borderWidth: 1 }
              },
              {
                  id: 'div_title_bg_' + Date.now(),
                  type: 'box' as const,
                  x: 20, y: 15, w: 60, h: 8, zIndex: 2,
                  style: { backgroundColor: '#f8fafc', borderColor: accentColor + '20', borderWidth: 1, borderRadius: 4 }
              },
              {
                  id: 'div_title_' + Date.now(),
                  type: 'text' as const,
                  content: titleText,
                  x: 22, y: 17, w: 56, h: 5, zIndex: 3,
                  style: { fontSize: 10, fontWeight: 'bold', textAlign: 'center' as const, color: accentColor, fontFamily: 'JetBrains Mono' }
              },
              {
                  id: 'div_month_' + Date.now(),
                  type: 'date_placeholder' as const,
                  content: '',
                  x: 12, y: 36, w: 76, h: 16, zIndex: 4,
                  style: { fontSize: 36, fontWeight: 'bold', textAlign: 'center' as const, color: textColor, fontFamily: 'serif', variant: 'month_name' }
              },
              {
                  id: 'div_year_' + Date.now(),
                  type: 'date_placeholder' as const,
                  content: '',
                  x: 35, y: 56, w: 30, h: 8, zIndex: 5,
                  style: { fontSize: 16, fontWeight: 'medium', textAlign: 'center' as const, color: accentColor, fontFamily: 'JetBrains Mono', variant: 'year' }
              }
          ];
      } else { // classic / default
          elements = [
              {
                  id: 'div_title_' + Date.now(),
                  type: 'text' as const,
                  content: titleText,
                  x: 10, y: 20, w: 80, h: 6, zIndex: 1,
                  style: { fontSize: 12, fontWeight: 'bold', textAlign: 'center' as const, color: accentColor, fontFamily: 'Inter', letterSpacing: 3 }
              },
              {
                  id: 'div_line_' + Date.now(),
                  type: 'box' as const,
                  x: 42, y: 29, w: 16, h: 0.5, zIndex: 2,
                  style: { backgroundColor: accentColor + '80', borderWidth: 0 }
              },
              {
                  id: 'div_month_' + Date.now(),
                  type: 'date_placeholder' as const,
                  content: '',
                  x: 10, y: 38, w: 80, h: 18, zIndex: 3,
                  style: { fontSize: 44, fontWeight: 'normal', fontStyle: 'italic', textAlign: 'center' as const, color: textColor, fontFamily: 'serif', variant: 'month_name' }
              },
              {
                  id: 'div_year_' + Date.now(),
                  type: 'date_placeholder' as const,
                  content: '',
                  x: 10, y: 60, w: 80, h: 8, zIndex: 4,
                  style: { fontSize: 18, fontWeight: 'light', textAlign: 'center' as const, color: '#9ca3af', fontFamily: 'Inter', variant: 'year' }
              }
          ];
      }
      
      setConfig(prev => ({
          ...prev,
          monthlyDividerStyle: {
              ...(prev.monthlyDividerStyle || {}),
              layout: 'custom',
              elements: elements
          }
      }));
  };

  const updateElementStyle = (id: string, styleUpdate: any, silent = false) => {
    const activeList = getActiveElements();
    const currentPageHeight = getCurrentPageHeight();
    updateActiveElements(activeList.map(e => {
        if (e.id !== id) return e;
        
        const newStyle = { ...e.style, ...styleUpdate };
        let newH = e.h;
        
        if (e.type === 'lines') {
            if (newStyle.showTimes) {
                const startH = newStyle.startHour !== undefined ? newStyle.startHour : 7;
                const endH = newStyle.endHour !== undefined ? newStyle.endHour : 18;
                const intervalM = newStyle.timeInterval || 60;
                const startMin = startH * 60;
                const endMin = endH * 60;
                let tCount = 0;
                for (let min = startMin; min <= endMin; min += intervalM) {
                    tCount++;
                }
                const count = Math.max(1, tCount);
                newH = ((count * newStyle.lineSpacing + 1) / currentPageHeight) * 100;
            } else if (styleUpdate.lineSpacing !== undefined) {
                const heightPx = (e.h / 100 * currentPageHeight);
                const lineCount = Math.max(1, Math.floor((heightPx - 1) / newStyle.lineSpacing));
                newH = ((lineCount * newStyle.lineSpacing + 1) / currentPageHeight) * 100;
            }
        } else if (e.type === 'habit_tracker' && (styleUpdate.habitMarkerSize !== undefined || styleUpdate.habitSpacing !== undefined || styleUpdate.habitShowLabel !== undefined || styleUpdate.fontSize !== undefined)) {
            const heightPx = (e.h / 100 * currentPageHeight);
            const rowHeight = (newStyle.habitMarkerSize || 16) + (newStyle.habitSpacing || 4);
            const labelHeight = newStyle.habitShowLabel ? (newStyle.fontSize || 14) * 1.5 : 0;
            const availableHeight = heightPx - labelHeight;
            const habitCount = Math.max(1, Math.floor((availableHeight - 1) / rowHeight));
            newH = (((habitCount * rowHeight) + labelHeight + 1) / currentPageHeight) * 100;
        }
        
        return { ...e, style: newStyle, h: newH };
    }), silent);
  };

  const updateElementContent = (id: string, content: string) => {
    const activeList = getActiveElements();
    updateActiveElements(activeList.map(e => e.id === id ? { ...e, content } : e));
  };

  const updateTableConfig = (id: string, tableUpdate: any) => {
      const activeList = getActiveElements();
      const element = activeList.find(e => e.id === id);
      if (!element || !element.style.table) return;
      
      let newTableStyle = { ...element.style.table, ...tableUpdate };
      let newH = element.h;
      
      if (tableUpdate.cols) {
          const newCols = tableUpdate.cols;
          const oldCols = element.style.table.cols;
          if (newCols > oldCols) {
              const baseWidth = 100 / newCols;
              newTableStyle.columnWidths = Array(newCols).fill(baseWidth);
          } else if (newCols < oldCols) {
              newTableStyle.columnWidths = (newTableStyle.columnWidths || Array(oldCols).fill(100/oldCols)).slice(0, newCols);
          }
      }

      if (tableUpdate.rows) {
          const newRows = tableUpdate.rows;
          const oldRows = element.style.table.rows;
          if (newRows !== oldRows || !newTableStyle.rowHeights) {
              newTableStyle.rowHeights = Array(newRows).fill(100 / newRows);
          }
      }

      // If rowHeight is set, automatically adjust the element height to fit all rows exactly
      if (newTableStyle.rowHeight && (tableUpdate.rows !== undefined || tableUpdate.rowHeight !== undefined)) {
          const totalHeightPx = newTableStyle.rows * newTableStyle.rowHeight;
          const currentPageHeight = getCurrentPageHeight();
          newH = (totalHeightPx / currentPageHeight) * 100;
      }

      const updatedElement = { 
          ...element, 
          h: newH,
          style: { ...element.style, table: newTableStyle } 
      };
      
      updateActiveElements(activeList.map(e => e.id === id ? updatedElement : e));
  }

  const addTableRow = (id: string, index: number, position: 'before' | 'after') => {
    const activeList = getActiveElements();
    const element = activeList.find(e => e.id === id);
    if (!element || !element.style.table) return;

    const table = element.style.table;
    const insertAt = position === 'before' ? index : index + 1;
    
    const newRows = table.rows + 1;
    const newCellContent: Record<string, string> = {};
    
    // Shift contents
    Object.entries(table.cellContent || {}).forEach(([key, value]) => {
      const cellValue = value as string;
      const [r, c] = key.split('-').map(Number);
      if (r >= insertAt) {
        newCellContent[`${r + 1}-${c}`] = cellValue;
      } else {
        newCellContent[`${r}-${c}`] = cellValue;
      }
    });

    const newRowStyles: Record<number, TextStyleConfig> = {};
    Object.entries(table.rowStyles || {}).forEach(([key, value]) => {
      const r = Number(key);
      if (r >= insertAt) {
        newRowStyles[r + 1] = value;
      } else {
        newRowStyles[r] = value;
      }
    });

    const newRowHeights = [...(table.rowHeights || Array(table.rows).fill(100/table.rows))];
    newRowHeights.splice(insertAt, 0, 100 / newRows);
    
    updateTableConfig(id, {
      rows: newRows,
      cellContent: newCellContent,
      rowStyles: newRowStyles,
      rowHeights: newRowHeights.map(() => 100 / newRows) // Re-distribute for now or keep proportional
    });
  };

  const deleteTableRow = (id: string, index: number) => {
    const activeList = getActiveElements();
    const element = activeList.find(e => e.id === id);
    if (!element || !element.style.table || element.style.table.rows <= 1) return;

    const table = element.style.table;
    const newRows = table.rows - 1;
    const newCellContent: Record<string, string> = {};
    
    Object.entries(table.cellContent || {}).forEach(([key, value]) => {
      const cellValue = value as string;
      const [r, c] = key.split('-').map(Number);
      if (r === index) return;
      if (r > index) {
        newCellContent[`${r - 1}-${c}`] = cellValue;
      } else {
        newCellContent[`${r}-${c}`] = cellValue;
      }
    });

    const newRowStyles: Record<number, TextStyleConfig> = {};
    Object.entries(table.rowStyles || {}).forEach(([key, value]) => {
      const r = Number(key);
      if (r === index) return;
      if (r > index) {
        newRowStyles[r - 1] = value;
      } else {
        newRowStyles[r] = value;
      }
    });

    const newRowHeights = [...(table.rowHeights || Array(table.rows).fill(100/table.rows))];
    newRowHeights.splice(index, 1);

    updateTableConfig(id, {
      rows: newRows,
      cellContent: newCellContent,
      rowStyles: newRowStyles,
      rowHeights: newRowHeights.map(() => 100 / newRows)
    });
    
    if (activeTableCell && activeTableCell.r >= newRows) {
        setActiveTableCell(null);
    }
  };

  const addTableColumn = (id: string, index: number, position: 'before' | 'after') => {
    const activeList = getActiveElements();
    const element = activeList.find(e => e.id === id);
    if (!element || !element.style.table) return;

    const table = element.style.table;
    const insertAt = position === 'before' ? index : index + 1;
    const newCols = table.cols + 1;
    
    const newCellContent: Record<string, string> = {};
    Object.entries(table.cellContent || {}).forEach(([key, value]) => {
      const cellValue = value as string;
      const [r, c] = key.split('-').map(Number);
      if (c >= insertAt) {
        newCellContent[`${r}-${c + 1}`] = cellValue;
      } else {
        newCellContent[`${r}-${c}`] = cellValue;
      }
    });

    const newColStyles: Record<number, TextStyleConfig> = {};
    Object.entries(table.colStyles || {}).forEach(([key, value]) => {
      const c = Number(key);
      if (c >= insertAt) {
        newColStyles[c + 1] = value;
      } else {
        newColStyles[c] = value;
      }
    });

    const newColumnWidths = [...(table.columnWidths || Array(table.cols).fill(100/table.cols))];
    newColumnWidths.splice(insertAt, 0, 100 / newCols);

    updateTableConfig(id, {
      cols: newCols,
      cellContent: newCellContent,
      colStyles: newColStyles,
      columnWidths: newColumnWidths.map(() => 100 / newCols)
    });
  };

  const deleteTableColumn = (id: string, index: number) => {
    const activeList = getActiveElements();
    const element = activeList.find(e => e.id === id);
    if (!element || !element.style.table || element.style.table.cols <= 1) return;

    const table = element.style.table;
    const newCols = table.cols - 1;
    const newCellContent: Record<string, string> = {};
    
    Object.entries(table.cellContent || {}).forEach(([key, value]) => {
      const cellValue = value as string;
      const [r, c] = key.split('-').map(Number);
      if (c === index) return;
      if (c > index) {
        newCellContent[`${r}-${c - 1}`] = cellValue;
      } else {
        newCellContent[`${r}-${c}`] = cellValue;
      }
    });

    const newColStyles: Record<number, TextStyleConfig> = {};
    Object.entries(table.colStyles || {}).forEach(([key, value]) => {
      const c = Number(key);
      if (c === index) return;
      if (c > index) {
        newColStyles[c - 1] = value;
      } else {
        newColStyles[c] = value;
      }
    });

    const newColumnWidths = [...(table.columnWidths || Array(table.cols).fill(100/table.cols))];
    newColumnWidths.splice(index, 1);

    updateTableConfig(id, {
      cols: newCols,
      cellContent: newCellContent,
      colStyles: newColStyles,
      columnWidths: newColumnWidths.map(() => 100 / newCols)
    });
    
    if (activeTableCell && activeTableCell.c >= newCols) {
        setActiveTableCell(null);
    }
  };

  const toggleTableBorder = (borderKey: keyof NonNullable<Required<LayoutElement['style']['table']>['borders']>) => {
      const activeList = getActiveElements();
      const selectedElement = activeList.find(e => e.id === selectedId);
      if (!selectedElement || !selectedElement.style.table) return;

      const currentBorders = selectedElement.style.table.borders || { 
          top: true, bottom: true, left: true, right: true, 
          insideHorizontal: true, insideVertical: true, headerSeparator: true 
      };
      updateTableConfig(selectedElement.id, { 
          borders: { ...currentBorders, [borderKey]: !currentBorders[borderKey] } 
      });
  };

  const updateTableCell = (id: string, rowIndex: number, colIndex: number, text: string) => {
      const activeList = getActiveElements();
      const element = activeList.find(e => e.id === id);
      if (!element || !element.style.table) return;
      
      const key = `${rowIndex}-${colIndex}`;
      const newContent = { ...(element.style.table.cellContent || {}), [key]: text };
      
      updateElementStyle(id, { table: { ...element.style.table, cellContent: newContent } });
  }

  const handleTableColumnResizeStart = (e: React.MouseEvent, elementId: string, colIndex: number) => {
      e.stopPropagation();
      e.preventDefault();
      pushHistory();
      setSelectedIds([elementId]);
      setResizingTableCol({ elementId, colIndex });
      dragRef.current = { startX: e.clientX, startY: e.clientY };
  }

  const handleTableRowResizeStart = (e: React.MouseEvent, elementId: string, rowIndex: number) => {
      e.stopPropagation();
      e.preventDefault();
      pushHistory();
      setSelectedIds([elementId]);
      setResizingTableRow({ elementId, rowIndex });
      dragRef.current = { startX: e.clientX, startY: e.clientY };
  }

  const handleTableCellFocus = (elementId: string, r: number, c: number) => {
      if (!selectedIds.includes(elementId)) setSelectedIds([elementId]);
      setActiveTableCell({ elementId, r, c });
  }

  const updateFullCalendarStyle = (id: string, section: 'title' | 'weekDays' | 'days' | 'highlight', styleUpdate: Partial<TextStyleConfig>) => {
      const activeList = getActiveElements();
      const element = activeList.find(e => e.id === id);
      if(!element) return;

      const currentFullCalendar = (element.style.fullCalendar || {}) as any;

      if (section === 'highlight') {
          const newSpecialDays = {
              ...currentFullCalendar.specialDays,
              style: { ...currentFullCalendar.specialDays?.style, ...styleUpdate }
          };
          updateElementStyle(id, { fullCalendar: { ...currentFullCalendar, specialDays: newSpecialDays } });
          return;
      }

      const newFullCalendar = {
          ...currentFullCalendar,
          [section]: { ...currentFullCalendar[section], ...styleUpdate }
      };
      updateElementStyle(id, { fullCalendar: newFullCalendar });
  };

  const updateElementName = (id: string, name: string) => {
    const activeList = getActiveElements();
    updateActiveElements(activeList.map(e => e.id === id ? { ...e, name } : e));
  };

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  useEffect(() => {
    const isWeekly = (config.layoutType === 'weekly_vertical' || config.layoutType === 'weekly_horizontal');
    const isTwoPerPage = config.layoutType === '2_per_page';
    const isSharedWeekend = config.layoutType === '1_per_page_weekend_shared';

    if (isWeekly && (!config.elementsWeeklyLeft || config.elementsWeeklyLeft.length === 0 || !config.elementsWeeklyRight || config.elementsWeeklyRight.length === 0)) {
        setConfig(prev => ({
            ...prev,
            elementsWeeklyLeft: (prev.elementsWeeklyLeft && prev.elementsWeeklyLeft.length > 0) ? prev.elementsWeeklyLeft : prev.elements.map(el => ({ ...el, id: Math.random().toString(36).substr(2, 9) })),
            elementsWeeklyRight: (prev.elementsWeeklyRight && prev.elementsWeeklyRight.length > 0) ? prev.elementsWeeklyRight : prev.elements.map(el => ({ ...el, id: Math.random().toString(36).substr(2, 9) }))
        }));
    }

    if (isTwoPerPage && (!config.elementsTop || config.elementsTop.length === 0 || !config.elementsBottom || config.elementsBottom.length === 0)) {
        setConfig(prev => ({
            ...prev,
            elementsTop: (prev.elementsTop && prev.elementsTop.length > 0) ? prev.elementsTop : prev.elements.map(el => ({ ...el, id: Math.random().toString(36).substr(2, 9) })),
            elementsBottom: (prev.elementsBottom && prev.elementsBottom.length > 0) ? prev.elementsBottom : prev.elements.map(el => ({ ...el, id: Math.random().toString(36).substr(2, 9) }))
        }));
    }

    if (isSharedWeekend && (!config.elementsSaturday || config.elementsSaturday.length === 0 || !config.elementsSunday || config.elementsSunday.length === 0)) {
        setConfig(prev => ({
            ...prev,
            elementsSaturday: (prev.elementsSaturday && prev.elementsSaturday.length > 0) ? prev.elementsSaturday : prev.elements.map(el => ({ ...el, id: Math.random().toString(36).substr(2, 9) })),
            elementsSunday: (prev.elementsSunday && prev.elementsSunday.length > 0) ? prev.elementsSunday : prev.elements.map(el => ({ ...el, id: Math.random().toString(36).substr(2, 9) }))
        }));
    }
  }, [config.layoutType]);

  const handleInteractionStart = (e: React.MouseEvent, id: string, dir: string | null = null, templateType?: 'standard' | 'saturday' | 'sunday' | 'top' | 'bottom' | 'intro' | 'weekly_left' | 'weekly_right', introPageId?: string) => {
    window.focus();
    if (templateType === 'intro' && introPageId) {
        if (introPageId === 'divider') {
            setEditMode('divider');
        } else if (config.monthlyIntroPages?.some(p => p.id === introPageId)) {
            setEditMode('monthly_intro');
            setCurrentMonthlyIntroPageId(introPageId);
        } else {
            setEditMode('intro');
            setCurrentIntroPageId(introPageId);
        }
    } else if (templateType && templateType !== 'intro') {
        setEditMode('daily');
        setEditorViewMode(templateType);
    }

    if (activeTab === 'preview') {
        setActiveTab('editor');
        setSelectedIds([id]);
        return;
    }
    
    e.stopPropagation();
    
    let activeList = getActiveElements();
    let element = activeList.find(el => el.id === id);
    
    if (!element && templateType) {
        if (templateType === 'weekly_left') activeList = config.elementsWeeklyLeft || config.elements;
        else if (templateType === 'weekly_right') activeList = config.elementsWeeklyRight || config.elements;
        else if (templateType === 'saturday') activeList = config.elementsSaturday || config.elements;
        else if (templateType === 'sunday') activeList = config.elementsSunday || config.elements;
        else if (templateType === 'top') activeList = config.elementsTop || config.elements;
        else if (templateType === 'bottom') activeList = config.elementsBottom || config.elements;
        
        element = activeList.find(el => el.id === id);
    }

    if (!element) return;
    
    pushHistory();
    
    // Multi-selection logic with Shift
    let newSelectedIds = [...selectedIds];
    const isAlreadySelected = selectedIds.includes(id);

    if (e.shiftKey) {
        if (isAlreadySelected) {
            newSelectedIds = newSelectedIds.filter(sid => sid !== id);
        } else {
            newSelectedIds.push(id);
        }
    } else if (!isAlreadySelected) {
        // If part of a group, select the whole group
        if (element.groupId) {
            newSelectedIds = activeList.filter(el => el.groupId === element.groupId).map(el => el.id);
        } else {
            newSelectedIds = [id];
        }
    }

    // Ensure all items in a group are selected if any of them is selected (logical requirement for groups)
    const groupsInSelection = new Set<string>();
    activeList.forEach(el => {
        if (newSelectedIds.includes(el.id) && el.groupId) groupsInSelection.add(el.groupId);
    });
    if (groupsInSelection.size > 0) {
        activeList.forEach(el => {
            if (el.groupId && groupsInSelection.has(el.groupId) && !newSelectedIds.includes(el.id)) {
                newSelectedIds.push(el.id);
            }
        });
    }

    setSelectedIds(newSelectedIds);
    
    // Preparation for dragging multiple elements
    const selectedElements = activeList.filter(el => newSelectedIds.includes(el.id));
    
    dragRef.current = { 
        ids: newSelectedIds,
        startX: e.clientX, 
        startY: e.clientY,
        initialStates: selectedElements.map(el => ({
            id: el.id,
            x: el.x, y: el.y, w: el.w, h: el.h,
            fontSize: el.style.fontSize || 12,
            tableFontSize: el.style.table?.textStyle?.fontSize || 10,
            calendarFontSizes: el.style.fullCalendar ? {
                title: el.style.fullCalendar.title?.fontSize || 12,
                weekDays: el.style.fullCalendar.weekDays?.fontSize || 8,
                days: el.style.fullCalendar.days?.fontSize || 10,
                specialDays: el.style.fullCalendar.specialDays?.style?.fontSize || 10
            } : null
        })),
        // For resizing, we usually only resize one at a time unless we implement a complex group resize
        initialX: element.x, 
        initialY: element.y, 
        initialW: element.w, 
        initialH: element.h
    };
    
    if (dir) setResizeDir(dir); else setIsDragging(true);
  };

  const handleMouseMove = (e: MouseEvent | React.MouseEvent) => {
    if (!editorRef.current) return;
    
    lastMouseEvent.current = { clientX: e.clientX, clientY: e.clientY };
    
    if (requestRef.current) return;
    
    requestRef.current = requestAnimationFrame(() => {
        requestRef.current = null;
        if (!lastMouseEvent.current || !editorRef.current) return;
        const { clientX, clientY } = lastMouseEvent.current;

        if (marquee && marqueeRef.current) {
            const rect = editorRef.current.getBoundingClientRect();
            const x2 = ((clientX - rect.left) / rect.width) * 100;
            const y2 = ((clientY - rect.top) / rect.height) * 100;
            setMarquee(prev => prev ? { ...prev, x2, y2 } : null);
            return;
        }

        if (resizingTableRow && dragRef.current) {
            const { elementId, rowIndex } = resizingTableRow;
            const activeList = getActiveElements();
            const element = activeList.find(el => el.id === elementId);
            
            if (element && element.style.table) {
                const rows = element.style.table.rows;
                const currentHeights = [...(element.style.table.rowHeights || Array(rows).fill(100 / rows))];
                
                const tableHeightPx = (element.h / 100) * EDITOR_HEIGHT_PX;
                const deltaY = (clientY - dragRef.current.startY) / (responsiveScale || 1);
                const deltaPercent = (deltaY / tableHeightPx) * 100;
                
                const nextRowIndex = rowIndex + 1;
                
                if (nextRowIndex < currentHeights.length) {
                    const newCurrentRowHeight = Math.max(2, currentHeights[rowIndex] + deltaPercent);
                    const newNextRowHeight = Math.max(2, currentHeights[nextRowIndex] - deltaPercent);
                    
                    if (newCurrentRowHeight >= 2 && newNextRowHeight >= 2) {
                        currentHeights[rowIndex] = newCurrentRowHeight;
                        currentHeights[nextRowIndex] = newNextRowHeight;
                        const total = currentHeights.reduce((a, b) => a + b, 0);
                        const normalized = currentHeights.map(h => (h / total) * 100);
                        updateElementStyle(elementId, { table: { ...element.style.table, rowHeights: normalized } }, true);
                        dragRef.current.startY = clientY;
                    }
                }
            }
            return;
        }

        if (resizingTableCol && dragRef.current) {
            const { elementId, colIndex } = resizingTableCol;
            const activeList = getActiveElements();
            const element = activeList.find(el => el.id === elementId);
            
            if (element && element.style.table && element.style.table.columnWidths) {
                const tableWidthPx = (element.w / 100) * EDITOR_WIDTH_PX;
                const deltaX = (clientX - dragRef.current.startX) / (responsiveScale || 1);
                const deltaPercent = (deltaX / tableWidthPx) * 100;
                
                const currentWidths = [...element.style.table.columnWidths];
                const nextColIndex = colIndex + 1;
                
                if (nextColIndex < currentWidths.length) {
                    const newCurrentColWidth = Math.max(5, currentWidths[colIndex] + deltaPercent);
                    const newNextColWidth = Math.max(5, currentWidths[nextColIndex] - deltaPercent);
                    
                    if (newCurrentColWidth >= 5 && newNextColWidth >= 5) {
                        currentWidths[colIndex] = newCurrentColWidth;
                        currentWidths[nextColIndex] = newNextColWidth;
                        const total = currentWidths.reduce((a, b) => a + b, 0);
                        const normalized = currentWidths.map(w => (w / total) * 100);
                        updateElementStyle(elementId, { table: { ...element.style.table, columnWidths: normalized } }, true);
                        dragRef.current.startX = clientX;
                    }
                }
            }
            return;
        }

        if ((!isDragging && !resizeDir) || !dragRef.current) return;
        
        const dragIds = dragRef.current.ids || [selectedId];
        if (!dragIds || dragIds.length === 0) return;

        const editorRect = editorRef.current.getBoundingClientRect();
        const deltaX = clientX - dragRef.current.startX;
        const deltaY = clientY - dragRef.current.startY;
        
        const activeList = getActiveElements();
        
        if (isDragging) {
            // Multi-move
            let guidesToSet: SnapGuide[] = [];
            const movedElementsMap = new Map<string, {x: number, y: number}>();
            
            dragRef.current.initialStates.forEach((initial: any, idx: number) => {
                const { x, y, guides } = calculateDragPosition(
                    deltaX, deltaY, 
                    initial.x, initial.y, initial.w, initial.h,
                    editorRect.width, editorRect.height,
                    activeList.filter(el => !dragIds.includes(el.id)),
                    idx === 0 // Only first element generates guides to avoid mess
                );
                movedElementsMap.set(initial.id, { x, y });
                if (idx === 0 && guides) guidesToSet = guides;
            });

            const updatedList = activeList.map(el => {
                const moved = movedElementsMap.get(el.id);
                return moved ? { ...el, x: moved.x, y: moved.y } : el;
            });

            updateActiveElements(updatedList, true);
            setActiveGuides(guidesToSet);
        } else if (resizeDir && dragIds.length === 1) {
            const currentId = dragIds[0];
            const element = activeList.find(el => el.id === currentId);
            if (!element) return;
            const initial = dragRef.current.initialStates.find((s: any) => s.id === currentId);

            const { x, y, w, h } = calculateResize(deltaX, deltaY, initial.x, initial.y, initial.w, initial.h, editorRect.width, editorRect.height, resizeDir);
            
            let finalH = h;
            let finalW = w;
            let finalX = x;
            let finalY = y;
            
            let newElementConfig = { ...element, x, y, w, h };

            const unscaledEditorHeight = EDITOR_HEIGHT_PX;
            const unscaledEditorWidth = EDITOR_WIDTH_PX;

            if (element.type === 'circle') {
                if (resizeDir.includes('n') || resizeDir.includes('s')) {
                    finalW = h * (unscaledEditorHeight / unscaledEditorWidth);
                } else {
                    finalH = w * (unscaledEditorWidth / unscaledEditorHeight);
                }
            } else if (element.type === 'lines') {
                const heightPx = (h / 100 * unscaledEditorHeight);
                const spacing = element.style.lineSpacing || 24;
                const lineCount = Math.max(1, Math.floor((heightPx - 1) / spacing));
                finalH = ((lineCount * spacing + 1) / unscaledEditorHeight) * 100;
            } else if (element.type === 'habit_tracker') {
                const heightPx = (h / 100 * unscaledEditorHeight);
                const rowHeight = (element.style.habitMarkerSize || 16) + (element.style.habitSpacing || 4);
                const labelHeight = element.style.habitShowLabel ? (element.style.fontSize || 14) * 1.5 : 0;
                const availableHeight = heightPx - labelHeight;
                const habitCount = Math.max(1, Math.floor((availableHeight - 1) / rowHeight));
                finalH = (((habitCount * rowHeight) + labelHeight + 1) / unscaledEditorHeight) * 100;
            } else if (element.type === 'table' && element.style.table?.rowHeight) {
                const heightPx = (h / 100 * unscaledEditorHeight);
                const rows = element.style.table.rows;
                const newRowHeight = Math.max(5, Math.round(heightPx / rows));
                newElementConfig.style = { 
                    ...newElementConfig.style, 
                    table: { ...newElementConfig.style.table, rowHeight: newRowHeight } 
                };
                finalH = ((newRowHeight * rows) / unscaledEditorHeight) * 100;
            }

            newElementConfig.x = finalX; newElementConfig.y = finalY; newElementConfig.w = finalW; newElementConfig.h = finalH;

            const textTypes = ['text', 'quote', 'holiday', 'holiday_list', 'day_number', 'month_name', 'month_number', 'day_name', 'year', 'verse'];
            const scale = h / initial.h;

            if (textTypes.includes(element.type) && initial.fontSize) {
                const newFontSize = Math.max(4, Math.round(initial.fontSize * scale));
                newElementConfig.style = { ...newElementConfig.style, fontSize: newFontSize };
            } else if (element.type === 'table' && initial.tableFontSize) {
                const newFontSize = Math.max(4, Math.round(initial.tableFontSize * scale));
                newElementConfig.style = { 
                    ...newElementConfig.style, 
                    table: { 
                        ...newElementConfig.style.table, 
                        textStyle: { ...newElementConfig.style.table?.textStyle, fontSize: newFontSize } 
                    } 
                };
            } else if (element.type === 'full_calendar' && initial.calendarFontSizes) {
                const { title, weekDays, days, specialDays } = initial.calendarFontSizes;
                newElementConfig.style = { 
                    ...newElementConfig.style, 
                    fullCalendar: { 
                        ...newElementConfig.style.fullCalendar,
                        title: { ...newElementConfig.style.fullCalendar?.title, fontSize: Math.max(4, Math.round(title * scale)) },
                        weekDays: { ...newElementConfig.style.fullCalendar?.weekDays, fontSize: Math.max(4, Math.round(weekDays * scale)) },
                        days: { ...newElementConfig.style.fullCalendar?.days, fontSize: Math.max(4, Math.round(days * scale)) },
                        specialDays: { 
                            ...newElementConfig.style.fullCalendar?.specialDays, 
                            style: { ...newElementConfig.style.fullCalendar?.specialDays?.style, fontSize: Math.max(4, Math.round(specialDays * scale)) } 
                        }
                    } 
                };
            }
            updateActiveElements(activeList.map(el => el.id === currentId ? newElementConfig : el), true);
        }
    });
  };

  const handleMouseUp = (e?: MouseEvent | React.MouseEvent) => { 
      if (requestRef.current) {
          cancelAnimationFrame(requestRef.current);
          requestRef.current = null;
      }

      if (marquee && editorRef.current) {
          const xStart = Math.min(marquee.x1, marquee.x2);
          const xEnd = Math.max(marquee.x1, marquee.x2);
          const yStart = Math.min(marquee.y1, marquee.y2);
          const yEnd = Math.max(marquee.y1, marquee.y2);
          
          const activeList = getActiveElements();
          const newlySelected = activeList.filter(el => {
              const elX2 = el.x + el.w;
              const elY2 = el.y + el.h;
              return el.x < xEnd && elX2 > xStart && el.y < yEnd && elY2 > yStart;
          }).map(el => el.id);

          if (e && e.shiftKey) {
              setSelectedIds(prev => {
                  const union = new Set([...prev, ...newlySelected]);
                  return Array.from(union);
              });
          } else {
              setSelectedIds(newlySelected);
          }
          setMarquee(null);
          marqueeRef.current = null;
      }

      setIsDragging(false); 
      setResizeDir(null); 
      setResizingTableCol(null);
      setResizingTableRow(null);
      dragRef.current = null; 
      setActiveGuides([]);
  };

  const handleMouseMoveRef = useRef(handleMouseMove);
  const handleMouseUpRef = useRef(handleMouseUp);
  
  useEffect(() => {
    handleMouseMoveRef.current = handleMouseMove;
    handleMouseUpRef.current = handleMouseUp;
  });

  useEffect(() => {
    if (isDragging || resizeDir || resizingTableCol || resizingTableRow || marquee) {
      const onGlobalMouseMove = (e: MouseEvent) => {
        handleMouseMoveRef.current(e);
      };
      const onGlobalMouseUp = (e: MouseEvent) => {
        handleMouseUpRef.current(e);
      };
      
      window.addEventListener('mousemove', onGlobalMouseMove);
      window.addEventListener('mouseup', onGlobalMouseUp);
      return () => {
        window.removeEventListener('mousemove', onGlobalMouseMove);
        window.removeEventListener('mouseup', onGlobalMouseUp);
      };
    }
  }, [isDragging, resizeDir, resizingTableCol, resizingTableRow, marquee]);

  const renderResizeHandle = (cursor: string, dir: string) => {
      const pos: React.CSSProperties = { position: 'absolute', width: '8px', height: '8px', backgroundColor: 'white', border: '1px solid #4f46e5', borderRadius: '50%', zIndex: 50 };
      switch(dir) {
          case 'nw': pos.top = '-4px'; pos.left = '-4px'; break;
          case 'n':  pos.top = '-4px'; pos.left = '50%'; pos.transform = 'translateX(-50%)'; break;
          case 'ne': pos.top = '-4px'; pos.right = '-4px'; break;
          case 'e':  pos.top = '50%'; pos.right = '-4px'; pos.transform = 'translateY(-50%)'; break;
          case 'se': pos.bottom = '-4px'; pos.right = '-4px'; break;
          case 's':  pos.bottom = '-4px'; pos.left = '50%'; pos.transform = 'translateX(-50%)'; break;
          case 'sw': pos.bottom = '-4px'; pos.left = '-4px'; break;
          case 'w':  pos.top = '50%'; pos.left = '-4px'; pos.transform = 'translateY(-50%)'; break;
      }
      return <div key={dir} className="no-print" style={{ ...pos, cursor }} onMouseDown={(e) => handleInteractionStart(e, selectedId!, dir)} />;
  }

  const getGlobalCalendarStyle = useCallback(() => {
    for (const page of config.introPages) {
        const calendarEl = page.elements.find(el => el.type === 'full_calendar');
        if (calendarEl && calendarEl.style.fullCalendar) {
            return calendarEl.style.fullCalendar;
        }
    }
    if (config.monthlyIntroPages) {
        for (const page of config.monthlyIntroPages) {
            const calendarEl = page.elements.find(el => el.type === 'full_calendar');
            if (calendarEl && calendarEl.style.fullCalendar) {
                return calendarEl.style.fullCalendar;
            }
        }
    }
    return undefined;
  }, [config.introPages, config.monthlyIntroPages]);

  const renderTemplate = (
    elements: LayoutElement[], 
    day: DayData | null, 
    isEditor: boolean = false, 
    attachRef: boolean = false, 
    pageNumber?: number, 
    pageWidth: number = 800, 
    pageHeight: number = 600,
    templateType?: 'standard' | 'saturday' | 'sunday' | 'top' | 'bottom' | 'intro' | 'weekly_left' | 'weekly_right',
    introPageId?: string,
    weekDays?: DayData[]
  ) => {
    const d = day || (weekDays && weekDays[0]) || { dayOfMonth: 24, month: 10, year: config.year, dayOfWeek: 3, holiday: 'Confraternização Universal', moonPhase: 'Lua cheia', date: new Date() } as DayData;
    const globalStyle = getGlobalCalendarStyle();
    
    // Obter índices calculados (auto ou explícitos)
    const effectiveIndices = getEffectiveDayIndices(elements);
    const elementsWithIndices = elements.map(el => {
        let finalStyle = {
            ...el.style,
            dayIndex: effectiveIndices[el.id] ?? el.style.dayIndex ?? 0
        };

        if ((el.type === 'mini_calendar' || el.type === 'full_calendar') && config.monthlyIntroPages) {
            let introIdToUse = introPageId;
            if (!introIdToUse && isEditor && editMode === 'monthly_intro') {
                introIdToUse = currentMonthlyIntroPageId || undefined;
            }
            if (introIdToUse) {
                const currentIdx = config.monthlyIntroPages.findIndex(p => p.id === introIdToUse);
                if (currentIdx !== -1 && currentIdx % 2 !== 0) { // Right page in spread (index 1, 3, etc.)
                    const prevPage = config.monthlyIntroPages[currentIdx - 1];
                    const prevCalendar = prevPage?.elements.find(e => e.type === el.type);
                    if (prevCalendar?.style.fullCalendar?.splitMode === 'left') {
                        finalStyle = {
                            ...prevCalendar.style,
                            dayIndex: finalStyle.dayIndex, // Preserve own day index
                            fullCalendar: {
                                ...prevCalendar.style.fullCalendar,
                                splitMode: 'right' // Force splitMode to right to complement
                            }
                        };
                    }
                }
            }
        }

        return {
            ...el,
            style: finalStyle
        };
    });

    const getDayOfYear = (date: Date) => {
        const start = new Date(date.getFullYear(), 0, 0);
        const diff = date.getTime() - start.getTime();
        const oneDay = 1000 * 60 * 60 * 24;
        return Math.floor(diff / oneDay);
    };
    
    const dayOfYear = d.date ? getDayOfYear(new Date(d.date)) : 0;
    const currentVerse = getVerseForDay(dayOfYear);

    const handleContextMenu = (e: React.MouseEvent, elementId: string) => {
        if (!isEditor && activeTab !== 'preview') return;
        e.preventDefault();
        e.stopPropagation();
        
        if (activeTab === 'preview') {
            handleInteractionStart(e, elementId, null, templateType, introPageId);
            return;
        }

        // If clicked element is not in current selection, update selection
        if (!selectedIds.includes(elementId)) {
            const activeList = getActiveElements();
            const element = activeList.find(el => el.id === elementId);
            if (element && element.groupId) {
                setSelectedIds(activeList.filter(el => el.groupId === element.groupId).map(el => el.id));
            } else {
                setSelectedIds([elementId]);
            }
        }

        setContextMenu({ x: e.clientX, y: e.clientY, elementId });
    };

    return (
      <div 
        ref={attachRef ? editorRef : null} 
        className={`relative overflow-visible ${isEditor ? 'w-full h-full' : 'w-full h-full'}`} 
        onMouseMove={isEditor ? handleMouseMove : undefined} 
        onMouseUp={isEditor ? handleMouseUp : undefined} 
        onContextMenu={(e) => {
            if (!isEditor) return;
            const targetEl = e.target as HTMLElement;
            const isInputOrButton = targetEl.tagName === 'INPUT' || targetEl.tagName === 'BUTTON' || targetEl.tagName === 'TEXTAREA' || targetEl.closest('button') || targetEl.isContentEditable;
            if (isInputOrButton) {
                return;
            }
            e.preventDefault();
            e.stopPropagation();
            setContextMenu({ x: e.clientX, y: e.clientY, elementId: '' });
        }}
        onMouseDown={(e) => {
            window.focus();
            if (isEditor) {
                const targetEl = e.target as HTMLElement;
                const isInsideElement = targetEl.closest('.layout-element-wrapper') || targetEl.closest('.no-print');
                const isInputOrButton = targetEl.tagName === 'INPUT' || targetEl.tagName === 'BUTTON' || targetEl.tagName === 'TEXTAREA' || targetEl.closest('button');
                
                if (!isInsideElement && !isInputOrButton) {
                    if (!e.shiftKey) {
                        setSelectedIds([]);
                    }
                    setContextMenu(null);
                    
                    // Marquee Select Start
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = ((e.clientX - rect.left) / rect.width) * 100;
                    const y = ((e.clientY - rect.top) / rect.height) * 100;
                    setMarquee({ x1: x, y1: y, x2: x, y2: y });
                    marqueeRef.current = { x1: x, y1: y };
                }
            }
        }}
      >
        {marquee && (
            <div 
                className="absolute border border-indigo-500 bg-indigo-500/10 z-[100] pointer-events-none no-print"
                style={{
                    left: `${Math.min(marquee.x1, marquee.x2)}%`,
                    top: `${Math.min(marquee.y1, marquee.y2)}%`,
                    width: `${Math.abs(marquee.x1 - marquee.x2)}%`,
                    height: `${Math.abs(marquee.y1 - marquee.y2)}%`
                }}
            />
        )}
        {isEditor && isDragging && activeGuides.map((guide, idx) => (
            <div 
                key={`guide-${idx}`}
                className="absolute bg-indigo-500 z-[100] pointer-events-none no-print"
                style={{
                    left: guide.axis === 'x' ? `${guide.pos}%` : 0,
                    top: guide.axis === 'y' ? `${guide.pos}%` : 0,
                    width: guide.axis === 'x' ? '1px' : '100%',
                    height: guide.axis === 'y' ? '1px' : '100%',
                    transform: guide.axis === 'x' ? 'translateX(-50%)' : 'translateY(-50%)',
                    opacity: 0.7,
                    borderStyle: 'dashed',
                    borderWidth: guide.axis === 'x' ? '0 0 0 1px' : '1px 0 0 0'
                }}
            />
        ))}
        {elementsWithIndices.filter(el => {
            if (isEditor || !el.style.displayOn || el.style.displayOn === 'all') return true;
            if (pageNumber === undefined) return true;

            const isEven = pageNumber % 2 === 0;
            if (el.style.displayOn === 'even') return isEven;
            if (el.style.displayOn === 'odd') return !isEven;

            if (el.style.displayOn === 'custom' && el.style.customPages) {
                return isPageInRange(pageNumber, el.style.customPages);
            }

            if (day) {
                const isWeekend = day.dayOfWeek === 0 || day.dayOfWeek === 6;
                if (el.style.displayOn === 'weekdays') return !isWeekend;
                if (el.style.displayOn === 'weekends') return isWeekend;
            }

            return true;
        }).map(el => {
          const isSelected = isEditor && selectedId === el.id;
          const isSelectedThis = selectedIds.includes(el.id);
          const wrapperStyle: React.CSSProperties = { 
              left: `${el.x}%`, 
              top: `${el.y}%`, 
              width: `${el.w}%`, 
              height: `${el.h}%`, 
              zIndex: el.zIndex, 
              transform: `rotate(${el.style.rotation || 0}deg) scaleX(${el.style.flipX ? -1 : 1}) scaleY(${el.style.flipY ? -1 : 1})`,
              willChange: isEditor && isSelectedThis && (isDragging || !!resizeDir) ? 'left, top, width, height' : 'auto'
          };
          const containerClass = `absolute group ${isSelected ? 'ring-2 ring-indigo-500 z-50' : 'hover:ring-1 hover:ring-indigo-300'} ${isEditor || activeTab === 'preview' ? 'cursor-pointer' : ''} ${isEditor ? 'cursor-move' : ''}`;
          const isWrapperType = ['lines','box','circle','vector_shape','note_grid','habit_tracker','mini_calendar','full_calendar','table','permanent_day_header', 'planner_day_box', 'icon', 'moon'].includes(el.type);
          const shouldClip = ['lines', 'note_grid', 'habit_tracker', 'mini_calendar', 'full_calendar', 'table', 'permanent_day_header', 'vector_shape'].includes(el.type);
          
          return (
            <div 
                key={el.id} 
                data-element-id={el.id}
                className={`absolute group layout-element-wrapper ${isEditor && selectedIds.includes(el.id) ? 'ring-2 ring-indigo-500 z-50' : (isEditor ? 'hover:ring-1 hover:ring-indigo-300' : '')} ${isEditor || activeTab === 'preview' ? 'cursor-pointer' : ''} ${isEditor ? 'cursor-move' : ''}`} 
                style={wrapperStyle} 
                onMouseDown={(e) => handleInteractionStart(e, el.id, null, templateType, introPageId)} 
                onClick={(e) => e.stopPropagation()}
                onContextMenu={(e) => handleContextMenu(e, el.id)}
                title={el.name}
            >
                {isEditor && selectedIds.length === 1 && selectedIds[0] === el.id && (
                    <div className="no-print">
                        {['nw','n','ne','e','se','s','sw','w'].map(d => renderResizeHandle(d+'-resize', d))}
                        
                        {/* Floating Action Toolbar */}
                        <div 
                            className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center bg-white border border-indigo-200 shadow-xl rounded-full px-2 py-1 gap-1 z-[110] transition-all"
                            onMouseDown={(e) => e.stopPropagation()} // Prevent dragging the element when clicking toolbar
                        >
                            <button 
                                onClick={(e) => { e.stopPropagation(); duplicateElement(el.id); }}
                                className="p-1.5 hover:bg-indigo-50 rounded-full text-indigo-600 transition-colors"
                                title="Duplicar"
                            >
                                <icons.Plus className="w-3.5 h-3.5" />
                            </button>
                            <button 
                                onClick={(e) => { e.stopPropagation(); copyToClipboard(el.id); }}
                                className="p-1.5 hover:bg-indigo-50 rounded-full text-indigo-600 transition-colors"
                                title="Copiar"
                            >
                                <icons.Copy className="w-3.5 h-3.5" />
                            </button>
                            <button 
                                onClick={(e) => { e.stopPropagation(); setShowProperties(true); }}
                                className="p-1.5 hover:bg-indigo-50 rounded-full text-indigo-600 transition-colors"
                                title="Propriedades"
                            >
                                <icons.Settings2 className="w-3.5 h-3.5" />
                            </button>
                            <div className="w-[1px] h-4 bg-gray-100 mx-0.5"></div>
                            <button 
                                onClick={(e) => { e.stopPropagation(); removeElement(el.id); }}
                                className="p-1.5 hover:bg-red-50 rounded-full text-red-500 transition-colors"
                                title="Excluir"
                            >
                                <icons.Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                )}
                <div 
                    className={`w-full h-full relative flex flex-col ${isWrapperType && shouldClip ? 'overflow-visible' : ''}`} 
                    style={{ 
                        justifyContent: el.style.verticalAlign === 'middle' ? 'center' : (el.style.verticalAlign === 'bottom' ? 'flex-end' : 'flex-start'),
                        alignItems: el.style.textAlign === 'center' ? 'center' : (el.style.textAlign === 'right' ? 'flex-end' : (el.style.textAlign === 'justify' ? 'stretch' : 'flex-start')),
                        ...(!isWrapperType ? el.style : {}) 
                    }}
                >
                    {isWrapperType ? (
                        <ElementRenderer 
                            element={el} 
                            dayData={d} 
                            weekDays={weekDays}
                            quote={quotes[d.month]} 
                            verse={currentVerse}
                            isEditor={isEditor} 
                            isSelected={isSelected} 
                            onContentChange={updateElementContent} 
                            onTableResizeStart={handleTableColumnResizeStart} 
                            onTableRowResizeStart={handleTableRowResizeStart}
                            onTableCellChange={updateTableCell} 
                            onTableCellFocus={handleTableCellFocus} 
                            activeTableCell={activeTableCell}
                            globalCalendarStyle={globalStyle} 
                            municipalHolidays={config.municipalHolidays}
                            pageWidth={pageWidth}
                            pageHeight={pageHeight}
                        />
                    ) : (
                        <span style={{ pointerEvents: isSelected ? 'auto' : 'none', width: '100%', height: '100%', display: 'flex', flexDirection: 'inherit', alignItems: 'inherit', justifyContent: 'inherit' }}>
                            <ElementRenderer 
                                element={el} 
                                dayData={d} 
                                weekDays={weekDays}
                                quote={quotes[d.month]} 
                                verse={currentVerse}
                                isEditor={isEditor} 
                                isSelected={isSelected} 
                                onContentChange={updateElementContent} 
                                onTableResizeStart={handleTableColumnResizeStart}
                                onTableRowResizeStart={handleTableRowResizeStart}
                                onTableCellChange={updateTableCell}
                                onTableCellFocus={handleTableCellFocus}
                                activeTableCell={activeTableCell}
                                municipalHolidays={config.municipalHolidays}
                                pageWidth={pageWidth}
                                pageHeight={pageHeight}
                            />
                        </span>
                    )}
                </div>
            </div>
          );
        })}
      </div>
    );
  };

  const getMirroredElements = (elements: LayoutElement[]): LayoutElement[] => {
      if (!config.mirrorEvenPages) return elements;
      return elements.map(el => {
          const newX = 100 - el.x - el.w;
          let newTextAlign = el.style.textAlign;
          if (newTextAlign === 'left') newTextAlign = 'right';
          else if (newTextAlign === 'right') newTextAlign = 'left';
          
          let newFlipX = el.style.flipX;
          // Apply auto-mirroring for images and icons if enabled
          if (el.style.autoMirrorImage && (el.type === 'image' || el.type === 'icon')) {
              newFlipX = !newFlipX;
          }
          
          return { ...el, x: newX, style: { ...el.style, textAlign: newTextAlign, flipX: newFlipX } };
      });
  };

  const getEffectiveDayIndices = useCallback((elements: LayoutElement[]) => {
    // Encontrar elementos que mostram partes da data
    const dateElements = elements.filter(el => 
        ['date_placeholder', 'day_number', 'day_name', 'month_name', 'month_number', 'year', 'holiday', 'moon'].includes(el.type)
    );

    if (dateElements.length === 0) return {};

    // Forçar dayIndex 0 em layouts de 1 dia por página ou sem sequenciamento de dias múltiplo por página
    if (
        config.layoutType === '1_per_page' || 
        config.layoutType === '1_per_page_weekend_shared' || 
        config.layoutType === 'notebook' || 
        config.layoutType === 'devotional'
    ) {
        const mapping: Record<string, number> = {};
        elements.forEach(el => mapping[el.id] = 0);
        return mapping;
    }

    // Verificar se algum tem dayIndex explícito diferente de 0
    // (Exceto se for layout semanal, que usa dayIndex como dia da semana 0-6)
    const isWeekly = config.layoutType === 'weekly_vertical' || config.layoutType === 'weekly_horizontal';
    const hasExplicitIndices = !isWeekly && dateElements.some(el => (el.style.dayIndex ?? 0) !== 0);
    
    if (hasExplicitIndices || isWeekly) {
        const mapping: Record<string, number> = {};
        elements.forEach(el => mapping[el.id] = el.style.dayIndex ?? 0);
        return mapping;
    }

    // Lógica de auto-sequenciamento:
    // Ordenar pela posição visual: Topo para Baixo, depois Esquerda para Direita
    const sorted = [...dateElements].sort((a, b) => {
        if (Math.abs(a.y - b.y) < 2) return a.x - b.x;
        return a.y - b.y;
    });

    const mapping: Record<string, number> = {};
    let currentIdx = 0;
    const seenTypes = new Set<string>();

    sorted.forEach(el => {
        // Se encontrarmos um tipo que já vimos para o "dia atual", 
        // incrementamos o índice para o próximo "dia"
        const typeKey = el.type === 'date_placeholder' ? (el.style.variant || 'date_placeholder') : el.type;
        if (seenTypes.has(typeKey)) {
            currentIdx++;
            seenTypes.clear();
        }
        mapping[el.id] = currentIdx;
        seenTypes.add(typeKey);
    });

    return mapping;
  }, [config.layoutType]);

  const getMaxDayIndex = (elements: LayoutElement[]) => {
      const indices = getEffectiveDayIndices(elements);
      let maxIdx = 0;
      Object.values(indices).forEach(val => {
          const idx = val as number;
          if (idx > maxIdx) maxIdx = idx;
      });
      return maxIdx;
  };



  const renderEditorPage = () => {
    const introPage = config.introPages.find(p => p.id === currentIntroPageId);
    const monthlyPage = config.monthlyIntroPages?.find(p => p.id === currentMonthlyIntroPageId);
    const dividerStyle = config.monthlyDividerStyle || {};
    const editorBg = editMode === 'intro' 
        ? (introPage?.background || (config.background?.showOnIntroPages ? config.background : undefined))
        : editMode === 'monthly_intro'
        ? (monthlyPage?.background || (config.background?.showOnIntroPages ? config.background : undefined))
        : editMode === 'divider'
        ? (dividerStyle.background || { type: 'solid', color: dividerStyle.backgroundColor || '#ffffff', showOnIntroPages: true, showOnDailyPages: true })
        : (config.background?.showOnDailyPages ? config.background : undefined);

    const paddingStyle = { 
        paddingTop: `${config.margins.top * EDITOR_SCALE}px`, 
        paddingBottom: `${config.margins.bottom * EDITOR_SCALE}px`, 
        paddingLeft: `${config.margins.inside * EDITOR_SCALE}px`, 
        paddingRight: `${config.margins.outside * EDITOR_SCALE}px` 
    };
    const containerClass = `relative transition-all duration-300 ease-in-out flex flex-col overflow-hidden`;
    
    // In custom divider layout, container background comes from background settings. In other layouts, it comes from backgroundColor.
    let containerStyle: any = { 
        width: `${EDITOR_WIDTH_PX}px`, 
        height: `${EDITOR_HEIGHT_PX}px`, 
        ...paddingStyle, 
        backgroundColor: (editMode === 'divider' && dividerStyle.layout !== 'custom') ? (dividerStyle.backgroundColor || '#ffffff') : '#ffffff'
    };

    if (editMode === 'divider' && dividerStyle.borderStyle && dividerStyle.borderStyle !== 'none') {
        const isDouble = dividerStyle.borderStyle === 'double';
        const borderW = isDouble ? `${8 * EDITOR_SCALE}px` : `${4 * EDITOR_SCALE}px`;
        containerStyle.borderWidth = borderW;
        containerStyle.borderStyle = dividerStyle.borderStyle;
        containerStyle.borderColor = dividerStyle.borderColor || '#e0e7ff';
    }

    const usefulAreaClass = `w-full h-full relative z-10 ${showMargins ? 'outline outline-1 outline-dashed outline-indigo-300' : ''}`;
    
    const wrapWithRuler = (children: React.ReactNode) => {
        return (
            <RulerWrapper
                widthPx={EDITOR_WIDTH_PX}
                heightPx={EDITOR_HEIGHT_PX}
                widthMm={PAGE_WIDTH_MM}
                heightMm={PAGE_HEIGHT_MM}
                scale={EDITOR_SCALE}
                enabled={showRulers}
                guides={guides}
                setGuides={setGuides}
                responsiveScale={responsiveScale}
                isDragging={isDragging || !!resizeDir}
            >
                {children}
            </RulerWrapper>
        );
    };

    if (editMode === 'intro') {
        return wrapWithRuler(
            <div className={containerClass} style={containerStyle}>
                {renderBackground(editorBg)}
                <div className={usefulAreaClass}>
                    {renderTemplate(getActiveElements(), null, true, true, undefined, EDITOR_WIDTH_PX, EDITOR_HEIGHT_PX, 'intro', currentIntroPageId || undefined)}
                </div>
            </div>
        );
    }

    if (editMode === 'monthly_intro') {
        const previewMonth = 0; // Janeiro
        const monthDummyDay: DayData = {
            dayOfMonth: 1,
            month: previewMonth,
            year: config.year,
            dayOfWeek: new Date(config.year, previewMonth, 1).getDay(),
            date: new Date(config.year, previewMonth, 1)
        };

        return wrapWithRuler(
            <div className={containerClass} style={containerStyle}>
                {renderBackground(editorBg)}
                <div className={usefulAreaClass}>
                    {renderTemplate(getActiveElements(), monthDummyDay, true, true, undefined, EDITOR_WIDTH_PX, EDITOR_HEIGHT_PX, 'intro', currentMonthlyIntroPageId || undefined)}
                </div>
            </div>
        );
    }

    if (editMode === 'divider') {
        const previewMonth = 0; // Janeiro
        const monthDummyDay: DayData = {
            dayOfMonth: 1,
            month: previewMonth,
            year: config.year,
            dayOfWeek: new Date(config.year, previewMonth, 1).getDay(),
            date: new Date(config.year, previewMonth, 1)
        };

        return wrapWithRuler(
            <div className={containerClass} style={containerStyle}>
                {renderBackground(editorBg)}
                <div className={usefulAreaClass}>
                    {renderTemplate(getActiveElements(), monthDummyDay, true, true, undefined, EDITOR_WIDTH_PX, EDITOR_HEIGHT_PX, 'intro', 'divider')}
                </div>
            </div>
        );
    }

    const activeElements = getActiveElements();
    if (config.layoutType === '1_per_page' || config.layoutType === 'notebook' || config.layoutType === 'devotional') {
        const maxOffset = getMaxDayIndex(activeElements);
        const mockBatch: DayData[] = Array.from({ length: maxOffset + 1 }, (_, i) => ({
            dayOfMonth: 20 + i,
            month: 10,
            year: config.year,
            dayOfWeek: (2 + i) % 7,
            holiday: null,
            moonPhase: 'Lua cheia',
            date: new Date()
        }));

        return wrapWithRuler(
            <div className={containerClass} style={containerStyle}>
                {renderBackground(editorBg)}
                <div className={usefulAreaClass}>
                    {renderTemplate(activeElements, mockBatch[0], true, true, undefined, EDITOR_WIDTH_PX, EDITOR_HEIGHT_PX, 'standard', undefined, mockBatch)}
                </div>
            </div>
        );
    }

    if (config.layoutType === '2_per_page') {
        const mockDay1: DayData = { dayOfMonth: 20, month: 10, year: config.year, dayOfWeek: 2, holiday: null, moonPhase: 'Lua cheia', date: new Date() };
        const mockDay2: DayData = { dayOfMonth: 21, month: 10, year: config.year, dayOfWeek: 3, holiday: null, moonPhase: 'Lua cheia', date: new Date() };

        if (editorViewMode === 'standard') {
            return wrapWithRuler(
                <div className={containerClass} style={containerStyle}>
                    {renderBackground(editorBg)}
                    <div className={`${usefulAreaClass} flex flex-col`}>
                        <div className="flex-1 border-b border-dashed border-indigo-200 relative overflow-visible">
                            {renderTemplate(config.elements, mockDay1, true, true, undefined, EDITOR_WIDTH_PX, EDITOR_HEIGHT_PX / 2, 'standard')}
                        </div>
                        <div className="flex-1 relative overflow-visible">
                            {renderTemplate(config.elements, mockDay2, true, false, undefined, EDITOR_WIDTH_PX, EDITOR_HEIGHT_PX / 2, 'standard')}
                        </div>
                    </div>
                </div>
            );
        }

        const elementsTop = config.elementsTop || config.elements;
        const elementsBottom = config.elementsBottom || config.elements;

        return wrapWithRuler(
            <div className={containerClass} style={containerStyle}>
                {renderBackground(editorBg)}
                <div className={`${usefulAreaClass} flex flex-col`}>
                    <div className={`flex-1 border-b border-dashed border-indigo-200 relative overflow-visible ${editorViewMode === 'bottom' ? 'opacity-40 bg-gray-50' : ''}`}>
                        {renderTemplate(elementsTop, mockDay1, true, editorViewMode === 'top', undefined, EDITOR_WIDTH_PX, EDITOR_HEIGHT_PX / 2, 'top')}
                        {editorViewMode === 'bottom' && <div className="absolute inset-0 z-[100] cursor-pointer" onClick={() => setEditorViewMode('top')} />}
                    </div>
                    <div className={`flex-1 relative overflow-visible ${editorViewMode === 'top' ? 'opacity-40 bg-gray-50' : ''}`}>
                        {renderTemplate(elementsBottom, mockDay2, true, editorViewMode === 'bottom', undefined, EDITOR_WIDTH_PX, EDITOR_HEIGHT_PX / 2, 'bottom')}
                        {editorViewMode === 'top' && <div className="absolute inset-0 z-[100] cursor-pointer" onClick={() => setEditorViewMode('bottom')} />}
                    </div>
                </div>
            </div>
        );
    }

    if (config.layoutType === '1_per_page_weekend_shared') {
        const mockSat: DayData = { dayOfMonth: 24, month: 10, year: config.year, dayOfWeek: 6, holiday: null, moonPhase: 'Lua cheia', date: new Date() };
        const mockSun: DayData = { dayOfMonth: 25, month: 10, year: config.year, dayOfWeek: 0, holiday: null, moonPhase: 'Lua cheia', date: new Date() };

        if (editorViewMode === 'standard') {
            const mockWeekday: DayData = { dayOfMonth: 20, month: 10, year: config.year, dayOfWeek: 2, holiday: null, moonPhase: 'Lua cheia', date: new Date() };
            return wrapWithRuler(
                <div className={containerClass} style={containerStyle}>
                    {renderBackground(editorBg)}
                    <div className={usefulAreaClass}>
                        {renderTemplate(config.elements, mockWeekday, true, true, undefined, EDITOR_WIDTH_PX, EDITOR_HEIGHT_PX, 'standard')}
                    </div>
                </div>
            );
        }
        
        const elementsSat = config.elementsSaturday || config.elements;
        const elementsSun = config.elementsSunday || config.elements;

        return wrapWithRuler(
            <div className={containerClass} style={containerStyle}>
                {renderBackground(editorBg)}
                <div className={`${usefulAreaClass} flex flex-col`}>
                    <div className={`flex-1 border-b border-dashed border-indigo-200 relative overflow-visible ${editorViewMode === 'sunday' ? 'opacity-40 bg-gray-50' : ''}`}>
                        {renderTemplate(elementsSat, mockSat, true, editorViewMode === 'saturday', undefined, EDITOR_WIDTH_PX, EDITOR_HEIGHT_PX / 2, 'saturday')}
                        {editorViewMode === 'sunday' && <div className="absolute inset-0 z-[100] cursor-pointer" onClick={() => setEditorViewMode('saturday')} />}
                    </div>
                    <div className={`flex-1 relative overflow-visible ${editorViewMode === 'saturday' ? 'opacity-40 bg-gray-50' : ''}`}>
                        {renderTemplate(elementsSun, mockSun, true, editorViewMode === 'sunday', undefined, EDITOR_WIDTH_PX, EDITOR_HEIGHT_PX / 2, 'sunday')}
                        {editorViewMode === 'saturday' && <div className="absolute inset-0 z-[100] cursor-pointer" onClick={() => setEditorViewMode('sunday')} />}
                    </div>
                </div>
            </div>
        );
    }

    if (config.layoutType === 'weekly_vertical' || config.layoutType === 'weekly_horizontal') {
        const mockWeek: DayData[] = Array.from({ length: 7 }, (_, i) => ({
            dayOfMonth: 20 + i,
            month: 10,
            year: config.year,
            dayOfWeek: (i + 1) % 7, // Mon-Sun
            holiday: null,
            moonPhase: 'Lua cheia',
            date: new Date()
        }));

        const elementsLeft = config.elementsWeeklyLeft ?? config.elements;
        const elementsRight = config.elementsWeeklyRight ?? config.elements;

        const leftPaddingStyle = {
            paddingTop: `${config.margins.top * EDITOR_SCALE}px`,
            paddingBottom: `${config.margins.bottom * EDITOR_SCALE}px`,
            paddingLeft: `${(config.mirrorEvenPages ? config.margins.outside : config.margins.inside) * EDITOR_SCALE}px`,
            paddingRight: `${(config.mirrorEvenPages ? config.margins.inside : config.margins.outside) * EDITOR_SCALE}px`
        };

        const rightPaddingStyle = {
            paddingTop: `${config.margins.top * EDITOR_SCALE}px`,
            paddingBottom: `${config.margins.bottom * EDITOR_SCALE}px`,
            paddingLeft: `${config.margins.inside * EDITOR_SCALE}px`,
            paddingRight: `${config.margins.outside * EDITOR_SCALE}px`
        };

        return (
            <div className="flex gap-8 justify-center items-start p-8 bg-gray-200 min-h-full overflow-visible">
                <div className="flex flex-col items-center gap-2">
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest leading-tight">Página Esquerda</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Par / Verso</span>
                    </div>
                    {wrapWithRuler(
                        <div className={`${containerClass} ${editorViewMode === 'weekly_right' ? 'ring-1 ring-gray-300 opacity-90' : 'ring-4 ring-indigo-500/30'}`} style={{ ...containerStyle, ...leftPaddingStyle }}>
                            {renderBackground(editorBg)}
                            <div className={usefulAreaClass}>
                                {renderTemplate(elementsLeft, null, true, true, undefined, EDITOR_WIDTH_PX, EDITOR_HEIGHT_PX, 'weekly_left', undefined, mockWeek)}
                                {editorViewMode === 'weekly_right' && (
                                    <div className="absolute inset-0 bg-white/5 cursor-pointer z-[60]" onClick={() => setEditorViewMode('weekly_left')} />
                                )}
                            </div>
                        </div>
                    )}
                </div>
                <div className="flex flex-col items-center gap-2">
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest leading-tight">Página Direita</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Ímpar / Frente</span>
                    </div>
                    {wrapWithRuler(
                        <div className={`${containerClass} ${editorViewMode === 'weekly_left' ? 'ring-1 ring-gray-300 opacity-90' : 'ring-4 ring-indigo-500/30'}`} style={{ ...containerStyle, ...rightPaddingStyle }}>
                            {renderBackground(editorBg)}
                            <div className={usefulAreaClass}>
                                {renderTemplate(elementsRight, null, true, true, undefined, EDITOR_WIDTH_PX, EDITOR_HEIGHT_PX, 'weekly_right', undefined, mockWeek)}
                                {editorViewMode === 'weekly_left' && (
                                    <div className="absolute inset-0 bg-white/5 cursor-pointer z-[60]" onClick={() => setEditorViewMode('weekly_right')} />
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }
    return null;
  };

  const renderPrintLayout = (limitStart?: number, limitEnd?: number, maxRenderCount?: number, countOnly?: boolean) => {
    const pages: React.ReactNode[] = [];
    const pageStyle = { width: `${PAGE_WIDTH_MM}mm`, height: `${PAGE_HEIGHT_MM}mm` };
    const borderStyle = showMargins ? 'border border-indigo-200 border-dashed' : '';
    let pageCount = 0;

    const renderPageContainer = (children: React.ReactNode, key: string | number, hideNumbers = false, bgConfig?: BackgroundConfig, customPageStyle?: React.CSSProperties) => {
        pageCount++;
        if (countOnly) return <div key={key} />;

        if (limitStart !== undefined && limitEnd !== undefined) {
            if (pageCount < limitStart || pageCount > limitEnd) return null;
        }

        const isEven = pageCount % 2 === 0;
        const marginLeft = isEven ? config.margins.outside : config.margins.inside;
        const marginRight = isEven ? config.margins.inside : config.margins.outside;
        const pagePadding = `${config.margins.top}mm ${marginRight}mm ${config.margins.bottom}mm ${marginLeft}mm`;

        return (
            <div id={`preview-page-${pageCount}`} key={key} className="bg-white shadow-xl print:shadow-none print-break-page relative box-border overflow-hidden shrink-0 transition-transform hover:scale-[1.01]" style={{ ...pageStyle, padding: pagePadding, ...customPageStyle }}>
                {renderBackground(bgConfig, pageCount)}
                <div className="relative z-10 h-full w-full">
                    <div className="absolute -top-7 left-0 right-0 flex justify-between items-center no-print px-2 bg-indigo-900/5 py-1 rounded-t-lg">
                    <div className="flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-indigo-600 text-[10px] flex items-center justify-center text-white font-black">{pageCount}</span>
                        <span className="text-[10px] font-black text-indigo-900 uppercase tracking-widest">Página {pageCount}</span>
                    </div>
                    <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-tighter">{isEven ? 'Lado Esquerdo' : 'Lado Direito'}</span>
                </div>
                <div className={`w-full h-full relative ${borderStyle} print:border-none overflow-visible`}>
                    {children}
                </div>
                {!hideNumbers && (
                    <div className={`absolute bottom-3 text-[10px] font-black text-indigo-500/20 no-print pointer-events-none w-full text-center flex items-center justify-center gap-2 italic uppercase tracking-widest`}>
                        <div className="h-px w-8 bg-indigo-500/10"></div>
                        {pageCount} / {actualTotalPagesCount || generatedData.length}
                        <div className="h-px w-8 bg-indigo-500/10"></div>
                    </div>
                )}
                </div>
            </div>
        );
    };

    const dailyBg = config.background?.showOnDailyPages ? config.background : undefined;

    const renderMonthDivider = (month: number, year: number) => {
        const style = config.monthlyDividerStyle || {};
        const elements = style.elements || [];
        const dividerBg = style.background || { type: 'solid', color: style.backgroundColor || '#ffffff', showOnIntroPages: true, showOnDailyPages: true };

        const monthDummyDay: DayData = {
            dayOfMonth: 1,
            month: month,
            year: year,
            dayOfWeek: new Date(year, month, 1).getDay(),
            date: new Date(year, month, 1)
        };

        const targetPageNum = pageCount + 1;
        const isEven = targetPageNum % 2 === 0;
        const elementsToRender = isEven ? getMirroredElements(elements) : elements;

        const customStyle: React.CSSProperties = {};
        if (style.borderStyle && style.borderStyle !== 'none') {
            const isDouble = style.borderStyle === 'double';
            const borderW = isDouble ? '8mm' : '4mm';
            customStyle.borderWidth = borderW;
            customStyle.borderStyle = style.borderStyle;
            customStyle.borderColor = style.borderColor || '#e0e7ff';
        }

        return renderPageContainer(
            <div className="w-full h-full box-border relative">
                {renderTemplate(elementsToRender, monthDummyDay, false, false, targetPageNum, printW, printH, 'intro', 'divider')}
            </div>
            , `divider-${month}-${year}`, false, dividerBg, customStyle
        );
    };

    const renderDividerVersoPage = (month: number, year: number, pNum: number, content: string) => {
        let elements: LayoutElement[] = [];
        let versoBg = dailyBg;
        
        if (content === 'notes') {
            elements = [
                { id: `verso-title-${pNum}`, type: 'text', name: 'Título', x: 10, y: 10, w: 80, h: 5, content: 'Anotações do Mês', zIndex: 1, style: { fontSize: 18, fontWeight: 'bold', textAlign: 'center' } },
                { id: `verso-lines-${pNum}`, type: 'lines', name: 'Linhas', x: 10, y: 20, w: 80, h: 70, zIndex: 1, style: { lineSpacing: 25, color: '#e5e7eb' } }
            ];
        } else if (content === 'habit_tracker') {
            elements = [
                { id: `verso-title-${pNum}`, type: 'text', name: 'Título', x: 10, y: 10, w: 80, h: 5, content: 'Controle de Hábitos', zIndex: 1, style: { fontSize: 18, fontWeight: 'bold', textAlign: 'center' } },
                { id: `verso-habit-${pNum}`, type: 'habit_tracker', name: 'Habit Tracker', x: 10, y: 20, w: 80, h: 70, zIndex: 1, style: { habitLabel: 'Meus Hábitos' } }
            ];
        } else if (content === 'quote') {
            elements = [
                { id: `verso-quote-${pNum}`, type: 'text', name: 'Frase', x: 15, y: 40, w: 70, h: 20, content: '"O sucesso é a soma de pequenos esforços repetidos dia após dia."', zIndex: 1, style: { fontSize: 20, fontWeight: 'italic', textAlign: 'center', verticalAlign: 'middle' } }
            ];
        } else if (content !== 'blank') {
            const introPage = config.introPages.find(p => p.id === content);
            if (introPage) {
                elements = introPage.elements;
                versoBg = introPage.background || (config.background?.showOnIntroPages ? config.background : undefined);
            } else {
                const mPage = config.monthlyIntroPages?.find(p => p.id === content);
                if (mPage) {
                    elements = mPage.elements;
                    versoBg = mPage.background || (config.background?.showOnIntroPages ? config.background : undefined);
                }
            }
        }

        const isEven = pNum % 2 === 0;
        const elementsToRender = isEven ? getMirroredElements(elements) : elements;
        const monthDummyDay: DayData = {
            dayOfMonth: 1,
            month: month,
            year: year,
            dayOfWeek: new Date(year, month, 1).getDay(),
            date: new Date(year, month, 1)
        };
        
        return renderPageContainer(
            renderTemplate(elementsToRender, monthDummyDay, false, false, pNum, printW, printH, 'intro', content),
            `divider-verso-${month}-${year}-${pNum}`,
            false,
            versoBg
        );
    };

    const PRINT_SCALE = 3.78; // 96dpi standard
    const printW = PAGE_WIDTH_MM * PRINT_SCALE;
    const printH = PAGE_HEIGHT_MM * PRINT_SCALE;

    const renderFillerPage = (pNum: number) => {
        const content = config.fillerPageContent || 'blank';
        let elements: LayoutElement[] = [];
        let fillerBg = dailyBg;
        
        if (content === 'notes') {
            elements = [
                { id: `filler-title-${pNum}`, type: 'text', name: 'Título', x: 10, y: 10, w: 80, h: 5, content: 'Anotações', zIndex: 1, style: { fontSize: 18, fontWeight: 'bold', textAlign: 'center' } },
                { id: `filler-lines-${pNum}`, type: 'lines', name: 'Linhas', x: 10, y: 20, w: 80, h: 70, zIndex: 1, style: { lineSpacing: 25, color: '#e5e7eb' } }
            ];
        } else if (content === 'habit_tracker') {
            elements = [
                { id: `filler-title-${pNum}`, type: 'text', name: 'Título', x: 10, y: 10, w: 80, h: 5, content: 'Hábitos do Mês', zIndex: 1, style: { fontSize: 18, fontWeight: 'bold', textAlign: 'center' } },
                { id: `filler-habit-${pNum}`, type: 'habit_tracker', name: 'Habit Tracker', x: 10, y: 20, w: 80, h: 70, zIndex: 1, style: { habitLabel: 'Meus Hábitos' } }
            ];
        } else if (content === 'quote') {
            elements = [
                { id: `filler-quote-${pNum}`, type: 'text', name: 'Frase', x: 15, y: 40, w: 70, h: 20, content: '"O sucesso é a soma de pequenos esforços repetidos dia após dia."', zIndex: 1, style: { fontSize: 20, fontWeight: 'italic', textAlign: 'center', verticalAlign: 'middle' } }
            ];
        } else if (content !== 'blank') {
            const introPage = config.introPages.find(p => p.id === content);
            if (introPage) {
                elements = introPage.elements;
                fillerBg = introPage.background || (config.background?.showOnIntroPages ? config.background : undefined);
            }
        }

        const isEven = pNum % 2 === 0;
        const elementsToRender = isEven ? getMirroredElements(elements) : elements;
        
        return renderPageContainer(
            renderTemplate(elementsToRender, null, false, false, pNum, printW, printH, (content !== 'blank' && content !== 'notes' && content !== 'habit_tracker' && content !== 'quote') ? 'intro' : undefined, (content !== 'blank' && content !== 'notes' && content !== 'habit_tracker' && content !== 'quote') ? content : undefined),
            `filler-${pNum}`,
            false,
            fillerBg
        );
    };

    config.introPages.forEach(page => {
        const isEven = (pageCount + 1) % 2 === 0;
        const elementsToRender = isEven ? getMirroredElements(page.elements) : page.elements;
        const pageBg = page.background || (config.background?.showOnIntroPages ? config.background : undefined);
        const container = renderPageContainer(renderTemplate(elementsToRender, null, false, false, pageCount + 1, printW, printH, 'intro', page.id), page.id, false, pageBg);
        if(container) pages.push(container);
    });

    const days = generatedData;
    const effectiveDays = (limitStart === undefined && maxRenderCount !== undefined) 
        ? days.slice(0, maxRenderCount) 
        : days;

    const { layoutType, projectType } = config;

    if (projectType === 'notebook' || projectType === 'devotional') {
        let i = 0;
        const maxOffset = getMaxDayIndex(config.elements);
        const daysPerPage = maxOffset + 1;

        while (i < effectiveDays.length) {
            const batch = effectiveDays.slice(i, i + daysPerPage);
            const day = batch[0]; 
            
            const isEven = (pageCount + 1) % 2 === 0;
            const elementsToRender = isEven ? getMirroredElements(config.elements) : config.elements;
            const container = renderPageContainer(
                renderTemplate(elementsToRender, day, false, false, pageCount + 1, printW, printH, 'standard', undefined, batch), 
                day.date.toISOString() + i, 
                false, 
                dailyBg
            );
            if(container) pages.push(container);
            i += daysPerPage;
        }
    } else if (layoutType === '1_per_page') {
        let i = 0;
        const maxOffset = getMaxDayIndex(config.elements);
        const daysPerPage = maxOffset + 1;
        let lastMonth = -1;

        while (i < effectiveDays.length) {
            const batch = effectiveDays.slice(i, i + daysPerPage);
            const day = batch[0]; 

            const currentMonth = day.month;
            const currentYear = day.year;

            // Month Divider & Monthly Pages
            if (currentMonth !== lastMonth) {
                if (currentYear === config.year) {
                    const hasDividers = config.includeMonthlyDividers ?? true;
                    const hasIntroPages = config.includeMonthlyIntroPages ?? true;
                    const hasIntroPagesData = config.monthlyIntroPages && config.monthlyIntroPages.length > 0;

                    if (hasDividers) {
                        // Ensure divider is on an ODD page (Right)
                        if (pageCount % 2 !== 0) {
                            const filler = renderFillerPage(pageCount + 1);
                            if (filler) pages.push(filler);
                        }
                        const divider = renderMonthDivider(currentMonth, currentYear);
                        if (divider) pages.push(divider);
                        
                        // Rendendo o verso do divisor de mês conforme a preferência do usuário
                        const versoContent = config.monthlyDividerVersoContent || (hasIntroPages && hasIntroPagesData ? 'monthly_intro_first' : 'blank');
                        
                        if (versoContent === 'monthly_intro_first' && hasIntroPages && hasIntroPagesData) {
                            const monthDummyDay: DayData = {
                                dayOfMonth: 1,
                                month: currentMonth,
                                year: currentYear,
                                dayOfWeek: new Date(currentYear, currentMonth, 1).getDay(),
                                date: new Date(currentYear, currentMonth, 1)
                            };
                            config.monthlyIntroPages.forEach(mPage => {
                                const isEven = (pageCount + 1) % 2 === 0;
                                const elementsToRender = isEven ? getMirroredElements(mPage.elements) : mPage.elements;
                                const pageBg = mPage.background || (config.background?.showOnIntroPages ? config.background : undefined);
                                const container = renderPageContainer(
                                    renderTemplate(elementsToRender, monthDummyDay, false, false, pageCount + 1, printW, printH, 'intro', mPage.id),
                                    `monthly-intro-${currentMonth}-${mPage.id}`,
                                    false,
                                    pageBg
                                );
                                if (container) pages.push(container);
                            });
                        } else {
                            // Renderiza o verso específico escolhido
                            const versoContainer = renderDividerVersoPage(currentMonth, currentYear, pageCount + 1, versoContent);
                            if (versoContainer) pages.push(versoContainer);

                            // Renderiza as demais páginas introdutórias mensais se houverem, excluindo a própria página caso tenha sido usada como verso
                            if (hasIntroPages && hasIntroPagesData) {
                                const monthDummyDay: DayData = {
                                    dayOfMonth: 1,
                                    month: currentMonth,
                                    year: currentYear,
                                    dayOfWeek: new Date(currentYear, currentMonth, 1).getDay(),
                                    date: new Date(currentYear, currentMonth, 1)
                                };
                                config.monthlyIntroPages.forEach(mPage => {
                                    if (mPage.id === versoContent) return; // Não duplicar se ela foi usada para o verso
                                    const isEven = (pageCount + 1) % 2 === 0;
                                    const elementsToRender = isEven ? getMirroredElements(mPage.elements) : mPage.elements;
                                    const pageBg = mPage.background || (config.background?.showOnIntroPages ? config.background : undefined);
                                    const container = renderPageContainer(
                                        renderTemplate(elementsToRender, monthDummyDay, false, false, pageCount + 1, printW, printH, 'intro', mPage.id),
                                        `monthly-intro-${currentMonth}-${mPage.id}`,
                                        false,
                                        pageBg
                                    );
                                    if (container) pages.push(container);
                                });
                            }
                        }
                    } else if (hasIntroPages && hasIntroPagesData) {
                        const monthDummyDay: DayData = {
                            dayOfMonth: 1,
                            month: currentMonth,
                            year: currentYear,
                            dayOfWeek: new Date(currentYear, currentMonth, 1).getDay(),
                            date: new Date(currentYear, currentMonth, 1)
                        };
                        config.monthlyIntroPages.forEach(mPage => {
                            const isEven = (pageCount + 1) % 2 === 0;
                            const elementsToRender = isEven ? getMirroredElements(mPage.elements) : mPage.elements;
                            const pageBg = mPage.background || (config.background?.showOnIntroPages ? config.background : undefined);
                            const container = renderPageContainer(
                                renderTemplate(elementsToRender, monthDummyDay, false, false, pageCount + 1, printW, printH, 'intro', mPage.id),
                                `monthly-intro-${currentMonth}-${mPage.id}`,
                                false,
                                pageBg
                            );
                            if (container) pages.push(container);
                        });
                    }
                    
                    lastMonth = currentMonth;
                }
            }
            
            if (config.startMonthOnRightPage && day.dayOfMonth === 1 && pageCount > 0) {
                if (pageCount % 2 !== 0) {
                    const filler = renderFillerPage(pageCount + 1);
                    if (filler) pages.push(filler);
                }
            }

            const isEven = (pageCount + 1) % 2 === 0;
            const elementsToRender = isEven ? getMirroredElements(config.elements) : config.elements;
            const container = renderPageContainer(
                renderTemplate(elementsToRender, day, false, false, pageCount + 1, printW, printH, 'standard', undefined, batch), 
                day.date.toISOString() + i, 
                false, 
                dailyBg
            );
            if(container) pages.push(container);
            i += daysPerPage;
        }
    } else if (layoutType === '2_per_page') {
        let i = 0;
        let lastMonth = -1;
        while (i < effectiveDays.length) {
            const dayTop = effectiveDays[i];
            const dayBottom = effectiveDays[i+1];
            
            const currentMonth = dayTop.month;
            const currentYear = dayTop.year;

            // Month Divider & Monthly Pages
            if (currentMonth !== lastMonth) {
                if (currentYear === config.year) {
                    const hasDividers = config.includeMonthlyDividers ?? true;
                    const hasIntroPages = config.includeMonthlyIntroPages ?? true;
                    const hasIntroPagesData = config.monthlyIntroPages && config.monthlyIntroPages.length > 0;

                    if (hasDividers) {
                        // Ensure divider is on an ODD page (Right)
                        if (pageCount % 2 !== 0) {
                            const filler = renderFillerPage(pageCount + 1);
                            if (filler) pages.push(filler);
                        }
                        const divider = renderMonthDivider(currentMonth, currentYear);
                        if (divider) pages.push(divider);
                        
                        // Rendendo o verso do divisor de mês conforme a preferência do usuário
                        const versoContent = config.monthlyDividerVersoContent || (hasIntroPages && hasIntroPagesData ? 'monthly_intro_first' : 'blank');
                        
                        if (versoContent === 'monthly_intro_first' && hasIntroPages && hasIntroPagesData) {
                            const monthDummyDay: DayData = {
                                dayOfMonth: 1,
                                month: currentMonth,
                                year: currentYear,
                                dayOfWeek: new Date(currentYear, currentMonth, 1).getDay(),
                                date: new Date(currentYear, currentMonth, 1)
                            };
                            config.monthlyIntroPages.forEach(mPage => {
                                const isEven = (pageCount + 1) % 2 === 0;
                                const elementsToRender = isEven ? getMirroredElements(mPage.elements) : mPage.elements;
                                const pageBg = mPage.background || (config.background?.showOnIntroPages ? config.background : undefined);
                                const container = renderPageContainer(
                                    renderTemplate(elementsToRender, monthDummyDay, false, false, pageCount + 1, printW, printH, 'intro', mPage.id),
                                    `monthly-intro-${currentMonth}-${mPage.id}`,
                                    false,
                                    pageBg
                                );
                                if (container) pages.push(container);
                            });
                        } else {
                            // Renderiza o verso específico escolhido
                            const versoContainer = renderDividerVersoPage(currentMonth, currentYear, pageCount + 1, versoContent);
                            if (versoContainer) pages.push(versoContainer);

                            // Renderiza as demais páginas introdutórias mensais se houverem, excluindo a própria página caso tenha sido usada como verso
                            if (hasIntroPages && hasIntroPagesData) {
                                const monthDummyDay: DayData = {
                                    dayOfMonth: 1,
                                    month: currentMonth,
                                    year: currentYear,
                                    dayOfWeek: new Date(currentYear, currentMonth, 1).getDay(),
                                    date: new Date(currentYear, currentMonth, 1)
                                };
                                config.monthlyIntroPages.forEach(mPage => {
                                    if (mPage.id === versoContent) return; // Não duplicar se ela foi usada para o verso
                                    const isEven = (pageCount + 1) % 2 === 0;
                                    const elementsToRender = isEven ? getMirroredElements(mPage.elements) : mPage.elements;
                                    const pageBg = mPage.background || (config.background?.showOnIntroPages ? config.background : undefined);
                                    const container = renderPageContainer(
                                        renderTemplate(elementsToRender, monthDummyDay, false, false, pageCount + 1, printW, printH, 'intro', mPage.id),
                                        `monthly-intro-${currentMonth}-${mPage.id}`,
                                        false,
                                        pageBg
                                    );
                                    if (container) pages.push(container);
                                });
                            }
                        }
                    } else if (hasIntroPages && hasIntroPagesData) {
                        const monthDummyDay: DayData = {
                            dayOfMonth: 1,
                            month: currentMonth,
                            year: currentYear,
                            dayOfWeek: new Date(currentYear, currentMonth, 1).getDay(),
                            date: new Date(currentYear, currentMonth, 1)
                        };
                        config.monthlyIntroPages.forEach(mPage => {
                            const isEven = (pageCount + 1) % 2 === 0;
                            const elementsToRender = isEven ? getMirroredElements(mPage.elements) : mPage.elements;
                            const pageBg = mPage.background || (config.background?.showOnIntroPages ? config.background : undefined);
                            const container = renderPageContainer(
                                renderTemplate(elementsToRender, monthDummyDay, false, false, pageCount + 1, printW, printH, 'intro', mPage.id),
                                `monthly-intro-${currentMonth}-${mPage.id}`,
                                false,
                                pageBg
                            );
                            if (container) pages.push(container);
                        });
                    }
                    
                    lastMonth = currentMonth;
                }
            }

            // 1. Check if dayTop starts a month
            if (config.startMonthOnRightPage && dayTop.dayOfMonth === 1 && pageCount > 0) {
                if (pageCount % 2 !== 0) {
                    const filler = renderFillerPage(pageCount + 1);
                    if (filler) pages.push(filler);
                }
            }
            
            // 2. Check if dayBottom starts a month
            if (config.startMonthOnRightPage && dayBottom && dayBottom.dayOfMonth === 1) {
                // dayTop is end of month, dayBottom is start of next month.
                // We want dayBottom on a RIGHT page.
                
                if (pageCount % 2 !== 0) {
                    // Current pageCount is ODD (Right). Next is EVEN (Left).
                    // Put dayTop on EVEN (Left), then dayBottom will be on next ODD (Right).
                    const isEven = (pageCount + 1) % 2 === 0;
                    const elementsTop = config.elementsTop || config.elements;
                    const topToRender = isEven ? getMirroredElements(elementsTop) : elementsTop;
                    
                    const container = renderPageContainer(
                        <div className="flex flex-col h-full">
                            <div className={`flex-1 relative border-b border-dashed border-gray-200 pb-2 mb-2 overflow-visible ${showMargins ? 'px-2' : ''}`}>
                                <div className={`w-full h-full ${borderStyle} print:border-none`}>{renderTemplate(topToRender, dayTop, false, false, pageCount + 1, printW, printH / 2, 'top')}</div>
                            </div>
                            <div className="flex-1 relative pt-2 overflow-visible flex items-center justify-center text-gray-300 text-[10px] italic">
                                Página de Transição
                            </div>
                        </div>
                    , `transition-${dayTop.date.toISOString()}`, false, dailyBg);
                    if(container) pages.push(container);
                    i += 1; // Only consumed dayTop
                    continue;
                } else {
                    // Current pageCount is EVEN (Left). Next is ODD (Right).
                    // If we put dayTop on ODD (Right), dayBottom would be on next EVEN (Left).
                    // So we put dayTop on ODD (Right), then insert a filler on EVEN (Left).
                    // Then dayBottom starts on next ODD (Right).
                    
                    const isEven = (pageCount + 1) % 2 === 0;
                    const elementsTop = config.elementsTop || config.elements;
                    const topToRender = isEven ? getMirroredElements(elementsTop) : elementsTop;
                    
                    const container = renderPageContainer(
                        <div className="flex flex-col h-full">
                            <div className={`flex-1 relative border-b border-dashed border-gray-200 pb-2 mb-2 overflow-visible ${showMargins ? 'px-2' : ''}`}>
                                <div className={`w-full h-full ${borderStyle} print:border-none`}>{renderTemplate(topToRender, dayTop, false, false, pageCount + 1, printW, printH / 2, 'top')}</div>
                            </div>
                            <div className="flex-1 relative pt-2 overflow-visible flex items-center justify-center text-gray-300 text-[10px] italic">
                                Página de Transição
                            </div>
                        </div>
                    , `transition-${dayTop.date.toISOString()}`, false, dailyBg);
                    if(container) pages.push(container);
                    
                    // Now pageCount is ODD (Right). Insert filler on EVEN (Left).
                    const filler = renderFillerPage(pageCount + 1);
                    if (filler) pages.push(filler);
                    
                    i += 1;
                    continue;
                }
            }

            // Normal render
            const isEven = (pageCount + 1) % 2 === 0;
            const elementsTop = config.elementsTop || config.elements;
            const elementsBottom = config.elementsBottom || config.elements;
            const topToRender = isEven ? getMirroredElements(elementsTop) : elementsTop;
            const bottomToRender = isEven ? getMirroredElements(elementsBottom) : elementsBottom;

            const container = renderPageContainer(
                <div className="flex flex-col h-full">
                    <div className={`flex-1 relative border-b border-dashed border-gray-200 pb-2 mb-2 overflow-visible ${showMargins ? 'px-2' : ''}`}>
                        <div className={`w-full h-full ${borderStyle} print:border-none`}>{renderTemplate(topToRender, dayTop, false, false, pageCount + 1, printW, printH / 2, 'top')}</div>
                    </div>
                    <div className={`flex-1 relative pt-2 overflow-visible ${showMargins ? 'px-2' : ''}`}>
                        {dayBottom ? (<div className={`w-full h-full ${borderStyle} print:border-none`}>{renderTemplate(bottomToRender, dayBottom, false, false, pageCount + 1, printW, printH / 2, 'bottom')}</div>) : null}
                    </div>
                </div>
            , i, false, dailyBg);
            if(container) pages.push(container);
            i += 2;
        }
    } else if (layoutType === '1_per_page_weekend_shared') {
        let i = 0;
        let lastMonth = -1;
        while (i < effectiveDays.length) {
            const day = effectiveDays[i];
            const isWeekend = day.dayOfWeek === 6;
            
            const currentMonth = day.month;
            const currentYear = day.year;

            // Month Divider & Monthly Pages
            if (currentMonth !== lastMonth) {
                if (currentYear === config.year) {
                    const hasDividers = config.includeMonthlyDividers ?? true;
                    const hasIntroPages = config.includeMonthlyIntroPages ?? true;
                    const hasIntroPagesData = config.monthlyIntroPages && config.monthlyIntroPages.length > 0;

                    if (hasDividers) {
                        // Ensure divider is on an ODD page (Right)
                        if (pageCount % 2 !== 0) {
                            const filler = renderFillerPage(pageCount + 1);
                            if (filler) pages.push(filler);
                        }
                        const divider = renderMonthDivider(currentMonth, currentYear);
                        if (divider) pages.push(divider);
                        
                        // Rendendo o verso do divisor de mês conforme a preferência do usuário
                        const versoContent = config.monthlyDividerVersoContent || (hasIntroPages && hasIntroPagesData ? 'monthly_intro_first' : 'blank');
                        
                        if (versoContent === 'monthly_intro_first' && hasIntroPages && hasIntroPagesData) {
                            const monthDummyDay: DayData = {
                                dayOfMonth: 1,
                                month: currentMonth,
                                year: currentYear,
                                dayOfWeek: new Date(currentYear, currentMonth, 1).getDay(),
                                date: new Date(currentYear, currentMonth, 1)
                            };
                            config.monthlyIntroPages.forEach(mPage => {
                                const isEven = (pageCount + 1) % 2 === 0;
                                const elementsToRender = isEven ? getMirroredElements(mPage.elements) : mPage.elements;
                                const pageBg = mPage.background || (config.background?.showOnIntroPages ? config.background : undefined);
                                const container = renderPageContainer(
                                    renderTemplate(elementsToRender, monthDummyDay, false, false, pageCount + 1, printW, printH, 'intro', mPage.id),
                                    `monthly-intro-${currentMonth}-${mPage.id}`,
                                    false,
                                    pageBg
                                );
                                if (container) pages.push(container);
                            });
                        } else {
                            // Renderiza o verso específico escolhido
                            const versoContainer = renderDividerVersoPage(currentMonth, currentYear, pageCount + 1, versoContent);
                            if (versoContainer) pages.push(versoContainer);

                            // Renderiza as demais páginas introdutórias mensais se houverem, excluindo a própria página caso tenha sido usada como verso
                            if (hasIntroPages && hasIntroPagesData) {
                                const monthDummyDay: DayData = {
                                    dayOfMonth: 1,
                                    month: currentMonth,
                                    year: currentYear,
                                    dayOfWeek: new Date(currentYear, currentMonth, 1).getDay(),
                                    date: new Date(currentYear, currentMonth, 1)
                                };
                                config.monthlyIntroPages.forEach(mPage => {
                                    if (mPage.id === versoContent) return; // Não duplicar se ela foi usada para o verso
                                    const isEven = (pageCount + 1) % 2 === 0;
                                    const elementsToRender = isEven ? getMirroredElements(mPage.elements) : mPage.elements;
                                    const pageBg = mPage.background || (config.background?.showOnIntroPages ? config.background : undefined);
                                    const container = renderPageContainer(
                                        renderTemplate(elementsToRender, monthDummyDay, false, false, pageCount + 1, printW, printH, 'intro', mPage.id),
                                        `monthly-intro-${currentMonth}-${mPage.id}`,
                                        false,
                                        pageBg
                                    );
                                    if (container) pages.push(container);
                                });
                            }
                        }
                    } else if (hasIntroPages && hasIntroPagesData) {
                        const monthDummyDay: DayData = {
                            dayOfMonth: 1,
                            month: currentMonth,
                            year: currentYear,
                            dayOfWeek: new Date(currentYear, currentMonth, 1).getDay(),
                            date: new Date(currentYear, currentMonth, 1)
                        };
                        config.monthlyIntroPages.forEach(mPage => {
                            const isEven = (pageCount + 1) % 2 === 0;
                            const elementsToRender = isEven ? getMirroredElements(mPage.elements) : mPage.elements;
                            const pageBg = mPage.background || (config.background?.showOnIntroPages ? config.background : undefined);
                            const container = renderPageContainer(
                                renderTemplate(elementsToRender, monthDummyDay, false, false, pageCount + 1, printW, printH, 'intro', mPage.id),
                                `monthly-intro-${currentMonth}-${mPage.id}`,
                                false,
                                pageBg
                            );
                            if (container) pages.push(container);
                        });
                    }
                    
                    lastMonth = currentMonth;
                }
            }

            if (config.startMonthOnRightPage && day.dayOfMonth === 1 && pageCount > 0) {
                if (pageCount % 2 !== 0) {
                    const filler = renderFillerPage(pageCount + 1);
                    if (filler) pages.push(filler);
                }
            }

            const isEven = (pageCount + 1) % 2 === 0;
            
            if (isWeekend) {
                const daySun = effectiveDays[i+1];
                if (config.startMonthOnRightPage && daySun && daySun.dayOfMonth === 1) {
                     const elementsSat = config.elementsSaturday || config.elements;
                     const satToRender = isEven ? getMirroredElements(elementsSat) : elementsSat;
                     
                     const container = renderPageContainer(
                        <div className="flex flex-col h-full">
                            <div className="flex-1 relative border-b border-dashed border-gray-300 pb-2 mb-2 overflow-visible">
                                <div className={`w-full h-full ${borderStyle} print:border-none`}>{renderTemplate(satToRender, day, false, false, pageCount + 1, printW, printH / 2, 'saturday')}</div>
                            </div>
                            <div className="flex-1 relative pt-2 overflow-visible flex items-center justify-center text-gray-300 text-[10px] italic">
                                Página de Transição
                            </div>
                        </div>
                     , `we-trans-${i}`, false, dailyBg);
                     if(container) pages.push(container);
                     
                     if (pageCount % 2 !== 0) {
                          const filler = renderFillerPage(pageCount + 1);
                          if (filler) pages.push(filler);
                     }
                     
                     i += 2;
                     continue;
                }

                if (!effectiveDays[i+1] && limitStart === undefined) break;

                const elementsSat = config.elementsSaturday || config.elements;
                const elementsSun = config.elementsSunday || config.elements;
                
                const satToRender = isEven ? getMirroredElements(elementsSat) : elementsSat;
                const sunToRender = isEven ? getMirroredElements(elementsSun) : elementsSun;

                const container = renderPageContainer(
                    <div className="flex flex-col h-full">
                        <div className="flex-1 relative border-b border-dashed border-gray-300 pb-2 mb-2 overflow-visible">
                            <div className={`w-full h-full ${borderStyle} print:border-none`}>{renderTemplate(satToRender, day, false, false, pageCount + 1, printW, printH / 2, 'saturday')}</div>
                        </div>
                        <div className="flex-1 relative pt-2 overflow-visible">
                            {effectiveDays[i+1] ? (<div className={`w-full h-full ${borderStyle} print:border-none`}>{renderTemplate(sunToRender, effectiveDays[i+1], false, false, pageCount + 1, printW, printH / 2, 'sunday')}</div>) : null}
                        </div>
                    </div>
                , `we-${i}`, false, dailyBg);
                if(container) pages.push(container);
                i += 2;
            } else {
                const elementsToRender = isEven ? getMirroredElements(config.elements) : config.elements;
                const container = renderPageContainer(renderTemplate(elementsToRender, day, false, false, pageCount + 1, printW, printH, 'standard'), day.date.toISOString(), false, dailyBg);
                if(container) pages.push(container);
                i += 1;
            }
        }
    } else if (config.layoutType === 'weekly_vertical' || config.layoutType === 'weekly_horizontal') {
        // Group effectiveDays into weeks (Mon-Sun)
        const weeks: DayData[][] = [];
        let currentWeek: DayData[] = [];
        
        effectiveDays.forEach((day, index) => {
            currentWeek.push(day);
            if (day.dayOfWeek === 0 || index === effectiveDays.length - 1) {
                weeks.push(currentWeek);
                currentWeek = [];
            }
        });

        let lastMonth = -1;
        weeks.forEach((week, weekIndex) => {
            // Determinar o mês de referência para esta semana
            // Usamos o primeiro dia da semana que tem dayOfMonth > 0 (pertence ao ano do planner)
            const firstValidDay = week.find(d => d.dayOfMonth > 0);
            if (!firstValidDay) return; // Week entirely out of bounds? Should not happen with generatePlannerDays logic

            const currentMonth = firstValidDay.month;
            const currentYear = firstValidDay.year;
            
            // Month Divider
            if (currentMonth !== lastMonth) {
                // Se for o primeiro mês do planner, garantimos que não seja o mês do ano anterior
                if (currentYear === config.year) {
                    const hasDividers = config.includeMonthlyDividers ?? true;
                    const hasIntroPages = config.includeMonthlyIntroPages ?? true;
                    const hasIntroPagesData = config.monthlyIntroPages && config.monthlyIntroPages.length > 0;

                    if (hasDividers) {
                        // Ensure divider is on an ODD page (Right)
                        if (pageCount % 2 !== 0) {
                            const filler = renderFillerPage(pageCount + 1);
                            if (filler) pages.push(filler);
                        }
                        const divider = renderMonthDivider(currentMonth, currentYear);
                        if (divider) pages.push(divider);
                        
                        // Rendendo o verso do divisor de mês conforme a preferência do usuário
                        const versoContent = config.monthlyDividerVersoContent || (hasIntroPages && hasIntroPagesData ? 'monthly_intro_first' : 'blank');
                        
                        if (versoContent === 'monthly_intro_first' && hasIntroPages && hasIntroPagesData) {
                            const monthDummyDay: DayData = {
                                dayOfMonth: 1,
                                month: currentMonth,
                                year: currentYear,
                                dayOfWeek: new Date(currentYear, currentMonth, 1).getDay(),
                                date: new Date(currentYear, currentMonth, 1)
                            };
                            config.monthlyIntroPages.forEach(mPage => {
                                const isEven = (pageCount + 1) % 2 === 0;
                                const elementsToRender = isEven ? getMirroredElements(mPage.elements) : mPage.elements;
                                const pageBg = mPage.background || (config.background?.showOnIntroPages ? config.background : undefined);
                                const container = renderPageContainer(
                                    renderTemplate(elementsToRender, monthDummyDay, false, false, pageCount + 1, printW, printH, 'intro', mPage.id),
                                    `monthly-intro-${currentMonth}-${mPage.id}`,
                                    false,
                                    pageBg
                                );
                                if (container) pages.push(container);
                            });
                        } else {
                            // Renderiza o verso específico escolhido
                            const versoContainer = renderDividerVersoPage(currentMonth, currentYear, pageCount + 1, versoContent);
                            if (versoContainer) pages.push(versoContainer);

                            // Renderiza as demais páginas introdutórias mensais se houverem, excluindo a própria página caso tenha sido usada como verso
                            if (hasIntroPages && hasIntroPagesData) {
                                const monthDummyDay: DayData = {
                                    dayOfMonth: 1,
                                    month: currentMonth,
                                    year: currentYear,
                                    dayOfWeek: new Date(currentYear, currentMonth, 1).getDay(),
                                    date: new Date(currentYear, currentMonth, 1)
                                };
                                config.monthlyIntroPages.forEach(mPage => {
                                    if (mPage.id === versoContent) return; // Não duplicar se ela foi usada para o verso
                                    const isEven = (pageCount + 1) % 2 === 0;
                                    const elementsToRender = isEven ? getMirroredElements(mPage.elements) : mPage.elements;
                                    const pageBg = mPage.background || (config.background?.showOnIntroPages ? config.background : undefined);
                                    const container = renderPageContainer(
                                        renderTemplate(elementsToRender, monthDummyDay, false, false, pageCount + 1, printW, printH, 'intro', mPage.id),
                                        `monthly-intro-${currentMonth}-${mPage.id}`,
                                        false,
                                        pageBg
                                    );
                                    if (container) pages.push(container);
                                });
                            }
                        }
                    } else if (hasIntroPages && hasIntroPagesData) {
                        const monthDummyDay: DayData = {
                            dayOfMonth: 1,
                            month: currentMonth,
                            year: currentYear,
                            dayOfWeek: new Date(currentYear, currentMonth, 1).getDay(),
                            date: new Date(currentYear, currentMonth, 1)
                        };
                        config.monthlyIntroPages.forEach(mPage => {
                            const isEven = (pageCount + 1) % 2 === 0;
                            const elementsToRender = isEven ? getMirroredElements(mPage.elements) : mPage.elements;
                            const pageBg = mPage.background || (config.background?.showOnIntroPages ? config.background : undefined);
                            const container = renderPageContainer(
                                renderTemplate(elementsToRender, monthDummyDay, false, false, pageCount + 1, printW, printH, 'intro', mPage.id),
                                `monthly-intro-${currentMonth}-${mPage.id}`,
                                false,
                                pageBg
                            );
                            if (container) pages.push(container);
                        });
                    }
                    
                    lastMonth = currentMonth;
                }
            }

            // Ensure Week Left Page is on an EVEN page (Left)
            // To make the next page EVEN, current pageCount must be ODD.
            if (pageCount % 2 === 0) {
                const filler = renderFillerPage(pageCount + 1);
                if (filler) pages.push(filler);
            }

            // Left Page
            const elementsL = config.elementsWeeklyLeft || config.elements;
            const containerL = renderPageContainer(
                <div className="w-full h-full relative overflow-visible">
                    {renderTemplate(elementsL, null, false, false, pageCount + 1, printW, printH, 'weekly_left', undefined, week)}
                </div>,
                `week-l-${weekIndex}`,
                false,
                dailyBg
            );
            if (containerL) pages.push(containerL);

            // Right Page
            const elementsR = config.elementsWeeklyRight || config.elements;
            const containerR = renderPageContainer(
                <div className="w-full h-full relative overflow-visible">
                    {renderTemplate(elementsR, null, false, false, pageCount + 1, printW, printH, 'weekly_right', undefined, week)}
                </div>,
                `week-r-${weekIndex}`,
                false,
                dailyBg
            );
            if (containerR) pages.push(containerR);
        });
    }
    return pages;
  };

  const renderBorderControls = (style: LayoutElement['style'], onChange: (update: Partial<LayoutElement['style']>) => void) => (
      <div className="space-y-3 pt-3 border-t border-gray-100">
          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Borda e Contorno</h4>
          <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-gray-500">Espessura (px)</label>
              <input 
                  type="number" 
                  min="0" 
                  max="20" 
                  step="0.5" 
                  value={style.borderWidth ?? 0} 
                  onChange={(e) => onChange({ borderWidth: parseFloat(e.target.value) || 0 })} 
                  className="w-16 text-xs p-1 border rounded" 
              />
          </div>
          {(style.borderWidth ?? 0) > 0 && (
              <>
                  <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-gray-500">Cor da Borda</label>
                      <div className="flex h-6 border border-gray-200 rounded overflow-hidden">
                          <input 
                              type="color" 
                              value={style.borderColor || '#000000'} 
                              onChange={(e) => onChange({ borderColor: e.target.value })} 
                              className="w-8 h-full p-0 border-0 cursor-pointer" 
                          />
                      </div>
                  </div>
                  <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-gray-500">Estilo</label>
                      <select 
                          value={style.borderStyle || 'solid'} 
                          onChange={(e) => onChange({ borderStyle: e.target.value as any })} 
                          className="text-[10px] p-1 border rounded bg-white"
                      >
                          <option value="solid">Sólida</option>
                          <option value="dashed">Tracejada</option>
                          <option value="dotted">Pontilhada</option>
                          <option value="double">Dupla</option>
                          <option value="groove">Entalhada (Groove)</option>
                          <option value="ridge">Ressaltada (Ridge)</option>
                          <option value="inset">Inserida (Inset)</option>
                          <option value="outset">Destacada (Outset)</option>
                      </select>
                  </div>
                  <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-gray-500">Arredondamento</label>
                      <input 
                          type="number" 
                          min="0" 
                          max="100" 
                          value={style.borderRadius ?? 0} 
                          onChange={(e) => onChange({ borderRadius: parseInt(e.target.value) || 0 })} 
                          className="w-16 text-xs p-1 border rounded" 
                      />
                  </div>
              </>
          )}
      </div>
  );

  const renderTypographyControls = (values: TextStyleConfig, onChange: (update: Partial<TextStyleConfig>) => void) => (
      <div className="space-y-4">
           <div>
             <div className="flex items-center justify-between mb-1">
               <label className="block text-[10px] font-bold text-gray-500 uppercase">Fonte</label>
               <button 
                 onClick={() => fontInputRef.current?.click()} 
                 className="text-[9px] text-indigo-600 hover:text-indigo-800 font-bold uppercase tracking-tighter flex items-center gap-1"
                 title="Subir fonte personalizada (TTF, OTF, WOFF)"
               >
                 <icons.Plus className="w-2.5 h-2.5" />
                 Subir Fonte
               </button>
             </div>
             <div className="relative">
               <select 
                 value={values.fontFamily || 'Inter'} 
                 onChange={(e) => onChange({ fontFamily: e.target.value })} 
                 className="w-full text-xs p-1.5 border border-gray-200 rounded appearance-none bg-white font-sans"
               >
                 <optgroup label="Padrão">
                   {AVAILABLE_FONTS.map(font => (
                     <option key={font} value={font} style={{ fontFamily: font }}>{font}</option>
                   ))}
                 </optgroup>
                 {customFonts.length > 0 && (
                   <optgroup label="Minhas Fontes">
                     {customFonts.map(font => (
                       <option key={font} value={font} style={{ fontFamily: font }}>{font}</option>
                     ))}
                   </optgroup>
                 )}
               </select>
               <ChevronDown className="w-3 h-3 text-gray-400 absolute right-2 top-2.5 pointer-events-none" />
             </div>
           </div>
           <div className="flex gap-2"><div className="flex-1"><label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Tamanho</label><input type="number" min="4" max="100" value={values.fontSize || 12} onChange={(e) => onChange({ fontSize: parseInt(e.target.value) })} className="w-full text-xs p-1.5 border border-gray-200 rounded" /></div><div className="flex-1"><label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Cor Texto</label><div className="flex h-[30px] border border-gray-200 rounded overflow-hidden"><input type="color" value={(values.color && values.color.startsWith('#')) ? values.color : '#000000'} onChange={(e) => onChange({ color: e.target.value })} className="w-8 h-full p-0 border-0 cursor-pointer" /><input type="text" value={values.color || '#000000'} onChange={(e) => onChange({ color: e.target.value })} className="w-full text-[10px] uppercase p-1 border-l" /></div></div></div>
           <div className="flex-1"><label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Cor Fundo</label><div className="flex h-[30px] border border-gray-200 rounded overflow-hidden"><input type="color" value={(values.backgroundColor && values.backgroundColor.startsWith('#')) ? values.backgroundColor : '#ffffff'} onChange={(e) => onChange({ backgroundColor: e.target.value })} className="w-8 h-full p-0 border-0 cursor-pointer" /><div className="flex-1 flex items-center px-1"><button onClick={() => onChange({ backgroundColor: 'transparent' })} className="text-[10px] text-gray-500 hover:text-red-500 bg-transparent">Sem Fundo</button></div></div></div>
           <div className="flex gap-2"><div className="flex-1"><label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Peso</label><select value={values.fontWeight || 'normal'} onChange={(e) => onChange({ fontWeight: e.target.value })} className="w-full text-xs p-1.5 border border-gray-200 rounded bg-white"><option value="normal">Normal</option><option value="bold">Bold</option><option value="300">Light</option><option value="900">Black</option></select></div><div className="flex-1"><label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Tracking</label><input type="number" step="0.5" value={values.letterSpacing || 0} onChange={(e) => onChange({ letterSpacing: parseFloat(e.target.value) })} className="w-full text-xs p-1.5 border border-gray-200 rounded" /></div></div>
           <div className="space-y-2"><label className="block text-[10px] font-bold text-gray-500 uppercase">Estilo & Alinhamento</label>
           <div className="flex flex-col gap-1">
               <div className="flex border border-gray-200 rounded overflow-hidden divide-x divide-gray-100">
                   <button onClick={() => onChange({ textAlign: 'left' })} className={`flex-1 p-1.5 hover:bg-gray-50 ${values.textAlign === 'left' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500'}`} title="Esquerda"><AlignLeft className="w-3.5 h-3.5 mx-auto"/></button>
                   <button onClick={() => onChange({ textAlign: 'center' })} className={`flex-1 p-1.5 hover:bg-gray-50 ${values.textAlign === 'center' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500'}`} title="Centro"><AlignCenter className="w-3.5 h-3.5 mx-auto"/></button>
                   <button onClick={() => onChange({ textAlign: 'right' })} className={`flex-1 p-1.5 hover:bg-gray-50 ${values.textAlign === 'right' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500'}`} title="Direita"><AlignRight className="w-3.5 h-3.5 mx-auto"/></button>
                   <button onClick={() => onChange({ textAlign: 'justify' })} className={`flex-1 p-1.5 hover:bg-gray-50 ${values.textAlign === 'justify' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500'}`} title="Justificado"><AlignJustify className="w-3.5 h-3.5 mx-auto"/></button>
               </div>
               <div className="flex border border-gray-200 rounded overflow-hidden divide-x divide-gray-100">
                   <button onClick={() => onChange({ verticalAlign: 'top' })} className={`flex-1 p-1.5 hover:bg-gray-50 ${values.verticalAlign === 'top' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500'}`} title="Topo"><ArrowUpToLine className="w-3.5 h-3.5 mx-auto"/></button>
                   <button onClick={() => onChange({ verticalAlign: 'middle' })} className={`flex-1 p-1.5 hover:bg-gray-50 ${values.verticalAlign === 'middle' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500'}`} title="Meio"><AlignCenterVertical className="w-3.5 h-3.5 mx-auto"/></button>
                   <button onClick={() => onChange({ verticalAlign: 'bottom' })} className={`flex-1 p-1.5 hover:bg-gray-50 ${values.verticalAlign === 'bottom' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500'}`} title="Base"><ArrowDownToLine className="w-3.5 h-3.5 mx-auto"/></button>
               </div>
               <div className="flex border border-gray-200 rounded overflow-hidden divide-x divide-gray-100">
                   <button onClick={() => onChange({ textTransform: 'none' })} className={`flex-1 p-1.5 hover:bg-gray-50 ${values.textTransform === 'none' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500'}`} title="Normal"><TypeIcon className="w-3.5 h-3.5 mx-auto"/></button>
                   <button onClick={() => onChange({ textTransform: 'uppercase' })} className={`flex-1 p-1.5 hover:bg-gray-50 ${values.textTransform === 'uppercase' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500'}`} title="Maiúsculas"><CaseUpper className="w-3.5 h-3.5 mx-auto"/></button>
                   <button onClick={() => onChange({ textTransform: 'lowercase' })} className={`flex-1 p-1.5 hover:bg-gray-50 ${values.textTransform === 'lowercase' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500'}`} title="Minúsculas"><CaseLower className="w-3.5 h-3.5 mx-auto"/></button>
                   <button onClick={() => onChange({ textTransform: 'sentence' })} className={`flex-1 p-1.5 hover:bg-gray-50 ${values.textTransform === 'sentence' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500'}`} title="Inicial Maiúscula"><span className="text-[10px] font-bold">Ab</span></button>
                   <button onClick={() => onChange({ textTransform: 'capitalize' })} className={`flex-1 p-1.5 hover:bg-gray-50 ${values.textTransform === 'capitalize' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500'}`} title="Todas Iniciais Maiúsculas"><span className="text-[10px] font-bold">Ab Ab</span></button>
               </div>
           </div>
           </div>
      </div>
  );

  const renderBorderToggle = (active: boolean, onClick: () => void, icon: React.ReactNode, label: string) => (<button onClick={onClick} title={label} className={`p-1.5 rounded border flex flex-col items-center gap-0.5 transition-all ${active ? 'bg-indigo-100 border-indigo-400 text-indigo-700' : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-50'}`}>{icon}</button>);

  const activeList = getActiveElements();
  const selectedElement = activeList.find(e => e.id === selectedId);

  const usableWidthMM = PAGE_WIDTH_MM - config.margins.inside - config.margins.outside;
  const usableHeightMM = PAGE_HEIGHT_MM - config.margins.top - config.margins.bottom;

  const actualTotalPagesCount = useMemo(() => {
    if (generatedData.length === 0) return 0;
    return renderPrintLayout(undefined, undefined, undefined, true).length;
  }, [generatedData, config, showMargins]);

  const totalPages = actualTotalPagesCount;
  const progressPercent = Math.min(100, Math.round(((config.introPages.length + (config.monthlyIntroPages?.length || 0) * 12 + renderedPrintCount) / Math.max(1, totalPages)) * 100));

  const executePrint = useCallback(async () => {
      const isYearRestricted = !(config.projectType === 'notebook' || config.projectType === 'devotional') && 
        config.year !== 2026 && 
        config.year !== 2027 && 
        !(config.year === 2028 && (user.plan?.toLowerCase().includes('2028') || user.plan?.toLowerCase().includes('renovad') || user.plan?.toLowerCase().includes('master')));

      if (isYearRestricted) {
          alert(`Desculpe! O ano de referência do seu arquivo (${config.year}) não está liberado no seu plano anual. Para gerar o PDF e arquivos finais deste ano, é necessária a renovação da sua assinatura. Atualmente você pode gerar planners de 2026 e 2027.`);
          return;
      }
      setPdfExporting(true);
      setPdfExportProgress(0);
      
      try {
          const totalPagesCount = actualTotalPagesCount;
          const { jsPDF } = await import('jspdf');
          const html2canvas = (await import('html2canvas')).default;
          
          const orientation = config.orientation === 'portrait' ? 'p' : 'l';
          const pdf = new jsPDF({
              orientation: orientation,
              unit: 'mm',
              format: [PAGE_WIDTH_MM, PAGE_HEIGHT_MM],
              compress: true
          });
          
          // Determine scale and quality settings based on selected mode
          let selectedScale = 1.5;
          let jpegQuality = 0.90;
          if (pdfScaleMode === 'fast') {
              selectedScale = 1.0;
              jpegQuality = 0.85;
          } else if (pdfScaleMode === 'high') {
              selectedScale = 2.22;
              jpegQuality = 0.93;
          }
          
          // Process pages in parallel batches of 4 to maximize rendering speed under safety limits
          const batchSize = 4;
          
          for (let i = 1; i <= totalPagesCount; i += batchSize) {
              const batchIds = [];
              for (let b = 0; b < batchSize && (i + b) <= totalPagesCount; b++) {
                  batchIds.push(i + b);
              }
              
              // Render multiple pages in parallel
              const batchResults = await Promise.all(batchIds.map(async (pageNum) => {
                  const pageElement = document.getElementById(`preview-page-${pageNum}`);
                  if (!pageElement) {
                      console.warn(`Página preview-page-${pageNum} não encontrada na renderização.`);
                      return null;
                  }
                  
                  const canvas = await html2canvas(pageElement, {
                      scale: selectedScale,
                      useCORS: true,
                      logging: false,
                      backgroundColor: '#ffffff',
                      allowTaint: true,
                      imageTimeout: 15000,
                      onclone: (clonedDoc) => {
                          const clonedEl = clonedDoc.getElementById(`preview-page-${pageNum}`);
                          if (clonedEl) {
                              clonedEl.style.boxShadow = 'none';
                          }
                      }
                  });
                  
                  const imgData = canvas.toDataURL('image/jpeg', jpegQuality);
                  return { pageNum, imgData };
              }));
              
              // Add generated pages chronologically to the PDF
              for (const result of batchResults) {
                  if (!result) continue;
                  if (result.pageNum > 1) {
                      pdf.addPage([PAGE_WIDTH_MM, PAGE_HEIGHT_MM], orientation);
                  }
                  pdf.addImage(result.imgData, 'JPEG', 0, 0, PAGE_WIDTH_MM, PAGE_HEIGHT_MM, undefined, 'FAST');
              }
              
              setPdfExportProgress(Math.min(totalPagesCount, i + batchSize - 1));
              
              // Small pause to let UI thread breathe and render progress bar
              await new Promise(resolve => setTimeout(resolve, 5));
          }
          
          pdf.save(`${config.name || 'Agenda_Master'}.pdf`);
          setPrintStatus('idle');
      } catch (err) {
          console.error('Erro ao gerar o PDF:', err);
          alert('Erro ao processar as páginas do PDF. Por favor, feche as abas extras e tente de novo.');
      } finally {
          setPdfExporting(false);
          setPdfExportProgress(0);
      }
  }, [actualTotalPagesCount, config, PAGE_WIDTH_MM, PAGE_HEIGHT_MM, pdfScaleMode]);

  const executeVectorPrint = useCallback(() => {
      const isYearRestricted = !(config.projectType === 'notebook' || config.projectType === 'devotional') && 
        config.year !== 2026 && 
        config.year !== 2027 && 
        !(config.year === 2028 && (user.plan?.toLowerCase().includes('2028') || user.plan?.toLowerCase().includes('renovad') || user.plan?.toLowerCase().includes('master')));

      if (isYearRestricted) {
          alert(`Desculpe! O ano de referência do seu arquivo (${config.year}) não está liberado no seu plano anual. Para gerar o PDF e arquivos finais deste ano, é necessária a renovação da sua assinatura. Atualmente você pode gerar planners de 2026 e 2027.`);
          return;
      }
      window.print();
  }, [config.projectType, config.year]);

  return (
    <div className={`flex flex-col h-screen overflow-hidden bg-gray-100 text-gray-900 ${isMobile ? 'pb-safe' : ''}`}>
      <style>{`
        @media print {
          @page {
            size: ${PAGE_WIDTH_MM}mm ${PAGE_HEIGHT_MM}mm;
            margin: 0;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            width: ${PAGE_WIDTH_MM}mm !important;
            height: ${PAGE_HEIGHT_MM}mm !important;
            overflow: hidden !important;
            background-color: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body * { 
            visibility: hidden !important; 
          }
          #print-container, #print-container * { 
            visibility: visible !important; 
          }
          #print-container {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: ${PAGE_WIDTH_MM}mm !important;
            height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            z-index: 99999 !important;
            opacity: 100 !important;
            display: block !important;
          }
          .print-break-page {
            page-break-after: always !important;
            break-after: page !important;
            width: ${PAGE_WIDTH_MM}mm !important;
            height: ${PAGE_HEIGHT_MM}mm !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
            outline: none !important;
            box-sizing: border-box !important;
            float: none !important;
            overflow: hidden !important;
            background-color: white !important;
            display: block !important;
            position: relative !important;
          }
          .no-print { 
            display: none !important; 
          }
        }
      `}</style>
      
      {!isMobile && (
          <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-[100] no-print">
              <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                      <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                      <h1 className="text-lg font-black text-gray-900 leading-none">AgendaMaster <span className="text-indigo-600">AI</span></h1>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Editor Profissional</p>
                  </div>
              </div>

              <div className="flex items-center bg-gray-100 p-1 rounded-xl gap-1">
                  <button 
                  onClick={() => setActiveTab('editor')}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'editor' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                  <Layout className="w-4 h-4" />
                  EDITOR
                  </button>
                  <button 
                  onClick={() => setActiveTab('preview')}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'preview' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                  <Eye className="w-4 h-4" />
                  VISUALIZAR
                  </button>
                  <button 
                  onClick={() => setActiveTab('opentype')}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'opentype' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                  <Type className="w-4 h-4" />
                  GLIFOS OPENTYPE
                  </button>
              </div>

              <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">{user.name}</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                      <button 
                      onClick={() => executePrint()}
                      className="p-2 transition-all hover:bg-gray-100 rounded-lg text-gray-400 hover:text-indigo-600"
                      title="Exportar PDF"
                      >
                      <FileDown className="w-5 h-5" />
                      </button>
                      <button 
                      onClick={onLogout}
                      className="p-2 transition-all hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500"
                      title="Sair"
                      >
                      <LogOut className="w-5 h-5" />
                      </button>
                  </div>
              </div>
          </header>
      )}

      {isMobile && (
          <header className={`h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-[100] no-print ${activeTab === 'preview' ? 'hidden' : ''}`}>
              <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-black text-gray-900 tracking-tight">AgendaMaster <span className="text-indigo-600">AI</span></span>
              </div>
              <div className="flex items-center gap-2">
                  <button 
                      onClick={() => setActiveTab(activeTab === 'editor' ? 'preview' : 'editor')}
                      className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                      {activeTab === 'editor' ? <Eye className="w-5 h-5" /> : <Layout className="w-5 h-5" />}
                  </button>
                  <button 
                      onClick={() => executePrint()}
                      className="p-2 bg-indigo-600 text-white rounded-lg shadow-md shadow-indigo-100"
                  >
                      <FileDown className="w-5 h-5" />
                  </button>
              </div>
          </header>
      )}
      
      {printStatus !== 'idle' && (
          <div id="print-container" className="absolute top-0 left-0 -z-50 opacity-0 print:opacity-100 print:z-50 pointer-events-none print:pointer-events-auto">
              {renderPrintLayout(undefined, undefined, renderedPrintCount)}
          </div>
      )}

      {printStatus !== 'idle' && (
          <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center flex-col text-white transition-opacity duration-300 no-print p-6 animate-fade-in">
              {printStatus === 'generating' ? (
                  <div className="w-full max-w-md bg-white/10 p-6 rounded-2xl border border-white/20 backdrop-blur-xl shadow-2xl flex flex-col items-center">
                        <Loader2 className="w-12 h-12 animate-spin mb-4 text-indigo-400" />
                        <h2 className="text-xl font-bold mb-1">Preparando Páginas...</h2>
                        <p className="text-sm opacity-70 mb-6 text-center">
                            Calculando diagramação {config.introPages.length + renderedPrintCount} de {totalPages}...
                        </p>
                        <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden mb-6">
                            <div 
                                className="h-full bg-indigo-500 transition-all duration-300 ease-out relative" 
                                style={{ width: `${progressPercent}%` }}
                            >
                                <div className="absolute inset-0 bg-white/20 animate-[shimmer_1s_infinite] w-full h-full transform skew-x-12"></div>
                            </div>
                        </div>
                        <button 
                            onClick={cancelPrint} 
                            className="w-full py-3 px-4 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium text-sm transition-colors border border-white/10"
                        >
                            Cancelar
                        </button>
                  </div>
              ) : pdfExporting ? (
                  <div className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center text-gray-800 animate-in zoom-in duration-300">
                        <Loader2 className="w-12 h-12 animate-spin mb-4 text-indigo-600" />
                        <h2 className="text-2xl font-black mb-2 text-center text-indigo-950 animate-pulse">Compilando PDF Final...</h2>
                        <p className="text-sm text-gray-500 mb-6 text-center max-w-sm">
                            Processando alinhamento milimétrico {pdfExportProgress} de {actualTotalPagesCount} páginas. Por favor, mantenha a janela aberta.
                        </p>
                        
                        <div className="w-full bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-6">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-bold text-indigo-800">Progresso da Renderização</span>
                                <span className="text-xs font-black text-indigo-950">{Math.round((pdfExportProgress / Math.max(1, actualTotalPagesCount)) * 100)}%</span>
                            </div>
                            <div className="w-full h-3 bg-indigo-100 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-indigo-600 transition-all duration-300" 
                                    style={{ width: `${Math.round((pdfExportProgress / Math.max(1, actualTotalPagesCount)) * 100)}%` }}
                                />
                            </div>
                        </div>
                        
                        <button 
                            disabled
                            className="w-full py-3 px-4 rounded-lg bg-gray-200 text-gray-400 font-medium text-sm cursor-not-allowed text-center"
                        >
                            Aguarde, gerando arquivo...
                        </button>
                  </div>
              ) : (
                  <div className="w-full max-w-lg bg-white p-6 sm:p-8 rounded-2xl shadow-2xl flex flex-col items-center text-gray-800 animate-in zoom-in duration-300">
                      <div className="bg-indigo-100 p-2.5 rounded-full mb-3">
                          <CheckCircle2 className="w-7 h-7 text-indigo-600" />
                      </div>
                      
                      <h2 className="text-xl font-black mb-1 text-center text-indigo-950">Seu arquivo está pronto!</h2>
                      <p className="text-xs text-gray-500 mb-5 text-center max-w-xs">
                          Escolha o melhor método de exportação para as suas {actualTotalPagesCount} páginas de acordo com a sua necessidade de uso.
                      </p>

                      {/* Seletor de Tecnologia / Método */}
                      <div className="flex bg-gray-100 p-1 rounded-xl mb-5 w-full">
                          <button
                              type="button"
                              onClick={() => setPdfExportMethod('vector')}
                              className={`flex-1 py-2 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-1.5 ${pdfExportMethod === 'vector' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10' : 'text-gray-500 hover:text-gray-700'}`}
                          >
                              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> PDF Vetorial 💎
                          </button>
                          <button
                              type="button"
                              onClick={() => setPdfExportMethod('canvas')}
                              className={`flex-1 py-2 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-1.5 ${pdfExportMethod === 'canvas' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10' : 'text-gray-500 hover:text-gray-700'}`}
                          >
                              <FileImage className="w-3.5 h-3.5" /> PDF por Imagem
                          </button>
                      </div>

                      {pdfExportMethod === 'vector' ? (
                          <div className="w-full text-left space-y-4 mb-5">
                              <div className="bg-emerald-50 border border-emerald-100/80 rounded-xl p-3.5 flex gap-3">
                                  <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg shrink-0 h-8 w-8 flex items-center justify-center">
                                      <Sparkles className="w-4 h-4 fill-emerald-600 text-emerald-600" />
                                  </div>
                                  <div>
                                      <h3 className="text-xs font-bold text-emerald-900">Modo Vetorial (Vantagens Profissionais)</h3>
                                      <p className="text-[10px] text-emerald-800/80 mt-0.5 leading-relaxed">
                                          Gera o miolo inteiro em <strong>vetores nativos</strong>. Garante nitidez absoluta perfeita nas fontes e linhas (mesmo com zoom de 1000%), gera arquivos super leves (<strong>de 200MB vira ~5MB</strong>) e o processamento é <strong>instantâneo</strong>.
                                      </p>
                                  </div>
                              </div>

                              <div className="border border-gray-100 bg-gray-50/50 rounded-xl p-4 space-y-3">
                                  <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                      <Info className="w-3.5 h-3.5 text-indigo-500" /> Passo a Passo para Salvar o PDF:
                                  </h4>
                                  
                                  <ul className="space-y-2.5">
                                      <li className="flex items-start gap-2.5">
                                          <div className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">1</div>
                                          <p className="text-[10px] text-gray-600 leading-relaxed">
                                              No diálogo que abrir, selecione <strong>"Salvar como PDF"</strong> (ou "Exportar para PDF") no campo Destino.
                                          </p>
                                      </li>
                                      <li className="flex items-start gap-2.5">
                                          <div className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">2</div>
                                          <p className="text-[10px] text-gray-600 leading-relaxed">
                                              Marque/Ative a opção <strong>"Gráficos de Fundo"</strong> (Background Graphics) nas configurações de cabeçalhos/rodapés de impressão.
                                          </p>
                                      </li>
                                      <li className="flex items-start gap-2.5">
                                          <div className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">3</div>
                                          <p className="text-[10px] text-gray-600 leading-relaxed">
                                              Defina as Margens como <strong>"Nenhuma"</strong> (None) para preservar o alinhamento exato de refile e sangria.
                                          </p>
                                      </li>
                                  </ul>
                              </div>
                              
                              <p className="text-[9px] text-gray-400/80 leading-normal text-center italic">
                                  Dica: Se estiver no painel do AI Studio, abra em "Nova Guia" de antemão para ter total controle sobre o menu de impressão do seu navegador.
                              </p>
                          </div>
                      ) : (
                          <>
                              <div className="w-full space-y-2.5 mb-5 text-left">
                                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Opção de Velocidade & Qualidade:</label>
                          
                          {/* Fast choice */}
                          <button 
                              key="pdf-speed-fast"
                              type="button"
                              onClick={() => setPdfScaleMode('fast')}
                              className={`w-full p-3 rounded-xl border text-left flex items-start gap-3 transition-all ${pdfScaleMode === 'fast' ? 'border-amber-500 bg-amber-50/20 ring-2 ring-amber-500/25' : 'border-gray-200 hover:border-gray-300 bg-gray-50/50'}`}
                          >
                              <div className={`p-2 rounded-lg ${pdfScaleMode === 'fast' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'} shrink-0`}>
                                  <Clock className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                      <span className="text-xs font-bold text-gray-900 block">⚡ Modo Relâmpago (Super Rápido)</span>
                                      <span className="text-[9px] font-black text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded uppercase">Até 4x mais rápido</span>
                                  </div>
                                  <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">
                                      Gera o PDF em segundos com resolução padrão (Escala 1.0x). Perfeito para celulares, computadores básicos ou testes rápidos.
                                  </p>
                              </div>
                          </button>

                          {/* Standard choice */}
                          <button 
                              key="pdf-speed-standard"
                              type="button"
                              onClick={() => setPdfScaleMode('standard')}
                              className={`w-full p-3 rounded-xl border text-left flex items-start gap-3 transition-all ${pdfScaleMode === 'standard' ? 'border-indigo-500 bg-indigo-50/25 ring-2 ring-indigo-500/25' : 'border-gray-200 hover:border-gray-300 bg-gray-50/50'}`}
                          >
                              <div className={`p-2 rounded-lg ${pdfScaleMode === 'standard' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'} shrink-0`}>
                                  <Smartphone className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                      <span className="text-xs font-bold text-gray-900 block">🚀 Modo Equilibrado (Recomendado)</span>
                                      <span className="text-[9px] font-black text-indigo-700 bg-indigo-100 px-1.5 py-0.5 rounded uppercase font-mono">Mais estável</span>
                                  </div>
                                  <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">
                                      Resolução otimizada para telas e leitura digital (Escala 1.5x) e arquivos mais leves. Rapidez combinada a uma excelente nitidez.
                                  </p>
                              </div>
                          </button>

                          {/* High quality choice */}
                          <button 
                              key="pdf-speed-high"
                              type="button"
                              onClick={() => setPdfScaleMode('high')}
                              className={`w-full p-3 rounded-xl border text-left flex items-start gap-3 transition-all ${pdfScaleMode === 'high' ? 'border-emerald-500 bg-emerald-50/20 ring-2 ring-emerald-500/25' : 'border-gray-200 hover:border-gray-300 bg-gray-50/50'}`}
                          >
                              <div className={`p-2 rounded-lg ${pdfScaleMode === 'high' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'} shrink-0`}>
                                  <CheckSquare className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                      <span className="text-xs font-bold text-gray-900 block">💎 Alta Fidelidade (Impressão Física)</span>
                                      <span className="text-[9px] font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded uppercase">Alta Resolução</span>
                                  </div>
                                  <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">
                                      Suporte de alta fidelidade e escala máxima (2.22x) idêntico ao original. O processamento consome mais recursos e tempo.
                                  </p>
                              </div>
                          </button>
                      </div>

                      <div className="w-full bg-indigo-50/50 border border-indigo-100/50 rounded-xl p-3 mb-5 text-left flex items-start gap-2">
                          <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                          <p className="text-[11px] text-indigo-900 leading-relaxed">
                              Nosso motor foi otimizado para renderizar em lotes simultâneos. Independente do modo acima, a compilação agora está <strong>até 4x mais rápida</strong> que antes!
                          </p>
                      </div>
                          </>
                      )}
 
                      <div className="flex gap-3 w-full">
                          <button 
                              onClick={cancelPrint} 
                              className="flex-1 py-3 px-4 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm transition-colors"
                          >
                              Cancelar
                          </button>
                          
                          {pdfExportMethod === 'vector' ? (
                              <button 
                                  onClick={executeVectorPrint}
                                  className="flex-1 py-3 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2"
                              >
                                  <Printer className="w-4 h-4"/> Salvar Vetorial (Imprimir)
                              </button>
                          ) : (
                              <button 
                                  onClick={executePrint}
                                  className="flex-1 py-3 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2"
                              >
                                  <FileDown className="w-4 h-4"/> Baixar PDF Agora
                              </button>
                          )}
                      </div>
                  </div>
              )}
          </div>
      )}

      {showImageElementWarning && (
        <div className="fixed inset-0 z-[20000] bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 flex flex-col text-gray-800 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2 text-amber-600">
                <icons.AlertTriangle className="w-5 h-5 flex-shrink-0 animate-bounce" />
                <h3 className="text-base font-black text-gray-950">Aviso: Upload de Fotos</h3>
              </div>
              <button 
                onClick={() => setShowImageElementWarning(false)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <icons.X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-gray-600 leading-relaxed text-left">
              <p>
                Para garantir que o sistema funcione com rapidez e para evitar erros de salvamento, siga as recomendações abaixo:
              </p>

              <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-xl space-y-2">
                <p className="font-bold text-amber-950 flex items-center gap-1">
                  📏 Limite de Tamanho (Máx 1.5MB)
                </p>
                <p className="text-[11px] text-amber-900 leading-normal">
                  Fotos originais tiradas pelo celular são muito pesadas (5MB a 12MB). Se você enviar uma foto muito grande, ela pode esgotar a memória do navegador, travando o editor e fazendo você perder as suas alterações.
                </p>
              </div>

              <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-2">
                <p className="font-bold text-emerald-950 flex items-center gap-1">
                  ⚙️ Como Otimizar Facilmente
                </p>
                <ol className="list-decimal list-inside text-[11px] text-emerald-900 space-y-1 leading-normal">
                  <li><strong>Tire um Print Screen (captura de tela)</strong> da foto no seu celular ou computador e envie o print. Ele mantém ótima qualidade e é super leve!</li>
                  <li>Ou <strong>envie a foto para si mesma no WhatsApp</strong> e faça o download de lá. O WhatsApp comprime o tamanho de forma automática.</li>
                </ol>
              </div>

              <div className="p-3 bg-indigo-50/50 border border-indigo-200 rounded-xl space-y-2">
                <p className="font-bold text-indigo-950 flex items-center gap-1">
                  🌐 Navegador Recomendado
                </p>
                <p className="text-[11px] text-indigo-900 leading-normal">
                  Sempre use o <strong>Google Chrome</strong> ou <strong>Safari</strong>. Nunca use os navegadores internos do Instagram, Facebook ou WhatsApp, pois eles limitam o tamanho de arquivos e travam constantemente.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                <input 
                  type="checkbox" 
                  id="dont-show-again-el" 
                  checked={dontShowImageElementAgain}
                  onChange={(e) => setDontShowImageElementAgain(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="dont-show-again-el" className="text-[11px] font-bold text-gray-500 cursor-pointer select-none">
                  Não mostrar este aviso novamente
                </label>
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-5 pt-3 border-t border-gray-100">
              <button 
                onClick={() => setShowImageElementWarning(false)}
                className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button 
                onClick={handleConfirmImageElementUpload}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-750 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                Entendi, Escolher Foto
              </button>
            </div>
          </div>
        </div>
      )}

      {showPwaGuideModal && (
        <div className="fixed inset-0 z-[10000] bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 flex flex-col text-gray-800 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-[10px] font-black tracking-widest text-indigo-600 uppercase">Instalação Facilitada</span>
                <h3 className="text-xl font-black text-indigo-950 mt-0.5">Instalar o Agenda Master</h3>
              </div>
              <button 
                onClick={() => setShowPwaGuideModal(false)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                title="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              O <strong>Agenda Master</strong> pode ser instalado como aplicativo original no computador ou celular. Ele carrega instantaneamente, ganha visual limpo de tela cheia e oferece suporte a uso offline! Siga as dicas de acordo com seu aparelho:
            </p>

            <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
              {/* Computador Guide */}
              <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 flex gap-3 text-left">
                <div className="bg-indigo-100 p-2.5 h-fit rounded-lg text-indigo-600 shrink-0">
                  <Monitor className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-indigo-950 mb-1">No Computador (Windows / Mac / Linux)</h4>
                  <p className="text-xs text-gray-600 leading-relaxed mb-2">
                    Abra este link em navegadores baseados em Chromium como o <strong>Google Chrome</strong> ou <strong>Microsoft Edge</strong>:
                  </p>
                  <ol className="list-decimal list-inside text-xs text-gray-600 space-y-1">
                    <li>No canto direito da barra de endereços do navegador, clique no símbolo de instalação (um monitor com uma seta para baixo).</li>
                    <li>Ou simplesmente use o botão <strong>"Instalar App"</strong> que adicionamos no canto superior direito do nosso cabeçalho.</li>
                  </ol>
                </div>
              </div>

              {/* iOS / iPhone Guide */}
              <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4 flex gap-3 text-left">
                <div className="bg-amber-100 p-2.5 h-fit rounded-lg text-amber-600 shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-amber-950 mb-1">No iPhone / iPad (Apple iOS)</h4>
                  <p className="text-xs text-gray-600 leading-relaxed mb-2">
                    A Apple requer o navegador nativo <strong>Safari</strong> para permitir instalações de Web Apps:
                  </p>
                  <ol className="list-decimal list-inside text-xs text-gray-600 space-y-1">
                    <li>Abra este site no navegador <strong>Safari</strong> do seu iPhone.</li>
                    <li>Toque no botão de <strong>Compartilhar</strong> (ícone de um quadrado com seta apontando para cima na barra de navegação).</li>
                    <li>Role as opções e selecione <strong>"Adicionar à Tela de Início"</strong>.</li>
                    <li>Toque em <strong>Adicionar</strong> no canto superior direito para confirmar. Pronto! O app aparecerá nos seus aplicativos.</li>
                  </ol>
                </div>
              </div>

              {/* Android Guide */}
              <div className="bg-green-50/50 border border-green-100 rounded-xl p-4 flex gap-3 text-left">
                <div className="bg-green-100 p-2.5 h-fit rounded-lg text-green-600 shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-green-950 mb-1">No Celular Android</h4>
                  <p className="text-xs text-gray-600 leading-relaxed mb-2">
                    Fácil instalação em qualquer aparelho Android recente:
                  </p>
                  <ol className="list-decimal list-inside text-xs text-gray-600 space-y-1">
                    <li>No seu navegador (como o <strong>Google Chrome</strong>), toque no botão <strong>"Instalar App"</strong> do menu superior.</li>
                    <li>Se não encontrar o botão, clique no menu de <strong>três pontinhos (...)</strong> localizado no topo/rodapé do seu navegador e escolha <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.</li>
                  </ol>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setShowPwaGuideModal(false)}
                className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg hover:shadow-indigo-500/20 transition-all text-center"
              >
                Entendido, Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {contextMenu && (
        <div 
          className="fixed z-[9999] bg-white border border-gray-200 rounded shadow-xl py-1 min-w-[180px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
          onContextMenu={(e) => e.preventDefault()}
        >
          {contextMenu.elementId ? (
            <>
              <button onClick={() => { duplicateElement(contextMenu.elementId); setContextMenu(null); }} className="w-full text-left px-4 py-2 text-xs hover:bg-indigo-50 flex items-center gap-2 text-gray-700">
                <Copy className="w-3.5 h-3.5" /> Duplicar {selectedIds.length > 1 ? 'Selecionados' : 'Item'}
              </button>
              <button onClick={() => { copyToClipboard(contextMenu.elementId); setContextMenu(null); }} className="w-full text-left px-4 py-2 text-xs hover:bg-indigo-50 flex items-center gap-2 text-gray-700">
                <Copy className="w-3.5 h-3.5" /> Copiar
              </button>
              <button onClick={() => { pasteFromClipboard(); setContextMenu(null); }} className="w-full text-left px-4 py-2 text-xs hover:bg-indigo-50 flex items-center gap-2 text-gray-700 disabled:opacity-30" disabled={!internalClipboard}>
                <ClipboardList className="w-3.5 h-3.5" /> Colar
              </button>
              
              <div className="h-px bg-gray-100 my-1"></div>
              
              {selectedIds.length >= 2 && (
                <button onClick={() => { groupSelected(); setContextMenu(null); }} className="w-full text-left px-4 py-2 text-xs hover:bg-indigo-50 flex items-center gap-2 text-indigo-600 font-medium">
                   <Layers className="w-3.5 h-3.5" /> Agrupar Selecionados
                </button>
              )}

              {selectedIds.some(id => {
                  const el = getActiveElements().find(e => e.id === id);
                  return el && el.groupId;
              }) && (
                <button onClick={() => { ungroupSelected(); setContextMenu(null); }} className="w-full text-left px-4 py-2 text-xs hover:bg-indigo-50 flex items-center gap-2 text-gray-700">
                   <X className="w-3.5 h-3.5" /> Desagrupar
                </button>
              )}

              <div className="h-px bg-gray-100 my-1"></div>
              <button onClick={() => { moveLayer(contextMenu.elementId, 'top'); setContextMenu(null); }} className="w-full text-left px-4 py-2 text-xs hover:bg-indigo-50 flex items-center gap-2 text-gray-700">
                <ArrowUpToLine className="w-3.5 h-3.5" /> Trazer para Frente
              </button>
              <button onClick={() => { moveLayer(contextMenu.elementId, 'up'); setContextMenu(null); }} className="w-full text-left px-4 py-2 text-xs hover:bg-indigo-50 flex items-center gap-2 text-gray-700">
                <ChevronUp className="w-3.5 h-3.5" /> Trazer para Cima
              </button>
              <button onClick={() => { moveLayer(contextMenu.elementId, 'down'); setContextMenu(null); }} className="w-full text-left px-4 py-2 text-xs hover:bg-indigo-50 flex items-center gap-2 text-gray-700">
                <ChevronDown className="w-3.5 h-3.5" /> Enviar para Baixo
              </button>
              <button onClick={() => { moveLayer(contextMenu.elementId, 'bottom'); setContextMenu(null); }} className="w-full text-left px-4 py-2 text-xs hover:bg-indigo-50 flex items-center gap-2 text-gray-700">
                <ArrowDownToLine className="w-3.5 h-3.5" /> Enviar para Trás
              </button>
              <div className="h-px bg-gray-100 my-1"></div>
              <button 
                onClick={() => {
                    if (selectedIds.includes(contextMenu.elementId)) {
                        updateActiveElements(getActiveElements().filter(e => !selectedIds.includes(e.id)));
                        setSelectedIds([]);
                    } else {
                        removeElement(contextMenu.elementId);
                    }
                    setContextMenu(null);
                }} 
                className="w-full text-left px-4 py-2 text-xs hover:bg-red-50 text-red-600 flex items-center gap-2"
              >
                <Trash2 className="w-3.5 h-3.5" /> Excluir {selectedIds.length > 1 ? 'Selecionados' : 'Item'}
              </button>
            </>
          ) : (
            <>
              <button onClick={() => { pasteFromClipboard(); setContextMenu(null); }} className="w-full text-left px-4 py-2 text-xs hover:bg-indigo-50 flex items-center gap-2 text-gray-700 disabled:opacity-30 font-medium" disabled={!internalClipboard}>
                <ClipboardList className="w-3.5 h-3.5" /> Colar Elementos Copiados
              </button>
              
              {selectedIds.length > 0 && (
                <>
                  <div className="h-px bg-gray-100 my-1"></div>
                  <button onClick={() => { duplicateElement(); setContextMenu(null); }} className="w-full text-left px-4 py-2 text-xs hover:bg-indigo-50 flex items-center gap-2 text-gray-700">
                    <Copy className="w-3.5 h-3.5" /> Duplicar Seleção ({selectedIds.length})
                  </button>
                  <button onClick={() => { copyToClipboard(); setContextMenu(null); }} className="w-full text-left px-4 py-2 text-xs hover:bg-indigo-50 flex items-center gap-2 text-gray-700">
                    <Copy className="w-3.5 h-3.5" /> Copiar Seleção ({selectedIds.length})
                  </button>
                  <button onClick={() => { removeElement(); setContextMenu(null); }} className="w-full text-left px-4 py-2 text-xs hover:bg-red-50 text-red-600 flex items-center gap-2">
                    <Trash2 className="w-3.5 h-3.5" /> Excluir Seleção ({selectedIds.length})
                  </button>
                  <div className="h-px bg-gray-100 my-1"></div>
                  <button onClick={() => { setSelectedIds([]); setContextMenu(null); }} className="w-full text-left px-4 py-2 text-xs hover:bg-indigo-50 flex items-center gap-2 text-gray-500">
                    <X className="w-3.5 h-3.5" /> Limpar Seleção
                  </button>
                </>
              )}
            </>
          )}
        </div>
      )}

      {variantModal && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm no-print" onClick={() => setVariantModal(null)}>
              <div className="bg-white rounded-lg shadow-2xl border border-gray-200 w-[500px] max-w-full m-4 flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center justify-between p-4 border-b border-gray-100"><h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Escolha o estilo</h3><button onClick={() => setVariantModal(null)} className="text-gray-400 hover:text-red-500"><X className="w-5 h-5"/></button></div>
                  <div className="p-4 grid grid-cols-2 gap-4 overflow-y-auto max-h-[60vh]">
                      {ELEMENT_VARIANTS[variantModal.type]?.map((variant, idx) => (
                          <div key={idx} onClick={() => addElement(variantModal.type, variantModal.label, variant.styleOverride, variant.defaultSize)} className="border border-gray-200 rounded-lg p-4 hover:border-indigo-500 hover:bg-indigo-50 cursor-pointer transition-all flex flex-col items-center gap-3 group">
                              <div className="text-center"><div className="text-sm font-bold text-gray-700 group-hover:text-indigo-700">{variant.name}</div><div className="text-xs text-gray-400">{variant.description}</div></div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      )}

      {versesModalOpen && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm no-print" onClick={() => setVersesModalOpen(false)}>
              <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-[780px] max-w-full m-4 flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
                      <div className="flex items-center gap-2">
                          <div className="bg-indigo-600 p-1.5 rounded-lg shadow-sm"><BookOpen className="w-4 h-4 text-white"/></div>
                          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Personalizar Versículos</h3>
                      </div>
                      <button onClick={() => setVersesModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors p-1 hover:bg-red-50 rounded-full"><X className="w-5 h-5"/></button>
                  </div>
                  
                  <div className="p-5 overflow-y-auto max-h-[80vh] space-y-4">
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 leading-relaxed">
                          <p className="font-bold mb-1 flex items-center gap-1.5">
                              <Star className="w-4 h-4 text-amber-500 fill-amber-300 shrink-0" />
                              Quer usar seus próprios Versículos ou Mensagens na sua agenda?
                          </p>
                          <p>
                              Agora você pode substituir todas as frases dos dias por uma lista personalizada! É super simples trazer do seu <strong>Excel</strong> ou <strong>Google Sheets</strong> basta colar as linhas ou fazer upload do arquivo.
                          </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
                          {/* Coluna Esquerda: Instrucoes & Arquivo */}
                          <div className="space-y-4 text-left">
                              <div className="space-y-2">
                                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Opção 1: Upload de Arquivo</h4>
                                  <p className="text-[11px] text-gray-500 leading-normal">
                                      Selecione um arquivo de texto (<code className="bg-gray-100 px-1 py-0.5 rounded font-mono font-bold">.txt</code> ou <code className="bg-gray-100 px-1 py-0.5 rounded font-mono font-bold">.csv</code>) contendo um versículo por linha, ou uma lista em <code className="bg-gray-100 px-1 py-0.5 rounded font-mono font-bold">.json</code>.
                                  </p>
                                  
                                  <div className="flex items-center gap-2">
                                      <button
                                          type="button"
                                          onClick={() => document.getElementById('verse-file-input')?.click()}
                                          className="flex items-center justify-center gap-1.5 px-3 py-2 border border-gray-200 text-gray-700 bg-white hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600 rounded text-xs font-bold transition-all cursor-pointer"
                                      >
                                          <Upload className="w-3.5 h-3.5" />
                                          <span>Escolher Arquivo</span>
                                      </button>
                                      <input
                                          id="verse-file-input"
                                          type="file"
                                          accept=".txt,.csv,.json"
                                          onChange={handleImportVersesFile}
                                          className="hidden"
                                      />
                                  </div>
                              </div>

                              <div className="pt-2 space-y-2">
                                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Opção 2: Como colar do Excel</h4>
                                  <ol className="list-decimal list-inside text-[11px] text-gray-600 space-y-1 leading-normal">
                                      <li>Abra sua planilha (Excel ou Sheets).</li>
                                      <li>Selecione e <strong>Copie (Ctrl+C)</strong> a coluna de versículos.</li>
                                      <li>Insira os dados na caixa ao lado e clique em salvar.</li>
                                  </ol>
                              </div>

                              <div className="pt-2 border-t border-gray-100 space-y-2">
                                  <div className="flex items-center justify-between text-xs">
                                      <span className="font-bold text-gray-600">Estado atual:</span>
                                      {customVerses.length > 0 ? (
                                          <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">Ativo (Versículos Próprios)</span>
                                      ) : (
                                          <span className="bg-gray-100 text-gray-600 font-bold px-2 py-0.5 rounded text-[10px]">Ativo (Frases Padrão)</span>
                                      )}
                                  </div>
                                  <p className="text-[10px] text-gray-400 leading-relaxed">
                                      {customVerses.length > 0 
                                          ? `Você tem ${customVerses.length} versículos cadastrados. Eles serão exibidos em ordem rotativa para cada dia do ano.` 
                                          : `O sistema conta com 105 versículos bíblicos padrões selecionados para inspirar o dia a dia.`}
                                  </p>
                                  {customVerses.length > 0 && (
                                      <button 
                                          type="button"
                                          onClick={clearCustomVerses}
                                          className="text-[10px] font-bold text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1.5 rounded transition-all flex items-center gap-1 cursor-pointer"
                                      >
                                          <Trash2 className="w-3.5 h-3.5" />
                                          <span>Voltar aos versículos originais</span>
                                      </button>
                                  )}
                              </div>
                          </div>

                          {/* Coluna Direita: Caixa de Texto */}
                          <div className="flex flex-col gap-3 text-left">
                              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center justify-between">
                                  <span>Colar diretamente</span>
                                  {customVerses.length > 0 && <span className="text-[10px] text-gray-400 normal-case font-medium">Dica: Cole para atualizar</span>}
                              </h4>
                              
                              <textarea
                                  id="pasted-verses-textarea"
                                  placeholder="Cole seus versículos aqui (um por linha)&#13;&#10;Exemplo:&#13;&#10;O Senhor é o meu pastor, nada me faltará. (Salmo 23:1)&#13;&#10;Tudo posso naquele que me fortalece. (Filipenses 4:13)"
                                  className="w-full h-44 p-3 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none font-mono text-gray-700 bg-gray-50/50"
                              ></textarea>

                              <button
                                  type="button"
                                  onClick={() => {
                                      const txt = (document.getElementById('pasted-verses-textarea') as HTMLTextAreaElement)?.value || '';
                                      handlePasteVersesText(txt);
                                      if (txt.trim()) {
                                          (document.getElementById('pasted-verses-textarea') as HTMLTextAreaElement).value = '';
                                      }
                                  }}
                                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded shadow transition-all uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                  <CheckSquare className="w-4 h-4" />
                                  <span>Salvar Texto Colado</span>
                              </button>
                          </div>
                      </div>

                      {/* Preview dos Versículos Atuais */}
                      {customVerses.length > 0 && (
                          <div className="pt-3 border-t border-gray-100 text-left">
                              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Visualização rápida (Primeiros 5 versículos salvos)</h4>
                              <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-200/50 space-y-1 max-h-32 overflow-y-auto custom-scrollbar">
                                  {customVerses.slice(0, 5).map((verse, idx) => (
                                      <div key={idx} className="text-[10px] text-gray-600 border-b border-gray-100 last:border-0 pb-1 last:pb-0 font-sans truncate" title={verse}>
                                          <span className="font-mono text-gray-400 font-bold mr-1 bg-gray-200/50 px-1 py-0.2 rounded text-[9px]">{idx + 1}</span>
                                          {verse}
                                      </div>
                                  ))}
                                  {customVerses.length > 5 && (
                                      <div className="text-[9px] text-gray-400 italic text-center pt-1 animate-pulse">
                                          ... e mais {customVerses.length - 5} versículos cadastrados.
                                      </div>
                                  )}
                              </div>
                          </div>
                      )}
                  </div>

                  <div className="p-3 border-t border-gray-100 bg-gray-50/50 flex justify-end">
                      <button 
                          onClick={() => setVersesModalOpen(false)}
                          className="px-4 py-1.5 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded shadow-sm transition-all focus:ring-2 focus:ring-indigo-500 uppercase tracking-wider"
                      >
                          Fechar
                      </button>
                  </div>
              </div>
          </div>
      )}

      {templateModal && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm no-print" onClick={() => setTemplateModal(false)}>
              <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-[700px] max-w-full m-4 flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
                      <div className="flex items-center gap-2">
                          <div className="bg-indigo-600 p-1.5 rounded-lg shadow-sm"><Layout className="w-4 h-4 text-white"/></div>
                          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Modelos Prontos</h3>
                      </div>
                      <button onClick={() => setTemplateModal(false)} className="text-gray-400 hover:text-red-500 transition-colors p-1 hover:bg-red-50 rounded-full"><X className="w-5 h-5"/></button>
                  </div>
                  
                  <div className="flex border-b border-gray-100">
                      <button 
                        onClick={() => setTemplateCategory('intro')}
                        className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${templateCategory === 'intro' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/30' : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
                      >
                          Páginas Iniciais
                      </button>
                      <button 
                        onClick={() => setTemplateCategory('planner')}
                        className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${templateCategory === 'planner' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/30' : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
                      >
                          Layouts de Planner
                      </button>
                      <button 
                        onClick={() => setTemplateCategory('library')}
                        className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${templateCategory === 'library' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/30' : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
                      >
                          Biblioteca
                      </button>
                      <button 
                        onClick={() => setTemplateCategory('custom')}
                        className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${templateCategory === 'custom' ? 'border-amber-500 text-amber-700 bg-amber-50/30' : 'border-transparent text-gray-400 hover:text-amber-600 hover:bg-amber-50/10'}`}
                      >
                          Meus Modelos ⭐
                      </button>
                      {(config.projectType === 'notebook' || config.projectType === 'devotional') && (
                          <button 
                            onClick={() => setTemplateCategory(config.projectType as any)}
                            className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${templateCategory === config.projectType ? 'border-indigo-600 text-indigo-600 bg-indigo-50/30' : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
                          >
                              {config.projectType === 'notebook' ? 'Miolo Caderno' : 'Modelos Devocional'}
                          </button>
                      )}
                  </div>

                  <div className="p-6 overflow-y-auto max-h-[70vh] bg-gray-50/30">
                      {templateCategory === 'intro' && (
                          <div className="grid grid-cols-2 gap-4">
                              {INTRO_TEMPLATES.map((template) => (
                                  <div 
                                    key={template.id} 
                                    onClick={() => addIntroTemplate(template)} 
                                    className="group relative bg-white border-2 border-gray-100 rounded-xl p-5 hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-100 cursor-pointer transition-all flex flex-col items-center text-center gap-4"
                                  >
                                      <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                                          <FileText className="w-6 h-6 text-indigo-600" />
                                      </div>
                                      <div>
                                          <div className="text-sm font-bold text-gray-800 group-hover:text-indigo-700 transition-colors">{template.name}</div>
                                          <div className="text-[10px] text-gray-400 mt-1 uppercase tracking-wide font-medium">{template.elements.length} elementos editáveis</div>
                                      </div>
                                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <Plus className="w-4 h-4 text-indigo-500" />
                                      </div>
                                  </div>
                              ))}
                          </div>
                      )}

                      {templateCategory === 'notebook' && (
                          <div className="grid grid-cols-2 gap-4">
                              {NOTEBOOK_TEMPLATES.map((template) => (
                                  <div 
                                    key={template.id} 
                                    onClick={() => {
                                        const newElements = template.elements.map(el => ({ ...el, id: Math.random().toString(36).substr(2, 9) })) as LayoutElement[];
                                        setConfig({ ...config, elements: newElements });
                                        setTemplateModal(false);
                                    }} 
                                    className="group relative bg-white border-2 border-gray-100 rounded-xl p-5 hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-100 cursor-pointer transition-all flex flex-col items-center text-center gap-4"
                                  >
                                      <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                                          <Grid className="w-6 h-6 text-emerald-600" />
                                      </div>
                                      <div>
                                          <div className="text-sm font-bold text-gray-800 group-hover:text-emerald-700 transition-colors">{template.name}</div>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      )}

                      {templateCategory === 'devotional' && (
                          <div className="grid grid-cols-2 gap-4">
                              {DEVOTIONAL_TEMPLATES.map((template) => (
                                  <div 
                                    key={template.id} 
                                    onClick={() => {
                                        const newElements = template.elements.map(el => ({ ...el, id: Math.random().toString(36).substr(2, 9) })) as LayoutElement[];
                                        setConfig({ ...config, elements: newElements });
                                        setTemplateModal(false);
                                    }} 
                                    className="group relative bg-white border-2 border-gray-100 rounded-xl p-5 hover:border-indigo-500 hover:shadow-lg hover:shadow-rose-100 cursor-pointer transition-all flex flex-col items-center text-center gap-4"
                                  >
                                      <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center group-hover:bg-rose-100 transition-colors">
                                          <ClipboardList className="w-6 h-6 text-rose-600" />
                                      </div>
                                      <div>
                                          <div className="text-sm font-bold text-gray-800 group-hover:text-rose-700 transition-colors">{template.name}</div>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      )}
                      {templateCategory === 'planner' && (
                          <div className="space-y-6">
                              <div className="grid grid-cols-2 gap-6">
                                  <div className="space-y-3">
                                      <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Vertical</h4>
                                      <div className="grid grid-cols-2 gap-2">
                                          <button onClick={() => applyPlannerTemplate('weekly_vertical', 'blank')} className="p-3 bg-white border border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all flex flex-col items-center gap-2">
                                              <div className="w-8 h-10 border border-gray-300 rounded bg-white"></div>
                                              <span className="text-[10px] font-bold text-gray-600">Em Branco</span>
                                          </button>
                                          <button onClick={() => applyPlannerTemplate('weekly_vertical', 'lines')} className="p-3 bg-white border border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all flex flex-col items-center gap-2">
                                              <div className="w-8 h-10 border border-gray-300 rounded bg-white flex flex-col justify-center gap-1 px-1">
                                                  <div className="h-px bg-gray-200 w-full"></div>
                                                  <div className="h-px bg-gray-200 w-full"></div>
                                                  <div className="h-px bg-gray-200 w-full"></div>
                                              </div>
                                              <span className="text-[10px] font-bold text-gray-600">Pautado</span>
                                          </button>
                                          <button onClick={() => applyPlannerTemplate('weekly_vertical', 'dots')} className="p-3 bg-white border border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all flex flex-col items-center gap-2">
                                              <div className="w-8 h-10 border border-gray-300 rounded bg-white flex flex-wrap content-center justify-center gap-1 p-1 overflow-hidden">
                                                  {Array.from({length: 12}).map((_, i) => <div key={i} className="w-0.5 h-0.5 rounded-full bg-gray-300"></div>)}
                                              </div>
                                              <span className="text-[10px] font-bold text-gray-600">Pontilhado</span>
                                          </button>
                                          <button onClick={() => applyPlannerTemplate('weekly_vertical', 'grid')} className="p-3 bg-white border border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all flex flex-col items-center gap-2">
                                              <div className="w-8 h-10 border border-gray-300 rounded bg-white grid grid-cols-3 grid-rows-4 border-collapse">
                                                  {Array.from({length: 12}).map((_, i) => <div key={i} className="border-[0.2px] border-gray-100"></div>)}
                                              </div>
                                              <span className="text-[10px] font-bold text-gray-600">Quadriculado</span>
                                          </button>
                                      </div>
                                  </div>
                                  <div className="space-y-3">
                                      <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Horizontal</h4>
                                      <div className="grid grid-cols-2 gap-2">
                                          <button onClick={() => applyPlannerTemplate('weekly_horizontal', 'blank')} className="p-3 bg-white border border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all flex flex-col items-center gap-2">
                                              <div className="w-10 h-8 border border-gray-300 rounded bg-white"></div>
                                              <span className="text-[10px] font-bold text-gray-600">Em Branco</span>
                                          </button>
                                          <button onClick={() => applyPlannerTemplate('weekly_horizontal', 'lines')} className="p-3 bg-white border border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all flex flex-col items-center gap-2">
                                              <div className="w-10 h-8 border border-gray-300 rounded bg-white flex flex-col justify-center gap-1 px-1">
                                                  <div className="h-px bg-gray-200 w-full"></div>
                                                  <div className="h-px bg-gray-200 w-full"></div>
                                                  <div className="h-px bg-gray-200 w-full"></div>
                                              </div>
                                              <span className="text-[10px] font-bold text-gray-600">Pautado</span>
                                          </button>
                                          <button onClick={() => applyPlannerTemplate('weekly_horizontal', 'dots')} className="p-3 bg-white border border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all flex flex-col items-center gap-2">
                                              <div className="w-10 h-8 border border-gray-300 rounded bg-white flex flex-wrap content-center justify-center gap-1 p-1 overflow-hidden">
                                                  {Array.from({length: 12}).map((_, i) => <div key={i} className="w-0.5 h-0.5 rounded-full bg-gray-300"></div>)}
                                              </div>
                                              <span className="text-[10px] font-bold text-gray-600">Pontilhado</span>
                                          </button>
                                          <button onClick={() => applyPlannerTemplate('weekly_horizontal', 'grid')} className="p-3 bg-white border border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all flex flex-col items-center gap-2">
                                              <div className="w-10 h-8 border border-gray-300 rounded bg-white grid grid-cols-4 grid-rows-3 border-collapse">
                                                  {Array.from({length: 12}).map((_, i) => <div key={i} className="border-[0.2px] border-gray-100"></div>)}
                                              </div>
                                              <span className="text-[10px] font-bold text-gray-600">Quadriculado</span>
                                          </button>
                                      </div>
                                  </div>
                              </div>
                              <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg flex gap-3">
                                  <Info className="w-5 h-5 text-amber-500 shrink-0" />
                                  <p className="text-[10px] text-amber-800 leading-relaxed">
                                      <strong>Atenção:</strong> Ao aplicar um layout de planner, os elementos atuais da sua agenda serão substituídos pelos blocos de dias da semana. Você poderá personalizá-los individualmente depois.
                                  </p>
                              </div>
                          </div>
                      )}

                      {templateCategory === 'library' && (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              {LAYOUT_LIBRARY.map(item => (
                                  <button 
                                      key={item.id}
                                      onClick={() => applyLibraryLayout(item.id)}
                                      className="text-left group bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-indigo-500 hover:shadow-lg transition-all"
                                  >
                                      <div className="h-24 bg-gray-50 flex items-center justify-center border-b border-gray-100 group-hover:bg-indigo-50 transition-colors">
                                          <div className="p-2 bg-white shadow-sm rounded border border-gray-100 scale-75 origin-center">
                                              <div className="w-16 h-20 flex flex-col gap-1">
                                                  <div className="h-2 bg-gray-200 rounded-full w-3/4"></div>
                                                  <div className="flex-1 bg-gray-100 rounded"></div>
                                              </div>
                                          </div>
                                      </div>
                                      <div className="p-4">
                                          <div className="flex items-center justify-between mb-1">
                                              <h5 className="text-xs font-bold text-gray-900 group-hover:text-indigo-600 font-sans">{item.name}</h5>
                                              <span className="text-[8px] font-black uppercase px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded font-mono">{item.category}</span>
                                          </div>
                                          <p className="text-[10px] text-gray-500 line-clamp-2 leading-relaxed">{item.description}</p>
                                      </div>
                                  </button>
                              ))}
                          </div>
                      )}

                      {templateCategory === 'custom' && (
                          <div className="space-y-4 w-full">
                              {/* Gerenciador de Backup de Modelos */}
                              <div className="bg-amber-50/50 border border-amber-200/50 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-xs">
                                  <div className="flex items-center gap-2.5">
                                      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                                          <Star className="w-4 h-4 fill-amber-300" />
                                      </div>
                                      <div>
                                          <h4 className="text-xs font-bold text-amber-900 leading-tight">Backup de Modelos Personalizados</h4>
                                          <p className="text-[10px] text-amber-700/80 mt-0.5 leading-normal">
                                              Salve seus modelos no computador em formato <code className="bg-amber-100/60 px-1 py-0.5 rounded font-mono text-[9px] font-bold">.json</code> para guardá-los ou usá-los em outro navegador.
                                          </p>
                                      </div>
                                  </div>
                                  <div className="flex bg-white rounded-lg p-1 border border-amber-200/40 gap-1 shrink-0 self-start sm:self-center">
                                      <button
                                          type="button"
                                          onClick={exportCustomTemplates}
                                          disabled={customTemplates.length === 0}
                                          className="flex items-center gap-1.5 text-[10px] text-gray-700 hover:text-indigo-600 font-bold hover:bg-gray-50 px-2.5 py-1.5 rounded transition-all disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-gray-400 cursor-pointer"
                                          title="Exportar modelos como arquivo .json"
                                      >
                                        <Download className="w-3.5 h-3.5" />
                                        <span>Exportar</span>
                                      </button>
                                      
                                      <div className="w-px bg-gray-200 my-1"></div>
                                      
                                      <button
                                          type="button"
                                          onClick={() => templateFileInputRef.current?.click()}
                                          className="flex items-center gap-1.5 text-[10px] text-gray-700 hover:text-indigo-600 font-bold hover:bg-gray-50 px-2.5 py-1.5 rounded transition-all cursor-pointer"
                                          title="Importar modelos de um arquivo .json"
                                      >
                                        <Upload className="w-3.5 h-3.5" />
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

                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                  {customTemplates.length === 0 ? (
                                      <div className="col-span-full text-center py-20 text-gray-400 bg-white border border-gray-100 rounded-2xl p-8 flex flex-col items-center justify-center gap-3">
                                          <Star className="w-10 h-10 text-amber-400 animate-bounce fill-amber-100" />
                                          <p className="font-bold text-gray-700 text-sm">Você ainda não tem modelos salvos</p>
                                          <p className="text-xs text-gray-400 max-w-sm leading-relaxed">
                                              Para salvar um modelo personalizado, vá na barra lateral esquerda em <b>Páginas Iniciais</b> ou <b>Páginas Mensais</b>, clique na estrela (⭐) ao lado de qualquer página e salve como seu modelo! Ele ficará disponível aqui.
                                          </p>
                                      </div>
                                  ) : (
                                      customTemplates.map(template => (
                                          <div 
                                              key={template.id}
                                              className="bg-white border-2 border-amber-100 rounded-xl overflow-hidden hover:border-amber-400 hover:shadow-lg transition-all flex flex-col justify-between"
                                          >
                                              <div className="p-4 flex-1">
                                                  <div className="flex items-center gap-2 mb-3">
                                                      <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
                                                          <Star className="w-4 h-4 fill-amber-300" />
                                                      </div>
                                                      <div>
                                                          <h5 className="text-xs font-bold text-gray-900 font-sans leading-tight line-clamp-1">{template.name}</h5>
                                                          <span className="text-[9px] font-bold text-gray-400 tracking-wider uppercase">{template.elements.length} elementos</span>
                                                      </div>
                                                  </div>
                                                  <p className="text-[10px] text-gray-500 leading-relaxed bg-amber-50/30 p-2 rounded border border-dashed border-amber-100/50">
                                                      Este modelo pode ser inserido como Página Inicial ou Página Mensal, tanto em agendas como planners.
                                                  </p>
                                              </div>
                                              <div className="p-3 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
                                                  <button 
                                                      onClick={(e) => { e.stopPropagation(); deleteCustomTemplate(template.id, template.name); }}
                                                      className="text-[10px] text-gray-400 hover:text-red-600 font-bold hover:bg-red-50 py-1 px-2 rounded-md transition-colors"
                                                      title="Excluir Modelo"
                                                  >
                                                      Excluir
                                                  </button>
                                                  <button 
                                                      onClick={() => applyCustomTemplate(template)}
                                                      className="text-[10px] bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1 px-3 rounded shadow transition-all uppercase tracking-wider"
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
                  <div className="p-4 border-t border-gray-100 bg-white text-center">
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Escolha um modelo para começar e edite como desejar</p>
                  </div>
              </div>
          </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden no-print">
          <header className="bg-white border-b border-gray-200 h-14 flex items-center justify-between px-4 z-20 shrink-0">
            <div className="flex items-center space-x-3">
              <div 
                className={`flex items-center space-x-2 ${onConfigure ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
                onClick={() => onConfigure && onConfigure(config)}
              >
                <div className="bg-indigo-600 p-1.5 rounded">
                  <Calendar className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold text-gray-800 hidden lg:block">AgendaMaster AI</span>
              </div>

              <div className="h-6 w-px bg-gray-200 hidden md:block"></div>

              <div className="flex items-center gap-2 group">
                <input
                  type="text"
                  value={config.name || 'Sem Nome'}
                  onChange={(e) => setConfig({ ...config, name: e.target.value })}
                  className="bg-transparent border-none focus:ring-0 text-sm font-bold text-gray-600 hover:bg-gray-50 px-2 py-1 rounded transition-colors w-32 md:w-48"
                  placeholder="Nome do Projeto"
                  title="Clique para renomear o projeto"
                />
                <div className="hidden group-hover:block">
                  <Settings className="w-3 h-3 text-gray-300" />
                </div>
              </div>
              <div className="hidden lg:flex items-center text-[10px] text-gray-400 font-medium bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse"></div>
                Auto-salvo localmente
              </div>
            </div>
            <div className="flex items-center space-x-2 bg-gray-100 p-1 rounded-lg">
              <button onClick={() => setActiveTab('editor')} className={`px-3 py-1.5 text-xs font-medium rounded-md ${activeTab === 'editor' ? 'bg-white shadow text-indigo-600' : 'text-gray-500'}`}>Editar</button>
              <button onClick={() => setActiveTab('preview')} className={`px-3 py-1.5 text-xs font-medium rounded-md ${activeTab === 'preview' ? 'bg-white shadow text-indigo-600' : 'text-gray-500'}`}>Visualizar</button>
              <button onClick={() => setActiveTab('opentype')} className={`px-3 py-1.5 text-xs font-medium rounded-md ${activeTab === 'opentype' ? 'bg-white shadow text-indigo-600' : 'text-gray-500'}`}>Glifos OpenType</button>
            </div>
            <div className="flex items-center space-x-3">
                <button 
                    onClick={handleUndo} 
                    disabled={history.length === 0}
                    className={`p-1.5 rounded-md transition-colors ${history.length === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-100 hover:text-indigo-600'}`}
                    title="Desfazer última alteração"
                >
                    <Undo className="w-5 h-5" />
                </button>

                <div className="h-5 w-px bg-gray-200 mr-2"></div>

                {onConfigure && (
                    <div className="flex items-center space-x-1 mr-2">
                        <button onClick={() => onConfigure(config)} className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 hover:text-indigo-600" title="Voltar para Configuração Inicial">
                            <Settings className="w-5 h-5" />
                        </button>
                    </div>
                )}
                
                <div className="h-5 w-px bg-gray-200 mx-1"></div>

                <div className="flex items-center space-x-1 bg-gray-50 p-1 rounded-md border border-gray-200">
                    <button 
                        onClick={handleExport} 
                        className="flex items-center px-3 py-1.5 text-xs font-bold uppercase tracking-tight text-indigo-600 hover:bg-white rounded transition-all shadow-sm bg-white/50" 
                        title="Salvar alterações no computador"
                    >
                        <icons.Save className="w-4 h-4 mr-2" />
                        Salvar Projeto
                    </button>
                    <div className="w-px h-3 bg-gray-200"></div>
                    <button 
                        onClick={handleImportClick} 
                        className="flex items-center px-3 py-1.5 text-xs font-bold uppercase tracking-tight text-gray-600 hover:text-indigo-600 hover:bg-white rounded transition-all" 
                        title="Abrir um arquivo de projeto salvo anteriormente"
                    >
                        <Upload className="w-4 h-4 mr-2" />
                        Abrir
                    </button>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept=".json" 
                  className="hidden" 
                />
                <input 
                  type="file" 
                  ref={fontInputRef} 
                  onChange={handleFontUpload} 
                  accept=".ttf,.otf,.woff,.woff2" 
                  className="hidden" 
                />
                <input 
                  type="file" 
                  ref={imageInputRef} 
                  onChange={(e) => { if (pendingImageElementId) handleImageUpload(e, pendingImageElementId); }} 
                  accept="image/*" 
                  className="hidden" 
                />

                <div className="h-5 w-px bg-gray-200 mx-1"></div>

                <button onClick={() => setShowAlignment(!showAlignment)} className={`p-1.5 rounded-md ${showAlignment ? 'bg-indigo-50 text-indigo-600 ring-1' : 'text-gray-400'}`} title="Ferramentas de Alinhamento"><BoxSelect className="w-5 h-5" /></button>
                <button onClick={() => setShowLayers(!showLayers)} className={`p-1.5 rounded-md ${showLayers ? 'bg-indigo-50 text-indigo-600 ring-1' : 'text-gray-400'}`} title="Painel de Camadas"><Layers className="w-5 h-5" /></button>
                <button onClick={() => setShowMargins(!showMargins)} className={`p-1.5 rounded-md ${showMargins ? 'bg-indigo-50 text-indigo-600 ring-1' : 'text-gray-400'}`} title="Mostrar Margens de Sangria"><ScanLine className="w-5 h-5" /></button>
                <button onClick={() => setShowRulers(!showRulers)} className={`p-1.5 rounded-md ${showRulers ? 'bg-indigo-50 text-indigo-600 ring-1' : 'text-gray-400'}`} title="Mostrar Réguas (mm)"><Ruler className="w-5 h-5" /></button>
                <div className="h-5 w-px bg-gray-200"></div>
                {!isAppInstalled && (
                  <>
                    <button 
                      onClick={executeInstallApp} 
                      className="flex items-center text-xs font-medium text-indigo-700 hover:text-indigo-850 bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded shadow-sm transition-colors"
                      title="Instalar Agenda Master no Computador ou Celular"
                    >
                      <Smartphone className="w-4 h-4 mr-1.5 text-indigo-600" />
                      <span>Instalar App</span>
                    </button>
                    <div className="h-5 w-px bg-gray-200"></div>
                  </>
                )}
                <button onClick={handlePrintRequest} disabled={printStatus !== 'idle'} className="flex items-center text-xs font-medium text-white hover:bg-indigo-700 bg-indigo-600 px-3 py-1.5 rounded border border-indigo-600 disabled:opacity-50 shadow-sm transition-colors"><FileDown className="w-4 h-4 mr-1.5" /> Baixar PDF</button>
                <button 
                  onClick={async () => {
                    if (typeof window !== 'undefined' && (window as any).clearAppCache) {
                      const confirm = window.confirm("Deseja limpar o cache e recarregar o sistema? Isso resolve lentidão ou travamentos e garante que você use a versão mais recente.");
                      if (confirm) {
                        await (window as any).clearAppCache(true);
                      }
                    } else {
                      localStorage.clear();
                      sessionStorage.clear();
                      window.location.reload();
                    }
                  }} 
                  className="text-gray-400 hover:text-indigo-600 p-1.5 rounded hover:bg-gray-100 transition-colors"
                  title="Limpar Cache e Corrigir Travamentos"
                >
                  <icons.RefreshCw className="w-4 h-4" />
                </button>
                <button onClick={onLogout} className="text-gray-400 hover:text-red-500 p-1.5 rounded hover:bg-red-50 transition-colors" title="Sair da Conta"><LogOut className="w-4 h-4" /></button>
            </div>
          </header>

          <div className="flex-1 flex overflow-hidden relative">
            {/* Sidebar (Templates & Elements) */}
            <AnimatePresence>
                {(!isMobile || mobileDrawer === 'sidebar') && activeTab !== 'opentype' && (
                    <motion.aside 
                        initial={isMobile ? { y: '100%' } : undefined}
                        animate={isMobile ? { y: 0 } : undefined}
                        exit={isMobile ? { y: '100%' } : undefined}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className={`${isMobile ? 'fixed inset-x-0 bottom-0 z-[1000] bg-white rounded-t-3xl shadow-2xl h-[80vh] border-t border-indigo-100 flex flex-col no-print' : 'w-72 bg-white border-r border-gray-200 flex flex-col shrink-0 z-10 overflow-hidden'}`}
                    >
                        {isMobile && (
                            <div className="flex items-center justify-between p-4 border-b">
                                <span className="text-xs font-black uppercase tracking-widest text-indigo-600">Configuração e Estrutura</span>
                                <button onClick={() => setMobileDrawer('none')} className="p-1"><X className="w-5 h-5 text-gray-400" /></button>
                            </div>
                        )}
                        <div className={`${isMobile ? 'flex-1 overflow-y-auto pb-20' : 'flex-1 overflow-y-auto custom-scrollbar'}`}>
                            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                        <div className="flex items-center mb-3 text-indigo-600"><Settings2 className="w-4 h-4 mr-2" /><h3 className="text-xs font-bold uppercase tracking-wider">Configuração do Projeto</h3></div>
                        <div className="space-y-3">
                            {!(config.projectType === 'notebook' || config.projectType === 'devotional') && (
                                <>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Ano de Referência</label>
                                        <div className="flex items-center gap-2">
                                            <input 
                                                type="number" 
                                                value={config.year} 
                                                onChange={(e) => setConfig({ ...config, year: parseInt(e.target.value) || 2027 })} 
                                                className={`flex-1 p-2 text-sm border rounded focus:ring-2 focus:ring-indigo-500 outline-none font-bold ${
                                                  config.year !== 2026 && config.year !== 2027 && !(config.year === 2028 && (user.plan?.toLowerCase().includes('2028') || user.plan?.toLowerCase().includes('renovad') || user.plan?.toLowerCase().includes('master')))
                                                    ? 'border-amber-400 bg-amber-50/25 text-amber-900' 
                                                    : 'border-gray-200 text-gray-700'
                                                }`}
                                            />
                                            <div className="p-2 bg-indigo-100 rounded text-indigo-700" title="O ano altera calendários e feriados automaticamente">
                                                <Info className="w-4 h-4" />
                                            </div>
                                        </div>

                                        {(config.year !== 2026 && config.year !== 2027 && !(config.year === 2028 && (user.plan?.toLowerCase().includes('2028') || user.plan?.toLowerCase().includes('renovad') || user.plan?.toLowerCase().includes('master')))) && (
                                            <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded text-[10px] text-amber-800 leading-normal shadow-sm">
                                                <p className="font-bold flex items-center gap-1 mb-1 text-amber-955">
                                                    <Lock className="w-3 h-3 text-amber-600" /> Ano {config.year} Bloqueado
                                                </p>
                                                <p>Geração de arquivos liberada apenas para <strong>2026 e 2027</strong> neste plano de assinatura.</p>
                                                <p className="mt-1 font-semibold">Os botões de exportação e download do PDF foram desabilitados para este ano.</p>
                                                <div className="mt-2 flex gap-1.5">
                                                    <button 
                                                        onClick={() => setConfig({ ...config, year: 2027 })} 
                                                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-0.5 px-2 rounded text-[9px] transition-colors"
                                                    >
                                                        Voltar para 2027
                                                    </button>
                                                    <button 
                                                        onClick={() => setConfig({ ...config, year: 2026 })} 
                                                        className="bg-white hover:bg-gray-100 text-gray-700 font-bold py-0.5 px-2 rounded text-[9px] border border-gray-200 transition-colors"
                                                    >
                                                        Voltar para 2026
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Mês Inicial</label>
                                        <select 
                                            value={config.startMonth ?? 0} 
                                            onChange={(e) => setConfig({ ...config, startMonth: parseInt(e.target.value) })} 
                                            className="w-full p-2 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-gray-700 bg-white"
                                        >
                                            {['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'].map((mName, idx) => (
                                                <option key={idx} value={idx}>{mName}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Duração da Agenda</label>
                                        <select 
                                            value={config.durationMonths ?? 12} 
                                            onChange={(e) => setConfig({ ...config, durationMonths: parseInt(e.target.value) })} 
                                            className="w-full p-2 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-gray-700 bg-white"
                                        >
                                            {Array.from({ length: 24 }, (_, i) => i + 1).map(m => (
                                                <option key={m} value={m}>{m} {m === 1 ? 'mês' : 'meses'}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="pt-2">
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Tipo de Layout</label>
                                        <select 
                                            value={config.layoutType} 
                                            onChange={(e) => {
                                                const newType = e.target.value as PageLayoutType;
                                                
                                                const isCurrentlyWeekly = config.layoutType === 'weekly_vertical' || config.layoutType === 'weekly_horizontal';
                                                const isNewWeekly = newType === 'weekly_vertical' || newType === 'weekly_horizontal';

                                                if (isCurrentlyWeekly && isNewWeekly && config.layoutType !== newType) {
                                                    // Se estiver mudando entre os tipos de planner (vertical <-> horizontal)
                                                    // Detectamos o estilo atual para tentar preservar
                                                    const currentStyle = config.elementsWeeklyLeft?.find(el => el.type === 'planner_day_box')?.style?.plannerDayBox?.contentStyle || 'blank';
                                                    applyPlannerTemplate(newType, currentStyle);
                                                    return;
                                                }

                                                if (isNewWeekly && (!config.elementsWeeklyLeft || config.elementsWeeklyLeft.length === 0)) {
                                                    setTemplateCategory('planner');
                                                    setTemplateModal(true);
                                                }
                                                
                                                // Synchronize editorViewMode when switching to weekly
                                                if (isNewWeekly) {
                                                    if (editorViewMode === 'standard' || editorViewMode === 'top' || editorViewMode === 'bottom' || editorViewMode === 'saturday' || editorViewMode === 'sunday') {
                                                        setEditorViewMode('weekly_left');
                                                    }
                                                } else if (editorViewMode === 'weekly_left' || editorViewMode === 'weekly_right') {
                                                     setEditorViewMode('standard');
                                                }

                                                setConfig({ ...config, layoutType: newType });
                                            }}
                                            className="w-full p-2 text-xs border border-gray-200 rounded bg-white font-medium shadow-sm transition-all focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        >
                                            {(config.projectType as string) === 'planner' || config.layoutType.startsWith('weekly') ? (
                                                <>
                                                    <option value="weekly_vertical">Semanal Vertical</option>
                                                    <option value="weekly_horizontal">Semanal Horizontal</option>
                                                </>
                                            ) : ((config.projectType as string) === 'notebook' || config.layoutType === 'notebook') ? (
                                                <option value="notebook">Caderno (Livre)</option>
                                            ) : ((config.projectType as string) === 'devotional' || config.layoutType === 'devotional') ? (
                                                <option value="devotional">Devocional</option>
                                            ) : (
                                                <>
                                                    <option value="1_per_page">1 Dia por Página</option>
                                                    <option value="1_per_page_weekend_shared">1 por Pág (Fim de Semana Junto)</option>
                                                    <option value="2_per_page">2 Dias por Página</option>
                                                </>
                                            )}
                                        </select>
                                        <p className="text-[8px] text-gray-400 mt-1 italic">Mudar o layout no menu acima preserva seus elementos personalizados.</p>
                                    </div>

                                    <div className="pt-2">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                checked={config.mirrorEvenPages} 
                                                onChange={(e) => setConfig({ ...config, mirrorEvenPages: e.target.checked })} 
                                                className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4" 
                                            />
                                            <span className="text-xs text-gray-700">Espelhar margens em páginas pares</span>
                                        </label>
                                        <p className="text-[9px] text-gray-400 mt-1">Inverte as margens interna/externa para encadernação.</p>
                                    </div>
                                </>
                            )}

                            {(config.projectType === 'notebook' || config.projectType === 'devotional') && (
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Quantidade de Páginas</label>
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="number" 
                                            min="1"
                                            max="500"
                                            value={config.pageCount || 100} 
                                            onChange={(e) => setConfig({ ...config, pageCount: Math.max(1, parseInt(e.target.value) || 1) })} 
                                            className="flex-1 p-2 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-gray-700"
                                        />
                                        <div className="p-2 bg-emerald-100 rounded text-emerald-700" title="Número total de páginas do miolo">
                                            <FileText className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="pt-3 border-t border-gray-100 mt-3 text-left">
                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5 align-middle">Versículos das Páginas</label>
                                <div className="bg-indigo-50/50 rounded-lg p-2.5 border border-indigo-100/60 flex flex-col gap-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-gray-600">Fonte ativa:</span>
                                        {customVerses.length > 0 ? (
                                            <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full font-bold">Importados ({customVerses.length})</span>
                                        ) : (
                                            <span className="text-[9px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full font-bold">Padrão do Sistema</span>
                                        )}
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={() => setVersesModalOpen(true)}
                                        className="w-full py-1.5 px-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded justify-center font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all shadow-sm"
                                    >
                                        <BookOpen className="w-3 h-3" />
                                        <span>Personalizar Bíblia</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border-b border-gray-100">
                        <div className="flex items-center mb-3 text-gray-400"><Book className="w-4 h-4 mr-2" /><h3 className="text-xs font-semibold uppercase tracking-wider">Estrutura</h3></div>
                        <div className="flex bg-gray-100 p-1 rounded-lg gap-0.5 mb-2">
                            <button onClick={() => { setEditMode('daily'); setSelectedIds([]); }} className={`flex-1 py-1.5 px-1 text-[9px] font-bold uppercase rounded-md transition-all truncate ${editMode === 'daily' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>
                                {config.projectType === 'notebook' || config.projectType === 'devotional' ? 'Miolo' : (config.layoutType === 'weekly_vertical' || config.layoutType === 'weekly_horizontal' ? 'Semanal' : 'Diário')}
                            </button>
                            <button onClick={() => { setEditMode('intro'); setSelectedIds([]); if (!currentIntroPageId && config.introPages.length > 0) setCurrentIntroPageId(config.introPages[0].id); }} className={`flex-1 py-1.5 px-1 text-[9px] font-bold uppercase rounded-md transition-all truncate ${editMode === 'intro' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>Iniciais</button>
                            <button 
                                onClick={() => { 
                                    setEditMode('monthly_intro'); 
                                    setSelectedIds([]); 
                                    if (config.monthlyIntroPages && config.monthlyIntroPages.length > 0) {
                                        setCurrentMonthlyIntroPageId(config.monthlyIntroPages[0].id);
                                    } else {
                                        setCurrentMonthlyIntroPageId('');
                                    }
                                }} 
                                className={`flex-1 py-1.5 px-1 text-[9px] font-bold uppercase rounded-md transition-all truncate ${editMode === 'monthly_intro' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Mensais
                            </button>
                            <button 
                                onClick={() => { 
                                    setEditMode('divider'); 
                                    setSelectedIds([]); 
                                    if (!config.monthlyDividerStyle?.elements || config.monthlyDividerStyle.elements.length === 0) {
                                        const defaultDividerElements = [
                                            {
                                                id: 'div_title',
                                                type: 'text' as const,
                                                content: config.monthlyDividerStyle?.titleText || 'Planejamento Mensal',
                                                x: 10, y: 15, w: 80, h: 6, zIndex: 1,
                                                style: { fontSize: 14, fontWeight: 'medium', textAlign: 'center' as const, color: config.monthlyDividerStyle?.textColor || '#312e81', fontFamily: 'Inter' }
                                            },
                                            {
                                                id: 'div_month',
                                                type: 'date_placeholder' as const,
                                                content: '',
                                                x: 10, y: 35, w: 80, h: 20, zIndex: 2,
                                                style: { fontSize: 36, fontWeight: 'bold', textAlign: 'center' as const, color: config.monthlyDividerStyle?.textColor || '#312e81', fontFamily: 'Inter', variant: 'month_name' }
                                            },
                                            {
                                                id: 'div_year',
                                                type: 'date_placeholder' as const,
                                                content: '',
                                                x: 10, y: 60, w: 80, h: 8, zIndex: 3,
                                                style: { fontSize: 18, fontWeight: 'light', textAlign: 'center' as const, color: config.monthlyDividerStyle?.accentColor || '#6366f1', fontFamily: 'Inter', variant: 'year' }
                                            }
                                        ];
                                        setConfig(prev => ({
                                            ...prev,
                                            monthlyDividerStyle: {
                                                ...(prev.monthlyDividerStyle || {}),
                                                layout: prev.monthlyDividerStyle?.layout || 'custom',
                                                elements: defaultDividerElements
                                            }
                                        }));
                                    }
                                }} 
                                className={`flex-1 py-1.5 px-1 text-[9px] font-bold uppercase rounded-md transition-all truncate ${editMode === 'divider' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Divisórias
                            </button>
                        </div>
                        {editMode === 'daily' && (config.layoutType === 'weekly_vertical' || config.layoutType === 'weekly_horizontal') && !(config.projectType === 'notebook' || config.projectType === 'devotional') && (
                            <div className="mb-4">
                                <button 
                                    onClick={() => { setTemplateCategory('planner'); setTemplateModal(true); }}
                                    className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100 hover:bg-indigo-100 transition-colors text-[10px] font-bold uppercase tracking-wider shadow-sm"
                                >
                                    <Layout className="w-3.5 h-3.5" />
                                    Modelos de Planner
                                </button>
                            </div>
                        )}
                        {editMode === 'intro' && (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-[10px] text-gray-500 font-bold uppercase mb-1">
                                            <span>Lista de Páginas</span>
                                            <div className="flex gap-1">
                                                <button onClick={() => setTemplateModal(true)} className="text-indigo-600 hover:text-indigo-800 px-1.5 py-0.5 bg-indigo-50 rounded flex items-center gap-1" title="Modelos Prontos"><Layout className="w-3 h-3" /> <span className="text-[8px]">Modelos</span></button>
                                                <button onClick={addIntroPage} className="text-indigo-600 hover:text-indigo-800 p-1 bg-indigo-50 rounded" title="Nova Página em Branco"><Plus className="w-3 h-3" /></button>
                                            </div>
                                        </div>
                                        <div className="space-y-1 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                                            {config.introPages.map((page, index) => (
                                                <div key={page.id} onClick={() => { setCurrentIntroPageId(page.id); setSelectedIds([]); }} className={`group flex items-center gap-2 p-2 rounded text-xs cursor-pointer border transition-all ${currentIntroPageId === page.id ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-medium' : 'bg-white border-gray-100 text-gray-600 hover:bg-gray-50'}`}>
                                                    <FileText className="w-3 h-3 flex-shrink-0 text-gray-400" />
                                                    <input 
                                                        type="text" 
                                                        value={page.name} 
                                                        onChange={(e) => renameIntroPage(page.id, e.target.value)} 
                                                        className="bg-transparent border-none p-0 flex-1 min-w-0 focus:ring-0 text-xs font-inherit cursor-pointer focus:bg-white focus:cursor-text" 
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                    <div className="flex items-center gap-0.5 flex-shrink-0">
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); moveIntroPage(page.id, 'up'); }} 
                                                            disabled={index === 0}
                                                            className={`p-1 rounded transition-colors ${index === 0 ? 'text-gray-200 cursor-not-allowed' : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-100'}`}
                                                            title="Mover para Cima"
                                                        >
                                                            <ChevronUp className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); moveIntroPage(page.id, 'down'); }} 
                                                            disabled={index === config.introPages.length - 1}
                                                            className={`p-1 rounded transition-colors ${index === config.introPages.length - 1 ? 'text-gray-200 cursor-not-allowed' : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-100'}`}
                                                            title="Mover para Baixo"
                                                        >
                                                            <ChevronDown className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); savePageAsTemplate(page); }} 
                                                            className="text-amber-500 hover:text-amber-600 p-1 hover:bg-amber-50 rounded transition-colors" 
                                                            title="Salvar como Modelo"
                                                        >
                                                            <Star className="w-3.5 h-3.5 fill-amber-100" />
                                                        </button>
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); deleteIntroPage(page.id); }} 
                                                            className="text-gray-400 hover:text-red-500 p-1 hover:bg-red-50 rounded transition-colors" 
                                                            title="Excluir Página"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                            {config.introPages.length === 0 && <div className="text-center py-2 text-xs text-gray-400 italic">Nenhuma página. Clique em + para adicionar.</div>}
                                        </div>
                                    </div>
                                )}
                                {editMode === 'monthly_intro' && (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-[10px] text-gray-500 font-bold uppercase mb-1">
                                            <span>Páginas Mensais</span>
                                            <div className="flex gap-1.5">
                                                <button onClick={() => { setTemplateCategory('intro'); setTemplateModal(true); }} className="text-indigo-600 hover:text-indigo-800 px-1 py-0.5 bg-indigo-50 rounded flex items-center gap-1" title="Modelos Prontos"><Layout className="w-3.5 h-3.5" /> <span className="text-[10px]">Modelos</span></button>
                                                <button onClick={addMonthlyIntroPage} className="text-indigo-600 hover:text-indigo-800 p-1 bg-indigo-50 rounded flex items-center gap-1" title="Nova Página Mensal"><Plus className="w-3.5 h-3.5" /> <span className="text-[10px]">Nova</span></button>
                                            </div>
                                        </div>
                                        <div className="space-y-1 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                                            {(config.monthlyIntroPages || []).map((page, index) => (
                                                <div key={page.id} onClick={() => { setCurrentMonthlyIntroPageId(page.id); setSelectedIds([]); }} className={`group flex items-center gap-2 p-2 rounded text-xs cursor-pointer border transition-all ${currentMonthlyIntroPageId === page.id ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-medium' : 'bg-white border-gray-100 text-gray-600 hover:bg-gray-50'}`}>
                                                    <FileText className="w-3 h-3 flex-shrink-0 text-gray-400" />
                                                    <input 
                                                        type="text" 
                                                        value={page.name} 
                                                        onChange={(e) => renameMonthlyIntroPage(page.id, e.target.value)} 
                                                        className="bg-transparent border-none p-0 flex-1 min-w-0 focus:ring-0 text-xs font-inherit cursor-pointer focus:bg-white focus:cursor-text" 
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                    <div className="flex items-center gap-0.5 flex-shrink-0">
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); moveMonthlyIntroPage(page.id, 'up'); }} 
                                                            disabled={index === 0}
                                                            className={`p-1 rounded transition-colors ${index === 0 ? 'text-gray-200 cursor-not-allowed' : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-100'}`}
                                                            title="Mover para Cima"
                                                        >
                                                            <ChevronUp className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); moveMonthlyIntroPage(page.id, 'down'); }} 
                                                            disabled={index === (config.monthlyIntroPages || []).length - 1}
                                                            className={`p-1 rounded transition-colors ${index === (config.monthlyIntroPages || []).length - 1 ? 'text-gray-200 cursor-not-allowed' : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-100'}`}
                                                            title="Mover para Baixo"
                                                        >
                                                            <ChevronDown className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); savePageAsTemplate(page); }} 
                                                            className="text-amber-500 hover:text-amber-600 p-1 hover:bg-amber-50 rounded transition-colors" 
                                                            title="Salvar como Modelo"
                                                        >
                                                            <Star className="w-3.5 h-3.5 fill-amber-100" />
                                                        </button>
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); deleteMonthlyIntroPage(page.id); }} 
                                                            className="text-gray-400 hover:text-red-500 p-1 hover:bg-red-50 rounded transition-colors" 
                                                            title="Excluir Página"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                            {(config.monthlyIntroPages || []).length === 0 && <div className="text-center py-2 text-xs text-gray-400 italic">Nenhuma página mensal. Clique em + para adicionar.</div>}
                                        </div>
                                    </div>
                                )}
                            </div>

                       {!(config.projectType === 'notebook' || config.projectType === 'devotional') && (
                        <div className="p-4 border-b border-gray-100">
                            <div className="flex items-center mb-3 text-gray-400"><BookOpen className="w-4 h-4 mr-2" /><h3 className="text-xs font-semibold uppercase tracking-wider">Transição de Meses</h3></div>
                            <div className="space-y-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={config.includeMonthlyDividers ?? true} 
                                        onChange={(e) => setConfig({ ...config, includeMonthlyDividers: e.target.checked })} 
                                        className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4" 
                                    />
                                    <span className="text-xs font-semibold text-gray-750">Incluir Divisórias de Meses (Capas)</span>
                                </label>

                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={config.includeMonthlyIntroPages ?? true} 
                                        onChange={(e) => setConfig({ ...config, includeMonthlyIntroPages: e.target.checked })} 
                                        className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4" 
                                    />
                                    <span className="text-xs font-semibold text-gray-750">Incluir Páginas Mensais (Notas/Planejamentos)</span>
                                </label>

                                <label className="flex items-center gap-2 cursor-pointer pt-2 border-t border-gray-50">
                                    <input 
                                        type="checkbox" 
                                        checked={config.startMonthOnRightPage || false} 
                                        onChange={(e) => setConfig({ ...config, startMonthOnRightPage: e.target.checked })} 
                                        className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4" 
                                    />
                                    <span className="text-xs text-gray-700">Iniciar mês sempre na página direita</span>
                                </label>
                                
                                {config.startMonthOnRightPage && (
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase">Conteúdo da Página de Preenchimento</label>
                                        <select 
                                            value={config.fillerPageContent || 'blank'} 
                                            onChange={(e) => setConfig({ ...config, fillerPageContent: e.target.value })} 
                                            className="w-full text-xs p-2 border border-gray-200 rounded bg-white"
                                        >
                                            <option value="blank">Página em Branco</option>
                                            <option value="notes">Anotações</option>
                                            <option value="habit_tracker">Habit Tracker</option>
                                            <option value="quote">Frase Motivacional</option>
                                            {config.introPages.map(page => (
                                                <option key={page.id} value={page.id}>Página Inicial: {page.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {(config.includeMonthlyDividers ?? true) && (
                                    <>
                                        <div className="space-y-2 pt-3 border-t border-gray-100">
                                            <label className="block text-[10px] font-bold text-gray-500 uppercase">Verso das Divisórias de Meses</label>
                                            <select 
                                                value={config.monthlyDividerVersoContent || 'blank'} 
                                                onChange={(e) => setConfig({ ...config, monthlyDividerVersoContent: e.target.value as any })} 
                                                className="w-full text-xs p-2 border border-gray-200 rounded bg-white shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                            >
                                                <option value="blank">Página em Branco</option>
                                                <option value="notes">Anotações do Mês</option>
                                                <option value="habit_tracker">Controle de Hábitos (Habit Tracker)</option>
                                                <option value="quote">Frase Motivacional</option>
                                                {config.monthlyIntroPages && config.monthlyIntroPages.length > 0 && (
                                                    <option value="monthly_intro_first">Usar Primeira Página Mensal ({config.monthlyIntroPages[0].name})</option>
                                                )}
                                                {config.introPages.map(page => (
                                                    <option key={page.id} value={page.id}>Página Inicial: {page.name}</option>
                                                ))}
                                                {(config.monthlyIntroPages || []).map(page => (
                                                    <option key={page.id} value={page.id}>Página Mensal: {page.name}</option>
                                                ))}
                                            </select>
                                            <p className="text-[10px] text-gray-400">Escolha o conteúdo impresso exatamente no verso (página esquerda) do divisor de cada mês.</p>
                                        </div>

                                        <div className="space-y-2 pt-3 border-t border-gray-100">
                                            <button 
                                                type="button"
                                                onClick={() => setShowDividerCustomizer(!showDividerCustomizer)}
                                                className="flex items-center justify-between w-full text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider py-1 hover:text-indigo-600 transition-colors"
                                            >
                                                <span>Personalizar Divisória do Mês</span>
                                                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showDividerCustomizer ? 'rotate-180' : ''}`} />
                                            </button>
                                            
                                            {showDividerCustomizer && (
                                                <div className="bg-gray-50/60 p-3 rounded-xl border border-gray-100 space-y-3 mt-1">
                                                    {/* Layout Preset */}
                                                    <div>
                                                        <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1.5">Estilo Visual</label>
                                                        <div className="grid grid-cols-2 gap-1.5">
                                                            {[
                                                                { id: 'classic', label: 'Clássico', desc: 'Serifado e elegante' },
                                                                { id: 'modern', label: 'Moderno', desc: 'Contemporâneo, alinhado' },
                                                                { id: 'minimalist', label: 'Minimalista', desc: 'Espaçoso e limpo' },
                                                                { id: 'geometric', label: 'Geométrico', desc: 'Formas e contornos' }
                                                            ].map((item) => {
                                                                const isSelected = (config.monthlyDividerStyle?.layout || 'classic') === item.id;
                                                                return (
                                                                    <button
                                                                        key={item.id}
                                                                        type="button"
                                                                        onClick={() => updateMonthlyDividerStyle({ layout: item.id as any })}
                                                                        className={`p-2 rounded-lg border text-left transition-all ${
                                                                            isSelected 
                                                                                ? 'bg-indigo-50 border-indigo-500 text-indigo-950 ring-1 ring-indigo-500' 
                                                                                : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'
                                                                        }`}
                                                                    >
                                                                        <div className="text-[10px] font-bold leading-tight">{item.label}</div>
                                                                        <div className="text-[8px] text-gray-400 mt-0.5 leading-none">{item.desc}</div>
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>

                                                    {/* Custom Title Text */}
                                                    <div>
                                                        <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Título Personalizado</label>
                                                        <input 
                                                            type="text"
                                                            value={config.monthlyDividerStyle?.titleText ?? 'Planejamento Mensal'}
                                                            onChange={(e) => updateMonthlyDividerStyle({ titleText: e.target.value })}
                                                            placeholder="Planejamento Mensal"
                                                            className="w-full text-xs p-1.5 border border-gray-200 rounded bg-white shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                                        />
                                                    </div>

                                                    {/* Colors */}
                                                    <div className="space-y-2 bg-white p-2.5 rounded-lg border border-gray-100">
                                                        <div className="text-[9px] font-bold text-gray-400 uppercase mb-1">Cores do Divisor</div>
                                                        
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <div>
                                                                <label className="block text-[8px] font-medium text-gray-500 mb-0.5">Cor do Fundo</label>
                                                                <div className="flex gap-1.5 items-center">
                                                                    <input 
                                                                        type="color"
                                                                        value={config.monthlyDividerStyle?.backgroundColor || '#ffffff'}
                                                                        onChange={(e) => updateMonthlyDividerStyle({ backgroundColor: e.target.value })}
                                                                        className="w-7 h-7 rounded border border-gray-200 p-0 cursor-pointer"
                                                                    />
                                                                    <span className="text-[9px] font-mono text-gray-400 uppercase">{config.monthlyDividerStyle?.backgroundColor || '#ffffff'}</span>
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <label className="block text-[8px] font-medium text-gray-500 mb-0.5">Cor do Texto</label>
                                                                <div className="flex gap-1.5 items-center">
                                                                    <input 
                                                                        type="color"
                                                                        value={config.monthlyDividerStyle?.textColor || '#312e81'}
                                                                        onChange={(e) => updateMonthlyDividerStyle({ textColor: e.target.value })}
                                                                        className="w-7 h-7 rounded border border-gray-200 p-0 cursor-pointer"
                                                                    />
                                                                    <span className="text-[9px] font-mono text-gray-400 uppercase">{config.monthlyDividerStyle?.textColor || '#312e81'}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <label className="block text-[8px] font-medium text-gray-500 mb-0.5">Cor de Destaque / Linhas</label>
                                                            <div className="flex gap-1.5 items-center">
                                                                <input 
                                                                    type="color"
                                                                    value={config.monthlyDividerStyle?.accentColor || '#6366f1'}
                                                                    onChange={(e) => updateMonthlyDividerStyle({ accentColor: e.target.value })}
                                                                    className="w-7 h-7 rounded border border-gray-200 p-0 cursor-pointer"
                                                                />
                                                                <span className="text-[9px] font-mono text-gray-400 uppercase">{config.monthlyDividerStyle?.accentColor || '#6366f1'}</span>
                                                            </div>
                                                            <div className="flex gap-1 mt-1.5 flex-wrap">
                                                                {['#6366f1', '#f43f5e', '#10b981', '#f59e0b', '#06b6d4', '#4f46e5'].map(color => (
                                                                    <button
                                                                        key={color}
                                                                        type="button"
                                                                        onClick={() => updateMonthlyDividerStyle({ accentColor: color })}
                                                                        className="w-4 h-4 rounded-full border border-gray-100 shadow-sm"
                                                                        style={{ backgroundColor: color }}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Border Customization */}
                                                    <div className="space-y-2 bg-white p-2.5 rounded-lg border border-gray-100">
                                                        <div className="text-[9px] font-bold text-gray-400 uppercase mb-1">Contornos / Borda</div>
                                                        
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <div>
                                                                <label className="block text-[8px] font-medium text-gray-500 mb-0.5">Estilo da Borda</label>
                                                                <select
                                                                    value={config.monthlyDividerStyle?.borderStyle || 'double'}
                                                                    onChange={(e) => updateMonthlyDividerStyle({ borderStyle: e.target.value as any })}
                                                                    className="w-full text-[10px] p-1 border border-gray-200 rounded bg-white"
                                                                >
                                                                    <option value="none">Sem Borda</option>
                                                                    <option value="solid">Sólida</option>
                                                                    <option value="double">Dupla (Clássica)</option>
                                                                    <option value="dashed">Tracejada</option>
                                                                </select>
                                                            </div>

                                                            {config.monthlyDividerStyle?.borderStyle !== 'none' && (
                                                                <div>
                                                                    <label className="block text-[8px] font-medium text-gray-500 mb-0.5">Cor da Borda</label>
                                                                    <div className="flex gap-1 items-center">
                                                                        <input 
                                                                            type="color"
                                                                            value={config.monthlyDividerStyle?.borderColor || '#e0e7ff'}
                                                                            onChange={(e) => updateMonthlyDividerStyle({ borderColor: e.target.value })}
                                                                            className="w-5 h-5 rounded border border-gray-200 p-0 cursor-pointer"
                                                                        />
                                                                        <span className="text-[8px] font-mono text-gray-400 uppercase">{config.monthlyDividerStyle?.borderColor || '#e0e7ff'}</span>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Elements toggles */}
                                                    <div className="flex flex-col gap-1.5 pt-1">
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input 
                                                                type="checkbox" 
                                                                checked={config.monthlyDividerStyle?.showYear ?? true} 
                                                                onChange={(e) => updateMonthlyDividerStyle({ showYear: e.target.checked })} 
                                                                className="rounded text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5" 
                                                            />
                                                            <span className="text-[10px] text-gray-600 font-medium">Exibir ano abaixo do mês</span>
                                                        </label>

                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input 
                                                                type="checkbox" 
                                                                checked={config.monthlyDividerStyle?.showDividerLines ?? true} 
                                                                onChange={(e) => updateMonthlyDividerStyle({ showDividerLines: e.target.checked })} 
                                                                className="rounded text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5" 
                                                            />
                                                            <span className="text-[10px] text-gray-600 font-medium">Exibir decorações / linhas divisórias</span>
                                                        </label>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                
                    {!isMobile && (
                        <div className="p-4">
                            <div className="flex items-center mb-3 text-gray-400"><Layout className="w-4 h-4 mr-2" /><h3 className="text-xs font-semibold uppercase tracking-wider">Elementos</h3></div>
                            <div className="grid grid-cols-4 gap-2">
                                {editMode === 'daily' && !(config.projectType === 'notebook' || config.projectType === 'devotional') && (
                                    <>
                                        <button onClick={() => addElement('date_placeholder', 'Número do Dia', { variant: 'day_number' })} className="h-10 flex items-center justify-center border rounded hover:bg-indigo-50" title="Número do Dia"><span className="font-bold text-xs text-indigo-600">24</span></button>
                                        <button onClick={() => addElement('date_placeholder', 'Dia da Semana', { variant: 'day_name' })} className="h-10 flex items-center justify-center border rounded hover:bg-indigo-50" title="Dia da Semana"><span className="text-[10px] font-bold text-indigo-600">SEG</span></button>
                                        <button onClick={() => addElement('date_placeholder', 'Nome do Mês', { variant: 'month_name' })} className="h-10 flex items-center justify-center border rounded hover:bg-indigo-50" title="Nome do Mês"><span className="text-[10px] text-indigo-600">MÊS</span></button>
                                    </>
                                )}
                                <button onClick={() => addElement('text', 'Texto')} className="h-10 flex items-center justify-center border rounded hover:bg-indigo-50" title="Texto"><Type className="w-4 h-4 text-indigo-600"/></button>
                                <button onClick={() => addElement('box', 'Caixa')} className="h-10 flex items-center justify-center border rounded hover:bg-indigo-50" title="Caixa"><Square className="w-4 h-4 text-indigo-600"/></button>
                                <button onClick={() => addElement('circle', 'Círculo')} className="h-10 flex items-center justify-center border rounded hover:bg-indigo-50" title="Círculo"><Circle className="w-4 h-4 text-indigo-600"/></button>
                                <button onClick={() => addElement('vector_shape', 'Formas Vetoriais')} className="h-10 flex items-center justify-center border rounded hover:bg-indigo-50" title="Biblioteca de Formas Vetoriais"><Shapes className="w-4 h-4 text-indigo-600"/></button>
                                <button onClick={() => addElement('lines', 'Pautas', { color: '#e5e7eb', lineSpacing: 24 })} className="h-10 flex items-center justify-center border rounded hover:bg-indigo-50" title="Linhas Simples (Pautas)"><ListTodo className="w-4 h-4 text-indigo-600"/></button>
                                <button onClick={() => addElement('lines', 'Horários', { showTimes: true, startHour: 7, lineSpacing: 28, color: '#e5e7eb' })} className="h-10 flex items-center justify-center border rounded hover:bg-indigo-50" title="Tabela de Horários (Linhas)"><Clock className="w-4 h-4 text-indigo-600"/></button>
                                <button onClick={() => addElement('table', 'Tabela')} className="h-10 flex items-center justify-center border rounded hover:bg-indigo-50" title="Tabela Customizável"><TableIcon className="w-4 h-4 text-indigo-600"/></button>
                                <button onClick={() => addElement('holiday', 'Confraternização Universal')} className="h-10 flex items-center justify-center border rounded hover:bg-indigo-50" title="Informação do Feriado do Dia"><Flag className="w-4 h-4 text-indigo-600"/></button>
                                <button onClick={() => addElement('note_grid', 'Grid', { variant: 'dots', color: '#ccc', opacity: 0.5 })} className="h-10 flex items-center justify-center border rounded hover:bg-indigo-50" title="Grid de Notas"><Grid3X3 className="w-4 h-4 text-indigo-600"/></button>
                                <button onClick={() => addElement('mini_calendar', 'Calendário')} className="h-10 flex items-center justify-center border rounded hover:bg-indigo-50" title="Mini Calendário"><CalendarDays className="w-4 h-4 text-indigo-600"/></button>
                                <button onClick={() => addElement('moon', 'Lua', { variant: 'full_info', fontSize: 12, color: '#6b7280' })} className="h-10 flex items-center justify-center border rounded hover:bg-indigo-50" title="Fases da Lua"><Moon className="w-4 h-4 text-indigo-600"/></button>
                                <button onClick={() => addElement('habit_tracker', 'Hábitos')} className="h-10 flex items-center justify-center border rounded hover:bg-indigo-50" title="Habit Tracker"><CheckSquare className="w-4 h-4 text-indigo-600"/></button>
                                <button onClick={() => addElement('image', 'Imagem')} className="h-10 flex items-center justify-center border rounded hover:bg-indigo-50" title="Upload de Imagem"><Upload className="w-4 h-4 text-indigo-600"/></button>
                                <button onClick={() => addElement('verse', 'Versículo', { fontStyle: 'italic', textAlign: 'center' })} className="h-10 flex items-center justify-center border rounded hover:bg-indigo-50" title="Versículo Bíblico"><BookOpen className="w-4 h-4 text-indigo-600"/></button>
                                
                                <button onClick={() => addElement('lines', 'Divisória', { color: '#d1d5db', lineSpacing: 2, borderWidth: 1 }, { w: 50, h: 2 })} className="h-10 flex items-center justify-center border rounded hover:bg-indigo-50" title="Linha Divisória"><Minus className="w-4 h-4 text-indigo-600"/></button>
                                <button onClick={() => addElement('permanent_day_header', 'Agenda Permanente', { variant: 'circles_outline', color: '#f472b6', fontSize: 10 })} className="h-10 flex items-center justify-center border rounded hover:bg-indigo-50" title="Agenda Permanente"><List className="w-4 h-4 text-indigo-600"/></button>
        
                                {editMode === 'intro' && (
                                    <>
                                        <button onClick={() => addElement('full_calendar', 'Calendário Anual')} className="h-10 flex items-center justify-center border rounded hover:bg-indigo-50" title="Calendário Anual">
                                            <CalendarRange className="w-4 h-4 text-indigo-600" />
                                        </button>
                                        <button onClick={() => addElement('holiday_list', 'Lista Feriados')} className="h-10 flex items-center justify-center border rounded hover:bg-indigo-50" title="Lista de Feriados">
                                            <Flag className="w-4 h-4 text-indigo-600" />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </motion.aside>
        )}
    </AnimatePresence>

            <main 
                ref={workspaceRef} 
                className={`flex-1 overflow-hidden h-full min-h-0 ${activeTab === 'opentype' ? 'bg-slate-900' : 'bg-gray-200 p-4 md:p-8'} relative flex flex-col items-center no-print transition-all duration-300 ${isMobile ? 'h-full overflow-hidden' : ''} ${!isMobile && showProperties && activeTab === 'editor' ? 'md:pr-[320px]' : ''}`}
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    if (selectedIds.length > 0) setSelectedIds([]);
                    if (contextMenu) setContextMenu(null);
                  }
                }}
            >
                {activeTab === 'opentype' && (
                    <div className="w-full h-full min-h-0 flex flex-col p-4 md:p-6 select-text" onClick={(e) => e.stopPropagation()}>
                        <OpenTypeEditor 
                          user={user} 
                          onClose={() => setActiveTab('editor')} 
                          onRegisterFont={(family) => {
                            setCustomFonts(prev => prev.includes(family) ? prev : [...prev, family]);
                          }}
                          onInsertIntoLayout={(text, fontFamily) => {
                            // Register the font
                            setCustomFonts(prev => prev.includes(fontFamily) ? prev : [...prev, fontFamily]);
                            // Insert a new text element on the page
                            addElement('text', 'Texto OpenType', {
                              content: text,
                              fontFamily: fontFamily,
                              fontSize: 28,
                              textAlign: 'center'
                            });
                            // Close/go back to editor tab
                            setActiveTab('editor');
                          }}
                        />
                    </div>
                )}

                {activeTab === 'editor' && (
                    <div className={`flex flex-col items-center w-full max-w-full h-full min-h-0 ${isMobile ? 'h-full flex-1 touch-none' : ''}`}>
                        {!isMobile && (
                            <div className="mb-4 bg-white p-1 rounded-lg shadow-sm flex items-center space-x-1 z-10 no-print">
                                <button onClick={() => handleUndo()} disabled={history.length === 0} className="p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-indigo-600 disabled:opacity-30 flex items-center gap-1"><Undo className="w-4 h-4" /><span className="text-[10px] font-bold">Undo</span></button>
                                <div className="w-px h-4 bg-gray-100 mx-1"></div>
                                <button onClick={() => setZoom(Math.max(0.3, zoom - 0.1))} className="p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-indigo-600"><Minus className="w-4 h-4" /></button>
                                <div className="flex flex-col items-center min-w-[40px] px-1"><span className="text-[8px] font-bold text-gray-400 uppercase leading-none">Zoom</span><span className="text-[10px] font-bold text-indigo-600 tabular-nums">{Math.round(zoom * 100)}%</span></div>
                                <button onClick={() => setZoom(Math.min(3, zoom + 0.1))} className="p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-indigo-600"><Plus className="w-4 h-4" /></button>
                                <button onClick={() => setZoom(1)} className="text-[9px] font-bold text-gray-400 hover:text-indigo-600 px-1">Reset</button>
                            </div>
                        )}

                        {config.layoutType === '1_per_page_weekend_shared' && editMode === 'daily' && (
                            <div className="mb-4 bg-white p-1 rounded-lg shadow-sm flex space-x-1 z-10">
                                <button 
                                    onClick={() => setEditorViewMode('standard')} 
                                    className={`px-3 py-1 text-xs font-medium rounded transition-colors ${editorViewMode === 'standard' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                                >
                                    Dias da Semana
                                </button>
                                <button 
                                    onClick={() => setEditorViewMode('saturday')} 
                                    className={`px-3 py-1 text-xs font-medium rounded transition-colors ${editorViewMode === 'saturday' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                                >
                                    Sábado
                                </button>
                                <button 
                                    onClick={() => setEditorViewMode('sunday')} 
                                    className={`px-3 py-1 text-xs font-medium rounded transition-colors ${editorViewMode === 'sunday' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                                >
                                    Domingo
                                </button>
                            </div>
                        )}

                        {config.layoutType === '2_per_page' && editMode === 'daily' && (
                            <div className="mb-4 bg-white p-1 rounded-lg shadow-sm flex space-x-1 z-10">
                                <button 
                                    onClick={() => setEditorViewMode('standard')} 
                                    className={`px-3 py-1 text-xs font-medium rounded transition-colors ${editorViewMode === 'standard' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                                >
                                    Padrão
                                </button>
                                <button 
                                    onClick={() => setEditorViewMode('top')} 
                                    className={`px-3 py-1 text-xs font-medium rounded transition-colors ${editorViewMode === 'top' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                                >
                                    Parte Superior
                                </button>
                                <button 
                                    onClick={() => setEditorViewMode('bottom')} 
                                    className={`px-3 py-1 text-xs font-medium rounded transition-colors ${editorViewMode === 'bottom' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                                >
                                    Parte Inferior
                                </button>
                            </div>
                        )}

                        {editMode === 'intro' && (<div className="mb-4 bg-indigo-100 text-indigo-800 px-3 py-1 rounded text-xs font-bold uppercase tracking-wide z-10 shadow-sm border border-indigo-200">Editando: {config.introPages.find(p => p.id === currentIntroPageId)?.name || 'Página'}</div>)}
                        {editMode === 'monthly_intro' && (<div className="mb-4 bg-indigo-100 text-indigo-800 px-3 py-1 rounded text-xs font-bold uppercase tracking-wide z-10 shadow-sm border border-indigo-200">Editando Página Mensal: {config.monthlyIntroPages?.find(p => p.id === currentMonthlyIntroPageId)?.name || 'Página Mensal'}</div>)}
                        
                        <div id="editor-viewport-wrapper" className="relative flex-1 w-full flex min-h-0 overflow-hidden">
                            <div 
                              id="editor-scroll-container"
                              ref={editorContainerRef} 
                              className={`relative flex-1 w-full flex overflow-auto p-4 md:p-12 custom-scrollbar ${isMobile ? 'h-full' : ''}`}
                              onMouseDown={handlePanMouseDown}
                              onMouseMove={handlePanMouseMove}
                              onMouseUp={handlePanMouseUpOrLeave}
                              onMouseLeave={handlePanMouseUpOrLeave}
                              style={{
                                cursor: isPanning ? 'grabbing' : (isSpacePressed || panMode) ? 'grab' : 'default'
                              }}
                            >
                                <div 
                                  className="flex flex-col items-center" 
                                  style={{ 
                                    margin: 'auto',
                                    transform: `scale(${responsiveScale})`, 
                                    transformOrigin: 'center center',
                                    pointerEvents: (isSpacePressed || panMode || isPanning) ? 'none' : 'auto'
                                  }}
                                >
                                    {renderEditorPage()}
                                </div>
                            </div>
                        </div>
                        {showAlignment && (
                            <div className={`absolute top-20 transition-all duration-300 bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col z-40 no-print animate-in fade-in zoom-in-95 duration-200 ${showProperties ? 'right-[304px]' : 'right-4'} w-[180px]`}>
                                <div className="flex items-center justify-between p-2 border-b border-gray-100 bg-gray-50 rounded-t-lg">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase">Alinhamento</span>
                                    <button onClick={() => setShowAlignment(false)} className="text-gray-400 hover:text-red-500"><X className="w-3 h-3" /></button>
                                </div>
                                <div className="p-2 border-b border-gray-100 flex flex-col gap-1">
                                    <span className="text-[9px] font-bold text-gray-400 uppercase">Referência:</span>
                                    <div className="grid grid-cols-3 gap-0.5 bg-gray-100 p-0.5 rounded text-[9px] font-medium">
                                        <button 
                                            onClick={() => setAlignmentReference('margins')}
                                            className={`py-1 rounded text-center transition-all ${alignmentReference === 'margins' ? 'bg-white text-indigo-600 shadow-xs font-semibold' : 'text-gray-500 hover:text-gray-900'}`}
                                            title="Alinhar em relação às margens úteis"
                                        >
                                            Margens
                                        </button>
                                        <button 
                                            onClick={() => setAlignmentReference('page')}
                                            className={`py-1 rounded text-center transition-all ${alignmentReference === 'page' ? 'bg-white text-indigo-600 shadow-xs font-semibold' : 'text-gray-500 hover:text-gray-900'}`}
                                            title="Alinhar em relação à borda física da página"
                                        >
                                            Página
                                        </button>
                                        <button 
                                            onClick={() => setAlignmentReference('selection')}
                                            disabled={selectedIds.length < 2}
                                            className={`py-1 rounded text-center transition-all ${selectedIds.length < 2 ? 'opacity-30 cursor-not-allowed text-gray-400' : alignmentReference === 'selection' ? 'bg-white text-indigo-600 shadow-xs font-semibold' : 'text-gray-500 hover:text-gray-900'}`}
                                            title="Alinhar entre os elementos selecionados"
                                        >
                                            Seleção
                                        </button>
                                    </div>
                                </div>
                                <div className="p-2 grid grid-cols-3 gap-1">
                                    <button onClick={() => alignElement('left')} className="p-1.5 hover:bg-indigo-50 rounded text-gray-600 hover:text-indigo-600" title="Alinhar à Esquerda"><AlignStartVertical className="w-4 h-4 mx-auto" /></button>
                                    <button onClick={() => alignElement('center')} className="p-1.5 hover:bg-indigo-50 rounded text-gray-600 hover:text-indigo-600" title="Centralizar Horizontalmente"><AlignCenterVertical className="w-4 h-4 mx-auto" /></button>
                                    <button onClick={() => alignElement('right')} className="p-1.5 hover:bg-indigo-50 rounded text-gray-600 hover:text-indigo-600" title="Alinhar à Direita"><AlignEndVertical className="w-4 h-4 mx-auto" /></button>
                                    
                                    <button onClick={() => alignElement('top')} className="p-1.5 hover:bg-indigo-50 rounded text-gray-600 hover:text-indigo-600" title="Alinhar ao Topo"><AlignStartHorizontal className="w-4 h-4 mx-auto" /></button>
                                    <button onClick={() => alignElement('middle')} className="p-1.5 hover:bg-indigo-50 rounded text-gray-600 hover:text-indigo-600" title="Centralizar Verticalmente"><AlignCenterHorizontal className="w-4 h-4 mx-auto" /></button>
                                    <button onClick={() => alignElement('bottom')} className="p-1.5 hover:bg-indigo-50 rounded text-gray-600 hover:text-indigo-600" title="Alinhar à Base"><AlignEndHorizontal className="w-4 h-4 mx-auto" /></button>

                                    <div className="col-span-3 h-px bg-gray-100 my-1"></div>
                                    
                                    <button 
                                        onClick={groupSelected} 
                                        disabled={selectedIds.length < 2}
                                        className={`flex flex-col items-center justify-center p-1.5 rounded transition-colors ${selectedIds.length >= 2 ? 'hover:bg-indigo-50 text-indigo-600' : 'text-gray-300 cursor-not-allowed'}`}
                                        title="Agrupar Elementos"
                                    >
                                        <Layers className="w-4 h-4" />
                                        <span className="text-[8px] font-bold mt-0.5">Agrupar</span>
                                    </button>

                                    <button 
                                        onClick={ungroupSelected} 
                                        disabled={selectedIds.length === 0}
                                        className={`flex flex-col items-center justify-center p-1.5 rounded transition-colors ${selectedIds.length > 0 ? 'hover:bg-red-50 text-gray-600 hover:text-red-600' : 'text-gray-300 cursor-not-allowed'}`}
                                        title="Desagrupar Elementos"
                                    >
                                        <X className="w-4 h-4" />
                                        <span className="text-[8px] font-bold mt-0.5">Desagrupar</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        <AnimatePresence>
                            {((!isMobile && showLayers) || (isMobile && mobileDrawer === 'layers')) && (
                                <motion.div 
                                    initial={isMobile ? { y: '100%' } : { opacity: 0, scale: 0.95 }}
                                    animate={isMobile ? { y: 0 } : { opacity: 1, scale: 1 }}
                                    exit={isMobile ? { y: '100%' } : { opacity: 0, scale: 0.95 }}
                                    className={isMobile ? "fixed inset-x-0 bottom-0 z-[1000] bg-white rounded-t-3xl shadow-2xl h-[60vh] flex flex-col no-print" : "absolute left-4 top-20 w-64 bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col max-h-[50vh] z-40 no-print animate-in fade-in zoom-in-95 duration-200"}
                                >
                                    <div className="flex items-center justify-between p-3 border-b border-gray-100 bg-gray-50 rounded-t-lg">
                                        <div className="flex items-center text-gray-500 font-bold text-xs uppercase tracking-wide"><Layers className="w-3 h-3 mr-1.5" /> Camadas</div>
                                        <button onClick={() => isMobile ? setMobileDrawer('none') : setShowLayers(false)} className="text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>
                                    </div>
                                    <div className="p-2 overflow-y-auto custom-scrollbar flex-1">
                                        {getActiveElements().slice().reverse().map((el) => (<div key={el.id} onClick={(e) => handleLayerClick(e, el.id)} className={`flex items-center p-2 rounded text-xs cursor-pointer border group/layer mb-1 ${selectedIds.includes(el.id) ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'bg-white border-gray-100 text-gray-600 hover:bg-gray-50'}`}><span className="flex-1 truncate font-medium">{el.name || el.type} {el.groupId && <span className="text-[9px] text-indigo-400 bg-indigo-50 px-1 rounded ml-1">G</span>}</span><div className="flex items-center opacity-0 group-hover/layer:opacity-100 transition-opacity"><button onClick={(e) => { e.stopPropagation(); moveLayer(el.id, 'up'); }} className="p-1 hover:text-indigo-600 hover:bg-indigo-100 rounded mr-0.5"><ChevronUp className="w-3 h-3" /></button><button onClick={(e) => { e.stopPropagation(); moveLayer(el.id, 'down'); }} className="p-1 hover:text-indigo-600 hover:bg-indigo-100 rounded mr-1"><ChevronDown className="w-3 h-3" /></button><button onClick={(e) => { e.stopPropagation(); removeElement(el.id); }} className="text-gray-400 hover:text-red-500 p-1 hover:bg-red-50 rounded"><Trash2 className="w-3 h-3" /></button></div></div>))}
                                        {getActiveElements().length === 0 && <div className="text-center text-gray-400 text-xs py-4">Sem camadas</div>}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <AnimatePresence>
                            {((!isMobile && showProperties) || (isMobile && mobileDrawer === 'properties')) && activeTab === 'editor' && (
                                <motion.aside 
                                    initial={isMobile ? { y: '100%' } : { opacity: 0, x: 20 }}
                                    animate={isMobile ? { y: 0 } : { opacity: 1, x: 0 }}
                                    exit={isMobile ? { y: '100%' } : { opacity: 0, x: 20 }}
                                    className={isMobile ? "fixed inset-x-0 bottom-0 z-[1000] bg-white rounded-t-3xl shadow-2xl h-[70vh] flex flex-col no-print" : "absolute right-0 top-0 bottom-0 w-72 bg-white border-l border-gray-200 flex flex-col h-full z-45 no-print shadow-sm"}
                                >
                                    <div className="flex items-center justify-between p-3 border-b border-gray-100 bg-gray-50 shrink-0">
                                        <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-widest flex items-center gap-2"><icons.Settings2 className="w-4 h-4" /> Ajustes</h3>
                                        <div className="flex items-center gap-1">
                                            <button onClick={() => isMobile ? setMobileDrawer('none') : setShowProperties(false)} className="p-1 hover:bg-gray-100 rounded transition-colors text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                    <div className="overflow-y-auto custom-scrollbar flex-1 pb-20 md:pb-4">
                                        {selectedElement ? (
                                        <div className="p-4 space-y-5">
                                            <div className="space-y-2">
                                                <label className="block text-[10px] font-bold text-gray-500 uppercase">Nome da Camada</label>
                                                <input type="text" value={selectedElement.name || selectedElement.type} onChange={(e) => updateElementName(selectedElement.id, e.target.value)} className="w-full text-xs p-2 border border-gray-200 rounded focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                                            </div>

                                            <div className="pt-3 border-t border-gray-100 space-y-3">
                                                <div className="space-y-2">
                                                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Exibir em quais páginas?</label>
                                                    <select 
                                                        value={selectedElement.style.displayOn || 'all'} 
                                                        onChange={(e) => updateElementStyle(selectedElement.id, { displayOn: e.target.value as any })} 
                                                        className="w-full text-xs p-2 border border-gray-200 rounded bg-white"
                                                    >
                                                        <option value="all">Todas as Páginas</option>
                                                        <option value="even">Páginas Pares (Verso)</option>
                                                        <option value="odd">Páginas Ímpares (Frente)</option>
                                                        <option value="custom">Páginas Específicas (Manual)</option>
                                                        {editMode === 'daily' && (
                                                            <>
                                                                <option value="weekdays">Dias de Semana (Seg-Sex)</option>
                                                                <option value="weekends">Finais de Semana (Sáb-Dom)</option>
                                                            </>
                                                        )}
                                                    </select>
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Intervalo de Páginas (Manual)</label>
                                                    <input 
                                                        type="text" 
                                                        placeholder="ex: 1, 3, 5-10" 
                                                        value={selectedElement.style.customPages || ''} 
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            const updates: any = { customPages: val };
                                                            if (val.trim() !== '') {
                                                                updates.displayOn = 'custom';
                                                            }
                                                            updateElementStyle(selectedElement.id, updates);
                                                        }} 
                                                        className="w-full text-xs p-2 border border-gray-200 rounded focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                                    />
                                                    <p className="text-[9px] text-gray-400 italic">Use vírgulas para páginas separadas e hífen para intervalos.</p>
                                                </div>
                                            </div>

                                            <div className="h-px bg-gray-100"></div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Posição X (mm)</label>
                                                    <input 
                                                        type="number" 
                                                        step="1"
                                                        value={Math.round((selectedElement.x / 100) * usableWidthMM)} 
                                                        onChange={(e) => {
                                                            const val = parseFloat(e.target.value);
                                                            if (!isNaN(val)) {
                                                                const percentage = (val / usableWidthMM) * 100;
                                                                updateActiveElements(getActiveElements().map(el => selectedIds.includes(el.id) ? {...el, x: percentage} : el));
                                                            }
                                                        }} 
                                                        className="w-full text-xs p-1 border border-gray-200 rounded focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" 
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Posição Y (mm)</label>
                                                    <input 
                                                        type="number" 
                                                        step="1"
                                                        value={Math.round((selectedElement.y / 100) * usableHeightMM)} 
                                                        onChange={(e) => {
                                                            const val = parseFloat(e.target.value);
                                                            if (!isNaN(val)) {
                                                                const percentage = (val / usableHeightMM) * 100;
                                                                updateActiveElements(getActiveElements().map(el => selectedIds.includes(el.id) ? {...el, y: percentage} : el));
                                                            }
                                                        }} 
                                                        className="w-full text-xs p-1 border border-gray-200 rounded focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" 
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Largura (mm)</label>
                                                    <div className="flex items-center gap-1">
                                                        <input 
                                                            type="number" 
                                                            min="5" 
                                                            max={usableWidthMM} 
                                                            step="1"
                                                            value={Math.round((selectedElement.w / 100) * usableWidthMM)} 
                                                            onChange={(e) => {
                                                                const val = parseFloat(e.target.value);
                                                                if (!isNaN(val)) {
                                                                    const percentage = (val / usableWidthMM) * 100;
                                                                    updateActiveElements(getActiveElements().map(el => selectedIds.includes(el.id) ? {...el, w: percentage} : el));
                                                                }
                                                            }} 
                                                            className="w-full text-xs p-1 border border-gray-200 rounded focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" 
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Altura (mm)</label>
                                                    <div className="flex items-center gap-1">
                                                        <input 
                                                            type="number" 
                                                            min="2" 
                                                            max={usableHeightMM} 
                                                            step="1"
                                                            value={Math.round((selectedElement.h / 100) * usableHeightMM)} 
                                                            onChange={(e) => {
                                                                const val = parseFloat(e.target.value);
                                                                if (!isNaN(val)) {
                                                                    const percentage = (val / usableHeightMM) * 100;
                                                                    updateActiveElements(getActiveElements().map(el => selectedIds.includes(el.id) ? {...el, h: percentage} : el));
                                                                }
                                                            }} 
                                                            className="w-full text-xs p-1 border border-gray-200 rounded focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" 
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {selectedElement.type === 'table' && selectedElement.style.table && (
                                                <div className="pt-3 border-t border-gray-100">
                                                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Configuração da Tabela</h4>
                                                    
                                                    <div className="flex bg-gray-100 p-1 rounded mb-4">
                                                        <button 
                                                            onClick={() => setTableStyleScope('global')} 
                                                            className={`flex-1 py-1 text-[10px] font-bold uppercase rounded ${tableStyleScope === 'global' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                                                        >
                                                            Geral
                                                        </button>
                                                        <button 
                                                            onClick={() => setTableStyleScope('row')} 
                                                            className={`flex-1 py-1 text-[10px] font-bold uppercase rounded ${tableStyleScope === 'row' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                                                        >
                                                            Linha
                                                        </button>
                                                        <button 
                                                            onClick={() => setTableStyleScope('col')} 
                                                            className={`flex-1 py-1 text-[10px] font-bold uppercase rounded ${tableStyleScope === 'col' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                                                        >
                                                            Coluna
                                                        </button>
                                                    </div>

                                                    <div className="space-y-4">
                                                        {tableStyleScope === 'global' ? (
                                                            <>
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div>
                                                                        <label className="block text-[10px] text-gray-500 mb-1 uppercase font-bold tracking-tight">Linhas</label>
                                                                        <div className="flex items-center gap-1">
                                                                            <button 
                                                                                onClick={() => updateTableConfig(selectedElement.id, { rows: Math.max(1, selectedElement.style.table!.rows - 1) })}
                                                                                className="p-1.5 hover:bg-gray-100 rounded border border-gray-200 bg-white"
                                                                            >
                                                                                <Minus className="w-3 h-3 text-gray-500" />
                                                                            </button>
                                                                            <input 
                                                                                type="number" 
                                                                                min="1" 
                                                                                max="100" 
                                                                                value={selectedElement.style.table.rows || 1} 
                                                                                onChange={(e) => updateTableConfig(selectedElement.id, { rows: Math.max(1, parseInt(e.target.value) || 1) })} 
                                                                                className="w-full text-xs p-1 h-8 border border-gray-200 rounded text-center focus:ring-1 focus:ring-indigo-500"
                                                                            />
                                                                            <button 
                                                                                onClick={() => updateTableConfig(selectedElement.id, { rows: Math.min(100, selectedElement.style.table!.rows + 1) })}
                                                                                className="p-1.5 hover:bg-gray-100 rounded border border-gray-200 bg-white"
                                                                            >
                                                                                <Plus className="w-3 h-3 text-gray-500" />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                    <div>
                                                                        <label className="block text-[10px] text-gray-500 mb-1 uppercase font-bold tracking-tight">Colunas</label>
                                                                        <div className="flex items-center gap-1">
                                                                            <button 
                                                                                onClick={() => updateTableConfig(selectedElement.id, { cols: Math.max(1, selectedElement.style.table!.cols - 1) })}
                                                                                className="p-1.5 hover:bg-gray-100 rounded border border-gray-200 bg-white"
                                                                            >
                                                                                <Minus className="w-3 h-3 text-gray-500" />
                                                                            </button>
                                                                            <input 
                                                                                type="number" 
                                                                                min="1" 
                                                                                max="20" 
                                                                                value={selectedElement.style.table.cols || 1} 
                                                                                onChange={(e) => updateTableConfig(selectedElement.id, { cols: Math.max(1, parseInt(e.target.value) || 1) })} 
                                                                                className="w-full text-xs p-1 h-8 border border-gray-200 rounded text-center focus:ring-1 focus:ring-indigo-500"
                                                                            />
                                                                            <button 
                                                                                onClick={() => updateTableConfig(selectedElement.id, { cols: Math.min(20, selectedElement.style.table!.cols + 1) })}
                                                                                className="p-1.5 hover:bg-gray-100 rounded border border-gray-200 bg-white"
                                                                            >
                                                                                <Plus className="w-3 h-3 text-gray-500" />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                
                                                                <div className="flex items-center justify-between">
                                                                    <label className="text-[10px] font-bold text-gray-500">Altura Fixa da Linha</label>
                                                                    <input 
                                                                        type="checkbox" 
                                                                        checked={!!selectedElement.style.table.rowHeight} 
                                                                        onChange={(e) => {
                                                                            const isChecked = e.target.checked;
                                                                            updateTableConfig(selectedElement.id, { rowHeight: isChecked ? 20 : null });
                                                                        }}
                                                                        className="rounded text-indigo-600"
                                                                    />
                                                                </div>

                                                                {selectedElement.style.table.rowHeight && (
                                                                    <div className="flex items-center justify-between">
                                                                        <label className="text-[10px] font-bold text-gray-500">Altura Linha (px)</label>
                                                                        <div className="flex items-center gap-1">
                                                                            <input 
                                                                                type="range" 
                                                                                min="5" 
                                                                                max="100" 
                                                                                value={selectedElement.style.table.rowHeight || 20} 
                                                                                onChange={(e) => updateTableConfig(selectedElement.id, { rowHeight: parseInt(e.target.value) })} 
                                                                                className="w-16" 
                                                                            />
                                                                            <span className="text-xs w-6 text-right text-gray-600">{selectedElement.style.table.rowHeight}</span>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                <div className="flex items-center justify-between"><label className="text-[10px] font-bold text-gray-500">Borda (px)</label><input type="number" min="0" max="5" step="0.25" value={selectedElement.style.table.borderWidth || 0} onChange={(e) => updateTableConfig(selectedElement.id, { borderWidth: parseFloat(e.target.value) })} className="w-16 text-xs p-1 border rounded" /></div>
                                                                <div className="flex items-center justify-between">
                                                                    <label className="text-[10px] font-bold text-gray-500">Estilo Borda</label>
                                                                    <select 
                                                                        value={selectedElement.style.table.borderStyle || 'solid'} 
                                                                        onChange={(e) => updateTableConfig(selectedElement.id, { borderStyle: e.target.value as any })} 
                                                                        className="text-[10px] p-1 border rounded bg-white w-24"
                                                                    >
                                                                        <option value="solid">Sólida</option>
                                                                        <option value="dashed">Tracejada</option>
                                                                        <option value="dotted">Pontilhada</option>
                                                                    </select>
                                                                </div>
                                                                <div className="flex items-center justify-between"><label className="text-[10px] font-bold text-gray-500">Cor Borda</label><div className="flex h-6 border border-gray-200 rounded overflow-hidden"><input type="color" value={selectedElement.style.table.borderColor || '#e5e7eb'} onChange={(e) => updateTableConfig(selectedElement.id, { borderColor: e.target.value })} className="w-8 h-full p-0 border-0 cursor-pointer" /></div></div>
                                                                <div className="flex items-center justify-between"><label className="text-[10px] font-bold text-gray-500">Arredondar (px)</label><input type="number" min="0" max="50" step="1" value={selectedElement.style.table.borderRadius || 0} onChange={(e) => updateTableConfig(selectedElement.id, { borderRadius: parseInt(e.target.value) || 0 })} className="w-16 text-xs p-1 border rounded" /></div>
                                                                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={selectedElement.style.table.headerRow} onChange={(e) => updateTableConfig(selectedElement.id, { headerRow: e.target.checked })} className="rounded text-indigo-600" /><span className="text-[10px] text-gray-600">Linha de Cabeçalho</span></label>
                                                                
                                                                <div className="pt-3 mt-3 border-t border-gray-100 bg-gray-50 p-2 rounded">
                                                                    <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Bordas do Grid</h4>
                                                                    <div className="grid grid-cols-3 gap-1">
                                                                        {renderBorderToggle(selectedElement.style.table.borders?.top ?? true, () => toggleTableBorder('top'), <PanelTop className="w-4 h-4"/>, "Topo")}
                                                                        {renderBorderToggle(selectedElement.style.table.borders?.headerSeparator ?? true, () => toggleTableBorder('headerSeparator'), <Minus className="w-4 h-4"/>, "Header")}
                                                                        {renderBorderToggle(selectedElement.style.table.borders?.bottom ?? true, () => toggleTableBorder('bottom'), <PanelBottom className="w-4 h-4"/>, "Base")}
                                                                        {renderBorderToggle(selectedElement.style.table.borders?.left ?? true, () => toggleTableBorder('left'), <PanelLeft className="w-4 h-4"/>, "Esq.")}
                                                                        {renderBorderToggle(selectedElement.style.table.borders?.insideVertical ?? true, () => toggleTableBorder('insideVertical'), <Columns className="w-4 h-4"/>, "Int. V")}
                                                                        {renderBorderToggle(selectedElement.style.table.borders?.right ?? true, () => toggleTableBorder('right'), <PanelRight className="w-4 h-4"/>, "Dir.")}
                                                                        {renderBorderToggle(selectedElement.style.table.borders?.insideHorizontal ?? true, () => toggleTableBorder('insideHorizontal'), <Rows className="w-4 h-4"/>, "Int. H")}
                                                                    </div>
                                                                </div>

                                                                <div className="pt-3 border-t border-gray-100">
                                                                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Estilo de Texto Geral</h4>
                                                                    {renderTypographyControls(selectedElement.style.table.textStyle || { fontFamily: 'Inter', fontSize: 10, fontWeight: 'normal', color: '#666', textAlign: 'left', verticalAlign: 'top', textTransform: 'none', letterSpacing: 0, backgroundColor: 'transparent' }, (updates) => updateTableConfig(selectedElement.id, { textStyle: { ...selectedElement.style.table?.textStyle, ...updates } }))}
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <div className="space-y-4">
                                                                <div className="p-3 bg-amber-50 border border-amber-100 rounded text-[10px] text-amber-800 leading-tight">
                                                                    Para editar uma <strong>{tableStyleScope === 'row' ? 'linha' : 'coluna'}</strong> específica, selecione primeiro uma célula da tabela.
                                                                </div>
                                                                
                                                                {activeTableCell ? (
                                                                    <div className="space-y-4">
                                                                        <div className="flex flex-col p-2.5 bg-indigo-50/50 rounded-lg border border-indigo-100">
                                                                           <div className="flex items-center justify-between mb-2">
                                                                               <span className="text-[10px] font-bold text-indigo-700 uppercase flex items-center gap-1">
                                                                                   <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                                                                   {tableStyleScope === 'row' ? `Editando Linha ${activeTableCell.r + 1}` : `Editando Coluna ${activeTableCell.c + 1}`}
                                                                               </span>
                                                                               <button 
                                                                                   onClick={() => setActiveTableCell(null)}
                                                                                   className="p-1 hover:bg-white rounded-md text-indigo-400 hover:text-indigo-600 transition-colors"
                                                                                   title="Desmarcar Célula"
                                                                               >
                                                                                   <X className="w-3 h-3" />
                                                                               </button>
                                                                           </div>
                                                                            <div className="grid grid-cols-2 gap-2">
                                                                                <button 
                                                                                    onClick={() => tableStyleScope === 'row' ? addTableRow(selectedElement.id, activeTableCell.r, 'before') : addTableColumn(selectedElement.id, activeTableCell.c, 'before')}
                                                                                    className="p-1.5 hover:bg-white rounded-md border border-indigo-200 text-indigo-600 bg-white/50 shadow-sm transition-all flex items-center justify-center gap-1.5"
                                                                                    title="Inserir Antes"
                                                                                >
                                                                                    <Plus className="w-2.5 h-2.5" /> <span className="text-[10px] font-bold">Adicionar Antes</span>
                                                                                </button>
                                                                                <button 
                                                                                    onClick={() => tableStyleScope === 'row' ? addTableRow(selectedElement.id, activeTableCell.r, 'after') : addTableColumn(selectedElement.id, activeTableCell.c, 'after')}
                                                                                    className="p-1.5 hover:bg-white rounded-md border border-indigo-200 text-indigo-600 bg-white/50 shadow-sm transition-all flex items-center justify-center gap-1.5"
                                                                                    title="Inserir Depois"
                                                                                >
                                                                                    <Plus className="w-2.5 h-2.5" /> <span className="text-[10px] font-bold">Adicionar Depois</span>
                                                                                </button>
                                                                                <button 
                                                                                    onClick={() => {
                                                                                        if (confirm(`Tem certeza que deseja excluir esta ${tableStyleScope === 'row' ? 'linha' : 'coluna'}?`)) {
                                                                                            tableStyleScope === 'row' ? deleteTableRow(selectedElement.id, activeTableCell.r) : deleteTableColumn(selectedElement.id, activeTableCell.c);
                                                                                        }
                                                                                    }}
                                                                                    className="col-span-2 p-1.5 hover:bg-red-50 rounded-md border border-red-100 text-red-500 hover:text-red-600 bg-white/50 transition-all flex items-center justify-center gap-1.5"
                                                                                    title="Excluir"
                                                                                >
                                                                                    <Trash2 className="w-2.5 h-2.5" /> <span className="text-[10px] font-bold">Excluir {tableStyleScope === 'row' ? 'esta Linha' : 'esta Coluna'}</span>
                                                                                </button>
                                                                            </div>
                                                                        </div>


                                                                        <div className="space-y-2">
                                                                            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Customizar Estilo</h4>
                                                                            {renderTypographyControls(
                                                                                (tableStyleScope === 'row' 
                                                                                    ? (selectedElement.style.table.rowStyles?.[activeTableCell.r] || selectedElement.style.table.textStyle) 
                                                                                    : (selectedElement.style.table.colStyles?.[activeTableCell.c] || selectedElement.style.table.textStyle)) || { fontFamily: 'Inter', fontSize: 10, fontWeight: 'normal', color: '#666', textAlign: 'left', verticalAlign: 'top', textTransform: 'none', letterSpacing: 0, backgroundColor: 'transparent' }, 
                                                                                (updates) => {
                                                                                    if (tableStyleScope === 'row') {
                                                                                        const current = selectedElement.style.table!.rowStyles?.[activeTableCell.r] || selectedElement.style.table!.textStyle || {};
                                                                                        updateTableConfig(selectedElement.id, { 
                                                                                            rowStyles: { 
                                                                                                ...selectedElement.style.table!.rowStyles, 
                                                                                                [activeTableCell.r]: { ...current, ...updates } 
                                                                                            } 
                                                                                        });
                                                                                    } else {
                                                                                        const current = selectedElement.style.table!.colStyles?.[activeTableCell.c] || selectedElement.style.table!.textStyle || {};
                                                                                        updateTableConfig(selectedElement.id, { 
                                                                                            colStyles: { 
                                                                                                ...selectedElement.style.table!.colStyles, 
                                                                                                [activeTableCell.c]: { ...current, ...updates } 
                                                                                            } 
                                                                                        });
                                                                                    }
                                                                                }
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex flex-col items-center justify-center py-6 text-gray-400 border border-dashed border-gray-200 rounded">
                                                                        <MousePointer2 className="w-5 h-5 mb-2 opacity-20" />
                                                                        <span className="text-[10px]">Clique em uma célula</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {selectedElement.type === 'permanent_day_header' && (
                                                <div className="pt-3 border-t border-gray-100">
                                                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Estilo Dias da Semana</h4>
                                                    <div className="space-y-3">
                                                        <div className="space-y-1">
                                                            <label className="block text-[10px] font-bold text-gray-500 uppercase">Variante</label>
                                                            <select 
                                                                value={selectedElement.style.variant || 'circles_outline'} 
                                                                onChange={(e) => updateElementStyle(selectedElement.id, { variant: e.target.value })} 
                                                                className="w-full text-xs p-2 border border-gray-200 rounded bg-white"
                                                            >
                                                                <option value="circles_outline">Círculos (Contorno)</option>
                                                                <option value="circles_filled">Círculos (Preenchido)</option>
                                                                <option value="square_outline">Quadrados (Contorno)</option>
                                                                <option value="square_filled">Quadrados (Preenchido)</option>
                                                                <option value="circles_outline_text_below">Círculos + Letra Abaixo</option>
                                                                <option value="circles_filled_text_below">Círculos Preenchidos + Letra Abaixo</option>
                                                                <option value="square_outline_text_below">Quadrados + Letra Abaixo</option>
                                                                <option value="square_filled_text_below">Quadrados Preenchidos + Letra Abaixo</option>
                                                                <option value="minimal">Minimalista</option>
                                                            </select>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <label className="text-[10px] font-bold text-gray-500 uppercase">Cor</label>
                                                            <div className="flex h-6 border border-gray-200 rounded overflow-hidden">
                                                                <input type="color" value={selectedElement.style.color || '#f472b6'} onChange={(e) => updateElementStyle(selectedElement.id, { color: e.target.value })} className="w-8 h-full p-0 border-0 cursor-pointer" />
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <label className="text-[10px] font-bold text-gray-500 uppercase">Cor Contorno</label>
                                                            <div className="flex h-6 border border-gray-200 rounded overflow-hidden">
                                                                <input type="color" value={selectedElement.style.borderColor || selectedElement.style.color || '#f472b6'} onChange={(e) => updateElementStyle(selectedElement.id, { borderColor: e.target.value })} className="w-8 h-full p-0 border-0 cursor-pointer" />
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <label className="text-[10px] font-bold text-gray-500 uppercase">Tamanho Fonte</label>
                                                            <input type="number" min="6" max="32" value={selectedElement.style.fontSize || 10} onChange={(e) => updateElementStyle(selectedElement.id, { fontSize: parseInt(e.target.value) })} className="w-16 text-xs p-1 border rounded" />
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <label className="text-[10px] font-bold text-gray-500 uppercase">Tamanho Formas ({Math.round((selectedElement.style.shapeScale || 1) * 100)}%)</label>
                                                            <input 
                                                                type="range" 
                                                                min="0.3" 
                                                                max="1.5" 
                                                                step="0.1" 
                                                                value={selectedElement.style.shapeScale || 1} 
                                                                onChange={(e) => updateElementStyle(selectedElement.id, { shapeScale: parseFloat(e.target.value) })} 
                                                                className="w-20" 
                                                            />
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <label className="text-[10px] font-bold text-gray-500 uppercase">Espessura Contorno</label>
                                                            <input 
                                                                type="number" 
                                                                min="0" 
                                                                max="10" 
                                                                step="0.5" 
                                                                value={selectedElement.style.borderWidth ?? 1} 
                                                                onChange={(e) => updateElementStyle(selectedElement.id, { borderWidth: parseFloat(e.target.value) })} 
                                                                className="w-16 text-xs p-1 border rounded" 
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {selectedElement.type === 'icon' && (
                                                <div className="pt-3 border-t border-gray-100">
                                                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Escolher Ícone</h4>
                                                    <div className="grid grid-cols-6 gap-1 max-h-40 overflow-y-auto p-1 border border-gray-100 rounded custom-scrollbar mb-3">
                                                        {COMMON_ICONS.map(iconName => {
                                                            const Icon = (icons as any)[iconName] || icons.HelpCircle;
                                                            return (
                                                                <button 
                                                                    key={iconName}
                                                                    onClick={() => updateElementStyle(selectedElement.id, { iconName })}
                                                                    className={`p-1.5 rounded hover:bg-indigo-50 flex items-center justify-center ${selectedElement.style.iconName === iconName ? 'bg-indigo-100 text-indigo-600 ring-1 ring-indigo-300' : 'text-gray-500'}`}
                                                                    title={iconName}
                                                                >
                                                                    <Icon size={16} />
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                    <div className="space-y-3">
                                                        <div className="flex items-center justify-between">
                                                            <label className="text-[10px] font-bold text-gray-500 uppercase">Cor Principal</label>
                                                            <div className="flex h-6 border border-gray-200 rounded overflow-hidden">
                                                                <input 
                                                                    type="color" 
                                                                    value={selectedElement.style.color || '#6366f1'} 
                                                                    onChange={(e) => updateElementStyle(selectedElement.id, { color: e.target.value })} 
                                                                    className="w-8 h-full p-0 border-0 cursor-pointer" 
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <label className="text-[10px] font-bold text-gray-500 uppercase">Preenchimento</label>
                                                            <div className="flex h-6 border border-gray-200 rounded overflow-hidden">
                                                                <input 
                                                                    type="color" 
                                                                    value={selectedElement.style.backgroundColor || '#ffffff'} 
                                                                    onChange={(e) => updateElementStyle(selectedElement.id, { backgroundColor: e.target.value })} 
                                                                    className="w-8 h-full p-0 border-0 cursor-pointer" 
                                                                />
                                                                <button 
                                                                    onClick={() => updateElementStyle(selectedElement.id, { backgroundColor: 'transparent' })}
                                                                    className="px-1 text-[8px] bg-gray-50 hover:bg-gray-100 border-l border-gray-200"
                                                                >
                                                                    Limpar
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <label className="text-[10px] font-bold text-gray-500 uppercase">Espessura ({selectedElement.style.borderWidth || 2})</label>
                                                            <input 
                                                                type="range" 
                                                                min="0.5" 
                                                                max="5" 
                                                                step="0.5" 
                                                                value={selectedElement.style.borderWidth || 2} 
                                                                onChange={(e) => updateElementStyle(selectedElement.id, { borderWidth: parseFloat(e.target.value) })} 
                                                                className="w-24" 
                                                            />
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <label className="text-[10px] font-bold text-gray-500 uppercase">Opacidade</label>
                                                            <input 
                                                                type="range" 
                                                                min="0" 
                                                                max="1" 
                                                                step="0.1" 
                                                                value={selectedElement.style.opacity ?? 1} 
                                                                onChange={(e) => updateElementStyle(selectedElement.id, { opacity: parseFloat(e.target.value) })} 
                                                                className="w-24" 
                                                            />
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <button 
                                                                onClick={() => updateElementStyle(selectedElement.id, { flipX: !selectedElement.style.flipX })}
                                                                className={`py-1.5 px-2 rounded border text-[10px] font-bold uppercase flex items-center justify-center gap-1 ${selectedElement.style.flipX ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-gray-200 text-gray-600'}`}
                                                            >
                                                                <FlipHorizontal className="w-3 h-3" /> Inverter H
                                                            </button>
                                                            <button 
                                                                onClick={() => updateElementStyle(selectedElement.id, { flipY: !selectedElement.style.flipY })}
                                                                className={`py-1.5 px-2 rounded border text-[10px] font-bold uppercase flex items-center justify-center gap-1 ${selectedElement.style.flipY ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-gray-200 text-gray-600'}`}
                                                            >
                                                                <FlipVertical className="w-3 h-3" /> Inverter V
                                                            </button>
                                                        </div>
                                                        <div className="pt-2">
                                                            <label className="flex items-center gap-2 cursor-pointer">
                                                                <input 
                                                                    type="checkbox" 
                                                                    checked={selectedElement.style.autoMirrorImage || false} 
                                                                    onChange={(e) => updateElementStyle(selectedElement.id, { autoMirrorImage: e.target.checked })} 
                                                                     className="rounded text-indigo-600 focus:ring-indigo-500 h-3 w-3"
                                                                 />
                                                                 <span className="text-[10px] font-bold text-gray-500 uppercase">Auto-espelhar em pág. pares</span>
                                                             </label>
                                                         </div>

                                                         {['date_placeholder', 'day_number', 'day_name', 'month_name', 'month_number', 'year'].includes(selectedElement.type) && (
                                                            <div className="pt-3 border-t border-gray-100">
                                                                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">
                                                                    {(config.layoutType === 'weekly_vertical' || config.layoutType === 'weekly_horizontal') ? 'Vínculo com o Dia' : 'Sequência do Dia'}
                                                                </h4>
                                                                <div className="space-y-2">
                                                                    <label className="block text-[10px] font-bold text-gray-500 uppercase">
                                                                        {(config.layoutType === 'weekly_vertical' || config.layoutType === 'weekly_horizontal') ? 'Dia da Semana' : 'Ordem na Página (Offset)'}
                                                                    </label>
                                                                    
                                                                    {(config.layoutType === 'weekly_vertical' || config.layoutType === 'weekly_horizontal') ? (
                                                                        <select 
                                                                            value={selectedElement.style.dayIndex ?? 1} 
                                                                            onChange={(e) => updateElementStyle(selectedElement.id, { dayIndex: parseInt(e.target.value) })} 
                                                                            className="w-full text-xs p-1.5 border border-gray-200 rounded"
                                                                        >
                                                                            <option value={1}>Segunda-feira</option>
                                                                            <option value={2}>Terça-feira</option>
                                                                            <option value={3}>Quarta-feira</option>
                                                                            <option value={4}>Quinta-feira</option>
                                                                            <option value={5}>Sexta-feira</option>
                                                                            <option value={6}>Sábado</option>
                                                                            <option value={0}>Domingo</option>
                                                                        </select>
                                                                    ) : (
                                                                        <div className="space-y-1">
                                                                            <input 
                                                                                type="number" 
                                                                                min="0" 
                                                                                max="31" 
                                                                                value={selectedElement.style.dayIndex ?? 0}
                                                                                onChange={(e) => updateElementStyle(selectedElement.id, { dayIndex: parseInt(e.target.value) || 0 })}
                                                                                className="w-full text-xs p-1.5 border border-gray-200 rounded"
                                                                            />
                                                                            <p className="text-[9px] text-gray-400 italic font-medium">0 = Primeiro dia, 1 = Segundo dia, etc.</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                         )}
                                                     </div>
                                                 </div>
                                             )}

                                            {selectedElement.type === 'planner_day_box' && (
                                                <div className="pt-3 border-t border-gray-100">
                                                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Configuração do Dia (Planner)</h4>
                                                    <div className="space-y-4">
                                                        <div className="space-y-2">
                                                            <label className="block text-[10px] font-bold text-gray-500 uppercase">Dia da Semana</label>
                                                            <select 
                                                                value={selectedElement.style.plannerDayBox?.dayIndex ?? 1} 
                                                                onChange={(e) => updateElementStyle(selectedElement.id, { plannerDayBox: { ...selectedElement.style.plannerDayBox, dayIndex: parseInt(e.target.value) } })} 
                                                                className="w-full text-xs p-1.5 border border-gray-200 rounded"
                                                            >
                                                                <option value={1}>Segunda-feira</option>
                                                                <option value={2}>Terça-feira</option>
                                                                <option value={3}>Quarta-feira</option>
                                                                <option value={4}>Quinta-feira</option>
                                                                <option value={5}>Sexta-feira</option>
                                                                <option value={6}>Sábado</option>
                                                                <option value={0}>Domingo</option>
                                                            </select>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="block text-[10px] font-bold text-gray-500 uppercase">Estilo do Miolo</label>
                                                            <select 
                                                                value={selectedElement.style.plannerDayBox?.contentStyle ?? 'lines'} 
                                                                onChange={(e) => updateElementStyle(selectedElement.id, { plannerDayBox: { ...selectedElement.style.plannerDayBox, contentStyle: e.target.value as any } })} 
                                                                className="w-full text-xs p-1.5 border border-gray-200 rounded"
                                                            >
                                                                <option value="blank">Sem nada (Em branco)</option>
                                                                <option value="lines">Com Linhas (Pautada)</option>
                                                                <option value="dots">Com Pontos (Pontilhada)</option>
                                                                <option value="grid">Com Grade (Quadriculada)</option>
                                                                <option value="timetable">Horários</option> 
                                                            </select>
                                                        </div>
                                                        {selectedElement.style.plannerDayBox?.contentStyle === 'timetable' && (
                                                            <div className="flex items-center justify-between">
                                                                <label className="text-[10px] font-bold text-gray-500 uppercase">Hora Inicial</label>
                                                                <input 
                                                                    type="number" 
                                                                    min="0" 
                                                                    max="23" 
                                                                    value={selectedElement.style.plannerDayBox?.startHour ?? 7} 
                                                                    onChange={(e) => updateElementStyle(selectedElement.id, { 
                                                                        plannerDayBox: { ...selectedElement.style.plannerDayBox, startHour: parseInt(e.target.value) || 0 } 
                                                                    })} 
                                                                    className="w-16 text-xs p-1.5 border border-gray-200 rounded" 
                                                                />
                                                            </div>
                                                        )}
                                                        <div className="flex flex-col gap-1.5 border-b border-gray-100/50 pb-2 mb-2 w-full">
                                                            <div className="flex items-center justify-between w-full">
                                                                <label className="text-[10px] font-bold text-gray-500 uppercase">
                                                                    Espaçamento: {selectedElement.style.plannerDayBox?.lineSpacing || selectedElement.style.plannerDayBox?.gridSpacing || 20} px
                                                                </label>
                                                                <span className="text-[10px] font-mono text-indigo-600 font-semibold bg-indigo-50 px-1.5 py-0.5 rounded">
                                                                    {((selectedElement.style.plannerDayBox?.lineSpacing || selectedElement.style.plannerDayBox?.gridSpacing || 20) / EDITOR_SCALE).toFixed(1)} mm
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center justify-between gap-4 w-full">
                                                                <input 
                                                                    type="range" 
                                                                    min="5" 
                                                                    max="50" 
                                                                    step="1" 
                                                                    value={selectedElement.style.plannerDayBox?.lineSpacing || selectedElement.style.plannerDayBox?.gridSpacing || 20} 
                                                                    onChange={(e) => {
                                                                        const val = parseInt(e.target.value);
                                                                        updateElementStyle(selectedElement.id, { 
                                                                            plannerDayBox: { 
                                                                                ...selectedElement.style.plannerDayBox, 
                                                                                lineSpacing: val,
                                                                                gridSpacing: val
                                                                            } 
                                                                        });
                                                                    }} 
                                                                    className="flex-1 accent-indigo-600" 
                                                                />
                                                                <input
                                                                    type="number"
                                                                    step="0.1"
                                                                    min="1.0"
                                                                    max="25.0"
                                                                    value={parseFloat(((selectedElement.style.plannerDayBox?.lineSpacing || selectedElement.style.plannerDayBox?.gridSpacing || 20) / EDITOR_SCALE).toFixed(1))}
                                                                    onChange={(e) => {
                                                                        const mmVal = parseFloat(e.target.value);
                                                                        if (mmVal > 0) {
                                                                            const pxVal = Math.round(mmVal * EDITOR_SCALE);
                                                                            updateElementStyle(selectedElement.id, {
                                                                                plannerDayBox: {
                                                                                    ...selectedElement.style.plannerDayBox,
                                                                                    lineSpacing: pxVal,
                                                                                    gridSpacing: pxVal
                                                                                }
                                                                            });
                                                                        }
                                                                    }}
                                                                    className="w-14 text-[10px] p-1 border rounded text-right font-mono"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-3 gap-2">
                                                            <label className="flex items-center gap-1.5 cursor-pointer">
                                                                <input 
                                                                    type="checkbox" 
                                                                    checked={selectedElement.style.plannerDayBox?.showDayNumber !== false} 
                                                                    onChange={(e) => updateElementStyle(selectedElement.id, { plannerDayBox: { ...selectedElement.style.plannerDayBox, showDayNumber: e.target.checked } })} 
                                                                    className="rounded text-indigo-600 focus:ring-indigo-500 h-3 w-3"
                                                                />
                                                                <span className="text-[10px] font-bold text-gray-500 uppercase">Nº</span>
                                                            </label>
                                                            <label className="flex items-center gap-1.5 cursor-pointer">
                                                                <input 
                                                                    type="checkbox" 
                                                                    checked={selectedElement.style.plannerDayBox?.showDayName !== false} 
                                                                    onChange={(e) => updateElementStyle(selectedElement.id, { plannerDayBox: { ...selectedElement.style.plannerDayBox, showDayName: e.target.checked } })} 
                                                                    className="rounded text-indigo-600 focus:ring-indigo-500 h-3 w-3"
                                                                />
                                                                <span className="text-[10px] font-bold text-gray-500 uppercase">Nome</span>
                                                            </label>
                                                            <label className="flex items-center gap-1.5 cursor-pointer">
                                                                <input 
                                                                    type="checkbox" 
                                                                    checked={selectedElement.style.plannerDayBox?.showMoonPhase === true} 
                                                                    onChange={(e) => updateElementStyle(selectedElement.id, { plannerDayBox: { ...selectedElement.style.plannerDayBox, showMoonPhase: e.target.checked } })} 
                                                                    className="rounded text-indigo-600 focus:ring-indigo-500 h-3 w-3"
                                                                />
                                                                <span className="text-[10px] font-bold text-gray-500 uppercase">Lua</span>
                                                            </label>
                                                        </div>

                                                        <div className="pt-3 border-t border-gray-100 space-y-3">
                                                            <div className="flex items-center justify-between">
                                                                <label className="text-[10px] font-bold text-gray-500 uppercase">Fundo do Cabeçalho</label>
                                                                <div className="flex h-6 border border-gray-200 rounded overflow-hidden">
                                                                    <input 
                                                                        type="color" 
                                                                        value={selectedElement.style.plannerDayBox?.headerBackgroundColor || '#f9fafb'} 
                                                                        onChange={(e) => updateElementStyle(selectedElement.id, { 
                                                                            plannerDayBox: { ...selectedElement.style.plannerDayBox, headerBackgroundColor: e.target.value } 
                                                                        })} 
                                                                        className="w-8 h-full p-0 border-0 cursor-pointer" 
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center justify-between">
                                                                <label className="text-[10px] font-bold text-gray-500 uppercase">Texto do Cabeçalho</label>
                                                                <div className="flex h-6 border border-gray-200 rounded overflow-hidden">
                                                                    <input 
                                                                        type="color" 
                                                                        value={selectedElement.style.plannerDayBox?.headerTextColor || '#374151'} 
                                                                        onChange={(e) => updateElementStyle(selectedElement.id, { 
                                                                            plannerDayBox: { ...selectedElement.style.plannerDayBox, headerTextColor: e.target.value } 
                                                                        })} 
                                                                        className="w-8 h-full p-0 border-0 cursor-pointer" 
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div className="pt-2 border-t border-gray-50 space-y-2">
                                                                <label className="flex items-center gap-2 cursor-pointer">
                                                                    <input 
                                                                        type="checkbox" 
                                                                        checked={selectedElement.style.plannerDayBox?.showHeaderBorder !== false} 
                                                                        onChange={(e) => updateElementStyle(selectedElement.id, { 
                                                                            plannerDayBox: { ...selectedElement.style.plannerDayBox, showHeaderBorder: e.target.checked } 
                                                                        })} 
                                                                        className="rounded text-indigo-600 focus:ring-indigo-500 h-3 w-3"
                                                                    />
                                                                    <span className="text-[10px] font-bold text-gray-500 uppercase">Borda do Cabeçalho</span>
                                                                </label>

                                                                {selectedElement.style.plannerDayBox?.showHeaderBorder !== false && (
                                                                    <div className="space-y-2 pl-5">
                                                                        <div className="flex items-center justify-between">
                                                                            <label className="text-[10px] font-bold text-gray-400 uppercase">Cor</label>
                                                                            <input 
                                                                                type="color" 
                                                                                value={selectedElement.style.plannerDayBox?.headerBorderColor || '#e5e7eb'} 
                                                                                onChange={(e) => updateElementStyle(selectedElement.id, { 
                                                                                    plannerDayBox: { ...selectedElement.style.plannerDayBox, headerBorderColor: e.target.value } 
                                                                                })} 
                                                                                className="w-6 h-5 p-0 border-0 cursor-pointer rounded"
                                                                            />
                                                                        </div>
                                                                        <div className="flex items-center justify-between">
                                                                            <label className="text-[10px] font-bold text-gray-400 uppercase">Espessura</label>
                                                                            <input 
                                                                                type="number" 
                                                                                min="0" 
                                                                                max="5" 
                                                                                step="0.5" 
                                                                                value={selectedElement.style.plannerDayBox?.headerBorderWidth ?? 1} 
                                                                                onChange={(e) => updateElementStyle(selectedElement.id, { 
                                                                                    plannerDayBox: { ...selectedElement.style.plannerDayBox, headerBorderWidth: parseFloat(e.target.value) || 0 } 
                                                                                })} 
                                                                                className="w-12 text-[10px] p-1 border rounded"
                                                                            />
                                                                        </div>
                                                                        <select 
                                                                            value={selectedElement.style.plannerDayBox?.headerBorderStyle || 'solid'} 
                                                                            onChange={(e) => updateElementStyle(selectedElement.id, { 
                                                                                plannerDayBox: { ...selectedElement.style.plannerDayBox, headerBorderStyle: e.target.value as any } 
                                                                            })} 
                                                                            className="w-full text-[10px] p-1 border border-gray-200 rounded"
                                                                        >
                                                                            <option value="solid">Sólida</option>
                                                                            <option value="dashed">Tracejada</option>
                                                                            <option value="dotted">Pontilhada</option>
                                                                        </select>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div className="flex items-center justify-between">
                                                                <label className="text-[10px] font-bold text-gray-500 uppercase">Cor do Traço</label>
                                                                <input 
                                                                    type="color" 
                                                                    value={selectedElement.style.plannerDayBox?.strokeColor || '#e5e7eb'} 
                                                                    onChange={(e) => updateElementStyle(selectedElement.id, { 
                                                                        plannerDayBox: { ...selectedElement.style.plannerDayBox, strokeColor: e.target.value } 
                                                                    })} 
                                                                    className="w-8 h-6 p-0 border-0 cursor-pointer rounded"
                                                                />
                                                            </div>
                                                            <div className="flex items-center justify-between">
                                                                <label className="text-[10px] font-bold text-gray-500 uppercase">Espessura ({selectedElement.style.plannerDayBox?.strokeWidth || 0.5})</label>
                                                                <input 
                                                                    type="range" 
                                                                    min="0.1" 
                                                                    max="3" 
                                                                    step="0.1" 
                                                                    value={selectedElement.style.plannerDayBox?.strokeWidth || 0.5} 
                                                                    onChange={(e) => updateElementStyle(selectedElement.id, { 
                                                                        plannerDayBox: { ...selectedElement.style.plannerDayBox, strokeWidth: parseFloat(e.target.value) } 
                                                                    })} 
                                                                    className="w-24" 
                                                                />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <label className="block text-[10px] font-bold text-gray-500 uppercase">Estilo do Traço</label>
                                                                <select 
                                                                    value={selectedElement.style.plannerDayBox?.strokeStyle || 'solid'} 
                                                                    onChange={(e) => updateElementStyle(selectedElement.id, { 
                                                                        plannerDayBox: { ...selectedElement.style.plannerDayBox, strokeStyle: e.target.value as any } 
                                                                    })} 
                                                                    className="w-full text-xs p-1.5 border border-gray-200 rounded"
                                                                >
                                                                    <option value="solid">Sólido</option>
                                                                    <option value="dashed">Tracejado</option>
                                                                    <option value="dotted">Pontilhado</option>
                                                                </select>
                                                            </div>
                                                        </div>

                                                        <div className="pt-3 border-t border-gray-100 space-y-3">
                                                            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Estilo do Quadro</h4>
                                                            <div className="flex items-center justify-between">
                                                                <label className="text-[10px] font-bold text-gray-500 uppercase">Cor de Fundo</label>
                                                                <div className="flex h-6 border border-gray-200 rounded overflow-hidden">
                                                                    <input 
                                                                        type="color" 
                                                                        value={selectedElement.style.backgroundColor || '#ffffff'} 
                                                                        onChange={(e) => updateElementStyle(selectedElement.id, { backgroundColor: e.target.value })} 
                                                                        className="w-8 h-full p-0 border-0 cursor-pointer" 
                                                                    />
                                                                </div>
                                                            </div>
                                                            {renderBorderControls(selectedElement.style, (updates) => updateElementStyle(selectedElement.id, updates))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {selectedElement.type === 'habit_tracker' && (
                                                <div className="pt-3 border-t border-gray-100">
                                                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Configuração de Hábitos</h4>
                                                    <div className="space-y-4">
                                                        <div className="space-y-2">
                                                            <label className="block text-[10px] font-bold text-gray-500 uppercase">Título</label>
                                                            <div className="flex gap-2">
                                                                <input 
                                                                    type="text" 
                                                                    value={selectedElement.style.habitLabel || 'Hábitos'} 
                                                                    onChange={(e) => updateElementStyle(selectedElement.id, { habitLabel: e.target.value })} 
                                                                    className="flex-1 text-xs p-1.5 border border-gray-200 rounded" 
                                                                />
                                                                <button 
                                                                    onClick={() => updateElementStyle(selectedElement.id, { habitShowLabel: !(selectedElement.style.habitShowLabel !== false) })}
                                                                    className={`p-1.5 rounded border ${selectedElement.style.habitShowLabel !== false ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-gray-200 text-gray-400'}`}
                                                                    title="Mostrar/Ocultar Título"
                                                                >
                                                                    <Eye className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {selectedElement.style.habitShowLabel !== false && (
                                                            <div className="space-y-2 pt-2 border-t border-gray-50">
                                                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-tight">Estilo do Título</label>
                                                                {renderTypographyControls(
                                                                    {
                                                                        fontFamily: selectedElement.style.fontFamily || 'Inter',
                                                                        fontSize: selectedElement.style.fontSize || 12,
                                                                        fontWeight: (selectedElement.style.fontWeight as any) || 'bold',
                                                                        color: selectedElement.style.color || '#374151',
                                                                        textAlign: (selectedElement.style.textAlign as any) || 'left',
                                                                        verticalAlign: (selectedElement.style.verticalAlign as any) || 'top',
                                                                        textTransform: (selectedElement.style.textTransform as any) || 'none',
                                                                        letterSpacing: selectedElement.style.letterSpacing || 0,
                                                                        backgroundColor: selectedElement.style.backgroundColor || 'transparent'
                                                                    },
                                                                    (updates) => updateElementStyle(selectedElement.id, updates)
                                                                )}
                                                            </div>
                                                        )}

                                                        <div className="space-y-2">
                                                            <label className="block text-[10px] font-bold text-gray-500 uppercase">Tipo de Marcador</label>
                                                            <div className="flex border border-gray-200 rounded overflow-hidden divide-x divide-gray-100">
                                                                <button 
                                                                    onClick={() => updateElementStyle(selectedElement.id, { habitMarkerType: 'dot' })} 
                                                                    className={`flex-1 p-2 hover:bg-gray-50 flex items-center justify-center ${selectedElement.style.habitMarkerType === 'dot' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500'}`}
                                                                    title="Pontinho"
                                                                >
                                                                    <Circle className="w-4 h-4 fill-current" />
                                                                </button>
                                                                <button 
                                                                    onClick={() => updateElementStyle(selectedElement.id, { habitMarkerType: 'square' })} 
                                                                    className={`flex-1 p-2 hover:bg-gray-50 flex items-center justify-center ${selectedElement.style.habitMarkerType === 'square' || !selectedElement.style.habitMarkerType ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500'}`}
                                                                    title="Quadradinho"
                                                                >
                                                                    <Square className="w-4 h-4" />
                                                                </button>
                                                                <button 
                                                                    onClick={() => updateElementStyle(selectedElement.id, { habitMarkerType: 'check' })} 
                                                                    className={`flex-1 p-2 hover:bg-gray-50 flex items-center justify-center ${selectedElement.style.habitMarkerType === 'check' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500'}`}
                                                                    title="Check"
                                                                >
                                                                    <CheckCircle2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div>
                                                                <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Tamanho Marcador</label>
                                                                <input 
                                                                    type="number" 
                                                                    min="8" 
                                                                    max="40" 
                                                                    value={selectedElement.style.habitMarkerSize || 16} 
                                                                    onChange={(e) => updateElementStyle(selectedElement.id, { habitMarkerSize: parseInt(e.target.value) })} 
                                                                    className="w-full text-xs p-1.5 border border-gray-200 rounded" 
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Espessura Marcador</label>
                                                                <input 
                                                                    type="number" 
                                                                    min="0.5" 
                                                                    max="5" 
                                                                    step="0.5"
                                                                    value={selectedElement.style.habitMarkerStroke || 1.5} 
                                                                    onChange={(e) => updateElementStyle(selectedElement.id, { habitMarkerStroke: parseFloat(e.target.value) })} 
                                                                    className="w-full text-xs p-1.5 border border-gray-200 rounded" 
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div>
                                                                <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Espaçamento</label>
                                                                <input 
                                                                    type="number" 
                                                                    min="0" 
                                                                    max="20" 
                                                                    value={selectedElement.style.habitSpacing || 4} 
                                                                    onChange={(e) => updateElementStyle(selectedElement.id, { habitSpacing: parseInt(e.target.value) })} 
                                                                    className="w-full text-xs p-1.5 border border-gray-200 rounded" 
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Espessura Linha</label>
                                                                <input 
                                                                    type="number" 
                                                                    min="0.5" 
                                                                    max="10" 
                                                                    step="0.5"
                                                                    value={selectedElement.style.habitLineWidth || 1} 
                                                                    onChange={(e) => updateElementStyle(selectedElement.id, { habitLineWidth: parseFloat(e.target.value) })} 
                                                                    className="w-full text-xs p-1.5 border border-gray-200 rounded" 
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div>
                                                                <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Cor Marcador</label>
                                                                <div className="flex h-8 border border-gray-200 rounded overflow-hidden">
                                                                    <input 
                                                                        type="color" 
                                                                        value={selectedElement.style.habitColor || selectedElement.style.color || '#d1d5db'} 
                                                                        onChange={(e) => updateElementStyle(selectedElement.id, { habitColor: e.target.value })} 
                                                                        className="w-full h-full p-0 border-0 cursor-pointer" 
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Preenchimento</label>
                                                                <div className="flex h-8 border border-gray-200 rounded overflow-hidden">
                                                                    <input 
                                                                        type="color" 
                                                                        value={(selectedElement.style.habitFillColor && selectedElement.style.habitFillColor !== 'transparent') ? selectedElement.style.habitFillColor : '#ffffff'} 
                                                                        onChange={(e) => updateElementStyle(selectedElement.id, { habitFillColor: e.target.value })} 
                                                                        className="w-full h-full p-0 border-0 cursor-pointer" 
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-2">
                                                            <label className="block text-[10px] font-bold text-gray-500 uppercase">Cor da Linha de Guia</label>
                                                            <div className="flex h-8 border border-gray-200 rounded overflow-hidden">
                                                                <input 
                                                                    type="color" 
                                                                    value={selectedElement.style.borderColor || '#f3f4f6'} 
                                                                    onChange={(e) => updateElementStyle(selectedElement.id, { borderColor: e.target.value })} 
                                                                    className="w-full h-full p-0 border-0 cursor-pointer" 
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {(selectedElement.type === 'full_calendar' || selectedElement.type === 'mini_calendar') && selectedElement.style.fullCalendar && (
                                                <div className="pt-3 border-t border-gray-100">
                                                    <div className="space-y-3 mb-3">
                                                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Configuração do Grid</h4>
                                                        
                                                        <div className="pb-3 border-b border-gray-100">
                                                            <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Sábado e Domingo agrupados</label>
                                                            <div className="flex gap-1 bg-gray-50 p-1 rounded border border-gray-200">
                                                                {[
                                                                    { id: 'none', label: 'Separados' },
                                                                    { id: 'horizontal', label: 'Comp. Linha' },
                                                                    { id: 'vertical', label: 'Comp. Coluna' }
                                                                ].map((opt) => {
                                                                    const isSelected = (selectedElement.style.fullCalendar?.splitWeekend || 'none') === opt.id;
                                                                    return (
                                                                        <button
                                                                            key={opt.id}
                                                                            type="button"
                                                                            onClick={() => updateElementStyle(selectedElement.id, { 
                                                                                fullCalendar: { 
                                                                                    ...selectedElement.style.fullCalendar, 
                                                                                    splitWeekend: opt.id as any 
                                                                                } 
                                                                            })}
                                                                            className={`flex-1 py-1 text-[9px] font-medium rounded transition-all ${isSelected ? 'bg-indigo-600 text-white font-bold shadow-sm' : 'bg-white hover:bg-gray-100 border border-gray-150 text-gray-650'}`}
                                                                        >
                                                                            {opt.label}
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                            <p className="text-[8px] text-gray-400 mt-1">Sábado e Domingo dividem o mesmo espaço na grade.</p>
                                                        </div>
                                                        
                                                        {selectedElement.type === 'mini_calendar' && (
                                                            <div className="space-y-3">
                                                                <button 
                                                                    onClick={() => {
                                                                        const fullCalStyle = getGlobalCalendarStyle();
                                                                        if (fullCalStyle) {
                                                                            updateElementStyle(selectedElement.id, { fullCalendar: JSON.parse(JSON.stringify(fullCalStyle)) });
                                                                            alert('Estilo copiado do Calendário Anual!');
                                                                        } else {
                                                                            alert('Calendário Anual não encontrado para copiar o estilo.');
                                                                        }
                                                                    }}
                                                                    className="w-full py-2 px-3 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded text-[10px] font-bold uppercase hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2 mb-1"
                                                                >
                                                                    <Layers className="w-3 h-3" /> Copiar Estilo do Calendário Anual
                                                                </button>
                                                                
                                                                <label className="flex items-center gap-2 cursor-pointer pb-2 border-b border-gray-100">
                                                                    <input 
                                                                        type="checkbox" 
                                                                        checked={selectedElement.style.useGlobalStyle || false}
                                                                        onChange={(e) => updateElementStyle(selectedElement.id, { useGlobalStyle: e.target.checked })} 
                                                                        className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4" 
                                                                    />
                                                                    <span className="text-[10px] font-bold text-gray-500 uppercase">Sincronizar com Global</span>
                                                                </label>

                                                                <div className="space-y-2 pb-2 border-b border-gray-100">
                                                                    <div className="flex items-center justify-between">
                                                                        <label className="text-[10px] font-bold text-gray-500 uppercase">Destacar Dia Atual</label>
                                                                        <input 
                                                                            type="checkbox" 
                                                                            checked={selectedElement.style.highlightCurrentDay !== false} 
                                                                            onChange={(e) => updateElementStyle(selectedElement.id, { highlightCurrentDay: e.target.checked })} 
                                                                            className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4" 
                                                                        />
                                                                    </div>
                                                                    
                                                                    {selectedElement.style.highlightCurrentDay !== false && (
                                                                        <div className="grid grid-cols-2 gap-2">
                                                                            <div>
                                                                                <label className="block text-[8px] font-bold text-gray-400 uppercase mb-1">Fundo Destaque</label>
                                                                                <div className="flex h-7 border border-gray-200 rounded overflow-hidden bg-white">
                                                                                    <input 
                                                                                        type="color" 
                                                                                        value={selectedElement.style.currentDayHighlightColor || '#4f46e5'} 
                                                                                        onChange={(e) => updateElementStyle(selectedElement.id, { currentDayHighlightColor: e.target.value })} 
                                                                                        className="w-full h-full p-0 border-0 cursor-pointer" 
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                            <div>
                                                                                <label className="block text-[8px] font-bold text-gray-400 uppercase mb-1">Texto Destaque</label>
                                                                                <div className="flex h-7 border border-gray-200 rounded overflow-hidden bg-white">
                                                                                    <input 
                                                                                        type="color" 
                                                                                        value={selectedElement.style.currentDayHighlightTextColor || '#ffffff'} 
                                                                                        onChange={(e) => updateElementStyle(selectedElement.id, { currentDayHighlightTextColor: e.target.value })} 
                                                                                        className="w-full h-full p-0 border-0 cursor-pointer" 
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                <div className="space-y-2 pb-2 border-b border-gray-100">
                                                                    <div className="space-y-1">
                                                                        <label className="block text-[10px] font-bold text-gray-500 uppercase">Divisão de Páginas (Spread)</label>
                                                                        <select 
                                                                            value={selectedElement.style.fullCalendar?.splitMode || 'all'} 
                                                                            onChange={(e) => updateElementStyle(selectedElement.id, { 
                                                                                fullCalendar: { 
                                                                                    ...selectedElement.style.fullCalendar, 
                                                                                    splitMode: e.target.value as any 
                                                                                } 
                                                                            })} 
                                                                            className="w-full text-xs p-1.5 border border-gray-200 rounded"
                                                                        >
                                                                            <option value="all">Calendário Inteiro (7 Colunas)</option>
                                                                            <option value="left">Página Esquerda (Seg • Ter • Qua)</option>
                                                                            <option value="right">Página Direita (Qui • Sex • Sáb • Dom)</option>
                                                                        </select>
                                                                    </div>

                                                                    <div className="flex items-center justify-between">
                                                                        <label className="text-[10px] font-bold text-gray-500 uppercase">Semana Começa na Segunda</label>
                                                                        <input 
                                                                            type="checkbox" 
                                                                            checked={selectedElement.style.fullCalendar?.startOfWeekOnMonday ?? (selectedElement.style.fullCalendar?.splitMode === 'left' || selectedElement.style.fullCalendar?.splitMode === 'right' || false)} 
                                                                            onChange={(e) => updateElementStyle(selectedElement.id, { 
                                                                                fullCalendar: { 
                                                                                    ...selectedElement.style.fullCalendar, 
                                                                                    startOfWeekOnMonday: e.target.checked 
                                                                                } 
                                                                            })} 
                                                                            className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4" 
                                                                        />
                                                                    </div>
                                                                </div>

                                                                <div>
                                                                    <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Mês Exibido</label>
                                                                    <div className="flex rounded border border-gray-200 overflow-hidden">
                                                                        <button onClick={() => updateElementStyle(selectedElement.id, { calendarOffset: -1 })} className={`flex-1 py-1 text-[10px] ${selectedElement.style.calendarOffset === -1 ? 'bg-indigo-50 text-indigo-700 font-bold' : 'hover:bg-gray-50'}`}>Anterior</button>
                                                                        <div className="w-px bg-gray-200"></div>
                                                                        <button onClick={() => updateElementStyle(selectedElement.id, { calendarOffset: 0 })} className={`flex-1 py-1 text-[10px] ${selectedElement.style.calendarOffset === 0 ? 'bg-indigo-50 text-indigo-700 font-bold' : 'hover:bg-gray-50'}`}>Atual</button>
                                                                        <div className="w-px bg-gray-200"></div>
                                                                        <button onClick={() => updateElementStyle(selectedElement.id, { calendarOffset: 1 })} className={`flex-1 py-1 text-[10px] ${selectedElement.style.calendarOffset === 1 ? 'bg-indigo-50 text-indigo-700 font-bold' : 'hover:bg-gray-50'}`}>Próximo</button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {selectedElement.type === 'full_calendar' && (
                                                            <div className="space-y-4">
                                                                <div>
                                                                    <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-wider">Layout / Meses por Linha</label>
                                                                    <div className="grid grid-cols-2 gap-1.5 mb-2">
                                                                        {[
                                                                            { cols: 3, label: '3 Meses / Linha', desc: '3x4 (Retrato / Padrão)' },
                                                                            { cols: 4, label: '4 Meses / Linha', desc: '4x3 (Paisagem)' },
                                                                            { cols: 2, label: '2 Meses / Linha', desc: '2x6 (Estreito / Colunas)' },
                                                                            { cols: 6, label: '6 Meses / Linha', desc: '6x2 (Compacto / Largo)' }
                                                                        ].map((preset) => {
                                                                            const isSelected = (selectedElement.style.monthsPerRow || 3) === preset.cols;
                                                                            return (
                                                                                <button
                                                                                    key={preset.cols}
                                                                                    type="button"
                                                                                    onClick={() => updateElementStyle(selectedElement.id, { monthsPerRow: preset.cols })}
                                                                                    className={`p-2 rounded-xl border text-left transition-all ${
                                                                                        isSelected 
                                                                                            ? 'bg-indigo-50 border-indigo-500 text-indigo-950 ring-1 ring-indigo-500' 
                                                                                            : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'
                                                                                    }`}
                                                                                >
                                                                                    <div className="text-[10px] font-bold leading-tight">{preset.label}</div>
                                                                                    <div className="text-[8px] text-gray-400 mt-0.5 leading-none">{preset.desc}</div>
                                                                                </button>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                    
                                                                    <div className="bg-gray-50/60 p-2 rounded-xl border border-gray-100 space-y-1.5">
                                                                        <div className="flex items-center justify-between">
                                                                            <span className="text-[9px] font-bold text-gray-400 uppercase">Ajuste Fino</span>
                                                                            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{selectedElement.style.monthsPerRow || 3} meses por linha</span>
                                                                        </div>
                                                                        <input 
                                                                            type="range" 
                                                                            min="1" 
                                                                            max="12" 
                                                                            value={selectedElement.style.monthsPerRow || 3} 
                                                                            onChange={(e) => updateElementStyle(selectedElement.id, { monthsPerRow: parseInt(e.target.value) })} 
                                                                            className="w-full accent-indigo-600 cursor-pointer" 
                                                                        />
                                                                    </div>
                                                                </div>

                                                                <div className="space-y-3">
                                                                    <div>
                                                                        <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Ano do Calendário</label>
                                                                        <div className="flex rounded-lg border border-gray-200 overflow-hidden bg-white">
                                                                            <button onClick={() => updateElementStyle(selectedElement.id, { yearOffset: 0 })} className={`flex-1 py-1.5 text-[10px] transition-colors ${selectedElement.style.yearOffset === 0 || !selectedElement.style.yearOffset ? 'bg-indigo-50 text-indigo-700 font-bold' : 'hover:bg-gray-50'}`}>Atual</button>
                                                                            <div className="w-px bg-gray-200"></div>
                                                                            <button onClick={() => updateElementStyle(selectedElement.id, { yearOffset: 1 })} className={`flex-1 py-1.5 text-[10px] transition-colors ${selectedElement.style.yearOffset === 1 ? 'bg-indigo-50 text-indigo-700 font-bold' : 'hover:bg-gray-50'}`}>Próximo</button>
                                                                            <div className="w-px bg-gray-200"></div>
                                                                            <button onClick={() => updateElementStyle(selectedElement.id, { yearOffset: 2 })} className={`flex-1 py-1.5 text-[10px] transition-colors ${selectedElement.style.yearOffset === 2 ? 'bg-indigo-50 text-indigo-700 font-bold' : 'hover:bg-gray-50'}`}>+2 Anos</button>
                                                                        </div>
                                                                    </div>

                                                                    <div>
                                                                        <div className="flex items-center justify-between mb-1">
                                                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Espaçamento entre Meses</label>
                                                                            <span className="text-[10px] font-mono text-gray-400">{selectedElement.style.gap || 10}px</span>
                                                                        </div>
                                                                        <input 
                                                                            type="range" 
                                                                            min="0" 
                                                                            max="50" 
                                                                            value={selectedElement.style.gap || 10} 
                                                                            onChange={(e) => updateElementStyle(selectedElement.id, { gap: parseInt(e.target.value) })} 
                                                                            className="w-full accent-indigo-600 cursor-pointer" 
                                                                        />
                                                                    </div>

                                                                    <label className="flex items-center gap-2 cursor-pointer pt-1">
                                                                        <input 
                                                                            type="checkbox" 
                                                                            checked={selectedElement.style.fullCalendar?.showYearInTitle ?? true} 
                                                                            onChange={(e) => updateElementStyle(selectedElement.id, { fullCalendar: { ...selectedElement.style.fullCalendar, showYearInTitle: e.target.checked } })} 
                                                                            className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4" 
                                                                        />
                                                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Mostrar Ano no Título</span>
                                                                    </label>

                                                                    <div className="pt-2 border-t border-gray-100 space-y-2">
                                                                        <div className="flex items-center justify-between">
                                                                            <label className="text-[10px] font-bold text-gray-500 uppercase">Destacar Dia Atual</label>
                                                                            <input 
                                                                                type="checkbox" 
                                                                                checked={selectedElement.style.highlightCurrentDay !== false} 
                                                                                onChange={(e) => updateElementStyle(selectedElement.id, { highlightCurrentDay: e.target.checked })} 
                                                                                className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4" 
                                                                            />
                                                                        </div>
                                                                        
                                                                        {selectedElement.style.highlightCurrentDay !== false && (
                                                                            <div className="grid grid-cols-2 gap-2">
                                                                                <div>
                                                                                    <label className="block text-[8px] font-bold text-gray-400 uppercase mb-1">Fundo Destaque</label>
                                                                                    <div className="flex h-7 border border-gray-200 rounded overflow-hidden bg-white">
                                                                                        <input 
                                                                                            type="color" 
                                                                                            value={selectedElement.style.currentDayHighlightColor || '#4f46e5'} 
                                                                                            onChange={(e) => updateElementStyle(selectedElement.id, { currentDayHighlightColor: e.target.value })} 
                                                                                            className="w-full h-full p-0 border-0 cursor-pointer" 
                                                                                        />
                                                                                    </div>
                                                                                </div>
                                                                                <div>
                                                                                    <label className="block text-[8px] font-bold text-gray-400 uppercase mb-1">Texto Destaque</label>
                                                                                    <div className="flex h-7 border border-gray-200 rounded overflow-hidden bg-white">
                                                                                        <input 
                                                                                            type="color" 
                                                                                            value={selectedElement.style.currentDayHighlightTextColor || '#ffffff'} 
                                                                                            onChange={(e) => updateElementStyle(selectedElement.id, { currentDayHighlightTextColor: e.target.value })} 
                                                                                            className="w-full h-full p-0 border-0 cursor-pointer" 
                                                                                        />
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {selectedElement.type === 'mini_calendar' && (
                                                            <div>
                                                                <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Mês Exibido</label>
                                                                <div className="flex rounded border border-gray-200 overflow-hidden bg-white">
                                                                    <button onClick={() => updateElementStyle(selectedElement.id, { calendarOffset: -1 })} className={`flex-1 py-1 text-[10px] ${selectedElement.style.calendarOffset === -1 ? 'bg-indigo-50 text-indigo-700 font-bold' : 'hover:bg-gray-50'}`}>Anterior</button>
                                                                    <div className="w-px bg-gray-200"></div>
                                                                    <button onClick={() => updateElementStyle(selectedElement.id, { calendarOffset: 0 })} className={`flex-1 py-1 text-[10px] ${selectedElement.style.calendarOffset === 0 ? 'bg-indigo-50 text-indigo-700 font-bold' : 'hover:bg-gray-50'}`}>Atual</button>
                                                                    <div className="w-px bg-gray-200"></div>
                                                                    <button onClick={() => updateElementStyle(selectedElement.id, { calendarOffset: 1 })} className={`flex-1 py-1 text-[10px] ${selectedElement.style.calendarOffset === 1 ? 'bg-indigo-50 text-indigo-700 font-bold' : 'hover:bg-gray-50'}`}>Próximo</button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                         <div className="space-y-2 pt-2 border-t border-gray-100 pb-3 mb-2">
                                                             <div className="flex flex-col">
                                                                 <label className="block text-[10px] font-bold text-gray-500 uppercase">Posição das Datas (Grid mensal)</label>
                                                                 <span className="text-[9px] text-gray-400">Posicione nos cantos para sobrar espaço para anotações</span>
                                                             </div>
                                                             <div className="grid grid-cols-3 gap-1 w-full max-w-[140px] p-1 bg-gray-50 rounded border border-gray-200">
                                                                 {[
                                                                     { v: 'top', h: 'left', label: '↖', title: 'Superior Esquerdo' },
                                                                     { v: 'top', h: 'center', label: '↑', title: 'Superior Centro' },
                                                                     { v: 'top', h: 'right', label: '↗', title: 'Superior Direito' },
                                                                     { v: 'middle', h: 'left', label: '←', title: 'Centro Esquerdo' },
                                                                     { v: 'middle', h: 'center', label: '•', title: 'Centralizado' },
                                                                     { v: 'middle', h: 'right', label: '→', title: 'Centro Direito' },
                                                                     { v: 'bottom', h: 'left', label: '↙', title: 'Inferior Esquerdo' },
                                                                     { v: 'bottom', h: 'center', label: '↓', title: 'Inferior Centro' },
                                                                     { v: 'bottom', h: 'right', label: '↘', title: 'Inferior Direito' }
                                                                 ].map((pos) => {
                                                                     const daysStyle = selectedElement.style.fullCalendar?.days || {};
                                                                     const isSelected = (daysStyle.verticalAlign || 'middle') === pos.v && (daysStyle.textAlign || 'center') === pos.h;
                                                                     return (
                                                                         <button
                                                                             key={`${pos.v}-${pos.h}`}
                                                                             type="button"
                                                                             onClick={() => updateFullCalendarStyle(selectedElement.id, 'days', { verticalAlign: pos.v as any, textAlign: pos.h as any })}
                                                                             className={`flex items-center justify-center h-7 text-xs font-bold rounded transition-all ${isSelected ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white hover:bg-gray-100 border border-gray-200 text-gray-650'}`}
                                                                             title={pos.title}
                                                                         >
                                                                            {pos.label}
                                                                         </button>
                                                                     );
                                                                 })}
                                                             </div>
                                                         </div>
                                                    <div className="flex bg-gray-100 p-1 rounded mb-3 overflow-x-auto">
                                                        <button onClick={() => setFontControlTab('title')} className={`flex-1 min-w-[50px] py-1 text-[10px] font-bold uppercase rounded whitespace-nowrap ${fontControlTab === 'title' ? 'bg-white shadow text-indigo-600' : 'text-gray-500'}`}>Título</button>
                                                        <button onClick={() => setFontControlTab('weekDays')} className={`flex-1 min-w-[50px] py-1 text-[10px] font-bold uppercase rounded whitespace-nowrap ${fontControlTab === 'weekDays' ? 'bg-white shadow text-indigo-600' : 'text-gray-500'}`}>Semana</button>
                                                        <button onClick={() => setFontControlTab('days')} className={`flex-1 min-w-[50px] py-1 text-[10px] font-bold uppercase rounded whitespace-nowrap ${fontControlTab === 'days' ? 'bg-white shadow text-indigo-600' : 'text-gray-500'}`}>Dias</button>
                                                        <button onClick={() => setFontControlTab('highlight')} className={`flex-1 min-w-[50px] py-1 text-[10px] font-bold uppercase rounded whitespace-nowrap ${fontControlTab === 'highlight' ? 'bg-white shadow text-indigo-600' : 'text-gray-500'}`}>Destaques</button>
                                                    </div>
                                                                <div className="bg-white rounded border border-gray-100 p-2 shadow-sm">
                                                                    {fontControlTab === 'highlight' ? (
                                                                        <div className="space-y-3">
                                                                            <div className="flex items-center justify-between">
                                                                                <label className="text-[10px] font-bold text-gray-500 uppercase">Destacar Domingos</label>
                                                                                <input 
                                                                                    type="checkbox" 
                                                                                    checked={selectedElement.style.fullCalendar?.specialDays?.highlightSundays ?? (selectedElement.style.useGlobalStyle ? getGlobalCalendarStyle()?.specialDays?.highlightSundays : null) ?? true} 
                                                                                    onChange={(e) => updateElementStyle(selectedElement.id, { fullCalendar: { ...selectedElement.style.fullCalendar, specialDays: { ...selectedElement.style.fullCalendar?.specialDays, highlightSundays: e.target.checked } } })} 
                                                                                    className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4" 
                                                                                />
                                                                            </div>
                                                                            <div className="flex items-center justify-between">
                                                                                <label className="text-[10px] font-bold text-gray-500 uppercase">Destacar Feriados</label>
                                                                                <input 
                                                                                    type="checkbox" 
                                                                                    checked={selectedElement.style.fullCalendar?.specialDays?.highlightHolidays ?? (selectedElement.style.useGlobalStyle ? getGlobalCalendarStyle()?.specialDays?.highlightHolidays : null) ?? false} 
                                                                                    onChange={(e) => updateElementStyle(selectedElement.id, { fullCalendar: { ...selectedElement.style.fullCalendar, specialDays: { ...selectedElement.style.fullCalendar?.specialDays, highlightHolidays: e.target.checked } } })} 
                                                                                    className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4" 
                                                                                />
                                                                            </div>
                                                                            <div className="h-px bg-gray-100 my-2"></div>
                                                                            {renderTypographyControls(
                                                                                selectedElement.style.fullCalendar?.specialDays?.style || (selectedElement.style.useGlobalStyle ? getGlobalCalendarStyle()?.specialDays?.style : null) || defaultCalendarStyle.specialDays.style,
                                                                                (updates) => updateFullCalendarStyle(selectedElement.id, 'highlight', updates)
                                                                            )}
                                                                        </div>
                                                                    ) : (
                                                                        renderTypographyControls(
                                                                            selectedElement.style.fullCalendar?.[fontControlTab] || (selectedElement.style.useGlobalStyle ? getGlobalCalendarStyle()?.[fontControlTab] : null) || (defaultCalendarStyle as any)[fontControlTab],
                                                                            (updates) => updateFullCalendarStyle(selectedElement.id, fontControlTab, updates)
                                                                        )
                                                                    )}
                                                                </div>

                                                    <div className="mt-4 space-y-3 pt-3 border-t border-gray-100">
                                                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Estilo do Quadro (Caixa)</h4>
                                                        <div className="flex items-center justify-between">
                                                            <label className="text-[10px] font-bold text-gray-500 uppercase">Fundo do Quadro</label>
                                                            <div className="flex h-6 border border-gray-200 rounded overflow-hidden">
                                                                <input 
                                                                    type="color" 
                                                                    value={selectedElement.style.backgroundColor || '#ffffff'} 
                                                                    onChange={(e) => updateElementStyle(selectedElement.id, { backgroundColor: e.target.value })} 
                                                                    className="w-8 h-full p-0 border-0 cursor-pointer" 
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <label className="text-[10px] font-bold text-gray-500 uppercase">Transparência</label>
                                                            <input 
                                                                type="range" 
                                                                min="0" 
                                                                max="1" 
                                                                step="0.1" 
                                                                value={selectedElement.style.opacity ?? 1} 
                                                                onChange={(e) => updateElementStyle(selectedElement.id, { opacity: parseFloat(e.target.value) })} 
                                                                className="w-24" 
                                                            />
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <label className="text-[10px] font-bold text-gray-500 uppercase">Margem Interna (px)</label>
                                                            <input 
                                                                type="number" 
                                                                min="0" 
                                                                max="50" 
                                                                value={selectedElement.style.padding ?? 4} 
                                                                onChange={(e) => updateElementStyle(selectedElement.id, { padding: parseInt(e.target.value) || 0 })} 
                                                                className="w-16 text-xs p-1 border rounded" 
                                                            />
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <label className="text-[10px] font-bold text-gray-500 uppercase">Sombra</label>
                                                            <select 
                                                                value={selectedElement.style.boxShadow || 'none'} 
                                                                onChange={(e) => updateElementStyle(selectedElement.id, { boxShadow: e.target.value })} 
                                                                className="text-[10px] p-1 border rounded bg-white w-24"
                                                            >
                                                                <option value="none">Nenhuma</option>
                                                                <option value="0 1px 2px 0 rgba(0, 0, 0, 0.05)">Mínima</option>
                                                                <option value="0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)">Pequena</option>
                                                                <option value="0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)">Média</option>
                                                                <option value="0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)">Grande</option>
                                                                <option value="0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)">Extra Grande</option>
                                                            </select>
                                                        </div>
                                                        {renderBorderControls(selectedElement.style, (updates) => updateElementStyle(selectedElement.id, updates))}
                                                    </div>

                                                    {(() => {
                                                        const globalStyle = getGlobalCalendarStyle();
                                                        const effectiveGridStyle = (selectedElement.style.useGlobalStyle && globalStyle)
                                                            ? { 
                                                                ...globalStyle.grid, 
                                                                ...selectedElement.style.fullCalendar?.grid, 
                                                                borders: { 
                                                                    ...(globalStyle.grid?.borders || { top: false, bottom: false, left: false, right: false, insideHorizontal: false, insideVertical: false, headerSeparator: true }), 
                                                                    ...selectedElement.style.fullCalendar?.grid?.borders 
                                                                } 
                                                            }
                                                            : (selectedElement.style.fullCalendar?.grid || { 
                                                                borderColor: '#dddddd', 
                                                                borderWidth: 0.5, 
                                                                borderStyle: 'solid', 
                                                                cellBackgroundColor: 'transparent', 
                                                                headerBackgroundColor: 'transparent',
                                                                borders: { top: false, bottom: false, left: false, right: false, insideHorizontal: false, insideVertical: false, headerSeparator: true }
                                                            });

                                                        return (
                                                            <div className="mt-4 space-y-3 pt-3 border-t border-gray-100">
                                                                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Estilo do Grid</h4>
                                                                <div className="grid grid-cols-2 gap-2">
                                                                    <div>
                                                                        <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Cor da Grade</label>
                                                                        <input 
                                                                            type="color" 
                                                                            value={effectiveGridStyle?.borderColor || '#dddddd'} 
                                                                            onChange={(e) => updateElementStyle(selectedElement.id, { fullCalendar: { ...selectedElement.style.fullCalendar, grid: { ...selectedElement.style.fullCalendar?.grid, borderColor: e.target.value } } })} 
                                                                            className="w-full h-8 p-1 border border-gray-200 rounded cursor-pointer" 
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <div className="flex justify-between items-center mb-1">
                                                                            <label className="block text-[10px] font-bold text-gray-500 uppercase">Espessura Borda</label>
                                                                            <span className="text-[10px] font-mono text-gray-400">{(effectiveGridStyle?.borderWidth ?? 0.5)}px</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-2">
                                                                            <input 
                                                                                type="range" 
                                                                                min="0"
                                                                                max="6"
                                                                                step="0.1"
                                                                                value={effectiveGridStyle?.borderWidth ?? 0.5} 
                                                                                onChange={(e) => {
                                                                                    const val = parseFloat(e.target.value);
                                                                                    updateElementStyle(selectedElement.id, { fullCalendar: { ...selectedElement.style.fullCalendar, grid: { ...selectedElement.style.fullCalendar?.grid, borderWidth: val } } });
                                                                                }} 
                                                                                className="flex-1 accent-indigo-650 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer" 
                                                                            />
                                                                            <input 
                                                                                type="number" 
                                                                                step="0.1"
                                                                                min="0"
                                                                                max="10"
                                                                                value={effectiveGridStyle?.borderWidth ?? 0.5} 
                                                                                onChange={(e) => {
                                                                                    const val = Math.max(0, parseFloat(e.target.value) || 0);
                                                                                    updateElementStyle(selectedElement.id, { fullCalendar: { ...selectedElement.style.fullCalendar, grid: { ...selectedElement.style.fullCalendar?.grid, borderWidth: val } } });
                                                                                }} 
                                                                                className="w-12 text-center text-xs p-1 border border-gray-200 rounded" 
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="space-y-1 mt-2">
                                                                    <div className="flex justify-between items-center">
                                                                        <label className="block text-[10px] font-bold text-gray-500 uppercase">Espessura das Divisórias (Divisões Internas)</label>
                                                                        <span className="text-[10px] font-mono text-gray-400">{(effectiveGridStyle?.dividerWidth ?? effectiveGridStyle?.borderWidth ?? 0.5)}px</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <input 
                                                                            type="range" 
                                                                            min="0"
                                                                            max="6"
                                                                            step="0.1"
                                                                            value={effectiveGridStyle?.dividerWidth ?? effectiveGridStyle?.borderWidth ?? 0.5} 
                                                                            onChange={(e) => {
                                                                                const val = parseFloat(e.target.value);
                                                                                updateElementStyle(selectedElement.id, { fullCalendar: { ...selectedElement.style.fullCalendar, grid: { ...selectedElement.style.fullCalendar?.grid, dividerWidth: val } } });
                                                                            }} 
                                                                            className="flex-1 accent-indigo-650 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer" 
                                                                        />
                                                                        <input 
                                                                            type="number" 
                                                                            step="0.1"
                                                                            min="0"
                                                                            max="10"
                                                                            value={effectiveGridStyle?.dividerWidth ?? effectiveGridStyle?.borderWidth ?? 0.5} 
                                                                            onChange={(e) => {
                                                                                const val = Math.max(0, parseFloat(e.target.value) || 0);
                                                                                updateElementStyle(selectedElement.id, { fullCalendar: { ...selectedElement.style.fullCalendar, grid: { ...selectedElement.style.fullCalendar?.grid, dividerWidth: val } } });
                                                                            }} 
                                                                            className="w-12 text-center text-xs p-1 border border-gray-200 rounded" 
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Estilo da Linha</label>
                                                                    <select 
                                                                        value={effectiveGridStyle?.borderStyle || 'solid'} 
                                                                        onChange={(e) => updateElementStyle(selectedElement.id, { fullCalendar: { ...selectedElement.style.fullCalendar, grid: { ...selectedElement.style.fullCalendar?.grid, borderStyle: e.target.value as any } } })} 
                                                                        className="w-full text-xs p-2 border border-gray-200 rounded bg-white"
                                                                    >
                                                                        <option value="solid">Sólida</option>
                                                                        <option value="dashed">Tracejada</option>
                                                                        <option value="dotted">Pontilhada</option>
                                                                    </select>
                                                                </div>
                                                                <div className="grid grid-cols-2 gap-2">
                                                                    <div>
                                                                        <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Fundo Célula</label>
                                                                        <input 
                                                                            type="color" 
                                                                            value={effectiveGridStyle?.cellBackgroundColor || '#ffffff'} 
                                                                            onChange={(e) => updateElementStyle(selectedElement.id, { fullCalendar: { ...selectedElement.style.fullCalendar, grid: { ...selectedElement.style.fullCalendar?.grid, cellBackgroundColor: e.target.value } } })} 
                                                                            className="w-full h-8 p-1 border border-gray-200 rounded cursor-pointer" 
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Fundo Cabeçalho</label>
                                                                        <input 
                                                                            type="color" 
                                                                            value={effectiveGridStyle?.headerBackgroundColor || '#f9fafb'} 
                                                                            onChange={(e) => updateElementStyle(selectedElement.id, { fullCalendar: { ...selectedElement.style.fullCalendar, grid: { ...selectedElement.style.fullCalendar?.grid, headerBackgroundColor: e.target.value } } })} 
                                                                            className="w-full h-8 p-1 border border-gray-200 rounded cursor-pointer" 
                                                                        />
                                                                    </div>
                                                                </div>
                                                                
                                                                <div className="space-y-2">
                                                                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Bordas Visíveis</label>
                                                                    <div className="grid grid-cols-4 gap-1">
                                                                        {renderBorderToggle(effectiveGridStyle?.borders?.top ?? false, () => {
                                                                            const grid = selectedElement.style.fullCalendar?.grid;
                                                                            updateElementStyle(selectedElement.id, { fullCalendar: { ...selectedElement.style.fullCalendar, grid: { ...grid, borders: { ...grid?.borders, top: !(effectiveGridStyle?.borders?.top ?? false) } } } });
                                                                        }, <PanelTop className="w-4 h-4"/>, "Topo")}
                                                                        {renderBorderToggle(effectiveGridStyle?.borders?.bottom ?? false, () => {
                                                                            const grid = selectedElement.style.fullCalendar?.grid;
                                                                            updateElementStyle(selectedElement.id, { fullCalendar: { ...selectedElement.style.fullCalendar, grid: { ...grid, borders: { ...grid?.borders, bottom: !(effectiveGridStyle?.borders?.bottom ?? false) } } } });
                                                                        }, <PanelBottom className="w-4 h-4"/>, "Base")}
                                                                        {renderBorderToggle(effectiveGridStyle?.borders?.left ?? false, () => {
                                                                            const grid = selectedElement.style.fullCalendar?.grid;
                                                                            updateElementStyle(selectedElement.id, { fullCalendar: { ...selectedElement.style.fullCalendar, grid: { ...grid, borders: { ...grid?.borders, left: !(effectiveGridStyle?.borders?.left ?? false) } } } });
                                                                        }, <PanelLeft className="w-4 h-4"/>, "Esq.")}
                                                                        {renderBorderToggle(effectiveGridStyle?.borders?.right ?? false, () => {
                                                                            const grid = selectedElement.style.fullCalendar?.grid;
                                                                            updateElementStyle(selectedElement.id, { fullCalendar: { ...selectedElement.style.fullCalendar, grid: { ...grid, borders: { ...grid?.borders, right: !(effectiveGridStyle?.borders?.right ?? false) } } } });
                                                                        }, <PanelRight className="w-4 h-4"/>, "Dir.")}
                                                                        {renderBorderToggle(effectiveGridStyle?.borders?.insideHorizontal ?? false, () => {
                                                                            const grid = selectedElement.style.fullCalendar?.grid;
                                                                            updateElementStyle(selectedElement.id, { fullCalendar: { ...selectedElement.style.fullCalendar, grid: { ...grid, borders: { ...grid?.borders, insideHorizontal: !(effectiveGridStyle?.borders?.insideHorizontal ?? false) } } } });
                                                                        }, <Rows className="w-4 h-4"/>, "Horiz.")}
                                                                        {renderBorderToggle(effectiveGridStyle?.borders?.insideVertical ?? false, () => {
                                                                            const grid = selectedElement.style.fullCalendar?.grid;
                                                                            updateElementStyle(selectedElement.id, { fullCalendar: { ...selectedElement.style.fullCalendar, grid: { ...grid, borders: { ...grid?.borders, insideVertical: !(effectiveGridStyle?.borders?.insideVertical ?? false) } } } });
                                                                        }, <Columns className="w-4 h-4"/>, "Vert.")}
                                                                        {renderBorderToggle(effectiveGridStyle?.borders?.headerSeparator ?? true, () => {
                                                                            const grid = selectedElement.style.fullCalendar?.grid;
                                                                            updateElementStyle(selectedElement.id, { fullCalendar: { ...selectedElement.style.fullCalendar, grid: { ...grid, borders: { ...grid?.borders, headerSeparator: !(effectiveGridStyle?.borders?.headerSeparator ?? true) } } } });
                                                                        }, <Minus className="w-4 h-4"/>, "Separador")}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })()}
                                                </div>
                                            )}

                                            {['date_placeholder', 'day_number', 'day_name', 'month_name', 'month_number', 'year', 'quote', 'text', 'holiday', 'moon', 'holiday_list', 'verse'].includes(selectedElement.type) && !selectedElement.style.fullCalendar && (
                                                <div className="space-y-3 pt-3 border-t border-gray-100">
                                                    {(() => {
                                                         const isDayNumber = selectedElement.type === 'day_number' || (selectedElement.type === 'date_placeholder' && (selectedElement.style.variant || 'day_number') === 'day_number');
                                                         const isDayName = selectedElement.type === 'day_name' || (selectedElement.type === 'date_placeholder' && selectedElement.style.variant === 'day_name');
                                                         const isMonthName = selectedElement.type === 'month_name' || (selectedElement.type === 'date_placeholder' && selectedElement.style.variant === 'month_name');
                                                          const isMonthNumber = selectedElement.type === 'month_number' || (selectedElement.type === 'date_placeholder' && selectedElement.style.variant === 'month_number');
                                                         const isDateElement = isDayNumber || isDayName || isMonthName || isMonthNumber;
                                                         
                                                         if (!isDateElement) return null;
                                                         
                                                         return (
                                                             <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl space-y-2 mb-3">
                                                                 <div className="flex items-center gap-1.5 text-indigo-800 font-bold text-[10px] uppercase tracking-wide">
                                                                     <icons.Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                                                                     <span>Prevenção de Quebra de Layout</span>
                                                                 </div>
                                                                 <p className="text-[11px] text-indigo-950 leading-normal font-medium">
                                                                     {isDayNumber && <>O número <strong>30</strong> é o mais largo (ex: maior que o dia 11). Use-o para testar as margens.</>}
                                                                     {isDayName && <>O dia <strong>segunda-feira</strong> é o maior dia da semana. Garanta que há largura para caber sem quebrar.</>}
                                                                     {isMonthName && <>O mês <strong>novembro</strong> é o maior do ano. Garanta que há espaço para caber inteiro.</>}
                                                                      {isMonthNumber && <>O número do mês <strong>12</strong> é o mais largo. Garanta que há espaço para caber sem quebrar.</>}
                                                                 </p>
                                                                 <div className="flex items-center justify-between pt-1.5 border-t border-indigo-150 mt-2">
                                                                     <span className="text-[10px] font-bold text-indigo-700">Testar maior tamanho:</span>
                                                                     <button
                                                                         onClick={() => updateElementStyle(selectedElement.id, { simulateMaxSpace: !selectedElement.style.simulateMaxSpace })}
                                                                         className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all shadow-sm cursor-pointer ${
                                                                             selectedElement.style.simulateMaxSpace 
                                                                                 ? 'bg-indigo-600 hover:bg-indigo-700 text-white font-black' 
                                                                                 : 'bg-white border border-indigo-300 text-indigo-600 hover:bg-indigo-50'
                                                                         }`}
                                                                     >
                                                                         {selectedElement.style.simulateMaxSpace ? 'Simulando' : 'Testar Agora'}
                                                                     </button>
                                                                 </div>
                                                             </div>
                                                         );
                                                     })()}
                                                    {selectedElement.type === 'date_placeholder' && (
                                                        <div className="space-y-1 mb-2">
                                                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Informação da Data</label>
                                                            <select 
                                                                value={selectedElement.style.variant || 'day_number'} 
                                                                onChange={(e) => updateElementStyle(selectedElement.id, { variant: e.target.value })} 
                                                                className="w-full text-xs p-1.5 border border-gray-200 rounded bg-white shadow-sm"
                                                            >
                                                                <option value="day_number">Número do Dia</option>
                                                                <option value="day_name">Nome do Dia</option>
                                                                <option value="month_name">Nome do Mês</option>
                                                                 <option value="month_number">Número do Mês</option>
                                                                <option value="year">Ano</option>
                                                            </select>
                                                        </div>
                                                    )}
                                                    {selectedElement.type === 'moon' && (
                                                        <div className="space-y-1 mb-2">
                                                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Estilo da Lua</label>
                                                            <select 
                                                                value={selectedElement.style.variant || 'full_info'} 
                                                                onChange={(e) => updateElementStyle(selectedElement.id, { variant: e.target.value })} 
                                                                className="w-full text-xs p-1.5 border border-gray-200 rounded bg-white shadow-sm"
                                                            >
                                                                <option value="full_info">Ícone + Texto</option>
                                                                <option value="icon_only">Apenas Ícone</option>
                                                                <option value="minimal">Minimalista</option>
                                                            </select>
                                                        </div>
                                                    )}
                                                    {selectedElement.type === 'permanent_day_header' && (
                                                        <div className="space-y-1 mb-2">
                                                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Estilo da Agenda</label>
                                                            <select 
                                                                value={selectedElement.style.variant || 'circles_outline'} 
                                                                onChange={(e) => updateElementStyle(selectedElement.id, { variant: e.target.value })} 
                                                                className="w-full text-xs p-1.5 border border-gray-200 rounded bg-white shadow-sm"
                                                            >
                                                                <option value="circles_outline">Círculos (Contorno)</option>
                                                                <option value="circles_filled">Círculos (Preenchido)</option>
                                                                <option value="square_outline">Quadrados (Contorno)</option>
                                                                <option value="square_filled">Quadrados (Preenchido)</option>
                                                                <option value="circles_outline_text_below">Círculos + Letra Abaixo</option>
                                                                <option value="circles_filled_text_below">Círculos Preenchidos + Letra Abaixo</option>
                                                                <option value="square_outline_text_below">Quadrados + Letra Abaixo</option>
                                                                <option value="square_filled_text_below">Quadrados Preenchidos + Letra Abaixo</option>
                                                                <option value="minimal">Minimalista (Apenas Letras)</option>
                                                            </select>
                                                            
                                                            <div className="flex items-center justify-between mt-2 pt-1 border-t border-gray-50">
                                                                <label className="text-[9px] font-bold text-gray-400 uppercase">Contorno</label>
                                                                <div className="flex h-5 border border-gray-200 rounded overflow-hidden">
                                                                    <input 
                                                                        type="color" 
                                                                        value={selectedElement.style.borderColor || selectedElement.style.color || '#f472b6'} 
                                                                        onChange={(e) => updateElementStyle(selectedElement.id, { borderColor: e.target.value })} 
                                                                        className="w-6 h-full p-0 border-0 cursor-pointer" 
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {selectedElement.type === 'holiday_list' && (
                                                        <div><label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Colunas ({selectedElement.style.columnCount || 1})</label><input type="range" min="1" max="4" value={selectedElement.style.columnCount || 1} onChange={(e) => updateElementStyle(selectedElement.id, { columnCount: parseInt(e.target.value) })} className="w-full" /></div>
                                                    )}
                                                    {(selectedElement.type === 'text' || selectedElement.type === 'verse') && (
                                                        <button onClick={fitToText} className="w-full mb-2 py-1.5 px-3 bg-indigo-50 text-indigo-700 text-xs font-bold rounded border border-indigo-200 hover:bg-indigo-100 transition-colors flex items-center justify-center"><BoxSelect className="w-3 h-3 mr-1.5"/> Ajustar Quadro ao Texto</button>
                                                    )}
                                                    {renderTypographyControls({
                                                        fontFamily: selectedElement.style.fontFamily || 'Inter',
                                                        fontSize: selectedElement.style.fontSize || 12,
                                                        fontWeight: selectedElement.style.fontWeight || 'normal',
                                                        color: selectedElement.style.color || '#000000',
                                                        textAlign: selectedElement.style.textAlign || 'left',
                                                        verticalAlign: selectedElement.style.verticalAlign || 'top',
                                                        textTransform: selectedElement.style.textTransform || 'none', 
                                                        letterSpacing: selectedElement.style.letterSpacing || 0,
                                                        backgroundColor: selectedElement.style.backgroundColor
                                                    } as TextStyleConfig, (updates) => updateElementStyle(selectedElement.id, updates))}
                                                    {renderBorderControls(selectedElement.style, (updates) => updateElementStyle(selectedElement.id, updates))}
                                                </div>
                                            )}

                                            {selectedElement.type === 'note_grid' && (
                                                <div className="space-y-3 pt-3 border-t border-gray-100">
                                                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Configuração do Grid</h4>
                                                    <div className="space-y-1">
                                                        <label className="block text-[10px] font-bold text-gray-500 uppercase">Estilo</label>
                                                        <select 
                                                            value={selectedElement.style.variant || 'dots'} 
                                                            onChange={(e) => updateElementStyle(selectedElement.id, { variant: e.target.value })} 
                                                            className="w-full text-xs p-2 border border-gray-200 rounded bg-white"
                                                        >
                                                            <option value="dots">Pontilhado</option>
                                                            <option value="squared">Quadriculado</option>
                                                        </select>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <label className="text-[10px] font-bold text-gray-500 uppercase">Espaçamento</label>
                                                        <input type="number" min="5" max="50" value={selectedElement.style.gridSize || 15} onChange={(e) => updateElementStyle(selectedElement.id, { gridSize: parseInt(e.target.value) })} className="w-16 text-xs p-1 border border-gray-200 rounded" />
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <label className="text-[10px] font-bold text-gray-500 uppercase">Espessura</label>
                                                        <input type="number" min="0.1" max="5" step="0.1" value={selectedElement.style.borderWidth || 1} onChange={(e) => updateElementStyle(selectedElement.id, { borderWidth: parseFloat(e.target.value) })} className="w-16 text-xs p-1 border border-gray-200 rounded" />
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <label className="text-[10px] font-bold text-gray-500 uppercase">Estilo de Linha</label>
                                                        <select 
                                                            value={selectedElement.style.borderStyle || 'solid'} 
                                                            onChange={(e) => updateElementStyle(selectedElement.id, { borderStyle: e.target.value as any })} 
                                                            className="text-[10px] p-1 border rounded bg-white w-24"
                                                        >
                                                            <option value="solid">Sólida</option>
                                                            <option value="dashed">Tracejada</option>
                                                            <option value="dotted">Pontilhada</option>
                                                        </select>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <label className="text-[10px] font-bold text-gray-500 uppercase">Cor</label>
                                                        <input type="color" value={selectedElement.style.color || '#cccccc'} onChange={(e) => updateElementStyle(selectedElement.id, { color: e.target.value })} className="w-8 h-6 p-0 border-0 cursor-pointer" />
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <label className="text-[10px] font-bold text-gray-500 uppercase">Opacidade</label>
                                                        <input type="range" min="0.1" max="1" step="0.1" value={selectedElement.style.opacity || 0.5} onChange={(e) => updateElementStyle(selectedElement.id, { opacity: parseFloat(e.target.value) })} className="w-24" />
                                                    </div>
                                                </div>
                                            )}

                                            {selectedElement.type === 'lines' && (
                                                <div className="space-y-3 pt-3 border-t border-gray-100">
                                                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Configuração das Linhas</h4>
                                                    <div className="flex items-center justify-between">
                                                        <label className="text-[10px] font-bold text-gray-500">Modo de Espaçamento</label>
                                                        <select 
                                                            value={selectedElement.style.rowCount ? 'count' : 'spacing'} 
                                                            onChange={(e) => {
                                                                if (e.target.value === 'count') {
                                                                    updateElementStyle(selectedElement.id, { rowCount: 15 });
                                                                } else {
                                                                    updateElementStyle(selectedElement.id, { rowCount: undefined });
                                                                }
                                                            }}
                                                            className="text-[10px] p-1 border rounded bg-white"
                                                        >
                                                            <option value="spacing">Por Espaçamento (px)</option>
                                                            <option value="count">Por Número de Linhas</option>
                                                        </select>
                                                    </div>
                                                    {selectedElement.style.rowCount ? (
                                                        <div className="flex items-center justify-between">
                                                            <label className="text-[10px] font-bold text-gray-500">Número de Linhas</label>
                                                            <input 
                                                                type="number" 
                                                                min="1" 
                                                                max="100" 
                                                                value={selectedElement.style.rowCount || 15} 
                                                                onChange={(e) => updateElementStyle(selectedElement.id, { rowCount: parseInt(e.target.value) || 1 })} 
                                                                className="w-16 text-xs p-1 border rounded" 
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center justify-between">
                                                            <div className="space-y-2">
                                                                <div className="flex items-center justify-between">
                                                                    <label className="text-[10px] font-bold text-gray-500">Espaçamento (px)</label>
                                                                    <input 
                                                                        type="number" 
                                                                        min="5" 
                                                                        max="100" 
                                                                        value={selectedElement.style.lineSpacing || 24} 
                                                                        onChange={(e) => updateElementStyle(selectedElement.id, { lineSpacing: parseInt(e.target.value) || 24 })} 
                                                                        className="w-16 text-xs p-1 border rounded" 
                                                                    />
                                                                </div>
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex flex-col">
                                                                        <label className="text-[10px] font-bold text-gray-500">Espaçamento (mm)</label>
                                                                        <span className="text-[8px] text-gray-400 font-mono">Conversão Real (mm)</span>
                                                                    </div>
                                                                    <input 
                                                                        type="number" 
                                                                        step="0.1"
                                                                        min="1.0" 
                                                                        max="40.0" 
                                                                        value={parseFloat(((selectedElement.style.lineSpacing || 24) / EDITOR_SCALE).toFixed(1))} 
                                                                        onChange={(e) => {
                                                                            const mmVal = parseFloat(e.target.value);
                                                                            if (mmVal > 0) {
                                                                                const pxVal = Math.round(mmVal * EDITOR_SCALE);
                                                                                updateElementStyle(selectedElement.id, { lineSpacing: pxVal });
                                                                            }
                                                                        }} 
                                                                        className="w-16 text-xs p-1 border rounded font-mono" 
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center justify-between">
                                                        <label className="text-[10px] font-bold text-gray-500">Mostrar Horários</label>
                                                        <input 
                                                            type="checkbox" 
                                                            checked={selectedElement.style.showTimes || false} 
                                                            onChange={(e) => updateElementStyle(selectedElement.id, { showTimes: e.target.checked })} 
                                                            className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4" 
                                                        />
                                                    </div>
                                                    {selectedElement.style.showTimes && (
                                                        <div className="space-y-2 pt-1 border-t border-gray-100/50 mt-1">
                                                            <div className="flex items-center justify-between">
                                                                <label className="text-[10px] font-bold text-gray-500">Hora Inicial</label>
                                                                <input 
                                                                    type="number" 
                                                                    min="0" 
                                                                    max="23" 
                                                                    value={selectedElement.style.startHour !== undefined ? selectedElement.style.startHour : 7} 
                                                                    onChange={(e) => updateElementStyle(selectedElement.id, { startHour: parseInt(e.target.value) || 0 })} 
                                                                    className="w-16 text-xs p-1 border rounded" 
                                                                />
                                                            </div>
                                                            <div className="flex items-center justify-between">
                                                                <label className="text-[10px] font-bold text-gray-500">Hora Final</label>
                                                                <input 
                                                                    type="number" 
                                                                    min="0" 
                                                                    max="23" 
                                                                    value={selectedElement.style.endHour !== undefined ? selectedElement.style.endHour : 18} 
                                                                    onChange={(e) => updateElementStyle(selectedElement.id, { endHour: parseInt(e.target.value) || 0 })} 
                                                                    className="w-16 text-xs p-1 border rounded" 
                                                                />
                                                            </div>
                                                            <div className="flex items-center justify-between">
                                                                <label className="text-[10px] font-bold text-gray-500">Intervalo</label>
                                                                <select 
                                                                    value={selectedElement.style.timeInterval || 60} 
                                                                    onChange={(e) => updateElementStyle(selectedElement.id, { timeInterval: parseInt(e.target.value) || 60 })} 
                                                                    className="w-20 text-xs p-1 border rounded bg-white text-gray-700"
                                                                >
                                                                    <option value={15}>15 min</option>
                                                                    <option value={30}>30 min</option>
                                                                    <option value={45}>45 min</option>
                                                                    <option value={60}>1 hora</option>
                                                                    <option value={120}>2 horas</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            {['box', 'circle', 'lines'].includes(selectedElement.type) && (
                                                <div className="space-y-3 pt-3 border-t border-gray-100">
                                                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                                                        {selectedElement.type === 'box' ? 'Estilo da Caixa' : selectedElement.type === 'circle' ? 'Estilo do Círculo' : 'Estilo da Forma'}
                                                    </h4>
                                                    
                                                    {selectedElement.type !== 'lines' && (
                                                        <div className="space-y-3 bg-gray-50 p-2 text-xs rounded-lg border border-gray-100">
                                                            <div className="flex items-center justify-between">
                                                                <label className="text-[10px] font-bold text-gray-500 uppercase">Preenchimento</label>
                                                                <div className="flex bg-gray-200 p-0.5 rounded shadow-inner">
                                                                    <button 
                                                                        onClick={() => updateElementStyle(selectedElement.id, { backgroundType: 'solid' })}
                                                                        className={`px-2 py-1 text-[9px] font-bold rounded ${(!selectedElement.style.backgroundType || selectedElement.style.backgroundType === 'solid') ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400'}`}
                                                                    >
                                                                        Sólido
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => updateElementStyle(selectedElement.id, { backgroundType: 'gradient', gradientType: selectedElement.style.gradientType || 'linear', gradientColors: selectedElement.style.gradientColors || ['#e0e7ff', '#6366f1'], gradientDirection: selectedElement.style.gradientDirection ?? 180 })}
                                                                        className={`px-2 py-1 text-[9px] font-bold rounded ${selectedElement.style.backgroundType === 'gradient' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400'}`}
                                                                    >
                                                                        Gradiente
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            {selectedElement.style.backgroundType === 'gradient' ? (
                                                                <div className="space-y-3 bg-white p-2 rounded border border-gray-100">
                                                                    <div className="grid grid-cols-2 gap-2">
                                                                        <div>
                                                                            <label className="text-[9px] font-bold text-gray-400 uppercase block mb-1">Cor Inicial</label>
                                                                            <input 
                                                                                type="color" 
                                                                                value={selectedElement.style.gradientColors?.[0] || '#ffffff'} 
                                                                                onChange={(e) => updateElementStyle(selectedElement.id, { gradientColors: [e.target.value, selectedElement.style.gradientColors?.[1] || '#000000'] })} 
                                                                                className="w-full h-8 p-1 border rounded cursor-pointer" 
                                                                            />
                                                                        </div>
                                                                        <div>
                                                                            <label className="text-[9px] font-bold text-gray-400 uppercase block mb-1">Cor Final</label>
                                                                            <input 
                                                                                type="color" 
                                                                                value={selectedElement.style.gradientColors?.[1] || '#000000'} 
                                                                                onChange={(e) => updateElementStyle(selectedElement.id, { gradientColors: [selectedElement.style.gradientColors?.[0] || '#ffffff', e.target.value] })} 
                                                                                className="w-full h-8 p-1 border rounded cursor-pointer" 
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center justify-between">
                                                                        <label className="text-[9px] font-bold text-gray-400 uppercase">Estilo</label>
                                                                        <select 
                                                                            value={selectedElement.style.gradientType || 'linear'} 
                                                                            onChange={(e) => updateElementStyle(selectedElement.id, { gradientType: e.target.value as any })}
                                                                            className="text-[10px] p-1 border rounded bg-white"
                                                                        >
                                                                            <option value="linear">Linear</option>
                                                                            <option value="radial">Radial</option>
                                                                        </select>
                                                                    </div>
                                                                    {selectedElement.style.gradientType !== 'radial' && (
                                                                        <div className="space-y-1">
                                                                            <div className="flex justify-between">
                                                                                <label className="text-[9px] font-bold text-gray-400 uppercase">Ângulo</label>
                                                                                <span className="text-[9px] text-gray-500">{selectedElement.style.gradientDirection || 0}°</span>
                                                                            </div>
                                                                            <input 
                                                                                type="range" min="0" max="360" step="15" 
                                                                                value={selectedElement.style.gradientDirection || 0} 
                                                                                onChange={(e) => updateElementStyle(selectedElement.id, { gradientDirection: parseInt(e.target.value) })} 
                                                                                className="w-full" 
                                                                            />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center justify-between bg-white p-2 rounded border border-gray-100">
                                                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Cor de Fundo</label>
                                                                    <div className="flex h-6 border border-gray-200 rounded overflow-hidden">
                                                                        <input type="color" value={selectedElement.style.backgroundColor || '#e5e7eb'} onChange={(e) => updateElementStyle(selectedElement.id, { backgroundColor: e.target.value })} className="w-8 h-full p-0 border-0 cursor-pointer" />
                                                                        <button 
                                                                            type="button"
                                                                            onClick={() => updateElementStyle(selectedElement.id, { backgroundColor: 'transparent' })}
                                                                            className="px-1.5 text-[8px] bg-gray-50 hover:bg-gray-100 border-l border-gray-200 uppercase font-bold text-gray-500"
                                                                        >
                                                                            Limpar
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            <div className="space-y-1 bg-white p-2 rounded border border-gray-100">
                                                                <div className="flex justify-between items-center">
                                                                    <label className="text-[10px] font-bold text-gray-500 uppercase">Opacidade Geral</label>
                                                                    <span className="text-[10px] font-mono text-gray-400">{Math.round((selectedElement.style.opacity ?? 1) * 100)}%</span>
                                                                </div>
                                                                <input 
                                                                    type="range" min="0.1" max="1" step="0.05" 
                                                                    value={selectedElement.style.opacity ?? 1} 
                                                                    onChange={(e) => updateElementStyle(selectedElement.id, { opacity: parseFloat(e.target.value) })} 
                                                                    className="w-full opacity-80" 
                                                                />
                                                            </div>

                                                            <div className="flex items-center justify-between bg-white p-2 rounded border border-gray-100">
                                                                <label className="text-[10px] font-bold text-gray-500 uppercase">Sombra</label>
                                                                <select 
                                                                    value={selectedElement.style.boxShadow || 'none'} 
                                                                    onChange={(e) => updateElementStyle(selectedElement.id, { boxShadow: e.target.value as any })}
                                                                    className="text-[10px] p-1 border border-gray-200 bg-white rounded cursor-pointer w-24"
                                                                >
                                                                    <option value="none">Nenhuma</option>
                                                                    <option value="sm">Suave (sm)</option>
                                                                    <option value="md">Média (md)</option>
                                                                    <option value="lg">Marcante (lg)</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {selectedElement.type === 'lines' && (
                                                        <div className="flex items-center justify-between">
                                                            <label className="text-[10px] font-bold text-gray-500">Cor da Linha</label>
                                                            <div className="flex h-6 border border-gray-200 rounded overflow-hidden">
                                                                <input type="color" value={selectedElement.style.color || '#000000'} onChange={(e) => updateElementStyle(selectedElement.id, { color: e.target.value })} className="w-8 h-full p-0 border-0 cursor-pointer" />
                                                            </div>
                                                        </div>
                                                    )}
                                                    {renderBorderControls(selectedElement.style, (updates) => updateElementStyle(selectedElement.id, updates))}
                                                </div>
                                            )}

                                            {selectedElement.type === 'vector_shape' && (
                                                <div className="space-y-3 pt-3 border-t border-gray-100">
                                                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Configuração da Forma Vetorial</h4>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-bold text-gray-500 uppercase">Tipo de Forma</label>
                                                        <select 
                                                            value={selectedElement.style.shapeType || 'rectangle'} 
                                                            onChange={(e) => updateElementStyle(selectedElement.id, { shapeType: e.target.value as any })} 
                                                            className="w-full text-xs p-1.5 border border-gray-200 rounded"
                                                        >
                                                            <option value="rectangle">Retângulo</option>
                                                            <option value="circle">Círculo</option>
                                                            <option value="triangle">Triângulo</option>
                                                            <option value="star">Estrela</option>
                                                            <option value="heart">Coração</option>
                                                            <option value="arrow">Seta</option>
                                                            <option value="diamond">Diamante</option>
                                                            <option value="hexagon">Hexágono</option>
                                                            <option value="pentagon">Pentágono</option>
                                                            <option value="parallelogram">Paralelogramo</option>
                                                            <option value="trapezoid">Trapézio</option>
                                                            <option value="octagon">Octógono</option>
                                                            <option value="cloud">Nuvem</option>
                                                            <option value="shield">Escudo</option>
                                                        </select>
                                                    </div>
                                                    <div className="space-y-4">
                                                        <div className="flex items-center justify-between">
                                                            <label className="text-[10px] font-bold text-gray-500 uppercase">Tipo de Fundo</label>
                                                            <div className="flex bg-gray-100 p-0.5 rounded shadow-inner">
                                                                <button 
                                                                    onClick={() => updateElementStyle(selectedElement.id, { backgroundType: 'solid' })}
                                                                    className={`px-2 py-1 text-[9px] font-bold rounded ${(!selectedElement.style.backgroundType || selectedElement.style.backgroundType === 'solid') ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400'}`}
                                                                >
                                                                    Sólido
                                                                </button>
                                                                <button 
                                                                    onClick={() => updateElementStyle(selectedElement.id, { backgroundType: 'gradient', gradientType: selectedElement.style.gradientType || 'linear', gradientColors: selectedElement.style.gradientColors || ['#e0e7ff', '#6366f1'], gradientDirection: selectedElement.style.gradientDirection ?? 180 })}
                                                                    className={`px-2 py-1 text-[9px] font-bold rounded ${selectedElement.style.backgroundType === 'gradient' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400'}`}
                                                                >
                                                                    Gradiente
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {selectedElement.style.backgroundType === 'gradient' ? (
                                                            <div className="space-y-3 bg-gray-50 p-2 rounded border border-gray-100">
                                                                <div className="grid grid-cols-2 gap-2">
                                                                    <div>
                                                                        <label className="text-[9px] font-bold text-gray-400 uppercase block mb-1">Cor Inicial</label>
                                                                        <input 
                                                                            type="color" 
                                                                            value={selectedElement.style.gradientColors?.[0] || '#ffffff'} 
                                                                            onChange={(e) => updateElementStyle(selectedElement.id, { gradientColors: [e.target.value, selectedElement.style.gradientColors?.[1] || '#000000'] })} 
                                                                            className="w-full h-8 p-1 border rounded cursor-pointer" 
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <label className="text-[9px] font-bold text-gray-400 uppercase block mb-1">Cor Final</label>
                                                                        <input 
                                                                            type="color" 
                                                                            value={selectedElement.style.gradientColors?.[1] || '#000000'} 
                                                                            onChange={(e) => updateElementStyle(selectedElement.id, { gradientColors: [selectedElement.style.gradientColors?.[0] || '#ffffff', e.target.value] })} 
                                                                            className="w-full h-8 p-1 border rounded cursor-pointer" 
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center justify-between">
                                                                    <label className="text-[9px] font-bold text-gray-400 uppercase">Estilo</label>
                                                                    <select 
                                                                        value={selectedElement.style.gradientType || 'linear'} 
                                                                        onChange={(e) => updateElementStyle(selectedElement.id, { gradientType: e.target.value as any })}
                                                                        className="text-[10px] p-1 border rounded"
                                                                    >
                                                                        <option value="linear">Linear</option>
                                                                        <option value="radial">Radial</option>
                                                                    </select>
                                                                </div>
                                                                {selectedElement.style.gradientType !== 'radial' && (
                                                                    <div className="space-y-1">
                                                                        <div className="flex justify-between">
                                                                            <label className="text-[9px] font-bold text-gray-400 uppercase">Ângulo</label>
                                                                            <span className="text-[9px] text-gray-500">{selectedElement.style.gradientDirection || 0}°</span>
                                                                        </div>
                                                                        <input 
                                                                            type="range" min="0" max="360" step="15" 
                                                                            value={selectedElement.style.gradientDirection || 0} 
                                                                            onChange={(e) => updateElementStyle(selectedElement.id, { gradientDirection: parseInt(e.target.value) })} 
                                                                            className="w-full" 
                                                                        />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center justify-between">
                                                                <label className="text-[10px] font-bold text-gray-500 uppercase">Cor</label>
                                                                <div className="flex h-6 border border-gray-200 rounded overflow-hidden">
                                                                    <input type="color" value={selectedElement.style.backgroundColor || '#e0e7ff'} onChange={(e) => updateElementStyle(selectedElement.id, { backgroundColor: e.target.value })} className="w-8 h-full p-0 border-0 cursor-pointer" />
                                                                    <button 
                                                                        onClick={() => updateElementStyle(selectedElement.id, { backgroundColor: 'transparent' })}
                                                                        className="px-1 text-[8px] bg-gray-50 hover:bg-gray-100 border-l border-gray-200 uppercase font-bold"
                                                                    >
                                                                        Limpar
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <label className="text-[10px] font-bold text-gray-500 uppercase">Cor da Borda</label>
                                                        <div className="flex h-6 border border-gray-200 rounded overflow-hidden">
                                                            <input type="color" value={selectedElement.style.borderColor || '#000000'} onChange={(e) => updateElementStyle(selectedElement.id, { borderColor: e.target.value })} className="w-8 h-full p-0 border-0 cursor-pointer" />
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <label className="text-[10px] font-bold text-gray-500 uppercase">Espessura ({selectedElement.style.borderWidth ?? 1})</label>
                                                        <input 
                                                            type="range" 
                                                            min="0" 
                                                            max="10" 
                                                            step="0.5" 
                                                            value={selectedElement.style.borderWidth ?? 1} 
                                                            onChange={(e) => updateElementStyle(selectedElement.id, { borderWidth: parseFloat(e.target.value) })} 
                                                            className="w-24" 
                                                        />
                                                    </div>
                                                    <div className="flex items-center justify-between font-mono">
                                                        <label className="text-[10px] font-bold text-gray-500 uppercase">Border Style</label>
                                                        <select 
                                                            value={selectedElement.style.borderStyle || 'solid'} 
                                                            onChange={(e) => updateElementStyle(selectedElement.id, { borderStyle: e.target.value as any })}
                                                            className="w-24 text-[10px] p-1 border rounded"
                                                        >
                                                            <option value="solid">Contínuo</option>
                                                            <option value="dashed">Tracejado</option>
                                                            <option value="dotted">Pontilhado</option>
                                                        </select>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <label className="text-[10px] font-bold text-gray-500 uppercase">Bordas Arredondadas ({selectedElement.style.borderRadius ?? 0}%)</label>
                                                        <input 
                                                            type="range" 
                                                            min="0" 
                                                            max="50" 
                                                            step="1" 
                                                            value={selectedElement.style.borderRadius ?? 0} 
                                                            onChange={(e) => updateElementStyle(selectedElement.id, { borderRadius: parseInt(e.target.value) })} 
                                                            className="w-24" 
                                                        />
                                                    </div>
                                                    <div className="space-y-2 py-2 border-t border-gray-50">
                                                        <div className="flex items-center justify-between">
                                                            <label className="text-[10px] font-bold text-gray-500 uppercase">Opacidade Geral ({Math.round((selectedElement.style.opacity ?? 1) * 100)}%)</label>
                                                            <input 
                                                                type="range" 
                                                                min="0" 
                                                                max="1" 
                                                                step="0.05" 
                                                                value={selectedElement.style.opacity ?? 1} 
                                                                onChange={(e) => updateElementStyle(selectedElement.id, { opacity: parseFloat(e.target.value) })} 
                                                                className="w-24" 
                                                            />
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <label className="text-[10px] font-bold text-gray-500 uppercase">Opacidade Fundo ({Math.round((selectedElement.style.fillOpacity ?? 1) * 100)}%)</label>
                                                            <input 
                                                                type="range" 
                                                                min="0" 
                                                                max="1" 
                                                                step="0.05" 
                                                                value={selectedElement.style.fillOpacity ?? 1} 
                                                                onChange={(e) => updateElementStyle(selectedElement.id, { fillOpacity: parseFloat(e.target.value) })} 
                                                                className="w-24" 
                                                            />
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <label className="text-[10px] font-bold text-gray-500 uppercase">Opacidade Borda ({Math.round((selectedElement.style.strokeOpacity ?? 1) * 100)}%)</label>
                                                            <input 
                                                                type="range" 
                                                                min="0" 
                                                                max="1" 
                                                                step="0.05" 
                                                                value={selectedElement.style.strokeOpacity ?? 1} 
                                                                onChange={(e) => updateElementStyle(selectedElement.id, { strokeOpacity: parseFloat(e.target.value) })} 
                                                                className="w-24" 
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <label className="text-[10px] font-bold text-gray-500 uppercase">Rotação ({selectedElement.style.rotation ?? 0}°)</label>
                                                        <input 
                                                            type="range" 
                                                            min="0" 
                                                            max="360" 
                                                            step="5" 
                                                            value={selectedElement.style.rotation ?? 0} 
                                                            onChange={(e) => updateElementStyle(selectedElement.id, { rotation: parseInt(e.target.value) })} 
                                                            className="w-24" 
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2 pt-2">
                                                        <button 
                                                            onClick={() => updateElementStyle(selectedElement.id, { flipX: !selectedElement.style.flipX })}
                                                            className={`py-1.5 px-2 rounded border text-[10px] font-bold uppercase flex items-center justify-center gap-1 ${selectedElement.style.flipX ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-gray-200 text-gray-600'}`}
                                                        >
                                                            <FlipHorizontal className="w-3 h-3" /> Inverter H
                                                        </button>
                                                        <button 
                                                            onClick={() => updateElementStyle(selectedElement.id, { flipY: !selectedElement.style.flipY })}
                                                            className={`py-1.5 px-2 rounded border text-[10px] font-bold uppercase flex items-center justify-center gap-1 ${selectedElement.style.flipY ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-gray-200 text-gray-600'}`}
                                                        >
                                                            <FlipVertical className="w-3 h-3" /> Inverter V
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {selectedElement.type === 'image' && (
                                                <div className="space-y-4 pt-3 border-t border-gray-100">
                                                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Configuração da Imagem</h4>
                                                    
                                                    <div className="space-y-2">
                                                        <label className="block text-[10px] font-bold text-gray-500 uppercase">Upload de Imagem</label>
                                                        <div className="flex items-center gap-2">
                                                            <label 
                                                                onClick={(e) => { e.preventDefault(); triggerImageElementUpload(selectedElement.id); }}
                                                                className="flex-1 flex items-center justify-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-xs font-medium text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
                                                            >
                                                                <Upload className="w-3 h-3 mr-2" />
                                                                {selectedElement.style.imageUrl ? 'Trocar Imagem' : 'Selecionar Arquivo'}
                                                                <input 
                                                                    type="file" 
                                                                    className="hidden" 
                                                                    accept="image/*" 
                                                                    onChange={(e) => handleImageUpload(e, selectedElement.id)} 
                                                                />
                                                            </label>
                                                            {selectedElement.style.imageUrl && (
                                                                <button 
                                                                    onClick={() => updateElementStyle(selectedElement.id, { imageUrl: undefined })}
                                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-md border border-red-200"
                                                                    title="Remover Imagem"
                                                                >
                                                                    <Trash2 className="w-3 h-3" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-2">
                                                        <button 
                                                            onClick={() => updateElementStyle(selectedElement.id, { flipX: !selectedElement.style.flipX })}
                                                            className={`flex-1 py-1.5 px-2 rounded border text-[10px] font-bold uppercase flex items-center justify-center gap-1.5 transition-all ${selectedElement.style.flipX ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                                                        >
                                                            <FlipHorizontal className="w-3 h-3" /> Espelhar H
                                                        </button>
                                                        <button 
                                                            onClick={() => updateElementStyle(selectedElement.id, { flipY: !selectedElement.style.flipY })}
                                                            className={`flex-1 py-1.5 px-2 rounded border text-[10px] font-bold uppercase flex items-center justify-center gap-1.5 transition-all ${selectedElement.style.flipY ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                                                        >
                                                            <FlipVertical className="w-3 h-3" /> Espelhar V
                                                        </button>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-between">
                                                            <label className="text-[10px] font-bold text-gray-500 uppercase">Transparência</label>
                                                            <span className="text-[10px] font-mono text-gray-400">{Math.round((selectedElement.style.opacity ?? 1) * 100)}%</span>
                                                        </div>
                                                        <input 
                                                            type="range" 
                                                            min="0" 
                                                            max="1" 
                                                            step="0.01" 
                                                            value={selectedElement.style.opacity ?? 1} 
                                                            onChange={(e) => updateElementStyle(selectedElement.id, { opacity: parseFloat(e.target.value) })} 
                                                            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" 
                                                        />
                                                    </div>

                                                    <div className="pt-2">
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input 
                                                                type="checkbox" 
                                                                checked={selectedElement.style.autoMirrorImage || false} 
                                                                onChange={(e) => updateElementStyle(selectedElement.id, { autoMirrorImage: e.target.checked })} 
                                                                className="rounded text-indigo-600 focus:ring-indigo-500 h-3 w-3"
                                                            />
                                                            <span className="text-[10px] font-bold text-gray-500 uppercase">Auto-espelhar em pág. pares</span>
                                                        </label>
                                                        <p className="text-[8px] text-gray-400 mt-1 italic">
                                                            Inverte a imagem horizontalmente em páginas pares se o espelhamento estiver ativo.
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="pt-6">
                                                <button onClick={() => removeElement(selectedElement.id)} className="w-full py-2 px-4 bg-white border border-red-200 text-red-600 rounded hover:bg-red-50 flex items-center justify-center text-sm transition-colors"><Trash2 className="w-4 h-4 mr-2" /> Excluir Elemento</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-4 space-y-4">
                                            <div className="flex items-center gap-2 mb-2 p-2 bg-indigo-50 border border-indigo-100 rounded-lg">
                                                <Palmtree className="w-5 h-5 text-indigo-600" />
                                                <div>
                                                    <h4 className="text-xs font-bold text-indigo-900 uppercase leading-none">Fundo da Página</h4>
                                                    <p className="text-[9px] text-indigo-700 opacity-70 uppercase tracking-tight mt-1 font-semibold">
                                                        {editMode === 'intro' ? 'Customizando esta Página Inicial' : editMode === 'monthly_intro' ? 'Customizando esta Página Mensal' : editMode === 'divider' ? 'Customizando as Divisórias' : 'Customizando Miolo / Global'}
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            <BackgroundSettings 
                                                config={editMode === 'intro' 
                                                    ? config.introPages.find(p => p.id === currentIntroPageId)?.background || config.background 
                                                    : editMode === 'monthly_intro'
                                                    ? config.monthlyIntroPages?.find(p => p.id === currentMonthlyIntroPageId)?.background || config.background
                                                    : editMode === 'divider'
                                                    ? config.monthlyDividerStyle?.background || config.background
                                                    : config.background
                                                }
                                                onChange={(updates) => {
                                                    pushHistory();
                                                    if (editMode === 'intro' && currentIntroPageId) {
                                                        setConfig(prev => ({
                                                            ...prev,
                                                            introPages: prev.introPages.map(p => p.id === currentIntroPageId 
                                                                ? { ...p, background: { ...(p.background || prev.background || { type: 'none', opacity: 1, showOnIntroPages: true, showOnDailyPages: true }), ...updates } } 
                                                                : p
                                                            )
                                                        }));
                                                    } else if (editMode === 'monthly_intro' && currentMonthlyIntroPageId) {
                                                        setConfig(prev => ({
                                                            ...prev,
                                                            monthlyIntroPages: (prev.monthlyIntroPages || []).map(p => p.id === currentMonthlyIntroPageId 
                                                                ? { ...p, background: { ...(p.background || prev.background || { type: 'none', opacity: 1, showOnIntroPages: true, showOnDailyPages: true }), ...updates } } 
                                                                : p
                                                            )
                                                        }));
                                                    } else if (editMode === 'divider') {
                                                        setConfig(prev => ({
                                                            ...prev,
                                                            monthlyDividerStyle: {
                                                                ...(prev.monthlyDividerStyle || {}),
                                                                background: { ...(prev.monthlyDividerStyle?.background || prev.background || { type: 'none', opacity: 1, showOnIntroPages: true, showOnDailyPages: true }), ...updates }
                                                            }
                                                        }));
                                                    } else {
                                                        setConfig(prev => ({
                                                            ...prev,
                                                            background: { ...(prev.background || { type: 'none', opacity: 1, showOnIntroPages: true, showOnDailyPages: true }), ...updates }
                                                        }));
                                                    }
                                                }}
                                            />

                                            {editMode !== 'daily' && (
                                                <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            pushHistory();
                                                            const currentBg = editMode === 'intro'
                                                                ? config.introPages.find(p => p.id === currentIntroPageId)?.background
                                                                : editMode === 'monthly_intro'
                                                                ? config.monthlyIntroPages?.find(p => p.id === currentMonthlyIntroPageId)?.background
                                                                : config.monthlyDividerStyle?.background;
                                                            if (currentBg) {
                                                                setConfig(prev => ({
                                                                    ...prev,
                                                                    background: { ...currentBg, showOnIntroPages: true, showOnDailyPages: true }
                                                                }));
                                                            }
                                                        }}
                                                        className="w-full py-2 px-3 bg-indigo-50 hover:bg-indigo-150 text-indigo-700 hover:text-indigo-800 rounded-lg text-[10px] font-bold transition-all border border-indigo-100 hover:border-indigo-200 flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-tight"
                                                    >
                                                        ✨ Aplicar este fundo no miolo todo (Global)
                                                    </button>
                                                    
                                                    {config.background && config.background.type !== 'none' && (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                pushHistory();
                                                                if (config.background) {
                                                                    if (editMode === 'intro' && currentIntroPageId) {
                                                                        setConfig(prev => ({
                                                                            ...prev,
                                                                            introPages: prev.introPages.map(p => p.id === currentIntroPageId
                                                                                ? { ...p, background: prev.background ? { ...prev.background } : undefined }
                                                                                : p
                                                                            )
                                                                        }));
                                                                    } else if (editMode === 'monthly_intro' && currentMonthlyIntroPageId) {
                                                                        setConfig(prev => ({
                                                                            ...prev,
                                                                            monthlyIntroPages: (prev.monthlyIntroPages || []).map(p => p.id === currentMonthlyIntroPageId
                                                                                ? { ...p, background: prev.background ? { ...prev.background } : undefined }
                                                                                : p
                                                                            )
                                                                        }));
                                                                    } else if (editMode === 'divider') {
                                                                        setConfig(prev => ({
                                                                            ...prev,
                                                                            monthlyDividerStyle: {
                                                                                ...(prev.monthlyDividerStyle || {}),
                                                                                background: prev.background ? { ...prev.background } : undefined
                                                                            }
                                                                        }));
                                                                    }
                                                                }
                                                            }}
                                                            className="w-full py-2 px-3 bg-white hover:bg-gray-50 text-gray-600 rounded-lg text-[10px] font-bold transition-all border border-gray-200 flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-tight"
                                                        >
                                                            ⬇️ Copiar fundo global para esta página
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </motion.aside>
                        )}
                    </AnimatePresence>



                        {/* Controles de Zoom */}
                        {!isMobile && (
                            <div className={`fixed bottom-6 flex items-center bg-white/95 backdrop-blur-md rounded-full shadow-2xl border border-gray-200 px-4 py-2 gap-3 z-[60] no-print animate-in slide-in-from-bottom-4 duration-300 transition-all duration-300 ${showProperties ? 'right-[312px]' : 'right-6'}`}>
                                <div className="flex bg-gray-100 p-0.5 rounded-full border border-gray-200 select-none">
                                    <button
                                        onClick={() => setPanMode(false)}
                                        className={`p-1.5 rounded-full transition-all cursor-pointer ${!panMode ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                                        title="Ferramenta Seleção (Atalho: V)"
                                    >
                                        <MousePointer2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setPanMode(true)}
                                        className={`p-1.5 rounded-full transition-all cursor-pointer ${panMode ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                                        title="Ferramenta Mão / Arrastar (Atalho: H ou Segurar Espaço)"
                                    >
                                        <Hand className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="w-px h-6 bg-gray-200 mx-1"></div>
                                <button 
                                    onClick={() => setZoom(Math.max(0.3, zoom - 0.1))} 
                                    className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-indigo-600 disabled:opacity-30"
                                    title="Diminuir Zoom"
                                    disabled={zoom <= 0.3}
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                                <div className="flex flex-col items-center min-w-[50px] select-none">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight leading-none mb-0.5">Zoom</span>
                                    <span className="text-xs font-bold text-indigo-600 tabular-nums">{Math.round(zoom * 100)}%</span>
                                </div>
                                <button 
                                    onClick={() => setZoom(Math.min(3, zoom + 0.1))} 
                                    className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-indigo-600 disabled:opacity-30"
                                    title="Aumentar Zoom"
                                    disabled={zoom >= 3}
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                                <div className="w-px h-6 bg-gray-200 mx-1"></div>
                                <button 
                                    onClick={() => setZoom(1)} 
                                    className="text-[9px] font-bold text-gray-500 hover:text-indigo-600 uppercase tracking-widest px-2 py-1 hover:bg-gray-50 rounded transition-colors"
                                >
                                    Reset
                                </button>
                            </div>
                        )}
                    </div>
                )}
                {activeTab === 'preview' && (
                    <div className="flex-1 w-full overflow-y-auto p-8 custom-scrollbar bg-gray-500">
                        <div className="max-w-[95vw] md:max-w-6xl mx-auto">
                            <div id="print-area">
                                {generatedData.length === 0 ? (<div className="text-center py-20 text-white">Carregando visualização...</div>) : (
                                    <div className="space-y-4">
                                        <div className="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-md sticky top-2 z-50 flex items-center justify-between no-print border border-gray-100 max-w-2xl mx-auto mb-6">
                                            <div className="flex items-center gap-3 pl-2">
                                                <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div>
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none">Visualizando</span>
                                                    <span className="text-sm font-black text-indigo-700 leading-tight">
                                                        {actualTotalPagesCount} Páginas
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="relative">
                                                    <Search className="w-3 h-3 absolute left-2 top-2 text-gray-400 pointer-events-none" />
                                                    <select 
                                                        className="text-[10px] pl-7 pr-3 py-1.5 border border-gray-200 rounded-md bg-white focus:ring-1 focus:ring-indigo-500 outline-none transition-all cursor-pointer" 
                                                        onChange={(e) => handleScrollToMonth(parseInt(e.target.value))}
                                                    >
                                                        <option value="">Pular para Mês...</option>
                                                        {Array.from({length: 12}).map((_, i) => (<option key={i} value={i}>{getMonthName(i)}</option>))}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="no-print flex flex-col items-center gap-16 pb-40 max-w-[95vw] mx-auto overflow-x-hidden">
                                            {(() => {
                                                const renderedPages = renderPrintLayout(undefined, undefined, renderedPreviewCount);
                                                if (!Array.isArray(renderedPages)) return renderedPages;

                                                if (config.orientation === 'landscape') {
                                                    return renderedPages.map((page, idx) => (
                                                        <div key={`page-landscape-${idx}`} className="w-full max-w-4xl flex justify-center print:contents">
                                                            <PreviewPageScaleWrapper widthMm={PAGE_WIDTH_MM} heightMm={PAGE_HEIGHT_MM}>
                                                                {page}
                                                            </PreviewPageScaleWrapper>
                                                        </div>
                                                    ));
                                                }

                                                const spreads: React.ReactNode[] = [];
                                                
                                                // Page 1 is always alone on the right (Odd)
                                                if (renderedPages.length > 0) {
                                                    spreads.push(
                                                        <div key="spread-initial" className="flex items-start justify-center w-full print:contents">
                                                            <div className="hidden lg:block w-[45%] opacity-0 pointer-events-none" /> {/* Placeholder for empty left */}
                                                            <div className="w-full lg:w-[45%] flex justify-center lg:justify-start pl-0 lg:pl-[2mm]">
                                                                <PreviewPageScaleWrapper widthMm={PAGE_WIDTH_MM} heightMm={PAGE_HEIGHT_MM}>
                                                                    {renderedPages[0]}
                                                                </PreviewPageScaleWrapper>
                                                            </div>
                                                        </div>
                                                    );
                                                }

                                                // The rest are in pairs (Even - Odd)
                                                for (let i = 1; i < renderedPages.length; i += 2) {
                                                    const left = renderedPages[i];
                                                    const right = renderedPages[i + 1];
                                                    
                                                    spreads.push(
                                                        <div key={`spread-${i}`} className="flex flex-col lg:flex-row items-center lg:items-start justify-center w-full gap-8 lg:gap-0 print:contents">
                                                            <div className="w-full lg:w-[45%] flex justify-center lg:justify-end pr-0 lg:pr-[2mm]">
                                                                <PreviewPageScaleWrapper widthMm={PAGE_WIDTH_MM} heightMm={PAGE_HEIGHT_MM}>
                                                                    {left}
                                                                </PreviewPageScaleWrapper>
                                                            </div>
                                                            <div className="w-full lg:w-[45%] flex justify-center lg:justify-start pl-0 lg:pl-[2mm]">
                                                                {right ? (
                                                                    <PreviewPageScaleWrapper widthMm={PAGE_WIDTH_MM} heightMm={PAGE_HEIGHT_MM}>
                                                                        {right}
                                                                    </PreviewPageScaleWrapper>
                                                                ) : (
                                                                    <div className="hidden lg:block w-full opacity-0 pointer-events-none" />
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                                
                                                return spreads;
                                            })()}
                                        </div>
                                        {renderedPreviewCount < generatedData.length && (
                                            <div className="no-print flex justify-center pb-20">
                                                <div className="flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-full backdrop-blur-sm">
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    <span className="text-xs font-medium">Carregando mais páginas...</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Modais e Overlays */}
            {showImportConfirm && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6">
                            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                                <icons.AlertTriangle className="w-6 h-6 text-amber-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Abrir Novo Projeto?</h3>
                            <p className="text-sm text-gray-500 text-center mb-6">
                                Ao abrir um novo arquivo, as alterações não salvas no projeto atual serão perdidas permanentemente. Deseja continuar?
                            </p>
                            <div className="flex gap-3">
                                <button 
                                    onClick={cancelImport}
                                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    onClick={confirmImport}
                                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-lg shadow-indigo-200"
                                >
                                    Sim, Abrir Projeto
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Elements Drawer for Mobile */}
            <AnimatePresence>
                {isMobile && mobileDrawer === 'elements' && (
                    <motion.div 
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        className="fixed inset-x-0 bottom-0 z-[2100] bg-white rounded-t-3xl shadow-2xl flex flex-col p-6 no-print h-[60vh] border-t border-indigo-100"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-sm font-black uppercase tracking-widest text-indigo-600">Incluir no Planner</h3>
                            <button onClick={() => setMobileDrawer('none')} className="p-1"><X className="w-6 h-6 text-gray-400" /></button>
                        </div>
                        <div className="grid grid-cols-3 gap-3 overflow-y-auto pb-10">
                            {editMode === 'daily' && !(config.projectType === 'notebook' || config.projectType === 'devotional') && (
                                <>
                                    <button onClick={() => { addElement('date_placeholder', 'Dia', { variant: 'day_number' }); setMobileDrawer('none'); }} className="aspect-square flex flex-col items-center justify-center border border-gray-100 rounded-2xl bg-indigo-50/30 gap-2"><span className="font-bold text-lg text-indigo-600">24</span><span className="text-[9px] font-bold text-indigo-400 uppercase">Dia</span></button>
                                    <button onClick={() => { addElement('date_placeholder', 'Semana', { variant: 'day_name' }); setMobileDrawer('none'); }} className="aspect-square flex flex-col items-center justify-center border border-gray-100 rounded-2xl bg-indigo-50/30 gap-2"><span className="text-xs font-bold text-indigo-600 uppercase">Seg</span><span className="text-[9px] font-bold text-indigo-400 uppercase">Semana</span></button>
                                    <button onClick={() => { addElement('date_placeholder', 'Mês', { variant: 'month_name' }); setMobileDrawer('none'); }} className="aspect-square flex flex-col items-center justify-center border border-gray-100 rounded-2xl bg-indigo-50/30 gap-2"><span className="text-xs font-bold text-indigo-600 uppercase">Mês</span><span className="text-[9px] font-bold text-indigo-400 uppercase">Mês</span></button>
                                </>
                            )}
                            <button onClick={() => { addElement('text', 'Texto'); setMobileDrawer('none'); }} className="aspect-square flex flex-col items-center justify-center border border-gray-100 rounded-2xl bg-white gap-2 shadow-sm"><Type className="w-6 h-6 text-indigo-600"/><span className="text-[9px] font-bold text-gray-500 uppercase">Texto</span></button>
                            <button onClick={() => { addElement('box', 'Caixa'); setMobileDrawer('none'); }} className="aspect-square flex flex-col items-center justify-center border border-gray-100 rounded-2xl bg-white gap-2 shadow-sm"><Square className="w-6 h-6 text-indigo-600"/><span className="text-[9px] font-bold text-gray-500 uppercase">Caixa</span></button>
                            <button onClick={() => { addElement('vector_shape', 'Formas'); setMobileDrawer('none'); }} className="aspect-square flex flex-col items-center justify-center border border-gray-100 rounded-2xl bg-white gap-2 shadow-sm"><Shapes className="w-6 h-6 text-indigo-600"/><span className="text-[9px] font-bold text-gray-500 uppercase">Formas</span></button>
                            <button onClick={() => { addElement('lines', 'Pautas', { color: '#e5e7eb', lineSpacing: 24 }); setMobileDrawer('none'); }} className="aspect-square flex flex-col items-center justify-center border border-gray-100 rounded-2xl bg-white gap-2 shadow-sm"><ListTodo className="w-6 h-6 text-indigo-600"/><span className="text-[9px] font-bold text-gray-500 uppercase">Linhas</span></button>
                            <button onClick={() => { addElement('table', 'Tabela'); setMobileDrawer('none'); }} className="aspect-square flex flex-col items-center justify-center border border-gray-100 rounded-2xl bg-white gap-2 shadow-sm"><TableIcon className="w-6 h-6 text-indigo-600"/><span className="text-[9px] font-bold text-gray-500 uppercase">Tabela</span></button>
                            <button onClick={() => { addElement('habit_tracker', 'Hábitos'); setMobileDrawer('none'); }} className="aspect-square flex flex-col items-center justify-center border border-gray-100 rounded-2xl bg-white gap-2 shadow-sm"><CheckSquare className="w-6 h-6 text-indigo-600"/><span className="text-[9px] font-bold text-gray-500 uppercase">Hábitos</span></button>
                            <button onClick={() => { addElement('image', 'Imagem'); setMobileDrawer('none'); }} className="aspect-square flex flex-col items-center justify-center border border-gray-100 rounded-2xl bg-white gap-2 shadow-sm"><Upload className="w-6 h-6 text-indigo-600"/><span className="text-[9px] font-bold text-gray-500 uppercase">Imagem</span></button>
                            <button onClick={() => { addElement('verse', 'Versículo'); setMobileDrawer('none'); }} className="aspect-square flex flex-col items-center justify-center border border-gray-100 rounded-2xl bg-white gap-2 shadow-sm"><BookOpen className="w-6 h-6 text-indigo-600"/><span className="text-[9px] font-bold text-gray-500 uppercase">Versículo</span></button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            
            {isMobile && (
                <MobileBottomNav 
                    activeDrawer={mobileDrawer} 
                    onTabClick={(drawer) => setMobileDrawer(drawer)} 
                />
            )}

            <AnimatePresence>
                {toastMessage && (
                    <motion.div 
                        initial={{ opacity: 0, y: 50, x: "-50%", scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, x: "-50%", scale: 1 }}
                        exit={{ opacity: 0, y: 20, x: "-50%", scale: 0.9 }}
                        className="fixed bottom-6 left-1/2 z-[10000] bg-indigo-900 text-white px-4 py-2.5 rounded-lg shadow-2xl flex items-center gap-2 text-xs font-semibold tracking-wide border border-indigo-700/50 backdrop-blur-md"
                    >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{toastMessage}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

// --- Mobile Components ---

const MobileBottomNav: React.FC<{
    activeDrawer: 'none' | 'sidebar' | 'properties' | 'layers' | 'elements';
    onTabClick: (type: 'none' | 'sidebar' | 'properties' | 'layers' | 'elements') => void;
}> = ({ activeDrawer, onTabClick }) => {
    return (
        <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 h-16 flex items-center justify-around z-[2000] pb-safe no-print shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)]">
            <button 
                onClick={() => onTabClick(activeDrawer === 'sidebar' ? 'none' : 'sidebar')}
                className={`flex flex-col items-center gap-1 flex-1 py-1 transition-colors ${activeDrawer === 'sidebar' ? 'text-indigo-600' : 'text-gray-400'}`}
            >
                <icons.Layout className="w-5 h-5" />
                <span className="text-[8px] font-bold uppercase">Design</span>
            </button>
            <button 
                onClick={() => onTabClick(activeDrawer === 'elements' ? 'none' : 'elements')}
                className={`flex flex-col items-center gap-1 flex-1 py-1 transition-colors ${activeDrawer === 'elements' ? 'text-indigo-600' : 'text-gray-400'}`}
            >
                <icons.Plus className="w-5 h-5" />
                <span className="text-[8px] font-bold uppercase">Incluir</span>
            </button>
            <button 
                onClick={() => onTabClick(activeDrawer === 'layers' ? 'none' : 'layers')}
                className={`flex flex-col items-center gap-1 flex-1 py-1 transition-colors ${activeDrawer === 'layers' ? 'text-indigo-600' : 'text-gray-400'}`}
            >
                <icons.Layers className="w-5 h-5" />
                <span className="text-[8px] font-bold uppercase">Camadas</span>
            </button>
            <button 
                onClick={() => onTabClick(activeDrawer === 'properties' ? 'none' : 'properties')}
                className={`flex flex-col items-center gap-1 flex-1 py-1 transition-colors ${activeDrawer === 'properties' ? 'text-indigo-600' : 'text-gray-400'}`}
            >
                <icons.Settings2 className="w-5 h-5" />
                <span className="text-[8px] font-bold uppercase">Ajustes</span>
            </button>
        </div>
    );
};
