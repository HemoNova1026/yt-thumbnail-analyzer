import React from 'react';
import { Star, Sparkles } from 'lucide-react';
import { ThumbnailData } from '../types';

interface ThumbnailCardProps {
  data: ThumbnailData;
  rank: number;
  onAnalyze: (data: ThumbnailData) => void;
}

const ThumbnailCard: React.FC<ThumbnailCardProps> = ({ data, rank, onAnalyze }) => {
  // Determine color based on CTR
  const getCtrColor = (ctr: number) => {
    if (ctr >= 8) return 'text-green-400';
    if (ctr >= 5) return 'text-yellow-400';
    return 'text-red-400';
  };

  // Determine border based on Rating
  const getRatingStyle = (rating: string) => {
    const r = rating.toUpperCase().trim();
    if (r.includes('S')) return 'border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)]';
    if (r.includes('A')) return 'border-green-500';
    if (r.includes('B')) return 'border-blue-500';
    return 'border-slate-700';
  };

  return (
    <div className={`group relative bg-slate-800/40 rounded-xl border ${getRatingStyle(data.rating)} overflow-hidden transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-2xl flex flex-col`}>
      
      {/* Rank Badge */}
      <div className="absolute top-2 left-2 z-10 bg-black/80 backdrop-blur text-white text-xs font-bold px-2.5 py-1 rounded-md border border-white/10">
        #{rank}
      </div>

      {/* Image Container */}
      <div className="aspect-video w-full overflow-hidden bg-slate-900 relative">
        <img 
          src={data.thumbnailUrl} 
          alt={data.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://placehold.co/600x400/1e293b/475569?text=${encodeURIComponent('No Image')}`;
          }}
        />
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60"></div>
        
        {/* Quick CTR Overlay on Image */}
        <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur px-2 py-1 rounded flex items-center gap-1 border border-white/10">
            <span className={`font-bold ${getCtrColor(data.ctr)}`}>{data.ctr}%</span>
            <span className="text-[10px] text-slate-400 uppercase">CTR</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="text-sm font-medium text-slate-100 line-clamp-2 mb-3 h-10 leading-snug tracking-wide" title={data.title}>
          {data.title}
        </h3>

        {/* Data Row - Just Rating now */}
        <div className="mb-4 mt-auto">
          <div className="flex flex-col items-start p-2 rounded-lg bg-slate-700/30 border border-slate-700/50">
            <span className="text-[10px] text-slate-400 flex items-center gap-1 mb-0.5"><Star size={10} /> 演算法評級</span>
            <span className="text-sm font-semibold text-slate-200">{data.rating}</span>
          </div>
        </div>

        <button 
          onClick={() => onAnalyze(data)}
          className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/20"
        >
          <Sparkles size={14} /> AI 縮圖分析
        </button>
      </div>
    </div>
  );
};

export default ThumbnailCard;