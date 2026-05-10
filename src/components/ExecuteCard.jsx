import React from 'react';

export default function ExecuteCard({ card, onExecute, theme: t, darkMode }) {
  if (!card) return null;

  const accent = t?.accent || '#1dbfb0';

  return (
    <div 
      className="border rounded-[24px] md:rounded-[32px] p-6 max-w-md flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-4 duration-500" 
      style={{ 
        backgroundColor: t?.cardGlass || '#1a1a1a', 
        borderColor: t?.divider || 'rgba(29,191,176,0.2)', 
        boxShadow: darkMode 
          ? '0 16px 40px -12px rgba(29,191,176,0.15)' 
          : '0 16px 40px -12px rgba(0,0,0,0.05)',
        backdropFilter: 'blur(20px)'
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center" 
          style={{ backgroundColor: 'rgba(29,191,176,0.1)', border: `1px solid ${accent}20` }}
        >
          <span className="material-symbols-outlined" style={{ color: accent, fontSize: 20 }}>auto_awesome</span>
        </div>
        <div>
          <p className="font-bold text-sm" style={{ color: t?.pageColor }}>Intent Execution Plan</p>
          <p className="text-zinc-500 text-[11px] uppercase tracking-wider font-semibold">Multiple steps → One signature</p>
        </div>
        <span 
          className="ml-auto px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter" 
          style={{ backgroundColor: 'rgba(29,191,176,0.1)', color: accent }}
        >
          1-Click
        </span>
      </div>

      {/* Steps */}
      <div className="flex flex-col gap-3">
        {card.steps?.map((step, i) => (
          <div key={i} className="flex items-start gap-4">
            <div className="flex flex-col items-center shrink-0">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-lg" 
                style={{ backgroundColor: accent, color: '#111' }}
              >
                {i + 1}
              </div>
              {i < card.steps.length - 1 && (
                <div className="w-[2px] h-10 mt-1" style={{ background: `linear-gradient(to bottom, ${accent}40, transparent)` }} />
              )}
            </div>
            <div 
              className="flex-1 p-4 rounded-[20px] transition-all hover:translate-x-1" 
              style={{ 
                backgroundColor: darkMode ? '#111' : '#F0ECE6', 
                border: `1px solid ${t?.divider || 'rgba(255,255,255,0.05)'}` 
              }}
            >
              <p className="font-bold text-xs uppercase tracking-wide" style={{ color: t?.pageColor }}>{step.action}</p>
              <p className="text-zinc-500 text-xs mt-1 leading-relaxed font-medium">{step.pool} — {step.reason}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Target pool stats */}
      <div className="grid grid-cols-2 gap-3 mt-2">
        <div 
          className="p-4 rounded-[20px] flex flex-col gap-1" 
          style={{ backgroundColor: darkMode ? '#111' : '#F0ECE6', border: `1px solid ${t?.divider}` }}
        >
          <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">Target Pool</span>
          <span className="font-bold text-sm truncate" style={{ color: t?.pageColor }}>{card.poolName}</span>
        </div>
        <div 
          className="p-4 rounded-[20px] flex flex-col gap-1" 
          style={{ backgroundColor: darkMode ? '#111' : '#F0ECE6', border: `1px solid ${t?.divider}` }}
        >
          <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">Est. APY</span>
          <span className="font-black text-sm" style={{ color: accent }}>{card.apy}</span>
        </div>
      </div>

      <button
        onClick={() => onExecute(card)}
        className="w-full py-5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all active:scale-95 group overflow-hidden relative"
        style={{ backgroundColor: accent, color: '#111' }}
      >
        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
        <span className="material-symbols-outlined text-lg">bolt</span>
        Sign & Execute Plan
      </button>
    </div>
  );
}