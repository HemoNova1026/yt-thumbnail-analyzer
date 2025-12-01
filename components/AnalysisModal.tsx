import React from 'react';
import { X, Sparkles, Loader2 } from 'lucide-react';

interface AnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  analysis: string | null;
  title: string;
}

const AnalysisModal: React.FC<AnalysisModalProps> = ({ isOpen, onClose, isLoading, analysis, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] scale-100">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
          <div className="flex items-center gap-2 text-indigo-400">
            <Sparkles size={20} />
            <h2 className="font-semibold text-white">AI 縮圖成效分析</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          <h3 className="text-lg font-medium text-slate-200 mb-4 leading-snug">{title}</h3>
          
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
              <p className="text-slate-400 animate-pulse">正在分析縮圖視覺與數據...</p>
            </div>
          ) : (
            <div className="prose prose-invert prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-slate-300 leading-relaxed text-base">
                {analysis}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-800/30 text-xs text-slate-500 text-center">
          Powered by Gemini 2.5 Flash
        </div>
      </div>
    </div>
  );
};

export default AnalysisModal;