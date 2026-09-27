import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  Download, Copy, Check, Sparkles, ArrowLeft, ChevronLeft, ChevronRight, 
  Layers, Sliders, Palette, Camera, Image as ImageIcon, Sun, RefreshCw, 
  ZoomIn, ZoomOut, Maximize2, BookOpen, FileText, CheckCheck, Loader2,
  Bookmark, Edit3, Monitor, Grid, Compass, Box, X, Calendar,
  Play, Pause, Volume2, VolumeX, FastForward, PlayCircle,
  Video, Film, Share2, Smartphone
} from 'lucide-react';
import { AgendaConfig, DayData } from '../../../types';
import { getMonthName } from '../../../core/backend/calendar';
import {
  encodeMockupVideoMP4,
  SpreadStep,
  VideoFormatPreset,
  VideoPagePreset
} from '../utils/mockupVideoGenerator';

export interface MockupStudioProps {
  config: AgendaConfig;
  PAGE_WIDTH_MM: number;
  PAGE_HEIGHT_MM: number;
  actualTotalPagesCount: number;
  renderPrintLayout: (limitStart?: number, limitEnd?: number, maxRenderCount?: number, countOnly?: boolean, hidePageNumbers?: boolean) => any[];
  currentPageInEditor?: number;
  onClose?: () => void;
  generatedData?: DayData[];
}

export type MockupMode = 'spread' | 'single';
export type MockupPerspective = 'flatlay' | 'isometric' | 'tilted' | 'closeup';
export type WireoFinish = 'gold' | 'silver' | 'rosegold' | 'black' | 'white' | 'bronze' | 'none';
export type MockupBackground = 'studio-white' | 'marble' | 'wood' | 'pastel' | 'dark' | 'transparent';

export interface FlipState {
  direction: 'next' | 'prev';
  leafFrontPage: number;
  leafBackPage: number;
  underLeftPage: number;
  underRightPage: number;
  targetLeft: number;
  targetRight: number;
  targetSingle?: number;
  leafSinglePage?: number;
  underSinglePage?: number;
}

export const MockupStudio: React.FC<MockupStudioProps> = ({
  config,
  PAGE_WIDTH_MM,
  PAGE_HEIGHT_MM,
  actualTotalPagesCount,
  renderPrintLayout,
  currentPageInEditor = 1,
  onClose,
  generatedData = []
}) => {
  // --- STATE ---
  // Page selection
  const [mockupMode, setMockupMode] = useState<MockupMode>('spread');
  const [leftPageNum, setLeftPageNum] = useState<number>(() => {
    const total = Math.max(1, actualTotalPagesCount || 1);
    if (currentPageInEditor <= 1) return 0; // 0 = Contracapa / Guarda (Page 1 is on the right)
    const clamped = Math.min(total, currentPageInEditor);
    return clamped % 2 === 0 ? clamped : clamped - 1;
  });
  const [rightPageNum, setRightPageNum] = useState<number>(() => {
    const total = Math.max(1, actualTotalPagesCount || 1);
    if (currentPageInEditor <= 1) return 1; // Page 1 is always on the right (Frente / Ímpar)
    const clamped = Math.min(total, currentPageInEditor);
    if (clamped % 2 !== 0) return clamped;
    return clamped + 1 <= total ? clamped + 1 : 0;
  });
  const [singlePageNum, setSinglePageNum] = useState<number>(() => Math.max(1, currentPageInEditor));

  // --- INTERACTIVE PAGE TURNING / FLIP MOTION STATE ---
  const [flipState, setFlipState] = useState<FlipState | null>(null);
  const [flipSpeed, setFlipSpeed] = useState<'fast' | 'normal' | 'smooth'>('normal');
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const nodeCacheRef = useRef<Map<number, React.ReactNode>>(new Map());

  // 3D & Styling options
  const [perspective, setPerspective] = useState<MockupPerspective>('isometric');
  const [wireoFinish, setWireoFinish] = useState<WireoFinish>('gold');
  const [backgroundType, setBackgroundType] = useState<MockupBackground>('studio-white');
  const [showRibbon, setShowRibbon] = useState<boolean>(true);
  const [ribbonColor, setRibbonColor] = useState<string>('#c59b27'); // Gold ribbon
  const [showPen, setShowPen] = useState<boolean>(true);
  const [showPaperclip, setShowPaperclip] = useState<boolean>(false);
  const [coverThickness, setCoverThickness] = useState<'thin' | 'medium' | 'thick'>('medium');
  const [shadowIntensity, setShadowIntensity] = useState<'soft' | 'medium' | 'hard'>('medium');
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Fine-tuning 3D Angles
  const [customAngleX, setCustomAngleX] = useState<number>(22);
  const [customAngleY, setCustomAngleY] = useState<number>(-12);
  const [customAngleZ, setCustomAngleZ] = useState<number>(6);

  // UI state
  const [activeSettingsTab, setActiveSettingsTab] = useState<'pages' | '3d' | 'wireo' | 'environment' | 'props'>('pages');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // --- MP4 VIDEO EXPORT STATE (FOR WHATSAPP) ---
  const [videoModalOpen, setVideoModalOpen] = useState<boolean>(false);
  const [videoPagePreset, setVideoPagePreset] = useState<VideoPagePreset>('smart_showcase');
  const [videoFormatPreset, setVideoFormatPreset] = useState<VideoFormatPreset>('whatsapp_landscape');
  const [videoSpeedPreset, setVideoSpeedPreset] = useState<'fast' | 'normal' | 'smooth'>('normal');
  const [videoFromCurrentCount, setVideoFromCurrentCount] = useState<number>(6);
  const [videoRangeStart, setVideoRangeStart] = useState<number>(1);
  const [videoRangeEnd, setVideoRangeEnd] = useState<number>(() => Math.min(actualTotalPagesCount || 12, 12));
  const [videoShowPageBadge, setVideoShowPageBadge] = useState<boolean>(true);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState<boolean>(false);
  const [videoProgress, setVideoProgress] = useState<number>(0);
  const [videoStatusText, setVideoStatusText] = useState<string>('');
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [generatedVideoBlob, setGeneratedVideoBlob] = useState<Blob | null>(null);
  const [generatedVideoFilename, setGeneratedVideoFilename] = useState<string>('');
  const [stagingPageNum, setStagingPageNum] = useState<number | null>(null);

  const mockupSurfaceRef = useRef<HTMLDivElement | null>(null);
  const videoStagingPageRef = useRef<HTMLDivElement | null>(null);
  const pageCanvasCacheRef = useRef<Map<number, HTMLCanvasElement>>(new Map());
  const cancelVideoRef = useRef<boolean>(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Safe total pages count
  const totalPages = Math.max(1, actualTotalPagesCount || 1);

  // Map exact starting pages for all sections and months
  const sectionPageMap = useMemo(() => {
    const totalMonths = config.durationMonths || 12;
    const startM = config.startMonth ?? 0;
    const baseYear = config.year || new Date().getFullYear();

    interface MonthInfo {
      index: number;
      monthIndex: number;
      year: number;
      name: string;
      pageNum: number;
    }

    const result: {
      cover: number;
      firstDaily: number;
      months: MonthInfo[];
      pageToMonthMap: Map<number, number>;
    } = {
      cover: 1,
      firstDaily: Math.max(1, (config.introPages?.length || 0) + 1),
      months: [],
      pageToMonthMap: new Map()
    };

    try {
      // Execute count-only layout generation to get exact 1-to-1 page metadata without rendering overhead
      const countPages = renderPrintLayout(undefined, undefined, undefined, true);
      if (Array.isArray(countPages) && countPages.length > 0) {
        let foundFirstDaily = false;
        
        interface ClusterData {
          monthIndex: number;
          dividerPage?: number;
          monthlyIntroPage?: number;
          dailyPage?: number;
          firstPage?: number;
        }

        const clusters: ClusterData[] = [];
        let currentCluster: ClusterData | null = null;
        let lastMonthIndex: number | null = null;

        countPages.forEach((p: any, idx: number) => {
          const pNum = Number(p?.props?.['data-page'] ?? idx + 1);
          const pMonthRaw = p?.props?.['data-month'];
          const pType = String(p?.props?.['data-type'] || 'daily');

          if (!foundFirstDaily && pType === 'daily') {
            result.firstDaily = pNum;
            foundFirstDaily = true;
          }

          if (pMonthRaw !== undefined && pMonthRaw !== null) {
            const pMonth = Number(pMonthRaw);
            result.pageToMonthMap.set(pNum, pMonth);

            if (lastMonthIndex === null || pMonth !== lastMonthIndex) {
              currentCluster = {
                monthIndex: pMonth,
                firstPage: pNum
              };
              clusters.push(currentCluster);
              lastMonthIndex = pMonth;
            }

            if (currentCluster) {
              if (pType === 'divider' && !currentCluster.dividerPage) {
                currentCluster.dividerPage = pNum;
              } else if (pType === 'monthly_intro' && !currentCluster.monthlyIntroPage) {
                currentCluster.monthlyIntroPage = pNum;
              } else if (pType === 'daily' && !currentCluster.dailyPage) {
                currentCluster.dailyPage = pNum;
              }
            }
          }
        });

        // Build list of months based on config.durationMonths
        for (let i = 0; i < totalMonths; i++) {
          const mIdx = (startM + i) % 12;
          const yearOffset = Math.floor((startM + i) / 12);
          const mYear = baseYear + yearOffset;
          const mName = getMonthName(mIdx);

          const cluster = clusters[i] || clusters.find(c => c.monthIndex === mIdx);
          let target = cluster?.dividerPage ?? cluster?.monthlyIntroPage ?? cluster?.dailyPage ?? cluster?.firstPage;

          if (!target) {
            const firstDay = generatedData.find(d => d.month === mIdx && d.year === mYear);
            if (firstDay) {
              const dayIdx = generatedData.indexOf(firstDay);
              target = Math.min(totalPages, Math.max(1, (config.introPages?.length || 0) + dayIdx + 1));
            } else {
              target = Math.min(totalPages, Math.max(1, (config.introPages?.length || 0) + i * 30 + 1));
            }
          }

          result.months.push({
            index: i,
            monthIndex: mIdx,
            year: mYear,
            name: mName,
            pageNum: Math.min(totalPages, Math.max(1, target))
          });
        }

        return result;
      }
    } catch (e) {
      console.warn('Erro ao processar mapa de seções do mockup:', e);
    }

    // Mathematical fallback if countPages wasn't available
    for (let i = 0; i < totalMonths; i++) {
      const mIdx = (startM + i) % 12;
      const yearOffset = Math.floor((startM + i) / 12);
      const mYear = baseYear + yearOffset;
      const mName = getMonthName(mIdx);
      const firstDay = generatedData.find(d => d.month === mIdx && d.year === mYear);
      let target = 1;
      if (firstDay) {
        const dayIdx = generatedData.indexOf(firstDay);
        target = Math.min(totalPages, Math.max(1, (config.introPages?.length || 0) + dayIdx + 1));
      } else {
        target = Math.min(totalPages, Math.max(1, (config.introPages?.length || 0) + i * 30 + 1));
      }
      result.months.push({
        index: i,
        monthIndex: mIdx,
        year: mYear,
        name: mName,
        pageNum: target
      });
    }

    return result;
  }, [renderPrintLayout, config, generatedData, totalPages]);

  // Detect currently viewed month for visual active state
  const currentActiveMonth = useMemo(() => {
    const currentPage =
      mockupMode === 'spread'
        ? rightPageNum > 0
          ? rightPageNum
          : leftPageNum
        : singlePageNum;
    if (sectionPageMap.pageToMonthMap.has(currentPage)) {
      return sectionPageMap.pageToMonthMap.get(currentPage);
    }
    if (mockupMode === 'spread' && leftPageNum > 0 && sectionPageMap.pageToMonthMap.has(leftPageNum)) {
      return sectionPageMap.pageToMonthMap.get(leftPageNum);
    }
    for (let i = sectionPageMap.months.length - 1; i >= 0; i--) {
      if (currentPage >= sectionPageMap.months[i].pageNum) {
        return sectionPageMap.months[i].monthIndex;
      }
    }
    return undefined;
  }, [mockupMode, leftPageNum, rightPageNum, singlePageNum, sectionPageMap]);

  // Compute physical book spread (Left = Even / Verso or 0 Contracapa, Right = Odd / Frente)
  const getSpreadForPage = useCallback(
    (targetPage: number, maxPages: number = totalPages): { left: number; right: number } => {
      const safeTotal = Math.max(1, maxPages);
      if (targetPage <= 1) {
        return { left: 0, right: 1 };
      }
      const clamped = Math.min(safeTotal, targetPage);
      if (clamped % 2 === 0) {
        return {
          left: clamped,
          right: clamped + 1 <= safeTotal ? clamped + 1 : 0
        };
      }
      return {
        left: clamped - 1,
        right: clamped
      };
    },
    [totalPages]
  );

  // Jump to specific section page cleanly
  const jumpToPage = useCallback((targetPage: number, label?: string) => {
    setIsAutoPlaying(false);
    setFlipState(null);

    const safePage = Math.min(totalPages, Math.max(1, targetPage));

    if (mockupMode === 'single') {
      setSinglePageNum(safePage);
    } else {
      const spread = getSpreadForPage(safePage, totalPages);
      setLeftPageNum(spread.left);
      setRightPageNum(spread.right);
    }

    if (label) {
      showToast(`✨ ${label} (pág. ${safePage}) carregada!`);
    } else {
      showToast(`Página ${safePage} carregada!`);
    }
  }, [mockupMode, totalPages, getSpreadForPage]);

  // Ensure valid page bounds
  useEffect(() => {
    if (leftPageNum > totalPages) setLeftPageNum(totalPages % 2 === 0 ? totalPages : Math.max(0, totalPages - 1));
    if (rightPageNum > totalPages) setRightPageNum(totalPages % 2 !== 0 ? totalPages : 0);
    if (singlePageNum > totalPages) setSinglePageNum(totalPages);
  }, [totalPages, leftPageNum, rightPageNum, singlePageNum]);

  // Flip durations in ms
  const flipDuration = flipSpeed === 'fast' ? 520 : flipSpeed === 'smooth' ? 950 : 720;
  const autoPlayInterval = flipSpeed === 'fast' ? 1400 : flipSpeed === 'smooth' ? 2600 : 2000;

  // Clean endpaper / contracapa node when pageNum === 0 (facing Page 1 or after an even final page)
  const renderEndpaperNode = useCallback(() => (
    <div
      className="w-full h-full bg-[#fafaf9] relative overflow-hidden flex items-center justify-center select-none"
      style={{ width: `${PAGE_WIDTH_MM}mm`, height: `${PAGE_HEIGHT_MM}mm` }}
    >
      <div
        className="pointer-events-none border border-stone-200/70 rounded-sm"
        style={{
          width: 'calc(100% - 24mm)',
          height: 'calc(100% - 24mm)'
        }}
      />
    </div>
  ), [PAGE_WIDTH_MM, PAGE_HEIGHT_MM]);

  // Render & cache node helper
  const getPageNode = useCallback((pageNum: number) => {
    if (pageNum <= 0 || pageNum > totalPages) return renderEndpaperNode();
    if (nodeCacheRef.current.has(pageNum)) {
      return nodeCacheRef.current.get(pageNum);
    }
    try {
      const nodes = renderPrintLayout(pageNum, pageNum, undefined, false, true);
      const node = nodes && nodes.length > 0 ? nodes[0] : null;
      if (node) {
        nodeCacheRef.current.set(pageNum, node);
      }
      return node;
    } catch (e) {
      console.warn('Erro ao renderizar página no mockup:', pageNum, e);
      return null;
    }
  }, [renderPrintLayout, totalPages, renderEndpaperNode]);

  // Invalidate node cache when config changes
  useEffect(() => {
    nodeCacheRef.current.clear();
    pageCanvasCacheRef.current.clear();
  }, [config]);

  // Synthesize realistic subtle paper rustle / page-flip audio
  const playPageFlipSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const duration = 0.22;
      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.35;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(450, ctx.currentTime + duration);
      filter.Q.setValueAtTime(1.5, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start();
      noise.stop(ctx.currentTime + duration);
    } catch (_) {}
  }, [soundEnabled]);

  // Page Flip Forward Handler with 3D Motion
  const triggerFlipNext = useCallback(() => {
    if (flipState) return;

    if (mockupMode === 'spread') {
      if (rightPageNum <= 0 || rightPageNum >= totalPages) {
        setIsAutoPlaying(false);
        showToast('Você chegou ao final da agenda!');
        return;
      }

      const targetLeft = rightPageNum + 1;
      const targetRight = rightPageNum + 2 <= totalPages ? rightPageNum + 2 : 0;
      const leafFrontPage = rightPageNum;
      const leafBackPage = targetLeft;
      const underLeftPage = leftPageNum;
      const underRightPage = targetRight;

      const nextState: FlipState = {
        direction: 'next',
        leafFrontPage,
        leafBackPage,
        underLeftPage,
        underRightPage,
        targetLeft,
        targetRight
      };

      setFlipState(nextState);
      playPageFlipSound();

      setTimeout(() => {
        setLeftPageNum(targetLeft);
        setRightPageNum(targetRight);
        setFlipState(null);
      }, flipDuration);
    } else {
      if (singlePageNum >= totalPages) {
        setIsAutoPlaying(false);
        showToast('Você chegou ao final da agenda!');
        return;
      }

      const targetSingle = singlePageNum + 1;
      const nextState: FlipState = {
        direction: 'next',
        leafFrontPage: singlePageNum,
        leafBackPage: targetSingle,
        underLeftPage: 1,
        underRightPage: 1,
        targetLeft: 1,
        targetRight: 1,
        leafSinglePage: singlePageNum,
        targetSingle
      };

      setFlipState(nextState);
      playPageFlipSound();

      setTimeout(() => {
        setSinglePageNum(targetSingle);
        setFlipState(null);
      }, flipDuration);
    }
  }, [flipState, mockupMode, rightPageNum, leftPageNum, singlePageNum, totalPages, flipDuration, playPageFlipSound]);

  // Page Flip Backward Handler with 3D Motion
  const triggerFlipPrev = useCallback(() => {
    if (flipState) return;

    if (mockupMode === 'spread') {
      if (leftPageNum <= 0) {
        showToast('Você já está no início da agenda!');
        return;
      }

      const targetLeft = leftPageNum - 2 >= 2 ? leftPageNum - 2 : 0;
      const targetRight = Math.max(1, leftPageNum - 1);
      const leafBackPage = leftPageNum;
      const leafFrontPage = targetRight;
      const underLeftPage = targetLeft;
      const underRightPage = rightPageNum;

      const prevState: FlipState = {
        direction: 'prev',
        leafFrontPage,
        leafBackPage,
        underLeftPage,
        underRightPage,
        targetLeft,
        targetRight
      };

      setFlipState(prevState);
      playPageFlipSound();

      setTimeout(() => {
        setLeftPageNum(targetLeft);
        setRightPageNum(targetRight);
        setFlipState(null);
      }, flipDuration);
    } else {
      if (singlePageNum <= 1) {
        showToast('Você já está na primeira página!');
        return;
      }

      const targetSingle = singlePageNum - 1;
      const prevState: FlipState = {
        direction: 'prev',
        leafFrontPage: targetSingle,
        leafBackPage: singlePageNum,
        underLeftPage: 1,
        underRightPage: 1,
        targetLeft: 1,
        targetRight: 1,
        leafSinglePage: singlePageNum,
        underSinglePage: singlePageNum,
        targetSingle
      };

      setFlipState(prevState);
      playPageFlipSound();

      setTimeout(() => {
        setSinglePageNum(targetSingle);
        setFlipState(null);
      }, flipDuration);
    }
  }, [flipState, mockupMode, leftPageNum, rightPageNum, singlePageNum, flipDuration, playPageFlipSound]);

  // Auto-play page flipping continuous showcase
  useEffect(() => {
    if (!isAutoPlaying) return;

    const timer = setInterval(() => {
      if (mockupMode === 'spread') {
        if (rightPageNum <= 0 || rightPageNum >= totalPages) {
          setIsAutoPlaying(false);
          showToast('Folheamento completo! Fim da agenda.');
          return;
        }
      } else {
        if (singlePageNum >= totalPages) {
          setIsAutoPlaying(false);
          showToast('Folheamento completo! Fim da agenda.');
          return;
        }
      }
      triggerFlipNext();
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [isAutoPlaying, autoPlayInterval, mockupMode, rightPageNum, singlePageNum, totalPages, triggerFlipNext]);

  // Keyboard navigation: Left/Right arrows to flip, Space to toggle auto-play
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName || '')) {
        return;
      }
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        triggerFlipNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        triggerFlipPrev();
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        setIsAutoPlaying(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [triggerFlipNext, triggerFlipPrev]);

  const handleUseCurrentEditorPage = () => {
    if (mockupMode === 'single') {
      setSinglePageNum(currentPageInEditor);
    } else {
      const spread = getSpreadForPage(currentPageInEditor, totalPages);
      setLeftPageNum(spread.left);
      setRightPageNum(spread.right);
    }
    showToast(`Página ${currentPageInEditor} carregada no mockup!`);
  };

  // Preset Perspectives Sync
  useEffect(() => {
    if (perspective === 'flatlay') {
      setCustomAngleX(0);
      setCustomAngleY(0);
      setCustomAngleZ(0);
    } else if (perspective === 'isometric') {
      setCustomAngleX(22);
      setCustomAngleY(-12);
      setCustomAngleZ(6);
    } else if (perspective === 'tilted') {
      setCustomAngleX(32);
      setCustomAngleY(0);
      setCustomAngleZ(0);
    } else if (perspective === 'closeup') {
      setCustomAngleX(15);
      setCustomAngleY(-6);
      setCustomAngleZ(3);
    }
  }, [perspective]);

  // Render nodes for selected pages (without page numbers for a clean mockup)
  const leftPageNode = useMemo(() => {
    if (leftPageNum <= 0 || leftPageNum > totalPages) {
      return renderEndpaperNode();
    }
    try {
      const nodes = renderPrintLayout(leftPageNum, leftPageNum, undefined, false, true);
      return nodes && nodes.length > 0 ? nodes[0] : null;
    } catch (e) {
      console.warn('Erro ao renderizar página esquerda do mockup:', e);
      return null;
    }
  }, [renderPrintLayout, leftPageNum, totalPages, renderEndpaperNode]);

  const rightPageNode = useMemo(() => {
    if (rightPageNum <= 0 || rightPageNum > totalPages) {
      return renderEndpaperNode();
    }
    try {
      const nodes = renderPrintLayout(rightPageNum, rightPageNum, undefined, false, true);
      return nodes && nodes.length > 0 ? nodes[0] : null;
    } catch (e) {
      console.warn('Erro ao renderizar página direita do mockup:', e);
      return null;
    }
  }, [renderPrintLayout, rightPageNum, totalPages, renderEndpaperNode]);

  const singlePageNode = useMemo(() => {
    try {
      const nodes = renderPrintLayout(singlePageNum, singlePageNum, undefined, false, true);
      return nodes && nodes.length > 0 ? nodes[0] : null;
    } catch (e) {
      console.warn('Erro ao renderizar página única do mockup:', e);
      return null;
    }
  }, [renderPrintLayout, singlePageNum]);

  // Dimension helpers for page scaling
  const BASE_PAGE_W_PX = PAGE_WIDTH_MM * 3.78; // 96dpi reference
  const BASE_PAGE_H_PX = PAGE_HEIGHT_MM * 3.78;
  const DISPLAY_PAGE_W = 310; // Target width in pixels inside mockup
  const DISPLAY_PAGE_H = DISPLAY_PAGE_W * (PAGE_HEIGHT_MM / PAGE_WIDTH_MM);
  const SCALE_FACTOR = DISPLAY_PAGE_W / BASE_PAGE_W_PX;

  // Wire-o metallic style configuration with true wire wireframe colors and realistic gradients
  const wireoStyles = useMemo(() => {
    switch (wireoFinish) {
      case 'gold':
        return {
          wireColor: '#d4af37',
          wireHighlight: '#fff9d6',
          wireShadow: '#785208',
          ringGradient: 'linear-gradient(135deg, #a37920 0%, #fff0a5 35%, #d4af37 60%, #fff8d6 85%, #8f6716 100%)',
          specularGlow: '#fffbe6',
          shadow: 'rgba(92, 64, 11, 0.45)',
          holeBg: '#1e1911'
        };
      case 'silver':
        return {
          wireColor: '#cbd5e1',
          wireHighlight: '#ffffff',
          wireShadow: '#334155',
          ringGradient: 'linear-gradient(135deg, #64748b 0%, #f8fafc 30%, #94a3b8 55%, #f1f5f9 80%, #475569 100%)',
          specularGlow: '#ffffff',
          shadow: 'rgba(30, 41, 59, 0.45)',
          holeBg: '#0f172a'
        };
      case 'rosegold':
        return {
          wireColor: '#d98894',
          wireHighlight: '#fff1f2',
          wireShadow: '#742a36',
          ringGradient: 'linear-gradient(135deg, #a75d67 0%, #ffe4e6 35%, #d98894 60%, #fff1f2 85%, #8a414b 100%)',
          specularGlow: '#fff1f2',
          shadow: 'rgba(112, 45, 56, 0.45)',
          holeBg: '#2a1216'
        };
      case 'black':
        return {
          wireColor: '#27272a',
          wireHighlight: '#71717a',
          wireShadow: '#09090b',
          ringGradient: 'linear-gradient(135deg, #18181b 0%, #52525b 35%, #27272a 60%, #71717a 85%, #09090b 100%)',
          specularGlow: '#a1a1aa',
          shadow: 'rgba(0, 0, 0, 0.6)',
          holeBg: '#000000'
        };
      case 'white':
        return {
          wireColor: '#f1f5f9',
          wireHighlight: '#ffffff',
          wireShadow: '#94a3b8',
          ringGradient: 'linear-gradient(135deg, #cbd5e1 0%, #ffffff 40%, #e2e8f0 70%, #ffffff 90%, #94a3b8 100%)',
          specularGlow: '#ffffff',
          shadow: 'rgba(100, 116, 139, 0.35)',
          holeBg: '#334155'
        };
      case 'bronze':
        return {
          wireColor: '#b87333',
          wireHighlight: '#ffedd5',
          wireShadow: '#451a03',
          ringGradient: 'linear-gradient(135deg, #603813 0%, #dfa579 35%, #9b5a23 60%, #edd1b0 85%, #462509 100%)',
          specularGlow: '#fed7aa',
          shadow: 'rgba(67, 36, 10, 0.5)',
          holeBg: '#1f1004'
        };
      default:
        return null;
    }
  }, [wireoFinish]);

  // Wire shadow stroke color and opacity based on shadow intensity
  const wireShadowStroke = useMemo(() => {
    switch (shadowIntensity) {
      case 'soft':
        return 'rgba(0, 0, 0, 0.12)';
      case 'hard':
        return 'rgba(0, 0, 0, 0.28)';
      case 'medium':
      default:
        return 'rgba(0, 0, 0, 0.18)';
    }
  }, [shadowIntensity]);

  // Environment Background style
  const environmentStyle = useMemo<React.CSSProperties>(() => {
    switch (backgroundType) {
      case 'studio-white':
        return {
          background: 'radial-gradient(ellipse at 50% 35%, #f8fafc 0%, #e2e8f0 55%, #cbd5e1 100%)'
        };
      case 'marble':
        return {
          backgroundColor: '#f1f5f9',
          backgroundImage: `
            radial-gradient(at 10% 20%, rgba(203, 213, 225, 0.5) 0px, transparent 50%),
            radial-gradient(at 80% 0%, rgba(226, 232, 240, 0.6) 0px, transparent 50%),
            radial-gradient(at 0% 50%, rgba(241, 245, 249, 0.7) 0px, transparent 50%),
            radial-gradient(at 80% 80%, rgba(203, 213, 225, 0.5) 0px, transparent 50%)
          `
        };
      case 'wood':
        return {
          background: 'radial-gradient(circle at center, #d8b48f 0%, #b88655 60%, #8c5828 100%)',
          boxShadow: 'inset 0 0 100px rgba(0,0,0,0.3)'
        };
      case 'pastel':
        return {
          background: 'radial-gradient(circle at 40% 40%, #fef3c7 0%, #fce7f3 50%, #e0e7ff 100%)'
        };
      case 'dark':
        return {
          background: 'radial-gradient(circle at 50% 40%, #1e293b 0%, #0f172a 60%, #020617 100%)'
        };
      case 'transparent':
        return {
          backgroundColor: 'transparent',
          backgroundImage: 'linear-gradient(45deg, #e2e8f0 25%, transparent 25%), linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e2e8f0 75%), linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)',
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
        };
      default:
        return { background: '#f8fafc' };
    }
  }, [backgroundType]);

  // Dynamic shadows depending on intensity
  const shadowClasses = useMemo(() => {
    switch (shadowIntensity) {
      case 'soft':
        return 'shadow-[0_20px_45px_-10px_rgba(0,0,0,0.22)]';
      case 'hard':
        return 'shadow-[0_35px_80px_-15px_rgba(0,0,0,0.55)]';
      case 'medium':
      default:
        return 'shadow-[0_28px_60px_-12px_rgba(0,0,0,0.38)]';
    }
  }, [shadowIntensity]);

  // Stacked pages thickness borders
  const stackLayers = useMemo(() => {
    const count = coverThickness === 'thin' ? 2 : coverThickness === 'medium' ? 4 : 6;
    const layers = [];
    for (let i = 1; i <= count; i++) {
      layers.push(
        <div 
          key={`stack-${i}`}
          className="absolute inset-0 rounded-r-lg pointer-events-none bg-stone-100 border border-stone-300/80"
          style={{
            transform: `translate(${i * 1.6}px, ${i * 1.3}px)`,
            zIndex: -i,
            boxShadow: `1px 1px 2px rgba(0,0,0,0.06)`
          }}
        />
      );
    }
    return layers;
  }, [coverThickness]);

  // Wire-o Rings Count based on height (Realistic 2:1 pitch: 18 double-loop wire pairs)
  const wireoRingsCount = 18;

  // Export Mockup as High-Res PNG (Single reliable download handler with multi-layer fallback)
  const handleExportPNG = async () => {
    const surface = mockupSurfaceRef.current;
    if (!surface) return;

    setIsExporting(true);
    showToast('Gerando mockup em alta resolução...');

    try {
      const html2canvasModule = await import('html2canvas');
      const html2canvas = (html2canvasModule as any).default || html2canvasModule;
      
      const isTransparent = backgroundType === 'transparent';
      const canvas = await html2canvas(surface, {
        scale: 2, // 2x crisp HD resolution
        useCORS: true,
        allowTaint: false, // Must be false to prevent canvas tainting SecurityErrors on toBlob/toDataURL
        backgroundColor: isTransparent ? null : undefined,
        logging: false,
        onclone: (clonedDoc: Document) => {
          const clonedSurface = clonedDoc.getElementById('mockup-render-surface');
          if (clonedSurface) {
            clonedSurface.style.transform = 'none';
            clonedSurface.style.animation = 'none';
            clonedSurface.style.transition = 'none';
          }
          clonedDoc.querySelectorAll('.no-print').forEach((el: any) => {
            el.style.display = 'none';
          });
        }
      });

      const filename = mockupMode === 'spread'
        ? `Mockup-Agenda-Paginas-${leftPageNum}-${rightPageNum}.png`
        : `Mockup-Agenda-Pagina-${singlePageNum}.png`;

      // Reliable cross-environment trigger for downloading files
      const triggerFileDownload = (href: string, isBlob: boolean) => {
        const link = document.createElement('a');
        link.style.display = 'none';
        link.setAttribute('href', href);
        link.setAttribute('download', filename);
        link.setAttribute('target', '_self');
        document.body.appendChild(link);
        link.click();
        
        // Defer DOM cleanup and URL revocation so browser download manager has time to complete
        setTimeout(() => {
          try {
            document.body.removeChild(link);
            if (isBlob) {
              URL.revokeObjectURL(href);
            }
          } catch (_) {}
        }, 60000);
      };

      try {
        canvas.toBlob((blob) => {
          if (blob) {
            const blobUrl = URL.createObjectURL(blob);
            triggerFileDownload(blobUrl, true);
            setIsExporting(false);
            showToast('✨ Mockup baixado com sucesso!');
          } else {
            const dataUrl = canvas.toDataURL('image/png');
            triggerFileDownload(dataUrl, false);
            setIsExporting(false);
            showToast('✨ Mockup baixado com sucesso!');
          }
        }, 'image/png');
      } catch (blobErr) {
        console.warn('[Mockup Download] toBlob falhou, usando toDataURL:', blobErr);
        const dataUrl = canvas.toDataURL('image/png');
        triggerFileDownload(dataUrl, false);
        setIsExporting(false);
        showToast('✨ Mockup baixado com sucesso!');
      }
    } catch (err: any) {
      console.error('Erro ao exportar mockup:', err);
      showToast('Ocorreu um erro ao gerar a imagem. Tente novamente ou use o botão Copiar.');
      setIsExporting(false);
    }
  };

  // Copy Mockup to Clipboard
  const handleCopyClipboard = async () => {
    const surface = mockupSurfaceRef.current;
    if (!surface) return;

    setIsExporting(true);
    showToast('Preparando imagem para a área de transferência...');

    try {
      const html2canvasModule = await import('html2canvas');
      const html2canvas = (html2canvasModule as any).default || html2canvasModule;
      
      const isTransparent = backgroundType === 'transparent';
      const canvas = await html2canvas(surface, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: isTransparent ? null : undefined,
        logging: false,
        onclone: (clonedDoc: Document) => {
          const clonedSurface = clonedDoc.getElementById('mockup-render-surface');
          if (clonedSurface) {
            clonedSurface.style.transform = 'none';
            clonedSurface.style.animation = 'none';
            clonedSurface.style.transition = 'none';
          }
          clonedDoc.querySelectorAll('.no-print').forEach((el: any) => {
            el.style.display = 'none';
          });
        }
      });

      canvas.toBlob(async (blob) => {
        if (!blob) {
          showToast('Erro ao processar imagem.');
          setIsExporting(false);
          return;
        }

        try {
          if (navigator.clipboard && (window as any).ClipboardItem) {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob })
            ]);
            showToast('📋 Mockup copiado! Cole direto no WhatsApp, Canva ou Photoshop!');
          } else {
            showToast('Navegador não suporta cópia direta. Use o botão Baixar.');
          }
        } catch (clipErr) {
          showToast('Permissão de clipboard não concedida. Use o botão Baixar.');
        } finally {
          setIsExporting(false);
        }
      }, 'image/png');
    } catch (err) {
      setIsExporting(false);
      showToast('Não foi possível copiar a imagem.');
    }
  };

  // --- MP4 VIDEO EXPORT HELPERS ---
  const getPageLabel = useCallback((pageNum: number): string => {
    const introCount = config.introPages?.length || 0;
    if (pageNum <= introCount) {
      return `Páginas Iniciais`;
    }
    if (sectionPageMap.pageToMonthMap.has(pageNum)) {
      const mIdx = sectionPageMap.pageToMonthMap.get(pageNum)!;
      return getMonthName(mIdx);
    }
    for (let i = sectionPageMap.months.length - 1; i >= 0; i--) {
      if (pageNum >= sectionPageMap.months[i].pageNum) {
        return sectionPageMap.months[i].name;
      }
    }
    return `Miolo da Agenda`;
  }, [config.introPages, sectionPageMap]);

  const buildVideoSteps = useCallback((): SpreadStep[] => {
    const steps: SpreadStep[] = [];
    const seenKeys = new Set<string>();

    const addStep = (rawPage: number, customLabel?: string) => {
      const safeSingle = Math.max(1, Math.min(totalPages, rawPage));
      const spread = getSpreadForPage(safeSingle, totalPages);
      const safeLeft = spread.left;
      const safeRight = spread.right;
      const labelPage = safeRight > 0 ? safeRight : safeLeft > 0 ? safeLeft : safeSingle;
      const key = mockupMode === 'spread' ? `${safeLeft}-${safeRight}` : `${safeSingle}`;
      if (seenKeys.has(key)) return;
      seenKeys.add(key);
      steps.push({
        leftPage: safeLeft,
        rightPage: safeRight,
        singlePage: safeSingle,
        label: customLabel || getPageLabel(labelPage)
      });
    };

    if (videoPagePreset === 'smart_showcase') {
      // 1. Cover / Intro pages (Page 1 on right, then Page 2 & 3 if multiple intro pages)
      addStep(1, 'Páginas Iniciais');
      const introCount = config.introPages?.length || 0;
      if (introCount >= 2) {
        addStep(2, 'Calendário & Dados');
      }
      if (introCount >= 4) {
        addStep(4, 'Páginas Iniciais');
      }
      // 2. First Daily Page
      if (sectionPageMap.firstDaily > 1) {
        addStep(sectionPageMap.firstDaily, 'Início do Miolo');
      }
      // 3. Sample up to 5 representative months across the year
      const months = sectionPageMap.months;
      if (months.length > 0) {
        const sampleIndices = Array.from(
          new Set([
            0,
            Math.floor((months.length - 1) * 0.25),
            Math.floor((months.length - 1) * 0.5),
            Math.floor((months.length - 1) * 0.75),
            months.length - 1
          ])
        );
        sampleIndices.forEach((idx) => {
          const m = months[idx];
          if (m) addStep(m.pageNum, m.name);
        });
      } else {
        const stepSize = mockupMode === 'spread' ? 2 : 1;
        for (let i = 1; i <= Math.min(totalPages, 12); i += stepSize) {
          addStep(i);
        }
      }
    } else if (videoPagePreset === 'from_current') {
      const startPage = mockupMode === 'spread' ? (rightPageNum > 0 ? rightPageNum : leftPageNum) : singlePageNum;
      const stepIncrement = mockupMode === 'spread' ? 2 : 1;
      const maxSteps = Math.max(2, Math.min(18, videoFromCurrentCount));
      for (let i = 0; i < maxSteps; i++) {
        const p = startPage + i * stepIncrement;
        if (p > totalPages) break;
        addStep(p);
      }
    } else if (videoPagePreset === 'all_months') {
      addStep(1, 'Páginas Iniciais');
      const introCount = config.introPages?.length || 0;
      if (introCount >= 2) {
        addStep(2, 'Calendário Anual');
      }
      sectionPageMap.months.forEach((m) => {
        addStep(m.pageNum, m.name);
      });
    } else if (videoPagePreset === 'custom_range') {
      const start = Math.max(1, Math.min(videoRangeStart, videoRangeEnd));
      const end = Math.min(totalPages, Math.max(videoRangeStart, videoRangeEnd));
      const stepIncrement = mockupMode === 'spread' ? 2 : 1;
      let count = 0;
      for (let p = start; p <= end && count < 20; p += stepIncrement) {
        addStep(p);
        count++;
      }
    }

    // Ensure at least 2 steps so there is at least 1 page flip animation
    if (steps.length === 1 && totalPages > 1) {
      const currentAnchor = mockupMode === 'spread' ? (steps[0].rightPage || steps[0].leftPage) : steps[0].singlePage;
      const nextP = Math.min(totalPages, currentAnchor + (mockupMode === 'spread' ? 2 : 1));
      if (nextP !== currentAnchor) {
        addStep(nextP);
      }
    }

    return steps;
  }, [
    videoPagePreset,
    totalPages,
    mockupMode,
    config.introPages,
    sectionPageMap,
    leftPageNum,
    rightPageNum,
    singlePageNum,
    videoFromCurrentCount,
    videoRangeStart,
    videoRangeEnd,
    getPageLabel,
    getSpreadForPage
  ]);

  const previewStepsCount = useMemo(() => buildVideoSteps().length, [buildVideoSteps]);

  const triggerVideoFileDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.style.display = 'none';
    link.href = url;
    link.download = filename;
    link.target = '_self';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      try {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (_) {}
    }, 60000);
  };

  const handleGenerateVideoMP4 = async () => {
    if (isGeneratingVideo) return;
    cancelVideoRef.current = false;
    setIsGeneratingVideo(true);
    setVideoProgress(2);
    setVideoStatusText('Preparando roteiro de páginas...');

    try {
      const steps = buildVideoSteps();
      const uniquePageNums = new Set<number>();
      steps.forEach((s) => {
        if (mockupMode === 'spread') {
          if (s.leftPage > 0 && s.leftPage <= totalPages) uniquePageNums.add(s.leftPage);
          if (s.rightPage > 0 && s.rightPage <= totalPages) uniquePageNums.add(s.rightPage);
        } else {
          if (s.singlePage > 0 && s.singlePage <= totalPages) uniquePageNums.add(s.singlePage);
        }
      });

      const pageList = Array.from(uniquePageNums);
      const html2canvasModule = await import('html2canvas');
      const html2canvas = (html2canvasModule as any).default || html2canvasModule;

      // 1. Capture unique page textures into offscreen canvases
      for (let i = 0; i < pageList.length; i++) {
        if (cancelVideoRef.current) throw new Error('CANCELLED');
        const pNum = pageList[i];
        const pct = Math.round(5 + ((i + 1) / pageList.length) * 28);
        setVideoProgress(pct);
        setVideoStatusText(`Capturando página ${pNum} (${i + 1} de ${pageList.length})...`);

        if (!pageCanvasCacheRef.current.has(pNum)) {
          setStagingPageNum(pNum);
          // Wait for React render + layout paint
          await new Promise<void>((resolve) => {
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                setTimeout(resolve, 45);
              });
            });
          });

          const stagingEl = videoStagingPageRef.current;
          if (stagingEl) {
            const pageCanvas = await html2canvas(stagingEl, {
              scale: 1.5,
              useCORS: true,
              allowTaint: false,
              backgroundColor: '#ffffff',
              logging: false
            });
            pageCanvasCacheRef.current.set(pNum, pageCanvas);
          }
        }
      }

      setStagingPageNum(null);

      // 2. Determine resolution from preset
      let targetW = 1280;
      let targetH = 720;
      if (videoFormatPreset === 'whatsapp_square') {
        targetW = 1080;
        targetH = 1080;
      } else if (videoFormatPreset === 'whatsapp_vertical') {
        targetW = 720;
        targetH = 1280;
      }

      // 3. Determine timing from speed preset
      const holdDurationMs =
        videoSpeedPreset === 'fast' ? 650 : videoSpeedPreset === 'smooth' ? 1250 : 900;
      const flipDurationMs =
        videoSpeedPreset === 'fast' ? 550 : videoSpeedPreset === 'smooth' ? 1050 : 780;

      // 4. Encode 3D page-turning animation to MP4
      const result = await encodeMockupVideoMP4({
        steps,
        renderOptions: {
          width: targetW,
          height: targetH,
          pageAspect: PAGE_HEIGHT_MM / PAGE_WIDTH_MM,
          mockupMode,
          perspective,
          customAngleX,
          customAngleY,
          customAngleZ,
          wireoFinish,
          backgroundType,
          showRibbon,
          ribbonColor,
          showPen,
          showPaperclip,
          coverThickness,
          shadowIntensity,
          showPageBadge: videoShowPageBadge
        },
        pageTextures: pageCanvasCacheRef.current,
        holdDurationMs,
        flipDurationMs,
        fps: 30,
        onProgress: (pct, text) => {
          setVideoProgress(pct);
          setVideoStatusText(text);
        },
        shouldCancel: () => cancelVideoRef.current
      });

      if (generatedVideoUrl) {
        try { URL.revokeObjectURL(generatedVideoUrl); } catch (_) {}
      }

      const filename = `Mockup-Agenda-${config.year || new Date().getFullYear()}-WhatsApp.mp4`;
      const previewUrl = URL.createObjectURL(result.blob);
      setGeneratedVideoBlob(result.blob);
      setGeneratedVideoUrl(previewUrl);
      setGeneratedVideoFilename(filename);
      setIsGeneratingVideo(false);

      // Auto-download the MP4 file immediately
      triggerVideoFileDownload(result.blob, filename);
      showToast('🎬 Vídeo MP4 gerado e baixado com sucesso! Pronto para enviar no WhatsApp!');
    } catch (err: any) {
      setStagingPageNum(null);
      setIsGeneratingVideo(false);
      if (err?.message === 'CANCELLED') {
        showToast('Geração de vídeo cancelada.');
      } else {
        console.error('Erro ao gerar vídeo MP4 do mockup:', err);
        showToast('Ocorreu um erro ao gerar o vídeo. Tente novamente.');
      }
    }
  };

  const handleShareVideoWhatsApp = async () => {
    if (!generatedVideoBlob) return;
    const filename = generatedVideoFilename || `Mockup-Agenda-${config.year || 2026}.mp4`;

    try {
      const file = new File([generatedVideoBlob], filename, { type: 'video/mp4' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Apresentação da Agenda Personalizada',
          text: 'Olá! Veja o vídeo 3D folheando as páginas da sua agenda personalizada ✨'
        });
        showToast('Compartilhamento aberto!');
        return;
      }
    } catch (shareErr: any) {
      if (shareErr?.name === 'AbortError') return;
    }

    // Desktop fallback: copy message & inform user the MP4 is downloaded and ready to attach
    try {
      await navigator.clipboard.writeText(
        'Olá! Segue o vídeo de apresentação em 3D folheando as páginas da sua agenda personalizada ✨📖'
      );
      showToast('📋 Mensagem copiada! Basta anexar o arquivo MP4 baixado na conversa do WhatsApp.');
    } catch (_) {
      showToast('✨ O arquivo MP4 já foi baixado! Basta arrastá-lo para a conversa do WhatsApp.');
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-100 select-none overflow-hidden font-sans">
      
      {/* 1. TOP BAR */}
      <header className="h-14 px-4 sm:px-6 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 flex items-center justify-between gap-3 shrink-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-md shadow-orange-500/20">
            <Box className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold text-white tracking-tight">Estúdio de Mockup 3D</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Fotorrealista
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Exiba e exporte o layout da sua agenda com acabamentos de papelaria artesanal.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Page Sync */}
          <button
            onClick={handleUseCurrentEditorPage}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-lg transition-all cursor-pointer shadow-xs"
            title="Carregar a página que você está editando agora no canvas"
          >
            <Edit3 className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Página do Editor (pág. {currentPageInEditor})</span>
          </button>

          {/* Copy Image Button */}
          <button
            onClick={handleCopyClipboard}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-all cursor-pointer shadow-xs disabled:opacity-50"
            title="Copiar imagem pronta para colar no Canva ou WhatsApp"
          >
            <Copy className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Copiar</span>
          </button>

          {/* Download Button */}
          <button
            onClick={handleExportPNG}
            disabled={isExporting || isGeneratingVideo}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 rounded-lg shadow-md shadow-orange-600/20 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
          >
            {isExporting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">{isExporting ? 'Processando...' : 'Baixar Imagem HD'}</span>
            <span className="sm:hidden">PNG</span>
          </button>

          {/* Download Video MP4 for WhatsApp Button */}
          <button
            onClick={() => setVideoModalOpen(true)}
            disabled={isExporting || isGeneratingVideo}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-lg shadow-md shadow-emerald-600/25 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            title="Baixar vídeo em MP4 folheando as páginas para enviar no WhatsApp do cliente"
          >
            {isGeneratingVideo ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Video className="w-3.5 h-3.5" />
            )}
            <span>{isGeneratingVideo ? `Vídeo (${videoProgress}%)` : 'Baixar Vídeo MP4'}</span>
          </button>

          {/* Close / Return */}
          {onClose && (
            <button
              onClick={onClose}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white bg-transparent hover:bg-slate-800/80 rounded-lg transition-all ml-1 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Voltar</span>
            </button>
          )}
        </div>
      </header>

      {/* 2. MAIN WORKSPACE (SIDEBAR CONTROLS + 3D VIEWPORT) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        
        {/* LEFT CONTROLS PANEL */}
        <aside className="w-full lg:w-80 xl:w-96 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 overflow-y-auto custom-scrollbar z-20">
          
          {/* TAB SWITCHER */}
          <div className="p-3 border-b border-slate-800 grid grid-cols-5 gap-1 bg-slate-950/40">
            <button
              onClick={() => setActiveSettingsTab('pages')}
              className={`py-2 text-xs font-bold rounded-lg flex flex-col items-center gap-1 transition-all cursor-pointer ${
                activeSettingsTab === 'pages' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span className="text-[10px]">Páginas</span>
            </button>
            <button
              onClick={() => setActiveSettingsTab('3d')}
              className={`py-2 text-xs font-bold rounded-lg flex flex-col items-center gap-1 transition-all cursor-pointer ${
                activeSettingsTab === '3d' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span className="text-[10px]">Ângulo 3D</span>
            </button>
            <button
              onClick={() => setActiveSettingsTab('wireo')}
              className={`py-2 text-xs font-bold rounded-lg flex flex-col items-center gap-1 transition-all cursor-pointer ${
                activeSettingsTab === 'wireo' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span className="text-[10px]">Espiral</span>
            </button>
            <button
              onClick={() => setActiveSettingsTab('environment')}
              className={`py-2 text-xs font-bold rounded-lg flex flex-col items-center gap-1 transition-all cursor-pointer ${
                activeSettingsTab === 'environment' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Palette className="w-4 h-4" />
              <span className="text-[10px]">Cenário</span>
            </button>
            <button
              onClick={() => setActiveSettingsTab('props')}
              className={`py-2 text-xs font-bold rounded-lg flex flex-col items-center gap-1 transition-all cursor-pointer ${
                activeSettingsTab === 'props' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-[10px]">Adornos</span>
            </button>
          </div>

          {/* TAB 1: PÁGINAS (The Core Feature requested by user) */}
          {activeSettingsTab === 'pages' && (
            <div className="p-4 space-y-5">
              {/* Display Mode: Spread vs Single */}
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                  Formato de Apresentação
                </label>
                <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => {
                      const spread = getSpreadForPage(singlePageNum, totalPages);
                      setLeftPageNum(spread.left);
                      setRightPageNum(spread.right);
                      setMockupMode('spread');
                    }}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      mockupMode === 'spread' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Agenda Aberta</span>
                  </button>
                  <button
                    onClick={() => {
                      setSinglePageNum(rightPageNum > 0 ? rightPageNum : Math.max(1, leftPageNum));
                      setMockupMode('single');
                    }}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      mockupMode === 'single' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Página Única</span>
                  </button>
                </div>
              </div>

              {/* Spread Controls: Left & Right Page */}
              {mockupMode === 'spread' ? (
                <div className="space-y-4">
                  {/* Dedicated Interactive Page Flipping Card */}
                  <div className="p-3.5 bg-gradient-to-br from-indigo-950/70 via-slate-900 to-slate-900 rounded-xl border border-indigo-500/40 shadow-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-black text-white uppercase tracking-wider">Folhear Agenda 3D</span>
                      </div>
                      <span className="text-[11px] font-bold text-amber-300 font-mono bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded-full">
                        {leftPageNum === 0
                          ? `Início (Pág. ${rightPageNum})`
                          : rightPageNum === 0
                          ? `Pág. ${leftPageNum} (Fim)`
                          : `${leftPageNum} & ${rightPageNum}`}{' '}
                        / {totalPages}
                      </span>
                    </div>

                    {/* Main Flip Actions */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={triggerFlipPrev}
                        disabled={leftPageNum <= 0 || !!flipState}
                        className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-all border border-slate-700 disabled:opacity-30 cursor-pointer active:scale-95"
                      >
                        <ChevronLeft className="w-4 h-4 text-amber-400" />
                        <span>Folhear Anterior</span>
                      </button>

                      <button
                        onClick={triggerFlipNext}
                        disabled={rightPageNum <= 0 || rightPageNum >= totalPages || !!flipState}
                        className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-all border border-slate-700 disabled:opacity-30 cursor-pointer active:scale-95"
                      >
                        <span>Folhear Próxima</span>
                        <ChevronRight className="w-4 h-4 text-amber-400" />
                      </button>
                    </div>

                    {/* Auto-Play Flip Showcase */}
                    <button
                      onClick={() => setIsAutoPlaying(prev => !prev)}
                      className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-md ${
                        isAutoPlaying
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 animate-pulse'
                          : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-600/30'
                      }`}
                    >
                      {isAutoPlaying ? (
                        <>
                          <Pause className="w-4 h-4" />
                          <span>Pausar Folheamento Automático</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-current" />
                          <span>Iniciar Folheamento Automático</span>
                        </>
                      )}
                    </button>

                    {/* Speed & Sound Controls */}
                    <div className="pt-1 flex items-center justify-between text-[11px] border-t border-slate-800">
                      <div className="flex items-center gap-1">
                        <span className="text-slate-400">Velocidade:</span>
                        {(['fast', 'normal', 'smooth'] as const).map((spd) => (
                          <button
                            key={spd}
                            onClick={() => setFlipSpeed(spd)}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                              flipSpeed === spd
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            {spd === 'fast' ? 'Rápida' : spd === 'normal' ? 'Normal' : 'Suave'}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => setSoundEnabled(prev => !prev)}
                        className={`flex items-center gap-1 text-[11px] font-semibold cursor-pointer transition-colors ${
                          soundEnabled ? 'text-amber-400' : 'text-slate-500 hover:text-slate-400'
                        }`}
                        title="Ativar/desativar som realista de folheamento"
                      >
                        {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                        <span>{soundEnabled ? 'Som Ativo' : 'Mudo'}</span>
                      </button>
                    </div>

                    <div className="text-[10px] text-slate-400 bg-slate-950/60 p-2 rounded-lg border border-slate-800/80 leading-relaxed">
                      💡 <strong>Dica Interativa:</strong> Você pode folhear clicando diretamente nas páginas, usando os botões flutuantes na tela ou pelas setas (← / →) do teclado!
                    </div>
                  </div>
                </div>
              ) : (
                /* Single Page Mode Controls */
                <div className="p-3.5 bg-gradient-to-br from-indigo-950/70 via-slate-900 to-slate-900 rounded-xl border border-indigo-500/40 shadow-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-black text-white uppercase tracking-wider">Folhear Página Única</span>
                    </div>
                    <span className="text-[11px] font-bold text-amber-300 font-mono bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded-full">
                      Pág. {singlePageNum} / {totalPages}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={triggerFlipPrev}
                      disabled={singlePageNum <= 1 || !!flipState}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-all border border-slate-700 disabled:opacity-30 cursor-pointer active:scale-95"
                    >
                      <ChevronLeft className="w-4 h-4 text-amber-400" />
                      <span>Pág. Anterior</span>
                    </button>

                    <button
                      onClick={triggerFlipNext}
                      disabled={singlePageNum >= totalPages || !!flipState}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-all border border-slate-700 disabled:opacity-30 cursor-pointer active:scale-95"
                    >
                      <span>Próxima Pág.</span>
                      <ChevronRight className="w-4 h-4 text-amber-400" />
                    </button>
                  </div>

                  {/* Auto-Play Flip */}
                  <button
                    onClick={() => setIsAutoPlaying(prev => !prev)}
                    className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-md ${
                      isAutoPlaying
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 animate-pulse'
                        : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-600/30'
                    }`}
                  >
                    {isAutoPlaying ? (
                      <>
                        <Pause className="w-4 h-4" />
                        <span>Pausar Folheamento Automático</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-current" />
                        <span>Iniciar Folheamento Automático</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="range"
                      min="1"
                      max={totalPages}
                      value={singlePageNum}
                      onChange={(e) => setSinglePageNum(parseInt(e.target.value))}
                      className="flex-1 accent-indigo-500 cursor-pointer"
                    />
                    <input
                      type="number"
                      min="1"
                      max={totalPages}
                      value={singlePageNum}
                      onChange={(e) => setSinglePageNum(Math.max(1, Math.min(totalPages, parseInt(e.target.value) || 1)))}
                      className="w-14 px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs font-bold text-center text-white"
                    />
                  </div>
                </div>
              )}

              {/* Jump to Specific Section Helper */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                    <span>Pular para Seção</span>
                  </label>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    {sectionPageMap.months.length} meses
                  </span>
                </div>

                {/* Main Agenda Highlights (Capa e Miolo) */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => jumpToPage(sectionPageMap.cover, 'Capa / Iniciais')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      (mockupMode === 'spread' ? (rightPageNum === 1 || leftPageNum === 1) : singlePageNum === 1)
                        ? 'bg-indigo-600/30 border-indigo-400 text-white ring-1 ring-indigo-400/40 shadow-sm'
                        : 'bg-slate-950/70 hover:bg-slate-800/90 border-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-bold block">📖 Iniciais (Capa)</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700/60 text-slate-400">
                        pág. 1
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 block truncate">Dados e calendário</span>
                  </button>

                  <button
                    onClick={() => jumpToPage(sectionPageMap.firstDaily, 'Início do Miolo')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      (mockupMode === 'spread' ? (rightPageNum === sectionPageMap.firstDaily || leftPageNum === sectionPageMap.firstDaily) : singlePageNum === sectionPageMap.firstDaily)
                        ? 'bg-indigo-600/30 border-indigo-400 text-white ring-1 ring-indigo-400/40 shadow-sm'
                        : 'bg-slate-950/70 hover:bg-slate-800/90 border-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-bold block">📅 Início do Miolo</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700/60 text-amber-400">
                        pág. {sectionPageMap.firstDaily}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 block truncate">Primeiro dia datado</span>
                  </button>
                </div>

                {/* All Months of the Agenda Grid */}
                <div>
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-1.5">
                    <span>Meses da Agenda:</span>
                    <span className="text-[10px] text-slate-500">Clique para abrir</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-60 overflow-y-auto custom-scrollbar p-0.5">
                    {sectionPageMap.months.map((m) => {
                      const isCurrent = currentActiveMonth === m.monthIndex;
                      return (
                        <button
                          key={`m-btn-${m.index}`}
                          onClick={() => jumpToPage(m.pageNum, m.name)}
                          className={`p-2 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                            isCurrent
                              ? 'bg-amber-500/20 border-amber-400/90 text-amber-200 shadow-sm shadow-amber-500/20 ring-1 ring-amber-400/30'
                              : 'bg-slate-950/60 hover:bg-slate-800/90 border-slate-800/90 text-slate-300 hover:text-white hover:border-slate-700'
                          }`}
                          title={`Ir para ${m.name} (página ${m.pageNum})`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[11px] font-bold truncate">
                              {m.name}
                            </span>
                            {isCurrent && (
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 animate-pulse" />
                            )}
                          </div>
                          <span className={`text-[9px] font-mono mt-1 ${isCurrent ? 'text-amber-300 font-semibold' : 'text-slate-400'}`}>
                            pág. {m.pageNum}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: ÂNGULO 3D & PERSPECTIVA */}
          {activeSettingsTab === '3d' && (
            <div className="p-4 space-y-5">
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                  Estilos de Câmera 3D
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPerspective('flatlay')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      perspective === 'flatlay'
                        ? 'bg-indigo-600/30 border-indigo-500 text-white ring-1 ring-indigo-500'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <span className="text-xs font-bold block text-white">📸 Flatlay Superior</span>
                    <span className="text-[10px] text-slate-400">Vista de cima frontal, limpa para catálogo</span>
                  </button>
                  <button
                    onClick={() => setPerspective('isometric')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      perspective === 'isometric'
                        ? 'bg-indigo-600/30 border-indigo-500 text-white ring-1 ring-indigo-500'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <span className="text-xs font-bold block text-white">🛸 Isométrico Real</span>
                    <span className="text-[10px] text-slate-400">Ângulo tridimensional que destaca o miolo</span>
                  </button>
                  <button
                    onClick={() => setPerspective('tilted')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      perspective === 'tilted'
                        ? 'bg-indigo-600/30 border-indigo-500 text-white ring-1 ring-indigo-500'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <span className="text-xs font-bold block text-white">📐 Inclinado Frontal</span>
                    <span className="text-[10px] text-slate-400">Perspectiva suave estilo foto de mesa</span>
                  </button>
                  <button
                    onClick={() => setPerspective('closeup')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      perspective === 'closeup'
                        ? 'bg-indigo-600/30 border-indigo-500 text-white ring-1 ring-indigo-500'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <span className="text-xs font-bold block text-white">🔍 Foco no Detalhe</span>
                    <span className="text-[10px] text-slate-400">Ângulo suave de apresentação comercial</span>
                  </button>
                </div>
              </div>

              {/* Sliders de Rotação Manual */}
              <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
                <label className="text-xs font-bold text-slate-300 block">
                  Ajuste Fino da Rotação 3D
                </label>
                
                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>Inclinação Vertical (Tilt X):</span>
                    <span className="font-mono text-indigo-400">{customAngleX}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="45"
                    value={customAngleX}
                    onChange={(e) => setCustomAngleX(parseInt(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>Giro Lateral (Rotate Y):</span>
                    <span className="font-mono text-indigo-400">{customAngleY}°</span>
                  </div>
                  <input
                    type="range"
                    min="-30"
                    max="30"
                    value={customAngleY}
                    onChange={(e) => setCustomAngleY(parseInt(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>Rotação do Plano (Rotate Z):</span>
                    <span className="font-mono text-indigo-400">{customAngleZ}°</span>
                  </div>
                  <input
                    type="range"
                    min="-20"
                    max="20"
                    value={customAngleZ}
                    onChange={(e) => setCustomAngleZ(parseInt(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Espessura do Miolo (Folhas empilhadas) */}
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                  Volume / Espessura das Folhas
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setCoverThickness('thin')}
                    className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                      coverThickness === 'thin' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    Fino (~50 fls)
                  </button>
                  <button
                    onClick={() => setCoverThickness('medium')}
                    className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                      coverThickness === 'medium' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    Médio (~120 fls)
                  </button>
                  <button
                    onClick={() => setCoverThickness('thick')}
                    className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                      coverThickness === 'thick' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    Robusto (~200 fls)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ESPIRAL WIRE-O / ENCADERNAÇÃO */}
          {activeSettingsTab === 'wireo' && (
            <div className="p-4 space-y-5">
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                  Acabamento do Wire-o Metálico
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setWireoFinish('gold')}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      wireoFinish === 'gold' ? 'bg-amber-500/20 border-amber-400 text-amber-200' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-600 via-amber-300 to-amber-700 shadow-sm border border-amber-300/40 shrink-0"></span>
                    <span>Dourado Ouro</span>
                  </button>

                  <button
                    onClick={() => setWireoFinish('silver')}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      wireoFinish === 'silver' ? 'bg-slate-400/20 border-slate-300 text-slate-200' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="w-5 h-5 rounded-full bg-gradient-to-tr from-slate-400 via-white to-slate-500 shadow-sm border border-white/50 shrink-0"></span>
                    <span>Prata Cromada</span>
                  </button>

                  <button
                    onClick={() => setWireoFinish('rosegold')}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      wireoFinish === 'rosegold' ? 'bg-rose-500/20 border-rose-400 text-rose-200' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="w-5 h-5 rounded-full bg-gradient-to-tr from-rose-600 via-rose-300 to-pink-700 shadow-sm border border-rose-300/40 shrink-0"></span>
                    <span>Rosé Gold</span>
                  </button>

                  <button
                    onClick={() => setWireoFinish('black')}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      wireoFinish === 'black' ? 'bg-zinc-800 border-zinc-500 text-zinc-100' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="w-5 h-5 rounded-full bg-gradient-to-tr from-zinc-950 via-zinc-700 to-black shadow-sm border border-zinc-600 shrink-0"></span>
                    <span>Preto Fosco</span>
                  </button>

                  <button
                    onClick={() => setWireoFinish('white')}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      wireoFinish === 'white' ? 'bg-slate-200/20 border-slate-200 text-white' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="w-5 h-5 rounded-full bg-white shadow-sm border border-slate-300 shrink-0"></span>
                    <span>Branco Esmalte</span>
                  </button>

                  <button
                    onClick={() => setWireoFinish('bronze')}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      wireoFinish === 'bronze' ? 'bg-amber-800/30 border-amber-600 text-amber-200' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-900 via-amber-600 to-yellow-800 shadow-sm border border-amber-500/40 shrink-0"></span>
                    <span>Bronze Nobre</span>
                  </button>

                  <button
                    onClick={() => setWireoFinish('none')}
                    className={`col-span-2 flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      wireoFinish === 'none' ? 'bg-indigo-600/30 border-indigo-400 text-indigo-200' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>Lombada de Livro Costurado (Sem Espiral)</span>
                  </button>
                </div>
              </div>

              <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
                <span className="text-xs font-semibold text-amber-300 block">💡 Wire-o Tradicional de Gráfica:</span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Reproduz o arame duplo contínuo passo 2:1 com arco metálico, brilho especular e furação quadrada padrão de encadernadora, eliminando qualquer aspecto de disco.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: CENÁRIO & AMBIENTE */}
          {activeSettingsTab === 'environment' && (
            <div className="p-4 space-y-5">
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                  Superfície & Fundo da Cena
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setBackgroundType('studio-white')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      backgroundType === 'studio-white' ? 'bg-indigo-600/30 border-indigo-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="w-full h-8 rounded-lg bg-gradient-to-r from-slate-100 to-slate-300 mb-2 border border-slate-400/30"></div>
                    <span className="text-xs font-bold block text-white">Estúdio Minimalista</span>
                    <span className="text-[10px] text-slate-400">Branco suave com luz de estúdio</span>
                  </button>

                  <button
                    onClick={() => setBackgroundType('marble')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      backgroundType === 'marble' ? 'bg-indigo-600/30 border-indigo-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="w-full h-8 rounded-lg bg-gradient-to-r from-slate-200 via-stone-100 to-slate-300 mb-2 border border-slate-400/30"></div>
                    <span className="text-xs font-bold block text-white">Mármore Nobre</span>
                    <span className="text-[10px] text-slate-400">Bancada luxuosa de pedra clara</span>
                  </button>

                  <button
                    onClick={() => setBackgroundType('wood')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      backgroundType === 'wood' ? 'bg-indigo-600/30 border-indigo-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="w-full h-8 rounded-lg bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 mb-2 border border-amber-950/40"></div>
                    <span className="text-xs font-bold block text-white">Mesa de Madeira</span>
                    <span className="text-[10px] text-slate-400">Tom acolhedor de carvalho</span>
                  </button>

                  <button
                    onClick={() => setBackgroundType('pastel')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      backgroundType === 'pastel' ? 'bg-indigo-600/30 border-indigo-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="w-full h-8 rounded-lg bg-gradient-to-r from-pink-200 via-rose-100 to-amber-100 mb-2 border border-rose-300/30"></div>
                    <span className="text-xs font-bold block text-white">Pastel & Rosé</span>
                    <span className="text-[10px] text-slate-400">Estética suave de papelaria</span>
                  </button>

                  <button
                    onClick={() => setBackgroundType('dark')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      backgroundType === 'dark' ? 'bg-indigo-600/30 border-indigo-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="w-full h-8 rounded-lg bg-gradient-to-r from-slate-800 to-slate-950 mb-2 border border-slate-700"></div>
                    <span className="text-xs font-bold block text-white">Dark Minimalist</span>
                    <span className="text-[10px] text-slate-400">Contraste elegante escuro</span>
                  </button>

                  <button
                    onClick={() => setBackgroundType('transparent')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      backgroundType === 'transparent' ? 'bg-indigo-600/30 border-indigo-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="w-full h-8 rounded-lg bg-slate-800 mb-2 border border-dashed border-slate-600 flex items-center justify-center text-[10px] font-mono text-slate-300">
                      PNG Transparente
                    </div>
                    <span className="text-xs font-bold block text-white">Transparente</span>
                    <span className="text-[10px] text-slate-400">Perfeito para Canva e Catálogos</span>
                  </button>
                </div>
              </div>

              {/* Intensidade das Sombras */}
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                  Intensidade da Sombra de Contato
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setShadowIntensity('soft')}
                    className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                      shadowIntensity === 'soft' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    Suave
                  </button>
                  <button
                    onClick={() => setShadowIntensity('medium')}
                    className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                      shadowIntensity === 'medium' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    Média
                  </button>
                  <button
                    onClick={() => setShadowIntensity('hard')}
                    className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                      shadowIntensity === 'hard' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    Marcada
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: ADORNOS & OBJETOS DE PAPELARIA */}
          {activeSettingsTab === 'props' && (
            <div className="p-4 space-y-5">
              {/* Ribbon Bookmark */}
              <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bookmark className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-white">Fita Marcadora de Cetim</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={showRibbon}
                    onChange={(e) => setShowRibbon(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
                  />
                </div>

                {showRibbon && (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Cor da Fita:</span>
                      <span className="font-mono text-xs">{ribbonColor}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={ribbonColor}
                        onChange={(e) => setRibbonColor(e.target.value)}
                        className="w-9 h-8 p-0 border border-slate-700 rounded cursor-pointer bg-transparent"
                      />
                      <div className="flex items-center gap-1.5 flex-1">
                        {['#c59b27', '#e11d48', '#0f172a', '#ec4899', '#3b82f6', '#10b981'].map((preset) => (
                          <button
                            key={preset}
                            onClick={() => setRibbonColor(preset)}
                            className="w-6 h-6 rounded-full border border-white/20 transition-transform hover:scale-110"
                            style={{ backgroundColor: preset }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Caneta Metálica */}
              <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-indigo-400" />
                  <div>
                    <span className="text-xs font-bold text-white block">Caneta Elegante ao Lado</span>
                    <span className="text-[10px] text-slate-400">Caneta metálica de papelaria em ângulo</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={showPen}
                  onChange={(e) => setShowPen(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
                />
              </div>

              {/* Clips Dourado */}
              <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <div>
                    <span className="text-xs font-bold text-white block">Clips Metálico no Topo</span>
                    <span className="text-[10px] text-slate-400">Prendedor dourado na borda superior</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={showPaperclip}
                  onChange={(e) => setShowPaperclip(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
                />
              </div>
            </div>
          )}
        </aside>

        {/* 3. CENTER VIEWPORT / THE 3D SCENE STAGE */}
        <main className="flex-1 flex flex-col relative overflow-hidden bg-slate-950">
          
          {/* Viewport Floating Zoom & Reset Controls */}
          <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md p-1.5 rounded-xl border border-slate-800 shadow-xl">
            <button
              onClick={() => setZoomLevel(prev => Math.max(0.4, prev - 0.1))}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer transition-colors"
              title="Diminuir Zoom"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold font-mono px-1.5 text-indigo-300">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel(prev => Math.min(2.0, prev + 0.1))}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer transition-colors"
              title="Aumentar Zoom"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="text-[10px] font-bold text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-slate-800 border-l border-slate-800 ml-1 cursor-pointer"
            >
              100%
            </button>
          </div>

          {/* THE MOCKUP RENDER STAGE (Captured by html2canvas) */}
          <div className="flex-1 overflow-auto flex items-center justify-center p-6 md:p-12 custom-scrollbar">
            <div 
              ref={mockupSurfaceRef}
              id="mockup-render-surface"
              className="relative p-12 md:p-20 rounded-3xl transition-all duration-300 flex items-center justify-center min-w-[700px] min-h-[550px]"
              style={{
                ...environmentStyle,
                transform: `scale(${zoomLevel})`,
                transformOrigin: 'center center'
              }}
            >
              
              {/* 3D TRANSFORMED CONTAINER */}
              <div 
                className="relative transition-transform duration-300 ease-out"
                style={{
                  perspective: '1400px',
                  perspectiveOrigin: '50% 50%'
                }}
              >
                
                {/* INNER 3D STAGE ROTATION */}
                <div 
                  className="relative flex items-center justify-center transition-all duration-300"
                  style={{
                    transform: `rotateX(${customAngleX}deg) rotateY(${customAngleY}deg) rotateZ(${customAngleZ}deg)`,
                    transformStyle: 'preserve-3d'
                  }}
                >
                  
                  {/* AMBIENT DROP SHADOW UNDER THE BOOK */}
                  <div 
                    className="absolute -inset-8 pointer-events-none rounded-3xl"
                    style={{
                      transform: 'translateZ(-40px)',
                      filter: 'blur(35px)',
                      background: shadowIntensity === 'hard' 
                        ? 'rgba(0,0,0,0.55)' 
                        : shadowIntensity === 'soft' 
                        ? 'rgba(0,0,0,0.22)' 
                        : 'rgba(0,0,0,0.38)'
                    }}
                  />

                  {/* ============================================================ */}
                  {/* A. SPREAD / AGENDA ABERTA (DUAS PÁGINAS COM WIRE-O NO CENTRO) */}
                  {/* ============================================================ */}
                  {mockupMode === 'spread' && (
                    <div className="relative flex items-center mockup-book-stage">

                      {/* Floating Previous Page Quick Button beside Left Page */}
                      <button
                        onClick={(e) => { e.stopPropagation(); triggerFlipPrev(); }}
                        disabled={leftPageNum <= 0 || !!flipState}
                        className="no-print absolute -left-12 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700/80 shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 disabled:opacity-0 disabled:pointer-events-none cursor-pointer z-30"
                        title="Folhear para a página anterior (Seta ←)"
                      >
                        <ChevronLeft className="w-5 h-5 text-amber-300" />
                      </button>

                      {/* --- LEFT PAGE (PÁGINA ESQUERDA) --- */}
                      <div 
                        onClick={() => { if (!flipState && leftPageNum > 0) triggerFlipPrev(); }}
                        className={`relative bg-white rounded-l-xl overflow-hidden box-border group/leftpage ${
                          !flipState && leftPageNum > 0 ? 'cursor-pointer' : ''
                        }`}
                        style={{
                          width: `${DISPLAY_PAGE_W}px`,
                          height: `${DISPLAY_PAGE_H}px`,
                          transformOrigin: 'right center',
                          transform: 'rotateY(3deg)',
                          boxShadow: 'inset -12px 0 20px -8px rgba(0,0,0,0.12), -4px 6px 15px rgba(0,0,0,0.12)'
                        }}
                      >
                        {/* Stacked Pages Thickness Behind Left Page */}
                        <div 
                          className="absolute inset-0 rounded-l-xl pointer-events-none bg-stone-100 border border-stone-300/80"
                          style={{
                            transform: `translate(-${coverThickness === 'thick' ? 7 : coverThickness === 'medium' ? 5 : 3}px, 3px)`,
                            zIndex: -1,
                            boxShadow: '-2px 2px 5px rgba(0,0,0,0.12)'
                          }}
                        />

                        {/* Scaled Rendered Page Content */}
                        <div 
                          className="w-full h-full relative overflow-hidden mockup-page-wrapper"
                          style={{ width: `${DISPLAY_PAGE_W}px`, height: `${DISPLAY_PAGE_H}px` }}
                        >
                          <div 
                            style={{
                              width: `${BASE_PAGE_W_PX}px`,
                              height: `${BASE_PAGE_H_PX}px`,
                              transform: `scale(${SCALE_FACTOR})`,
                              transformOrigin: 'top left'
                            }}
                          >
                            {flipState ? getPageNode(flipState.underLeftPage) : leftPageNode}
                          </div>
                        </div>

                        {/* Dynamic Landing Shadow when page flips forward and lands on left */}
                        {flipState && flipState.direction === 'next' && (
                          <div 
                            className="absolute inset-0 pointer-events-none z-10"
                            style={{
                              background: 'linear-gradient(to left, rgba(0,0,0,0.32) 0%, rgba(0,0,0,0.08) 60%, transparent 100%)',
                              animation: `landingShadowFall ${flipDuration}ms ease-out forwards`
                            }}
                          />
                        )}

                        {/* Subtle Paper Curvature Overlay Shadow (Spine Shadow) */}
                        <div 
                          className="absolute inset-y-0 right-0 w-12 pointer-events-none"
                          style={{
                            background: 'linear-gradient(to left, rgba(0,0,0,0.16) 0%, rgba(0,0,0,0.04) 50%, transparent 100%)'
                          }}
                        />

                      </div>

                      {/* Bookbound Sewn Spine (Shown only when wireoFinish is 'none') */}
                      {wireoFinish === 'none' && (
                        <div 
                          className="relative w-4 z-20 select-none"
                          style={{
                            height: `${DISPLAY_PAGE_H}px`,
                            margin: '0 -2px',
                            background: 'linear-gradient(to right, rgba(0,0,0,0.22) 0%, rgba(0,0,0,0.02) 40%, rgba(255,255,255,0.2) 50%, rgba(0,0,0,0.02) 60%, rgba(0,0,0,0.22) 100%)',
                            boxShadow: 'inset 0 0 4px rgba(0,0,0,0.3)'
                          }}
                        >
                          {/* Center Crease Stitch Line */}
                          <div className="w-px h-full mx-auto bg-black/20 border-r border-dashed border-white/30" />
                        </div>
                      )}

                      {/* --- RIGHT PAGE (PÁGINA DIREITA) --- */}
                      <div 
                        onClick={() => { if (!flipState && rightPageNum > 0 && rightPageNum < totalPages) triggerFlipNext(); }}
                        className={`relative bg-white rounded-r-xl overflow-hidden box-border group/rightpage ${
                          !flipState && rightPageNum > 0 && rightPageNum < totalPages ? 'cursor-pointer' : ''
                        }`}
                        style={{
                          width: `${DISPLAY_PAGE_W}px`,
                          height: `${DISPLAY_PAGE_H}px`,
                          transformOrigin: 'left center',
                          transform: 'rotateY(-3deg)',
                          boxShadow: 'inset 12px 0 20px -8px rgba(0,0,0,0.12), 4px 6px 15px rgba(0,0,0,0.12)'
                        }}
                      >
                        {/* Stacked Pages Thickness Behind Right Page */}
                        <div 
                          className="absolute inset-0 rounded-r-xl pointer-events-none bg-stone-100 border border-stone-300/80"
                          style={{
                            transform: `translate(${coverThickness === 'thick' ? 7 : coverThickness === 'medium' ? 5 : 3}px, 3px)`,
                            zIndex: -1,
                            boxShadow: '2px 2px 5px rgba(0,0,0,0.12)'
                          }}
                        />

                        {/* Scaled Rendered Page Content */}
                        <div 
                          className="w-full h-full relative overflow-hidden mockup-page-wrapper"
                          style={{ width: `${DISPLAY_PAGE_W}px`, height: `${DISPLAY_PAGE_H}px` }}
                        >
                          <div 
                            style={{
                              width: `${BASE_PAGE_W_PX}px`,
                              height: `${BASE_PAGE_H_PX}px`,
                              transform: `scale(${SCALE_FACTOR})`,
                              transformOrigin: 'top left'
                            }}
                          >
                            {flipState ? getPageNode(flipState.underRightPage) : rightPageNode}
                          </div>
                        </div>

                        {/* Dynamic Liftoff Shadow when page lifts from right to flip forward */}
                        {flipState && flipState.direction === 'next' && (
                          <div 
                            className="absolute inset-0 pointer-events-none z-10"
                            style={{
                              background: 'linear-gradient(to right, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.08) 50%, transparent 100%)',
                              animation: `underShadowLift ${flipDuration}ms ease-out forwards`
                            }}
                          />
                        )}

                        {/* Subtle Paper Curvature Overlay Shadow (Spine Shadow) */}
                        <div 
                          className="absolute inset-y-0 left-0 w-12 pointer-events-none"
                          style={{
                            background: 'linear-gradient(to right, rgba(0,0,0,0.16) 0%, rgba(0,0,0,0.04) 50%, transparent 100%)'
                          }}
                        />

                        {/* Ribbon Bookmark Trailing Over the Right Page */}
                        {showRibbon && (
                          <div 
                            className="absolute top-0 right-14 w-6 h-[85%] z-20 pointer-events-none shadow-md"
                            style={{
                              backgroundColor: ribbonColor,
                              transform: 'rotate(-4deg) translateZ(8px)',
                              boxShadow: '3px 4px 8px rgba(0,0,0,0.3)',
                              clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 92%, 0 100%)'
                            }}
                          >
                            {/* Silk sheen effect */}
                            <div className="w-full h-full opacity-25 bg-gradient-to-r from-black/20 via-white/50 to-black/20" />
                          </div>
                        )}

                        {/* Gold Paperclip Attached at Top Edge */}
                        {showPaperclip && (
                          <div 
                            className="absolute -top-3 right-8 w-4 h-12 rounded-full border-2 border-amber-400 bg-amber-200/40 z-30 shadow-md pointer-events-none"
                            style={{
                              transform: 'rotate(8deg)',
                              boxShadow: '1px 2px 4px rgba(0,0,0,0.3)'
                            }}
                          />
                        )}

                      </div>

                      {/* Floating Next Page Quick Button beside Right Page */}
                      <button
                        onClick={(e) => { e.stopPropagation(); triggerFlipNext(); }}
                        disabled={rightPageNum <= 0 || rightPageNum >= totalPages || !!flipState}
                        className="no-print absolute -right-12 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700/80 shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 disabled:opacity-0 disabled:pointer-events-none cursor-pointer z-30"
                        title="Folhear para a próxima página (Seta →)"
                      >
                        <ChevronRight className="w-5 h-5 text-amber-300" />
                      </button>

                      {/* ========================================================= */}
                      {/* --- 3D TURNING LEAF ANIMATION (FORWARD: RIGHT TO LEFT) --- */}
                      {/* ========================================================= */}
                      {flipState && flipState.direction === 'next' && (
                        <div 
                          className="absolute top-0 z-25 pointer-events-none"
                          style={{
                            left: `${DISPLAY_PAGE_W}px`,
                            width: `${DISPLAY_PAGE_W}px`,
                            height: `${DISPLAY_PAGE_H}px`,
                            transformOrigin: 'left center',
                            transformStyle: 'preserve-3d',
                            animation: `flipNextLeaf ${flipDuration}ms cubic-bezier(0.25, 1, 0.5, 1) forwards`
                          }}
                        >
                          {/* FRONT FACE OF TURNING LEAF (Current Right Page lifting up) */}
                          <div 
                            className="absolute inset-0 bg-white rounded-r-xl overflow-hidden box-border"
                            style={{
                              backfaceVisibility: 'hidden',
                              transform: 'rotateY(0deg)',
                              boxShadow: '-8px 12px 30px rgba(0,0,0,0.25)'
                            }}
                          >
                            <div 
                              className="w-full h-full relative overflow-hidden mockup-page-wrapper"
                              style={{ width: `${DISPLAY_PAGE_W}px`, height: `${DISPLAY_PAGE_H}px` }}
                            >
                              <div 
                                style={{
                                  width: `${BASE_PAGE_W_PX}px`,
                                  height: `${BASE_PAGE_H_PX}px`,
                                  transform: `scale(${SCALE_FACTOR})`,
                                  transformOrigin: 'top left'
                                }}
                              >
                                {getPageNode(flipState.leafFrontPage)}
                              </div>
                            </div>
                            {/* Realistic Paper Sheen & Curvature Highlight */}
                            <div 
                              className="absolute inset-0 pointer-events-none"
                              style={{
                                background: 'linear-gradient(to right, rgba(0,0,0,0.2) 0%, rgba(255,255,255,0.45) 30%, rgba(0,0,0,0.05) 75%, rgba(0,0,0,0.25) 100%)'
                              }}
                            />
                          </div>

                          {/* BACK FACE OF TURNING LEAF (Target Left Page landing on left) */}
                          <div 
                            className="absolute inset-0 bg-white rounded-l-xl overflow-hidden box-border"
                            style={{
                              backfaceVisibility: 'hidden',
                              transform: 'rotateY(180deg)',
                              boxShadow: '8px 12px 30px rgba(0,0,0,0.25)'
                            }}
                          >
                            <div 
                              className="w-full h-full relative overflow-hidden mockup-page-wrapper"
                              style={{ width: `${DISPLAY_PAGE_W}px`, height: `${DISPLAY_PAGE_H}px` }}
                            >
                              <div 
                                style={{
                                  width: `${BASE_PAGE_W_PX}px`,
                                  height: `${BASE_PAGE_H_PX}px`,
                                  transform: `scale(${SCALE_FACTOR})`,
                                  transformOrigin: 'top left'
                                }}
                              >
                                {getPageNode(flipState.leafBackPage)}
                              </div>
                            </div>
                            {/* Realistic Paper Sheen for Verso Face */}
                            <div 
                              className="absolute inset-0 pointer-events-none"
                              style={{
                                background: 'linear-gradient(to left, rgba(0,0,0,0.2) 0%, rgba(255,255,255,0.45) 30%, rgba(0,0,0,0.05) 75%, rgba(0,0,0,0.25) 100%)'
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {/* ========================================================= */}
                      {/* --- 3D TURNING LEAF ANIMATION (BACKWARD: LEFT TO RIGHT) --- */}
                      {/* ========================================================= */}
                      {flipState && flipState.direction === 'prev' && (
                        <div 
                          className="absolute top-0 z-25 pointer-events-none"
                          style={{
                            left: 0,
                            width: `${DISPLAY_PAGE_W}px`,
                            height: `${DISPLAY_PAGE_H}px`,
                            transformOrigin: 'right center',
                            transformStyle: 'preserve-3d',
                            animation: `flipPrevLeaf ${flipDuration}ms cubic-bezier(0.25, 1, 0.5, 1) forwards`
                          }}
                        >
                          {/* BACK FACE OF TURNING LEAF (Current Left Page lifting up) */}
                          <div 
                            className="absolute inset-0 bg-white rounded-l-xl overflow-hidden box-border"
                            style={{
                              backfaceVisibility: 'hidden',
                              transform: 'rotateY(0deg)',
                              boxShadow: '8px 12px 30px rgba(0,0,0,0.25)'
                            }}
                          >
                            <div 
                              className="w-full h-full relative overflow-hidden mockup-page-wrapper"
                              style={{ width: `${DISPLAY_PAGE_W}px`, height: `${DISPLAY_PAGE_H}px` }}
                            >
                              <div 
                                style={{
                                  width: `${BASE_PAGE_W_PX}px`,
                                  height: `${BASE_PAGE_H_PX}px`,
                                  transform: `scale(${SCALE_FACTOR})`,
                                  transformOrigin: 'top left'
                                }}
                              >
                                {getPageNode(flipState.leafBackPage)}
                              </div>
                            </div>
                            {/* Realistic Paper Sheen */}
                            <div 
                              className="absolute inset-0 pointer-events-none"
                              style={{
                                background: 'linear-gradient(to left, rgba(0,0,0,0.2) 0%, rgba(255,255,255,0.45) 30%, rgba(0,0,0,0.05) 75%, rgba(0,0,0,0.25) 100%)'
                              }}
                            />
                          </div>

                          {/* FRONT FACE OF TURNING LEAF (Target Right Page landing on right) */}
                          <div 
                            className="absolute inset-0 bg-white rounded-r-xl overflow-hidden box-border"
                            style={{
                              backfaceVisibility: 'hidden',
                              transform: 'rotateY(180deg)',
                              boxShadow: '-8px 12px 30px rgba(0,0,0,0.25)'
                            }}
                          >
                            <div 
                              className="w-full h-full relative overflow-hidden mockup-page-wrapper"
                              style={{ width: `${DISPLAY_PAGE_W}px`, height: `${DISPLAY_PAGE_H}px` }}
                            >
                              <div 
                                style={{
                                  width: `${BASE_PAGE_W_PX}px`,
                                  height: `${BASE_PAGE_H_PX}px`,
                                  transform: `scale(${SCALE_FACTOR})`,
                                  transformOrigin: 'top left'
                                }}
                              >
                                {getPageNode(flipState.leafFrontPage)}
                              </div>
                            </div>
                            {/* Realistic Paper Sheen */}
                            <div 
                              className="absolute inset-0 pointer-events-none"
                              style={{
                                background: 'linear-gradient(to right, rgba(0,0,0,0.2) 0%, rgba(255,255,255,0.45) 30%, rgba(0,0,0,0.05) 75%, rgba(0,0,0,0.25) 100%)'
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {/* --- UNIFIED WIRE-O SPINE & HOLES OVERLAY (100% PRECISELY ALIGNED 2:1 DOUBLE-LOOP WIRE) --- */}
                      {wireoFinish !== 'none' && wireoStyles && (
                        <div 
                          className="absolute left-1/2 top-0 bottom-0 pointer-events-none z-30 select-none"
                          style={{
                            width: '64px',
                            height: `${DISPLAY_PAGE_H}px`,
                            transform: 'translateX(-50%) translateZ(4px)'
                          }}
                        >
                          <svg 
                            className="w-full h-full overflow-visible"
                            viewBox={`0 0 64 ${DISPLAY_PAGE_H}`}
                            fill="none"
                          >
                            <defs>
                              <linearGradient id="mockupWireoMetallicGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor={wireoStyles.wireHighlight} />
                                <stop offset="35%" stopColor={wireoStyles.wireColor} />
                                <stop offset="75%" stopColor={wireoStyles.wireShadow} />
                                <stop offset="100%" stopColor="#141416" />
                              </linearGradient>
                              <linearGradient id="mockupGutterValleyShadow" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="rgba(0,0,0,0)" />
                                <stop offset="35%" stopColor="rgba(0,0,0,0.08)" />
                                <stop offset="50%" stopColor="rgba(0,0,0,0.26)" />
                                <stop offset="65%" stopColor="rgba(0,0,0,0.08)" />
                                <stop offset="100%" stopColor="rgba(0,0,0,0)" />
                              </linearGradient>
                              <filter id="mockupWireShadowBlur" x="-30%" y="-50%" width="160%" height="200%">
                                <feGaussianBlur in="SourceGraphic" stdDeviation="0.8" />
                              </filter>
                            </defs>

                            {/* Central Spine Valley Shadow */}
                            <rect x="24" y="0" width="16" height={DISPLAY_PAGE_H} fill="url(#mockupGutterValleyShadow)" />
                            <line x1="32" y1="0" x2="32" y2={DISPLAY_PAGE_H} stroke="rgba(0,0,0,0.35)" strokeWidth="0.8" />

                            {/* Wire-o Pairs (2:1 Pitch) */}
                            {Array.from({ length: wireoRingsCount }).map((_, idx) => {
                              const pairSpacing = (DISPLAY_PAGE_H - 36) / wireoRingsCount;
                              const pairCenterY = 18 + idx * pairSpacing + pairSpacing / 2;
                              const yTop = pairCenterY - 3.8;
                              const yBottom = pairCenterY + 3.8;
                              const leftHoleX = 18;
                              const rightHoleX = 46;

                              return (
                                <g key={`wire-pair-group-${idx}`}>
                                  {/* ========================================= */}
                                  {/* --- LOOP 1 (TOP OF PAIR) --- */}
                                  {/* ========================================= */}

                                  {/* Square Punched Hole - Left Page */}
                                  <rect 
                                    x={leftHoleX - 2.3} 
                                    y={yTop - 2.3} 
                                    width="4.6" 
                                    height="4.6" 
                                    rx="0.7" 
                                    fill={wireoStyles.holeBg} 
                                    stroke="rgba(0,0,0,0.4)" 
                                    strokeWidth="0.5" 
                                  />
                                  <rect 
                                    x={leftHoleX - 2.1} 
                                    y={yTop - 2.1} 
                                    width="4.2" 
                                    height="1.8" 
                                    rx="0.5" 
                                    fill="rgba(0,0,0,0.55)" 
                                  />
                                  <line 
                                    x1={leftHoleX - 2.3} 
                                    y1={yTop + 2.3} 
                                    x2={leftHoleX + 2.3} 
                                    y2={yTop + 2.3} 
                                    stroke="rgba(255,255,255,0.45)" 
                                    strokeWidth="0.5" 
                                  />

                                  {/* Square Punched Hole - Right Page */}
                                  <rect 
                                    x={rightHoleX - 2.3} 
                                    y={yTop - 2.3} 
                                    width="4.6" 
                                    height="4.6" 
                                    rx="0.7" 
                                    fill={wireoStyles.holeBg} 
                                    stroke="rgba(0,0,0,0.4)" 
                                    strokeWidth="0.5" 
                                  />
                                  <rect 
                                    x={rightHoleX - 2.1} 
                                    y={yTop - 2.1} 
                                    width="4.2" 
                                    height="1.8" 
                                    rx="0.5" 
                                    fill="rgba(0,0,0,0.55)" 
                                  />
                                  <line 
                                    x1={rightHoleX - 2.3} 
                                    y1={yTop + 2.3} 
                                    x2={rightHoleX + 2.3} 
                                    y2={yTop + 2.3} 
                                    stroke="rgba(255,255,255,0.45)" 
                                    strokeWidth="0.5" 
                                  />

                                  {/* Back strand of wire passing behind through the gutter */}
                                  <path 
                                    d={`M 28.5,${yTop + 1.2} C 30.5,${yTop + 2.5} 33.5,${yTop + 2.5} 35.5,${yTop + 1.2}`} 
                                    stroke={wireoStyles.wireShadow} 
                                    strokeWidth="1.4" 
                                    strokeLinecap="round" 
                                    opacity="0.7" 
                                  />

                                  {/* Realistic Soft Wire Cast Shadow on Paper (Diffused, matches thin wire gauge) */}
                                  <path 
                                    d={`M ${leftHoleX + 0.8},${yTop + 0.4} C 25,${yTop + 1.8} 39,${yTop + 1.8} ${rightHoleX - 0.8},${yTop + 0.4}`} 
                                    stroke={wireShadowStroke} 
                                    strokeWidth="1.3" 
                                    strokeLinecap="round" 
                                    filter="url(#mockupWireShadowBlur)"
                                  />

                                  {/* Main Metallic Wire Arc (Enters perfectly through center of holes) */}
                                  <path 
                                    d={`M ${leftHoleX - 1.2},${yTop} C 25,${yTop - 2.2} 39,${yTop - 2.2} ${rightHoleX + 1.2},${yTop}`} 
                                    stroke="url(#mockupWireoMetallicGrad)" 
                                    strokeWidth="1.6" 
                                    strokeLinecap="round" 
                                  />

                                  {/* Specular Glint on Top Crest */}
                                  <path 
                                    d={`M 25,${yTop - 1.5} C 29,${yTop - 2.1} 35,${yTop - 2.1} 39,${yTop - 1.5}`} 
                                    stroke="rgba(255,255,255,0.85)" 
                                    strokeWidth="0.6" 
                                    strokeLinecap="round" 
                                  />

                                  {/* Contact Shadows inside the holes */}
                                  <ellipse cx={leftHoleX} cy={yTop} rx="1.6" ry="1.1" fill="rgba(0,0,0,0.55)" />
                                  <ellipse cx={rightHoleX} cy={yTop} rx="1.6" ry="1.1" fill="rgba(0,0,0,0.55)" />

                                  {/* ========================================= */}
                                  {/* --- LOOP 2 (BOTTOM OF PAIR) --- */}
                                  {/* ========================================= */}

                                  {/* Square Punched Hole - Left Page */}
                                  <rect 
                                    x={leftHoleX - 2.3} 
                                    y={yBottom - 2.3} 
                                    width="4.6" 
                                    height="4.6" 
                                    rx="0.7" 
                                    fill={wireoStyles.holeBg} 
                                    stroke="rgba(0,0,0,0.4)" 
                                    strokeWidth="0.5" 
                                  />
                                  <rect 
                                    x={leftHoleX - 2.1} 
                                    y={yBottom - 2.1} 
                                    width="4.2" 
                                    height="1.8" 
                                    rx="0.5" 
                                    fill="rgba(0,0,0,0.55)" 
                                  />
                                  <line 
                                    x1={leftHoleX - 2.3} 
                                    y1={yBottom + 2.3} 
                                    x2={leftHoleX + 2.3} 
                                    y2={yBottom + 2.3} 
                                    stroke="rgba(255,255,255,0.45)" 
                                    strokeWidth="0.5" 
                                  />

                                  {/* Square Punched Hole - Right Page */}
                                  <rect 
                                    x={rightHoleX - 2.3} 
                                    y={yBottom - 2.3} 
                                    width="4.6" 
                                    height="4.6" 
                                    rx="0.7" 
                                    fill={wireoStyles.holeBg} 
                                    stroke="rgba(0,0,0,0.4)" 
                                    strokeWidth="0.5" 
                                  />
                                  <rect 
                                    x={rightHoleX - 2.1} 
                                    y={yBottom - 2.1} 
                                    width="4.2" 
                                    height="1.8" 
                                    rx="0.5" 
                                    fill="rgba(0,0,0,0.55)" 
                                  />
                                  <line 
                                    x1={rightHoleX - 2.3} 
                                    y1={yBottom + 2.3} 
                                    x2={rightHoleX + 2.3} 
                                    y2={yBottom + 2.3} 
                                    stroke="rgba(255,255,255,0.45)" 
                                    strokeWidth="0.5" 
                                  />

                                  {/* Back strand of wire passing behind through the gutter */}
                                  <path 
                                    d={`M 28.5,${yBottom + 1.2} C 30.5,${yBottom + 2.5} 33.5,${yBottom + 2.5} 35.5,${yBottom + 1.2}`} 
                                    stroke={wireoStyles.wireShadow} 
                                    strokeWidth="1.4" 
                                    strokeLinecap="round" 
                                    opacity="0.7" 
                                  />

                                  {/* Realistic Soft Wire Cast Shadow on Paper (Diffused, matches thin wire gauge) */}
                                  <path 
                                    d={`M ${leftHoleX + 0.8},${yBottom + 0.4} C 25,${yBottom + 1.8} 39,${yBottom + 1.8} ${rightHoleX - 0.8},${yBottom + 0.4}`} 
                                    stroke={wireShadowStroke} 
                                    strokeWidth="1.3" 
                                    strokeLinecap="round" 
                                    filter="url(#mockupWireShadowBlur)"
                                  />

                                  {/* Main Metallic Wire Arc (Enters perfectly through center of holes) */}
                                  <path 
                                    d={`M ${leftHoleX - 1.2},${yBottom} C 25,${yBottom - 2.2} 39,${yBottom - 2.2} ${rightHoleX + 1.2},${yBottom}`} 
                                    stroke="url(#mockupWireoMetallicGrad)" 
                                    strokeWidth="1.6" 
                                    strokeLinecap="round" 
                                  />

                                  {/* Specular Glint on Top Crest */}
                                  <path 
                                    d={`M 25,${yBottom - 1.5} C 29,${yBottom - 2.1} 35,${yBottom - 2.1} 39,${yBottom - 1.5}`} 
                                    stroke="rgba(255,255,255,0.85)" 
                                    strokeWidth="0.6" 
                                    strokeLinecap="round" 
                                  />

                                  {/* Contact Shadows inside the holes */}
                                  <ellipse cx={leftHoleX} cy={yBottom} rx="1.6" ry="1.1" fill="rgba(0,0,0,0.55)" />
                                  <ellipse cx={rightHoleX} cy={yBottom} rx="1.6" ry="1.1" fill="rgba(0,0,0,0.55)" />
                                </g>
                              );
                            })}
                          </svg>
                        </div>
                      )}

                    </div>
                  )}

                  {/* ============================================================ */}
                  {/* B. SINGLE PAGE / PÁGINA ÚNICA (FOCO INDIVIDUAL COM ENCADERNAÇÃO) */}
                  {/* ============================================================ */}
                  {mockupMode === 'single' && (
                    <div className="relative flex items-center mockup-book-stage">

                      {/* Floating Previous Page Quick Button beside Single Page */}
                      <button
                        onClick={(e) => { e.stopPropagation(); triggerFlipPrev(); }}
                        disabled={singlePageNum <= 1 || !!flipState}
                        className="no-print absolute -left-12 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700/80 shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 disabled:opacity-0 disabled:pointer-events-none cursor-pointer z-30"
                        title="Página anterior (Seta ←)"
                      >
                        <ChevronLeft className="w-5 h-5 text-amber-300" />
                      </button>

                      {/* --- THE SINGLE PAGE CONTAINER --- */}
                      <div 
                        onClick={() => { if (!flipState && singlePageNum < totalPages) triggerFlipNext(); }}
                        className={`relative bg-white rounded-xl overflow-hidden box-border group/singlepage ${
                          !flipState && singlePageNum < totalPages ? 'cursor-pointer' : ''
                        }`}
                        style={{
                          width: `${DISPLAY_PAGE_W * 1.15}px`,
                          height: `${DISPLAY_PAGE_H * 1.15}px`,
                          boxShadow: '0 20px 40px -10px rgba(0,0,0,0.3), inset 0 0 10px rgba(0,0,0,0.03)'
                        }}
                      >
                        {/* Stacked Pages Thickness Behind */}
                        <div 
                          className="absolute inset-0 rounded-xl pointer-events-none bg-stone-100 border border-stone-300/80"
                          style={{
                            transform: `translate(${coverThickness === 'thick' ? 8 : coverThickness === 'medium' ? 5 : 3}px, 4px)`,
                            zIndex: -1,
                            boxShadow: '3px 4px 8px rgba(0,0,0,0.15)'
                          }}
                        />

                        {/* Scaled Rendered Page Content */}
                        <div 
                          className="w-full h-full relative overflow-hidden mockup-page-wrapper"
                          style={{ width: `${DISPLAY_PAGE_W * 1.15}px`, height: `${DISPLAY_PAGE_H * 1.15}px` }}
                        >
                          <div 
                            style={{
                              width: `${BASE_PAGE_W_PX}px`,
                              height: `${BASE_PAGE_H_PX}px`,
                              transform: `scale(${SCALE_FACTOR * 1.15})`,
                              transformOrigin: 'top left'
                            }}
                          >
                            {flipState 
                              ? (flipState.direction === 'next' 
                                  ? getPageNode(flipState.targetSingle || singlePageNum) 
                                  : getPageNode(flipState.underSinglePage || singlePageNum))
                              : singlePageNode}
                          </div>
                        </div>

                        {/* Ribbon Bookmark */}
                        {showRibbon && (
                          <div 
                            className="absolute top-0 right-10 w-5 h-56 z-20 pointer-events-none shadow-md"
                            style={{
                              backgroundColor: ribbonColor,
                              transform: 'rotate(2deg) translateZ(8px)',
                              boxShadow: '2px 4px 6px rgba(0,0,0,0.25)',
                              clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 92%, 0 100%)'
                            }}
                          />
                        )}
                      </div>

                      {/* --- 3D TURNING LEAF OVERLAY IN SINGLE PAGE MODE --- */}
                      {flipState && (
                        <div 
                          className="absolute inset-0 z-25 pointer-events-none"
                          style={{
                            width: `${DISPLAY_PAGE_W * 1.15}px`,
                            height: `${DISPLAY_PAGE_H * 1.15}px`,
                            transformOrigin: 'left center',
                            transformStyle: 'preserve-3d',
                            animation: flipState.direction === 'next'
                              ? `singleFlipNext ${flipDuration}ms cubic-bezier(0.25, 1, 0.5, 1) forwards`
                              : `singleFlipPrev ${flipDuration}ms cubic-bezier(0.25, 1, 0.5, 1) forwards`
                          }}
                        >
                          <div 
                            className="w-full h-full bg-white rounded-xl overflow-hidden box-border"
                            style={{
                              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)'
                            }}
                          >
                            <div 
                              className="w-full h-full relative overflow-hidden mockup-page-wrapper"
                              style={{ width: `${DISPLAY_PAGE_W * 1.15}px`, height: `${DISPLAY_PAGE_H * 1.15}px` }}
                            >
                              <div 
                                style={{
                                  width: `${BASE_PAGE_W_PX}px`,
                                  height: `${BASE_PAGE_H_PX}px`,
                                  transform: `scale(${SCALE_FACTOR * 1.15})`,
                                  transformOrigin: 'top left'
                                }}
                              >
                                {flipState.direction === 'next'
                                  ? getPageNode(flipState.leafSinglePage || singlePageNum)
                                  : getPageNode(flipState.targetSingle || singlePageNum)
                                }
                              </div>
                            </div>
                            {/* Paper Sheen */}
                            <div 
                              className="absolute inset-0 pointer-events-none"
                              style={{
                                background: 'linear-gradient(to right, rgba(0,0,0,0.18) 0%, rgba(255,255,255,0.4) 30%, rgba(0,0,0,0.1) 100%)'
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Floating Next Page Quick Button beside Single Page */}
                      <button
                        onClick={(e) => { e.stopPropagation(); triggerFlipNext(); }}
                        disabled={singlePageNum >= totalPages || !!flipState}
                        className="no-print absolute -right-12 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700/80 shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 disabled:opacity-0 disabled:pointer-events-none cursor-pointer z-30"
                        title="Próxima página (Seta →)"
                      >
                        <ChevronRight className="w-5 h-5 text-amber-300" />
                      </button>

                      {/* --- UNIFIED LATERAL WIRE-O & HOLES OVERLAY (SINGLE PAGE) --- */}
                      {wireoFinish !== 'none' && wireoStyles && (
                        <div 
                          className="absolute top-0 bottom-0 pointer-events-none z-30 select-none"
                          style={{
                            left: '-16px',
                            width: '42px',
                            height: `${DISPLAY_PAGE_H * 1.15}px`,
                            transform: 'translateZ(4px)'
                          }}
                        >
                          <svg 
                            className="w-full h-full overflow-visible"
                            viewBox={`0 0 42 ${DISPLAY_PAGE_H * 1.15}`}
                            fill="none"
                          >
                            <defs>
                              <linearGradient id="mockupWireoMetallicGradSingle" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor={wireoStyles.wireHighlight} />
                                <stop offset="35%" stopColor={wireoStyles.wireColor} />
                                <stop offset="75%" stopColor={wireoStyles.wireShadow} />
                                <stop offset="100%" stopColor="#141416" />
                              </linearGradient>
                              <filter id="mockupWireShadowBlurSingle" x="-30%" y="-50%" width="160%" height="200%">
                                <feGaussianBlur in="SourceGraphic" stdDeviation="0.8" />
                              </filter>
                            </defs>

                            {Array.from({ length: wireoRingsCount }).map((_, idx) => {
                              const singleH = DISPLAY_PAGE_H * 1.15;
                              const pairSpacing = (singleH - 36) / wireoRingsCount;
                              const pairCenterY = 18 + idx * pairSpacing + pairSpacing / 2;
                              const yTop = pairCenterY - 3.8;
                              const yBottom = pairCenterY + 3.8;
                              const holeX = 26;

                              return (
                                <g key={`s-wire-pair-group-${idx}`}>
                                  {/* ========================================= */}
                                  {/* --- LOOP 1 (TOP) --- */}
                                  {/* ========================================= */}

                                  {/* Square Punched Hole */}
                                  <rect 
                                    x={holeX - 2.3} 
                                    y={yTop - 2.3} 
                                    width="4.6" 
                                    height="4.6" 
                                    rx="0.7" 
                                    fill={wireoStyles.holeBg} 
                                    stroke="rgba(0,0,0,0.4)" 
                                    strokeWidth="0.5" 
                                  />
                                  <rect 
                                    x={holeX - 2.1} 
                                    y={yTop - 2.1} 
                                    width="4.2" 
                                    height="1.8" 
                                    rx="0.5" 
                                    fill="rgba(0,0,0,0.55)" 
                                  />
                                  <line 
                                    x1={holeX - 2.3} 
                                    y1={yTop + 2.3} 
                                    x2={holeX + 2.3} 
                                    y2={yTop + 2.3} 
                                    stroke="rgba(255,255,255,0.45)" 
                                    strokeWidth="0.5" 
                                  />

                                  {/* Rear strand circling from under the notebook */}
                                  <path 
                                    d={`M 14,${yTop + 1.8} C 6,${yTop + 1.8} 3,${yTop + 1.0} 3,${yTop}`} 
                                    stroke={wireoStyles.wireShadow} 
                                    strokeWidth="1.4" 
                                    strokeLinecap="round" 
                                    opacity="0.7" 
                                  />

                                  {/* Realistic Soft Wire Cast Shadow on Paper (Diffused, matches thin wire gauge) */}
                                  <path 
                                    d={`M 16,${yTop + 1.2} C 19,${yTop + 1.2} 22,${yTop + 0.8} ${holeX - 0.5},${yTop + 0.3}`} 
                                    stroke={wireShadowStroke} 
                                    strokeWidth="1.3" 
                                    strokeLinecap="round" 
                                    filter="url(#mockupWireShadowBlurSingle)"
                                  />

                                  {/* Front Wire Loop circling from spine edge and entering straight through the hole */}
                                  <path 
                                    d={`M 3,${yTop} C 3,${yTop - 1.8} 9,${yTop - 1.8} 16,${yTop - 0.8} C 19,${yTop - 0.3} 22,${yTop} ${holeX + 1.2},${yTop}`} 
                                    stroke="url(#mockupWireoMetallicGradSingle)" 
                                    strokeWidth="1.6" 
                                    strokeLinecap="round" 
                                  />

                                  {/* Specular gleam on top crest */}
                                  <path 
                                    d={`M 4,${yTop - 1.2} C 9,${yTop - 1.6} 15,${yTop - 1.0} 20,${yTop - 0.3}`} 
                                    stroke="rgba(255,255,255,0.85)" 
                                    strokeWidth="0.6" 
                                    strokeLinecap="round" 
                                  />

                                  {/* Contact shadow inside hole */}
                                  <ellipse cx={holeX} cy={yTop} rx="1.6" ry="1.1" fill="rgba(0,0,0,0.55)" />

                                  {/* ========================================= */}
                                  {/* --- LOOP 2 (BOTTOM) --- */}
                                  {/* ========================================= */}

                                  {/* Square Punched Hole */}
                                  <rect 
                                    x={holeX - 2.3} 
                                    y={yBottom - 2.3} 
                                    width="4.6" 
                                    height="4.6" 
                                    rx="0.7" 
                                    fill={wireoStyles.holeBg} 
                                    stroke="rgba(0,0,0,0.4)" 
                                    strokeWidth="0.5" 
                                  />
                                  <rect 
                                    x={holeX - 2.1} 
                                    y={yBottom - 2.1} 
                                    width="4.2" 
                                    height="1.8" 
                                    rx="0.5" 
                                    fill="rgba(0,0,0,0.55)" 
                                  />
                                  <line 
                                    x1={holeX - 2.3} 
                                    y1={yBottom + 2.3} 
                                    x2={holeX + 2.3} 
                                    y2={yBottom + 2.3} 
                                    stroke="rgba(255,255,255,0.45)" 
                                    strokeWidth="0.5" 
                                  />

                                  {/* Rear strand circling from under the notebook */}
                                  <path 
                                    d={`M 14,${yBottom + 1.8} C 6,${yBottom + 1.8} 3,${yBottom + 1.0} 3,${yBottom}`} 
                                    stroke={wireoStyles.wireShadow} 
                                    strokeWidth="1.4" 
                                    strokeLinecap="round" 
                                    opacity="0.7" 
                                  />

                                  {/* Realistic Soft Wire Cast Shadow on Paper (Diffused, matches thin wire gauge) */}
                                  <path 
                                    d={`M 16,${yBottom + 1.2} C 19,${yBottom + 1.2} 22,${yBottom + 0.8} ${holeX - 0.5},${yBottom + 0.3}`} 
                                    stroke={wireShadowStroke} 
                                    strokeWidth="1.3" 
                                    strokeLinecap="round" 
                                    filter="url(#mockupWireShadowBlurSingle)"
                                  />

                                  {/* Front Wire Loop circling from spine edge and entering straight through the hole */}
                                  <path 
                                    d={`M 3,${yBottom} C 3,${yBottom - 1.8} 9,${yBottom - 1.8} 16,${yBottom - 0.8} C 19,${yBottom - 0.3} 22,${yBottom} ${holeX + 1.2},${yBottom}`} 
                                    stroke="url(#mockupWireoMetallicGradSingle)" 
                                    strokeWidth="1.6" 
                                    strokeLinecap="round" 
                                  />

                                  {/* Specular gleam on top crest */}
                                  <path 
                                    d={`M 4,${yBottom - 1.2} C 9,${yBottom - 1.6} 15,${yBottom - 1.0} 20,${yBottom - 0.3}`} 
                                    stroke="rgba(255,255,255,0.85)" 
                                    strokeWidth="0.6" 
                                    strokeLinecap="round" 
                                  />

                                  {/* Contact shadow inside hole */}
                                  <ellipse cx={holeX} cy={yBottom} rx="1.6" ry="1.1" fill="rgba(0,0,0,0.55)" />
                                </g>
                              );
                            })}
                          </svg>
                        </div>
                      )}

                    </div>
                  )}

                  {/* --- STATIONERY PROP: LUXURY SLENDER PEN --- */}
                  {showPen && (
                    <div 
                      className="absolute right-[-65px] top-[15%] w-3.5 h-[280px] rounded-full pointer-events-none z-40 transition-transform"
                      style={{
                        transform: 'rotate(-12deg) translateZ(25px)',
                        background: 'linear-gradient(to right, #1e293b 0%, #475569 40%, #0f172a 70%, #334155 100%)',
                        boxShadow: '12px 18px 24px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.4)'
                      }}
                    >
                      {/* Metallic Gold Pen Tip & Clip */}
                      <div className="absolute top-0 inset-x-0 h-6 bg-gradient-to-r from-amber-600 via-amber-300 to-amber-700 rounded-t-full" />
                      <div className="absolute top-6 left-0.5 w-1 h-14 bg-amber-400 rounded-full shadow-sm" />
                      <div className="absolute bottom-0 inset-x-0 h-5 bg-gradient-to-r from-amber-600 via-amber-300 to-amber-700 rounded-b-full" />
                    </div>
                  )}

                </div>
              </div>

            </div>
          </div>

          {/* OFFSCREEN STAGING CONTAINER FOR HIGH-SPEED VIDEO PAGE TEXTURE CAPTURE */}
          <div
            style={{
              position: 'fixed',
              left: '-9999px',
              top: '0px',
              width: `${BASE_PAGE_W_PX}px`,
              height: `${BASE_PAGE_H_PX}px`,
              pointerEvents: 'none',
              zIndex: -50,
              overflow: 'hidden',
              background: '#ffffff'
            }}
          >
            <div
              ref={videoStagingPageRef}
              style={{
                width: `${BASE_PAGE_W_PX}px`,
                height: `${BASE_PAGE_H_PX}px`,
                background: '#ffffff',
                overflow: 'hidden',
                position: 'relative'
              }}
            >
              {stagingPageNum !== null ? getPageNode(stagingPageNum) : null}
            </div>
          </div>

          {/* MP4 VIDEO EXPORT MODAL FOR WHATSAPP */}
          {videoModalOpen && (
            <div
              className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
              onClick={() => {
                if (!isGeneratingVideo) setVideoModalOpen(false);
              }}
            >
              <div
                className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden text-slate-100 my-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="px-5 py-4 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-600/25">
                      <Film className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                        <span>Vídeo do Mockup em MP4</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Pronto p/ WhatsApp
                        </span>
                      </h2>
                      <p className="text-[11px] text-slate-400">
                        Gera um vídeo realista folheando a agenda para enviar direto ao seu cliente.
                      </p>
                    </div>
                  </div>
                  {!isGeneratingVideo && (
                    <button
                      onClick={() => setVideoModalOpen(false)}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Modal Body */}
                <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
                  {/* 1. Roteiro de Páginas */}
                  <div>
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                      1. Quais páginas folhear no vídeo?
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        disabled={isGeneratingVideo}
                        onClick={() => setVideoPagePreset('smart_showcase')}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          videoPagePreset === 'smart_showcase'
                            ? 'bg-emerald-600/20 border-emerald-500 text-white ring-1 ring-emerald-500/50'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-xs font-bold text-white">✨ Resumo p/ Cliente</span>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                            Recomendado
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 block">
                          Iniciais + Calendário + Início do Miolo e amostra dos meses
                        </span>
                      </button>

                      <button
                        type="button"
                        disabled={isGeneratingVideo}
                        onClick={() => setVideoPagePreset('from_current')}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          videoPagePreset === 'from_current'
                            ? 'bg-emerald-600/20 border-emerald-500 text-white ring-1 ring-emerald-500/50'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                        }`}
                      >
                        <span className="text-xs font-bold block text-white">📖 A partir da Página Atual</span>
                        <span className="text-[10px] text-slate-400 block">
                          Folheia sequencialmente a partir da pág. {mockupMode === 'spread' ? leftPageNum : singlePageNum}
                        </span>
                      </button>

                      <button
                        type="button"
                        disabled={isGeneratingVideo}
                        onClick={() => setVideoPagePreset('all_months')}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          videoPagePreset === 'all_months'
                            ? 'bg-emerald-600/20 border-emerald-500 text-white ring-1 ring-emerald-500/50'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                        }`}
                      >
                        <span className="text-xs font-bold block text-white">📅 Iniciais + Todos os Meses</span>
                        <span className="text-[10px] text-slate-400 block">
                          Mostra as iniciais e a abertura de cada mês do ano
                        </span>
                      </button>

                      <button
                        type="button"
                        disabled={isGeneratingVideo}
                        onClick={() => setVideoPagePreset('custom_range')}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          videoPagePreset === 'custom_range'
                            ? 'bg-emerald-600/20 border-emerald-500 text-white ring-1 ring-emerald-500/50'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                        }`}
                      >
                        <span className="text-xs font-bold block text-white">🎯 Intervalo Personalizado</span>
                        <span className="text-[10px] text-slate-400 block">
                          Escolha exatamente a página inicial e final
                        </span>
                      </button>
                    </div>

                    {/* Extra options for 'from_current' or 'custom_range' */}
                    {videoPagePreset === 'from_current' && (
                      <div className="mt-2.5 p-3 bg-slate-950/70 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
                        <span className="text-xs text-slate-300 font-medium">Quantidade de viradas de página:</span>
                        <div className="flex items-center gap-1.5">
                          {[4, 6, 10, 14].map((cnt) => (
                            <button
                              key={cnt}
                              type="button"
                              disabled={isGeneratingVideo}
                              onClick={() => setVideoFromCurrentCount(cnt)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                                videoFromCurrentCount === cnt
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-slate-800 text-slate-400 hover:text-white'
                              }`}
                            >
                              {cnt}x
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {videoPagePreset === 'custom_range' && (
                      <div className="mt-2.5 p-3 bg-slate-950/70 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-300">Da pág.</span>
                          <input
                            type="number"
                            min={1}
                            max={totalPages}
                            value={videoRangeStart}
                            onChange={(e) => setVideoRangeStart(Math.max(1, Math.min(totalPages, parseInt(e.target.value) || 1)))}
                            className="w-16 px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs font-bold text-center text-white"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-300">até a pág.</span>
                          <input
                            type="number"
                            min={1}
                            max={totalPages}
                            value={videoRangeEnd}
                            onChange={(e) => setVideoRangeEnd(Math.max(1, Math.min(totalPages, parseInt(e.target.value) || 1)))}
                            className="w-16 px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs font-bold text-center text-white"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 2. Formato / Proporção para WhatsApp */}
                  <div>
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                      2. Formato do Vídeo (Proporção)
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        disabled={isGeneratingVideo}
                        onClick={() => setVideoFormatPreset('whatsapp_landscape')}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                          videoFormatPreset === 'whatsapp_landscape'
                            ? 'bg-emerald-600/20 border-emerald-500 text-white ring-1 ring-emerald-500/50'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <Monitor className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-bold">Horizontal HD</span>
                        <span className="text-[10px] text-slate-400">16:9 • Chat WhatsApp</span>
                      </button>

                      <button
                        type="button"
                        disabled={isGeneratingVideo}
                        onClick={() => setVideoFormatPreset('whatsapp_square')}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                          videoFormatPreset === 'whatsapp_square'
                            ? 'bg-emerald-600/20 border-emerald-500 text-white ring-1 ring-emerald-500/50'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <Grid className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-bold">Quadrado 1:1</span>
                        <span className="text-[10px] text-slate-400">WhatsApp & Feed</span>
                      </button>

                      <button
                        type="button"
                        disabled={isGeneratingVideo}
                        onClick={() => setVideoFormatPreset('whatsapp_vertical')}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                          videoFormatPreset === 'whatsapp_vertical'
                            ? 'bg-emerald-600/20 border-emerald-500 text-white ring-1 ring-emerald-500/50'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <Smartphone className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-bold">Vertical 9:16</span>
                        <span className="text-[10px] text-slate-400">Status & Reels</span>
                      </button>
                    </div>
                  </div>

                  {/* 3. Velocidade & Opções */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                      <span className="text-[11px] font-bold text-slate-300 block mb-2">Ritmo do Folheamento:</span>
                      <div className="grid grid-cols-3 gap-1.5">
                        {(['fast', 'normal', 'smooth'] as const).map((spd) => (
                          <button
                            key={`vid-spd-${spd}`}
                            type="button"
                            disabled={isGeneratingVideo}
                            onClick={() => setVideoSpeedPreset(spd)}
                            className={`py-1.5 px-2 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${
                              videoSpeedPreset === spd
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            {spd === 'fast' ? 'Rápido' : spd === 'normal' ? 'Normal' : 'Suave'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex flex-col justify-center gap-2">
                      <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
                        <input
                          type="checkbox"
                          disabled={isGeneratingVideo}
                          checked={videoShowPageBadge}
                          onChange={(e) => setVideoShowPageBadge(e.target.checked)}
                          className="rounded border-slate-700 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="font-semibold">Exibir legenda da página/mês</span>
                      </label>
                      <span className="text-[10px] text-slate-400">
                        Total programado: <strong className="text-emerald-300">{previewStepsCount} cenas</strong> com seu cenário e espiral atuais.
                      </span>
                    </div>
                  </div>

                  {/* Progress Indicator while Generating */}
                  {isGeneratingVideo && (
                    <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-xl space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 font-bold text-emerald-300">
                          <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                          <span>{videoStatusText || 'Gerando vídeo MP4...'}</span>
                        </div>
                        <span className="font-mono font-bold text-emerald-200">{videoProgress}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-200"
                          style={{ width: `${Math.max(4, videoProgress)}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>O download iniciará automaticamente ao concluir.</span>
                        <button
                          type="button"
                          onClick={() => { cancelVideoRef.current = true; }}
                          className="text-rose-400 hover:text-rose-300 font-semibold cursor-pointer underline"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Video Preview Player once generated */}
                  {!isGeneratingVideo && generatedVideoUrl && (
                    <div className="p-3.5 bg-slate-950/90 border border-emerald-500/40 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span>Vídeo MP4 Pronto para o Cliente!</span>
                        </span>
                        {generatedVideoBlob && (
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                            {(generatedVideoBlob.size / (1024 * 1024)).toFixed(1)} MB • MP4
                          </span>
                        )}
                      </div>

                      <div className="rounded-lg overflow-hidden bg-black border border-slate-800 flex items-center justify-center max-h-56">
                        <video
                          src={generatedVideoUrl}
                          controls
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="max-h-56 w-auto mx-auto"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (generatedVideoBlob) {
                              triggerVideoFileDownload(generatedVideoBlob, generatedVideoFilename || 'Mockup-Agenda.mp4');
                              showToast('✨ Download do MP4 iniciado!');
                            }
                          }}
                          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 cursor-pointer transition-all"
                        >
                          <Download className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Baixar MP4 Novamente</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleShareVideoWhatsApp}
                          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/25 cursor-pointer transition-all"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          <span>Enviar / Compartilhar no WhatsApp</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="px-5 py-3.5 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    disabled={isGeneratingVideo}
                    onClick={() => setVideoModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-40"
                  >
                    Fechar
                  </button>

                  <button
                    type="button"
                    disabled={isGeneratingVideo}
                    onClick={handleGenerateVideoMP4}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-600/25 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    {isGeneratingVideo ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Gerando Vídeo MP4...</span>
                      </>
                    ) : (
                      <>
                        <Video className="w-4 h-4" />
                        <span>Gerar e Baixar Vídeo MP4</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 3D Page Flip Keyframe Animations */}
          <style>{`
            @keyframes flipNextLeaf {
              0% {
                transform: rotateY(0deg);
              }
              30% {
                transform: rotateY(-45deg) skewY(-2.5deg);
              }
              60% {
                transform: rotateY(-125deg) skewY(2deg);
              }
              100% {
                transform: rotateY(-180deg);
              }
            }

            @keyframes flipPrevLeaf {
              0% {
                transform: rotateY(0deg);
              }
              30% {
                transform: rotateY(45deg) skewY(2.5deg);
              }
              60% {
                transform: rotateY(125deg) skewY(-2deg);
              }
              100% {
                transform: rotateY(180deg);
              }
            }

            @keyframes underShadowLift {
              0% { opacity: 0; }
              30% { opacity: 0.24; }
              70% { opacity: 0.12; }
              100% { opacity: 0; }
            }

            @keyframes landingShadowFall {
              0% { opacity: 0; }
              40% { opacity: 0.08; }
              75% { opacity: 0.28; }
              100% { opacity: 0; }
            }

            @keyframes singleFlipNext {
              0% {
                transform: rotateY(0deg);
                opacity: 1;
              }
              40% {
                transform: rotateY(-60deg) skewY(-3deg);
                opacity: 0.95;
              }
              100% {
                transform: rotateY(-140deg) skewY(-4.5deg);
                opacity: 0;
              }
            }

            @keyframes singleFlipPrev {
              0% {
                transform: rotateY(-140deg) skewY(-4.5deg);
                opacity: 0;
              }
              40% {
                transform: rotateY(-60deg) skewY(-3deg);
                opacity: 0.95;
              }
              100% {
                transform: rotateY(0deg);
                opacity: 1;
              }
            }

            .mockup-book-stage {
              transform-style: preserve-3d;
            }
          `}</style>

          {/* Toast Notification */}
          {toastMessage && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 border border-amber-500/40 text-amber-200 px-5 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-bottom-3 duration-200 backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{toastMessage}</span>
            </div>
          )}

        </main>
      </div>

    </div>
  );
};
