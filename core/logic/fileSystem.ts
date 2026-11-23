import { AgendaConfig, CustomTemplateItem } from '../../types';
import {
  CURRENT_PROJECT_SCHEMA_VERSION,
  migrateCustomTemplatesArray,
  migrateProjectConfig,
  unwrapRawProjectData,
} from './projectMigration';

let lastExportObjectUrl: string | null = null;

function appendJsonToParts(value: any, parts: BlobPart[], depth = 0): void {
  if (value && typeof value === 'object' && typeof value.toJSON === 'function') {
    value = value.toJSON();
  }

  if (value === undefined || typeof value === 'function' || typeof value === 'symbol') {
    parts.push('null');
    return;
  }

  if (value === null || typeof value !== 'object' || depth >= 4) {
    parts.push(JSON.stringify(value));
    return;
  }

  if (Array.isArray(value)) {
    parts.push('[');
    for (let i = 0; i < value.length; i++) {
      if (i > 0) parts.push(',');
      appendJsonToParts(value[i], parts, depth + 1);
    }
    parts.push(']');
    return;
  }

  parts.push('{');
  let firstKey = true;
  for (const key of Object.keys(value)) {
    const propVal = value[key];
    if (propVal === undefined || typeof propVal === 'function' || typeof propVal === 'symbol') {
      continue;
    }
    if (!firstKey) parts.push(',');
    firstKey = false;
    parts.push(`${JSON.stringify(key)}:`);
    appendJsonToParts(propVal, parts, depth + 1);
  }
  parts.push('}');
}

/**
 * Serializa o projeto em partes (BlobParts) para evitar o limite de tamanho de string
 * da engine JavaScript em projetos grandes com várias páginas/fundos/capas em alta resolução,
 * e mantém a URL ativa tempo suficiente mesmo se a aluna demorar na janela "Salvar como".
 */
export const exportProject = (config: AgendaConfig) => {
  if (lastExportObjectUrl) {
    try {
      URL.revokeObjectURL(lastExportObjectUrl);
    } catch (_) {}
    lastExportObjectUrl = null;
  }

  const exportPayload: AgendaConfig = {
    ...config,
    schemaVersion: CURRENT_PROJECT_SCHEMA_VERSION,
  };

  const parts: BlobPart[] = [];
  appendJsonToParts(exportPayload, parts, 0);

  const blob = new Blob(parts, { type: 'application/json;charset=utf-8' });
  if (blob.size <= 2) {
    throw new Error('Falha ao gerar os dados do projeto para salvamento.');
  }

  const url = URL.createObjectURL(blob);
  lastExportObjectUrl = url;

  const link = document.createElement('a');
  link.href = url;
  const safeName = config.name
    ? config.name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9-_]/gi, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '')
        .toLowerCase()
    : '';
  const fileName = safeName || `agenda-master-${config.year || new Date().getFullYear()}`;
  link.download = `${fileName}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Mantém a URL viva por 30 minutos (ou até o próximo salvamento) para não corromper
  // downloads caso a aluna demore escolhendo/criando pastas na janela "Salvar como".
  setTimeout(() => {
    if (lastExportObjectUrl === url) {
      lastExportObjectUrl = null;
    }
    try {
      URL.revokeObjectURL(url);
    } catch (_) {}
  }, 30 * 60_000);
};

/**
 * Normaliza e repara campos de um AgendaConfig importado (inclusive versões antigas),
 * preservando configurações originais e garantindo compatibilidade com Capas, Planners Semanais e Cadernos.
 */
export const normalizeImportedProjectConfig = (raw: any): AgendaConfig => {
  return migrateProjectConfig(raw);
};

export type ImportedJsonPayload =
  | { kind: 'project'; config: AgendaConfig }
  | { kind: 'templates'; templates: CustomTemplateItem[] };

export const normalizeCustomTemplatesArray = (items: any[]): CustomTemplateItem[] => {
  return migrateCustomTemplatesArray(items);
};

const readAndParseJsonFile = async (file: File): Promise<any> => {
  if (!file) {
    throw new Error('Nenhum arquivo selecionado.');
  }

  if (file.size === 0) {
    throw new Error(
      'O arquivo selecionado está vazio (0 KB). O download anterior provavelmente foi interrompido antes de concluir.'
    );
  }

  let content = '';
  try {
    content = await file.text();
  } catch (_) {
    content = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(String(e.target?.result || ''));
      reader.onerror = () => reject(new Error('Não foi possível ler o arquivo selecionado do seu dispositivo.'));
      reader.readAsText(file);
    });
  }

  const cleaned = content.replace(/^\uFEFF/, '').trim();
  if (!cleaned) {
    throw new Error('O arquivo selecionado está em branco.');
  }

  try {
    return JSON.parse(cleaned);
  } catch (_) {
    if (!cleaned.endsWith('}') && !cleaned.endsWith(']')) {
      throw new Error(
        'O arquivo parece estar incompleto (cortado antes do final). Isso acontece quando o navegador fecha ou interrompe o download antes de terminar de salvar.'
      );
    }
    throw new Error('O conteúdo do arquivo está corrompido ou não é um arquivo .json válido.');
  }
};

/**
 * Importa tanto um Projeto completo quanto um pacote de "Meus Modelos" (.json),
 * identificando automaticamente o formato do arquivo.
 */
export const importProjectOrTemplates = async (file: File): Promise<ImportedJsonPayload> => {
  const parsed = await readAndParseJsonFile(file);

  if (Array.isArray(parsed)) {
    const templates = normalizeCustomTemplatesArray(parsed);
    if (templates.length > 0) {
      return { kind: 'templates', templates };
    }
    throw new Error('Nenhum modelo ou projeto válido foi encontrado dentro deste arquivo .json.');
  }

  const unwrapped = unwrapRawProjectData(parsed);

  // Caso seja um único modelo exportado isoladamente (sem campos de projeto completo)
  const isSingleStandaloneTemplate =
    unwrapped &&
    typeof unwrapped === 'object' &&
    unwrapped.year === undefined &&
    !unwrapped.margins &&
    !unwrapped.introPages &&
    !unwrapped.cover &&
    (unwrapped.templateType === 'miolo' ||
      unwrapped.templateType === 'page' ||
      String(unwrapped.id || '').startsWith('miolo-') ||
      String(unwrapped.id || '').startsWith('custom-'));

  if (isSingleStandaloneTemplate) {
    const templates = normalizeCustomTemplatesArray([unwrapped]);
    if (templates.length > 0) {
      return { kind: 'templates', templates };
    }
  }

  return { kind: 'project', config: normalizeImportedProjectConfig(unwrapped) };
};

/**
 * Importa a configuração da agenda de um arquivo JSON com diagnóstico claro de erros.
 */
export const importProject = async (file: File): Promise<AgendaConfig> => {
  const result = await importProjectOrTemplates(file);
  if (result.kind === 'templates') {
    throw new Error(
      'Este arquivo é um pacote de "Meus Modelos".'
    );
  }
  return result.config;
};
