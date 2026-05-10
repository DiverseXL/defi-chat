export default function QuoteCard({ quote, onConfirm, onCancel, loading }) {
  const priceImpactColor = quote.priceImpact > 3
    ? '#ef4444'
    : quote.priceImpact > 1
    ? '#f59e0b'
    : '#1dbfb0'

  return (
    <div className="border rounded-[24px] p-6 max-w-md flex flex-col gap-5"
      style={{ backgroundColor: '#151515', borderColor: 'rgba(29,191,176,0.2)', boxShadow: '0 16px 40px -12px rgba(29,191,176,0.1)' }}
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ backgroundColor: 'rgba(29,191,176,0.1)' }}
        >
          <span className="material-symbols-outlined" style={{ color: '#1dbfb0', fontSize: 18 }}>swap_horiz</span>
        </div>
        <div>
          <p className="text-zinc-50 font-bold text-sm">Swap Preview</p>
          <p className="text-zinc-500 text-xs">Powered by Jupiter</p>
        </div>
        <span className="ml-auto px-3 py-1 rounded-full text-xs font-bold"
          style={{ backgroundColor: 'rgba(29,191,176,0.1)', color: '#1dbfb0', border: '1px solid rgba(29,191,176,0.2)' }}
        >
          BEST ROUTE
        </span>
      </div>

      {/* Swap details */}
      <div className="flex flex-col gap-2">

        {/* You pay */}
        <div className="p-4 rounded-[16px]" style={{ backgroundColor: '#0d0d0d' }}>
          <p className="text-zinc-500 text-xs uppercase tracking-wide mb-2">You Pay</p>
          <div className="flex items-center justify-between">
            <span className="text-zinc-50 font-bold text-xl">{quote.inputAmountSOL} SOL</span>
            <span className="text-zinc-500 text-sm">${quote.inputValueUSD?.toFixed(2)}</span>
          </div>
        </div>

        {/* Arrow */}
        <div className="flex justify-center">
          <span className="material-symbols-outlined" style={{ color: '#1dbfb0', fontSize: 20 }}>arrow_downward</span>
        </div>

        {/* You receive */}
        <div className="p-4 rounded-[16px]" style={{ backgroundColor: '#0d0d0d' }}>
          <p className="text-zinc-500 text-xs uppercase tracking-wide mb-2">You Receive (est.)</p>
          <div className="flex items-center justify-between">
            <span className="text-zinc-50 font-bold text-xl">
              {quote.outputAmount?.toFixed(4)} {quote.outputSymbol}
            </span>
            <span className="text-zinc-500 text-sm">
              Min: {quote.minimumReceived?.toFixed(4)}
            </span>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-[12px] flex flex-col gap-1" style={{ backgroundColor: '#0d0d0d' }}>
          <span className="text-zinc-500 text-xs uppercase tracking-wide">Price Impact</span>
          <span className="font-bold text-sm" style={{ color: priceImpactColor }}>
            {quote.priceImpact?.toFixed(3)}%
            {quote.priceImpactWarning && ' ⚠️'}
          </span>
        </div>
        <div className="p-3 rounded-[12px] flex flex-col gap-1" style={{ backgroundColor: '#0d0d0d' }}>
          <span className="text-zinc-500 text-xs uppercase tracking-wide">SOL Price</span>
          <span className="font-bold text-sm text-zinc-200">${quote.solPrice?.toFixed(2)}</span>
        </div>
      </div>

      {/* Price impact warning */}
      {quote.priceImpactWarning && (
        <div className="px-4 py-3 rounded-[12px] text-xs"
          style={{ backgroundColor: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)', color: '#f59e0b' }}
        >
          ⚠️ High price impact detected. Consider splitting into smaller transactions.
        </div>
      )}

      {/* Route */}
      {quote.routePlan?.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-zinc-600 text-xs">Route:</span>
          {quote.routePlan.map((step, i) => (
            <span key={i} className="text-xs px-2 py-1 rounded-full"
              style={{ backgroundColor: '#0d0d0d', color: '#64748b', border: '1px solid rgba(255,255,255,0.05)' }}
            >
              {step.swapInfo?.label || `Step ${i + 1}`}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 py-3 rounded-full font-bold uppercase tracking-wide text-xs transition-all"
          style={{ border: '1px solid rgba(255,255,255,0.08)', color: '#666' }}
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 py-3 rounded-full font-bold uppercase tracking-wide text-xs transition-all hover:-translate-y-0.5"
          style={{ backgroundColor: '#1dbfb0', color: '#0d0d0d', opacity: loading ? 0.6 : 1 }}
        >
          {loading ? 'Processing...' : 'Confirm & Zap In'}
        </button>
      </div>
    </div>
  )
}