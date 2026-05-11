import { useState, useRef, useEffect } from 'react'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { VersionedTransaction } from '@solana/web3.js'
import { Buffer } from 'buffer'
import { fetchTopPools, fetchTopLpers, isRealPool } from '../services/lpAgent'
import { askAI } from '../services/ai'
import WalletModal from '../components/WalletModal'
import TypingText from '../components/TypingText'
import OnboardingModal from '../components/OnboardingModal'
import ExecuteCard from '../components/ExecuteCard'
import SmartMoneyCard from '../components/SmartMoneyCard'
import { jsPDF } from 'jspdf'
import TokenSecurityCard from '../components/TokenSecurityCard'

const WELCOME_MESSAGE = {
  id: 1,
  role: 'ai',
  text: "Hello! I'm your DeFi assistant. Tell me what you want to do with your funds.",
  card: null,
}

export default function Chat() {
  const { connected, publicKey, sendTransaction, signTransaction } = useWallet()
  const { connection } = useConnection()
  const walletKey = publicKey?.toString() || 'guest'

  const initChats = () => {
    try {
      const saved = localStorage.getItem(`defi-chat:${walletKey}`)
      let loadedChats = saved ? JSON.parse(saved) : []
      // Clean up empty chats to prevent accumulation
      loadedChats = loadedChats.filter(c => c.messages.length > 1 || c.title !== 'New Chat')
      const newId = Date.now()
      const freshChat = { id: newId, title: 'New Chat', messages: [WELCOME_MESSAGE] }
      return [freshChat, ...loadedChats]
    } catch {
      return [{ id: Date.now(), title: 'New Chat', messages: [WELCOME_MESSAGE] }]
    }
  }

  const [chats, setChats] = useState(initChats)
  const [activeChatId, setActiveChatId] = useState(() => chats[0].id)

  useEffect(() => {
    try {
      localStorage.setItem(`defi-chat:${walletKey}`, JSON.stringify(chats))
    } catch {
      console.error('Failed to save chats')
    }
  }, [chats, walletKey])

  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedCard, setSelectedCard] = useState(null)
  const [securityCheck, setSecurityCheck] = useState(null)
  const [pendingCard, setPendingCard] = useState(null)
  const [zapAmount, setZapAmount] = useState('')
  const [zapLoading, setZapLoading] = useState(false)
  const [zapSuccess, setZapSuccess] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [isLiveData, setIsLiveData] = useState(false)
  const [showZapOut, setShowZapOut] = useState(false)
  const [zapOutPosition, setZapOutPosition] = useState(null)
  const [zapOutQuote, setZapOutQuote] = useState(null)
  const [zapOutLoading, setZapOutLoading] = useState(false)
  const [zapOutSuccess, setZapOutSuccess] = useState(false)
  const [solPrice, setSolPrice] = useState(null)

  // ── Settings Persistence ──────────────────────────────────────────────────
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('defi-chat:darkMode')
    return saved !== null ? JSON.parse(saved) : true
  })
  const [risk, setRisk] = useState(() => {
    return localStorage.getItem('defi-chat:risk') || 'Balanced'
  })
  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem('defi-chat:currency') || 'USD'
  })

  useEffect(() => {
    localStorage.setItem('defi-chat:darkMode', JSON.stringify(darkMode))
  }, [darkMode])

  useEffect(() => {
    localStorage.setItem('defi-chat:risk', risk)
  }, [risk])

  useEffect(() => {
    localStorage.setItem('defi-chat:currency', currency)
  }, [currency])
  // ──────────────────────────────────────────────────────────────────────────
  const [showWallet, setShowWallet] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return localStorage.getItem('defi-chat:onboarding-complete') !== 'true'
  })
  const bottomRef = useRef(null)

  // ── Theme ────────────────────────────────────────────────────────────────
  const t = darkMode
    ? {
        pageBg:       '#0a0a0a',
        pageColor:    '#f5f5f5',
        sidebarBg:    'rgba(17,17,17,0.9)',
        sidebarBorder:'rgba(255,255,255,0.06)',
        sidebarGlow:  '8px 0 32px rgba(0,0,0,0.5)',
        surfaceLow:   '#151515',
        surfaceMid:   '#1a1a1a',
        headerGlass:  'rgba(10,10,10,0.85)',
        headerHighlight: 'rgba(255,255,255,0.02)',
        headerShadow: '0 8px 32px rgba(0,0,0,0.6)',
        headerBorderGlass: 'rgba(255,255,255,0.06)',
        bubbleGlass:  'rgba(26,26,26,0.9)',
        cardGlass:    'rgba(26,26,26,0.7)',
        modalGlass:   'rgba(10,10,10,0.95)',
        surfaceHigh:  '#2a2a2a',
        userBubble:   'rgba(42,42,42,0.7)',
        headerBg:     'rgba(10,10,10,0.95)',
        headerBorder: 'rgba(255,255,255,0.08)',
        inputBorder:  'rgba(255,255,255,0.1)',
        divider:      'rgba(255,255,255,0.06)',
        tagBg:        'rgba(26,26,26,0.5)',
        sidebarFooter:'rgba(10,10,10,0.5)',
        inputGrad:    'linear-gradient(to top, #0a0a0a 60%, transparent)',
        modalBg:      '#111111',
        modalBorder:  'rgba(255,255,255,0.1)',
        settingsInput:'rgba(26,26,26,0.6)',
        settingsInputBorder: 'rgba(255,255,255,0.1)',
        textPrimary:  '#f5f5f5',
        textSecondary:'#8a8a8a',
        cancelBorder: 'rgba(255,255,255,0.1)',
        cancelColor:  '#8a8a8a',
        dividerSetting:'rgba(255,255,255,0.06)',
        accent:       '#1dbfb0',
      }
    : {
        pageBg:       '#F7F3EE',
        pageColor:    '#1a1a1a',
        sidebarBg:    'rgba(247,243,238,0.9)',
        sidebarBorder:'rgba(0,0,0,0.06)',
        sidebarGlow:  '8px 0 32px rgba(0,0,0,0.04)',
        surfaceLow:   '#F0ECE6',
        surfaceMid:   '#ffffff',
        headerGlass:  'rgba(247,243,238,0.85)',
        headerHighlight: 'rgba(255,255,255,0.4)',
        headerShadow: '0 8px 32px rgba(0,0,0,0.06)',
        headerBorderGlass: 'rgba(0,0,0,0.06)',
        bubbleGlass:  '#ffffff',
        cardGlass:    '#ffffff',
        modalGlass:   'rgba(255,255,255,0.95)',
        surfaceHigh:  '#EDE8E1',
        userBubble:   '#F0ECE6',
        headerBg:     'rgba(247,243,238,0.9)',
        headerBorder: 'rgba(0,0,0,0.06)',
        inputBorder:  'rgba(0,0,0,0.08)',
        divider:      'rgba(0,0,0,0.06)',
        tagBg:        '#F0ECE6',
        sidebarFooter:'rgba(247,243,238,0.5)',
        inputGrad:    'linear-gradient(to top, #F7F3EE 60%, transparent)',
        modalBg:      '#ffffff',
        modalBorder:  'rgba(0,0,0,0.1)',
        settingsInput:'#F7F3EE',
        settingsInputBorder: 'rgba(0,0,0,0.08)',
        textPrimary:  '#1a1a1a',
        textSecondary:'#71717a',
        cancelBorder: 'rgba(0,0,0,0.1)',
        cancelColor:  '#71717a',
        dividerSetting:'rgba(0,0,0,0.06)',
        accent:       '#1dbfb0',
      }
  // ────────────────────────────────────────────────────────────────────────

  const activeChat = chats.find((c) => c.id === activeChatId)
  const messages = activeChat?.messages || []

  useEffect(() => {
    const checkConnectivity = async () => {
      try {
        await fetchTopPools(risk)
        setIsLiveData(true)
      } catch (err) {
        setIsLiveData(false)
      }
    }
    checkConnectivity()
  }, [])

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`defi-chat:${walletKey}`)
      let loadedChats = saved ? JSON.parse(saved) : []
      loadedChats = loadedChats.filter(c => c.messages.length > 1 || c.title !== 'New Chat')
      const newId = Date.now()
      const freshChat = { id: newId, title: 'New Chat', messages: [WELCOME_MESSAGE] }
      setChats([freshChat, ...loadedChats])
      setActiveChatId(newId)
    } catch (e) {
      console.error('Failed to load chats for wallet', e)
      const fresh = [{ id: Date.now(), title: 'New Chat', messages: [WELCOME_MESSAGE] }]
      setChats(fresh)
      setActiveChatId(fresh[0].id)
    }
  }, [walletKey])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])



  useEffect(() => {
    const fetchPrice = async () => {
      const { getSOLPrice } = await import('../services/jupiter')
      const price = await getSOLPrice()
      if (price) setSolPrice(price)
    }
    fetchPrice()
    const interval = setInterval(fetchPrice, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleNewChat = () => {
    const newId = Date.now()
    setChats((prev) => [
      ...prev,
      { id: newId, title: 'New Chat', messages: [WELCOME_MESSAGE] }
    ])
    setActiveChatId(newId)
    setInput('')
  }

  const handleSelectChat = (id) => {
    setActiveChatId(id)
    setInput('')
  }

  const handleZapIn = async (card, providedAmount = null) => {
    if (!connected) {
      alert('Please connect your wallet first.')
      return
    }
    
    let amount = providedAmount ? parseFloat(providedAmount) : null
    if (!amount) {
      const amountStr = prompt(`Deploy Strategy: ${card.name}\n\nEnter SOL amount to deposit (0.1 - 100):`, '0.1')
      if (!amountStr) return
      amount = parseFloat(amountStr)
    }

    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid SOL amount.')
      return
    }

    setZapLoading(true)
    setZapSuccess(false)
    
    try {
      const { zapIn, submitZapIn } = await import('../services/lpAgent')
      const walletAddress = publicKey.toString()
      const poolId = card.poolId

      // Step 1: Generate Transactions
      const result = await zapIn(poolId, amount, walletAddress)
      if (result?.error) throw new Error(result.error)
      if (!result) throw new Error('Failed to generate transaction payloads.')

      // Step 2 — Signing & Submission Loop (Aggressive Mode)
      const { Connection, VersionedTransaction, Transaction } = await import('@solana/web3.js')
      const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed')

      const allTxs = [
        ...(result.swapTxsWithJito || []),
        ...(result.addLiquidityTxsWithJito || []),
      ]

      if (!allTxs.length) {
        throw new Error('No transactions returned from LP Agent')
      }

      console.log('Transactions to sign:', allTxs.length)

      for (let i = 0; i < allTxs.length; i++) {
        const txBase64 = allTxs[i]
        console.log(`Processing transaction ${i + 1}/${allTxs.length}`)

        const rawBuffer = Buffer.from(txBase64, 'base64')
        console.log('Buffer created, length:', rawBuffer.length)

        let tx
        try {
          tx = VersionedTransaction.deserialize(rawBuffer)
          console.log('Deserialized as VersionedTransaction')
        } catch (e) {
          console.log('Not versioned, trying legacy:', e.message)
          tx = Transaction.from(rawBuffer)
          console.log('Deserialized as Legacy Transaction')
        }

        const signature = await sendTransaction(tx, connection, {
          skipPreflight: true, // Bypass simulation to allow complex bundles
          maxRetries: 3,
        })

        console.log(`Transaction ${i + 1} signature:`, signature)
        await connection.confirmTransaction(signature, 'confirmed')
      }

      setZapSuccess(true)

    } catch (err) {
      console.error('LP Agent: Zap In Flow Error:', err)
      const isRejection = /reject|cancel/i.test(err.message)
      alert(isRejection ? 'Transaction cancelled.' : `Execution error: ${err.message}`)
    } finally {
      setZapLoading(false)
    }
  }

  const handleZapOut = async (positionId, bps = 10000) => {
    if (!connected || !positionId) return
    setZapOutLoading(true)
    setZapOutSuccess(false)

    try {
      const { getZapOutQuote, zapOut, submitZapOut } = await import('../services/lpAgent')
      const walletAddress = publicKey?.toString()

      // Step 1 — Get quote
      const quote = await getZapOutQuote(positionId, bps)
      if (!quote) throw new Error('Could not get withdrawal quote. Please try again.')
      setZapOutQuote(quote)

      // Step 2 — Generate transaction
      const txData = await zapOut(positionId, walletAddress, bps)
      if (!txData) throw new Error('Could not generate withdrawal transaction payloads.')

      // Step 3 — Sign transactions
      const { Transaction, VersionedTransaction } = await import('@solana/web3.js')

      const signTxList = async (base64Txs) => {
        if (!base64Txs || !base64Txs.length) return []
        const signed = []
        for (const txBase64 of base64Txs) {
          const txBuffer = Buffer.from(txBase64, 'base64')
          let tx
          try {
            tx = VersionedTransaction.deserialize(txBuffer)
          } catch {
            tx = Transaction.from(txBuffer)
          }
          const signedTx = await signTransaction(tx)
          signed.push(signedTx.serialize().toString('base64'))
        }
        return signed
      }

      const signedSwapTxsWithJito = await signTxList(txData.swapTxsWithJito)
      const signedCloseTxsWithJito = await signTxList(txData.closeTxsWithJito)
      const signedCloseTxs = await signTxList(txData.closeTxs)
      const signedSwapTxs = await signTxList(txData.swapTxs)

      // Step 4 — Submit
      const submission = await submitZapOut({
        lastValidBlockHeight: txData.lastValidBlockHeight,
        closeTxsWithJito: signedCloseTxsWithJito,
        closeTxs: signedCloseTxs,
        swapTxs: signedSwapTxs,
        swapTxsWithJito: signedSwapTxsWithJito,
      })

      if (!submission || (submission.status !== 'success' && !submission.data && !submission.signature)) {
        throw new Error(submission?.message || 'Withdrawal submission failed at the relayer.')
      }

      setZapOutSuccess(true)

    } catch (err) {
      console.error('LP Agent: Zap Out Error:', err)
      const isRejection = /reject|cancel/i.test(err.message)
      alert(isRejection ? 'Withdrawal cancelled.' : `Withdrawal error: ${err.message}`)
    } finally {
      setZapOutLoading(false)
    }
  }

  const handleExport = () => {
    if (!messages.length) return

    const doc = new jsPDF()
    const title = activeChat?.title || 'DeFi-Chat Export'
    
    // Header
    doc.setFontSize(22)
    doc.setTextColor(34, 197, 94) // Accent color (green)
    doc.text('DeFi-Chat', 10, 20)
    
    doc.setFontSize(14)
    doc.setTextColor(0)
    doc.text(title, 10, 30)
    
    doc.setFontSize(9)
    doc.setTextColor(150)
    doc.text(`Exported on ${new Date().toLocaleString()}`, 10, 36)
    
    doc.setDrawColor(230)
    doc.line(10, 40, 200, 40)

    let y = 55
    doc.setFontSize(11)
    doc.setTextColor(0)

    messages.forEach((m) => {
      const isAI = m.role === 'ai'
      
      // Role Label
      doc.setFont(undefined, 'bold')
      doc.setTextColor(isAI ? 34 : 100) // AI green or User gray
      doc.text(isAI ? 'ASSISTANT:' : 'USER:', 10, y)
      
      // Content
      doc.setFont(undefined, 'normal')
      doc.setTextColor(0)
      const contentLines = doc.splitTextToSize(m.text, 180)
      
      // Check for page break
      if (y + (contentLines.length * 6) > 270) {
        doc.addPage()
        y = 20
      }
      
      doc.text(contentLines, 10, y + 6)
      y += (contentLines.length * 6) + 12

      if (m.card) {
        // Strategy Box
        doc.setDrawColor(240)
        doc.setFillColor(250)
        doc.roundedRect(10, y - 4, 190, 40, 3, 3, 'FD')
        
        doc.setFont(undefined, 'bold')
        doc.text(`Recommended: ${m.card.name}`, 15, y + 5)
        
        doc.setFont(undefined, 'normal')
        doc.setFontSize(9)
        doc.text(`Protocol: ${m.card.protocol}`, 15, y + 12)
        doc.text(`APY: ${m.card.apy}`, 15, y + 18)
        doc.text(`TVL: ${m.card.tvl}`, 15, y + 24)
        doc.text(`Risk: ${m.card.risk} | Confidence: ${m.card.confidence}%`, 15, y + 30)
        
        doc.setFontSize(11)
        y += 50
      }
    })

    const fileName = `defi-chat-${activeChat?.title?.replace(/\s+/g, '-').toLowerCase() || 'export'}.pdf`
    doc.save(fileName)
  }

  const handleSend = async (overrideText) => {
    // Fix: Ensure userText is a string (onClick passes an event object)
    const userText = (typeof overrideText === 'string' ? overrideText : input).trim()
    if (!userText || loading) return

    const activeChat = chats.find(c => c.id === activeChatId)
    const messages = activeChat?.messages || []

    const userMessage = { id: Date.now(), role: 'user', text: userText }
    setChats((prev) =>
      prev.map((c) =>
        c.id === activeChatId
          ? { 
              ...c, 
              title: c.title === 'New Chat' ? userText.slice(0, 28) + (userText.length > 28 ? '...' : '') : c.title,
              messages: [...c.messages, userMessage] 
            }
          : c
      )
    )
    setInput('')
    setLoading(true)

    try {
      // Step 1: Discover Pools
      const pools = await fetchTopPools(risk)
      
      /* Temporarily disabled — Birdeye rate limiting causing LP Agent fallback
      const enrichPool = async (pool) => {
        ...
      }
      const finalPools = pools.filter(isRealPool)
      */
      const finalPools = pools.filter(isRealPool)

      // Step 3: Fetch Portfolio & Positions (Hardened against nulls)
      const { fetchOpenPositions, fetchPortfolioOverview, fetchTopLpers } = await import('../services/lpAgent')
      let lpers = [], positions = [], portfolio = null

      if (connected && publicKey) {
        try {
          const [posData, portData] = await Promise.all([
            fetchOpenPositions(publicKey.toString()).catch(() => []),
            fetchPortfolioOverview(publicKey.toString()).catch(() => null)
          ])
          positions = posData || []
          portfolio = portData
        } catch (e) {
          console.error('LP Agent: Position/Portfolio fetch failed', e)
        }
      }

      // Step 4: Intent Detection & LPer Enrichment (Hardened)
      const smartMoneyKeywords = [
        'whale', 'whales', 'smart money', 'top wallet', 'top wallets',
        'copy', 'best wallet', 'what are others', 'top lper', 'top lpers',
        'what are whales', 'who are the best', 'top performers', 'best lpers',
        'copy strategy', 'follow', 'investing in', 'top lp', 'best lp',
        'what are top', 'show me what', 'who is winning', 'best performers',
      ]
      const isSmartMoneyIntent = smartMoneyKeywords.some(k =>
        userText.toLowerCase().includes(k.toLowerCase())
      )

      if (isSmartMoneyIntent && finalPools.length > 0) {
        try {
          const lperResults = await Promise.all(
            finalPools.slice(0, 3).map(p => fetchTopLpers(p.pool || p.address || p.id).catch(() => []))
          )
          lpers = lperResults.filter(Boolean).flat().filter((v, i, a) => v && a.findIndex(t => t?.owner === v.owner) === i)
        } catch (e) {
          console.error('LP Agent: Whale fetch failed', e)
        }
      }

      // Step 5: Final Price Check
      let currentSOLPrice = solPrice
      if (!currentSOLPrice) {
        const { getSOLPrice } = await import('../services/jupiter')
        currentSOLPrice = await getSOLPrice()
      }

      setIsLiveData(true)

      // Step 6: AI Orchestration
      const { text, card, type } = await askAI(userText, finalPools, lpers, positions, currentSOLPrice, messages)
      
      setChats((prev) =>
        prev.map((c) =>
          c.id === activeChatId
            ? { ...c, messages: [...c.messages, { id: Date.now() + 1, role: 'ai', text, card, type }] }
            : c
        )
      )
    } catch (err) {
      console.error('LP Agent: Critical handleSend failure:', err)
      const errorMsg = { id: Date.now() + 1, role: 'ai', text: 'Connection to Solana data nodes is currently unstable. Please check your network and try again.', card: null }
      setChats(prev => prev.map(c => c.id === activeChatId ? { ...c, messages: [...c.messages, errorMsg] } : c))
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div
      className="font-['Inter',sans-serif] antialiased overflow-hidden flex h-screen w-screen text-[15px] leading-[1.6] transition-colors duration-300"
      style={{ backgroundColor: t.pageBg, color: t.pageColor }}
    >

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/50 md:hidden backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <nav
        className={`fixed left-0 top-0 h-screen w-[280px] flex flex-col z-40 transition-transform duration-500 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{
          backgroundColor: t.sidebarBg,
          borderRight: `1px solid ${t.sidebarBorder}`,
          borderRadius: '0 32px 32px 0',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          boxShadow: t.sidebarGlow,
        }}
      >
        {/* Frosted edge highlight */}
        <div
          className="absolute inset-y-0 right-0 w-px"
          style={{ background: `linear-gradient(180deg, transparent, ${darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.5)'}, transparent)` }}
        />

        {/* Logo + New Chat */}
        <div className="p-6 flex flex-col gap-6" style={{ borderBottom: `1px solid ${t.divider}` }}>
          <div className="flex items-center gap-4 px-2">
            <div className="w-12 h-12 flex items-center justify-center rounded-2xl overflow-hidden shadow-lg" style={{ border: `1px solid ${t.accent}20` }}>
              <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight" style={{ color: t.accent }}>DEFI-CHAT</h1>
              <p className="text-zinc-500 uppercase tracking-wider font-medium" style={{ fontSize: 11 }}>LP Agent Powered</p>
            </div>
          </div>
          <button
            onClick={handleNewChat}
            className="w-full py-4 px-6 font-bold uppercase tracking-wide rounded-full flex items-center justify-center gap-2 transition-all duration-300 hover:-translate-y-0.5"
            style={{ backgroundColor: t.accent, color: '#0d0d0d', fontSize: 13 }}
          >
            <span className="material-symbols-outlined text-lg">add</span>
            New Chat
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
          <div className="px-4 pb-2">
            <span className="text-zinc-500 uppercase tracking-wider font-semibold" style={{ fontSize: 11 }}>Recent Chats</span>
          </div>
          {[...chats].reverse().map((chat) => (
            <button
              key={chat.id}
              onClick={() => handleSelectChat(chat.id)}
              className="w-full text-left font-semibold uppercase tracking-wider px-5 py-4 transition-all duration-300 rounded-full flex items-center gap-4"
              style={{
                fontSize: 12,
                backgroundColor: chat.id === activeChatId ? t.surfaceHigh : 'transparent',
                color: chat.id === activeChatId ? t.accent : t.textSecondary,
              }}
            >
              <span className="material-symbols-outlined text-lg opacity-80">chat</span>
              <span className="truncate">{chat.title}</span>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div
          className="mt-auto p-6 flex flex-col gap-3 transition-colors duration-300"
          style={{
            borderTop: `1px solid ${t.divider}`,
            backgroundColor: t.sidebarFooter,
            borderRadius: '0 0 32px 0',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
        >
          <button
            onClick={() => setShowWallet(true)}
            className="w-full text-left font-bold uppercase tracking-widest px-5 py-4 transition-all duration-300 rounded-full flex items-center gap-4"
            style={{ fontSize: 12, color: connected ? t.accent : t.textSecondary }}
          >
            <span className="material-symbols-outlined text-lg">account_balance_wallet</span>
            <span className="truncate lowercase" style={{ fontSize: 12 }}>
              {connected && publicKey
                ? publicKey.toString().slice(0, 4) + '...' + publicKey.toString().slice(-4)
                : 'Connect Wallet'}
            </span>
            {connected && (
              <span className="w-2 h-2 rounded-full ml-auto shrink-0" style={{ backgroundColor: t.accent }} />
            )}
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="w-full text-left font-semibold uppercase tracking-wider px-5 py-4 transition-all duration-300 rounded-full flex items-center gap-4"
            style={{ fontSize: 12, color: t.textSecondary }}
          >
            <span className="material-symbols-outlined text-lg">settings</span>
            <span className="truncate">Settings</span>
          </button>
        </div>
      </nav>

      {/* Main Area */}
      <main
        className={`h-screen flex flex-col relative transition-all duration-500 ease-in-out w-full ${isSidebarOpen ? 'md:ml-[280px] md:w-[calc(100%-280px)]' : ''}`}
        style={{ 
          backgroundColor: t.pageBg,
        }}
      >

        {/* Top Bar */}
        <header
          className="flex justify-between items-center h-16 md:h-20 px-4 md:px-10 z-30 shrink-0 relative transition-all duration-300"
          style={{
            backgroundColor: t.headerGlass,
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            borderBottom: `1px solid ${t.headerBorderGlass}`,
            boxShadow: t.headerShadow,
            background: `linear-gradient(135deg, ${t.headerGlass} 0%, ${t.headerHighlight} 100%)`,
          }}
        >
          {/* subtle inner shimmer line */}
          <div
            className="absolute inset-x-0 top-0 h-px"
            style={{ background: `linear-gradient(90deg, transparent, ${t.headerHighlight}, transparent)` }}
          />
          <div className="flex items-center gap-5">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="w-10 h-10 flex items-center justify-center rounded-full transition-all hover:bg-white/5"
              style={{ color: t.textSecondary }}
            >
              <span className="material-symbols-outlined text-2xl">
                {isSidebarOpen ? 'menu_open' : 'menu'}
              </span>
            </button>
            <h2 className="uppercase font-bold tracking-wide truncate max-w-xs" style={{ fontSize: 13, color: t.accent }}>
              {activeChat?.title || 'DeFi Assistant'}
            </h2>
            <div className="h-5 w-px" style={{ backgroundColor: t.divider }}></div>
            <span className="hidden md:inline uppercase px-3 py-1.5 rounded-full font-medium" style={{ fontSize: 11, backgroundColor: t.surfaceLow, color: t.textSecondary }}>Powered by Meteora</span>
            {solPrice && (
              <span
                className="hidden md:flex uppercase px-3 py-1.5 rounded-full font-bold items-center gap-1.5"
                style={{ fontSize: 10, backgroundColor: 'rgba(29,191,176,0.08)', color: '#1dbfb0', border: '1px solid rgba(29,191,176,0.15)' }}
              >
                ◎ SOL ${solPrice.toFixed(2)}
              </span>
            )}
            <span
              className="hidden md:flex uppercase px-3 py-1.5 rounded-full font-bold items-center gap-1.5"
              style={{
                fontSize: 10,
                backgroundColor: isLiveData ? 'rgba(29,191,176,0.1)' : 'rgba(255,200,0,0.1)',
                color: isLiveData ? '#1dbfb0' : '#f59e0b',
                border: `1px solid ${isLiveData ? 'rgba(29,191,176,0.2)' : 'rgba(255,200,0,0.2)'}`,
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: isLiveData ? '#1dbfb0' : '#f59e0b' }} />
              {isLiveData ? 'Live Data' : 'Demo Mode'}
            </span>
          </div>

          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 hover:bg-white/5 group"
            style={{ color: t.textSecondary, border: `1px solid ${t.divider}` }}
            title="Export Chat"
          >
            <span className="material-symbols-outlined text-lg group-hover:scale-110 transition-transform">download</span>
            <span className="text-[11px] font-bold uppercase tracking-wider hidden sm:inline">Export</span>
          </button>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 md:px-10 py-6 md:py-10 flex flex-col gap-8 md:gap-16 pb-36 md:pb-40">
          <div className="w-full max-w-4xl mx-auto flex flex-col gap-8 md:gap-16">

            {messages.map((msg, idx) => (
              <div key={msg.id}>
                {msg.role === 'ai' ? (
                  <div className="flex gap-3 md:gap-6 items-end">
                    <div
                      className="w-8 h-8 md:w-12 md:h-12 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300"
                      style={{ backgroundColor: t.bubbleGlass, backdropFilter: 'blur(12px)', border: `1px solid ${t.divider}` }}
                    >
                      <span className="material-symbols-outlined text-sm md:text-xl" style={{ color: t.accent }}>robot_2</span>
                    </div>
                    <div className="flex-1 pt-1 flex flex-col gap-4 md:gap-8 max-w-[85%] md:max-w-full">
                      <p
                        className="font-medium border rounded-[24px] md:rounded-[32px] px-5 py-4 md:px-8 md:py-6 leading-[1.6] md:leading-[1.7] transition-all duration-300 text-[14px] md:text-[15px]"
                        style={{ backgroundColor: t.bubbleGlass, borderColor: t.divider, color: t.pageColor, backdropFilter: 'blur(16px)' }}
                      >
                        {idx === messages.length - 1 ? (
                          <TypingText text={msg.text} speed={30} />
                        ) : (
                          msg.text
                        )}
                      </p>
                      {msg.card && msg.type === 'strategy' && (
                        <StrategyCard
                          card={msg.card}
                          theme={t}
                          darkMode={darkMode}
                          onExecute={async (card) => {
                            // Run security check before showing execute modal
                            if (card.poolId) {
                              try {
                                const { analyzeToken, calculateRiskLevel } = await import('../services/birdeye')
                                // Use token address from card, fallback to poolId
                                const tokenAddress = card.tokenAddress || card.poolId
                                const analysis = await analyzeToken(tokenAddress)
                                if (analysis) {
                                  analysis.risk = calculateRiskLevel(analysis)
                                  setSecurityCheck({ analysis, symbol: card.name })
                                  setPendingCard(card)
                                  return
                                }
                              } catch (err) {
                                console.error('Security check failed:', err)
                              }
                            }
                            setSelectedCard(card)
                          }}
                        />
                      )}
                      {msg.card && msg.type === 'execute' && <ExecuteCard card={msg.card} onExecute={setSelectedCard} theme={t} darkMode={darkMode} />}
                      {msg.card && msg.type === 'smart_money' && <SmartMoneyCard card={msg.card} onCopy={setSelectedCard} theme={t} darkMode={darkMode} />}
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3 md:gap-6 items-end flex-row-reverse">
                    <div
                      className="w-8 h-8 md:w-12 md:h-12 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300"
                      style={{ backgroundColor: t.userBubble, backdropFilter: 'blur(12px)', border: `1px solid ${t.divider}` }}
                    >
                      <span className="material-symbols-outlined text-sm md:text-xl" style={{ color: t.textSecondary }}>person</span>
                    </div>
                    <div className="flex-1 pb-1 flex justify-end max-w-[85%] md:max-w-full">
                      <p
                        className="font-medium border rounded-[24px] md:rounded-full px-5 py-4 md:px-8 md:py-5 max-w-xl text-right transition-all duration-300 text-[14px] md:text-[15px]"
                        style={{ backgroundColor: t.userBubble, borderColor: t.divider, color: t.pageColor, backdropFilter: 'blur(16px)' }}
                      >
                        {msg.text}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-6 items-end">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: t.surfaceMid }}
                >
                  <span className="material-symbols-outlined text-xl" style={{ color: t.accent }}>robot_2</span>
                </div>
                <div
                  className="px-8 py-5 rounded-[32px] border flex items-center gap-3"
                  style={{ backgroundColor: t.surfaceMid, borderColor: t.divider }}
                >
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: t.accent, animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: t.accent, animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: t.accent, animationDelay: '300ms' }}></span>
                  </div>
                  <span className="text-zinc-500 text-sm">Analyzing pools...</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="absolute bottom-0 left-0 w-full px-4 md:px-10 pb-4 md:pb-10 pt-16 md:pt-24 z-20" style={{ background: t.inputGrad }}>
          <div className="max-w-4xl mx-auto flex flex-col gap-4">

            {/* Suggested Prompts — only show when chat is empty */}
            {messages.length === 1 && (
              <div className="hidden md:flex flex-wrap gap-2 justify-center mb-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {[
                  "I have 1 SOL, find me the highest yield pool right now",
                  "What are whales and top LPers doing on Meteora today?",
                  "Move my liquidity to the best performing pool",
                  "Is SOL/USDC safe to enter? Run a full security check",
                  "What is impermanent loss and how do I avoid it?",
                  "Compare risk levels across all current Meteora pools",
                ].map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => setInput(prompt)}
                    className="px-4 py-2 rounded-full text-xs font-medium transition-all duration-200"
                    style={{
                      backgroundColor: t.surfaceLow,
                      border: `1px solid ${t.divider}`,
                      color: t.textSecondary,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = t.accent
                      e.currentTarget.style.color = t.accent
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = t.divider
                      e.currentTarget.style.color = t.textSecondary
                    }}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}
            <div
              className="relative flex items-center border rounded-full p-2 transition-all duration-300"
              style={{ backgroundColor: t.surfaceMid, borderColor: t.inputBorder, backdropFilter: 'blur(20px)' }}
            >
              <textarea
                className="w-full bg-transparent border-none resize-none focus:ring-0 placeholder:text-zinc-500 py-4 px-8"
                placeholder="Tell me what you want to do..."
                rows={1}
                style={{ fontSize: 15, fontWeight: 500, minHeight: 52, maxHeight: 128, outline: 'none', color: t.pageColor }}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
              />
              <div className="flex items-center gap-2 p-1 shrink-0">
                <button
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  className="w-14 h-14 flex items-center justify-center rounded-full transition-all duration-300"
                  style={{ backgroundColor: t.accent, color: '#0d0d0d', opacity: loading || !input.trim() ? 0.5 : 1 }}
                >
                  <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
                </button>
              </div>
            </div>
            <div className="text-center">
              <p
                className="text-zinc-500 uppercase tracking-wider inline-block px-5 py-2 rounded-full border transition-colors duration-300"
                style={{ fontSize: 10, fontWeight: 600, backgroundColor: t.sidebarBg, borderColor: t.divider }}
              >
                AI strategies are simulations. Verify all smart contracts before execution.
              </p>
            </div>
          </div>
        </div>
      </main>


      {securityCheck && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6" style={{ backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}>
          <TokenSecurityCard
            analysis={securityCheck.analysis}
            symbol={securityCheck.symbol}
            onCancel={() => { setSecurityCheck(null); setPendingCard(null) }}
            onProceed={() => { setSecurityCheck(null); setSelectedCard(pendingCard); setPendingCard(null) }}
          />
        </div>
      )}

      {/* Execute Modal */}
      {selectedCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6" style={{ backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}>
          <div className="w-full max-w-md rounded-[24px] md:rounded-[32px] p-6 md:p-10 flex flex-col gap-6" style={{ backgroundColor: t.modalBg, border: `1px solid ${t.modalBorder}` }}>

            {(zapSuccess || zapOutSuccess) ? (
              // Success State
              <div className="flex flex-col items-center gap-6 py-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(29,191,176,0.1)', border: `2px solid ${t.accent}` }}>
                  <span className="material-symbols-outlined text-3xl" style={{ color: t.accent }}>check</span>
                </div>
                <div className="text-center">
                  <h2 className="text-xl font-bold mb-2" style={{ color: t.pageColor }}>Transaction Submitted!</h2>
                  <p className="text-zinc-500 text-sm">Your {zapOutSuccess ? 'withdrawal' : 'deposit'} has been submitted to the Solana network via LP Agent.</p>
                </div>
                <button
                  onClick={() => { setSelectedCard(null); setZapSuccess(false); setZapOutSuccess(false); setZapAmount('') }}
                  className="w-full py-4 rounded-full font-bold uppercase tracking-wide text-sm"
                  style={{ backgroundColor: t.accent, color: '#0d0d0d' }}
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <h2 className="text-lg md:text-xl font-bold" style={{ color: t.pageColor }}>
                    {selectedCard.type === 'execute' ? 'Execute Strategy' : (selectedCard.action === 'Zap Out' ? 'Confirm Withdrawal' : 'Confirm Deposit')}
                  </h2>
                  <button onClick={() => { setSelectedCard(null); setZapAmount('') }} className="text-zinc-500 hover:text-zinc-200 transition-colors">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                {/* Pool Summary */}
                <div className="flex flex-col gap-3 p-5 rounded-[16px]" style={{ backgroundColor: t.surfaceLow }}>
                  {[
                    { label: 'Action', value: selectedCard.action || (selectedCard.steps ? 'Rebalance' : 'Zap In'), accent: true },
                    { label: 'Pool', value: selectedCard.name || selectedCard.poolName },
                    { label: 'Projected APY', value: selectedCard.apy, accent: true },
                    { label: 'TVL', value: selectedCard.tvl },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between">
                      <span className="text-zinc-500 text-xs font-bold uppercase tracking-wide">{row.label}</span>
                      <span className="font-bold text-sm" style={{ color: row.accent ? t.accent : t.pageColor }}>{row.value}</span>
                    </div>
                  ))}
                </div>

                {/* Amount Input (Only for Zap In) */}
                {(!selectedCard.action || selectedCard.action === 'Zap In' || selectedCard.type === 'strategy') && (
                  <div className="flex flex-col gap-2">
                    <label className="text-zinc-400 text-xs uppercase tracking-wider font-semibold">Amount to Deposit (SOL)</label>
                    <input
                      type="number"
                      placeholder="e.g. 5.0"
                      value={zapAmount}
                      onChange={(e) => setZapAmount(e.target.value)}
                      className="w-full px-5 py-4 rounded-full text-sm outline-none transition-all focus:ring-1"
                      style={{ 
                        backgroundColor: t.settingsInput, 
                        border: `1px solid ${t.settingsInputBorder}`,
                        color: t.pageColor,
                        ringColor: t.accent 
                      }}
                    />
                  </div>
                )}

                {/* Position Info (Only for Zap Out) */}
                {selectedCard.action === 'Zap Out' && (
                  <div className="p-4 rounded-[16px] text-xs leading-relaxed" style={{ backgroundColor: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.2)', color: '#f59e0b' }}>
                    ⚠️ This will withdraw 100% of your liquidity from the selected pool.
                  </div>
                )}

                {!connected && (
                  <div className="px-4 py-3 rounded-[12px] text-xs text-center" style={{ backgroundColor: 'rgba(255,100,100,0.05)', border: '1px solid rgba(255,100,100,0.15)', color: '#f87171' }}>
                    ⚠️ Please connect your wallet to proceed.
                  </div>
                )}

                <p className="text-zinc-600 text-[10px] text-center leading-relaxed uppercase font-bold tracking-widest">
                  LP Agent Jito-Submission Pipeline
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => { setSelectedCard(null); setZapAmount('') }}
                    className="flex-1 py-3 md:py-4 rounded-full font-bold uppercase tracking-wide text-sm"
                    style={{ border: `1px solid ${t.cancelBorder}`, color: t.cancelColor }}
                  >
                    Cancel
                  </button>
                  {!connected ? (
                    <button
                      onClick={() => setShowWallet(true)}
                      className="flex-1 py-3 md:py-4 rounded-full font-bold uppercase tracking-wide text-sm transition-all hover:-translate-y-0.5"
                      style={{ backgroundColor: t.accent, color: '#0d0d0d' }}
                    >
                      Connect Wallet
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        if (selectedCard.action === 'Zap Out') {
                          handleZapOut(selectedCard.poolId || selectedCard.id, 10000)
                        } else {
                          handleZapIn(selectedCard, zapAmount)
                        }
                      }}
                      disabled={zapLoading || zapOutLoading || ((!selectedCard.action || selectedCard.action === 'Zap In') && !zapAmount)}
                      className="flex-1 py-3 md:py-4 rounded-full font-bold uppercase tracking-wide text-sm transition-all hover:-translate-y-0.5"
                      style={{
                        backgroundColor: t.accent,
                        color: '#0d0d0d',
                        opacity: (zapLoading || zapOutLoading) ? 0.5 : 1
                      }}
                    >
                      {zapLoading || zapOutLoading ? 'Broadcasting...' : (selectedCard.action === 'Zap Out' ? 'Confirm Withdrawal' : 'Confirm Deposit')}
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)' }}>
          <div
            className="w-full max-w-lg rounded-t-[32px] sm:rounded-[32px] flex flex-col transition-all duration-300 max-h-[90vh] sm:max-h-[85vh]"
            style={{ backgroundColor: t.modalGlass, border: `1px solid ${t.modalBorder}`, backdropFilter: 'blur(32px)' }}
          >

            {/* Header */}
            <div className="flex justify-between items-center p-6 md:p-8" style={{ borderBottom: `1px solid ${t.dividerSetting}` }}>
              <div>
                <h2 className="text-xl font-bold" style={{ color: t.pageColor }}>Settings</h2>
                <p className="text-zinc-500 text-xs mt-1">Configure your DeFi-Chat experience</p>
              </div>
              <button onClick={() => setShowSettings(false)} style={{ color: t.textSecondary }} className="hover:opacity-70 transition-opacity">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto p-6 md:p-8 flex flex-col gap-6 md:gap-8">

              {/* Appearance */}
              <div className="flex flex-col gap-4">
                <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: t.accent }}>Appearance</h3>
                <div
                  className="flex items-center justify-between px-5 py-4 rounded-[20px]"
                  style={{ backgroundColor: t.settingsInput, border: `1px solid ${t.settingsInputBorder}` }}
                >
                  <div>
                    <p className="text-sm font-semibold" style={{ color: t.pageColor }}>Dark Mode</p>
                    <p className="text-zinc-500 text-xs mt-0.5">Switch between dark and light interface</p>
                  </div>
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className="relative w-14 h-7 rounded-full transition-all duration-300 shrink-0"
                    style={{ backgroundColor: darkMode ? t.accent : '#aaa' }}
                  >
                    <span
                      className="absolute top-1 w-5 h-5 rounded-full transition-all duration-300"
                      style={{ backgroundColor: '#fff', left: darkMode ? '30px' : '4px' }}
                    />
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div style={{ borderTop: `1px solid ${t.dividerSetting}` }} />

              {/* Risk Preference */}
              <div className="flex flex-col gap-4">
                <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: t.accent }}>Risk Preference</h3>
                <p className="text-zinc-500 text-xs">The AI will tailor pool recommendations to match your risk appetite.</p>
                <div className="grid grid-cols-3 gap-3">
                  {['Conservative', 'Balanced', 'Aggressive'].map((level) => (
                    <button
                      key={level}
                      onClick={() => setRisk(level)}
                      className="py-3 rounded-full text-xs font-bold uppercase tracking-wide transition-all hover:-translate-y-0.5"
                      style={{
                        backgroundColor: risk === level ? t.accent : t.settingsInput,
                        color: risk === level ? '#0d0d0d' : t.cancelColor,
                        border: `1px solid ${risk === level ? t.accent : t.settingsInputBorder}`,
                      }}
                    >
                      {level}
                    </button>
                  ))}
                </div>
                <div className="px-5 py-3 rounded-[16px] text-xs" style={{ backgroundColor: 'rgba(29,191,176,0.05)', border: '1px solid rgba(29,191,176,0.1)', color: t.accent }}>
                  {risk === 'Conservative' && '🛡️ Low volatility stablecoin pools only. Safety first.'}
                  {risk === 'Balanced' && '⚖️ Mix of stable and volatile pools for steady returns.'}
                  {risk === 'Aggressive' && '⚡ High APY pools including meme coins and new tokens.'}
                </div>
              </div>

              {/* Divider */}
              <div style={{ borderTop: `1px solid ${t.dividerSetting}` }} />

              {/* Display Preferences */}
              <div className="flex flex-col gap-4">
                <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: t.accent }}>Display Preferences</h3>
                <p className="text-zinc-500 text-xs">Choose how values are displayed across the app.</p>
                <div className="flex flex-col gap-3 px-5 py-4 rounded-[20px]" style={{ backgroundColor: t.settingsInput, border: `1px solid ${t.settingsInputBorder}` }}>
                  <p className="text-xs uppercase tracking-wider font-semibold" style={{ color: t.textSecondary }}>Currency Display</p>
                  <div className="grid grid-cols-2 gap-3 mt-1">
                    {['USD', 'SOL'].map((c) => (
                      <button
                        key={c}
                        onClick={() => setCurrency(c)}
                        className="py-3 rounded-full text-xs font-bold uppercase tracking-wide transition-all hover:-translate-y-0.5"
                        style={{
                          backgroundColor: currency === c ? t.accent : t.surfaceMid,
                          color: currency === c ? '#0d0d0d' : t.cancelColor,
                          border: `1px solid ${currency === c ? t.accent : t.settingsInputBorder}`,
                        }}
                      >
                        {c === 'USD' ? '$ USD' : '◎ SOL'}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs mt-1" style={{ color: t.textSecondary }}>
                    {currency === 'USD' ? 'Pool values shown in US Dollars' : 'Pool values shown in SOL'}
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div style={{ borderTop: `1px solid ${t.dividerSetting}` }} />

              {/* About */}
              <div className="flex flex-col gap-3">
                <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: t.accent }}>About</h3>
                <div
                  className="flex flex-col gap-2 px-5 py-4 rounded-[20px] text-xs"
                  style={{ backgroundColor: t.settingsInput, border: `1px solid ${t.settingsInputBorder}` }}
                >
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Version</span>
                    <span style={{ color: t.pageColor }}>1.0.0 Beta</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Powered by</span>
                    <span style={{ color: t.pageColor }}>LP Agent + Meteora</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Chain</span>
                    <span style={{ color: t.pageColor }}>Solana</span>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div style={{ borderTop: `1px solid ${t.dividerSetting}` }} />

              {/* Danger Zone */}
              <div className="flex flex-col gap-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-red-500">Danger Zone</h3>
                <button
                  onClick={() => {
                    const newId = Date.now()
                    const fresh = [{ id: newId, title: 'New Chat', messages: [WELCOME_MESSAGE] }]
                    setChats(fresh)
                    setActiveChatId(newId)
                    localStorage.removeItem(`defi-chat:${walletKey}`)
                    setShowSettings(false)
                  }}
                  className="w-full py-4 rounded-full text-xs font-bold uppercase tracking-wide transition-all hover:bg-red-500/10"
                  style={{ border: '1px solid rgba(255,0,0,0.2)', color: '#ef4444' }}
                >
                  Clear All Chat History
                </button>
              </div>

            </div>

            {/* Footer */}
            <div className="p-6 md:p-8 flex justify-end gap-3 md:gap-4" style={{ borderTop: `1px solid ${t.dividerSetting}` }}>
              <button
                onClick={() => setShowSettings(false)}
                className="px-8 py-4 rounded-full text-sm font-bold uppercase tracking-wide transition-all"
                style={{ border: `1px solid ${t.cancelBorder}`, color: t.cancelColor }}
              >
                Cancel
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="px-8 py-4 rounded-full text-sm font-bold uppercase tracking-wide hover:-translate-y-0.5 transition-all"
                style={{ backgroundColor: t.accent, color: '#0d0d0d' }}
              >
                Save Changes
              </button>
            </div>

          </div>
        </div>
      )}
      {showWallet && <WalletModal onClose={() => setShowWallet(false)} theme={t} darkMode={darkMode} />}
      {showOnboarding && (
        <OnboardingModal 
          theme={t} 
          onClose={() => {
            localStorage.setItem('defi-chat:onboarding-complete', 'true')
            setShowOnboarding(false)
          }} 
        />
      )}
    </div>
  )
}

function StrategyCard({ card, onExecute, theme: t, darkMode }) {
  return (
    <div
      className="border rounded-[24px] md:rounded-[40px] p-6 md:p-10 max-w-md flex flex-col gap-6 md:gap-8 relative overflow-hidden transition-all duration-300 hover:-translate-y-1"
      style={{
        backgroundColor: t.cardGlass,
        borderColor: t.divider,
        backdropFilter: 'blur(20px)',
        boxShadow: darkMode 
          ? '0 24px 64px -12px rgba(0,0,0,0.5), 0 16px 40px -12px rgba(29,191,176,0.1)' 
          : '0 24px 64px -12px rgba(0,0,0,0.1), 0 16px 40px -12px rgba(29,191,176,0.05)',
      }}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl md:text-2xl font-bold mb-2 md:mb-3 tracking-tight" style={{ color: t.pageColor }}>{card.name}</h3>
          <p
            className="font-semibold uppercase inline-block px-3 py-1 md:px-4 md:py-1.5 rounded-full text-zinc-400 text-[10px] md:text-[11px]"
            style={{ backgroundColor: t.surfaceLow }}
          >
            {card.protocol}
          </p>
        </div>
        <span className="px-3 py-1.5 md:px-4 md:py-2 rounded-full text-[10px] md:text-[11px] font-bold uppercase" style={{ backgroundColor: darkMode ? 'rgba(29,191,176,0.1)' : 'rgba(29,191,176,0.15)', color: t.accent }}>{card.risk}</span>
      </div>
      <div
        className="grid grid-cols-2 gap-4 md:gap-8 py-6 md:py-8"
        style={{ borderTop: `1px solid ${t.divider}`, borderBottom: `1px solid ${t.divider}` }}
      >
        <div className="flex flex-col items-center gap-1">
          <span className="font-bold tracking-tight text-2xl md:text-[32px]" style={{ color: t.accent }}>{card.apy}</span>
          <span className="text-zinc-500 font-bold uppercase tracking-wider" style={{ fontSize: 10 }}>Projected APY</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="font-bold tracking-tight text-2xl md:text-[32px]" style={{ color: t.pageColor }}>{card.tvl}</span>
          <span className="text-zinc-500 font-bold uppercase tracking-wider" style={{ fontSize: 10 }}>Pool TVL</span>
        </div>
      </div>
      
      {card.confidence && (
        <div className="flex flex-col gap-2 pt-1 pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[15px]" style={{ color: t.accent }}>verified_user</span>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: t.pageColor }}>Confidence: {card.confidence}%</span>
          </div>
          <p className="text-[11px] leading-relaxed" style={{ color: t.textSecondary }}>
            {card.confidence_reason}
          </p>
        </div>
      )}
      {card.risks && card.risks.length > 0 && (
        <div className="flex flex-col gap-2 pt-1 pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[15px] text-red-500">warning</span>
            <span className="text-xs font-bold uppercase tracking-widest text-red-500/80">Potential Risks</span>
          </div>
          <ul className="flex flex-col gap-1.5">
            {card.risks.map((risk, idx) => (
              <li key={idx} className="text-[11px] flex items-start gap-2" style={{ color: t.textSecondary }}>
                <span className="w-1 h-1 rounded-full bg-red-500/40 mt-1.5 shrink-0" />
                {risk}
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={() => onExecute(card)}
        className="w-full py-5 font-bold uppercase tracking-wide rounded-full flex items-center justify-center gap-3 transition-all duration-300 hover:-translate-y-0.5"
        style={{ backgroundColor: t.accent, color: '#0d0d0d', fontSize: 13 }}
      >
        Execute Strategy
        <span className="material-symbols-outlined text-lg">arrow_forward</span>
      </button>
    </div>
  )
}
