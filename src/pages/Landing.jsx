import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'

const FEATURES = [
  { icon: 'psychology', title: 'Intent-Based Execution', desc: 'Type what you want in plain English. The AI understands your goal and executes the entire strategy — no manual steps.' },
  { icon: 'trending_up', title: 'Smart Money Tracking', desc: 'See what top Meteora LPers are doing in real time. Copy their strategy with one click.' },
  { icon: 'bolt', title: 'One-Click Zap In / Out', desc: 'Add or remove liquidity from any Meteora pool in a single transaction. No complex steps.' },
  { icon: 'analytics', title: 'Live Pool Intelligence', desc: 'Real-time data from LP Agent API — TVL, volume, APR, and organic scores across all Meteora pools.' },
]

const STEPS = [
  { num: '01', title: 'Type Your Intent', desc: '"I have 1 SOL and want the highest yield with low risk"' },
  { num: '02', title: 'AI Analyzes Pools', desc: 'DeFi-Chat queries live Meteora pool data and finds your best opportunity' },
  { num: '03', title: 'Sign & Execute', desc: 'One click. One signature. Your liquidity is deployed on-chain.' },
]

const STATS = [
  { value: '$1T+', label: 'Volume Tracked' },
  { value: '$1.6M', label: 'Net Profit Generated' },
  { value: '3-in-1', label: 'Transactions Bundled' },
  { value: 'Solana', label: 'Chain' },
]

const PROMPTS = [
  '"Move my liquidity to the best pool"',
  '"What are whales investing in right now?"',
  '"Find me a low-risk stable pool for 500 USDC"',
  '"Rebalance my position to the highest APY"',
]

const PARTNERS = [
  {
    name: 'Meteora',
    logo: 'https://app.meteora.ag/icons/logo.svg',
    desc: 'DLMM Liquidity Protocol',
    url: 'https://meteora.ag',
  },
  {
    name: 'Solana',
    logo: 'https://cryptologos.cc/logos/solana-sol-logo.svg?v=040',
    desc: 'Layer 1 Blockchain',
    url: 'https://solana.com',
  },
  {
    name: 'LP Agent',
    logo: 'https://lp.ag/favicon.ico',
    desc: 'LP Intelligence API',
    icon: 'hub',
    url: 'https://lp.ag',
  },
  {
    name: 'Jito',
    logo: 'https://jito.network/favicon.ico',
    desc: 'MEV & Staking',
    url: 'https://jito.network',
  },
  {
    name: 'Jupiter',
    logo: 'https://jup.ag/favicon.ico',
    desc: 'Solana DEX Aggregator',
    url: 'https://jup.ag',
  },
]

function FadeIn({ children, delay = 0, className = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

export default function Landing() {
  const navigate = useNavigate()
  const [mounted, setMounted] = useState(false)
  const [promptIdx, setPromptIdx] = useState(0)
  const [displayText, setDisplayText] = useState('')
  const [isTyping, setIsTyping] = useState(true)
  const timeout = useRef(null)

  useEffect(() => { setMounted(true) }, [])

  // Typewriter
  useEffect(() => {
    const prompt = PROMPTS[promptIdx]
    if (isTyping) {
      if (displayText.length < prompt.length) {
        timeout.current = setTimeout(() => setDisplayText(prompt.slice(0, displayText.length + 1)), 40)
      } else {
        timeout.current = setTimeout(() => setIsTyping(false), 2000)
      }
    } else {
      if (displayText.length > 0) {
        timeout.current = setTimeout(() => setDisplayText(displayText.slice(0, -1)), 20)
      } else {
        setPromptIdx((i) => (i + 1) % PROMPTS.length)
        setIsTyping(true)
      }
    }
    return () => clearTimeout(timeout.current)
  }, [displayText, isTyping, promptIdx])

  const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.12, delayChildren: 0.3 } } }
  const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } } }

  return (
    <div
      className="font-outfit min-h-screen w-full overflow-x-hidden"
      style={{ fontFamily: "'Outfit', sans-serif", opacity: mounted ? 1 : 0, transition: 'opacity 0.5s' }}
    >
      {/* ─── Navbar ─────────────────────────────────────────── */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 22, stiffness: 90, delay: 0.2 }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-[72px] px-6 md:px-12"
        style={{ backgroundColor: 'rgba(17,17,17,0.95)', backdropFilter: 'blur(20px)' }}
      >
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="DeFi-Chat Logo" className="w-8 h-8 rounded-lg" />
          <span className="text-white font-black text-lg tracking-tight">DEFI-CHAT</span>
        </div>
        <div className="hidden md:flex items-center gap-10">
          {['Features', 'How it Works', 'Ecosystem'].map((l) => (
            <a key={l} href={`#${l.toLowerCase().replace(/ /g, '-')}`}
              className="text-[13px] font-medium text-zinc-400 hover:text-white transition-colors tracking-wide"
            >{l}</a>
          ))}
        </div>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => navigate('/chat')}
          className="flex items-center gap-2 text-[13px] font-bold text-white rounded-full px-6 py-3 transition-all"
          style={{ backgroundColor: '#2a2a2a', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          Launch App <span className="text-sm">→</span>
        </motion.button>
      </motion.nav>

      {/* ─── Hero ───────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center overflow-hidden pt-[72px]">
        {/* Sunset gradient background */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(180deg, #1a2a4a 0%, #2d4a6a 15%, #4a6a8a 28%, #8a7a6a 42%, #c49a6a 52%, #e8b878 62%, #F0E4D4 78%, #F7F3EE 100%)'
        }} />
        {/* Sun glow */}
        <div className="absolute w-[600px] h-[600px] rounded-full pointer-events-none" style={{
          top: '45%', left: '50%', transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(232,184,120,0.5) 0%, rgba(232,184,120,0.15) 40%, transparent 70%)',
        }} />
        {/* Horizon line */}
        <div className="absolute left-0 right-0 h-px pointer-events-none" style={{ top: '60%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)' }} />

        <motion.div variants={stagger} initial="hidden" animate="visible" className="relative z-10 flex flex-col items-center gap-6 px-6 max-w-5xl">
          {/* Badge */}
          <motion.div variants={fadeUp} className="flex items-center gap-4 text-[11px] font-semibold uppercase tracking-[3px] text-white/70">
            <span className="flex items-center gap-2 px-4 py-2 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-white/60" style={{ animation: 'pulse-soft 2s infinite' }} />
              Powered by LP Agent
            </span>
            <span className="hidden md:inline px-4 py-2 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
              On Solana
            </span>
          </motion.div>

          {/* Chrome headline */}
          <motion.h1
            variants={fadeUp}
            className="chrome-text font-black leading-[0.9] tracking-[-4px] md:tracking-[-6px]"
            style={{ fontSize: 'clamp(4rem, 14vw, 10rem)' }}
          >
            DEFI-CHAT
          </motion.h1>

          {/* Subtitle */}
          <motion.p variants={fadeUp} className="text-white/60 text-base md:text-lg max-w-xl leading-relaxed font-light">
            The AI agent that finds the best Meteora pools, explains the strategy, and executes it — all from plain English.
          </motion.p>

          {/* Typewriter */}
          <motion.div variants={fadeUp} className="w-full max-w-lg">
            <div className="flex items-center gap-3 px-5 py-4 rounded-2xl text-left" style={{ backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)' }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                <span className="material-symbols-outlined text-white/70 text-sm">person</span>
              </div>
              <p className="font-mono text-[13px] text-white/50 flex-1" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                {displayText}
                <span className="inline-block w-[2px] h-4 ml-1 align-middle" style={{ backgroundColor: '#1dbfb0', animation: 'pulse-soft 1s infinite' }} />
              </p>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div variants={fadeUp} className="flex gap-4 mt-2">
            <motion.button
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/chat')}
              className="flex items-center gap-2 font-bold text-sm rounded-full px-8 py-4 transition-all"
              style={{ backgroundColor: '#1dbfb0', color: '#111' }}
            >
              <span className="material-symbols-outlined text-lg">bolt</span>
              Launch DeFi-Chat
            </motion.button>
          </motion.div>
        </motion.div>
      </section>

      {/* ─── Stats Bar ──────────────────────────────────────── */}
      <section className="relative z-10" style={{ backgroundColor: '#111' }}>
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4">
          {STATS.map((s, i) => (
            <FadeIn key={s.label} delay={i * 0.08}>
              <div className="flex flex-col items-center gap-1 py-8 md:py-10 text-center" style={{ borderRight: i < 3 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                <span className="font-black text-2xl md:text-3xl tracking-tight" style={{ color: '#1dbfb0' }}>{s.value}</span>
                <span className="text-[10px] font-semibold uppercase tracking-[2px] text-zinc-500" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{s.label}</span>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ─── How it Works ───────────────────────────────────── */}
      <section id="how-it-works" className="py-24 md:py-32 px-6" style={{ backgroundColor: '#F7F3EE' }}>
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <div className="text-center mb-16 md:mb-20">
              <p className="text-[11px] font-bold uppercase tracking-[4px] mb-4" style={{ color: '#1dbfb0', fontFamily: "'IBM Plex Mono', monospace" }}>How It Works</p>
              <h2 className="chrome-text-blue font-black text-3xl md:text-5xl tracking-[-2px] leading-tight">
                THREE STEPS TO<br />ON-CHAIN ACTION
              </h2>
            </div>
          </FadeIn>
          <div className="grid md:grid-cols-3 gap-5">
            {STEPS.map((step, i) => (
              <FadeIn key={step.num} delay={i * 0.1}>
                <div className="hover-lift rounded-3xl p-8 md:p-10 h-full flex flex-col gap-4 bg-white" style={{ border: '1px solid #e5e5e5' }}>
                  <span className="text-5xl font-black tracking-[-3px]" style={{ color: 'rgba(29,191,176,0.15)' }}>{step.num}</span>
                  <h3 className="font-bold text-lg tracking-tight text-zinc-900">{step.title}</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{step.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ───────────────────────────────────────── */}
      <section id="features" className="py-24 md:py-32 px-6" style={{ backgroundColor: '#F0ECE6' }}>
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <div className="text-center mb-16 md:mb-20">
              <p className="text-[11px] font-bold uppercase tracking-[4px] mb-4" style={{ color: '#1dbfb0', fontFamily: "'IBM Plex Mono', monospace" }}>Features</p>
              <h2 className="chrome-text-blue font-black text-3xl md:text-5xl tracking-[-2px] leading-tight">
                EVERYTHING YOU NEED<br />TO WIN AT LP
              </h2>
            </div>
          </FadeIn>
          <div className="grid md:grid-cols-2 gap-5">
            {FEATURES.map((f, i) => (
              <FadeIn key={f.title} delay={i * 0.08}>
                <div className="hover-lift rounded-3xl p-8 md:p-10 h-full flex flex-col gap-5 bg-white" style={{ border: '1px solid #e5e5e5' }}>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'rgba(29,191,176,0.08)', border: '1px solid rgba(29,191,176,0.15)' }}>
                    <span className="material-symbols-outlined text-2xl" style={{ color: '#1dbfb0' }}>{f.icon}</span>
                  </div>
                  <h3 className="font-bold text-xl tracking-tight text-zinc-900">{f.title}</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">{f.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Ecosystem ──────────────────────────────────────── */}
      <section id="ecosystem" className="py-24 md:py-32 px-6" style={{ backgroundColor: '#F7F3EE' }}>
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="chrome-text-blue font-black text-3xl md:text-5xl tracking-[-2px] leading-tight mb-4">
                BUILT ON THE BEST
              </h2>
              <p className="text-zinc-500 text-sm max-w-md mx-auto">Powered by industry-leading protocols and infrastructure on Solana.</p>
            </div>
          </FadeIn>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {PARTNERS.map((p, i) => (
              <FadeIn key={p.name} delay={i * 0.06}>
                <a
                  key={p.name}
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover-lift flex flex-col items-center justify-center gap-4 py-8 px-4 rounded-3xl bg-white group cursor-pointer h-full no-underline"
                  style={{ border: '1px solid #e5e5e5', minHeight: 140 }}
                >
                  {/* Logo / Icon */}
                  <div className="w-14 h-14 flex items-center justify-center rounded-2xl flex-shrink-0 overflow-hidden"
                    style={{ backgroundColor: '#f4f4f4', border: '1px solid #e5e5e5' }}
                  >
                    {p.icon ? (
                      <span className="material-symbols-outlined text-2xl" style={{ color: '#1dbfb0' }}>{p.icon}</span>
                    ) : (
                      <img
                        src={p.logo}
                        alt={p.name}
                        className="w-9 h-9 object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                          e.currentTarget.nextSibling.style.display = 'flex'
                        }}
                      />
                    )}
                    {/* Fallback letter avatar */}
                    <div
                      className="w-9 h-9 rounded-xl items-center justify-center font-black text-lg text-white hidden"
                      style={{ backgroundColor: '#1dbfb0' }}
                    >
                      {p.name[0]}
                    </div>
                  </div>
                  {/* Name + desc */}
                  <div className="text-center">
                    <p className="font-black text-sm text-zinc-800 tracking-tight">{p.name}</p>
                    <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mt-0.5"
                      style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                    >{p.desc}</p>
                  </div>
                </a>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ────────────────────────────────────────────── */}
      <section className="py-24 md:py-32 px-6" style={{ backgroundColor: '#111' }}>
        <FadeIn>
          <div className="max-w-2xl mx-auto text-center flex flex-col items-center gap-8">
            <motion.span
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="material-symbols-outlined text-5xl"
              style={{ color: '#1dbfb0' }}
            >rocket_launch</motion.span>
            <h2 className="font-black text-3xl md:text-5xl tracking-[-2px] text-white leading-tight">
              Ready to <span style={{ color: '#1dbfb0' }}>Execute?</span>
            </h2>
            <p className="text-zinc-500 text-sm max-w-md leading-relaxed" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
              Connect your Solana wallet and start executing LP strategies from plain English. No DeFi experience required.
            </p>
            <motion.button
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/chat')}
              className="flex items-center gap-3 font-bold text-sm rounded-full px-10 py-5 transition-all"
              style={{ backgroundColor: '#1dbfb0', color: '#111' }}
            >
              <span className="material-symbols-outlined text-lg">bolt</span>
              Launch DeFi-Chat Free
            </motion.button>
            <p className="text-zinc-700 text-[10px] uppercase tracking-[2px] font-medium" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
              Read-only · No wallet needed to explore · Powered by LP Agent
            </p>
          </div>
        </FadeIn>
      </section>

      {/* ─── Footer ─────────────────────────────────────────── */}
      <footer className="px-6 py-8 flex flex-wrap items-center justify-between gap-4" style={{ backgroundColor: '#F7F3EE', borderTop: '1px solid #e5e5e5' }}>
        <div className="flex items-center gap-3">
          <span className="font-black text-sm text-zinc-800">DEFI-CHAT</span>
          <span className="text-[10px] text-zinc-400 tracking-wider" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>· Built for LP Agent Hackathon</span>
        </div>
        <p className="text-[10px] text-zinc-400 uppercase tracking-[2px]" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
          Powered by Meteora · Solana · LP Agent
        </p>
      </footer>
    </div>
  )
}