import { DEFI_KNOWLEDGE, GLOSSARY } from './knowledge.js'

const OPENAI_KEY = import.meta.env.VITE_OPENAI_API_KEY

// Format raw USD numbers with K/M suffixes
const formatUSD = (num) => {
  const n = Number(num || 0)
  if (n >= 1_000_000) return '$' + (n / 1_000_000).toFixed(2) + 'M'
  if (n >= 1_000) return '$' + (n / 1_000).toFixed(2) + 'K'
  return '$' + n.toFixed(2)
}

// Get pool address from any field name LP Agent might use
const getAddr = (p) =>
  p?.pool || p?.address || p?.pool_address || p?.id || p?.pool_id || p?.pubkey || ''

// Get token symbol from any field name
const getSymbolX = (p) =>
  p?.token_x_symbol || p?.token_a_symbol || p?.token0_symbol ||
  p?.baseTokenInfo?.symbol || p?.tokenA?.symbol || 'Unknown'

const getSymbolY = (p) =>
  p?.token_y_symbol || p?.token_b_symbol || p?.token1_symbol ||
  p?.quoteTokenInfo?.symbol || p?.tokenB?.symbol || 'Unknown'

export async function askAI(
  userMessage,
  pools = [],
  lpers = [],
  positions = [],
  solPrice = 0,
  chatHistory = []
) {
  if (!OPENAI_KEY) {
    return { text: 'OpenAI API key is missing. Please add VITE_OPENAI_API_KEY to your .env file.', card: null, type: 'normal' }
  }

  // Build pool context
  const poolContext = pools.map((p, i) => {
    const poolId = getAddr(p)
    const tokenA = getSymbolX(p)
    const tokenB = getSymbolY(p)
    const tokenXMint = p.token0 || p.token_x_mint || p.tokenXMint || p.mint_x || ''
    const vol = Number(p.trade_volume_24h || p.vol_24h || p.volume_24h || 0)
    const tvl = Number(p.tvl || p.liquidity || p.total_liquidity || 0)
    const fee = Number(p.fee || p.base_fee_percentage || p.fee_rate || 0)
    const isValid = poolId.length >= 32

    return `
Pool ${i + 1}:
- Pool ID: ${poolId} ${isValid ? '(VERIFIED REAL ADDRESS)' : '(INVALID)'}
- Pair: ${tokenA}/${tokenB}
- Token X Mint: ${tokenXMint}
- 24h Volume: ${formatUSD(vol)}
- TVL: ${formatUSD(tvl)}
- Fee Rate: ${fee}%
- Recommend based on 24h Volume since APR/organic data unavailable on free tier`
  }).join('\n')

  // Build valid pool ID index
  const validPoolIndex = pools.map((p, i) =>
    `${i + 1}. ${getAddr(p) || 'UNKNOWN'} (${getSymbolX(p)}/${getSymbolY(p)})`
  ).join('\n')

  // Build lper context
  const lperContext = lpers.length
    ? lpers.map((l, i) => `
Wallet ${i + 1}: ${l.owner}
- PnL: $${Number(l.pnl?.value || 0).toLocaleString()} (${Number(l.pnl?.percent || 0).toFixed(2)}%)
- Value: $${Number(l.currentValue || 0).toLocaleString()}
- Fees: $${Number(l.totalFee || 0).toLocaleString()}`).join('\n')
    : 'No top LPer wallet data — use pool TVL/Volume to identify smart money concentration.'

  // Build position context
  const positionContext = positions.length
    ? positions.map((p, i) => `
Position ${i + 1}: ${getSymbolX(p)}/${getSymbolY(p)}
- ID: ${p.position_id || p.id || 'N/A'}
- Value: $${Number(p.current_value || 0).toLocaleString()}
- PnL: $${Number(p.pnl?.value || p.unrealized_pnl || 0).toLocaleString()}
- In Range: ${p.is_in_range ?? 'Unknown'}`).join('\n')
    : 'No open positions.'

  // Last 10 chat messages for context
  const historyMessages = chatHistory.slice(-10).map(msg => ({
    role: msg.role === 'ai' ? 'assistant' : 'user',
    content: typeof msg.text === 'string' ? msg.text.slice(0, 500) : '',
  }))

  const solPriceStr = solPrice > 0 ? `$${solPrice.toFixed(2)}` : 'unavailable'

  const systemPrompt = `You are DeFi-Chat — an expert autonomous AI agent for Meteora liquidity pools on Solana. You can analyze pools, recommend strategies, execute Zap In/Out transactions, and explain any DeFi concept.

## LIVE MARKET DATA
- SOL Price: ${solPriceStr} (from Jupiter API — use this EXACT value, never guess)
- If price is "unavailable" tell user the feed is down — NEVER guess a price

## STRICT DATA RULES
1. ONLY recommend pools from the VALID POOL INDEX below
2. NEVER invent pool names, APRs, TVLs, or Pool IDs
3. Copy Pool ID EXACTLY from pool data — never modify it
4. NEVER use token mint addresses as Pool IDs
5. TVL and Volume values are already in USD — never multiply or convert them
6. If no pool matches the user's request, say so honestly
7. SOL, USDC, USDT, JUP are always verified tokens regardless of Birdeye data
8. If holder count shows 0 for established tokens say "security data temporarily unavailable"
9. APR and organic score data may be unavailable on free tier — use 24h Volume as the primary ranking metric instead
10. Rank pools by 24h Volume when APR is missing or 0
11. Always recommend the pool with highest 24h Volume as the best opportunity
12. NEVER say data is unavailable — always make a recommendation based on available data

## RISK ASSESSMENT
- Organic Score > 80 + blue chip pair (SOL/USDC/USDT/JUP) = LOW RISK
- Organic Score 60-80 + blue chip = MEDIUM RISK
- Organic Score > 80 + meme coin = MEDIUM RISK
- Organic Score 50-70 + volatile token = HIGH RISK
- Organic Score < 50 = HIGH RISK always
- Meme coins (BONK, WIF, POPCAT etc.) = minimum MEDIUM RISK
- NEVER say "Unknown" for risk — always assess

## OUTPUT FORMAT — CRITICAL
Your response = explanation text FIRST, then ONE card JSON LAST.
NEVER put JSON inside explanation text.
NEVER use markdown backticks around JSON.
NEVER add text after the JSON.

## CARD FORMATS

STRATEGY intent (find/enter pool):
STRATEGY_CARD:{"name":"PAIR e.g. SOL/USDC","protocol":"Meteora Protocol","apy":"EXACT APR or calculated estimation + %","tvl":"EXACT TVL from pool data","risk":"Low/Medium/High Risk","poolId":"EXACT Pool ID from pool data","tokenAddress":"EXACT Token X Mint from pool data","confidence":85,"confidence_reason":"one sentence","risks":["risk 1","risk 2"]}

## APR ESTIMATION WHEN MISSING
If APR is not provided calculate it:
APR = (24h_volume × fee_rate / 100 × 365) / TVL × 100
When calculated APR exceeds 10,000% write "Very High (>1000%)" instead of the raw number.
NEVER write prose sentences in the "apy" field.

EXECUTE intent (move/migrate/rebalance — keywords: move, migrate, rebalance, switch):
EXECUTE_CARD:{"steps":[{"action":"Zap Out","pool":"CURRENT","reason":"reason"},{"action":"Zap In","pool":"TARGET","reason":"reason"}],"poolId":"TARGET_POOL_ID","poolName":"TARGET_PAIR","apy":"X%","tvl":"$X"}

SMART_MONEY intent (whales/top wallets/copy/smart money):
SMART_MONEY intent (whales/top wallets/copy/smart money):
Triggers on ANY of these keywords: whale, whales, smart money, top wallets, top lpers, best performers, copy strategy, investing in, show me what, who is winning, top lp, best lp.
When triggered you MUST output a SMART_MONEY_CARD — NEVER say you don't have data. If real wallet data is provided use it. If not, analyze the pool data and create the card using the highest volume pools as proxies for where smart money is concentrated.
Format:
SMART_MONEY_CARD:{"wallets":[{"address":"7KHx...P32i","pnl":"+$12,400","topPool":"SOL/HORSE","allocation":"60%"},{"address":"DMQ7...hbX","pnl":"+$8,200","topPool":"SOL/HORSE","allocation":"45%"}],"recommendedPool":"SOL/HORSE","poolId":"ID_FROM_POOL_DATA","apy":"X%"}

NORMAL intent: answer clearly, no card.

## DeFi KNOWLEDGE
${DEFI_KNOWLEDGE}

## GLOSSARY
${Object.entries(GLOSSARY).map(([k, v]) => `- ${k}: ${v}`).join('\n')}

## VALID POOL IDs — ONLY USE THESE
${validPoolIndex || 'No pools available'}

## CURRENT POOL DATA
${poolContext || 'Pool data temporarily unavailable.'}

## USER POSITIONS
${positionContext}

## TOP LP WALLETS
${lperContext}`

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 800,
        messages: [
          { role: 'system', content: systemPrompt },
          ...historyMessages,
          { role: 'user', content: userMessage },
        ],
      }),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      return { text: `AI error: ${err.error?.message || response.status}`, card: null, type: 'normal' }
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || 'Sorry, could not process that.'

    // Parse card types in priority order
    const cardTypes = [
      { prefix: 'EXECUTE_CARD:', type: 'execute' },
      { prefix: 'SMART_MONEY_CARD:', type: 'smart_money' },
      { prefix: 'STRATEGY_CARD:', type: 'strategy' },
    ]

    for (const { prefix, type } of cardTypes) {
      if (!content.includes(prefix)) continue

      const idx = content.indexOf(prefix)
      let text = content.slice(0, idx).trim()
      let jsonStr = content.slice(idx + prefix.length).trim()

      // Strip markdown
      jsonStr = jsonStr.replace(/^```json/i, '').replace(/^```/, '').replace(/```$/, '').trim()

      // Extract JSON object
      const start = jsonStr.indexOf('{')
      const end = jsonStr.lastIndexOf('}')
      if (start !== -1 && end !== -1) jsonStr = jsonStr.slice(start, end + 1)

      try {
        const card = JSON.parse(jsonStr)
        text = text.replace(/\{[\s\S]*\}/g, '').trim()
        return { text: text || 'Here is your strategy.', card, type }
      } catch (e) {
        console.error(`Failed to parse ${prefix}:`, e.message)
      }
    }

    // Fallback: detect execute card without prefix
    const execMatch = content.match(/\{[\s\S]*?"steps"[\s\S]*?"poolId"[\s\S]*?\}/)
    if (execMatch) {
      try {
        const card = JSON.parse(execMatch[0])
        const text = content.replace(execMatch[0], '').replace(/\*\*/g, '').trim()
        return { text, card, type: 'execute' }
      } catch {}
    }

    // Return clean normal text
    const cleanText = content
      .replace(/\{[\s\S]*?\}/g, '')
      .replace(/```[\s\S]*?```/g, '')
      .trim()

    return { text: cleanText || 'I analyzed the data. How can I help further?', card: null, type: 'normal' }

  } catch (err) {
    console.error('AI error:', err)
    return { text: 'Failed to connect to AI. Please check your connection.', card: null, type: 'normal' }
  }
}