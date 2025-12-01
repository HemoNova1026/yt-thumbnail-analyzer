import React, { useEffect, useState, useMemo } from 'react';
import { ArrowDownUp, LayoutGrid, AlertCircle } from 'lucide-react';
import { fetchSheetData } from './services/dataService';
import { analyzeThumbnail } from './services/geminiService';
import { ThumbnailData, SortOption } from './types';
import ThumbnailCard from './components/ThumbnailCard';
import AnalysisModal from './components/AnalysisModal';

const App: React.FC = () => {
  const [data, setData] = useState<ThumbnailData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState<SortOption>('ctr-desc');
  const [useMock, setUseMock] = useState(false);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<ThumbnailData | null>(null);

  // Initialize data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const result = await fetchSheetData();
      setData(result);
      
      // Check if we fell back to mock data (simple heuristic: id starts with mock)
      if (result.length > 0 && result[0].id.startsWith('mock')) {
        setUseMock(true);
      } else {
        setUseMock(false);
      }
      
      setLoading(false);
    };
    loadData();
  }, []);

  // Sort Logic (Filtering removed)
  const processedData = useMemo(() => {
    // Clone array to avoid mutating state directly
    const sorted = [...data];

    return sorted.sort((a, b) => {
      switch (sortOption) {
        case 'ctr-desc': return b.ctr - a.ctr;
        case 'ctr-asc': return a.ctr - b.ctr;
        case 'rating-desc': return a.rating.localeCompare(b.rating);
        default: return 0;
      }
    });
  }, [data, sortOption]);

  const handleAnalyze = async (item: ThumbnailData) => {
    setSelectedItem(item);
    setIsModalOpen(true);
    setAnalyzing(true);
    setAnalysisResult(null);
    
    const result = await analyzeThumbnail(item);
    setAnalysisResult(result);
    setAnalyzing(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 pb-12 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <LayoutGrid className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              YT 縮圖<span className="text-indigo-400">分析儀</span>
            </h1>
          </div>
          
          <div className="hidden md:flex items-center text-xs text-slate-500">
            資料來源: Google Sheets
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Mock Data Warning */}
        {useMock && !loading && (
          <div className="mb-6 bg-amber-900/30 border border-amber-800 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-amber-400 font-medium text-sm">無法載入即時資料</h3>
              <p className="text-amber-200/70 text-xs mt-1">
                我們目前顯示的是範例資料。這可能是因為 Google Sheet 的權限設定或跨域 (CORS) 限制。
                請確保您的試算表已發布到網路 (檔案 → 分享 → 發布到網路 → CSV)。
              </p>
            </div>
          </div>
        )}

        {/* Controls Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 items-center justify-between bg-slate-800/40 p-4 rounded-xl border border-slate-700/50">
          
          <div className="text-slate-300 font-medium">
             總共 {processedData.length} 張縮圖
          </div>

          {/* Sort Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-slate-400 font-medium px-2">排序方式:</span>
            
            <button 
              onClick={() => setSortOption('ctr-desc')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${sortOption === 'ctr-desc' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 border border-slate-700'}`}
            >
              CTR 高到低 <ArrowDownUp size={14} className="ml-1" />
            </button>
            
            <button 
              onClick={() => setSortOption('ctr-asc')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${sortOption === 'ctr-asc' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 border border-slate-700'}`}
            >
              CTR 低到高 <ArrowDownUp size={14} className="ml-1" />
            </button>
          </div>
        </div>

        {/* Grid Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-400">正在讀取試算表資料...</p>
          </div>
        ) : processedData.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {processedData.map((item, index) => (
              <ThumbnailCard 
                key={item.id} 
                data={item} 
                rank={index + 1}
                onAnalyze={handleAnalyze}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-slate-500 bg-slate-800/20 rounded-2xl border border-dashed border-slate-700">
            <p className="text-lg">沒有找到符合的縮圖資料</p>
          </div>
        )}
      </main>

      {/* Analysis Modal */}
      <AnalysisModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isLoading={analyzing}
        analysis={analysisResult}
        title={selectedItem?.title || ''}
      />
    </div>
  );
};

export default App;