
import { AgendaConfig } from '../../types';

/**
 * Exporta a configuração da agenda para um arquivo JSON
 */
export const exportProject = (config: AgendaConfig) => {
  const data = JSON.stringify(config, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  const fileName = config.name ? config.name.replace(/[^a-z0-9]/gi, '_').toLowerCase() : `agenda-master-${config.year}`;
  link.download = `${fileName}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Importa a configuração da agenda de um arquivo JSON
 */
export const importProject = (file: File): Promise<AgendaConfig> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const config = JSON.parse(content) as AgendaConfig;
        
        // Validação básica
        if (!config.year || !config.elements || !config.introPages) {
          throw new Error('Arquivo de projeto inválido');
        }
        
        resolve(config);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Erro ao ler o arquivo'));
    reader.readAsText(file);
  });
};
