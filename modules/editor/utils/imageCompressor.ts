/**
 * Utilitário para compressão de imagens no cliente (navegador) utilizando HTML5 Canvas.
 * Evita travamentos e estouro de memória reduzindo imagens gigantescas antes do salvamento.
 */
export function compressImage(
  file: File,
  maxWidth = 1600,
  maxHeight = 1600,
  quality = 0.75
): Promise<string> {
  return new Promise((resolve) => {
    const mimeType = file.type || 'image/jpeg';
    
    // Fallback de leitura padrão (caso ocorra qualquer erro no processo de canvas)
    const fallbackToOriginal = () => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };
      reader.onerror = () => {
        resolve(''); // Retorna string vazia caso falhe tudo
      };
      reader.readAsDataURL(file);
    };

    // Validar se de fato é uma imagem
    if (!mimeType.startsWith('image/')) {
      fallbackToOriginal();
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        const img = new Image();
        img.onload = () => {
          try {
            let width = img.width;
            let height = img.height;

            // Redimensionar proporcionalmente respeitando o limite máximo
            if (width > height) {
              if (width > maxWidth) {
                height = Math.round((height * maxWidth) / width);
                width = maxWidth;
              }
            } else {
              if (height > maxHeight) {
                width = Math.round((width * maxHeight) / height);
                height = maxHeight;
              }
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
              fallbackToOriginal();
              return;
            }

            // Tratar transparência: se for PNG/GIF mantém transparente, senão preenche com fundo branco
            const isPng = mimeType === 'image/png' || mimeType === 'image/gif';
            if (!isPng) {
              ctx.fillStyle = '#FFFFFF';
              ctx.fillRect(0, 0, width, height);
            }

            // Desenhar imagem no canvas redimensionada
            ctx.drawImage(img, 0, 0, width, height);

            // Determinar o formato de saída
            const outputMimeType = isPng ? 'image/png' : 'image/jpeg';
            
            // Exportar base64 comprimido
            const dataUrl = canvas.toDataURL(outputMimeType, quality);
            resolve(dataUrl);
          } catch (err) {
            console.error('Erro ao processar compressão de imagem com Canvas:', err);
            fallbackToOriginal();
          }
        };

        img.onerror = () => {
          fallbackToOriginal();
        };

        if (readerEvent.target?.result) {
          img.src = readerEvent.target.result as string;
        } else {
          fallbackToOriginal();
        }
      };

      reader.onerror = () => {
        fallbackToOriginal();
      };

      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Erro na inicialização da leitura do arquivo:', err);
      fallbackToOriginal();
    }
  });
}
