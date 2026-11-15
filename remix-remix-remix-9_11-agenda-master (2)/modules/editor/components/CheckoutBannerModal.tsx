import React from 'react';
import { X, Download, CheckCircle, Image as ImageIcon, Sparkles, ExternalLink } from 'lucide-react';

interface CheckoutBannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CheckoutBannerModal: React.FC<CheckoutBannerModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleDownload = (filename: string, label: string) => {
    const link = document.createElement('a');
    link.href = `/${filename}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl p-6 sm:p-8 text-stone-200 my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-stone-400 hover:text-white bg-stone-800 hover:bg-stone-700 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-2xl">
            <ImageIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              Banner Lateral de Checkout
              <span className="text-xs bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded-full font-semibold">
                360 × 900 px
              </span>
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              Ideal para a coluna lateral da Kiwify, Hotmart, Eduzz e plataformas de checkout
            </p>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Visual Preview */}
          <div className="md:col-span-5 flex flex-col items-center justify-center bg-stone-950 border border-stone-800 p-4 rounded-2xl shadow-inner">
            <div className="relative group max-h-[520px] overflow-hidden rounded-xl shadow-lg border border-stone-800">
              <img
                src="/banner-checkout-duvidas-360x900.jpg"
                alt="Banner de Dúvidas do Agenda Master"
                className="max-h-[520px] w-auto object-contain mx-auto"
                onError={(e) => {
                  // Fallback to high res if needed
                  (e.currentTarget as HTMLImageElement).src = '/banner-checkout-duvidas.jpg';
                }}
              />
            </div>
            <p className="text-[11px] text-stone-500 mt-3 text-center">
              💡 Você também pode clicar com o <b>botão direito na imagem acima</b> e escolher <b>"Salvar imagem como..."</b>.
            </p>
          </div>

          {/* Details & Download Options */}
          <div className="md:col-span-7 space-y-6">
            {/* Doubts Answered Box */}
            <div className="bg-stone-850 border border-stone-800/80 rounded-2xl p-5 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                Respostas incluídas no banner
              </h3>
              <ul className="space-y-2 text-xs text-stone-300">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white">Cria agendas 1 e 2 dias por página?</span>
                    <p className="text-stone-400 text-[11px]">Sim! 1 DPP, 2 DPP e Permanente com 1 clique.</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white">Tem versículos bíblicos?</span>
                    <p className="text-stone-400 text-[11px]">Sim! Mais de 365 versículos diários automáticos.</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white">Faz planners e cadernos?</span>
                    <p className="text-stone-400 text-[11px]">Sim! Planners semanais, financeiros, blocos e pautados.</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white">Tem modelos prontos?</span>
                    <p className="text-stone-400 text-[11px]">Sim! Dezenas de miolos prontos para editar e imprimir.</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white">Exporta em PDF pronto para imprimir?</span>
                    <p className="text-stone-400 text-[11px]">Sim! Arquivo em alta resolução pronto para gráfica ou ateliê.</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Download Buttons */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                Escolha a resolução para baixar:
              </h3>
              
              <button
                onClick={() => handleDownload('banner-checkout-duvidas-360x900.jpg', 'Banner 360x900')}
                className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs uppercase tracking-wider py-3.5 px-5 rounded-2xl shadow-lg shadow-orange-600/30 transition-all flex items-center justify-between active:scale-98 cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Download className="w-4 h-4" />
                  <span>Baixar Tamanho Padrão (360 × 900 px)</span>
                </div>
                <span className="text-[10px] bg-black/20 px-2.5 py-1 rounded-lg font-mono">Recomendado</span>
              </button>

              <button
                onClick={() => handleDownload('banner-checkout-duvidas-720x1800.jpg', 'Banner 720x1800')}
                className="w-full bg-stone-800 hover:bg-stone-750 text-stone-200 hover:text-white font-bold text-xs py-3 px-5 rounded-2xl border border-stone-700 transition-all flex items-center justify-between active:scale-98 cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Download className="w-4 h-4 text-orange-400" />
                  <span>Baixar em Alta Resolução (720 × 1800 px)</span>
                </div>
                <span className="text-[10px] text-stone-400 font-mono">Retina / 2x</span>
              </button>

              <button
                onClick={() => handleDownload('banner-checkout-duvidas.jpg', 'Banner Original')}
                className="w-full bg-stone-800/60 hover:bg-stone-800 text-stone-300 hover:text-white font-medium text-xs py-2.5 px-5 rounded-2xl border border-stone-700/60 transition-all flex items-center justify-between active:scale-98 cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Download className="w-4 h-4 text-stone-400" />
                  <span>Baixar Arquivo Completo Original (768 × 1376 px)</span>
                </div>
                <span className="text-[10px] text-stone-500 font-mono">Original</span>
              </button>
            </div>

            {/* Instruction Tip */}
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200/90 text-[11px] leading-relaxed">
              <b>Onde colocar no checkout da Kiwify ou Hotmart:</b> No painel do seu produto, vá em <i>Checkout</i> &gt; <i>Aparência / Personalização</i> &gt; <i>Barra Lateral</i> e envie este arquivo baixado.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
