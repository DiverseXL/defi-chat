import React from 'react';

export default function SmartMoneyCard({ card, onCopy, theme: t, darkMode }) {
  if (!card) return null;

  const accent = t?.accent || '#1dbfb0';

  const formatAddress = (addr) => {
    if (!addr) return 'Unknown'
    if (addr.includes('...')) return addr
    return addr.slice(0, 4) + '...' + addr.slice(-4)
  }

  const formatPnl = (pnl) => {
    if (!pnl) return '+$0'
    if (typeof pnl === 'string') return pnl
    return `+$${Number(pnl.value || 0).toLocaleString()}`
  }

  return (
    <div 
      className="border rounded-[24px] md:rounded-[32px] p-6 max-w-md flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-4 duration-500" 
      style={{ 
        backgroundColor: t?.cardGlass || '#1a1a1a', 
        borderColor: t?.divider || 'rgba(255,255,255,0.08)', 
        boxShadow: darkMode 
          ? '0 16px 40px -12px rgba(29,191,176,0.1)' 
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
          <span className="material-symbols-outlined" style={{ color: accent, fontSize: 20 }}>psychology</span>
        </div>
        <div>
          <p className="font-bold text-sm" style={{ color: t?.pageColor }}>Smart Money Tracker</p>
          <p className="text-zinc-500 text-[11px] uppercase tracking-wider font-semibold">Top LP wallets — real on-chain data</p>
        </div>
        <span 
          className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-tighter uppercase" 
          style={{ backgroundColor: 'rgba(29,191,176,0.1)', color: accent }}
        >
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: accent }} />
          LIVE
        </span>
      </div>

      {/* Wallet list */}
      <div className="flex flex-col gap-2">
        {card.wallets?.map((wallet, i) => (
          <div 
            key={i} 
            className="flex items-center gap-4 p-4 rounded-[20px] transition-all hover:translate-x-1" 
            style={{ 
              backgroundColor: darkMode ? '#111' : '#F0ECE6', 
              border: `1px solid ${t?.divider || 'rgba(255,255,255,0.05)'}` 
            }}
          >
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black shrink-0" 
              style={{ backgroundColor: 'rgba(29,191,176,0.1)', color: accent, border: `1px solid ${accent}30` }}
            >
              {i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-mono text-xs font-bold tracking-tight" style={{ color: t?.pageColor }}>{formatAddress(wallet.address)}</p>
              <p className="text-zinc-500 text-[10px] mt-0.5 font-bold uppercase tracking-wide">
                {wallet.topPool && `Pool: ${wallet.topPool} · `}
                {wallet.allocation && `${wallet.allocation}`}
              </p>
            </div>
            <span className="text-xs font-black shrink-0" style={{ color: accent }}>
              {formatPnl(wallet.pnl)}
            </span>
          </div>
        ))}
      </div>

      {/* Recommended pool */}
      <div 
        className="p-5 rounded-[24px] flex items-center justify-between" 
        style={{ backgroundColor: 'rgba(29,191,176,0.05)', border: `1px solid ${accent}30` }}
      >
        <div>
          <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Smart Money target</p>
          <p className="font-bold text-sm mt-1" style={{ color: t?.pageColor }}>{card.recommendedPool}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-zinc-500 font-bold uppercase">Target APY</p>
          <span className="font-black text-lg" style={{ color: accent }}>{card.apy}</span>
        </div>
      </div>

      <button
        onClick={() => onCopy(card)}
        className="w-full py-5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all active:scale-95 group overflow-hidden relative"
        style={{ backgroundColor: accent, color: '#111' }}
      >
        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
        <span className="material-symbols-outlined text-lg">content_copy</span>
        Copy This Strategy
      </button>
    </div>
  );
}