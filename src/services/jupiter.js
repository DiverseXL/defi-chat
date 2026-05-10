const JUPITER_API_KEY = import.meta.env.VITE_JUPITER_API_KEY
const JUPITER_PRICE_URL = 'https://api.jup.ag/price/v3'
const JUPITER_QUOTE_URL = 'https://api.jup.ag/swap/v1'

export const TOKEN_MINTS = {
  SOL: 'So11111111111111111111111111111111111111112',
  USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  USDT: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
  JUP: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
  BONK: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
  WIF: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
}

// Global fetch utility for Jupiter with auth and retry
async function jupFetch(url, retries = 2, backoff = 1000) {
  const headers = JUPITER_API_KEY ? { 'x-api-key': JUPITER_API_KEY } : {}
  try {
    const res = await fetch(url, { headers })
    if (res.status === 429 && retries > 0) {
      await new Promise(r => setTimeout(r, backoff))
      return jupFetch(url, retries - 1, backoff * 2)
    }
    if (!res.ok) return null
    return await res.json()
  } catch (err) {
    if (retries > 0) {
      await new Promise(r => setTimeout(r, backoff))
      return jupFetch(url, retries - 1, backoff * 2)
    }
    return null
  }
}

// Get token price — v3 response normalization
export async function getTokenPrice(mintAddress) {
  if (!mintAddress) return null
  const data = await jupFetch(`${JUPITER_PRICE_URL}?ids=${mintAddress}`)
  if (!data) return null
  
  const entry = data?.data?.[mintAddress] || data?.[mintAddress] || null
  if (entry) {
    entry.price = parseFloat(entry.price || entry.usdPrice || 0)
  }
  return entry
}

// Get SOL price in USD
export async function getSOLPrice() {
  const data = await getTokenPrice(TOKEN_MINTS.SOL)
  return data?.price || 0
}

// Check liquidity for a token
export async function checkLiquidity(tokenMint) {
  const usdcAmount = 500 * 1_000_000
  const params = new URLSearchParams({
    inputMint: TOKEN_MINTS.USDC,
    outputMint: tokenMint,
    amount: usdcAmount.toString(),
    slippageBps: '50',
  })

  const data = await jupFetch(`${JUPITER_QUOTE_URL}/quote?${params}`)
  if (!data) return { hasLiquidity: false, priceImpact: null }

  const impact = parseFloat(data.priceImpactPct || '0') * 100
  return {
    hasLiquidity: true,
    priceImpact: parseFloat(impact.toFixed(2)),
    liquidityRating: impact < 2 ? 'high' : impact < 5 ? 'medium' : impact < 15 ? 'low' : 'very_low',
  }
}

// Get Zap In preview
export async function getZapInPreview(inputAmountSOL, outputTokenSymbol = 'USDC') {
  const outputMint = TOKEN_MINTS[outputTokenSymbol] || TOKEN_MINTS.USDC
  const lamports = Math.floor(inputAmountSOL * 1e9)

  const params = new URLSearchParams({
    inputMint: TOKEN_MINTS.SOL,
    outputMint,
    amount: lamports.toString(),
    slippageBps: '50',
  })

  const [quote, solPrice] = await Promise.all([
    jupFetch(`${JUPITER_QUOTE_URL}/quote?${params}`),
    getSOLPrice(),
  ])

  if (!quote) return null

  const outAmount = Number(quote.outAmount) / 1e6
  const priceImpact = parseFloat(quote.priceImpactPct || '0') * 100
  const inputValueUSD = inputAmountSOL * solPrice

  return {
    inputAmountSOL,
    inputValueUSD,
    outputAmount: outAmount,
    outputSymbol: outputTokenSymbol,
    priceImpact: parseFloat(priceImpact.toFixed(2)),
    priceImpactWarning: priceImpact > 1,
    minimumReceived: Number(quote.otherAmountThreshold) / 1e6,
    routePlan: quote.routePlan || [],
    solPrice,
  }
}