import React from 'react';

export default function StrategyCard({ card, onExecute, theme, darkMode }) {
  if (!card) return null;

  const accent = theme?.accent || '#1dbfb0';

  return (
    <div 
      className="border rounded-[32px] p-8 max-w-lg flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-500 overflow-hidden relative"
      style={{ 
        backgroundColor: theme?.surfaceMid || '#1a1a1a', 
        borderColor: theme?.divider || 'rgba(255,255,255,0.08)',
        boxShadow: darkMode
          ? '0 25px 50px -12px rgba(0,0,0,0.5), 0 0 40px rgba(29,191,176,0.06)'
          : '0 25px 50px -12px rgba(0,0,0,0.08), 0 0 40px rgba(29,191,176,0.04)'
      }}
    >
      {/* Background Glow */}
      <div 
        className="absolute -top-24 -right-24 w-64 h-64 rounded-full blur-[100px] opacity-20 pointer-events-none"
        style={{ backgroundColor: accent }}
      />

      {/* Header */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
            style={{ 
              backgroundColor: 'rgba(29,191,176,0.1)',
              border: '1px solid rgba(29,191,176,0.2)'
            }}
          >
            <span className="material-symbols-outlined" style={{ color: accent, fontSize: 24 }}>verified</span>
          </div>
          <div>
            <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-0.5">Top Recommendation</p>
            <h3 className="font-bold text-xl tracking-tight" style={{ color: theme?.pageColor || '#f5f5f5' }}>{card.name || 'Meteora Strategy'}</h3>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div 
            className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter"
            style={{ backgroundColor: 'rgba(29,191,176,0.1)', color: accent }}
          >
            {card.risk || 'Balanced'} Risk
          </div>
          <div className="text-[10px] text-zinc-500 mt-1 font-medium">Confidence: {card.confidence || 90}%</div>
        </div>
      </div>

      {/* Main Stats Area */}
      <div className="grid grid-cols-2 gap-4 relative z-10">
        <div 
          className="p-5 rounded-[24px] flex flex-col gap-1 transition-transform hover:scale-[1.02]"
          style={{ backgroundColor: darkMode ? '#111' : '#F0ECE6', border: `1px solid ${theme?.divider || 'rgba(255,255,255,0.03)'}` }}
        >
          <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">Est. Annual Yield</span>
          <span className="text-2xl font-black tracking-tighter" style={{ color: accent }}>
            {card.apy || '0.00%'}
          </span>
        </div>
        <div 
          className="p-5 rounded-[24px] flex flex-col gap-1 transition-transform hover:scale-[1.02]"
          style={{ backgroundColor: darkMode ? '#111' : '#F0ECE6', border: `1px solid ${theme?.divider || 'rgba(255,255,255,0.03)'}` }}
        >
          <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">Pool Liquidity</span>
          <span className="text-2xl font-black tracking-tighter" style={{ color: theme?.pageColor || '#f5f5f5' }}>
            {card.tvl || '$0'}
          </span>
        </div>
      </div>

      {/* Rationale / Reason */}
      <div className="flex flex-col gap-3 relative z-10">
        <p className="text-zinc-400 text-xs leading-relaxed italic border-l-2 pl-4 py-1" style={{ borderColor: accent }}>
          "{card.confidence_reason || 'This pool shows strong volume-to-TVL ratios and high organic scores.'}"
        </p>
        
        {/* Risk Items */}
        {card.risks && card.risks.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-1">
            {card.risks.map((risk, i) => (
              <span key={i} className="text-[9px] px-2.5 py-1 rounded-md text-zinc-400" style={{ backgroundColor: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)', border: `1px solid ${theme?.divider || 'rgba(255,255,255,0.06)'}` }}>
                • {risk}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Action Button */}
      <button
        onClick={() => onExecute(card)}
        className="w-full py-5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all active:scale-95 group overflow-hidden relative z-10"
        style={{ backgroundColor: accent, color: '#111' }}
      >
        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
        <span className="material-symbols-outlined text-lg">rocket_launch</span>
        Deploy this Strategy
      </button>
    </div>
  );
}