import React from 'react';
import { TrendingUp, Users, Activity } from 'lucide-react';

interface StatsCardProps {
  label: string;
  value: string;
  subtext?: string;
  icon: 'trending' | 'users' | 'activity';
  color: 'blue' | 'green' | 'purple';
}

const StatsCard: React.FC<StatsCardProps> = ({ label, value, subtext, icon, color }) => {
  const getIcon = () => {
    switch(icon) {
      case 'trending': return <TrendingUp className={`w-6 h-6 text-${color}-400`} />;
      case 'users': return <Users className={`w-6 h-6 text-${color}-400`} />;
      case 'activity': return <Activity className={`w-6 h-6 text-${color}-400`} />;
    }
  };

  const colors = {
    blue: 'bg-blue-500/10 border-blue-500/20',
    green: 'bg-green-500/10 border-green-500/20',
    purple: 'bg-purple-500/10 border-purple-500/20',
  };

  return (
    <div className={`p-5 rounded-xl border ${colors[color]} backdrop-blur-sm flex items-start justify-between transition-all hover:bg-opacity-20`}>
      <div>
        <p className="text-slate-400 text-xs font-medium mb-1 uppercase tracking-wider">{label}</p>
        <h3 className="text-2xl font-bold text-white mb-1 tracking-tight">{value}</h3>
        {subtext && <p className="text-xs text-slate-500 font-medium">{subtext}</p>}
      </div>
      <div className={`p-3 rounded-lg bg-slate-800/80 ring-1 ring-white/5`}>
        {getIcon()}
      </div>
    </div>
  );
};

export default StatsCard;