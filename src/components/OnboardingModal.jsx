import { useState } from 'react'

export default function OnboardingModal({ onClose, theme: t }) {
  const [step, setStep] = useState(1)

  const steps = [
    {
      title: "Welcome to DeFi-Chat",
      desc: "Your intelligent AI assistant for maximizing yields on Solana's Meteora Protocol.",
      icon: "robot_2",
      color: "#1dbfb0"
    },
    {
      title: "Real-Time Discovery",
      desc: "I analyze live pool data including TVL, Volume, and APR to recommend strategies tailored to your risk profile.",
      icon: "query_stats",
      color: "#3b82f6"
    },
    {
      title: "One-Click Execution",
      desc: "Connect your wallet to 'Zap In' directly from the chat. Fast, secure, and fully transparent.",
      icon: "account_balance_wallet",
      color: "#a855f7"
    }
  ]

  const current = steps[step - 1]

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6" style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)' }}>
      <div 
        className="w-full max-w-lg rounded-[32px] md:rounded-[48px] overflow-hidden flex flex-col transition-all duration-500"
        style={{ backgroundColor: t.surfaceLow, border: `1px solid ${t.sidebarBorder}`, boxShadow: '0 32px 64px rgba(0,0,0,0.6)' }}
      >
        <div className="p-8 md:p-12 flex flex-col items-center text-center gap-6 md:gap-8">
          {/* Animated Icon */}
          <div 
            className="w-20 h-20 md:w-24 md:h-24 rounded-3xl flex items-center justify-center transition-all duration-500"
            style={{ backgroundColor: `${current.color}15`, border: `1px solid ${current.color}30` }}
          >
            <span className="material-symbols-outlined text-4xl md:text-5xl" style={{ color: current.color }}>{current.icon}</span>
          </div>

          <div className="flex flex-col gap-3 md:gap-4">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight" style={{ color: t.pageColor }}>{current.title}</h2>
            <p className="text-sm md:text-base leading-relaxed max-w-xs mx-auto" style={{ color: t.textSecondary }}>{current.desc}</p>
          </div>

          {/* Progress Dots */}
          <div className="flex gap-2">
            {steps.map((_, i) => (
              <div 
                key={i}
                className="h-1.5 rounded-full transition-all duration-300"
                style={{ 
                  width: step === i + 1 ? 24 : 6, 
                  backgroundColor: step === i + 1 ? current.color : t.divider 
                }}
              />
            ))}
          </div>
        </div>

        <div className="p-6 md:p-10 flex gap-4" style={{ backgroundColor: 'rgba(0,0,0,0.15)', borderTop: `1px solid ${t.divider}` }}>
          {step > 1 && (
            <button 
              onClick={() => setStep(step - 1)}
              className="flex-1 py-4 rounded-full font-bold uppercase tracking-widest text-xs transition-all"
              style={{ color: t.textSecondary }}
            >
              Back
            </button>
          )}
          <button 
            onClick={() => step < 3 ? setStep(step + 1) : onClose()}
            className="flex-[2] py-4 rounded-full font-bold uppercase tracking-widest text-xs transition-all hover:-translate-y-0.5 active:scale-95"
            style={{ backgroundColor: current.color, color: '#111' }}
          >
            {step === 3 ? "Start Trading" : "Next"}
          </button>
        </div>
      </div>
    </div>
  )
}
