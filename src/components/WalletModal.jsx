import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'

export default function WalletModal({ onClose, theme: t, darkMode }) {
  const { connected, publicKey, disconnect, wallets, select } = useWallet()
  const { setVisible } = useWalletModal()

  const accent = t?.accent || '#1dbfb0'

  const shortAddress = publicKey
    ? publicKey.toString().slice(0, 4) + '...' + publicKey.toString().slice(-4)
    : null

  const handleConnect = (walletName) => {
    select(walletName)
    setVisible(true)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6"
      style={{ backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)' }}
    >
      <div
        className="w-full max-w-md rounded-t-[32px] sm:rounded-[32px] flex flex-col transition-all duration-500 overflow-hidden"
        style={{ 
          backgroundColor: t?.modalBg || '#1a1a1a', 
          border: `1px solid ${t?.modalBorder || 'rgba(255,255,255,0.1)'}`,
          boxShadow: '0 32px 64px rgba(0,0,0,0.5)'
        }}
      >
        {/* Header */}
        <div
          className="flex justify-between items-center p-6 md:p-8"
          style={{ borderBottom: `1px solid ${t?.divider || 'rgba(255,255,255,0.05)'}` }}
        >
          <div>
            <h2 className="text-xl font-bold font-outfit" style={{ color: t?.pageColor }}>
              {connected ? 'Wallet Linked' : 'Link Wallet'}
            </h2>
            <p className="text-zinc-500 text-xs mt-1 font-medium">
              {connected ? 'Secure connection active' : 'Choose a Solana wallet to begin'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:opacity-70 transition-opacity"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 md:p-8 flex flex-col gap-6">
          {connected ? (
            <>
              {/* Connected State */}
              <div
                className="flex items-center gap-4 px-6 py-5 rounded-[24px]"
                style={{ 
                  backgroundColor: 'rgba(29,191,176,0.05)', 
                  border: `1px solid ${accent}30` 
                }}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center shadow-inner"
                  style={{ backgroundColor: 'rgba(29,191,176,0.1)' }}
                >
                  <span className="material-symbols-outlined text-xl" style={{ color: accent }}>
                    account_balance_wallet
                  </span>
                </div>
                <div>
                  <p className="font-bold text-sm font-mono tracking-tight" style={{ color: t?.pageColor }}>{shortAddress}</p>
                  <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Solana Mainnet</p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{ backgroundColor: accent }}
                  />
                  <span className="text-[10px] font-bold uppercase" style={{ color: accent }}>Active</span>
                </div>
              </div>

              <p className="text-zinc-500 text-xs text-center leading-relaxed px-4 font-medium">
                Your wallet is linked. DeFi-Chat will use this address for LP recommendations and strategy execution.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all hover:scale-[1.02]"
                  style={{ backgroundColor: accent, color: '#111' }}
                >
                  Continue
                </button>
                <button
                  onClick={() => { disconnect(); onClose(); }}
                  className="flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all hover:bg-red-500/10"
                  style={{ border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}
                >
                  Disconnect
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Not Connected State */}
              <p className="text-zinc-500 text-sm leading-relaxed text-center px-4 font-medium">
                Connect your Solana wallet to enable strategy execution and personalized LP recommendations.
              </p>

              <div className="flex flex-col gap-3">
                {wallets.map((wallet) => (
                  <button
                    key={wallet.adapter.name}
                    onClick={() => handleConnect(wallet.adapter.name)}
                    className="flex items-center gap-4 px-6 py-4 rounded-[24px] transition-all hover:-translate-y-1 hover:shadow-xl group"
                    style={{ 
                      backgroundColor: darkMode ? '#111' : '#F0ECE6', 
                      border: `1px solid ${t?.divider || 'rgba(255,255,255,0.08)'}` 
                    }}
                  >
                    <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 group-hover:bg-white/10 transition-colors">
                      <img src={wallet.adapter.icon} alt={wallet.adapter.name} className="w-6 h-6 object-contain" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-sm" style={{ color: t?.pageColor }}>{wallet.adapter.name}</p>
                      <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wide">
                        {wallet.readyState === 'Installed' ? 'Detected' : 'Solana Wallet'}
                      </p>
                    </div>
                    <span className="material-symbols-outlined text-zinc-500 ml-auto group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setVisible(true)}
                className="w-full py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all hover:scale-[1.02] active:scale-95 shadow-lg"
                style={{ backgroundColor: accent, color: '#111' }}
              >
                Connect Wallet
              </button>

              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[2px] text-center">
                Read-only mode available
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}