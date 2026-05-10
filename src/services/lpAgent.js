const BASE_URL = 'https://api.lpagent.io/open-api/v1'
const API_KEY = import.meta.env.VITE_LP_AGENT_KEY

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
let poolsCache = { data: [], timestamp: 0 }

// Clear cache on load to force fresh data
if (typeof window !== 'undefined') {
  window.__clearLPCache = () => { poolsCache = { data: [], timestamp: 0 } }
}

// Centralized fetch with timeout and retry
async function apiFetch(url, options = {}, retries = 2) {
  if (!API_KEY) {
    console.error('LP Agent: Missing VITE_LP_AGENT_KEY in .env')
    return null
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000)

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })
    clearTimeout(timeout)

    if (res.status === 429 && retries > 0) {
      console.warn('LP Agent: Rate limited, retrying in 2s...')
      await new Promise(r => setTimeout(r, 2000))
      return apiFetch(url, options, retries - 1)
    }

    if (!res.ok) {
      const body = await res.text()
      console.error(`LP Agent: ${res.status} on ${url}`, body)
      return null
    }

    return await res.json()

  } catch (err) {
    clearTimeout(timeout)
    if (err.name === 'AbortError') {
      console.error('LP Agent: Request timed out:', url)
    } else if (retries > 0) {
      await new Promise(r => setTimeout(r, 1000))
      return apiFetch(url, options, retries - 1)
    }
    return null
  }
}

// Validate a pool has a real Solana address
export function isRealPool(pool) {
  const addr = pool?.address || pool?.pool || pool?.pool_address || pool?.id || ''
  return typeof addr === 'string' && addr.length >= 32
}

// Get the address from a pool object regardless of field name
export function getPoolAddress(pool) {
  return pool?.address || pool?.pool || pool?.pool_address || pool?.id || ''
}

// Fetch top pools — always returns a plain array
export async function fetchTopPools(riskLevel = 'Balanced') {
  console.log('=== LP Agent Fetch Starting ===')
  console.log('BASE_URL:', BASE_URL)
  console.log('API_KEY present:', !!API_KEY)
  console.log('API_KEY prefix:', API_KEY?.slice(0, 6))

  const now = Date.now()

  // Force fresh fetch if cache contains mock data
  if (poolsCache.data.length > 0 && getPoolAddress(poolsCache.data[0]).includes('MOCK')) {
    console.warn('LP Agent: Clearing mock data from cache')
    poolsCache = { data: [], timestamp: 0 }
  }

  // Return cache if fresh
  if (poolsCache.data.length > 0 && now - poolsCache.timestamp < CACHE_DURATION) {
    console.log('LP Agent: Returning cached pools:', poolsCache.data.length)
    return poolsCache.data
  }

  console.log('LP Agent: Fetching live pools from API...')
  console.log('LP Agent: API Key present:', !!API_KEY)

  // Try discover endpoint
  const data = await apiFetch(
    `${BASE_URL}/pools/discover?chain=SOL&sortBy=vol_24h&sortOrder=desc&pageSize=20`
  )

  if (data?.data?.length > 0) {
    const pools = data.data

    // Deduplicate
    const seen = new Map()
    pools.forEach(p => {
      const addr = getPoolAddress(p)
      if (addr && !seen.has(addr)) seen.set(addr, p)
    })
    const deduped = Array.from(seen.values())

    // Accept ALL pools with valid addresses — no metric filtering
    const real = deduped.filter(p => {
      const addr = getPoolAddress(p)
      return addr && addr.length >= 32
    })

    console.log('LP Agent: Accepted pools:', real.length)
    if (real[0]) console.log('LP Agent: First pool raw:', JSON.stringify(real[0], null, 2))

    console.log(`LP Agent: Got ${real.length} real pools from API`)
    console.log('LP Agent: First pool:', getPoolAddress(real[0]), real[0]?.token_x_symbol + '/' + real[0]?.token_y_symbol)

    if (real.length > 0) {
      poolsCache = { data: real, timestamp: now }
      return sortPools(real, riskLevel)
    }
  }

  // Stale cache fallback
  if (poolsCache.data.length > 0) {
    console.warn('LP Agent: Using stale cache')
    return poolsCache.data
  }

  // Last resort — mock data
  console.warn('LP Agent: ⚠️ Falling back to mock pools — API unavailable')
  return getMockPools()
}

function sortPools(pools, riskLevel) {
  const sorted = [...pools]
  if (riskLevel === 'Conservative') {
    return sorted.sort((a, b) => (b.organic_score || 0) - (a.organic_score || 0))
  }
  if (riskLevel === 'Aggressive') {
    const ratio = p => Number(p.trade_volume_24h || p.vol_24h || 0) / (Number(p.liquidity || p.tvl || 1))
    return sorted.sort((a, b) => ratio(b) - ratio(a))
  }
  // Balanced — sort by volume
  return sorted.sort((a, b) =>
    Number(b.trade_volume_24h || b.vol_24h || 0) - Number(a.trade_volume_24h || a.vol_24h || 0)
  )
}

// Fetch user open positions
export async function fetchOpenPositions(walletAddress) {
  if (!walletAddress) return []
  const data = await apiFetch(
    `${BASE_URL}/lp-positions/opening?owner=${walletAddress}&protocol=meteora`
  )
  return data?.data || []
}

// Fetch portfolio overview
export async function fetchPortfolioOverview(walletAddress) {
  if (!walletAddress) return null
  const data = await apiFetch(
    `${BASE_URL}/lp-positions/overview?protocol=meteora&owner=${walletAddress}`
  )
  return data?.data || null
}

// Fetch top LPers for a pool
export async function fetchTopLpers(poolId) {
  if (!poolId) return []
  const data = await apiFetch(
    `${BASE_URL}/pools/${poolId}/top-lpers?sort_order=desc&page=1&limit=5`
  )
  return data?.data || []
}

// Zap In — generate transaction
export async function zapIn(poolId, inputSOL, walletAddress) {
  if (!poolId || !walletAddress) return null

  console.log('LP Agent: Zap In request:', { poolId, inputSOL, walletAddress })

  const data = await apiFetch(`${BASE_URL}/pools/${poolId}/add-tx`, {
    method: 'POST',
    body: JSON.stringify({
      stratergy: 'Spot',
      owner: walletAddress,
      inputSOL: Number(inputSOL),
      slippage_bps: 500,
      mode: 'zap-in',
      provider: 'JUPITER_ULTRA',
    }),
  })

  console.log('LP Agent: Zap In response:', data)
  return data?.data || null
}

// Submit signed Zap In transactions
export async function submitZapIn(txData) {
  if (!txData) return null
  const data = await apiFetch(`${BASE_URL}/pools/landing-add-tx`, {
    method: 'POST',
    body: JSON.stringify({
      lastValidBlockHeight: txData.lastValidBlockHeight,
      swapTxsWithJito: txData.swapTxsWithJito || [],
      addLiquidityTxsWithJito: txData.addLiquidityTxsWithJito || [],
    }),
  })
  return data || null
}

// Zap Out quote
export async function getZapOutQuote(positionId, bps = 5000) {
  if (!positionId) return null
  const data = await apiFetch(`${BASE_URL}/position/decrease-quotes`, {
    method: 'POST',
    body: JSON.stringify({ id: positionId, bps }),
  })
  return data?.data || null
}

// Zap Out — generate transaction
export async function zapOut(positionId, owner, bps = 5000) {
  if (!positionId || !owner) return null
  const data = await apiFetch(`${BASE_URL}/position/decrease-tx`, {
    method: 'POST',
    body: JSON.stringify({
      position_id: positionId,
      bps,
      owner,
      slippage_bps: 500,
      output: 'allToken0',
      provider: 'JUPITER_ULTRA',
      type: 'meteora',
    }),
  })
  return data?.data || null
}

// Submit signed Zap Out transactions
export async function submitZapOut(txData) {
  if (!txData) return null
  const data = await apiFetch(`${BASE_URL}/position/landing-decrease-tx`, {
    method: 'POST',
    body: JSON.stringify({
      lastValidBlockHeight: txData.lastValidBlockHeight,
      closeTxsWithJito: txData.closeTxsWithJito || [],
      closeTxs: txData.closeTxs || [],
      swapTxs: txData.swapTxs || [],
      swapTxsWithJito: txData.swapTxsWithJito || [],
    }),
  })
  return data || null
}

// Mock pools — only used when API is completely unavailable
function getMockPools() {
  return [
    {
      address: 'MOCK_SOL_USDC_POOL_DO_NOT_USE_FOR_ZAPIN',
      token_x_symbol: 'SOL', token_y_symbol: 'USDC',
      token_x_mint: 'So11111111111111111111111111111111111111112',
      token_y_mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      liquidity: 8900000, trade_volume_24h: 5100000,
      base_fee_percentage: 0.25, organic_score: 88,
    },
    {
      address: 'MOCK_SOL_USDT_POOL_DO_NOT_USE_FOR_ZAPIN',
      token_x_symbol: 'SOL', token_y_symbol: 'USDT',
      token_x_mint: 'So11111111111111111111111111111111111111112',
      token_y_mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
      liquidity: 5200000, trade_volume_24h: 2800000,
      base_fee_percentage: 0.1, organic_score: 85,
    },
    {
      address: 'MOCK_JUP_USDC_POOL_DO_NOT_USE_FOR_ZAPIN',
      token_x_symbol: 'JUP', token_y_symbol: 'USDC',
      token_x_mint: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
      token_y_mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      liquidity: 4200000, trade_volume_24h: 1800000,
      base_fee_percentage: 0.3, organic_score: 79,
    },
  ]
}