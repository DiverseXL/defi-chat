export default function TokenSecurityCard({ analysis, symbol, onProceed, onCancel }) {
  const { level, score, flags } = analysis.risk

  const levelColor = level === 'HIGH' ? '#ef4444' : level === 'MEDIUM' ? '#f59e0b' : '#1dbfb0'
  const levelBg = level === 'HIGH' ? 'rgba(239,68,68,0.08)' : level === 'MEDIUM' ? 'rgba(245,158,11,0.08)' : 'rgba(29,191,176,0.08)'
  const levelBorder = level === 'HIGH' ? 'rgba(239,68,68,0.2)' : level === 'MEDIUM' ? 'rgba(245,158,11,0.2)' : 'rgba(29,191,176,0.2)'

  return (
    <div className="border rounded-[24px] p-6 max-w-md flex flex-col gap-5" style={{ backgroundColor: '#151515', borderColor: levelBorder, boxShadow: `0 16px 40px -12px ${levelColor}20` }}>

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: levelBg }}>
          <span className="material-symbols-outlined" style={{ color: levelColor, fontSize: 18 }}>
            {level === 'HIGH' ? 'warning' : level === 'MEDIUM' ? 'info' : 'verified'}
          </span>
        </div>
        <div>
          <p className="text-zinc-50 font-bold text-sm">Token Security Report</p>
          <p className="text-zinc-500 text-xs">Powered by Birdeye</p>
        </div>
        <span className="ml-auto px-3 py-1 rounded-full text-xs font-bold uppercase" style={{ backgroundColor: levelBg, color: levelColor, border: `1px solid ${levelBorder}` }}>
          {level} RISK
        </span>
      </div>

      {/* Token stats */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Price', value: `$${Number(analysis.price || 0).toFixed(6)}` },
          { label: '24h Change', value: `${Number(analysis.priceChange24h || 0).toFixed(2)}%`, color: analysis.priceChange24h >= 0 ? '#1dbfb0' : '#ef4444' },
          { label: 'Market Cap', value: analysis.marketCap > 0 ? `$${(analysis.marketCap / 1e6).toFixed(2)}M` : 'Unknown' },
          { label: 'Holders', value: analysis.holders?.toLocaleString() || 'Unknown' },
        ].map((stat) => (
          <div key={stat.label} className="p-3 rounded-[12px] flex flex-col gap-1" style={{ backgroundColor: '#0d0d0d' }}>
            <span className="text-zinc-500 text-xs uppercase tracking-wide">{stat.label}</span>
            <span className="font-bold text-sm" style={{ color: stat.color || '#e4e4e7' }}>{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Risk flags */}
      {flags.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-bold uppercase tracking-wide" style={{ color: levelColor }}>Risk Flags</p>
          {flags.map((flag, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-[10px]" style={{ backgroundColor: levelBg, border: `1px solid ${levelBorder}` }}>
              <span className="material-symbols-outlined" style={{ color: levelColor, fontSize: 14 }}>error</span>
              <span className="text-xs" style={{ color: levelColor }}>{flag}</span>
            </div>
          ))}
        </div>
      )}

      {/* Security checks */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">Security Checks</p>
        {[
          { label: 'Verified Token', pass: analysis.isVerified },
          { label: 'Cannot be Frozen', pass: !analysis.freezeable },
          { label: 'Fixed Supply', pass: !analysis.mintable },
          { label: 'Healthy Holder Distribution', pass: analysis.top10HolderPercent < 60 },
        ].map((check) => (
          <div key={check.label} className="flex items-center justify-between px-3 py-2 rounded-[10px]" style={{ backgroundColor: '#0d0d0d' }}>
            <span className="text-zinc-400 text-xs">{check.label}</span>
            <span className="material-symbols-outlined text-sm" style={{ color: check.pass ? '#1dbfb0' : '#ef4444', fontSize: 16 }}>
              {check.pass ? 'check_circle' : 'cancel'}
            </span>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 py-3 rounded-full font-bold uppercase tracking-wide text-xs transition-all"
          style={{ border: '1px solid rgba(255,255,255,0.08)', color: '#666' }}
        >
          Cancel
        </button>
        <button
          onClick={onProceed}
          className="flex-1 py-3 rounded-full font-bold uppercase tracking-wide text-xs transition-all hover:-translate-y-0.5"
          style={{ backgroundColor: level === 'HIGH' ? '#ef4444' : '#1dbfb0', color: '#0d0d0d' }}
        >
          {level === 'HIGH' ? 'Proceed Anyway ⚠️' : 'Proceed Safely'}
        </button>
      </div>

    </div>
  )
}